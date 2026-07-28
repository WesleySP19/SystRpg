import { Component } from '../core/Component.js';

/**
 * CharacterEditor – simple form to edit a hero's stats.
 * Integrated into Dashboard via tab 'character'.
 */
export class CharacterEditor extends Component {
    constructor(opts) {
        super(opts);
        this.state = this.store.state;
    }

    template() {
        return `
            <div class="card glass-accent" style="padding:30px; max-width:600px; margin:auto;">
                <h2 style="font-family:'Cinzel'; color:var(--accent); text-align:center;">🧙‍♂️ Editor de Personagem</h2>
                <form id="char-form">
                    <div class="form-group" style="margin-bottom:15px;">
                        <label>Nome</label>
                        <input type="text" name="name" class="form-control" value="${this.state.currentHero?.name || ''}" required />
                    </div>
                    <div class="form-group" style="margin-bottom:15px;">
                        <label>Classe</label>
                        <input type="text" name="cls" class="form-control" value="${this.state.currentHero?.cls || ''}" />
                    </div>
                    <div class="form-group" style="margin-bottom:15px;">
                        <label>HP Máximo</label>
                        <input type="number" name="hp_max" class="form-control" value="${this.state.currentHero?.hp?.max || 0}" min="0" />
                    </div>
                    <div class="form-group" style="margin-bottom:15px;">
                        <label>HP Atual</label>
                        <input type="number" name="hp_current" class="form-control" value="${this.state.currentHero?.hp?.current || 0}" min="0" />
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Salvar</button>
                </form>
            </div>
        `;
    }

    onMount() {
        const form = this.element.querySelector('#char-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const data = new FormData(form);
                const hero = {
                    name: data.get('name'),
                    cls: data.get('cls'),
                    hp: { max: Number(data.get('hp_max')), current: Number(data.get('hp_current')) },
                    // Preserve other fields if editing existing
                    ...(this.state.currentHero || {})
                };
                // Update store – replace or add
                this.store.update(s => {
                    const idx = (s.players || []).findIndex(p => p.id === hero.id);
                    if (idx >= 0) s.players[idx] = hero; else (s.players = s.players || []).push(hero);
                    s.currentHero = hero;
                });
                // Return to dashboard
                this.store.update(s => s.activeTab = 'dashboard');
            };
        }
    }
}
