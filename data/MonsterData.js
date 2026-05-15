/**
 * MASTER MONSTER DATABASE (SRD 5e) v6.0
 * Complete creature library organized by Challenge Rating levels 1–20 + BOSS.
 * Each creature has: name, type, ac, hp, damage, actions[], emoji (visual icon), img (optional sprite path)
 */
export const MonsterData = {
    "Nível 1": [
        { name: "Goblin", type: "Humanoide", ac: 15, hp: 7, damage: "1d6+2", emoji: "👺", actions: [{name:"Cimitarra", bonus:4, damage:"1d6+2"},{name:"Arco Curto", bonus:4, damage:"1d6+2"}] },
        { name: "Kobold", type: "Humanoide", ac: 12, hp: 5, damage: "1d4+2", emoji: "🦎", actions: [{name:"Adaga", bonus:4, damage:"1d4+2"},{name:"Funda", bonus:4, damage:"1d4+2"}] },
        { name: "Esqueleto", type: "Morto-Vivo", ac: 13, hp: 13, damage: "1d6+2", emoji: "💀", actions: [{name:"Espada Curta", bonus:4, damage:"1d6+2"},{name:"Arco Curto", bonus:4, damage:"1d6+2"}] }
    ],
    "Nível 2": [
        { name: "Ogre", type: "Gigante", ac: 11, hp: 59, damage: "2d8+4", emoji: "👹", actions: [{name:"Clava", bonus:6, damage:"2d8+4"},{name:"Azagaia", bonus:6, damage:"2d6+4"}] },
        { name: "Grifo", type: "Monstruosidade", ac: 12, hp: 59, damage: "1d8+4", emoji: "🦅", actions: [{name:"Bico", bonus:6, damage:"1d8+4"},{name:"Garras", bonus:6, damage:"2d6+4"}] },
        { name: "Cão Infernal", type: "Ínfero", ac: 15, hp: 45, damage: "1d8+3", emoji: "🐕‍🦺", actions: [{name:"Mordida", bonus:5, damage:"1d8+3"},{name:"Sopro de Fogo", bonus:0, damage:"6d6"}] }
    ],
    "Nível 3": [
        { name: "Manticora", type: "Monstruosidade", ac: 14, hp: 68, damage: "1d8+3", emoji: "🦂", actions: [{name:"Garras", bonus:5, damage:"1d8+3"},{name:"Espinhos", bonus:5, damage:"1d6+3"}] },
        { name: "Minotauro", type: "Monstruosidade", ac: 14, hp: 76, damage: "2d12+4", emoji: "🐂", actions: [{name:"Machado Grande", bonus:6, damage:"2d12+4"},{name:"Investida", bonus:6, damage:"2d8+4"}] },
        { name: "Basilisco", type: "Monstruosidade", ac: 15, hp: 52, damage: "2d6+3", emoji: "🐍", actions: [{name:"Mordida", bonus:5, damage:"2d6+3"},{name:"Olhar Petrificante", bonus:0, damage:"Petrificação"}] }
    ],
    "Nível 4": [
        { name: "Cavaleiro", type: "Humanoide", ac: 18, hp: 52, damage: "2d6+3", emoji: "⚔️", actions: [{name:"Espada Grande", bonus:5, damage:"2d6+3"},{name:"Ataque Montado", bonus:5, damage:"2d6+5"}] },
        { name: "Múmia", type: "Morto-Vivo", ac: 11, hp: 58, damage: "2d6+3", emoji: "🧟", actions: [{name:"Toque Podre", bonus:5, damage:"2d6+3"},{name:"Maldição", bonus:0, damage:"Maldição"}] },
        { name: "Urso-Coruja", type: "Monstruosidade", ac: 13, hp: 59, damage: "1d10+5", emoji: "🦉", actions: [{name:"Bico", bonus:7, damage:"1d10+5"},{name:"Garras", bonus:7, damage:"2d8+5"}] }
    ],
    "Nível 5": [
        { name: "Troll", type: "Gigante", ac: 15, hp: 84, damage: "1d6+4", emoji: "👺", actions: [{name:"Mordida", bonus:7, damage:"1d6+4"},{name:"Garras", bonus:7, damage:"2d6+4"}] },
        { name: "Elemental da Terra", type: "Elemental", ac: 17, hp: 126, damage: "2d8+5", emoji: "💎", actions: [{name:"Pancada", bonus:8, damage:"2d8+5"},{name:"Terremoto", bonus:0, damage:"3d8"}] },
        { name: "Vampire Spawn", type: "Morto-Vivo", ac: 15, hp: 82, damage: "1d8+3", emoji: "🧛", actions: [{name:"Garras", bonus:6, damage:"1d8+3"},{name:"Mordida", bonus:6, damage:"1d6+3"}] }
    ],
    "Nível 6": [
        { name: "Gladiador", type: "Humanoide", ac: 16, hp: 112, damage: "2d6+5", emoji: "🛡️", actions: [{name:"Lança", bonus:9, damage:"2d6+5"},{name:"Escudo", bonus:9, damage:"2d4+5"}] },
        { name: "Medusa", type: "Monstruosidade", ac: 15, hp: 127, damage: "1d6+2", emoji: "🐍", actions: [{name:"Serpentes", bonus:5, damage:"1d6+2"},{name:"Olhar Petrificante", bonus:0, damage:"Petrificação CD14"}] },
        { name: "Ciclope", type: "Gigante", ac: 14, hp: 138, damage: "3d8+6", emoji: "👁️", actions: [{name:"Clava", bonus:9, damage:"3d8+6"},{name:"Arremesso de Rocha", bonus:9, damage:"3d10+6"}] }
    ],
    "Nível 7": [
        { name: "Gigante de Pedra", type: "Gigante", ac: 17, hp: 126, damage: "3d8+6", emoji: "⛰️", actions: [{name:"Clava", bonus:9, damage:"3d8+6"},{name:"Arremesso de Rocha", bonus:9, damage:"4d10+6"}] },
        { name: "Dragão Negro Jovem", type: "Dragão", ac: 18, hp: 127, damage: "2d10+4", emoji: "🐲", actions: [{name:"Mordida", bonus:7, damage:"2d10+4"},{name:"Sopro Ácido", bonus:0, damage:"11d8"}] },
        { name: "Oni", type: "Gigante", ac: 16, hp: 110, damage: "2d10+4", emoji: "👹", actions: [{name:"Clava Luar", bonus:7, damage:"2d10+4"},{name:"Cone de Frio", bonus:0, damage:"8d8"}] }
    ],
    "Nível 8": [
        { name: "Hydra", type: "Monstruosidade", ac: 15, hp: 172, damage: "1d10+5", emoji: "🐉", actions: [{name:"Mordida (x5)", bonus:8, damage:"1d10+5"},{name:"Regeneração", bonus:0, damage:"Cura 10/cabeça"}] },
        { name: "Assasino", type: "Humanoide", ac: 15, hp: 78, damage: "1d8+3", emoji: "🗡️", actions: [{name:"Espada Curta (x2)", bonus:6, damage:"1d6+3"},{name:"Ataque Furtivo", bonus:0, damage:"7d6"}] },
        { name: "Gigante de Gelo", type: "Gigante", ac: 15, hp: 138, damage: "3d12+6", emoji: "❄️", actions: [{name:"Machado Grande", bonus:9, damage:"3d12+6"},{name:"Arremesso de Rocha", bonus:9, damage:"4d10+6"}] }
    ],
    "Nível 9": [
        { name: "Quimera", type: "Monstruosidade", ac: 14, hp: 114, damage: "2d6+4", emoji: "🦁", actions: [{name:"Mordida", bonus:7, damage:"2d6+4"},{name:"Sopro de Fogo", bonus:0, damage:"7d8"}] },
        { name: "Aboleth", type: "Aberração", ac: 17, hp: 135, damage: "2d6+5", emoji: "🦑", actions: [{name:"Tentáculo", bonus:9, damage:"2d6+5"},{name:"Escravizar Mente", bonus:0, damage:"Controle CD14"}] },
        { name: "Treant", type: "Planta", ac: 16, hp: 138, damage: "3d6+6", emoji: "🌲", actions: [{name:"Pancada", bonus:10, damage:"3d6+6"},{name:"Arremesso de Rocha", bonus:10, damage:"4d10+6"}] }
    ],
    "Nível 10": [
        { name: "Dragão Vermelho Jovem", type: "Dragão", ac: 18, hp: 178, damage: "2d10+6", emoji: "🔥", img: "assets/sprites/boss_ancient_dragon.png", actions: [{name:"Mordida", bonus:10, damage:"2d10+6"},{name:"Sopro de Fogo", bonus:0, damage:"16d6"}] },
        { name: "Golem de Pedra", type: "Constructo", ac: 17, hp: 178, damage: "3d10+6", emoji: "🗿", actions: [{name:"Pancada (x2)", bonus:10, damage:"3d10+6"},{name:"Lentidão", bonus:0, damage:"Efeito CD17"}] },
        { name: "Guardian Naga", type: "Monstruosidade", ac: 18, hp: 127, damage: "1d8+4", emoji: "🐍", actions: [{name:"Mordida", bonus:8, damage:"1d8+4"},{name:"Magias Divinas", bonus:0, damage:"Variável"}] }
    ],
    "Nível 11": [
        { name: "Roc", type: "Monstruosidade", ac: 15, hp: 248, damage: "2d8+6", emoji: "🦅", actions: [{name:"Bico", bonus:13, damage:"4d8+6"},{name:"Garras", bonus:13, damage:"4d6+6"}] },
        { name: "Behir", type: "Monstruosidade", ac: 17, hp: 168, damage: "2d10+6", emoji: "⚡", actions: [{name:"Mordida", bonus:10, damage:"3d10+6"},{name:"Sopro Relâmpago", bonus:0, damage:"12d10"}] },
        { name: "Gigante de Fogo", type: "Gigante", ac: 18, hp: 162, damage: "6d6+7", emoji: "🔥", actions: [{name:"Espada Grande", bonus:11, damage:"6d6+7"},{name:"Arremesso de Rocha", bonus:11, damage:"4d10+7"}] }
    ],
    "Nível 12": [
        { name: "Arcimago", type: "Humanoide", ac: 12, hp: 99, damage: "Variável", emoji: "🧙", actions: [{name:"Mísseis Mágicos", bonus:0, damage:"3d10+3"},{name:"Cone de Frio", bonus:0, damage:"8d8"}] },
        { name: "Erinyes (Diaba)", type: "Ínfero", ac: 18, hp: 153, damage: "3d8+6", emoji: "😈", actions: [{name:"Espada Longa", bonus:8, damage:"3d8+6"},{name:"Corda de Enredar", bonus:0, damage:"Restringir CD17"}] },
        { name: "Dragão Azul Jovem", type: "Dragão", ac: 18, hp: 152, damage: "2d10+5", emoji: "⚡", actions: [{name:"Mordida", bonus:9, damage:"2d10+5"},{name:"Sopro Relâmpago", bonus:0, damage:"12d10"}] }
    ],
    "Nível 13": [
        { name: "Dragão Verde Adulto", type: "Dragão", ac: 19, hp: 207, damage: "2d10+6", emoji: "🐲", actions: [{name:"Mordida", bonus:11, damage:"2d10+6"},{name:"Sopro Venenoso", bonus:0, damage:"12d6"}] },
        { name: "Golem de Ferro", type: "Constructo", ac: 20, hp: 210, damage: "3d10+7", emoji: "⚙️", actions: [{name:"Espada", bonus:13, damage:"3d10+7"},{name:"Sopro Venenoso", bonus:0, damage:"10d8"}] },
        { name: "Nalfeshnee", type: "Demônio", ac: 18, hp: 184, damage: "Variável", emoji: "👿", actions: [{name:"Mordida", bonus:10, damage:"5d10+5"},{name:"Garras", bonus:10, damage:"3d6+5"}] }
    ],
    "Nível 14": [
        { name: "Múmia Lorde", type: "Morto-Vivo", ac: 17, hp: 97, damage: "3d6+4", emoji: "☥", actions: [{name:"Toque Podre", bonus:9, damage:"3d6+4"},{name:"Maldição da Múmia", bonus:0, damage:"Maldição CD16"}] },
        { name: "Vampiro (Guerreiro)", type: "Morto-Vivo", ac: 16, hp: 144, damage: "1d8+4", emoji: "🧛", actions: [{name:"Espada Grande", bonus:9, damage:"2d6+4"},{name:"Mordida Vampírica", bonus:6, damage:"1d6+3"}] },
        { name: "Death Knight", type: "Morto-Vivo", ac: 20, hp: 180, damage: "2d6+5", emoji: "⚔️", actions: [{name:"Espada Longa", bonus:11, damage:"2d6+5"},{name:"Bola de Fogo Infernal", bonus:0, damage:"10d6"}] }
    ],
    "Nível 15": [
        { name: "Dragão Vermelho Adulto", type: "Dragão", ac: 19, hp: 256, damage: "2d10+8", emoji: "🔥", actions: [{name:"Mordida", bonus:14, damage:"2d10+8"},{name:"Sopro de Fogo", bonus:0, damage:"18d6"}] },
        { name: "Marilith", type: "Demônio", ac: 18, hp: 189, damage: "2d8+4", emoji: "🐍", actions: [{name:"Espada Longa (x6)", bonus:9, damage:"2d8+4"},{name:"Cauda", bonus:9, damage:"2d10+4"}] },
        { name: "Planetar", type: "Celestial", ac: 19, hp: 200, damage: "4d6+7", emoji: "👼", actions: [{name:"Espada Grande", bonus:12, damage:"4d6+7"},{name:"Cura Divina", bonus:0, damage:"Cura 6d8+3"}] }
    ],
    "Nível 16": [
        { name: "Dragão Azul Adulto", type: "Dragão", ac: 19, hp: 225, damage: "2d10+7", emoji: "⚡", actions: [{name:"Mordida", bonus:12, damage:"2d10+7"},{name:"Sopro Relâmpago", bonus:0, damage:"16d10"}] },
        { name: "Goristro", type: "Demônio", ac: 19, hp: 310, damage: "Variável", emoji: "🐃", actions: [{name:"Chifrada", bonus:13, damage:"7d10+7"},{name:"Pisar", bonus:13, damage:"3d12+7"}] },
        { name: "Pit Fiend", type: "Diabo", ac: 19, hp: 300, damage: "Variável", emoji: "😈", actions: [{name:"Mordida", bonus:14, damage:"4d6+8"},{name:"Maça Flamejante", bonus:14, damage:"2d6+8"}] }
    ],
    "Nível 17": [
        { name: "Dragão Negro Adulto", type: "Dragão", ac: 19, hp: 195, damage: "2d10+6", emoji: "🖤", actions: [{name:"Mordida", bonus:11, damage:"2d10+6"},{name:"Sopro Ácido", bonus:0, damage:"14d8"}] },
        { name: "Androesfinge", type: "Monstruosidade", ac: 17, hp: 199, damage: "2d10+6", emoji: "🦁", actions: [{name:"Garras", bonus:12, damage:"2d10+6"},{name:"Rugido Aterrorizante", bonus:0, damage:"Medo CD18"}] },
        { name: "Solar", type: "Celestial", ac: 21, hp: 243, damage: "4d6+7", emoji: "☀️", actions: [{name:"Espada Grande", bonus:15, damage:"4d6+7"},{name:"Flecha Matadora", bonus:13, damage:"2d8+6"}] }
    ],
    "Nível 18": [
        { name: "Demilich", type: "Morto-Vivo", ac: 20, hp: 80, damage: "Variável", emoji: "💀", actions: [{name:"Drenar Vida", bonus:0, damage:"6d6 necrótico"},{name:"Uivo", bonus:0, damage:"Medo + 40 HP CD15"}] },
        { name: "Dragão Branco Antigo", type: "Dragão", ac: 20, hp: 333, damage: "2d10+8", emoji: "❄️", actions: [{name:"Mordida", bonus:14, damage:"2d10+8"},{name:"Sopro Glacial", bonus:0, damage:"16d8"}] },
        { name: "Balor", type: "Demônio", ac: 19, hp: 262, damage: "3d8+8", emoji: "🔥", actions: [{name:"Espada Flamejante", bonus:14, damage:"3d8+8"},{name:"Chicote de Fogo", bonus:14, damage:"2d6+8"}] }
    ],
    "Nível 19": [
        { name: "Dragão Verde Antigo", type: "Dragão", ac: 21, hp: 385, damage: "2d10+8", emoji: "🌿", actions: [{name:"Mordida", bonus:15, damage:"2d10+8"},{name:"Sopro Venenoso", bonus:0, damage:"22d6"}] },
        { name: "Dragão Azul Antigo", type: "Dragão", ac: 22, hp: 481, damage: "2d10+9", emoji: "⚡", actions: [{name:"Mordida", bonus:16, damage:"2d10+9"},{name:"Sopro Relâmpago", bonus:0, damage:"16d10"}] },
        { name: "Empyrean", type: "Celestial", ac: 22, hp: 313, damage: "3d8+10", emoji: "⭐", actions: [{name:"Maça Colossal", bonus:17, damage:"3d8+10"},{name:"Raio de Trovão", bonus:0, damage:"7d6 trovão"}] }
    ],
    "Nível 20": [
        { name: "Dragão Vermelho Antigo", type: "Dragão", ac: 22, hp: 546, damage: "2d10+10", emoji: "🐉", img: "assets/sprites/boss_ancient_dragon.png", actions: [{name:"Mordida", bonus:17, damage:"2d10+10"},{name:"Sopro de Fogo", bonus:0, damage:"26d6"}] },
        { name: "Dragão Dourado Antigo", type: "Dragão", ac: 22, hp: 546, damage: "2d10+10", emoji: "✨", actions: [{name:"Mordida", bonus:17, damage:"2d10+10"},{name:"Sopro de Fogo", bonus:0, damage:"13d10"}] },
        { name: "Kraken", type: "Monstruosidade", ac: 18, hp: 472, damage: "3d10+10", emoji: "🐙", img: "assets/sprites/boss_kraken.png", actions: [{name:"Tentáculo (x3)", bonus:17, damage:"3d10+10"},{name:"Tempestade Relâmpago", bonus:0, damage:"22d6"}] }
    ],
    "BOSS": [
        { name: "Tiamat (Avatar)", type: "Divindade", ac: 25, hp: 615, damage: "4d10+10", emoji: "🐉", img: "assets/sprites/boss_tiamat.png", actions: [{name:"5 Mordidas", bonus:19, damage:"4d10+10"},{name:"5 Sopros Elementais", bonus:0, damage:"Variável"}] },
        { name: "Tarrasque", type: "Monstruosidade", ac: 25, hp: 676, damage: "4d12+10", emoji: "🦖", img: "assets/sprites/boss_tarrasque.png", actions: [{name:"Mordida", bonus:19, damage:"4d12+10"},{name:"Engolir", bonus:19, damage:"16d6 ácido"}] },
        { name: "Lich Supremo", type: "Morto-Vivo", ac: 17, hp: 250, damage: "Variável", emoji: "👑", img: "assets/sprites/boss_lich_king.png", actions: [{name:"Palavra de Poder: Matar", bonus:12, damage:"100"},{name:"Desintegrar", bonus:0, damage:"10d6+40"}] },
        { name: "Kraken Abissal", type: "Aberração", ac: 18, hp: 472, damage: "3d10+10", emoji: "🌊", img: "assets/sprites/boss_kraken.png", actions: [{name:"Tentáculo (x3)", bonus:17, damage:"3d10+10"},{name:"Tempestade", bonus:0, damage:"22d6 relâmpago"}] },
        { name: "Beholder Tirano", type: "Aberração", ac: 18, hp: 250, damage: "Variável", emoji: "👁️", img: "assets/sprites/boss_beholder.png", actions: [{name:"Mordida", bonus:5, damage:"4d6"},{name:"Raios Oculares (x3)", bonus:0, damage:"Variável CD16"}] },
        { name: "Dragão Sombrio Antigo", type: "Dragão", ac: 22, hp: 546, damage: "2d10+10", emoji: "🖤", img: "assets/sprites/boss_ancient_dragon.png", actions: [{name:"Mordida Sombria", bonus:17, damage:"2d10+10"},{name:"Sopro Necrótico", bonus:0, damage:"26d6 necrótico"}] },
        { name: "Demogorgon", type: "Demônio", ac: 22, hp: 496, damage: "3d12+8", emoji: "👿", actions: [{name:"Tentáculos (x2)", bonus:17, damage:"3d12+8"},{name:"Olhar da Loucura", bonus:0, damage:"Insanidade CD23"}] },
        { name: "Senhor Vampírico", type: "Morto-Vivo", ac: 20, hp: 350, damage: "3d8+7", emoji: "🩸", actions: [{name:"Garras Sombrias", bonus:13, damage:"3d8+7"},{name:"Drenar Essência", bonus:0, damage:"10d6 necrótico CD19"}] }
    ]
};
