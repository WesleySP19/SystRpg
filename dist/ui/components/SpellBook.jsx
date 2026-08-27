import { useState } from 'preact/hooks';
import { useSpells } from '../hooks/useSpells.js';
export function SpellBook({ store }) {
const {
allSpells, filteredSpells,
searchQuery, setSearchQuery,
filterClass, setFilterClass,
filterType, setFilterType,
filterLevel, setFilterLevel,
activeSpellTab, setActiveSpellTab,
clearFilters
} = useSpells();
const [selectedSpell, setSelectedSpell] = useState(null);
const stats = {
totalSpells: allSpells.filter(s => activeSpellTab === 'cantrips' ? s.level === 0 : s.level > 0).length,
filteredCount: filteredSpells.length,
classes: [...new Set(allSpells.flatMap(s => s.classes || []))].sort(),
types: [...new Set(allSpells.map(s => s.type).filter(Boolean))].sort(),
levels: [...new Set(allSpells.map(s => s.level).filter(t => t !== undefined && t > 0))].sort((a, b) => a - b)
};
const typeIcons = {
'dano': '⚔️',
'controle': '🔗',
'utilidade': '✨',
'cura': '🏥'
};
const handleSearch = (e) => setSearchQuery(e.target.value);
const handleFilterClass = (e) => setFilterClass(e.target.value);
const handleFilterType = (e) => setFilterType(e.target.value);
const handleFilterLevel = (e) => setFilterLevel(e.target.value);
const renderSearchBar = () => (
<div className="card glass-accent p-4 rounded-xl border border-tomeGold/20">
<div className="flex gap-3 items-center">
<i className="fa-solid fa-magnifying-glass text-tomeGold text-lg"></i>
<input type="text"
placeholder="Buscar pelo nome, efeito ou equivalente em inglês..."
className="flex-1 bg-black/40 border border-tomeGold/15 px-3.5 py-2.5 rounded-lg text-gray-200 text-sm outline-none focus:border-tomeGold/50 transition-colors"
value={searchQuery}
onInput={handleSearch} />
</div>
</div>
);
const renderFilterPanel = () => (
<div className="card glass-accent p-5 rounded-xl border border-tomeGold/15 shadow-2xl">
<div className="font-cinzel text-tomeGold text-sm tracking-wide mb-4 uppercase border-b border-tomeGold/15 pb-2">Filtros</div>
<div className="flex flex-col gap-3.5">
<div>
<label className="text-[0.72rem] text-gray-400 uppercase block mb-1.5 font-bold">Classe</label>
<select value={filterClass} onChange={handleFilterClass} className="w-full bg-black/40 border border-tomeGold/25 px-3 py-2 rounded-md text-gray-200 text-sm outline-none focus:border-tomeGold/50 transition-colors">
<option value="all">Todas</option>
{stats.classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
</select>
</div>
<div>
<label className="text-[0.72rem] text-gray-400 uppercase block mb-1.5 font-bold">Tipo</label>
<select value={filterType} onChange={handleFilterType} className="w-full bg-black/40 border border-tomeGold/25 px-3 py-2 rounded-md text-gray-200 text-sm outline-none focus:border-tomeGold/50 transition-colors">
<option value="all">Todos</option>
{stats.types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
</select>
</div>
{activeSpellTab === 'spells' && (
<div>
<label className="text-[0.72rem] text-gray-400 uppercase block mb-1.5 font-bold">Círculo / Nível</label>
<select value={filterLevel} onChange={handleFilterLevel} className="w-full bg-black/40 border border-tomeGold/25 px-3 py-2 rounded-md text-gray-200 text-sm outline-none focus:border-tomeGold/50 transition-colors">
<option value="all">Todos</option>
{stats.levels.map(l => <option key={l} value={l}>{l}º Nível</option>)}
</select>
</div>
)}
<button className="btn btn-ghost w-full text-sm p-2.5 rounded-lg mt-2 text-tomeGold border-tomeGold/20 hover:bg-tomeGold/10 transition-colors" onClick={clearFilters}>
<i className="fa-solid fa-arrow-rotate-left mr-2"></i> Limpar Filtros
</button>
</div>
<div className="card glass-accent p-3.5 rounded-xl border border-tomeGold/15 text-center mt-4">
<div className="text-[0.7rem] text-gray-400 uppercase mb-1 font-bold">Total Filtrado</div>
<div className="text-3xl font-black text-tomeGold font-cinzel">{stats.filteredCount}</div>
<div className="text-xs text-gray-400 mt-1">{activeSpellTab === 'cantrips' ? 'truques encontrados' : 'magias encontradas'}</div>
</div>
</div>
);
const renderSpellCard = (spell) => {
const icon = typeIcons[spell.type] || '📜';
const isCantrip = spell.level === 0;
const colorBorder = isCantrip ? 'border-green-500/20' : 'border-tomeGold/20';
return (
<div key={spell.id} className={`card glass-accent spell-card p-5 rounded-2xl border ${colorBorder} cursor-pointer transition-all duration-300 ease-out bg-tomeGold/[0.02] hover:bg-tomeGold/10 hover:-translate-y-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_30px_rgba(197,160,89,0.25)] relative overflow-hidden group flex flex-col`}
onClick={() => setSelectedSpell(spell)}>
<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
<div className="absolute -right-10 -top-10 w-24 h-24 bg-tomeGold/20 rounded-full blur-2xl group-hover:bg-tomeGold/30 transition-colors pointer-events-none"></div>
<div className="flex justify-between items-start mb-2.5 relative z-10">
<div className="flex-1 min-w-0">
<h4 className="m-0 text-sm font-extrabold text-white font-cinzel truncate flex items-center gap-2">{icon} {spell.name}</h4>
<div className="text-[0.68rem] text-gray-400 mt-0.5 italic">{spell.englishName}</div>
</div>
{spell.level > 0 && <div className="bg-tomeGold/20 text-tomeGold border border-tomeGold/30 px-1.5 py-0.5 rounded text-[0.65rem] font-black ml-2 shadow-[0_0_8px_rgba(197,160,89,0.3)]">{spell.level}º</div>}
</div>
<div className="flex flex-wrap gap-1 mb-3 relative z-10">
{(spell.classes || []).slice(0, 2).map(cls => <span key={cls} className="bg-tomeGold/10 text-tomeGold text-[0.6rem] px-2 py-0.5 rounded-sm uppercase font-bold border border-tomeGold/20">{cls}</span>)}
{spell.concentration && <span className="bg-red-500/10 text-red-400 text-[0.6rem] px-2 py-0.5 rounded-sm uppercase font-bold border border-red-500/20">⚠️ Conc.</span>}
</div>
<p className="text-[0.78rem] text-gray-300 m-0 leading-relaxed min-h-[3em] line-clamp-2 opacity-90 flex-1 relative z-10">
{spell.challenge || spell.effect || ''}
</p>
<div className="mt-4 text-[0.68rem] text-gray-400 flex justify-between border-t border-white/10 pt-2.5 relative z-10">
<span className="flex items-center gap-1.5"><i className="fa-regular fa-clock text-tomeGold/70"></i> {spell.actionType === 'bonusAction' ? 'Ação Bônus' : (spell.actionType === 'reaction' ? 'Reação' : 'Ação')}</span>
<span className="flex items-center gap-1.5"><i className="fa-solid fa-arrows-left-right text-tomeGold/70"></i> {spell.range || '-'}</span>
</div>
</div>
);
};
const renderSpellDetail = () => {
const spell = selectedSpell;
const isCantrip = spell.level === 0;
return (
<div className="card glass-accent p-6 rounded-xl border-2 border-tomeGold animate-[fadeIn_0.3s_ease-out] shadow-[0_10px_40px_rgba(0,0,0,0.65)]">
<div className="flex justify-between items-start mb-4 border-b border-tomeGold/20 pb-3">
<div>
<h2 className="m-0 text-2xl font-cinzel text-white">{spell.name}</h2>
<div className="text-sm text-tomeGold mt-1 italic">{spell.englishName}</div>
</div>
<button className="btn btn-ghost px-3 py-1.5 text-sm rounded-md hover:bg-white/10 transition-colors" onClick={() => setSelectedSpell(null)}>✕ Voltar</button>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5 p-3 bg-black/30 rounded-lg">
<div className="text-center">
<div className="text-[0.65rem] text-gray-400 uppercase">Nível / Círculo</div>
<div className="text-lg font-black text-tomeGold font-cinzel mt-0.5">{isCantrip ? 'Truque' : `${spell.level}º`}</div>
</div>
<div className="text-center">
<div className="text-[0.65rem] text-gray-400 uppercase">Tempo de Conjuração</div>
<div className="text-sm font-extrabold text-white mt-1">{spell.actionType === 'bonusAction' ? 'Ação Bônus' : (spell.actionType === 'reaction' ? 'Reação' : 'Ação')}</div>
</div>
<div className="text-center">
<div className="text-[0.65rem] text-gray-400 uppercase">Alcance</div>
<div className="text-sm font-extrabold text-white mt-1">{spell.range || '-'}</div>
</div>
<div className="text-center">
<div className="text-[0.65rem] text-gray-400 uppercase">Duração</div>
<div className="text-sm font-extrabold text-white mt-1">{spell.duration || 'Instantânea'}</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
<div>
<div className="font-cinzel text-tomeGold text-xs uppercase tracking-wide mb-1.5 font-bold">Desafio Resolvido</div>
<p className="text-sm text-gray-200 leading-relaxed m-0 opacity-95">{spell.challenge || 'N/A'}</p>
</div>
<div>
<div className="font-cinzel text-tomeGold text-xs uppercase tracking-wide mb-1.5 font-bold">Método de Execução</div>
<p className="text-sm text-gray-200 leading-relaxed m-0 opacity-95">{spell.execution || 'N/A'}</p>
</div>
</div>
<div className="bg-tomeGold/[0.03] p-3 rounded-lg border border-tomeGold/15 mb-5">
<div className="font-cinzel text-tomeGold text-xs uppercase tracking-wide mb-1.5 font-bold">Efeito Mecânico</div>
<p className="text-sm text-gray-200 leading-relaxed m-0 opacity-95">{spell.effect || 'N/A'}</p>
</div>
{spell.baseDamage && (
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
<div className="card glass-accent p-3 rounded-lg bg-red-900/20 border border-tomeGold/20">
<div className="text-[0.65rem] text-gray-400 uppercase mb-1">Dano / Efeito Base</div>
<div className="text-lg font-black text-red-400 font-cinzel"><strong>{spell.baseDamage}</strong> {spell.damageType}</div>
</div>
{spell.savingThrow && (
<div className="card glass-accent p-3 rounded-lg bg-blue-900/20 border border-tomeGold/20">
<div className="text-[0.65rem] text-gray-400 uppercase mb-1">Salvaguarda (Oponente)</div>
<div className="text-base font-extrabold text-blue-300">Rola CD contra: {spell.savingThrow}</div>
</div>
)}
</div>
)}
<div className="mt-4 pt-4 border-t border-white/5 flex gap-2 flex-wrap">
{(spell.classes || []).map(cls => <span key={cls} className="bg-tomeGold/10 text-tomeGold text-xs px-2.5 py-1 rounded-md uppercase font-bold">{cls}</span>)}
{spell.components && <span className="bg-blue-400/10 text-blue-300 text-xs px-2.5 py-1 rounded-md uppercase font-bold">Comp: {spell.components.join(', ')}</span>}
{spell.concentration && <span className="bg-orange-500/10 text-orange-400 text-xs px-2.5 py-1 rounded-md uppercase font-bold">⚠️ Concentração</span>}
</div>
</div>
);
};
const renderSpellGrid = () => {
if (filteredSpells.length === 0) {
return (
<div className="card glass-accent p-14 rounded-xl text-center border border-dashed border-tomeGold/25">
<i className="fa-solid fa-scroll fa-3x text-tomeGold mb-4 opacity-40"></i>
<h4 className="font-cinzel m-0 text-gray-400 text-lg">Nenhum item encontrado</h4>
<p className="text-sm text-gray-500 mt-2">Ajuste seus filtros ou query de busca</p>
</div>
);
}
const grouped = filteredSpells.reduce((acc, s) => {
if (!acc[s.level]) acc[s.level] = [];
acc[s.level].push(s);
return acc;
}, {});
return Object.entries(grouped)
.sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
.map(([level, spells]) => {
const levelLabel = level === '0' ? '🧙 TRUQUES (Cantrips)' : `✨ Magias de ${level}º Círculo / Nível`;
return (
<div key={level} className="mb-6">
<div className="font-cinzel text-base text-tomeGold uppercase tracking-wide pb-2 border-b-2 border-tomeGold/20 mb-3 font-bold">
{levelLabel}
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{spells.map(spell => renderSpellCard(spell))}
</div>
</div>
);
});
};
return (
<div className="page p-5 overflow-y-auto h-full relative">
<div className="max-w-[1400px] mx-auto">
<div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
<div>
<h1 className="flex items-center gap-3 m-0 text-3xl font-cinzel text-white drop-shadow-md">
<i className="fa-solid fa-book-journal-whills text-tomeGold"></i> O Grimório
</h1>
<p className="m-0 mt-1.5 text-gray-400 text-sm">Busca unificada e referencial de magias 5e</p>
</div>
<div className="flex gap-2.5 bg-black/50 p-1.5 rounded-xl border border-tomeGold/15">
<button className={`btn ${activeSpellTab === 'spells' ? 'btn-primary' : 'btn-ghost'} rounded-lg px-5 py-2 font-cinzel font-bold transition-all`}
onClick={() => { setActiveSpellTab('spells'); setSelectedSpell(null); clearFilters(); }}>
<i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Magias
</button>
<button className={`btn ${activeSpellTab === 'cantrips' ? 'btn-primary' : 'btn-ghost'} rounded-lg px-5 py-2 font-cinzel font-bold transition-all`}
onClick={() => { setActiveSpellTab('cantrips'); setSelectedSpell(null); clearFilters(); }}>
<i className="fa-solid fa-hand-sparkles mr-2"></i> Truques
</button>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
<div className="flex flex-col gap-5">
{renderSearchBar()}
<div id="spell-grid-target">
{selectedSpell ? renderSpellDetail() : renderSpellGrid()}
</div>
</div>
<div className="flex flex-col gap-4">
{renderFilterPanel()}
</div>
</div>
</div>
</div>
);
}