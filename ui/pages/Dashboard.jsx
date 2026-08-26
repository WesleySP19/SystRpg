import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { MatchHistoryService } from '../../services/MatchHistoryService.js';
import { MainPanel } from '../components/MainPanel.jsx';
import { render } from 'preact';

const MODULE_MAP = {
    'campaign': { path: () => import('../components/CampaignManager.jsx'), cls: 'CampaignManager' },
    'dmtable': { path: () => import('../components/DMTable.jsx'), cls: 'DMTable' },
    'dmshield': { path: () => import('../components/DMShield.jsx'), cls: 'DMShield' },
    'worldbuilder': { path: () => import('../components/WorldBuilder.js'), cls: 'WorldBuilder' },
    'combat': { path: () => import('../components/combat/CombatTrackerV22.jsx'), cls: 'CombatTrackerV22' },
    'quest': { path: () => import('../components/QuestManager.jsx'), cls: 'QuestManager' },
    'chareditor': { path: () => import('../components/DynamicCharacterBuilder.js'), cls: 'DynamicCharacterBuilder' },
    'character': { path: () => import('../components/DynamicCharacterBuilder.js'), cls: 'DynamicCharacterBuilder' },
    'builder': { path: () => import('../components/PlayerForm.jsx'), cls: 'PlayerForm' },
    'herohub': { path: () => import('../components/HeroHub.js'), cls: 'HeroHub' },
    'herosheet': { path: () => import('../components/hero/HeroSheetV22.js'), cls: 'HeroSheetV22' },
    'cardgenerator': { path: () => import('../components/CardGenerator.js'), cls: 'CardGenerator' },
    'bestiary': { path: () => import('./Bestiary.js'), cls: 'Bestiary' },
    'journal': { path: () => import('../components/SessionJournal.js'), cls: 'SessionJournal' },
    'loot': { path: () => import('../components/LootGenerator.js'), cls: 'LootGenerator' },
    'spellbook': { path: () => import('../components/SpellBook.jsx'), cls: 'SpellBook' },
    'npc': { path: () => import('../components/NPCHelper.js'), cls: 'NPCHelper' },
    'settings': { path: () => import('../components/QuickReference.js'), cls: 'QuickReference' },
    'initiative': { path: () => import('../components/InitiativeMonitor.jsx'), cls: 'InitiativeMonitor' },
    'tomesinal': { path: () => import('../components/TomeSinalPanel.js'), cls: 'TomeSinalPanel' }
};

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

                const Cls = mod[entry.cls];
                // Check se já é um componente funcional Preact (não tem mount)
                if (typeof Cls === 'function' && !Cls.prototype?.mount) {
                    // É um componente funcional Preact, renderizamos nele
                    render(<Cls store={store} />, containerRef.current);
                } else {
                    // Componente Legacy
                    instanceRef.current = new Cls({ store, element: containerRef.current });
                    instanceRef.current.mount();
                }
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
                <button onClick={() => window.location.href='/index.html?reset=1'} class="btn btn-premium mt-6 px-6 py-3 text-sm font-extrabold rounded-xl border border-red-500">
                    <i class="fa-solid fa-broom"></i> Limpar Cache e Reiniciar App
                </button>
            </div>
        );
    }

    return (
        <div class="relative w-full h-full">
            {loading && (
                <div class="absolute inset-0 flex flex-col items-center justify-center text-accent p-8 font-cinzel bg-bgbase z-10 animate-fadeIn">
                    <i class="fa-solid fa-circle-notch fa-spin text-5xl mb-5 opacity-80"></i>
                    <h3 class="text-xl m-0 text-slate-400">Invocando {tab.toUpperCase()}...</h3>
                </div>
            )}
            <div ref={containerRef} class="w-full h-full"></div>
        </div>
    );
}

function HomePage() {
    const activeCombat = useStore('combatActive');
    const players = useStore('players') || [];
    const monsters = useStore('monsters') || [];
    const savedNPCs = useStore('savedNPCs') || [];
    const quests = useStore('quests') || [];
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

    // Montar o MainPanel (Legacy)
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

            {/* BLOCO SUPERIOR */}
            <div class="bg-black/70 border border-accent/25 rounded-2xl px-8 py-5 mb-8 flex justify-between items-center flex-wrap gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-red-800"></div>
                <div>
                    <h2 class="font-cinzel text-[1.4rem] m-0 tracking-widest text-white">[MESA DO MESTRE]</h2>
                    <div class="flex gap-5 mt-1.5 text-xs text-slate-400">
                        <span>Mestre: <strong class="text-accent">{masterName}</strong></span>
                        <span>ID: <strong class="text-white font-mono">{internalId}</strong></span>
                    </div>
                </div>
                <div class="flex items-center gap-2 bg-green-500/10 border border-green-500/25 px-3.5 py-1.5 rounded-full">
                    <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] inline-block animate-[pulse_1.5s_infinite]"></span>
                    <span class="text-[0.7rem] font-extrabold tracking-widest text-green-500 uppercase">Sincronizado</span>
                </div>
            </div>

            {/* BARRA DE STATUS PREMIUM */}
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
                <div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_#ef4444]"></div>
                    <div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Criaturas</div>
                    <div class="text-[1.6rem] font-extrabold text-white mt-1 font-cinzel relative z-10 drop-shadow-md group-hover:text-red-400 transition-colors">{monsters.length}</div>
                </div>
                <div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>
                    <div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">NPCs Salvos</div>
                    <div class="text-[1.6rem] font-extrabold text-white mt-1 font-cinzel relative z-10 drop-shadow-md group-hover:text-blue-400 transition-colors">{savedNPCs.length}</div>
                </div>
                <div class="card bg-black/40 backdrop-blur-md p-5 rounded-2xl text-center border border-white/5 shadow-xl relative overflow-hidden group hover:border-green-500/30 transition-all">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none"></div>
                    <div class="absolute top-0 left-0 w-full h-[2px] bg-green-500 shadow-[0_0_15px_#22c55e]"></div>
                    <div class="text-[0.65rem] text-slate-400/80 uppercase font-bold tracking-widest relative z-10">Data</div>
                    <div class="text-base font-extrabold text-white mt-3 font-cinzel relative z-10 group-hover:text-green-400 transition-colors">{new Date().toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            {/* PORTAL DE CONTINUIDADE */}
            <div class="bg-gradient-to-br from-black/85 to-[#050508]/95 border border-accent/35 rounded-2xl p-8 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(197,160,89,0.03)] relative">
                <div class="font-cinzel text-[1.1rem] text-accent mb-4 tracking-widest border-b border-accent/15 pb-2.5">
                    🔮 Portal de Continuidade Arcana
                </div>
                <h3 class="font-cinzel text-[1.8rem] font-bold m-0 mb-5 text-white">Bem-vindo de volta, Mestre {masterName}.</h3>
                
                <div class="grid grid-cols-1 gap-5 bg-black/30 border border-white/5 p-5 rounded-xl mb-6">
                    <div class="flex justify-between flex-wrap gap-4">
                        <div>
                            <span class="text-[0.65rem] text-slate-400 uppercase tracking-widest block mb-1">Última Sessão</span>
                            <span class="font-cinzel text-[1.1rem] font-extrabold text-accent">Sessão #{sessionNum}</span>
                        </div>
                        <div>
                            <span class="text-[0.65rem] text-slate-400 uppercase tracking-widest block mb-1">Mesa</span>
                            <span class="text-[1.1rem] font-bold text-white">{sessionTitle} (Mesa #{activeTableId})</span>
                        </div>
                    </div>
                    <div class="border-t border-dashed border-accent/20 pt-4 mt-1">
                        <span class="text-[0.65rem] text-accent uppercase tracking-widest block mb-1.5">Última Jogada (Resumo Narrativo)</span>
                        <p class="font-cinzel italic text-[0.95rem] leading-relaxed text-slate-300 m-0">"{lastPlay}"</p>
                    </div>
                </div>

                <div class="flex flex-col items-center gap-2">
                    <span class="text-[0.8rem] text-slate-400 font-semibold tracking-wide">Deseja continuar?</span>
                    <button class="btn-magic w-full max-w-[320px] text-base py-3.5 rounded-xl" onClick={() => navigate('campaign')}>
                        <i class="fa-solid fa-play"></i> Continuar Sessão
                    </button>
                </div>
            </div>

            {/* FERRAMENTAS PREMIUM */}
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
                {[
                    { id: 'dmshield', icon: 'fa-shield-halved', label: 'Escudo' },
                    { id: 'worldbuilder', icon: 'fa-earth-americas', label: 'Construtor' },
                    { id: 'herohub', icon: 'fa-users', label: 'Heróis' },
                    { id: 'chareditor', icon: 'fa-user-pen', label: 'Editor' },
                    { id: 'loot', icon: 'fa-coins', label: 'Loot', glow: true },
                    { id: 'spellbook', icon: 'fa-book-open', label: 'Grimório' },
                    { id: 'bestiary', icon: 'fa-dragon', label: 'Bestiário' }
                ].map(tool => (
                    <button class={`btn p-4 rounded-xl flex flex-col items-center justify-center gap-2 h-auto relative overflow-hidden group transition-all duration-300 ${tool.glow ? 'bg-accent/10 border-accent/50 hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(197,160,89,0.3)]' : 'bg-black/40 border-white/10 hover:border-accent/40 hover:bg-black/60'} backdrop-blur-sm border`} onClick={() => navigate(tool.id)} key={tool.id}>
                        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-accent/10 to-transparent transition-opacity"></div>
                        <i class={`fa-solid ${tool.icon} text-2xl ${tool.glow ? 'text-accent drop-shadow-[0_0_8px_var(--accent)]' : 'text-slate-300 group-hover:text-accent transition-colors'}`}></i>
                        <span class={`text-[0.75rem] font-bold tracking-wider uppercase mt-1 ${tool.glow ? 'text-accent' : 'text-slate-400 group-hover:text-white transition-colors'}`}>{tool.label}</span>
                    </button>
                ))}
            </div>

            {/* ORACLE & EXTRA */}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 flex flex-col gap-8">
                    <div class="card glass-accent p-6 border-l-4 border-accent shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h3 class="font-cinzel text-[1.1rem] m-0 text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]">🔮 Oráculo de Sessão</h3>
                                <p class="text-[0.7rem] text-slate-400 m-0 mt-1">Gere um gancho narrativo para iniciar sua sessão com impacto.</p>
                            </div>
                            <button class="btn btn-primary btn-sm" onClick={generateOracleHook}>
                                <i class="fa-solid fa-wand-sparkles"></i> Inspirar
                            </button>
                        </div>
                        <div class="font-cinzel text-[0.9rem] italic leading-relaxed text-slate-300 min-h-[40px] p-4 bg-black/30 rounded-lg border border-white/5">
                            {oracleHook ? oracleHook : <span class="opacity-40 text-slate-400">Clique em "Inspirar" para gerar um gancho narrativo...</span>}
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-8">
                    <div class="card glass-accent p-6 rounded-xl border-t-4 border-accent shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <h3 class="font-cinzel text-center mb-4 text-accent tracking-widest">MONITOR RÁPIDO</h3>
                        <button class="btn btn-primary w-full mt-2" onClick={() => navigate('combat')}>ACESSAR ARENA</button>
                    </div>
                </div>
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
                    : <LegacyComponentMount tab={activeTab} store={TOME.store} />
                }
            </div>
            <div ref={hudRef} id="hud-target"></div>
            <div ref={chatRef} id="chat-target"></div>
        </div>
    );
}