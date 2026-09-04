import { useState, useEffect, Suspense } from 'preact/compat';
import { lazy } from 'preact/compat';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { MatchHistoryService } from '../../services/MatchHistoryService.js';
import { PartyStatusHUD } from '../components/PartyStatusHUD.jsx';
import { ChatBox } from '../components/ChatBox.jsx';

// V23 Lazy Loading Nativo via Preact (Code Splitting Otimizado)
const lazyLoad = (importFunc) => lazy(async () => {
    try {
        const module = await importFunc();
        const Component = module.default || module[Object.keys(module)[0]];
        return { default: Component };
    } catch (err) {
        console.error('[Dashboard lazyLoad] Falha ao importar módulo:', err);
        return { 
            default: () => (
                <div class="p-8 text-center font-cinzel text-red-400 bg-black/40 rounded-2xl border border-red-500/30 m-6">
                    <i class="fa-solid fa-triangle-exclamation text-4xl mb-3 text-red-500"></i>
                    <h3 class="text-xl text-white">Erro ao carregar componente</h3>
                    <p class="font-mono text-xs text-slate-400 mt-2">{err.message}</p>
                </div>
            ) 
        };
    }
});

// Mapeamento 100% Funcional e Reativo de Módulos da V23
const MODULE_MAP = {
    'campaign': lazyLoad(() => import('../components/CampaignManager.jsx')),
    'dmtable': lazyLoad(() => import('../components/DMTable.jsx')),
    'dmshield': lazyLoad(() => import('../components/DMShield.jsx')),
    'worldbuilder': lazyLoad(() => import('../components/WorldBuilder.jsx')),
    'combat': lazyLoad(() => import('../components/combat/CombatTrackerV22.jsx')),
    'quest': lazyLoad(() => import('../components/QuestManager.jsx')),
    'chareditor': lazyLoad(() => import('../components/DynamicCharacterBuilder.jsx')),
    'character': lazyLoad(() => import('../components/DynamicCharacterBuilder.jsx')),
    'builder': lazyLoad(() => import('../components/forge/HeroForge.jsx')),
    'forge': lazyLoad(() => import('../components/forge/HeroForge.jsx')),
    'herohub': lazyLoad(() => import('../components/HeroHub.jsx')),
    'herosheet': lazyLoad(() => import('../components/hero/HeroSheetV22.jsx')),
    'cardgenerator': lazyLoad(() => import('../components/CardGenerator.jsx')),
    'bestiary': lazyLoad(() => import('./Bestiary.jsx')),
    'journal': lazyLoad(() => import('../components/SessionJournal.jsx')),
    'loot': lazyLoad(() => import('../components/LootGenerator.jsx')),
    'spellbook': lazyLoad(() => import('../components/SpellBook.jsx')),
    'npc': lazyLoad(() => import('../components/NPCHelper.jsx')),
    'settings': lazyLoad(() => import('../components/QuickReference.jsx')),
    'initiative': lazyLoad(() => import('../components/InitiativeMonitor.jsx')),
    'tomesinal': lazyLoad(() => import('../components/TomeSinalPanel.jsx')),
    'reference': lazyLoad(() => import('../../engine/ReferencePanel.jsx'))
};

function LoadingSpinner({ label = "Carregando..." }) {
    return (
        <div class="absolute inset-0 flex flex-col items-center justify-center text-accent p-8 font-cinzel bg-bgbase/90 backdrop-blur-sm z-10 animate-fadeIn">
            <i class="fa-solid fa-circle-notch fa-spin text-5xl mb-5 opacity-80 text-accent drop-shadow-[0_0_15px_var(--accent)]"></i>
            <h3 class="text-xl m-0 text-slate-300 font-bold tracking-wider">{label}</h3>
        </div>
    );
}

function DynamicModuleRenderer({ tab }) {
    const LazyComponent = MODULE_MAP[tab];
    if (!LazyComponent) {
        return (
            <div class="h-full flex flex-col items-center justify-center text-center text-accent p-8 font-cinzel bg-black/20">
                <i class="fa-solid fa-triangle-exclamation text-5xl mb-5 text-amber-500"></i>
                <h3 class="text-2xl m-0 text-white">Módulo em Desenvolvimento</h3>
                <p class="font-outfit text-slate-400 mt-3 max-w-[500px] leading-relaxed">
                    A interface para <strong>{tab}</strong> não foi encontrada ou está em transição.
                </p>
            </div>
        );
    }

    return (
        <Suspense fallback={<LoadingSpinner label={`Invocando ${tab.toUpperCase()}...`} />}>
            <LazyComponent />
        </Suspense>
    );
}

function HomePage() {
    const activeCombat = useStore('combatActive');
    const players = useStore('players') || [];
    const monsters = useStore('monsters') || [];
    const savedNPCs = useStore('savedNPCs') || [];
    const journalEntries = useStore('journalEntries') || [];
    const sessionNotes = useStore('sessionNotes');

    const combatColor = activeCombat ? 'var(--danger)' : 'var(--success)';
    const masterName = localStorage.getItem('DM_MASTER_NAME') || 'Mestre';
    const internalId = localStorage.getItem('DM_INTERNAL_ID') || 'DGH-MST-8F2A91';
    
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
    if (lastPlay && lastPlay.length > 150) lastPlay = lastPlay.substring(0, 147) + '...';

    const navigate = (tab) => TOME.store.update(s => s.activeTab = tab);

    return (
        <div class="legacy-sheet-container animate-fadeIn p-6 max-w-7xl mx-auto">
            {/* CABEÇALHO DO MESTRE */}
            <div class="bg-black/70 border border-accent/25 rounded-2xl px-8 py-5 mb-8 flex justify-between items-center flex-wrap gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent via-accent-bright to-red-800"></div>
                <div>
                    <h2 class="font-cinzel text-[1.4rem] m-0 tracking-widest text-white flex items-center gap-3">
                        <i class="fa-solid fa-dungeon text-accent"></i>
                        MESA DO MESTRE
                    </h2>
                    <div class="flex gap-5 mt-1.5 text-xs text-slate-400">
                        <span>Mestre: <strong class="text-accent">{masterName}</strong></span>
                        <span>ID: <strong class="text-white font-mono">{internalId}</strong></span>
                        <span>Campanha: <strong class="text-accent-bright">{sessionTitle}</strong></span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="btn btn-magic text-xs py-2 px-4 rounded-xl" onClick={() => navigate('campaign')}>
                        <i class="fa-solid fa-play"></i> Gerenciar Campanha
                    </button>
                </div>
            </div>

            {/* BARRA DE STATUS PREMIUM */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
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
                    <div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Heróis Ativos</div>
                    <div class="text-[1.6rem] font-extrabold text-white mt-1 font-cinzel relative z-10 drop-shadow-md group-hover:text-accent transition-colors">{players.length}</div>
                </div>

                <div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                    <div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Monstros no Bestiário</div>
                    <div class="text-[1.6rem] font-extrabold text-white mt-1 font-cinzel relative z-10 drop-shadow-md group-hover:text-red-400 transition-colors">{monsters.length}</div>
                </div>

                <div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-accent/30 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Registros do Diário</div>
                    <div class="text-[1.6rem] font-extrabold text-white mt-1 font-cinzel relative z-10 drop-shadow-md group-hover:text-blue-400 transition-colors">{journalEntries.length}</div>
                </div>
            </div>

            {/* PORTAL DE CONTINUIDADE */}
            <div class="bg-gradient-to-br from-black/85 to-[#050508]/95 border border-accent/35 rounded-2xl p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(197,160,89,0.03)] relative">
                <div class="font-cinzel text-[1.1rem] text-accent mb-4 tracking-widest border-b border-accent/15 pb-2.5 flex items-center justify-between">
                    <span>🔮 Portal de Continuidade Arcana</span>
                    <span class="text-xs text-slate-400 font-sans">Sessão #{sessionNum}</span>
                </div>
                <h3 class="font-cinzel text-[1.6rem] font-bold m-0 mb-3 text-white">Bem-vindo de volta, Mestre {masterName}.</h3>
                <p class="text-slate-300 text-sm leading-relaxed mb-6 font-outfit max-w-2xl">
                    {lastPlay}
                </p>
                <div class="flex gap-4 flex-wrap">
                    <button class="btn-magic text-sm py-3 px-6 rounded-xl" onClick={() => navigate('dmtable')}>
                        <i class="fa-solid fa-table-cells-large"></i> Abrir Mesa do Mestre
                    </button>
                    <button class="btn btn-ghost border-accent/40 text-accent hover:bg-accent/10 text-sm py-3 px-6 rounded-xl" onClick={() => navigate('combat')}>
                        <i class="fa-solid fa-crosshairs"></i> Arena de Combate
                    </button>
                </div>
            </div>

            {/* ATALHOS RÁPIDOS */}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                {[
                    { id: 'dmtable', icon: 'fa-table-cells-large', label: 'Mesa do Mestre' },
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

    useEffect(() => {
        MatchHistoryService.syncFromSessionList();
        MatchHistoryService.updateCurrent(TOME.store.state, TOME.persistence?.filename);

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
        return () => window.removeEventListener('storage', syncListener);
    }, []);

    return (
        <div class="w-full h-full relative flex flex-col overflow-hidden bg-bgbase">
            <div class="w-full flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'dashboard' || !activeTab 
                    ? <HomePage /> 
                    : <DynamicModuleRenderer tab={activeTab} />
                }
            </div>
            
            {/* Global Reactive HUD & Chat components */}
            <PartyStatusHUD />
            <ChatBox />
        </div>
    );
}