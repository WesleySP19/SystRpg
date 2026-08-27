import { LootEngine } from '../services/LootEngine.js';
function rollInitiative(dexMod = 0) {
return Math.ceil(Math.random() * 20) + dexMod;
}
function getDexMod(dex = 10) {
return Math.floor((dex - 10) / 2);
}
export const combat = {
startCombat(tokens) {
if (!tokens || tokens.length === 0) return [];
const rolled = tokens.map(tok => {
const dex = tok.stats?.dex || 10;
const mod = getDexMod(dex);
const initiative = rollInitiative(mod);
return {
id: tok.id,
entityId: tok.entityId || tok.id,
name: tok.name,
type: tok.type,
initiative,
modifier: mod,
img: tok.img || null,
emoji: tok.emoji || null,
};
});
rolled.sort((a, b) => {
if (b.initiative !== a.initiative) return b.initiative - a.initiative;
return b.modifier - a.modifier;
});
return rolled;
},
nextTurn(order, currentIndex) {
if (!order || order.length === 0) return 0;
return (currentIndex + 1) % order.length;
},
endCombat() {
return {
combatActive: false,
combatRound: 1,
initiativeIndex: 0,
initiativeOrder: []
};
},
generateEncounterReport(defeated, survivorTokens, playersStore, monstersStore, contributions, combatRound) {
const crXP = {
"0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700,
"4": 1100, "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000,
"10": 5900, "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
"16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000, "21": 33000,
"BOSS": 50000
};
let totalXP = 0;
defeated.forEach(m => {
let cr = '1';
const orig = monstersStore.find(x => x.id === m.entityId || x.name === m.name);
if (orig && orig.cr) {
cr = String(orig.cr);
} else if (m.cr) {
cr = String(m.cr);
}
let crStr = cr.replace('Nível ', '').trim();
totalXP += crXP[crStr] || 200;
});
let totalScore = 0;
const scores = {};
playersStore.forEach(p => {
const contrib = contributions[p.id] || { damage: 0, healing: 0, actions: 0 };
const score = (contrib.damage * 1.0) + (contrib.healing * 1.5) + (contrib.actions * 1.0);
scores[p.id] = score;
totalScore += score;
});
const rewards = playersStore.map(p => {
const contrib = contributions[p.id] || { damage: 0, healing: 0, actions: 0 };
const score = scores[p.id] || 0;
const pct = totalScore > 0 ? (score / totalScore) : (1 / playersStore.length);
const baseShare = playersStore.length > 0 ? Math.round((totalXP * 0.40) / playersStore.length) : 0;
const perfShare = totalScore > 0 ? Math.round((totalXP * 0.60) * pct) : Math.round((totalXP * 0.60) / playersStore.length);
const finalXP = baseShare + perfShare;
return {
playerId: p.id,
name: p.name,
damage: contrib.damage || 0,
healing: contrib.healing || 0,
actions: contrib.actions || 0,
pct: Math.round(pct * 100),
xpEarned: finalXP
};
});
const xpShare = playersStore.length > 0 ? Math.floor(totalXP / playersStore.length) : 0;
let totalLoot = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
defeated.forEach(m => {
let crNum = 1;
const orig = monstersStore.find(x => x.id === m.entityId || x.name === m.name);
if (orig && orig.cr) {
crNum = parseInt(orig.cr.replace('Nível ', '')) || 1;
}
try {
const individual = LootEngine.generateIndividual(crNum);
if (individual) {
totalLoot.cp += (individual.cp || 0);
totalLoot.sp += (individual.sp || 0);
totalLoot.ep += (individual.ep || 0);
totalLoot.gp += (individual.gp || 0);
totalLoot.pp += (individual.pp || 0);
}
} catch(e) {}
});
const defeatedNames = defeated.map(m => m.name);
const survivorNames = survivorTokens.map(t => t.name);
const summaryText = `O grupo de heróis concluiu o combate em ${combatRound} rodadas! Inimigos derrotados: ${defeatedNames.join(', ') || 'Nenhum'}. Sobreviventes: ${survivorNames.join(', ') || 'Nenhum'}.`;
return {
defeatedCount: defeated.length,
defeatedNames,
survivorNames,
totalXP,
xpShare,
rewards,
totalLoot,
summaryText,
combatRound
};
},
applyEncounterRewards(report, playersStore) {
if (!report) return playersStore;
const levelsXP = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
return playersStore.map(p => {
const rew = report.rewards.find(r => r.playerId === p.id);
const xpEarned = rew ? rew.xpEarned : 0;
const oldXP = parseInt(p.xp) || 0;
const newXP = oldXP + xpEarned;
let oldLvl = parseInt(p.level) || 1;
let newLvl = oldLvl;
while (newLvl < 20 && newXP >= levelsXP[newLvl + 1]) {
newLvl++;
}
return { ...p, xp: newXP, level: newLvl };
});
}
};