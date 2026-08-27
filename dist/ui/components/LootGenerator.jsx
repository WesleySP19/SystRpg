import { useState, useRef, useMemo } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/core/Toast.jsx';
import { Dice } from '../../utils/Dice.js';
import { render } from 'preact';
export function LootGenerator() {
const storeState = useStore();
const [selectedTier, setSelectedTier] = useState('0-4');
const [result, setResult] = useState(null);
const [showDistribute, setShowDistribute] = useState(false);
const [selectedPlayers, setSelectedPlayers] = useState([]);
const [splitMode, setSplitMode] = useState('equal'); // 'equal', 'custom'
const [customAmounts, setCustomAmounts] = useState({});
const containerRef = useRef(null);
const armadinhas = {
'0-4': [
{ name: 'Dagger', damage: '1d4', type: 'piercing' },
{ name: 'Club', damage: '1d4', type: 'bludgeoning' },
{ name: 'Shortbow', damage: '1d6', type: 'piercing' },
],
'5-10': [
{ name: 'Short Sword', damage: '1d6', type: 'piercing' },
{ name: 'Handaxe', damage: '1d6', type: 'slashing' },
{ name: 'Light Crossbow', damage: '1d8', type: 'piercing' },
],
'11-16': [
{ name: 'Longsword', damage: '1d8', type: 'slashing' },
{ name: 'Warhammer', damage: '1d8', type: 'bludgeoning' },
{ name: 'Battleaxe', damage: '1d8', type: 'slashing' },
],
'17+': [
{ name: 'Greatsword', damage: '2d6', type: 'slashing' },
{ name: 'Maul', damage: '2d6', type: 'bludgeoning' },
{ name: 'Heavy Crossbow', damage: '1d10', type: 'piercing' },
],
};
const tables = {
'0-4': [
{ range: [1, 30], dice: '5d6', coin: 'cp' },
{ range: [31, 60], dice: '4d4', coin: 'sp' },
{ range: [61, 70], dice: '3d6', coin: 'ep' },
{ range: [71, 95], dice: '3d6', coin: 'gp' },
{ range: [96, 100], dice: '1d6', coin: 'pp' },
],
'5-10': [
{ range: [1, 30], dice: '4d6*10', coin: 'cp' },
{ range: [31, 60], dice: '3d6*10', coin: 'sp' },
{ range: [61, 70], dice: '3d6*10', coin: 'ep' },
{ range: [71, 95], dice: '4d10*10', coin: 'gp' },
{ range: [96, 100], dice: '2d6*10', coin: 'gp' },
],
'11-16': [
{ range: [1, 20], dice: '4d6*100', coin: 'sp' },
{ range: [21, 35], dice: '1d6*100', coin: 'ep' },
{ range: [36, 75], dice: '2d10*100', coin: 'gp' },
{ range: [76, 100], dice: '2d10*100', coin: 'gp' },
],
'17+': [
{ range: [1, 15], dice: '2d10*1000', coin: 'ep' },
{ range: [16, 55], dice: '1d6*1000', coin: 'gp' },
{ range: [56, 100], dice: '1d6*1000', coin: 'gp' },
],
};
const close = () => {
if (containerRef.current) {
const wrapper = containerRef.current.parentNode;
if (wrapper) {
render(null, wrapper);
wrapper.remove();
}
}
};
const suggestedTier = useMemo(() => {
const monsters = storeState?.monsters || [];
if (!monsters?.length) return '0-4';
const maxCR = Math.max(...monsters.map((m) => parseInt(m.cr) || 0));
if (maxCR <= 4) return '0-4';
if (maxCR <= 10) return '5-10';
if (maxCR <= 16) return '11-16';
return '17+';
}, [storeState?.monsters]);
const rollArmadinhas = (tier) => {
const list = armadinhas[tier] || [];
if (!list.length) return [];
const count = Dice.roll('1d2').total;
const items = [];
for (let i = 0; i < count; i++) {
const idx = Math.floor(Math.random() * list.length);
items.push(list[idx]);
}
return items;
};
const rollLoot = () => {
if (TOME && TOME.audio) {
TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');
}
const roll = Dice.roll('1d100').total;
const tier = selectedTier;
const table = tables[tier];
const match = table.find((r) => roll >= r.range[0] && roll <= r.range[1]);
if (match) {
const diceParts = match.dice.split('*');
let total = Dice.roll(diceParts[0]).total;
if (diceParts[1]) total *= parseInt(diceParts[1]);
const items = rollArmadinhas(tier);
setResult({
roll: roll,
total: total,
coin: match.coin,
items: items,
});
}
};
const copyLoot = () => {
if (!result) return;
const text = `💰 Saque: ${result.total} ${result.coin}`;
navigator.clipboard.writeText(text);
Toast.show('Copiado para a área de transferência!');
};
const clearResult = () => {
setResult(null);
};
const openDistribute = () => {
setSelectedPlayers((storeState?.players || []).map((p) => p.id));
setSplitMode('equal');
setCustomAmounts({});
setShowDistribute(true);
};
const closeDistribute = () => {
setShowDistribute(false);
};
const togglePlayerSelection = (id) => {
if (selectedPlayers.includes(id)) {
setSelectedPlayers(selectedPlayers.filter((x) => x !== id));
} else {
setSelectedPlayers([...selectedPlayers, id]);
}
setSplitMode('equal');
};
const updateCustomAmount = (id, amount) => {
setSplitMode('custom');
setCustomAmounts(prev => ({ ...prev, [id]: parseInt(amount) || 0 }));
};
const confirmDistribution = () => {
if (!result || selectedPlayers.length === 0) return;
const coinKey = result.coin.split(',')[0].trim().toLowerCase();
let totalDistributed = 0;
TOME.store.update((s) => {
s.players.forEach((p) => {
if (selectedPlayers.includes(p.id)) {
let amountPerHero = 0;
if (splitMode === 'equal') {
amountPerHero = Math.floor(result.total / selectedPlayers.length);
} else {
amountPerHero = customAmounts[p.id] || 0;
}
totalDistributed += amountPerHero;
if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
const current = parseInt(p.currency[coinKey]) || 0;
p.currency[coinKey] = current + amountPerHero;
}
});
const names = s.players
.filter((p) => selectedPlayers.includes(p.id))
.map((p) => p.name)
.join(', ');
if (!s.journalEntries) s.journalEntries = [];
s.journalEntries.push({
id: Date.now(),
timestamp: Date.now(),
type: 'loot',
title: 'Tesouro Distribuído',
content: `O saque de ${result.total} ${coinKey.toUpperCase()} foi dividido entre: ${names}. Foram distribuídos um total de ${totalDistributed} ${coinKey.toUpperCase()}.`,
});
});
const remainder = result.total - totalDistributed;
Toast.show(`💰 ${totalDistributed} ${coinKey.toUpperCase()} distribuídos para ${selectedPlayers.length} heróis!`);
if (remainder > 0) Toast.show(`Sobrou ${remainder} ${coinKey.toUpperCase()} no baú.`, 'info');
else if (remainder < 0) Toast.show(`Aviso: Foram distribuídos ${Math.abs(remainder)} moedas a mais do que existia no baú.`, 'warning');
setShowDistribute(false);
setResult(null);
};
const distributeItems = () => {
if (!result || !result.items || result.items.length === 0 || selectedPlayers.length === 0) return;
TOME.store.update((s) => {
s.players.forEach((p) => {
if (selectedPlayers.includes(p.id)) {
if (!p.inventory) p.inventory = [];
const cloned = result.items.map((it) => ({ ...it }));
p.inventory.push(...cloned);
}
});
const names = s.players
.filter((p) => selectedPlayers.includes(p.id))
.map((p) => p.name)
.join(', ');
if (!s.journalEntries) s.journalEntries = [];
s.journalEntries.push({
id: Date.now(),
timestamp: Date.now(),
type: 'loot',
title: 'Armadinhas Distribuídas',
content: `Armadinhas (${result.items.map((it) => it.name).join(', ')}) foram entregues a: ${names}.`,
});
});
Toast.show(`⚔️ Armadinhas distribuídas para ${selectedPlayers.length} heróis!`);
};
const players = storeState?.players || [];
return (
<div ref={containerRef} class="fixed inset-0 bg-black/85 z-[99999] flex items-center justify-center backdrop-blur-md animate-fadeIn p-4">
<div class="page p-6 w-full max-w-[1100px] mx-auto animate-fadeIn relative loot-generator max-h-[90vh] overflow-y-auto">
<div class="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
<div class="card glass-accent relative z-10" style={{ width: '100%', padding: '30px', border: '1px solid rgba(197,160,89,0.2)', background: 'rgba(15,12,16,0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px' }}>
<div class="section-header" style={{ borderBottom: '1px solid rgba(197,160,89,0.3)', paddingBottom: '15px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<div>
<h2 class="section-title" style={{ margin: 0, fontFamily: "'Cinzel'", color: 'var(--accent)', textShadow: '0 0 10px rgba(197,160,89,0.5)' }}>
<i class="fa-solid fa-coins" style={{ marginRight: '12px' }}></i> Gerador de Tesouros (Motor Preact)
</h2>
<p class="section-subtitle" style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Tabelas do Guia do Mestre renderizadas via Virtual DOM.</p>
</div>
<button class="btn btn-ghost w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white" onClick={close}>
<i class="fa-solid fa-times"></i>
</button>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
<div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
<div class="card glass-accent" style={{ padding: '30px', background: 'rgba(197,160,89,0.02)', border: '1px solid rgba(197,160,89,0.25)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(197,160,89,0.06)', padding: '10px 15px', borderRadius: '30px', border: '1px solid rgba(197,160,89,0.15)', marginBottom: '20px', width: 'fit-content' }}>
<i class="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent)' }}></i>
<span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Sugestão da Arena: <strong style={{ color: 'var(--accent)', fontFamily: "'Cinzel'" }}>ND {suggestedTier}</strong></span>
</div>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
{Object.keys(tables).map((t) => {
const active = selectedTier === t;
return (
<button key={t} class={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
style={{ height: 'auto', padding: '15px', borderRadius: '12px', flexDirection: 'column', border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}
onClick={() => setSelectedTier(t)}>
<span style={{ fontSize: '0.6rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Nível</span>
<span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: "'Cinzel'" }}>{t}</span>
</button>
);
})}
</div>
<button class="btn btn-primary btn-block" style={{ padding: '18px', fontSize: '1.2rem', fontFamily: "'Cinzel'", fontWeight: 700, letterSpacing: '2px', borderRadius: '12px', boxShadow: '0 0 15px rgba(197,160,89,0.3)' }} onClick={rollLoot}>
<i class="fa-solid fa-dice-d20 fa-spin-hover" style={{ marginRight: '12px' }}></i> Canalizar Rolagem
</button>
</div>
{result ? (
<div class="card glass-accent" style={{ padding: '35px', border: '2px solid var(--accent)', borderRadius: '16px', textAlign: 'center', animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 0 25px rgba(197,160,89,0.25)' }}>
<div style={{ fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '15px' }}>
<i class="fa-solid fa-gem"></i> Fortuna Desescoberta (d100: {result.roll}) <i class="fa-solid fa-gem"></i>
</div>
<div style={{ display: 'flex', justifyContent: 'center', gap: '25px', alignItems: 'center', marginBottom: '25px', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
<i class="fa-solid fa-coins" style={{ fontSize: '4rem', color: 'var(--accent)', filter: 'drop-shadow(0 0 10px rgba(197,160,89,0.6))' }}></i>
<div style={{ textAlign: 'left' }}>
<div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: "'Cinzel'", textShadow: '0 2px 10px #000' }}>{result.total}</div>
<div style={{ fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 900, letterSpacing: '2px', marginTop: '5px' }}>{result.coin.toUpperCase()}</div>
</div>
</div>
{result.items && result.items.length > 0 && (
<div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
<strong>Armadinhas Geradas:</strong>
<ul style={{ listStyle: 'none', padding: 0, marginTop: '5px' }}>
{result.items.map((it, idx) => <li key={idx}>⚔️ {it.name} ({it.damage} {it.type})</li>)}
</ul>
</div>
)}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
<button class="btn btn-ghost" style={{ borderRadius: '10px', padding: '12px' }} onClick={copyLoot}>
<i class="fa-solid fa-copy" style={{ marginRight: '6px' }}></i> Copiar Notas
</button>
<button class="btn btn-primary" style={{ borderRadius: '10px', padding: '12px', background: 'var(--success)', borderColor: 'var(--success)', boxShadow: '0 0 10px rgba(46,204,113,0.3)' }} onClick={openDistribute}>
<i class="fa-solid fa-hand-holding-dollar" style={{ marginRight: '6px' }}></i> Distribuir Saque
</button>
{result.items && result.items.length > 0 && (
<button class="btn btn-ghost" style={{ borderRadius: '10px', padding: '12px' }} onClick={distributeItems}>Distribuir Itens</button>
)}
<button class="btn btn-ghost" style={{ gridColumn: 'span 2', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', fontSize: '0.85rem' }} onClick={clearResult}>
<i class="fa-solid fa-trash-can" style={{ marginRight: '6px' }}></i> Limpar Câmara
</button>
</div>
</div>
) : (
<div class="card glass-accent empty-state" style={{ height: '220px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.4 }}>
<i class="fa-solid fa-dungeon fa-3x" style={{ marginBottom: '15px', color: 'var(--accent)' }}></i>
<h4 style={{ fontFamily: "'Cinzel'", margin: 0 }}>Câmara de Tesouros Selada</h4>
<p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Aguardando uma rolagem d100...</p>
</div>
)}
</div>
<div class="card glass-accent" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(197,160,89,0.15)' }}>
<div class="card-header" style={{ background: 'rgba(197,160,89,0.05)', padding: '18px 20px', borderBottom: '1px solid rgba(197,160,89,0.15)', margin: 0 }}>
<span class="card-title" style={{ fontSize: '0.85rem', fontFamily: "'Cinzel'", color: 'var(--accent)', letterSpacing: '1px' }}>📋 Sorteios (ND {selectedTier})</span>
</div>
<div style={{ padding: '20px' }}>
<table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
<thead style={{ color: 'var(--accent)', textAlign: 'left', borderBottom: '2px solid rgba(197,160,89,0.25)' }}>
<tr>
<th style={{ padding: '10px 5px', fontFamily: "'Cinzel'" }}>Faixa</th>
<th style={{ padding: '10px 5px', fontFamily: "'Cinzel'", textAlign: 'right' }}>Saque</th>
</tr>
</thead>
<tbody>
{tables[selectedTier].map((row, idx) => (
<tr key={idx} class="tome-hover-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
<td style={{ padding: '12px 5px', fontWeight: 800, color: 'var(--accent)' }}>{row.range[0].toString().padStart(2, '0')}-{row.range[1].toString().padStart(2, '0')}</td>
<td style={{ padding: '12px 5px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>{row.dice.replace('*', 'x')} <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{row.coin.toUpperCase()}</span></td>
</tr>
))}
</tbody>
</table>
</div>
</div>
</div>
{showDistribute && (
<div class="modal-overlay animate-fadeIn" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={closeDistribute}>
<div class="card glass-accent animate-scaleIn" style={{ maxWidth: '480px', width: '100%', padding: '30px', border: '2px solid var(--accent)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
<div style={{ textAlign: 'center', marginBottom: '20px' }}>
<i class="fa-solid fa-hand-holding-dollar fa-3x" style={{ color: 'var(--accent)', marginBottom: '10px' }}></i>
<h3 style={{ fontFamily: "'Cinzel'", color: 'var(--accent)', margin: 0, fontSize: '1.8rem' }}>💰 Distribuir Moedas</h3>
<p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px' }}>
Valor a dividir: <b style={{ color: '#fff', fontSize: '1.1rem' }}>{result.total} {result.coin.toUpperCase()}</b>
</p>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px', maxHeight: '260px', overflowY: 'auto', paddingRight: '5px' }}>
{players.map((p) => {
const selected = selectedPlayers.includes(p.id);
let displayAmount = 0;
if (splitMode === 'equal') {
displayAmount = selectedPlayers.length ? Math.floor(result.total / selectedPlayers.length) : 0;
} else {
displayAmount = customAmounts[p.id] || 0;
}
return (
<label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: selected ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.2s' }}>
<input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }}
checked={selected}
onChange={() => togglePlayerSelection(p.id)} />
<div style={{ flex: 1 }}>
<div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{p.name}</div>
<div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{p.class || 'Aventureiro'}</div>
</div>
{selected && (
<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
<input type="number"
class="legacy-input"
style={{ width: '80px', textAlign: 'center', fontSize: '0.9rem', padding: '5px' }}
value={displayAmount}
onInput={(e) => updateCustomAmount(p.id, e.target.value)}
/>
<span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '0.7rem' }}>{result.coin.toUpperCase()}</span>
</div>
)}
</label>
);
})}
</div>
<div style={{ display: 'flex', gap: '12px' }}>
<button class="btn btn-ghost btn-block" style={{ borderRadius: '10px', padding: '12px' }} onClick={closeDistribute}>Cancelar</button>
<button class="btn btn-primary btn-block" style={{ borderRadius: '10px', padding: '12px', fontWeight: 800 }} onClick={confirmDistribution} disabled={selectedPlayers.length === 0}>
Confirmar Partilha
</button>
</div>
</div>
</div>
)}
</div>
</div>
</div>
);
}