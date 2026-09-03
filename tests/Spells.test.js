import { spellsData } from '../data/spells-5e.js';

describe('Grimório de Magias e Truques (D&D 5e Database)', () => {
    test('deve conter metadados e estrutura consistente', () => {
        expect(spellsData).toBeDefined();
        expect(spellsData.metadata).toBeDefined();
        expect(spellsData.metadata.system).toBe('D&D 5e');
        expect(Array.isArray(spellsData.cantrips)).toBe(true);
        expect(spellsData.cantrips.length).toBeGreaterThan(0);
        expect(spellsData.spellsByLevel).toBeDefined();
    });

    test('todos os truques devem possuir campos essenciais preenchidos', () => {
        spellsData.cantrips.forEach(cantrip => {
            expect(cantrip.id).toBeDefined();
            expect(cantrip.name).toBeTruthy();
            expect(cantrip.englishName).toBeTruthy();
            expect(Array.isArray(cantrip.classes)).toBe(true);
            expect(cantrip.classes.length).toBeGreaterThan(0);
            expect(cantrip.actionType).toBeDefined();
            expect(cantrip.range).toBeDefined();
            expect(cantrip.components).toBeDefined();
        });
    });

    test('magias por nível (1 a 5) devem possuir propriedades válidas e nível numérico coerente', () => {
        const levels = Object.keys(spellsData.spellsByLevel);
        expect(levels).toEqual(expect.arrayContaining(['1', '2', '3']));

        levels.forEach(lvlStr => {
            const levelNum = parseInt(lvlStr, 10);
            const spells = spellsData.spellsByLevel[lvlStr];
            expect(Array.isArray(spells)).toBe(true);

            spells.forEach(spell => {
                expect(spell.id).toBeDefined();
                expect(spell.name).toBeTruthy();
                expect(spell.englishName).toBeTruthy();
                expect(spell.level).toBe(levelNum);
                expect(Array.isArray(spell.classes)).toBe(true);
                expect(spell.range).toBeDefined();
                expect(spell.duration).toBeDefined();
            });
        });
    });

    test('deve permitir filtrar magias por classe (ex: Mago, Clérigo, Bruxo)', () => {
        const allSpells = [
            ...spellsData.cantrips.map(c => ({ ...c, level: 0 })),
            ...Object.values(spellsData.spellsByLevel).flat()
        ];

        const wizardSpells = allSpells.filter(s => s.classes && s.classes.includes('Mago'));
        const clericSpells = allSpells.filter(s => s.classes && s.classes.includes('Clérigo'));
        const warlockSpells = allSpells.filter(s => s.classes && s.classes.includes('Bruxo'));

        expect(wizardSpells.length).toBeGreaterThan(0);
        expect(clericSpells.length).toBeGreaterThan(0);
        expect(warlockSpells.length).toBeGreaterThan(0);

        // Toda magia filtrada de Mago realmente contém 'Mago' na lista de classes
        wizardSpells.forEach(s => {
            expect(s.classes).toContain('Mago');
        });
    });

    test('deve permitir busca por nome e desafio que resolve', () => {
        const allSpells = [
            ...spellsData.cantrips.map(c => ({ ...c, level: 0 })),
            ...Object.values(spellsData.spellsByLevel).flat()
        ];

        // Busca por Bola de Fogo
        const fireball = allSpells.find(s => s.name.toLowerCase().includes('bola de fogo') || s.englishName.toLowerCase().includes('fireball'));
        expect(fireball).toBeDefined();
        expect(fireball.damageType).toBe('Fogo');
        expect(fireball.level).toBe(3);

        // Busca por Rajada Mística
        const eldritchBlast = allSpells.find(s => s.name.toLowerCase().includes('rajada mística'));
        expect(eldritchBlast).toBeDefined();
        expect(eldritchBlast.level).toBe(0);
        expect(eldritchBlast.classes).toContain('Bruxo');
    });
});
