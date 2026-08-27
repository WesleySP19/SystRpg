import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Schemas } from '../../data/schemas.js';
import { CardRenderer } from '../../services/CardRenderer.js';
import { exportFrontBackPNG } from '../utils/imageExport.js';
import { PersistenceService } from '../../services/PersistenceService.js';
import { FXEngine } from '../../services/FXEngine.js';
import { renderSpellsTab } from './PlayerSpells.jsx';
import { renderBioInventoryTab } from './PlayerInventory.jsx';
import { renderCoreTab } from './PlayerAttributes.jsx';
import { HeroImporter } from '../utils/HeroImporter.js';
import { HeroExporter } from '../utils/HeroExporter.js';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useHeroData } from '../hooks/useHeroData.js';
import { useVanillaActions } from '../hooks/useVanillaActions.js';
import { RulesEngine } from '../../core/RulesEngine.js';

export function PlayerForm({ store }) {
    const { heroData: p, isEditing, updateHero, draftData, setDraftData } = useHeroData();
    const editingHeroId = isEditing ? p.id : null;
    const [currentTab, setCurrentTab] = useState('core');
    const [portraitData, setPortraitData] = useState(null);
    const [portraitSettings, setPortraitSettings] = useState({ x: 0, y: 0, scale: 1 });
    const [inventoryRows, setInventoryRows] = useState([{ name: '', qty: 1, weight: 0 }]);
    const [attackRows, setAttackRows] = useState([{ name: '', bonus: '', damage: '' }]);
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);
    
    const rules = RulesEngine.getActiveRuleset();
    const skills = rules ? rules.skills : [];
    
    const actions = {};
    const _renderInventoryRows = () => {
            return inventoryRows.map((item, i) => (
                <div className="grid grid-cols-[1fr_60px_60px_25px] gap-1.5 mb-0.5">
                    <input className="legacy-input inv-name text-[0.7rem] p-1" type="text" value={item.name || ''} placeholder="Nome do Item" />
                    <input className="legacy-input inv-qty text-[0.7rem] p-1 text-center" type="number" value={item.qty || 1} placeholder="Qtd" />
                    <input className="legacy-input inv-weight text-[0.7rem] p-1 text-center" type="number" value={item.weight || 0} step="0.1" placeholder="Peso" />
                    <button type="button" className="btn btn-danger btn-sm p-0 flex items-center justify-center" data-action="removeInventoryRow" data-index={i}>✕</button>
                </div>
            ));
        };
    const _renderAttackRows = () => {
            return attackRows.map((atk, i) => (
                <div class="grid grid-cols-[1fr_50px_80px_25px] gap-1.5 mb-1.5">
                    <input className="legacy-input atk-name" type="text" value={atk.name || ''} placeholder="Nome" />
                    <input className="legacy-input atk-bonus" type="text" value={atk.bonus || ''} placeholder="+5" />
                    <input className="legacy-input atk-damage" type="text" value={atk.damage || ''} placeholder="1d8" />
                    <button type="button" className="btn btn-danger btn-sm flex items-center justify-center" data-action="removeAttackRow" data-index={i}>✕</button>
                </div>
            ));
        };
    const _renderPlayerList = () => {
            const { players } = TOME.store.state;
            if (!players?.length) return '';
            return players.map(p => (
                <div className="card flex justify-between items-center border-l-4 border-l-accent bg-white/5">
                    <div>
                        <h4 className="m-0">{p.name}</h4>
                        <p className="text-[0.7rem] m-0 mt-1 uppercase text-slate-400">{p.class || 'Sem Classe'} • NÍVEL {p.level || 1}</p>
                    </div>
                    <div className="flex gap-2.5">
                        <button type="button" className="btn btn-ghost btn-sm bg-white/5 text-white hover:bg-white/10" data-action="editHero" data-id={p.id}>EDITAR</button>
                        <button type="button" className="btn btn-danger btn-sm" data-action="removePlayer" data-id={p.id}>✕</button>
                    </div>
                </div>
            ));
        };
    const _syncToStore = () => {
            const f = actions.$('#hero-form');
            if (!f) return;
            const formData = actions._collectFormData(f);
            if (editingHeroId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === editingHeroId);
                    if (idx !== -1) {
                        s.players[idx] = { ...s.players[idx], ...formData };
                    }
                });
            } else {
                setDraftData(formData);
            }
        };
    const _syncPortraitControls = () => {
            const s = portraitSettings || { x: 0, y: 0, scale: 1 };
            actions.$$('input[data-action="updatePortrait"]').forEach(input => {
                const key = input.dataset.key;
                if (key && s[key] !== undefined) {
                    input.value = s[key];
                }
            });
            const lblScale = actions.$('#label-val-scale');
            const lblX = actions.$('#label-val-x');
            const lblY = actions.$('#label-val-y');
            if (lblScale) lblScale.textContent = `${(s.scale || 1).toFixed(2)}x`;
            if (lblX) lblX.textContent = `${s.x || 0}px`;
            if (lblY) lblY.textContent = `${s.y || 0}px`;
            const img = actions.$('#portrait-preview img');
            if (img) {
                img.style.transform = `scale(${s.scale || 1}) translate(${s.x || 0}px, ${s.y || 0}px)`;
            }
        };
    const submitForm = () => {
            const f = actions.$('#hero-form');
            if (!f) return;
            const playerData = actions._collectFormData(f);
    
            if (playerData.deathSaves?.failures?.[2] === true && !actions._fallenAnnounced) {
                actions._fallenAnnounced = true;
                FXEngine.trigger('HERO_FALLEN', playerData.name || 'O Herói', editingHeroId || 'hero-fallen');
            }
    
            if (editingHeroId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === editingHeroId);
                    if (idx !== -1) s.players[idx] = { ...s.players[idx], ...playerData };
                });
                Toast.show('Ficha atualizada e sincronizada!');
            } else {
                const nameSlug = (playerData.name || 'hero').toLowerCase().replace(/\s+/g, '_');
                const uniqueId = `${nameSlug}_${Date.now().toString().slice(-6)}`;
                const player = { ...Schemas.createPlayer(playerData), id: uniqueId };
                
                TOME.store.update(s => s.players = [...s.players, player]);
                Toast.show('Nova lenda registrada com sucesso!');
            }
            actions.resetForm();
        };
    const onDeathFailureCheck = (e, el) => {
            if (el && el.checked && !actions._fallenAnnounced) {
                actions._fallenAnnounced = true;
                const f = actions.$('#hero-form');
                const playerData = f ? actions._collectFormData(f) : {};
                const heroName = playerData.name || 'O Herói';
                FXEngine.trigger('HERO_FALLEN', heroName, editingHeroId || 'hero-fallen');
                Toast.show(`🥀 3 Falhas contra a Morte! Réquiem dos Bravos para ${heroName}...`, 'danger');
            }
        };
    const resetForm = () => {
            actions._fallenAnnounced = false;
            TOME.store.update(s => s.editingHeroId = null);
            setPortraitData(null);
            setPortraitSettings({ x: 0, y: 0, scale: 1 });
            setInventoryRows([{ name: '', qty: 1, weight: 0 }]);
            setAttackRows([{ name: '', bonus: '', damage: '' }]);
            setCurrentTab('core');
            setDraftData(null);
            const f = actions.$('#hero-form');
            if (f) f.reset();
            actions.render();
        };
    const closeBuilder = () => {
            actions.resetForm();
            TOME.store.update(s => s.activeTab = 'herohub');
        };
    const updateField = (e, el) => {
            if (!editingHeroId) return;
            TOME.store.update(s => {
                const p = s.players.find(x => x.id === editingHeroId);
                if (p) p[el.name] = el.type === 'number' ? parseFloat(el.value) : el.value;
            });
            if (currentTab == 'card') actions.render();
        };
    const switchTab = (e, el) => {
            setCurrentTab(el.dataset.tab);
            actions.render();
        };
    const addInventoryRow = () => {
            const f = actions.$('#hero-form');
            if (f) {
                const currentData = actions._collectFormData(f);
                setInventoryRows([...currentData.equipment.items, { name: '', qty: 1, weight: 0 }]);
                setAttackRows(currentData.attacks);
                setDraftData({
                    ...currentData,
                    equipment: {
                        ...currentData.equipment,
                        items: inventoryRows
                    }
                });
                if (editingHeroId) {
                    TOME.store.update(s => {
                        const idx = s.players.findIndex(p => p.id === editingHeroId);
                        if (idx !== -1) {
                            s.players[idx] = { ...s.players[idx], ...draftData };
                        }
                    });
                }
            } else {
                inventoryRows.push({ name: '', qty: 1, weight: 0 });
            }
            actions.render();
        };
    const removeInventoryRow = (e, el) => {
            const idxToRemove = parseInt(el.dataset.index);
            const f = actions.$('#hero-form');
            if (f) {
                const currentData = actions._collectFormData(f);
                const items = currentData.equipment.items;
                items.splice(idxToRemove, 1);
                setInventoryRows(items);
                setAttackRows(currentData.attacks);
                setDraftData({
                    ...currentData,
                    equipment: {
                        ...currentData.equipment,
                        items: inventoryRows
                    }
                });
                if (editingHeroId) {
                    TOME.store.update(s => {
                        const idx = s.players.findIndex(p => p.id === editingHeroId);
                        if (idx !== -1) {
                            s.players[idx] = { ...s.players[idx], ...draftData };
                        }
                    });
                }
            } else {
                inventoryRows.splice(idxToRemove, 1);
            }
            actions.render();
        };
    const addAttackRow = () => {
            const f = actions.$('#hero-form');
            if (f) {
                const currentData = actions._collectFormData(f);
                setAttackRows([...currentData.attacks, { name: '', bonus: '', damage: '' }]);
                setInventoryRows(currentData.equipment.items);
                setDraftData({
                    ...currentData,
                    attacks: attackRows
                });
                if (editingHeroId) {
                    TOME.store.update(s => {
                        const idx = s.players.findIndex(p => p.id === editingHeroId);
                        if (idx !== -1) {
                            s.players[idx] = { ...s.players[idx], ...draftData };
                        }
                    });
                }
            } else {
                attackRows.push({ name: '', bonus: '', damage: '' });
            }
            actions.render();
        };
    const removeAttackRow = (e, el) => {
            const idxToRemove = parseInt(el.dataset.index);
            const f = actions.$('#hero-form');
            if (f) {
                const currentData = actions._collectFormData(f);
                const attacks = currentData.attacks;
                attacks.splice(idxToRemove, 1);
                setAttackRows(attacks);
                setInventoryRows(currentData.equipment.items);
                setDraftData({
                    ...currentData,
                    attacks: attackRows
                });
                if (editingHeroId) {
                    TOME.store.update(s => {
                        const idx = s.players.findIndex(p => p.id === editingHeroId);
                        if (idx !== -1) {
                            s.players[idx] = { ...s.players[idx], ...draftData };
                        }
                    });
                }
            } else {
                attackRows.splice(idxToRemove, 1);
            }
            actions.render();
        };
    const adjustSlot = (e, el) => {
            const lv = el.dataset.level;
            const delta = parseInt(el.dataset.delta);
            const f = actions.$('#hero-form');
            const input = f[`slots_${lv}_used`];
            const total = parseInt(f[`slots_${lv}_total`].value) || 0;
            let val = (parseInt(input.value) || 0) + delta;
            if (val < 0) val = 0;
            if (val > total && total > 0) val = total;
            input.value = val;
            
            // Auto-save Spells slots change
            const currentData = actions._collectFormData(f);
            setDraftData(currentData);
            if (editingHeroId) {
                TOME.store.update(s => {
                    const idx = s.players.findIndex(p => p.id === editingHeroId);
                    if (idx !== -1) s.players[idx] = { ...s.players[idx], ...currentData };
                });
            }
        };
    const filterSpells = (e, el) => {
            const query = el.value.toLowerCase();
            actions.$$('.spell-level-box').forEach(box => {
                const area = box.querySelector('.spell-list-area');
                const spells = area.value.toLowerCase();
                if (query && !spells.includes(query)) box.style.opacity = '0.3';
                else box.style.opacity = '1';
            });
        };
    const _collectInventory = () => {
            const items = [];
            const ns = actions.$$('.inv-name');
            const qs = actions.$$('.inv-qty');
            const ws = actions.$$('.inv-weight');
            ns.forEach((el, i) => { 
                items.push({ 
                    name: el.value || '', 
                    qty: qs[i] ? (parseInt(qs[i].value) || 1) : 1, 
                    weight: ws[i] ? (parseFloat(ws[i].value) || 0) : 0 
                }); 
            });
            return items.length ? items : [{ name: '', qty: 1, weight: 0 }];
        };
    const _collectFormData = (f) => {
            const fd = new FormData(f);
            const rules = RulesEngine.getActiveRuleset();
            
            const dynamicStats = {};
            const dynamicSaves = {};
            
            if (rules) {
                rules.stats.forEach(st => {
                    dynamicStats[st.id] = parseInt(fd.get(`stat_${st.id}`)) || 10;
                    dynamicSaves[st.id] = !!fd.get(`save_${st.id}`);
                });
            } else {
                ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(st => {
                    dynamicStats[st] = parseInt(fd.get(`stat_${st}`)) || 10;
                    dynamicSaves[st] = !!fd.get(`save_${st}`);
                });
            }

            const data = {
                name: actions.$('#input-hero-name')?.value || 'Herói Sem Nome',
                class: fd.get('class') || '', 
                race: fd.get('race') || '', 
                level: parseInt(fd.get('level')) || 1,
                playerName: fd.get('playerName') || '', 
                background: fd.get('background') || '', 
                alignment: fd.get('alignment') || '', 
                xp: parseInt(fd.get('xp')) || 0,
                inspiration: !!fd.get('inspiration'), 
                proficiencyBonus: parseInt(fd.get('proficiencyBonus')) || 2,
                stats: dynamicStats,
                savingThrows: dynamicSaves,
                skills: (rules ? rules.skills : skills).filter(sk => fd.get(`skill_${sk.id}`)).map(sk => sk.id),
                ac: parseInt(fd.get('ac')) || 10, 
                initiative: parseInt(fd.get('initiative')) || 0, 
                speed: parseInt(fd.get('speed')) || 30,
                hp: { 
                    current: parseInt(fd.get('hp_current')) || 10, 
                    max: parseInt(fd.get('hp_max')) || 10, 
                    temp: parseInt(fd.get('hp_temp')) || 0 
                },
                hitDice: { 
                    total: fd.get('hit_dice_total') || '', 
                    remaining: fd.get('hit_dice_rem') || '' 
                },
                deathSaves: { 
                    successes: [!!fd.get('death_s1'), !!fd.get('death_s2'), !!fd.get('death_s3')],
                    failures: [!!fd.get('death_f1'), !!fd.get('death_f2'), !!fd.get('death_f3')]
                },
                attacks: actions._collectAttacks(), 
                attackNotes: fd.get('attack_notes') || '',
                currency: { 
                    pp: parseInt(fd.get('coin_pp')) || 0, 
                    gp: parseInt(fd.get('coin_gp')) || 0, 
                    ep: parseInt(fd.get('coin_ep')) || 0, 
                    sp: parseInt(fd.get('coin_sp')) || 0, 
                    cp: parseInt(fd.get('coin_cp')) || 0 
                },
                roleplay: { 
                    traits: fd.get('traits') || '', 
                    ideals: fd.get('ideals') || '', 
                    bonds: fd.get('bonds') || '', 
                    flaws: fd.get('flaws') || '' 
                },
                equipment: { 
                    items: actions._collectInventory(), 
                    notes: fd.get('items_notes') || '' 
                }, 
                otherProfs: fd.get('other_profs') || '', 
                bio: fd.get('bio') || '', 
                allies: fd.get('allies') || '',
                portraitData: portraitData,
                portraitSettings: portraitSettings,
                spells: {}, 
                spellSlots: {}
            };
    
            for(let i=0; i<=9; i++) {
                data.spells[`lvl${i}`] = fd.get(`spells_lvl_${i}`) || '';
                if(i > 0) {
                    data.spellSlots[i] = { 
                        total: parseInt(fd.get(`slots_${i}_total`)) || 0, 
                        used: parseInt(fd.get(`slots_${i}_used`)) || 0 
                    };
                }
            }
            return data;
        };
    const _collectAttacks = () => {
            const atks = [];
            const ns = actions.$$('.atk-name');
            const bs = actions.$$('.atk-bonus');
            const ds = actions.$$('.atk-damage');
            ns.forEach((el, i) => { 
                atks.push({ 
                    name: el.value || '', 
                    bonus: bs[i] ? bs[i].value : '', 
                    damage: ds[i] ? ds[i].value : '' 
                }); 
            });
            return atks.length ? atks : [{ name: '', bonus: '', damage: '' }];
        };
    const setCardSide = (e, el) => { actions._cardSide = el.dataset.side; actions.render(); }
    const downloadCardJPG = () => { CardRenderer.download(actions.$('#player-card-export'), `Card_${actions.$('#input-hero-name').value}.jpg`); }
    
    const editHero = (e, el) => {
            const p = TOME.store.state.players.find(x => x.id === el.dataset.id);
            if (!p) return;
            TOME.store.update(s => s.editingHeroId = p.id);
            actions._fillForm(p);
        };
    const importHeroJSON = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        actions._fillForm(data);
                        Toast.show('✅ Personagem importado com sucesso!');
                    } catch (err) {
                        Toast.show('❌ Erro ao ler arquivo JSON.', 'danger');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        };
    const _fillForm = (p) => {
            setPortraitData(p.portraitData || null);
            setPortraitSettings(p.portraitSettings || { x: 0, y: 0, scale: 1 });
            setAttackRows(p.attacks?.length ? [...p.attacks] : [{ name: '', bonus: '', damage: '' }]);
            setInventoryRows(p.equipment?.items?.length ? [...p.equipment.items] : [{ name: '', qty: 1, weight: 0 }]);
            setCurrentTab('core');
            setDraftData(p);
            actions.render();
            actions._syncPortraitControls();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    const removePlayer = (e, el) => { 
            if (confirm('Deletar lenda?')) {
                TOME.store.update(s => { 
                    s.players = s.players.filter(p => p.id !== el.dataset.id); 
                }); 
            } 
        };
    const triggerPortrait = () => { actions.$('#portrait-input').click(); }
    
    const updatePortrait = (e, el) => {
            portraitSettings[el.dataset.key] = parseFloat(el.value);
            actions._syncPortraitControls();
            actions._syncToStore();
            actions.previewCards();
        };
    const resetPortrait = () => {
            setPortraitSettings({ x: 0, y: 0, scale: 1 });
            actions._syncPortraitControls();
            actions._syncToStore();
            actions.previewCards();
        };
    const previewCards = () => {
            const f = actions.$('#hero-form');
            if (f) {
                const formData = actions._collectFormData(f);
                actions._drawCards(formData);
            }
        };
    const openImporter = () => { actions.$('#importer-modal').style.display = 'flex'; }
    const closeImporter = () => { actions.$('#importer-modal').style.display = 'none'; }
    const triggerPDFUpload = () => { actions.$('#pdf-file-input').click(); }
    
    const _compressImage = (base64Str, maxWidth = 400, maxHeight = 400, quality = 0.75) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
    
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
    
                    const compressed = canvas.toDataURL('image/webp', quality);
                    resolve(compressed);
                };
                img.onerror = () => resolve(base64Str);
                img.src = base64Str;
            });
        }
    
    
    
    const importPDF = async (file) => { await actions._importer.importPDF(file); }
    
    
    
    
    
    const processImport = async () => { await actions._importer.processImport(); }
    
    const downloadHeroJSON = () => { actions._exporter.downloadHeroJSON(); }
    
    const printOfficialSheet = () => { actions._exporter.printOfficialSheet(); }
    
    
    
    const cloneToBestiary = () => {
            const data = actions._collectFormData(actions.$('#hero-form'));
            const monster = {
                ...data,
                id: `clone_${Date.now()}`,
                type: 'NPC',
                cr: Math.floor(data.level / 2) || 1,
                hp_current: data.hp?.current,
                hp_max: data.hp?.max,
                ac: data.ac,
                actions: data.attacks.map(a => ({ name: a.name, bonus: a.bonus, damage: a.damage }))
            };
    
            TOME.store.update(s => {
                s.monsters = [...(s.monsters || []), monster];
            });
            Toast.show('😈 NPC registrado com sucesso no Bestiário!');
        };
    const _renderCardTab = () => {
            return (
                <div class="flex flex-col items-center gap-5 p-5 animate-fadeIn">
                    <p class="text-[0.85rem] text-center text-slate-400 max-w-2xl">
                        Esta é a visualização da <strong>Carta de Avatar</strong> oficial no formato TCG (proporção 5:7).<br />
                        Os dados são gerados em tempo real. Ajuste o enquadramento usando os controles ao lado e clique na carta para baixá-la.
                    </p>
                    <div class="flex gap-8 justify-center flex-wrap w-full max-w-[1200px] mt-5">
                        <div class="flex gap-8 justify-center flex-wrap flex-1 min-w-[320px]">
                            <div class="flex flex-col items-center gap-2.5 group">
                                <h4 class="m-0 text-[0.8rem] font-cinzel text-accent tracking-widest">FRENTE (COMBATE)</h4>
                                <canvas id="card-canvas-front" data-action="downloadCard" data-side="front" class="rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(197,160,89,0.2)] max-w-full w-[280px] h-[392px] cursor-pointer border border-accent/30 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(197,160,89,0.4)]"></canvas>
                            </div>
                            <div class="flex flex-col items-center gap-2.5 group">
                                <h4 class="m-0 text-[0.8rem] font-cinzel text-accent tracking-widest">VERSO (HISTÓRIA)</h4>
                                <canvas id="card-canvas-back" data-action="downloadCard" data-side="back" class="rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(197,160,89,0.2)] max-w-full w-[280px] h-[392px] cursor-pointer border border-accent/30 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(197,160,89,0.4)]"></canvas>
                            </div>
                        </div>
                        
                        <div className="skills-list glass-accent w-[340px] p-5 flex flex-col gap-4 rounded-xl border border-white/10 shadow-xl">
                            <h3 class="m-0 text-[1.1rem] border-b border-white/10 pb-2.5 font-cinzel text-white flex items-center gap-2">
                                <i className="fa-solid fa-sliders text-accent"></i> Ajustes do Card TCG
                            </h3>
                            
                            <div class="flex flex-col gap-1.5">
                                <label className="attr-label text-[0.6rem]">IMAGEM DO RETRATO</label>
                                <button type="button" className="btn btn-ghost btn-block border border-accent/50 text-[0.75rem] flex items-center justify-center gap-2 hover:bg-accent/10" data-action="triggerPortrait">
                                    <i className="fa-solid fa-upload"></i> Escolher Foto do Herói
                                </button>
                            </div>
    
                            <div class="flex flex-col gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center mb-1.5 border-b border-white/5 pb-2">
                                    <label className="attr-label text-[0.65rem] m-0 text-slate-300">ENQUADRAMENTO DA FOTO</label>
                                    <button type="button" className="btn btn-ghost btn-sm text-[0.55rem] px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded" data-action="resetPortrait">CENTRALIZAR</button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div class="flex justify-between text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">
                                        <span>Zoom (Escala)</span>
                                        <span id="label-val-scale" class="text-accent">1.00x</span>
                                    </div>
                                    <input type="range" min="0.5" max="3" step="0.05" value={portraitSettings.scale || 1} data-action="updatePortrait" data-key="scale" class="w-full accent-accent" />
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <div class="flex justify-between text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">
                                        <span>Posição Horizontal (X)</span>
                                        <span id="label-val-x" class="text-accent">0px</span>
                                    </div>
                                    <input type="range" min="-300" max="300" step="1" value={portraitSettings.x || 0} data-action="updatePortrait" data-key="x" class="w-full accent-accent" />
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <div class="flex justify-between text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">
                                        <span>Posição Vertical (Y)</span>
                                        <span id="label-val-y" class="text-accent">0px</span>
                                    </div>
                                    <input type="range" min="-300" max="300" step="1" value={portraitSettings.y || 0} data-action="updatePortrait" data-key="y" class="w-full accent-accent" />
                                </div>
                            </div>
    
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-2.5 mt-2">
                                <button type="button" className="btn btn-magic btn-block text-[0.75rem] font-extrabold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(197,160,89,0.2)]" data-action="downloadPrintablePair">
                                    <i className="fa-solid fa-file-image"></i> Baixar Par Imprimível (5:7)
                                </button>
                                <p class="text-[0.6rem] text-center m-0 leading-[1.3] text-slate-500">
                                    * O par imprimível gera as imagens lado a lado no tamanho oficial de TCG (7.0 x 9.8 cm) sem esticar a arte.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
    const _drawCards = (formData) => {
            const original = TOME.store.state.players?.find(x => x.id === editingHeroId) || {};
            const data = {
                ...original,
                ...formData,
                portraitData: portraitData,
                portraitSettings: portraitSettings,
                bio: formData.bio || formData.roleplay?.traits || 'Sem registros.'
            };
            const cFront = actions.$('#card-canvas-front');
            const cBack = actions.$('#card-canvas-back');
            if (cFront) CardRenderer.renderFront(data, cFront);
            if (cBack) CardRenderer.renderBack(data, cBack);
        };
    
    Object.assign(actions, {
        _renderInventoryRows,
        _renderAttackRows,
        _renderPlayerList,
        _syncToStore,
        _syncPortraitControls,
        submitForm,
        onDeathFailureCheck,
        resetForm,
        closeBuilder,
        updateField,
        switchTab,
        addInventoryRow,
        removeInventoryRow,
        addAttackRow,
        removeAttackRow,
        adjustSlot,
        filterSpells,
        _collectInventory,
        _collectFormData,
        _collectAttacks,
        setCardSide,
        importHeroJSON,
        _fillForm,
        removePlayer,
        triggerPortrait,
        resetPortrait,
        previewCards,
        openImporter,
        _renderCardTab,
        _drawCards,
        // state setters exposed
        setCurrentTab,
        setPortraitData,
        setPortraitSettings,
        setInventoryRows,
        setAttackRows,
        forceUpdate,
        _currentTab: currentTab,
        _skills: skills
    });
    
    const containerRef = useVanillaActions(actions);
    

        // Find player if editing, otherwise fall back to draft data
        
        

        return (
            <div className="page legacy-sheet-container max-w-[1400px] mx-auto animate-fadeIn" ref={containerRef}>
                <form id="hero-form" onSubmit={e => e.preventDefault()}>
                
                {isEditing ? (
                    <div className="edit-mode-banner bg-gradient-to-r from-accent to-[#f39c12] text-black p-2.5 text-center font-extrabold mb-5 rounded-lg border-2 border-black flex justify-between items-center">
                        <span><i className="fa-solid fa-pen-fancy"></i> MODO EDIÇÃO: {p.name || 'Herói'}</span>
                        <button className="btn btn-ghost btn-sm text-black border border-black hover:bg-black/10" data-action="resetForm">CANCELAR / NOVO</button>
                    </div>
                ) : null}
                
                {/* ════ HEADER SECTION (D&D 5E OFFICIAL LAYOUT) ════ */}
                <div className="mb-5">
                    <button type="button" className="btn btn-ghost" data-action="closeBuilder"><i className="fa-solid fa-arrow-left"></i> Voltar para Monitoria</button>
                </div>
                <header className="grid grid-cols-[300px_1fr] gap-10 mb-10 items-end">
                    <div className="flex flex-col gap-2.5">
                        <div className="portrait-box-legacy h-[350px] border-2 border-tomeGold/30 rounded-2xl relative overflow-hidden bg-black/20 cursor-pointer" data-action="triggerPortrait">
                            <div id="portrait-preview" className="w-full h-full flex items-center justify-center overflow-hidden">
                                {portraitData ? <img src={portraitData} className="w-full h-full object-cover transition-transform duration-100 ease-out" style={{ transform: `scale(${portraitSettings.scale || 1}) translate(${portraitSettings.x || 0}px, ${portraitSettings.y || 0}px)` }} /> : <i className="fa-solid fa-user-shield fa-4x text-tomeGold/20"></i>}
                            </div>
                            <span className="absolute bottom-2.5 w-full text-center text-[0.6rem] font-extrabold bg-black/60 text-sheetLabel">MUDAR RETRATO</span>
                            <input type="file" id="portrait-input" className="hidden" accept="image/*" />
                        </div>
                        
                        {/* PORTRAIT CONTROLS */}
                        <div className={`skills-list p-2.5 text-[0.6rem] flex-col gap-1.5 ${portraitData ? 'flex' : 'hidden'}`}>
                            <div className="flex justify-between items-center mb-1.5">
                                <label class="font-extrabold">CONTROLE DE FOTO</label>
                                <button type="button" className="btn btn-ghost btn-sm text-[0.5rem] px-1.5 py-0.5" data-action="resetPortrait">CENTRALIZAR</button>
                            </div>
                            <label>ZOOM: <input type="range" min="0.5" max="3" step="0.1" value={portraitSettings.scale || 1} data-action="updatePortrait" data-key="scale" /></label>
                            <label>POS X: <input type="range" min="-200" max="200" step="1" value={portraitSettings.x || 0} data-action="updatePortrait" data-key="x" /></label>
                            <label>POS Y: <input type="range" min="-200" max="200" step="1" value={portraitSettings.y || 0} data-action="updatePortrait" data-key="y" /></label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="border-b-2 border-tomeGold/30 pb-1.5 flex justify-between items-center gap-2.5">
                            <input className="legacy-input text-5xl flex-1 font-header font-black" type="text" id="input-hero-name" name="name" value={p.name || ''} placeholder="NOME DO PERSONAGEM" />
                            <div className="flex gap-1.5">
                                <button type="button" className="btn btn-ghost border border-tomeGold/30 text-[0.6rem]" data-action="openImporter" title="Importar PDF/Texto">📥 PDF/Texto</button>
                                <button type="button" className="btn btn-ghost border border-tomeGold/30 text-[0.6rem]" data-action="importHeroJSON" title="Importar JSON">📂 JSON</button>
                                <button type="button" className="btn btn-ghost border border-tomeGold/30 text-[0.6rem]" data-action="downloadHeroJSON" title="Exportar JSON">💾 JSON</button>
                                <button type="button" className="btn btn-ghost border border-tomeGold/30 text-[0.6rem]" data-action="printOfficialSheet" title="Imprimir PDF Oficial D&D 5e">🖨️ Imprimir</button>
                                <button type="button" className="btn btn-ghost border border-tomeGold/30 text-[0.6rem] text-red-500" data-action="cloneToBestiary" title="Clonar para Bestiário">😈 NPC</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 bg-black/20 p-5 border-2 border-tomeGold/30 rounded-xl">
                            <div className="form-group"><label className="attr-label">CLASSE</label><input className="legacy-input" name="class" value={p.class || ''} placeholder="Bardo" /></div>
                            <div className="form-group"><label className="attr-label">NÍVEL</label><input className="legacy-input" type="number" name="level" min="1" max="20" value={p.level || 1} /></div>
                            <div className="form-group"><label className="attr-label">ANTECEDENTE</label><input className="legacy-input" name="background" value={p.background || ''} placeholder="Charlatão" /></div>
                            <div className="form-group"><label className="attr-label">NOME DO JOGADOR</label><input className="legacy-input" name="playerName" value={p.playerName || ''} /></div>
                            
                            <div className="form-group"><label className="attr-label">RAÇA</label><input className="legacy-input" name="race" value={p.race || ''} placeholder="Draconato" /></div>
                            <div className="form-group"><label className="attr-label">TENDÊNCIA</label><input className="legacy-input" name="alignment" value={p.alignment || ''} placeholder="Caótico e Bom" /></div>
                            <div className="form-group"><label className="attr-label">PONTOS DE EXPERIÊNCIA</label><input className="legacy-input" type="number" name="xp" value={p.xp || 0} /></div>
                            <div className="form-group flex items-end justify-center text-[0.75rem] font-extrabold font-outfit tracking-wider uppercase">DOMÍNIO RPG 5E</div>
                        </div>
                    </div>
                </header>

                {/* ════ TAB NAVIGATION ════ */}
                <nav className="sheet-tabs flex justify-center gap-5 border-b-[3px] border-[var(--sheet-border-color)] mb-10">
                    <button type="button" className="sheet-tab-btn {currentTab === 'core' ? 'active' : ''}" data-action="switchTab" data-tab="core">ESSÊNCIA & COMBATE</button>
                    <button type="button" className="sheet-tab-btn {currentTab === 'bio' ? 'active' : ''}" data-action="switchTab" data-tab="bio">HISTÓRIA & POSSES</button>
                    <button type="button" className="sheet-tab-btn {currentTab === 'spells' ? 'active' : ''}" data-action="switchTab" data-tab="spells">GRIMÓRIO ARCANO</button>
                    <button type="button" className="sheet-tab-btn {currentTab === 'card' ? 'active' : ''}" data-action="switchTab" data-tab="card">VI. CARD AVATAR</button>
                </nav>

                {/* ════ TAB I: CORE ════ */}
                {renderCoreTab(p, actions)}

                {/* ════ TAB II: BIO & INVENTORY ════ */}
                {renderBioInventoryTab(p, actions)}

                {/* ════ TAB III: GRIMÓRIO ARCANO ════ */}
                {renderSpellsTab(p, actions)}

                {/* ════ TAB IV: CARD AVATAR ════ */}
                <div className="tab-content {currentTab === 'card' ? 'active' : ''}">
                    {actions._renderCardTab()}
                </div>

                <footer class="mt-[60px] text-center pb-[60px]">
                    <button type="button" className="btn btn-primary px-20 py-5 text-[1.5rem] font-header tracking-widest shadow-[0_0_15px_rgba(197,160,89,1)]" data-action="submitForm">
                        <i className="fa-solid fa-bookmark"></i> {isEditing ? 'ATUALIZAR HERÓI' : 'REGISTRAR LENDA'}
                    </button>
                </footer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                    {actions._renderPlayerList()}
                </div>

                {/* IMPOSTER / IMPORT MODAL */}
                <div id="importer-modal" className="modal hidden fixed inset-0 bg-black/85 z-[2000] items-center justify-center backdrop-blur-md">
                    <div className="card glass-accent w-[620px] p-[35px] border-2 border-accent rounded-[15px] animate-scaleIn bg-slate-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                        <h2 class="mt-0 border-b border-white/10 pb-3 flex items-center gap-2.5">
                            <i className="fa-solid fa-file-import"></i> IMPORTAR FICHA D&D 5E
                        </h2>
                        <p class="text-[0.75rem] mb-5 leading-[1.4]">
                            Importe seus dados instantaneamente usando um arquivo **PDF Oficial** preenchido (D&D Beyond, Aurora, etc) ou colando o texto extraído da sua ficha.
                        </p>
                        
                        {/* Drag and Drop PDF Zone */}
                        <div id="pdf-drop-zone" class="border-2 border-dashed border-accent rounded-lg p-6 text-center cursor-pointer bg-black/30 transition-all duration-200 mb-4 hover:bg-black/50 hover:border-accent/80" data-action="triggerPDFUpload">
                            <i className="fa-solid fa-file-pdf fa-3x mb-2.5 opacity-80"></i>
                            <h4 class="m-0 text-white text-[0.9rem]">Importar PDF Oficial</h4>
                            <p class="mt-1 text-[0.7rem] text-slate-400">Clique ou arraste o arquivo PDF preenchido da sua ficha aqui</p>
                            <input type="file" id="pdf-file-input" className="hidden" accept=".pdf" />
                        </div>

                        <div class="text-center my-4 text-[0.75rem] flex items-center justify-center gap-2.5 text-slate-400">
                            <span class="inline-block w-10 h-[1px] bg-white/15"></span>
                            <span>OU VIA TEXTO COPIADO</span>
                            <span class="inline-block w-10 h-[1px] bg-white/15"></span>
                        </div>

                        <textarea id="import-text" className="legacy-textarea h-[150px] text-[0.75rem] p-2.5 bg-black/20" placeholder="Cole o texto copiado da ficha aqui..."></textarea>
                        
                        <div class="flex gap-4 justify-end mt-5">
                            <button type="button" className="btn btn-ghost text-[0.8rem]" data-action="closeImporter">CANCELAR</button>
                            <button type="button" className="btn btn-primary text-[0.8rem] font-extrabold" data-action="processImport">PROCESSAR DADOS</button>
                        </div>
                    </div>
                </div>

                </form>
            </div>
        );
}
