import { useState, useEffect, useRef } from 'preact/hooks';
import { TacticalMapEnginePixi } from './TacticalMapEnginePixi.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { Toast } from './Toast.js';
import { InitiativeMonitor } from './InitiativeMonitor.jsx';
import { useStore } from '../core/hooks.js';

export function TacticalEyeModal({ unmount }) {
    const storeState = useStore();
    const initiativeOrder = storeState?.initiativeOrder || [];
    const initialMapUrl = storeState?.mapUrl || '';
    const initialMapFog = storeState?.mapFog || false;
    const initialMapGrid = storeState?.mapGrid || false;

    const [mapUrl, setMapUrl] = useState(initialMapUrl);
    const [fog, setFog] = useState(initialMapFog);
    const [grid, setGrid] = useState(initialMapGrid);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTool, setActiveTool] = useState('pan');
    const [dynamicLighting, setDynamicLighting] = useState(false);
    const [mapUrlInput, setMapUrlInput] = useState(initialMapUrl);

    const mapEngineRef = useRef(null);
    const broadcastRef = useRef(null);
    const fogPathsRef = useRef([]);

    useEffect(() => {
        broadcastRef.current = new BroadcastChannel('tome_map');
        
        let isCancelled = false;
        const initEngine = async () => {
            const mapEngine = new TacticalMapEnginePixi('dm-map-container', {
                width: window.innerWidth,
                height: window.innerHeight,
                isDM: true
            });
            await mapEngine.init(window.innerWidth, window.innerHeight);
            if (isCancelled) {
                mapEngine.destroy();
                return;
            }
            mapEngineRef.current = mapEngine;

            if (initialMapUrl) mapEngine.setMapUrl(initialMapUrl);
            if (initialMapGrid) mapEngine.setGrid(true, '1.5m');
            if (initialMapFog) mapEngine.setFog({ enabled: true, paths: fogPathsRef.current });
            loadTokensFromStore();
        };
        initEngine();

        const handleCameraUpdate = (e) => {
            const { x, y, scale } = e.detail;
            const payload = { type: 'CAMERA_UPDATE', data: { x, y, scale } };
            broadcastRef.current?.postMessage(payload);
            window.TOME?.socket?.emit('map_sync_event', payload);
        };
        window.addEventListener('tome:camera_update', handleCameraUpdate);

        const handleFogPath = (e) => {
            const { points, paths } = e.detail;
            if (paths) fogPathsRef.current = paths;
            else fogPathsRef.current.push(points);

            const payload = { type: 'FOG_UPDATE', data: { points, paths: fogPathsRef.current } };
            broadcastRef.current?.postMessage({ type: 'FOG_PATH_UPDATE', data: { points } });
            window.TOME?.socket?.emit('map_sync_event', payload);
        };
        window.addEventListener('tome:fog_path', handleFogPath);

        const handleTokenMove = (e) => {
            const { id, x, y } = e.detail;
            const payload = { id, x, y };
            broadcastRef.current?.postMessage({
                type: 'DELTA_UPDATE',
                deltaType: 'TOKEN_MOVE',
                data: payload
            });
            window.TOME?.socket?.emit('map_sync_event', {
                type: 'TOKEN_MOVE',
                data: payload
            });
            // Update server persistence on drop
            if (window.TOME?.socket) {
                window.TOME.socket.emit('delta_state_update', {
                    patches: [{ op: 'replace', path: `/tacticalMap/tokens/${id}`, value: { x, y } }]
                });
            }
        };
        window.addEventListener('tome:token_moved', handleTokenMove);

        const handleTokenDragging = (e) => {
            const { id, x, y } = e.detail;
            if (window.TOME?.webrtc) {
                window.TOME.webrtc.broadcast({ type: 'TOKEN_DRAG', id, x, y });
            }
        };
        window.addEventListener('tome:token_dragging', handleTokenDragging);

        const container = document.getElementById('dm-map-container');
        const handleContextMenu = (e) => {
            e.preventDefault();
            if (activeTool === 'eraser') return;
            // PixiJS handling: get local position
            if (mapEngineRef.current && mapEngineRef.current.mapContainer) {
                const rect = container.getBoundingClientRect();
                const pointerX = e.clientX - rect.left;
                const pointerY = e.clientY - rect.top;
                
                const localX = (pointerX - mapEngineRef.current.mapContainer.x) / mapEngineRef.current.mapContainer.scale.x;
                const localY = (pointerY - mapEngineRef.current.mapContainer.y) / mapEngineRef.current.mapContainer.scale.y;

                if (typeof mapEngineRef.current.showPing === 'function') {
                    mapEngineRef.current.showPing(localX, localY, '#10b981');
                }
                const pingData = {
                    type: 'PING',
                    position: { x: localX, y: localY },
                    color: '#10b981'
                };
                broadcastRef.current?.postMessage(pingData);
                window.TOME?.socket?.emit('map_sync_event', pingData);
                if (window.TOME?.webrtc) {
                    window.TOME.webrtc.broadcast({ type: 'PING', x: localX, y: localY, color: '#10b981' });
                }
            }
        };
        const handleDragOver = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        };
        const handleDrop = (e) => {
            e.preventDefault();
            const dataStr = e.dataTransfer.getData('application/json');
            if (dataStr) {
                try {
                    const payload = JSON.parse(dataStr);
                    const stage = mapEngine.app.stage; // Dummy since pixi is different, but context menu handled directly in mapEngine
                    const pointer = {x: 0, y: 0}; // TBD: properly map pointers for drop in Pixi
                    if (pointer) {
                        const transform = stage.getAbsoluteTransform().copy();
                        transform.invert();
                        const relPos = transform.point(pointer);
                        
                        const center = getStageCenter(transform);
                        
                        if (payload.type === 'spell') {
                            mapEngine.showSpellEffect(relPos.x, relPos.y, '#9c27b0', 'spell');
                            if (window.TOME?.audio) {
                                window.TOME.audio.playSpatialSFX('https://freesound.org/data/previews/404/404764_118613-lq.mp3', relPos.x, relPos.y, center.x, center.y, mapEngine.stage.scaleX());
                            }
                            if (window.TOME?.events) {
                                window.TOME.events.emit('SYSTEM_NOTIFICATION', { text: `${payload.sourceHeroName} invocou ${payload.data.name}!`, type: 'info' });
                            }
                        } else if (payload.type === 'attack') {
                            mapEngine.showSpellEffect(relPos.x, relPos.y, '#ef4444', 'attack');
                            if (window.TOME?.audio) {
                                window.TOME.audio.playSpatialSFX('https://freesound.org/data/previews/415/415209_5121236-lq.mp3', relPos.x, relPos.y, center.x, center.y, mapEngine.stage.scaleX());
                            }
                            if (window.TOME?.events) {
                                window.TOME.events.emit('SYSTEM_NOTIFICATION', { text: `${payload.sourceHeroName} atacou com ${payload.data.name}!`, type: 'warning' });
                            }
                        }
                    }
                } catch(err) {
                    console.error('[TacticalEye] Erro ao processar drop:', err);
                }
            }
        };

        if (container) {
            container.addEventListener('contextmenu', handleContextMenu);
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
        }

        const handleResize = () => {
            if (mapEngineRef.current) {
                mapEngineRef.current.resize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            isCancelled = true;
            if (mapEngineRef.current) mapEngineRef.current.destroy();
            if (broadcastRef.current) broadcastRef.current.close();
            window.removeEventListener('tome:camera_update', handleCameraUpdate);
            window.removeEventListener('tome:fog_path', handleFogPath);
            window.removeEventListener('tome:token_moved', handleTokenMove);
            window.removeEventListener('tome:token_dragging', handleTokenDragging);
            window.removeEventListener('resize', handleResize);
            if (container) {
                container.removeEventListener('contextmenu', handleContextMenu);
                container.removeEventListener('dragover', handleDragOver);
                container.removeEventListener('drop', handleDrop);
            }
        };
    }, []);

    useEffect(() => {
        loadTokensFromStore();
    }, [initiativeOrder]);

    const getStageCenter = () => {
        const mapEngine = mapEngineRef.current;
        if (!mapEngine || !mapEngine.mapContainer) return { x: 0, y: 0 };
        const viewX = mapEngine.mapContainer.x;
        const viewY = mapEngine.mapContainer.y;
        const viewScale = mapEngine.mapContainer.scale.x;
        const centerX = -viewX / viewScale + (window.innerWidth / 2) / viewScale;
        const centerY = -viewY / viewScale + (window.innerHeight / 2) / viewScale;
        return { x: centerX, y: centerY };
    };

    const loadTokensFromStore = () => {
        if (!mapEngineRef.current) return;
        
        const tokensArray = initiativeOrder.map((c, i) => {
            const isEnemy = c.type !== 'Player';
            let avatar = c.img || c.portraitData || null;
            if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
            if (avatar && avatar.startsWith('db://')) { avatar = null; }

            const existing = mapEngineRef.current.tokens.get(c.id);
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

        mapEngineRef.current.updateTokens(tokensArray);
    };

    const setTool = (tool) => {
        setActiveTool(tool);
        if (mapEngineRef.current) mapEngineRef.current.setTool(tool);
    };

    const applyMapUrl = () => {
        const url = mapUrlInput.trim();
        setMapUrl(url);
        if (window.TOME?.store) {
            window.TOME.store.update(s => { s.mapUrl = url; });
        }
        if (mapEngineRef.current) mapEngineRef.current.setMapUrl(url);
        window.TOME?.socket?.emit('map_sync_event', {
            type: 'MAP_UPDATE',
            mapUrl: url
        });
        Toast.show('Mapa atualizado.', 'info');
    };

    const toggleGrid = () => {
        const newGrid = !grid;
        setGrid(newGrid);
        if (window.TOME?.store) {
            window.TOME.store.update(s => { s.mapGrid = newGrid; });
        }
        if (mapEngineRef.current) mapEngineRef.current.setGrid(newGrid, '1.5m');
        window.TOME?.socket?.emit('map_sync_event', {
            type: 'MAP_UPDATE',
            gridActive: newGrid,
            gridScale: '1.5m'
        });
    };

    const toggleFog = () => {
        const newFog = !fog;
        setFog(newFog);
        if (window.TOME?.store) {
            window.TOME.store.update(s => { s.mapFog = newFog; });
        }
        if (mapEngineRef.current) {
            if (newFog) {
                mapEngineRef.current.setFog({ enabled: true, paths: fogPathsRef.current });
            } else {
                mapEngineRef.current.setFog({ enabled: false });
            }
        }
        window.TOME?.socket?.emit('map_sync_event', {
            type: 'FOG_UPDATE',
            data: { enabled: newFog, paths: fogPathsRef.current }
        });
    };

    const toggleDynamicLighting = () => {
        const newLighting = !dynamicLighting;
        setDynamicLighting(newLighting);
        if (mapEngineRef.current) {
            mapEngineRef.current.setDynamicLightingEnabled(newLighting);
        }
        if (newLighting && !fog) {
            setFog(true);
            if (window.TOME?.store) {
                window.TOME.store.update(s => { s.mapFog = true; });
            }
            if (mapEngineRef.current) {
                mapEngineRef.current.setFog({ enabled: true, paths: fogPathsRef.current });
            }
        }
    };

    const placeToken = (id) => {
        const engine = mapEngineRef.current;
        if (!engine) return;

        const center = getStageCenter();
        const token = engine.tokens.get(id);
        if (token) {
            token.x = center.x;
            token.y = center.y;
            const evt = new CustomEvent('tome:token_moved', {
                detail: { id, x: center.x, y: center.y }
            });
            window.dispatchEvent(evt);
            
            Toast.show('Token movido para o centro da tela.', 'info');
        }
    };

    const syncToSpectator = () => {
        if (!mapEngineRef.current) return;

        const currentTokens = Array.from(mapEngineRef.current.tokens.values()).map(g => {
            return {
                id: g.id || 'unknown',
                x: g.x,
                y: g.y,
                name: 'Token',
                size: 50,
                color: '#ffffff',
            };
        });
        
        const enrichedTokens = currentTokens.map(ct => {
            const c = initiativeOrder.find(o => o.id === ct.id);
            if (c) {
                const isEnemy = c.type !== 'Player';
                let avatar = c.img || c.portraitData || null;
                if (isEnemy && !avatar) avatar = MonsterArt.getImage(c);
                if (avatar && !avatar.startsWith('db://')) ct.avatar = avatar;
                ct.name = c.name;
                ct.hp = c.hp;
                ct.maxHp = c.hp_max;
            }
            return ct;
        });

        const mapPayload = {
            type: 'MAP_UPDATE',
            mapUrl: mapUrl,
            fog: { enabled: fog, paths: fogPathsRef.current },
            gridActive: grid,
            gridScale: '1.5m',
            tokens: enrichedTokens
        };

        const cameraPayload = {
            type: 'CAMERA_UPDATE',
            data: { 
                x: mapEngineRef.current.mapContainer.x, 
                y: mapEngineRef.current.mapContainer.y, 
                scale: mapEngineRef.current.mapContainer.scale.x 
            }
        };

        broadcastRef.current?.postMessage(mapPayload);
        broadcastRef.current?.postMessage(cameraPayload);

        if (window.TOME?.socket) {
            window.TOME.socket.emit('map_sync_event', mapPayload);
            window.TOME.socket.emit('map_sync_event', cameraPayload);
        }
        
        Toast.show('📺 Telão e Celulares sincronizados via Rede Local!', 'success');
    };

    const triggerAoeTemplate = () => {
        if (!mapEngineRef.current) return;
        const center = getStageCenter();
        mapEngineRef.current.setAoeTemplate({
            type: 'sphere',
            x: center.x,
            y: center.y,
            radius: 200,
            color: '#ef4444'
        });
        Toast.show('🔥 Modelo de Área de Efeito (20ft) gerado no mapa.', 'warning');
    };

    const handleClose = () => {
        if (unmount) unmount();
    };

    return (
        <div class="fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex animate-fadeIn font-outfit text-slate-200">
            {/* Drawer Lateral (Sidebar) */}
            <div class="flex flex-col bg-black/80 border-r border-accent/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md"
                 style={{ width: sidebarOpen ? '420px' : '0', borderRightWidth: sidebarOpen ? '1px' : '0' }}>
                
                <div class="p-4 border-b border-white/5 flex justify-between items-center min-w-[420px]">
                    <h3 class="m-0 font-cinzel text-lg text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]">Gaveta Tática</h3>
                    <button class="btn btn-ghost p-2 text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <div class="flex flex-col flex-1 overflow-hidden min-w-[420px]">
                    <div class="px-4 py-3 border-b border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar">
                        <div class="text-[0.65rem] text-slate-400 mb-2 uppercase font-extrabold tracking-widest">Posicionamento (Colocar no Mapa)</div>
                        <div class="flex flex-col gap-1.5">
                            {initiativeOrder.length === 0 ? (
                                <div class="text-slate-500 text-xs text-center py-5 font-bold">Fila de iniciativa vazia.</div>
                            ) : (
                                initiativeOrder.map(c => {
                                    const isEnemy = c.type !== 'Player';
                                    let avatar = c.img || c.portraitData || null;
                                    if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
                                    if (avatar && avatar.startsWith('db://')) avatar = null;
                                    const color = isEnemy ? 'border-red-500 bg-red-500/20' : 'border-blue-500 bg-blue-500/20';
                                    const colorHex = isEnemy ? '#ef4444' : '#3b82f6';
                                    return (
                                        <div key={c.id} class="flex items-center gap-2.5 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group" onClick={() => placeToken(c.id)}>
                                            <div class={`w-8 h-8 rounded-full border-2 ${color} bg-cover bg-center flex items-center justify-center overflow-hidden shadow-md`} style={avatar ? { backgroundImage: `url('${avatar}')` } : {}}>
                                                {!avatar && <span class="text-white text-xs font-bold font-cinzel" style={{ color: colorHex }}>{c.name.substring(0,1).toUpperCase()}</span>}
                                            </div>
                                            <div class="flex-1 overflow-hidden">
                                                <div class="text-sm text-slate-200 truncate font-bold font-cinzel">{c.name}</div>
                                                <div class="text-[0.65rem] text-slate-500 font-extrabold uppercase tracking-wider">{c.hp !== undefined ? `HP: ${c.hp}` : ''}</div>
                                            </div>
                                            <button class="btn btn-ghost p-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Colocar no Mapa"><i class="fa-solid fa-crosshairs"></i></button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div class="flex-1 overflow-hidden relative bg-black/20">
                        <InitiativeMonitor />
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div class="flex-1 relative">
                <div class="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                    
                    <div class="flex gap-4 items-start">
                        <button class="btn btn-primary pointer-events-auto p-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                                <input type="text" class="w-[200px] py-1.5 px-3 text-sm bg-black/50 border border-white/20 rounded-lg text-white outline-none focus:border-accent" placeholder="URL do Mapa..." value={mapUrlInput} onInput={e => setMapUrlInput(e.target.value)} />
                                <button class="btn btn-ghost py-1.5 px-3 border border-white/20 text-slate-300 hover:text-white" onClick={applyMapUrl}>
                                    <i class="fa-solid fa-check"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 pointer-events-auto">
                        <button class="btn bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl border-none shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]" onClick={syncToSpectator}>
                            <i class="fa-solid fa-satellite-dish mr-2"></i> Sincronizar Telão
                        </button>
                        <button class="btn bg-red-900/80 text-white font-bold px-4 py-2.5 rounded-xl border border-red-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:bg-red-800" onClick={handleClose}>
                            <i class="fa-solid fa-times mr-2"></i> Fechar
                        </button>
                    </div>
                </div>

                <div class="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/80 p-2 rounded-2xl border border-white/10 pointer-events-auto flex gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                    <button class={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`} onClick={() => setTool('pan')} title="Mover Câmera / Tokens (V)">
                        <i class="fa-solid fa-hand"></i>
                    </button>
                    <button class={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="Pincel Revelador de Névoa (E)">
                        <i class="fa-solid fa-eraser"></i>
                    </button>
                    <button class={`tool-btn ${activeTool === 'ruler' ? 'active' : ''}`} onClick={() => setTool('ruler')} title="Régua de Medição (R)">
                        <i class="fa-solid fa-ruler-combined"></i>
                    </button>
                    <button class="tool-btn" onClick={triggerAoeTemplate} title="Modelo de Área de Efeito / Magia (Bola de Fogo 20ft)">
                        <i class="fa-solid fa-burst"></i>
                    </button>
                    <button class={`tool-btn ${activeTool === 'wall' ? 'active' : ''}`} onClick={() => setTool('wall')} title="Desenhar Parede Oculta (W)">
                        <i class="fa-solid fa-layer-group"></i>
                    </button>
                    <div class="w-px bg-white/10 mx-1"></div>
                    <button class={`tool-btn ${grid ? 'active-green' : ''}`} onClick={toggleGrid} title="Grade (G)">
                        <i class="fa-solid fa-border-all"></i>
                    </button>
                    <button class={`tool-btn ${fog ? 'active-purple' : ''}`} onClick={toggleFog} title="Névoa de Guerra (F)">
                        <i class="fa-solid fa-cloud"></i>
                    </button>
                    <button class={`tool-btn ${dynamicLighting ? 'active-yellow' : ''}`} onClick={toggleDynamicLighting} title="Iluminação Dinâmica (L)">
                        <i class="fa-solid fa-lightbulb"></i>
                    </button>
                </div>

                <style>{`
                    .tool-btn { width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                    .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                    .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); box-shadow: 0 0 10px rgba(197,160,89,0.2); }
                    .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
                    .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.2); }
                    .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.2); }
                `}</style>

                <div id="dm-map-container" class="absolute inset-0"></div>
                
                {!mapUrl && (
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none z-[5]">
                        <i class="fa-solid fa-map text-6xl mb-5 drop-shadow-lg"></i>
                        <h3 class="font-cinzel m-0 text-2xl tracking-widest">Nenhum Mapa Carregado</h3>
                        <p class="text-sm max-w-md text-center mt-3 bg-black/40 p-3 rounded-lg border border-white/5">Insira a URL na barra superior e pressione o <i class="fa-solid fa-check text-accent mx-1"></i>.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
