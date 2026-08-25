import { useRef, useEffect } from 'preact/hooks';
import { TacticalMapEngine } from '../TacticalMapEngine.js';
import { useStore } from '../../core/hooks.js';
import { TOME } from '../../../core/Registry.js';
import { MonsterArt } from '../../../services/MonsterArt.js';

export function BattlemapCanvas({ isDM = true }) {
    const containerRef = useRef(null);
    const engineRef = useRef(null);
    const initiativeOrder = useStore('initiativeOrder') || [];
    const mapUrl = useStore('mapUrl');
    const mapFog = useStore('mapFog');
    const mapGrid = useStore('mapGrid');

    useEffect(() => {
        if (!containerRef.current) return;
        
        // Atribuir um ID único se não tiver
        if (!containerRef.current.id) {
            containerRef.current.id = 'battlemap-canvas-root';
        }

        // Instanciar o engine existente que já usa Konva
        engineRef.current = new TacticalMapEngine(containerRef.current.id, {
            width: containerRef.current.clientWidth || 800,
            height: containerRef.current.clientHeight || 600,
            isDM
        });

        // Ouvintes globais que a engine emite
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

        window.addEventListener('tome:token_moved', handleTokenMoved);

        return () => {
            window.removeEventListener('tome:token_moved', handleTokenMoved);
            // Cleanup map if needed (Konva stages can just be destroyed)
            if (engineRef.current && engineRef.current.stage) {
                engineRef.current.stage.destroy();
            }
        };
    }, []);

    // Sincronizar propriedades reativamente
    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.setMapUrl(mapUrl);
        }
    }, [mapUrl]);

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.setFog({ enabled: mapFog });
        }
    }, [mapFog]);

    useEffect(() => {
        if (engineRef.current) {
            engineRef.current.setGrid(mapGrid, '1.5m');
        }
    }, [mapGrid]);

    // Sincronizar Tokens Reativamente
    useEffect(() => {
        if (!engineRef.current) return;

        const tokensArray = initiativeOrder.map((c, i) => {
            const isEnemy = c.type !== 'Player';
            let avatar = c.img || c.portraitData || null;
            if (isEnemy && !avatar) { avatar = MonsterArt.getImage(c); }
            if (avatar && avatar.startsWith('db://')) { avatar = null; }

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
        });

        engineRef.current.updateTokens(tokensArray);

    }, [initiativeOrder]);

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
                     // Drop do CombatantListV22
                     const combatant = initiativeOrder[idx];
                     if (combatant) {
                         // Apenas centraliza/atualiza
                         console.log("Token dragged onto map:", combatant.name);
                     }
                 }
             }}
        >
            <div ref={containerRef} className="w-full h-full absolute inset-0"></div>
        </div>
    );
}
