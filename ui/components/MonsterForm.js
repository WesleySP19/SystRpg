import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { MonsterData } from '../../data/MonsterData.js';

/**
 * BESTIARY & MONSTER FORM v6.5 — "Legacy Grimoire" Edition
 * Redesigned to match the Parchment & Ink aesthetic.
 */
export class MonsterForm extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        this._view = 'library';
        this._selectedCR = 'Nível 1';
    }

    onMount() {
        const f = this.$('#monster-form');
        if (f) {
            f.onsubmit = (e) => {
                e.preventDefault();
                const fd = new FormData(f);
                const notes = fd.get('notes') || '';
                const rules = window.TOME?.RulesEngine?.getActiveRuleset() || null;
                const dynamicStats = {};
                
                if (rules) {
                    rules.stats.forEach(st => dynamicStats[st.id] = parseInt(fd.get(`stat_${st.id}`)) || 10);
                } else {
                    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(st => dynamicStats[st] = parseInt(fd.get(`stat_${st}`)) || 10);
                }

                const monster = {
                    id: 'm-' + Date.now(),
                    name: fd.get('name') || 'Nova Ameaça',
                    type: 'Monster',
                    cr: fd.get('cr') || '1',
                    ac: parseInt(fd.get('ac')) || 10,
                    hp: { current: parseInt(fd.get('hp_max')) || 10, max: parseInt(fd.get('hp_max')) || 10 },
                    stats: dynamicStats,
                    notes: notes,
                    actions: this._parseActionsFromNotes(notes)
                };

                TOME.store.update(s => {
                    s.monsters = [...(s.monsters || []), monster];
                });
                Toast.show(`✅ ${monster.name} registrado no Bestiário!`, 'success');
                this._view = 'library';
                this.render();
            };
        }
    }

    template() {
        return html`
            <div class="page legacy-sheet-container" style="max-width:1200px; margin: 0 auto;">
                <div class="section-header" style="border-bottom: var(--sheet-border-thick); padding-bottom:15px; margin-bottom:30px;">
                    <div>
                        <h2 class="section-title" style="font-family:var(--sheet-font-header); font-size:2rem;">
                            <i class="fa-solid fa-book-skull" style="margin-right:10px; color:var(--sheet-border-color);"></i> Bestiário Arcano
                        </h2>
                        <p class="section-subtitle" style="color:var(--sheet-label-color);">Compêndio oficial de criaturas e ameaças</p>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="sheet-tab-btn ${this._view === 'library' ? 'active' : ''}" data-action="setView" data-mode="library">BIBLIOTECA</button>
                        <button class="sheet-tab-btn ${this._view === 'creator' ? 'active' : ''}" data-action="setView" data-mode="creator">CRIAR AMEAÇA</button>
                        <button class="sheet-tab-btn" data-action="openImporter" style="background:var(--sheet-accent-blue); color:white;">📥 IMPORTAR PRO</button>
                    </div>
                </div>

                ${this._view === 'library' ? this._renderLibrary() : this._renderCreator()}
                
                <!-- MONSTER IMPORTER MODAL -->
                <div id="monster-importer" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:3000; align-items:center; justify-content:center; padding:20px;">
                    <div class="card glass-accent" style="max-width:700px; width:100%; padding:30px; border:1px solid var(--accent);">
                        <h3 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:10px;">🔮 Importador Arcano de Monstros</h3>
                        <p style="font-size:0.7rem; opacity:0.7; margin-bottom:20px;">Cole o bloco de texto do monstro (SRD, PDF ou Web) abaixo.</p>
                        
                        <textarea id="monster-import-text" class="legacy-textarea" style="height:350px; margin-bottom:20px;" placeholder="Ex: Owlbear / Large monstrosity, unaligned / Armor Class 13 / Hit Points 59..."></textarea>
                        
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-ghost btn-block" data-action="closeImporter">Cancelar</button>
                            <button class="btn btn-primary btn-block" data-action="processMonsterImport">Processar & Criar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderLibrary() {
        const crGroups = Object.keys(MonsterData);
        const list = MonsterData[this._selectedCR] || [];

        return html`
            <div style="display:flex; flex-direction:column; gap:20px;">
                <!-- Category Tabs (Horizontal Scroll) -->
                <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:15px; border-bottom:var(--sheet-border-thin);">
                    ${crGroups.map(cr => html`
                        <button class="level-tab ${this._selectedCR === cr ? 'active' : ''}" 
                                style="font-family:var(--sheet-font-header); font-size:0.7rem; border: var(--sheet-border-thin); background:white; padding:5px 15px; border-radius:4px; cursor:pointer; ${cr === 'BOSS' ? 'color:red; border-color:red;' : ''}"
                                data-action="setCR" data-cr="${cr}">${cr}</button>
                    `)}
                </div>

                <!-- Creature Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; max-height: 70vh; overflow-y: auto; padding-right:15px;">
                    ${list.map(m => html`
                        <div class="card" style="background:white; border:var(--sheet-border-thick); border-radius:8px; padding:0; overflow:hidden; position:relative; transition: transform 0.2s;">
                            <div style="height:120px; background:var(--sheet-accent-blue); display:flex; align-items:center; justify-content:center; font-size:4rem; border-bottom:var(--sheet-border-thin);">
                                ${m.emoji || '🐾'}
                            </div>
                            <div style="padding:15px;">
                                <h4 style="font-family:var(--sheet-font-header); font-size:1.1rem; margin:0;">${m.name}</h4>
                                <div style="font-size:0.7rem; color:var(--sheet-label-color); text-transform:uppercase; font-weight:700; margin-top:5px;">
                                    ${m.type} • CA ${m.ac} • HP ${m.hp}
                                </div>
                                <p style="font-size:0.75rem; margin-top:10px; line-height:1.4; color:#333;">${m.notes || 'Nenhuma descrição adicional disponível no bestiário.'}</p>
                                
                                <button class="btn btn-primary btn-sm btn-block" style="margin-top:15px; border-radius:4px;" 
                                        data-action="addToCampaign" data-name="${m.name}" data-cr="${this._selectedCR}">
                                    <i class="fa-solid fa-plus"></i> ADICIONAR À ARENA
                                </button>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    _renderCreator() {
        const rules = window.TOME?.RulesEngine?.getActiveRuleset() || null;
        const stats = rules ? rules.stats : [
            { id: 'str', label: 'FOR' },
            { id: 'dex', label: 'DES' },
            { id: 'con', label: 'CON' },
            { id: 'int', label: 'INT' },
            { id: 'wis', label: 'SAB' },
            { id: 'cha', label: 'CAR' }
        ];

        return html`
            <div style="max-width:800px; margin:0 auto; background:white; border:var(--sheet-border-thick); padding:30px; border-radius:10px; box-shadow:var(--shadow-sm);">
                <form id="monster-form" style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                        <div>
                            <label class="attr-label">NOME DA CRIATURA</label>
                            <input class="legacy-input" type="text" name="name" required placeholder="Ex: Dragão de Ossos" style="width:100%; font-size:1.2rem;" />
                        </div>
                        <div>
                            <label class="attr-label">NÍVEL / CR</label>
                            <input class="legacy-input" type="text" name="cr" placeholder="Nível 5" style="width:100%;" />
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                        <div>
                            <label class="attr-label">TIPO</label>
                            <input class="legacy-input" type="text" name="type" placeholder="Morto-Vivo" style="width:100%;" />
                        </div>
                        <div>
                            <label class="attr-label">CLASSE DE ARMADURA</label>
                            <input class="legacy-input" type="number" name="ac" value="10" style="width:100%;" />
                        </div>
                        <div>
                            <label class="attr-label">PONTOS DE VIDA</label>
                            <input class="legacy-input" type="number" name="hp_max" value="30" style="width:100%;" />
                        </div>
                    </div>

                    <div>
                        <label class="attr-label">ATRIBUTOS</label>
                        <div style="display:grid; grid-template-columns: repeat(${stats.length}, 1fr); gap:10px;">
                            ${stats.map(st => html`
                                <div style="text-align:center;">
                                    <label style="font-size:0.6rem; font-weight:800;">${st.short || st.label}</label>
                                    <input class="legacy-input" type="number" name="stat_${st.id}" value="10" style="text-align:center;" />
                                </div>
                            `)}
                        </div>
                    </div>

                    <div>
                        <label class="attr-label">HABILIDADES E ATAQUES</label>
                        <textarea class="legacy-textarea" name="notes" rows="6" placeholder="Descreva os ataques e habilidades especiais..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="padding:15px; font-family:var(--sheet-font-header); font-size:1.1rem;">
                        <i class="fa-solid fa-dragon"></i> REGISTRAR AMEAÇA NO BESTIÁRIO
                    </button>
                </form>
            </div>
        `;
    }

    setView(e, el) { this._view = el.dataset.mode; this.render(); }
    setCR(e, el) { this._selectedCR = el.dataset.cr; this.render(); }

    addToCampaign(e, el) {
        const name = el.dataset.name;
        const cr = el.dataset.cr;
        const monster = MonsterData[cr].find(m => m.name === name);
        if (monster) {
            TOME.store.update(s => {
                const newMonster = {
                    ...monster,
                    id: 'm-' + Date.now(),
                    type: 'Monster',
                    cr: cr.replace('Nível ', ''),
                    hp: { current: monster.hp, max: monster.hp },
                    stats: monster.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 }
                };
                s.monsters = [...(s.monsters || []), newMonster];
            });
            Toast.show(`${name} adicionado à arena!`, 'success');
        }
    }

    openImporter() { this.$('#monster-importer').style.display = 'flex'; }
    closeImporter() { this.$('#monster-importer').style.display = 'none'; }

    async processMonsterImport() {
        const text = this.$('#monster-import-text').value;
        if (!text) return;

        Toast.show('🔮 Decifrando grimório arcano...');

        const getInt = (reg) => { const m = text.match(reg); return m ? parseInt(m[1]) : null; };

        // Parsing Heurístico
        const name = text.split('\n')[0].trim();
        const type = text.match(/(?:Size|Tamanho)\s+\w+,\s+([^,]+)/i)?.[1] || 'Criatura';
        const ac = getInt(/(?:Armor Class|CA|AC)\s*(\d+)/i) || 10;
        const hp = getInt(/(?:Hit Points|HP|PV)\s*(\d+)/i) || 20;
        const cr = text.match(/(?:Challenge|CR|ND)\s*([\d\/]+)/i)?.[1] || '1';

        const stats = {
            str: getInt(/(?:STR|FOR)\s*(\d+)/i) || 10,
            dex: getInt(/(?:DEX|DES)\s*(\d+)/i) || 10,
            con: getInt(/(?:CON)\s*(\d+)/i) || 10,
            int: getInt(/(?:INT)\s*(\d+)/i) || 10,
            wis: getInt(/(?:WIS|SAB)\s*(\d+)/i) || 10,
            cha: getInt(/(?:CHA|CAR)\s*(\d+)/i) || 10
        };

        const actionMatch = text.match(/(?:Actions|Ações)[\s\S]+/i);
        const notes = actionMatch ? actionMatch[0] : text;

        TOME.store.update(s => {
            s.monsters = [...(s.monsters || []), {
                id: 'm-' + Date.now(),
                name: name,
                type: 'Monster',
                cr: cr,
                ac: ac,
                hp: { current: hp, max: hp },
                stats: stats,
                notes: notes,
                actions: this._parseActionsFromNotes(notes)
            }];
        });

        Toast.show(`✅ ${name} foi adicionado ao seu bestiário!`, 'success');
        this.closeImporter();
        this._view = 'library';
        this.render();
    }

    _parseActionsFromNotes(notes) {
        // Tenta extrair ataques simples: Nome + Bônus + Dano
        const actions = [];
        const lines = notes.split('\n');
        lines.forEach(l => {
            const m = l.match(/^(.*?):\s*([+-]\d+)\s*to hit.*?\((.*?)\)/i);
            if (m) actions.push({ name: m[1].trim(), bonus: parseInt(m[2]), damage: m[3] });
        });
        return actions.length ? actions : [{ name: 'Ataque Genérico', bonus: 0, damage: '1d6' }];
    }
}
