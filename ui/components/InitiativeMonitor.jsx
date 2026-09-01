import { useState, useEffect, useRef } from 'preact/hooks';
import { TOME } from '../../core/Registry.js';
import { Dice } from '../../utils/Dice.js';
import { Toast } from '../components/core/Toast.jsx';
import { RulesEngine } from '../../core/RulesEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { FXEngine } from '../../services/FXEngine.js';
import { useStore } from '../core/hooks.js';

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

export function InitiativeMonitor() {
    const storeState = useStore();
    const initiativeOrder = storeState?.initiativeOrder || [];
    const initiativeIndex = storeState?.initiativeIndex || 0;
    const combatActive = storeState?.combatActive || false;
    const combatRound = storeState?.combatRound || 0;
    const players = storeState?.players || [];
    const monsters = storeState?.monsters || [];

    const [economy, setEconomy] = useState({ action: true, bonus: true, reaction: true, movement: 30 });
    const [quickAdd, setQuickAdd] = useState({ name: '', init: '', hp: '', type: 'Enemy' });
    const [selectedCond, setSelectedCond] = useState('envenenado');
    const [focusId, setFocusId] = useState(null);
    const [showTurnAnnounce, setShowTurnAnnounce] = useState(false);
    const [announceText, setAnnounceText] = useState('');
    const [dmgInput, setDmgInput] = useState('');

    const broadcastRef = useRef(null);

    useEffect(() => {
        if (!broadcastRef.current) {
            broadcastRef.current = new BroadcastChannel('tome_map');
        }

        const handleSummon = (entity) => {
            const initRoll = Dice.roll(20).total;
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
            
            if (window.TOME?.store) {
                window.TOME.store.update(s => {
                    if (!s.initiativeOrder) s.initiativeOrder = [];
                    s.initiativeOrder.push(combatant);
                    if (s.combatActive) {
                        s.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
                    }
                });
            }
            
            Toast.show(`🧙 Invocação: ${entity.name} (Iniciativa: ${initRoll})`, 'success');
        };

        if (window.TOME?.events) {
            window.TOME.events.on('MONSTER_INVOKED', handleSummon);
        }

        return () => {
            if (broadcastRef.current) {
                broadcastRef.current.close();
                broadcastRef.current = null;
            }
            if (window.TOME?.events) {
                window.TOME.events.off('MONSTER_INVOKED', handleSummon);
            }
        };
    }, []);

    useEffect(() => {
        if (showTurnAnnounce) {
            const timer = setTimeout(() => {
                setShowTurnAnnounce(false);
                setAnnounceText('');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showTurnAnnounce]);

    useEffect(() => {
        const activeEl = document.querySelector('.im-combatant.im-active');
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [initiativeIndex]);

    const getOrderWithHP = () => {
        return initiativeOrder.map(c => {
            const hp = RulesEngine.getHP(c);
            return { ...c, _hpCurrent: hp.current, _hpMax: hp.max };
        });
    };

    const getHpColor = (current, max) => {
        if (max <= 0) return 'var(--text-dim)';
        const pct = current / max;
        if (pct > 0.5) return 'var(--success)';
        if (pct > 0.2) return '#e5c17b';
        return 'var(--danger)';
    };

    const getHpPct = (current, max) => {
        if (max <= 0) return 0;
        return Math.min(100, Math.max(0, Math.round((current / max) * 100)));
    };

    const broadcastStateUpdate = () => {
        if (!broadcastRef.current || !window.TOME?.store) return;
        try {
            const s = window.TOME.store.state;
            const idx = s.initiativeIndex || 0;
            broadcastRef.current.postMessage({
                type: 'COMBAT_UPDATE',
                state: {
                    combatActive: s.combatActive,
                    combatRound: s.combatRound,
                    initiativeOrder: s.initiativeOrder,
                    initiativeIndex: idx,
                }
            });
        } catch (e) { }
    };

    const order = getOrderWithHP();
    const current = order[initiativeIndex];
    const focused = focusId ? order.find(c => c.id === focusId) || current : current;
    const isEmpty = !combatActive || order.length === 0;
    const hasParty = players.length + monsters.length > 0;

    const nextTurn = () => {
        if (!order.length) return;

        let idx = initiativeIndex + 1;
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
            setShowTurnAnnounce(true);
            setAnnounceText(isNewRound ? `⚔️ RODADA ${newRound} — Vez de ${nextActor.name}` : `Vez de ${nextActor.name}`);
        }

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.initiativeIndex = idx;
                if (isNewRound) s.combatRound = newRound;
                if (s.initiativeOrder) {
                    s.initiativeOrder = s.initiativeOrder.map((c, i) => ({
                        ...c,
                        isCurrentTurn: i === idx
                    }));
                }
            });
        }

        setTimeout(() => broadcastStateUpdate(), 50);
        Toast.show(`⚔️ Vez de ${nextActor?.name}${isNewRound ? ` · Rodada ${newRound}` : ''}`, 'info');
    };

    const startCombat = () => {
        const allCombatants = [
            ...players.map(p => ({
                ...p,
                type: 'Player',
                init: Dice.quick(20) + Math.floor(((p.stats?.dex || 10) - 10) / 2),
                conditions: p.conditions || [],
                isCurrentTurn: false,
            })),
            ...monsters.map(m => ({
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
        setShowTurnAnnounce(true);
        setAnnounceText(`⚔️ RODADA 1 — Vez de ${allCombatants[0]?.name}`);

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.initiativeOrder = allCombatants;
                s.initiativeIndex = 0;
                s.combatRound = 1;
                s.combatActive = true;
            });
        }

        setTimeout(() => broadcastStateUpdate(), 50);
        Toast.show('⚔️ Combate iniciado! Iniciativa rolada automaticamente.', 'success');
    };

    const rollAllInitiative = () => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.initiativeOrder?.length) return;
                s.initiativeOrder = s.initiativeOrder.map(c => ({
                    ...c,
                    init: Dice.quick(20) + Math.floor(((c.stats?.dex || 10) - 10) / 2),
                })).sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
                s.initiativeIndex = 0;
                s.combatRound = 1;
            });
        }
        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
        Toast.show('🎲 Iniciativa rerolada!', 'info');
    };

    const endCombat = () => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.combatActive = false;
                s.initiativeOrder = [];
                s.initiativeIndex = 0;
                s.combatRound = 0;
            });
        }
        setTimeout(() => broadcastStateUpdate(), 50);
        Toast.show('🏁 Combate encerrado.', 'info');
    };

    const toggleEconomy = (type) => {
        setEconomy(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const toggleMovement = () => {
        setEconomy(prev => ({ ...prev, movement: Math.max(0, prev.movement - 5) }));
    };

    const moveUp = (id, e) => {
        e.stopPropagation();
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const arr = s.initiativeOrder || [];
                const i = arr.findIndex(c => c.id === id);
                if (i > 0) {
                    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                }
            });
        }
    };

    const moveDown = (id, e) => {
        e.stopPropagation();
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const arr = s.initiativeOrder || [];
                const i = arr.findIndex(c => c.id === id);
                if (i < arr.length - 1) {
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                }
            });
        }
    };

    const removeCombatant = (id, e) => {
        e.stopPropagation();
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id);
                if (s.initiativeIndex >= s.initiativeOrder.length) {
                    s.initiativeIndex = Math.max(0, s.initiativeOrder.length - 1);
                }
            });
        }
        if (focusId === id) setFocusId(null);
    };

    const getTarget = () => {
        return focusId ? order.find(c => c.id === focusId) || current : current;
    };

    const applyDamage = () => {
        const target = getTarget();
        if (!target) return;

        const val = parseInt(dmgInput || '0', 10);
        if (isNaN(val) || val <= 0) {
            Toast.show('Insira um valor de dano válido.', 'warning');
            return;
        }

        let killedNow = false;
        let actorType = 'Enemy';
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
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
        }

        setTimeout(() => broadcastStateUpdate(), 50);
        Toast.show(`💥 ${val} de dano aplicado a ${target.name}`, 'danger');
        setDmgInput('');

        if (killedNow) {
            if (actorType === 'Player' || target.type === 'Player') {
                FXEngine.trigger('HERO_FALLEN', target.name, target.id);
            } else {
                FXEngine.trigger('ENTITY_SLAIN', target.name, target.id);
            }
        }
    };

    const applyHeal = () => {
        const target = getTarget();
        if (!target) return;

        const val = parseInt(dmgInput || '0', 10);
        if (isNaN(val) || val <= 0) {
            Toast.show('Insira um valor de cura válido.', 'warning');
            return;
        }

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
                if (!actor) return;
                if ('hp_current' in actor) {
                    actor.hp_current = Math.min(actor.hp_max ?? 999, (actor.hp_current ?? 0) + val);
                } else if (actor.combat) {
                    actor.combat.hp_current = Math.min(actor.combat.hp_max ?? 999, (actor.combat.hp_current ?? 0) + val);
                }
            });
        }

        setTimeout(() => broadcastStateUpdate(), 50);
        Toast.show(`💚 ${val} HP restaurados para ${target.name}`, 'success');
        setDmgInput('');
    };

    const rollDice = () => {
        const result = Dice.roll(6);
        setDmgInput(result.toString());
        Toast.show(`🎲 1d6 = ${result}`, 'info');
    };

    const applyCondition = () => {
        const target = getTarget();
        if (!target) return;

        const cond = selectedCond;
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
                if (!actor) return;
                if (!actor.conditions) actor.conditions = [];
                if (!actor.conditions.includes(cond)) {
                    actor.conditions.push(cond);
                }
            });
        }

        const info = CONDITIONS[cond] || { emoji: '⚠️', label: cond };
        Toast.show(`${info.emoji} ${info.label} aplicado a ${target.name}`, 'warning');
    };

    const removeConditionFromActive = (cond) => {
        if (!current) return;
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const actor = (s.initiativeOrder || []).find(c => c.id === current.id);
                if (actor?.conditions) {
                    actor.conditions = actor.conditions.filter(c => c !== cond);
                }
            });
        }
    };

    const clearConditions = () => {
        const target = getTarget();
        if (!target) return;
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
                if (actor) actor.conditions = [];
            });
        }
        Toast.show(`✅ Condições limpas de ${target.name}`, 'success');
    };

    const quickAddRollInit = () => {
        const init = Dice.quick(20);
        setQuickAdd(prev => ({ ...prev, init: init.toString() }));
        Toast.show(`🎲 Iniciativa rolada: ${init}`, 'info');
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
            name, type, init, ac: 10, hp_current: hp, hp_max: hp, conditions: [], isCurrentTurn: false,
        };

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.initiativeOrder) s.initiativeOrder = [];
                s.initiativeOrder.push(newCombatant);
                s.initiativeOrder.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
                if (!s.combatActive) {
                    s.combatActive = true;
                    s.combatRound = s.combatRound || 1;
                    s.initiativeIndex = 0;
                }
            });
        }

        setTimeout(() => broadcastStateUpdate(), 50);
        setQuickAdd({ name: '', init: '', hp: '', type: 'Enemy' });
        Toast.show(`➕ ${name} adicionado como ${type === 'Player' ? 'Herói' : 'Inimigo'}`, 'success');
    };

    const navigateToCombat = () => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => { s.activeTab = 'campaign'; });
        }
    };

    return (
        <div class="im-root h-full relative">
            <div class="im-header px-5 py-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 class="im-title m-0 text-base text-white font-cinzel">
                        <i class="fa-solid fa-swords text-danger text-sm mr-2"></i>
                        ORDEM DE BATALHA
                    </h2>
                    {combatActive ? (
                        <span class="im-round-badge text-[0.7rem] px-2 py-1 bg-accent/10 text-accent rounded border border-accent/30">⚔️ RODADA {combatRound || 1}</span>
                    ) : (
                        <span class="im-round-badge text-[0.7rem] px-2 py-1 bg-white/5 text-slate-400 rounded border border-white/10">COMBATE INATIVO</span>
                    )}
                </div>

                <div class="im-header-controls flex gap-2">
                    {combatActive ? (
                        <>
                            <button class="btn btn-ghost text-[0.6rem] px-2.5 py-1" onClick={rollAllInitiative} title="Rerolar Iniciativa">
                                <i class="fa-solid fa-dice-d20"></i> Rolar Tudo
                            </button>
                            <button class="btn btn-primary text-xs px-4 py-1.5 font-cinzel" onClick={nextTurn}>
                                PRÓXIMO <i class="fa-solid fa-chevron-right"></i>
                            </button>
                            <button class="btn btn-ghost text-[0.6rem] px-2 py-1 text-danger border-danger/20" onClick={endCombat} title="Encerrar Combate">
                                <i class="fa-solid fa-flag-checkered"></i>
                            </button>
                        </>
                    ) : (
                        <button class="btn btn-primary text-xs px-4.5 py-1.5 font-cinzel tracking-widest" onClick={startCombat}>
                            <i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
                        </button>
                    )}
                </div>
            </div>

            {isEmpty ? (
                <div class="im-empty flex flex-col items-center justify-center h-full opacity-50">
                    <div class="im-empty-icon text-5xl mb-4">⚔️</div>
                    <div class="im-empty-title text-xl font-cinzel text-white">Arena Silenciosa</div>
                    <p class="im-empty-sub text-sm text-center max-w-[80%] text-slate-400 mt-2 mb-6">
                        {hasParty ? 'Clique em "Iniciar Combate" para rolar iniciativa automática.' : 'Adicione heróis e monstros à campanha primeiro.'}
                    </p>
                    {hasParty ? (
                        <button class="btn btn-primary font-cinzel px-7 py-3 tracking-widest text-[0.85rem]" onClick={startCombat}>
                            <i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
                        </button>
                    ) : (
                        <button class="btn btn-ghost text-sm" onClick={navigateToCombat}>
                            Ir para Campanha →
                        </button>
                    )}
                </div>
            ) : (
                <div className="p-5 overflow-y-auto h-[calc(100%-60px)]">
                    {/* Spotlight */}
                    <div class="im-spotlight bg-gradient-to-r from-[#0e1016]/70 to-[#080a0f]/85 backdrop-blur-md border border-accent/40 rounded-xl mb-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${current?.type !== 'Player' ? 'bg-danger shadow-[0_0_15px_var(--danger)]' : 'bg-success shadow-[0_0_15px_var(--success)]'}`}></div>
                        
                        <div class="im-spotlight-inner p-5 sm:p-6 flex gap-6 items-center flex-wrap">
                            {/* Avatar */}
                            {(() => {
                                const isEnemy = current?.type !== 'Player';
                                const rawImg = current?.img || current?.portraitData || (isEnemy ? MonsterArt.getImage(current) : null);
                                const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;
                                const avatarBg = safeImg ? `url('${safeImg}')` : 'none';
                                return (
                                    <div class={`im-spotlight-avatar ${isEnemy ? 'enemy border-danger' : 'border-success'} w-[85px] h-[85px] rounded-full shadow-[0_0_25px_rgba(0,0,0,0.8)] border-[2.5px] shrink-0 flex items-center justify-center text-3xl font-cinzel font-black text-white bg-cover bg-center bg-black/50`} style={{ backgroundImage: avatarBg }}>
                                        {!safeImg && <span>{current?.name?.substring(0,2).toUpperCase()}</span>}
                                    </div>
                                );
                            })()}

                            {/* Info */}
                            <div class="im-spotlight-info flex-1 min-w-[250px]">
                                <div class="im-spotlight-label text-[0.65rem] text-accent font-extrabold uppercase tracking-[1.5px] mb-1.5 flex items-center gap-2">
                                    {current?.type !== 'Player' ? <><i class="fa-solid fa-skull text-danger"></i> <span className="text-danger">INIMIGO</span></> : <><i class="fa-solid fa-shield-halved text-success"></i> <span className="text-success">HERÓI</span></>}
                                    <span className="text-white/20">|</span> TURNO {initiativeIndex + 1}
                                </div>
                                <div class="im-spotlight-name text-3xl font-cinzel font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] mb-3.5 leading-tight">
                                    {current?.name}
                                </div>
                                
                                <div class="im-spotlight-meta flex gap-8 flex-wrap items-center">
                                    <div class="im-hp-block min-w-[180px] shrink-0">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <div class="im-hp-label text-[0.6rem] uppercase font-extrabold text-slate-400 tracking-widest">Pontos de Vida</div>
                                            <div class="im-hp-values font-black text-xl leading-none" style={{ color: getHpColor(current?._hpCurrent, current?._hpMax), textShadow: `0 0 12px ${getHpColor(current?._hpCurrent, current?._hpMax)}` }}>
                                                {current?._hpCurrent} <span className="opacity-50 text-sm font-bold">/ {current?._hpMax}</span>
                                            </div>
                                        </div>
                                        <div class="im-hp-bar-track w-full h-2 bg-black/70 rounded-md overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.9)]">
                                            <div class="im-hp-bar-fill h-full transition-all duration-400 ease-out" style={{ width: `${getHpPct(current?._hpCurrent, current?._hpMax)}%`, background: getHpColor(current?._hpCurrent, current?._hpMax), boxShadow: `0 0 10px ${getHpColor(current?._hpCurrent, current?._hpMax)}` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2.5 flex-1">
                                        <div className="flex gap-4 text-xs text-slate-400 font-bold bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5 w-fit">
                                            <span className="flex items-center gap-1.5"><i class="fa-solid fa-bolt text-accent"></i> Inic: <strong className="text-white text-[0.85rem]">{current?.init ?? 0}</strong></span>
                                            <span className="flex items-center gap-1.5"><i class="fa-solid fa-shield text-slate-300"></i> CA: <strong className="text-white text-[0.85rem]">{current?.ac ?? 10}</strong></span>
                                            {current?.speed && <span className="flex items-center gap-1.5"><i class="fa-solid fa-shoe-prints text-blue-400"></i> Mov: <strong className="text-white text-[0.85rem]">{current.speed}ft</strong></span>}
                                        </div>

                                        <div class="im-economy-value flex gap-2 flex-wrap">
                                            <button class={`im-econ-btn rounded-full px-3 py-1.5 text-[0.65rem] font-extrabold cursor-pointer transition-all ${economy.action ? 'bg-green-500/15 text-green-300 border border-green-500/40' : 'bg-white/5 text-slate-400 border border-white/5'}`} onClick={() => toggleEconomy('action')} title="Ação Principal (Clique para alternar)">
                                                <i class={`fa-solid ${economy.action ? 'fa-play' : 'fa-check'}`}></i> {economy.action ? 'AÇÃO' : 'USADA'}
                                            </button>
                                            <button class={`im-econ-btn rounded-full px-3 py-1.5 text-[0.65rem] font-extrabold cursor-pointer transition-all ${economy.bonus ? 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/40' : 'bg-white/5 text-slate-400 border border-white/5'}`} onClick={() => toggleEconomy('bonus')} title="Ação Bônus (Clique para alternar)">
                                                <i class={`fa-solid ${economy.bonus ? 'fa-sparkles' : 'fa-check'}`}></i> {economy.bonus ? 'BÔNUS' : 'USADO'}
                                            </button>
                                            <button class={`im-econ-btn rounded-full px-3 py-1.5 text-[0.65rem] font-extrabold cursor-pointer transition-all ${economy.reaction ? 'bg-blue-400/15 text-blue-300 border border-blue-400/40' : 'bg-white/5 text-slate-400 border border-white/5'}`} onClick={() => toggleEconomy('reaction')} title="Reação (Clique para alternar)">
                                                <i class={`fa-solid ${economy.reaction ? 'fa-reply' : 'fa-check'}`}></i> {economy.reaction ? 'REAÇÃO' : 'USADA'}
                                            </button>
                                            <button class="im-econ-btn bg-purple-500/15 text-purple-300 border border-purple-500/40 rounded-full px-3 py-1.5 text-[0.65rem] font-extrabold cursor-pointer transition-all shadow-[0_0_10px_rgba(168,85,247,0.1)]" onClick={toggleMovement} title="Movimento (Clique para subtrair 5ft)">
                                                <i class="fa-solid fa-person-running"></i> {economy.movement}ft
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {current?.conditions?.length > 0 && (
                                    <div class="im-cond-list mt-4 flex gap-2 flex-wrap pt-3 border-t border-white/5">
                                        {current.conditions.map(c => {
                                            const info = CONDITIONS[c] || { emoji: '⚠️', label: c };
                                            return <button key={c} class="btn btn-ghost px-2.5 py-1 text-[0.7rem] rounded-md bg-black/40 border border-white/10 text-slate-200 transition-all hover:bg-black/60" onClick={() => removeConditionFromActive(c)} title="Clique para remover condição">{info.emoji} {info.label} <i class="fa-solid fa-times ml-1.5 opacity-50 text-[0.6rem]"></i></button>;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fila */}
                    <div class="im-queue-section mb-6">
                        <div class="im-queue-header text-[0.65rem] font-black tracking-[2px] text-slate-400 uppercase mb-3 flex justify-between border-b border-white/5 pb-2">
                            <span><i class="fa-solid fa-list-ol mr-1.5"></i> FILA DE INICIATIVA</span>
                            <span className="text-accent">{order.length} COMBATENTES</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {order.map((c, i) => {
                                const isActive = i === initiativeIndex;
                                const isTargeted = focusId === c.id && !isActive;
                                const isDead = c._hpCurrent <= 0;
                                const isEnemy = c.type !== 'Player';

                                const hpPct = getHpPct(c._hpCurrent, c._hpMax);
                                const hpColor = getHpColor(c._hpCurrent, c._hpMax);

                                const rawImg = c.img || c.portraitData || (c.type !== 'Player' ? MonsterArt.getImage(c) : null);
                                const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;

                                const cardBg = isActive 
                                    ? 'linear-gradient(90deg, rgba(197, 160, 89, 0.1), rgba(14, 16, 22, 0.8))'
                                    : isTargeted 
                                        ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(14, 16, 22, 0.6))'
                                        : 'rgba(14, 16, 22, 0.6)';

                                const cardBorder = isActive
                                    ? '1px solid rgba(197, 160, 89, 0.6)'
                                    : isTargeted
                                        ? '1px solid rgba(255, 255, 255, 0.3)'
                                        : '1px solid rgba(255, 255, 255, 0.03)';

                                return (
                                    <div key={c.id} class={`im-combatant ${isActive ? 'im-active' : ''} p-3.5 sm:px-5 flex items-center gap-5 cursor-pointer transition-all duration-200 ease-out relative overflow-hidden min-h-[60px] rounded-xl backdrop-blur-md ${isDead ? 'opacity-50' : 'opacity-100'}`} style={{ background: cardBg, border: cardBorder, boxShadow: isActive ? '0 0 15px rgba(197, 160, 89, 0.2)' : 'none' }} onClick={() => setFocusId(focusId === c.id ? null : c.id)} title={isActive ? 'Turno Atual' : 'Clique para focar ações'}>
                                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${isEnemy ? 'bg-danger' : 'bg-success'} ${isActive ? 'opacity-100' : 'opacity-40'}`}></div>
                                        <div className={`font-cinzel text-base font-black w-6 text-center ${isActive ? 'text-accent' : 'text-slate-400'}`}>{i + 1}</div>
                                        <div className={`w-10 h-10 rounded-full bg-cover bg-center bg-black/50 border-[1.5px] flex items-center justify-center text-xs font-black text-white shrink-0 ${isEnemy ? 'border-danger/50' : 'border-success/50'}`} style={{ backgroundImage: safeImg ? `url('${safeImg}')` : 'none' }}>
                                            {!safeImg && <span>{c.name.substring(0,2).toUpperCase()}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-outfit font-extrabold text-[0.95rem] whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2 ${isActive ? 'text-white' : (isEnemy ? 'text-red-300' : 'text-slate-200')}`}>
                                                {isDead && <i class="fa-solid fa-skull"></i>} {c.name}
                                                {isActive && <span className="text-[0.5rem] bg-accent text-black px-1.5 py-0.5 rounded-full font-black tracking-widest">VEZ</span>}
                                            </div>
                                            <div className="text-[0.65rem] text-slate-400 flex gap-3 mt-1 font-semibold">
                                                <span className="flex items-center gap-1"><i class="fa-solid fa-heart" style={{ color: hpColor }}></i> {c._hpCurrent}/{c._hpMax}</span>
                                                <span className="flex items-center gap-1"><i class="fa-solid fa-shield-halved"></i> {c.ac ?? 10}</span>
                                                {c.concentration?.length > 0 && <span title="Concentração" className="text-blue-400"><i class="fa-solid fa-brain"></i> Conc</span>}
                                            </div>
                                            <div className="w-full max-w-[200px] h-[3px] bg-black/50 rounded-sm mt-1.5 overflow-hidden">
                                                <div className="h-full transition-all duration-300 ease-out" style={{ width: `${hpPct}%`, background: hpColor }}></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {(c.conditions || []).length > 0 && (
                                                <div className="flex gap-1">
                                                    {(c.conditions || []).slice(0, 4).map(cond => {
                                                        const info = CONDITIONS[cond] || { emoji: '⚠️' };
                                                        return <span key={cond} className="text-xs" title={cond}>{info.emoji}</span>;
                                                    })}
                                                </div>
                                            )}
                                            <div className="flex flex-col items-end gap-0.5">
                                                <div className="font-cinzel text-lg font-black text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]">{c.init ?? 0}</div>
                                            </div>
                                            <div class="im-card-controls flex gap-1 transition-opacity duration-200" style={{ opacity: isActive ? 1 : 0.3 }}>
                                                <button class="btn btn-ghost p-1.5 text-[0.65rem] rounded-md bg-white/5" onClick={(e) => moveUp(c.id, e)} title="Subir Fila"><i class="fa-solid fa-chevron-up"></i></button>
                                                <button class="btn btn-ghost p-1.5 text-[0.65rem] rounded-md bg-white/5" onClick={(e) => moveDown(c.id, e)} title="Descer Fila"><i class="fa-solid fa-chevron-down"></i></button>
                                                <button class="btn btn-ghost p-1.5 text-[0.65rem] rounded-md bg-danger/10 text-danger" onClick={(e) => removeCombatant(c.id, e)} title="Remover"><i class="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions (Dano/Cura) */}
                    {focused && (
                        <div className="bg-gradient-to-t from-[#080a0f]/85 to-[#0e1016]/70 backdrop-blur-xl border-t border-accent/40 p-4 sm:px-6 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] rounded-t-xl relative z-10">
                            <div className="text-[0.65rem] font-black text-accent tracking-[2px] uppercase mb-3 flex justify-between items-center">
                                <span className="flex items-center gap-2">
                                    <i class="fa-solid fa-crosshairs"></i>
                                    {!focusId || focusId === current?.id ? 'AÇÕES DO COMBATENTE ATIVO' : `FOCO MANUL: ${focused.name}`}
                                </span>
                                {(focusId && focusId !== current?.id) && (
                                    <button class="btn btn-ghost text-[0.6rem] px-2.5 py-1 rounded-full border border-white/20" onClick={() => setFocusId(null)}>✕ Limpar foco</button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-5 items-end justify-start mb-2">
                                <div className="flex gap-2.5 items-center bg-black/50 px-3.5 py-2.5 rounded-xl border border-white/10">
                                    <input type="number" class="form-input w-[90px] text-sm px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white" placeholder="Valor" min="0" value={dmgInput} onInput={e => setDmgInput(e.target.value)} />
                                    <button class="btn bg-danger/15 text-red-300 border border-danger/30 text-xs px-3.5 py-1.5 rounded-md font-bold transition-all hover:bg-danger/25" onClick={applyDamage}><i class="fa-solid fa-heart-crack mr-1"></i> Dano</button>
                                    <button class="btn bg-success/15 text-green-300 border border-success/30 text-xs px-3.5 py-1.5 rounded-md font-bold transition-all hover:bg-success/25" onClick={applyHeal}><i class="fa-solid fa-heart-pulse mr-1"></i> Cura</button>
                                    <button class="btn btn-ghost text-xs px-2.5 py-1.5 rounded-md bg-white/5" onClick={rollDice} title="Rolar 1d6"><i class="fa-solid fa-dice"></i></button>
                                </div>

                                <div className="flex gap-2.5 items-center bg-black/50 px-3.5 py-2.5 rounded-xl border border-white/10 flex-1 min-w-[280px]">
                                    <select class="form-select text-sm px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white flex-1" value={selectedCond} onChange={e => setSelectedCond(e.target.value)}>
                                        {Object.entries(CONDITIONS).map(([k, v]) => (
                                            <option key={k} value={k}>{v.emoji} {v.label}</option>
                                        ))}
                                    </select>
                                    <button class="btn bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs px-3.5 py-1.5 rounded-md font-bold" onClick={applyCondition}><i class="fa-solid fa-plus mr-1"></i> Status</button>
                                    <button class="btn btn-ghost text-xs px-3 py-1.5 text-danger rounded-md bg-danger/5" onClick={clearConditions} title="Limpar todos os status"><i class="fa-solid fa-broom"></i></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Add */}
                    <div class="im-quick-add mt-5">
                        <div className="text-[0.55rem] font-extrabold text-slate-400 tracking-[1.5px] uppercase mb-1.5">
                            <i class="fa-solid fa-plus mr-1"></i> ADICIONAR COMBATENTE
                        </div>
                        <div class="im-quick-add-row flex gap-2">
                            <input type="text" class="form-input text-xs px-2.5 py-1.5 flex-1" placeholder="Nome..." value={quickAdd.name} onInput={e => setQuickAdd(prev => ({ ...prev, name: e.target.value }))} />
                            <input type="number" class="form-input text-xs px-2 py-1.5 w-[60px]" placeholder="Inic" min="-5" max="30" value={quickAdd.init} onInput={e => setQuickAdd(prev => ({ ...prev, init: e.target.value }))} />
                            <input type="number" class="form-input text-xs px-2 py-1.5 w-[60px]" placeholder="HP" min="1" max="999" value={quickAdd.hp} onInput={e => setQuickAdd(prev => ({ ...prev, hp: e.target.value }))} />
                            <div className="flex gap-1">
                                <button class="btn btn-ghost btn-sm text-[0.6rem] px-2 py-1.5 bg-blue-400/10 border-blue-400/20 text-blue-300" onClick={() => quickAddCombatant('Player')} title="Adicionar como Herói"><i class="fa-solid fa-shield"></i></button>
                                <button class="btn btn-ghost btn-sm text-[0.6rem] px-2 py-1.5 bg-danger/10 border-danger/20 text-red-300" onClick={() => quickAddCombatant('Monster')} title="Adicionar como Inimigo"><i class="fa-solid fa-skull"></i></button>
                                <button class="btn btn-ghost btn-sm text-[0.6rem] px-2 py-1.5" onClick={quickAddRollInit} title="Rolar iniciativa automática"><i class="fa-solid fa-dice-d20"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showTurnAnnounce && (
                <div class="im-turn-announce absolute inset-0 flex items-center justify-center z-[100] pointer-events-none bg-black/70 backdrop-blur-sm animate-fadeIn">
                    <div class="im-turn-announce-inner bg-gradient-to-r from-transparent via-accent/20 to-transparent px-20 py-5 text-white font-cinzel text-4xl font-black drop-shadow-[0_0_20px_rgba(197,160,89,0.8)] shadow-[0_5px_15px_rgba(0,0,0,0.8)] tracking-[2px] flex flex-col items-center gap-2.5 animate-scaleUp">
                        <i class="fa-solid fa-swords text-accent"></i>
                        {announceText}
                    </div>
                </div>
            )}
        </div>
    );
}
