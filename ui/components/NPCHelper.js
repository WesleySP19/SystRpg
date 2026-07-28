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
        this._vibe = 'friendly';
        this._lastDialogue = "";
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
                        <div class="form-group">
                            <label class="form-label">Atmosfera (Vibe)</label>
                            <select class="form-input" id="npc-vibe" onchange="this.closest('.npc-helper').__component.setVibe(this.value)">
                                <option value="friendly">😊 Amigável / Prestativo</option>
                                <option value="hostile">😠 Hostil / Agressivo</option>
                                <option value="sarcastic">😏 Sarcástico / Irônico</option>
                                <option value="mysterious">🌑 Enigmático / Misterioso</option>
                                <option value="greedy">💰 Ganancioso / Interesseiro</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-block" data-action="generateNPC" ${this._loading ? 'disabled' : ''}>
                        ${this._loading ? '<i class="fa-solid fa-spinner fa-spin"></i> Consultando Grimório...' : '<i class="fa-solid fa-wand-sparkles"></i> Gerar Novo NPC'}
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
                        
                        
                        <!-- NEW: DIALOGUE ORACLE -->
                        <div style="margin-top:24px; padding:20px; background:rgba(0,0,0,0.2); border-radius:10px; border:1px dashed var(--accent);">
                            <label class="form-label" style="color:var(--accent);">🔮 Oráculo de Diálogo</label>
                            <div style="display:flex; gap:10px; margin-top:10px;">
                                <input type="text" id="dialogue-intent" class="form-input" style="flex:1;" placeholder="O que ele quer dizer? (Ex: Expulsar da taverna)">
                                <button class="btn btn-primary btn-sm" data-action="generateDialogue">Como ele diria?</button>
                            </div>
                            ${this._lastDialogue ? `
                                <div style="margin-top:15px; padding:15px; background:var(--bg-surface); border-radius:8px; font-style:italic; border-left:3px solid var(--accent); animation:fadeIn 0.3s;">
                                    "${this._lastDialogue}"
                                    <div style="margin-top:10px; display:flex; gap:5px;">
                                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem;" data-action="saveDialogueToTimeline">Enviar para Timeline</button>
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <div style="margin-top:24px; padding-top:16px; border-top:var(--border-subtle); display:flex; gap:10px;">
                            <button class="btn btn-ghost btn-sm" data-action="saveNPCToStore">💾 Salvar no Grimório</button>
                            <button class="btn btn-ghost btn-sm" data-action="clearNPC">Limpar</button>
                        </div>
                    </div>
                ` : `
                    <div class="empty-state" style="padding:var(--space-2xl);">
                        <i class="fa-solid fa-users" style="font-size:3rem; opacity:0.1;"></i>
                        <p>Preencha os campos ou deixe em branco para um NPC totalmente aleatório.</p>
                    </div>
                `}

                <!-- BIBLIOTECA DE NPCs SALVOS -->
                ${(this.store.state.savedNPCs || []).length > 0 ? `
                    <div class="card" style="margin-top:var(--space-lg);">
                        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="card-title">📚 NPCs Registrados (${(this.store.state.savedNPCs || []).length})</span>
                            <button class="btn btn-ghost btn-sm" data-action="clearAllNPCs">Limpar Todos</button>
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; padding:12px;">
                            ${(this.store.state.savedNPCs || []).map((n, i) => `
                                <div class="glass" style="padding:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                                    <div style="font-weight:700; color:var(--accent); font-size:0.85rem;">${n.name}</div>
                                    <div style="font-size:0.65rem; opacity:0.6; margin:4px 0;">${n.race} • ${n.job}</div>
                                    <div style="font-size:0.75rem; opacity:0.8; line-height:1.4;">${n.personality}</div>
                                    <button class="btn btn-ghost btn-sm" style="margin-top:8px; font-size:0.6rem; width:100%;" data-action="loadSavedNPC" data-index="${i}">↩ Carregar</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    async generateNPC() {
        const race = this.$('#npc-race')?.value || 'Aleatória';
        const job = this.$('#npc-job')?.value || 'Aleatória';
        const vibe = this._vibe;

        this._loading = true;
        this.render();

        try {
            const prompt = `Crie um NPC de D&D 5e. Raça: ${race}, Ocupação: ${job}. Atmosfera/Personalidade: ${vibe}.
            Retorne APENAS um JSON puro (sem markdown) no formato:
            { "name": "Nome", "race": "Raça", "job": "Ocupação", "personality": "Frase curta descrevendo o jeito dele", "appearance": "Descrição física", "motivation": "O que ele quer agora", "secret": "Um segredo ou gancho" }`;

            const response = await TOME.ai.ask(prompt);
            this._npc = JSON.parse(response);
            this._lastDialogue = "";
            Toast.show('NPC gerado pelo Grimório!', 'success');
        } catch (err) {
            console.error('AI NPC Error:', err);
            Toast.show('Erro na IA. Usando gerador local...', 'warning');
            this._npc = this._localFallback(race, job);
        } finally {
            this._loading = false;
            this.render();
        }
    }

    setVibe(v) { this._vibe = v; }

    async generateDialogue() {
        const intent = this.$('#dialogue-intent')?.value;
        if (!intent || !this._npc) return;

        Toast.show('Pensando na fala...');
        try {
            const prompt = `O NPC ${this._npc.name} (${this._npc.race}, ${this._npc.job}, personalidade: ${this._npc.personality}) está em uma vibe ${this._vibe}. 
            Ele quer dizer aos heróis o seguinte: "${intent}". 
            Escreva EXATAMENTE a fala dele, em primeira pessoa, mantendo o estilo dele. Seja direto e breve.`;
            
            const response = await TOME.ai.ask(prompt);
            this._lastDialogue = response.replace(/"/g, '');
            this.render();
        } catch (err) {
            this._lastDialogue = "O NPC resmunga algo inaudível...";
            this.render();
        }
    }

    saveDialogueToTimeline() {
        if (!this._lastDialogue || !this._npc) return;
        TOME.store.update(s => {
            if (!s.journalEntries) s.journalEntries = [];
            s.journalEntries.push({
                id: Date.now(),
                timestamp: Date.now(),
                type: 'social',
                title: `Falla de ${this._npc.name}`,
                content: `"${this._lastDialogue}"`
            });
        });
        Toast.show('Diálogo salvo na Timeline!', 'success');
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

    saveNPCToStore() {
        if (!this._npc) return;
        TOME.store.update(s => {
            if (!s.savedNPCs) s.savedNPCs = [];
            // Avoid duplicates by name
            if (!s.savedNPCs.find(n => n.name === this._npc.name)) {
                s.savedNPCs.push({ ...this._npc, savedAt: Date.now() });
            }
            // Also log to timeline
            if (!s.journalEntries) s.journalEntries = [];
            s.journalEntries.push({
                id: Date.now(), timestamp: Date.now(), type: 'social',
                title: `NPC Registrado: ${this._npc.name}`,
                content: `${this._npc.race} ${this._npc.job}. ${this._npc.personality}`
            });
        });
        Toast.show(`${this._npc.name} salvo na biblioteca de NPCs!`, 'success');
        this.render();
    }

    loadSavedNPC(e, el) {
        const idx = parseInt(el.dataset.index);
        const saved = (this.store.state.savedNPCs || [])[idx];
        if (saved) { this._npc = { ...saved }; this.render(); }
    }

    clearAllNPCs() {
        if (confirm('Limpar toda a biblioteca de NPCs salvos?')) {
            TOME.store.update(s => s.savedNPCs = []);
            this.render();
        }
    }

    saveToNotes() { this.saveNPCToStore(); }

    clearNPC() {
        this._npc = null;
        this.render();
    }
}
