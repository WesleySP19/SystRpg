/**
 * FOG OF WAR ENGINE v1.0 — D&D 5e Tactical Map
 * Renders on a dedicated Canvas layer using composite operations.
 * Three states per cell:
 *   - HIDDEN   (black, fully opaque)
 *   - EXPLORED (semi-transparent gray — player was here before)
 *   - VISIBLE  (transparent — currently visible)
 */
export class FogEngine {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {import('./GridEngine.js').GridEngine} grid
     */
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx    = canvas.getContext('2d');
        this.grid   = grid;
        this.enabled = true;

        // Cell states: 'hidden' | 'explored' | 'visible'
        this._cells = {}; // "col,row" → state

        // Initialize all cells as hidden
        this._initCells();
    }

    _initCells() {
        for (let c = 0; c < this.grid.cols; c++) {
            for (let r = 0; r < this.grid.rows; r++) {
                this._cells[`${c},${r}`] = 'hidden';
            }
        }
    }

    /* ── State Management ───────────────────────────────────────── */

    reveal(col, row) {
        const key = `${col},${row}`;
        if (this._cells[key] !== undefined) this._cells[key] = 'visible';
    }

    revealCircle(centerCol, centerRow, radiusCells) {
        for (let c = 0; c < this.grid.cols; c++) {
            for (let r = 0; r < this.grid.rows; r++) {
                const dist = Math.max(Math.abs(c - centerCol), Math.abs(r - centerRow));
                if (dist <= radiusCells) this.reveal(c, r);
            }
        }
    }

    revealAll() {
        Object.keys(this._cells).forEach(k => this._cells[k] = 'visible');
    }

    hideAll() {
        Object.keys(this._cells).forEach(k => this._cells[k] = 'hidden');
    }

    resetToHidden() {
        // Mark visible → explored, keep explored as explored
        Object.keys(this._cells).forEach(k => {
            if (this._cells[k] === 'visible') this._cells[k] = 'explored';
        });
    }

    hide(col, row) {
        const key = `${col},${row}`;
        if (this._cells[key] !== undefined) this._cells[key] = 'hidden';
    }

    getState(col, row) {
        return this._cells[`${col},${row}`] || 'hidden';
    }

    isVisible(col, row) {
        return this._cells[`${col},${row}`] === 'visible';
    }

    /** Toggle a single cell between revealed and hidden (DM tool) */
    toggleCell(col, row) {
        const key = `${col},${row}`;
        const s = this._cells[key];
        this._cells[key] = (s === 'hidden' || s === 'explored') ? 'visible' : 'hidden';
    }

    /** Brush: reveal a circular area of cells */
    paintReveal(col, row, brushRadius = 1) {
        for (let dc = -brushRadius; dc <= brushRadius; dc++) {
            for (let dr = -brushRadius; dr <= brushRadius; dr++) {
                const nc = col + dc, nr = row + dr;
                if (nc >= 0 && nr >= 0 && nc < this.grid.cols && nr < this.grid.rows) {
                    if (Math.abs(dc) <= brushRadius && Math.abs(dr) <= brushRadius) {
                        this.reveal(nc, nr);
                    }
                }
            }
        }
    }

    paintHide(col, row, brushRadius = 1) {
        for (let dc = -brushRadius; dc <= brushRadius; dc++) {
            for (let dr = -brushRadius; dr <= brushRadius; dr++) {
                const nc = col + dc, nr = row + dr;
                if (nc >= 0 && nr >= 0 && nc < this.grid.cols && nr < this.grid.rows) {
                    this.hide(nc, nr);
                }
            }
        }
    }

    /* ── Rendering ──────────────────────────────────────────────── */

    resize(width, height) {
        this.canvas.width  = width;
        this.canvas.height = height;
    }

    render(zoom = 1, panX = 0, panY = 0) {
        if (!this.enabled) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const ctx = this.ctx;
        const cs  = this.grid.cellSize * zoom;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let c = 0; c < this.grid.cols; c++) {
            for (let r = 0; r < this.grid.rows; r++) {
                const state = this._cells[`${c},${r}`];
                const x = c * cs + panX;
                const y = r * cs + panY;

                if (state === 'hidden') {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
                    ctx.fillRect(x, y, cs, cs);
                } else if (state === 'explored') {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
                    ctx.fillRect(x, y, cs, cs);
                }
                // 'visible' → leave transparent (no fill)
            }
        }
    }

    /* ── Vision Integration ─────────────────────────────────────── */

    /**
     * Update visibility from token positions + their visionRange.
     * Called each frame when tokens move.
     */
    updateFromTokens(tokens, gridEngine) {
        // Mark currently visible cells as explored
        this.resetToHidden();

        tokens.forEach(token => {
            if (token.type === 'player' || token.isDM) {
                const cellX = Math.floor(token.x / gridEngine.cellSize);
                const cellY = Math.floor(token.y / gridEngine.cellSize);
                const radiusCells = Math.ceil(token.visionRange / gridEngine.feetPerCell);
                this.revealCircle(cellX, cellY, radiusCells);
            }
        });
    }

    /* ── Serialization ──────────────────────────────────────────── */

    serialize() {
        return {
            enabled: this.enabled,
            cells: { ...this._cells }
        };
    }

    load(data = {}) {
        this.enabled = data.enabled !== undefined ? data.enabled : true;
        if (data.cells) {
            // Merge saved cells with current grid size
            Object.keys(data.cells).forEach(k => {
                if (this._cells[k] !== undefined) this._cells[k] = data.cells[k];
            });
        }
    }
}
