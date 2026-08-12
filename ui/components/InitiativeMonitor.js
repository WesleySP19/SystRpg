import { html } from 'htm/preact';
import { render as preactRender } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { Component } from '../core/Component.js';
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

function getOrder(storeState) {
    return (storeState.initiativeOrder || []).map(c => {
        const hp = RulesEngine.getHP(c);
        return { ...c, _hpCurrent: hp.current, _hpMax: hp.max };
    });
}

function broadcastState(storeState, broadcastChannel) {
    try {
        const idx = storeState.initiativeIndex || 0;
        broadcastChannel?.postMessage({
            type: 'COMBAT_UPDATE',
            state: {
                combatActive: storeState.combatActive,
                combatRound: storeState.combatRound,
                initiativeOrder: storeState.initiativeOrder,
                initiativeIndex: idx,
            }
        });
    } catch (e) {}
}

const Header = ({ storeState, store, broadcastChannel, setEconomy }) => {
    const { combatActive, combatRound } = storeState;

    const startCombat = () => {
        const state = JSON.parse(JSON.stringify(storeState));
        const { players, monsters } = state;
        const allCombatants = [
            ...(players || []).map(p => ({
                ...p,
                type: 'Player',
                initiative: Dice.quick(20) + Math.floor(((p.stats?.dex || 10) - 10) / 2),
                conditions: p.conditions || [],
                isCurrentTurn: false,
            })),
            ...(monsters || []).map(m => ({
                ...m,
                type: 'Monster',
                initiative: Dice.quick(20) + Math.floor(((m.stats?.dex || 10) - 10) / 2),
                conditions: m.conditions || [],
                isCurrentTurn: false,
            }))
        ];

        if (!allCombatants.length) {
            Toast.show('Adicione heróis ou monstros antes de iniciar o combate.', 'warning');
            return;
        }

        allCombatants.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
        if (allCombatants.length > 0) allCombatants[0].isCurrentTurn = true;

        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });

        store.update(s => {
            s.initiativeOrder = allCombatants;
            s.initiativeIndex = 0;
            s.combatRound = 1;
            s.combatActive = true;
        });

        broadcastState(store.state, broadcastChannel);
        Toast.show('⚔️ Combate iniciado! Iniciativa rolada automaticamente.', 'success');
    };

    const rollAllInitiative = () => {
        store.update(s => {
            if (!s.initiativeOrder?.length) return;
            s.initiativeOrder = s.initiativeOrder.map(c => ({
                ...c,
                initiative: Dice.quick(20) + Math.floor(((c.stats?.dex || 10) - 10) / 2),
            })).sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
            s.initiativeIndex = 0;
            s.combatRound = 1;
        });
        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
        Toast.show('🎲 Iniciativa rerolada!', 'info');
    };

    const nextTurn = () => {
        let orderLen = 0;
        let nextName = '';
        let newRound = 0;
        store.update(s => {
            if (!s.initiativeOrder?.length) return;
            orderLen = s.initiativeOrder.length;
            const currentIdx = s.initiativeIndex || 0;
            let nextIdx = currentIdx + 1;
            
            if (nextIdx >= orderLen) {
                nextIdx = 0;
                s.combatRound = (s.combatRound || 1) + 1;
                newRound = s.combatRound;
            }
            s.initiativeIndex = nextIdx;
            
            s.initiativeOrder.forEach((c, i) => c.isCurrentTurn = (i === nextIdx));
            nextName = s.initiativeOrder[nextIdx].name;
        });
        
        setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
        broadcastState(store.state, broadcastChannel);
        Toast.show(`⚔️ Vez de ${nextName}${newRound ? ` · Rodada ${newRound}` : ''}`, 'info');
    };

    const endCombat = () => {
        store.update(s => {
            s.combatActive = false;
            s.initiativeOrder = [];
            s.initiativeIndex = 0;
            s.combatRound = 0;
        });
        broadcastState(store.state, broadcastChannel);
        Toast.show('🏁 Combate encerrado.', 'info');
    };

    return html`
        <div class="flex items-center justify-between px-6 py-4 bg-obsidian-900 border-b border-tomeGold/20 rounded-t-xl">
            <div class="flex items-center gap-3">
                <h2 class="m-0 font-cinzel text-red-500 text-lg uppercase tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    <i class="fa-solid fa-swords mr-2"></i> Ordem de Batalha
                </h2>
                ${combatActive 
                    ? html`<span class="px-2 py-1 text-xs font-bold text-red-100 bg-red-900/50 border border-red-500/50 rounded animate-pulse">⚔️ RODADA ${combatRound || 1}</span>` 
                    : html`<span class="px-2 py-1 text-xs font-bold text-gray-400 bg-black/50 border border-white/10 rounded">COMBATE INATIVO</span>`
                }
            </div>
            
            <div class="flex items-center gap-2">
                ${combatActive ? html`
                    <button onClick=${rollAllInitiative} class="px-3 py-1.5 text-xs text-tomeGold bg-tomeGold/10 hover:bg-tomeGold/20 border border-tomeGold/30 rounded transition-colors" title="Rerolar Iniciativa">
                        <i class="fa-solid fa-dice-d20"></i> Rolar Tudo
                    </button>
                    <button onClick=${nextTurn} class="px-4 py-1.5 font-cinzel font-bold text-white bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all">
                        PRÓXIMO <i class="fa-solid fa-chevron-right ml-1"></i>
                    </button>
                    <button onClick=${endCombat} class="px-2 py-1.5 text-red-500 hover:text-white hover:bg-red-600/80 border border-red-500/30 rounded transition-colors" title="Encerrar Combate">
                        <i class="fa-solid fa-flag-checkered"></i>
                    </button>
                ` : html`
                    <button onClick=${startCombat} class="px-4 py-2 font-cinzel font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 rounded shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all tracking-wider">
                        <i class="fa-solid fa-dice-d20 mr-2"></i> INICIAR COMBATE
                    </button>
                `}
            </div>
        </div>
    `;
};

const Spotlight = ({ current, idx, economy, setEconomy }) => {
    if (!current) return html`
        <div class="p-6 text-gray-500 text-sm text-center">Nenhum combatente na fila.</div>
    `;

    const isEnemy = current.type !== 'Player';
    const hpPct = current._hpMax > 0 ? Math.min(100, Math.max(0, Math.round((current._hpCurrent / current._hpMax) * 100))) : 0;
    const hpColor = current._hpMax <= 0 ? 'text-gray-500' : (hpPct > 50 ? 'text-emerald-400' : (hpPct > 20 ? 'text-yellow-400' : 'text-red-500'));
    
    const rawImg = current.img || current.portraitData || (isEnemy ? MonsterArt.getImage(current) : null);
    const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;

    const toggleEco = (type) => {
        if (type === 'movement') {
            setEconomy(prev => ({ ...prev, movement: Math.max(0, prev.movement - 5) }));
        } else {
            setEconomy(prev => ({ ...prev, [type]: !prev[type] }));
        }
    };

    return html`
        <div class="relative overflow-hidden mb-6 rounded-xl border border-tomeGold/30 bg-gradient-to-r from-obsidian-950 to-obsidian-900 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <div class="absolute left-0 top-0 bottom-0 w-1 ${isEnemy ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]'}"></div>
            
            <div class="p-5 pl-7 flex flex-wrap gap-6 items-center">
                <div class="w-20 h-20 rounded-full border-2 ${isEnemy ? 'border-red-500' : 'border-emerald-500'} flex-shrink-0 flex items-center justify-center font-cinzel text-xl text-white font-bold bg-black/50 shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-cover bg-center" style="background-image: ${safeImg ? `url('${safeImg}')` : 'none'}">
                    ${!safeImg ? current.name.substring(0,2).toUpperCase() : ''}
                </div>
                
                <div class="flex-1 min-w-[250px]">
                    <div class="flex items-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-widest mb-1.5">
                        ${isEnemy 
                            ? html`<span class="text-red-500"><i class="fa-solid fa-skull mr-1"></i> INIMIGO</span>` 
                            : html`<span class="text-emerald-500"><i class="fa-solid fa-shield-halved mr-1"></i> HERÓI</span>`
                        }
                        <span class="text-white/20">|</span>
                        <span class="text-tomeGold">TURNO ${idx + 1}</span>
                    </div>
                    <div class="font-cinzel font-black text-2xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] mb-3 leading-tight">
                        ${current.name}
                    </div>
                    
                    <div class="flex flex-wrap gap-6 items-center">
                        <div class="min-w-[120px]">
                            <div class="flex justify-between items-end mb-1">
                                <span class="text-[0.6rem] uppercase font-bold text-gray-400 tracking-wider">Pontos de Vida</span>
                                <span class="text-lg font-black ${hpColor} drop-shadow-[0_0_10px_currentColor] leading-none">
                                    ${current._hpCurrent} <span class="text-xs opacity-50">/ ${current._hpMax}</span>
                                </span>
                            </div>
                            <div class="h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/5">
                                <div class="h-full transition-all duration-300" style="width: ${hpPct}%; background-color: currentColor; color: ${hpColor.replace('text-','bg-')}"></div>
                            </div>
                        </div>

                        ${current.conditions?.length > 0 ? html`
                            <div class="flex flex-wrap gap-2">
                                ${current.conditions.map(c => {
                                    const info = CONDITIONS[c] || { emoji: '⚠️', label: c };
                                    return html`<span class="px-2 py-1 bg-red-900/30 border border-red-500/40 text-red-200 text-xs rounded shadow-sm" title="${info.label}">${info.emoji} ${info.label}</span>`;
                                })}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="flex flex-col gap-2 min-w-[150px] border-l border-white/10 pl-6 py-2">
                    <div class="text-[0.65rem] text-tomeGold uppercase font-black tracking-widest text-center mb-1">Economia de Ações</div>
                    <div class="flex justify-center gap-2">
                        <button onClick=${() => toggleEco('action')} class="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/10 transition-colors ${economy.action ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/50 text-gray-600 grayscale'}">
                            <i class="fa-solid fa-hand-fist text-sm"></i>
                        </button>
                        <button onClick=${() => toggleEco('bonus')} class="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/10 transition-colors ${economy.bonus ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/50 text-gray-600 grayscale'}">
                            <i class="fa-solid fa-bolt text-sm"></i>
                        </button>
                        <button onClick=${() => toggleEco('reaction')} class="w-10 h-10 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/10 transition-colors ${economy.reaction ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-black/50 text-gray-600 grayscale'}">
                            <i class="fa-solid fa-shield-halved text-sm"></i>
                        </button>
                        <button onClick=${() => toggleEco('movement')} class="w-12 h-10 rounded-lg flex flex-col items-center justify-center border border-white/10 transition-colors ${economy.movement > 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-black/50 text-gray-600 grayscale'}">
                            <span class="font-bold text-xs">${economy.movement}</span>
                            <span class="text-[0.5rem] uppercase opacity-70">ft</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const InitiativeApp = ({ store, broadcastChannel }) => {
    // Escuta store via state nativo do Preact
    const [storeState, setStoreState] = useState(store.state);
    useEffect(() => {
        const handler = () => setStoreState({ ...store.state });
        store.on('change', handler);
        return () => store.off('change', handler);
    }, [store]);

    const [economy, setEconomy] = useState({ action: true, bonus: true, reaction: true, movement: 30 });
    const [quickAdd, setQuickAdd] = useState({ name: '', init: '', hp: '', type: 'Enemy' });
    const [selectedCond, setSelectedCond] = useState('envenenado');
    const [focusId, setFocusId] = useState(null);
    const [dmgInput, setDmgInput] = useState('');

    const order = getOrder(storeState);
    const idx = storeState.initiativeIndex || 0;
    const current = order[idx];
    const focused = focusId ? (order.find(c => c.id === focusId) || current) : current;

    // Listen to invocations from TOME events (Summoning)
    useEffect(() => {
        const handleSummon = (entity) => {
            let initRoll = Dice.quick(20);
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
                    s.initiativeOrder.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
                }
            });
            Toast.show(`🧙 Invocação: ${entity.name} (Iniciativa: ${initRoll})`, 'success');
        };
        TOME.events.on('MONSTER_INVOKED', handleSummon);
        return () => TOME.events.off('MONSTER_INVOKED', handleSummon);
    }, []);

    // Actions
    const doDamage = () => {
        if (!focused || !dmgInput) return;
        const amt = parseInt(dmgInput, 10);
        if (isNaN(amt) || amt <= 0) return;

        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (!actor) return;
            if (actor.type === 'Player') {
                const globalP = (s.players || []).find(p => p.id === actor.id);
                if (globalP) RulesEngine.applyDamage(globalP, amt);
            } else {
                const globalM = (s.monsters || []).find(m => m.id === actor.id);
                if (globalM) RulesEngine.applyDamage(globalM, amt);
                else {
                    actor.hp = actor.hp || { current: actor.hp_max, max: actor.hp_max };
                    if (typeof actor.hp === 'number') actor.hp = { current: actor.hp, max: actor.hp_max };
                    actor.hp.current = Math.max(0, actor.hp.current - amt);
                }
            }
        });
        broadcastState(store.state, broadcastChannel);
        Toast.show(`💥 Dano aplicado: ${amt} em ${focused.name}`, 'warning');
        setDmgInput('');
    };

    const doHeal = () => {
        if (!focused || !dmgInput) return;
        const amt = parseInt(dmgInput, 10);
        if (isNaN(amt) || amt <= 0) return;

        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (!actor) return;
            if (actor.type === 'Player') {
                const globalP = (s.players || []).find(p => p.id === actor.id);
                if (globalP) RulesEngine.heal(globalP, amt);
            } else {
                const globalM = (s.monsters || []).find(m => m.id === actor.id);
                if (globalM) RulesEngine.heal(globalM, amt);
                else {
                    actor.hp = actor.hp || { current: actor.hp_max, max: actor.hp_max };
                    actor.hp.current = Math.min(actor.hp.max, actor.hp.current + amt);
                }
            }
        });
        broadcastState(store.state, broadcastChannel);
        Toast.show(`💚 Cura aplicada: ${amt} em ${focused.name}`, 'success');
        setDmgInput('');
    };

    const applyCond = () => {
        if (!focused || !selectedCond) return;
        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (actor) {
                if (!actor.conditions) actor.conditions = [];
                if (!actor.conditions.includes(selectedCond)) actor.conditions.push(selectedCond);
            }
        });
    };

    const clearConds = () => {
        if (!focused) return;
        store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === focused.id);
            if (actor) actor.conditions = [];
        });
    };

    const moveUp = (id) => {
        store.update(s => {
            const ord = s.initiativeOrder || [];
            const i = ord.findIndex(c => c.id === id);
            if (i > 0) [ord[i - 1], ord[i]] = [ord[i], ord[i - 1]];
        });
    };

    const moveDown = (id) => {
        store.update(s => {
            const ord = s.initiativeOrder || [];
            const i = ord.findIndex(c => c.id === id);
            if (i < ord.length - 1) [ord[i], ord[i + 1]] = [ord[i + 1], ord[i]];
        });
    };

    const removeCombatant = (id) => {
        if (confirm('Remover combatente da fila?')) {
            store.update(s => {
                s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id);
                if (s.initiativeIndex >= s.initiativeOrder.length) s.initiativeIndex = 0;
            });
        }
    };

    const doQuickAdd = (type) => {
        if (!quickAdd.name) {
            Toast.show('Insira um nome para o combatente.', 'warning');
            return;
        }
        const init = parseInt(quickAdd.init || Dice.quick(20), 10);
        const hp = parseInt(quickAdd.hp || 10, 10);

        const newCombatant = {
            id: `qc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
            name: quickAdd.name,
            type: type,
            initiative: init,
            ac: 10,
            hp: { current: hp, max: hp },
            conditions: [],
            isCurrentTurn: false,
        };

        store.update(s => {
            if (!s.initiativeOrder) s.initiativeOrder = [];
            s.initiativeOrder.push(newCombatant);
            s.initiativeOrder.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
            if (!s.combatActive) {
                s.combatActive = true;
                s.combatRound = s.combatRound || 1;
                s.initiativeIndex = 0;
            }
        });

        broadcastState(store.state, broadcastChannel);
        setQuickAdd({ name: '', init: '', hp: '', type: 'Enemy' });
        Toast.show(`➕ ${quickAdd.name} adicionado como ${type === 'Player' ? 'Herói' : 'Inimigo'}`, 'success');
    };

    return html`
        <div class="flex flex-col h-full bg-obsidian-950 text-gray-200 font-sans overflow-hidden">
            <${Header} storeState=${storeState} store=${store} broadcastChannel=${broadcastChannel} setEconomy=${setEconomy} />
            
            <div class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-tomeGold/30">
                ${!storeState.combatActive || order.length === 0 
                    ? html`
                        <div class="flex flex-col items-center justify-center h-full opacity-50 py-10">
                            <i class="fa-solid fa-campground text-6xl text-gray-600 mb-4"></i>
                            <h3 class="font-cinzel text-xl text-gray-400">Acampamento Pacífico</h3>
                            <p class="text-sm">Adicione entidades e inicie o combate.</p>
                        </div>
                    ` 
                    : html`
                        <${Spotlight} current=${current} idx=${idx} economy=${economy} setEconomy=${setEconomy} />
                        
                        <div class="flex gap-6 items-start">
                            <!-- QUEUE -->
                            <div class="flex-1 min-w-[300px]">
                                <h3 class="font-cinzel text-sm text-tomeGold uppercase tracking-widest mb-3 border-b border-white/10 pb-2">
                                    <i class="fa-solid fa-list-ol mr-2"></i> Fila de Iniciativa
                                </h3>
                                <div class="flex flex-col gap-2">
                                    ${order.map((c, i) => {
                                        const isFocus = focused?.id === c.id;
                                        const isActive = i === idx;
                                        const isEnemy = c.type !== 'Player';
                                        return html`
                                            <div onClick=${() => setFocusId(isFocus ? null : c.id)} class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isActive ? 'bg-black/50 border-tomeGold/50 shadow-[0_0_10px_rgba(197,160,89,0.2)]' : (isFocus ? 'bg-white/10 border-white/30' : 'bg-black/30 border-transparent hover:bg-white/5')}">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-black border ${isEnemy ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'}">
                                                        ${c.initiative}
                                                    </div>
                                                    <div>
                                                        <div class="font-bold text-sm ${isActive ? 'text-tomeGold' : 'text-gray-200'}">${c.name}</div>
                                                        <div class="text-[0.65rem] text-gray-500 uppercase tracking-widest">
                                                            HP: ${c._hpCurrent}/${c._hpMax} | AC: ${c.ac || 10}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
                                                    <button onClick=${(e) => { e.stopPropagation(); moveUp(c.id); }} class="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"><i class="fa-solid fa-arrow-up"></i></button>
                                                    <button onClick=${(e) => { e.stopPropagation(); moveDown(c.id); }} class="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs"><i class="fa-solid fa-arrow-down"></i></button>
                                                    <button onClick=${(e) => { e.stopPropagation(); removeCombatant(c.id); }} class="w-6 h-6 rounded bg-red-900/40 hover:bg-red-600 flex items-center justify-center text-xs text-red-400 hover:text-white"><i class="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                        `;
                                    })}
                                </div>
                            </div>

                            <!-- ACTION PANEL -->
                            <div class="w-[280px] bg-black/40 border border-white/10 rounded-xl p-4 sticky top-0 flex flex-col gap-6">
                                <h3 class="font-cinzel text-sm text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">
                                    <i class="fa-solid fa-crosshairs text-red-500 mr-2"></i> Ações Manuais
                                </h3>
                                
                                ${!focused ? html`<div class="text-xs text-gray-500 text-center">Selecione um alvo na fila</div>` : html`
                                    <div>
                                        <div class="text-xs text-tomeGold font-bold mb-2">ALVO: ${focused.name}</div>
                                        
                                        <div class="flex flex-col gap-2 mb-4">
                                            <input type="number" placeholder="Quantidade (HP)" value=${dmgInput} onInput=${e => setDmgInput(e.target.value)} class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:outline-none focus:border-tomeGold/50" />
                                            <div class="flex gap-2">
                                                <button onClick=${doDamage} class="flex-1 bg-red-900/40 hover:bg-red-700 border border-red-500/50 text-red-200 text-xs py-2 rounded font-bold transition-colors"><i class="fa-solid fa-burst"></i> Dano</button>
                                                <button onClick=${doHeal} class="flex-1 bg-emerald-900/40 hover:bg-emerald-700 border border-emerald-500/50 text-emerald-200 text-xs py-2 rounded font-bold transition-colors"><i class="fa-solid fa-hand-holding-medical"></i> Curar</button>
                                            </div>
                                        </div>

                                        <div class="flex flex-col gap-2">
                                            <select value=${selectedCond} onChange=${e => setSelectedCond(e.target.value)} class="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:outline-none focus:border-tomeGold/50">
                                                ${Object.entries(CONDITIONS).map(([k, v]) => html`<option value="${k}">${v.emoji} ${v.label}</option>`)}
                                            </select>
                                            <div class="flex gap-2">
                                                <button onClick=${applyCond} class="flex-1 bg-purple-900/40 hover:bg-purple-700 border border-purple-500/50 text-purple-200 text-xs py-2 rounded font-bold transition-colors"><i class="fa-solid fa-plus"></i> Condição</button>
                                                <button onClick=${clearConds} class="w-10 bg-white/5 hover:bg-white/20 border border-white/20 text-gray-300 text-xs py-2 rounded font-bold transition-colors" title="Limpar"><i class="fa-solid fa-eraser"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    `
                }
            </div>

            <!-- QUICK ADD FOOTER -->
            <div class="bg-black/60 border-t border-white/10 p-4">
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-400 font-bold uppercase tracking-widest"><i class="fa-solid fa-bolt text-tomeGold mr-1"></i> Quick Add</span>
                    <input type="text" placeholder="Nome" value=${quickAdd.name} onInput=${e => setQuickAdd(p => ({...p, name: e.target.value}))} class="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-tomeGold/50" />
                    <input type="number" placeholder="Inic" value=${quickAdd.init} onInput=${e => setQuickAdd(p => ({...p, init: e.target.value}))} class="w-16 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-tomeGold/50" title="Iniciativa (Vazio rola 1d20)" />
                    <input type="number" placeholder="HP" value=${quickAdd.hp} onInput=${e => setQuickAdd(p => ({...p, hp: e.target.value}))} class="w-16 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-tomeGold/50" />
                    <button onClick=${() => doQuickAdd('Monster')} class="px-3 py-1.5 bg-red-900/40 hover:bg-red-700 border border-red-500/50 text-red-200 text-xs rounded font-bold transition-colors">Inimigo</button>
                    <button onClick=${() => doQuickAdd('Player')} class="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-700 border border-emerald-500/50 text-emerald-200 text-xs rounded font-bold transition-colors">Herói</button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Wrapper de Componente V19.2.1
 * Mantém compatibilidade com o sistema de abas do Dashboard.js
 */
export class InitiativeMonitor extends Component {
    constructor(opts) {
        super(opts);
        this._broadcast = new BroadcastChannel('tome_map');
    }

    onMount() {}
    onUnmount() {
        if (this._broadcast) this._broadcast.close();
    }

    render() {
        if (!this.element) return;
        preactRender(html`<${InitiativeApp} store=${this.store} broadcastChannel=${this._broadcast} />`, this.element);
    }
}
