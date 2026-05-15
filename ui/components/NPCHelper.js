import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * NPC HELPER v3.1
 * AI-powered NPC generator (Name, Personality, Secret, Motivation).
 */
export class NPCHelper extends Component {
    constructor(opts) {
        super(opts);
        this._npc = null;
        this._loading = false;
    }

    template() {
        return `
            <div class="page" style="max-width:800px; margin:0 auto;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">👤 Gerador de NPCs</h2>
                        <p class="section-subtitle">Crie personagens memoráveis instantaneamente</p>
                    </div>
                </div>

                <div class="card" style="margin-bottom:var(--space-lg);">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
                        <div class="form-group">
                            <label class="form-label">Raça/Tipo</label>
                            <input class="form-input" id="npc-race" type="text" placeholder="Ex: Elfo, Tabaxi, Guarda...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Ocupação</label>
                            <input class="form-input" id="npc-job" type="text" placeholder="Ex: Taberneiro, Ferreiro, Nobre...">
                        </div>
                    </div>
                    <button class="btn btn-primary btn-block" data-action="generateNPC" ${this._loading ? 'disabled' : ''}>
                        ${this._loading ? '<i class="fa-solid fa-spinner fa-spin"></i> Consultando Tomo...' : '<i class="fa-solid fa-wand-sparkles"></i> Gerar com IA'}
                    </button>
                </div>

                ${this._npc ? `
                    <div class="card glass-accent" style="animation: scaleIn 0.3s var(--ease-bounce);">
                        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
                            <div>
                                <h2 style="color:var(--accent); margin-bottom:4px;">${this._npc.name}</h2>
                                <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px;">
                                    ${this._npc.race} • ${this._npc.job}
                                </div>
                            </div>
                            <button class="btn btn-ghost btn-sm" data-action="copyNPC"><i class="fa-solid fa-copy"></i></button>
                        </div>

                        <div class="grid grid-2" style="gap:20px;">
                            <div class="form-group">
                                <label class="form-label">Personalidade</label>
                                <div style="font-size:0.85rem; line-height:1.6; color:var(--text);">${this._npc.personality}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Aparência</label>
                                <div style="font-size:0.85rem; line-height:1.6; color:var(--text);">${this._npc.appearance}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Motivação</label>
                                <div style="font-size:0.85rem; line-height:1.6; color:var(--text);">${this._npc.motivation}</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="color:var(--danger);">Segredo / Gancho</label>
                                <div style="font-size:0.85rem; line-height:1.6; color:var(--text-muted); font-style:italic;">${this._npc.secret}</div>
                            </div>
                        </div>
                        
                        <div style="margin-top:24px; padding-top:16px; border-top:var(--border-subtle); display:flex; gap:10px;">
                            <button class="btn btn-ghost btn-sm" data-action="saveToNotes">Salvar nas Notas</button>
                            <button class="btn btn-ghost btn-sm" data-action="clearNPC">Limpar</button>
                        </div>
                    </div>
                ` : `
                    <div class="empty-state" style="padding:var(--space-2xl);">
                        <i class="fa-solid fa-users" style="font-size:3rem; opacity:0.1;"></i>
                        <p>Preencha os campos ou deixe em branco para um NPC totalmente aleatório.</p>
                    </div>
                `}
            </div>
        `;
    }

    async generateNPC() {
        const race = this.$('#npc-race')?.value || 'Aleatória';
        const job = this.$('#npc-job')?.value || 'Aleatória';

        this._loading = true;
        this.render();

        try {
            const prompt = `Crie um NPC de D&D 5e. Raça: ${race}, Ocupação: ${job}. 
            Retorne APENAS um JSON puro (sem markdown) no formato:
            { "name": "Nome", "race": "Raça", "job": "Ocupação", "personality": "Frase curta", "appearance": "Descrição física", "motivation": "O que ele quer", "secret": "Um segredo ou gancho de aventura" }`;

            const response = await TOME.ai.ask(prompt);
            this._npc = JSON.parse(response);
            Toast.show('NPC gerado pelo Tomo!', 'success');
        } catch (err) {
            console.error('AI NPC Error:', err);
            Toast.show('Erro ao consultar a IA. Usando gerador local...', 'warning');
            this._npc = this._localFallback(race, job);
        } finally {
            this._loading = false;
            this.render();
        }
    }

    _localFallback(race, job) {
        return {
            name: "Mestre Kaelen",
            race: race === 'Aleatória' ? 'Meio-Elfo' : race,
            job: job === 'Aleatória' ? 'Escriba' : job,
            personality: "Calmo, fala devagar e gosta de citar provérbios antigos.",
            appearance: "Veste túnicas cinzas manchadas de tinta, usa óculos redondos.",
            motivation: "Encontrar um pergaminho perdido da era da fundação.",
            secret: "Ele é um espião de uma guilda de magos banida."
        };
    }

    copyNPC() {
        if (!this._npc) return;
        const text = `${this._npc.name} (${this._npc.race} ${this._npc.job})\nPersonalidade: ${this._npc.personality}\nMotivação: ${this._npc.motivation}`;
        navigator.clipboard.writeText(text);
        Toast.show('Copiado para a área de transferência!');
    }

    saveToNotes() {
        if (!this._npc) return;
        TOME.store.update(s => {
            s.journalEntries = [...(s.journalEntries || []), {
                id: Date.now(),
                title: `NPC: ${this._npc.name}`,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now(),
                content: `👤 ${this._npc.name} (${this._npc.race} ${this._npc.job}) — ${this._npc.personality} | Segredo: ${this._npc.secret}`
            }];
        });
        Toast.show('NPC salvo no Diário da Sessão!', 'success');
        this.clearNPC();
    }

    clearNPC() {
        this._npc = null;
        this.render();
    }
}
