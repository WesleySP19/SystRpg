import { Dice } from '../utils/Dice.js';
export class LootEngine {
static XP_THRESHOLDS = {
1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};
static generateIndividual(cr) {
const roll = Dice.quick(100);
let loot = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
if (cr <= 4) {
if (roll <= 30) loot.cp = Dice.roll('5d6').total;
else if (roll <= 60) loot.sp = Dice.roll('4d6').total;
else if (roll <= 70) loot.ep = Dice.roll('3d6').total;
else if (roll <= 95) loot.gp = Dice.roll('3d6').total;
else loot.pp = Dice.roll('1d6').total;
} else if (cr <= 10) {
if (roll <= 30) {
loot.cp = Dice.roll('4d6').total * 100;
loot.ep = Dice.roll('1d6').total * 10;
} else if (roll <= 60) {
loot.sp = Dice.roll('6d6').total * 10;
loot.gp = Dice.roll('2d6').total * 10;
} else if (roll <= 70) {
loot.ep = Dice.roll('3d6').total * 10;
loot.gp = Dice.roll('2d6').total * 10;
} else if (roll <= 95) {
loot.gp = Dice.roll('4d6').total * 10;
} else {
loot.gp = Dice.roll('2d6').total * 10;
loot.pp = Dice.roll('3d6').total;
}
} else if (cr <= 16) {
if (roll <= 20) {
loot.sp = Dice.roll('4d6').total * 100;
loot.gp = Dice.roll('1d6').total * 100;
} else if (roll <= 35) {
loot.ep = Dice.roll('1d6').total * 100;
loot.gp = Dice.roll('1d6').total * 100;
} else if (roll <= 75) {
loot.gp = Dice.roll('2d6').total * 100;
loot.pp = Dice.roll('1d6').total * 10;
} else {
loot.gp = Dice.roll('2d6').total * 100;
loot.pp = Dice.roll('2d6').total * 10;
}
} else {
if (roll <= 15) {
loot.gp = Dice.roll('2d6').total * 1000;
loot.pp = Dice.roll('8d6').total * 100;
} else if (roll <= 55) {
loot.gp = Dice.roll('1d6').total * 1000;
loot.pp = Dice.roll('1d6').total * 100;
} else {
loot.gp = Dice.roll('2d6').total * 1000;
loot.pp = Dice.roll('2d6').total * 100;
}
}
return loot;
}
static generateEncounterLoot(monsters = []) {
const agg = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, details: [] };
if (!Array.isArray(monsters) || monsters.length === 0) return agg;
for (let m of monsters) {
const qty = parseInt(m.qty) || 1;
const cr = parseFloat(m.cr) || 0;
for (let i = 0; i < qty; i++) {
const loot = this.generateIndividual(cr);
agg.cp += loot.cp || 0;
agg.sp += loot.sp || 0;
agg.ep += loot.ep || 0;
agg.gp += loot.gp || 0;
agg.pp += loot.pp || 0;
agg.details.push({ cr, loot });
}
}
return agg;
}
static getEncounterDifficulty(partyLevels, monsterXPs) {
const totalMonsterXP = monsterXPs.reduce((a, b) => a + b, 0);
let partyThresholds = { easy: 0, medium: 0, hard: 0, deadly: 0 };
partyLevels.forEach((lvl) => {
const t = this.XP_THRESHOLDS[lvl] || this.XP_THRESHOLDS[1];
partyThresholds.easy += t.easy;
partyThresholds.medium += t.medium;
partyThresholds.hard += t.hard;
partyThresholds.deadly += t.deadly;
});
if (totalMonsterXP >= partyThresholds.deadly) return 'DEADLY';
if (totalMonsterXP >= partyThresholds.hard) return 'HARD';
if (totalMonsterXP >= partyThresholds.medium) return 'MEDIUM';
return 'EASY';
}
}