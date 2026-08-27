import { html } from 'htm/preact';
export function HeroInventory({ hero, onUpdateCoin }) {
if (!hero) return null;
const coins = hero.coins || { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 };
const handleCoinChange = (e, coinKey) => {
const val = parseInt(e.target.value) || 0;
if (onUpdateCoin) {
onUpdateCoin(coinKey, val);
}
};
return html`
<div style="display:flex; flex-direction:column; gap:25px;">
<!-- EQUIPMENT & MONEY POUCH -->
<div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
<div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
<i class="fa-solid fa-bag-shopping"></i> INVENTÁRIO & BOLSA DE MOEDAS
</div>
<!-- Currency pouch -->
<div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:10px; margin-bottom:20px; background:rgba(0,0,0,0.3); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
<div style="text-align:center;">
<div style="font-size:0.6rem; color:#b87333; font-weight:900; text-transform:uppercase; margin-bottom:4px;">CP (Cobre)</div>
<input type="number"
value=${coins.cp}
onChange=${e => handleCoinChange(e, 'cp')}
style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#b87333; font-weight:900; padding:4px;" />
</div>
<div style="text-align:center;">
<div style="font-size:0.6rem; color:#aaa9ad; font-weight:900; text-transform:uppercase; margin-bottom:4px;">SP (Prata)</div>
<input type="number"
value=${coins.sp}
onChange=${e => handleCoinChange(e, 'sp')}
style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#aaa9ad; font-weight:900; padding:4px;" />
</div>
<div style="text-align:center;">
<div style="font-size:0.6rem; color:#d4af37; font-weight:900; text-transform:uppercase; margin-bottom:4px;">EP (Electro)</div>
<input type="number"
value=${coins.ep}
onChange=${e => handleCoinChange(e, 'ep')}
style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#d4af37; font-weight:900; padding:4px;" />
</div>
<div style="text-align:center;">
<div style="font-size:0.6rem; color:var(--accent); font-weight:900; text-transform:uppercase; margin-bottom:4px;">GP (Ouro)</div>
<input type="number"
value=${coins.gp}
onChange=${e => handleCoinChange(e, 'gp')}
style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--accent); font-weight:900; padding:4px;" />
</div>
<div style="text-align:center;">
<div style="font-size:0.6rem; color:#e5e4e2; font-weight:900; text-transform:uppercase; margin-bottom:4px;">PP (Platina)</div>
<input type="number"
value=${coins.pp}
onChange=${e => handleCoinChange(e, 'pp')}
style="width:100%; text-align:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#e5e4e2; font-weight:900; padding:4px;" />
</div>
</div>
<div style="font-size:0.8rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
${hero.equipment?.items?.map ? hero.equipment.items.map(i => html`<div>• ${i.qty}x <strong>${i.name}</strong> (${i.weight}kg)</div>`) : hero.equipment?.items || 'Inventário vazio.'}
</div>
${hero.equipment?.notes ? html`<div style="font-size:0.7rem; margin-top:8px; opacity:0.6; font-style:italic;">* ${hero.equipment.notes}</div>` : ''}
</div>
<!-- FEATURES & CLASSES TRAITS -->
<div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
<div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
<i class="fa-solid fa-book-open-reader"></i> TRAÇOS & ANOTAÇÕES DE HISTÓRIA
</div>
<div style="font-size:0.8rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
${hero.roleplay?.traits || 'Nenhuma história ou traço de personalidade registrado.'}
</div>
</div>
</div>
`;
}