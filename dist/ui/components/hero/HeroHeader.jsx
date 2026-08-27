import { html } from 'htm/preact';
import { calculateLevelAndXP } from '../../../utils/progression.js';
export function HeroHeader({ hero }) {
if (!hero) return null;
const { lvl, currentXP, nextXP, progress } = calculateLevelAndXP(hero.xp, hero.level);
return html`
<div class="flex items-center gap-8">
<div class="token-avatar w-[120px] h-[120px] border-[3px] border-tomeGold-muted font-cinzel text-5xl shadow-[0_0_25px_rgba(197,160,89,0.3)] bg-black/60 flex items-center justify-center">
${hero.name.substring(0,2)}
</div>
<div class="flex-1">
<div class="flex justify-between items-start mb-4">
<div>
<h1 class="m-0 font-cinzel text-4xl text-tomeGold-muted drop-shadow-[0_0_15px_rgba(197,160,89,0.4)] leading-tight">
${hero.name}
</h1>
<div class="text-sm text-gray-400 uppercase tracking-widest mt-1 font-semibold">
${hero.race || 'Humano'} <span class="text-tomeGold-muted mx-1">•</span> ${hero.class || 'Aventureiro'}
</div>
</div>
</div>
<!-- XP Bar -->
<div class="glass px-5 py-4 rounded-xl border border-tomeGold-muted/20">
<div class="flex justify-between text-xs font-extrabold uppercase tracking-wider mb-2">
<span class="text-tomeGold-muted">Nível ${lvl}</span>
<span class="text-gray-200">${currentXP} / ${nextXP} XP</span>
</div>
<div class="w-full h-2 bg-black/50 rounded-md overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
<div class="h-full bg-gradient-to-r from-tomeGold-muted to-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.8)] transition-all duration-500 ease-out" style="width:${progress}%"></div>
</div>
</div>
</div>
</div>
`;
}