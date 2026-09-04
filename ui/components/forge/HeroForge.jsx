import { useState, useEffect, useMemo, useRef } from 'preact/hooks';
import { useStore } from '../../core/hooks.js';
import { TOME } from '../../../core/Registry.js';
import { Toast } from '../Toast.js';
import { Schemas } from '../../../data/schemas.js';
import { Dice } from '../../../utils/Dice.js';

const DND_CLASSES = {
    'Guerreiro':   { hitDie: 10, saves: ['str', 'con'], primary: 'str', isCaster: false },
    'Mago':        { hitDie: 6,  saves: ['int', 'wis'], primary: 'int', isCaster: true,  casterStat: 'int' },
    'Ladino':      { hitDie: 8,  saves: ['dex', 'int'], primary: 'dex', isCaster: false },
    'Clérigo':     { hitDie: 8,  saves: ['wis', 'cha'], primary: 'wis', isCaster: true,  casterStat: 'wis' },
    'Paladino':    { hitDie: 10, saves: ['wis', 'cha'], primary: 'str', isCaster: true,  casterStat: 'cha' },
    'Bárbaro':     { hitDie: 12, saves: ['str', 'con'], primary: 'str', isCaster: false },
    'Bardo':       { hitDie: 8,  saves: ['dex', 'cha'], primary: 'cha', isCaster: true,  casterStat: 'cha' },
    'Bruxo':       { hitDie: 8,  saves: ['wis', 'cha'], primary: 'cha', isCaster: true,  casterStat: 'cha' },
    'Druida':      { hitDie: 8,  saves: ['int', 'wis'], primary: 'wis', isCaster: true,  casterStat: 'wis' },
    'Feiticeiro':  { hitDie: 6,  saves: ['con', 'cha'], primary: 'cha', isCaster: true,  casterStat: 'cha' },
    'Monge':       { hitDie: 8,  saves: ['str', 'dex'], primary: 'dex', isCaster: false },
    'Patrulheiro': { hitDie: 10, saves: ['str', 'dex'], primary: 'dex', isCaster: true,  casterStat: 'wis' }
};

const DND_RACES = [
    'Humano', 'Elfo Alto', 'Elfo da Floresta', 'Drow', 'Anão da Colina', 'Anão da Montanha',
    'Halfling Pés-Leves', 'Halfling Robusto', 'Draconato', 'Gnomo da Floresta', 'Gnomo das Rochas',
    'Meio-Elfo', 'Meio-Orc', 'Tiefling', 'Aasimar', 'Golias', 'Tabaxi'
];

const ALIGNMENTS = [
    'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
    'Leal e Neutro', 'Neutro Puro', 'Caótico e Neutro',
    'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau'
];

const POINT_BUY_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const ALL_SKILLS = [
    { id: 'athletics',      name: 'Atletismo',          stat: 'str' },
    { id: 'acrobatics',     name: 'Acrobacia',          stat: 'dex' },
    { id: 'sleightOfHand',  name: 'Prestidigitação',    stat: 'dex' },
    { id: 'stealth',        name: 'Furtividade',        stat: 'dex' },
    { id: 'arcana',         name: 'Arcanismo',          stat: 'int' },
    { id: 'history',        name: 'História',           stat: 'int' },
    { id: 'investigation',  name: 'Investigação',       stat: 'int' },
    { id: 'nature',         name: 'Natureza',           stat: 'int' },
    { id: 'religion',       name: 'Religião',           stat: 'int' },
    { id: 'animalHandling', name: 'Adestrar Animais',   stat: 'wis' },
    { id: 'insight',        name: 'Intuição',           stat: 'wis' },
    { id: 'medicine',       name: 'Medicina',           stat: 'wis' },
    { id: 'perception',     name: 'Percepção',          stat: 'wis' },
    { id: 'survival',       name: 'Sobrevivência',      stat: 'wis' },
    { id: 'deception',      name: 'Enganação',          stat: 'cha' },
    { id: 'intimidation',   name: 'Intimidação',        stat: 'cha' },
    { id: 'performance',    name: 'Atuação',            stat: 'cha' },
    { id: 'persuasion',     name: 'Persuasão',          stat: 'cha' }
];

const STAT_LABELS = {
    str: 'Força (FOR)',
    dex: 'Destreza (DES)',
    con: 'Constituição (CON)',
    int: 'Inteligência (INT)',
    wis: 'Sabedoria (SAB)',
    cha: 'Carisma (CAR)'
};

export function HeroForge() {
    const storeState = useStore();
    const editingHeroId = storeState?.editingHeroId;
    const existingHero = useMemo(() => {
        if (!editingHeroId || !storeState?.players) return null;
        return storeState.players.find(p => p.id === editingHeroId) || null;
    }, [editingHeroId, storeState?.players]);

    const [currentTab, setCurrentTab] = useState('identity');
    const [statMode, setStatMode] = useState('pointBuy'); // 'pointBuy' | 'standard' | 'roll' | 'manual'

    // Form states
    const [name, setName] = useState('');
    const [race, setRace] = useState('Humano');
    const [characterClass, setCharacterClass] = useState('Guerreiro');
    const [subclass, setSubclass] = useState('');
    const [level, setLevel] = useState(1);
    const [background, setBackground] = useState('');
    const [alignment, setAlignment] = useState('Neutro e Bom');
    const [playerName, setPlayerName] = useState('');

    const [stats, setStats] = useState({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    const [savingThrows, setSavingThrows] = useState({ str: true, dex: false, con: true, int: false, wis: false, cha: false });
    const [skills, setSkills] = useState(['athletics']);

    const [hpMax, setHpMax] = useState(12);
    const [hpCurrent, setHpCurrent] = useState(12);
    const [customAC, setCustomAC] = useState(null);
    const [speed, setSpeed] = useState(30);

    const [attacks, setAttacks] = useState([
        { name: 'Espada Longa', bonus: '+5', damage: '1d8+3 Cortante', type: 'Corpo a Corpo' }
    ]);

    const [inventory, setInventory] = useState([
        { name: 'Armadura de Couro Batido', qty: 1, weight: 13 },
        { name: 'Mochila de Aventureiro', qty: 1, weight: 5 },
        { name: 'Rações de Viagem (1 dia)', qty: 5, weight: 10 }
    ]);
    const [coins, setCoins] = useState({ cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 });

    const [spells, setSpells] = useState({ cantrips: [], prepared: [], slots: { 1: 2, 2: 0, 3: 0 } });
    const [portraitData, setPortraitData] = useState(null);

    const fileInputRef = useRef(null);

    // Initial population on mount or when existingHero changes
    useEffect(() => {
        if (existingHero) {
            setName(existingHero.name || '');
            setRace(existingHero.race || 'Humano');
            setCharacterClass(existingHero.class || 'Guerreiro');
            setSubclass(existingHero.subclass || '');
            setLevel(existingHero.level || 1);
            setBackground(existingHero.background || '');
            setAlignment(existingHero.alignment || 'Neutro e Bom');
            setPlayerName(existingHero.playerName || '');
            if (existingHero.stats) setStats({ ...existingHero.stats });
            if (existingHero.savingThrows) setSavingThrows({ ...existingHero.savingThrows });
            if (existingHero.skills) setSkills([...existingHero.skills]);
            
            const curHp = typeof existingHero.hp === 'object' ? (existingHero.hp.max || 10) : (existingHero.hp || 10);
            setHpMax(curHp);
            setHpCurrent(typeof existingHero.hp === 'object' ? (existingHero.hp.current || curHp) : curHp);
            setCustomAC(existingHero.ac || null);
            setSpeed(existingHero.speed || 30);
            if (existingHero.attacks && existingHero.attacks.length) setAttacks([...existingHero.attacks]);
            if (existingHero.equipment?.items) setInventory([...existingHero.equipment.items]);
            if (existingHero.currency) setCoins({ ...existingHero.currency });
            if (existingHero.portraitData) setPortraitData(existingHero.portraitData);
        } else {
            // New hero blank
            setName('');
            setRace('Humano');
            setCharacterClass('Guerreiro');
            setLevel(1);
            setStats({ str: 15, dex: 13, con: 14, int: 10, wis: 12, cha: 8 });
            setSavingThrows({ str: true, dex: false, con: true, int: false, wis: false, cha: false });
            setSkills(['athletics', 'perception']);
            setPortraitData(null);
        }
    }, [existingHero]);

    // Update class defaults (saves & hitDie) on class change if new character
    const handleClassChange = (newCls) => {
        setCharacterClass(newCls);
        const clsInfo = DND_CLASSES[newCls];
        if (clsInfo) {
            const newSaves = { str: false, dex: false, con: false, int: false, wis: false, cha: false };
            clsInfo.saves.forEach(s => { newSaves[s] = true; });
            setSavingThrows(newSaves);

            // Recalcula HP sugerido
            const conMod = Math.floor((stats.con - 10) / 2);
            const baseHp = clsInfo.hitDie + conMod + (level - 1) * (Math.floor(clsInfo.hitDie / 2) + 1 + conMod);
            const calculatedHp = Math.max(1, baseHp);
            setHpMax(calculatedHp);
            setHpCurrent(calculatedHp);
        }
    };

    // Modifiers & Derived stats
    const getMod = (val) => Math.floor(((parseInt(val) || 10) - 10) / 2);
    const formatMod = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const profBonus = useMemo(() => Math.floor((level - 1) / 4) + 2, [level]);
    const dexMod = useMemo(() => getMod(stats.dex), [stats.dex]);
    const conMod = useMemo(() => getMod(stats.con), [stats.con]);
    const currentAC = useMemo(() => (customAC !== null && customAC !== undefined) ? customAC : (10 + dexMod), [customAC, dexMod]);
    const initiative = dexMod;
    const passivePerception = useMemo(() => {
        const wisMod = getMod(stats.wis);
        const hasProf = skills.includes('perception');
        return 10 + wisMod + (hasProf ? profBonus : 0);
    }, [stats.wis, skills, profBonus]);

    // Point buy remaining points
    const pointBuyRemaining = useMemo(() => {
        let spent = 0;
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(st => {
            const val = stats[st] || 8;
            spent += (POINT_BUY_COSTS[val] ?? 0);
        });
        return 27 - spent;
    }, [stats]);

    const changePointBuy = (stat, delta) => {
        const currentVal = stats[stat] || 8;
        const targetVal = currentVal + delta;
        if (targetVal < 8 || targetVal > 15) return;
        const currentCost = POINT_BUY_COSTS[currentVal] || 0;
        const targetCost = POINT_BUY_COSTS[targetVal] || 0;
        const costDiff = targetCost - currentCost;
        if (pointBuyRemaining - costDiff < 0) {
            Toast.show('Pontos de compra insuficientes!', 'warning');
            return;
        }
        setStats(prev => ({ ...prev, [stat]: targetVal }));
    };

    const roll4d6DropLowest = () => {
        const newStats = {};
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(st => {
            const rolls = [Dice.roll(6).total, Dice.roll(6).total, Dice.roll(6).total, Dice.roll(6).total];
            rolls.sort((a, b) => a - b);
            const sum = rolls[1] + rolls[2] + rolls[3];
            newStats[st] = sum;
        });
        setStats(newStats);
        Toast.show('🎲 4d6 (descarta menor) rolado para todos os atributos!', 'success');
    };

    const toggleSkill = (skillId) => {
        setSkills(prev => prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]);
    };

    const toggleSave = (statKey) => {
        setSavingThrows(prev => ({ ...prev, [statKey]: !prev[statKey] }));
    };

    // Attacks & Weapons
    const addAttack = () => {
        setAttacks(prev => [...prev, { name: 'Novo Ataque', bonus: '+4', damage: '1d6+2', type: 'Corpo a Corpo' }]);
    };
    const removeAttack = (idx) => {
        setAttacks(prev => prev.filter((_, i) => i !== idx));
    };
    const updateAttack = (idx, field, val) => {
        setAttacks(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    // Inventory
    const addInventoryItem = () => {
        setInventory(prev => [...prev, { name: 'Item', qty: 1, weight: 1 }]);
    };
    const removeInventoryItem = (idx) => {
        setInventory(prev => prev.filter((_, i) => i !== idx));
    };
    const updateInventoryItem = (idx, field, val) => {
        setInventory(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: val };
            return copy;
        });
    };

    // Image Upload & Local Canvas Compression
    const handleAvatarFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxDim = 360;
                let w = img.width;
                let h = img.height;
                if (w > h) {
                    if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
                } else {
                    if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.85);
                setPortraitData(compressed);
                Toast.show('Retrato carregado e otimizado para o VTT!', 'info');
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Final Save Form
    const handleSaveHero = () => {
        if (!name.trim()) {
            Toast.show('Por favor, informe o nome do herói!', 'warning');
            setCurrentTab('identity');
            return;
        }

        const heroPayload = Schemas.createPlayer({
            id: editingHeroId || ('hero_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)),
            name: name.trim(),
            race,
            class: characterClass,
            subclass,
            level: parseInt(level) || 1,
            background,
            alignment,
            playerName,
            stats,
            savingThrows,
            skills,
            hp: { current: parseInt(hpCurrent) || 10, max: parseInt(hpMax) || 10, temp: 0 },
            ac: parseInt(currentAC) || 10,
            speed: parseInt(speed) || 30,
            initiative: dexMod,
            proficiencyBonus: profBonus,
            attacks,
            equipment: { items: inventory, notes: '' },
            currency: coins,
            portraitData: portraitData || null,
            spells
        });

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.players) s.players = [];
                const idx = s.players.findIndex(p => p.id === heroPayload.id);
                if (idx >= 0) {
                    s.players[idx] = heroPayload;
                } else {
                    s.players.push(heroPayload);
                }
                s.editingHeroId = null;
                s.viewingHeroId = heroPayload.id;
                s.activeTab = 'herohub';
            });
        }

        Toast.show(`⚔️ ${heroPayload.name} foi forjado com glória!`, 'success');
    };

    const handleExportJSON = () => {
        const payload = {
            name, race, class: characterClass, subclass, level, background, alignment,
            stats, savingThrows, skills, hpMax, currentAC, speed, attacks, inventory, coins, portraitData
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(name || 'heroi').toLowerCase().replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.show('Ficha exportada!', 'info');
    };

    const handleImportJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const r = new FileReader();
            r.onload = (re) => {
                try {
                    const data = JSON.parse(re.target.result);
                    if (data.name) setName(data.name);
                    if (data.race) setRace(data.race);
                    if (data.class) setCharacterClass(data.class);
                    if (data.level) setLevel(data.level);
                    if (data.stats) setStats(data.stats);
                    if (data.skills) setSkills(data.skills);
                    if (data.attacks) setAttacks(data.attacks);
                    if (data.portraitData) setPortraitData(data.portraitData);
                    Toast.show('Ficha importada com sucesso!', 'success');
                } catch(err) {
                    Toast.show('Arquivo JSON inválido.', 'danger');
                }
            };
            r.readAsText(file);
        };
        input.click();
    };

    const clsData = DND_CLASSES[characterClass] || DND_CLASSES['Guerreiro'];

    return (
        <div class="page max-w-[1400px] animate-fadeIn pb-24 font-outfit text-slate-200">
            {/* Header / Hero Summary Card */}
            <div class="card glass-accent p-6 rounded-2xl mb-8 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-[#0a0c10]/95 via-[#121620]/90 to-[#0a0c10]/95 border border-accent/30 shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
                <div class="flex items-center gap-5">
                    <div 
                        class="w-16 h-16 rounded-full border-2 border-accent bg-black/60 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(197,160,89,0.3)] shrink-0 cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                        title="Clique para alterar retrato">
                        {portraitData ? (
                            <img src={portraitData} alt="Retrato" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                            <span class="font-cinzel text-2xl font-bold text-accent">{(name || 'H').substring(0, 1).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <span class="text-[0.65rem] text-accent uppercase font-black tracking-widest font-cinzel">Forja Arcana de Lendas</span>
                        <h1 class="m-0 font-cinzel text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                            {name || 'Novo Aventureiro'}
                        </h1>
                        <div class="text-xs text-slate-400 mt-1 font-bold">
                            {race} • {characterClass} {subclass ? `(${subclass})` : ''} • Nível {level}
                        </div>
                    </div>
                </div>

                <div class="flex gap-2.5 flex-wrap">
                    <button class="btn btn-ghost border-white/10 text-xs px-3 text-slate-400 hover:text-white" onClick={() => {
                        if (window.TOME?.store) {
                            window.TOME.store.update(s => {
                                s.editingHeroId = null;
                                s.activeTab = 'herohub';
                            });
                        }
                    }} title="Voltar ao Monitor de Heróis">
                        <i class="fa-solid fa-arrow-left mr-1.5"></i> Voltar
                    </button>
                    <button class="btn btn-ghost border-white/10 text-xs px-3" onClick={handleImportJSON} title="Importar JSON">
                        <i class="fa-solid fa-file-import mr-1.5"></i> Importar
                    </button>
                    <button class="btn btn-ghost border-white/10 text-xs px-3" onClick={handleExportJSON} title="Exportar JSON">
                        <i class="fa-solid fa-file-export mr-1.5"></i> Exportar
                    </button>
                    <button class="btn btn-primary px-5 py-2.5 font-cinzel font-bold text-sm shadow-[0_0_15px_rgba(197,160,89,0.3)]" onClick={handleSaveHero}>
                        <i class="fa-solid fa-hammer mr-2"></i> {editingHeroId ? 'Salvar Alterações' : 'Forjar Herói'}
                    </button>
                    <button class="btn btn-ghost border-white/10 text-xs px-3" onClick={() => { TOME.store.update(s => { s.editingHeroId = null; s.activeTab = 'herohub'; }); }}>
                        <i class="fa-solid fa-arrow-left mr-1.5"></i> Voltar
                    </button>
                </div>
            </div>

            {/* Step Navigation Tabs */}
            <div class="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide border-b border-white/10">
                {[
                    { id: 'identity', label: '1. Identidade', icon: 'fa-user-shield' },
                    { id: 'stats', label: '2. Atributos', icon: 'fa-bolt' },
                    { id: 'skills', label: '3. Perícias & Salvaguardas', icon: 'fa-certificate' },
                    { id: 'combat', label: '4. Combate & Armas', icon: 'fa-khanda' },
                    { id: 'equipment', label: '5. Equipamento & Moedas', icon: 'fa-sack-dollar' },
                    { id: 'spells', label: '6. Grimório', icon: 'fa-wand-magic-sparkles' },
                    { id: 'token', label: '7. Retrato & Token', icon: 'fa-image' }
                ].map(t => (
                    <button 
                        key={t.id}
                        class={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                            currentTab === t.id 
                                ? 'bg-accent/20 text-accent border border-accent/40 shadow-[0_0_12px_rgba(197,160,89,0.2)]' 
                                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                        }`}
                        onClick={() => setCurrentTab(t.id)}>
                        <i class={`fa-solid ${t.icon}`}></i> {t.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            
            {/* 1. IDENTIDADE */}
            {currentTab === 'identity' && (
                <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Nome do Personagem *</label>
                        <input 
                            type="text" 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            placeholder="Ex: Aldric Corvo-de-Aço"
                            value={name}
                            onInput={e => setName(e.target.value)}
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Nome do Jogador</label>
                        <input 
                            type="text" 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            placeholder="Seu nome ou apelido"
                            value={playerName}
                            onInput={e => setPlayerName(e.target.value)}
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Raça / Espécie</label>
                        <select 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            value={race}
                            onChange={e => setRace(e.target.value)}>
                            {DND_RACES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Classe Principal</label>
                        <select 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            value={characterClass}
                            onChange={e => handleClassChange(e.target.value)}>
                            {Object.keys(DND_CLASSES).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Subclasse / Arquétipo</label>
                        <input 
                            type="text" 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            placeholder="Ex: Mestre de Batalha, Evocação, Ladrão..."
                            value={subclass}
                            onInput={e => setSubclass(e.target.value)}
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Nível (1 a 20)</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="20"
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            value={level}
                            onInput={e => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Antecedente (Background)</label>
                        <input 
                            type="text" 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            placeholder="Ex: Soldado, Acólito, Forasteiro, Criminoso..."
                            value={background}
                            onInput={e => setBackground(e.target.value)}
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-black uppercase tracking-wider text-slate-400">Tendência Moral</label>
                        <select 
                            class="bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-accent outline-none"
                            value={alignment}
                            onChange={e => setAlignment(e.target.value)}>
                            {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* 2. ATRIBUTOS */}
            {currentTab === 'stats' && (
                <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 animate-fadeIn flex flex-col gap-6">
                    {/* Method selector */}
                    <div class="flex justify-between items-center flex-wrap gap-4 border-b border-white/10 pb-4">
                        <div>
                            <h3 class="m-0 font-cinzel text-lg text-accent">Geração de Atributos</h3>
                            <span class="text-xs text-slate-400">Selecione o método de geração e configure os 6 valores básicos.</span>
                        </div>
                        <div class="flex gap-2">
                            <button 
                                class={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statMode === 'pointBuy' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                onClick={() => setStatMode('pointBuy')}>
                                Point Buy (27 pts)
                            </button>
                            <button 
                                class={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statMode === 'standard' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                onClick={() => {
                                    setStatMode('standard');
                                    setStats({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
                                }}>
                                Matriz Padrão
                            </button>
                            <button 
                                class={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statMode === 'roll' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                onClick={() => { setStatMode('roll'); roll4d6DropLowest(); }}>
                                🎲 Rolar 4d6
                            </button>
                            <button 
                                class={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statMode === 'manual' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                onClick={() => setStatMode('manual')}>
                                Manual
                            </button>
                        </div>
                    </div>

                    {statMode === 'pointBuy' && (
                        <div class="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-bold">
                            <span><i class="fa-solid fa-coins mr-1.5"></i> Pontos Restantes: <strong>{pointBuyRemaining}</strong> / 27</span>
                            <span class="text-slate-400 font-normal">Valores entre 8 e 15 (custo D&D 5e oficial)</span>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(st => {
                            const val = stats[st] || 10;
                            const mod = getMod(val);
                            return (
                                <div key={st} class="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col gap-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs font-black uppercase tracking-wider text-slate-400">{STAT_LABELS[st]}</span>
                                        <span class={`text-base font-black px-2.5 py-0.5 rounded-lg font-cinzel ${mod >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                            {formatMod(mod)}
                                        </span>
                                    </div>

                                    <div class="flex items-center justify-between gap-3">
                                        {statMode === 'pointBuy' ? (
                                            <>
                                                <button class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-bold hover:bg-white/10 active:scale-95" onClick={() => changePointBuy(st, -1)} disabled={val <= 8}>-</button>
                                                <span class="text-2xl font-black font-cinzel text-white">{val}</span>
                                                <button class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-bold hover:bg-white/10 active:scale-95" onClick={() => changePointBuy(st, 1)} disabled={val >= 15}>+</button>
                                            </>
                                        ) : (
                                            <input 
                                                type="number" 
                                                min="1" 
                                                max="30"
                                                class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center text-xl font-bold font-cinzel text-white outline-none focus:border-accent"
                                                value={val}
                                                onInput={e => setStats(prev => ({ ...prev, [st]: parseInt(e.target.value) || 10 }))}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Derived stats Preview Bar */}
                    <div class="p-4 rounded-xl bg-black/80 border border-accent/20 flex flex-wrap justify-around gap-4 text-center">
                        <div>
                            <span class="text-[0.65rem] uppercase font-black text-slate-400 tracking-wider">PV Máximo Sugerido</span>
                            <div class="text-lg font-black text-emerald-400 font-cinzel">{hpMax} (d{clsData.hitDie})</div>
                        </div>
                        <div>
                            <span class="text-[0.65rem] uppercase font-black text-slate-400 tracking-wider">Classe de Armadura</span>
                            <div class="text-lg font-black text-white font-cinzel">{currentAC}</div>
                        </div>
                        <div>
                            <span class="text-[0.65rem] uppercase font-black text-slate-400 tracking-wider">Iniciativa</span>
                            <div class="text-lg font-black text-blue-400 font-cinzel">{formatMod(initiative)}</div>
                        </div>
                        <div>
                            <span class="text-[0.65rem] uppercase font-black text-slate-400 tracking-wider">Bônus de Proficiência</span>
                            <div class="text-lg font-black text-accent font-cinzel">+{profBonus}</div>
                        </div>
                        <div>
                            <span class="text-[0.65rem] uppercase font-black text-slate-400 tracking-wider">Percepção Passiva</span>
                            <div class="text-lg font-black text-purple-300 font-cinzel">{passivePerception}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. PERÍCIAS & SALVAGUARDAS */}
            {currentTab === 'skills' && (
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {/* Salvaguardas */}
                    <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
                        <h3 class="m-0 font-cinzel text-base text-accent mb-2 border-b border-white/10 pb-2">Salvaguardas</h3>
                        {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(st => {
                            const isProf = savingThrows[st];
                            const bonus = getMod(stats[st]) + (isProf ? profBonus : 0);
                            return (
                                <label key={st} class="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <div class="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={isProf} 
                                            onChange={() => toggleSave(st)} 
                                            class="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                        />
                                        <span class="text-xs font-bold text-slate-300">{STAT_LABELS[st]}</span>
                                    </div>
                                    <span class={`text-xs font-bold font-cinzel px-2 py-0.5 rounded ${isProf ? 'text-accent bg-accent/10' : 'text-slate-400'}`}>
                                        {formatMod(bonus)}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Perícias */}
                    <div class="col-span-2 card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-3">
                        <div class="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                            <h3 class="m-0 font-cinzel text-base text-accent">Perícias (D&D 5e)</h3>
                            <span class="text-xs text-slate-400 font-bold">{skills.length} Perícias Selecionadas</span>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {ALL_SKILLS.map(sk => {
                                const isProf = skills.includes(sk.id);
                                const statMod = getMod(stats[sk.stat]);
                                const total = statMod + (isProf ? profBonus : 0);
                                return (
                                    <label key={sk.id} class={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${isProf ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                        <div class="flex items-center gap-2.5">
                                            <input 
                                                type="checkbox" 
                                                checked={isProf} 
                                                onChange={() => toggleSkill(sk.id)}
                                                class="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                            />
                                            <span class="text-xs font-bold text-slate-200">{sk.name}</span>
                                            <span class="text-[0.65rem] text-slate-500 uppercase font-black">({sk.stat})</span>
                                        </div>
                                        <span class={`text-xs font-bold font-cinzel px-2 py-0.5 rounded ${isProf ? 'text-accent font-black' : 'text-slate-400'}`}>
                                            {formatMod(total)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. COMBATE & ARMAS */}
            {currentTab === 'combat' && (
                <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 animate-fadeIn flex flex-col gap-6">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/10 pb-6">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-black uppercase tracking-wider text-slate-400">PV Máximo</label>
                            <input 
                                type="number" 
                                class="bg-black/60 border border-white/10 rounded-xl p-2.5 text-emerald-400 font-cinzel font-bold text-lg outline-none focus:border-accent"
                                value={hpMax}
                                onInput={e => setHpMax(parseInt(e.target.value) || 10)}
                            />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-black uppercase tracking-wider text-slate-400">Classe de Armadura (CA)</label>
                            <input 
                                type="number" 
                                class="bg-black/60 border border-white/10 rounded-xl p-2.5 text-white font-cinzel font-bold text-lg outline-none focus:border-accent"
                                value={currentAC}
                                onInput={e => setCustomAC(parseInt(e.target.value) || 10)}
                            />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-black uppercase tracking-wider text-slate-400">Deslocamento (Pés / ft)</label>
                            <input 
                                type="number" 
                                class="bg-black/60 border border-white/10 rounded-xl p-2.5 text-blue-400 font-cinzel font-bold text-lg outline-none focus:border-accent"
                                value={speed}
                                onInput={e => setSpeed(parseInt(e.target.value) || 30)}
                            />
                        </div>
                    </div>

                    <div class="flex justify-between items-center">
                        <h3 class="m-0 font-cinzel text-base text-accent">Armas e Ações de Ataque</h3>
                        <button class="btn btn-ghost border-accent/40 text-accent text-xs px-3 py-1.5" onClick={addAttack}>
                            <i class="fa-solid fa-plus mr-1"></i> Adicionar Arma
                        </button>
                    </div>

                    <div class="flex flex-col gap-3">
                        {attacks.map((atk, idx) => (
                            <div key={idx} class="p-3.5 rounded-xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-[2fr_1fr_2fr_1fr_auto] gap-3 items-center">
                                <input 
                                    type="text" 
                                    class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-accent"
                                    placeholder="Nome da Arma"
                                    value={atk.name}
                                    onInput={e => updateAttack(idx, 'name', e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-center font-bold text-accent outline-none focus:border-accent"
                                    placeholder="Bônus (+5)"
                                    value={atk.bonus}
                                    onInput={e => updateAttack(idx, 'bonus', e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-accent"
                                    placeholder="Dano (ex: 1d8+3 Cortante)"
                                    value={atk.damage}
                                    onInput={e => updateAttack(idx, 'damage', e.target.value)}
                                />
                                <select 
                                    class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-accent"
                                    value={atk.type || 'Corpo a Corpo'}
                                    onChange={e => updateAttack(idx, 'type', e.target.value)}>
                                    <option value="Corpo a Corpo">Corpo a Corpo</option>
                                    <option value="Distância">Distância</option>
                                    <option value="Magia">Magia</option>
                                </select>
                                <button class="btn btn-ghost p-2 text-red-400 hover:text-red-300" onClick={() => removeAttack(idx)}>
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 5. EQUIPAMENTO & MOEDAS */}
            {currentTab === 'equipment' && (
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                    <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-4">
                        <h3 class="m-0 font-cinzel text-base text-accent border-b border-white/10 pb-2">Bolsa de Moedas</h3>
                        {[
                            { key: 'cp', label: 'Cobre (PC)', color: 'text-amber-700' },
                            { key: 'sp', label: 'Prata (PP)', color: 'text-slate-300' },
                            { key: 'ep', label: 'Electrum (PE)', color: 'text-cyan-400' },
                            { key: 'gp', label: 'Ouro (PO)', color: 'text-amber-400' },
                            { key: 'pp', label: 'Platina (PL)', color: 'text-blue-200' }
                        ].map(c => (
                            <div key={c.key} class="flex justify-between items-center">
                                <span class={`text-xs font-bold ${c.color}`}>{c.label}</span>
                                <input 
                                    type="number" 
                                    class="w-24 bg-black/60 border border-white/10 rounded-lg p-2 text-right text-sm font-bold text-white outline-none focus:border-accent"
                                    value={coins[c.key] || 0}
                                    onInput={e => setCoins(prev => ({ ...prev, [c.key]: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        ))}
                    </div>

                    <div class="col-span-2 card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-4">
                        <div class="flex justify-between items-center border-b border-white/10 pb-2">
                            <h3 class="m-0 font-cinzel text-base text-accent">Mochila de Itens</h3>
                            <button class="btn btn-ghost border-accent/40 text-accent text-xs px-3 py-1.5" onClick={addInventoryItem}>
                                <i class="fa-solid fa-plus mr-1"></i> Adicionar Item
                            </button>
                        </div>

                        <div class="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {inventory.map((item, idx) => (
                                <div key={idx} class="grid grid-cols-[1fr_80px_80px_auto] gap-2.5 items-center p-2 rounded-lg bg-white/5 border border-white/5">
                                    <input 
                                        type="text" 
                                        class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-accent"
                                        placeholder="Nome do Item"
                                        value={item.name}
                                        onInput={e => updateInventoryItem(idx, 'name', e.target.value)}
                                    />
                                    <input 
                                        type="number" 
                                        class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-center text-white outline-none focus:border-accent"
                                        placeholder="Qtd"
                                        value={item.qty}
                                        onInput={e => updateInventoryItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                    />
                                    <input 
                                        type="number" 
                                        class="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-center text-slate-400 outline-none focus:border-accent"
                                        placeholder="Kg"
                                        value={item.weight}
                                        onInput={e => updateInventoryItem(idx, 'weight', parseFloat(e.target.value) || 0)}
                                    />
                                    <button class="btn btn-ghost p-2 text-red-400 hover:text-red-300" onClick={() => removeInventoryItem(idx)}>
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 6. GRIMÓRIO & MAGIAS */}
            {currentTab === 'spells' && (
                <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 animate-fadeIn flex flex-col gap-6">
                    <div class="flex justify-between items-center border-b border-white/10 pb-4">
                        <div>
                            <h3 class="m-0 font-cinzel text-lg text-accent">Grimório Arcano & Conjurador</h3>
                            <span class="text-xs text-slate-400">Atributo Conjurador: <strong>{clsData.casterStat ? STAT_LABELS[clsData.casterStat] : 'Não Conjurador'}</strong></span>
                        </div>

                        {clsData.isCaster && (
                            <div class="flex gap-4">
                                <div class="px-3.5 py-1.5 rounded-xl bg-purple-900/30 border border-purple-500/40 text-center">
                                    <span class="text-[0.6rem] uppercase text-purple-300 font-extrabold block">CD Salvaguarda</span>
                                    <span class="text-lg font-black text-white font-cinzel">
                                        {8 + profBonus + getMod(stats[clsData.casterStat || 'int'])}
                                    </span>
                                </div>
                                <div class="px-3.5 py-1.5 rounded-xl bg-purple-900/30 border border-purple-500/40 text-center">
                                    <span class="text-[0.6rem] uppercase text-purple-300 font-extrabold block">Ataque Mágico</span>
                                    <span class="text-lg font-black text-white font-cinzel">
                                        {formatMod(profBonus + getMod(stats[clsData.casterStat || 'int']))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div class="p-6 rounded-xl bg-black/60 border border-white/5 text-center text-slate-400 text-sm">
                        <i class="fa-solid fa-scroll text-3xl mb-3 text-accent opacity-60"></i>
                        <p class="m-0">O Grimório está integrado ao banco canônico de magias 5e. Você também pode gerenciar suas magias preparadas e espaços na Ficha Completa.</p>
                    </div>
                </div>
            )}

            {/* 7. RETRATO & TOKEN */}
            {currentTab === 'token' && (
                <div class="card glass-accent p-6 rounded-2xl bg-black/40 border border-white/10 animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div class="flex flex-col items-center gap-4">
                        <div class="w-48 h-48 rounded-full border-4 border-accent shadow-[0_0_30px_rgba(197,160,89,0.3)] bg-black/80 flex items-center justify-center overflow-hidden relative">
                            {portraitData ? (
                                <img src={portraitData} alt="Retrato" class="w-full h-full object-cover" />
                            ) : (
                                <i class="fa-solid fa-user-ninja text-6xl text-accent/40"></i>
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            class="hidden" 
                            onChange={handleAvatarFile} 
                        />
                        <button class="btn btn-primary px-5 py-2 text-xs font-bold" onClick={() => fileInputRef.current?.click()}>
                            <i class="fa-solid fa-upload mr-2"></i> Selecionar Imagem Local
                        </button>
                    </div>

                    <div class="flex flex-col gap-3">
                        <h4 class="m-0 font-cinzel text-lg text-accent">Geração de Token Tático</h4>
                        <p class="text-xs text-slate-400 leading-relaxed">
                            A imagem selecionada será comprimida automaticamente no navegador e utilizada tanto na ficha de personagem quanto no token tático circular do mapa PixiJS (com moldura de facção aliada azul/verde).
                        </p>
                        {portraitData && (
                            <button class="btn btn-ghost border-red-500/30 text-red-400 text-xs w-fit" onClick={() => setPortraitData(null)}>
                                <i class="fa-solid fa-times mr-1.5"></i> Remover Imagem
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default HeroForge;
