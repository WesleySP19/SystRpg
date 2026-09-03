import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MONSTERS_DIR = path.join(ROOT_DIR, 'assets', 'sprites', 'monsters');

if (!fs.existsSync(MONSTERS_DIR)) {
    fs.mkdirSync(MONSTERS_DIR, { recursive: true });
}

// Mapeamento canônico: chave normalizada em PT -> Nome oficial no Monster Manual 5e
export const MONSTER_CANONICAL_MAP = {
    // Nível 1
    "goblin": "Goblin",
    "kobold": "Kobold",
    "esqueleto": "Skeleton",
    // Nível 2
    "ogre": "Ogre",
    "grifo": "Griffon",
    "cão infernal": "Hell Hound",
    "cao infernal": "Hell Hound",
    // Nível 3
    "manticora": "Manticore",
    "minotauro": "Minotaur",
    "basilisco": "Basilisk",
    // Nível 4
    "cavaleiro": "Knight",
    "múmia": "Mummy",
    "mumia": "Mummy",
    "urso-coruja": "Owlbear",
    // Nível 5
    "troll": "Troll",
    "elemental da terra": "Earth Elemental",
    "vampire spawn": "Vampire Spawn",
    // Nível 6
    "gladiador": "Gladiator",
    "medusa": "Medusa",
    "ciclope": "Cyclops",
    // Nível 7
    "gigante de pedra": "Stone Giant",
    "dragão negro jovem": "Young Black Dragon",
    "dragao negro jovem": "Young Black Dragon",
    "oni": "Oni",
    // Nível 8
    "hydra": "Hydra",
    "assasino": "Assassin",
    "assassino": "Assassin",
    "gigante de gelo": "Frost Giant",
    // Nível 9
    "quimera": "Chimera",
    "aboleth": "Aboleth",
    "treant": "Treant",
    // Nível 10
    "dragão vermelho jovem": "Young Red Dragon",
    "dragao vermelho jovem": "Young Red Dragon",
    "golem de pedra": "Stone Golem",
    "guardian naga": "Guardian Naga",
    // Nível 11
    "roc": "Roc",
    "behir": "Behir",
    "gigante de fogo": "Fire Giant",
    // Nível 12
    "arcimago": "Archmage",
    "erinyes (diaba)": "Erinyes",
    "erinyes": "Erinyes",
    "dragão azul jovem": "Young Blue Dragon",
    "dragao azul jovem": "Young Blue Dragon",
    // Nível 13
    "dragão verde adulto": "Adult Green Dragon",
    "dragao verde adulto": "Adult Green Dragon",
    "golem de ferro": "Iron Golem",
    "nalfeshnee": "Nalfeshnee",
    // Nível 14
    "múmia lorde": "Mummy Lord",
    "mumia lorde": "Mummy Lord",
    "vampiro (guerreiro)": "Vampire",
    "vampiro": "Vampire",
    "death knight": "Death Knight",
    // Nível 15
    "dragão vermelho adulto": "Adult Red Dragon",
    "dragao vermelho adulto": "Adult Red Dragon",
    "marilith": "Marilith",
    "planetar": "Planetar",
    // Nível 16
    "dragão azul adulto": "Adult Blue Dragon",
    "dragao azul adulto": "Adult Blue Dragon",
    "goristro": "Goristro",
    "pit fiend": "Pit Fiend",
    // Nível 17
    "dragão negro adulto": "Adult Black Dragon",
    "dragao negro adulto": "Adult Black Dragon",
    "androesfinge": "Androsphinx",
    "solar": "Solar",
    // Nível 18
    "demilich": "Demilich",
    "dragão branco antigo": "Ancient White Dragon",
    "dragao branco antigo": "Ancient White Dragon",
    "balor": "Balor",
    // Nível 19
    "dragão verde antigo": "Ancient Green Dragon",
    "dragao verde antigo": "Ancient Green Dragon",
    "dragão azul antigo": "Ancient Blue Dragon",
    "dragao azul antigo": "Ancient Blue Dragon",
    "empyrean": "Empyrean",
    // Nível 20
    "dragão vermelho antigo": "Ancient Red Dragon",
    "dragao vermelho antigo": "Ancient Red Dragon",
    "dragão dourado antigo": "Ancient Gold Dragon",
    "dragao dourado antigo": "Ancient Gold Dragon",
    "kraken": "Kraken",
    // BOSS
    "tiamat (avatar)": "Tiamat",
    "tiamat": "Tiamat",
    "tarrasque": "Tarrasque",
    "lich supremo": "Lich",
    "lich": "Lich",
    "kraken abissal": "Kraken",
    "beholder tirano": "Beholder",
    "beholder": "Beholder",
    "dragão sombrio antigo": "Shadow Dragon",
    "dragao sombrio antigo": "Shadow Dragon",
    "demogorgon": "Demogorgon",
    "senhor vampírico": "Vampire",
    "senhor vampirico": "Vampire"
};

const BASE_TOKEN_URL = 'https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/bestiary/tokens/MM';
const BASE_PORTRAIT_URL = 'https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/bestiary/MM';

async function downloadFile(url, destPath) {
    if (fs.existsSync(destPath)) {
        return true; // Already cached
    }
    try {
        const res = await fetch(url);
        if (!res.ok) {
            return false;
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        await fs.promises.writeFile(destPath, buffer);
        return true;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log('⚔️ Iniciando download das artes e tokens canônicos D&D 5e...');
    
    // Obter lista única de nomes canônicos
    const uniqueCanonicalNames = [...new Set(Object.values(MONSTER_CANONICAL_MAP))];
    console.log(`📋 Total de criaturas canônicas únicas: ${uniqueCanonicalNames.length}`);

    let downloadedTokens = 0;
    let downloadedPortraits = 0;

    for (const name of uniqueCanonicalNames) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        
        // 1. Download do Token Circular
        const tokenDest = path.join(MONSTERS_DIR, `token_${slug}.webp`);
        const tokenUrl = `${BASE_TOKEN_URL}/${encodeURIComponent(name)}.webp`;
        const tokenOk = await downloadFile(tokenUrl, tokenDest);
        if (tokenOk) downloadedTokens++;

        // 2. Download do Portrait (arte completa)
        const portraitDest = path.join(MONSTERS_DIR, `portrait_${slug}.webp`);
        const portraitUrl = `${BASE_PORTRAIT_URL}/${encodeURIComponent(name)}.webp`;
        const portraitOk = await downloadFile(portraitUrl, portraitDest);
        if (portraitOk) downloadedPortraits++;

        process.stdout.write(`\r✓ Processado: ${name.padEnd(25)} (Tokens: ${downloadedTokens} | Portraits: ${downloadedPortraits})`);
    }

    console.log(`\n✨ Concluído com sucesso!`);
    console.log(`📁 Diretório: ${MONSTERS_DIR}`);
    console.log(`🛡️ Tokens cacheados: ${downloadedTokens}`);
    console.log(`🖼️ Retratos cacheados: ${downloadedPortraits}`);
}

main().catch(err => {
    console.error('Erro ao baixar artes:', err);
});
