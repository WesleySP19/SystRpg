import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { RulesEngine } from '../../core/RulesEngine.js';

export function useCombat() {
    const initiativeOrder = useStore('initiativeOrder');
    const legacyCombatants = useStore('combatants');
    const combatants = (initiativeOrder && initiativeOrder.length > 0) ? initiativeOrder : (legacyCombatants || []);
    
    const combatRound = useStore('combatRound') || 1;
    const initiativeIndex = useStore('initiativeIndex');
    const legacyTurnIndex = useStore('turnIndex');
    const turnIndex = initiativeIndex !== undefined ? initiativeIndex : (legacyTurnIndex || 0);
    
    const players = useStore('players');
    const legacyHeroes = useStore('heroes');
    const heroes = (players && players.length > 0) ? players : (legacyHeroes || []);

    const nextTurn = () => {
        if (!combatants || combatants.length === 0) return;
        TOME.store.update(s => {
            const currentList = s.initiativeOrder || s.combatants || [];
            if (currentList.length === 0) return;
            const nextIndex = ((s.initiativeIndex !== undefined ? s.initiativeIndex : (s.turnIndex || 0)) + 1) % currentList.length;
            s.initiativeIndex = nextIndex;
            s.turnIndex = nextIndex;
            if (nextIndex === 0) {
                s.combatRound = (s.combatRound || 1) + 1;
            }
            // Reset action economy for the new turn combatant
            if (currentList[nextIndex]) {
                const c = currentList[nextIndex];
                if (!c.actions) {
                    c.actions = { action: true, bonus: true, reaction: true, movement: c.speed || 30 };
                } else {
                    c.actions.action = true;
                    c.actions.bonus = true;
                    c.actions.reaction = true;
                    c.actions.movement = c.speed || 30;
                }
            }
        });
    };

    const clearCombat = () => {
        if (confirm('Deseja realmente limpar a arena?')) {
            TOME.store.update(s => {
                s.combatants = [];
                s.initiativeOrder = [];
                s.turnIndex = 0;
                s.initiativeIndex = 0;
                s.combatRound = 1;
                s.combatActive = false;
            });
        }
    };

    const addMonster = (customMonster = null) => {
        TOME.store.update(s => {
            if (!s.initiativeOrder) s.initiativeOrder = [];
            if (!s.combatants) s.combatants = [];
            
            const maxHp = customMonster?.hp_max ?? customMonster?.hp?.max ?? customMonster?.hp ?? 15;
            const curHp = customMonster?.hp_current ?? customMonster?.hp?.current ?? customMonster?.hp ?? maxHp;

            const monster = customMonster ? {
                ...customMonster,
                hp: { current: curHp, max: maxHp },
                hp_current: curHp,
                hp_max: maxHp,
                actions: customMonster.actions || { action: true, bonus: true, reaction: true, movement: customMonster.speed || 30 }
            } : {
                id: 'm_' + Date.now(),
                name: 'Monstro Desconhecido',
                initiative: Math.floor(Math.random() * 20) + 1,
                isHero: false,
                type: 'monster',
                hp: { current: 15, max: 15 },
                hp_current: 15,
                hp_max: 15,
                ac: 10,
                conditions: [],
                actions: { action: true, bonus: true, reaction: true, movement: 30 }
            };
            
            s.initiativeOrder.push(monster);
            s.initiativeOrder.sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
            s.combatants = [...s.initiativeOrder];
            s.combatActive = true;
        });
    };

    const insertHeroes = () => {
        if (heroes.length === 0) return alert('Nenhum herói na sessão!');
        TOME.store.update(s => {
            if (!s.initiativeOrder) s.initiativeOrder = [];
            if (!s.combatants) s.combatants = [];
            
            heroes.forEach(h => {
                if (!s.initiativeOrder.find(c => c.id === h.id)) {
                    const hpInfo = RulesEngine.getHP(h);
                    const heroEntry = {
                        id: h.id,
                        name: h.name,
                        initiative: Math.floor(Math.random() * 20) + 1,
                        isHero: true,
                        type: 'Player',
                        hp: { current: hpInfo.current, max: hpInfo.max },
                        hp_current: hpInfo.current,
                        hp_max: hpInfo.max,
                        ac: h.ac || 10,
                        speed: h.speed || 30,
                        avatar: h.avatar || h.img || h.portraitData || '',
                        portraitData: h.portraitData || h.img || h.avatar || '',
                        conditions: h.conditions || [],
                        actions: { action: true, bonus: true, reaction: true, movement: h.speed || 30 }
                    };
                    s.initiativeOrder.push(heroEntry);
                }
            });
            s.initiativeOrder.sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
            s.combatants = [...s.initiativeOrder];
            s.combatActive = true;
        });
    };

    const rollInitiatives = () => {
        TOME.store.update(s => {
            const list = s.initiativeOrder || s.combatants;
            if (!list) return;
            list.forEach(c => {
                c.initiative = Math.floor(Math.random() * 20) + 1;
            });
            list.sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
            s.initiativeOrder = list;
            s.combatants = [...list];
            s.turnIndex = 0;
            s.initiativeIndex = 0;
        });
    };

    const removeCombatant = (id) => {
        TOME.store.update(s => {
            if (s.initiativeOrder) {
                s.initiativeOrder = s.initiativeOrder.filter(c => c.id !== id);
            }
            if (s.combatants) {
                s.combatants = s.combatants.filter(c => c.id !== id);
            }
            const len = (s.initiativeOrder || s.combatants || []).length;
            if ((s.initiativeIndex || 0) >= len) {
                s.initiativeIndex = Math.max(0, len - 1);
                s.turnIndex = s.initiativeIndex;
            }
        });
    };

    const updateCombatantHP = (id, newHp) => {
        TOME.store.update(s => {
            const list = s.initiativeOrder || s.combatants;
            const c = list?.find(x => x.id === id);
            if (c) {
                const hpInfo = RulesEngine.getHP(c);
                const safeHp = Math.max(0, Math.min(newHp, hpInfo.max || newHp));
                
                if (c.hp && typeof c.hp === 'object') {
                    c.hp.current = safeHp;
                } else {
                    c.hp = { current: safeHp, max: hpInfo.max || safeHp };
                }
                c.hp_current = safeHp;

                // Sincronização Bidirecional com s.players para Heróis
                if (c.isHero || c.type === 'Player') {
                    const hero = (s.players || []).find(p => p.id === id || p.name === c.name);
                    if (hero) {
                        if (hero.hp && typeof hero.hp === 'object') {
                            hero.hp.current = safeHp;
                        } else {
                            hero.hp = { current: safeHp, max: hero.hp_max || hero.maxHp || safeHp };
                        }
                        hero.hp_current = safeHp;
                    }
                }
            }

            if (s.combatants && s.combatants !== list) {
                const legacyC = s.combatants.find(x => x.id === id);
                if (legacyC && legacyC !== c) {
                    legacyC.hp = c.hp;
                    legacyC.hp_current = c.hp_current;
                }
            }
        });
    };

    const toggleAction = (combatantId, actionKey) => {
        TOME.store.update(s => {
            const list = s.initiativeOrder || s.combatants || [];
            const target = list.find(c => c.id === combatantId);
            if (target) {
                if (!target.actions) {
                    target.actions = { action: true, bonus: true, reaction: true, movement: target.speed || 30 };
                }
                if (actionKey === 'movement') {
                    target.actions.movement = target.actions.movement > 0 ? 0 : (target.speed || 30);
                } else {
                    target.actions[actionKey] = !target.actions[actionKey];
                }
            }
            if (s.combatants && s.combatants !== list) {
                const cTarget = s.combatants.find(c => c.id === combatantId);
                if (cTarget && target) {
                    cTarget.actions = { ...target.actions };
                }
            }
        });
    };

    const toggleCondition = (combatantId, condition) => {
        TOME.store.update(s => {
            const list = s.initiativeOrder || s.combatants || [];
            const target = list.find(c => c.id === combatantId);
            if (target) {
                target.conditions = target.conditions || [];
                const idx = target.conditions.indexOf(condition);
                if (idx >= 0) {
                    target.conditions.splice(idx, 1);
                } else {
                    target.conditions.push(condition);
                }

                // Sincronizar com s.players se for herói
                if (target.isHero || target.type === 'Player') {
                    const hero = (s.players || []).find(p => p.id === combatantId || p.name === target.name);
                    if (hero) {
                        hero.conditions = [...target.conditions];
                    }
                }
            }
        });
    };

    const partyRest = (type = 'short') => {
        TOME.store.update(s => {
            const isLong = type === 'long';
            
            // Atualiza s.players
            (s.players || []).forEach(p => {
                const hpInfo = RulesEngine.getHP(p);
                if (isLong) {
                    p.hp = { current: hpInfo.max, max: hpInfo.max };
                    p.hp_current = hpInfo.max;
                    p.conditions = (p.conditions || []).filter(c => c !== 'caído' && c !== 'envenenado');
                } else {
                    // Descanso curto cura pelo menos 25% ou 1 dado de vida
                    const healAmount = Math.max(1, Math.round(hpInfo.max * 0.25));
                    const newHp = Math.min(hpInfo.max, hpInfo.current + healAmount);
                    p.hp = { current: newHp, max: hpInfo.max };
                    p.hp_current = newHp;
                }
            });

            // Atualiza combatentes na arena se presentes
            (s.initiativeOrder || []).forEach(c => {
                if (c.isHero || c.type === 'Player') {
                    const hpInfo = RulesEngine.getHP(c);
                    if (isLong) {
                        c.hp = { current: hpInfo.max, max: hpInfo.max };
                        c.hp_current = hpInfo.max;
                        c.conditions = (c.conditions || []).filter(cond => cond !== 'caído' && cond !== 'envenenado');
                    } else {
                        const healAmount = Math.max(1, Math.round(hpInfo.max * 0.25));
                        const newHp = Math.min(hpInfo.max, hpInfo.current + healAmount);
                        c.hp = { current: newHp, max: hpInfo.max };
                        c.hp_current = newHp;
                    }
                }
            });
        });
    };

    const currentCombatant = combatants && combatants.length > 0 ? combatants[turnIndex] : null;

    return {
        combatants,
        combatRound,
        turnIndex,
        currentCombatant,
        nextTurn,
        clearCombat,
        addMonster,
        insertHeroes,
        rollInitiatives,
        removeCombatant,
        updateCombatantHP,
        toggleAction,
        toggleCondition,
        partyRest
    };
}
