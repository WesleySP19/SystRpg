import { useState, useMemo, useCallback, useRef, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { MonsterData } from '../../data/MonsterData.js';
import { Toast } from '../components/core/Toast.jsx';
import { Dice } from '../../utils/Dice.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { Schemas } from '../../data/schemas.js';

// ==========================================
// SUBCOMPONENT: Monster Token (Circular)
// ==========================================
function MonsterToken({ monster, size = "w-20 h-20", showGlow = true }) {
    const [imgFailed, setImgFailed] = useState(false);
    const heraldry = useMemo(() => MonsterArt.getHeraldry(monster), [monster]);
    const rawSrc = useMemo(() => {
        if (monster.customImg) return monster.customImg;
        if (monster.img && !monster.img.includes('wikimedia.org')) return monster.img;
        return MonsterArt.getImage(monster, true) || MonsterArt.getCdnFallback(monster, true);
    }, [monster]);

    return (
        <div class={`${size} relative rounded-full overflow-hidden flex items-center justify-center border-2 border-accent/60 bg-slate-950 shrink-0 ${showGlow ? 'shadow-[0_4px_15px_rgba(0,0,0,0.8),0_0_12px_rgba(197,160,89,0.25)]' : ''}`}>
            {rawSrc && !imgFailed ? (
                <img
                    src={rawSrc}
                    alt={monster.name}
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={() => setImgFailed(true)}
                />
            ) : (
                <div class="w-full h-full flex flex-col items-center justify-center text-center p-1" style={{ background: heraldry.bg }}>
                    {monster.emoji ? (
                        <span class="text-2xl filter drop-shadow">{monster.emoji}</span>
                    ) : (
                        <i class={`${heraldry.icon} text-2xl drop-shadow`} style={{ color: heraldry.color }}></i>
                    )}
                </div>
            )}
        </div>
    );
}

// ==========================================
// MAIN COMPONENT: Bestiário Arcano v8.0
// ==========================================
export function Bestiary() {
    const storeState = useStore();
    const customMonsters = storeState?.customMonsters || [];
    const monsterOverrides = storeState?.monsterOverrides || {};

    // Navigation & Views
    const [selectedMonster, setSelectedMonster] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

    // Filters
    const [selectedLevel, setSelectedLevel] = useState('Todos');
    const [selectedType, setSelectedType] = useState('Todos');
    const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'srd' | 'custom'
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showForgeModal, setShowForgeModal] = useState(false);
    const [forgeData, setForgeData] = useState(null); // null = new, object = edit/clone
    const [showArtModal, setShowArtModal] = useState(false);
    const [artTargetMonster, setArtTargetMonster] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJsonText, setImportJsonText] = useState('');

    // Visual Dice Roller
    const [activeRoll, setActiveRoll] = useState(null);
    const [targetAC, setTargetAC] = useState(13);

    const fileImportInputRef = useRef(null);

    // ------------------------------------------
    // 1. DATA COMBINATION & NORMALIZATION
    // ------------------------------------------
    const allCreatures = useMemo(() => {
        const list = [];
        
        // SRD Monsters from MonsterData
        Object.entries(MonsterData).forEach(([levelKey, monsters]) => {
            if (Array.isArray(monsters)) {
                monsters.forEach(m => {
                    const override = monsterOverrides[m.name] || {};
                    list.push({
                        ...m,
                        ...override,
                        isCustom: false,
                        level: levelKey,
                        cr: levelKey.replace('Nível ', '')
                    });
                });
            }
        });

        // Custom Monsters from Store
        customMonsters.forEach(cm => {
            const override = monsterOverrides[cm.name] || {};
            const lvl = cm.level || (cm.cr ? `Nível ${cm.cr}` : 'Nível 1');
            list.push({
                ...cm,
                ...override,
                isCustom: true,
                level: lvl,
                cr: lvl.replace('Nível ', '')
            });
        });

        return list;
    }, [customMonsters, monsterOverrides]);

    // Available Types
    const availableTypes = useMemo(() => {
        const types = new Set();
        allCreatures.forEach(c => {
            if (c.type) types.add(c.type.trim());
        });
        return ['Todos', ...Array.from(types).sort()];
    }, [allCreatures]);

    // Available Levels
    const availableLevels = useMemo(() => {
        const lvls = Object.keys(MonsterData);
        return ['Todos', ...lvls];
    }, []);

    // Filtered Creatures
    const filteredCreatures = useMemo(() => {
        return allCreatures.filter(m => {
            // Source Filter
            if (sourceFilter === 'srd' && m.isCustom) return false;
            if (sourceFilter === 'custom' && !m.isCustom) return false;

            // Level Filter
            if (selectedLevel !== 'Todos' && m.level !== selectedLevel) return false;

            // Type Filter
            if (selectedType !== 'Todos' && (m.type || '').toLowerCase() !== selectedType.toLowerCase()) return false;

            // Search Query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = (m.name || '').toLowerCase().includes(q);
                const matchType = (m.type || '').toLowerCase().includes(q);
                const matchNotes = (m.notes || m.description || '').toLowerCase().includes(q);
                if (!matchName && !matchType && !matchNotes) return false;
            }

            return true;
        });
    }, [allCreatures, sourceFilter, selectedLevel, selectedType, searchQuery]);

    // ------------------------------------------
    // 2. ACTIONS & HELPERS
    // ------------------------------------------
    const getMod = (val) => Math.floor(((parseInt(val) || 10) - 10) / 2);
    const formatMod = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const getCreatureActions = useCallback((m) => {
        if (m.actions && m.actions.length > 0) {
            return m.actions.map(act => ({
                name: act.name || 'Ataque',
                bonus: act.bonus !== undefined ? act.bonus : (act.hit !== undefined ? act.hit : 4),
                damage: act.damage || act.dmg || '1d8+2',
                desc: act.desc || act.description || `Ataque especial causando ${act.damage || act.dmg || '1d8+2'} de dano.`
            }));
        }
        
        // Fallback procedural actions based on level
        const strMod = getMod(m.stats?.str ?? 14);
        const dexMod = getMod(m.stats?.dex ?? 12);
        const primaryMod = Math.max(strMod, dexMod);
        const prof = m.level === 'BOSS' ? 6 : Math.max(2, Math.min(6, Math.floor(((parseInt(m.cr) || 1) - 1) / 4) + 2));
        const toHit = primaryMod + prof;
        const dmgDice = m.damage || '1d8';

        return [
            { name: 'Ataque Principal', bonus: toHit, damage: `${dmgDice}${formatMod(primaryMod)}`, desc: `Ataque natural com bônus de ${formatMod(toHit)} e dano de ${dmgDice}${formatMod(primaryMod)}.` },
            { name: 'Investida Secundária', bonus: toHit, damage: '1d6+2', desc: `Golpe tático veloz causando 1d6+2 de dano.` }
        ];
    }, []);

    // Combat Summoning (1-Click)
    const handleSummonToCombat = (monster, e) => {
        if (e) e.stopPropagation();
        const maxHp = typeof monster.hp === 'object' ? (monster.hp.max ?? monster.hp.current ?? 10) : (Number(monster.hp) || 10);
        const imgUrl = monster.customImg || monster.img || MonsterArt.getImage(monster, true) || '';
        
        const entity = {
            id: 'm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: monster.name,
            cr: monster.cr || '1',
            hp_max: maxHp,
            hp: maxHp,
            ac: monster.ac || 10,
            emoji: monster.emoji || '👹',
            img: imgUrl,
            size: monster.size || 'Médio',
            speed: monster.speed || '30 ft.',
            type: monster.type || 'monster',
            originalData: { ...monster }
        };

        // Emit to listeners (InitiativeMonitor)
        if (window.TOME?.events) {
            window.TOME.events.emit('MONSTER_INVOKED', entity);
        }

        // Direct sync to store initiative order
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.initiativeOrder) s.initiativeOrder = [];
                if (!s.initiativeOrder.some(comb => comb.id === entity.id)) {
                    const initRoll = Dice.roll(20).total;
                    s.initiativeOrder.push({
                        id: entity.id,
                        name: entity.name,
                        initiative: initRoll,
                        hp: { current: entity.hp_max, max: entity.hp_max },
                        ac: entity.ac,
                        type: 'Enemy',
                        emoji: entity.emoji,
                        img: entity.img,
                        conditions: []
                    });
                    if (s.combatActive) {
                        s.initiativeOrder.sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
                    }
                }
            });
        }

        Toast.show(`⚔️ ${monster.name} foi invocado na Arena de Combate!`, 'success');
    };

    // Place on Tactical Map
    const handlePlaceOnMap = (monster, e) => {
        if (e) e.stopPropagation();
        handleSummonToCombat(monster);
        Toast.show(`🗺️ Token de ${monster.name} preparado no Mapa Tático!`, 'info');
    };

    // Clone Monster
    const handleCloneMonster = (monster, e) => {
        if (e) e.stopPropagation();
        const cloned = Schemas.createMonster({
            ...monster,
            id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: `${monster.name} (Clone)`,
            level: monster.level || 'Nível 1'
        });

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.customMonsters) s.customMonsters = [];
                s.customMonsters.push(cloned);
            });
        }
        Toast.show(`✨ ${cloned.name} clonado com sucesso na biblioteca!`, 'success');
    };

    // Delete Custom Monster
    const handleDeleteCustomMonster = (id, name, e) => {
        if (e) e.stopPropagation();
        if (confirm(`Deseja realmente banir "${name}" do Bestiário?`)) {
            if (window.TOME?.store) {
                window.TOME.store.update(s => {
                    s.customMonsters = (s.customMonsters || []).filter(m => m.id !== id);
                });
            }
            if (selectedMonster?.id === id) {
                setSelectedMonster(null);
            }
            Toast.show(`Criatura ${name} removida.`, 'warning');
        }
    };

    // Roll Monster Attack Interactive
    const handleStartAttackRoll = (monster, action) => {
        const bonus = action.bonus !== undefined ? action.bonus : 4;
        const damageFormula = action.damage || '1d8+2';

        setActiveRoll({
            stage: 'd20',
            rolling: true,
            monster,
            action,
            targetAC: parseInt(targetAC) || 13,
            d20: null,
            total: null,
            isCrit: false,
            isHit: false,
            damageFormula,
            damageRolls: [],
            damageTotal: null,
            narrative: ''
        });

        if (window.TOME?.audio) {
            if (window.TOME.audio.playSyntheticSFX) {
                window.TOME.audio.playSyntheticSFX('dice');
            } else {
                window.TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');
            }
        }

        setTimeout(() => {
            const hit = RulesEngine.checkHit(bonus, targetAC, 'normal');
            let narrative = '';
            if (hit.success) {
                if (window.TOME?.audio) {
                    if (hit.isCrit && window.TOME.audio.playSyntheticSFX) {
                        window.TOME.audio.playSyntheticSFX('crit');
                    } else if (window.TOME.audio.playSyntheticSFX) {
                        window.TOME.audio.playSyntheticSFX('hit');
                    } else {
                        window.TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');
                    }
                }
                narrative = hit.isCrit ? '💥 ACERTO CRÍTICO! Golpe devastador!' : '⚔️ ACERTOU! O ataque superou as defesas!';
            } else {
                if (window.TOME?.audio) {
                    if (window.TOME.audio.playSyntheticSFX) {
                        window.TOME.audio.playSyntheticSFX('alert');
                    } else {
                        window.TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                    }
                }
                narrative = '🛡️ ERROU! A armadura resistiu à investida.';
            }

            setActiveRoll(prev => prev ? ({
                ...prev,
                rolling: false,
                d20: hit.roll,
                total: hit.total,
                isCrit: hit.isCrit,
                isHit: hit.success,
                narrative
            }) : null);
        }, 900);
    };

    const handleRollDamage = () => {
        if (!activeRoll) return;
        setActiveRoll(prev => ({ ...prev, stage: 'damage' }));

        if (window.TOME?.audio) {
            if (window.TOME.audio.playSyntheticSFX) {
                window.TOME.audio.playSyntheticSFX('hit');
            } else {
                window.TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');
            }
        }

        setTimeout(() => {
            setActiveRoll(prev => {
                if (!prev) return null;
                const dmg = Dice.roll(prev.damageFormula);
                let total = prev.isCrit ? (dmg.total * 2) : dmg.total;
                if (isNaN(total)) total = 4;
                return {
                    ...prev,
                    stage: 'complete',
                    damageRolls: dmg.rolls || [total],
                    damageTotal: total,
                    narrative: `🩸 ${prev.monster.name} causou ${total} de dano com ${prev.action.name}!`
                };
            });
        }, 800);
    };

    // Save Forged Monster
    const handleSaveForgedMonster = (monsterObj) => {
        if (!monsterObj.name || !monsterObj.name.trim()) {
            Toast.show('Informe o nome da criatura!', 'warning');
            return;
        }

        const payload = Schemas.createMonster({
            id: monsterObj.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: monsterObj.name.trim(),
            type: monsterObj.type || 'Monstro',
            ac: parseInt(monsterObj.ac) || 10,
            hp: { current: parseInt(monsterObj.hp) || 10, max: parseInt(monsterObj.hp) || 10 },
            level: monsterObj.level || 'Nível 1',
            cr: (monsterObj.level || 'Nível 1').replace('Nível ', ''),
            emoji: monsterObj.emoji || '👹',
            img: monsterObj.img || '',
            speed: monsterObj.speed || '30 ft.',
            stats: monsterObj.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            actions: monsterObj.actions || [],
            notes: monsterObj.notes || ''
        });

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.customMonsters) s.customMonsters = [];
                const idx = s.customMonsters.findIndex(m => m.id === payload.id);
                if (idx >= 0) {
                    s.customMonsters[idx] = payload;
                } else {
                    s.customMonsters.push(payload);
                }
            });
        }

        Toast.show(`🔥 ${payload.name} foi forjado no Bestiário!`, 'success');
        setShowForgeModal(false);
        setForgeData(null);
        if (selectedMonster?.id === payload.id) {
            setSelectedMonster(payload);
        }
    };

    // Save Art Override
    const handleSaveArtOverride = (monsterName, imageUrl) => {
        if (!imageUrl || !imageUrl.trim()) {
            Toast.show('URL de imagem inválida.', 'warning');
            return;
        }

        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (!s.monsterOverrides) s.monsterOverrides = {};
                s.monsterOverrides[monsterName] = {
                    ...(s.monsterOverrides[monsterName] || {}),
                    customImg: imageUrl.trim(),
                    img: imageUrl.trim()
                };
            });
        }

        if (selectedMonster && selectedMonster.name === monsterName) {
            setSelectedMonster(prev => ({
                ...prev,
                customImg: imageUrl.trim(),
                img: imageUrl.trim()
            }));
        }

        Toast.show(`🎨 Arte de ${monsterName} atualizada!`, 'success');
        setShowArtModal(false);
        setArtTargetMonster(null);
    };

    const handleResetArtToDefault = (monsterName) => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                if (s.monsterOverrides?.[monsterName]) {
                    delete s.monsterOverrides[monsterName].customImg;
                    delete s.monsterOverrides[monsterName].img;
                }
            });
        }

        if (selectedMonster && selectedMonster.name === monsterName) {
            setSelectedMonster(prev => {
                const copy = { ...prev };
                delete copy.customImg;
                delete copy.img;
                return copy;
            });
        }

        Toast.show(`✨ Arte padrão 5e restaurada para ${monsterName}.`, 'info');
        setShowArtModal(false);
        setArtTargetMonster(null);
    };

    // Mass JSON Import
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        let importedCount = 0;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (re) => {
                try {
                    const parsed = JSON.parse(re.target.result);
                    const list = Array.isArray(parsed) ? parsed : [parsed];
                    const valid = list.filter(m => m && m.name).map((m, idx) => Schemas.createMonster({
                        ...m,
                        id: m.id || `custom_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
                        level: m.level || m.cr || 'Nível 1'
                    }));

                    if (valid.length > 0 && window.TOME?.store) {
                        window.TOME.store.update(s => {
                            if (!s.customMonsters) s.customMonsters = [];
                            s.customMonsters.push(...valid);
                        });
                        importedCount += valid.length;
                        Toast.show(`📥 ${valid.length} monstro(s) importados de ${file.name}!`, 'success');
                    }
                } catch (err) {
                    Toast.show(`Erro ao ler ${file.name}.`, 'danger');
                }
            };
            reader.readAsText(file);
        });
    };

    const handlePasteImport = () => {
        if (!importJsonText.trim()) return;
        try {
            const parsed = JSON.parse(importJsonText.trim());
            const list = Array.isArray(parsed) ? parsed : [parsed];
            const valid = list.filter(m => m && m.name).map((m, idx) => Schemas.createMonster({
                ...m,
                id: m.id || `custom_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
                level: m.level || m.cr || 'Nível 1'
            }));

            if (valid.length > 0 && window.TOME?.store) {
                window.TOME.store.update(s => {
                    if (!s.customMonsters) s.customMonsters = [];
                    s.customMonsters.push(...valid);
                });
                Toast.show(`✅ ${valid.length} monstro(s) adicionados ao Bestiário!`, 'success');
                setShowImportModal(false);
                setImportJsonText('');
            } else {
                Toast.show('Nenhuma criatura válida encontrada no JSON.', 'warning');
            }
        } catch (err) {
            Toast.show('Formato JSON inválido. Verifique o texto colado.', 'danger');
        }
    };

    // Export Custom Monsters as JSON
    const handleExportMonsters = () => {
        const dataStr = JSON.stringify(customMonsters, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bestiario_custom_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.show('Arquivo de criaturas exportado!', 'info');
    };

    // ------------------------------------------
    // 3. RENDER: Detail View (5e Statblock)
    // ------------------------------------------
    if (selectedMonster) {
        const m = selectedMonster;
        const isBoss = m.level === 'BOSS';
        const stats = m.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        const statNames = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
        const actions = getCreatureActions(m);
        const portraitUrl = m.customImg || m.img || MonsterArt.getImage(m, false) || MonsterArt.getCdnFallback(m, false);
        const hpVal = typeof m.hp === 'object' ? (m.hp.max ?? m.hp.current ?? 10) : (Number(m.hp) || 10);

        return (
            <div class="page max-w-[1200px] animate-fadeIn pb-20 font-outfit text-slate-200">
                {/* Back Button & Top Toolbar */}
                <div class="flex justify-between items-center mb-6 flex-wrap gap-3">
                    <button
                        class="btn btn-ghost border-white/10 text-xs px-4 py-2 font-cinzel font-bold text-slate-300 hover:text-white"
                        onClick={() => setSelectedMonster(null)}>
                        <i class="fa-solid fa-arrow-left mr-2 text-accent"></i> Voltar ao Bestiário
                    </button>

                    <div class="flex gap-2.5 flex-wrap">
                        <button
                            class="btn btn-ghost border-accent/40 text-xs px-3 text-accent hover:bg-accent/10"
                            onClick={(e) => handleCloneMonster(m, e)}
                            title="Duplicar para criar variante">
                            <i class="fa-solid fa-copy mr-1.5"></i> Clonar Criatura
                        </button>
                        {m.isCustom && (
                            <button
                                class="btn btn-ghost border-white/10 text-xs px-3 text-slate-300 hover:text-white"
                                onClick={() => { setForgeData(m); setShowForgeModal(true); }}>
                                <i class="fa-solid fa-pen mr-1.5"></i> Editar Forja
                            </button>
                        )}
                        <button
                            class="btn btn-ghost border-amber-500/40 text-xs px-3 text-amber-300 hover:bg-amber-500/10"
                            onClick={() => { setArtTargetMonster(m); setShowArtModal(true); }}>
                            <i class="fa-solid fa-palette mr-1.5"></i> Trocar Arte
                        </button>
                        <button
                            class="btn btn-primary text-xs px-4 py-2 font-cinzel font-bold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                            onClick={(e) => handleSummonToCombat(m, e)}>
                            <i class="fa-solid fa-swords mr-1.5"></i> Invocar na Arena
                        </button>
                    </div>
                </div>

                {/* 5e Statblock Card */}
                <div class={`card relative rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-b from-[#0e1017] via-[#090b10] to-[#0e1017] border-2 ${isBoss ? 'border-red-600/70 shadow-[0_0_45px_rgba(220,38,38,0.25)]' : 'border-accent/40 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(197,160,89,0.15)]'}`}>
                    {/* Header Banner */}
                    <header class="bg-gradient-to-r from-black/80 via-slate-900/90 to-black/80 p-6 sm:p-8 border-b border-accent/30 text-center relative">
                        <div class="flex items-center justify-center gap-3 mb-2">
                            {isBoss && (
                                <span class="px-3 py-0.5 rounded-full text-[0.65rem] font-cinzel font-black uppercase tracking-widest bg-red-950 text-red-400 border border-red-500/40 shadow">
                                    👑 Ameaça Lendária (Boss)
                                </span>
                            )}
                            {m.isCustom && (
                                <span class="px-3 py-0.5 rounded-full text-[0.65rem] font-cinzel font-black uppercase tracking-widest bg-amber-950 text-amber-300 border border-amber-500/40 shadow">
                                    🔥 Forjado pelo Mestre
                                </span>
                            )}
                        </div>
                        <h1 class="m-0 font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-amber-300 uppercase tracking-widest drop-shadow-[0_2px_12px_rgba(251,191,36,0.3)]">
                            {m.name}
                        </h1>
                        <p class="font-outfit text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">
                            {MonsterArt.getClassification(m)} • {MonsterArt.getSubtitle(m, m.level)}
                        </p>
                    </header>

                    {/* Classification & CR bar */}
                    <div class="mx-6 my-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900/80 to-red-950/60 border border-accent/30 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200 shadow">
                        <span class="text-amber-200 flex items-center gap-2">
                            <i class="fa-solid fa-skull text-red-400"></i> {m.type || 'Monstro'}
                        </span>
                        <span class="px-3 py-1 rounded bg-black/60 border border-accent/40 text-amber-400 font-black font-cinzel">
                            {MonsterArt.getCrDisplay(m.level)}
                        </span>
                    </div>

                    {/* Vitals & Visual Presentation Grid */}
                    <div class="grid grid-cols-1 md:grid-cols-[140px_1fr_300px] gap-6 p-6">
                        {/* Left Column: Vitals */}
                        <div class="flex flex-col gap-4">
                            <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 text-center shadow-md">
                                <i class="fa-solid fa-shield-halved text-xl text-slate-400 mb-1 block"></i>
                                <div class="text-3xl font-black text-white leading-none">{m.ac || 10}</div>
                                <div class="text-[0.65rem] font-bold text-slate-400 uppercase mt-1">Classe de Armadura</div>
                            </div>

                            <div class="p-4 rounded-xl bg-slate-900/90 border border-red-900/60 text-center shadow-md">
                                <i class="fa-solid fa-heart text-xl text-red-500 mb-1 block"></i>
                                <div class="text-3xl font-black text-red-400 leading-none">{hpVal}</div>
                                <div class="text-[0.65rem] font-bold text-red-300 uppercase mt-1">Pontos de Vida</div>
                            </div>

                            <div class="p-4 rounded-xl bg-slate-900/90 border border-emerald-900/60 text-center shadow-md">
                                <i class="fa-solid fa-person-running text-xl text-emerald-400 mb-1 block"></i>
                                <div class="text-2xl font-black text-emerald-300 leading-none">
                                    {String(m.speed || '30 ft.').replace(' ft.', '')} ft
                                </div>
                                <div class="text-[0.65rem] font-bold text-emerald-400 uppercase mt-1">Deslocamento</div>
                            </div>
                        </div>

                        {/* Center Column: Portrait Image */}
                        <div class="flex flex-col gap-3 items-center justify-center">
                            <div class="w-full max-w-[360px] h-[300px] rounded-2xl overflow-hidden border-2 border-accent/40 bg-black/50 relative shadow-2xl flex items-center justify-center group">
                                {portraitUrl ? (
                                    <img
                                        src={portraitUrl}
                                        alt={m.name}
                                        class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div class="flex flex-col items-center justify-center p-6 text-center">
                                        <i class="fa-solid fa-dragon text-6xl text-accent/50 mb-3"></i>
                                        <span class="font-cinzel text-sm text-slate-400">{m.name}</span>
                                    </div>
                                )}
                                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <span class="absolute bottom-3 left-4 text-[0.7rem] font-bold text-slate-300 uppercase tracking-widest font-cinzel">
                                    {m.type || 'Monstro'}
                                </span>
                            </div>

                            <div class="text-center text-xs text-slate-400 font-medium">
                                Percepção Passiva: <strong class="text-amber-300">{10 + getMod(stats.wis)}</strong> • Sentidos: Visão no Escuro 60ft
                            </div>
                        </div>

                        {/* Right Column: Combat Actions */}
                        <div class="flex flex-col gap-3">
                            <div class="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs font-bold text-amber-300 uppercase text-center shadow">
                                Multi-Ataque<br />
                                <span class="text-[0.7rem] text-slate-300 lowercase font-normal">
                                    {MonsterArt.getMultiattackSummary(actions)}
                                </span>
                            </div>

                            <div class="flex flex-col gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                                {actions.map((act, idx) => (
                                    <div key={idx} class="p-3.5 rounded-xl bg-slate-900/90 border border-accent/30 flex flex-col justify-between shadow-md group hover:border-amber-400 transition-colors">
                                        <div class="flex justify-between items-center mb-1">
                                            <h4 class="m-0 text-sm font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                                                <i class="fa-solid fa-swords text-red-400 text-xs"></i> {act.name}
                                            </h4>
                                            <span class="text-[0.65rem] px-2 py-0.5 rounded bg-black/40 text-amber-400 font-mono font-bold">
                                                +{act.bonus}
                                            </span>
                                        </div>
                                        <p class="text-xs text-slate-300 mb-2 leading-relaxed">
                                            Dano: <strong class="text-red-400">{act.damage}</strong>
                                        </p>
                                        <button
                                            type="button"
                                            class="w-full py-1.5 px-3 text-xs font-bold font-outfit uppercase tracking-wider bg-red-900/80 hover:bg-red-800 text-white rounded-lg border border-red-500/50 cursor-pointer transition-colors shadow flex items-center justify-center gap-2"
                                            onClick={() => handleStartAttackRoll(m, act)}>
                                            <i class="fa-solid fa-dice-d20"></i> Rolar Ataque vs CA {targetAC}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ability Scores Bar */}
                    <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 px-6 pb-6">
                        {Object.entries(stats).map(([k, v]) => {
                            const mod = getMod(v);
                            return (
                                <div key={k} class="p-3 rounded-xl bg-slate-900/90 border border-accent/30 text-center shadow-md">
                                    <div class="text-2xl font-black text-amber-400 leading-none">{formatMod(mod)}</div>
                                    <div class="text-xs font-bold text-slate-300 mt-1">{v}</div>
                                    <div class="text-[0.7rem] font-bold text-accent uppercase tracking-wider mt-0.5">
                                        {statNames[k] || k.toUpperCase()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Lore & Traits */}
                    {(m.notes || m.description || m.traits) && (
                        <div class="mx-6 mb-6 p-5 rounded-xl bg-slate-900/70 border border-white/10 text-xs text-slate-300 leading-relaxed">
                            <h4 class="font-cinzel text-sm font-bold text-amber-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <i class="fa-solid fa-scroll text-accent"></i> Habilidades Especiais & Notas
                            </h4>
                            <p class="m-0 whitespace-pre-line">{m.notes || m.description || m.traits}</p>
                        </div>
                    )}

                    {/* Footer Controls */}
                    <footer class="border-t border-accent/30 p-5 bg-slate-900/80 flex flex-wrap justify-between items-center gap-4">
                        <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
                            <span>CA de Teste do Alvo:</span>
                            <input
                                type="number"
                                value={targetAC}
                                min="1"
                                max="35"
                                class="w-14 text-center bg-black/60 border border-slate-700 rounded p-1 text-white font-bold focus:border-amber-400 focus:outline-none"
                                onInput={(e) => setTargetAC(e.target.value)}
                            />
                        </div>

                        <div class="flex gap-3">
                            <button
                                class="btn btn-ghost border-white/10 text-xs px-4 py-2 font-cinzel font-bold text-slate-300 hover:text-white"
                                onClick={(e) => handlePlaceOnMap(m, e)}>
                                <i class="fa-solid fa-map-pin mr-1.5 text-blue-400"></i> Posicionar no Mapa
                            </button>
                            <button
                                class="btn btn-primary text-xs px-6 py-2.5 font-cinzel font-bold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                                onClick={(e) => handleSummonToCombat(m, e)}>
                                <i class="fa-solid fa-swords mr-2"></i> Invocar na Arena
                            </button>
                        </div>
                    </footer>
                </div>

                {/* VISUAL INTERACTIVE DICE ROLLER MODAL */}
                {activeRoll && renderVisualRollModal()}
                {/* FORGE MODAL */}
                {showForgeModal && renderForgeModal()}
                {/* ART MODAL */}
                {showArtModal && renderArtModal()}
            </div>
        );
    }

    // ------------------------------------------
    // 4. RENDER: Grid and Table Catalog Views
    // ------------------------------------------
    return (
        <div class="page max-w-[1400px] animate-fadeIn pb-24 font-outfit text-slate-200">
            {/* Header / Library Summary */}
            <div class="card glass-accent p-6 rounded-2xl mb-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-[#0a0c10]/95 via-[#121620]/90 to-[#0a0c10]/95 border border-accent/30 shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
                <div>
                    <h1 class="m-0 font-cinzel text-2xl sm:text-3xl font-black text-amber-300 tracking-wider flex items-center gap-3">
                        <i class="fa-solid fa-book-skull text-accent drop-shadow-[0_0_10px_rgba(197,160,89,0.5)]"></i> Bestiário Arcano
                    </h1>
                    <p class="font-outfit text-xs sm:text-sm text-slate-400 mt-1 m-0">
                        Compêndio de ameaças D&D 5e e oficina de monstros forjados pelo Mestre ({filteredCreatures.length} criaturas visíveis)
                    </p>
                </div>

                <div class="flex gap-2.5 flex-wrap items-center">
                    <button
                        class="btn btn-ghost border-white/10 text-xs px-3 text-slate-300 hover:text-white"
                        onClick={() => fileImportInputRef.current?.click()}
                        title="Importar arquivos JSON">
                        <i class="fa-solid fa-file-import mr-1.5 text-accent"></i> Importar Arquivos
                    </button>
                    <input
                        type="file"
                        ref={fileImportInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        multiple
                        onChange={handleFileUpload}
                    />

                    <button
                        class="btn btn-ghost border-white/10 text-xs px-3 text-slate-300 hover:text-white"
                        onClick={() => setShowImportModal(true)}
                        title="Colar JSON de Criatura">
                        <i class="fa-solid fa-code mr-1.5 text-accent"></i> Colar JSON
                    </button>

                    <button
                        class="btn btn-ghost border-white/10 text-xs px-3 text-slate-300 hover:text-white"
                        onClick={handleExportMonsters}
                        title="Exportar Criaturas Forjadas">
                        <i class="fa-solid fa-file-export mr-1.5 text-accent"></i> Exportar
                    </button>

                    <button
                        class="btn btn-primary px-4 py-2 font-cinzel font-bold text-xs shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                        onClick={() => { setForgeData(null); setShowForgeModal(true); }}>
                        <i class="fa-solid fa-hammer mr-1.5"></i> Forjar Criatura
                    </button>
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div class="card glass-accent p-4 rounded-xl mb-6 border border-white/10 bg-black/40 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search Box */}
                <div class="relative w-full md:w-[320px]">
                    <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-accent/70 text-xs"></i>
                    <input
                        type="text"
                        placeholder="Buscar por nome, tipo, traço..."
                        value={searchQuery}
                        onInput={(e) => setSearchQuery(e.target.value)}
                        class="w-full pl-9 pr-8 py-2 bg-black/50 border border-slate-700/60 rounded-lg text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                            onClick={() => setSearchQuery('')}>
                            ✕
                        </button>
                    )}
                </div>

                {/* Filters Row */}
                <div class="flex gap-3 flex-wrap items-center w-full md:w-auto justify-end">
                    {/* Source Filter */}
                    <div class="flex bg-black/50 p-1 rounded-lg border border-slate-800 text-[0.7rem] font-bold">
                        <button
                            class={`px-3 py-1 rounded transition-colors ${sourceFilter === 'all' ? 'bg-accent text-black font-black' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setSourceFilter('all')}>
                            Todos
                        </button>
                        <button
                            class={`px-3 py-1 rounded transition-colors ${sourceFilter === 'srd' ? 'bg-accent text-black font-black' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setSourceFilter('srd')}>
                            Oficiais 5e
                        </button>
                        <button
                            class={`px-3 py-1 rounded transition-colors ${sourceFilter === 'custom' ? 'bg-accent text-black font-black' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setSourceFilter('custom')}>
                            Forjados ({customMonsters.length})
                        </button>
                    </div>

                    {/* Type Select */}
                    <select
                        class="bg-black/50 border border-slate-700/60 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:border-amber-400 focus:outline-none cursor-pointer"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}>
                        {availableTypes.map(t => (
                            <option key={t} value={t}>{t === 'Todos' ? 'Todos os Tipos' : t}</option>
                        ))}
                    </select>

                    {/* View Mode Switcher */}
                    <div class="flex bg-black/50 p-1 rounded-lg border border-slate-800 text-xs">
                        <button
                            class={`px-2.5 py-1 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setViewMode('grid')}
                            title="Visualização em Cards">
                            <i class="fa-solid fa-grip"></i>
                        </button>
                        <button
                            class={`px-2.5 py-1 rounded ${viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setViewMode('table')}
                            title="Visualização em Tabela">
                            <i class="fa-solid fa-table-list"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Level Tabs Scrollbar */}
            <div class="flex overflow-x-auto gap-2 pb-3 mb-6 scrollbar-thin scrollbar-thumb-accent/20">
                {availableLevels.map(lvl => {
                    const isActive = selectedLevel === lvl;
                    const isBoss = lvl === 'BOSS';
                    return (
                        <button
                            key={lvl}
                            onClick={() => setSelectedLevel(lvl)}
                            class={`px-3.5 py-1.5 rounded-full text-xs font-cinzel font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                                isActive
                                    ? isBoss
                                        ? 'bg-red-900 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                                        : 'bg-accent text-black border-accent shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                                    : isBoss
                                        ? 'bg-black/40 text-red-400 border-red-900/50 hover:border-red-500'
                                        : 'bg-black/30 text-slate-400 border-white/10 hover:border-accent/40 hover:text-white'
                            }`}>
                            {isBoss && <i class="fa-solid fa-skull-crossbones mr-1.5"></i>}
                            {lvl}
                        </button>
                    );
                })}
            </div>

            {/* Content Display: Grid or Table */}
            {filteredCreatures.length === 0 ? (
                <div class="card p-12 text-center rounded-2xl border border-white/10 bg-black/30">
                    <i class="fa-solid fa-ghost text-5xl opacity-20 text-slate-400 mb-4"></i>
                    <h3 class="font-cinzel text-xl text-slate-300 m-0">Nenhuma criatura encontrada</h3>
                    <p class="text-xs text-slate-500 mt-2">
                        Tente ajustar seus filtros de busca ou forje uma nova lenda agora mesmo.
                    </p>
                    <button
                        class="btn btn-primary text-xs px-5 py-2 font-cinzel font-bold mt-4"
                        onClick={() => { setForgeData(null); setShowForgeModal(true); }}>
                        <i class="fa-solid fa-plus mr-1"></i> Forjar Criatura
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div class="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-6">
                    {filteredCreatures.map((m) => {
                        const isBoss = m.level === 'BOSS';
                        const hpVal = typeof m.hp === 'object' ? (m.hp.max ?? m.hp.current ?? 10) : (Number(m.hp) || 10);

                        return (
                            <div
                                key={m.id || m.name}
                                class="card glass-accent flex flex-col p-0 overflow-hidden rounded-2xl border border-accent/25 hover:border-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(197,160,89,0.15)] group cursor-pointer bg-[#0e1017]/90"
                                onClick={() => setSelectedMonster(m)}>
                                {/* Top Banner / Header */}
                                <div class="px-4 py-3 border-b border-accent/20 bg-slate-950/80 flex justify-between items-center">
                                    <h3 class="m-0 font-cinzel text-base font-bold text-amber-300 truncate max-w-[200px] drop-shadow">
                                        {m.name}
                                    </h3>
                                    <div class="flex items-center gap-1.5">
                                        {isBoss ? (
                                            <span class="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-400 font-cinzel">
                                                BOSS
                                            </span>
                                        ) : (
                                            <span class="text-[0.6rem] font-bold px-2 py-0.5 rounded bg-black/60 border border-accent/30 text-amber-400 font-cinzel">
                                                ND {m.cr || '1'}
                                            </span>
                                        )}
                                        {m.isCustom && (
                                            <span class="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                                                FORJA
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Center: Token / Portrait Art */}
                                <div class="py-6 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-black/40 via-slate-950/50 to-black/40 relative">
                                    <MonsterToken monster={m} size="w-24 h-24" />
                                    <span class="text-[0.7rem] font-bold uppercase tracking-widest text-slate-400 mt-3 font-cinzel">
                                        {m.type || 'Monstro'}
                                    </span>
                                </div>

                                {/* Quick Stats Bar */}
                                <div class="grid grid-cols-2 p-2.5 border-t border-b border-white/5 text-center bg-black/30">
                                    <div class="flex items-center justify-center gap-2 border-r border-white/5">
                                        <i class="fa-solid fa-shield-halved text-slate-400 text-xs"></i>
                                        <span class="text-xs text-slate-400 font-bold uppercase">CA</span>
                                        <strong class="text-white text-sm font-cinzel">{m.ac || 10}</strong>
                                    </div>
                                    <div class="flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-heart text-red-400 text-xs"></i>
                                        <span class="text-xs text-slate-400 font-bold uppercase">HP</span>
                                        <strong class="text-red-400 text-sm font-cinzel">{hpVal}</strong>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div class="flex p-3 gap-2 bg-black/50 items-center">
                                    <button
                                        class="btn btn-primary flex-1 text-xs py-1.5 font-cinzel font-bold rounded-lg shadow"
                                        onClick={(e) => { e.stopPropagation(); setSelectedMonster(m); }}>
                                        <i class="fa-solid fa-scroll mr-1"></i> Ficha
                                    </button>
                                    <button
                                        class="btn btn-ghost text-xs px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/20"
                                        onClick={(e) => handleSummonToCombat(m, e)}
                                        title="Invocar no Combate">
                                        <i class="fa-solid fa-swords"></i>
                                    </button>
                                    <button
                                        class="btn btn-ghost text-xs px-2 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white"
                                        onClick={(e) => handleCloneMonster(m, e)}
                                        title="Clonar Criatura">
                                        <i class="fa-solid fa-copy"></i>
                                    </button>
                                    {m.isCustom && (
                                        <button
                                            class="btn btn-ghost text-xs px-2 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/20"
                                            onClick={(e) => handleDeleteCustomMonster(m.id, m.name, e)}
                                            title="Excluir">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div class="card glass-accent p-0 rounded-2xl overflow-hidden border border-accent/25 bg-[#0e1017]/90 shadow-xl">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="border-b border-accent/20 bg-black/60 font-cinzel text-accent uppercase tracking-wider text-[0.7rem]">
                                    <th class="p-3 pl-4">Token</th>
                                    <th class="p-3">Nome</th>
                                    <th class="p-3">Nível / ND</th>
                                    <th class="p-3">Tipo</th>
                                    <th class="p-3 text-center">CA</th>
                                    <th class="p-3 text-center">HP</th>
                                    <th class="p-3">Ações</th>
                                    <th class="p-3 pr-4 text-right">Comandos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCreatures.map((m) => {
                                    const isBoss = m.level === 'BOSS';
                                    const hpVal = typeof m.hp === 'object' ? (m.hp.max ?? m.hp.current ?? 10) : (Number(m.hp) || 10);
                                    const acts = getCreatureActions(m);

                                    return (
                                        <tr
                                            key={m.id || m.name}
                                            class="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => setSelectedMonster(m)}>
                                            <td class="p-2.5 pl-4">
                                                <MonsterToken monster={m} size="w-10 h-10" showGlow={false} />
                                            </td>
                                            <td class="p-3 font-cinzel font-bold text-amber-300 text-sm">
                                                {m.name}
                                                {m.isCustom && <span class="ml-2 text-[0.55rem] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400">Forjado</span>}
                                            </td>
                                            <td class="p-3 font-mono font-bold text-slate-300">
                                                {isBoss ? <span class="text-red-400 font-cinzel font-black">BOSS</span> : (m.cr || '1')}
                                            </td>
                                            <td class="p-3 text-slate-400 uppercase font-semibold">
                                                {m.type || 'Monstro'}
                                            </td>
                                            <td class="p-3 text-center font-bold text-white font-mono">
                                                {m.ac || 10}
                                            </td>
                                            <td class="p-3 text-center font-bold text-red-400 font-mono">
                                                {hpVal}
                                            </td>
                                            <td class="p-3 text-slate-400 max-w-[200px] truncate">
                                                {acts.map(a => a.name).join(', ')}
                                            </td>
                                            <td class="p-3 pr-4 text-right">
                                                <div class="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        class="btn btn-ghost text-xs p-1.5 rounded bg-white/5 text-amber-300 hover:bg-white/10"
                                                        onClick={() => setSelectedMonster(m)}
                                                        title="Ver Ficha">
                                                        <i class="fa-solid fa-scroll"></i>
                                                    </button>
                                                    <button
                                                        class="btn btn-ghost text-xs p-1.5 rounded bg-red-900/30 text-red-300 border border-red-500/30 hover:bg-red-900/50"
                                                        onClick={(e) => handleSummonToCombat(m, e)}
                                                        title="Invocar na Arena">
                                                        <i class="fa-solid fa-swords"></i>
                                                    </button>
                                                    <button
                                                        class="btn btn-ghost text-xs p-1.5 rounded bg-white/5 text-slate-400 hover:text-white"
                                                        onClick={(e) => handleCloneMonster(m, e)}
                                                        title="Clonar">
                                                        <i class="fa-solid fa-copy"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VISUAL INTERACTIVE DICE ROLLER MODAL */}
            {activeRoll && renderVisualRollModal()}
            {/* FORGE MODAL */}
            {showForgeModal && renderForgeModal()}
            {/* ART MODAL */}
            {showArtModal && renderArtModal()}
            {/* IMPORT MODAL */}
            {showImportModal && renderImportModal()}
        </div>
    );

    // ------------------------------------------
    // 5. MODAL: Visual Interactive Dice Roller
    // ------------------------------------------
    function renderVisualRollModal() {
        const roll = activeRoll;
        if (!roll) return null;

        const isD20 = roll.stage === 'd20';
        const isDamage = roll.stage === 'damage';
        const isComplete = roll.stage === 'complete';

        return (
            <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-fadeIn">
                <div class="card glass-accent max-w-lg w-full p-6 sm:p-8 rounded-2xl border-2 border-accent/60 bg-[#0c0e14] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center animate-scaleIn relative">
                    {/* Header */}
                    <div class="text-[0.65rem] text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center justify-center gap-2">
                        <span>{roll.monster.name}</span>
                        <i class="fa-solid fa-arrow-right text-accent"></i>
                        <span>Alvo (CA {roll.targetAC})</span>
                    </div>

                    <h2 class="font-cinzel text-xl sm:text-2xl text-amber-300 font-black mb-4 border-b border-accent/20 pb-3">
                        Ação: {roll.action.name}
                    </h2>

                    {/* D20 Stage */}
                    {isD20 && (
                        <div class="flex flex-col items-center my-4">
                            {roll.rolling ? (
                                <div class="py-6 flex flex-col items-center">
                                    <i class="fa-solid fa-dice-d20 text-6xl text-accent animate-spin mb-4"></i>
                                    <p class="font-cinzel text-sm text-slate-300 tracking-wider">Rolando d20...</p>
                                </div>
                            ) : (
                                <div class="flex flex-col items-center animate-fadeIn w-full">
                                    <div class="text-6xl font-black text-white font-cinzel my-2 drop-shadow">
                                        {roll.total}
                                    </div>
                                    <div class="text-xs text-slate-400 font-mono mb-4">
                                        Rolagem no Dado: <strong>{roll.d20}</strong> {formatMod(roll.action.bonus)} = {roll.total} vs CA {roll.targetAC}
                                    </div>

                                    <div class={`p-4 rounded-xl w-full border ${roll.isHit ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-red-950/50 border-red-500/50 text-red-300'}`}>
                                        <div class="font-cinzel text-xl font-extrabold uppercase">
                                            {roll.isCrit ? '💥 Acerto Crítico!' : roll.isHit ? '⚔️ Acertou!' : '🛡️ Errou!'}
                                        </div>
                                        <p class="text-xs mt-1 m-0">{roll.narrative}</p>
                                    </div>

                                    <div class="flex gap-3 w-full mt-6">
                                        {roll.isHit ? (
                                            <button
                                                class="btn btn-primary flex-1 py-3 font-cinzel font-bold text-sm shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                                                onClick={handleRollDamage}>
                                                <i class="fa-solid fa-burst mr-2"></i> Rolar Dano ({roll.damageFormula})
                                            </button>
                                        ) : (
                                            <button
                                                class="btn btn-ghost border-white/20 flex-1 py-3 text-xs font-bold"
                                                onClick={() => setActiveRoll(null)}>
                                                Concluir Teste
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Damage Stage Rolling */}
                    {isDamage && (
                        <div class="py-8 flex flex-col items-center">
                            <i class="fa-solid fa-burst text-6xl text-red-500 animate-pulse mb-4"></i>
                            <p class="font-cinzel text-sm text-red-400 tracking-wider">
                                Calculando impacto com {roll.damageFormula}...
                            </p>
                        </div>
                    )}

                    {/* Damage Stage Complete */}
                    {isComplete && (
                        <div class="flex flex-col items-center animate-fadeIn my-4">
                            <div class="text-5xl sm:text-6xl font-black text-red-500 font-cinzel drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] my-2">
                                -{roll.damageTotal} HP
                            </div>
                            <div class="text-xs text-slate-400 font-mono mb-4">
                                Fórmula: <strong>{roll.damageFormula}</strong> {roll.isCrit ? '(Crítico: Dano Dobrado!)' : ''}
                            </div>

                            <div class="p-4 rounded-xl w-full bg-slate-900 border border-white/10 text-xs italic text-slate-300 mb-6">
                                {roll.narrative}
                            </div>

                            <button
                                class="btn btn-primary w-full py-3 font-cinzel font-bold text-sm bg-emerald-600 hover:bg-emerald-500 border-emerald-500 shadow-lg"
                                onClick={() => {
                                    Toast.show(`🩸 ${roll.damageTotal} de dano registrado!`, 'info');
                                    setActiveRoll(null);
                                }}>
                                <i class="fa-solid fa-check mr-2"></i> Concluir Ataque
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ------------------------------------------
    // 6. MODAL: Creature Forge (Create / Edit)
    // ------------------------------------------
    function renderForgeModal() {
        const isEditing = !!forgeData?.id;
        const [formName, setFormName] = useState(forgeData?.name || '');
        const [formType, setFormType] = useState(forgeData?.type || 'Monstro');
        const [formLevel, setFormLevel] = useState(forgeData?.level || 'Nível 1');
        const [formAC, setFormAC] = useState(forgeData?.ac || 12);
        const [formHP, setFormHP] = useState(typeof forgeData?.hp === 'object' ? (forgeData.hp.max || 15) : (forgeData?.hp || 15));
        const [formSpeed, setFormSpeed] = useState(forgeData?.speed || '30 ft.');
        const [formEmoji, setFormEmoji] = useState(forgeData?.emoji || '👹');
        const [formImg, setFormImg] = useState(forgeData?.img || '');
        const [formStats, setFormStats] = useState(forgeData?.stats || { str: 12, dex: 12, con: 12, int: 10, wis: 10, cha: 8 });
        const [formActions, setFormActions] = useState(forgeData?.actions && forgeData.actions.length ? forgeData.actions : [
            { name: 'Ataque de Garras', bonus: 4, damage: '1d6+2' }
        ]);
        const [formNotes, setFormNotes] = useState(forgeData?.notes || '');

        const addActionRow = () => {
            setFormActions(prev => [...prev, { name: 'Novo Ataque', bonus: 4, damage: '1d8+2' }]);
        };
        const removeActionRow = (idx) => {
            setFormActions(prev => prev.filter((_, i) => i !== idx));
        };
        const updateActionRow = (idx, field, val) => {
            setFormActions(prev => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], [field]: val };
                return copy;
            });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            handleSaveForgedMonster({
                id: forgeData?.id,
                name: formName,
                type: formType,
                level: formLevel,
                ac: formAC,
                hp: formHP,
                speed: formSpeed,
                emoji: formEmoji,
                img: formImg,
                stats: formStats,
                actions: formActions,
                notes: formNotes
            });
        };

        return (
            <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-fadeIn">
                <div class="card glass-accent max-w-2xl w-full p-6 sm:p-8 rounded-2xl border-2 border-accent/60 bg-[#0c0e14] shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto animate-scaleIn text-left">
                    <div class="flex justify-between items-center border-b border-accent/20 pb-4 mb-6">
                        <h2 class="font-cinzel text-xl text-amber-300 font-bold m-0 flex items-center gap-2.5">
                            <i class="fa-solid fa-hammer text-accent"></i>
                            {isEditing ? `Editar: ${forgeData.name}` : 'Forjar Nova Criatura'}
                        </h2>
                        <button
                            class="btn btn-ghost text-slate-400 hover:text-white text-base leading-none"
                            onClick={() => { setShowForgeModal(false); setForgeData(null); }}>
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} class="flex flex-col gap-4 text-xs text-slate-300">
                        {/* Name & Type */}
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold text-accent uppercase tracking-wider mb-1">Nome da Criatura *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Ogro Sanguinário"
                                    value={formName}
                                    onInput={(e) => setFormName(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label class="block font-bold text-accent uppercase tracking-wider mb-1">Tipo de Criatura</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Gigante, Monstruosidade"
                                    value={formType}
                                    onInput={(e) => setFormType(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Level / CR, AC, HP, Speed */}
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label class="block font-bold text-slate-400 uppercase mb-1">Nível / Categoria</label>
                                <select
                                    value={formLevel}
                                    onChange={(e) => setFormLevel(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none">
                                    {availableLevels.filter(l => l !== 'Todos').map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-400 uppercase mb-1">Classe Armadura</label>
                                <input
                                    type="number"
                                    value={formAC}
                                    min="1"
                                    max="40"
                                    onInput={(e) => setFormAC(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white text-center font-bold focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label class="block font-bold text-slate-400 uppercase mb-1">Pontos de Vida</label>
                                <input
                                    type="number"
                                    value={formHP}
                                    min="1"
                                    max="2000"
                                    onInput={(e) => setFormHP(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white text-center font-bold focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label class="block font-bold text-slate-400 uppercase mb-1">Deslocamento</label>
                                <input
                                    type="text"
                                    value={formSpeed}
                                    placeholder="30 ft."
                                    onInput={(e) => setFormSpeed(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white text-center focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Emoji & Sprite Image URL */}
                        <div class="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-4">
                            <div>
                                <label class="block font-bold text-slate-400 uppercase mb-1">Emoji</label>
                                <input
                                    type="text"
                                    value={formEmoji}
                                    onInput={(e) => setFormEmoji(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white text-center text-lg focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label class="block font-bold text-slate-400 uppercase mb-1">URL da Imagem / Sprite (Opcional)</label>
                                <input
                                    type="url"
                                    placeholder="https://exemplo.com/monstro.png"
                                    value={formImg}
                                    onInput={(e) => setFormImg(e.target.value)}
                                    class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Ability Scores */}
                        <div>
                            <label class="block font-bold text-accent uppercase tracking-wider mb-1.5">Atributos Básicos</label>
                            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(st => {
                                    const labels = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
                                    const val = formStats[st] ?? 10;
                                    const mod = getMod(val);
                                    return (
                                        <div key={st} class="p-2 rounded bg-black/50 border border-slate-800 text-center">
                                            <span class="text-[0.65rem] font-bold text-slate-400 uppercase block">{labels[st]}</span>
                                            <input
                                                type="number"
                                                value={val}
                                                min="1"
                                                max="30"
                                                class="w-full text-center font-bold text-white bg-transparent border-none focus:outline-none"
                                                onInput={(e) => {
                                                    const v = parseInt(e.target.value) || 10;
                                                    setFormStats(prev => ({ ...prev, [st]: v }));
                                                }}
                                            />
                                            <span class="text-[0.65rem] font-bold text-amber-400">{formatMod(mod)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Combat Actions */}
                        <div>
                            <div class="flex justify-between items-center mb-1.5">
                                <label class="font-bold text-accent uppercase tracking-wider m-0">Ações de Combate</label>
                                <button
                                    type="button"
                                    class="btn btn-ghost text-xs text-amber-300 py-1 px-2 border border-amber-500/30"
                                    onClick={addActionRow}>
                                    <i class="fa-solid fa-plus mr-1"></i> Adicionar Ação
                                </button>
                            </div>
                            <div class="flex flex-col gap-2">
                                {formActions.map((act, idx) => (
                                    <div key={idx} class="grid grid-cols-[1fr_80px_1fr_36px] gap-2 items-center bg-black/30 p-2 rounded-lg border border-slate-800">
                                        <input
                                            type="text"
                                            placeholder="Nome (ex: Mordida)"
                                            value={act.name}
                                            class="bg-black/50 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                                            onInput={(e) => updateActionRow(idx, 'name', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Bônus (+4)"
                                            value={act.bonus}
                                            class="bg-black/50 border border-slate-700 rounded p-1.5 text-xs text-white text-center focus:border-amber-400 focus:outline-none"
                                            onInput={(e) => updateActionRow(idx, 'bonus', parseInt(e.target.value) || 0)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dano (ex: 1d8+3)"
                                            value={act.damage}
                                            class="bg-black/50 border border-slate-700 rounded p-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                                            onInput={(e) => updateActionRow(idx, 'damage', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            class="btn btn-ghost text-red-400 hover:bg-red-500/20 p-1.5 text-xs"
                                            onClick={() => removeActionRow(idx)}>
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes / Special Traits */}
                        <div>
                            <label class="block font-bold text-slate-400 uppercase mb-1">Traços Especiais & Notas de Narração</label>
                            <textarea
                                rows="3"
                                placeholder="Resistências, táticas de combate, fraquezas..."
                                value={formNotes}
                                onInput={(e) => setFormNotes(e.target.value)}
                                class="w-full bg-black/50 border border-slate-700 rounded-lg p-2 text-white focus:border-amber-400 focus:outline-none leading-relaxed"
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div class="flex justify-end gap-3 border-t border-white/10 pt-4 mt-2">
                            <button
                                type="button"
                                class="btn btn-ghost text-xs px-4 py-2"
                                onClick={() => { setShowForgeModal(false); setForgeData(null); }}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                class="btn btn-primary text-xs px-6 py-2.5 font-cinzel font-bold shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                                <i class="fa-solid fa-save mr-1.5"></i> Salvar Criatura
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // ------------------------------------------
    // 7. MODAL: Customize Monster Art
    // ------------------------------------------
    function renderArtModal() {
        const m = artTargetMonster;
        if (!m) return null;

        const currentArt = m.customImg || m.img || MonsterArt.getImage(m, false) || MonsterArt.getCdnFallback(m, false);
        const [urlInput, setUrlInput] = useState(m.customImg || '');
        const fileRef = useRef(null);

        const handleLocalFile = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                setUrlInput(ev.target.result);
                Toast.show('Imagem carregada localmente!', 'info');
            };
            reader.readAsDataURL(file);
        };

        return (
            <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-fadeIn">
                <div class="card glass-accent max-w-md w-full p-6 rounded-2xl border-2 border-accent/60 bg-[#0c0e14] shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-scaleIn text-left">
                    <div class="flex justify-between items-center border-b border-accent/20 pb-3 mb-4">
                        <h3 class="font-cinzel text-lg text-amber-300 font-bold m-0 flex items-center gap-2">
                            <i class="fa-solid fa-palette text-accent"></i> Trocar Arte: {m.name}
                        </h3>
                        <button
                            class="btn btn-ghost text-slate-400 hover:text-white"
                            onClick={() => { setShowArtModal(false); setArtTargetMonster(null); }}>
                            ✕
                        </button>
                    </div>

                    {/* Preview */}
                    <div class="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-700/60 mb-5">
                        <div class="w-16 h-16 rounded-xl overflow-hidden border border-accent/40 bg-black flex items-center justify-center shrink-0">
                            <img
                                src={urlInput || currentArt}
                                alt={m.name}
                                class="w-full h-full object-cover object-top"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div class="text-xs">
                            <div class="text-amber-200 font-bold uppercase tracking-wider">{m.name}</div>
                            <div class="text-slate-400 mt-0.5">{m.type || 'Monstro'} • {m.level || 'Nível 1'}</div>
                            <div class="text-accent mt-1 text-[0.7rem] font-bold">
                                {m.customImg ? '★ Arte Customizada Ativa' : 'Arte Oficial 5e'}
                            </div>
                        </div>
                    </div>

                    {/* Upload File */}
                    <div class="mb-4">
                        <label class="text-xs font-bold text-slate-300 block mb-1.5 font-cinzel">
                            1. Carregar Arquivo do Computador
                        </label>
                        <div
                            class="border-2 border-dashed border-accent/40 hover:border-accent rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 transition-colors"
                            onClick={() => fileRef.current?.click()}>
                            <i class="fa-solid fa-cloud-arrow-up text-2xl text-accent/70 mb-1 block"></i>
                            <span class="text-xs text-slate-300 font-medium block">Clique para escolher imagem</span>
                            <span class="text-[0.65rem] text-slate-500 block mt-0.5">PNG, JPG, WebP</span>
                            <input
                                type="file"
                                ref={fileRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleLocalFile}
                            />
                        </div>
                    </div>

                    {/* Direct URL */}
                    <div class="mb-6">
                        <label class="text-xs font-bold text-slate-300 block mb-1.5 font-cinzel">
                            2. Ou Cole o Link Direto (URL)
                        </label>
                        <input
                            type="url"
                            placeholder="https://exemplo.com/arte.png"
                            value={urlInput}
                            onInput={(e) => setUrlInput(e.target.value)}
                            class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div class="flex justify-between items-center border-t border-white/10 pt-4">
                        <button
                            class="btn btn-ghost text-xs text-red-400 hover:bg-red-500/10 border border-red-500/30"
                            onClick={() => handleResetArtToDefault(m.name)}>
                            <i class="fa-solid fa-rotate-left mr-1"></i> Oficial 5e
                        </button>
                        <div class="flex gap-2">
                            <button
                                class="btn btn-ghost text-xs text-slate-400 hover:text-white"
                                onClick={() => { setShowArtModal(false); setArtTargetMonster(null); }}>
                                Cancelar
                            </button>
                            <button
                                class="btn btn-primary text-xs px-4 py-2 font-bold"
                                onClick={() => handleSaveArtOverride(m.name, urlInput)}>
                                Salvar Arte
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ------------------------------------------
    // 8. MODAL: Paste JSON Importer
    // ------------------------------------------
    function renderImportModal() {
        return (
            <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-fadeIn">
                <div class="card glass-accent max-w-xl w-full p-6 rounded-2xl border-2 border-accent/60 bg-[#0c0e14] shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-scaleIn text-left">
                    <div class="flex justify-between items-center border-b border-accent/20 pb-3 mb-4">
                        <h3 class="font-cinzel text-lg text-amber-300 font-bold m-0 flex items-center gap-2">
                            <i class="fa-solid fa-file-import text-accent"></i> Importar Criaturas via JSON
                        </h3>
                        <button
                            class="btn btn-ghost text-slate-400 hover:text-white"
                            onClick={() => setShowImportModal(false)}>
                            ✕
                        </button>
                    </div>

                    <p class="text-xs text-slate-400 leading-relaxed mb-3">
                        Cole abaixo o conteúdo JSON contendo uma criatura ou uma lista de criaturas no formato D&D 5e / Tome.
                    </p>

                    <textarea
                        rows="10"
                        placeholder='[ { "name": "Dragão da Tormenta", "type": "Dragão", "cr": "12", "ac": 18, "hp": 180, "stats": { "str": 22, "dex": 14, "con": 20, "int": 16, "wis": 14, "cha": 18 } } ]'
                        value={importJsonText}
                        onInput={(e) => setImportJsonText(e.target.value)}
                        class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs font-mono text-slate-200 focus:border-amber-400 focus:outline-none mb-4 leading-relaxed"
                    />

                    <div class="flex justify-end gap-3 border-t border-white/10 pt-4">
                        <button
                            class="btn btn-ghost text-xs text-slate-400 hover:text-white"
                            onClick={() => setShowImportModal(false)}>
                            Cancelar
                        </button>
                        <button
                            class="btn btn-primary text-xs px-5 py-2.5 font-cinzel font-bold shadow-[0_0_15px_rgba(197,160,89,0.3)]"
                            onClick={handlePasteImport}>
                            <i class="fa-solid fa-download mr-1.5"></i> Importar para o Bestiário
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Bestiary;
