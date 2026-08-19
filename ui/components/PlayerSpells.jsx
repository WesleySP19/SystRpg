import { useHeroData } from '../hooks/useHeroData.js';

export function renderSpellsTab(p, actions) {
    const { _currentTab: currentTab } = actions;

    return (
        <div className={`tab-content ${currentTab === 'spells' ? 'active' : ''}`}>
             <div className="card glass-accent" style={{ marginBottom: '20px', padding: '15px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <i className="fa-solid fa-wand-sparkles fa-2x" style={{ color: 'var(--accent)' }}></i>
                <input type="text" id="spell-search" className="legacy-input" placeholder="🔍 Buscar magia no grimório..." style={{ flex: 1 }} data-action="filterSpells" />
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[0,1,2,3,4,5,6,7,8,9].map(lv => {
                    const heroLevel = p.level || 1;
                    const maxSpellLevel = Math.max(1, Math.ceil(heroLevel / 2));
                    const isLocked = lv > maxSpellLevel;

                    const levelSpells = p.spells?.[`lvl${lv}`] || '';
                    const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };
                    
                    if (isLocked) {
                        return (
                            <div key={`locked-${lv}`} className="skills-list spell-level-box" style={{ opacity: 0.3, filter: 'grayscale(1)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-lock fa-2x" style={{ color: 'var(--accent)' }}></i>
                                <label style={{ fontFamily: "'Cinzel'", fontSize: '0.8rem', letterSpacing: '1px', color: '#fff' }}>BLOQUEADO (NÍVEL INSUFICIENTE)</label>
                            </div>
                        );
                    }

                    return (
                        <div key={`level-${lv}`} className="skills-list spell-level-box" data-level={lv}>
                            <label className="sheet-section-title">{lv === 0 ? 'TRUQUES' : `${lv}º NÍVEL`}</label>
                            {lv > 0 && (
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '5px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <small style={{ display: 'block', fontSize: '0.5rem' }}>TOTAL SLOTS</small>
                                        <input type="number" name={`slots_${lv}_total`} defaultValue={slots.total} style={{ width: '45px', textAlign: 'center', fontWeight: 900, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff' }} />
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <small style={{ display: 'block', fontSize: '0.5rem' }}>USADOS</small>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                            <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} data-action="adjustSlot" data-level={lv} data-delta="-1">-</button>
                                            <input type="number" name={`slots_${lv}_used`} defaultValue={slots.used} style={{ width: '35px', textAlign: 'center', fontWeight: 900, background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff' }} readOnly />
                                            <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} data-action="adjustSlot" data-level={lv} data-delta="1">+</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <textarea className="legacy-textarea spell-list-area" name={`spells_lvl_${lv}`} style={{ height: '150px', fontSize: '0.7rem' }} placeholder="Uma magia por linha..." defaultValue={levelSpells}></textarea>
                        </div>
                    );
                })}
             </div>
        </div>
    );
}
