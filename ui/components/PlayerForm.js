import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Schemas } from '../../data/schemas.js';
import { CardRenderer } from '../../services/CardRenderer.js';
import { exportFrontBackPNG } from '../utils/imageExport.js';
import { PersistenceService } from '../../services/PersistenceService.js';

/**
 * PLAYER FORM v11.1 — "THE ULTIMATE 5E LEGACY SHEET"
 * Full D&D 5e mechanics, real-time calculations, premium UX,
 * full value persistence, and interactive PDF import.
 */
export class PlayerForm extends Component {
    constructor(opts) {
        super(opts);
        this._portraitData = null;
        this._portraitSettings = { x: 0, y: 0, scale: 1 };
        this._inventoryRows = [{ name: '', qty: 1, weight: 0 }];
        this._attackRows = [{ name: '', bonus: '', damage: '' }];
        this._currentTab = 'core';
        this._cardSide = 'front';
        this._draftData = null; // Temporary form draft to prevent data loss on new hero creation
        
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

    get _editingId() {
        return this.store?.state?.editingHeroId || null;
    }

    template() {
        const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const labels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
        
        // Find player if editing, otherwise fall back to draft data
        const editingPlayer = this._editingId ? this.store.state.players.find(p => p.id === this._editingId) : null;
        const p = editingPlayer || this._draftData || {};

        return `
            <div class="page legacy-sheet-container" style="max-width:1400px; margin: 0 auto; animation: fadeIn 0.5s ease-out;">
                <form id="hero-form" onsubmit="return false;">
                
                ${this._editingId ? `
                    <div class="edit-mode-banner" style="background:linear-gradient(90deg, var(--accent), #f39c12); color:#000; padding:10px; text-align:center; font-weight:900; font-family:'Cinzel'; margin-bottom:20px; border-radius:8px; border:2px solid #000; display:flex; justify-content:space-between; align-items:center;">
                        <span><i class="fa-solid fa-pen-fancy"></i> MODO EDIÇÃO: ${p.name || 'Herói'}</span>
                        <button class="btn btn-ghost btn-sm" style="color:#000; border:1px solid #000;" data-action="resetForm">CANCELAR / NOVO</button>
                    </div>
                ` : ''}
                
                <!-- ════ HEADER SECTION (D&D 5E OFFICIAL LAYOUT) ════ -->
                <div style="margin-bottom:20px;">
                    <button type="button" class="btn btn-ghost" data-action="closeBuilder"><i class="fa-solid fa-arrow-left"></i> Voltar para Monitoria</button>
                </div>
                <header style="display:grid; grid-template-columns: 300px 1fr; gap:40px; margin-bottom:40px; align-items:end;">
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <div class="portrait-box-legacy" style="height:350px; border:var(--sheet-border-thick); border-radius:15px; position:relative; overflow:hidden; background:rgba(0,0,0,0.2); cursor:pointer;" data-action="triggerPortrait">
                            <div id="portrait-preview" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                ${this._portraitData ? `<img src="${this._portraitData}" style="width:100%; height:100%; object-fit:cover; transform: scale(${this._portraitSettings.scale || 1}) translate(${this._portraitSettings.x || 0}px, ${this._portraitSettings.y || 0}px); transition: transform 0.1s ease-out;">` : '<i class="fa-solid fa-user-shield fa-4x" style="color:rgba(197, 160, 89, 0.2);"></i>'}
                            </div>
                            <span style="position:absolute; bottom:10px; width:100%; text-align:center; font-size:0.6rem; font-weight:800; background:rgba(0,0,0,0.6); color:var(--sheet-label-color);">MUDAR RETRATO</span>
                            <input type="file" id="portrait-input" style="display:none;" accept="image/*">
                        </div>
                        
                        <!-- PORTRAIT CONTROLS -->
                        <div class="skills-list" style="padding:10px; font-size:0.6rem; display:${this._portraitData ? 'flex' : 'none'}; flex-direction:column; gap:5px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                                <label style="font-weight:800;">CONTROLE DE FOTO</label>
                                <button type="button" class="btn btn-ghost btn-sm" style="font-size:0.5rem; padding:2px 5px;" data-action="resetPortrait">CENTRALIZAR</button>
                            </div>
                            <label>ZOOM: <input type="range" min="0.5" max="3" step="0.1" value="${this._portraitSettings.scale || 1}" data-action="updatePortrait" data-key="scale"></label>
                            <label>POS X: <input type="range" min="-200" max="200" step="1" value="${this._portraitSettings.x || 0}" data-action="updatePortrait" data-key="x"></label>
                            <label>POS Y: <input type="range" min="-200" max="200" step="1" value="${this._portraitSettings.y || 0}" data-action="updatePortrait" data-key="y"></label>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <div style="border-bottom: var(--sheet-border-thick); padding-bottom:5px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                            <input class="legacy-input" type="text" id="input-hero-name" name="name" value="${p.name || ''}" placeholder="NOME DO PERSONAGEM" style="font-size:3rem; flex:1; font-family:var(--sheet-font-header); font-weight:900;">
                            <div style="display:flex; gap:5px;">
                                <button type="button" class="btn btn-ghost" style="border:1px solid rgba(197, 160, 89, 0.3); font-size:0.6rem;" data-action="openImporter" title="Importar PDF/Texto">📥 PDF/Texto</button>
                                <button type="button" class="btn btn-ghost" style="border:1px solid rgba(197, 160, 89, 0.3); font-size:0.6rem;" data-action="importHeroJSON" title="Importar JSON">📂 JSON</button>
                                <button type="button" class="btn btn-ghost" style="border:1px solid rgba(197, 160, 89, 0.3); font-size:0.6rem;" data-action="downloadHeroJSON" title="Exportar JSON">💾 JSON</button>
                                <button type="button" class="btn btn-ghost" style="border:1px solid rgba(197, 160, 89, 0.3); font-size:0.6rem; color:var(--accent);" data-action="printOfficialSheet" title="Imprimir PDF Oficial D&D 5e">🖨️ Imprimir</button>
                                <button type="button" class="btn btn-ghost" style="border:1px solid rgba(197, 160, 89, 0.3); font-size:0.6rem; color:var(--danger);" data-action="cloneToBestiary" title="Clonar para Bestiário">😈 NPC</button>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; background:rgba(0,0,0,0.2); padding:20px; border:var(--sheet-border-thick); border-radius:10px;">
                            <div class="form-group"><label class="attr-label">CLASSE</label><input class="legacy-input" name="class" value="${p.class || ''}" placeholder="Bardo"></div>
                            <div class="form-group"><label class="attr-label">NÍVEL</label><input class="legacy-input" type="number" name="level" min="1" max="20" value="${p.level || 1}"></div>
                            <div class="form-group"><label class="attr-label">ANTECEDENTE</label><input class="legacy-input" name="background" value="${p.background || ''}" placeholder="Charlatão"></div>
                            <div class="form-group"><label class="attr-label">NOME DO JOGADOR</label><input class="legacy-input" name="playerName" value="${p.playerName || ''}"></div>
                            
                            <div class="form-group"><label class="attr-label">RAÇA</label><input class="legacy-input" name="race" value="${p.race || ''}" placeholder="Draconato"></div>
                            <div class="form-group"><label class="attr-label">TENDÊNCIA</label><input class="legacy-input" name="alignment" value="${p.alignment || ''}" placeholder="Caótico e Bom"></div>
                            <div class="form-group"><label class="attr-label">PONTOS DE EXPERIÊNCIA</label><input class="legacy-input" type="number" name="xp" value="${p.xp || 0}"></div>
                            <div class="form-group" style="display:flex; align-items:end; justify-content:center; font-size:0.75rem; font-weight:800; font-family:'Outfit'; letter-spacing:1px; color:var(--accent); text-transform:uppercase;">DOMÍNIO RPG 5E</div>
                        </div>
                    </div>
                </header>

                <!-- ════ TAB NAVIGATION ════ -->
                <nav class="sheet-tabs" style="justify-content:center; gap:20px; border-bottom:3px solid var(--sheet-border-color); margin-bottom:40px;">
                    <button type="button" class="sheet-tab-btn ${this._currentTab === 'core' ? 'active' : ''}" data-action="switchTab" data-tab="core">ESSÊNCIA & COMBATE</button>
                    <button type="button" class="sheet-tab-btn ${this._currentTab === 'bio' ? 'active' : ''}" data-action="switchTab" data-tab="bio">HISTÓRIA & POSSES</button>
                    <button type="button" class="sheet-tab-btn ${this._currentTab === 'spells' ? 'active' : ''}" data-action="switchTab" data-tab="spells">GRIMÓRIO ARCANO</button>
                    <button type="button" class="sheet-tab-btn ${this._currentTab === 'card' ? 'active' : ''}" data-action="switchTab" data-tab="card">VI. CARD AVATAR</button>
                </nav>

                <!-- ════ TAB I: CORE ════ -->
                <div data-tab-content="core" class="tab-content ${this._currentTab === 'core' ? 'active' : ''}">
                    <div style="display:grid; grid-template-columns: 100px 240px 1fr 300px; gap:30px;">
                        
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            ${stats.map(s => {
                                const val = p.stats?.[s] !== undefined ? p.stats[s] : 10;
                                return `
                                    <div class="attr-box" style="height:90px; padding:10px;">
                                        <label class="attr-label" style="font-size:0.6rem;">${labels[s]}</label>
                                        <input class="attr-score-input" type="number" name="stat_${s}" value="${val}" style="font-size:1.4rem;">
                                        <div class="attr-modifier-bubble" id="mod-${s}" style="bottom:-15px; font-size:0.8rem; width:35px; height:25px;">+0</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>

                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <div class="skills-list" style="padding:15px;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                                    <div style="border:var(--sheet-border-thick); width:30px; height:30px; border-radius:5px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3);">
                                        <input type="checkbox" name="inspiration" ${p.inspiration ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                                    </div>
                                    <label class="attr-label" style="margin:0;">INSPIRAÇÃO</label>
                                </div>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <div style="border:var(--sheet-border-thick); width:30px; height:30px; border-radius:5px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3);">
                                        <input type="number" name="proficiencyBonus" value="${p.proficiencyBonus || 2}" style="width:100%; border:none; text-align:center; font-weight:900; background:transparent; color:#fff;">
                                    </div>
                                    <label class="attr-label" style="margin:0;">BÔNUS DE PROFICIÊNCIA</label>
                                </div>
                            </div>

                            <div class="skills-list">
                                <label class="sheet-section-title" style="font-size:0.7rem;">TESTES DE RESISTÊNCIA</label>
                                ${stats.map(s => {
                                    const isChecked = p.savingThrows?.[s] ? 'checked' : '';
                                    return `
                                        <div class="skill-row" style="padding:4px 0;">
                                            <input type="checkbox" name="save_${s}" ${isChecked} style="cursor:pointer;">
                                            <span id="save-val-${s}" style="width:25px; text-align:center; font-weight:800; font-size:0.7rem; border-bottom:1px solid rgba(197, 160, 89, 0.3); color:#fff;">+0</span>
                                            <span style="flex:1; font-size:0.75rem;">${labels[s]}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <div class="skills-list">
                                <label class="sheet-section-title" style="font-size:0.7rem;">PERÍCIAS</label>
                                ${this._skills.map(sk => {
                                    const isChecked = p.skills?.includes(sk.id) ? 'checked' : '';
                                    return `
                                        <div class="skill-row" id="row-skill-${sk.id}">
                                            <input type="checkbox" name="skill_${sk.id}" data-action="onSkillToggle" ${isChecked} style="cursor:pointer;">
                                            <span id="skill-val-${sk.id}" style="width:25px; text-align:center; font-weight:800; font-size:0.7rem; border-bottom:1px solid rgba(197, 160, 89, 0.3); color:#fff;">+0</span>
                                            <span style="flex:1; font-size:0.75rem;">${sk.label} <small style="opacity:0.5;">(${labels[sk.stat]})</small></span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                                <div class="combat-box"><label class="combat-label">CA</label><input type="number" name="ac" value="${p.ac !== undefined ? p.ac : 10}"></div>
                                <div class="combat-box"><label class="combat-label">INICIATIVA</label><input type="number" name="initiative" value="${p.initiative || 0}"></div>
                                <div class="combat-box"><label class="combat-label">DESLOC.</label><input type="number" name="speed" value="${p.speed !== undefined ? p.speed : 30}"></div>
                            </div>

                            <div class="hp-container" style="padding:15px;">
                                <span class="hp-label-float">PONTOS DE VIDA</span>
                                <div style="display:flex; justify-content:space-around; align-items:center;">
                                    <div style="text-align:center;">
                                        <label class="attr-label" style="font-size:0.5rem;">MÁXIMO</label>
                                        <input type="number" name="hp_max" value="${p.hp?.max !== undefined ? p.hp.max : 10}" style="width:60px; font-size:1.5rem; text-align:center; border:none; border-bottom:1px solid rgba(197, 160, 89, 0.3); background:transparent; color:#fff;">
                                    </div>
                                    <div style="text-align:center;">
                                        <label class="attr-label" style="font-size:0.5rem;">ATUAL</label>
                                        <input type="number" name="hp_current" value="${p.hp?.current !== undefined ? p.hp.current : 10}" style="width:80px; font-size:2rem; text-align:center; border:none; font-weight:900; background:transparent; color:#fff;">
                                    </div>
                                </div>
                                <div style="margin-top:10px; border-top:1px solid rgba(197, 160, 89, 0.2); padding-top:10px; text-align:center;">
                                    <label class="attr-label" style="font-size:0.5rem;">PONTOS DE VIDA TEMPORÁRIOS</label>
                                    <input type="number" name="hp_temp" value="${p.hp?.temp || 0}" style="width:100%; text-align:center; border:none; background:transparent; color:#fff;">
                                </div>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div class="skills-list" style="padding:10px;">
                                    <label class="attr-label" style="font-size:0.5rem;">DADOS DE VIDA</label>
                                    <div style="display:flex; gap:5px;">
                                        <input name="hit_dice_total" value="${p.hitDice?.total || ''}" placeholder="Total" style="width:100%; font-size:0.8rem; text-align:center; background:transparent; color:#fff; border:none; border-bottom:1px solid rgba(197, 160, 89, 0.3);">
                                        <input name="hit_dice_rem" value="${p.hitDice?.remaining || ''}" placeholder="Rest" style="width:100%; font-size:0.8rem; text-align:center; background:transparent; color:#fff; border:none; border-bottom:1px solid rgba(197, 160, 89, 0.3);">
                                    </div>
                                </div>
                                <div class="skills-list" style="padding:10px;">
                                    <label class="attr-label" style="font-size:0.5rem;">TESTES CONTRA A MORTE</label>
                                    <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                                        <div style="display:flex; gap:3px;">
                                            <small>S</small>
                                            <input type="checkbox" name="death_s1" ${p.deathSaves?.successes?.[0] ? 'checked' : ''} style="cursor:pointer;">
                                            <input type="checkbox" name="death_s2" ${p.deathSaves?.successes?.[1] ? 'checked' : ''} style="cursor:pointer;">
                                            <input type="checkbox" name="death_s3" ${p.deathSaves?.successes?.[2] ? 'checked' : ''} style="cursor:pointer;">
                                        </div>
                                        <div style="display:flex; gap:3px;">
                                            <small>F</small>
                                            <input type="checkbox" name="death_f1" ${p.deathSaves?.failures?.[0] ? 'checked' : ''} style="cursor:pointer;">
                                            <input type="checkbox" name="death_f2" ${p.deathSaves?.failures?.[1] ? 'checked' : ''} style="cursor:pointer;">
                                            <input type="checkbox" name="death_f3" ${p.deathSaves?.failures?.[2] ? 'checked' : ''} style="cursor:pointer;">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="skills-list" style="padding:15px;">
                                <label class="sheet-section-title">ATAQUES & CONJURAÇÃO</label>
                                <div id="attacks-container">${this._renderAttackRows()}</div>
                                <div style="display:flex; gap:10px; margin-top:10px;">
                                    <button type="button" class="btn btn-ghost btn-sm" style="flex:1;" data-action="addAttackRow">+ ATAQUE</button>
                                </div>
                                <textarea class="legacy-textarea" name="attack_notes" placeholder="Notas de combate..." rows="4" style="margin-top:10px; font-size:0.7rem;">${p.attackNotes || ''}</textarea>
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
                                <textarea class="legacy-textarea" name="other_profs" style="height:100%; font-size:0.75rem;">${p.otherProfs || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ════ TAB II: BIO & INVENTORY ════ -->
                <div class="tab-content ${this._currentTab === 'bio' ? 'active' : ''}">
                     <div style="display:grid; grid-template-columns: 350px 1fr 1fr; gap:30px;">
                        <div style="display:flex; flex-direction:column; gap:15px;">
                            <div class="skills-list"><label class="sheet-section-title">TRAÇOS</label><textarea class="legacy-textarea" name="traits" rows="4">${p.roleplay?.traits || ''}</textarea></div>
                            <div class="skills-list"><label class="sheet-section-title">IDEAIS</label><textarea class="legacy-textarea" name="ideals" rows="2">${p.roleplay?.ideals || ''}</textarea></div>
                            <div class="skills-list"><label class="sheet-section-title">VÍNCULOS</label><textarea class="legacy-textarea" name="bonds" rows="2">${p.roleplay?.bonds || ''}</textarea></div>
                            <div class="skills-list"><label class="sheet-section-title">FRAQUEZAS</label><textarea class="legacy-textarea" name="flaws" rows="2">${p.roleplay?.flaws || ''}</textarea></div>
                            
                            <div class="skills-list" style="padding:15px; display:grid; grid-template-columns: 40px 1fr; gap:10px; align-items:center;">
                                <span style="font-weight:900; color:var(--accent);">PL</span> <input name="coin_pp" type="number" class="legacy-input" style="text-align:right;" value="${p.currency?.pp !== undefined ? p.currency.pp : ''}">
                                <span style="font-weight:900; color:goldenrod;">PO</span> <input name="coin_gp" type="number" class="legacy-input" style="text-align:right;" value="${p.currency?.gp !== undefined ? p.currency.gp : ''}">
                                <span style="font-weight:900; color:silver;">PE</span> <input name="coin_ep" type="number" class="legacy-input" style="text-align:right;" value="${p.currency?.ep !== undefined ? p.currency.ep : ''}">
                                <span style="font-weight:900; color:brown;">PP</span> <input name="coin_sp" type="number" class="legacy-input" style="text-align:right;" value="${p.currency?.sp !== undefined ? p.currency.sp : ''}">
                                <span style="font-weight:900; color:#b57d4c;">PC</span> <input name="coin_cp" type="number" class="legacy-input" style="text-align:right;" value="${p.currency?.cp !== undefined ? p.currency.cp : ''}">
                            </div>
                        </div>
                        
                        <div class="skills-list" style="display:flex; flex-direction:column; gap:10px;">
                            <label class="sheet-section-title">EQUIPAMENTO & POSSES</label>
                            <div id="inventory-container" style="display:flex; flex-direction:column; gap:5px;">
                                ${this._renderInventoryRows()}
                            </div>
                            <button type="button" class="btn btn-ghost btn-sm btn-block" data-action="addInventoryRow">+ ADICIONAR ITEM</button>
                            <textarea class="legacy-textarea" name="items_notes" placeholder="Outras posses e notas de carga..." style="height:150px; font-size:0.7rem; margin-top:10px;">${p.equipment?.notes || ''}</textarea>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:15px;">
                            <div class="skills-list"><label class="sheet-section-title">HISTÓRIA DO PERSONAGEM</label><textarea class="legacy-textarea" name="bio" rows="15">${p.bio || ''}</textarea></div>
                            <div class="skills-list"><label class="sheet-section-title">ALIADOS & ORGANIZAÇÕES</label><textarea class="legacy-textarea" name="allies" rows="8">${p.allies || ''}</textarea></div>
                        </div>
                     </div>
                </div>

                <!-- ════ TAB III: GRIMÓRIO ARCANO ════ -->
                <div class="tab-content ${this._currentTab === 'spells' ? 'active' : ''}">
                     <div class="card glass-accent" style="margin-bottom:20px; padding:15px; display:flex; gap:20px; align-items:center;">
                        <i class="fa-solid fa-wand-sparkles fa-2x" style="color:var(--accent);"></i>
                        <input type="text" id="spell-search" class="legacy-input" placeholder="🔍 Buscar magia no grimório..." style="flex:1;" data-action="filterSpells">
                     </div>
                     <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
                        ${[0,1,2,3,4,5,6,7,8,9].map(lv => {
                            const levelSpells = p.spells?.[`lvl${lv}`] || '';
                            const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };
                            return `
                                <div class="skills-list spell-level-box" data-level="${lv}">
                                    <label class="sheet-section-title">${lv === 0 ? 'TRUQUES' : lv + 'º NÍVEL'}</label>
                                    ${lv > 0 ? `
                                        <div style="display:flex; gap:10px; margin-bottom:10px; background:rgba(255,255,255,0.05); padding:8px; border-radius:5px; align-items:center;">
                                            <div style="flex:1; text-align:center;">
                                                <small style="display:block; font-size:0.5rem;">TOTAL SLOTS</small>
                                                <input type="number" name="slots_${lv}_total" value="${slots.total}" style="width:45px; text-align:center; font-weight:900; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.2); border-radius:4px; color:#fff;">
                                            </div>
                                            <div style="flex:1; text-align:center;">
                                                <small style="display:block; font-size:0.5rem;">USADOS</small>
                                                <div style="display:flex; align-items:center; justify-content:center; gap:2px;">
                                                    <button type="button" class="btn btn-ghost btn-sm" style="padding:2px 6px;" data-action="adjustSlot" data-level="${lv}" data-delta="-1">-</button>
                                                    <input type="number" name="slots_${lv}_used" value="${slots.used}" style="width:35px; text-align:center; font-weight:900; background:rgba(0,0,0,0.3); border:none; color:#fff;" readonly>
                                                    <button type="button" class="btn btn-ghost btn-sm" style="padding:2px 6px;" data-action="adjustSlot" data-level="${lv}" data-delta="1">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                    <textarea class="legacy-textarea spell-list-area" name="spells_lvl_${lv}" style="height:150px; font-size:0.7rem;" placeholder="Uma magia por linha...">${levelSpells}</textarea>
                                </div>
                            `;
                        }).join('')}
                     </div>
                </div>

                <!-- ════ TAB IV: CARD AVATAR ════ -->
                <div class="tab-content ${this._currentTab === 'card' ? 'active' : ''}">
                    ${this._renderCardTab()}
                </div>

                <footer style="margin-top:60px; text-align:center; padding-bottom:60px;">
                    <button type="button" class="btn btn-primary" data-action="submitForm" style="padding:20px 80px; font-size:1.5rem; font-family:var(--sheet-font-header); letter-spacing:3px; box-shadow:0 0 15px var(--accent);">
                        <i class="fa-solid fa-bookmark"></i> ${this._editingId ? 'ATUALIZAR HERÓI' : 'REGISTRAR LENDA'}
                    </button>
                </footer>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; margin-top:40px;">
                    ${this._renderPlayerList()}
                </div>

                <!-- IMPOSTER / IMPORT MODAL -->
                <div id="importer-modal" class="modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; align-items:center; justify-content:center; backdrop-filter:blur(10px);">
                    <div class="card glass-accent" style="width:620px; padding:35px; border:2px solid var(--accent); border-radius:15px; animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); background:rgba(18,18,22,0.95); box-shadow:0 20px 50px rgba(0,0,0,0.7);">
                        <h2 style="font-family:'Cinzel'; margin-top:0; color:var(--accent); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; display:flex; align-items:center; gap:10px;">
                            <i class="fa-solid fa-file-import"></i> IMPORTAR FICHA D&D 5E
                        </h2>
                        <p style="font-size:0.75rem; color:var(--text-dim); margin-bottom:20px; line-height:1.4;">
                            Importe seus dados instantaneamente usando um arquivo **PDF Oficial** preenchido (D&D Beyond, Aurora, etc) ou colando o texto extraído da sua ficha.
                        </p>
                        
                        <!-- Drag and Drop PDF Zone -->
                        <div id="pdf-drop-zone" style="border: 2px dashed var(--accent); border-radius:10px; padding:25px; text-align:center; cursor:pointer; background:rgba(0,0,0,0.3); transition:all 0.2s; margin-bottom:15px;" data-action="triggerPDFUpload">
                            <i class="fa-solid fa-file-pdf fa-3x" style="color:var(--accent); margin-bottom:10px; opacity:0.8;"></i>
                            <h4 style="margin:0; color:#fff; font-size:0.9rem;">Importar PDF Oficial</h4>
                            <p style="margin:5px 0 0; font-size:0.7rem; color:var(--text-dim);">Clique ou arraste o arquivo PDF preenchido da sua ficha aqui</p>
                            <input type="file" id="pdf-file-input" style="display:none;" accept=".pdf">
                        </div>

                        <div style="text-align:center; margin:15px 0; font-family:'Cinzel'; font-size:0.75rem; color:var(--text-dim); display:flex; align-items:center; justify-content:center; gap:10px;">
                            <span style="display:inline-block; width:40px; height:1px; background:rgba(255,255,255,0.15);"></span>
                            <span>OU VIA TEXTO COPIADO</span>
                            <span style="display:inline-block; width:40px; height:1px; background:rgba(255,255,255,0.15);"></span>
                        </div>

                        <textarea id="import-text" class="legacy-textarea" placeholder="Cole o texto copiado da ficha aqui..." style="height:150px; font-size:0.75rem; padding:10px; background:rgba(0,0,0,0.2) !important;"></textarea>
                        
                        <div style="display:flex; gap:15px; justify-content:flex-end; margin-top:20px;">
                            <button type="button" class="btn btn-ghost" data-action="closeImporter" style="font-size:0.8rem;">CANCELAR</button>
                            <button type="button" class="btn btn-primary" data-action="processImport" style="font-size:0.8rem; font-weight:800;">PROCESSAR DADOS</button>
                        </div>
                    </div>
                </div>

                </form>
            </div>
        `;
    }

    _renderInventoryRows() {
        return this._inventoryRows.map((item, i) => `
            <div style="display:grid; grid-template-columns: 1fr 60px 60px 25px; gap:5px; margin-bottom:2px;">
                <input class="legacy-input inv-name" type="text" value="${item.name || ''}" placeholder="Nome do Item" style="font-size:0.7rem; padding:4px;">
                <input class="legacy-input inv-qty" type="number" value="${item.qty || 1}" placeholder="Qtd" style="font-size:0.7rem; padding:4px; text-align:center;">
                <input class="legacy-input inv-weight" type="number" value="${item.weight || 0}" step="0.1" placeholder="Peso" style="font-size:0.7rem; padding:4px; text-align:center;">
                <button type="button" class="btn btn-danger btn-sm" data-action="removeInventoryRow" data-index="${i}" style="padding:0;">✕</button>
            </div>
        `).join('');
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
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; border-left: 4px solid var(--accent); background:rgba(255,255,255,0.02);">
                <div>
                    <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent-bright);">${p.name}</h4>
                    <p style="font-size:0.7rem; margin:5px 0 0; color:var(--text-dim); text-transform:uppercase;">${p.class || 'Sem Classe'} • NÍVEL ${p.level || 1}</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button type="button" class="btn btn-ghost btn-sm" style="background:rgba(255,255,255,0.05); color:#fff;" data-action="editHero" data-id="${p.id}">EDITAR</button>
                    <button type="button" class="btn btn-danger btn-sm" data-action="removePlayer" data-id="${p.id}">✕</button>
                </div>
            </div>
        `).join('');
    }

    mount() {
        if (this._mounted) return;
        this._mounted = true;
        this.render();
    }

    onUnmount() {
        if (this._storeUnsubscribe) {
            this._storeUnsubscribe();
            this._storeUnsubscribe = null;
        }
    }

    _syncToStore() {
        const f = this.$('#hero-form');
        if (!f) return;
        const formData = this._collectFormData(f);
        if (this._editingId) {
            TOME.store.update(s => {
                const idx = s.players.findIndex(p => p.id === this._editingId);
                if (idx !== -1) {
                    s.players[idx] = { ...s.players[idx], ...formData };
                }
            });
        } else {
            this._draftData = formData;
        }
    }

    _syncPortraitControls() {
        const s = this._portraitSettings || { x: 0, y: 0, scale: 1 };
        this.$$('input[data-action="updatePortrait"]').forEach(input => {
            const key = input.dataset.key;
            if (key && s[key] !== undefined) {
                input.value = s[key];
            }
        });
        const lblScale = this.$('#label-val-scale');
        const lblX = this.$('#label-val-x');
        const lblY = this.$('#label-val-y');
        if (lblScale) lblScale.textContent = `${(s.scale || 1).toFixed(2)}x`;
        if (lblX) lblX.textContent = `${s.x || 0}px`;
        if (lblY) lblY.textContent = `${s.y || 0}px`;
        const img = this.$('#portrait-preview img');
        if (img) {
            img.style.transform = `scale(${s.scale || 1}) translate(${s.x || 0}px, ${s.y || 0}px)`;
        }
    }

    onMount() {
        const f = this.$('#hero-form');
        if (!f) return;

        const updateAllCalculations = (shouldSync = true) => {
            const prof = parseInt(f.proficiencyBonus.value) || 2;
            const mods = {};

            const xpValue = parseInt(f.xp.value) || 0;
            const xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
            let autoLevel = 1;
            xpTable.forEach((xp, i) => { if (xpValue >= xp) autoLevel = i + 1; });

            if (f.xp === document.activeElement) {
                f.level.value = autoLevel;
            }

            if (f.level === document.activeElement) {
                const levelVal = Math.max(1, Math.min(20, parseInt(f.level.value) || 1));
                f.level.value = levelVal;
                const minXp = xpTable[levelVal - 1] || 0;
                if (parseInt(f.xp.value) < minXp) {
                    f.xp.value = minXp;
                }
            }

            const hpMax = parseInt(f.hp_max.value) || 1;
            const hpCur = parseInt(f.hp_current.value) || 0;
            if (hpCur > hpMax) f.hp_current.value = hpMax;

            ['str','dex','con','int','wis','cha'].forEach(s => {
                const input = f[`stat_${s}`];
                if (!input) return;
                const val = parseInt(input.value) || 10;
                const mod = Math.floor((val - 10) / 2);
                mods[s] = mod;
                
                const bub = this.$(`#mod-${s}`);
                if (bub) bub.textContent = mod >= 0 ? `+${mod}` : mod;

                const saveCheckbox = f[`save_${s}`];
                const saveVal = mod + (saveCheckbox && saveCheckbox.checked ? prof : 0);
                const saveText = this.$(`#save-val-${s}`);
                if (saveText) saveText.textContent = saveVal >= 0 ? `+${saveVal}` : saveVal;
                
                const rowSave = saveCheckbox ? saveCheckbox.parentElement : null;
                if (rowSave) {
                    if (saveCheckbox.checked) rowSave.style.background = 'rgba(212, 175, 55, 0.15)';
                    else rowSave.style.background = 'transparent';
                }
            });

            this._skills.forEach(sk => {
                const checkbox = f[`skill_${sk.id}`];
                if (!checkbox) return;
                const isProf = checkbox.checked;
                const skillVal = mods[sk.stat] + (isProf ? prof : 0);
                
                const skillText = this.$(`#skill-val-${sk.id}`);
                if (skillText) skillText.textContent = skillVal >= 0 ? `+${skillVal}` : skillVal;
                
                const row = this.$(`#row-skill-${sk.id}`);
                if (row) {
                    if (isProf) row.style.background = 'rgba(212, 175, 55, 0.1)';
                    else row.style.background = 'transparent';
                }
            });

            const hasPerception = f.skill_perception && f.skill_perception.checked;
            const hasInvestigation = f.skill_investigation && f.skill_investigation.checked;
            const hasInsight = f.skill_insight && f.skill_insight.checked;

            const percVal = (mods.wis || 0) + (hasPerception ? prof : 0);
            const investVal = (mods.int || 0) + (hasInvestigation ? prof : 0);
            const insightVal = (mods.wis || 0) + (hasInsight ? prof : 0);
            
            const pPercText = this.$('#pass-perc');
            const pInvestText = this.$('#pass-invest');
            const pInsightText = this.$('#pass-insight');

            if (pPercText) pPercText.textContent = 10 + percVal;
            if (pInvestText) pInvestText.textContent = 10 + investVal;
            if (pInsightText) pInsightText.textContent = 10 + insightVal;

            if (this._currentTab === 'card') {
                const formData = this._collectFormData(f);
                this._drawCards(formData);
            }

            if (shouldSync) {
                this._syncToStore();
            }
        };

        f.oninput = () => {
            // Instantly sync typed dynamic arrays (inventory and attacks) on typing
            this._inventoryRows = this._collectInventory();
            this._attackRows = this._collectAttacks();
            updateAllCalculations(true);
        };

        // Initialize calculations
        updateAllCalculations(false);

        // Bind portrait file uploader
        const portraitInput = this.$('#portrait-input');
        if (portraitInput) {
            portraitInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                        const rawBase64 = ev.target.result;
                        const compressed = await this._compressImage(rawBase64);
                        const fileName = `portrait_${Date.now()}_${file.name}`;
                        this._portraitData = await PersistenceService.uploadImage(fileName, compressed);
                        // Auto-save portrait data to draft or store immediately
                        this._syncToStore();
                        this.render();
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        // Bind interactive PDF file uploader
        const pdfFileInput = this.$('#pdf-file-input');
        if (pdfFileInput) {
            pdfFileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.importPDF(file);
                }
            };
        }

        // Setup Drag & Drop files
        const dropZone = this.$('#pdf-drop-zone');
        if (dropZone) {
            dropZone.ondragover = (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#fff';
                dropZone.style.background = 'rgba(197, 160, 89, 0.1)';
            };
            dropZone.ondragleave = () => {
                dropZone.style.borderColor = 'var(--accent)';
                dropZone.style.background = 'rgba(0,0,0,0.3)';
            };
            dropZone.ondrop = (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--accent)';
                dropZone.style.background = 'rgba(0,0,0,0.3)';
                const file = e.dataTransfer.files[0];
                if (file && file.type === 'application/pdf') {
                    this.importPDF(file);
                } else {
                    Toast.show('⚠️ Por favor, envie apenas arquivos no formato PDF.', 'warning');
                }
            };
        }

        // Real-time two-way synchronization from store -> form
        this._storeUnsubscribe = TOME.store.subscribe((state) => {
            if (!this._editingId) return;
            const p = state.players.find(x => x.id === this._editingId);
            if (!p) return;

            const syncInput = (name, val) => {
                const el = f[name];
                if (el && el !== document.activeElement && el.value !== String(val)) {
                    el.value = val;
                }
            };
            const syncCheck = (name, checked) => {
                const el = f[name];
                if (el && el !== document.activeElement && el.checked !== !!checked) {
                    el.checked = !!checked;
                }
            };

            const nameEl = this.$('#input-hero-name');
            if (nameEl && nameEl !== document.activeElement && nameEl.value !== (p.name || '')) {
                nameEl.value = p.name || '';
            }

            syncInput('class', p.class || '');
            syncInput('level', p.level || 1);
            syncInput('playerName', p.playerName || '');
            syncInput('race', p.race || '');
            syncInput('background', p.background || '');
            syncInput('alignment', p.alignment || '');
            syncInput('xp', p.xp || 0);
            syncCheck('inspiration', p.inspiration);
            syncInput('proficiencyBonus', p.proficiencyBonus || 2);
            syncInput('ac', p.ac || 10);
            syncInput('initiative', p.initiative || 0);
            syncInput('speed', p.speed || 30);
            syncInput('hp_max', p.hp?.max || 10);
            syncInput('hp_current', p.hp?.current || 10);
            syncInput('hp_temp', p.hp?.temp || 0);

            ['str','dex','con','int','wis','cha'].forEach(s => {
                syncInput(`stat_${s}`, p.stats?.[s] || 10);
                syncCheck(`save_${s}`, p.savingThrows?.[s]);
            });

            this._skills.forEach(sk => {
                syncCheck(`skill_${sk.id}`, p.skills?.includes(sk.id));
            });

            for(let i=0; i<=9; i++) {
                syncInput(`spells_lvl_${i}`, p.spells?.[`lvl${i}`] || '');
                if (i > 0 && p.spellSlots?.[i]) {
                    syncInput(`slots_${i}_total`, p.spellSlots[i].total || 0);
                    syncInput(`slots_${i}_used`, p.spellSlots[i].used || 0);
                }
            }

            updateAllCalculations(false);
            this._syncPortraitControls();
        });
        this._syncPortraitControls();
    }

    submitForm() {
        const f = this.$('#hero-form');
        if (!f) return;
        const playerData = this._collectFormData(f);

        if (this._editingId) {
            TOME.store.update(s => {
                const idx = s.players.findIndex(p => p.id === this._editingId);
                if (idx !== -1) s.players[idx] = { ...s.players[idx], ...playerData };
            });
            Toast.show('Ficha atualizada e sincronizada!');
        } else {
            const nameSlug = (playerData.name || 'hero').toLowerCase().replace(/\s+/g, '_');
            const uniqueId = `${nameSlug}_${Date.now().toString().slice(-6)}`;
            const player = { ...Schemas.createPlayer(playerData), id: uniqueId };
            
            TOME.store.update(s => s.players = [...s.players, player]);
            Toast.show('Nova lenda registrada com sucesso!');
        }
        this.resetForm();
    }

    resetForm() {
        this.store.update(s => s.editingHeroId = null);
        this._portraitData = null;
        this._portraitSettings = { x: 0, y: 0, scale: 1 };
        this._inventoryRows = [{ name: '', qty: 1, weight: 0 }];
        this._attackRows = [{ name: '', bonus: '', damage: '' }];
        this._currentTab = 'core';
        this._draftData = null;
        const f = this.$('#hero-form');
        if (f) f.reset();
        this.render();
    }

    closeBuilder() {
        this.resetForm();
        TOME.store.update(s => s.activeTab = 'herohub');
    }

    updateField(e, el) {
        if (!this._editingId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._editingId);
            if (p) p[el.name] = el.type === 'number' ? parseFloat(el.value) : el.value;
        });
        if (this._currentTab === 'card') this.render();
    }

    switchTab(e, el) {
        this._currentTab = el.dataset.tab;
        this.render();
    }

    addInventoryRow() {
        const f = this.$('#hero-form');
        if (f) {
            const currentData = this._collectFormData(f);
            this._inventoryRows = [...currentData.equipment.items, { name: '', qty: 1, weight: 0 }];
            this._attackRows = currentData.attacks;
            this._draftData = {
                ...currentData,
                equipment: {
                    ...currentData.equipment,
                    items: this._inventoryRows
                }
            };
            if (this._editingId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...this._draftData };
                    }
                });
            }
        } else {
            this._inventoryRows.push({ name: '', qty: 1, weight: 0 });
        }
        this.render();
    }

    removeInventoryRow(e, el) {
        const idxToRemove = parseInt(el.dataset.index);
        const f = this.$('#hero-form');
        if (f) {
            const currentData = this._collectFormData(f);
            const items = currentData.equipment.items;
            items.splice(idxToRemove, 1);
            this._inventoryRows = items;
            this._attackRows = currentData.attacks;
            this._draftData = {
                ...currentData,
                equipment: {
                    ...currentData.equipment,
                    items: this._inventoryRows
                }
            };
            if (this._editingId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...this._draftData };
                    }
                });
            }
        } else {
            this._inventoryRows.splice(idxToRemove, 1);
        }
        this.render();
    }

    addAttackRow() {
        const f = this.$('#hero-form');
        if (f) {
            const currentData = this._collectFormData(f);
            this._attackRows = [...currentData.attacks, { name: '', bonus: '', damage: '' }];
            this._inventoryRows = currentData.equipment.items;
            this._draftData = {
                ...currentData,
                attacks: this._attackRows
            };
            if (this._editingId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...this._draftData };
                    }
                });
            }
        } else {
            this._attackRows.push({ name: '', bonus: '', damage: '' });
        }
        this.render();
    }

    removeAttackRow(e, el) {
        const idxToRemove = parseInt(el.dataset.index);
        const f = this.$('#hero-form');
        if (f) {
            const currentData = this._collectFormData(f);
            const attacks = currentData.attacks;
            attacks.splice(idxToRemove, 1);
            this._attackRows = attacks;
            this._inventoryRows = currentData.equipment.items;
            this._draftData = {
                ...currentData,
                attacks: this._attackRows
            };
            if (this._editingId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...this._draftData };
                    }
                });
            }
        } else {
            this._attackRows.splice(idxToRemove, 1);
        }
        this.render();
    }

    adjustSlot(e, el) {
        const lv = el.dataset.level;
        const delta = parseInt(el.dataset.delta);
        const f = this.$('#hero-form');
        const input = f[`slots_${lv}_used`];
        const total = parseInt(f[`slots_${lv}_total`].value) || 0;
        let val = (parseInt(input.value) || 0) + delta;
        if (val < 0) val = 0;
        if (val > total && total > 0) val = total;
        input.value = val;
        
        // Auto-save Spells slots change
        const currentData = this._collectFormData(f);
        this._draftData = currentData;
        if (this._editingId) {
            TOME.store.update(s => {
                const idx = s.players.findIndex(p => p.id === this._editingId);
                if (idx !== -1) s.players[idx] = { ...s.players[idx], ...currentData };
            });
        }
    }

    filterSpells(e, el) {
        const query = el.value.toLowerCase();
        this.$$('.spell-level-box').forEach(box => {
            const area = box.querySelector('.spell-list-area');
            const spells = area.value.toLowerCase();
            if (query && !spells.includes(query)) box.style.opacity = '0.3';
            else box.style.opacity = '1';
        });
    }

    _collectInventory() {
        const items = [];
        const ns = this.$$('.inv-name');
        const qs = this.$$('.inv-qty');
        const ws = this.$$('.inv-weight');
        ns.forEach((el, i) => { 
            items.push({ 
                name: el.value || '', 
                qty: qs[i] ? (parseInt(qs[i].value) || 1) : 1, 
                weight: ws[i] ? (parseFloat(ws[i].value) || 0) : 0 
            }); 
        });
        return items.length ? items : [{ name: '', qty: 1, weight: 0 }];
    }

    _collectFormData(f) {
        const fd = new FormData(f);
        const data = {
            name: this.$('#input-hero-name')?.value || 'Herói Sem Nome',
            class: fd.get('class') || '', 
            race: fd.get('race') || '', 
            level: parseInt(fd.get('level')) || 1,
            playerName: fd.get('playerName') || '', 
            background: fd.get('background') || '', 
            alignment: fd.get('alignment') || '', 
            xp: parseInt(fd.get('xp')) || 0,
            inspiration: !!fd.get('inspiration'), 
            proficiencyBonus: parseInt(fd.get('proficiencyBonus')) || 2,
            stats: { 
                str: parseInt(fd.get('stat_str')) || 10, 
                dex: parseInt(fd.get('stat_dex')) || 10, 
                con: parseInt(fd.get('stat_con')) || 10, 
                int: parseInt(fd.get('stat_int')) || 10, 
                wis: parseInt(fd.get('stat_wis')) || 10, 
                cha: parseInt(fd.get('stat_cha')) || 10 
            },
            savingThrows: { 
                str: !!fd.get('save_str'), 
                dex: !!fd.get('save_dex'), 
                con: !!fd.get('save_con'), 
                int: !!fd.get('save_int'), 
                wis: !!fd.get('save_wis'), 
                cha: !!fd.get('save_cha') 
            },
            skills: this._skills.filter(sk => fd.get(`skill_${sk.id}`)).map(sk => sk.id),
            ac: parseInt(fd.get('ac')) || 10, 
            initiative: parseInt(fd.get('initiative')) || 0, 
            speed: parseInt(fd.get('speed')) || 30,
            hp: { 
                current: parseInt(fd.get('hp_current')) || 10, 
                max: parseInt(fd.get('hp_max')) || 10, 
                temp: parseInt(fd.get('hp_temp')) || 0 
            },
            hitDice: { 
                total: fd.get('hit_dice_total') || '', 
                remaining: fd.get('hit_dice_rem') || '' 
            },
            deathSaves: { 
                successes: [!!fd.get('death_s1'), !!fd.get('death_s2'), !!fd.get('death_s3')],
                failures: [!!fd.get('death_f1'), !!fd.get('death_f2'), !!fd.get('death_f3')]
            },
            attacks: this._collectAttacks(), 
            attackNotes: fd.get('attack_notes') || '',
            currency: { 
                pp: parseInt(fd.get('coin_pp')) || 0, 
                gp: parseInt(fd.get('coin_gp')) || 0, 
                ep: parseInt(fd.get('coin_ep')) || 0, 
                sp: parseInt(fd.get('coin_sp')) || 0, 
                cp: parseInt(fd.get('coin_cp')) || 0 
            },
            roleplay: { 
                traits: fd.get('traits') || '', 
                ideals: fd.get('ideals') || '', 
                bonds: fd.get('bonds') || '', 
                flaws: fd.get('flaws') || '' 
            },
            equipment: { 
                items: this._collectInventory(), 
                notes: fd.get('items_notes') || '' 
            }, 
            otherProfs: fd.get('other_profs') || '', 
            bio: fd.get('bio') || '', 
            allies: fd.get('allies') || '',
            portraitData: this._portraitData,
            portraitSettings: this._portraitSettings,
            spells: {}, 
            spellSlots: {}
        };

        for(let i=0; i<=9; i++) {
            data.spells[`lvl${i}`] = fd.get(`spells_lvl_${i}`) || '';
            if(i > 0) {
                data.spellSlots[i] = { 
                    total: parseInt(fd.get(`slots_${i}_total`)) || 0, 
                    used: parseInt(fd.get(`slots_${i}_used`)) || 0 
                };
            }
        }
        return data;
    }

    _collectAttacks() {
        const atks = [];
        const ns = this.$$('.atk-name');
        const bs = this.$$('.atk-bonus');
        const ds = this.$$('.atk-damage');
        ns.forEach((el, i) => { 
            atks.push({ 
                name: el.value || '', 
                bonus: bs[i] ? bs[i].value : '', 
                damage: ds[i] ? ds[i].value : '' 
            }); 
        });
        return atks.length ? atks : [{ name: '', bonus: '', damage: '' }];
    }

    setCardSide(e, el) { this._cardSide = el.dataset.side; this.render(); }
    downloadCardJPG() { CardRenderer.download(this.$('#player-card-export'), `Card_${this.$('#input-hero-name').value}.jpg`); }

    editHero(e, el) {
        const p = this.store.state.players.find(x => x.id === el.dataset.id);
        if (!p) return;
        this.store.update(s => s.editingHeroId = p.id);
        this._fillForm(p);
    }

    importHeroJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    this._fillForm(data);
                    Toast.show('✅ Personagem importado com sucesso!');
                } catch (err) {
                    Toast.show('❌ Erro ao ler arquivo JSON.', 'danger');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    _fillForm(p) {
        this._portraitData = p.portraitData || null;
        this._portraitSettings = p.portraitSettings || { x: 0, y: 0, scale: 1 };
        this._attackRows = p.attacks?.length ? [...p.attacks] : [{ name: '', bonus: '', damage: '' }];
        this._inventoryRows = p.equipment?.items?.length ? [...p.equipment.items] : [{ name: '', qty: 1, weight: 0 }];
        this._currentTab = 'core';
        this._draftData = p;
        this.render();
        this._syncPortraitControls();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    removePlayer(e, el) { 
        if (confirm('Deletar lenda?')) {
            TOME.store.update(s => { 
                s.players = s.players.filter(p => p.id !== el.dataset.id); 
            }); 
        } 
    }

    triggerPortrait() { this.$('#portrait-input').click(); }

    updatePortrait(e, el) {
        this._portraitSettings[el.dataset.key] = parseFloat(el.value);
        this._syncPortraitControls();
        this._syncToStore();
        this.previewCards();
    }

    resetPortrait() {
        this._portraitSettings = { x: 0, y: 0, scale: 1 };
        this._syncPortraitControls();
        this._syncToStore();
        this.previewCards();
    }

    previewCards() {
        const f = this.$('#hero-form');
        if (f) {
            const formData = this._collectFormData(f);
            this._drawCards(formData);
        }
    }

    openImporter() { this.$('#importer-modal').style.display = 'flex'; }
    closeImporter() { this.$('#importer-modal').style.display = 'none'; }
    triggerPDFUpload() { this.$('#pdf-file-input').click(); }

    _compressImage(base64Str, maxWidth = 400, maxHeight = 400, quality = 0.75) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/webp', quality);
                resolve(compressed);
            };
            img.onerror = () => resolve(base64Str);
            img.src = base64Str;
        });
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));
            document.head.appendChild(script);
        });
    }

    async importPDF(file) {
        Toast.show('🔮 Lendo formulário do PDF...');
        try {
            const { PDFDocument } = await import('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.esm.js');
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const form = pdfDoc.getForm();
            const fields = form.getFields();

            const values = {};
            fields.forEach(field => {
                const name = field.getName();
                let val = '';
                
                try {
                    if (typeof field.getText === 'function') {
                        val = field.getText();
                    } else if (typeof field.isChecked === 'function') {
                        val = field.isChecked();
                    } else if (typeof field.getSelected === 'function') {
                        val = field.getSelected();
                        if (Array.isArray(val)) val = val[0];
                    } else {
                        const type = field.constructor.name;
                        if (type.includes('TextField')) val = field.getText?.();
                        else if (type.includes('CheckBox')) val = field.isChecked?.();
                        else if (type.includes('Dropdown') || type.includes('Select')) {
                            val = field.getSelected?.();
                            if (Array.isArray(val)) val = val[0];
                        }
                    }
                } catch (e) {
                    console.warn(`Erro ao ler campo ${name}:`, e);
                }
                
                if (val !== undefined && val !== null && val !== '') {
                    if (typeof val === 'string' && val.length > 50000) {
                        val = val.substring(0, 50000) + '... [texto truncado]';
                    }
                    values[name] = val;
                }
            });

            console.log('Campos extraídos do PDF:', values);

            if (Object.keys(values).length === 0) {
                throw new Error('Nenhum campo interativo encontrado no PDF.');
            }

            const mapped = this._mapPDFFields(values);
            this._fillForm(mapped);

            try {
                TOME.store.update(s => {
                    if (this._editingId) {
                        const idx = s.players.findIndex(p => p.id === this._editingId);
                        if (idx !== -1) {
                            s.players[idx] = { ...s.players[idx], ...mapped };
                        }
                        Toast.show('✅ Ficha do herói atualizada e salva com sucesso!', 'success');
                    } else {
                        const nameSlug = (mapped.name || 'hero').toLowerCase().replace(/\s+/g, '_');
                        const uniqueId = `${nameSlug}_${Date.now().toString().slice(-6)}`;
                        const player = { ...Schemas.createPlayer(mapped), id: uniqueId };
                        s.players = [...s.players, player];
                        s.editingHeroId = uniqueId;
                        Toast.show('✅ Novo herói importado e salvo com sucesso!', 'success');
                    }
                });
            } catch (saveErr) {
                if (saveErr.name === 'QuotaExceededError' || saveErr.message.includes('Quota')) {
                    Toast.show('❌ Limite de armazenamento atingido (QuotaExceeded)! Limpe heróis ou mapas antigos.', 'danger');
                    return; // Stop further processing
                }
                throw saveErr;
            }

            this.previewCards();
            this.closeImporter();
        } catch (err) {
            console.error('Erro ao ler PDF como formulário:', err);
            if (err.name === 'QuotaExceededError' || err.message.includes('Quota')) return;
            Toast.show('⚠️ Não foi possível ler campos interativos. Extraindo texto do PDF...', 'warning');
            await this._fallbackPDFText(file);
        }
    }

    async _fallbackPDFText(file) {
        Toast.show('🔍 Extraindo texto do PDF...');
        try {
            await this._loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';
            const pagesToRead = Math.min(2, pdf.numPages);
            for (let i = 1; i <= pagesToRead; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            if (fullText.trim()) {
                const inputEl = this.$('#import-text');
                if (inputEl) inputEl.value = fullText;
                await this.processImport();
            } else {
                throw new Error('O PDF não contém texto legível.');
            }
        } catch (err) {
            console.error('Erro ao extrair texto do PDF:', err);
            Toast.show('⚠️ Falha ao extrair texto do PDF. Considere inserir manualmente ou via JSON.', 'danger');
        }
    }

    _mapPDFFields(v) {
        // Normalizes keys: lowercase and removes non-alphanumeric chars
        const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        // Find keys by fuzzy/loose matching
        const findVal = (queries, defaultVal = null) => {
            const normalizedQueries = queries.map(q => norm(q));
            // First look for exact match or normalized match
            for (let q of normalizedQueries) {
                const foundKey = Object.keys(v).find(k => norm(k) === q);
                if (foundKey !== undefined) return v[foundKey];
            }
            // Fallback: look for partial match where key contains one of the query terms
            for (let q of normalizedQueries) {
                const foundKey = Object.keys(v).find(k => norm(k).includes(q));
                if (foundKey !== undefined) return v[foundKey];
            }
            return defaultVal;
        };

        const getIntVal = (queries, defaultVal = 0) => {
            const raw = findVal(queries);
            if (raw === null || raw === undefined) return defaultVal;
            const parsed = parseInt(String(raw).replace(/[^-0-9]/g, ''));
            return isNaN(parsed) ? defaultVal : parsed;
        };

        const getBoolVal = (queries, defaultVal = false) => {
            const raw = findVal(queries);
            if (raw === null || raw === undefined) return defaultVal;
            if (typeof raw === 'boolean') return raw;
            const s = String(raw).toLowerCase().trim();
            return s === 'true' || s === 'yes' || s === 'on' || s === '1' || s === 'x' || s === 'v' || s === 's' || raw === 1;
        };

        // Resolves attribute score with fallback scanning
        const getAbilityScore = (abbr, fullName, ptName, ptAbbr) => {
            const queries = [
                `${abbr}score`, `${fullName}score`, `${ptName}valor`, `${abbr}val`, `${ptName}total`,
                `${abbr} score`, `${fullName} score`, `${ptName} valor`, `${abbr} val`, `${ptName} total`,
                abbr, fullName, ptName, ptAbbr
            ];
            
            // 1. Direct lookup
            let score = getIntVal(queries, 0);
            if (score > 5) return score;
            
            // 2. Scan all keys
            for (let k of Object.keys(v)) {
                const nk = norm(k);
                if (
                    (nk.includes(abbr) || nk.includes(fullName) || nk.includes(ptName) || nk.includes(ptAbbr)) &&
                    !nk.includes('mod') && !nk.includes('save') && !nk.includes('resist') && !nk.includes('test') && !nk.includes('check')
                ) {
                    const parsed = parseInt(String(v[k]).replace(/[^-0-9]/g, ''));
                    if (parsed > 5 && parsed <= 30) {
                        return parsed;
                    }
                }
            }
            return 10;
        };

        const getSavingThrow = (abbr, fullName, ptName, ptAbbr) => {
            const keys = [
                `st${abbr}`, `st${fullName}`, `save${abbr}`, `save${fullName}`, `${ptName}save`, `resist${ptAbbr}`,
                `salvaguarda${ptName}`, `salvaguarda${ptAbbr}`, `${ptName}resist`,
                `checkbox11`, `checkbox18`, `checkbox19`, `checkbox20`, `checkbox21`, `checkbox22`
            ];
            if (getBoolVal(keys)) return true;

            for (let k of Object.keys(v)) {
                const nk = norm(k);
                if (
                    (nk.includes('save') || nk.includes('st') || nk.includes('resist') || nk.includes('salvaguarda')) &&
                    (nk.includes(abbr) || nk.includes(fullName) || nk.includes(ptName) || nk.includes(ptAbbr))
                ) {
                    if (getBoolVal([k])) return true;
                }
            }
            return false;
        };

        const getSkillProficiency = (skKeys) => {
            if (getBoolVal(skKeys)) return true;
            
            for (let k of Object.keys(v)) {
                const nk = norm(k);
                if (skKeys.some(key => nk.includes(norm(key))) && (nk.includes('prof') || nk.includes('check') || nk.includes('box'))) {
                    if (getBoolVal([k])) return true;
                }
            }
            return false;
        };

        // Ability Scores Parsing
        const strScore = getAbilityScore('str', 'strength', 'força', 'for');
        const dexScore = getAbilityScore('dex', 'dexterity', 'destreza', 'des');
        const conScore = getAbilityScore('con', 'constitution', 'constituição', 'con');
        const intScore = getAbilityScore('int', 'intelligence', 'inteligência', 'int');
        const wisScore = getAbilityScore('wis', 'wisdom', 'sabedoria', 'sab');
        const chaScore = getAbilityScore('cha', 'charisma', 'carisma', 'car');
        
        const dexMod = Math.floor((dexScore - 10) / 2);

        // Fallback checks for calculated stats
        let acVal = getIntVal(['ac', 'ca', 'armorclass', 'armor class', 'classe de armadura', 'classe de armadura valor'], 0);
        if (acVal <= 0) {
            acVal = 10 + dexMod;
        }

        let initVal = getIntVal(['initiative', 'iniciativa', 'init', 'inic', 'iniciativa valor'], 999);
        if (initVal === 999 || initVal === -5) {
            initVal = dexMod;
        }

        let speedVal = getIntVal(['speed', 'deslocamento', 'desloc', 'movimento', 'speedvalue', 'velocidade'], 30);

        let cls = String(findVal(['classlevel', 'class', 'classe'], '')).trim();
        let lvl = getIntVal(['level', 'nivel', 'lvl', 'charlevel', 'characterlevel'], 0);
        if (!lvl && cls) {
            const match = cls.match(/(\d+)/);
            if (match) {
                lvl = parseInt(match[1]);
                cls = cls.replace(match[0], '').trim();
            }
        }
        if (!lvl) lvl = 1;

        const mapped = {
            name: findVal(['charactername', 'charname', 'name', 'nome', 'nomedopersonagem', 'personagem']) || 'Herói Importado',
            class: cls || 'Guerreiro',
            level: lvl,
            race: findVal(['race', 'raça', 'raca']) || 'Humano',
            background: findVal(['background', 'antecedente', 'antecedentes', 'historico', 'histórico']) || 'Herói do Povo',
            playerName: findVal(['playername', 'jogador', 'player', 'nomedojogador']) || '',
            alignment: findVal(['alignment', 'tendência', 'tendencia', 'alinhamento']) || 'Neutro',
            xp: getIntVal(['xp', 'experience', 'experiencia', 'experiência'], 0),
            ac: acVal,
            initiative: initVal,
            speed: speedVal,
            hp: {
                current: getIntVal(['hpcurrent', 'currenthp', 'hitpointscurrent', 'pontosdevida', 'pv', 'vida', 'pv_atual'], 10),
                max: getIntVal(['hpmax', 'maxhp', 'hitpointsmax', 'pontosdevidamax', 'pvmax', 'maxpv'], 10),
                temp: getIntVal(['hptemp', 'temphp', 'pvtemp', 'vidatemp'], 0)
            },
            hitDice: {
                total: findVal(['hdtotal', 'hitdicetotal', 'dadosdevidatotal']) || `${lvl}d8`,
                remaining: findVal(['hdremaining', 'hdcurrent', 'hitdice', 'dadosdevida']) || `${lvl}`
            },
            inspiration: getBoolVal(['inspiration', 'inspiracao', 'inspiração']),
            proficiencyBonus: getIntVal(['profbonus', 'proficiencybonus', 'bonusdeproficiencia', 'bônusdeproficiência', 'bonusprof'], 2),
            stats: {
                str: strScore,
                dex: dexScore,
                con: conScore,
                int: intScore,
                wis: wisScore,
                cha: chaScore
            },
            savingThrows: {
                str: getSavingThrow('str', 'strength', 'força', 'for'),
                dex: getSavingThrow('dex', 'dexterity', 'destreza', 'des'),
                con: getSavingThrow('con', 'constitution', 'constituição', 'con'),
                int: getSavingThrow('int', 'intelligence', 'inteligência', 'int'),
                wis: getSavingThrow('wis', 'wisdom', 'sabedoria', 'sab'),
                cha: getSavingThrow('cha', 'charisma', 'carisma', 'car')
            },
            skills: [],
            attacks: [],
            currency: {
                pp: getIntVal(['pp', 'platina', 'platinum'], 0),
                gp: getIntVal(['gp', 'gold', 'ouro'], 0),
                ep: getIntVal(['ep', 'electrum', 'electro'], 0),
                sp: getIntVal(['sp', 'silver', 'prata'], 0),
                cp: getIntVal(['cp', 'copper', 'cobre'], 0)
            },
            roleplay: {
                traits: String(findVal(['personalitytraits', 'personality', 'tracos', 'traços'], '')).trim(),
                ideals: String(findVal(['ideals', 'ideais'], '')).trim(),
                bonds: String(findVal(['bonds', 'vinculos', 'vínculos'], '')).trim(),
                flaws: String(findVal(['flaws', 'fraquezas', 'defeitos'], '')).trim()
            },
            equipment: {
                items: [],
                notes: String(findVal(['equipment', 'equipamento', 'itens', 'items', 'posses'], '')).trim()
            },
            otherProfs: String(findVal(['proficiencieslanguage', 'otherproficiencies', 'outrasproficiencias', 'outrasproficiências', 'idiomas'], '')).trim(),
            bio: String(findVal(['backstory', 'biography', 'historia', 'história', 'bio'], '')).trim(),
            allies: String(findVal(['allies', 'alliesorganizations', 'aliados'], '')).trim(),
            spells: {},
            spellSlots: {}
        };

        const skillList = [
            { id: 'athletics', keys: ['athletics', 'atletismo', 'checkbox26', 'athleticsprof'] },
            { id: 'acrobatics', keys: ['acrobatics', 'acrobacia', 'checkbox23', 'acrobaticsprof'] },
            { id: 'sleightOfHand', keys: ['sleightofhand', 'prestidigitacao', 'prestidigitação', 'maosleves', 'mãosleves', 'checkbox38', 'sleightofhandprof'] },
            { id: 'stealth', keys: ['stealth', 'furtividade', 'checkbox39', 'stealthprof'] },
            { id: 'arcana', keys: ['arcana', 'arcano', 'checkbox25', 'arcanaprof'] },
            { id: 'history', keys: ['history', 'historia', 'história', 'checkbox28', 'historyprof'] },
            { id: 'investigation', keys: ['investigation', 'investigacao', 'investigação', 'checkbox31', 'investigationprof'] },
            { id: 'nature', keys: ['nature', 'natureza', 'checkbox33', 'natureprof'] },
            { id: 'religion', keys: ['religion', 'religiao', 'religião', 'checkbox37', 'religionprof'] },
            { id: 'insight', keys: ['insight', 'intuicao', 'intuição', 'checkbox29', 'insightprof'] },
            { id: 'medicine', keys: ['medicine', 'medicina', 'checkbox32', 'medicineprof'] },
            { id: 'perception', keys: ['perception', 'percepcao', 'percepção', 'checkbox34', 'perceptionprof'] },
            { id: 'survival', keys: ['survival', 'sobrevivencia', 'sobrevivência', 'checkbox40', 'survivalprof'] },
            { id: 'animalHandling', keys: ['animalhandling', 'adestramento', 'lidarcomanimais', 'checkbox24', 'animalhandlingprof'] },
            { id: 'deception', keys: ['deception', 'decepcao', 'decepção', 'enganacao', 'enganação', 'checkbox27', 'deceptionprof'] },
            { id: 'intimidation', keys: ['intimidation', 'intimidacao', 'intimidação', 'checkbox30', 'intimidationprof'] },
            { id: 'performance', keys: ['performance', 'atuacao', 'atuação', 'checkbox35', 'performanceprof'] },
            { id: 'persuasion', keys: ['persuasion', 'persuasao', 'persuasão', 'checkbox36', 'persuasionprof'] }
        ];

        skillList.forEach(sk => {
            if (getSkillProficiency(sk.keys)) {
                mapped.skills.push(sk.id);
            }
        });

        // Loop to extract up to 6 attacks / weapons
        for (let i = 1; i <= 6; i++) {
            const name = findVal([`weapon${i}name`, `wknname${i}`, `atkname${i}`, `ataquename${i}`, `arma${i}`, `weapon${i}`]);
            if (name && String(name).trim() && !String(name).toLowerCase().includes('weapon')) {
                const bonus = findVal([`weapon${i}atkbonus`, `wknatkbonus${i}`, `atkatkbonus${i}`, `ataquebonus${i}`, `bonus${i}`]) || '';
                const damage = findVal([`weapon${i}damage`, `wkndamage${i}`, `atkdamage${i}`, `ataquedano${i}`, `dano${i}`]) || '';
                mapped.attacks.push({
                    name: String(name).trim(),
                    bonus: String(bonus).trim(),
                    damage: String(damage).trim()
                });
            }
        }

        // Parse equipment items
        if (mapped.equipment.notes) {
            const lines = mapped.equipment.notes.split(/[\n,;]+/);
            lines.forEach(line => {
                const cleaned = line.trim();
                if (cleaned && cleaned.length > 2) {
                    let qty = 1;
                    let name = cleaned;
                    const qtyMatch = cleaned.match(/(?:x\s*(\d+))|(\d+)\s*x|\((\d+)\)/i);
                    if (qtyMatch) {
                        qty = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3]);
                        name = cleaned.replace(qtyMatch[0], '').trim();
                    }
                    mapped.equipment.items.push({ name, qty, weight: 0 });
                }
            });
        }

        // Parse Spells and Spell Slots from PDF fields
        for (let i = 0; i <= 9; i++) {
            mapped.spells[`lvl${i}`] = '';
            mapped.spellSlots[i] = { total: 0, used: 0 };
            
            if (i > 0) {
                mapped.spellSlots[i].total = getIntVal([`slots${i}`, `spellslots${i}`, `slotslvl${i}`, `spellslotslvl${i}`, `slotstotal${i}`], 0);
            }
            
            const levelSpellKeys = Object.keys(v).filter(k => {
                const nk = norm(k);
                return (nk.includes('spell') || nk.includes('magia')) && (nk.includes(String(i)) || (i === 0 && (nk.includes('cantrip') || nk.includes('truque'))));
            });
            
            const levelSpellsList = [];
            levelSpellKeys.forEach(k => {
                const val = String(v[k]).trim();
                if (val && !levelSpellsList.includes(val) && val.length > 2) {
                    levelSpellsList.push(val);
                }
            });
            
            if (levelSpellsList.length > 0) {
                mapped.spells[`lvl${i}`] = levelSpellsList.join('\n');
            }
        }

        return mapped;
    }

    async processImport() {
        const text = this.$('#import-text').value;
        if (!text) return;
        
        Toast.show('🔮 Sincronizando dados da ficha...');
        
        const clean = (t) => t ? t.trim() : '';
        const getInt = (reg) => { const m = text.match(reg); return m ? parseInt(m[1] || m[2]) : null; };

        // Scanning basic fields
        const name = text.match(/(?:Character Name|Nome do Personagem|Nome):\s*([^\r\n]+)/i)?.[1] || clean(text.split('\n')[0]);
        const charClass = text.match(/(?:Class|Classe)(?:\s*&\s*Level|&Nível)?:\s*([^\r\n]+)/i)?.[1] || text.match(/(?:Classe):\s*([^\r\n]+)/i)?.[1];
        const race = text.match(/(?:Race|Raça):\s*([^\r\n]+)/i)?.[1];
        const background = text.match(/(?:Background|Antecedente|Antecedentes):\s*([^\r\n]+)/i)?.[1];
        const alignment = text.match(/(?:Alignment|Tendência|Tendencia):\s*([^\r\n]+)/i)?.[1];
        const xp = getInt(/(?:Experience|XP|Experiência):\s*(\d+)/i);
        
        const ac = getInt(/(?:Armor Class|AC|CA|Classe de Armadura)\s*(\d+)/i) || getInt(/(?:CA|AC):\s*(\d+)/i);
        const hp = getInt(/(?:Hit Points|HP|PV|Pontos de Vida|Vida)\s*(\d+)/i) || getInt(/(?:PV|HP):\s*(\d+)/i);
        const speed = getInt(/(?:Speed|Deslocamento|Desloc|Velocidade)\s*(\d+)/i);
        const init = getInt(/(?:Initiative|Iniciativa|Inic)\s*([+-]?\d+)/i);
        const prof = getInt(/(?:Proficiency Bonus|Bônus de Proficiência|Bônus Prof)\s*([+-]?\d+)/i);

        // Scan Abilities scores
        const getStatFromText = (abbrs) => {
            for (let abbr of abbrs) {
                const reg = new RegExp(`(?:${abbr}|${abbr.toUpperCase()})\\s*Score?\\s*(\\d+)|(?:${abbr}|${abbr.toUpperCase()})\\s*:\\s*(\\d+)|\\b(?:${abbr}|${abbr.toUpperCase()})\\s+(\\d+)\\b`, 'i');
                const m = text.match(reg);
                if (m) {
                    const val = parseInt(m[1] || m[2] || m[3]);
                    if (val >= 1 && val <= 30) return val;
                }
            }
            return 10;
        };

        const stats = {
            str: getStatFromText(['str', 'strength', 'força', 'forca', 'for']),
            dex: getStatFromText(['dex', 'dexterity', 'destreza', 'des']),
            con: getStatFromText(['con', 'constitution', 'constituição', 'constituiçao', 'con']),
            int: getStatFromText(['int', 'intelligence', 'inteligência', 'inteligencia', 'int']),
            wis: getStatFromText(['wis', 'wisdom', 'sabedoria', 'sab']),
            cha: getStatFromText(['cha', 'charisma', 'carisma', 'car'])
        };

        // Scan checked Skills (matching checkboxes like [X] or circles like ● next to name)
        const skillMatches = [];
        this._skills.forEach(sk => {
            const labelNorm = sk.label.toLowerCase();
            const idNorm = sk.id.toLowerCase();
            const patterns = [
                new RegExp(`\\[[Xx•●]\\]\\s*(?:${labelNorm}|${idNorm})`, 'i'),
                new RegExp(`(?:${labelNorm}|${idNorm})\\s*\\([Xx•●]\\)`, 'i'),
                new RegExp(`●\\s*(?:${labelNorm}|${idNorm})`, 'i'),
                new RegExp(`(?:${labelNorm}|${idNorm})\\s*\\+\\d+\\s*(?:\\(prof\\)|\\bproficiente\\b)`, 'i')
            ];
            if (patterns.some(p => p.test(text))) {
                skillMatches.push(sk.id);
            }
        });

        // Scan checked Saving Throws
        const savingThrows = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
        const statsAbbr = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const statsLabels = {
            str: ['força', 'for', 'strength'],
            dex: ['destreza', 'des', 'dexterity'],
            con: ['constituição', 'con', 'constitution'],
            int: ['inteligência', 'int', 'intelligence'],
            wis: ['sabedoria', 'sab', 'wisdom'],
            cha: ['carisma', 'car', 'charisma']
        };
        
        statsAbbr.forEach(s => {
            const labels = statsLabels[s];
            for (let label of labels) {
                const patterns = [
                    new RegExp(`\\[[Xx•●]\\]\\s*Resistência\\s+de\\s+${label}`, 'i'),
                    new RegExp(`\\[[Xx•●]\\]\\s*${label}\\s+Saving\\s+Throw`, 'i'),
                    new RegExp(`\\[[Xx•●]\\]\\s*${label}\\s+Save`, 'i'),
                    new RegExp(`●\\s*${label}\\s*Save`, 'i'),
                    new RegExp(`●\\s*Resistência\\s+de\\s+${label}`, 'i'),
                    new RegExp(`(?:${label})\\s*\\+\\d+\\s*(?:\\(prof\\)|\\bsave\\b)`, 'i')
                ];
                if (patterns.some(p => p.test(text))) {
                    savingThrows[s] = true;
                }
            }
        });

        // Extract Attacks from text (e.g. "Espada Curta +5 (1d6+3)" or "Arco Longo +4 (1d8+2)")
        const attacks = [];
        const atkRegex = /([a-zA-ZáéíóúÁÉÍÓÚçÇ\s]{3,20})\s+([+-]\d+)\s*\(([^)]+)\)/g;
        let match;
        while ((match = atkRegex.exec(text)) !== null && attacks.length < 6) {
            const nameAtk = match[1].trim();
            const blacklist = ['iniciativa', 'classe', 'armadura', 'deslocamento', 'pontos', 'vida', 'bonus', 'proficiencia', 'experience', 'background', 'level', 'alignment', 'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            if (!blacklist.some(b => nameAtk.toLowerCase().includes(b))) {
                attacks.push({
                    name: nameAtk,
                    bonus: match[2],
                    damage: match[3]
                });
            }
        }
        if (attacks.length === 0) {
            attacks.push({ name: '', bonus: '', damage: '' });
        }

        // Extract Equipment section
        let eqNotesText = '';
        const eqMatch = text.match(/(?:Equipment|Equipamento|🎒 Itens):\s*([\s\S]+?)(?=\n\n|\n[A-Z][a-z]+:|\n[A-Z]{3,}\b)/i);
        if (eqMatch) {
            eqNotesText = eqMatch[1].trim();
        }
        const items = [];
        if (eqNotesText) {
            const lines = eqNotesText.split(/[\n,;]+/);
            lines.forEach(line => {
                const cleaned = line.trim();
                if (cleaned && cleaned.length > 2) {
                    let qty = 1;
                    let nameItem = cleaned;
                    const qtyMatch = cleaned.match(/(?:x\s*(\d+))|(\d+)\s*x|\((\d+)\)/i);
                    if (qtyMatch) {
                        qty = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3]);
                        nameItem = cleaned.replace(qtyMatch[0], '').trim();
                    }
                    items.push({ name: nameItem, qty, weight: 0 });
                }
            });
        }

        let parsedLvl = 1;
        let parsedClass = clean(charClass) || 'Guerreiro';
        if (parsedClass.includes(' ')) {
            const levelMatch = parsedClass.match(/(\d+)/);
            if (levelMatch) {
                parsedLvl = parseInt(levelMatch[1]);
                parsedClass = parsedClass.replace(levelMatch[0], '').trim();
            }
        }

        const importData = {
            name: clean(name) || 'Herói Sem Nome',
            class: parsedClass,
            level: parsedLvl,
            race: clean(race) || 'Humano',
            background: clean(background) || 'Herói do Povo',
            playerName: '',
            alignment: clean(alignment) || 'Neutro',
            xp: xp || 0,
            ac: ac || 10,
            hp: { current: hp || 10, max: hp || 10, temp: 0 },
            speed: speed || 30,
            initiative: init || 0,
            proficiencyBonus: prof || 2,
            stats: stats,
            savingThrows: savingThrows,
            skills: skillMatches,
            attacks: attacks,
            currency: {
                pp: getInt(/(?:PP|Platina):\s*(\d+)/i) || 0,
                gp: getInt(/(?:GP|Ouro|PO):\s*(\d+)/i) || 0,
                ep: getInt(/(?:EP|Electrum):\s*(\d+)/i) || 0,
                sp: getInt(/(?:SP|Prata|PP):\s*(\d+)/i) || 0,
                cp: getInt(/(?:CP|Cobre|PC):\s*(\d+)/i) || 0
            },
            roleplay: {
                traits: text.match(/(?:Personality Traits|Traços|Características):\s*([^\r\n]+)/i)?.[1] || '',
                ideals: text.match(/(?:Ideals|Ideais):\s*([^\r\n]+)/i)?.[1] || '',
                bonds: text.match(/(?:Bonds|Vínculos):\s*([^\r\n]+)/i)?.[1] || '',
                flaws: text.match(/(?:Flaws|Fraquezas|Defeitos):\s*([^\r\n]+)/i)?.[1] || ''
            },
            equipment: {
                items: items,
                notes: eqNotesText
            },
            otherProfs: text.match(/(?:Other Proficiencies & Languages|Outras Proficiências & Idiomas|Idiomas|Proficiências):\s*([^\r\n]+)/i)?.[1] || '',
            bio: text.match(/(?:Backstory|História|Biografia):\s*([^\r\n]+)/i)?.[1] || '',
            allies: '',
            spells: {},
            spellSlots: {}
        };

        const languages = text.match(/(?:Languages|Idiomas):\s*([^\r\n]+)/i)?.[1];
        if (languages && !importData.otherProfs) importData.otherProfs = `IDIOMAS: ${languages}`;

        // Parse Spells from plain text if present
        for (let i = 0; i <= 9; i++) {
            const spellRegex = new RegExp(`(?:Level ${i} Spells|Magias de ${i}º Nível|Nível ${i}):\\s*([\\s\\S]+?)(?=\\n\\n|\\nLevel|\\nNível|\\b[A-Z][a-z]+:)`, 'i');
            const spellMatch = text.match(spellRegex);
            if (spellMatch) {
                importData.spells[`lvl${i}`] = spellMatch[1].trim();
            }
        }

        this._fillForm(importData);

        // AUTO-SAVE PERSISTENCE INTEGRATION FOR TEXT IMPORT
        try {
            TOME.store.update(s => {
                if (this._editingId) {
                    const idx = s.players.findIndex(p => p.id === this._editingId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...importData };
                    }
                    Toast.show('✅ Ficha do herói atualizada e salva com sucesso!', 'success');
                } else {
                    const nameSlug = (importData.name || 'hero').toLowerCase().replace(/\s+/g, '_');
                    const uniqueId = `${nameSlug}_${Date.now().toString().slice(-6)}`;
                    const player = { ...Schemas.createPlayer(importData), id: uniqueId };
                    s.players = [...s.players, player];
                    s.editingHeroId = uniqueId;
                    Toast.show('✅ Novo herói importado e salvo com sucesso!', 'success');
                }
            });
        } catch (saveErr) {
            if (saveErr.name === 'QuotaExceededError' || saveErr.message.includes('Quota')) {
                Toast.show('❌ Limite de armazenamento atingido (QuotaExceeded)! Remova dados antigos para liberar espaço.', 'danger');
                return;
            }
            console.error('Erro ao salvar ficha importada por texto:', saveErr);
            Toast.show('❌ Erro inesperado ao salvar ficha.', 'danger');
        }

        this.previewCards();
        this.closeImporter();
    }

    downloadHeroJSON() {
        try {
            const f = this.$('#hero-form');
            if (!f) throw new Error("Formulário não encontrado");
            const data = this._collectFormData(f);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${(data.name || 'Heroi').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tome.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                Toast.show('💾 JSON da lenda exportado com sucesso!', 'success');
            }, 100);
        } catch (err) {
            console.error("Erro ao exportar JSON:", err);
            Toast.show('❌ Erro ao exportar JSON.', 'danger');
        }
    }

    printOfficialSheet() {
        try {
            const f = this.$('#hero-form');
            if (!f) throw new Error("Formulário não encontrado");
            const data = this._collectFormData(f);
            
            let target = document.getElementById('dnd-print-target');
            if (!target) {
                target = document.createElement('div');
                target.id = 'dnd-print-target';
                document.body.appendChild(target);
            }
            
            target.innerHTML = `
                <style>
                    @media print {
                        body > *:not(#dnd-print-target) { display: none !important; }
                        #dnd-print-target { display: block !important; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
                        @page { margin: 0.5cm; size: auto; }
                    }
                </style>
                ${this._renderPrintTemplate(data)}
            `;
            
            Toast.show('🖨️ Gerando PDF Oficial D&D 5e...', 'success');
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    window.print();
                    setTimeout(() => {
                        if (target) target.innerHTML = ''; 
                    }, 1000);
                });
            });
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            Toast.show('❌ Erro ao gerar PDF.', 'danger');
        }
    }

    _renderPrintTemplate(p) {
        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const labels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
        const getMod = (v) => Math.floor((v - 10) / 2);
        const formatMod = (m) => m >= 0 ? `+${m}` : m;
        const prof = p.proficiencyBonus || 2;
        
        const percVal = getMod(stats.wis) + (p.skills.includes('perception') ? prof : 0);
        const investVal = getMod(stats.int) + (p.skills.includes('investigation') ? prof : 0);
        const insightVal = getMod(stats.wis) + (p.skills.includes('insight') ? prof : 0);

        const hasSpells = Object.values(p.spells || {}).some(s => s && s.trim());
        const isSpellcaster = ['mago', 'clérigo', 'druida', 'feiticeiro', 'bruxo', 'bardo', 'paladino', 'patrulheiro', 'wizard', 'cleric', 'druid', 'sorcerer', 'warlock', 'bard', 'paladin', 'ranger'].some(cls => p.class?.toLowerCase().includes(cls));
        
        let spellsPage = '';
        if (hasSpells || isSpellcaster) {
            spellsPage = `
                <div class="dnd-print-page spell-page" style="page-break-before: always; padding: 20px; color: black; font-family: 'Outfit', sans-serif; background: white;">
                    <div class="dnd-header" style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:end;">
                        <div>
                            <h1 style="margin:0; font-family:'Cinzel'; font-size:24px;">GRIMÓRIO ARCANO</h1>
                            <span style="font-size:10px; text-transform:uppercase;">Lista de Magias de ${p.name}</span>
                        </div>
                        <div style="display:flex; gap:15px; font-size:10px; font-weight:bold;">
                            <div>Classe Conjuradora: ${p.class?.split(' ')[0] || 'Conjurador'}</div>
                            <div>Bônus Proficiência: +${prof}</div>
                        </div>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                        ${[0,1,2,3,4,5,6,7,8,9].map(lv => {
                            const levelSpells = p.spells?.[`lvl${lv}`] || '';
                            const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };
                            let spellsContent = '';
                            if (levelSpells.trim()) {
                                spellsContent = levelSpells;
                            } else {
                                spellsContent = `○ ________________________\n○ ________________________\n○ ________________________\n○ ________________________\n○ ________________________`;
                            }
                            return `
                                <div style="border: 2px solid black; border-radius: 8px; padding: 10px; background: white; color: black; min-height: 110px;">
                                    <div style="font-weight: 800; font-size: 11px; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 5px; display:flex; justify-content:space-between;">
                                        <span>${lv === 0 ? 'TRUQUES' : `${lv}º NÍVEL`}</span>
                                        ${lv > 0 ? `<span>Slots: ${slots.total || '___'}</span>` : ''}
                                    </div>
                                    <div style="font-size: 9px; line-height: 1.5; white-space: pre-wrap; color: black;">${spellsContent}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <div class="dnd-print-template">
                <div class="dnd-print-page" style="padding: 20px; color: black; font-family: 'Outfit', sans-serif; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; background: white;">
                    <!-- HEADER -->
                    <div class="dnd-header" style="display:flex; gap:15px; border-bottom:2px solid black; padding-bottom:10px; margin-bottom:15px;">
                        <div style="flex:1.5;">
                            <h1 style="margin:0; font-size:28px; font-family:'Cinzel'; color: black;">${p.name}</h1>
                            <span style="font-size:9px; text-transform:uppercase; font-weight:800; letter-spacing:1px; color:#555;">Nome do Personagem</span>
                        </div>
                        <div style="flex:2.5; display:grid; grid-template-columns: 1.2fr 1fr 1fr; gap:8px; border:2px solid black; padding:10px; border-radius:8px; background:white;">
                            <div>
                                <div style="font-size:10px; font-weight:800; color: black;">${p.class || '---'}</div>
                                <span style="font-size:8px; color:#666; text-transform:uppercase;">Classe & Nível</span>
                            </div>
                            <div>
                                <div style="font-size:10px; font-weight:800; color: black;">${p.race || '---'}</div>
                                <span style="font-size:8px; color:#666; text-transform:uppercase;">Raça</span>
                            </div>
                            <div>
                                <div style="font-size:10px; font-weight:800; color: black;">${p.alignment || '---'}</div>
                                <span style="font-size:8px; color:#666; text-transform:uppercase;">Tendência</span>
                            </div>
                            <div>
                                <div style="font-size:10px; font-weight:800; color: black;">${p.background || '---'}</div>
                                <span style="font-size:8px; color:#666; text-transform:uppercase;">Antecedente</span>
                            </div>
                            <div>
                                <div style="font-size:10px; font-weight:800; color: black;">${p.playerName || '---'}</div>
                                <span style="font-size:8px; color:#666; text-transform:uppercase;">Jogador</span>
                            </div>
                            <div>
                                <div style="font-size:10px; font-weight:800; color: black;">${p.xp || 0}</div>
                                <span style="font-size:8px; color:#666; text-transform:uppercase;">Pontos de Experiência</span>
                            </div>
                        </div>
                    </div>

                    <!-- COMBAT METRICS -->
                    <div class="dnd-main-stats" style="margin-top:15px; display:flex; gap:10px; justify-content:space-between; margin-bottom:15px;">
                        <div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.ac || 10}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">CA</div></div>
                        <div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${formatMod(p.initiative || 0)}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">Iniciativa</div></div>
                        <div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.speed || 30} ft</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">Deslocamento</div></div>
                        <div class="dnd-box" style="flex:2.5; border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.hp?.current} / ${p.hp?.max}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">Pontos de Vida</div></div>
                        <div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.hp?.temp || 0}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">PV Temp</div></div>
                    </div>

                    <!-- CORE GRID -->
                    <div class="dnd-grid" style="margin-top:15px; display:grid; grid-template-columns: 110px 240px 1fr 280px; gap:15px; flex:1;">
                        
                        <!-- COLUMN 1: ABILITIES -->
                        <div class="dnd-stats-column" style="display:flex; flex-direction:column; gap:10px;">
                            ${Object.entries(stats).map(([s, v]) => `
                                <div class="stat-box" style="border: 2px solid black; border-radius: 8px; height: 75px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background:white; color: black;">
                                    <div class="stat-label" style="font-size: 8px; font-weight: 800; text-transform: uppercase; margin-top:2px;">${labels[s]}</div>
                                    <div class="stat-val" style="font-size: 20px; font-weight: 900;">${v}</div>
                                    <div class="stat-mod" style="position: absolute; bottom: -8px; background: white; border: 2px solid black; border-radius: 50% / 30%; width: 34px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px;">${formatMod(getMod(v))}</div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- COLUMN 2: SAVES & SKILLS -->
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <!-- SAVES -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black;">
                                <div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">TESTES DE RESISTÊNCIA</div>
                                ${Object.entries(stats).map(([s, v]) => {
                                    const isProf = !!p.savingThrows?.[s];
                                    const bonus = getMod(v) + (isProf ? prof : 0);
                                    return `
                                        <div style="display:flex; align-items:center; gap:5px; font-size:9px; height:14px;">
                                            <span style="font-size:8px;">${isProf ? '●' : '○'}</span>
                                            <span style="font-weight:bold; width:18px;">${formatMod(bonus)}</span>
                                            <span>${labels[s]}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <!-- SKILLS -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; flex:1;">
                                <div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">PERÍCIAS</div>
                                ${this._skills.map(sk => {
                                    const isProf = p.skills.includes(sk.id);
                                    const bonus = getMod(stats[sk.stat]) + (isProf ? prof : 0);
                                    return `
                                        <div style="display:flex; align-items:center; gap:5px; font-size:9px; height:13px;">
                                            <span style="font-size:8px;">${isProf ? '●' : '○'}</span>
                                            <span style="font-weight:bold; width:18px;">${formatMod(bonus)}</span>
                                            <span>${sk.label} <small style="color:#666; font-size:7px;">(${labels[sk.stat]})</small></span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- COLUMN 3: ATTACKS & EQUIPMENT -->
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <!-- ATTACKS -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black;">
                                <div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">ATAQUES & CONJURAÇÃO</div>
                                <table style="width:100%; border-collapse:collapse; font-size:9px; text-align:left; color: black;">
                                    <thead>
                                        <tr style="border-bottom:1px solid #555;">
                                            <th style="padding:2px;">Ataque</th>
                                            <th style="padding:2px;">Bônus</th>
                                            <th style="padding:2px;">Dano/Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(() => {
                                            const atksToRender = p.attacks && p.attacks.length ? p.attacks.filter(a => a.name || a.bonus || a.damage) : [];
                                            let html = atksToRender.map(atk => `
                                                <tr style="border-bottom:1px solid #eee; height:18px;">
                                                    <td style="padding:4px 2px; font-weight:bold;">${atk.name || ''}</td>
                                                    <td style="padding:4px 2px;">${atk.bonus || ''}</td>
                                                    <td style="padding:4px 2px;">${atk.damage || ''}</td>
                                                </tr>
                                            `).join('');
                                            const needed = Math.max(0, 6 - atksToRender.length);
                                            for (let i = 0; i < needed; i++) {
                                                html += `
                                                    <tr style="border-bottom:1px solid #eee; height:18px;">
                                                        <td style="padding:4px 2px; color:#bbb;">________________________</td>
                                                        <td style="padding:4px 2px; color:#bbb;">______</td>
                                                        <td style="padding:4px 2px; color:#bbb;">__________</td>
                                                    </tr>
                                                `;
                                            }
                                            return html;
                                        })()}
                                    </tbody>
                                </table>
                                ${p.attackNotes ? `<div style="font-size:8px; border-top:1px solid black; margin-top:5px; padding-top:5px; font-style:italic; white-space:pre-wrap;">${p.attackNotes}</div>` : ''}
                            </div>

                            <!-- EQUIPMENT & INVENTORY -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; flex:1; display:flex; flex-direction:column;">
                                <div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">🎒 EQUIPAMENTO & MOEDAS</div>
                                
                                <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:3px; text-align:center; margin-bottom:8px; font-size:8px; background:#f5f5f5; padding:4px; border-radius:4px; color: black;">
                                    <div><strong>PL:</strong> ${p.currency?.pp || 0}</div>
                                    <div><strong>PO:</strong> ${p.currency?.gp || 0}</div>
                                    <div><strong>PE:</strong> ${p.currency?.ep || 0}</div>
                                    <div><strong>PP:</strong> ${p.currency?.sp || 0}</div>
                                    <div><strong>PC:</strong> ${p.currency?.cp || 0}</div>
                                </div>

                                <div style="font-size:8px; line-height:1.3; flex:1; overflow:hidden;">
                                    ${(() => {
                                        const itemsToRender = p.equipment?.items && p.equipment.items.length ? p.equipment.items.filter(item => item.name || item.qty > 1) : [];
                                        let html = itemsToRender.map(item => `
                                            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:1px 0; height:16px;">
                                                <span><strong>${item.name || ''}</strong></span>
                                                <span style="color:#666;">x${item.qty || 1} ${item.weight ? `(${item.weight} lbs)` : ''}</span>
                                            </div>
                                        `).join('');
                                        const needed = Math.max(0, 10 - itemsToRender.length);
                                        for (let i = 0; i < needed; i++) {
                                            html += `
                                                <div style="display:flex; justify-content:space-between; border-bottom:1px dashed #ddd; padding:1px 0; height:16px;">
                                                    <span style="color:#ddd;">_________________________________________</span>
                                                    <span style="color:#ddd;">____</span>
                                                </div>
                                            `;
                                        }
                                        return html;
                                    })()}
                                    ${p.equipment?.notes ? `<div style="font-size:8px; border-top:1px dashed #ccc; margin-top:5px; padding-top:5px; font-style:italic; white-space:pre-wrap;">${p.equipment.notes}</div>` : ''}
                                </div>
                            </div>
                        </div>

                        <!-- COLUMN 4: NARRATIVE & TRAITS -->
                        <div style="display:flex; flex-direction:column; gap:10px;">
                            <!-- PASSIVE SCORES -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; font-size:9px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                                    <span>SABEDORIA PASSIVA (PERCEPÇÃO)</span>
                                    <strong>${10 + percVal}</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                                    <span>INTELIGÊNCIA PASSIVA (INVEST.)</span>
                                    <strong>${10 + investVal}</strong>
                                </div>
                                <div style="display:flex; justify-content:space-between;">
                                    <span>SABEDORIA PASSIVA (INTUIÇÃO)</span>
                                    <strong>${10 + insightVal}</strong>
                                </div>
                            </div>

                            <!-- ROLEPLAY TRAITS -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; font-size:8px; display:flex; flex-direction:column; gap:6px;">
                                <div>
                                    <strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Traços de Personalidade</strong>
                                    <div style="margin-top:2px;">${p.roleplay?.traits || '---'}</div>
                                </div>
                                <div>
                                    <strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Ideais</strong>
                                    <div style="margin-top:2px;">${p.roleplay?.ideals || '---'}</div>
                                </div>
                                <div>
                                    <strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Vínculos</strong>
                                    <div style="margin-top:2px;">${p.roleplay?.bonds || '---'}</div>
                                </div>
                                <div>
                                    <strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Fraquezas</strong>
                                    <div style="margin-top:2px;">${p.roleplay?.flaws || '---'}</div>
                                </div>
                            </div>

                            <!-- OTHER PROFS & BIO -->
                            <div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; flex:1; font-size:8px;">
                                <strong style="text-transform:uppercase; display:block; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px;">Outras Proficiências & Idiomas</strong>
                                <div style="white-space:pre-wrap; line-height:1.3;">${p.otherProfs || '---'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div style="margin-top:15px; font-size:8px; text-align:center; opacity:0.5; border-top:1px solid #ccc; padding-top:5px; color: black;">
                        Gerado pela Mesa do Mestre — Ficha Oficial de Referência 5e
                    </div>
                </div>

                <!-- SPELLS PAGE -->
                ${spellsPage}
            </div>
        `;
    }

    cloneToBestiary() {
        const data = this._collectFormData(this.$('#hero-form'));
        const monster = {
            ...data,
            id: `clone_${Date.now()}`,
            type: 'NPC',
            cr: Math.floor(data.level / 2) || 1,
            hp_current: data.hp?.current,
            hp_max: data.hp?.max,
            ac: data.ac,
            actions: data.attacks.map(a => ({ name: a.name, bonus: a.bonus, damage: a.damage }))
        };

        TOME.store.update(s => {
            s.monsters = [...(s.monsters || []), monster];
        });
        Toast.show('😈 NPC registrado com sucesso no Bestiário!');
    }

    _renderCardTab() {
        return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:20px; padding:20px;">
                <p style="color:var(--text-dim); font-size:0.85rem; text-align:center;">
                    Esta é a visualização da <strong>Carta de Avatar</strong> oficial no formato TCG (proporção 5:7).<br>
                    Os dados são gerados em tempo real. Ajuste o enquadramento usando os controles ao lado e clique na carta para baixá-la.
                </p>
                <div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap; width:100%; max-width:1200px; margin-top:20px;">
                    <div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap; flex:1; min-width:320px;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                            <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:0.8rem;">FRENTE (COMBATE)</h4>
                            <canvas id="card-canvas-front" data-action="downloadCard" data-side="front" style="border-radius:15px; box-shadow:var(--shadow-accent); max-width:100%; width:280px; height:392px; cursor:pointer; border:1px solid rgba(197, 160, 89, 0.3); transition: transform 0.2s;"></canvas>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                            <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:0.8rem;">VERSO (HISTÓRIA)</h4>
                            <canvas id="card-canvas-back" data-action="downloadCard" data-side="back" style="border-radius:15px; box-shadow:var(--shadow-accent); max-width:100%; width:280px; height:392px; cursor:pointer; border:1px solid rgba(197, 160, 89, 0.3); transition: transform 0.2s;"></canvas>
                        </div>
                    </div>
                    
                    <div class="skills-list" style="width:340px; padding:20px; display:flex; flex-direction:column; gap:15px; background:rgba(0,0,0,0.3); border:var(--sheet-border-thick); border-radius:12px;">
                        <h3 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                            <i class="fa-solid fa-sliders" style="margin-right:8px;"></i> Ajustes do Card TCG
                        </h3>
                        
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <label class="attr-label" style="font-size:0.6rem;">IMAGEM DO RETRATO</label>
                            <button type="button" class="btn btn-ghost btn-block" style="border:1px solid var(--accent); font-size:0.75rem; display:flex; align-items:center; justify-content:center; gap:8px;" data-action="triggerPortrait">
                                <i class="fa-solid fa-upload"></i> Escolher Foto do Herói
                            </button>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                                <label class="attr-label" style="font-size:0.65rem; margin:0;">ENQUADRAMENTO DA FOTO</label>
                                <button type="button" class="btn btn-ghost btn-sm" style="font-size:0.55rem; padding:2px 6px;" data-action="resetPortrait">CENTRALIZAR</button>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-dim);">
                                    <span>Zoom (Escala):</span>
                                    <span id="label-val-scale">1.00x</span>
                                </div>
                                <input type="range" min="0.5" max="3" step="0.05" value="${this._portraitSettings.scale || 1}" data-action="updatePortrait" data-key="scale" style="width:100%;">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-dim);">
                                    <span>Posição Horizontal (X):</span>
                                    <span id="label-val-x">0px</span>
                                </div>
                                <input type="range" min="-300" max="300" step="1" value="${this._portraitSettings.x || 0}" data-action="updatePortrait" data-key="x" style="width:100%;">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-dim);">
                                    <span>Posição Vertical (Y):</span>
                                    <span id="label-val-y">0px</span>
                                </div>
                                <input type="range" min="-300" max="300" step="1" value="${this._portraitSettings.y || 0}" data-action="updatePortrait" data-key="y" style="width:100%;">
                            </div>
                        </div>

                        <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:15px; display:flex; flex-direction:column; gap:10px;">
                            <button type="button" class="btn btn-primary btn-block" data-action="downloadPrintablePair" style="font-size:0.75rem; font-family:'Cinzel'; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px;">
                                <i class="fa-solid fa-file-image"></i> Baixar Par Imprimível (5:7)
                            </button>
                            <p style="font-size:0.6rem; color:var(--text-dim); text-align:center; margin:0; line-height:1.3;">
                                * O par imprimível gera as imagens lado a lado no tamanho oficial de TCG (7.0 x 9.8 cm) sem esticar a arte.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _drawCards(formData) {
        const original = TOME.store.state.players?.find(x => x.id === this._editingId) || {};
        const data = {
            ...original,
            ...formData,
            portraitData: this._portraitData,
            portraitSettings: this._portraitSettings,
            bio: formData.bio || formData.roleplay?.traits || 'Sem registros.'
        };
        const cFront = this.$('#card-canvas-front');
        const cBack = this.$('#card-canvas-back');
        if (cFront) CardRenderer.renderFront(data, cFront);
        if (cBack) CardRenderer.renderBack(data, cBack);
    }

    async downloadCard(e, el) {
        const side = el.dataset.side;
        const name = this.$('#input-hero-name').value || 'heroi';
        
        Toast.show('🔮 Preparando imagem em alta resolução...');
        try {
            const f = this.$('#hero-form');
            const formData = f ? this._collectFormData(f) : {};
            const original = TOME.store.state.players?.find(x => x.id === this._editingId) || {};
            const data = {
                ...original,
                ...formData,
                portraitData: this._portraitData,
                portraitSettings: this._portraitSettings,
                bio: formData.bio || formData.roleplay?.traits || 'Sem registros.'
            };

            const tempCanvas = document.createElement('canvas');
            if (side === 'front') {
                await CardRenderer.renderFront(data, tempCanvas, { scale: 4 });
            } else {
                await CardRenderer.renderBack(data, tempCanvas, { scale: 4 });
            }

            CardRenderer.download(tempCanvas, `${name.toLowerCase().replace(/\s+/g, '_')}_card_${side}.png`);
            Toast.show(`📥 Carta (${side}) baixada com sucesso!`);
        } catch (err) {
            console.error('Erro ao baixar carta:', err);
            Toast.show('❌ Erro ao exportar carta.', 'danger');
        }
    }

    async downloadPrintablePair() {
        Toast.show('🔮 Preparando par imprimível em alta resolução...');
        try {
            const f = this.$('#hero-form');
            const formData = f ? this._collectFormData(f) : {};
            const original = TOME.store.state.players?.find(x => x.id === this._editingId) || {};
            const data = {
                ...original,
                ...formData,
                portraitData: this._portraitData,
                portraitSettings: this._portraitSettings,
                bio: formData.bio || formData.roleplay?.traits || 'Sem registros.'
            };

            const tempFront = document.createElement('canvas');
            const tempBack = document.createElement('canvas');

            await CardRenderer.renderFront(data, tempFront, { scale: 4 });
            await CardRenderer.renderBack(data, tempBack, { scale: 4 });

            const frontDataUrl = tempFront.toDataURL('image/png');
            const backDataUrl = tempBack.toDataURL('image/png');
            
            const name = this.$('#input-hero-name').value || 'heroi';
            
            await exportFrontBackPNG(frontDataUrl, backDataUrl, {
                filename: `${name.toLowerCase().replace(/\s+/g, '_')}_card_print_pair.png`,
                printWidthCm: 7.0,
                printHeightCm: 9.8
            });
            
            Toast.show('✅ Par imprimível (5:7) baixado com sucesso!');
        } catch (err) {
            console.error('Erro ao exportar par imprimível:', err);
            Toast.show('❌ Erro ao exportar par imprimível.', 'danger');
        }
    }
}
