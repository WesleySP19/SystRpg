import { useState, useMemo, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { MonsterData } from '../../data/MonsterData.js';
import { Toast } from './Toast.js';
import { render } from 'preact';
export function EncounterGenerator() {
const storeState = useStore();
const [difficulty, setDifficulty] = useState('medium');
const [generatedMonsters, setGeneratedMonsters] = useState([]);
const containerRef = useRef(null);
const partyLevel = useMemo(() => {
const players = storeState?.players || [];
if (players.length === 0) return 1;
const totalLevel = players.reduce((sum, p) => sum + (parseInt(p.level) || 1), 0);
return Math.max(1, Math.round(totalLevel / players.length));
}, [storeState?.players]);
const generateEncounter = (diff) => {
let targetCR = partyLevel;
if (diff === 'easy') targetCR = Math.max(1, partyLevel - 1);
if (diff === 'hard') targetCR = partyLevel + 1;
if (diff === 'deadly') targetCR = partyLevel + 3;
targetCR = Math.min(20, targetCR);
const tierKey = `Nível ${targetCR}`;
const monsterPool = MonsterData[tierKey] || MonsterData['Nível 1'];
if (!monsterPool || monsterPool.length === 0) {
Toast.show('Nenhum monstro encontrado para esta dificuldade.', 'error');
return;
}
const partySize = Math.max(1, (storeState?.players || []).length);
const enemyCount = diff === 'deadly' ? 1 : Math.max(1, Math.floor(Math.random() * partySize) + 1);
const newMonsters = [];
for (let i = 0; i < enemyCount; i++) {
const randomMonster = monsterPool[Math.floor(Math.random() * monsterPool.length)];
newMonsters.push(structuredClone(randomMonster));
}
setGeneratedMonsters(newMonsters);
};
const handleDifficultyChange = (diff) => {
setDifficulty(diff);
generateEncounter(diff);
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
const dispatchEncounter = () => {
if (generatedMonsters.length === 0) return;
let spawnCount = 0;
generatedMonsters.forEach(m => {
const entity = {
id: 'gen-' + Date.now() + '-' + Math.random(),
name: m.name,
hp_max: m.hp,
hp: m.hp,
ac: m.ac || 10,
emoji: m.emoji || '👹',
size: m.size || 'medium',
speed: m.speed || '30 ft.',
type: m.type || 'monster',
img: m.img || ''
};
setTimeout(() => {
if (TOME && TOME.events) {
TOME.events.emit('MONSTER_INVOKED', entity);
}
}, spawnCount * 150);
spawnCount++;
});
setTimeout(() => close(), spawnCount * 150 + 200);
};
return (
<div ref={containerRef} class="fixed inset-0 bg-black/85 z-[99999] flex items-center justify-center backdrop-blur-md animate-fadeIn p-4">
<div class="card glass-accent w-full max-w-lg p-8 border border-accent/30 rounded-2xl max-h-[90vh] overflow-y-auto bg-black/95 shadow-[0_0_40px_rgba(197,160,89,0.15)] relative">
<div class="absolute -right-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-[80px] pointer-events-none"></div>
<div class="flex justify-between items-start border-b border-accent/20 pb-4 mb-6 relative z-10">
<div>
<h2 class="m-0 font-cinzel text-accent text-2xl flex items-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]">
<i class="fa-solid fa-wand-magic-sparkles"></i> Gerador de Encontros
</h2>
<span class="text-xs text-slate-400 uppercase tracking-widest font-bold mt-2 block">Nível Médio do Grupo: {partyLevel}</span>
</div>
<button class="btn btn-ghost w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white" onClick={close}>
<i class="fa-solid fa-times"></i>
</button>
</div>
<div class="flex gap-3 mb-8 relative z-10">
<button class={`btn ${difficulty === 'easy' ? 'btn-primary' : 'btn-ghost'} flex-1 text-sm py-2 rounded-lg font-bold transition-all`} onClick={() => handleDifficultyChange('easy')}>Fácil</button>
<button class={`btn ${difficulty === 'medium' ? 'btn-primary' : 'btn-ghost'} flex-1 text-sm py-2 rounded-lg font-bold transition-all`} onClick={() => handleDifficultyChange('medium')}>Médio</button>
<button class={`btn ${difficulty === 'hard' ? 'btn-primary' : 'btn-ghost'} flex-1 text-sm py-2 rounded-lg font-bold transition-all`} onClick={() => handleDifficultyChange('hard')}>Difícil</button>
<button class={`btn ${difficulty === 'deadly' ? 'bg-red-900/80 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500/50' : 'btn-ghost'} flex-1 text-sm py-2 rounded-lg font-bold transition-all`} onClick={() => handleDifficultyChange('deadly')}>Mortal</button>
</div>
{generatedMonsters.length > 0 ? (
<>
<div class="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 min-h-[150px] relative z-10 shadow-inner">
<h4 class="m-0 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Inimigos Sorteados:</h4>
<div class="flex flex-col gap-3">
{generatedMonsters.map(m => (
<div key={m.id || m.name + Math.random()} class="flex justify-between items-center bg-black/60 p-3 rounded-lg border-l-4 border-l-accent border-y border-r border-white/5 shadow-md hover:bg-black/80 transition-colors">
<div class="flex items-center gap-4">
<span class="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{m.emoji}</span>
<strong class="text-white text-lg font-cinzel">{m.name}</strong>
</div>
<div class="text-right">
<div class="text-xs text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded mb-1">HP {m.hp} | CA {m.ac}</div>
<div class="text-xs text-red-400 font-extrabold flex items-center justify-end gap-1"><i class="fa-solid fa-droplet"></i> {m.damage} dmg</div>
</div>
</div>
))}
</div>
</div>
<button class="btn btn-primary w-full p-4 text-lg font-cinzel tracking-[2px] shadow-[0_0_20px_rgba(197,160,89,0.3)] relative z-10" onClick={dispatchEncounter}>
<i class="fa-solid fa-swords mr-2"></i> INICIAR COMBATE
</button>
</>
) : (
<div class="text-center py-12 px-6 text-slate-400 relative z-10">
<i class="fa-solid fa-dice-d20 text-5xl opacity-20 mb-4"></i>
<p class="m-0 text-sm font-outfit">Selecione uma dificuldade acima para sortear os inimigos e preparar o campo de batalha.</p>
</div>
)}
</div>
</div>
);
}