import { h, Fragment } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { TOME } from '../../core/Registry.js';
import { Dice } from '../../utils/Dice.js';
import { Toast } from '../components/Toast.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { FXEngine } from '../../services/FXEngine.js';

const CONDITIONS = {
    'abalado':       { emoji: '😰', label: 'Abalado' },
    'amedrontado':   { emoji: '😨', label: 'Amedrontado' },
    'agarrado':      { emoji: '🤝', label: 'Agarrado' },
    'atordoado':     { emoji: '💫', label: 'Atordoado' },
    'cego':          { emoji: '🙈', label: 'Cego' },
    'caído':         { emoji: '🤕', label: 'Caído' },
    'enfeitiçado':   { emoji: '💜', label: 'Enfeitiçado' },
    'envenenado':    { emoji: '🤢', label: 'Envenenado' },
    'exausto':       { emoji: '😫', label: 'Exausto' },
    'incapacitado':  { emoji: '😵', label: 'Incapacitado' },
    'invisível':     { emoji: '👻', label: 'Invisível' },
    'paralisado':    { emoji: '🧊', label: 'Paralisado' },
    'petrificado':   { emoji: '🗿', label: 'Petrificado' },
    'preso':         { emoji: '🕸️', label: 'Preso' },
    'amaldiçoado':   { emoji: '🧿', label: 'Amaldiçoado' },
    'surdo':         { emoji: '🔇', label: 'Surdo' },
};

export function InitiativeMonitor({ store }) {
    const state = store.state;
    const { combatActive, combatRound, initiativeOrder = [], initiativeIndex = 0 } = state;
    
    const [economy, setEconomy] = useState({ action: true, bonus: true, reaction: true, movement: 30 });
    const [quickAdd, setQuickAdd] = useState({ name: '', init: '', hp: '', type: 'Enemy' });
    const [selectedCond, setSelectedCond] = useState('envenenado');
    const [focusId, setFocusId] = useState(null);
    const [announce, setAnnounce] = useState({ show: false, text: '' });
    const [dmgInput, setDmgInput] = useState('');
    const broadcastRef = useRef(null);

    // Helper functions (same as class)
    const getOrder = () => {
        return (initiativeOrder || []).map(c => {
            const hp = RulesEngine.getHP(c);
            return { ...c, _hpCurrent: hp.current, _hpMax: hp.max };
        });
    };

    const order = getOrder();
    const current = order[initiativeIndex];
    const focused = focusId ? (order.find(c => c.id === focusId) || current) : current;
    const isEmpty = !combatActive || order.length === 0;

    const hpColor = (current, max) => {
        if (max <= 0) return 'text-gray-500';
        const pct = current / max;
        if (pct > 0.5) return 'text-green-400';
        if (pct > 0.2) return 'text-yellow-400';
        return 'text-red-400';
    };

    const hpPct = (current, max) => {
        if (max <= 0) return 0;
        return Math.min(100, Math.max(0, Math.round((current / max) * 100)));
    };

    const hpColorHex = (current, max) => {
        if (max <= 0) return '#6b7280'; // gray-500
        const pct = current / max;
        if (pct > 0.5) return '#4ade80'; // green-400
        if (pct > 0.2) return '#facc15'; // yellow-400
        return '#f87171'; // red-400
    };

    const broadcastState = () => {
        try {
            broadcastRef.current?.postMessage({
                type: 'COMBAT_UPDATE',
                state: {
                    combatActive: store.state.combatActive,
                    combatRound: store.state.combatRound,
                    initiativeOrder: store.state.initiativeOrder,
                    initiativeIndex: store.state.initiativeIndex || 0,
                }
            });
        } catch (e) { /* silent */ }
    };

    useEffect(() => {
        if (!broadcastRef.current) {
            broadcastRef.current = new BroadcastChannel('tome_map');
        }

        const handleSummon = (entity) => {
            let initRoll = Dice.roll(20).total;
            const combatant = {
                id: entity.id || 'm-' + Date.now(),
                name: entity.name,
                initiative: initRoll,
                hp: { current: entity.hp_max, max: entity.hp_max },
                ac: entity.ac || 10,
                type: entity.type || 'Enemy',
                emoji: entity.emoji || '👹',
                img: entity.img || '',
                conditions: []
            };
            
            store.update(s => {
                if (!s.initiativeOrder) s.initiativeOrder = [];
                s.initiativeOrder.push(combatant);
                if (s.combatActive) {
                     s.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
                }
            });
            
            Toast.show(`🧙 Invocação: ${entity.name} (Iniciativa: ${initRoll})`, 'success');
        };

        TOME.events.on('MONSTER_INVOKED', handleSummon);

        return () => {
            if (broadcastRef.current) {
                broadcastRef.current.close();
            }
            TOME.events.off('MONSTER_INVOKED', handleSummon);
        };
    }, [store]);

    useEffect(() => {
        if (announce.show) {
            const timer = setTimeout(() => setAnnounce({ show: false, text: '' }), 2000);
            return () => clearTimeout(timer);
        }
    }, [announce.show]);

    // Actions
    const nextTurn = () => {
        if (!order.length) return;
        let idx = (initiativeIndex || 0) + 1;
        let newRound = combatRound || 1;
        let isNewRound = false;

        if (idx >= order.length) {
            idx = 0;
            newRound++;
            isNewRound = true;
        }

        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
        setFocusId(null);

        const nextActor = order[idx];
        if (nextActor) {
            setAnnounce({
                show: true,
                text: isNewRound ? `⚔️ RODADA ${newRound} — Vez de ${nextActor.name}` : `Vez de ${nextActor.name}`
            });
        }

        store.update(s => {
            s.initiativeIndex = idx;
            if (isNewRound) s.combatRound = newRound;
            if (s.initiativeOrder) {
                s.initiativeOrder = s.initiativeOrder.map((c, i) => ({
                    ...c,
                    isCurrentTurn: i === idx
                }));
            }
        });

        broadcastState();
        Toast.show(`⚔️ Vez de ${nextActor?.name}${isNewRound ? ` · Rodada ${newRound}` : ''}`, 'info');
    };

    const startCombat = () => {
        const { players, monsters } = state;
        const allCombatants = [
            ...(players || []).map(p => ({
                ...p,
                type: 'Player',
                init: Dice.quick(20) + Math.floor(((p.stats?.dex || 10) - 10) / 2),
                conditions: p.conditions || [],
                isCurrentTurn: false,
            })),
            ...(monsters || []).map(m => ({
                ...m,
                type: 'Monster',
                init: Dice.quick(20) + Math.floor(((m.stats?.dex || 10) - 10) / 2),
                conditions: m.conditions || [],
                isCurrentTurn: false,
            }))
        ];

        if (!allCombatants.length) {
            Toast.show('Adicione heróis ou monstros antes de iniciar o combate.', 'warning');
            return;
        }

        allCombatants.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
        if (allCombatants.length > 0) allCombatants[0].isCurrentTurn = true;

        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
        setFocusId(null);
        setAnnounce({ show: true, text: `⚔️ RODADA 1 — Vez de ${allCombatants[0]?.name}` });

        store.update(s => {
            s.initiativeOrder = allCombatants;
            s.initiativeIndex = 0;
            s.combatRound = 1;
            s.combatActive = true;
        });

        broadcastState();
        Toast.show('⚔️ Combate iniciado! Iniciativa rolada automaticamente.', 'success');
    };

    const rollAllInitiative = () => {
        store.update(s => {
            if (!s.initiativeOrder?.length) return;
            s.initiativeOrder = s.initiativeOrder.map(c => ({
                ...c,
                init: Dice.quick(20) + Math.floor(((c.stats?.dex || 10) - 10) / 2),
            })).sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
            s.initiativeIndex = 0;
            s.combatRound = 1;
        });
        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
        Toast.show('🎲 Iniciativa rerolada!', 'info');
    };

    const endCombat = () => {
        store.update(s => {
            s.combatActive = false;
            s.initiativeOrder = [];
            s.initiativeIndex = 0;
            s.combatRound = 0;
        });
        broadcastState();
        Toast.show('🏁 Combate encerrado.', 'info');
    };

    const applyDamage = () => {
        if (!focused) return;
        const val = parseInt(dmgInput || '0', 10);
        if (isNaN(val) || val <= 0) {
            Toast.show('Insira um valor de dano válido.', 'warning');
            return;
        }

        let killedNow = false;
        let actorType = 'Enemy';
        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (!actor) return;
            actorType = actor.type || 'Enemy';
            const oldHp = RulesEngine.getHP(actor).current;

            if ('hp_current' in actor) {
                actor.hp_current = Math.max(0, (actor.hp_current ?? actor.hp_max) - val);
                if (actor.hp_current === 0 && oldHp > 0) killedNow = true;
            } else if (actor._tempHP !== undefined) {
                const tempDmg = Math.min(actor._tempHP || 0, val);
                actor._tempHP = (actor._tempHP || 0) - tempDmg;
                const remaining = val - tempDmg;
                if (actor.combat) {
                    actor.combat.hp_current = Math.max(0, (actor.combat.hp_current ?? 0) - remaining);
                    if (actor.combat.hp_current === 0 && oldHp > 0) killedNow = true;
                }
            } else if (actor.combat) {
                actor.combat.hp_current = Math.max(0, (actor.combat.hp_current ?? actor.combat.hp_max ?? 10) - val);
                if (actor.combat.hp_current === 0 && oldHp > 0) killedNow = true;
            }
        });

        broadcastState();
        Toast.show(`💥 ${val} de dano aplicado a ${focused.name}`, 'danger');
        setDmgInput('');

        if (killedNow) {
            if (actorType === 'Player' || focused.type === 'Player') {
                FXEngine.trigger('HERO_FALLEN', focused.name, focused.id);
            } else {
                FXEngine.trigger('ENTITY_SLAIN', focused.name, focused.id);
            }
        }
    };

    const applyHeal = () => {
        if (!focused) return;
        const val = parseInt(dmgInput || '0', 10);
        if (isNaN(val) || val <= 0) {
            Toast.show('Insira um valor de cura válido.', 'warning');
            return;
        }

        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (!actor) return;
            if ('hp_current' in actor) {
                actor.hp_current = Math.min(actor.hp_max ?? 999, (actor.hp_current ?? 0) + val);
            } else if (actor.combat) {
                actor.combat.hp_current = Math.min(actor.combat.hp_max ?? 999, (actor.combat.hp_current ?? 0) + val);
            }
        });

        broadcastState();
        Toast.show(`💚 ${val} HP restaurados para ${focused.name}`, 'success');
        setDmgInput('');
    };

    const applyCondition = () => {
        if (!focused) return;
        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (!actor) return;
            if (!actor.conditions) actor.conditions = [];
            if (!actor.conditions.includes(selectedCond)) {
                actor.conditions.push(selectedCond);
            }
        });
        const info = CONDITIONS[selectedCond] || { emoji: '⚠️', label: selectedCond };
        Toast.show(`${info.emoji} ${info.label} aplicado a ${focused.name}`, 'warning');
    };

    const removeConditionFromActive = (cond) => {
        if (!current) return;
        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === current.id);
            if (actor?.conditions) {
                actor.conditions = actor.conditions.filter(c => c !== cond);
            }
        });
    };

    const clearConditions = () => {
        if (!focused) return;
        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (actor) actor.conditions = [];
        });
        Toast.show(`✅ Condições limpas de ${focused.name}`, 'success');
    };

    const moveUp = (e, id) => {
        e.stopPropagation();
        store.update(s => {
            const arr = s.initiativeOrder || [];
            const i = arr.findIndex(c => c.id === id);
            if (i > 0) {
                [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
            }
        });
    };

    const moveDown = (e, id) => {
        e.stopPropagation();
        store.update(s => {
            const arr = s.initiativeOrder || [];
            const i = arr.findIndex(c => c.id === id);
            if (i < arr.length - 1) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
            }
        });
    };

    const removeCombatant = (e, id) => {
        e.stopPropagation();
        store.update(s => {
            s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id);
            if (s.initiativeIndex >= s.initiativeOrder.length) {
                s.initiativeIndex = Math.max(0, s.initiativeOrder.length - 1);
            }
        });
        if (focusId === id) setFocusId(null);
    };

    const quickAddCombatant = (type) => {
        const name = quickAdd.name.trim();
        const init = parseInt(quickAdd.init || '0', 10) || Dice.quick(20);
        const hp = parseInt(quickAdd.hp || '10', 10) || 10;

        if (!name) {
            Toast.show('Insira um nome para o combatente.', 'warning');
            return;
        }

        const newCombatant = {
            id: `qc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
            name, type, init, ac: 10, hp_current: hp, hp_max: hp, conditions: [], isCurrentTurn: false
        };

        store.update(s => {
            if (!s.initiativeOrder) s.initiativeOrder = [];
            s.initiativeOrder.push(newCombatant);
            s.initiativeOrder.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
            if (!s.combatActive) {
                s.combatActive = true;
                s.combatRound = s.combatRound || 1;
                s.initiativeIndex = 0;
            }
        });

        broadcastState();
        setQuickAdd({ name: '', init: '', hp: '', type: 'Enemy' });
        Toast.show(`➕ ${name} adicionado como ${type === 'Player' ? 'Herói' : 'Inimigo'}`, 'success');
    };

    return (
        <div className="h-full relative flex flex-col bg-obsidian-900 overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/40">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black text-gray-200 tracking-wider flex items-center">
                        <i className="fa-solid fa-swords text-red-500 mr-2 text-lg"></i> ORDEM DE BATALHA
                    </h2>
                    {combatActive ? (
                        <span className="bg-red-900/30 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            ⚔️ RODADA {combatRound || 1}
                        </span>
                    ) : (
                        <span className="bg-gray-800/50 text-gray-400 border border-gray-600/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            COMBATE INATIVO
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    {combatActive ? (
                        <>
                            <button className="btn btn-ghost px-3 py-1.5 text-[0.7rem] hover:bg-white/5 text-gray-300 transition-colors rounded-lg" onClick={rollAllInitiative} title="Rerolar Iniciativa">
                                <i className="fa-solid fa-dice-d20"></i> Rolar Tudo
                            </button>
                            <button className="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white font-cinzel font-bold px-4 py-1.5 text-xs rounded-lg transition-colors" onClick={nextTurn}>
                                PRÓXIMO <i className="fa-solid fa-chevron-right ml-1"></i>
                            </button>
                            <button className="btn btn-ghost text-red-400 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 text-[0.7rem] rounded-lg transition-colors" onClick={endCombat} title="Encerrar Combate">
                                <i className="fa-solid fa-flag-checkered"></i>
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary bg-tomeGold hover:bg-yellow-500 text-black font-cinzel font-bold px-5 py-2 text-xs rounded-lg tracking-wider transition-colors" onClick={startCombat}>
                            <i className="fa-solid fa-dice-d20 mr-1.5"></i> INICIAR COMBATE
                        </button>
                    )}
                </div>
            </div>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center flex-1 opacity-60 text-center p-8">
                    <div className="text-4xl mb-4">⚔️</div>
                    <div className="text-xl font-cinzel text-tomeGold mb-2">Arena Silenciosa</div>
                    <p className="text-sm text-gray-400 max-w-sm mb-6">
                        {(state.players?.length || 0) + (state.monsters?.length || 0) > 0 
                            ? 'Clique em "Iniciar Combate" para rolar iniciativa automática.' 
                            : 'Adicione heróis e monstros à campanha, depois inicie o combate.'}
                    </p>
                    {((state.players?.length || 0) + (state.monsters?.length || 0)) > 0 ? (
                        <button className="bg-tomeGold text-black font-cinzel font-bold px-6 py-2.5 rounded-lg text-sm transition-all hover:bg-yellow-500" onClick={startCombat}>
                            <i className="fa-solid fa-dice-d20 mr-2"></i> INICIAR COMBATE
                        </button>
                    ) : (
                        <button className="text-tomeGold text-sm hover:underline" onClick={() => store.update(s => s.activeTab = 'campaign')}>
                            Ir para Campanha →
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                    
                    {/* SPOTLIGHT */}
                    {current ? (
                        <div className="relative rounded-xl border border-tomeGold/30 bg-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden flex flex-col md:flex-row gap-6 p-5">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${current.type !== 'Player' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]'}`}></div>
                            
                            <div className={`w-20 h-20 rounded-full border-[3px] shrink-0 flex items-center justify-center font-cinzel text-2xl font-black bg-black/50 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-cover bg-center ${current.type !== 'Player' ? 'border-red-500' : 'border-green-500'}`} 
                                 style={{ backgroundImage: current.img || current.portraitData || (current.type !== 'Player' ? `url('${MonsterArt.getImage(current)}')` : '') ? `url('${current.img || current.portraitData || MonsterArt.getImage(current)}')` : 'none' }}>
                                {!(current.img || current.portraitData || (current.type !== 'Player' ? MonsterArt.getImage(current) : '')) && current.name.substring(0,2).toUpperCase()}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                                <div className="text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2">
                                    {current.type !== 'Player' 
                                        ? <span className="text-red-400"><i className="fa-solid fa-skull"></i> INIMIGO</span> 
                                        : <span className="text-green-400"><i className="fa-solid fa-shield-halved"></i> HERÓI</span>}
                                    <span className="text-white/20">|</span>
                                    <span className="text-tomeGold">TURNO {initiativeIndex + 1}</span>
                                </div>
                                <div className="font-cinzel text-3xl font-black text-white truncate drop-shadow-md leading-none mb-1">
                                    {current.name}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-6 mt-1">
                                    <div className="min-w-[180px]">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[0.6rem] uppercase font-black text-gray-400 tracking-wider">Pontos de Vida</span>
                                            <span className={`text-xl font-black drop-shadow-md ${hpColor(current._hpCurrent, current._hpMax)}`}>
                                                {current._hpCurrent} <span className="text-sm font-bold opacity-50">/ {current._hpMax}</span>
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-black/70 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full transition-all duration-500 shadow-[0_0_10px]" 
                                                 style={{ width: `${hpPct(current._hpCurrent, current._hpMax)}%`, backgroundColor: hpColorHex(current._hpCurrent, current._hpMax) }}></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 text-xs font-bold bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-gray-300">
                                        <span><i className="fa-solid fa-bolt text-tomeGold mr-1"></i> Inic: <span className="text-white">{current.init ?? 0}</span></span>
                                        <span><i className="fa-solid fa-shield text-gray-400 mr-1"></i> CA: <span className="text-white">{current.ac ?? 10}</span></span>
                                        {current.speed && <span><i className="fa-solid fa-shoe-prints text-blue-400 mr-1"></i> Mov: <span className="text-white">{current.speed}ft</span></span>}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2 flex-wrap">
                                    <button className={`px-3 py-1.5 text-[0.65rem] font-bold rounded-full border transition-colors ${economy.action ? 'bg-green-500/10 text-green-300 border-green-500/30' : 'bg-white/5 text-gray-500 border-white/5'}`} onClick={() => setEconomy(prev => ({ ...prev, action: !prev.action }))}>
                                        <i className={`fa-solid ${economy.action ? 'fa-play' : 'fa-check'} mr-1`}></i> {economy.action ? 'AÇÃO' : 'USADA'}
                                    </button>
                                    <button className={`px-3 py-1.5 text-[0.65rem] font-bold rounded-full border transition-colors ${economy.bonus ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' : 'bg-white/5 text-gray-500 border-white/5'}`} onClick={() => setEconomy(prev => ({ ...prev, bonus: !prev.bonus }))}>
                                        <i className={`fa-solid ${economy.bonus ? 'fa-sparkles' : 'fa-check'} mr-1`}></i> {economy.bonus ? 'BÔNUS' : 'USADO'}
                                    </button>
                                    <button className={`px-3 py-1.5 text-[0.65rem] font-bold rounded-full border transition-colors ${economy.reaction ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' : 'bg-white/5 text-gray-500 border-white/5'}`} onClick={() => setEconomy(prev => ({ ...prev, reaction: !prev.reaction }))}>
                                        <i className={`fa-solid ${economy.reaction ? 'fa-reply' : 'fa-check'} mr-1`}></i> {economy.reaction ? 'REAÇÃO' : 'USADA'}
                                    </button>
                                    <button className="px-3 py-1.5 text-[0.65rem] font-bold rounded-full border transition-colors bg-purple-500/10 text-purple-300 border-purple-500/30" onClick={() => setEconomy(prev => ({ ...prev, movement: Math.max(0, prev.movement - 5) }))}>
                                        <i className="fa-solid fa-person-running mr-1"></i> {economy.movement}ft
                                    </button>
                                </div>
                                
                                {current.conditions?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-white/10">
                                        {current.conditions.map(cond => {
                                            const info = CONDITIONS[cond] || { emoji: '⚠️', label: cond };
                                            return (
                                                <button key={cond} className="px-2 py-1 text-[0.7rem] rounded-md bg-black/40 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors" onClick={() => removeConditionFromActive(cond)}>
                                                    {info.emoji} {info.label} <i className="fa-solid fa-times ml-1 opacity-50 text-[0.6rem]"></i>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 bg-white/5 rounded-xl border border-white/5">Nenhum combatente na fila.</div>
                    )}
                    
                    {/* QUEUE */}
                    <div>
                        <div className="flex justify-between items-center text-[0.65rem] font-black tracking-widest text-gray-400 uppercase mb-3 pb-2 border-b border-white/5">
                            <span><i className="fa-solid fa-list-ol mr-2"></i> FILA DE INICIATIVA</span>
                            <span className="text-tomeGold">{order.length} COMBATENTES</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {order.map((c, i) => {
                                const isActive = i === initiativeIndex;
                                const isTargeted = focusId === c.id && !isActive;
                                const isDead = c._hpCurrent <= 0;
                                const isEnemy = c.type !== 'Player';
                                const cardBorder = isActive ? 'border-tomeGold/60 shadow-[0_0_15px_rgba(197,160,89,0.2)]' : isTargeted ? 'border-white/30' : 'border-white/5';
                                const cardBg = isActive ? 'bg-tomeGold/5' : isTargeted ? 'bg-white/10' : 'bg-black/40';

                                return (
                                    <div key={c.id} 
                                         className={`relative flex items-center gap-4 p-3 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.01] hover:border-tomeGold/50 ${cardBg} ${cardBorder} ${isDead ? 'opacity-50' : 'opacity-100'}`}
                                         onClick={() => setFocusId(focusId === c.id ? null : c.id)}>
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isEnemy ? 'bg-red-500' : 'bg-green-500'} ${isActive ? 'opacity-100' : 'opacity-40'}`}></div>
                                        <div className={`w-6 text-center font-cinzel font-black text-lg ${isActive ? 'text-tomeGold' : 'text-gray-500'}`}>{i + 1}</div>
                                        <div className={`w-10 h-10 rounded-full border-2 shrink-0 flex items-center justify-center font-black text-white bg-black/50 bg-cover bg-center ${isEnemy ? 'border-red-500/50' : 'border-green-500/50'}`}
                                             style={{ backgroundImage: c.img || c.portraitData || (c.type !== 'Player' ? `url('${MonsterArt.getImage(c)}')` : '') ? `url('${c.img || c.portraitData || MonsterArt.getImage(c)}')` : 'none' }}>
                                            {!(c.img || c.portraitData || (c.type !== 'Player' ? MonsterArt.getImage(c) : '')) && c.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-outfit font-black text-sm truncate flex items-center gap-2 ${isActive ? 'text-white' : (isEnemy ? 'text-red-300' : 'text-gray-200')}`}>
                                                {isDead && <i className="fa-solid fa-skull"></i>} {c.name}
                                                {isActive && <span className="text-[0.55rem] bg-tomeGold text-black px-2 py-0.5 rounded-full font-black tracking-wider">VEZ</span>}
                                            </div>
                                            <div className="flex gap-3 text-[0.65rem] text-gray-400 font-bold mt-1">
                                                <span className="flex items-center gap-1"><i className={`fa-solid fa-heart ${hpColor(c._hpCurrent, c._hpMax)}`}></i> {c._hpCurrent}/{c._hpMax}</span>
                                                <span className="flex items-center gap-1"><i className="fa-solid fa-shield-halved"></i> {c.ac ?? 10}</span>
                                                {c.concentration?.length > 0 && <span className="flex items-center gap-1 text-blue-400" title="Concentração"><i className="fa-solid fa-brain"></i> Conc</span>}
                                            </div>
                                            <div className="w-full max-w-[200px] h-1 bg-black/50 rounded-full mt-1.5 overflow-hidden">
                                                <div className="h-full transition-all" style={{ width: `${hpPct(c._hpCurrent, c._hpMax)}%`, backgroundColor: hpColorHex(c._hpCurrent, c._hpMax) }}></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 pr-2">
                                            <div className="flex gap-1 text-lg">
                                                {(c.conditions || []).slice(0, 4).map(cond => <span key={cond} title={cond}>{(CONDITIONS[cond] || {emoji: '⚠️'}).emoji}</span>)}
                                            </div>
                                            <div className="font-cinzel text-xl font-black text-tomeGold drop-shadow-md w-8 text-right">{c.init ?? 0}</div>
                                            <div className={`flex gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30 hover:opacity-100'}`}>
                                                <button className="p-1.5 text-xs rounded-md bg-white/5 hover:bg-white/20 transition-colors" onClick={(e) => moveUp(e, c.id)}><i className="fa-solid fa-chevron-up"></i></button>
                                                <button className="p-1.5 text-xs rounded-md bg-white/5 hover:bg-white/20 transition-colors" onClick={(e) => moveDown(e, c.id)}><i className="fa-solid fa-chevron-down"></i></button>
                                                <button className="p-1.5 text-xs rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors" onClick={(e) => removeCombatant(e, c.id)}><i className="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            
            {/* QUICK ACTIONS PANEL (Foco) */}
            {focused && (
                <div className="shrink-0 bg-black/80 backdrop-blur-xl border-t border-tomeGold/30 p-4 rounded-t-xl shadow-[0_-10px_20px_rgba(0,0,0,0.5)] relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-[0.65rem] font-black text-tomeGold tracking-widest uppercase flex items-center gap-2">
                            <i className="fa-solid fa-crosshairs"></i>
                            {(!focusId || focusId === current?.id) ? 'AÇÕES DO COMBATENTE ATIVO' : `FOCO MANUAL: ${focused.name}`}
                        </div>
                        {focusId && focusId !== current?.id && (
                            <button className="text-[0.6rem] px-2.5 py-1 rounded-full border border-white/20 hover:bg-white/10 transition-colors uppercase font-bold" onClick={() => setFocusId(null)}>✕ Limpar Foco</button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-lg border border-white/10">
                            <input type="number" className="w-20 bg-white/5 border border-white/15 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-tomeGold/50 transition-colors" placeholder="Valor" min="0" value={dmgInput} onInput={e => setDmgInput(e.target.value)} />
                            <button className="bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors" onClick={applyDamage}>
                                <i className="fa-solid fa-heart-crack mr-1"></i> Dano
                            </button>
                            <button className="bg-green-500/15 text-green-300 border border-green-500/30 hover:bg-green-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors" onClick={applyHeal}>
                                <i className="fa-solid fa-heart-pulse mr-1"></i> Cura
                            </button>
                            <button className="bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-md text-sm transition-colors" onClick={() => { const r = Dice.roll(6); setDmgInput(r.total.toString()); Toast.show(`🎲 1d6 = ${r.total}`, 'info'); }} title="Rolar 1d6">
                                <i className="fa-solid fa-dice"></i>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-black/50 p-2.5 rounded-lg border border-white/10 flex-1 min-w-[280px]">
                            <select className="flex-1 bg-white/5 border border-white/15 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-tomeGold/50 transition-colors" value={selectedCond} onChange={e => setSelectedCond(e.target.value)}>
                                {Object.entries(CONDITIONS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.emoji} {v.label}</option>
                                ))}
                            </select>
                            <button className="bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors" onClick={applyCondition}>
                                <i className="fa-solid fa-plus mr-1"></i> Status
                            </button>
                            <button className="bg-red-500/5 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-xs font-bold transition-colors" onClick={clearConditions} title="Limpar status">
                                <i className="fa-solid fa-broom"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* QUICK ADD BAR */}
            <div className="shrink-0 p-3 bg-black/40 border-t border-white/5">
                <div className="text-[0.55rem] font-black text-gray-500 tracking-widest uppercase mb-2 flex items-center">
                    <i className="fa-solid fa-plus mr-1.5"></i> ADICIONAR COMBATENTE
                </div>
                <div className="flex gap-2 items-center">
                    <input type="text" className="flex-1 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-tomeGold/50" placeholder="Nome..." value={quickAdd.name} onInput={e => setQuickAdd(prev => ({...prev, name: e.target.value}))} />
                    <input type="number" className="w-16 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-tomeGold/50" placeholder="Inic" min="-5" max="30" value={quickAdd.init} onInput={e => setQuickAdd(prev => ({...prev, init: e.target.value}))} />
                    <input type="number" className="w-16 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white outline-none focus:border-tomeGold/50" placeholder="HP" min="1" max="999" value={quickAdd.hp} onInput={e => setQuickAdd(prev => ({...prev, hp: e.target.value}))} />
                    <button className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 px-2.5 py-1.5 rounded-md text-xs transition-colors" onClick={() => quickAddCombatant('Player')} title="Adicionar como Herói"><i className="fa-solid fa-shield"></i></button>
                    <button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1.5 rounded-md text-xs transition-colors" onClick={() => quickAddCombatant('Monster')} title="Adicionar como Inimigo"><i className="fa-solid fa-skull"></i></button>
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-md text-xs transition-colors" onClick={() => setQuickAdd(prev => ({...prev, init: Dice.quick(20).toString()}))} title="Rolar iniciativa automática"><i className="fa-solid fa-dice-d20"></i></button>
                </div>
            </div>

            {/* ANNOUNCE */}
            {announce.show && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                    <div className="animate-[fadeIn_0.3s_ease-out] bg-black/90 px-8 py-5 rounded-2xl border-2 border-tomeGold shadow-[0_0_50px_rgba(197,160,89,0.5)] backdrop-blur-xl flex items-center gap-4 transform scale-110">
                        <i className="fa-solid fa-swords text-tomeGold text-4xl animate-pulse"></i>
                        <div className="font-cinzel text-2xl font-black text-white tracking-wider">{announce.text}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
