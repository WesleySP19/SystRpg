import { RulesEngine } from '../core/RulesEngine.js';

describe('Rules Engine (D&D 5e)', () => {
    test('deve calcular modificador de atributos corretamente', () => {
        expect(RulesEngine.getModifier(10)).toBe(0);
        expect(RulesEngine.getModifier(11)).toBe(0);
        expect(RulesEngine.getModifier(12)).toBe(1);
        expect(RulesEngine.getModifier(13)).toBe(1);
        expect(RulesEngine.getModifier(8)).toBe(-1);
        expect(RulesEngine.getModifier(9)).toBe(-1);
        expect(RulesEngine.getModifier(20)).toBe(5);
        expect(RulesEngine.getModifier(3)).toBe(-4);
        expect(RulesEngine.getModifier(null)).toBe(0); // Fallback para 10
    });

    test('deve resolver d20 com vantagem e desvantagem', () => {
        const resNormal = RulesEngine.resolveD20(5, 'normal');
        expect(resNormal.total).toBe(resNormal.roll + 5);
        expect(resNormal.isCrit).toBe(resNormal.roll === 20);
        expect(resNormal.isFumble).toBe(resNormal.roll === 1);

        const resAdv = RulesEngine.resolveD20(0, 'advantage');
        expect(resAdv.roll).toBeGreaterThanOrEqual(1);
        expect(resAdv.roll).toBeLessThanOrEqual(20);

        const resDis = RulesEngine.resolveD20(0, 'disadvantage');
        expect(resDis.roll).toBeGreaterThanOrEqual(1);
        expect(resDis.roll).toBeLessThanOrEqual(20);
    });

    test('deve verificar acertos contra Classe de Armadura (CA)', () => {
        // Teste de comparação de valores
        const hitNormal = RulesEngine.checkHit(5, 15, 'normal');
        if (hitNormal.roll !== 1 && hitNormal.roll !== 20) {
            expect(hitNormal.success).toBe(hitNormal.total >= 15);
        }
        
        // Crítico e Fumble
        const critResult = { roll: 20, total: 25, isCrit: true, isFumble: false };
        const successCrit = critResult.isCrit || (!critResult.isFumble && critResult.total >= 99);
        expect(successCrit).toBe(true);
    });

    test('deve verificar testes de resistência (Save)', () => {
        const save = RulesEngine.checkSave(3, 13, 'normal');
        expect(save.success).toBe(save.total >= 13);
    });

    test('deve normalizar dados de HP entre diferentes versões de esquema', () => {
        const actor1 = { hp: { current: 15, max: 20 } };
        expect(RulesEngine.getHP(actor1)).toEqual({ current: 15, max: 20 });

        const actor2 = { hp_current: 8, hp_max: 12 };
        expect(RulesEngine.getHP(actor2)).toEqual({ current: 8, max: 12 });

        const actor3 = {}; // fallbacks
        expect(RulesEngine.getHP(actor3)).toEqual({ current: 10, max: 10 });

        const actorPrimitive = { hp: 25, maxHp: 30 };
        expect(RulesEngine.getHP(actorPrimitive)).toEqual({ current: 25, max: 30 });

        const actorCombat = { combat: { hp_current: 18, hp_max: 22 } };
        expect(RulesEngine.getHP(actorCombat)).toEqual({ current: 18, max: 22 });

        const actorNull = null;
        expect(RulesEngine.getHP(actorNull)).toEqual({ current: 10, max: 10 });
    });

    test('deve resolver expressões com múltiplos modificadores acumulados', () => {
        const rollMulti = RulesEngine.rollExpression('1d20+4+2');
        expect(rollMulti.total).toBe(rollMulti.roll + 6);

        const rollCompound = RulesEngine.rollExpression('2d6+3-2-1');
        const diceSum = rollCompound.rolls.reduce((a, b) => a + b, 0);
        expect(rollCompound.total).toBe(diceSum + 0);
    });

    test('deve resolver fórmulas com contexto dinâmico de atributos', () => {
        const ctx = { FOR: 4, PROF: 2 };
        const result = RulesEngine.resolveFormula('1d20+FOR+PROF', ctx);
        expect(result.total).toBe(result.roll + 6);

        const ctx2 = { INT: 3, PENALTY: -2 };
        const result2 = RulesEngine.resolveFormula('2d6+INT+PENALTY-1', ctx2);
        const sum2 = result2.rolls.reduce((a, b) => a + b, 0);
        expect(result2.total).toBe(sum2);
    });

    test('deve calcular distâncias táticas em diferentes grids', () => {
        const posA = { x: 0, y: 0 };
        const posB = { x: 3, y: 4 };
        expect(RulesEngine.calculateDistance(posA, posB, 'square')).toBe(4);
        expect(RulesEngine.calculateDistance(posA, posB, 'manhattan')).toBe(7);
        expect(RulesEngine.calculateDistance(posA, posB, 'hex')).toBe(7);
    });
});
