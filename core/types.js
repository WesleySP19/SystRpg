/**
 * TOME V22 — STATIC TYPES DEFINITION
 * JSDoc types for validation and Yjs synchronization.
 * Mapeamento das entidades centrais (Hero, Monster, CombatState)
 */

/**
 * @typedef {Object} HP
 * @property {number} current
 * @property {number} max
 * @property {number} [temp]
 */

/**
 * @typedef {Object} Stats
 * @property {number} STR
 * @property {number} DEX
 * @property {number} CON
 * @property {number} INT
 * @property {number} WIS
 * @property {number} CHA
 */

/**
 * @typedef {Object} Coins
 * @property {number} cp
 * @property {number} sp
 * @property {number} ep
 * @property {number} gp
 * @property {number} pp
 */

/**
 * @typedef {Object} SpellSlots
 * @property {number} total
 * @property {number} used
 */

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} name
 * @property {string} [type] - 'weapon' | 'armor' | 'consumable' | 'gear'
 * @property {string} [damage] - e.g., "1d8+STR"
 * @property {string} [desc]
 * @property {number} [quantity]
 */

/**
 * @typedef {Object} Hero
 * @property {string} id
 * @property {string} name
 * @property {string} [img]
 * @property {number} [level]
 * @property {string} [class]
 * @property {string} [race]
 * @property {HP} hp
 * @property {number} ac
 * @property {number} initiative
 * @property {number} [speed]
 * @property {Stats} [stats]
 * @property {Object.<string, number>} [skills] - Mapa de perícias, ex: { stealth: 5 }
 * @property {Object.<string, number>} [saves] - Mapa de resistências, ex: { STR: 4 }
 * @property {Item[]} [inventory]
 * @property {Object.<string, string>} [spells] - Magias por nível, ex: { lvl0: "Luz\\nMãos Mágicas", lvl1: "Escudo" }
 * @property {Object.<string, SpellSlots>} [spellSlots] - Slots por nível, ex: { 1: { total: 3, used: 1 } }
 * @property {Coins} [coins]
 */

/**
 * @typedef {Object} MonsterAction
 * @property {string} name
 * @property {string} desc
 * @property {string} [attackBonus]
 * @property {string} [damage] - e.g., "1d8+3"
 */

/**
 * @typedef {Object} Monster
 * @property {string} id
 * @property {string} name
 * @property {string} [img]
 * @property {string} [size]
 * @property {string} [type]
 * @property {string} [alignment]
 * @property {number} ac
 * @property {HP} hp
 * @property {string} [speed]
 * @property {Stats} [stats]
 * @property {MonsterAction[]} [actions]
 * @property {MonsterAction[]} [special_abilities]
 * @property {MonsterAction[]} [legendary_actions]
 * @property {string} [cr]
 * @property {number} [xp]
 */

/**
 * @typedef {Object} Combatant
 * @property {string} id
 * @property {string} name
 * @property {string} type - 'hero' | 'monster'
 * @property {HP | number} hp
 * @property {number} ac
 * @property {number} initiative
 * @property {string} [img]
 */

/**
 * @typedef {Object} CombatState
 * @property {boolean} active
 * @property {number} round
 * @property {number} turnIndex
 * @property {Combatant[]} order - Array of combatants sorted by initiative
 */

/**
 * @typedef {Object} TomeState
 * @property {Hero[]} players
 * @property {Monster[]} monsters
 * @property {Object[]} savedNPCs
 * @property {CombatState} combat
 * @property {Object[]} journalEntries
 * @property {string} sessionNotes
 * @property {string} sessionTitle
 * @property {string} activeTab
 * @property {Object} tacticalMap
 */

export const Types = {};
