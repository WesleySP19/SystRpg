/**
 * MONSTER LIBRARY (SRD 5e)
 * A collection of standard monsters for quick use.
 * Optimized with structured actions for the Dynamic Combat Tracker.
 */
export const MonsterLibrary = [
    {
        name: "Goblin",
        type: "Criatura",
        cr: "1/4",
        ac: 15,
        hp: { current: 7, max: 7 },
        stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
        actions: [
            { name: "Cimitarra", bonus: 4, damage: "1d6+2", description: "Ataque corpo-a-corpo com arma." },
            { name: "Arco Curto", bonus: 4, damage: "1d6+2", description: "Ataque à distância (80/320)." }
        ],
        notes: "Escapada Ágil: Pode usar a ação de Desengajar ou Esconder como ação bônus."
    },
    {
        name: "Lobo (Wolf)",
        type: "Criatura",
        cr: "1/4",
        ac: 13,
        hp: { current: 11, max: 11 },
        stats: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
        actions: [
            { name: "Mordida", bonus: 4, damage: "2d4+2", description: "Alvo deve passar em CD 11 FOR ou ficar Caído." }
        ],
        notes: "Táticas de Matilha: Vantagem no ataque se um aliado estiver a 1,5m do alvo."
    },
    {
        name: "Esqueleto",
        type: "Criatura",
        cr: "1/4",
        ac: 13,
        hp: { current: 13, max: 13 },
        stats: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
        actions: [
            { name: "Espada Curta", bonus: 4, damage: "1d6+2", description: "Ataque corpo-a-corpo." },
            { name: "Arco Curto", bonus: 4, damage: "1d6+2", description: "Ataque à distância." }
        ],
        notes: "Vulnerável a dano de Concussão."
    },
    {
        name: "Orc",
        type: "Criatura",
        cr: "1/2",
        ac: 13,
        hp: { current: 15, max: 15 },
        stats: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 },
        actions: [
            { name: "Machado Grande", bonus: 5, damage: "1d12+3", description: "Ataque pesado corpo-a-corpo." },
            { name: "Azagaia", bonus: 5, damage: "1d6+3", description: "Ataque corpo-a-corpo ou à distância (30/120)." }
        ],
        notes: "Agressivo: Como ação bônus, pode se mover até o seu deslocamento em direção a um inimigo."
    },
    {
        name: "Ogre",
        type: "Criatura",
        cr: "2",
        ac: 11,
        hp: { current: 59, max: 59 },
        stats: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 },
        actions: [
            { name: "Grande Clava", bonus: 6, damage: "2d8+4", description: "Esmagamento massivo." },
            { name: "Azagaia", bonus: 6, damage: "2d6+4", description: "Ataque à distância pesado." }
        ]
    },
    {
        name: "Grifo (Griffon)",
        type: "Criatura",
        cr: "2",
        ac: 12,
        hp: { current: 59, max: 59 },
        stats: { str: 18, dex: 15, con: 16, int: 2, wis: 13, cha: 8 },
        actions: [
            { name: "Bico", bonus: 6, damage: "1d8+4", description: "Parte do Ataque Múltiplo." },
            { name: "Garras", bonus: 6, damage: "2d6+4", description: "Parte do Ataque Múltiplo." }
        ],
        notes: "Ataque Múltiplo: Realiza um ataque de bico e um de garras."
    },
    {
        name: "Dragão Vermelho Jovem",
        type: "Criatura",
        cr: "10",
        ac: 18,
        hp: { current: 178, max: 178 },
        stats: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
        actions: [
            { name: "Sopro de Fogo", bonus: 0, damage: "16d6", description: "Cone de 9m. CD 17 Destreza para metade do dano. (Recarga 5-6)" },
            { name: "Mordida", bonus: 10, damage: "2d10+6", description: "+ 1d6 dano de fogo." },
            { name: "Garras", bonus: 10, damage: "2d6+6", description: "Realiza dois ataques de garra." }
        ]
    }
];
