import { Component } from '../core/Component.js';
import { TacticalMapEngine } from './TacticalMapEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { Toast } from './Toast.js';
import { InitiativeMonitor } from './InitiativeMonitor.js';

export class TacticalEyeModal extends Component {
    constructor(opts) {
        super(opts);
        this.mapEngine = null;
        this.mapUrl = this.store.state.mapUrl || '';
        this.fog = this.store.state.mapFog || false;
        this.grid = this.store.state.mapGrid || false;
        this.broadcast = new BroadcastChannel('tome_map');
        this.fogPaths = []; // Mantenha as revelações de névoa da sessão
        this.sidebarOpen = false;
        this.activeTool = 'pan'; // pan | eraser
    }

    template() {
        return `
            <div class="tactical-eye-modal animate-fadeIn" style="position: fixed; inset: 0; background: #080a0d; z-index: 10000; overflow: hidden; display: flex;">
                
                <!-- Drawer Lateral (Sidebar) -->
                <div style="width: ${this.sidebarOpen ? '420px' : '0'}; background: rgba(15,20,28,0.95); border-right: ${this.sidebarOpen ? '1px solid rgba(197, 160, 89, 0.4)' : 'none'}; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 2px 0 15px rgba(0,0,0,0.5); z-index: 20;">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; min-width: 420px;">
                        <h3 style="margin: 0; font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--accent);">Gaveta Tática</h3>
                        <button class="btn btn-ghost" data-action="toggleSidebar" style="padding: 4px; color: #94a3b8;"><i class="fa-solid fa-times"></i></button>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; flex: 1; overflow: hidden; min-width: 420px;">
                        <div style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); max-height: 150px; overflow-y: auto;" class="custom-scroll">
                            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px; text-transform: uppercase; font-weight: bold;">Posicionamento (Colocar no Mapa)</div>
                            <div id="drawer-tokens" style="display: flex; flex-direction: column; gap: 4px;">
                                ${this._renderDrawerTokens()}
                            </div>
                        </div>

                        <div id="tactical-initiative-container" style="flex: 1; overflow: hidden; position: relative; background: rgba(0,0,0,0.2);">
                            <!-- Initiative Monitor mounts here -->
                        </div>
                    </div>
                </div>

                <!-- Main Area -->
                <div style="flex: 1; position: relative;">
                    <!-- Floating Top Toolbar -->
                    <div style="position: absolute; top: 15px; left: 15px; right: 15px; z-index: 10; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none;">
                        
                        <!-- Left Group: Title & Map Settings -->
                        <div style="display: flex; gap: 15px; align-items: flex-start;">
                            <button class="btn btn-primary" data-action="toggleSidebar" style="pointer-events: auto; padding: 12px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                                <i class="fa-solid fa-bars"></i>
                            </button>

                            <div style="background: rgba(15,20,28,0.9); padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(197, 160, 89, 0.3); pointer-events: auto; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); backdrop-filter: blur(10px);">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 32px; height: 32px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #10b981;">
                                        <i class="fa-solid fa-map-location-dot"></i>
                                    </div>
                                    <h2 style="margin: 0; font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--accent);">Olho do Mestre</h2>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="map-url-input" class="form-input" style="width: 200px; padding: 6px 10px; font-size: 0.8rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white;" placeholder="URL do Mapa..." value="${this.mapUrl}">
                                    <button class="btn btn-ghost" data-action="applyMapUrl" style="padding: 6px 10px; border: 1px solid rgba(255,255,255,0.2);"><i class="fa-solid fa-check"></i></button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Group: Actions & Sync -->
                        <div style="display: flex; gap: 10px; pointer-events: auto;">
                            <button class="btn btn-secondary" data-action="syncToSpectator" style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #047857); color: white; border-radius: 12px; border: none; font-weight: bold; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">
                                <i class="fa-solid fa-satellite-dish" style="margin-right: 5px;"></i> Sincronizar Telão
                            </button>
                            <button class="btn btn-danger" data-action="closeModal" style="padding: 10px 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                                <i class="fa-solid fa-times"></i> Fechar
                            </button>
                        </div>
                    </div>

                    <!-- Floating Tool Palette (Bottom Center) -->
                    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; background: rgba(15,20,28,0.9); padding: 8px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); pointer-events: auto; display: flex; gap: 5px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); backdrop-filter: blur(10px);">
                        <button class="tool-btn ${this.activeTool === 'pan' ? 'active' : ''}" data-action="setToolPan" title="Mover Câmera / Tokens (V)">
                            <i class="fa-solid fa-hand"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool === 'eraser' ? 'active' : ''}" data-action="setToolEraser" title="Pincel Revelador de Névoa (E)">
                            <i class="fa-solid fa-eraser"></i>
                        </button>
                        <div style="width: 1px; background: rgba(255,255,255,0.1); margin: 0 5px;"></div>
                        <button class="tool-btn ${this.grid ? 'active-green' : ''}" data-action="toggleGrid" title="Grade (G)">
                            <i class="fa-solid fa-border-all"></i>
                        </button>
                        <button class="tool-btn ${this.fog ? 'active-purple' : ''}" data-action="toggleFog" title="Névoa de Guerra (F)">
                            <i class="fa-solid fa-cloud"></i>
                        </button>
                    </div>

                    <!-- Estilos para Tool Palette -->
                    <style>
                        .tool-btn {
                            width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                        }
                        .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                        .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); }
                        .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; }
                        .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; }
                    </style>

                    <!-- Map Container -->
                    <div id="dm-map-container" style="position: absolute; inset: 0;"></div>
                    
                    ${!this.mapUrl ? `
                        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); pointer-events: none; z-index: 5;">
                            <i class="fa-solid fa-map" style="font-size: 4rem; margin-bottom: 20px;"></i>
                            <h3 style="font-family: 'Cinzel', serif; margin: 0; font-size: 1.5rem;">Nenhum Mapa Carregado</h3>
                            <p style="font-size: 0.9rem; max-width: 400px; text-align: center; margin-top: 10px;">Insira a URL na barra superior e pressione o <i class="fa-solid fa-check"></i>.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderDrawerTokens() {
        const order = this.store.state.initiativeOrder || [];
        if (order.length === 0) return '<div style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 20px 0;">Fila de iniciativa vazia.</div>';
        
        return order.map(c => {
            const isEnemy = c.type !== 'Player';
            let avatar = c.img || c.portraitData || null;
            if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
            if (avatar && avatar.startsWith('db://')) avatar = null;
            
            const color = isEnemy ? '#ef4444' : '#3b82f6';
            
            return `
                <div class="drawer-token-item" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; transition: background 0.2s;" data-action="placeToken" data-id="${c.id}">
                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${color}; background-color: ${color}; background-image: url('${avatar || ''}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                        ${!avatar ? `<span style="color: white; font-size: 0.8rem; font-weight: bold;">${c.name.substring(0,1).toUpperCase()}</span>` : ''}
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-size: 0.85rem; color: #e2e8f0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${c.name}</div>
                        <div style="font-size: 0.7rem; color: #64748b;">${c.hp !== undefined ? `HP: ${c.hp}` : ''}</div>
                    </div>
                    <button class="btn btn-ghost" style="padding: 4px; font-size: 0.8rem;" title="Colocar no Mapa"><i class="fa-solid fa-crosshairs"></i></button>
                </div>
            `;
        }).join('');
    }

    onMount() {
        this.mapEngine = new TacticalMapEngine('dm-map-container', {
            width: window.innerWidth, // Drawer sits on top visually but flex layout handles width logic manually via CSS
            height: window.innerHeight,
            isDM: true
        });

        // Initialize Map state
        if (this.mapUrl) this.mapEngine.setMapUrl(this.mapUrl);
        if (this.grid) this.mapEngine.setGrid(true, '1.5m');
        if (this.fog) this.mapEngine.setFog({ enabled: true, paths: this.fogPaths });

        // Monta o InitiativeMonitor na gaveta!
        const initContainer = this.$('#tactical-initiative-container');
        if (initContainer) {
            initContainer.innerHTML = '';
            this._initiativeMonitor = new InitiativeMonitor({ store: this.store });
            this._initiativeMonitor.mount(initContainer);
            this._initiativeMonitor.element.parentNode.__component = this._initiativeMonitor;
        }

        // Event Listeners for Map Engine Events
        this._cameraUpdateHandler = (e) => {
            const { x, y, scale } = e.detail;
            this.broadcast.postMessage({
                type: 'CAMERA_UPDATE',
                data: { x, y, scale }
            });
        };
        window.addEventListener('tome:camera_update', this._cameraUpdateHandler);

        this._fogPathHandler = (e) => {
            const { points } = e.detail;
            this.fogPaths.push(points); // Save to session
            this.broadcast.postMessage({
                type: 'FOG_PATH_UPDATE',
                data: { points }
            });
        };
        window.addEventListener('tome:fog_path', this._fogPathHandler);

        this._tokenMoveHandler = (e) => {
            const { id, x, y } = e.detail;
            this.broadcast.postMessage({
                type: 'DELTA_UPDATE',
                deltaType: 'TOKEN_MOVE',
                data: { id, x, y }
            });
        };
        window.addEventListener('tome:token_moved', this._tokenMoveHandler);

        // Right click to ping (only if not drawing)
        const container = this.$('#dm-map-container');
        if (container) {
            container.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (this.activeTool === 'eraser') return; // Prevent ping while erasing
                const stage = this.mapEngine.stage;
                const pointer = stage.getPointerPosition();
                if (pointer) {
                    // Transform based on stage scale and pos
                    const transform = stage.getAbsoluteTransform().copy();
                    transform.invert();
                    const relPos = transform.point(pointer);
                    this.mapEngine.showPing(relPos.x, relPos.y, '#10b981');
                    this.broadcast.postMessage({
                        type: 'PING',
                        position: { x: relPos.x, y: relPos.y },
                        color: '#10b981'
                    });
                }
            });
        }

        this._resizeHandler = () => {
            if (this.mapEngine) {
                // Determine width based on sidebar
                const w = window.innerWidth;
                this.mapEngine.resize(w, window.innerHeight);
            }
        };
        window.addEventListener('resize', this._resizeHandler);

        // Load tokens
        this._loadTokensFromStore();
    }

    onUnmount() {
        if (this.broadcast) {
            this.broadcast.close();
            this.broadcast = null;
        }
        if (this._cameraUpdateHandler) window.removeEventListener('tome:camera_update', this._cameraUpdateHandler);
        if (this._fogPathHandler) window.removeEventListener('tome:fog_path', this._fogPathHandler);
        if (this._tokenMoveHandler) window.removeEventListener('tome:token_moved', this._tokenMoveHandler);
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    }

    onStoreUpdate() {
        // Redraw sidebar if initiative changed
        const sidebar = this.$('#drawer-tokens');
        if (sidebar) sidebar.innerHTML = this._renderDrawerTokens();
        // Also ensure engine has them
        this._loadTokensFromStore();
    }

    _loadTokensFromStore() {
        const order = this.store.state.initiativeOrder || [];
        const tokensArray = order.map((c, i) => {
            const isEnemy = c.type !== 'Player';
            let avatar = c.img || c.portraitData || null;
            if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
            if (avatar && avatar.startsWith('db://')) { avatar = null; }

            const existing = this.mapEngine?.tokens.get(c.id);
            const size = c.size === 'Grande' ? 50 : (c.size === 'Enorme' ? 75 : 25);
            
            return {
                id: c.id,
                name: c.name,
                avatar: avatar,
                color: isEnemy ? '#ef4444' : '#3b82f6', 
                size: size,
                x: existing ? existing.x() : 100 + (i * 60) % 500, 
                y: existing ? existing.y() : 100 + Math.floor(i / 8) * 60
            };
        });

        if (this.mapEngine) {
            this.mapEngine.updateTokens(tokensArray);
        }
    }

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        this.render();
    }

    setToolPan() {
        this.activeTool = 'pan';
        this.mapEngine.setTool('pan');
        this.render('Palette'); // re-render só estilos
    }

    setToolEraser() {
        this.activeTool = 'eraser';
        this.mapEngine.setTool('eraser');
        this.render('Palette'); // re-render só estilos
    }

    render_Palette() {
        // Simple re-render logic to update active buttons without full redraw
        this.render(); 
    }

    applyMapUrl() {
        const url = this.$('#map-url-input').value.trim();
        this.mapUrl = url;
        this.store.update(s => { s.mapUrl = url; });
        this.mapEngine.setMapUrl(url);
        Toast.show('Mapa atualizado.', 'info');
        this.render(); 
    }

    toggleGrid() {
        this.grid = !this.grid;
        this.store.update(s => { s.mapGrid = this.grid; });
        this.mapEngine.setGrid(this.grid, '1.5m');
        this.render(); 
    }

    toggleFog() {
        this.fog = !this.fog;
        this.store.update(s => { s.mapFog = this.fog; });
        if (this.fog) {
            this.mapEngine.setFog({ enabled: true, paths: this.fogPaths });
        } else {
            this.mapEngine.setFog({ enabled: false });
        }
        this.render(); 
    }

    placeToken(e, el) {
        const id = el.dataset.id;
        const stage = this.mapEngine.stage;
        
        // Posição no centro da visão atual
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const centerView = transform.point({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        
        const group = this.mapEngine.tokens.get(id);
        if (group) {
            group.to({ x: centerView.x, y: centerView.y, duration: 0.5, easing: Konva.Easings.ElasticEaseOut });
            
            // Sync move
            const evt = new CustomEvent('tome:token_moved', {
                detail: { id: id, x: centerView.x, y: centerView.y }
            });
            window.dispatchEvent(evt);
            
            Toast.show('Token movido para o centro da tela.', 'info');
        }
    }

    syncToSpectator() {
        if (!this.mapEngine) return;

        const currentTokens = Array.from(this.mapEngine.tokens.values()).map(g => {
            const textNode = g.findOne('Text');
            const circleNode = g.findOne('Circle');
            return {
                id: g.id(),
                x: g.x(),
                y: g.y(),
                name: textNode ? textNode.text() : 'Token',
                size: circleNode ? circleNode.radius() * 2 : 50,
                color: circleNode ? circleNode.fill() : '#ffffff',
            };
        });
        
        const order = this.store.state.initiativeOrder || [];
        const enrichedTokens = currentTokens.map(ct => {
            const c = order.find(o => o.id === ct.id);
            if (c) {
                const isEnemy = c.type !== 'Player';
                let avatar = c.img || c.portraitData || null;
                if (isEnemy && !avatar) avatar = MonsterArt.getImage(c);
                if (avatar && !avatar.startsWith('db://')) ct.avatar = avatar;
            }
            return ct;
        });

        this.broadcast.postMessage({
            type: 'MAP_UPDATE',
            mapUrl: this.mapUrl,
            fog: { enabled: this.fog, paths: this.fogPaths },
            gridActive: this.grid,
            gridScale: '1.5m',
            tokens: enrichedTokens
        });
        
        // Também sincronizar câmera atual imediatamente
        this.broadcast.postMessage({
            type: 'CAMERA_UPDATE',
            data: { 
                x: this.mapEngine.stage.x(), 
                y: this.mapEngine.stage.y(), 
                scale: this.mapEngine.stage.scaleX() 
            }
        });
        
        Toast.show('Sincronização cinematográfica ativada!', 'success');
    }

    closeModal() {
        this.unmount();
        this.element.remove();
    }
}
