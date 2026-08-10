/**
 * TOME V14 — STATIC TYPES DEFINITION
 * JSDoc types for validation and Yjs synchronization.
 */

/**
 * @typedef {Object} HeroHP
 * @property {number} current
 * @property {number} max
 * @property {number} temp
 */

/**
 * @typedef {Object} HeroCombatStats
 * @property {number} ac
 * @property {number} initiative
 * @property {number} speed
 * @property {string} hitDice
 */

/**
 * @typedef {Object} Combatant
 * @property {string} id
 * @property {string} name
 * @property {string} type - 'hero' | 'monster'
 * @property {HeroHP | number} hp
 * @property {number} ac
 * @property {number} initiative
 * @property {string} [portraitData]
 */

/**
 * @typedef {Object} AppState
 * @property {Combatant[]} combatants
 * @property {number} turnIndex
 * @property {number} round
 * @property {Object[]} players
 * @property {Object[]} npcs
 * @property {Object[]} quests
 */

/**
 * @typedef {Object} WeaponSchema
 * @property {string} id
 * @property {string} name
 * @property {string} damage - e.g. "1d8+STR"
 * @property {string} type - "melee" | "ranged" | "magic"
 * @property {number} range
 * @property {string} damageType
 */

/**
 * @typedef {Object} SpellSchema
 * @property {string} id
 * @property {string} name
 * @property {number} level
 * @property {string} school
 * @property {string} castingTime
 * @property {string} range
 * @property {string} components
 * @property {string} duration
 * @property {string} description
 */

/**
 * @typedef {Object} MonsterSchema
 * @property {string} id
 * @property {string} name
 * @property {string} size
 * @property {string} type
 * @property {string} alignment
 * @property {number} ac
 * @property {HeroHP} hp
 * @property {string} speed
 * @property {Object.<string, number>} stats - { STR, DEX, CON, INT, WIS, CHA }
 * @property {Object[]} actions
 */

export const Types = {}; // Empty export to make it an ES module
