const WIKI = 'https://upload.wikimedia.org/wikipedia/commons/thumb';
const MONSTER_IMAGES = {
goblin: `${WIKI}/6/6f/Goblin_%28Dungeons_%26_Dragons%29.jpg/440px-Goblin_%28Dungeons_%26_Dragons%29.jpg`,
kobold: `${WIKI}/8/8e/Kobold_%28Dungeons_%26_Dragons%29.jpg/440px-Kobold_%28Dungeons_%26_Dragons%29.jpg`,
esqueleto: `${WIKI}/4/4a/Skeleton_%28Dungeons_%26_Dragons%29.jpg/440px-Skeleton_%28Dungeons_%26_Dragons%29.jpg`,
skeleton: `${WIKI}/4/4a/Skeleton_%28Dungeons_%26_Dragons%29.jpg/440px-Skeleton_%28Dungeons_%26_Dragons%29.jpg`,
ogre: `${WIKI}/9/9e/Ogre_%28Dungeons_%26_Dragons%29.jpg/440px-Ogre_%28Dungeons_%26_Dragons%29.jpg`,
grifo: `${WIKI}/2/2e/Griffon_%28Dungeons_%26_Dragons%29.jpg/440px-Griffon_%28Dungeons_%26_Dragons%29.jpg`,
griffon: `${WIKI}/2/2e/Griffon_%28Dungeons_%26_Dragons%29.jpg/440px-Griffon_%28Dungeons_%26_Dragons%29.jpg`,
'cao infernal': `${WIKI}/d/d4/Hellhound_%28Dungeons_%26_Dragons%29.jpg/440px-Hellhound_%28Dungeons_%26_Dragons%29.jpg`,
hellhound: `${WIKI}/d/d4/Hellhound_%28Dungeons_%26_Dragons%29.jpg/440px-Hellhound_%28Dungeons_%26_Dragons%29.jpg`,
manticora: `${WIKI}/1/1e/Manticore_%28Dungeons_%26_Dragons%29.jpg/440px-Manticore_%28Dungeons_%26_Dragons%29.jpg`,
manticore: `${WIKI}/1/1e/Manticore_%28Dungeons_%26_Dragons%29.jpg/440px-Manticore_%28Dungeons_%26_Dragons%29.jpg`,
minotauro: `${WIKI}/8/8a/Minotaur_%28Dungeons_%26_Dragons%29.jpg/440px-Minotaur_%28Dungeons_%26_Dragons%29.jpg`,
minotaur: `${WIKI}/8/8a/Minotaur_%28Dungeons_%26_Dragons%29.jpg/440px-Minotaur_%28Dungeons_%26_Dragons%29.jpg`,
basilisco: `${WIKI}/4/4f/Basilisk_%28Dungeons_%26_Dragons%29.jpg/440px-Basilisk_%28Dungeons_%26_Dragons%29.jpg`,
basilisk: `${WIKI}/4/4f/Basilisk_%28Dungeons_%26_Dragons%29.jpg/440px-Basilisk_%28Dungeons_%26_Dragons%29.jpg`,
cavaleiro: `${WIKI}/5/5e/Knight_%28Dungeons_%26_Dragons%29.jpg/440px-Knight_%28Dungeons_%26_Dragons%29.jpg`,
knight: `${WIKI}/5/5e/Knight_%28Dungeons_%26_Dragons%29.jpg/440px-Knight_%28Dungeons_%26_Dragons%29.jpg`,
mumia: `${WIKI}/8/8b/Mummy_%28Dungeons_%26_Dragons%29.jpg/440px-Mummy_%28Dungeons_%26_Dragons%29.jpg`,
mummy: `${WIKI}/8/8b/Mummy_%28Dungeons_%26_Dragons%29.jpg/440px-Mummy_%28Dungeons_%26_Dragons%29.jpg`,
'urso-coruja': `${WIKI}/9/9a/Owlbear_%28Dungeons_%26_Dragons%29.jpg/440px-Owlbear_%28Dungeons_%26_Dragons%29.jpg`,
owlbear: `${WIKI}/9/9a/Owlbear_%28Dungeons_%26_Dragons%29.jpg/440px-Owlbear_%28Dungeons_%26_Dragons%29.jpg`,
troll: `${WIKI}/4/4c/Troll_%28Dungeons_%26_Dragons%29.jpg/440px-Troll_%28Dungeons_%26_Dragons%29.jpg`,
'elemental da terra': `${WIKI}/e/e8/Earth_elemental_%28Dungeons_%26_Dragons%29.jpg/440px-Earth_elemental_%28Dungeons_%26_Dragons%29.jpg`,
'vampire spawn': `${WIKI}/8/8f/Vampire_spawn_%28Dungeons_%26_Dragons%29.jpg/440px-Vampire_spawn_%28Dungeons_%26_Dragons%29.jpg`,
gladiador: `${WIKI}/5/5e/Gladiator_%28Dungeons_%26_Dragons%29.jpg/440px-Gladiator_%28Dungeons_%26_Dragons%29.jpg`,
medusa: `${WIKI}/8/8e/Medusa_%28Dungeons_%26_Dragons%29.jpg/440px-Medusa_%28Dungeons_%26_Dragons%29.jpg`,
ciclope: `${WIKI}/4/4e/Cyclops_%28Dungeons_%26_Dragons%29.jpg/440px-Cyclops_%28Dungeons_%26_Dragons%29.jpg`,
cyclops: `${WIKI}/4/4e/Cyclops_%28Dungeons_%26_Dragons%29.jpg/440px-Cyclops_%28Dungeons_%26_Dragons%29.jpg`,
'gigante de pedra': `${WIKI}/0/0e/Stone_giant_%28Dungeons_%26_Dragons%29.jpg/440px-Stone_giant_%28Dungeons_%26_Dragons%29.jpg`,
'stone giant': `${WIKI}/0/0e/Stone_giant_%28Dungeons_%26_Dragons%29.jpg/440px-Stone_giant_%28Dungeons_%26_Dragons%29.jpg`,
hydra: `${WIKI}/4/4a/Hydra_%28Dungeons_%26_Dragons%29.jpg/440px-Hydra_%28Dungeons_%26_Dragons%29.jpg`,
behir: `${WIKI}/b/b8/Behir_%28Dungeons_%26_Dragons%29.jpg/440px-Behir_%28Dungeons_%26_Dragons%29.jpg`,
quimera: `${WIKI}/4/4e/Chimera_%28Dungeons_%26_Dragons%29.jpg/440px-Chimera_%28Dungeons_%26_Dragons%29.jpg`,
chimera: `${WIKI}/4/4e/Chimera_%28Dungeons_%26_Dragons%29.jpg/440px-Chimera_%28Dungeons_%26_Dragons%29.jpg`,
aboleth: `${WIKI}/a/a1/Aboleth_%28Dungeons_%26_Dragons%29.jpg/440px-Aboleth_%28Dungeons_%26_Dragons%29.jpg`,
treant: `${WIKI}/8/8e/Treant_%28Dungeons_%26_Dragons%29.jpg/440px-Treant_%28Dungeons_%26_Dragons%29.jpg`,
roc: `${WIKI}/r/r0/Roc_%28Dungeons_%26_Dragons%29.jpg/440px-Roc_%28Dungeons_%26_Dragons%29.jpg`,
kraken: `${WIKI}/k/k8/Kraken_%28Dungeons_%26_Dragons%29.jpg/440px-Kraken_%28Dungeons_%26_Dragons%29.jpg`,
beholder: `${WIKI}/b/b5/Beholder_%28Dungeons_%26_Dragons%29.jpg/440px-Beholder_%28Dungeons_%26_Dragons%29.jpg`,
lich: `${WIKI}/l/l4/Lich_%28Dungeons_%26_Dragons%29.jpg/440px-Lich_%28Dungeons_%26_Dragons%29.jpg`,
vampiro: `${WIKI}/8/8f/Vampire_%28Dungeons_%26_Dragons%29.jpg/440px-Vampire_%28Dungeons_%26_Dragons%29.jpg`,
vampire: `${WIKI}/8/8f/Vampire_%28Dungeons_%26_Dragons%29.jpg/440px-Vampire_%28Dungeons_%26_Dragons%29.jpg`,
balor: `${WIKI}/b/b4/Balor_%28Dungeons_%26_Dragons%29.jpg/440px-Balor_%28Dungeons_%26_Dragons%29.jpg`,
demilich: `${WIKI}/d/d4/Demilich_%28Dungeons_%26_Dragons%29.jpg/440px-Demilich_%28Dungeons_%26_Dragons%29.jpg`,
tarrasque: `${WIKI}/t/t4/Tarrasque_%28Dungeons_%26_Dragons%29.jpg/440px-Tarrasque_%28Dungeons_%26_Dragons%29.jpg`,
demogorgon: `${WIKI}/d/d1/Demogorgon_%28Dungeons_%26_Dragons%29.jpg/440px-Demogorgon_%28Dungeons_%26_Dragons%29.jpg`,
};
const TYPE_IMAGES = {
dragao: `${WIKI}/8/8d/Red_dragon_%28Dungeons_%26_Dragons%29.jpg/440px-Red_dragon_%28Dungeons_%26_Dragons%29.jpg`,
'morto-vivo': `${WIKI}/4/4a/Skeleton_%28Dungeons_%26_Dragons%29.jpg/440px-Skeleton_%28Dungeons_%26_Dragons%29.jpg`,
demonio: `${WIKI}/b/b4/Balor_%28Dungeons_%26_Dragons%29.jpg/440px-Balor_%28Dungeons_%26_Dragons%29.jpg`,
infero: `${WIKI}/d/d4/Hellhound_%28Dungeons_%26_Dragons%29.jpg/440px-Hellhound_%28Dungeons_%26_Dragons%29.jpg`,
celestial: `${WIKI}/a/a8/Planetar_%28Dungeons_%26_Dragons%29.jpg/440px-Planetar_%28Dungeons_%26_Dragons%29.jpg`,
gigante: `${WIKI}/0/0e/Stone_giant_%28Dungeons_%26_Dragons%29.jpg/440px-Stone_giant_%28Dungeons_%26_Dragons%29.jpg`,
aberracao: `${WIKI}/a/a1/Aboleth_%28Dungeons_%26_Dragons%29.jpg/440px-Aboleth_%28Dungeons_%26_Dragons%29.jpg`,
monstruosidade: `${WIKI}/9/9a/Owlbear_%28Dungeons_%26_Dragons%29.jpg/440px-Owlbear_%28Dungeons_%26_Dragons%29.jpg`,
planta: `${WIKI}/8/8e/Treant_%28Dungeons_%26_Dragons%29.jpg/440px-Treant_%28Dungeons_%26_Dragons%29.jpg`,
elemental: `${WIKI}/e/e8/Earth_elemental_%28Dungeons_%26_Dragons%29.jpg/440px-Earth_elemental_%28Dungeons_%26_Dragons%29.jpg`,
humanoide: `${WIKI}/6/6f/Goblin_%28Dungeons_%26_Dragons%29.jpg/440px-Goblin_%28Dungeons_%26_Dragons%29.jpg`,
constructo: `${WIKI}/g/g0/Iron_golem_%28Dungeons_%26_Dragons%29.jpg/440px-Iron_golem_%28Dungeons_%26_Dragons%29.jpg`,
};
const CR_XP = {
1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900,
9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 25: 75000, 30: 155000
};
function normalizeKey(name = '') {
return name
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
static getImage(monster) {
if (monster?.img) return monster.img;
const key = normalizeKey(monster?.name || '');
if (MONSTER_IMAGES[key]) return MONSTER_IMAGES[key];
for (const [fragment, url] of Object.entries(MONSTER_IMAGES)) {
if (key.includes(fragment) || fragment.includes(key)) return url;
}
const typeKey = normalizeKey(monster?.type || '');
for (const [t, url] of Object.entries(TYPE_IMAGES)) {
if (typeKey.includes(t)) return url;
}
if (key.includes('drag')) return TYPE_IMAGES.dragao;
if (key.includes('vamp')) return MONSTER_IMAGES.vampiro;
if (key.includes('lich')) return MONSTER_IMAGES.lich;
if (key.includes('kraken')) return MONSTER_IMAGES.kraken;
if (key.includes('beholder')) return MONSTER_IMAGES.beholder;
if (key.includes('tarrasque')) return MONSTER_IMAGES.tarrasque;
return null;
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
static renderPortrait(monster, className = 'sb-portrait-wrap') {
const src = this.getImage(monster);
const emoji = monster?.emoji || '🐾';
const name = (monster?.name || 'Criatura').replace(/"/g, '&quot;');
const onErr = "this.style.display='none';var f=this.parentElement.querySelector('.sb-portrait-fallback');if(f)f.style.display='flex';";
if (src) {
return `<div class="${className}">
<img src="${src}" alt="${name}" loading="lazy" onerror="${onErr}">
<div class="sb-portrait-fallback" style="display:none;"><span class="sb-emoji">${emoji}</span></div>
<div class="sb-portrait-vignette"></div>
</div>`;
}
return `<div class="${className}">
<div class="sb-portrait-fallback"><span class="sb-emoji">${emoji}</span></div>
<div class="sb-portrait-vignette"></div>
</div>`;
}
}