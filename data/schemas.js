/**
 * DATA SCHEMAS v4.0
 * Full D&D 5e character sheet structure.
 * Uses deep merge so imported data is never overwritten by defaults.
 */

/**
 * Deep merge: source values override defaults, but missing keys fall back to defaults.
 */
function deepMerge(defaults, overrides) {
    if (!overrides || typeof overrides !== 'object') return defaults;
    const result = { ...defaults };
    for (const key of Object.keys(overrides)) {
        const defVal = defaults[key];
        const ovrVal = overrides[key];
        if (
            ovrVal !== null &&
            ovrVal !== undefined &&
            typeof ovrVal === 'object' &&
            !Array.isArray(ovrVal) &&
            typeof defVal === 'object' &&
            defVal !== null &&
            !Array.isArray(defVal)
        ) {
            result[key] = deepMerge(defVal, ovrVal);
        } else if (ovrVal !== undefined) {
            result[key] = ovrVal;
        }
    }
    return result;
}

export const Schemas = {
    createPlayer: (overrides = {}) => {
        const defaults = {
            id: crypto.randomUUID(),
            name: 'Herói Desconhecido',
            race: 'Humano',
            class: 'Guerreiro',
            subclass: '',
            level: 1,
            background: '',
            playerName: '',
            alignment: 'Neutro',
            xp: 0,
            portraitData: null,
            portraitSettings: { x: 0, y: 0, scale: 1 },
            hp: { current: 10, max: 10, temp: 0 },
            ac: 10,
            speed: 30,
            initiative: 0,
            proficiencyBonus: 2,
            inspiration: false,
            hitDice: { total: '1d8', remaining: '1' },
            stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            savingThrows: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
            skills: [],
            attacks: [],
            features: [],
            spells: {
                lvl0: '', lvl1: '', lvl2: '', lvl3: '', lvl4: '',
                lvl5: '', lvl6: '', lvl7: '', lvl8: '', lvl9: ''
            },
            spellSlots: {
                1: { total: 0, used: 0 },
                2: { total: 0, used: 0 },
                3: { total: 0, used: 0 },
                4: { total: 0, used: 0 },
                5: { total: 0, used: 0 },
                6: { total: 0, used: 0 },
                7: { total: 0, used: 0 },
                8: { total: 0, used: 0 },
                9: { total: 0, used: 0 }
            },
            spellcasting: {
                ability: '',
                dc: 0,
                attackBonus: 0
            },
            currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
            equipment: {
                items: [],
                notes: ''
            },
            roleplay: {
                traits: '',
                ideals: '',
                bonds: '',
                flaws: ''
            },
            proficiencies: {
                languages: '',
                tools: ''
            },
            otherProfs: '',
            bio: '',
            allies: '',
            conditions: [],
            deathSaves: { successes: 0, failures: 0 },
            createdAt: new Date().toISOString()
        };
        const merged = deepMerge(defaults, overrides);
        // Preserve the generated UUID if overrides has its own id
        if (overrides.id) merged.id = overrides.id;
        return merged;
    },

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
