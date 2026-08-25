import { useCombat } from '../../hooks/useCombat.js';
import { TOME } from '../../../core/Registry.js';

export function CombatantListV22() {
    const { combatants, turnIndex, removeCombatant, updateCombatantHP } = useCombat();
    const store = TOME.store;

    if (!combatants || combatants.length === 0) {
        return (
            <div class="flex flex-col items-center justify-center h-full opacity-40 text-center">
                <i className="fa-solid fa-ghost fa-4x mb-5 text-accent"></i>
                <h3 class="font-cinzel m-0 text-[1.5rem]">A Arena está vazia</h3>
                <p class="text-[0.9rem] mt-2.5">Adicione heróis e monstros para iniciar o combate.</p>
            </div>
        );
    }

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        store.update(s => {
            const arr = [...s.initiativeOrder];
            const item = arr.splice(dragIndex, 1)[0];
            arr.splice(dropIndex, 0, item);
            s.initiativeOrder = arr;
            if (s.initiativeIndex === dragIndex) {
                s.initiativeIndex = dropIndex;
            } else if (s.initiativeIndex > dragIndex && s.initiativeIndex <= dropIndex) {
                s.initiativeIndex--;
            } else if (s.initiativeIndex < dragIndex && s.initiativeIndex >= dropIndex) {
                s.initiativeIndex++;
            }
        });
    };

    const handleHpChange = (e, id, maxHp) => {
        const val = parseInt(e.target.value);
        if (isNaN(val)) return;
        
        store.update(s => {
            const c = s.combatants.find(x => x.id === id);
            if (c) {
                const oldHp = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);
                
                if (c.hp !== undefined && typeof c.hp === 'number') {
                    c.hp = Math.max(0, Math.min(val, maxHp || val));
                } else if (c.hp && c.hp.current !== undefined) {
                    c.hp.current = Math.max(0, Math.min(val, c.hp.max || val));
                }

                const newHp = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);

                if (oldHp > 0 && newHp === 0) {
                    if (c.type !== 'hero') {
                        if (window.TOME?.events) {
                            window.TOME.events.emit('ENTITY_SLAIN', { entity: c, name: c.name });
                        }
                    } else {
                        c.deathSaves = { successes: 0, failures: 0 };
                        c.isDead = false;
                    }
                }
            }
        });
    };

    const handleDeathSave = (id, type, value) => {
        store.update(s => {
            const c = s.combatants.find(x => x.id === id);
            if (c && c.deathSaves) {
                c.deathSaves[type] = value;
                if (c.deathSaves.failures >= 3 && !c.isDead) {
                    c.isDead = true;
                    if (window.TOME?.events) {
                        window.TOME.events.emit('HERO_FALLEN', { player: c, name: c.name });
                    }
                }
            }
        });
    };

    return (
        <div class="flex flex-col gap-4">
            {combatants.map((c, idx) => {
                const isTurn = idx === turnIndex;
                const isHero = c.isHero || c.type === 'hero';
                const hpCurrent = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);
                const hpMax = c.hpMax || c.hp?.max || hpCurrent;
                const hpPercent = Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100));
                
                let hpColor = '#10b981';
                if (hpPercent <= 50) hpColor = '#f59e0b';
                if (hpPercent <= 20) hpColor = '#ef4444';

                return (
                    <div 
                        key={c.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`relative cursor-grab rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-md transition-all duration-300 ${isTurn ? 'bg-accent/10 border border-accent scale-[1.02] shadow-[0_0_25px_rgba(212,175,55,0.2)]' : 'bg-slate-900/40 border border-white/5 shadow-[0_4px_15px_rgba(0,0,0,0.3)]'} ${isHero ? 'border-l-[5px] border-l-blue-500' : 'border-l-[5px] border-l-red-500'}`}
                    >
                        <div class="grid grid-cols-[50px_60px_1fr_180px_40px] gap-4 items-center">
                            <div class="bg-white/5 rounded-xl py-3 text-center font-extrabold font-cinzel text-[1.3rem] text-accent border border-accent/20">
                                {c.initiative || 0}
                            </div>

                            <div className={`w-[54px] h-[54px] rounded-full bg-black/50 border-2 ${isHero ? 'border-blue-500' : 'border-red-500'} overflow-hidden flex items-center justify-center relative shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                                {c.portraitData 
                                    ? <img src={c.portraitData} className={`w-full h-full object-cover ${(c.isDead || (hpCurrent===0 && !isHero)) ? 'grayscale' : ''}`} />
                                    : <i className={`fa-solid ${isHero ? 'fa-user' : 'fa-dragon'} ${(c.isDead || (hpCurrent===0 && !isHero)) ? 'grayscale' : ''}`}></i>
                                }
                                {(c.isDead || (hpCurrent===0 && !isHero)) && (
                                    <div class="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                                        <i className="fa-solid fa-skull text-white drop-shadow-[0_0_8px_#000] text-[1.2rem]"></i>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className={`font-extrabold text-[1.15rem] font-cinzel flex items-center gap-2 ${(c.isDead || (hpCurrent===0 && !isHero)) ? 'text-slate-500' : 'text-slate-100'}`}>
                                    {c.name}
                                    {isTurn && <span class="badge bg-accent text-black text-[0.65rem] px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]">SEU TURNO</span>}
                                </div>
                                <div class="text-[0.75rem] text-slate-400 uppercase tracking-widest mt-1">
                                    AC {c.ac || 10} • {isHero ? 'Herói' : 'Monstro'}
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <div class="flex justify-between items-center text-[0.75rem] font-extrabold">
                                    <span class="text-slate-400">HP</span>
                                    <div class="flex items-center gap-1.5">
                                        <input type="number" 
                                               value={hpCurrent} 
                                               onChange={(e) => handleHpChange(e, c.id, hpMax)}
                                               class="w-[55px] bg-black/60 border border-white/15 rounded-md text-white font-extrabold text-center py-1 transition-colors hover:border-white/30 focus:border-accent" />
                                        <span class="text-slate-400">/ {hpMax}</span>
                                    </div>
                                </div>
                                <div class="h-2 bg-black/60 rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                                    <div class="h-full transition-all duration-500 ease-out" style={{ width: `${hpPercent}%`, background: hpColor, boxShadow: `0 0 8px ${hpColor}` }}></div>
                                </div>
                            </div>

                            <button className="btn btn-ghost btn-sm text-slate-500 p-2.5 rounded-full transition-all hover:text-red-500 hover:bg-red-500/10" onClick={() => removeCombatant(c.id)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>

                        {isHero && hpCurrent === 0 && (
                            <div class="bg-red-500/10 rounded-xl px-6 py-3.5 border border-red-500/30 flex justify-between items-center animate-fadeIn">
                                <span class="font-cinzel text-red-400 font-bold text-[1.1rem] flex items-center gap-2">
                                    <i className="fa-solid fa-skull"></i> 
                                    {c.isDead ? 'HERÓI MORTO' : 'TESTES CONTRA A MORTE'}
                                </span>
                                
                                {!c.isDead && (
                                    <div class="flex gap-10">
                                        <div class="flex items-center gap-3">
                                            <span class="text-emerald-400 text-[0.85rem] font-bold uppercase tracking-widest">Sucessos</span>
                                            <div class="flex gap-2">
                                                {[1, 2, 3].map(i => (
                                                    <input key={i} type="checkbox" checked={c.deathSaves?.successes >= i} onChange={(e) => handleDeathSave(c.id, 'successes', e.target.checked ? i : i-1)} class="w-5 h-5 accent-emerald-500 cursor-pointer" />
                                                ))}
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <span class="text-red-400 text-[0.85rem] font-bold uppercase tracking-widest">Falhas</span>
                                            <div class="flex gap-2">
                                                {[1, 2, 3].map(i => (
                                                    <input key={i} type="checkbox" checked={c.deathSaves?.failures >= i} onChange={(e) => handleDeathSave(c.id, 'failures', e.target.checked ? i : i-1)} class="w-5 h-5 accent-red-500 cursor-pointer" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
