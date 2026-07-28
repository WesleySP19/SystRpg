/**
 * VISION ENGINE v2.0 — D&D 5e Tactical Map
 * Line-of-sight and field of view calculations with QuadTree acceleration.
 * Integrates with GridEngine and ECS Vision components.
 */
import { GridEngine } from './GridEngine.js';

export class VisionEngine {
    /**
     * @param {GridEngine} grid
     */
    constructor(grid) {
        this.grid = grid;
        this._visionCache = new Map();
    }

    /* ── Line of Sight ──────────────────────────────────────────── */

    /**
     * Check if there's clear line of sight between two pixel positions.
     * Optionally queries a set of local segments to accelerate checks.
     */
    hasLOS(fromX, fromY, toX, toY, localSegments = null) {
        if (localSegments) {
            for (const s of localSegments) {
                if (this.grid._segmentsIntersect(fromX, fromY, toX, toY, s.x1, s.y1, s.x2, s.y2)) {
                    return false;
                }
            }
            return true;
        }
        return !this.grid.hasWallBetween(fromX, fromY, toX, toY);
    }

    /**
     * Check LOS between two grid cells.
     */
    hasLOSBetweenCells(c1, r1, c2, r2, localSegments = null) {
        const from = this.grid.cellCenter(c1, r1);
        const to   = this.grid.cellCenter(c2, r2);
        return this.hasLOS(from.x, from.y, to.x, to.y, localSegments);
    }

    /**
     * Returns all cells visible from a given pixel position.
     * Uses QuadTree segment queries and multi-ray casting for accuracy.
     * Supports cone field-of-view limits.
     */
    getVisibleCells(fromX, fromY, radiusFt, quadTree = null, arcAngle = 360, facingAngle = 0) {
        const radiusPx    = (radiusFt / this.grid.feetPerCell) * this.grid.cellSize;
        const radiusCells = Math.ceil(radiusFt / this.grid.feetPerCell);
        const fromCell    = this.grid.pixelToCell(fromX, fromY);
        const visible     = [];

        // Query QuadTree for walls/doors inside bounding box of the vision range
        let localSegments = null;
        if (quadTree) {
            localSegments = [];
            const queryRange = { 
                x: fromX - radiusPx, 
                y: fromY - radiusPx, 
                w: radiusPx * 2, 
                h: radiusPx * 2 
            };
            const results = quadTree.query(queryRange);
            for (const item of results) {
                if (item.data) {
                    if (item.data.type === 'wall') {
                        localSegments.push(item.data.segment);
                    } else if (item.data.type === 'door' && !item.data.segment.isOpen) {
                        localSegments.push(item.data.segment);
                    }
                }
            }
        }

        const halfArcRad = ((arcAngle / 2) * Math.PI) / 180;

        for (let dc = -radiusCells; dc <= radiusCells; dc++) {
            for (let dr = -radiusCells; dr <= radiusCells; dr++) {
                const col = fromCell.col + dc;
                const row = fromCell.row + dr;
                if (col < 0 || row < 0 || col >= this.grid.cols || row >= this.grid.rows) continue;

                const center = this.grid.cellCenter(col, row);
                const dist = Math.hypot(center.x - fromX, center.y - fromY);
                if (dist > radiusPx) continue;

                // Cone angle constraint check
                if (arcAngle < 360) {
                    const angle = Math.atan2(center.y - fromY, center.x - fromX);
                    let diff = Math.abs(angle - facingAngle);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;
                    if (diff > halfArcRad) continue; // Outside vision arc
                }

                // Cast ray to the 4 corners of the cell
                const corners = [
                    { x: col * this.grid.cellSize + 2,                  y: row * this.grid.cellSize + 2 },
                    { x: (col + 1) * this.grid.cellSize - 2,            y: row * this.grid.cellSize + 2 },
                    { x: col * this.grid.cellSize + 2,                  y: (row + 1) * this.grid.cellSize - 2 },
                    { x: (col + 1) * this.grid.cellSize - 2,            y: (row + 1) * this.grid.cellSize - 2 }
                ];

                const isVisible = corners.some(corner =>
                    this.hasLOS(fromX, fromY, corner.x, corner.y, localSegments)
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
    getCoverType(attackerX, attackerY, targetX, targetY, quadTree = null) {
        let localSegments = null;
        if (quadTree) {
            localSegments = [];
            const minX = Math.min(attackerX, targetX);
            const maxX = Math.max(attackerX, targetX);
            const minY = Math.min(attackerY, targetY);
            const maxY = Math.max(attackerY, targetY);
            
            const results = quadTree.query({ x: minX, y: minY, w: maxX - minX, h: maxY - minY });
            for (const item of results) {
                if (item.data) {
                    if (item.data.type === 'wall') {
                        localSegments.push(item.data.segment);
                    } else if (item.data.type === 'door' && !item.data.segment.isOpen) {
                        localSegments.push(item.data.segment);
                    }
                }
            }
        }

        let blockedRays = 0;
        const tc = this.grid.pixelToCell(targetX, targetY);
        const corners = [
            { x: tc.col * this.grid.cellSize + 5,               y: tc.row * this.grid.cellSize + 5 },
            { x: (tc.col + 1) * this.grid.cellSize - 5,         y: tc.row * this.grid.cellSize + 5 },
            { x: tc.col * this.grid.cellSize + 5,               y: (tc.row + 1) * this.grid.cellSize - 5 },
            { x: (tc.col + 1) * this.grid.cellSize - 5,         y: (tc.row + 1) * this.grid.cellSize - 5 }
        ];

        corners.forEach(corner => {
            if (!this.hasLOS(attackerX, attackerY, corner.x, corner.y, localSegments)) {
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

    renderVisionArc(ctx, fromX, fromY, facingAngle, radiusFt, arcAngleDeg = 90, color = 'rgba(255,255,100,0.05)') {
        const radiusPx = (radiusFt / this.grid.feetPerCell) * this.grid.cellSize;
        const arcAngleRad = (arcAngleDeg * Math.PI) / 180;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.arc(fromX, fromY, radiusPx, facingAngle - arcAngleRad / 2, facingAngle + arcAngleRad / 2);
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
