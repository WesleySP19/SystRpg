import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Schemas } from '../../data/schemas.js';
import { CardRenderer } from '../../services/CardRenderer.js';

/**
 * PLAYER FORM v10.0 — "THE ULTIMATE 5E LEGACY SHEET"
 * Full D&D 5e mechanics, real-time calculations, and premium UX.
 */
export class PlayerForm extends Component {
    constructor(opts) {
        super(opts);
        this._portraitData = null;
        this._portraitSettings = { x: 0, y: 0, scale: 1 };
        this._attackRows = [{ name: '', bonus: '', damage: '' }];
        this._editingId = null;
        this._currentTab = 'core';
        this._cardSide = 'front';
        
        this._skills = [
            { id: 'athletics', label: 'Atletismo', stat: 'str' },
            { id: 'acrobatics', label: 'Acrobacia', stat: 'dex' },
            { id: 'sleightOfHand', label: 'Prestidigitação', stat: 'dex' },
            { id: 'stealth', label: 'Furtividade', stat: 'dex' },
            { id: 'arcana', label: 'Arcanismo', stat: 'int' },
            { id: 'history', label: 'História', stat: 'int' },
            { id: 'investigation', label: 'Investigação', stat: 'int' },
            { id: 'nature', label: 'Natureza', stat: 'int' },
            { id: 'religion', label: 'Religião', stat: 'int' },
            { id: 'insight', label: 'Intuição', stat: 'wis' },
            { id: 'medicine', label: 'Medicina', stat: 'wis' },
            { id: 'perception', label: 'Percepção', stat: 'wis' },
            { id: 'survival', label: 'Sobrevivência', stat: 'wis' },
            { id: 'animalHandling', label: 'Adestrar Animais', stat: 'wis' },
            { id: 'deception', label: 'Enganação', stat: 'cha' },
            { id: 'intimidation', label: 'Intimidação', stat: 'cha' },
            { id: 'performance', label: 'Atuação', stat: 'cha' },
            { id: 'persuasion', label: 'Persuasão', stat: 'cha' }
        ];
    }

    template() {
        const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const labels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
        
        return `
            <div class="page legacy-sheet-container" 
                 ondragover="event.preventDefault(); event.dataTransfer.dropEffect = 'copy';"
                 ondrop="this.dispatchEvent(new CustomEvent('vaultDrop', {detail: event.dataTransfer.getData('text/plain')}))">
                
                <!-- ════ HEADER SECTION ════ -->
                <header style="display:flex; gap:30px; margin-bottom:40px; align-items:flex-end; flex-wrap:wrap;">
                    <div class="portrait-box-legacy" style="width:220px; height:280px; border:2px solid var(--sheet-border-color); cursor:pointer;" data-action="triggerPortrait">
                        <div id="portrait-preview" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
                            ${this._portraitData ? `<img src="${this._portraitData}" style="width:100%; height:100%; object-fit:cover;">` : '<i class="fa-solid fa-user-shield fa-3x" style="opacity:0.2;"></i>'}
                        </div>
                        <div style="position:absolute; bottom:0; width:100%; text-align:center; font-size:0.5rem; font-weight:900; background:rgba(255,255,255,0.7); padding:4px; color:#111;">TROCAR IMAGEM</div>
                        <input type="file" id="portrait-input" style="display:none;" accept="image/*">
                    </div>

                    <div style="flex:1; min-width:300px; display:flex; flex-direction:column; gap:20px;">
                        <div style="border-bottom: 2px solid var(--sheet-border-color); padding-bottom:5px;">
                            <input class="legacy-input" type="text" id="input-hero-name" name="name" placeholder="NOME DO PERSONAGEM" style="font-size:2.5rem; font-weight:900; font-family:'Cinzel';">
                        </div>
                        <div class="grid grid-3" style="background:var(--sheet-accent); padding:15px; border:1px solid var(--sheet-border-color); border-radius:8px; gap:15px;">
                            <div class="form-group"><label class="attr-label">CLASSE & NÍVEL</label><input class="legacy-input" name="class" placeholder="Guerreiro 1"></div>
                            <div class="form-group"><label class="attr-label">ANTECEDENTE</label><input class="legacy-input" name="background"></div>
                            <div class="form-group"><label class="attr-label">JOGADOR</label><input class="legacy-input" name="playerName"></div>
                            <div class="form-group"><label class="attr-label">RAÇA</label><input class="legacy-input" name="race"></div>
                            <div class="form-group"><label class="attr-label">TENDÊNCIA</label><input class="legacy-input" name="alignment"></div>
                            <div class="form-group"><label class="attr-label">XP</label><input class="legacy-input" type="number" name="xp" value="0"></div>
                        </div>
                    </div>
                </header>

                <!-- ════ TABS ════ -->
                <nav class="sheet-tabs">
                    <button class="sheet-tab-btn ${this._currentTab === 'core' ? 'active' : ''}" data-action="switchTab" data-tab="core">ESSÊNCIA & COMBATE</button>
                    <button class="sheet-tab-btn ${this._currentTab === 'bio' ? 'active' : ''}" data-action="switchTab" data-tab="bio">HISTÓRIA & POSSES</button>
                    <button class="sheet-tab-btn ${this._currentTab === 'spells' ? 'active' : ''}" data-action="switchTab" data-tab="spells">GRIMÓRIO ARCANO</button>
                    <button class="sheet-tab-btn ${this._currentTab === 'card' ? 'active' : ''}" data-action="switchTab" data-tab="card">CARD AVATAR</button>
                </nav>

                <form id="hero-form" style="margin-bottom:60px;">
                    <!-- ════ TAB I: CORE ════ -->
                    <div class="tab-content ${this._currentTab === 'core' ? 'active' : ''}">
                        <div style="display:grid; grid-template-columns: 80px 220px 1fr 280px; gap:20px;">
                            
                            <!-- COL 1: ATTRS -->
                            <div style="display:flex; flex-direction:column; gap:18px; padding-top:10px;">
                                ${stats.map(s => `
                                    <div class="attr-box">
                                        <label class="attr-label">${labels[s]}</label>
                                        <input class="attr-score-input" type="number" name="stat_${s}" value="10">
                                        <div class="attr-modifier-bubble" id="mod-${s}">+0</div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- COL 2: SAVES & SKILLS -->
                            <div style="display:flex; flex-direction:column; gap:20px;">
                                <div class="skills-list">
                                    <div class="skill-row" style="margin-bottom:10px;">
                                        <input type="checkbox" name="inspiration">
                                        <span style="font-weight:900; font-size:0.65rem; margin-left:5px;">INSPIRAÇÃO</span>
                                    </div>
                                    <div class="skill-row">
                                        <input type="number" name="proficiencyBonus" value="2" style="width:30px; text-align:center; font-weight:900; border:1px solid var(--sheet-border-color); border-radius:3px;">
                                        <span style="font-weight:900; font-size:0.65rem; margin-left:5px;">PROFICIÊNCIA</span>
                                    </div>
                                </div>

                                <div class="skills-list">
                                    <label class="sheet-section-title">TESTES DE RESISTÊNCIA</label>
                                    ${stats.map(s => `
                                        <div class="skill-row">
                                            <input type="checkbox" name="save_${s}">
                                            <span id="save-val-${s}" style="width:22px; font-weight:800; border-bottom:1px solid var(--sheet-border-color); text-align:center;">+0</span>
                                            <span style="flex:1;">${labels[s]}</span>
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="skills-list" style="max-height:400px; overflow-y:auto; scrollbar-width:none;">
                                    <label class="sheet-section-title">PERÍCIAS</label>
                                    ${this._skills.map(sk => `
                                        <div class="skill-row">
                                            <input type="checkbox" name="skill_${sk.id}">
                                            <span id="skill-val-${sk.id}" style="width:22px; font-weight:800; border-bottom:1px solid var(--sheet-border-color); text-align:center;">+0</span>
                                            <span style="flex:1;">${sk.label} <small style="opacity:0.5;">(${labels[sk.stat]})</small></span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- COL 3: COMBAT -->
                            <div style="display:flex; flex-direction:column; gap:20px;">
                                <div class="grid grid-3" style="gap:10px;">
                                    <div class="combat-box"><label class="combat-label">CA</label><input type="number" name="ac" value="10"></div>
                                    <div class="combat-box"><label class="combat-label">INICIATIVA</label><input type="number" name="initiative" value="0"></div>
                                    <div class="combat-box"><label class="combat-label">DESLOC.</label><input type="number" name="speed" value="30"></div>
                                </div>

                                <div class="hp-container">
                                    <span class="hp-label-float">PONTOS DE VIDA</span>
                                    <div style="display:flex; justify-content:space-around; align-items:center;">
                                        <div style="text-align:center;">
                                            <label class="attr-label">MÁXIMO</label>
                                            <input type="number" name="hp_max" value="10" style="width:60px; font-size:1.2rem; text-align:center; border:none; background:transparent;">
                                        </div>
                                        <div style="text-align:center;">
                                            <label class="attr-label">ATUAL</label>
                                            <input type="number" name="hp_current" value="10" style="width:80px; font-size:1.8rem; text-align:center; border:none; font-weight:900; background:transparent;">
                                        </div>
                                    </div>
                                    <div style="margin-top:10px; border-top:1px solid rgba(0,0,0,0.1); padding-top:10px; text-align:center;">
                                        <label class="attr-label">TEMPORÁRIOS</label>
                                        <input type="number" name="hp_temp" value="0" style="width:100%; text-align:center; border:none; background:transparent;">
                                    </div>
                                </div>

                                <div class="grid grid-2" style="gap:15px;">
                                    <div class="combat-box">
                                        <label class="combat-label">DADOS DE VIDA</label>
                                        <div style="display:flex; gap:4px;">
                                            <input name="hit_dice_total" placeholder="T" style="font-size:0.9rem;">
                                            <input name="hit_dice_rem" placeholder="A" style="font-size:0.9rem;">
                                        </div>
                                    </div>
                                    <div class="combat-box">
                                        <label class="combat-label">TESTES MORTE</label>
                                        <div style="display:flex; flex-direction:column; gap:2px; align-items:center;">
                                            <div style="display:flex; gap:2px;">S <input type="checkbox" name="death_s1"><input type="checkbox" name="death_s2"><input type="checkbox" name="death_s3"></div>
                                            <div style="display:flex; gap:2px;">F <input type="checkbox" name="death_f1"><input type="checkbox" name="death_f2"><input type="checkbox" name="death_f3"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="skills-list">
                                    <label class="sheet-section-title">ATAQUES & CONJURAÇÃO</label>
                                    <div id="attacks-container" style="max-height:180px; overflow-y:auto; margin-bottom:10px;">
                                        ${this._renderAttackRows()}
                                    </div>
                                    <button type="button" class="btn btn-ghost btn-sm btn-block" data-action="addAttackRow">+ ADICIONAR ATAQUE</button>
                                    <textarea class="legacy-textarea" name="attack_notes" placeholder="Notas de combate..." style="margin-top:10px; min-height:60px;"></textarea>
                                </div>
                            </div>

                            <!-- COL 4: SENSES & OTHER -->
                            <div style="display:flex; flex-direction:column; gap:20px;">
                                <div class="skills-list" style="background:var(--sheet-accent);">
                                    <div class="flex justify-between" style="border-bottom:1px solid var(--sheet-border-color); padding:5px 0;">
                                        <span style="font-size:0.6rem; font-weight:900;">PERCEPÇÃO PASSIVA</span>
                                        <strong id="pass-perc">10</strong>
                                    </div>
                                    <div class="flex justify-between" style="border-bottom:1px solid var(--sheet-border-color); padding:5px 0;">
                                        <span style="font-size:0.6rem; font-weight:900;">INVESTIGAÇÃO PASSIVA</span>
                                        <strong id="pass-invest">10</strong>
                                    </div>
                                    <div class="flex justify-between" style="margin-bottom:10px; padding:5px 0;">
                                        <span style="font-size:0.6rem; font-weight:900;">INTUIÇÃO PASSIVA</span>
                                        <strong id="pass-insight">10</strong>
                                    </div>

                                    <div style="background:rgba(0,0,0,0.05); padding:8px; border-radius:5px; margin-bottom:10px;">
                                        <label class="attr-label" style="text-align:left; color:var(--primary);">STATUS CONJURAÇÃO</label>
                                        <div style="font-size:0.65rem;">DC: <strong id="spell-dc-val">10/10/10</strong></div>
                                        <div style="font-size:0.65rem;">ATK: <strong id="spell-atk-val">+2/+2/+2</strong></div>
                                    </div>

                                    <div class="flex justify-between">
                                        <span style="font-size:0.6rem; font-weight:900;">CAPACIDADE CARGA</span>
                                        <strong id="carry-cap">150 lb.</strong>
                                    </div>
                                </div>

                                <div class="skills-list" style="flex:1; display:flex; flex-direction:column;">
                                    <label class="sheet-section-title">PROFICIÊNCIAS & IDIOMAS</label>
                                    <textarea class="legacy-textarea" name="other_profs" style="flex:1;"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ════ TAB II: BIO ════ -->
                    <div class="tab-content ${this._currentTab === 'bio' ? 'active' : ''}">
                         <div style="display:grid; grid-template-columns: 280px 1fr 1fr; gap:20px;">
                            <div style="display:flex; flex-direction:column; gap:15px;">
                                <div class="skills-list"><label class="sheet-section-title">TRAÇOS</label><textarea class="legacy-textarea" name="traits" rows="4"></textarea></div>
                                <div class="skills-list"><label class="sheet-section-title">IDEAIS</label><textarea class="legacy-textarea" name="ideals" rows="2"></textarea></div>
                                <div class="skills-list"><label class="sheet-section-title">VÍNCULOS</label><textarea class="legacy-textarea" name="bonds" rows="2"></textarea></div>
                                <div class="skills-list"><label class="sheet-section-title">FRAQUEZAS</label><textarea class="legacy-textarea" name="flaws" rows="2"></textarea></div>
                                <div class="skills-list" style="display:grid; grid-template-columns: 40px 1fr; gap:10px; align-items:center;">
                                    <span style="font-weight:900;">PL</span> <input name="coin_pp" type="number" class="legacy-input">
                                    <span style="font-weight:900; color:#d4af37;">PO</span> <input name="coin_gp" type="number" class="legacy-input">
                                    <span style="font-weight:900; color:#aaa;">PE</span> <input name="coin_ep" type="number" class="legacy-input">
                                    <span style="font-weight:900; color:#888;">PP</span> <input name="coin_sp" type="number" class="legacy-input">
                                    <span style="font-weight:900; color:#cd7f32;">PC</span> <input name="coin_cp" type="number" class="legacy-input">
                                </div>
                            </div>
                            <div class="skills-list"><label class="sheet-section-title">EQUIPAMENTO</label><textarea class="legacy-textarea" name="items" style="height:100%; min-height:400px;"></textarea></div>
                            <div style="display:flex; flex-direction:column; gap:15px;">
                                <div class="skills-list"><label class="sheet-section-title">BIO</label><textarea class="legacy-textarea" name="bio" rows="12"></textarea></div>
                                <div class="skills-list"><label class="sheet-section-title">ALIADOS</label><textarea class="legacy-textarea" name="allies" rows="6"></textarea></div>
                            </div>
                         </div>
                    </div>

                    <!-- ════ TAB III: SPELLS ════ -->
                    <div class="tab-content ${this._currentTab === 'spells' ? 'active' : ''}">
                         <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px;">
                            ${[0,1,2,3,4,5,6,7,8,9].map(lv => `
                                <div class="skills-list">
                                    <label class="sheet-section-title">${lv === 0 ? 'TRUQUES' : lv + 'º NÍVEL'}</label>
                                    ${lv > 0 ? `
                                        <div style="display:flex; gap:5px; margin-bottom:8px;">
                                            <input type="number" name="slots_${lv}_total" placeholder="Max" style="width:50%; text-align:center; font-size:0.7rem;">
                                            <input type="number" name="slots_${lv}_used" placeholder="Uso" style="width:50%; text-align:center; font-size:0.7rem;">
                                        </div>
                                    ` : ''}
                                    <textarea class="legacy-textarea" name="spells_lvl_${lv}" rows="8" style="font-size:0.7rem;"></textarea>
                                </div>
                            `).join('')}
                         </div>
                    </div>

                    <!-- ════ TAB IV: CARD ════ -->
                    <div class="tab-content ${this._currentTab === 'card' ? 'active' : ''}">
                         <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; background:var(--sheet-accent); padding:40px; border-radius:12px;">
                             <div class="flex flex-col gap-6">
                                <div class="flex gap-4">
                                    <button type="button" class="btn ${this._cardSide === 'front' ? 'btn-primary' : 'btn-ghost'}" data-action="setCardSide" data-side="front">FRENTE</button>
                                    <button type="button" class="btn ${this._cardSide === 'back' ? 'btn-primary' : 'btn-ghost'}" data-action="setCardSide" data-side="back">VERSO</button>
                                </div>
                                
                                <div class="skills-list" style="background:white; padding:20px; border:2px solid var(--sheet-border-color);">
                                    <label class="sheet-section-title">AJUSTE DE AVATAR</label>
                                    
                                    <div class="form-group" style="margin-bottom:15px;">
                                        <div style="display:flex; justify-content:space-between;">
                                            <label class="attr-label">ESCALA (ZOOM)</label>
                                            <span style="font-size:0.7rem; font-weight:900;">${this._portraitSettings.scale.toFixed(1)}x</span>
                                        </div>
                                        <input type="range" min="0.5" max="3" step="0.1" value="${this._portraitSettings.scale}" data-action="updatePortraitSetting" data-prop="scale" style="width:100%;">
                                    </div>

                                    <div class="form-group" style="margin-bottom:15px;">
                                        <div style="display:flex; justify-content:space-between;">
                                            <label class="attr-label">POSIÇÃO X (LATERAL)</label>
                                            <span style="font-size:0.7rem; font-weight:900;">${this._portraitSettings.x}px</span>
                                        </div>
                                        <input type="range" min="-200" max="200" step="1" value="${this._portraitSettings.x}" data-action="updatePortraitSetting" data-prop="x" style="width:100%;">
                                    </div>

                                    <div class="form-group">
                                        <div style="display:flex; justify-content:space-between;">
                                            <label class="attr-label">POSIÇÃO Y (ALTURA)</label>
                                            <span style="font-size:0.7rem; font-weight:900;">${this._portraitSettings.y}px</span>
                                        </div>
                                        <input type="range" min="-200" max="200" step="1" value="${this._portraitSettings.y}" data-action="updatePortraitSetting" data-prop="y" style="width:100%;">
                                    </div>

                                    <button type="button" class="btn btn-ghost btn-sm btn-block" style="margin-top:20px;" data-action="resetPortrait">RESETAR AJUSTES</button>
                                </div>

                                <button type="button" class="btn btn-primary btn-lg" data-action="downloadCard"><i class="fa-solid fa-download"></i> EXPORTAR CARD PNG</button>
                             </div>
                             
                             <div style="display:flex; justify-content:center; align-items:start;">
                                <canvas id="card-preview" style="max-width:380px; width:100%; border-radius:12px; box-shadow:var(--shadow-lg); border:4px solid white;"></canvas>
                             </div>
                         </div>
                    </div>

                    <footer style="margin-top:40px; text-align:center;">
                        <button type="submit" class="btn btn-primary btn-lg" style="padding:15px 60px; font-size:1.2rem;">
                            <i class="fa-solid fa-bookmark"></i> ${this._editingId ? 'ATUALIZAR' : 'SALVAR'} HERÓI
                        </button>
                    </footer>
                </form>
                <!-- LIST -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                    ${this._renderPlayerList()}
                </div>
            </div>
        `;
    }

    _renderAttackRows() {
        return this._attackRows.map((atk, i) => `
            <div style="display:grid; grid-template-columns: 1fr 50px 80px 25px; gap:5px; margin-bottom:5px;">
                <input class="legacy-input atk-name" type="text" value="${atk.name || ''}" placeholder="Nome">
                <input class="legacy-input atk-bonus" type="text" value="${atk.bonus || ''}" placeholder="+5">
                <input class="legacy-input atk-damage" type="text" value="${atk.damage || ''}" placeholder="1d8">
                <button type="button" class="btn btn-danger btn-sm" data-action="removeAttackRow" data-index="${i}">✕</button>
            </div>
        `).join('');
    }

    _renderPlayerList() {
        const { players } = this.store.state;
        if (!players?.length) return '';
        return players.map(p => `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; border-left: 4px solid var(--accent);">
                <div>
                    <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent-bright);">${p.name}</h4>
                    <p style="font-size:0.7rem; margin:5px 0 0; color:var(--text-dim); text-transform:uppercase;">${p.class} • NÍVEL ${p.level || 1}</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-ghost btn-sm" style="background:rgba(255,255,255,0.05); color:#fff;" data-action="editHero" data-id="${p.id}">EDITAR</button>
                    <button class="btn btn-danger btn-sm" data-action="removePlayer" data-id="${p.id}">✕</button>
                </div>
            </div>
        `).join('');
    }

    onMount() {
        const f = this.$('#hero-form');
        if (!f) return;

        const updateAllCalculations = () => {
            const prof = parseInt(f.proficiencyBonus.value) || 2;
            const mods = {};

            ['str','dex','con','int','wis','cha'].forEach(s => {
                const val = parseInt(f[`stat_${s}`].value) || 10;
                const mod = Math.floor((val - 10) / 2);
                mods[s] = mod;
                this.$(`#mod-${s}`).textContent = mod >= 0 ? `+${mod}` : mod;

                // Save Values
                const saveVal = mod + (f[`save_${s}`].checked ? prof : 0);
                this.$(`#save-val-${s}`).textContent = saveVal >= 0 ? `+${saveVal}` : saveVal;
            });

            // Skill Values
            this._skills.forEach(sk => {
                const isProf = f[`skill_${sk.id}`].checked;
                const skillVal = mods[sk.stat] + (isProf ? prof : 0);
                this.$(`#skill-val-${sk.id}`).textContent = skillVal >= 0 ? `+${skillVal}` : skillVal;
            });

            // Passives
            const percVal = mods.wis + (f.skill_perception.checked ? prof : 0);
            const investVal = mods.int + (f.skill_investigation.checked ? prof : 0);
            const insightVal = mods.wis + (f.skill_insight.checked ? prof : 0);
            
            this.$('#pass-perc').textContent = 10 + percVal;
            this.$('#pass-invest').textContent = 10 + investVal;
            this.$('#pass-insight').textContent = 10 + insightVal;

            // Spell DC & Attack (Calculated for INT, WIS, CHA)
            const dcInt = 8 + prof + mods.int;
            const dcWis = 8 + prof + mods.wis;
            const dcCha = 8 + prof + mods.cha;
            
            const atkInt = prof + mods.int;
            const atkWis = prof + mods.wis;
            const atkCha = prof + mods.cha;

            // Carry Capacity
            const carryCap = (parseInt(f.stat_str.value) || 10) * 15; 
            this.$('#carry-cap').textContent = `${carryCap} lb.`;

            this.$('#spell-dc-val').textContent = `${dcInt} / ${dcWis} / ${dcCha}`;
            this.$('#spell-atk-val').textContent = `${atkInt >= 0 ? '+' : ''}${atkInt} / ${atkWis >= 0 ? '+' : ''}${atkWis} / ${atkCha >= 0 ? '+' : ''}${atkCha}`;

            this.previewCards();
        };

        f.oninput = () => {
            updateAllCalculations();
            this._autoSync();
        };
        updateAllCalculations();

        // Handle SRD Data Drop
        this.element.addEventListener('vaultDrop', (e) => {
            try {
                const data = JSON.parse(e.detail);
                if (data.level !== undefined) { // It's a spell
                    const targetField = f[`spells_lvl_${data.level}`];
                    if (targetField) {
                        const current = targetField.value;
                        targetField.value = current ? `${current}\n- ${data.name}` : `- ${data.name}`;
                        Toast.show(`Mágica '${data.name}' adicionada ao Grimório!`);
                    }
                } else if (data.type) { // It's an item
                    const targetField = f.items;
                    if (targetField) {
                        const current = targetField.value;
                        targetField.value = current ? `${current}\n- ${data.name} (${data.type})` : `- ${data.name} (${data.type})`;
                        Toast.show(`Item '${data.name}' adicionado ao inventário!`);
                    }
                }
            } catch (err) {
                console.error('[VaultDrop] Parse error:', err);
            }
        });

        this.$('#portrait-input').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this._portraitData = ev.target.result;
                    this.render();
                    this.previewCards();
                };
                reader.readAsDataURL(file);
            }
        };

        f.onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(f);
            const playerData = {
                name: this.$('#input-hero-name').value || 'Herói Sem Nome',
                class: fd.get('class'), race: fd.get('race'), level: parseInt(fd.get('class')?.match(/\d+/)?.[0] || 1),
                playerName: fd.get('playerName'), background: fd.get('background'), alignment: fd.get('alignment'), xp: parseInt(fd.get('xp')) || 0,
                inspiration: !!fd.get('inspiration'), proficiencyBonus: parseInt(fd.get('proficiencyBonus')) || 2,
                stats: { str: parseInt(fd.get('stat_str')), dex: parseInt(fd.get('stat_dex')), con: parseInt(fd.get('stat_con')), int: parseInt(fd.get('stat_int')), wis: parseInt(fd.get('stat_wis')), cha: parseInt(fd.get('stat_cha')) },
                savingThrows: { str: !!fd.get('save_str'), dex: !!fd.get('save_dex'), con: !!fd.get('save_con'), int: !!fd.get('save_int'), wis: !!fd.get('save_wis'), cha: !!fd.get('save_cha') },
                skills: this._skills.filter(sk => fd.get(`skill_${sk.id}`)).map(sk => sk.id),
                ac: parseInt(fd.get('ac')), initiative: parseInt(fd.get('initiative')), speed: parseInt(fd.get('speed')),
                hp: { current: parseInt(fd.get('hp_current')), max: parseInt(fd.get('hp_max')), temp: parseInt(fd.get('hp_temp')) || 0 },
                hitDice: { total: fd.get('hit_dice_total'), remaining: fd.get('hit_dice_rem') },
                deathSaves: { 
                    successes: [!!fd.get('death_s1'), !!fd.get('death_s2'), !!fd.get('death_s3')],
                    failures: [!!fd.get('death_f1'), !!fd.get('death_f2'), !!fd.get('death_f3')]
                },
                attacks: this._collectAttacks(), attackNotes: fd.get('attack_notes'),
                currency: { pp: fd.get('coin_pp'), gp: fd.get('coin_gp'), ep: fd.get('coin_ep'), sp: fd.get('coin_sp'), cp: fd.get('coin_cp') },
                roleplay: { traits: fd.get('traits'), ideals: fd.get('ideals'), bonds: fd.get('bonds'), flaws: fd.get('flaws') },
                equipment: { items: fd.get('items') }, otherProfs: fd.get('other_profs'), bio: fd.get('bio'), allies: fd.get('allies'),
                portraitData: this._portraitData,
                spells: {}, spellSlots: {}
            };

            for(let i=0; i<=9; i++) {
                playerData.spells[`lvl${i}`] = fd.get(`spells_lvl_${i}`);
                if(i > 0) playerData.spellSlots[i] = { total: parseInt(fd.get(`slots_${i}_total`)) || 0, used: parseInt(fd.get(`slots_${i}_used`)) || 0 };
            }

            if (this._editingId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) s.players[idx] = { ...s.players[idx], ...playerData };
                });
                Toast.show('Ficha atualizada com sucesso!');
            } else {
                const player = Schemas.createPlayer(playerData);
                TOME.store.update(s => s.players = [...s.players, player]);
                Toast.show('Nova lenda registrada!');
            }

            // Forçar sincronização imediata com o servidor
            const persistence = TOME.get('persistence');
            if (persistence) persistence.forceSave();

            this.resetForm();
        };

        this.previewCards();
    }

    _autoSync() {
        if (!this._editingId) return;
        clearTimeout(this._syncTimer);
        this._syncTimer = setTimeout(() => {
            const data = this._collectFormData();
            TOME.store.update(s => {
                const idx = s.players.findIndex(p => p.id === this._editingId);
                if (idx !== -1) s.players[idx] = { ...s.players[idx], ...data };
            });
        }, 1000); // 1s debounce
    }

    _collectFormData() {
        const f = this.$('#hero-form');
        const fd = new FormData(f);
        return {
            name: this.$('#input-hero-name').value || 'Herói Sem Nome',
            class: fd.get('class'), race: fd.get('race'), level: parseInt(fd.get('class')?.match(/\d+/)?.[0] || 1),
            playerName: fd.get('playerName'), background: fd.get('background'), alignment: fd.get('alignment'), xp: parseInt(fd.get('xp')) || 0,
            inspiration: !!fd.get('inspiration'), proficiencyBonus: parseInt(fd.get('proficiencyBonus')) || 2,
            stats: { str: parseInt(fd.get('stat_str')), dex: parseInt(fd.get('stat_dex')), con: parseInt(fd.get('stat_con')), int: parseInt(fd.get('stat_int')), wis: parseInt(fd.get('stat_wis')), cha: parseInt(fd.get('stat_cha')) },
            savingThrows: { str: !!fd.get('save_str'), dex: !!fd.get('save_dex'), con: !!fd.get('save_con'), int: !!fd.get('save_int'), wis: !!fd.get('save_wis'), cha: !!fd.get('save_cha') },
            skills: this._skills.filter(sk => fd.get(`skill_${sk.id}`)).map(sk => sk.id),
            ac: parseInt(fd.get('ac')), initiative: parseInt(fd.get('initiative')), speed: parseInt(fd.get('speed')),
            hp: { current: parseInt(fd.get('hp_current')), max: parseInt(fd.get('hp_max')), temp: parseInt(fd.get('hp_temp')) || 0 },
            hitDice: { total: fd.get('hit_dice_total'), remaining: fd.get('hit_dice_rem') },
            deathSaves: { 
                successes: [!!fd.get('death_s1'), !!fd.get('death_s2'), !!fd.get('death_s3')],
                failures: [!!fd.get('death_f1'), !!fd.get('death_f2'), !!fd.get('death_f3')]
            },
            attacks: this._collectAttacks(), attackNotes: fd.get('attack_notes'),
            currency: { pp: fd.get('coin_pp'), gp: fd.get('coin_gp'), ep: fd.get('coin_ep'), sp: fd.get('coin_sp'), cp: fd.get('coin_cp') },
            roleplay: { traits: fd.get('traits'), ideals: fd.get('ideals'), bonds: fd.get('bonds'), flaws: fd.get('flaws') },
            equipment: { items: fd.get('items') }, otherProfs: fd.get('other_profs'), bio: fd.get('bio'), allies: fd.get('allies'),
            portraitData: this._portraitData,
            portraitSettings: this._portraitSettings,
            spells: Object.fromEntries([0,1,2,3,4,5,6,7,8,9].map(i => [`lvl${i}`, fd.get(`spells_lvl_${i}`)])),
            spellSlots: Object.fromEntries([1,2,3,4,5,6,7,8,9].map(i => [i, { total: parseInt(fd.get(`slots_${i}_total`)) || 0, used: parseInt(fd.get(`slots_${i}_used`)) || 0 }]))
        };
    }

    _collectAttacks() {
        const atks = [];
        const ns = this.$$('.atk-name');
        const bs = this.$$('.atk-bonus');
        const ds = this.$$('.atk-damage');
        ns.forEach((el, i) => { if (el.value) atks.push({ name: el.value, bonus: bs[i].value, damage: ds[i].value }); });
        return atks;
    }

    async previewCards() {
        const canvas = this.$('#card-preview');
        if (!canvas) return;
        const data = this._collectFormData();
        if (this._cardSide === 'front') await CardRenderer.renderFront(data, canvas);
        else CardRenderer.renderBack(data, canvas);
    }

    updatePortraitSetting(e, el) {
        const prop = el.dataset.prop;
        this._portraitSettings[prop] = parseFloat(el.value);
        this.previewCards();
        this._autoSync();
        // Update local displays if needed, or just let render handle it
        this.render(); 
    }

    resetPortrait() {
        this._portraitSettings = { x: 0, y: 0, scale: 1 };
        this.render();
        this.previewCards();
        this._autoSync();
    }

    setCardSide(e, el) { this._cardSide = el.dataset.side; this.render(); this.previewCards(); }
    downloadCard() { CardRenderer.download(this.$('#card-preview'), `Card_${this.$('#input-hero-name').value}.png`); }
    switchTab(e, el) { this._currentTab = el.dataset.tab; this.render(); if (this._currentTab === 'card') setTimeout(() => this.previewCards(), 50); }
    addAttackRow() { this._attackRows.push({ name: '', bonus: '', damage: '' }); this.render(); }
    removeAttackRow(e, el) { this._attackRows.splice(parseInt(el.dataset.index), 1); this.render(); }

    editHero(e, el) {
        const p = this.store.state.players.find(x => x.id === el.dataset.id);
        if (!p) return;
        this._editingId = p.id;
        this._portraitData = p.portraitData;
        this._portraitSettings = p.portraitSettings || { x: 0, y: 0, scale: 1 };
        this._attackRows = p.attacks?.length ? [...p.attacks] : [{ name: '', bonus: '', damage: '' }];
        this._currentTab = 'core';
        this.render();
        
        const f = this.$('#hero-form');
        if (!f) return;

        this.$('#input-hero-name').value = p.name || '';
        if (f.class) f.class.value = p.class || '';
        if (f.playerName) f.playerName.value = p.playerName || '';
        if (f.race) f.race.value = p.race || '';
        if (f.background) f.background.value = p.background || '';
        if (f.alignment) f.alignment.value = p.alignment || '';
        if (f.xp) f.xp.value = p.xp || 0;
        if (f.inspiration) f.inspiration.checked = !!p.inspiration;
        if (f.proficiencyBonus) f.proficiencyBonus.value = p.proficiencyBonus || 2;
        if (f.ac) f.ac.value = p.ac || 10;
        if (f.initiative) f.initiative.value = p.initiative || 0;
        if (f.speed) f.speed.value = p.speed || 30;
        if (f.hp_max) f.hp_max.value = p.hp?.max || 10;
        if (f.hp_current) f.hp_current.value = p.hp?.current || 10;
        if (f.hp_temp) f.hp_temp.value = p.hp?.temp || 0;
        if (f.hit_dice_total) f.hit_dice_total.value = p.hitDice?.total || '';
        if (f.hit_dice_rem) f.hit_dice_rem.value = p.hitDice?.remaining || '';
        
        if (p.deathSaves && f.death_s1) {
            f.death_s1.checked = !!p.deathSaves.successes[0]; f.death_s2.checked = !!p.deathSaves.successes[1]; f.death_s3.checked = !!p.deathSaves.successes[2];
            f.death_f1.checked = !!p.deathSaves.failures[0]; f.death_f2.checked = !!p.deathSaves.failures[1]; f.death_f3.checked = !!p.deathSaves.failures[2];
        }
        if (f.traits) f.traits.value = p.roleplay?.traits || '';
        if (f.ideals) f.ideals.value = p.roleplay?.ideals || '';
        if (f.bonds) f.bonds.value = p.roleplay?.bonds || '';
        if (f.flaws) f.flaws.value = p.roleplay?.flaws || '';
        
        if (f.items) f.items.value = p.equipment?.items || '';
        f.bio.value = p.bio || ''; f.allies.value = p.allies || '';
        f.attack_notes.value = p.attackNotes || ''; f.other_profs.value = p.otherProfs || '';
        if (p.currency) { f.coin_pp.value = p.currency.pp; f.coin_gp.value = p.currency.gp; f.coin_ep.value = p.currency.ep; f.coin_sp.value = p.currency.sp; f.coin_cp.value = p.currency.cp; }

        ['str','dex','con','int','wis','cha'].forEach(s => { f[`stat_${s}`].value = p.stats?.[s] || 10; f[`save_${s}`].checked = !!p.savingThrows?.[s]; });
        p.skills?.forEach(sk => { if (f[`skill_${sk}`]) f[`skill_${sk}`].checked = true; });
        for(let i=0; i<=9; i++) {
            if (f[`spells_lvl_${i}`]) f[`spells_lvl_${i}`].value = p.spells?.[`lvl${i}`] || '';
            if (i > 0 && p.spellSlots?.[i]) { f[`slots_${i}_total`].value = p.spellSlots[i].total; f[`slots_${i}_used`].value = p.spellSlots[i].used; }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetForm() { this._editingId = null; this._portraitData = null; this._portraitSettings = { x: 0, y: 0, scale: 1 }; this._attackRows = [{ name: '', bonus: '', damage: '' }]; this._currentTab = 'core'; this.render(); }
    removePlayer(e, el) { if (confirm('Deletar lenda?')) TOME.store.update(s => { s.players = s.players.filter(p => p.id !== el.dataset.id); }); }
    triggerPortrait() { this.$('#portrait-input').click(); }
}
