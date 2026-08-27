import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
export function useCombat() {
const combatants = useStore('combatants') || [];
const combatRound = useStore('combatRound') || 1;
const turnIndex = useStore('turnIndex') || 0;
const heroes = useStore('heroes') || [];
const nextTurn = () => {
if (!combatants || combatants.length === 0) return;
TOME.store.update(s => {
const nextIndex = (s.turnIndex + 1) % s.combatants.length;
s.turnIndex = nextIndex;
if (nextIndex === 0) {
s.combatRound = (s.combatRound || 1) + 1;
}
});
};
const clearCombat = () => {
if (confirm('Deseja realmente limpar a arena?')) {
TOME.store.update(s => {
s.combatants = [];
s.turnIndex = 0;
s.combatRound = 1;
});
}
};
const addMonster = () => {
TOME.store.update(s => {
if (!s.combatants) s.combatants = [];
s.combatants.push({
id: 'm_' + Date.now(),
name: 'Monstro Desconhecido',
initiative: Math.floor(Math.random() * 20) + 1,
isHero: false,
hp: 15, maxHp: 15,
ac: 10
});
s.combatants.sort((a, b) => b.initiative - a.initiative);
});
};
const insertHeroes = () => {
if (heroes.length === 0) return alert('Nenhum herói na sessão!');
TOME.store.update(s => {
if (!s.combatants) s.combatants = [];
heroes.forEach(h => {
if (!s.combatants.find(c => c.id === h.id)) {
s.combatants.push({
id: h.id,
name: h.name,
initiative: Math.floor(Math.random() * 20) + 1,
isHero: true,
hp: h.hp || 10, maxHp: h.maxHp || 10,
ac: h.ac || 10
});
}
});
s.combatants.sort((a, b) => b.initiative - a.initiative);
});
};
const rollInitiatives = () => {
TOME.store.update(s => {
if (!s.combatants) return;
s.combatants.forEach(c => {
c.initiative = Math.floor(Math.random() * 20) + 1;
});
s.combatants.sort((a, b) => b.initiative - a.initiative);
s.turnIndex = 0;
});
};
const removeCombatant = (id) => {
TOME.store.update(s => {
if (!s.combatants) return;
s.combatants = s.combatants.filter(c => c.id !== id);
if (s.turnIndex >= s.combatants.length) {
s.turnIndex = Math.max(0, s.combatants.length - 1);
}
});
};
const updateCombatantHP = (id, newHp) => {
TOME.store.update(s => {
const c = s.combatants?.find(x => x.id === id);
if (c) c.hp = newHp;
});
};
return {
combatants,
combatRound,
turnIndex,
nextTurn,
clearCombat,
addMonster,
insertHeroes,
rollInitiatives,
removeCombatant,
updateCombatantHP
};
}