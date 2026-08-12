import { html } from 'htm/preact';

export function CombatControls({ store, combatants, turnIndex, round }) {
    
    const handleNextTurn = () => {
        if (!combatants || combatants.length === 0) return;
        store.update(s => {
            s.initiativeIndex = (s.initiativeIndex + 1) % s.initiativeOrder.length;
            if (s.initiativeIndex === 0) {
                s.combatRound = (s.combatRound || 1) + 1;
            }
        });
    };

    const handleClearCombat = () => {
        if (confirm('Deseja realmente limpar a arena?')) {
            store.update(s => {
                s.initiativeOrder = [];
                s.initiativeIndex = 0;
                s.combatRound = 1;
            });
        }
    };

    return html`
        <div style="display:flex; flex-direction:column; gap:20px;">
            <!-- Turn Control -->
            <div class="card glass-accent" style="padding:25px; border-radius:16px; border-top:3px solid var(--accent); background:rgba(0,0,0,0.4); text-align:center;">
                <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:900; letter-spacing:2px; margin-bottom:15px;">Controle de Turno</div>
                
                <button class="btn btn-primary btn-block" 
                        onClick=${handleNextTurn}
                        disabled=${combatants.length === 0}
                        style="padding:15px; font-size:1.1rem; font-family:'Cinzel'; font-weight:800; border-radius:12px; box-shadow:0 0 20px rgba(197,160,89,0.2);">
                    Próximo Turno <i class="fa-solid fa-arrow-right" style="margin-left:8px;"></i>
                </button>
            </div>

            <!-- Actions -->
            <div class="card glass-accent" style="padding:20px; border-radius:16px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:10px;">
                <button class="btn btn-ghost btn-block" style="border-radius:10px; border:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-plus text-success" style="margin-right:8px;"></i> Adicionar Monstro</span>
                </button>
                <button class="btn btn-ghost btn-block" style="border-radius:10px; border:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-user-plus text-info" style="margin-right:8px;"></i> Inserir Heróis</span>
                </button>
                <button class="btn btn-ghost btn-block" style="border-radius:10px; border:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-dice-d20 text-tomeGold" style="margin-right:8px;"></i> Rolar Iniciativas</span>
                </button>
            </div>

            <!-- Danger Zone -->
            <div class="card glass-accent" style="padding:20px; border-radius:16px; background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.2); display:flex; flex-direction:column; gap:10px;">
                <div style="font-size:0.65rem; color:var(--danger); text-transform:uppercase; font-weight:900; letter-spacing:1px; margin-bottom:5px; text-align:center;">Zona de Perigo</div>
                <button class="btn btn-ghost btn-block" onClick=${handleClearCombat} style="border-radius:10px; border:1px solid rgba(239,68,68,0.3); color:var(--danger);">
                    <i class="fa-solid fa-skull" style="margin-right:8px;"></i> Encerrar Combate
                </button>
            </div>
        </div>
    `;
}
