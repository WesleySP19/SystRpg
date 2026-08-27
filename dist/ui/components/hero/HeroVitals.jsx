import { html } from 'htm/preact';
const vitalsCache = new Map();
export function HeroVitals({ hero }) {
if (!hero || !hero.id) return null;
const stats = hero.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
const getMod = (v) => Math.floor(((parseInt(v) || 10) - 10) / 2);
const acVal = hero.ac || (10 + getMod(stats.dex));
const initVal = getMod(stats.dex);
const speed = hero.speed || 30;
const hpCurrent = hero.hp?.current || 0;
const hpMax = hero.hp?.max || 10;
const cacheKey = `${hero.id}_${hpCurrent}_${hpMax}_${acVal}_${initVal}_${speed}`;
if (vitalsCache.has(cacheKey)) {
return vitalsCache.get(cacheKey);
}
const output = html`
<div class="card glass" style="padding:25px; border-radius:16px;">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
<h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
<i class="fa-solid fa-heart-pulse text-dndRedBright"></i> Vitalidade
</h3>
</div>
<div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:25px;">
<!-- HP Card -->
<div style="background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.2); border-radius:12px; padding:15px; text-align:center; position:relative; overflow:hidden;">
<div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:5px;">Pontos de Vida</div>
<div style="font-size:2rem; font-family:'Cinzel'; font-weight:900; color:#fff; text-shadow:0 0 10px rgba(239, 68, 68, 0.4); display:flex; align-items:baseline; justify-content:center; gap:4px;">
${hpCurrent} <span style="font-size:1rem; color:var(--text-dim);">/ ${hpMax}</span>
</div>
</div>
<!-- Armor Class Card -->
<div style="background:rgba(197,160,89, 0.05); border:1px solid rgba(197,160,89, 0.2); border-radius:12px; padding:15px; text-align:center; position:relative; overflow:hidden;">
<i class="fa-solid fa-shield-halved" style="position:absolute; font-size:4rem; color:var(--accent); opacity:0.1; top:-5px; right:-10px; transform:rotate(15deg);"></i>
<div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:5px;">Classe de Armadura</div>
<div style="font-size:2rem; font-family:'Cinzel'; font-weight:900; color:var(--accent); text-shadow:0 0 10px rgba(197, 160, 89, 0.4);">
${acVal}
</div>
</div>
</div>
<div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
<!-- Initiative -->
<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; text-align:center;">
<div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:2px;">Iniciativa</div>
<div style="font-size:1.4rem; font-family:'Cinzel'; font-weight:900; color:#fff;">
${initVal >= 0 ? '+'+initVal : initVal}
</div>
</div>
<!-- Speed -->
<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; text-align:center;">
<div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; font-weight:800; letter-spacing:1px; margin-bottom:2px;">Deslocamento</div>
<div style="font-size:1.4rem; font-family:'Cinzel'; font-weight:900; color:#fff;">
${speed} <span style="font-size:0.75rem;">ft</span>
</div>
</div>
</div>
</div>
`;
if (vitalsCache.size > 200) vitalsCache.clear();
vitalsCache.set(cacheKey, output);
return output;
}