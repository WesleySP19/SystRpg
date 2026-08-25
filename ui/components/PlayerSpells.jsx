import { useHeroData } from '../hooks/useHeroData.js';

export function renderSpellsTab(p, actions) {
    const { _currentTab: currentTab } = actions;

    return (
        <div className={`tab-content ${currentTab === 'spells' ? 'active' : ''}`}>
             <div className="card glass-accent mb-5 p-4 flex gap-5 items-center">
                <i className="fa-solid fa-wand-sparkles fa-2x text-accent"></i>
                <input type="text" id="spell-search" className="legacy-input flex-1" placeholder="🔍 Buscar magia no grimório..." data-action="filterSpells" />
             </div>
             <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
                {[0,1,2,3,4,5,6,7,8,9].map(lv => {
                    const heroLevel = p.level || 1;
                    const maxSpellLevel = Math.max(1, Math.ceil(heroLevel / 2));
                    const isLocked = lv > maxSpellLevel;

                    const levelSpells = p.spells?.[`lvl${lv}`] || '';
                    const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };
                    
                    if (isLocked) {
                        return (
                            <div key={`locked-${lv}`} className="skills-list spell-level-box opacity-30 grayscale pointer-events-none flex flex-col items-center justify-center gap-2.5">
                                <i className="fa-solid fa-lock fa-2x text-accent"></i>
                                <label className="font-cinzel text-[0.8rem] tracking-widest text-white">BLOQUEADO (NÍVEL INSUFICIENTE)</label>
                            </div>
                        );
                    }

                    return (
                        <div key={`level-${lv}`} className="skills-list spell-level-box" data-level={lv}>
                            <label className="sheet-section-title">{lv === 0 ? 'TRUQUES' : `${lv}º NÍVEL`}</label>
                            {lv > 0 && (
                                <div className="flex gap-2.5 mb-2.5 bg-white/5 p-2 rounded items-center">
                                    <div className="flex-1 text-center">
                                        <small className="block text-[0.5rem]">TOTAL SLOTS</small>
                                        <input type="number" name={`slots_${lv}_total`} defaultValue={slots.total} className="w-[45px] text-center font-extrabold bg-black/30 border border-white/20 rounded text-white" />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <small className="block text-[0.5rem]">USADOS</small>
                                        <div className="flex items-center justify-center gap-0.5">
                                            <button type="button" className="btn btn-ghost btn-sm px-1.5 py-0.5" data-action="adjustSlot" data-level={lv} data-delta="-1">-</button>
                                            <input type="number" name={`slots_${lv}_used`} defaultValue={slots.used} className="w-[35px] text-center font-extrabold bg-black/30 border-none text-white" readOnly />
                                            <button type="button" className="btn btn-ghost btn-sm px-1.5 py-0.5" data-action="adjustSlot" data-level={lv} data-delta="1">+</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <textarea className="legacy-textarea spell-list-area h-[150px] text-[0.7rem]" name={`spells_lvl_${lv}`} placeholder="Uma magia por linha..." defaultValue={levelSpells}></textarea>
                        </div>
                    );
                })}
             </div>
        </div>
    );
}
