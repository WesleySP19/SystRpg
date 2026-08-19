
export function renderCoreTab(p, context) {
    const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const labels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

    return (
        <div data-tab-content="core" class="tab-content {context._currentTab === 'core' ? 'active' : ''}">
            <div style="display:grid; grid-template-columns: 100px 240px 1fr 300px; gap:30px;">
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                    {stats.map(s => {
                        const val = p.stats?.[s] !== undefined ? p.stats[s] : 10;
                        return html`
                            <div class="attr-box" style="height:90px; padding:10px;">
                                <label class="attr-label" style="font-size:0.6rem;">${labels[s]}</label>
                                <input class="attr-score-input" type="number" name="stat_${s}" value="${val}" style="font-size:1.4rem;" />
                                <div class="attr-modifier-bubble" id="mod-${s}" style="bottom:-15px; font-size:0.8rem; width:35px; height:25px;">+0</div>
                            </div>
                        `;
                    })}
                </div>

                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="skills-list" style="padding:15px;">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                            <div style="border:var(--sheet-border-thick); width:30px; height:30px; border-radius:5px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3);">
                                <input type="checkbox" name="inspiration" checked={!!(p.inspiration )} style="width:20px; height:20px; cursor:pointer;" />
                            </div>
                            <label class="attr-label" style="margin:0;">INSPIRAÇÃO</label>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="border:var(--sheet-border-thick); width:30px; height:30px; border-radius:5px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3);">
                                <input type="number" name="proficiencyBonus" value="{p.proficiencyBonus || 2}" style="width:100%; border:none; text-align:center; font-weight:900; background:transparent; color:#fff;" />
                            </div>
                            <label class="attr-label" style="margin:0;">BÔNUS DE PROFICIÊNCIA</label>
                        </div>
                    </div>

                    <div class="skills-list">
                        <label class="sheet-section-title" style="font-size:0.7rem;">TESTES DE RESISTÊNCIA</label>
                        {stats.map(s => {
                            const isChecked = p.savingThrows?.[s] ? 'checked' : '';
                            return html`
                                <div class="skill-row" style="padding:4px 0;">
                                    <input type="checkbox" name="save_${s}" checked=${isChecked} style="cursor:pointer;" />
                                    <span id="save-val-${s}" style="width:25px; text-align:center; font-weight:800; font-size:0.7rem; border-bottom:1px solid rgba(197, 160, 89, 0.3); color:#fff;">+0</span>
                                    <span style="flex:1; font-size:0.75rem;">${labels[s]}</span>
                                </div>
                            `;
                        })}
                    </div>

                    <div class="skills-list">
                        <label class="sheet-section-title" style="font-size:0.7rem;">PERÍCIAS</label>
                        {context._skills.map(sk => {
                            const isChecked = p.skills?.includes(sk.id) ? 'checked' : '';
                            return html`
                                <div class="skill-row" id="row-skill-${sk.id}">
                                    <input type="checkbox" name="skill_${sk.id}" data-action="onSkillToggle" checked=${isChecked} style="cursor:pointer;" />
                                    <span id="skill-val-${sk.id}" style="width:25px; text-align:center; font-weight:800; font-size:0.7rem; border-bottom:1px solid rgba(197, 160, 89, 0.3); color:#fff;">+0</span>
                                    <span style="flex:1; font-size:0.75rem;">${sk.label} <small style="opacity:0.5;">(${labels[sk.stat]})</small></span>
                                    <button type="button" class="btn btn-ghost btn-sm" style="padding:2px 8px;" data-action="rollSkill" data-skill="${sk.id}"><i class="fa-solid fa-dice-d20"></i></button>
                                </div>
                            `;
                        })}
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                        <div class="combat-box"><label class="combat-label">CA</label><input type="number" name="ac" value="{p.ac !== undefined ? p.ac : 10}" /></div>
                        <div class="combat-box"><label class="combat-label">INICIATIVA</label><input type="number" name="initiative" value="{p.initiative || 0}" /></div>
                        <div class="combat-box"><label class="combat-label">DESLOC.</label><input type="number" name="speed" value="{p.speed !== undefined ? p.speed : 30}" /></div>
                    </div>

                    <div class="hp-container" style="padding:15px;">
                        <span class="hp-label-float">PONTOS DE VIDA</span>
                        <div style="display:flex; justify-content:space-around; align-items:center;">
                            <div style="text-align:center;">
                                <label class="attr-label" style="font-size:0.5rem;">MÁXIMO</label>
                                <input type="number" name="hp_max" value="{p.hp?.max !== undefined ? p.hp.max : 10}" style="width:60px; font-size:1.5rem; text-align:center; border:none; border-bottom:1px solid rgba(197, 160, 89, 0.3); background:transparent; color:#fff;" />
                            </div>
                            <div style="text-align:center;">
                                <label class="attr-label" style="font-size:0.5rem;">ATUAL</label>
                                <input type="number" name="hp_current" value="{p.hp?.current !== undefined ? p.hp.current : 10}" style="width:80px; font-size:2rem; text-align:center; border:none; font-weight:900; background:transparent; color:#fff;" />
                            </div>
                        </div>
                        <div style="margin-top:10px; border-top:1px solid rgba(197, 160, 89, 0.2); padding-top:10px; text-align:center;">
                            <label class="attr-label" style="font-size:0.5rem;">PONTOS DE VIDA TEMPORÁRIOS</label>
                            <input type="number" name="hp_temp" value="{p.hp?.temp || 0}" style="width:100%; text-align:center; border:none; background:transparent; color:#fff;" />
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                        <div class="skills-list" style="padding:10px;">
                            <label class="attr-label" style="font-size:0.5rem;">DADOS DE VIDA</label>
                            <div style="display:flex; gap:5px;">
                                <input name="hit_dice_total" value="{p.hitDice?.total || ''}" placeholder="Total" style="width:100%; font-size:0.8rem; text-align:center; background:transparent; color:#fff; border:none; border-bottom:1px solid rgba(197, 160, 89, 0.3);" />
                                <input name="hit_dice_rem" value="{p.hitDice?.remaining || ''}" placeholder="Rest" style="width:100%; font-size:0.8rem; text-align:center; background:transparent; color:#fff; border:none; border-bottom:1px solid rgba(197, 160, 89, 0.3);" />
                            </div>
                        </div>
                        <div class="skills-list" style="padding:10px;">
                            <label class="attr-label" style="font-size:0.5rem;">TESTES CONTRA A MORTE</label>
                            <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                                <div style="display:flex; gap:3px;">
                                    <small>S</small>
                                    <input type="checkbox" name="death_s1" checked={!!(p.deathSaves?.successes?.[0] )} style="cursor:pointer;" />
                                    <input type="checkbox" name="death_s2" checked={!!(p.deathSaves?.successes?.[1] )} style="cursor:pointer;" />
                                    <input type="checkbox" name="death_s3" checked={!!(p.deathSaves?.successes?.[2] )} style="cursor:pointer;" />
                                </div>
                                <div style="display:flex; gap:3px;">
                                    <small>F</small>
                                    <input type="checkbox" name="death_f1" checked={!!(p.deathSaves?.failures?.[0] )} style="cursor:pointer;" />
                                    <input type="checkbox" name="death_f2" checked={!!(p.deathSaves?.failures?.[1] )} style="cursor:pointer;" />
                                    <input type="checkbox" name="death_f3" checked={!!(p.deathSaves?.failures?.[2] )} style="cursor:pointer;" data-action="onDeathFailureCheck" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="skills-list" style="padding:15px;">
                        <label class="sheet-section-title">ATAQUES & CONJURAÇÃO</label>
                        <div id="attacks-container">{context._renderAttackRows()}</div>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button type="button" class="btn btn-ghost btn-sm" style="flex:1;" data-action="addAttackRow">+ ATAQUE</button>
                        </div>
                        <textarea class="legacy-textarea" name="attack_notes" placeholder="Notas de combate..." rows="4" style="margin-top:10px; font-size:0.7rem;">{p.attackNotes || ''}</textarea>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div class="skills-list" style="padding:15px;">
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(197, 160, 89, 0.2); padding-bottom:5px; margin-bottom:5px;">
                            <span style="font-size:0.6rem; font-weight:800;">SABEDORIA PASSIVA (PERCEPÇÃO)</span>
                            <span id="pass-perc" style="font-weight:900; color:var(--accent);">10</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(197, 160, 89, 0.2); padding-bottom:5px; margin-bottom:5px;">
                            <span style="font-size:0.6rem; font-weight:800;">INTELIGÊNCIA PASSIVA (INVEST.)</span>
                            <span id="pass-invest" style="font-weight:900; color:var(--accent);">10</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding-bottom:5px;">
                            <span style="font-size:0.6rem; font-weight:800;">SABEDORIA PASSIVA (INTUIÇÃO)</span>
                            <span id="pass-insight" style="font-weight:900; color:var(--accent);">10</span>
                        </div>
                    </div>
                    <div class="skills-list" style="flex:1;">
                        <label class="sheet-section-title">OUTRAS PROFICIÊNCIAS & IDIOMAS</label>
                        <textarea class="legacy-textarea" name="other_profs" style="height:100%; font-size:0.75rem;">{p.otherProfs || ''}</textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}
