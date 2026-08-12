import { ReactiveComponent } from '../../core/ReactiveComponent.js';
import { TOME } from '../../../core/Registry.js';
import { html } from 'htm/preact';

import { CombatControls } from './CombatControls.js';
import { CombatantListV19 } from './CombatantListV19.js';

/**
 * COMBAT TRACKER V19.2.1 — "The Atomic Engine"
 * Full Preact-based Virtual DOM engine with glassmorphism aesthetics.
 */
export class CombatTrackerV19 extends ReactiveComponent {
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
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:600px; height:100px; background:radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%); pointer-events:none; z-index:0;"></div>
                    <h1 style="font-family:'Cinzel'; font-size:3rem; color:var(--text-main); margin:0; text-shadow:0 5px 20px rgba(212,175,55,0.4); position:relative; z-index:1; display:flex; align-items:center; justify-content:center; gap:15px;">
                        <i class="fa-solid fa-khanda" style="color:var(--accent); font-size:2.4rem;"></i>
                        TOME ARENA <span style="font-size:1.2rem; color:var(--accent); opacity:0.8; margin-top:15px;">V19.2.1</span>
                        <i class="fa-solid fa-khanda fa-flip-horizontal" style="color:var(--accent); font-size:2.4rem;"></i>
                    </h1>
                    <div style="font-size:1rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:6px; font-weight:800; margin-top:5px; text-shadow:0 2px 10px rgba(0,0,0,0.8);">
                        Rodada ${currentRound}
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 340px 1fr; gap:30px; align-items:start;">
                    
                    <!-- LEFT PANEL (Controls) -->
                    <div style="position:sticky; top:20px; background: rgba(10,12,16,0.6); backdrop-filter: blur(15px); border:1px solid rgba(255,255,255,0.05); border-radius:24px; padding:20px; box-shadow:0 15px 40px rgba(0,0,0,0.6);">
                        <${CombatControls} store=${this.store} combatants=${currentCombatants} turnIndex=${currentIndex} round=${currentRound} />
                    </div>
                    
                    <!-- MAIN ARENA (Initiative Queue) -->
                    <div style="background: rgba(15,20,28,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(197,160,89,0.15); border-radius:24px; padding:35px; box-shadow:0 25px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.4); min-height:600px; position:relative; overflow:hidden;">
                        <!-- Glow decorativo de fundo -->
                        <div style="position:absolute; top:-100px; right:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%); border-radius:50%; pointer-events:none;"></div>
                        <div style="position:absolute; bottom:-100px; left:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 60%); border-radius:50%; pointer-events:none;"></div>
                        
                        <div style="position:relative; z-index:1;">
                            <${CombatantListV19} store=${this.store} combatants=${currentCombatants} turnIndex=${currentIndex} />
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
