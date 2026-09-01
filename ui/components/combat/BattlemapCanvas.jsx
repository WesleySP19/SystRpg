import { useRef, useEffect } from 'preact/hooks';
import { TacticalMapEnginePixi } from '../TacticalMapEnginePixi.js';
import { TOME } from '../../../core/Registry.js';
import { MonsterArt } from '../../../services/MonsterArt.js';
import { ImageCacheService } from '../../../services/ImageCacheService.js';

export function BattlemapCanvas({ isDM = true }) {
    const containerRef = useRef(null);
    const engineRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        if (!containerRef.current.id) {
            containerRef.current.id = 'battlemap-canvas-root';
        }

        let isCancelled = false;
        const initEngine = async () => {
            const engine = new TacticalMapEnginePixi(containerRef.current.id, {
                width: containerRef.current.clientWidth || 800,
                height: containerRef.current.clientHeight || 600,
                isDM
            });
            await engine.init(containerRef.current.clientWidth || 800, containerRef.current.clientHeight || 600);
            if (isCancelled) {
                engine.destroy();
                return;
            }
            engineRef.current = engine;
            updateMapProps();
            updateTokens();
        };
        initEngine();

        const handleTokenMoved = (e) => {
            const { id, x, y } = e.detail;
            if (TOME.socket) {
                TOME.socket.emit('delta_state_update', {
                    patches: [
                        { op: 'replace', path: `/tacticalMap/tokens/${id}`, value: { x, y } }
                    ]
                });
            }
        };

        const handleTokenDragging = (e) => {
            const { id, x, y } = e.detail;
            if (TOME.webrtc) {
                TOME.webrtc.broadcast({ type: 'TOKEN_DRAG', id, x, y });
            }
        };

        window.addEventListener('tome:token_moved', handleTokenMoved);
        window.addEventListener('tome:token_dragging', handleTokenDragging);

        // V22.2 Isolando o VTT do fluxo reativo principal do Preact
        const updateMapProps = () => {
            if (!engineRef.current) return;
            const state = TOME.store.state;
            const tacticalMap = state.tacticalMap || {};
            
            // Map URL cacheado
            if (tacticalMap.mapUrl) {
                ImageCacheService.getBlobUrl(tacticalMap.mapUrl).then(blobUrl => {
                    engineRef.current.setMapUrl(blobUrl);
                });
            } else {
                engineRef.current.setMapUrl(null);
            }

            engineRef.current.setFog({ enabled: tacticalMap.fog });
            engineRef.current.setGrid(tacticalMap.grid, '1.5m');
        };

        const updateTokens = async () => {
            if (!engineRef.current) return;
            const order = TOME.store.state.initiativeOrder || [];
            
            const tokensArray = await Promise.all(order.map(async (c, i) => {
                const isEnemy = c.type !== 'Player';
                let avatar = c.img || c.portraitData || null;
                if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
                if (avatar && avatar.startsWith('db://')) { avatar = null; }
                
                // Fetch blob avatar
                if (avatar) {
                    avatar = await ImageCacheService.getBlobUrl(avatar);
                }

                const existing = engineRef.current.tokens.get(c.id);
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
            }));

            engineRef.current.updateTokens(tokensArray);
        };

        // Subscribe manually to avoid re-rendering the whole wrapper div
        const unsubTacticalMap = TOME.store.subscribeTo('tacticalMap', updateMapProps);
        const unsubInitiative = TOME.store.subscribeTo('initiativeOrder', updateTokens);

        // Initial sync handled inside initEngine() after await

        return () => {
            isCancelled = true;
            window.removeEventListener('tome:token_moved', handleTokenMoved);
            window.removeEventListener('tome:token_dragging', handleTokenDragging);
            if (unsubTacticalMap) unsubTacticalMap();
            if (unsubInitiative) unsubInitiative();
            if (engineRef.current) {
                engineRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="battlemap-wrapper w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-accent/20 bg-black/50 shadow-inner relative"
             onDragOver={(e) => {
                 e.preventDefault();
                 e.dataTransfer.dropEffect = 'copy';
             }}
             onDrop={(e) => {
                 e.preventDefault();
                 const idx = parseInt(e.dataTransfer.getData('text/plain'));
                 if (!isNaN(idx) && engineRef.current) {
                     const order = TOME.store.state.initiativeOrder || [];
                     const combatant = order[idx];
                     if (combatant) {
                         console.log("Token dragged onto map:", combatant.name);
                     }
                 }
             }}
        >
            <div ref={containerRef} className="w-full h-full absolute inset-0"></div>
        </div>
    );
}
