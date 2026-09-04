import { Dice } from '../utils/Dice.js';

describe('Dice Engine', () => {
    test('deve rolar um dado simples corretamente', () => {
        const res = Dice.roll('1d20');
        expect(res.error).toBeUndefined();
        expect(res.total).toBeGreaterThanOrEqual(1);
        expect(res.total).toBeLessThanOrEqual(20);
        expect(res.rolls.length).toBe(1);
        expect(res.sides).toBe(20);
        expect(res.count).toBe(1);
    });

    test('deve aplicar modificadores positivos e negativos', () => {
        const resPos = Dice.roll('1d6+4');
        expect(resPos.total).toBeGreaterThanOrEqual(5);
        expect(resPos.total).toBeLessThanOrEqual(10);
        expect(resPos.modifier).toBe(4);

        const resNeg = Dice.roll('1d8-2');
        expect(resNeg.total).toBeGreaterThanOrEqual(-1);
        expect(resNeg.total).toBeLessThanOrEqual(6);
        expect(resNeg.modifier).toBe(-2);
    });

    test('deve tratar vantagem (kh1) e desvantagem (kl1)', () => {
        const resAdv = Dice.roll('2d20kh1+5');
        expect(resAdv.rolls.length).toBe(2);
        expect(resAdv.finalRolls.length).toBe(1);
        expect(resAdv.finalRolls[0]).toBe(Math.max(...resAdv.rolls));
        expect(resAdv.total).toBe(resAdv.finalRolls[0] + 5);

        const resDis = Dice.roll('2d20kl1-1');
        expect(resDis.rolls.length).toBe(2);
        expect(resDis.finalRolls.length).toBe(1);
        expect(resDis.finalRolls[0]).toBe(Math.min(...resDis.rolls));
        expect(resDis.total).toBe(resDis.finalRolls[0] - 1);
    });

    test('deve retornar erro para notações inválidas', () => {
        const res = Dice.roll('invalid_notation');
        expect(res.error).toBeDefined();
        expect(res.error).toContain('Formato de dado inválido');
    });

    test('deve aceitar números simples apenas como modificadores', () => {
        const res = Dice.roll('+5');
        expect(res.total).toBe(5);
        expect(res.modifier).toBe(5);
        expect(res.rolls.length).toBe(0);
    });

    test('quick deve rolar um valor aleatório dentro do limite', () => {
        for (let i = 0; i < 50; i++) {
            const val = Dice.quick(6);
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(6);
        }
    });

    test('deve suportar lados numéricos e notações simplificadas (Dice.roll(20), d20)', () => {
        const resNumeric = Dice.roll(20);
        expect(resNumeric.error).toBeUndefined();
        expect(resNumeric.total).toBeGreaterThanOrEqual(1);
        expect(resNumeric.total).toBeLessThanOrEqual(20);

        const resD20 = Dice.roll('d20');
        expect(resD20.error).toBeUndefined();
        expect(resD20.total).toBeGreaterThanOrEqual(1);
        expect(resD20.total).toBeLessThanOrEqual(20);
    });

    test('deve suportar macros do jogador mobile 2d20h1 e 2d20l1', () => {
        const resAdv = Dice.roll('2d20h1+3');
        expect(resAdv.error).toBeUndefined();
        expect(resAdv.rolls.length).toBe(2);
        expect(resAdv.finalRolls.length).toBe(1);
        expect(resAdv.finalRolls[0]).toBe(Math.max(...resAdv.rolls));
        expect(resAdv.total).toBe(resAdv.finalRolls[0] + 3);

        const resDis = Dice.roll('2d20l1');
        expect(resDis.error).toBeUndefined();
        expect(resDis.rolls.length).toBe(2);
        expect(resDis.finalRolls.length).toBe(1);
        expect(resDis.finalRolls[0]).toBe(Math.min(...resDis.rolls));
    });
});
