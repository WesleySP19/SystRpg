import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';

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
                if (!currentList[nextIndex].actions) {
                    currentList[nextIndex].actions = { action: true, bonus: true, reaction: true, movement: 30 };
                } else {
                    currentList[nextIndex].actions.action = true;
                    currentList[nextIndex].actions.bonus = true;
                    currentList[nextIndex].actions.reaction = true;
                    currentList[nextIndex].actions.movement = 30;
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
            
            const monster = customMonster || {
                id: 'm_' + Date.now(),
                name: 'Monstro Desconhecido',
                initiative: Math.floor(Math.random() * 20) + 1,
                isHero: false,
                type: 'monster',
                hp: 15,
                maxHp: 15,
                hp_max: 15,
                ac: 10,
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
                    const heroEntry = {
                        id: h.id,
                        name: h.name,
                        initiative: Math.floor(Math.random() * 20) + 1,
                        isHero: true,
                        type: 'Player',
                        hp: typeof h.hp === 'number' ? h.hp : (h.hp?.current || 10),
                        maxHp: h.maxHp || h.hp_max || (typeof h.hp === 'number' ? h.hp : h.hp?.max) || 10,
                        ac: h.ac || 10,
                        avatar: h.avatar || h.img || h.portraitData || '',
                        actions: { action: true, bonus: true, reaction: true, movement: 30 }
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
                if (typeof c.hp === 'number') {
                    c.hp = newHp;
                } else if (c.hp && typeof c.hp === 'object') {
                    c.hp.current = newHp;
                } else {
                    c.hp = newHp;
                }
            }
            if (s.initiativeOrder && s.combatants) {
                const legacyC = s.combatants.find(x => x.id === id);
                if (legacyC && legacyC !== c) legacyC.hp = newHp;
            }
        });
    };

    const toggleAction = (combatantId, actionKey) => {
        TOME.store.update(s => {
            const list = s.initiativeOrder || s.combatants || [];
            const target = list.find(c => c.id === combatantId);
            if (target) {
                if (!target.actions) {
                    target.actions = { action: true, bonus: true, reaction: true, movement: 30 };
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
        toggleAction
    };
}
