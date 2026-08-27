import { Dice } from '../utils/Dice.js';
export class RulesEngine {
static currentRuleset = null;
static async loadRuleset(name = 'dnd5e') {
try {
const res = await fetch(`/data/rulesets/${name}.json`);
if (res.ok) {
this.currentRuleset = await res.json();
console.log(`[RulesEngine] Loaded ruleset: ${this.currentRuleset.name}`);
return this.currentRuleset;
}
} catch (e) {
console.error('[RulesEngine] Failed to load ruleset', e);
}
return null;
}
static getActiveRuleset() {
return this.currentRuleset;
}
static rollExpression(expression, mode = 'normal') {
const regex = /^(\d+)d(\d+)([\+\-]\d+)?$/i;
const match = expression.trim().match(regex);
if (!match) {
throw new Error(`Invalid dice expression: ${expression}. Expected format: 'XdY+Z'`);
}
const numDice = parseInt(match[1], 10);
const sides = parseInt(match[2], 10);
const modifierStr = match[3] || "+0";
const modifier = parseInt(modifierStr, 10);
let rolls = [];
let total = 0;
let isCrit = false;
let isFumble = false;
if (numDice === 1 && sides === 20) {
let r1 = Dice.quick(20);
let roll = r1;
if (mode === 'advantage') {
let r2 = Dice.quick(20);
roll = Math.max(r1, r2);
rolls = [r1, r2];
} else if (mode === 'disadvantage') {
let r2 = Dice.quick(20);
roll = Math.min(r1, r2);
rolls = [r1, r2];
} else {
rolls = [r1];
}
total = roll + modifier;
isCrit = roll === 20;
isFumble = roll === 1;
} else {
for (let i = 0; i < numDice; i++) {
rolls.push(Dice.quick(sides));
}
const diceTotal = rolls.reduce((sum, r) => sum + r, 0);
total = diceTotal + modifier;
}
return {
total,
rolls,
roll: (numDice === 1 && sides === 20) ? (total - modifier) : (rolls[0] || 0),
isCrit,
isFumble,
formula: expression
};
}
static resolveFormula(template, context, mode = 'normal') {
let parsedExpression = template;
if (context) {
for (const [key, value] of Object.entries(context)) {
const regex = new RegExp(`\\+?${key}`, 'g');
const valStr = value >= 0 ? `+${value}` : `${value}`;
parsedExpression = parsedExpression.replace(regex, valStr);
}
}
parsedExpression = parsedExpression.replace(/\+\+/g, '+').replace(/\+-/g, '-');
return this.rollExpression(parsedExpression, mode);
}
static getModifier(val) {
if (val === null || val === undefined) val = 10;
return Math.floor((val - 10) / 2);
}
static resolveD20(bonus = 0, mode = 'normal') {
const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
const res = this.rollExpression(`1d20${bonusStr}`, mode);
return { roll: res.roll, total: res.total, isCrit: res.isCrit, isFumble: res.isFumble };
}
static checkHit(attackBonus, targetAC, mode = 'normal') {
const bonusStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
const res = this.rollExpression(`1d20${bonusStr}`, mode);
const success = res.isCrit || (!res.isFumble && res.total >= targetAC);
return { success, isCrit: res.isCrit, total: res.total, roll: res.roll };
}
static checkSave(saveBonus, dc, mode = 'normal') {
const bonusStr = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`;
const res = this.rollExpression(`1d20${bonusStr}`, mode);
return { success: res.total >= dc, total: res.total, roll: res.roll };
}
static getHP(actor) {
const current = actor.hp?.current !== undefined ? actor.hp.current : (actor.hp_current !== undefined ? actor.hp_current : 10);
const max = actor.hp?.max !== undefined ? actor.hp.max : (actor.hp_max !== undefined ? actor.hp_max : 10);
return { current: parseInt(current), max: parseInt(max) };
}
static calculateDistance(posA, posB, gridType = 'square') {
if (!posA || !posB) return 0;
const x1 = posA.x !== undefined ? posA.x : (posA.q !== undefined ? posA.q : 0);
const y1 = posA.y !== undefined ? posA.y : (posA.r !== undefined ? posA.r : 0);
const x2 = posB.x !== undefined ? posB.x : (posB.q !== undefined ? posB.q : 0);
const y2 = posB.y !== undefined ? posB.y : (posB.r !== undefined ? posB.r : 0);
const dx = Math.abs(x1 - x2);
const dy = Math.abs(y1 - y2);
if (gridType === 'square' && (posA.q === undefined && posB.q === undefined)) {
return Math.max(dx, dy);
} else if (gridType === 'manhattan') {
return dx + dy;
} else {
const dz = Math.abs((x1 + y1) - (x2 + y2));
return Math.max(dx, dy, dz);
}
}
}