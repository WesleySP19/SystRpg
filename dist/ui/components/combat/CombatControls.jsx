import { useCombat } from '../../hooks/useCombat.js';
export function CombatControls() {
const {
combatants,
nextTurn,
clearCombat,
addMonster,
insertHeroes,
rollInitiatives
} = useCombat();
return (
<div className="flex flex-col gap-5">
{}
<div className="card glass-accent p-6 rounded-2xl border-t-[3px] border-tomeGold bg-black/40 text-center">
<div className="text-xs text-gray-400 uppercase font-black tracking-widest mb-4">Controle de Turno</div>
<button className="btn btn-primary btn-block p-4 text-lg font-cinzel font-extrabold rounded-xl shadow-[0_0_20px_rgba(197,160,89,0.2)]"
onClick={nextTurn}
disabled={!combatants || combatants.length === 0}>
Próximo Turno <i className="fa-solid fa-arrow-right ml-2"></i>
</button>
</div>
{}
<div className="card glass-accent p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2.5">
<button onClick={addMonster} className="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
<span><i className="fa-solid fa-plus text-green-500 mr-2"></i> Adicionar Monstro</span>
</button>
<button onClick={insertHeroes} className="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
<span><i className="fa-solid fa-user-plus text-blue-500 mr-2"></i> Inserir Heróis</span>
</button>
<button onClick={rollInitiatives} className="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
<span><i className="fa-solid fa-dice-d20 text-tomeGold mr-2"></i> Rolar Iniciativas</span>
</button>
</div>
{}
<div className="card glass-accent p-5 rounded-2xl bg-dndRed-bright/5 border border-dndRed-bright/20 flex flex-col gap-2.5">
<div className="text-[0.65rem] text-dndRed-bright uppercase font-black tracking-wider mb-1.5 text-center">Zona de Perigo</div>
<button className="btn btn-ghost btn-block rounded-lg border border-dndRed-bright/30 text-dndRed-bright" onClick={clearCombat}>
<i className="fa-solid fa-skull mr-2"></i> Encerrar Combate
</button>
</div>
</div>
);
}