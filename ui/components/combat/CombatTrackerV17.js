import { ReactiveComponent } from '../../core/ReactiveComponent.js';
import { TOME } from '../../../core/Registry.js';
import { html } from 'htm/preact';

import { CombatControls } from './CombatControls.js';
import { CombatantListV17 } from './CombatantListV17.js';

/**
 * COMBAT TRACKER V17.0 — "Elysium Arena (Native Edition)"
 * Full Preact-based Virtual DOM engine com suporte a arrastar-e-soltar de alta performance.
 */
export class CombatTrackerV17 extends ReactiveComponent {
    constructor(opts) {
        super(opts);
    }

    template() {
        const { combatants, turnIndex, round } = this.store.state;
        const currentCombatants = combatants || [];
        const currentRound = round || 1;
        const currentIndex = turnIndex || 0;

        return html`
            <div class="page" style="max-width: 1500px; padding-bottom:100px; animation: fadeIn 0.3s ease-out;">
                <!-- ARENA HEADER -->
                <div style="text-align:center; margin-bottom:25px; position:relative;">
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:600px; height:100px; background:radial-gradient(ellipse, rgba(239,68,68,0.15) 0%, transparent 70%); pointer-events:none; z-index:0;"></div>
                    <h1 style="font-family:'Cinzel'; font-size:3rem; color:var(--text-main); margin:0; text-shadow:0 5px 20px rgba(239,68,68,0.4); position:relative; z-index:1;">
                        <i class="fa-solid fa-khanda" style="color:var(--danger); margin-right:15px; font-size:2.4rem;"></i>
                        ARENA V17
                        <i class="fa-solid fa-khanda fa-flip-horizontal" style="color:var(--danger); margin-left:15px; font-size:2.4rem;"></i>
                    </h1>
                    <div style="font-size:0.9rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:4px; font-weight:800; margin-top:5px;">
                        Round ${currentRound}
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 320px 1fr; gap:30px; align-items:start;">
                    
                    <!-- LEFT PANEL (Controls) -->
                    <div style="position:sticky; top:20px;">
                        <${CombatControls} store=${this.store} combatants=${currentCombatants} turnIndex=${currentIndex} round=${currentRound} />
                    </div>
                    
                    <!-- MAIN ARENA (Initiative Queue) -->
                    <div style="background:rgba(10,12,16,0.7); border:1px solid rgba(255,255,255,0.05); border-radius:24px; padding:30px; box-shadow:0 25px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5); min-height:600px;">
                        <${CombatantListV17} store=${this.store} combatants=${currentCombatants} turnIndex=${currentIndex} />
                    </div>
                </div>
            </div>
        `;
    }
}
