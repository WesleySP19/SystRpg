import { ReactiveComponent } from '../../core/ReactiveComponent.js';
import { TOME } from '../../../core/Registry.js';
import { html } from 'htm/preact';

import { HeroHeader } from './HeroHeader.js';
import { HeroVitals } from './HeroVitals.js';
import { HeroStats } from './HeroStats.js';
import { HeroCombat } from './HeroCombat.js';
import { HeroInventory } from './HeroInventory.js';
import { Dice } from '../../../utils/Dice.js';

/**
 * HERO SHEET V14.0 — The Atomic Refactor
 * Orchestrates the sub-components and manages the top-level signals.
 */
export class HeroSheetV14 extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        
        // This component relies heavily on the TOME.store, just like the old one,
        // but instead of re-rendering everything, it passes data down to pure HTM components.
    }

    handleRoll = (label, bonus) => {
        const roll = Dice.roll('1d20').total;
        const total = roll + bonus;
        
        // Dispara um toast com o resultado do dado
        const color = roll === 20 ? 'var(--accent)' : (roll === 1 ? 'var(--danger)' : '#fff');
        const icon = roll === 20 ? '⭐' : (roll === 1 ? '💀' : '🎲');
        
        // Apenas como placeholder visual enquanto não temos o Modal de Dados
        alert(`${icon} ${label}\nDado: ${roll} \nBônus: ${bonus >= 0 ? '+' : ''}${bonus} \nTotal: ${total}`);
    }

    template() {
        const { players, viewingHeroId } = this.store.state;
        const p = players?.find(h => h.id === viewingHeroId);

        if (!p) {
            return html`
                <div class="page" style="text-align:center; padding:100px;">
                    <h2 style="font-family:'Cinzel'; color:var(--accent);">Nenhum Herói Selecionado</h2>
                    <p style="color:var(--text-dim); margin-top:10px;">Selecione um personagem no painel lateral.</p>
                </div>
            `;
        }

        // Sub-componentes funcionais preact
        return html`
            <div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out; padding-bottom:50px;">
                <div class="card glass-accent" style="padding:40px; border-radius:24px; box-shadow:0 15px 50px rgba(0,0,0,0.6); position:relative; overflow:hidden;">
                    
                    <!-- Decorative Background Element -->
                    <div style="position:absolute; top:0; right:0; width:400px; height:400px; background:radial-gradient(circle, rgba(197,160,89,0.1) 0%, transparent 70%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(30%, -30%);"></div>
                    
                    <div style="position:relative; z-index:10; display:flex; flex-direction:column; gap:40px;">
                        
                        <!-- HERO HEADER (Avatar, Level, Base Info) -->
                        <${HeroHeader} hero=${p} />
                        
                        <div style="display:grid; grid-template-columns: 350px 1fr; gap:30px; align-items:start;">
                            <!-- LEFT COLUMN (Vitals, Saves, Skills) -->
                            <div style="display:flex; flex-direction:column; gap:25px;">
                                <${HeroVitals} hero=${p} />
                                <${HeroStats} hero=${p} onRoll=${this.handleRoll} />
                            </div>
                            
                            <!-- RIGHT COLUMN (Combat, Actions, Spells, Inventory) -->
                            <div style="display:flex; flex-direction:column; gap:25px;">
                                <${HeroCombat} hero=${p} />
                                <${HeroInventory} hero=${p} onUpdateCoin=${(coin, val) => {
                                    this.store.update(s => {
                                        const t = s.players.find(x => x.id === p.id);
                                        if (t) {
                                            if (!t.coins) t.coins = { cp:0, sp:0, ep:0, gp:10, pp:0 };
                                            t.coins[coin] = val;
                                        }
                                    });
                                }} />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;
    }
}
