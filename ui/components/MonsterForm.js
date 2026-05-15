import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { MonsterData } from '../../data/MonsterData.js';

/**
 * BESTIARY & MONSTER FORM v7.0 — "Intelligent Grimoire"
 * Structured actions and individual attribute management.
 */
export class MonsterForm extends Component {
    constructor(opts) {
        super(opts);
        this._view = 'library';
        this._selectedCR = 'Nível 1';
    }

    template() {
        return `
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
                    </div>
                </div>

                ${this._view === 'library' ? this._renderLibrary() : this._renderCreator()}
            </div>
        `;
    }

    _renderLibrary() {
        const crGroups = Object.keys(MonsterData);
        const list = MonsterData[this._selectedCR] || [];
        const { monsters = [] } = this.store.state;
        const customMonsters = monsters.filter(m => !m.fromSRD); // Assume new ones aren't SRD

        return `
            <div style="display:flex; flex-direction:column; gap:20px;">
                <!-- Category Tabs (Horizontal Scroll) -->
                <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:15px; border-bottom:var(--sheet-border-thin);">
                    ${crGroups.map(cr => `
                        <button class="level-tab ${this._selectedCR === cr ? 'active' : ''}" 
                                style="font-family:var(--sheet-font-header); font-size:0.7rem; border: var(--sheet-border-thin); background:white; padding:5px 15px; border-radius:4px; cursor:pointer; ${cr === 'BOSS' ? 'color:red; border-color:red;' : ''}"
                                data-action="setCR" data-cr="${cr}">${cr}</button>
                    `).join('')}
                    <button class="level-tab ${this._selectedCR === 'CUSTOM' ? 'active' : ''}" 
                            style="font-family:var(--sheet-font-header); font-size:0.7rem; border: var(--sheet-border-thin); background:white; padding:5px 15px; border-radius:4px; cursor:pointer; color:var(--sheet-accent-blue);"
                            data-action="setCR" data-cr="CUSTOM">AMEAÇAS CUSTOM</button>
                </div>

                <!-- Creature Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; max-height: 70vh; overflow-y: auto; padding-right:15px;">
                    ${this._selectedCR === 'CUSTOM' ? 
                        customMonsters.map(m => this._renderMonsterCard(m, true)).join('') :
                        list.map(m => this._renderMonsterCard(m, false)).join('')
                    }
                    ${this._selectedCR === 'CUSTOM' && customMonsters.length === 0 ? '<p style="opacity:0.5; text-align:center; grid-column: 1/-1; padding:40px;">Nenhuma ameaça customizada registrada.</p>' : ''}
                </div>
            </div>
        `;
    }

    _renderMonsterCard(m, isCustom) {
        return `
            <div class="card" style="background:white; border:var(--sheet-border-thick); border-radius:8px; padding:0; overflow:hidden; position:relative; transition: transform 0.2s;">
                <div style="height:120px; background:var(--sheet-accent-blue); display:flex; align-items:center; justify-content:center; font-size:4rem; border-bottom:var(--sheet-border-thin);">
                    ${m.emoji || '🐾'}
                </div>
                <div style="padding:15px;">
                    <h4 style="font-family:var(--sheet-font-header); font-size:1.1rem; margin:0;">${m.name}</h4>
                    <div style="font-size:0.7rem; color:var(--sheet-label-color); text-transform:uppercase; font-weight:700; margin-top:5px;">
                        ${m.type} • CA ${m.ac} • HP ${m.hp?.max || m.hp}
                    </div>
                    <p style="font-size:0.75rem; margin-top:10px; line-height:1.4; color:#333; height:45px; overflow:hidden; text-overflow:ellipsis;">${m.notes || 'Nenhuma descrição adicional disponível no tomo.'}</p>
                    
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <button class="btn btn-primary btn-sm" style="flex:2; border-radius:4px;" 
                                data-action="addToCampaign" data-id="${m.id}" data-name="${m.name}" data-cr="${this._selectedCR}">
                            <i class="fa-solid fa-plus"></i> ARENA
                        </button>
                        ${isCustom ? `
                            <button class="btn btn-danger btn-sm" style="flex:1; border-radius:4px;" 
                                    data-action="deleteMonster" data-id="${m.id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    _renderCreator() {
        const stats = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
        return `
            <div style="max-width:800px; margin:0 auto; background:white; border:var(--sheet-border-thick); padding:30px; border-radius:10px; box-shadow:var(--shadow-sm);">
                <form id="monster-form" style="display:flex; flex-direction:column; gap:20px;">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                        <div>
                            <label class="attr-label">NOME DA CRIATURA</label>
                            <input class="legacy-input" type="text" name="name" required placeholder="Ex: Dragão de Ossos" style="width:100%; font-size:1.2rem;">
                        </div>
                        <div>
                            <label class="attr-label">NÍVEL / CR</label>
                            <input class="legacy-input" type="text" name="cr" placeholder="5" style="width:100%;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                        <div>
                            <label class="attr-label">TIPO</label>
                            <input class="legacy-input" type="text" name="type" placeholder="Morto-Vivo" style="width:100%;">
                        </div>
                        <div>
                            <label class="attr-label">CA</label>
                            <input class="legacy-input" type="number" name="ac" value="10" style="width:100%;">
                        </div>
                        <div>
                            <label class="attr-label">HP MÁXIMO</label>
                            <input class="legacy-input" type="number" name="hp_max" value="30" style="width:100%;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:10px; background:rgba(0,0,0,0.02); padding:15px; border-radius:8px;">
                        ${stats.map(s => `
                            <div style="text-align:center;">
                                <label style="font-size:0.6rem; font-weight:900; display:block; margin-bottom:5px;">${s}</label>
                                <input class="legacy-input" type="number" name="stat_${s.toLowerCase()}" value="10" style="width:100%; text-align:center; padding:5px;">
                            </div>
                        `).join('')}
                    </div>

                    <div>
                        <label class="attr-label">AÇÕES DE COMBATE</label>
                        <div id="actions-list" style="display:flex; flex-direction:column; gap:10px; margin-bottom:10px;">
                            <div class="action-row glass" style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 40px; gap:8px; padding:10px;">
                                <input class="legacy-input" type="text" name="action_name[]" placeholder="Nome do Ataque">
                                <input class="legacy-input" type="text" name="action_bonus[]" placeholder="+Bônus">
                                <input class="legacy-input" type="text" name="action_dmg[]" placeholder="Dano (1d6)">
                                <select class="legacy-input" name="action_type[]">
                                    <option value="single">Único</option>
                                    <option value="area">Área</option>
                                </select>
                                <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.action-row').remove()">×</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-ghost btn-sm" data-action="addActionRow">+ ADICIONAR AÇÃO</button>
                    </div>

                    <button type="submit" class="btn btn-primary" style="padding:15px; font-family:var(--sheet-font-header); font-size:1.1rem; margin-top:20px;">
                        <i class="fa-solid fa-dragon"></i> REGISTRAR NO TOMO
                    </button>
                </form>
            </div>
        `;
    }

    setView(e, el) { this._view = el.dataset.mode; this.render(); }
    setCR(e, el) { this._selectedCR = el.dataset.cr; this.render(); }

    addToCampaign(e, el) {
        const id = el.dataset.id;
        const name = el.dataset.name;
        const cr = el.dataset.cr;
        
        let monster;
        if (cr === 'CUSTOM') {
            monster = this.store.state.monsters.find(m => m.id === id);
        } else {
            monster = MonsterData[cr].find(m => m.name === name);
        }

        if (monster) {
            TOME.store.update(s => {
                const newInstance = {
                    ...monster,
                    id: 'inst-' + Date.now(),
                    instanceOf: monster.id || name,
                    hp: monster.hp?.max ? { ...monster.hp } : { current: monster.hp, max: monster.hp }
                };
                s.initiativeOrder = [...(s.initiativeOrder || []), newInstance];
            });
            Toast.show(`${name} adicionado ao combate!`, 'success');
        }
    }

    async deleteMonster(e, el) {
        const id = el.dataset.id;
        const confirmed = await Modal.confirm('Excluir Ameaça', 'Deseja excluir permanentemente esta ameaça customizada do seu tomo?', 'danger');
        if (!confirmed) return;
        
        TOME.store.update(s => {
            s.monsters = s.monsters.filter(m => m.id !== id);
        });
        Toast.show('Ameaça removida do tomo.');
        this.render();
    }

    async finishSession() {
        const entries = this.store.state.journalEntries || [];
        const today = new Date().toLocaleDateString();
        const todayEntries = entries.filter(e => e.date === today);
        
        if (todayEntries.length === 0) {
            return Toast.show('Sem entradas no diário hoje para finalizar.', 'warning');
        }

        const summary = todayEntries.map(e => e.content).join('\n');
        const report = `📓 RESUMO DA SESSÃO (${today})\n\nEventos Principais:\n${summary}\n\nDeseja exportar o relatório final e encerrar a sessão?`;

        const confirmed = await Modal.confirm('Encerrar Sessão', report, 'confirm');
        if (confirmed) {
            this.exportCampaign();
            Toast.show('Relatório salvo! Sessão concluída.', 'success');
        }
    }

    onMount() {
        const form = this.$('#monster-form');
        if (!form) return;
        form.onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const m = Object.fromEntries(fd.entries());
            
            // Collect structured actions
            const actionNames = fd.getAll('action_name[]');
            const actionBonuses = fd.getAll('action_bonus[]');
            const actionDmgs = fd.getAll('action_dmg[]');
            const actionTypes = fd.getAll('action_type[]');
            
            const actions = actionNames.map((name, i) => ({
                name,
                bonus: parseInt(actionBonuses[i]) || 0,
                damage: actionDmgs[i] || '1d4',
                type: actionTypes[i]
            })).filter(a => a.name);

            TOME.store.update(s => {
                s.monsters = [...(s.monsters || []), {
                    id: 'm-' + Date.now(),
                    name: m.name,
                    type: m.type,
                    cr: m.cr,
                    ac: parseInt(m.ac),
                    hp: { current: parseInt(m.hp_max), max: parseInt(m.hp_max) },
                    stats: {
                        str: parseInt(m.stat_for), dex: parseInt(m.stat_des), con: parseInt(m.stat_con),
                        int: parseInt(m.stat_int), wis: parseInt(m.stat_sab), cha: parseInt(m.stat_car)
                    },
                    actions: actions,
                    fromSRD: false
                }];
            });
            Toast.show('Ameaça registrada!', 'success');
            this._view = 'library';
            this._selectedCR = 'CUSTOM';
            this.render();
        };
    }

    addActionRow() {
        const list = this.$('#actions-list');
        const div = document.createElement('div');
        div.className = 'action-row glass';
        div.style = 'display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 40px; gap:8px; padding:10px;';
        div.innerHTML = `
            <input class="legacy-input" type="text" name="action_name[]" placeholder="Nome do Ataque">
            <input class="legacy-input" type="text" name="action_bonus[]" placeholder="+Bônus">
            <input class="legacy-input" type="text" name="action_dmg[]" placeholder="Dano (1d6)">
            <select class="legacy-input" name="action_type[]">
                <option value="single">Único</option>
                <option value="area">Área</option>
            </select>
            <button type="button" class="btn btn-ghost btn-sm" onclick="this.closest('.action-row').remove()">×</button>
        `;
        list.appendChild(div);
    }
}
