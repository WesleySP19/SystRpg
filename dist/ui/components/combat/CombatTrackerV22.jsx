import { useCombat } from '../../hooks/useCombat.js';
import { CombatControls } from './CombatControls.jsx';
import { CombatantListV22 } from './CombatantListV22.jsx';
import { BattlemapCanvas } from './BattlemapCanvas.jsx';
export function CombatTrackerV22() {
const { combatants, turnIndex, combatRound } = useCombat();
return (
<div className="page max-w-[1500px] pb-[100px] animate-fadeIn">
{}
<div class="text-center mb-8 relative">
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[100px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none z-0"></div>
<h1 class="font-cinzel text-[3rem] text-white m-0 drop-shadow-[0_5px_20px_rgba(212,175,55,0.4)] relative z-10 flex items-center justify-center gap-4">
<i className="fa-solid fa-khanda text-accent text-[2.4rem]"></i>
TOME ARENA <span class="text-[1.2rem] text-accent opacity-80 mt-4">V22.0.0</span>
<i className="fa-solid fa-khanda fa-flip-horizontal text-accent text-[2.4rem]"></i>
</h1>
<div class="text-[1rem] text-slate-400 uppercase tracking-[6px] font-extrabold mt-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
Rodada {combatRound}
</div>
</div>
<div class="grid grid-cols-[340px_1fr] gap-8 items-start">
{}
<div class="sticky top-5 glass-accent p-5 rounded-[24px]">
<CombatControls />
</div>
{}
<div class="card glass-accent p-8 rounded-[24px] min-h-[600px] relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(0,0,0,0.4)]">
{}
<div class="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_60%)] rounded-full pointer-events-none"></div>
<div class="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(239,68,68,0.05)_0%,transparent_60%)] rounded-full pointer-events-none"></div>
<div class="relative z-10 grid grid-cols-[350px_1fr] gap-8 h-full">
<div class="max-h-[70vh] overflow-y-auto custom-scroll pr-3">
<CombatantListV22 />
</div>
<div class="h-[70vh]">
<BattlemapCanvas isDM={true} />
</div>
</div>
</div>
</div>
</div>
);
}