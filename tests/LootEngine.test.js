import { LootEngine } from '../services/LootEngine.js';

describe('Loot Engine (D&D 5e & Encontros)', () => {
    test('deve conter a tabela oficial de XP Thresholds para níveis 1 a 20', () => {
        expect(LootEngine.XP_THRESHOLDS).toBeDefined();
        expect(LootEngine.XP_THRESHOLDS[1]).toEqual({ easy: 25, medium: 50, hard: 75, deadly: 100 });
        expect(LootEngine.XP_THRESHOLDS[5]).toEqual({ easy: 250, medium: 500, hard: 750, deadly: 1100 });
        expect(LootEngine.XP_THRESHOLDS[20]).toEqual({ easy: 2800, medium: 5700, hard: 8500, deadly: 12700 });
    });

    test('deve gerar tesouro individual válido para qualquer CR', () => {
        const crs = [0, 1, 4, 5, 10, 11, 16, 17, 20];
        crs.forEach(cr => {
            const loot = LootEngine.generateIndividual(cr);
            expect(loot).toBeDefined();
            expect(typeof loot.cp).toBe('number');
            expect(typeof loot.sp).toBe('number');
            expect(typeof loot.ep).toBe('number');
            expect(typeof loot.gp).toBe('number');
            expect(typeof loot.pp).toBe('number');
            expect(loot.cp).toBeGreaterThanOrEqual(0);
            expect(loot.sp).toBeGreaterThanOrEqual(0);
            expect(loot.ep).toBeGreaterThanOrEqual(0);
            expect(loot.gp).toBeGreaterThanOrEqual(0);
            expect(loot.pp).toBeGreaterThanOrEqual(0);

            // Ao menos uma moeda deve ter sido concedida
            const totalCoins = loot.cp + loot.sp + loot.ep + loot.gp + loot.pp;
            expect(totalCoins).toBeGreaterThan(0);
        });
    });

    test('deve gerar e agregar loot para encontros múltiplos', () => {
        const encounter = [
            { cr: 1, qty: 3 },
            { cr: 5, qty: 1 }
        ];

        const aggregated = LootEngine.generateEncounterLoot(encounter);
        expect(aggregated).toBeDefined();
        expect(aggregated.details).toHaveLength(4); // 3 de CR 1 + 1 de CR 5
        
        const sumCoins = aggregated.cp + aggregated.sp + aggregated.ep + aggregated.gp + aggregated.pp;
        expect(sumCoins).toBeGreaterThan(0);

        // Se passar array vazio, deve retornar zeros
        const emptyResult = LootEngine.generateEncounterLoot([]);
        expect(emptyResult).toEqual({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, details: [] });
    });

    test('deve calcular a dificuldade do encontro corretamente', () => {
        // Grupo de 4 personagens nível 1:
        // Easy: 100, Medium: 200, Hard: 300, Deadly: 400
        const party = [1, 1, 1, 1];
        
        expect(LootEngine.getEncounterDifficulty(party, [50])).toBe('EASY');
        expect(LootEngine.getEncounterDifficulty(party, [200])).toBe('MEDIUM');
        expect(LootEngine.getEncounterDifficulty(party, [300])).toBe('HARD');
        expect(LootEngine.getEncounterDifficulty(party, [450])).toBe('DEADLY');
    });
});
