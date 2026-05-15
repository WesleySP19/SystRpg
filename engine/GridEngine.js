/**
 * GRID ENGINE v1.0 — D&D 5e Tactical Map
 * Pure calculation engine (no DOM, no Canvas directly).
 * Handles: cell sizes, snap, pixel↔cell↔feet conversion,
 *          difficult terrain, adjacency, distance.
 */
export class GridEngine {
    /**
     * @param {object} opts
     * @param {number} opts.cellSize — pixels per cell (default 60, = 5ft)
     * @param {number} opts.feetPerCell — D&D grid unit (default 5)
     * @param {number} opts.cols — grid columns
     * @param {number} opts.rows — grid rows
     */
    constructor(opts = {}) {
        this.cellSize  = opts.cellSize  || 60;
        this.feetPerCell = opts.feetPerCell || 5;
        this.cols      = opts.cols || 30;
        this.rows      = opts.rows || 20;

        // Difficult terrain cells: Set of "col,row" strings
        this._difficultCells = new Set();
        // Wall segments: array of {x1,y1,x2,y2} in pixel coords
        this._walls = [];
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

    /* ── Distance (D&D 5e rules) ────────────────────────────────── */

    /**
     * Chebyshev distance in CELLS (diagonal = same cost as orthogonal)
     * This is the D&D 5e simplified diagonal rule.
     */
    cellDistance(c1r1, c2r2) {
        const dc = Math.abs(c2r2.col - c1r1.col);
        const dr = Math.abs(c2r2.row - c1r1.row);
        return Math.max(dc, dr); // Chebyshev
    }

    /** Distance in FEET between two cell positions */
    feetBetweenCells(c1, r1, c2, r2) {
        const cells = this.cellDistance({ col: c1, row: r1 }, { col: c2, row: r2 });
        return cells * this.feetPerCell;
    }

    /** Distance in FEET between two pixel positions */
    feetBetweenPixels(px1, py1, px2, py2) {
        const cell1 = this.pixelToCell(px1, py1);
        const cell2 = this.pixelToCell(px2, py2);
        return this.feetBetweenCells(cell1.col, cell1.row, cell2.col, cell2.row);
    }

    /** Euclidean pixel distance (for line/cone effects) */
    pixelDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    /* ── Movement ───────────────────────────────────────────────── */

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

                    const key = `${nc},${nr}`;
                    const moveCost = (dc !== 0 && dr !== 0) ? 1 : 1; // Diagonal = 1 cell (5e rule)
                    const terrainCost = this._difficultCells.has(key) ? 1 : 0; // Extra cell cost
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

    /* ── Terrain ────────────────────────────────────────────────── */

    setDifficultTerrain(col, row, isDifficult) {
        const key = `${col},${row}`;
        if (isDifficult) this._difficultCells.add(key);
        else this._difficultCells.delete(key);
    }

    isDifficultTerrain(col, row) {
        return this._difficultCells.has(`${col},${row}`);
    }

    /* ── Walls ──────────────────────────────────────────────────── */

    addWall(x1, y1, x2, y2) {
        this._walls.push({ x1, y1, x2, y2, id: Date.now() + Math.random() });
    }

    removeWall(id) {
        this._walls = this._walls.filter(w => w.id !== id);
    }

    getWalls() { return this._walls; }

    /**
     * Check if a line from (ax,ay) to (bx,by) intersects any wall segment.
     * Used by VisionEngine for line-of-sight blocking.
     */
    hasWallBetween(ax, ay, bx, by) {
        for (const w of this._walls) {
            if (this._segmentsIntersect(ax, ay, bx, by, w.x1, w.y1, w.x2, w.y2)) {
                return true;
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

    /** Returns cells inside a CIRCLE of radiusFt from center pixel */
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

    /** Returns cells inside a CONE from origin in direction angle, given angleDeg and lengthFt */
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

    /** Returns cells inside a SQUARE (cube) of sideFt centered on pixel */
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

    /** Returns cells in a LINE from ox,oy in direction angle, widthFt × lengthFt */
    getCellsInLine(ox, oy, angleDeg, lengthFt, widthFt = 5) {
        const lengthPx = (lengthFt / this.feetPerCell) * this.cellSize;
        const widthPx  = (widthFt  / this.feetPerCell) * this.cellSize;
        const rad = angleDeg * (Math.PI / 180);
        const result = [];

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const cc = this.cellCenter(col, row);
                // Project onto line direction
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
            walls: this._walls
        };
    }

    static deserialize(data) {
        const g = new GridEngine(data);
        (data.difficultCells || []).forEach(k => g._difficultCells.add(k));
        g._walls = data.walls || [];
        return g;
    }
}
