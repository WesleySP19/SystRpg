import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { GridEngine } from '../../engine/GridEngine.js';
import { TokenEngine, CONDITIONS, TOKEN_SIZES } from '../../engine/TokenEngine.js';
import { FogEngine } from '../../engine/FogEngine.js';
import { EffectEngine, EFFECT_COLORS } from '../../engine/EffectEngine.js';
import { VisionEngine } from '../../engine/VisionEngine.js';
import { ReferencePanel } from '../../engine/ReferencePanel.js';

const TOOLS = ['select', 'measure', 'fog', 'sphere', 'cone', 'cube', 'wall', 'erase'];
const TOOL_ICONS = {
    select: 'fa-mouse-pointer', measure: 'fa-ruler-combined', fog: 'fa-cloud', 
    sphere: 'fa-circle-dot', cone: 'fa-triangle', cube: 'fa-square', 
    wall: 'fa-ban', erase: 'fa-eraser'
};

/**
 * MAP MANAGER v6.5 — "THE ARCHITECT'S CINEMA"
 * High-performance, production-grade VTT engine with cinematic overlays.
 */
export class MapManager extends Component {
    constructor(opts) {
        super(opts);
        const saved = this.store.state.tacticalMap || {};
        this._grid = saved.grid ? GridEngine.deserialize(saved.grid) : new GridEngine({ cellSize: 60, cols: 28, rows: 18 });
        this._tokens = saved.tokens ? TokenEngine.deserialize(saved.tokens) : new TokenEngine();
        
        this._tool = 'select';
        this._zoom = 1;
        this._pan = { x: 0, y: 0 };
        this._selectedTokenId = null;
        this._fogEnabled = false;
        this._dirty = true;
        this._mapUrl = this.store.state.currentMap || '';
        
        this._vision = new VisionEngine(this._grid);
    }

    template() {
        const st = this.store.state;
        const tokens = this._tokens.getAllTokens();
        const sel = this._selectedTokenId ? this._tokens.getToken(this._selectedTokenId) : null;
        const initiativeOrder = st.initiativeOrder || [];
        const currentCombatant = initiativeOrder[st.initiativeIndex || 0];

        return `
            <div class="tmap-root animate-fadeIn">
                <main class="tmap-body">
                    <!-- LEFT: TOKEN LIBRARY & ACTIVE TOKENS -->
                    <aside class="tmap-sidebar-left scrollbar-custom">
                        <div class="tmap-panel-title"><i class="fa-solid fa-chess-knight"></i> NO MAPA</div>
                        <div class="tmap-token-list">
                            ${tokens.map(t => this._renderTokenListItem(t)).join('') || '<div class="empty-hint">Nenhum token ativo</div>'}
                        </div>
                        
                        <div class="tmap-panel-title" style="margin-top:25px;"><i class="fa-solid fa-plus"></i> BIBLIOTECA</div>
                        <div class="tmap-add-scroll">
                            ${[...(st.players || []), ...(st.monsters || [])].map(e => `
                                <button class="btn btn-ghost btn-block btn-sm" style="margin-bottom:8px; text-align:left; justify-content:flex-start;" data-action="addToken" data-id="${e.id}">
                                    <i class="fa-solid ${e.type === 'Player' ? 'fa-user' : 'fa-skull'}"></i> ${e.name}
                                </button>
                            `).join('')}
                        </div>
                    </aside>

                    <!-- CENTER: TACTICAL GRID (CANVAS) -->
                    <section class="tmap-canvas-wrap" id="tmap-wrap">
                        <canvas id="tmap-grid" class="tmap-canvas-layer"></canvas>
                        <canvas id="tmap-fog" class="tmap-canvas-layer"></canvas>
                        <svg id="tmap-svg" class="tmap-canvas-layer" style="pointer-events:none;"></svg>
                        <div id="tmap-tokens" class="tmap-canvas-layer" style="pointer-events:none;"></div>
                        
                        <!-- FLOATING TOOLBAR -->
                        <div class="tmap-tools-floating">
                            ${TOOLS.map(t => `
                                <button class="tmap-tool-btn ${this._tool === t ? 'active' : ''}" 
                                        data-action="setTool" data-tool="${t}" title="${t.toUpperCase()}">
                                    <i class="fa-solid ${TOOL_ICONS[t]}"></i>
                                </button>
                            `).join('')}
                            <div class="side-sep" style="margin:5px 0; border-color:rgba(255,255,255,0.1);"></div>
                            <button class="tmap-tool-btn ${this._fogEnabled ? 'active' : ''}" data-action="toggleFog"><i class="fa-solid fa-eye-slash"></i></button>
                            <button class="tmap-tool-btn" data-action="uploadMap"><i class="fa-solid fa-map"></i></button>
                        </div>

                        <!-- ZOOM CONTROLS -->
                        <div class="tmap-zoom-ctrl">
                            <button data-action="zoomIn"><i class="fa-solid fa-plus"></i></button>
                            <button data-action="resetView"><i class="fa-solid fa-house"></i></button>
                            <button data-action="zoomOut"><i class="fa-solid fa-minus"></i></button>
                        </div>
                        
                        <!-- MEASURE HUD -->
                        <div id="tmap-measure-hud" class="tmap-measure-hud" style="display:none;"></div>

                        <!-- BOTTOM COMMAND DECK -->
                        <footer class="tmap-command-deck animate-slideUp">
                            <div class="tmap-deck-status ${st.combatActive ? 'active' : ''}">
                                ${st.combatActive ? `⚔️ RODADA ${st.combatRound || 1} • TURNO DE ${currentCombatant?.name.toUpperCase() || '...'}` : '📜 EXPLORAÇÃO LIVRE'}
                            </div>
                            <div class="deck-actions" style="display:flex; gap:12px;">
                                ${st.combatActive ? `
                                    <button class="btn btn-primary btn-sm" data-action="nextTurn">PRÓXIMO TURNO</button>
                                    <button class="btn btn-danger btn-sm" data-action="endCombat">PARAR</button>
                                ` : `
                                    <button class="btn btn-primary btn-sm" data-action="startCombat">INICIAR COMBATE</button>
                                `}
                            </div>
                        </footer>
                    </section>

                    <!-- RIGHT: INSPECTOR & REFERENCE -->
                    <aside class="tmap-sidebar-right scrollbar-custom">
                        ${sel ? this._renderSelectedPanel(sel) : this._renderMapReference()}
                    </aside>
                </main>
            </div>
        `;
    }

    _renderTokenListItem(t) {
        const isSel = t.id === this._selectedTokenId;
        const hpPct = Math.round((t.hp.current / t.hp.max) * 100);
        return `
            <div class="tmap-token-item ${isSel ? 'selected' : ''}" data-action="selectToken" data-id="${t.id}">
                <div class="dot" style="background-image: url('${t.img || ''}')"></div>
                <div style="flex:1; min-width:0;">
                    <div class="name truncate" style="font-size:0.8rem; font-weight:700;">${t.name}</div>
                    <div style="height:3px; background:rgba(0,0,0,0.3); margin-top:4px; border-radius:2px;">
                        <div style="width:${hpPct}%; height:100%; background:${TokenEngine.hpColor(hpPct)}; border-radius:2px;"></div>
                    </div>
                </div>
                <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" data-action="removeToken" data-id="${t.id}">✕</button>
            </div>
        `;
    }

    _renderSelectedPanel(sel) {
        const hpPct = Math.round((sel.hp.current / sel.hp.max) * 100);
        const hpCol = TokenEngine.hpColor(hpPct);
        return `
            <div class="tmap-panel-title"><i class="fa-solid fa-crosshairs"></i> INSPEÇÃO</div>
            <div class="sel-card animate-scale" style="background:rgba(255,255,255,0.02); border-radius:15px; padding:20px; border:1px solid rgba(255,255,255,0.05);">
                <div style="width:100%; aspect-ratio:1; border-radius:12px; background:url('${sel.img || ''}') center/cover; border:2px solid ${sel.type==='monster'?'var(--danger)':'var(--info)'}; margin-bottom:15px; box-shadow:0 10px 20px rgba(0,0,0,0.4);"></div>
                <h3 style="font-family:'Cinzel'; font-size:1.1rem; color:var(--primary); text-align:center; margin-bottom:15px;">${sel.name}</h3>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                    <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; text-align:center;">
                        <span style="font-size:0.5rem; color:var(--text-dim); display:block;">DEFESA (CA)</span>
                        <b style="font-size:1.2rem;">${sel.ac}</b>
                    </div>
                    <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; text-align:center;">
                        <span style="font-size:0.5rem; color:var(--text-dim); display:block;">VELOCIDADE</span>
                        <b style="font-size:1.2rem;">${sel.speed}ft</b>
                    </div>
                </div>

                <div class="hp-controls">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="font-size:0.7rem; font-weight:800;">VITALIDADE</span>
                        <b style="color:${hpCol}">${sel.hp.current} / ${sel.hp.max}</b>
                    </div>
                    <div style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden; margin-bottom:15px;">
                        <div style="width:${hpPct}%; height:100%; background:${hpCol}; transition:width 0.3s;"></div>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button class="btn btn-danger btn-block btn-sm" data-action="dmgToken">DANO</button>
                        <input id="hp-mod" type="number" class="form-input" value="5" style="width:50px; text-align:center;">
                        <button class="btn btn-success btn-block btn-sm" data-action="healToken">CURA</button>
                    </div>
                </div>
            </div>
        `;
    }

    _renderMapReference() {
        return `
            <div class="tmap-panel-title"><i class="fa-solid fa-book"></i> REFERÊNCIA TÁTICA</div>
            <div id="tmap-refpanel"></div>
        `;
    }

    /* ── CORE LOGIC (CANVAS & EVENTS) ────────────────────────────── */

    onMount() {
        this._setupCanvases();
        this._setupEvents();
        this._loadMap(this._mapUrl);
        this._startLoop();
        this._mountRef();
        
        const fi = this.$('#map-file');
        if (fi) fi.onchange = e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = re => this._loadMap(re.target.result);
            r.readAsDataURL(f);
        };
    }

    _setupCanvases() {
        const wrap = this.$('#tmap-wrap');
        if (!wrap) return;
        const W = wrap.clientWidth;
        const H = wrap.clientHeight;
        
        ['tmap-grid', 'tmap-fog'].forEach(id => {
            const c = this.$('#' + id);
            if (c) { c.width = W; c.height = H; }
        });
        
        this._ctxGrid = this.$('#tmap-grid').getContext('2d');
        this._fog = new FogEngine(this.$('#tmap-fog'), this._grid);
    }

    _startLoop() {
        const loop = () => {
            if (this._dirty) {
                this._drawGrid();
                this._drawTokens();
                if (this._fog) this._fog.render(this._zoom, this._pan.x, this._pan.y);
                this._dirty = false;
            }
            this._animId = requestAnimationFrame(loop);
        };
        this._animId = requestAnimationFrame(loop);
    }

    _drawGrid() {
        const ctx = this._ctxGrid;
        if (!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        const cs = this._grid.cellSize * this._zoom;
        const ox = this._pan.x;
        const oy = this._pan.y;

        if (this._mapImg) {
            ctx.drawImage(this._mapImg, ox, oy, (this._grid.cols * this._grid.cellSize) * this._zoom, (this._grid.rows * this._grid.cellSize) * this._zoom);
        }

        ctx.strokeStyle = 'rgba(212,175,55,0.08)';
        ctx.lineWidth = 1;
        for (let c = 0; c <= this._grid.cols; c++) {
            const x = c * cs + ox;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ctx.canvas.height); ctx.stroke();
        }
        for (let r = 0; r <= this._grid.rows; r++) {
            const y = r * cs + oy;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ctx.canvas.width, y); ctx.stroke();
        }
    }

    _drawTokens() {
        const layer = this.$('#tmap-tokens');
        if (!layer) return;
        const tokens = this._tokens.getAllTokens();
        const cs = this._grid.cellSize * this._zoom;
        
        layer.innerHTML = tokens.map(t => {
            const px = t.x * this._zoom + this._pan.x;
            const py = t.y * this._zoom + this._pan.y;
            const sz = cs * (TOKEN_SIZES[t.size]?.cells || 1) * 0.9;
            const hpPct = Math.round((t.hp.current / t.hp.max) * 100);
            const isSel = t.id === this._selectedTokenId;
            const hpCol = TokenEngine.hpColor(hpPct);
            
            return `
                <div class="tmap-tok" style="position:absolute; left:${px}px; top:${py}px; width:${sz}px; height:${sz}px; transform:translate(-50%,-50%); z-index:${isSel?20:10};">
                    <div class="tmap-tok-aura"></div>
                    <div class="tmap-tok-ring ${t.type} ${isSel?'sel':''}" 
                         style="width:100%; height:100%; border-radius:50%; background-image:url('${t.img || ''}'); background-size:cover; border:2px solid rgba(255,255,255,0.2);">
                    </div>
                    <!-- COMPACT HP INDICATOR -->
                    <div style="position:absolute; bottom:-12px; left:10%; width:80%; height:4px; background:rgba(0,0,0,0.6); border-radius:2px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
                        <div style="width:${hpPct}%; height:100%; background:${hpCol}; transition:width 0.3s;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    _setupEvents() {
        const wrap = this.$('#tmap-wrap');
        let isPanning = false, lastX, lastY;

        wrap.onmousedown = e => {
            if (this._tool === 'select') {
                const rect = wrap.getBoundingClientRect();
                const mx = (e.clientX - rect.left - this._pan.x) / this._zoom;
                const my = (e.clientY - rect.top - this._pan.y) / this._zoom;
                const hit = this._tokens.getAllTokens().find(t => Math.abs(t.x - mx) < 30 && Math.abs(t.y - my) < 30);
                if (hit) {
                    this._selectedTokenId = hit.id;
                    this.render();
                } else {
                    isPanning = true;
                    lastX = e.clientX; lastY = e.clientY;
                }
            }
        };

        wrap.onmousemove = e => {
            if (isPanning) {
                this._pan.x += e.clientX - lastX;
                this._pan.y += e.clientY - lastY;
                lastX = e.clientX; lastY = e.clientY;
                this._dirty = true;
            }
        };

        wrap.onmouseup = () => isPanning = false;
        wrap.onwheel = e => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this._zoom = Math.max(0.3, Math.min(3, this._zoom + delta));
            this._dirty = true;
        };
    }

    /* ── ACTIONS ────────────────────────────────────────────────── */
    setTool(e, el) { this._tool = el.dataset.tool; this.render(); }
    toggleFog() { this._fogEnabled = !this._fogEnabled; if(this._fog) this._fog.enabled = this._fogEnabled; this.render(); }
    uploadMap() { this.$('#map-file').click(); }
    
    _loadMap(url) {
        if (!url) return;
        this._mapUrl = url;
        const img = new Image();
        img.onload = () => { this._mapImg = img; this._dirty = true; };
        img.src = url;
    }

    addToken(e, el) {
        const id = el.dataset.id;
        const entity = [...this.store.state.players, ...this.store.state.monsters].find(x => x.id === id);
        if (entity) {
            this._tokens.addToken(entity, 400, 400);
            this._dirty = true; this.render();
            Toast.show(`${entity.name} adicionado ao mapa.`);
        }
    }

    selectToken(e, el) { this._selectedTokenId = el.dataset.id; this.render(); }
    removeToken(e, el) { this._tokens.removeToken(el.dataset.id); this._dirty = true; this.render(); }
    
    dmgToken() {
        const val = parseInt(this.$('#hp-mod').value) || 5;
        this._tokens.modifyHP(this._selectedTokenId, -val);
        this._dirty = true; this.render();
    }
    healToken() {
        const val = parseInt(this.$('#hp-mod').value) || 5;
        this._tokens.modifyHP(this._selectedTokenId, val);
        this._dirty = true; this.render();
    }

    _mountRef() {
        const el = this.$('#tmap-refpanel');
        if (el) {
            const ref = new ReferencePanel({ store: this.store, element: el });
            ref.mount();
        }
    }
}
