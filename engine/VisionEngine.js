/**
 * VISION ENGINE v1.0 — D&D 5e Tactical Map
 * Line-of-sight checking via simple 2D ray casting.
 * Integrates with GridEngine walls and FogEngine visibility.
 */
import { GridEngine } from './GridEngine.js';

export class VisionEngine {
    /**
     * @param {GridEngine} grid
     */
    constructor(grid) {
        this.grid = grid;
        this._visionCache = new Map(); // "token_col,row" → boolean
    }

    /* ── Line of Sight ──────────────────────────────────────────── */

    /**
     * Check if there's clear line of sight between two pixel positions.
     * Uses the wall segments from GridEngine.
     */
    hasLOS(fromX, fromY, toX, toY) {
        return !this.grid.hasWallBetween(fromX, fromY, toX, toY);
    }

    /**
     * Check LOS between two grid cells.
     */
    hasLOSBetweenCells(c1, r1, c2, r2) {
        const from = this.grid.cellCenter(c1, r1);
        const to   = this.grid.cellCenter(c2, r2);
        return this.hasLOS(from.x, from.y, to.x, to.y);
    }

    /**
     * Returns all cells visible from a given pixel position within radiusFt.
     * Uses multi-ray casting for accuracy.
     */
    getVisibleCells(fromX, fromY, radiusFt) {
        const radiusPx    = (radiusFt / this.grid.feetPerCell) * this.grid.cellSize;
        const radiusCells = Math.ceil(radiusFt / this.grid.feetPerCell);
        const fromCell    = this.grid.pixelToCell(fromX, fromY);
        const visible     = [];

        for (let dc = -radiusCells; dc <= radiusCells; dc++) {
            for (let dr = -radiusCells; dr <= radiusCells; dr++) {
                const col = fromCell.col + dc;
                const row = fromCell.row + dr;
                if (col < 0 || row < 0 || col >= this.grid.cols || row >= this.grid.rows) continue;

                const center = this.grid.cellCenter(col, row);
                const dist = Math.sqrt((center.x - fromX) ** 2 + (center.y - fromY) ** 2);
                if (dist > radiusPx) continue;

                // Cast ray to the 4 corners of the cell for better accuracy
                const corners = [
                    { x: col * this.grid.cellSize + 2,                  y: row * this.grid.cellSize + 2 },
                    { x: (col + 1) * this.grid.cellSize - 2,            y: row * this.grid.cellSize + 2 },
                    { x: col * this.grid.cellSize + 2,                  y: (row + 1) * this.grid.cellSize - 2 },
                    { x: (col + 1) * this.grid.cellSize - 2,            y: (row + 1) * this.grid.cellSize - 2 }
                ];

                const isVisible = corners.some(corner =>
                    this.hasLOS(fromX, fromY, corner.x, corner.y)
                );

                if (isVisible) visible.push({ col, row });
            }
        }

        return visible;
    }

    /* ── Cover Calculation ──────────────────────────────────────── */

    /**
     * Estimate cover type between attacker and target.
     * Returns: 'none' | 'half' | 'three-quarters' | 'full'
     */
    getCoverType(attackerX, attackerY, targetX, targetY) {
        const walls = this.grid.getWalls();
        let blockedRays = 0;
        const totalRays = 4;

        // Sample 4 rays from attacker center to target corners
        const tc = this.grid.pixelToCell(targetX, targetY);
        const corners = [
            { x: tc.col * this.grid.cellSize + 5,               y: tc.row * this.grid.cellSize + 5 },
            { x: (tc.col + 1) * this.grid.cellSize - 5,         y: tc.row * this.grid.cellSize + 5 },
            { x: tc.col * this.grid.cellSize + 5,               y: (tc.row + 1) * this.grid.cellSize - 5 },
            { x: (tc.col + 1) * this.grid.cellSize - 5,         y: (tc.row + 1) * this.grid.cellSize - 5 }
        ];

        corners.forEach(corner => {
            if (this.grid.hasWallBetween(attackerX, attackerY, corner.x, corner.y)) {
                blockedRays++;
            }
        });

        if (blockedRays === 0) return 'none';
        if (blockedRays <= 1) return 'half';           // +2 AC
        if (blockedRays <= 3) return 'three-quarters'; // +5 AC
        return 'full';                                  // Can't be targeted
    }

    /**
     * Get the AC bonus from cover type.
     */
    static coverBonus(coverType) {
        switch (coverType) {
            case 'half':           return 2;
            case 'three-quarters': return 5;
            case 'full':           return Infinity;
            default:               return 0;
        }
    }

    /* ── Render: Vision Indicator ───────────────────────────────── */

    /**
     * Draws a directional indicator of token's facing / vision arc.
     * Optional cosmetic overlay on the grid canvas.
     */
    renderVisionArc(ctx, fromX, fromY, facingAngle, radiusFt, color = 'rgba(255,255,100,0.06)') {
        const radiusPx = (radiusFt / this.grid.feetPerCell) * this.grid.cellSize;
        const arcAngle = Math.PI / 2; // 90° vision arc for facing indicator

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.arc(fromX, fromY, radiusPx, facingAngle - arcAngle / 2, facingAngle + arcAngle / 2);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    /* ── Cache Management ────────────────────────────────────────── */

    invalidateCache() {
        this._visionCache.clear();
    }
}
