/**
 * PATHFINDING v1.0
 * Features A* and Jump Point Search (JPS) pathfinding algorithms for grid maps.
 * Integrates with GridEngine to respect dynamic wall segments, closed doors, and terrain costs.
 */
export class Pathfinding {
    /**
     * Finds a path from start to end on the grid.
     * @param {import('./GridEngine.js').GridEngine} grid
     * @param {number} startCol
     * @param {number} startRow
     * @param {number} endCol
     * @param {number} endRow
     * @param {object} opts - { useJPS: boolean, distanceMetric: 'chebyshev'|'euclidean' }
     * @returns {Array<{col, row}>} path
     */
    static findPath(grid, startCol, startRow, endCol, endRow, opts = {}) {
        const useJPS = opts.useJPS !== false;
        const metric = opts.distanceMetric || 'chebyshev';

        if (startCol === endCol && startRow === endRow) {
            return [{ col: startCol, row: startRow }];
        }

        // Clamping end points
        endCol = Math.max(0, Math.min(grid.cols - 1, endCol));
        endRow = Math.max(0, Math.min(grid.rows - 1, endRow));

        if (useJPS && metric === 'chebyshev') {
            return this._runJPS(grid, startCol, startRow, endCol, endRow, metric);
        } else {
            return this._runAStar(grid, startCol, startRow, endCol, endRow, metric);
        }
    }

    /**
     * Standard A* implementation
     */
    static _runAStar(grid, startCol, startRow, endCol, endRow, metric) {
        const openSet = [];
        const closedSet = new Set();

        const startNode = {
            col: startCol,
            row: startRow,
            g: 0,
            h: this._heuristic(startCol, startRow, endCol, endRow, metric),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;
        openSet.push(startNode);

        const nodeKey = (col, row) => `${col},${row}`;
        const openSetMap = new Map();
        openSetMap.set(nodeKey(startCol, startRow), startNode);

        while (openSet.length > 0) {
            // Get node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currKey = nodeKey(current.col, current.row);
            openSetMap.delete(currKey);

            if (current.col === endCol && current.row === endRow) {
                return this._reconstructPath(current);
            }

            closedSet.add(currKey);

            const neighbors = this._getNeighbors(grid, current.col, current.row);
            for (const neighbor of neighbors) {
                const nKey = nodeKey(neighbor.col, neighbor.row);
                if (closedSet.has(nKey)) continue;

                // Wall segment / closed door check
                if (this._isBlocked(grid, current.col, current.row, neighbor.col, neighbor.row)) {
                    continue;
                }

                const stepCost = this._getStepCost(grid, current.col, current.row, neighbor.col, neighbor.row, metric);
                const tentativeG = current.g + stepCost;

                let neighborNode = openSetMap.get(nKey);
                if (!neighborNode) {
                    neighborNode = {
                        col: neighbor.col,
                        row: neighbor.row,
                        g: tentativeG,
                        h: this._heuristic(neighbor.col, neighbor.row, endCol, endRow, metric),
                        f: 0,
                        parent: current
                    };
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    openSet.push(neighborNode);
                    openSetMap.set(nKey, neighborNode);
                } else if (tentativeG < neighborNode.g) {
                    neighborNode.g = tentativeG;
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    neighborNode.parent = current;
                }
            }
        }

        return []; // No path found
    }

    /**
     * Jump Point Search (JPS) implementation
     */
    static _runJPS(grid, startCol, startRow, endCol, endRow, metric) {
        const openSet = [];
        const closedSet = new Set();

        const startNode = {
            col: startCol,
            row: startRow,
            g: 0,
            h: this._heuristic(startCol, startRow, endCol, endRow, metric),
            f: 0,
            parent: null
        };
        startNode.f = startNode.g + startNode.h;
        openSet.push(startNode);

        const nodeKey = (col, row) => `${col},${row}`;
        const openSetMap = new Map();
        openSetMap.set(nodeKey(startCol, startRow), startNode);

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currKey = nodeKey(current.col, current.row);
            openSetMap.delete(currKey);

            if (current.col === endCol && current.row === endRow) {
                return this._reconstructPath(current);
            }

            closedSet.add(currKey);

            const neighbors = this._getNeighbors(grid, current.col, current.row);
            for (const neighbor of neighbors) {
                // Determine direction
                const dx = Math.sign(neighbor.col - current.col);
                const dy = Math.sign(neighbor.row - current.row);

                // Jump in that direction
                const jumpPoint = this._jump(grid, current.col, current.row, dx, dy, endCol, endRow, metric);
                if (jumpPoint) {
                    const jpKey = nodeKey(jumpPoint.col, jumpPoint.row);
                    if (closedSet.has(jpKey)) continue;

                    const dist = this._heuristic(current.col, current.row, jumpPoint.col, jumpPoint.row, metric);
                    const stepCost = dist + (grid.isDifficultTerrain(jumpPoint.col, jumpPoint.row) ? 1.0 : 0.0);
                    const tentativeG = current.g + stepCost;

                    let jpNode = openSetMap.get(jpKey);
                    if (!jpNode) {
                        jpNode = {
                            col: jumpPoint.col,
                            row: jumpPoint.row,
                            g: tentativeG,
                            h: this._heuristic(jumpPoint.col, jumpPoint.row, endCol, endRow, metric),
                            f: 0,
                            parent: current
                        };
                        jpNode.f = jpNode.g + jpNode.h;
                        openSet.push(jpNode);
                        openSetMap.set(jpKey, jpNode);
                    } else if (tentativeG < jpNode.g) {
                        jpNode.g = tentativeG;
                        jpNode.f = jpNode.g + jpNode.h;
                        jpNode.parent = current;
                    }
                }
            }
        }

        // Fallback to A* if JPS yields empty due to irregular segment obstacles
        return this._runAStar(grid, startCol, startRow, endCol, endRow, metric);
    }

    /**
     * Recursive jump function for JPS
     */
    static _jump(grid, cx, cy, dx, dy, tx, ty, metric) {
        const nx = cx + dx;
        const ny = cy + dy;

        // Boundary check
        if (nx < 0 || nx >= grid.cols || ny < 0 || ny >= grid.rows) return null;

        // Collision segment wall check between current and next step
        if (this._isBlocked(grid, cx, cy, nx, ny)) return null;

        // Target reached
        if (nx === tx && ny === ty) {
            return { col: nx, row: ny };
        }

        // Diagonal checks
        if (dx !== 0 && dy !== 0) {
            // Check for forced neighbors
            if ((this._isWalkable(grid, nx - dx, ny) && this._isBlocked(grid, nx - dx, ny, nx - dx, ny + dy)) ||
                (this._isWalkable(grid, nx, ny - dy) && this._isBlocked(grid, nx, ny - dy, nx + dx, ny - dy))) {
                return { col: nx, row: ny };
            }
            // Check orthogonal directions from this diagonal step
            if (this._jump(grid, nx, ny, dx, 0, tx, ty, metric) ||
                this._jump(grid, nx, ny, 0, dy, tx, ty, metric)) {
                return { col: nx, row: ny };
            }
        } else {
            // Orthogonal checks
            if (dx !== 0) { // Horizontal
                if ((this._isWalkable(grid, nx, ny - 1) && this._isBlocked(grid, nx, ny - 1, nx + dx, ny - 1)) ||
                    (this._isWalkable(grid, nx, ny + 1) && this._isBlocked(grid, nx, ny + 1, nx + dx, ny + 1))) {
                    return { col: nx, row: ny };
                }
            } else { // Vertical
                if ((this._isWalkable(grid, nx - 1, ny) && this._isBlocked(grid, nx - 1, ny, nx - 1, ny + dy)) ||
                    (this._isWalkable(grid, nx + 1, ny) && this._isBlocked(grid, nx + 1, ny, nx + 1, ny + dy))) {
                    return { col: nx, row: ny };
                }
            }
        }

        // Continue jumping
        return this._jump(grid, nx, ny, dx, dy, tx, ty, metric);
    }

    /**
     * Helper to verify if path is blocked by walls/closed doors
     */
    static _isBlocked(grid, c1, r1, c2, r2) {
        const from = grid.cellCenter(c1, r1);
        const to = grid.cellCenter(c2, r2);
        return grid.hasWallBetween(from.x, from.y, to.x, to.y);
    }

    static _isWalkable(grid, col, row) {
        return col >= 0 && col < grid.cols && row >= 0 && row < grid.rows;
    }

    /**
     * Standard heuristic distance
     */
    static _heuristic(c1, r1, c2, r2, metric) {
        const dc = Math.abs(c2 - c1);
        const dr = Math.abs(r2 - r1);
        if (metric === 'euclidean') {
            return Math.sqrt(dc * dc + dr * dr);
        }
        return Math.max(dc, dr); // Chebyshev / 5e diagonal rule
    }

    /**
     * Compute cost of stepping between neighboring cells
     */
    static _getStepCost(grid, c1, r1, c2, r2, metric) {
        let baseCost = 1.0;
        if (metric === 'euclidean') {
            const dc = c2 - c1;
            const dr = r2 - r1;
            baseCost = Math.sqrt(dc * dc + dr * dr);
        }
        
        // Terrain cost
        const isDiff = grid.isDifficultTerrain(c2, r2);
        return baseCost + (isDiff ? 1.0 : 0.0);
    }

    /**
     * Reconstruct step coordinates list
     */
    static _reconstructPath(node) {
        const path = [];
        let curr = node;
        while (curr) {
            path.push({ col: curr.col, row: curr.row });
            curr = curr.parent;
        }
        return path.reverse();
    }

    /**
     * Return 8 neighbors around a cell
     */
    static _getNeighbors(grid, col, row) {
        const list = [];
        for (let dc = -1; dc <= 1; dc++) {
            for (let dr = -1; dr <= 1; dr++) {
                if (dc === 0 && dr === 0) continue;
                const nc = col + dc;
                const nr = row + dr;
                if (nc >= 0 && nc < grid.cols && nr >= 0 && nr < grid.rows) {
                    list.push({ col: nc, row: nr });
                }
            }
        }
        return list;
    }
}
