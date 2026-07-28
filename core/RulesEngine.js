import { Dice } from '../utils/Dice.js';

/**
 * RULES ENGINE v2.0 — Agnostic Core
 * Parses generic dice expressions and resolves tests dynamically for multiple systems.
 */
export class RulesEngine {
    /**
     * Parses and rolls a dice expression like '1d20+5' or '2d6-1'.
     * @param {string} expression 
     * @param {string} mode — 'normal' | 'advantage' | 'disadvantage'
     * @returns {Object} { total, rolls, isCrit, isFumble, formula }
     */
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
            // Special handling for d20 to support advantage/disadvantage
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
            isCrit,
            isFumble,
            formula: expression
        };
    }

    /**
     * Resolves a RuleEngine formula using a context (attributes/skills).
     * Ex: resolveFormula("1d20+FOR", { FOR: 3 }) => rolls "1d20+3"
     * @param {string} template 
     * @param {Object} context 
     * @param {string} mode
     */
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

    // --- Backwards Compatibility Wrappers (Will be deprecated when UI adapts) ---

    static checkHit(attackBonus, targetAC, mode = 'normal') {
        const bonusStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
        const res = this.rollExpression(`1d20${bonusStr}`, mode);
        const success = res.isCrit || (!res.isFumble && res.total >= targetAC);
        return { success, isCrit: res.isCrit, total: res.total, roll: res.rolls[0] || res.total };
    }

    static checkSave(saveBonus, dc, mode = 'normal') {
        const bonusStr = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`;
        const res = this.rollExpression(`1d20${bonusStr}`, mode);
        return { success: res.total >= dc, total: res.total, roll: res.rolls[0] || res.total };
    }

    static getHP(actor) {
        const current = actor.hp?.current !== undefined ? actor.hp.current : (actor.hp_current !== undefined ? actor.hp_current : 10);
        const max = actor.hp?.max !== undefined ? actor.hp.max : (actor.hp_max !== undefined ? actor.hp_max : 10);
        return { current: parseInt(current), max: parseInt(max) };
    }
}
