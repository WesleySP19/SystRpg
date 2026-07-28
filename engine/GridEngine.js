import { QuadTree } from './QuadTree.js';

/**
 * GRID ENGINE v3.0 — D&D 5e Tactical Map
 * Pure calculation engine representing the game world layout.
 * Optimized with local lazy-rebuilt QuadTree for instant raycast collision queries.
 */
export class GridEngine {
    /**
     * @param {object} opts
     */
    constructor(opts = {}) {
        this.cellSize  = opts.cellSize  || 60;
        this.feetPerCell = opts.feetPerCell || 5;
        this.cols      = opts.cols || 30;
        this.rows      = opts.rows || 20;

        // Chunk-based TileMap storage: chunk key "cx,cy" -> { difficultTerrain, elevation }
        this._chunks = new Map();
        
        // BitGrid for Visibility/FOW: 0 = HIDDEN, 1 = EXPLORED, 2 = VISIBLE
        this._fowBitGrid = new Uint8Array(this.cols * this.rows);

        // Difficult terrain cells: Set of "col,row" strings (kept for serialization compatibility)
        this._difficultCells = new Set();
        // Wall segments: array of {x1,y1,x2,y2} in pixel coords
        this._walls = [];
        // Door segments: array of {id, x1, y1, x2, y2, isOpen}
        this._doors = [];

        // Spatial Acceleration Index (lazy loaded)
        this._quadTree = null;
    }

    /* ── Spatial Index Rebuild ──────────────────────────────────── */

    _invalidateSpatialIndex() {
        this._quadTree = null;
    }

    _updateQuadTree() {
        const W = this.cols * this.cellSize;
        const H = this.rows * this.cellSize;
        this._quadTree = new QuadTree({ x: 0, y: 0, w: W, h: H });
        
        this._walls.forEach(w => {
            const boundary = {
                x: Math.min(w.x1, w.x2),
                y: Math.min(w.y1, w.y2),
                w: Math.max(1, Math.abs(w.x2 - w.x1)),
                h: Math.max(1, Math.abs(w.y2 - w.y1))
            };
            this._quadTree.insert({ boundary, data: { type: 'wall', segment: w } });
        });
        
        this._doors.forEach(d => {
            const boundary = {
                x: Math.min(d.x1, d.x2),
                y: Math.min(d.y1, d.y2),
                w: Math.max(1, Math.abs(d.x2 - d.x1)),
                h: Math.max(1, Math.abs(d.y2 - d.y1))
            };
            this._quadTree.insert({ boundary, data: { type: 'door', segment: d } });
        });
    }

    /* ── Chunks Management ───────────────────────────────────────── */

    _getChunkKey(col, row) {
        const cx = Math.floor(col / 16);
        const cy = Math.floor(row / 16);
        return `${cx},${cy}`;
    }

    _getChunk(col, row) {
        const key = this._getChunkKey(col, row);
        if (!this._chunks.has(key)) {
            this._chunks.set(key, {
                difficultTerrain: new Uint8Array(256), // 16 * 16
                elevation: new Uint8Array(256)        // elevation Z-level layers
            });
        }
        return this._chunks.get(key);
    }

    _getCellOffset(col, row) {
        const localCol = ((col % 16) + 16) % 16;
        const localRow = ((row % 16) + 16) % 16;
        return localRow * 16 + localCol;
    }

    /* ── Scale Conversion ───────────────────────────────────────── */

    feetToMeters(feet) {
        return feet * 0.3; // 5 feet = 1.5 meters (D&D 5e standard)
    }

    metersToFeet(meters) {
        return meters / 0.3;
    }

    squaresToFeet(squares) {
        return squares * this.feetPerCell;
    }

    feetToSquares(feet) {
        return feet / this.feetPerCell;
    }

    /* ── Conversion ─────────────────────────────────────────────── */

    /** Pixel coords → grid cell {col, row} (floor) */
    pixelToCell(px, py) {
        return {
            col: Math.floor(px / this.cellSize),
            row: Math.floor(py / this.cellSize)
        };
    }

    /** Grid cell → top-left pixel corner */
    cellToPixel(col, row) {
        return {
            x: col * this.cellSize,
            y: row * this.cellSize
        };
    }

    /** Grid cell → center pixel */
    cellCenter(col, row) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }

    /** Snap a pixel position to the nearest cell center */
    snapToCell(px, py) {
        const cell = this.pixelToCell(px, py);
        return this.cellCenter(cell.col, cell.row);
    }

    /** Snap with boundary clamping */
    snapToCellClamped(px, py) {
        const col = Math.max(0, Math.min(this.cols - 1, Math.floor(px / this.cellSize)));
        const row = Math.max(0, Math.min(this.rows - 1, Math.floor(py / this.cellSize)));
        return { x: col * this.cellSize + this.cellSize / 2, y: row * this.cellSize + this.cellSize / 2, col, row };
    }

    /* ── Distance (Euclidean / Chebyshev) ───────────────────────── */

    /**
     * cell distance using Chebyshev or Euclidean
     */
    cellDistance(c1r1, c2r2, metric = 'chebyshev') {
        const dc = Math.abs(c2r2.col - c1r1.col);
        const dr = Math.abs(c2r2.row - c1r1.row);
        if (metric === 'euclidean') {
            return Math.sqrt(dc * dc + dr * dr);
        }
        return Math.max(dc, dr); // Chebyshev
    }

    /** Distance in FEET between two cell positions */
    feetBetweenCells(c1, r1, c2, r2, metric = 'chebyshev') {
        const cells = this.cellDistance({ col: c1, row: r1 }, { col: c2, row: r2 }, metric);
        return cells * this.feetPerCell;
    }

    /** Distance in FEET between two pixel positions */
    feetBetweenPixels(px1, py1, px2, py2, metric = 'chebyshev') {
        const cell1 = this.pixelToCell(px1, py1);
        const cell2 = this.pixelToCell(px2, py2);
        return this.feetBetweenCells(cell1.col, cell1.row, cell2.col, cell2.row, metric);
    }

    /** Euclidean pixel distance */
    pixelDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    /* ── FOW BitGrid ────────────────────────────────────────────── */

    getFowState(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return 0;
        return this._fowBitGrid[row * this.cols + col];
    }

    setFowState(col, row, state) {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this._fowBitGrid[row * this.cols + col] = state;
        }
    }

    clearFow(state = 0) {
        this._fowBitGrid.fill(state);
    }

    /* ── Movement & Pathfinding ─────────────────────────────────── */

    /**
     * Returns all cells reachable within `speedFt` feet from a cell.
     * Respects difficult terrain (costs 2x movement).
     * Uses BFS with movement point budget.
     */
    getReachableCells(col, row, speedFt) {
        const budget = speedFt / this.feetPerCell; // In cells
        const visited = new Map(); // "col,row" → cost
        const queue = [{ col, row, cost: 0 }];
        visited.set(`${col},${row}`, 0);
        const result = [];

        while (queue.length > 0) {
            const curr = queue.shift();
            result.push({ col: curr.col, row: curr.row, cost: curr.cost });

            // 8-directional neighbors
            for (let dc = -1; dc <= 1; dc++) {
                for (let dr = -1; dr <= 1; dr++) {
                    if (dc === 0 && dr === 0) continue;
                    const nc = curr.col + dc;
                    const nr = curr.row + dr;
                    if (nc < 0 || nr < 0 || nc >= this.cols || nr >= this.rows) continue;

                    // Wall check
                    const center1 = this.cellCenter(curr.col, curr.row);
                    const center2 = this.cellCenter(nc, nr);
                    if (this.hasWallBetween(center1.x, center1.y, center2.x, center2.y)) continue;

                    const key = `${nc},${nr}`;
                    const moveCost = (dc !== 0 && dr !== 0) ? 1.0 : 1.0; // Chebyshev diagonal
                    const terrainCost = this.isDifficultTerrain(nc, nr) ? 1.0 : 0.0;
                    const totalCost = curr.cost + moveCost + terrainCost;

                    if (totalCost <= budget && (!visited.has(key) || visited.get(key) > totalCost)) {
                        visited.set(key, totalCost);
                        queue.push({ col: nc, row: nr, cost: totalCost });
                    }
                }
            }
        }

        return result;
    }

    /* ── Terrain & Elevation ────────────────────────────────────── */

    setDifficultTerrain(col, row, isDifficult) {
        const key = `${col},${row}`;
        if (isDifficult) {
            this._difficultCells.add(key);
            const chunk = this._getChunk(col, row);
            const offset = this._getCellOffset(col, row);
            chunk.difficultTerrain[offset] = 1;
        } else {
            this._difficultCells.delete(key);
            const chunk = this._getChunk(col, row);
            const offset = this._getCellOffset(col, row);
            chunk.difficultTerrain[offset] = 0;
        }
    }

    isDifficultTerrain(col, row) {
        if (this._difficultCells.has(`${col},${row}`)) return true;
        const chunk = this._getChunk(col, row);
        const offset = this._getCellOffset(col, row);
        return chunk.difficultTerrain[offset] === 1;
    }

    setElevation(col, row, zIndex) {
        const chunk = this._getChunk(col, row);
        const offset = this._getCellOffset(col, row);
        chunk.elevation[offset] = zIndex;
    }

    getElevation(col, row) {
        const chunk = this._getChunk(col, row);
        const offset = this._getCellOffset(col, row);
        return chunk.elevation[offset];
    }

    /* ── Walls & Doors ──────────────────────────────────────────── */

    addWall(x1, y1, x2, y2) {
        const wall = { x1, y1, x2, y2, id: Date.now() + Math.random() };
        this._walls.push(wall);
        this._invalidateSpatialIndex();
        return wall;
    }

    removeWall(id) {
        this._walls = this._walls.filter(w => w.id !== id);
        this._invalidateSpatialIndex();
    }

    getWalls() { return this._walls; }

    addDoor(x1, y1, x2, y2, isOpen = false) {
        const door = { x1, y1, x2, y2, isOpen, id: Date.now() + Math.random() };
        this._doors.push(door);
        this._invalidateSpatialIndex();
        return door;
    }

    removeDoor(id) {
        this._doors = this._doors.filter(d => d.id !== id);
        this._invalidateSpatialIndex();
    }

    toggleDoor(id) {
        const door = this._doors.find(d => d.id === id);
        if (door) {
            door.isOpen = !door.isOpen;
            this._invalidateSpatialIndex();
        }
    }

    getDoors() { return this._doors; }

    /**
     * Check if a line from (ax,ay) to (bx,by) intersects any wall or closed door segment.
     * Uses QuadTree-accelerated queries for maximum performance.
     */
    hasWallBetween(ax, ay, bx, by) {
        if (!this._quadTree) {
            this._updateQuadTree();
        }
        
        const minX = Math.min(ax, bx);
        const maxX = Math.max(ax, bx);
        const minY = Math.min(ay, by);
        const maxY = Math.max(ay, by);
        const queryRange = { 
            x: minX, 
            y: minY, 
            w: Math.max(1, maxX - minX), 
            h: Math.max(1, maxY - minY) 
        };
        
        const results = this._quadTree.query(queryRange);
        for (const item of results) {
            if (item.data) {
                if (item.data.type === 'wall') {
                    const w = item.data.segment;
                    if (this._segmentsIntersect(ax, ay, bx, by, w.x1, w.y1, w.x2, w.y2)) {
                        return true;
                    }
                } else if (item.data.type === 'door' && !item.data.segment.isOpen) {
                    const d = item.data.segment;
                    if (this._segmentsIntersect(ax, ay, bx, by, d.x1, d.y1, d.x2, d.y2)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    _segmentsIntersect(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
        const d1x = p2x - p1x, d1y = p2y - p1y;
        const d2x = p4x - p3x, d2y = p4y - p3y;
        const cross = d1x * d2y - d1y * d2x;
        if (Math.abs(cross) < 1e-10) return false; // Parallel
        const dx = p3x - p1x, dy = p3y - p1y;
        const t = (dx * d2y - dy * d2x) / cross;
        const u = (dx * d1y - dy * d1x) / cross;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }

    /* ── Area of Effect helpers ─────────────────────────────────── */

    getCellsInCircle(cx, cy, radiusFt) {
        const radiusCells = radiusFt / this.feetPerCell;
        const radiusPx = radiusCells * this.cellSize;
        const centerCell = this.pixelToCell(cx, cy);
        const result = [];
        const r = Math.ceil(radiusCells);

        for (let dc = -r; dc <= r; dc++) {
            for (let dr = -r; dr <= r; dr++) {
                const col = centerCell.col + dc;
                const row = centerCell.row + dr;
                if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) continue;
                const cc = this.cellCenter(col, row);
                const dist = this.pixelDistance(cx, cy, cc.x, cc.y);
                if (dist <= radiusPx + this.cellSize * 0.5) {
                    result.push({ col, row });
                }
            }
        }
        return result;
    }

    getCellsInCone(ox, oy, angleDeg, lengthFt, coneDeg = 53.13) {
        const lengthPx = (lengthFt / this.feetPerCell) * this.cellSize;
        const result = [];
        const halfCone = (coneDeg / 2) * (Math.PI / 180);
        const dirRad = angleDeg * (Math.PI / 180);

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const cc = this.cellCenter(col, row);
                const dx = cc.x - ox, dy = cc.y - oy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > lengthPx) continue;
                const cellAngle = Math.atan2(dy, dx);
                let angleDiff = Math.abs(cellAngle - dirRad);
                if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                if (angleDiff <= halfCone) result.push({ col, row });
            }
        }
        return result;
    }

    getCellsInSquare(cx, cy, sideFt) {
        const halfPx = ((sideFt / this.feetPerCell) * this.cellSize) / 2;
        const result = [];
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const cc = this.cellCenter(col, row);
                if (Math.abs(cc.x - cx) <= halfPx && Math.abs(cc.y - cy) <= halfPx) {
                    result.push({ col, row });
                }
            }
        }
        return result;
    }

    getCellsInLine(ox, oy, angleDeg, lengthFt, widthFt = 5) {
        const lengthPx = (lengthFt / this.feetPerCell) * this.cellSize;
        const widthPx  = (widthFt  / this.feetPerCell) * this.cellSize;
        const rad = angleDeg * (Math.PI / 180);
        const result = [];

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const cc = this.cellCenter(col, row);
                const dx = cc.x - ox, dy = cc.y - oy;
                const along = dx * Math.cos(rad) + dy * Math.sin(rad);
                const perp  = Math.abs(-dx * Math.sin(rad) + dy * Math.cos(rad));
                if (along >= 0 && along <= lengthPx && perp <= widthPx / 2) {
                    result.push({ col, row });
                }
            }
        }
        return result;
    }

    /* ── Serialization ──────────────────────────────────────────── */

    serialize() {
        return {
            cellSize: this.cellSize,
            feetPerCell: this.feetPerCell,
            cols: this.cols,
            rows: this.rows,
            difficultCells: [...this._difficultCells],
            walls: this._walls,
            doors: this._doors
        };
    }

    static deserialize(data) {
        const g = new GridEngine(data);
        (data.difficultCells || []).forEach(k => g.setDifficultTerrain(parseInt(k.split(',')[0]), parseInt(k.split(',')[1]), true));
        g._walls = data.walls || [];
        g._doors = data.doors || [];
        g._invalidateSpatialIndex();
        return g;
    }
}
