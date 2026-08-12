import { html } from 'htm/preact';

export function CombatControls({ store, combatants, turnIndex, round }) {
    
    const handleNextTurn = () => {
        if (!combatants || combatants.length === 0) return;
        store.update(s => {
            s.turnIndex = (s.turnIndex + 1) % s.combatants.length;
            if (s.turnIndex === 0) {
                s.round = (s.round || 1) + 1;
            }
        });
    };

    const handleClearCombat = () => {
        if (confirm('Deseja realmente limpar a arena?')) {
            store.update(s => {
                s.combatants = [];
                s.turnIndex = 0;
                s.round = 1;
            });
        }
    };

    const handleAddMonster = () => {
        store.update(s => {
            if(!s.combatants) s.combatants = [];
            s.combatants.push({
                id: 'm_' + Date.now(),
                name: 'Goblin',
                initiative: Math.floor(Math.random() * 20) + 1,
                isHero: false,
                hp: 15, maxHp: 15
            });
        });
    };

    const handleInsertHeroes = () => {
        const heroes = store.state.heroes || [];
        if (heroes.length === 0) return alert('Nenhum herói na sessão!');
        store.update(s => {
            if(!s.combatants) s.combatants = [];
            heroes.forEach(h => {
                if(!s.combatants.find(c => c.id === h.id)) {
                    s.combatants.push({
                        id: h.id,
                        name: h.name,
                        initiative: Math.floor(Math.random() * 20) + 1,
                        isHero: true,
                        hp: h.hp || 10, maxHp: h.maxHp || 10
                    });
                }
            });
        });
    };

    const handleRollInitiatives = () => {
        store.update(s => {
            if(!s.combatants) return;
            s.combatants.forEach(c => {
                c.initiative = Math.floor(Math.random() * 20) + 1;
            });
            s.combatants.sort((a, b) => b.initiative - a.initiative);
            s.turnIndex = 0;
        });
    };

    return html`
        <div class="flex flex-col gap-5">
            <!-- Turn Control -->
            <div class="card glass-accent p-6 rounded-2xl border-t-[3px] border-tomeGold bg-black/40 text-center">
                <div class="text-xs text-gray-400 uppercase font-black tracking-widest mb-4">Controle de Turno</div>
                
                <button class="btn btn-primary btn-block p-4 text-lg font-cinzel font-extrabold rounded-xl shadow-[0_0_20px_rgba(197,160,89,0.2)]" 
                        onClick=${handleNextTurn}
                        disabled=${!combatants || combatants.length === 0}>
                    Próximo Turno <i class="fa-solid fa-arrow-right ml-2"></i>
                </button>
            </div>

            <!-- Actions -->
            <div class="card glass-accent p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2.5">
                <button onClick=${handleAddMonster} class="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
                    <span><i class="fa-solid fa-plus text-green-500 mr-2"></i> Adicionar Monstro</span>
                </button>
                <button onClick=${handleInsertHeroes} class="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
                    <span><i class="fa-solid fa-user-plus text-blue-500 mr-2"></i> Inserir Heróis</span>
                </button>
                <button onClick=${handleRollInitiatives} class="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
                    <span><i class="fa-solid fa-dice-d20 text-tomeGold mr-2"></i> Rolar Iniciativas</span>
                </button>
            </div>

            <!-- Danger Zone -->
            <div class="card glass-accent p-5 rounded-2xl bg-dndRed-bright/5 border border-dndRed-bright/20 flex flex-col gap-2.5">
                <div class="text-[0.65rem] text-dndRed-bright uppercase font-black tracking-wider mb-1.5 text-center">Zona de Perigo</div>
                <button class="btn btn-ghost btn-block rounded-lg border border-dndRed-bright/30 text-dndRed-bright" onClick=${handleClearCombat}>
                    <i class="fa-solid fa-skull mr-2"></i> Encerrar Combate
                </button>
            </div>
        </div>
    `;
}
