import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * QUEST MANAGER v1.0
 * Track main and side quests with rewards and status.
 */
export class QuestManager extends Component {
    constructor(opts) {
        super(opts);
        this._showForm = false;
    }

    template() {
        const quests = this.store.state.quests || [];
        return `
            <div class="page" style="max-width:1000px; margin:0 auto;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">📜 Crônicas & Missões</h2>
                        <p class="section-subtitle">O destino do mundo em suas mãos.</p>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-ghost" data-action="generateAIRumor"><i class="fa-solid fa-wand-magic-sparkles"></i> Sugerir Rumor (AI)</button>
                        <button class="btn btn-primary" data-action="toggleForm">
                            <i class="fa-solid ${this._showForm ? 'fa-xmark' : 'fa-plus'}"></i> 
                            ${this._showForm ? 'Cancelar' : 'Nova Missão'}
                        </button>
                    </div>
                </div>

                ${this._showForm ? this._renderForm() : ''}

                <div class="grid grid-auto" style="gap:20px;">
                    ${quests.length ? quests.map(q => this._renderQuestCard(q)).join('') : this._renderEmptyState()}
                </div>
            </div>
        `;
    }

    _renderForm() {
        return `
            <div class="card glass-accent" style="margin-bottom:30px; animation: slideUp 0.3s ease;">
                <form id="quest-form" style="display:flex; flex-direction:column; gap:15px;">
                    <div class="form-group">
                        <label class="form-label">Título da Missão</label>
                        <input type="text" name="title" class="form-input" required placeholder="Ex: O Segredo do Forte Sombrio">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descrição / Objetivos</label>
                        <textarea name="description" class="form-textarea" rows="3" placeholder="O que os heróis precisam fazer?"></textarea>
                    </div>
                    <div class="grid grid-2">
                        <div class="form-group">
                            <label class="form-label">Recompensa (Ouro/Itens)</label>
                            <input type="text" name="reward" class="form-input" placeholder="500 GP, Espada +1">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo</label>
                            <select name="type" class="form-select">
                                <option value="main">Principal</option>
                                <option value="side">Secundária</option>
                                <option value="personal">Pessoal</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block" style="padding:12px;">INICIAR MISSÃO</button>
                </form>
            </div>
        `;
    }

    _renderQuestCard(q) {
        const colors = { main: 'var(--accent)', side: 'var(--info)', personal: 'var(--success)' };
        return `
            <div class="card" style="border-top: 4px solid ${colors[q.type] || 'var(--text-dim)'};">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:10px;">
                    <span class="badge" style="background:rgba(255,255,255,0.05); color:${colors[q.type]}">${q.type}</span>
                    <div style="display:flex; gap:5px;">
                        <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" data-action="deleteQuest" data-id="${q.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <h3 style="margin:0 0 10px 0; font-size:1.1rem;">${q.title}</h3>
                <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.5; margin-bottom:15px;">${q.description}</p>
                <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.65rem; color:var(--warning); font-weight:800;"><i class="fa-solid fa-coins"></i> ${q.reward || 'Nenhuma'}</span>
                    <button class="btn btn-sm ${q.completed ? 'btn-success' : 'btn-ghost'}" data-action="toggleComplete" data-id="${q.id}">
                        ${q.completed ? '<i class="fa-solid fa-check"></i> Concluída' : 'Marcar Concluída'}
                    </button>
                </div>
            </div>
        `;
    }

    _renderEmptyState() {
        return `
            <div class="empty-state" style="grid-column: 1 / -1; padding:100px;">
                <i class="fa-solid fa-feather-pointed" style="font-size:3rem; opacity:0.2;"></i>
                <h3>Nenhuma missão ativa</h3>
                <p>Comece a escrever a lenda dos seus heróis hoje mesmo.</p>
            </div>
        `;
    }

    toggleForm() { this._showForm = !this._showForm; this.render(); }

    toggleComplete(e, el) {
        const id = el.dataset.id;
        TOME.store.update(s => {
            s.quests = s.quests.map(q => q.id === id ? { ...q, completed: !q.completed } : q);
        });
        this.render();
    }

    deleteQuest(e, el) {
        const id = el.dataset.id;
        if (confirm('Excluir esta missão?')) {
            TOME.store.update(s => {
                s.quests = s.quests.filter(q => q.id !== id);
            });
            this.render();
        }
    }

    async generateAIRumor() {
        Toast.show('Consultando oráculo narrativo...');
        const context = (this.store.state.quests || []).map(q => q.title).join(', ');
        const rumor = await TOME.ai.generateRumor(context);
        
        if (confirm(`🤖 O oráculo sugere este rumor:\n\n"${rumor}"\n\nDeseja adicionar como uma missão secundária?`)) {
            TOME.store.update(s => {
                s.quests = [...(s.quests || []), {
                    id: 'q-' + Date.now(),
                    title: 'Rumor: ' + (rumor.length > 30 ? rumor.substring(0, 30) + '...' : rumor),
                    description: rumor,
                    type: 'side',
                    reward: 'A definir',
                    completed: false
                }];
            });
            this.render();
            Toast.show('Rumor adicionado às missões!');
        }
    }

    onMount() {
        const form = this.$('#quest-form');
        if (!form) return;
        form.onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const q = Object.fromEntries(fd.entries());
            TOME.store.update(s => {
                s.quests = [...(s.quests || []), {
                    id: 'q-' + Date.now(),
                    ...q,
                    completed: false
                }];
            });
            this._showForm = false;
            Toast.show('Nova missão adicionada!');
            this.render();
        };
    }
}
