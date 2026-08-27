import { useState, useEffect } from 'preact/hooks';
import { Toast } from './Toast.js';
import { Modal } from './Modal.js';
export function VaultExplorer() {
const [query, setQuery] = useState('');
const [category, setCategory] = useState('spells'); // 'spells' | 'items'
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
const fetchResults = async () => {
setLoading(true);
try {
const response = await fetch(`./data/srd/${category}.json`);
const data = await response.json();
const filtered = data.filter(item =>
item.name.toLowerCase().includes(query.toLowerCase())
);
setResults(filtered);
} catch (err) {
console.error('[Vault] Search failed:', err);
Toast.show('Erro ao carregar banco de dados.', 'error');
} finally {
setLoading(false);
}
};
const timer = setTimeout(() => {
fetchResults();
}, 300);
return () => clearTimeout(timer);
}, [query, category]);
const viewDetails = (item) => {
Modal.alert(item.name, item.description, 'info');
};
const addToSheet = (item) => {
if (!window.TOME?.store) return;
window.TOME.store.update(s => {
const player = s.players[s.currentPlayerIdx || 0];
if (!player) {
Toast.show('Selecione um herói primeiro!', 'warning');
return;
}
if (category === 'items') {
const items = (player.equipment?.items || '').split('\n').filter(x => x.trim());
items.push(`${item.name} (${item.type})`);
if (!player.equipment) player.equipment = { items: '' };
player.equipment.items = items.join('\n');
} else {
const notes = (player.spells?.lvl0 || '').split('\n').filter(x => x.trim());
notes.push(`✨ MAGIA: ${item.name} (Nível ${item.level}) - ${item.description.substring(0, 50)}...`);
if (!player.spells) player.spells = {};
player.spells.lvl0 = notes.join('\n');
}
Toast.show(`${item.name} adicionado à ficha de ${player.name}!`, 'success');
});
};
return (
<div class="vault-explorer animate-fade" style={{ padding: '20px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
<h2 style={{ fontFamily: 'Cinzel', color: 'var(--primary)', fontSize: '1.2rem', margin: 0 }}>🏛️ COFRE DO CONHECIMENTO</h2>
<div style={{ display: 'flex', gap: '10px' }}>
<button class={`btn ${category === 'spells' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCategory('spells')}>MAGIAS</button>
<button class={`btn ${category === 'items' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCategory('items')}>ITENS</button>
</div>
</div>
<div style={{ position: 'relative', marginBottom: '30px' }}>
<input
type="text"
placeholder="Pesquisar no SRD..."
class="legacy-input"
style={{ width: '100%', padding: '15px 50px 15px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'white' }}
value={query}
onInput={(e) => setQuery(e.target.value)}
/>
<i class="fa-solid fa-magnifying-glass" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}></i>
</div>
<div class="vault-results" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
{loading && <p style={{ textAlign: 'center', padding: '40px' }}>Consultando pergaminhos...</p>}
{results.length === 0 && !loading && <p style={{ textAlign: 'center', opacity: 0.3, padding: '40px' }}>Nenhum registro encontrado.</p>}
{results.map(item => (
<div
key={item.name}
class="card"
draggable={true}
data-item={JSON.stringify(item)}
onDragStart={(e) => {
e.dataTransfer.setData('text/plain', JSON.stringify(item));
e.dataTransfer.effectAllowed = 'copy';
}}
style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--primary)', transition: 'transform 0.2s', cursor: 'grab' }}
>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
<strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{item.name}</strong>
<span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
{item.level !== undefined ? `Nível ${item.level}` : item.type}
</span>
</div>
<p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
{item.description}
</p>
<div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
<button class="btn btn-ghost" style={{ flex: 1, fontSize: '0.6rem', padding: '5px' }} onClick={() => viewDetails(item)}>DETALHES</button>
<button class="btn btn-primary" style={{ flex: 1, fontSize: '0.6rem', padding: '5px' }} onClick={() => addToSheet(item)}>+ FICHA</button>
</div>
</div>
))}
</div>
</div>
);
}