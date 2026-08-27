import { useState, useEffect, useRef, Suspense } from 'preact/compat';
import { lazy } from 'preact/compat';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { MatchHistoryService } from '../../services/MatchHistoryService.js';
import { MainPanel } from '../components/MainPanel.jsx';
const lazyLoad = (importFunc) => lazy(async () => {
const module = await importFunc();
const Component = module[Object.keys(module)[0]];
return { default: Component };
});
const MODULE_MAP = {
'campaign': { path: () => import('../components/CampaignManager.jsx'), type: 'legacy' },
'dmtable': { path: () => import('../components/DMTable.jsx'), type: 'legacy' },
'dmshield': { path: () => import('../components/DMShield.jsx'), type: 'legacy' },
'worldbuilder': { path: () => import('../components/WorldBuilder.js'), type: 'legacy' },
'combat': { path: () => import('../components/combat/CombatTrackerV22.jsx'), type: 'legacy' },
'quest': { path: () => import('../components/QuestManager.jsx'), type: 'legacy' },
'chareditor': { path: () => import('../components/DynamicCharacterBuilder.js'), type: 'legacy' },
'character': { path: () => import('../components/DynamicCharacterBuilder.js'), type: 'legacy' },
'builder': { path: () => import('../components/PlayerForm.jsx'), type: 'legacy' },
'herohub': { path: () => import('../components/HeroHub.js'), type: 'legacy' },
'herosheet': { path: () => import('../components/hero/HeroSheetV22.jsx'), type: 'functional', Component: lazyLoad(() => import('../components/hero/HeroSheetV22.jsx')) },
'cardgenerator': { path: () => import('../components/CardGenerator.js'), type: 'legacy' },
'bestiary': { path: () => import('./Bestiary.jsx'), type: 'functional', Component: lazyLoad(() => import('./Bestiary.jsx')) },
'journal': { path: () => import('../components/SessionJournal.js'), type: 'functional', Component: lazyLoad(() => import('../components/SessionJournal.js')) },
'loot': { path: () => import('../components/LootGenerator.js'), type: 'legacy' },
'spellbook': { path: () => import('../components/SpellBook.jsx'), type: 'legacy' },
'npc': { path: () => import('../components/NPCHelper.js'), type: 'legacy' },
'settings': { path: () => import('../components/QuickReference.js'), type: 'functional', Component: lazyLoad(() => import('../components/QuickReference.js')) },
'initiative': { path: () => import('../components/InitiativeMonitor.jsx'), type: 'functional', Component: lazyLoad(() => import('../components/InitiativeMonitor.jsx')) },
'tomesinal': { path: () => import('../components/TomeSinalPanel.js'), type: 'legacy' }
};
function LoadingSpinner({ label = "Carregando..." }) {
return (
<div class="absolute inset-0 flex flex-col items-center justify-center text-accent p-8 font-cinzel bg-bgbase z-10 animate-fadeIn">
<i class="fa-solid fa-circle-notch fa-spin text-5xl mb-5 opacity-80"></i>
<h3 class="text-xl m-0 text-slate-400">{label}</h3>
</div>
);
}
function LegacyComponentMount({ tab, store }) {
const containerRef = useRef(null);
const instanceRef = useRef(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
let isCancelled = false;
async function loadModule() {
setLoading(true);
setError(null);
if (instanceRef.current) {
try { instanceRef.current.unmount(); } catch (e) {}
instanceRef.current = null;
}
if (containerRef.current) containerRef.current.innerHTML = '';
const entry = MODULE_MAP[tab];
if (!entry) {
setError(`Módulo ${tab} não encontrado.`);
setLoading(false);
return;
}
try {
const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout carregando módulo')), 8000));
const mod = await Promise.race([entry.path(), timeoutPromise]);
if (isCancelled) return;
const Cls = mod[Object.keys(mod)[0]];
instanceRef.current = new Cls({ store, element: containerRef.current });
instanceRef.current.mount();
setLoading(false);
} catch (err) {
if (!isCancelled) {
console.error('[Dashboard] Erro ao carregar módulo:', err);
setError(err.message || String(err));
setLoading(false);
}
}
}
loadModule();
return () => {
isCancelled = true;
if (instanceRef.current) {
try { instanceRef.current.unmount(); } catch (e) {}
instanceRef.current = null;
}
};
}, [tab]);
if (error) {
return (
<div class="h-full flex flex-col items-center justify-center text-center text-accent p-8 font-cinzel bg-black/20">
<i class="fa-solid fa-triangle-exclamation text-5xl mb-5 text-red-500"></i>
<h3 class="text-2xl m-0 text-white">Falha ao Carregar o Módulo</h3>
<p class="font-outfit text-slate-400 mt-3 max-w-[500px] leading-relaxed">
Ocorreu um erro interno ao tentar processar a interface <strong>{tab}</strong>.
</p>
<div class="mt-4 p-3 bg-black/50 border-l-4 border-red-500 text-left w-full max-w-[600px] font-mono text-xs text-red-300 overflow-x-auto">
{error}
</div>
</div>
);
}
return (
<div class="relative w-full h-full">
{loading && <LoadingSpinner label={`Invocando ${tab.toUpperCase()}...`} />}
<div ref={containerRef} class="w-full h-full"></div>
</div>
);
}
function DynamicModuleRenderer({ tab }) {
const entry = MODULE_MAP[tab];
if (!entry) return null;
if (entry.type === 'functional') {
const LazyComp = entry.Component;
return (
<Suspense fallback={<LoadingSpinner label={`Invocando ${tab.toUpperCase()}...`} />}>
<LazyComp />
</Suspense>
);
} else {
return <LegacyComponentMount tab={tab} store={TOME.store} />;
}
}
function HomePage() {
const activeCombat = useStore('combatActive');
const players = useStore('players') || [];
const monsters = useStore('monsters') || [];
const savedNPCs = useStore('savedNPCs') || [];
const journalEntries = useStore('journalEntries') || [];
const sessionNotes = useStore('sessionNotes');
const oracleHook = useStore('_oracleHook');
const combatColor = activeCombat ? 'var(--danger)' : 'var(--success)';
const masterName = localStorage.getItem('DM_MASTER_NAME') || 'Mestre';
const internalId = localStorage.getItem('DM_INTERNAL_ID') || 'DGH-MST-8F2A91';
const activeTableId = localStorage.getItem('DM_ACTIVE_TABLE') || 'Sem Mesa';
const sessionTitle = useStore('sessionTitle') || 'A Chama de Aelthorion';
const sessionNum = journalEntries.length > 0 ? journalEntries.length + 1 : 1;
let lastPlay = "Os jogadores se preparam para desbravar perigos desconhecidos.";
if (journalEntries && journalEntries.length > 0) {
const lastEntry = [...journalEntries].reverse().find(e => e.type !== 'info' && e.content);
if (lastEntry) lastPlay = lastEntry.content;
else lastPlay = journalEntries[journalEntries.length - 1].content;
} else if (sessionNotes) {
lastPlay = sessionNotes.split('.').filter(Boolean)[0] + '.';
}
if (lastPlay.length > 150) lastPlay = lastPlay.substring(0, 147) + '...';
const navigate = (tab) => TOME.store.update(s => s.activeTab = tab);
const generateOracleHook = async () => {
if (!TOME.ai) return;
TOME.store.update(s => s._oracleHook = 'Pensando...');
try {
const hook = await TOME.ai.generateHook();
TOME.store.update(s => s._oracleHook = hook);
} catch(e) {
TOME.store.update(s => s._oracleHook = 'O Oráculo está em silêncio.');
}
};
const mainPanelRef = useRef(null);
useEffect(() => {
if (mainPanelRef.current) {
const panel = new MainPanel({ store: TOME.store, element: mainPanelRef.current });
panel.mount();
return () => panel.unmount();
}
}, []);
return (
<div class="legacy-sheet-container animate-fadeIn">
<div ref={mainPanelRef} id="main-panel"></div>
<div class="bg-black/70 border border-accent/25 rounded-2xl px-8 py-5 mb-8 flex justify-between items-center flex-wrap gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-red-800"></div>
<div>
<h2 class="font-cinzel text-[1.4rem] m-0 tracking-widest text-white">[MESA DO MESTRE]</h2>
<div class="flex gap-5 mt-1.5 text-xs text-slate-400">
<span>Mestre: <strong class="text-accent">{masterName}</strong></span>
<span>ID: <strong class="text-white font-mono">{internalId}</strong></span>
</div>
</div>
</div>
{}
<div class="grid grid-cols-2 md:grid-cols-5 gap-5 mb-10">
<div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all">
<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
<div class="absolute top-0 left-0 w-full h-[2px]" style={{backgroundColor: combatColor, boxShadow: `0 0 15px ${combatColor}`}}></div>
<div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Status da Sessão</div>
<div class="text-[1.1rem] font-extrabold mt-2 font-cinzel relative z-10 transition-transform group-hover:scale-105" style={{color: combatColor, textShadow: `0 0 10px ${combatColor}`}}>
{activeCombat ? '⚔️ EM COMBATE' : '📜 EXPLORAÇÃO'}
</div>
</div>
<div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all">
<div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
<div class="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_15px_var(--accent)]"></div>
<div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Heróis</div>
<div class="text-[1.6rem] font-extrabold text-white mt-1 font-cinzel relative z-10 drop-shadow-md group-hover:text-accent transition-colors">{players.length}</div>
</div>
</div>
{}
<div class="bg-gradient-to-br from-black/85 to-[#050508]/95 border border-accent/35 rounded-2xl p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(197,160,89,0.03)] relative">
<div class="font-cinzel text-[1.1rem] text-accent mb-4 tracking-widest border-b border-accent/15 pb-2.5">
🔮 Portal de Continuidade Arcana
</div>
<h3 class="font-cinzel text-[1.8rem] font-bold m-0 mb-5 text-white">Bem-vindo de volta, Mestre {masterName}.</h3>
<div class="flex flex-col items-center gap-2">
<span class="text-[0.8rem] text-slate-400 font-semibold tracking-wide">Deseja continuar?</span>
<button class="btn-magic w-full max-w-[320px] text-base py-3.5 rounded-xl" onClick={() => navigate('campaign')}>
<i class="fa-solid fa-play"></i> Continuar Sessão
</button>
</div>
</div>
{}
<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
{[
{ id: 'dmshield', icon: 'fa-shield-halved', label: 'Escudo' },
{ id: 'worldbuilder', icon: 'fa-earth-americas', label: 'Construtor' },
{ id: 'herohub', icon: 'fa-users', label: 'Heróis' },
{ id: 'loot', icon: 'fa-coins', label: 'Loot', glow: true },
{ id: 'bestiary', icon: 'fa-dragon', label: 'Bestiário' }
].map(tool => (
<button class={`btn p-4 rounded-xl flex flex-col items-center justify-center gap-2 h-auto relative overflow-hidden group transition-all duration-300 ${tool.glow ? 'bg-accent/10 border-accent/50 hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'bg-black/40 border-white/10 hover:border-accent/40 hover:bg-black/60'} backdrop-blur-sm border`} onClick={() => navigate(tool.id)} key={tool.id}>
<i class={`fa-solid ${tool.icon} text-2xl ${tool.glow ? 'text-accent drop-shadow-[0_0_8px_var(--accent)]' : 'text-slate-300 group-hover:text-accent transition-colors'}`}></i>
<span class={`text-[0.75rem] font-bold tracking-wider uppercase mt-1 ${tool.glow ? 'text-accent' : 'text-slate-400 group-hover:text-white transition-colors'}`}>{tool.label}</span>
</button>
))}
</div>
</div>
);
}
export function Dashboard() {
const activeTab = useStore('activeTab');
const hudRef = useRef(null);
const chatRef = useRef(null);
useEffect(() => {
MatchHistoryService.syncFromSessionList();
MatchHistoryService.updateCurrent(TOME.store.state, TOME.persistence?.filename);
let hud, chat;
import('../components/PartyStatusHUD.js').then(({ PartyStatusHUD }) => {
if (hudRef.current) {
hud = new PartyStatusHUD({ store: TOME.store, element: hudRef.current });
hud.mount();
}
});
import('../components/ChatBox.js').then(({ ChatBox }) => {
if (chatRef.current) {
chat = new ChatBox({ store: TOME.store, element: chatRef.current });
chat.mount();
}
});
const syncListener = (e) => {
const activeSession = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
if (e.key === `TOME_PRO_STATE_${activeSession}`) {
try {
const state = JSON.parse(e.newValue);
TOME.store.update(s => {
s.players = state.players;
s.monsters = state.monsters;
s.initiativeOrder = state.initiativeOrder;
s.combatRound = state.combatRound;
s.combatActive = state.combatActive;
});
} catch (err) {}
}
};
window.addEventListener('storage', syncListener);
return () => {
if (hud) hud.unmount();
if (chat) chat.unmount();
window.removeEventListener('storage', syncListener);
};
}, []);
return (
<div class="w-full h-full relative">
<div class="w-full h-full overflow-y-auto custom-scrollbar">
{activeTab === 'dashboard' || !activeTab
? <HomePage />
: <DynamicModuleRenderer tab={activeTab} />
}
</div>
<div ref={hudRef} id="hud-target"></div>
<div ref={chatRef} id="chat-target"></div>
</div>
);
}