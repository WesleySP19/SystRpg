import { RulesEngine } from '../../core/RulesEngine.js';

export function renderCoreTab(p, context) {
    const rules = RulesEngine.getActiveRuleset();
    
    // Fallbacks just in case ruleset isn't loaded
    const stats = rules ? rules.stats.map(s => s.id) : ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const labels = rules ? Object.fromEntries(rules.stats.map(s => [s.id, s.short])) : { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
    const skillsList = rules ? rules.skills : context._skills;
    const derived = rules ? rules.derived : [
        { id: 'ac', label: 'CA', default: 10 },
        { id: 'initiative', label: 'INICIATIVA', default: 0 },
        { id: 'speed', label: 'DESLOC.', default: 30 }
    ];

    return (
        <div data-tab-content="core" className="tab-content {context._currentTab === 'core' ? 'active' : ''}">
            <div class="grid grid-cols-1 md:grid-cols-[100px_240px_1fr_300px] gap-8">
                
                <div class="flex flex-col gap-2.5">
                    {stats.map(s => {
                        const val = p.stats?.[s] !== undefined ? p.stats[s] : 10;
                        return html`
                            <div class="attr-box h-[90px] p-2.5">
                                <label class="attr-label text-[0.6rem]">${labels[s]}</label>
                                <input class="attr-score-input text-[1.4rem]" type="number" name="stat_${s}" value="${val}" />
                                <div class="attr-modifier-bubble -bottom-4 text-[0.8rem] w-[35px] h-[25px]" id="mod-${s}">+0</div>
                            </div>
                        `;
                    })}
                </div>

                <div class="flex flex-col gap-5">
                    <div class="skills-list p-4">
                        <div class="flex items-center gap-2.5 mb-2.5">
                            <div class="border border-[var(--sheet-border-color)] w-[30px] h-[30px] rounded flex items-center justify-center bg-black/30">
                                <input type="checkbox" name="inspiration" checked={!!(p.inspiration )} class="w-5 h-5 cursor-pointer accent-accent" />
                            </div>
                            <label class="attr-label m-0">INSPIRAÇÃO</label>
                        </div>
                        <div class="flex items-center gap-2.5">
                            <div class="border border-[var(--sheet-border-color)] w-[30px] h-[30px] rounded flex items-center justify-center bg-black/30">
                                <input type="number" name="proficiencyBonus" value="{p.proficiencyBonus || 2}" class="w-full border-none text-center font-extrabold bg-transparent text-white" />
                            </div>
                            <label class="attr-label m-0">BÔNUS DE PROFICIÊNCIA</label>
                        </div>
                    </div>

                    <div class="skills-list">
                        <label class="sheet-section-title text-[0.7rem]">TESTES DE RESISTÊNCIA</label>
                        {stats.map(s => {
                            const isChecked = p.savingThrows?.[s] ? 'checked' : '';
                            return html`
                                <div class="skill-row py-1">
                                    <input type="checkbox" name="save_${s}" checked=${isChecked} class="cursor-pointer accent-accent" />
                                    <span id="save-val-${s}" class="w-[25px] text-center font-extrabold text-[0.7rem] border-b border-accent/30 text-white">+0</span>
                                    <span class="flex-1 text-[0.75rem]">${labels[s]}</span>
                                </div>
                            `;
                        })}
                    </div>

                    <div class="skills-list">
                        <label class="sheet-section-title text-[0.7rem]">PERÍCIAS</label>
                        {skillsList.map(sk => {
                            const isChecked = p.skills?.includes(sk.id) ? 'checked' : '';
                            return html`
                                <div class="skill-row" id="row-skill-${sk.id}">
                                    <input type="checkbox" name="skill_${sk.id}" data-action="onSkillToggle" checked=${isChecked} class="cursor-pointer accent-accent" />
                                    <span id="skill-val-${sk.id}" class="w-[25px] text-center font-extrabold text-[0.7rem] border-b border-accent/30 text-white">+0</span>
                                    <span class="flex-1 text-[0.75rem]">${sk.label} <small class="opacity-50">(${labels[sk.stat]})</small></span>
                                    <button type="button" class="btn btn-ghost btn-sm px-2 py-0.5" data-action="rollSkill" data-skill="${sk.id}"><i class="fa-solid fa-dice-d20"></i></button>
                                </div>
                            `;
                        })}
                    </div>
                </div>

                <div class="flex flex-col gap-5">
                    <div class="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2.5">
                        {derived.map(d => html`
                            <div class="combat-box">
                                <label class="combat-label">${d.label}</label>
                                <input type="number" name="${d.id}" value="${p[d.id] !== undefined ? p[d.id] : d.default}" />
                            </div>
                        `)}
                    </div>

                    <div class="hp-container p-4">
                        <span class="hp-label-float">PONTOS DE VIDA</span>
                        <div class="flex justify-around items-center">
                            <div class="text-center">
                                <label class="attr-label text-[0.5rem]">MÁXIMO</label>
                                <input type="number" name="hp_max" value="{p.hp?.max !== undefined ? p.hp.max : 10}" class="w-[60px] text-[1.5rem] text-center border-none border-b border-accent/30 bg-transparent text-white" />
                            </div>
                            <div class="text-center">
                                <label class="attr-label text-[0.5rem]">ATUAL</label>
                                <input type="number" name="hp_current" value="{p.hp?.current !== undefined ? p.hp.current : 10}" class="w-[80px] text-[2rem] text-center border-none font-extrabold bg-transparent text-white" />
                            </div>
                        </div>
                        <div class="mt-2.5 border-t border-accent/20 pt-2.5 text-center">
                            <label class="attr-label text-[0.5rem]">PONTOS DE VIDA TEMPORÁRIOS</label>
                            <input type="number" name="hp_temp" value="{p.hp?.temp || 0}" class="w-full text-center border-none bg-transparent text-white" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="skills-list p-2.5">
                            <label class="attr-label text-[0.5rem]">DADOS DE VIDA</label>
                            <div class="flex gap-1.5">
                                <input name="hit_dice_total" value="{p.hitDice?.total || ''}" placeholder="Total" class="w-full text-[0.8rem] text-center bg-transparent text-white border-none border-b border-accent/30" />
                                <input name="hit_dice_rem" value="{p.hitDice?.remaining || ''}" placeholder="Rest" class="w-full text-[0.8rem] text-center bg-transparent text-white border-none border-b border-accent/30" />
                            </div>
                        </div>
                        <div class="skills-list p-2.5">
                            <label class="attr-label text-[0.5rem]">TESTES CONTRA A MORTE</label>
                            <div class="flex flex-col gap-1.5 items-center">
                                <div class="flex gap-1">
                                    <small class="text-slate-400 font-extrabold mr-1">S</small>
                                    <input type="checkbox" name="death_s1" checked={!!(p.deathSaves?.successes?.[0] )} class="cursor-pointer accent-emerald-500 w-4 h-4" />
                                    <input type="checkbox" name="death_s2" checked={!!(p.deathSaves?.successes?.[1] )} class="cursor-pointer accent-emerald-500 w-4 h-4" />
                                    <input type="checkbox" name="death_s3" checked={!!(p.deathSaves?.successes?.[2] )} class="cursor-pointer accent-emerald-500 w-4 h-4" />
                                </div>
                                <div class="flex gap-1">
                                    <small class="text-slate-400 font-extrabold mr-1">F</small>
                                    <input type="checkbox" name="death_f1" checked={!!(p.deathSaves?.failures?.[0] )} class="cursor-pointer accent-red-500 w-4 h-4" />
                                    <input type="checkbox" name="death_f2" checked={!!(p.deathSaves?.failures?.[1] )} class="cursor-pointer accent-red-500 w-4 h-4" />
                                    <input type="checkbox" name="death_f3" checked={!!(p.deathSaves?.failures?.[2] )} class="cursor-pointer accent-red-500 w-4 h-4" data-action="onDeathFailureCheck" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="skills-list p-4">
                        <label class="sheet-section-title">ATAQUES & CONJURAÇÃO</label>
                        <div id="attacks-container">{context._renderAttackRows()}</div>
                        <div class="flex gap-2.5 mt-2.5">
                            <button type="button" class="btn btn-ghost btn-sm flex-1" data-action="addAttackRow">+ ATAQUE</button>
                        </div>
                        <textarea class="legacy-textarea mt-2.5 text-[0.7rem]" name="attack_notes" placeholder="Notas de combate..." rows="4">{p.attackNotes || ''}</textarea>
                    </div>
                </div>

                <div class="flex flex-col gap-4">
                    <div class="skills-list p-4">
                        <div class="flex justify-between border-b border-accent/20 pb-1.5 mb-1.5">
                            <span class="text-[0.6rem] font-extrabold text-slate-400">SABEDORIA PASSIVA (PERCEPÇÃO)</span>
                            <span id="pass-perc" class="font-extrabold text-accent">10</span>
                        </div>
                        <div class="flex justify-between border-b border-accent/20 pb-1.5 mb-1.5">
                            <span class="text-[0.6rem] font-extrabold text-slate-400">INTELIGÊNCIA PASSIVA (INVEST.)</span>
                            <span id="pass-invest" class="font-extrabold text-accent">10</span>
                        </div>
                        <div class="flex justify-between pb-1.5">
                            <span class="text-[0.6rem] font-extrabold text-slate-400">SABEDORIA PASSIVA (INTUIÇÃO)</span>
                            <span id="pass-insight" class="font-extrabold text-accent">10</span>
                        </div>
                    </div>
                    <div class="skills-list flex-1">
                        <label class="sheet-section-title">OUTRAS PROFICIÊNCIAS & IDIOMAS</label>
                        <textarea class="legacy-textarea h-full text-[0.75rem]" name="other_profs">{p.otherProfs || ''}</textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}
