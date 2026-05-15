/**
 * EFFECT ENGINE v1.0 — D&D 5e Tactical Map
 * Manages area-of-effect spells and abilities.
 * Renders preview SVG overlay + highlights affected tokens.
 *
 * Shapes: SPHERE, CONE, CUBE, LINE, CYLINDER
 */
import { GridEngine } from './GridEngine.js';

export const EFFECT_SHAPES = {
    sphere:   { label: 'Esfera',   icon: '⭕', defaultFt: 20 },
    cone:     { label: 'Cone',     icon: '🔺', defaultFt: 30 },
    cube:     { label: 'Cubo',     icon: '⬜', defaultFt: 15 },
    line:     { label: 'Linha',    icon: '➡️', defaultFt: 60, widthFt: 5 },
    cylinder: { label: 'Cilindro', icon: '🔵', defaultFt: 10 }
};

export const EFFECT_COLORS = {
    fire:     { fill: 'rgba(239,68,68,0.25)',    stroke: '#ef4444' },
    cold:     { fill: 'rgba(96,165,250,0.25)',   stroke: '#60a5fa' },
    lightning:{ fill: 'rgba(250,204,21,0.25)',   stroke: '#facc15' },
    poison:   { fill: 'rgba(34,197,94,0.25)',    stroke: '#22c55e' },
    necrotic: { fill: 'rgba(168,85,247,0.25)',   stroke: '#a855f7' },
    radiant:  { fill: 'rgba(251,191,36,0.25)',   stroke: '#fbbf24' },
    default:  { fill: 'rgba(212,175,55,0.2)',    stroke: '#d4af37' }
};

export class EffectEngine {
    /**
     * @param {SVGElement} svgOverlay — the SVG element over the canvas
     * @param {GridEngine} grid
     */
    constructor(svgOverlay, grid) {
        this.svg  = svgOverlay;
        this.grid = grid;

        // Active effects (persistent, placed by DM)
        this._effects = [];
        // Preview effect (while dragging to place)
        this._preview = null;
    }

    /* ── Preview (while placing) ────────────────────────────────── */

    /**
     * Update the live preview as the user drags.
     * @param {string} shape — 'sphere'|'cone'|'cube'|'line'|'cylinder'
     * @param {number} ox — origin pixel x
     * @param {number} oy — origin pixel y
     * @param {number} tx — target (cursor) pixel x
     * @param {number} ty — target pixel y
     * @param {number} sizeFt — radius or length in feet
     * @param {string} colorKey — key in EFFECT_COLORS
     */
    updatePreview(shape, ox, oy, tx, ty, sizeFt, colorKey = 'default') {
        this._preview = { shape, ox, oy, tx, ty, sizeFt, colorKey, id: 'preview' };
        this._renderAll();
    }

    clearPreview() {
        this._preview = null;
        this._renderAll();
    }

    /* ── Persistent Effects ─────────────────────────────────────── */

    placeEffect(shape, ox, oy, tx, ty, sizeFt, colorKey = 'default', label = '') {
        const effect = {
            id: 'eff-' + Date.now(),
            shape, ox, oy, tx, ty, sizeFt, colorKey, label,
            timestamp: Date.now()
        };
        this._effects.push(effect);
        this._renderAll();
        return effect;
    }

    removeEffect(id) {
        this._effects = this._effects.filter(e => e.id !== id);
        this._renderAll();
    }

    clearAllEffects() {
        this._effects = [];
        this._preview = null;
        this._renderAll();
    }

    getEffects() { return [...this._effects]; }

    /* ── Highlight Tokens in Area ────────────────────────────────── */

    /**
     * Returns token IDs that fall inside a given effect.
     * @param {object} effect
     * @param {Array} tokens — all tokens with {x, y}
     */
    getTokensInEffect(effect, tokens) {
        const cells = this._getEffectCells(effect);
        const cellSet = new Set(cells.map(c => `${c.col},${c.row}`));
        return tokens.filter(t => {
            const cell = this.grid.pixelToCell(t.x, t.y);
            return cellSet.has(`${cell.col},${cell.row}`);
        });
    }

    _getEffectCells(eff) {
        const angle = Math.atan2(eff.ty - eff.oy, eff.tx - eff.ox) * (180 / Math.PI);
        switch (eff.shape) {
            case 'sphere':
            case 'cylinder':
                return this.grid.getCellsInCircle(eff.ox, eff.oy, eff.sizeFt);
            case 'cone':
                return this.grid.getCellsInCone(eff.ox, eff.oy, angle, eff.sizeFt);
            case 'cube':
                return this.grid.getCellsInSquare(eff.tx, eff.ty, eff.sizeFt);
            case 'line':
                return this.grid.getCellsInLine(eff.ox, eff.oy, angle, eff.sizeFt);
            default: return [];
        }
    }

    /* ── Rendering ──────────────────────────────────────────────── */

    resize(width, height) {
        this.svg.setAttribute('width',  width);
        this.svg.setAttribute('height', height);
        this._renderAll();
    }

    _renderAll() {
        // Clear SVG
        while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

        const allEffects = [...this._effects];
        if (this._preview) allEffects.push(this._preview);

        allEffects.forEach(eff => this._renderEffect(eff));
    }

    _renderEffect(eff) {
        const color = EFFECT_COLORS[eff.colorKey] || EFFECT_COLORS.default;
        const isPreview = eff.id === 'preview';
        const opacity = isPreview ? 0.7 : 1;
        const cs = this.grid.cellSize;
        const radiusPx = (eff.sizeFt / this.grid.feetPerCell) * cs;

        // Highlight cells first (low opacity fill)
        const cells = this._getEffectCells(eff);
        cells.forEach(({ col, row }) => {
            const rect = this._createSVGEl('rect');
            rect.setAttribute('x', col * cs);
            rect.setAttribute('y', row * cs);
            rect.setAttribute('width', cs);
            rect.setAttribute('height', cs);
            rect.setAttribute('fill', color.fill);
            rect.setAttribute('opacity', opacity);
            this.svg.appendChild(rect);
        });

        // Draw shape outline
        const angle = Math.atan2(eff.ty - eff.oy, eff.tx - eff.ox);

        switch (eff.shape) {
            case 'sphere':
            case 'cylinder': {
                const circle = this._createSVGEl('circle');
                circle.setAttribute('cx', eff.ox);
                circle.setAttribute('cy', eff.oy);
                circle.setAttribute('r',  radiusPx);
                circle.setAttribute('fill', 'none');
                circle.setAttribute('stroke', color.stroke);
                circle.setAttribute('stroke-width', isPreview ? '2' : '2');
                circle.setAttribute('stroke-dasharray', isPreview ? '6,3' : 'none');
                circle.setAttribute('opacity', opacity);
                this.svg.appendChild(circle);

                // Origin dot
                const dot = this._createSVGEl('circle');
                dot.setAttribute('cx', eff.ox);
                dot.setAttribute('cy', eff.oy);
                dot.setAttribute('r', 4);
                dot.setAttribute('fill', color.stroke);
                this.svg.appendChild(dot);
                break;
            }

            case 'cone': {
                const halfAngle = 53.13 / 2 * (Math.PI / 180);
                const x1 = eff.ox + Math.cos(angle - halfAngle) * radiusPx;
                const y1 = eff.oy + Math.sin(angle - halfAngle) * radiusPx;
                const x2 = eff.ox + Math.cos(angle + halfAngle) * radiusPx;
                const y2 = eff.oy + Math.sin(angle + halfAngle) * radiusPx;

                const d = `M ${eff.ox} ${eff.oy} L ${x1} ${y1} A ${radiusPx} ${radiusPx} 0 0 1 ${x2} ${y2} Z`;
                const path = this._createSVGEl('path');
                path.setAttribute('d', d);
                path.setAttribute('fill', color.fill);
                path.setAttribute('stroke', color.stroke);
                path.setAttribute('stroke-width', '2');
                path.setAttribute('stroke-dasharray', isPreview ? '6,3' : 'none');
                path.setAttribute('opacity', opacity);
                this.svg.appendChild(path);
                break;
            }

            case 'cube': {
                const halfFt = eff.sizeFt / 2;
                const halfPx = (halfFt / this.grid.feetPerCell) * cs;
                const rect = this._createSVGEl('rect');
                rect.setAttribute('x', eff.tx - halfPx);
                rect.setAttribute('y', eff.ty - halfPx);
                rect.setAttribute('width', halfPx * 2);
                rect.setAttribute('height', halfPx * 2);
                rect.setAttribute('fill', 'none');
                rect.setAttribute('stroke', color.stroke);
                rect.setAttribute('stroke-width', '2');
                rect.setAttribute('stroke-dasharray', isPreview ? '6,3' : 'none');
                rect.setAttribute('opacity', opacity);
                this.svg.appendChild(rect);
                break;
            }

            case 'line': {
                const widthPx = (5 / this.grid.feetPerCell) * cs;
                const lengthPx = radiusPx;
                const ex = eff.ox + Math.cos(angle) * lengthPx;
                const ey = eff.oy + Math.sin(angle) * lengthPx;

                const line = this._createSVGEl('line');
                line.setAttribute('x1', eff.ox);
                line.setAttribute('y1', eff.oy);
                line.setAttribute('x2', ex);
                line.setAttribute('y2', ey);
                line.setAttribute('stroke', color.stroke);
                line.setAttribute('stroke-width', widthPx);
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('stroke-dasharray', isPreview ? '10,5' : 'none');
                line.setAttribute('opacity', opacity * 0.6);
                this.svg.appendChild(line);

                // Arrow at end
                const arrow = this._createSVGEl('circle');
                arrow.setAttribute('cx', ex);
                arrow.setAttribute('cy', ey);
                arrow.setAttribute('r', 5);
                arrow.setAttribute('fill', color.stroke);
                arrow.setAttribute('opacity', opacity);
                this.svg.appendChild(arrow);
                break;
            }
        }

        // Label
        if (eff.label) {
            const text = this._createSVGEl('text');
            text.setAttribute('x', eff.ox);
            text.setAttribute('y', eff.oy - 12);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', color.stroke);
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-family', 'Outfit, sans-serif');
            text.setAttribute('filter', 'drop-shadow(0 0 3px rgba(0,0,0,0.9))');
            text.textContent = eff.label;
            this.svg.appendChild(text);
        }
    }

    _createSVGEl(tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    /* ── Serialization ──────────────────────────────────────────── */

    serialize() { return [...this._effects]; }
    load(data = []) { this._effects = data; this._renderAll(); }
}
