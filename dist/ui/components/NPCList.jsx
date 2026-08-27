import { html } from 'htm/preact';
export function renderQuickMonsters(context) {
const monsters = context.store.state.monsters || [];
if (monsters.length === 0) {
return html`<div class="text-xs text-slate-500 italic text-center p-4 col-span-2">Nenhum monstro ativo na arena de combate.</div>`;
}
return monsters.map(m => html`
<div class="bg-red-500/5 border border-red-500/15 py-2 px-3 rounded-lg flex justify-between items-center text-xs">
<div>
<strong class="text-red-500">${m.name}</strong>
<span class="text-[0.65rem] text-slate-500 block">ND ${m.cr || '0'} • HP: ${m.hp?.current}/${m.hp?.max}</span>
</div>
<div class="flex gap-1">
<button class="btn btn-ghost btn-sm px-1.5 py-0.5 text-[0.6rem] border-white/5" data-action="adjustMonsterHP" data-id="${m.id}" data-val="-5">-5</button>
<button class="btn btn-ghost btn-sm px-1.5 py-0.5 text-[0.6rem] text-green-400 border-white/5" data-action="adjustMonsterHP" data-id="${m.id}" data-val="5">+5</button>
</div>
</div>
`);
}