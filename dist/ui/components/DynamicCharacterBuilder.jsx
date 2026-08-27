import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { Toast } from '../components/core/Toast.jsx';
import { CRDTManager } from '../core/CRDTManager.js';
export function DynamicCharacterBuilder() {
const storeState = useStore();
const hero = storeState?.currentHero || {};
const [systemSchema, setSystemSchema] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [name, setName] = useState(hero.name || '');
const [attributes, setAttributes] = useState(hero.attributes || {});
const [resources, setResources] = useState(hero.resources || {});
useEffect(() => {
const fetchSystemSchema = async () => {
try {
const res = await fetch('/api/system/active');
const result = await res.json();
if (result.status === 'success' && result.data) {
setSystemSchema(result.data.sheetSchema);
if (result.data.sheetSchema) {
const s = result.data.sheetSchema;
const initialAttrs = { ...hero.attributes };
const initialRes = { ...hero.resources };
Object.entries(s.attributes || {}).forEach(([key, attr]) => {
if (initialAttrs[key] === undefined) initialAttrs[key] = attr.default;
});
Object.entries(s.resources || {}).forEach(([key, res]) => {
if (initialRes[key] === undefined) initialRes[key] = res.default;
});
setAttributes(initialAttrs);
setResources(initialRes);
}
} else {
setError(result.message || "Sistema não encontrado.");
}
} catch (err) {
setError("Erro ao carregar o sistema. Verifique a conexão com o servidor.");
}
setIsLoading(false);
};
fetchSystemSchema();
}, []); // Run once on mount
const handleSubmit = (e) => {
e.preventDefault();
const newHero = {
id: hero.id || 'hero_' + Date.now().toString(),
name: name,
attributes: attributes,
resources: resources
};
newHero.hp = { current: resources.hp_current || 10, max: resources.hp_max || 10 };
newHero.hp_current = resources.hp_current || 10;
newHero.hp_max = resources.hp_max || 10;
if (window.TOME?.store) {
window.TOME.store.update(s => {
const idx = (s.players || []).findIndex(p => p.id === newHero.id);
if (idx >= 0) {
s.players[idx] = { ...s.players[idx], ...newHero };
} else {
s.players = s.players || [];
s.players.push(newHero);
}
s.currentHero = newHero;
s.activeTab = 'dashboard';
});
}
Toast.show('Personagem salvo no motor multissistema!', 'success');
};
const applyTankTemplate = () => {
if (!systemSchema) return;
setAttributes(prev => ({ ...prev, 'STR': 18, 'CON': 16 }));
setResources(prev => ({ ...prev, 'hp_max': 30, 'hp_current': 30, 'ac': 18 }));
Toast.show('Template Guerreiro Tank aplicado.', 'info');
};
const rollAttribute = async (attrKey) => {
if (!hero || !hero.id) {
Toast.show('Salve o personagem primeiro antes de rolar!', 'warning');
return;
}
try {
const { RulesEngine } = await import('../../core/RulesEngine.js');
const expression = `1d20+${attrKey}`;
const result = RulesEngine.resolveFormula(expression, hero.attributes || {});
let details = `[${result.rolls.join(', ')}] + MOD`;
if (result.isCrit) details += " 🎯 CRÍTICO!";
if (result.isFumble) details += " 💀 FALHA CRÍTICA!";
const newEntry = {
id: Date.now(),
sender: hero.name || 'Herói',
message: `/roll ${expression}`,
isSystem: false,
isRoll: true,
formula: result.formula,
total: result.total,
details: details
};
if (CRDTManager && CRDTManager.chatHistory) {
CRDTManager.chatHistory.push([newEntry]);
if (CRDTManager.chatHistory.length > 100) {
CRDTManager.chatHistory.delete(0, CRDTManager.chatHistory.length - 100);
}
}
} catch (err) {
console.error("Erro ao rolar:", err);
}
};
if (isLoading) {
return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--accent)', fontFamily: "'Cinzel'" }}>Carregando Motor Multissistema...</div>;
}
if (error) {
return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--danger)' }}>{error}</div>;
}
return (
<div class="card glass-accent p-8 max-w-[800px] mx-auto text-white rounded-2xl relative overflow-hidden">
<div class="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
<h2 class="font-cinzel text-accent text-center uppercase m-0 text-2xl flex items-center justify-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]">
<i class="fa-solid fa-hat-wizard"></i> Construtor de Personagem
</h2>
<p class="text-center text-slate-400 mb-6 text-sm mt-2 uppercase tracking-widest">Sistema Ativo: {systemSchema.version}</p>
<form id="dynamic-char-form" class="relative z-10" onSubmit={handleSubmit}>
<div class="mb-8">
<label class="text-accent font-bold mb-2 block text-sm tracking-widest uppercase">NOME DA LENDA</label>
<input
type="text"
class="legacy-input bg-black/50 text-white border border-accent/30 rounded-lg p-3 w-full text-lg outline-none focus:border-accent shadow-inner transition-colors"
value={name}
onInput={(e) => setName(e.target.value)}
placeholder="Ex: Gandalf, O Cinzento..."
required
/>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
{}
<div class="flex flex-col">
<h3 class="text-accent border-b border-accent/30 pb-2 font-cinzel text-lg flex items-center gap-2"><i class="fa-solid fa-dna"></i> Atributos Base</h3>
<div class="grid gap-3 mt-4">
{Object.entries(systemSchema.attributes || {}).map(([key, attr]) => (
<div key={key} class="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
<label class="rollable-attr font-bold text-sm cursor-pointer text-accent border-b border-dashed border-accent hover:text-white" onClick={() => rollAttribute(key)} title={`Rolar teste de ${attr.label}`}><i class="fa-solid fa-dice-d20"></i> {attr.label}</label>
<input
type={attr.type}
value={attributes[key]}
onInput={(e) => setAttributes(prev => ({ ...prev, [key]: Number(e.target.value) }))}
class="w-16 text-center bg-black/60 text-white border border-accent/50 rounded-md p-1 outline-none focus:border-accent"
/>
</div>
))}
</div>
</div>
{}
<div class="flex flex-col">
<h3 class="text-accent border-b border-accent/30 pb-2 font-cinzel text-lg flex items-center gap-2"><i class="fa-solid fa-heart-pulse"></i> Recursos Vitais</h3>
<div class="grid gap-3 mt-4">
{Object.entries(systemSchema.resources || {}).map(([key, res]) => (
<div key={key} class="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
<label class="capitalize font-bold text-sm text-slate-200">{key.replace('_', ' ')}</label>
<input
type={res.type}
value={resources[key]}
onInput={(e) => setResources(prev => ({ ...prev, [key]: Number(e.target.value) }))}
class="w-16 text-center bg-black/60 text-white border border-red-500/50 rounded-md p-1 outline-none focus:border-red-500"
/>
</div>
))}
</div>
</div>
</div>
<div class="bg-accent/5 p-4 rounded-xl border border-dashed border-accent/30 text-center mb-8">
<span class="block text-sm text-slate-400 mb-3 font-bold uppercase tracking-widest">Atalhos Multissistema</span>
<button type="button" onClick={applyTankTemplate} class="btn btn-ghost border border-accent text-accent hover:bg-accent hover:text-black font-bold py-1.5 px-4 text-sm rounded-lg transition-colors">Criar: Guerreiro Tank</button>
</div>
<button type="submit" class="btn btn-primary w-full p-4 text-lg font-cinzel tracking-[2px] shadow-[0_0_15px_rgba(197,160,89,0.4)]">
<i class="fa-solid fa-save mr-2"></i> SALVAR PERSONAGEM NO LIVRO
</button>
</form>
</div>
);
}