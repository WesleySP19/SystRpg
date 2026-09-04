import { Schemas } from '../data/schemas.js';
import { MonsterData } from '../data/MonsterData.js';

describe('Bestiary & Monster Forge Engine', () => {
    test('should contain valid SRD MonsterData definitions across levels', () => {
        expect(MonsterData['Nível 1']).toBeDefined();
        expect(MonsterData['Nível 1'].length).toBeGreaterThan(0);
        expect(MonsterData['BOSS']).toBeDefined();
        expect(MonsterData['BOSS'].length).toBeGreaterThan(0);

        const goblin = MonsterData['Nível 1'].find(m => m.name === 'Goblin');
        expect(goblin).toBeDefined();
        expect(goblin.ac).toBe(15);
        expect(goblin.hp).toBe(7);
        expect(Array.isArray(goblin.actions)).toBe(true);
    });

    test('should create and validate forged monster using Schemas.createMonster', () => {
        const forged = Schemas.createMonster({
            name: 'Devorador das Sombras',
            type: 'Aberração',
            cr: '5',
            ac: 16,
            hp: { current: 95, max: 95 },
            stats: { str: 18, dex: 14, con: 16, int: 12, wis: 14, cha: 10 },
            actions: [
                { name: 'Mordida Abissal', bonus: 7, damage: '2d8+4' },
                { name: 'Tentáculo Sombrio', bonus: 7, damage: '1d10+4' }
            ],
            notes: 'Sensível à luz solar direta. Resistência a dano psíquico.'
        });

        expect(forged.id).toBeDefined();
        expect(forged.name).toBe('Devorador das Sombras');
        expect(forged.type).toBe('Aberração');
        expect(forged.cr).toBe('5');
        expect(forged.ac).toBe(16);
        expect(forged.hp.max).toBe(95);
        expect(forged.actions.length).toBe(2);
        expect(forged.stats.str).toBe(18);
    });

    test('should handle cloning existing monsters with fresh IDs and clone suffix', () => {
        const original = MonsterData['Nível 1'][0]; // Goblin
        const cloned = Schemas.createMonster({
            ...original,
            id: `custom_${Date.now()}_test`,
            name: `${original.name} (Clone)`,
            level: 'Nível 1'
        });

        expect(cloned.id).toContain('custom_');
        expect(cloned.name).toBe('Goblin (Clone)');
        expect(cloned.ac).toBe(original.ac);
        expect(cloned.actions).toEqual(original.actions);
    });

    test('should build valid combat summoning entity payload', () => {
        const monster = {
            name: 'Troll',
            level: 'Nível 5',
            cr: '5',
            hp: 84,
            ac: 15,
            emoji: '👺',
            type: 'Gigante'
        };

        const maxHp = typeof monster.hp === 'object' ? (monster.hp.max ?? monster.hp.current ?? 10) : (Number(monster.hp) || 10);
        const entity = {
            id: 'm-' + Date.now(),
            name: monster.name,
            cr: monster.cr,
            hp_max: maxHp,
            hp: maxHp,
            ac: monster.ac || 10,
            emoji: monster.emoji || '👹',
            img: '',
            size: 'Grande',
            speed: '30 ft.',
            type: 'monster',
            originalData: { ...monster }
        };

        expect(entity.id).toBeDefined();
        expect(entity.name).toBe('Troll');
        expect(entity.hp_max).toBe(84);
        expect(entity.hp).toBe(84);
        expect(entity.ac).toBe(15);
        expect(entity.cr).toBe('5');
        expect(entity.originalData).toBeDefined();
    });

    test('should filter monsters accurately by type, level and query', () => {
        const creatures = [
            { name: 'Goblin', type: 'Humanoide', level: 'Nível 1', isCustom: false },
            { name: 'Esqueleto', type: 'Morto-Vivo', level: 'Nível 1', isCustom: false },
            { name: 'Ogre', type: 'Gigante', level: 'Nível 2', isCustom: false },
            { name: 'Lorde Vampiro', type: 'Morto-Vivo', level: 'Nível 15', isCustom: true }
        ];

        // Filter by Level
        const level1 = creatures.filter(c => c.level === 'Nível 1');
        expect(level1.length).toBe(2);

        // Filter by Type
        const undead = creatures.filter(c => c.type === 'Morto-Vivo');
        expect(undead.length).toBe(2);

        // Filter by Source (Custom)
        const customOnly = creatures.filter(c => c.isCustom);
        expect(customOnly.length).toBe(1);
        expect(customOnly[0].name).toBe('Lorde Vampiro');

        // Query Search
        const search = creatures.filter(c => c.name.toLowerCase().includes('og'));
        expect(search.length).toBe(1);
        expect(search[0].name).toBe('Ogre');
    });
});
