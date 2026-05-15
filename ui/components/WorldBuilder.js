import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * DM SHIELD v1.0
 * AI-assisted tools for scene description and worldbuilding.
 */
export class WorldBuilder extends Component {
    constructor(opts) {
        super(opts);
        this._lastDescription = "";
        this._tone = 'mysterious';
    }

    template() {
        return `
            <div class="page" style="max-width:1000px; margin:0 auto; padding:20px;">
                <div class="section-header" style="margin-bottom:30px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel', serif;">🏛️ Construtor de Mundos</h2>
                        <p class="section-subtitle">Inteligência Artificial para narração e ambientação instantânea.</p>
                    </div>
                </div>

                <div class="grid grid-2" style="gap:30px; align-items: stretch;">
                    <!-- Controls -->
                    <div class="card glass-accent" style="padding:25px; display:flex; flex-direction:column; gap:20px;">
                        <h3 style="font-size:1rem; color:var(--accent); font-family:'Cinzel';">Gerar Descrição</h3>
                        
                        <div class="form-group">
                            <label class="form-label">O que os heróis veem?</label>
                            <textarea id="scene-input" class="form-input" placeholder="Ex: Uma cripta antiga com cheiro de mofo e estátuas de deuses esquecidos..." style="min-height:100px; padding:12px;"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Tom da Narração</label>
                            <select id="tone-select" class="form-select">
                                <option value="mysterious">Misterioso & Sombrio</option>
                                <option value="epic">Épico & Majestoso</option>
                                <option value="horror">Horror & Agonizante</option>
                                <option value="peaceful">Calmo & Sereno</option>
                                <option value="technical">Tático & Objetivo</option>
                            </select>
                        </div>

                        <button class="btn btn-primary btn-block btn-lg" data-action="generateScene" style="margin-top:auto;">
                            <i class="fa-solid fa-wand-sparkles"></i> DESCREVER CENA
                        </button>
                    </div>

                    <!-- Result -->
                    <div class="card" style="padding:25px; display:flex; flex-direction:column; min-height:450px; background:var(--bg-darker); border:1px solid var(--border-color);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3 style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Box Text (Narração)</h3>
                            <button class="btn btn-ghost btn-sm" data-action="copyToJournal" ${!this._lastDescription ? 'disabled' : ''}>
                                <i class="fa-solid fa-book"></i> SALVAR
                            </button>
                        </div>
                        
                        <div id="description-result" style="flex:1; font-family: 'Crimson Text', serif; font-size:1.2rem; line-height:1.7; font-style:italic; color:var(--text-bright); overflow-y:auto; padding:20px; background:rgba(0,0,0,0.3); border-radius:8px; border-left:3px solid var(--accent);">
                            ${this._lastDescription || '<span style="opacity:0.3;">Aguardando inspiração do mestre...</span>'}
                        </div>
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
