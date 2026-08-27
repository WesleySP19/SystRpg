import { h } from 'preact';
export function HeroSidebar({ players, selectedHeroId, onSelectHero }) {
return (
<div className="card glass p-0 rounded-2xl flex flex-col h-full border border-tomeGold/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden">
<h3 className="font-cinzel text-tomeGold text-[0.95rem] m-0 border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
<i className="fa-solid fa-users mr-2"></i> Mesa do Grupo
</h3>
<div className="flex-1 overflow-y-auto bg-black/40 p-2 space-y-1 scrollbar-thin scrollbar-thumb-tomeGold/30 scrollbar-track-transparent">
{(!players || players.length === 0) && (
<div className="p-4 text-center text-[0.7rem] text-slate-500 font-bold uppercase tracking-wider">
Nenhum herói na mesa.
</div>
)}
{players?.map(p => {
const isActive = p.id === selectedHeroId;
const hpPct = p.hp?.max ? (p.hp.current / p.hp.max) * 100 : 0;
return (
<div
key={p.id}
className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border
${isActive
? 'bg-tomeGold/10 border-tomeGold/40 shadow-[0_0_15px_rgba(197,160,89,0.15)]'
: 'border-transparent hover:bg-white/5 hover:border-white/10'}`}
onClick={() => onSelectHero(p.id)}
>
<div className={`w-9 h-9 rounded-full flex items-center justify-center font-cinzel text-lg shrink-0 border-[2px] shadow-inner font-bold
${isActive ? 'border-tomeGold text-tomeGold bg-black/80 shadow-[0_0_10px_rgba(197,160,89,0.3)]' : 'border-white/10 text-white/50 bg-black/40'}`}
style={p.img ? { background: `url(${p.img}) center/cover` } : {}}
>
{p.img ? '' : (p.name ? p.name.substring(0,2) : '??')}
</div>
<div className="flex-1 min-w-0">
<div className={`font-bold text-[0.85rem] truncate ${isActive ? 'text-tomeGold' : 'text-slate-200'}`}>
{p.name}
</div>
<div className="text-[0.6rem] text-slate-400 truncate uppercase tracking-wider font-semibold">
Nv {p.level || 1} • {p.hp?.current || 0}/{p.hp?.max || 0} HP
</div>
<div className="h-1 w-full bg-black/50 rounded-full mt-1 overflow-hidden">
<div
className={`h-full ${hpPct < 30 ? 'bg-red-500' : 'bg-green-500'}`}
style={{ width: `${Math.min(100, Math.max(0, hpPct))}%` }}
></div>
</div>
</div>
</div>
);
})}
</div>
</div>
);
}