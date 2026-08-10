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
            <div class="card glass-accent" style="padding:30px; max-width:800px; margin:auto; color: #fff; border-radius: 12px;">
                <h2 style="font-family:'Cinzel'; color:var(--accent); text-align:center; text-transform: uppercase;">✨ Construtor de Personagem Dinâmico</h2>
                <p style="text-align:center; color:var(--text-dim); margin-bottom: 20px; font-size: 0.8rem;">Sistema Ativo: ${s.version}</p>
                
                <form id="dynamic-char-form">
                    <div style="margin-bottom:25px;">
                        <label style="color: var(--accent); font-weight: 700; margin-bottom: 8px; display: block;">NOME DO HERÓI</label>
                        <input type="text" name="_name" class="form-control" style="background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(197,160,89,0.3); border-radius: 6px; padding: 10px; width: 100%;" value="${hero.name || ''}" required />
                    </div>

                    <div style="display: flex; gap: 40px; flex-wrap: wrap; margin-bottom: 30px;">
                        <!-- Atributos -->
                        <div style="flex: 1; min-width: 250px;">
                            <h3 style="color:var(--accent); border-bottom: 1px solid rgba(197,160,89,0.3); padding-bottom:8px; font-family: 'Cinzel';">Atributos Base</h3>
                            <div style="display: grid; gap: 12px; margin-top: 15px;">
                                ${Object.entries(s.attributes || {}).map(([key, attr]) => `
                                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                                        <label class="rollable-attr" data-attr="${key}" style="font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--accent); border-bottom: 1px dashed var(--accent);" title="Rolar teste de ${attr.label}"><i class="fa-solid fa-dice-d20"></i> ${attr.label}</label>
                                        <input type="${attr.type}" name="attr_${key}" value="${hero.attributes?.[key] || attr.default}" style="width: 70px; text-align:center; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid var(--accent); border-radius: 4px; padding: 4px;" />
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Recursos -->
                        <div style="flex: 1; min-width: 250px;">
                            <h3 style="color:var(--accent); border-bottom: 1px solid rgba(197,160,89,0.3); padding-bottom:8px; font-family: 'Cinzel';">Recursos (Vitalidade, Magia)</h3>
                            <div style="display: grid; gap: 12px; margin-top: 15px;">
                                ${Object.entries(s.resources || {}).map(([key, res]) => `
                                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                                        <label style="text-transform: capitalize; font-weight: 600; font-size: 0.9rem;">${key.replace('_', ' ')}</label>
                                        <input type="${res.type}" name="res_${key}" value="${hero.resources?.[key] || res.default}" style="width: 70px; text-align:center; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid var(--danger); border-radius: 4px; padding: 4px;" />
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(197, 160, 89, 0.05); padding: 15px; border-radius: 8px; border: 1px dashed rgba(197,160,89,0.3); text-align: center; margin-bottom: 25px;">
                        <span style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 10px;">Atalhos Multissistema</span>
                        <button type="button" id="btn-template-tank" class="btn btn-ghost" style="border: 1px solid var(--accent); color: var(--accent);">Criar: Guerreiro Tank</button>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" style="padding: 15px; font-size: 1.1rem; font-family: 'Cinzel'; letter-spacing: 2px;">
                        <i class="fa-solid fa-save"></i> SALVAR PERSONAGEM
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
