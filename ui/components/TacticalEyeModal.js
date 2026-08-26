import { Component } from '../core/Component.js';
import { TacticalMapEngine } from './TacticalMapEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { Toast } from './Toast.js';
import { h, render } from 'preact';
import { InitiativeMonitor } from './InitiativeMonitor.jsx';

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
        this.activeTool = 'pan'; // pan | eraser | wall
        this.dynamicLighting = false;
    }

    template() {
        return `
            <div class="fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex animate-fadeIn font-outfit text-slate-200">
                
                <!-- Drawer Lateral (Sidebar) -->
                <div class="flex flex-col bg-black/80 border-r border-accent/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md"
                     style="width: ${this.sidebarOpen ? '420px' : '0'}; border-right-width: ${this.sidebarOpen ? '1px' : '0'};">
                    
                    <!-- Header da Gaveta -->
                    <div class="p-4 border-b border-white/5 flex justify-between items-center min-w-[420px]">
                        <h3 class="m-0 font-cinzel text-lg text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]">Gaveta Tática</h3>
                        <button class="btn btn-ghost p-2 text-slate-400 hover:text-white" data-action="toggleSidebar">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="flex flex-col flex-1 overflow-hidden min-w-[420px]">
                        <!-- Posicionamento Rápido -->
                        <div class="px-4 py-3 border-b border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar">
                            <div class="text-[0.65rem] text-slate-400 mb-2 uppercase font-extrabold tracking-widest">Posicionamento (Colocar no Mapa)</div>
                            <div id="drawer-tokens" class="flex flex-col gap-1.5">
                                ${this._renderDrawerTokens()}
                            </div>
                        </div>

                        <!-- Iniciativa Monitor -->
                        <div id="tactical-initiative-container" class="flex-1 overflow-hidden relative bg-black/20">
                            <!-- Initiative Monitor mounts here -->
                        </div>
                    </div>
                </div>

                <!-- Main Area -->
                <div class="flex-1 relative">
                    <!-- Floating Top Toolbar -->
                    <div class="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                        
                        <!-- Left Group: Title & Map Settings -->
                        <div class="flex gap-4 items-start">
                            <button class="btn btn-primary pointer-events-auto p-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]" data-action="toggleSidebar">
                                <i class="fa-solid fa-bars"></i>
                            </button>

                            <div class="bg-black/80 p-3 px-5 rounded-xl border border-accent/30 pointer-events-auto flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center text-emerald-500 text-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                        <i class="fa-solid fa-map-location-dot"></i>
                                    </div>
                                    <h2 class="m-0 font-cinzel text-lg text-accent tracking-widest">Olho do Mestre</h2>
                                </div>
                                <div class="flex gap-2">
                                    <input type="text" id="map-url-input" class="w-[200px] py-1.5 px-3 text-sm bg-black/50 border border-white/20 rounded-lg text-white outline-none focus:border-accent" placeholder="URL do Mapa..." value="${this.mapUrl}">
                                    <button class="btn btn-ghost py-1.5 px-3 border border-white/20 text-slate-300 hover:text-white" data-action="applyMapUrl">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Group: Actions & Sync -->
                        <div class="flex gap-3 pointer-events-auto">
                            <button class="btn bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl border-none shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]" data-action="syncToSpectator">
                                <i class="fa-solid fa-satellite-dish mr-2"></i> Sincronizar Telão
                            </button>
                            <button class="btn bg-red-900/80 text-white font-bold px-4 py-2.5 rounded-xl border border-red-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:bg-red-800" data-action="closeModal">
                                <i class="fa-solid fa-times mr-2"></i> Fechar
                            </button>
                        </div>
                    </div>

                    <!-- Floating Tool Palette (Bottom Center) -->
                    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/80 p-2 rounded-2xl border border-white/10 pointer-events-auto flex gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        <button class="tool-btn ${this.activeTool === 'pan' ? 'active' : ''}" data-action="setToolPan" title="Mover Câmera / Tokens (V)">
                            <i class="fa-solid fa-hand"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool === 'eraser' ? 'active' : ''}" data-action="setToolEraser" title="Pincel Revelador de Névoa (E)">
                            <i class="fa-solid fa-eraser"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool === 'wall' ? 'active' : ''}" data-action="setToolWall" title="Desenhar Parede Oculta (W)">
                            <i class="fa-solid fa-layer-group"></i>
                        </button>
                        <div class="w-px bg-white/10 mx-1"></div>
                        <button class="tool-btn ${this.grid ? 'active-green' : ''}" data-action="toggleGrid" title="Grade (G)">
                            <i class="fa-solid fa-border-all"></i>
                        </button>
                        <button class="tool-btn ${this.fog ? 'active-purple' : ''}" data-action="toggleFog" title="Névoa de Guerra (F)">
                            <i class="fa-solid fa-cloud"></i>
                        </button>
                        <button class="tool-btn ${this.dynamicLighting ? 'active-yellow' : ''}" data-action="toggleDynamicLighting" title="Iluminação Dinâmica (L)">
                            <i class="fa-solid fa-lightbulb"></i>
                        </button>
                    </div>

                    <!-- Estilos para Tool Palette -->
                    <style>
                        .tool-btn {
                            width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                        }
                        .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                        .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); box-shadow: 0 0 10px rgba(197,160,89,0.2); }
                        .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
                        .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.2); }
                        .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.2); }
                    </style>

                    <!-- Map Container -->
                    <div id="dm-map-container" class="absolute inset-0"></div>
                    
                    ${!this.mapUrl ? `
                        <div class="absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none z-[5]">
                            <i class="fa-solid fa-map text-6xl mb-5 drop-shadow-lg"></i>
                            <h3 class="font-cinzel m-0 text-2xl tracking-widest">Nenhum Mapa Carregado</h3>
                            <p class="text-sm max-w-md text-center mt-3 bg-black/40 p-3 rounded-lg border border-white/5">Insira a URL na barra superior e pressione o <i class="fa-solid fa-check text-accent mx-1"></i>.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderDrawerTokens() {
        const order = this.store.state.initiativeOrder || [];
        if (order.length === 0) return '<div class="text-slate-500 text-xs text-center py-5 font-bold">Fila de iniciativa vazia.</div>';
        
        return order.map(c => {
            const isEnemy = c.type !== 'Player';
            let avatar = c.img || c.portraitData || null;
            if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
            if (avatar && avatar.startsWith('db://')) avatar = null;
            
            const color = isEnemy ? 'border-red-500 bg-red-500/20' : 'border-blue-500 bg-blue-500/20';
            const colorHex = isEnemy ? '#ef4444' : '#3b82f6';
            
            return `
                <div class="flex items-center gap-2.5 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group" data-action="placeToken" data-id="${c.id}">
                    <div class="w-8 h-8 rounded-full border-2 ${color} bg-cover bg-center flex items-center justify-center overflow-hidden shadow-md" style="${avatar ? `background-image: url('${avatar}');` : ''}">
                        ${!avatar ? `<span class="text-white text-xs font-bold font-cinzel" style="color: ${colorHex}">${c.name.substring(0,1).toUpperCase()}</span>` : ''}
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-sm text-slate-200 truncate font-bold font-cinzel">${c.name}</div>
                        <div class="text-[0.65rem] text-slate-500 font-extrabold uppercase tracking-wider">${c.hp !== undefined ? `HP: ${c.hp}` : ''}</div>
                    </div>
                    <button class="btn btn-ghost p-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Colocar no Mapa"><i class="fa-solid fa-crosshairs"></i></button>
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
            this._initiativeMonitor = { unmount: () => render(null, initContainer) };
            render(h(InitiativeMonitor, { store: this.store }), initContainer);
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

            // Drag and Drop (Phase 5 Simbiosis)
            container.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessário para permitir o drop
                e.dataTransfer.dropEffect = 'copy';
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                const dataStr = e.dataTransfer.getData('application/json');
                if (dataStr) {
                    try {
                        const payload = JSON.parse(dataStr);
                        const stage = this.mapEngine.stage;
                        // Força o Konva a ler a posição do mouse no evento de drop nativo
                        stage.setPointersPositions(e); 
                        const pointer = stage.getPointerPosition();
                        if (pointer) {
                            const transform = stage.getAbsoluteTransform().copy();
                            transform.invert();
                            const relPos = transform.point(pointer);
                            
                            if (payload.type === 'spell') {
                                this.mapEngine.showSpellEffect(relPos.x, relPos.y, '#9c27b0', 'spell'); // Partículas roxas
                                
                                // Áudio Espacial
                                const center = this._getStageCenter(transform);
                                if (window.TOME && window.TOME.audio) {
                                    window.TOME.audio.playSpatialSFX('https://freesound.org/data/previews/404/404764_118613-lq.mp3', relPos.x, relPos.y, center.x, center.y, this.mapEngine.stage.scaleX());
                                }

                                if (window.TOME && window.TOME.events) {
                                    window.TOME.events.emit('SYSTEM_NOTIFICATION', {
                                        text: `${payload.sourceHeroName} invocou ${payload.data.name}!`,
                                        type: 'info'
                                    });
                                }
                            } else if (payload.type === 'attack') {
                                this.mapEngine.showSpellEffect(relPos.x, relPos.y, '#ef4444', 'attack'); // Partículas vermelhas
                                
                                // Áudio Espacial
                                const center = this._getStageCenter(transform);
                                if (window.TOME && window.TOME.audio) {
                                    window.TOME.audio.playSpatialSFX('https://freesound.org/data/previews/415/415209_5121236-lq.mp3', relPos.x, relPos.y, center.x, center.y, this.mapEngine.stage.scaleX());
                                }

                                if (window.TOME && window.TOME.events) {
                                    window.TOME.events.emit('SYSTEM_NOTIFICATION', {
                                        text: `${payload.sourceHeroName} atacou com ${payload.data.name}!`,
                                        type: 'warning'
                                    });
                                }
                            }
                        }
                    } catch(err) {
                        console.error('[TacticalEye] Erro ao processar drop:', err);
                    }
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

    _getStageCenter(transform) {
        const viewX = this.mapEngine.stage.x();
        const viewY = this.mapEngine.stage.y();
        const viewScale = this.mapEngine.stage.scaleX();
        const centerX = -viewX / viewScale + (window.innerWidth / 2) / viewScale;
        const centerY = -viewY / viewScale + (window.innerHeight / 2) / viewScale;
        return { x: centerX, y: centerY };
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

    setToolWall() {
        this.activeTool = 'wall';
        this.mapEngine.setTool('wall');
        this.render('Palette');
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

    toggleDynamicLighting() {
        this.dynamicLighting = !this.dynamicLighting;
        this.mapEngine.setDynamicLightingEnabled(this.dynamicLighting);
        if (this.dynamicLighting && !this.fog) {
            // Se ativou luz dinâmica, é necessário ativar a névoa!
            this.fog = true;
            this.store.update(s => { s.mapFog = true; });
            this.mapEngine.setFog({ enabled: true, paths: this.fogPaths });
        }
        this.render('Palette');
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
