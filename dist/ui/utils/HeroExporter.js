import { Toast } from '../components/core/Toast.jsx';
import { html } from 'htm/preact';
export class HeroExporter {
constructor(formContext) {
this.ctx = formContext;
}
$ (selector) { return this.ctx.$(selector); }
_collectFormData(f) { return this.ctx._collectFormData(f); }
downloadHeroJSON() {
try {
const f = this.$('#hero-form');
if (!f) throw new Error("Formulário não encontrado");
const data = this._collectFormData(f);
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.style.display = 'none';
a.href = url;
a.download = `${(data.name || 'Heroi').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tome.json`;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
window.URL.revokeObjectURL(url);
Toast.show('💾 JSON da lenda exportado com sucesso!', 'success');
}, 100);
} catch (err) {
console.error("Erro ao exportar JSON:", err);
Toast.show('❌ Erro ao exportar JSON.', 'danger');
}
}
printOfficialSheet() {
try {
const f = this.$('#hero-form');
if (!f) throw new Error("Formulário não encontrado");
const data = this._collectFormData(f);
let target = document.getElementById('dnd-print-target');
if (!target) {
target = document.createElement('div');
target.id = 'dnd-print-target';
document.body.appendChild(target);
}
target.innerHTML = html`
<style>
@media print {
body > *:not(#dnd-print-target) { display: none !important; }
#dnd-print-target { display: block !important; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
@page { margin: 0.5cm; size: auto; }
}
</style>
${this._renderPrintTemplate(data)}
`;
Toast.show('🖨️ Gerando PDF Oficial D&D 5e...', 'success');
requestAnimationFrame(() => {
requestAnimationFrame(() => {
window.print();
setTimeout(() => {
if (target) target.innerHTML = '';
}, 1000);
});
});
} catch (err) {
console.error("Erro ao gerar PDF:", err);
Toast.show('❌ Erro ao gerar PDF.', 'danger');
}
}
_renderPrintTemplate(p) {
const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
const labels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
const getMod = (v) => Math.floor((v - 10) / 2);
const formatMod = (m) => m >= 0 ? `+${m}` : m;
const prof = p.proficiencyBonus || 2;
const percVal = getMod(stats.wis) + (p.skills.includes('perception') ? prof : 0);
const investVal = getMod(stats.int) + (p.skills.includes('investigation') ? prof : 0);
const insightVal = getMod(stats.wis) + (p.skills.includes('insight') ? prof : 0);
const hasSpells = Object.values(p.spells || {}).some(s => s && s.trim());
const isSpellcaster = ['mago', 'clérigo', 'druida', 'feiticeiro', 'bruxo', 'bardo', 'paladino', 'patrulheiro', 'wizard', 'cleric', 'druid', 'sorcerer', 'warlock', 'bard', 'paladin', 'ranger'].some(cls => p.class?.toLowerCase().includes(cls));
let spellsPage = '';
if (hasSpells || isSpellcaster) {
spellsPage = html`
<div class="dnd-print-page spell-page" style="page-break-before: always; padding: 20px; color: black; font-family: 'Outfit', sans-serif; background: white;">
<div class="dnd-header" style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:end;">
<div>
<h1 style="margin:0; font-family:'Cinzel'; font-size:24px;">GRIMÓRIO ARCANO</h1>
<span style="font-size:10px; text-transform:uppercase;">Lista de Magias de ${p.name}</span>
</div>
<div style="display:flex; gap:15px; font-size:10px; font-weight:bold;">
<div>Classe Conjuradora: ${p.class?.split(' ')[0] || 'Conjurador'}</div>
<div>Bônus Proficiência: +${prof}</div>
</div>
</div>
<div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
${[0,1,2,3,4,5,6,7,8,9].map(lv => {
const levelSpells = p.spells?.[`lvl${lv}`] || '';
const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };
let spellsContent = '';
if (levelSpells.trim()) {
spellsContent = levelSpells;
} else {
spellsContent = `○ ________________________\n○ ________________________\n○ ________________________\n○ ________________________\n○ ________________________`;
}
return html`
<div style="border: 2px solid black; border-radius: 8px; padding: 10px; background: white; color: black; min-height: 110px;">
<div style="font-weight: 800; font-size: 11px; border-bottom: 1px solid black; padding-bottom: 5px; margin-bottom: 5px; display:flex; justify-content:space-between;">
<span>${lv === 0 ? 'TRUQUES' : `${lv}º NÍVEL`}</span>
${lv > 0 ? html`<span>Slots: ${slots.total || '___'}</span>` : ''}
</div>
<div style="font-size: 9px; line-height: 1.5; white-space: pre-wrap; color: black;">${spellsContent}</div>
</div>
`;
}).join('')}
</div>
</div>
`;
}
return html`
<div class="dnd-print-template">
<div class="dnd-print-page" style="padding: 20px; color: black; font-family: 'Outfit', sans-serif; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; background: white;">
<!-- HEADER -->
<div class="dnd-header" style="display:flex; gap:15px; border-bottom:2px solid black; padding-bottom:10px; margin-bottom:15px;">
<div style="flex:1.5;">
<h1 style="margin:0; font-size:28px; font-family:'Cinzel'; color: black;">${p.name}</h1>
<span style="font-size:9px; text-transform:uppercase; font-weight:800; letter-spacing:1px; color:#555;">Nome do Personagem</span>
</div>
<div style="flex:2.5; display:grid; grid-template-columns: 1.2fr 1fr 1fr; gap:8px; border:2px solid black; padding:10px; border-radius:8px; background:white;">
<div>
<div style="font-size:10px; font-weight:800; color: black;">${p.class || '---'}</div>
<span style="font-size:8px; color:#666; text-transform:uppercase;">Classe & Nível</span>
</div>
<div>
<div style="font-size:10px; font-weight:800; color: black;">${p.race || '---'}</div>
<span style="font-size:8px; color:#666; text-transform:uppercase;">Raça</span>
</div>
<div>
<div style="font-size:10px; font-weight:800; color: black;">${p.alignment || '---'}</div>
<span style="font-size:8px; color:#666; text-transform:uppercase;">Tendência</span>
</div>
<div>
<div style="font-size:10px; font-weight:800; color: black;">${p.background || '---'}</div>
<span style="font-size:8px; color:#666; text-transform:uppercase;">Antecedente</span>
</div>
<div>
<div style="font-size:10px; font-weight:800; color: black;">${p.playerName || '---'}</div>
<span style="font-size:8px; color:#666; text-transform:uppercase;">Jogador</span>
</div>
<div>
<div style="font-size:10px; font-weight:800; color: black;">${p.xp || 0}</div>
<span style="font-size:8px; color:#666; text-transform:uppercase;">Pontos de Experiência</span>
</div>
</div>
</div>
<!-- COMBAT METRICS -->
<div class="dnd-main-stats" style="margin-top:15px; display:flex; gap:10px; justify-content:space-between; margin-bottom:15px;">
<div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.ac || 10}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">CA</div></div>
<div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${formatMod(p.initiative || 0)}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">Iniciativa</div></div>
<div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.speed || 30} ft</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">Deslocamento</div></div>
<div class="dnd-box" style="flex:2.5; border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.hp?.current} / ${p.hp?.max}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">Pontos de Vida</div></div>
<div class="dnd-box" style="border: 2px solid black; border-radius: 6px; padding: 8px; text-align: center; flex: 1; background: white; color: black;"><div class="val" style="font-size: 20px; font-weight: 900;">${p.hp?.temp || 0}</div><div class="label" style="font-size: 8px; text-transform: uppercase; font-weight: 800; margin-top: 3px;">PV Temp</div></div>
</div>
<!-- CORE GRID -->
<div class="dnd-grid" style="margin-top:15px; display:grid; grid-template-columns: 110px 240px 1fr 280px; gap:15px; flex:1;">
<!-- COLUMN 1: ABILITIES -->
<div class="dnd-stats-column" style="display:flex; flex-direction:column; gap:10px;">
${Object.entries(stats).map(([s, v]) => html`
<div class="stat-box" style="border: 2px solid black; border-radius: 8px; height: 75px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background:white; color: black;">
<div class="stat-label" style="font-size: 8px; font-weight: 800; text-transform: uppercase; margin-top:2px;">${labels[s]}</div>
<div class="stat-val" style="font-size: 20px; font-weight: 900;">${v}</div>
<div class="stat-mod" style="position: absolute; bottom: -8px; background: white; border: 2px solid black; border-radius: 50% / 30%; width: 34px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px;">${formatMod(getMod(v))}</div>
</div>
`).join('')}
</div>
<!-- COLUMN 2: SAVES & SKILLS -->
<div style="display:flex; flex-direction:column; gap:10px;">
<!-- SAVES -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black;">
<div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">TESTES DE RESISTÊNCIA</div>
${Object.entries(stats).map(([s, v]) => {
const isProf = !!p.savingThrows?.[s];
const bonus = getMod(v) + (isProf ? prof : 0);
return html`
<div style="display:flex; align-items:center; gap:5px; font-size:9px; height:14px;">
<span style="font-size:8px;">${isProf ? '●' : '○'}</span>
<span style="font-weight:bold; width:18px;">${formatMod(bonus)}</span>
<span>${labels[s]}</span>
</div>
`;
}).join('')}
</div>
<!-- SKILLS -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; flex:1;">
<div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">PERÍCIAS</div>
${this._skills.map(sk => {
const isProf = p.skills.includes(sk.id);
const bonus = getMod(stats[sk.stat]) + (isProf ? prof : 0);
return html`
<div style="display:flex; align-items:center; gap:5px; font-size:9px; height:13px;">
<span style="font-size:8px;">${isProf ? '●' : '○'}</span>
<span style="font-weight:bold; width:18px;">${formatMod(bonus)}</span>
<span>${sk.label} <small style="color:#666; font-size:7px;">(${labels[sk.stat]})</small></span>
</div>
`;
}).join('')}
</div>
</div>
<!-- COLUMN 3: ATTACKS & EQUIPMENT -->
<div style="display:flex; flex-direction:column; gap:10px;">
<!-- ATTACKS -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black;">
<div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">ATAQUES & CONJURAÇÃO</div>
<table style="width:100%; border-collapse:collapse; font-size:9px; text-align:left; color: black;">
<thead>
<tr style="border-bottom:1px solid #555;">
<th style="padding:2px;">Ataque</th>
<th style="padding:2px;">Bônus</th>
<th style="padding:2px;">Dano/Tipo</th>
</tr>
</thead>
<tbody>
${(() => {
const atksToRender = p.attacks && p.attacks.length ? p.attacks.filter(a => a.name || a.bonus || a.damage) : [];
let html = atksToRender.map(atk => html`
<tr style="border-bottom:1px solid #eee; height:18px;">
<td style="padding:4px 2px; font-weight:bold;">${atk.name || ''}</td>
<td style="padding:4px 2px;">${atk.bonus || ''}</td>
<td style="padding:4px 2px;">${atk.damage || ''}</td>
</tr>
`).join('');
const needed = Math.max(0, 6 - atksToRender.length);
for (let i = 0; i < needed; i++) {
html += html`
<tr style="border-bottom:1px solid #eee; height:18px;">
<td style="padding:4px 2px; color:#bbb;">________________________</td>
<td style="padding:4px 2px; color:#bbb;">______</td>
<td style="padding:4px 2px; color:#bbb;">__________</td>
</tr>
`;
}
return html;
})()}
</tbody>
</table>
${p.attackNotes ? html`<div style="font-size:8px; border-top:1px solid black; margin-top:5px; padding-top:5px; font-style:italic; white-space:pre-wrap;">${p.attackNotes}</div>` : ''}
</div>
<!-- EQUIPMENT & INVENTORY -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; flex:1; display:flex; flex-direction:column;">
<div style="font-size:9px; font-weight:800; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px; text-transform:uppercase;">🎒 EQUIPAMENTO & MOEDAS</div>
<div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:3px; text-align:center; margin-bottom:8px; font-size:8px; background:#f5f5f5; padding:4px; border-radius:4px; color: black;">
<div><strong>PL:</strong> ${p.currency?.pp || 0}</div>
<div><strong>PO:</strong> ${p.currency?.gp || 0}</div>
<div><strong>PE:</strong> ${p.currency?.ep || 0}</div>
<div><strong>PP:</strong> ${p.currency?.sp || 0}</div>
<div><strong>PC:</strong> ${p.currency?.cp || 0}</div>
</div>
<div style="font-size:8px; line-height:1.3; flex:1; overflow:hidden;">
${(() => {
const itemsToRender = p.equipment?.items && p.equipment.items.length ? p.equipment.items.filter(item => item.name || item.qty > 1) : [];
let html = itemsToRender.map(item => html`
<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:1px 0; height:16px;">
<span><strong>${item.name || ''}</strong></span>
<span style="color:#666;">x${item.qty || 1} ${item.weight ? `(${item.weight} lbs)` : ''}</span>
</div>
`).join('');
const needed = Math.max(0, 10 - itemsToRender.length);
for (let i = 0; i < needed; i++) {
html += html`
<div style="display:flex; justify-content:space-between; border-bottom:1px dashed #ddd; padding:1px 0; height:16px;">
<span style="color:#ddd;">_________________________________________</span>
<span style="color:#ddd;">____</span>
</div>
`;
}
return html;
})()}
${p.equipment?.notes ? html`<div style="font-size:8px; border-top:1px dashed #ccc; margin-top:5px; padding-top:5px; font-style:italic; white-space:pre-wrap;">${p.equipment.notes}</div>` : ''}
</div>
</div>
</div>
<!-- COLUMN 4: NARRATIVE & TRAITS -->
<div style="display:flex; flex-direction:column; gap:10px;">
<!-- PASSIVE SCORES -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; font-size:9px;">
<div style="display:flex; justify-content:space-between; margin-bottom:3px;">
<span>SABEDORIA PASSIVA (PERCEPÇÃO)</span>
<strong>${10 + percVal}</strong>
</div>
<div style="display:flex; justify-content:space-between; margin-bottom:3px;">
<span>INTELIGÊNCIA PASSIVA (INVEST.)</span>
<strong>${10 + investVal}</strong>
</div>
<div style="display:flex; justify-content:space-between;">
<span>SABEDORIA PASSIVA (INTUIÇÃO)</span>
<strong>${10 + insightVal}</strong>
</div>
</div>
<!-- ROLEPLAY TRAITS -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; font-size:8px; display:flex; flex-direction:column; gap:6px;">
<div>
<strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Traços de Personalidade</strong>
<div style="margin-top:2px;">${p.roleplay?.traits || '---'}</div>
</div>
<div>
<strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Ideais</strong>
<div style="margin-top:2px;">${p.roleplay?.ideals || '---'}</div>
</div>
<div>
<strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Vínculos</strong>
<div style="margin-top:2px;">${p.roleplay?.bonds || '---'}</div>
</div>
<div>
<strong style="text-transform:uppercase; display:block; border-bottom:1px solid #eee;">Fraquezas</strong>
<div style="margin-top:2px;">${p.roleplay?.flaws || '---'}</div>
</div>
</div>
<!-- OTHER PROFS & BIO -->
<div style="border:2px solid black; border-radius:8px; padding:8px; background:white; color: black; flex:1; font-size:8px;">
<strong style="text-transform:uppercase; display:block; border-bottom:1px solid black; padding-bottom:3px; margin-bottom:5px;">Outras Proficiências & Idiomas</strong>
<div style="white-space:pre-wrap; line-height:1.3;">${p.otherProfs || '---'}</div>
</div>
</div>
</div>
<!-- FOOTER -->
<div style="margin-top:15px; font-size:8px; text-align:center; opacity:0.5; border-top:1px solid #ccc; padding-top:5px; color: black;">
Gerado pela Mesa do Mestre — Ficha Oficial de Referência 5e
</div>
</div>
<!-- SPELLS PAGE -->
${spellsPage}
</div>
`;
}
}