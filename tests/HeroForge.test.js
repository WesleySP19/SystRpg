import { Schemas } from '../data/schemas.js';

describe('HeroForge & Character Creation Mechanics', () => {
    // Point Buy Cost Table (D&D 5e Standard)
    const POINT_BUY_COSTS = {
        8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
    };

    const getMod = (val) => Math.floor(((parseInt(val) || 10) - 10) / 2);
    const getProfBonus = (lvl) => Math.floor(((parseInt(lvl) || 1) - 1) / 4) + 2;

    test('should calculate Point Buy budget correctly for standard array and min/max stats', () => {
        // All 8s = 0 points spent
        const all8 = [8, 8, 8, 8, 8, 8];
        const spentAll8 = all8.reduce((acc, s) => acc + POINT_BUY_COSTS[s], 0);
        expect(spentAll8).toBe(0);
        expect(27 - spentAll8).toBe(27);

        // Standard Array (15, 14, 13, 12, 10, 8) -> 9 + 7 + 5 + 4 + 2 + 0 = 27 points
        const standardArray = [15, 14, 13, 12, 10, 8];
        const spentStandard = standardArray.reduce((acc, s) => acc + POINT_BUY_COSTS[s], 0);
        expect(spentStandard).toBe(27);
        expect(27 - spentStandard).toBe(0);
    });

    test('should calculate ability modifiers accurately', () => {
        expect(getMod(8)).toBe(-1);
        expect(getMod(9)).toBe(-1);
        expect(getMod(10)).toBe(0);
        expect(getMod(11)).toBe(0);
        expect(getMod(12)).toBe(1);
        expect(getMod(14)).toBe(2);
        expect(getMod(16)).toBe(3);
        expect(getMod(18)).toBe(4);
        expect(getMod(20)).toBe(5);
    });

    test('should scale proficiency bonus accurately across levels 1 to 20', () => {
        expect(getProfBonus(1)).toBe(2);
        expect(getProfBonus(4)).toBe(2);
        expect(getProfBonus(5)).toBe(3);
        expect(getProfBonus(8)).toBe(3);
        expect(getProfBonus(9)).toBe(4);
        expect(getProfBonus(12)).toBe(4);
        expect(getProfBonus(13)).toBe(5);
        expect(getProfBonus(16)).toBe(5);
        expect(getProfBonus(17)).toBe(6);
        expect(getProfBonus(20)).toBe(6);
    });

    test('should suggest correct base HP depending on class hitDie and CON mod', () => {
        const calculateHp = (hitDie, conScore, level) => {
            const conMod = getMod(conScore);
            return hitDie + conMod + (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod);
        };

        // Level 1 Guerreiro (d10), CON 14 (+2) -> 10 + 2 = 12 HP
        expect(calculateHp(10, 14, 1)).toBe(12);

        // Level 3 Guerreiro (d10), CON 14 (+2) -> 12 + 2 * (5 + 1 + 2) = 12 + 16 = 28 HP
        expect(calculateHp(10, 14, 3)).toBe(28);

        // Level 1 Mago (d6), CON 10 (+0) -> 6 HP
        expect(calculateHp(6, 10, 1)).toBe(6);

        // Level 1 Bárbaro (d12), CON 16 (+3) -> 15 HP
        expect(calculateHp(12, 16, 1)).toBe(15);
    });

    test('should construct valid player object conforming to Schemas.createPlayer', () => {
        const hero = Schemas.createPlayer({
            name: 'Valerius Flameheart',
            class: 'Paladino',
            subclass: 'Juramento da Devoção',
            level: 5,
            stats: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 16 },
            hp: { current: 44, max: 44, temp: 0 },
            ac: 18,
            speed: 30,
            proficiencyBonus: 3
        });

        expect(hero.id).toBeDefined();
        expect(hero.name).toBe('Valerius Flameheart');
        expect(hero.class).toBe('Paladino');
        expect(hero.level).toBe(5);
        expect(hero.hp.max).toBe(44);
        expect(hero.ac).toBe(18);
        expect(hero.stats.str).toBe(16);
        expect(hero.proficiencyBonus).toBe(3);
        expect(Array.isArray(hero.skills)).toBe(true);
        expect(Array.isArray(hero.attacks)).toBe(true);
        expect(hero.currency).toBeDefined();
    });
});
