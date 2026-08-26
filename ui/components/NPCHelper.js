import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * NPC HELPER v3.1
 * AI-powered NPC generator (Name, Personality, Secret, Motivation).
 */
export class NPCHelper extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        this._npc = null;
        this._loading = false;
        this._vibe = 'friendly';
        this._lastDialogue = "";
    }

    template() {
        return html`
            <div class="page p-6 w-full max-w-[900px] mx-auto animate-fadeIn">
                <div class="mb-8 border-b border-accent/20 pb-4">
                    <h2 class="font-cinzel text-3xl font-bold m-0 text-white drop-shadow-[0_0_10px_rgba(197,160,89,0.3)]">👤 Gerador Arcânico de NPCs</h2>
                    <p class="font-outfit text-sm text-slate-400 mt-2 uppercase tracking-widest">Crie personagens memoráveis instantaneamente</p>
                </div>

                <div class="card glass-accent p-6 rounded-2xl border border-white/5 shadow-xl mb-8 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-br from-black/40 to-black/80 pointer-events-none"></div>
                    <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <div class="form-group flex flex-col gap-1.5">
                            <label class="text-[0.7rem] uppercase tracking-wider font-bold text-accent">Raça/Tipo</label>
                            <input class="legacy-input bg-black/50 border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-accent/50 outline-none transition-colors" id="npc-race" type="text" placeholder="Ex: Elfo, Tabaxi, Guarda..." />
                        </div>
                        <div class="form-group flex flex-col gap-1.5">
                            <label class="text-[0.7rem] uppercase tracking-wider font-bold text-accent">Ocupação</label>
                            <input class="legacy-input bg-black/50 border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-accent/50 outline-none transition-colors" id="npc-job" type="text" placeholder="Ex: Taberneiro, Ferreiro..." />
                        </div>
                        <div class="form-group flex flex-col gap-1.5">
                            <label class="text-[0.7rem] uppercase tracking-wider font-bold text-accent">Atmosfera (Vibe)</label>
                            <select class="legacy-input bg-black/50 border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-accent/50 outline-none transition-colors appearance-none" id="npc-vibe" onChange=${(e) => this.setVibe(e.target.value)}>
                                <option value="friendly" class="bg-black text-white">😊 Amigável / Prestativo</option>
                                <option value="hostile" class="bg-black text-white">😠 Hostil / Agressivo</option>
                                <option value="sarcastic" class="bg-black text-white">😏 Sarcástico / Irônico</option>
                                <option value="mysterious" class="bg-black text-white">🌑 Enigmático / Misterioso</option>
                                <option value="greedy" class="bg-black text-white">💰 Ganancioso / Interesse</option>
                            </select>
                        </div>
                    </div>
                    <button class="relative z-10 w-full btn-magic py-3 rounded-xl font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-transform active:scale-95" data-action="generateNPC" ${this._loading ? 'disabled' : ''}>
                        ${this._loading ? html`<i class="fa-solid fa-circle-notch fa-spin"></i> Conjurando Entidade...` : html`<i class="fa-solid fa-wand-sparkles"></i> Gerar Novo NPC`}
                    </button>
                </div>

                ${this._npc ? html`
                    <div class="card bg-black/60 backdrop-blur-lg border border-accent/30 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-[scaleIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div class="flex justify-between items-start border-b border-white/10 pb-4 mb-5 relative z-10">
                            <div>
                                <h2 class="font-cinzel text-2xl font-bold text-accent m-0 flex items-center gap-2">${this._npc.name}</h2>
                                <div class="text-[0.7rem] text-slate-400 uppercase tracking-[2px] mt-1.5 flex items-center gap-2">
                                    <span class="bg-white/5 px-2 py-0.5 rounded-sm">${this._npc.race}</span>
                                    <span class="text-accent/50">•</span>
                                    <span class="bg-white/5 px-2 py-0.5 rounded-sm">${this._npc.job}</span>
                                </div>
                            </div>
                            <button class="btn hover:bg-white/10 text-slate-400 hover:text-white p-2 rounded-lg transition-colors" data-action="copyNPC" title="Copiar"><i class="fa-solid fa-copy"></i></button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div class="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                <label class="text-[0.65rem] uppercase tracking-widest text-slate-400 font-bold mb-2 block flex items-center gap-2"><i class="fa-solid fa-masks-theater text-accent/70"></i> Personalidade</label>
                                <div class="text-sm leading-relaxed text-slate-200">${this._npc.personality}</div>
                            </div>
                            <div class="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                <label class="text-[0.65rem] uppercase tracking-widest text-slate-400 font-bold mb-2 block flex items-center gap-2"><i class="fa-solid fa-eye text-accent/70"></i> Aparência</label>
                                <div class="text-sm leading-relaxed text-slate-200">${this._npc.appearance}</div>
                            </div>
                            <div class="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                <label class="text-[0.65rem] uppercase tracking-widest text-slate-400 font-bold mb-2 block flex items-center gap-2"><i class="fa-solid fa-bullseye text-accent/70"></i> Motivação</label>
                                <div class="text-sm leading-relaxed text-slate-200">${this._npc.motivation}</div>
                            </div>
                            <div class="bg-red-500/5 rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-colors">
                                <label class="text-[0.65rem] uppercase tracking-widest text-red-400 font-bold mb-2 block flex items-center gap-2"><i class="fa-solid fa-key text-red-500/70"></i> Segredo / Gancho</label>
                                <div class="text-sm leading-relaxed text-red-200/80 font-serif italic">${this._npc.secret}</div>
                            </div>
                        </div>
                        
                        <!-- DIALOGUE ORACLE -->
                        <div class="mt-8 p-5 bg-gradient-to-r from-accent/5 to-transparent rounded-xl border-l-4 border-accent relative z-10">
                            <label class="text-sm font-cinzel font-bold text-accent flex items-center gap-2 mb-3"><i class="fa-solid fa-comment-dots"></i> Oráculo de Diálogo</label>
                            <div class="flex gap-3">
                                <input type="text" id="dialogue-intent" class="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 text-sm focus:border-accent transition-colors outline-none" placeholder="O que ele quer dizer? (Ex: Expulsar da taverna)" />
                                <button class="btn bg-accent/20 text-accent hover:bg-accent/40 hover:text-white px-4 rounded-lg font-bold text-xs uppercase tracking-wide transition-colors" data-action="generateDialogue">Como diria?</button>
                            </div>
                            ${this._lastDialogue ? html`
                                <div class="mt-4 p-4 bg-black/40 rounded-lg border border-accent/20 animate-fadeIn relative">
                                    <i class="fa-solid fa-quote-left absolute top-3 left-3 text-accent/20 text-2xl"></i>
                                    <p class="font-serif italic text-slate-300 relative z-10 pl-6 m-0 leading-relaxed">"${this._lastDialogue}"</p>
                                    <div class="mt-3 flex justify-end">
                                        <button class="text-[0.65rem] uppercase tracking-widest text-accent hover:text-white transition-colors" data-action="saveDialogueToTimeline"><i class="fa-solid fa-clock-rotate-left mr-1"></i> Enviar para Timeline</button>
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <div class="mt-6 pt-5 border-t border-white/10 flex gap-3 relative z-10 justify-end">
                            <button class="text-xs uppercase tracking-wider text-slate-400 hover:text-white px-4 py-2 transition-colors" data-action="clearNPC">Limpar</button>
                            <button class="bg-accent/20 text-accent hover:bg-accent hover:text-black border border-accent/50 px-5 py-2 rounded-lg text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2" data-action="saveNPCToStore"><i class="fa-solid fa-book-bookmark"></i> Salvar no Grimório</button>
                        </div>
                    </div>
                ` : html`
                    <div class="flex flex-col items-center justify-center p-16 bg-black/20 border border-white/5 rounded-2xl border-dashed">
                        <i class="fa-solid fa-users text-5xl opacity-10 text-accent mb-4"></i>
                        <p class="text-slate-500 text-sm font-medium">Preencha os campos ou deixe em branco para gerar aleatoriamente.</p>
                    </div>
                `}

                <!-- BIBLIOTECA DE NPCs SALVOS -->
                ${(this.store.state.savedNPCs || []).length > 0 ? html`
                    <div class="mt-10">
                        <div class="flex justify-between items-end border-b border-white/10 pb-3 mb-5">
                            <span class="font-cinzel text-lg text-white font-bold flex items-center gap-2"><i class="fa-solid fa-book-journal-whills text-accent"></i> Grimório de Entidades (${(this.store.state.savedNPCs || []).length})</span>
                            <button class="text-[0.65rem] uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors" data-action="clearAllNPCs">Limpar Todos</button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${(this.store.state.savedNPCs || []).map((n, i) => html`
                                <div class="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-accent/40 transition-colors group relative overflow-hidden">
                                    <div class="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    <div class="font-bold text-accent text-sm relative z-10">${n.name}</div>
                                    <div class="text-[0.6rem] uppercase tracking-widest text-slate-400 my-1 relative z-10">${n.race} • ${n.job}</div>
                                    <div class="text-xs text-slate-300 mt-2 line-clamp-3 relative z-10">${n.personality}</div>
                                    <button class="w-full mt-3 py-1.5 border border-white/10 rounded text-[0.65rem] uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-colors relative z-10" data-action="loadSavedNPC" data-index="${i}">↩ Conjurar</button>
                                </div>
                            `)}
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
