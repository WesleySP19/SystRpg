import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';

/**
 * PARTY STATUS HUD v2.0
 * Fully draggable and collapsible party vitals monitor.
 */
export function PartyStatusHUD() {
    const storeState = useStore();
    const players = storeState?.players || [];
    
    const [isMinimized, setIsMinimized] = useState(false);
    const hudRef = useRef(null);

    useEffect(() => {
        const el = hudRef.current;
        if (!el) return;
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = el.querySelector('.hud-header') || el;
        
        const elementDrag = (e) => {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const newTop = el.offsetTop - pos2;
            const newLeft = el.offsetLeft - pos1;
            
            el.style.top = Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, newTop)) + "px";
            el.style.left = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, newLeft)) + "px";
            el.style.right = 'auto';
            el.style.bottom = 'auto';
        };

        const closeDragElement = () => {
            document.onmouseup = null;
            document.onmousemove = null;
        };

        const dragMouseDown = (e) => {
            e = e || window.event;
            if (e.target.closest('button') || e.target.closest('input')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        };

        header.onmousedown = dragMouseDown;

        return () => {
            header.onmousedown = null;
        };
    }, []);

    const viewSheet = (id, e) => {
        if (e) e.preventDefault();
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.viewingHeroId = id;
                s.activeTab = 'herosheet';
            });
        }
    };

    const getPassivePerception = (p) => {
        const wis = p.stats?.wis || 10;
        const mod = Math.floor((wis - 10) / 2);
        const isProf = p.skills?.includes('perception');
        const prof = p.proficiencyBonus || 2;
        return 10 + mod + (isProf ? prof : 0);
    };

    if (!players || players.length === 0) return null;

    const hudStyles = isMinimized ? {
        minWidth: '50px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        padding: '0',
        justifyContent: 'center',
        alignItems: 'center',
    } : {
        minWidth: '190px',
        width: 'auto',
        height: 'auto',
        borderRadius: '14px',
        padding: '15px',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    };

    return (
        <div 
            ref={hudRef}
            class={`party-hud fixed top-[90px] right-[20px] z-[1000] flex flex-col gap-3.5 border-[1.5px] border-accent/25 shadow-[0_15px_40px_rgba(0,0,0,0.7),inset_0_0_15px_rgba(197,160,89,0.05)] animate-fadeIn max-h-[calc(100vh-140px)] bg-black/80 backdrop-blur-md transition-all duration-300 select-none ${isMinimized ? 'minimized' : ''}`}
            style={hudStyles}
            title={isMinimized ? 'Vitais do Grupo (Clique para Expandir)' : ''}
        >
            {/* HEADER (DRAG HANDLE & MINIMIZE CONTROL) */}
            <div class="hud-header font-cinzel text-xs font-extrabold text-accent uppercase tracking-widest border-b-2 border-accent/30 pb-1.5 mb-1 flex items-center justify-between cursor-move drop-shadow-[0_0_5px_rgba(197,160,89,0.25)]">
                <div class="hud-title-text flex items-center gap-2" style={{ display: isMinimized ? 'none' : 'flex' }}>
                    <i class="fa-solid fa-shield-heart text-accent"></i> VITAIS DO GRUPO
                </div>
                <div class="hud-mini-badges items-center justify-center w-full h-full" style={{ display: isMinimized ? 'flex' : 'none' }}>
                    <i class="fa-solid fa-shield-heart text-accent text-xl drop-shadow-[0_0_5px_rgba(197,160,89,1)]"></i>
                </div>
                <button 
                    class="btn-minimize bg-transparent border-none text-accent cursor-pointer px-1.5 py-0.5 text-xs flex items-center justify-center hover:scale-125 transition-transform duration-200"
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                    style={{ position: isMinimized ? 'absolute' : 'static', right: isMinimized ? '-5px' : 'auto', top: isMinimized ? '-5px' : 'auto' }}
                >
                    <i class={`fa-solid ${isMinimized ? 'fa-plus' : 'fa-minus'}`}></i>
                </button>
            </div>

            {/* MAIN SCROLLABLE CONTENT */}
            <div class="hud-content flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto" style={{ display: isMinimized ? 'none' : 'flex' }}>
                {players.map(p => {
                    const current = p.hp?.current !== undefined ? p.hp.current : (p.hp_current || 0);
                    const max = p.hp?.max !== undefined ? p.hp.max : (p.hp_max || 10);
                    const hpPct = (current / max) * 100;
                    const hpColor = hpPct < 30 ? '#ef4444' : hpPct < 60 ? '#f59e0b' : '#10b981';

                    return (
                        <div key={p.id} class="hud-item hover-scale flex flex-col gap-1.5 p-2.5 rounded-[10px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-200">
                            <div class="flex justify-between items-center gap-2.5">
                                <span class="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[115px] cursor-pointer hover:text-accent transition-colors duration-200" 
                                      title={`Clique para ver ficha de ${p.name}`}
                                      onClick={(e) => viewSheet(p.id, e)}>{p.name}</span>
                                <span class="text-[0.6rem] text-accent font-bold bg-accent/10 border border-accent/25 rounded px-1.5 py-0.5">CA {p.ac}</span>
                            </div>
                            
                            {/* HP PROGRESS BAR */}
                            <div class="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div class="h-full transition-all duration-300" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: `0 0 8px ${hpColor}` }}></div>
                            </div>
                            
                            <div class="flex justify-between items-center flex-wrap gap-1 mt-0.5">
                                <span class="text-[0.6rem] text-slate-400 font-bold flex items-center gap-1">
                                    <i class="fa-solid fa-heart" style={{ color: hpColor, fontSize: '0.55rem' }}></i> {current}/{max}
                                </span>
                                <span class="text-[0.6rem] text-blue-400 font-bold bg-blue-400/10 border border-blue-400/25 rounded px-1.5 py-0.5 flex items-center gap-1">
                                    <i class="fa-solid fa-eye text-[0.55rem]"></i> {getPassivePerception(p)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
