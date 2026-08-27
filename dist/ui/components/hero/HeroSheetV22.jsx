import { useStore } from '../../core/hooks.js';
import { html } from 'htm/preact';
import { HeroHeader } from './HeroHeader.js';
import { HeroVitals } from './HeroVitals.js';
import { HeroStats } from './HeroStats.js';
import { HeroCombat } from './HeroCombat.js';
import { HeroInventory } from './HeroInventory.js';
import { Dice } from '../../../utils/Dice.js';
import { Toast } from '../Toast.js';
export function HeroSheetV22(opts) {
const storeState = useStore();
const handleRoll = (label, bonus) => {
const roll = Dice.roll('1d20').total;
const total = roll + bonus;
let type = 'info';
if (roll === 20) type = 'success';
if (roll === 1) type = 'error';
Toast.show(`${label} Rolado! Dado: ${roll} + ${bonus} = ${total}`, type);
if (window.TOME?.events) {
window.TOME.events.emit('DICE_ROLLED', { label, roll, bonus, total });
}
}
const { players, viewingHeroId } = storeState;
const p = players?.find(h => h.id === viewingHeroId);
if (!p) {
return html`
<div class="page" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height: 100%; padding:100px;">
<i class="fa-solid fa-user-slash fa-4x" style="color:rgba(212,175,55,0.4); margin-bottom:20px;"></i>
<h2 style="font-family:'Cinzel'; color:var(--accent); font-size: 2rem;">Nenhum Herói Selecionado</h2>
<p style="color:var(--text-dim); margin-top:10px; font-size:1.1rem;">Selecione um personagem no painel lateral esquerdo.</p>
</div>
`;
}
return html`
<div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out; padding-bottom:50px;">
<div class="card glass-accent" style="padding:40px; border-radius:24px; border: 1px solid rgba(212,175,55,0.2); box-shadow:0 25px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.02); position:relative; overflow:hidden; background: rgba(15,20,28,0.7); backdrop-filter: blur(25px);">
<div style="position:absolute; top:0; right:0; width:600px; height:600px; background:radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(30%, -30%);"></div>
<div style="position:absolute; bottom:0; left:0; width:500px; height:500px; background:radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%); border-radius:50%; pointer-events:none; z-index:0; transform: translate(-30%, 30%);"></div>
<div style="position:relative; z-index:10; display:flex; flex-direction:column; gap:40px;">
<${HeroHeader} hero=${p} />
<div style="display:grid; grid-template-columns: 360px 1fr; gap:35px; align-items:start;">
<div style="display:flex; flex-direction:column; gap:30px;">
<div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
<${HeroVitals} hero=${p} />
</div>
<div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
<${HeroStats} hero=${p} onRoll=${handleRoll} />
</div>
</div>
<div style="display:flex; flex-direction:column; gap:30px;">
<div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
<${HeroCombat} hero=${p} />
</div>
<div style="background: rgba(10,12,16,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
<${HeroInventory} hero=${p} onUpdateCoin=${(coin, val) => {
window.TOME.store.update(s => {
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
</div>
`;
}