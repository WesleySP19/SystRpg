import { Component } from '../core/Component.js';
import { CRDTManager } from '../core/CRDTManager.js';

export class DynamicCharacterBuilder extends Component {
    constructor(opts) {
        super(opts);
        this.state = this.store.state;
        this.systemSchema = null;
        this.isLoading = true;
        this.error = null;
    }

    async onMount() {
        await this.fetchSystemSchema();
        this._bindEvents();
    }

    async fetchSystemSchema() {
        try {
            const res = await fetch('/api/system/active');
            const result = await res.json();
            if (result.status === 'success' && result.data) {
                this.systemSchema = result.data.sheetSchema;
            } else {
                this.error = result.message || "Sistema não encontrado.";
            }
        } catch (err) {
            this.error = "Erro ao carregar o sistema. Verifique a conexão com o servidor.";
        }
        this.isLoading = false;
        this.render();
    }

    template() {
        if (this.isLoading) {
            return `<div style="text-align:center; padding: 50px; color:var(--accent); font-family: 'Cinzel';">Carregando Motor Multissistema...</div>`;
        }

        if (this.error) {
            return `<div style="text-align:center; padding: 50px; color:var(--danger);">${this.error}</div>`;
        }

        const s = this.systemSchema;
        const hero = this.state.currentHero || {};

        return `
            <div class="card glass-accent p-8 max-w-[800px] mx-auto text-white rounded-2xl relative overflow-hidden">
                <div class="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
                <h2 class="font-cinzel text-accent text-center uppercase m-0 text-2xl flex items-center justify-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]">
                    <i class="fa-solid fa-hat-wizard"></i> Construtor de Personagem
                </h2>
                <p class="text-center text-slate-400 mb-6 text-sm mt-2 uppercase tracking-widest">Sistema Ativo: ${s.version}</p>
                
                <form id="dynamic-char-form" class="relative z-10">
                    <div class="mb-8">
                        <label class="text-accent font-bold mb-2 block text-sm tracking-widest uppercase">NOME DA LENDA</label>
                        <input type="text" name="_name" class="legacy-input bg-black/50 text-white border border-accent/30 rounded-lg p-3 w-full text-lg outline-none focus:border-accent shadow-inner transition-colors" value="${hero.name || ''}" placeholder="Ex: Gandalf, O Cinzento..." required />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <!-- Atributos -->
                        <div class="flex flex-col">
                            <h3 class="text-accent border-b border-accent/30 pb-2 font-cinzel text-lg flex items-center gap-2"><i class="fa-solid fa-dna"></i> Atributos Base</h3>
                            <div class="grid gap-3 mt-4">
                                ${Object.entries(s.attributes || {}).map(([key, attr]) => `
                                    <div class="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <label class="rollable-attr font-bold text-sm cursor-pointer text-accent border-b border-dashed border-accent hover:text-white" data-attr="${key}" title="Rolar teste de ${attr.label}"><i class="fa-solid fa-dice-d20"></i> ${attr.label}</label>
                                        <input type="${attr.type}" name="attr_${key}" value="${hero.attributes?.[key] || attr.default}" class="w-16 text-center bg-black/60 text-white border border-accent/50 rounded-md p-1 outline-none focus:border-accent" />
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Recursos -->
                        <div class="flex flex-col">
                            <h3 class="text-accent border-b border-accent/30 pb-2 font-cinzel text-lg flex items-center gap-2"><i class="fa-solid fa-heart-pulse"></i> Recursos Vitais</h3>
                            <div class="grid gap-3 mt-4">
                                ${Object.entries(s.resources || {}).map(([key, res]) => `
                                    <div class="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <label class="capitalize font-bold text-sm text-slate-200">${key.replace('_', ' ')}</label>
                                        <input type="${res.type}" name="res_${key}" value="${hero.resources?.[key] || res.default}" class="w-16 text-center bg-black/60 text-white border border-red-500/50 rounded-md p-1 outline-none focus:border-red-500" />
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="bg-accent/5 p-4 rounded-xl border border-dashed border-accent/30 text-center mb-8">
                        <span class="block text-sm text-slate-400 mb-3 font-bold uppercase tracking-widest">Atalhos Multissistema</span>
                        <button type="button" id="btn-template-tank" class="btn btn-ghost border border-accent text-accent hover:bg-accent hover:text-black font-bold py-1.5 px-4 text-sm rounded-lg transition-colors">Criar: Guerreiro Tank</button>
                    </div>

                    <button type="submit" class="btn btn-primary w-full p-4 text-lg font-cinzel tracking-[2px] shadow-[0_0_15px_rgba(197,160,89,0.4)]">
                        <i class="fa-solid fa-save mr-2"></i> SALVAR PERSONAGEM NO LIVRO
                    </button>
                </form>
            </div>
        `;
    }

    _bindEvents() {
        if (!this.element) return;
        
        const form = this.element.querySelector('#dynamic-char-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const data = new FormData(form);
                
                const newHero = {
                    id: this.state.currentHero?.id || 'hero_' + Date.now().toString(),
                    name: data.get('_name'),
                    attributes: {},
                    resources: {}
                };

                for (let [key, val] of data.entries()) {
                    if (key.startsWith('attr_')) newHero.attributes[key.replace('attr_', '')] = Number(val);
                    if (key.startsWith('res_')) newHero.resources[key.replace('res_', '')] = Number(val);
                }

                // Compatibilidade retroativa para não quebrar a mesa existente
                newHero.hp = { current: newHero.resources.hp_current || 10, max: newHero.resources.hp_max || 10 };
                newHero.hp_current = newHero.resources.hp_current || 10;
                newHero.hp_max = newHero.resources.hp_max || 10;

                this.store.update(s => {
                    const idx = (s.players || []).findIndex(p => p.id === newHero.id);
                    if (idx >= 0) {
                        s.players[idx] = { ...s.players[idx], ...newHero };
                    } else { 
                        s.players = s.players || []; 
                        s.players.push(newHero); 
                    }
                    s.currentHero = newHero;
                    s.activeTab = 'dashboard';
                });
                
                import('../components/Toast.js').then(m => m.Toast.show('Personagem salvo no motor multissistema!', 'success'));
            };
        }

        const btnTank = this.element.querySelector('#btn-template-tank');
        if (btnTank) {
            btnTank.onclick = () => {
                const s = this.systemSchema;
                if (!s) return;
                const form = this.element.querySelector('#dynamic-char-form');
                if (form.elements['attr_STR']) form.elements['attr_STR'].value = 18;
                if (form.elements['attr_CON']) form.elements['attr_CON'].value = 16;
                if (form.elements['res_hp_max']) form.elements['res_hp_max'].value = 30;
                if (form.elements['res_hp_current']) form.elements['res_hp_current'].value = 30;
                if (form.elements['res_ac']) form.elements['res_ac'].value = 18;
                import('../components/Toast.js').then(m => m.Toast.show('Template Guerreiro Tank aplicado.', 'info'));
            };
        }

        // Bônus: Integração direta com o Chat (Rolagens Rápidas)
        this.element.querySelectorAll('.rollable-attr').forEach(el => {
            el.onclick = async () => {
                const attrKey = el.dataset.attr;
                const hero = this.state.currentHero;
                if (!hero) {
                    import('../components/Toast.js').then(m => m.Toast.show('Salve o personagem primeiro antes de rolar!', 'warning'));
                    return;
                }

                // Import dynamically to avoid circular dependencies
                const { RulesEngine } = await import('../../core/RulesEngine.js');
                const expression = `1d20+${attrKey}`;
                
                try {
                    const result = RulesEngine.resolveFormula(expression, hero.attributes || {});
                    
                    let details = `[${result.rolls.join(', ')}] + MOD`;
                    if (result.isCrit) details += " 🎯 CRÍTICO!";
                    if (result.isFumble) details += " 💀 FALHA CRÍTICA!";

                    const newEntry = {
                        id: Date.now(),
                        sender: hero.name || 'Herói',
                        message: `/roll ${expression}`,
                        isSystem: false,
                        isRoll: true,
                        formula: result.formula,
                        total: result.total,
                        details: details
                    };

                    if (CRDTManager && CRDTManager.chatHistory) {
                        CRDTManager.chatHistory.push([newEntry]);
                        if (CRDTManager.chatHistory.length > 100) {
                            CRDTManager.chatHistory.delete(0, CRDTManager.chatHistory.length - 100);
                        }
                    }
                } catch (err) {
                    console.error("Erro ao rolar:", err);
                }
            };
        });
    }
}
