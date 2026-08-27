import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * DM SHIELD v1.0
 * AI-assisted tools for scene description and worldbuilding.
 */
export class DMShield extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        this._lastDescription = "";
        this._tone = 'mysterious';
    }

    template() {
        return html`
            <div class="page" style="max-width:900px; margin:0 auto;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">🏛️ Construtor de Mundos</h2>
                        <p class="section-subtitle">Use a IA para descrever cenas e locais instantaneamente.</p>
                    </div>
                </div>

                <div class="grid grid-2" style="gap:20px;">
                    <!-- Controls -->
                    <div class="card glass-accent" style="padding:20px;">
                        <h3 style="font-size:1rem; margin-bottom:15px;">Gerar Descrição de Cena</h3>
                        <div class="form-group">
                            <label class="form-label">O que os heróis veem?</label>
                            <input type="text" id="scene-input" class="form-input" placeholder="Ex: Uma cripta antiga, uma taverna cheia..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tom da Narração</label>
                            <select id="tone-select" class="form-select">
                                <option value="mysterious">Misterioso & Sombrio</option>
                                <option value="epic">Épico & Majestoso</option>
                                <option value="horror">Horror & Agonizante</option>
                                <option value="peaceful">Calmo & Sereno</option>
                            </select>
                        </div>
                        <button class="btn btn-primary btn-block" data-action="generateScene" style="margin-top:10px;">
                            <i class="fa-solid fa-wand-sparkles"></i> DESCREVER CENA
                        </button>
                    </div>

                    <!-- Result -->
                    <div class="card" style="padding:20px; display:flex; flex-direction:column; min-height:300px;">
                        <h3 style="font-size:0.8rem; color:var(--accent); text-transform:uppercase; margin-bottom:10px;">Box Text (Narração)</h3>
                        <div id="description-result" style="flex:1; font-family: 'Crimson Text', serif; font-size:1.1rem; line-height:1.6; font-style:italic; color:var(--text-dim); overflow-y:auto; padding:15px; background:rgba(0,0,0,0.2); border-radius:8px;">
                            ${this._lastDescription || 'Aguardando inspiração...'}
                        </div>
                        <button class="btn btn-ghost btn-sm" style="margin-top:10px;" data-action="copyToJournal" ${!this._lastDescription ? 'disabled' : ''}>
                            <i class="fa-solid fa-book"></i> Copiar para o Diário
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async generateScene() {
        const input = this.$('#scene-input').value;
        const tone = this.$('#tone-select').value;
        if (!input) return Toast.show('Descreva brevemente o local.', 'warning');

        Toast.show('Tecendo a narrativa...');
        
        try {
            // Using AIService (need to add this method or use a general one)
            const prompt = `Descreva em um parágrafo imersivo para um mestre de RPG ler para os jogadores: ${input}. O tom deve ser ${tone}.`;
            // For now using the 'narrate' method or a generic one if available
            const description = await TOME.ai.narrate(prompt); 
            this._lastDescription = description;
            this.render();
        } catch (err) {
            Toast.show('O oráculo está em silêncio...', 'danger');
        }
    }

    copyToJournal() {
        TOME.store.update(s => {
            s.journalEntries = [...(s.journalEntries || []), {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                content: `📖 DESCRIÇÃO: ${this._lastDescription}`
            }];
        });
        Toast.show('Cena salva no Diário!');
    }
}
