/**
 * Monster Art Resolver — D&D 5e Canonical Editions v22.5
 * Offline-first architecture with 5e Monster Manual canonical tokens & portraits.
 * Fallbacks to heraldic shields if customized creature has no image.
 */

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

const CR_XP = {
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900,
    9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 25: 75000, 30: 155000
};

function normalizeKey(name = '') {
    return String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\([^)]*\)/g, '')
        .trim();
}

function extractLevelNumber(levelKey = '') {
    if (levelKey === 'BOSS') return 25;
    const n = parseInt(String(levelKey).replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? n : 1;
}

export class MonsterArt {
    /**
     * Resolve the canonical image URL for a monster.
     * @param {Object} monster 
     * @param {boolean} preferToken If true, returns circular token; else portrait art.
     * @returns {string|null}
     */
    static getImage(monster, preferToken = false) {
        if (!monster) return null;

        // 1. Explicit Custom Image override (Upload or manual URL)
        if (monster.customImg) return monster.customImg;
        if (monster.img && !monster.img.includes('wikimedia.org')) return monster.img;

        // 2. Canonical mapping lookup
        const rawName = monster.name || '';
        const norm = normalizeKey(rawName);
        let canonicalName = MONSTER_CANONICAL_MAP[norm];

        if (!canonicalName) {
            // Check partial matches in canonical map
            for (const [key, cName] of Object.entries(MONSTER_CANONICAL_MAP)) {
                if (norm.includes(key) || key.includes(norm)) {
                    canonicalName = cName;
                    break;
                }
            }
        }

        // 3. Fallbacks for generic creature types if not matched directly
        if (!canonicalName) {
            if (norm.includes('drag')) canonicalName = 'Young Red Dragon';
            else if (norm.includes('vamp')) canonicalName = 'Vampire';
            else if (norm.includes('lich')) canonicalName = 'Lich';
            else if (norm.includes('kraken')) canonicalName = 'Kraken';
            else if (norm.includes('beholder')) canonicalName = 'Beholder';
            else if (norm.includes('tarrasque')) canonicalName = 'Tarrasque';
            else if (norm.includes('demonio') || norm.includes('diabo') || norm.includes('fiend')) canonicalName = 'Pit Fiend';
            else if (norm.includes('gigante')) canonicalName = 'Stone Giant';
            else if (norm.includes('elemental')) canonicalName = 'Earth Elemental';
        }

        if (canonicalName) {
            const slug = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            
            // Return local cached file path
            if (preferToken) {
                return `/assets/sprites/monsters/token_${slug}.webp`;
            } else {
                return `/assets/sprites/monsters/portrait_${slug}.webp`;
            }
        }

        return null;
    }

    /**
     * Obtains the CDN mirror fallback URL if the local file fails or is missing.
     */
    static getCdnFallback(monster, preferToken = false) {
        const rawName = monster?.name || '';
        const norm = normalizeKey(rawName);
        const canonicalName = MONSTER_CANONICAL_MAP[norm];
        if (!canonicalName) return null;

        const pathPrefix = preferToken ? 'tokens/MM' : 'MM';
        return `https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/bestiary/${pathPrefix}/${encodeURIComponent(canonicalName)}.webp`;
    }

    /**
     * Returns a thematic fantasy heraldic badge based on the creature's type.
     */
    static getHeraldry(monster) {
        const type = normalizeKey(monster?.type || 'monstro');
        
        if (type.includes('drag')) {
            return { icon: 'fa-solid fa-dragon', color: '#f87171', bg: 'rgba(220, 38, 38, 0.25)', label: 'Dragão' };
        }
        if (type.includes('morto') || type.includes('undead')) {
            return { icon: 'fa-solid fa-skull-crossbones', color: '#c084fc', bg: 'rgba(147, 51, 234, 0.25)', label: 'Morto-Vivo' };
        }
        if (type.includes('monstruo') || type.includes('aberra')) {
            return { icon: 'fa-solid fa-paw', color: '#fbbf24', bg: 'rgba(217, 119, 6, 0.25)', label: 'Monstruosidade' };
        }
        if (type.includes('humano') || type.includes('humanoide')) {
            return { icon: 'fa-solid fa-shield-halved', color: '#60a5fa', bg: 'rgba(37, 99, 235, 0.25)', label: 'Humanoide' };
        }
        if (type.includes('gigan')) {
            return { icon: 'fa-solid fa-mountain', color: '#facc15', bg: 'rgba(202, 138, 4, 0.25)', label: 'Gigante' };
        }
        if (type.includes('infer') || type.includes('demon') || type.includes('diabo')) {
            return { icon: 'fa-solid fa-fire-flame-curved', color: '#ef4444', bg: 'rgba(185, 28, 28, 0.25)', label: 'Ínfero' };
        }
        if (type.includes('celest')) {
            return { icon: 'fa-solid fa-sun', color: '#fde047', bg: 'rgba(234, 179, 8, 0.25)', label: 'Celestial' };
        }
        if (type.includes('element')) {
            return { icon: 'fa-solid fa-gem', color: '#22d3ee', bg: 'rgba(8, 145, 178, 0.25)', label: 'Elemental' };
        }
        if (type.includes('constru')) {
            return { icon: 'fa-solid fa-gear', color: '#cbd5e1', bg: 'rgba(100, 116, 139, 0.25)', label: 'Constructo' };
        }
        if (type.includes('planta')) {
            return { icon: 'fa-solid fa-tree', color: '#4ade80', bg: 'rgba(22, 163, 74, 0.25)', label: 'Planta' };
        }
        if (type.includes('divin')) {
            return { icon: 'fa-solid fa-crown', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.3)', label: 'Divindade' };
        }

        return { icon: 'fa-solid fa-shield-halved', color: '#94a3b8', bg: 'rgba(51, 65, 85, 0.25)', label: monster?.type || 'Monstro' };
    }

    static getSubtitle(monster, levelKey) {
        if (monster?.subtitle) return monster.subtitle;
        const lvl = extractLevelNumber(levelKey);
        if (levelKey === 'BOSS') return 'Ameaça Apocalíptica • Boss de Campanha';
        return `Criatura de Desafio • Nível ${lvl}`;
    }

    static getClassification(monster) {
        const type = monster?.type || 'Monstro';
        const align = monster?.alignment || 'Neutro';
        const size = monster?.size || 'Médio';
        return `${size} ${type}, ${align}`;
    }

    static getCrDisplay(levelKey) {
        const cr = extractLevelNumber(levelKey);
        const xp = CR_XP[cr] || CR_XP[Math.min(30, cr)] || 200;
        if (levelKey === 'BOSS') return `CR: ${cr}+ (Lendário)`;
        return `CR: ${cr} (${xp.toLocaleString('pt-BR')} XP)`;
    }

    static getSpeed(monster) {
        return monster?.speed || '30 ft.';
    }

    static getMultiattackSummary(actions = []) {
        if (!actions.length) return '—';
        const names = actions.slice(0, 3).map(a => a.name.split('(')[0].trim().toUpperCase());
        if (names.length >= 2) return `×2 ${names[0]}, ×1 ${names[1]}`;
        return `×1 ${names[0]}`;
    }

    static isMeleeAction(action) {
        const n = (action?.name || '').toLowerCase();
        return !n.includes('sopro') && !n.includes('arco') && !n.includes('flecha')
            && !n.includes('relampago') && !n.includes('cone') && !n.includes('magia');
    }

    /**
     * Renders the complete portrait block for statblock detail view.
     */
    static renderPortrait(monster, className = 'sb-portrait-wrap') {
        const src = this.getImage(monster, false); // portrait
        const tokenSrc = this.getImage(monster, true); // token fallback
        const name = (monster?.name || 'Criatura').replace(/"/g, '&quot;');
        const heraldry = this.getHeraldry(monster);
        const cdnUrl = this.getCdnFallback(monster, false) || '';

        // Fallback chain: portrait -> token -> cdn -> heraldry
        const onErr = `
            if (this.dataset.step === 'portrait' && '${tokenSrc}') {
                this.dataset.step = 'token';
                this.src = '${tokenSrc}';
            } else if (this.dataset.step !== 'cdn' && '${cdnUrl}') {
                this.dataset.step = 'cdn';
                this.src = '${cdnUrl}';
            } else {
                this.style.display = 'none';
                var f = this.parentElement.querySelector('.sb-portrait-fallback');
                if (f) f.style.display = 'flex';
            }
        `.replace(/\s+/g, ' ');

        return `
            <div class="${className} relative group">
                <img 
                    src="${src || tokenSrc || cdnUrl}" 
                    alt="${name}" 
                    loading="lazy" 
                    data-step="portrait"
                    class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onerror="${onErr}"
                />
                
                <div class="sb-portrait-fallback w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center" style="display:${src || tokenSrc ? 'none' : 'flex'}; background:${heraldry.bg};">
                    <i class="${heraldry.icon} text-6xl mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" style="color:${heraldry.color};"></i>
                    <span class="font-cinzel text-sm font-black uppercase tracking-wider text-slate-200">${heraldry.label}</span>
                    <span class="text-[0.65rem] text-slate-400 mt-1">D&D 5e SRD</span>
                </div>

                <div class="sb-portrait-vignette pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
            </div>
        `;
    }

    /**
     * Renders the circular token for grid cards and battlemaps.
     */
    static renderToken(monster, className = 'bc-token-wrap') {
        const tokenSrc = this.getImage(monster, true);
        const name = (monster?.name || 'Criatura').replace(/"/g, '&quot;');
        const heraldry = this.getHeraldry(monster);
        const cdnUrl = this.getCdnFallback(monster, true) || '';

        const onErr = `
            if (this.dataset.triedCdn !== '1' && '${cdnUrl}') {
                this.dataset.triedCdn = '1';
                this.src = '${cdnUrl}';
            } else {
                this.style.display = 'none';
                var f = this.parentElement.querySelector('.bc-token-fallback');
                if (f) f.style.display = 'flex';
            }
        `.replace(/\s+/g, ' ');

        return `
            <div class="${className} relative w-full h-full rounded-full overflow-hidden flex items-center justify-center border-2 border-tomeGold/60 shadow-[0_4px_15px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(0,0,0,0.6)] bg-slate-950">
                <img 
                    src="${tokenSrc || cdnUrl}" 
                    alt="${name}" 
                    loading="lazy" 
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onerror="${onErr}"
                />
                <div class="bc-token-fallback w-full h-full flex items-center justify-center" style="display:${tokenSrc ? 'none' : 'flex'}; background:${heraldry.bg};">
                    <i class="${heraldry.icon} text-2xl drop-shadow" style="color:${heraldry.color};"></i>
                </div>
            </div>
        `;
    }
}
