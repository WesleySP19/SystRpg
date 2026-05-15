/**
 * DATA SCHEMAS v3.1
 * Full D&D 5e character sheet structure.
 */
export const Schemas = {
    createPlayer: (overrides = {}) => ({
        id: crypto.randomUUID(),
        name: 'Herói Desconhecido',
        race: 'Humano',
        class: 'Guerreiro',
        subclass: '',
        level: 1,
        background: '',
        alignment: 'Neutro',
        xp: 0,
        portraitData: null, // Base64 image data
        portraitSettings: { x: 0, y: 0, scale: 1 }, // Custom positioning
        hp: { current: 10, max: 10, temp: 0 },
        ac: 10,
        speed: 30,
        initiative: 0,
        proficiencyBonus: 2,
        hitDice: '1d10',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        savingThrows: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
        skills: [],
        attacks: [],   // { name, bonus, damage, type }
        features: [],  // { name, description }
        spellcasting: {
            ability: '',
            dc: 0,
            attackBonus: 0,
            slots: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            spells: []    // { name, level, school }
        },
        equipment: [],
        conditions: [],
        deathSaves: { successes: 0, failures: 0 },
        bio: '',
        roleplay: {
            traits: '',
            ideals: '',
            bonds: '',
            flaws: ''
        },
        equipment: {
            items: '',
            gold: 0,
            silver: 0,
            copper: 0
        },
        proficiencies: {
            languages: '',
            tools: ''
        },
        createdAt: new Date().toISOString(),
        ...overrides
    }),

    createMonster: (overrides = {}) => ({
        id: crypto.randomUUID(),
        name: 'Goblin',
        type: 'Humanoide',
        cr: '1/4',
        hp: { current: 7, max: 7 },
        ac: 15,
        stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
        conditions: [],
        traits: [],
        actions: [],
        notes: '',
        createdAt: new Date().toISOString(),
        ...overrides
    })
};
