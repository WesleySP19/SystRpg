export function renderSpellsTab(p, actions) {
    return (
        <div data-tab-content="spells" className="tab-content active animate-fadeIn">
            {/* Barra de Busca de Magias */}
            <div className="card glass-accent mb-6 p-4 flex gap-4 items-center bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                <i className="fa-solid fa-wand-sparkles text-xl text-amber-400"></i>
                <input 
                    type="text" 
                    id="spell-search" 
                    className="legacy-input flex-1 bg-black/40 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none" 
                    placeholder="🔍 Filtrar magias por nome no grimório..." 
                    data-action="filterSpells" 
                />
            </div>

            {/* Círculos de Magia (0 a 9) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lv => {
                    const heroLevel = Number(p.level) || 1;
                    // In 5e, full casters get spell levels up to ceil(level / 2)
                    // We allow all circles or show soft lock if desired, but let's allow editing up to max
                    const maxSpellLevel = Math.max(1, Math.ceil(heroLevel / 2));
                    const isLocked = lv > maxSpellLevel && lv > 1;

                    const levelSpells = p.spells?.[`lvl${lv}`] || '';
                    const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };

                    if (isLocked) {
                        return (
                            <div key={`locked-${lv}`} className="skills-list spell-level-box opacity-35 grayscale border border-slate-800 bg-slate-950/40 rounded-xl p-5 flex flex-col items-center justify-center gap-2.5 min-h-[220px]">
                                <i className="fa-solid fa-lock text-2xl text-amber-500/50"></i>
                                <label className="font-cinzel text-xs tracking-widest text-slate-400 font-bold text-center">
                                    {lv}º CÍRCULO BLOQUEADO
                                </label>
                                <span className="text-[0.65rem] text-slate-600 text-center">Requer nível de conjurador mais alto</span>
                            </div>
                        );
                    }

                    return (
                        <div key={`level-${lv}`} className="skills-list spell-level-box bg-slate-900/80 border border-tomeGold/30 rounded-xl p-4 shadow-md flex flex-col gap-3" data-level={lv}>
                            <div className="flex justify-between items-center border-b border-tomeGold/20 pb-2">
                                <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider m-0">
                                    {lv === 0 ? '✨ TRUQUES (CÍRCULO 0)' : `📜 ${lv}º CÍRCULO`}
                                </label>
                                {lv > 0 && (
                                    <span className="text-[0.65rem] font-bold text-slate-400 uppercase">
                                        Espaços de Magia
                                    </span>
                                )}
                            </div>

                            {lv > 0 && (
                                <div className="flex gap-3 bg-black/40 p-2.5 rounded-lg items-center border border-slate-800/80">
                                    <div className="flex-1 text-center">
                                        <small className="block text-[0.6rem] font-bold text-slate-400 uppercase mb-0.5">TOTAL</small>
                                        <input 
                                            type="number" 
                                            name={`slots_${lv}_total`} 
                                            defaultValue={slots.total} 
                                            className="w-[50px] text-center font-black bg-slate-900 border border-slate-700 rounded p-1 text-amber-300 text-sm focus:border-amber-400 focus:outline-none" 
                                        />
                                    </div>
                                    <div className="flex-1 text-center">
                                        <small className="block text-[0.6rem] font-bold text-slate-400 uppercase mb-0.5">USADOS</small>
                                        <div className="flex items-center justify-center gap-1">
                                            <button 
                                                type="button" 
                                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer" 
                                                data-action="adjustSlot" 
                                                data-level={lv} 
                                                data-delta="-1"
                                                title="Recuperar espaço gasto"
                                            >
                                                -
                                            </button>
                                            <input 
                                                type="number" 
                                                name={`slots_${lv}_used`} 
                                                defaultValue={slots.used} 
                                                className="w-[40px] text-center font-black bg-transparent border-none text-red-400 text-sm" 
                                                readOnly 
                                            />
                                            <button 
                                                type="button" 
                                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer" 
                                                data-action="adjustSlot" 
                                                data-level={lv} 
                                                data-delta="1"
                                                title="Gastar espaço de magia"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <textarea 
                                className="legacy-textarea spell-list-area h-[160px] text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none leading-relaxed" 
                                name={`spells_lvl_${lv}`} 
                                placeholder={lv === 0 ? "Ex: Raio de Fogo, Luz, Mãos Mágicas..." : `Magias preparadas do ${lv}º círculo...`} 
                                defaultValue={levelSpells}
                            ></textarea>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
