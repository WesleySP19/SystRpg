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
    
    const skills = [
        { id: 'athletics', label: 'Atletismo', stat: 'str' },
        { id: 'acrobatics', label: 'Acrobacia', stat: 'dex' },
        { id: 'sleightOfHand', label: 'Prestidigitação', stat: 'dex' },
        { id: 'stealth', label: 'Furtividade', stat: 'dex' },
        { id: 'arcana', label: 'Arcanismo', stat: 'int' },
        { id: 'history', label: 'História', stat: 'int' },
        { id: 'investigation', label: 'Investigação', stat: 'int' },
        { id: 'nature', label: 'Natureza', stat: 'int' },
        { id: 'religion', label: 'Religião', stat: 'int' },
        { id: 'insight', label: 'Intuição', stat: 'wis' },
        { id: 'medicine', label: 'Medicina', stat: 'wis' },
        { id: 'perception', label: 'Percepção', stat: 'wis' },
        { id: 'survival', label: 'Sobrevivência', stat: 'wis' },
        { id: 'animalHandling', label: 'Adestrar Animais', stat: 'wis' },
        { id: 'deception', label: 'Enganação', stat: 'cha' },
        { id: 'intimidation', label: 'Intimidação', stat: 'cha' },
        { id: 'performance', label: 'Atuação', stat: 'cha' },
        { id: 'persuasion', label: 'Persuasão', stat: 'cha' }
    ];
    
    const actions = {};
    const _renderInventoryRows = () => {
            return inventoryRows.map((item, i) => (
                <div className="grid grid-cols-[1fr_60px_60px_25px] gap-1 mb-0.5">
                    <input className="legacy-input inv-name text-[0.7rem] p-1" type="text" value={item.name || ''} placeholder="Nome do Item" />
                    <input className="legacy-input inv-qty text-[0.7rem] p-1 text-center" type="number" value={item.qty || 1} placeholder="Qtd" />
                    <input className="legacy-input inv-weight text-[0.7rem] p-1 text-center" type="number" value={item.weight || 0} step="0.1" placeholder="Peso" />
                    <button type="button" className="btn btn-danger btn-sm p-0" data-action="removeInventoryRow" data-index={i}>✕</button>
                </div>
            )).join('');
        };
    const _renderAttackRows = () => {
            return attackRows.map((atk, i) => (
                <div style={{ 'display': 'grid', 'gridTemplateColumns': '1fr 50px 80px 25px', 'gap': '5px', 'marginBottom': '5px' }}>
                    <input className="legacy-input atk-name" type="text" value={atk.name || ''} placeholder="Nome" />
                    <input className="legacy-input atk-bonus" type="text" value={atk.bonus || ''} placeholder="+5" />
                    <input className="legacy-input atk-damage" type="text" value={atk.damage || ''} placeholder="1d8" />
                    <button type="button" className="btn btn-danger btn-sm" data-action="removeAttackRow" data-index={i}>✕</button>
                </div>
            )).join('');
        };
    const _renderPlayerList = () => {
            const { players } = TOME.store.state;
            if (!players?.length) return '';
            return players.map(p => (
                <div className="card" style={{ 'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'borderLeft': '4px solid var(--accent)', 'background': 'rgba(255,255,255,0.02)' }}>
                    <div>
                        <h4 style={{ 'margin': '0' }}>{p.name}</h4>
                        <p style={{ 'fontSize': '0.7rem', 'margin': '5px 0 0', 'textTransform': 'uppercase' }}>{p.class || 'Sem Classe'} • NÍVEL {p.level || 1}</p>
                    </div>
                    <div className="flex gap-2.5">
                        <button type="button" className="btn btn-ghost btn-sm" style={{ 'background': 'rgba(255,255,255,0.05)', 'color': '#fff' }} data-action="editHero" data-id={p.id}>EDITAR</button>
                        <button type="button" className="btn btn-danger btn-sm" data-action="removePlayer" data-id={p.id}>✕</button>
                    </div>
                </div>
            )).join('');
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
                stats: { 
                    str: parseInt(fd.get('stat_str')) || 10, 
                    dex: parseInt(fd.get('stat_dex')) || 10, 
                    con: parseInt(fd.get('stat_con')) || 10, 
                    int: parseInt(fd.get('stat_int')) || 10, 
                    wis: parseInt(fd.get('stat_wis')) || 10, 
                    cha: parseInt(fd.get('stat_cha')) || 10 
                },
                savingThrows: { 
                    str: !!fd.get('save_str'), 
                    dex: !!fd.get('save_dex'), 
                    con: !!fd.get('save_con'), 
                    int: !!fd.get('save_int'), 
                    wis: !!fd.get('save_wis'), 
                    cha: !!fd.get('save_cha') 
                },
                skills: skills.filter(sk => fd.get(`skill_${sk.id}`)).map(sk => sk.id),
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
                <div style={{ 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'gap': '20px', 'padding': '20px' }}>
                    <p style={{ 'fontSize': '0.85rem', 'textAlign': 'center' }}>
                        Esta é a visualização da <strong>Carta de Avatar</strong> oficial no formato TCG (proporção 5:7).<br />
                        Os dados são gerados em tempo real. Ajuste o enquadramento usando os controles ao lado e clique na carta para baixá-la.
                    </p>
                    <div style={{ 'display': 'flex', 'gap': '30px', 'justifyContent': 'center', 'flexWrap': 'wrap', 'width': '100%', 'maxWidth': '1200px', 'marginTop': '20px' }}>
                        <div style={{ 'display': 'flex', 'gap': '30px', 'justifyContent': 'center', 'flexWrap': 'wrap', 'flex': '1', 'minWidth': '320px' }}>
                            <div style={{ 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'gap': '10px' }}>
                                <h4 style={{ 'margin': '0', 'fontSize': '0.8rem' }}>FRENTE (COMBATE)</h4>
                                <canvas id="card-canvas-front" data-action="downloadCard" data-side="front" style={{ 'borderRadius': '15px', 'boxShadow': 'var(--shadow-accent)', 'maxWidth': '100%', 'width': '280px', 'height': '392px', 'cursor': 'pointer', 'border': '1px solid rgba(197, 160, 89, 0.3)', 'transition': 'transform 0.2s' }}></canvas>
                            </div>
                            <div style={{ 'display': 'flex', 'flexDirection': 'column', 'alignItems': 'center', 'gap': '10px' }}>
                                <h4 style={{ 'margin': '0', 'fontSize': '0.8rem' }}>VERSO (HISTÓRIA)</h4>
                                <canvas id="card-canvas-back" data-action="downloadCard" data-side="back" style={{ 'borderRadius': '15px', 'boxShadow': 'var(--shadow-accent)', 'maxWidth': '100%', 'width': '280px', 'height': '392px', 'cursor': 'pointer', 'border': '1px solid rgba(197, 160, 89, 0.3)', 'transition': 'transform 0.2s' }}></canvas>
                            </div>
                        </div>
                        
                        <div className="skills-list" style={{ 'width': '340px', 'padding': '20px', 'display': 'flex', 'flexDirection': 'column', 'gap': '15px', 'background': 'rgba(0,0,0,0.3)', 'border': 'var(--sheet-border-thick)', 'borderRadius': '12px' }}>
                            <h3 style={{ 'margin': '0', 'fontSize': '1.1rem', 'borderBottom': '1px solid rgba(255,255,255,0.1)', 'paddingBottom': '10px' }}>
                                <i className="fa-solid fa-sliders" style={{ 'marginRight': '8px' }}></i> Ajustes do Card TCG
                            </h3>
                            
                            <div style={{ 'display': 'flex', 'flexDirection': 'column', 'gap': '5px' }}>
                                <label className="attr-label" style={{ 'fontSize': '0.6rem' }}>IMAGEM DO RETRATO</label>
                                <button type="button" className="btn btn-ghost btn-block" style={{ 'border': '1px solid var(--accent)', 'fontSize': '0.75rem', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '8px' }} data-action="triggerPortrait">
                                    <i className="fa-solid fa-upload"></i> Escolher Foto do Herói
                                </button>
                            </div>
    
                            <div style={{ 'display': 'flex', 'flexDirection': 'column', 'gap': '8px' }}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="attr-label" style={{ 'fontSize': '0.65rem', 'margin': '0' }}>ENQUADRAMENTO DA FOTO</label>
                                    <button type="button" className="btn btn-ghost btn-sm" style={{ 'fontSize': '0.55rem', 'padding': '2px 6px' }} data-action="resetPortrait">CENTRALIZAR</button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div style={{ 'display': 'flex', 'justifyContent': 'space-between', 'fontSize': '0.65rem' }}>
                                        <span>Zoom (Escala):</span>
                                        <span id="label-val-scale">1.00x</span>
                                    </div>
                                    <input type="range" min="0.5" max="3" step="0.05" value={portraitSettings.scale || 1} data-action="updatePortrait" data-key="scale" style={{ 'width': '100%' }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div style={{ 'display': 'flex', 'justifyContent': 'space-between', 'fontSize': '0.65rem' }}>
                                        <span>Posição Horizontal (X):</span>
                                        <span id="label-val-x">0px</span>
                                    </div>
                                    <input type="range" min="-300" max="300" step="1" value={portraitSettings.x || 0} data-action="updatePortrait" data-key="x" style={{ 'width': '100%' }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div style={{ 'display': 'flex', 'justifyContent': 'space-between', 'fontSize': '0.65rem' }}>
                                        <span>Posição Vertical (Y):</span>
                                        <span id="label-val-y">0px</span>
                                    </div>
                                    <input type="range" min="-300" max="300" step="1" value={portraitSettings.y || 0} data-action="updatePortrait" data-key="y" style={{ 'width': '100%' }} />
                                </div>
                            </div>
    
                            <div style={{ 'borderTop': '1px solid rgba(255,255,255,0.1)', 'paddingTop': '15px', 'display': 'flex', 'flexDirection': 'column', 'gap': '10px' }}>
                                <button type="button" className="btn btn-primary btn-block" data-action="downloadPrintablePair" style={{ 'fontSize': '0.75rem', 'fontWeight': '800', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '8px' }}>
                                    <i className="fa-solid fa-file-image"></i> Baixar Par Imprimível (5:7)
                                </button>
                                <p style={{ 'fontSize': '0.6rem', 'textAlign': 'center', 'margin': '0', 'lineHeight': '1.3' }}>
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
            <div className="page legacy-sheet-container" ref={containerRef} style={{ 'maxWidth': '1400px', 'margin': '0 auto', 'animation': 'fadeIn 0.5s ease-out' }}>
                <form id="hero-form" onSubmit={e => e.preventDefault()}>
                
                {isEditing ? html`
                    <div className="edit-mode-banner" style={{ 'background': 'linear-gradient(90deg, var(--accent), #f39c12)', 'color': '#000', 'padding': '10px', 'textAlign': 'center', 'fontWeight': '900', 'marginBottom': '20px', 'borderRadius': '8px', 'border': '2px solid #000', 'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center' }}>
                        <span><i className="fa-solid fa-pen-fancy"></i> MODO EDIÇÃO: ${p.name || 'Herói'}</span>
                        <button className="btn btn-ghost btn-sm" style={{ 'color': '#000', 'border': '1px solid #000' }} data-action="resetForm">CANCELAR / NOVO</button>
                    </div>
                ` : ''}
                
                {/* ════ HEADER SECTION (D&D 5E OFFICIAL LAYOUT) ════ */}
                <div style={{ 'marginBottom': '20px' }}>
                    <button type="button" className="btn btn-ghost" data-action="closeBuilder"><i className="fa-solid fa-arrow-left"></i> Voltar para Monitoria</button>
                </div>
                <header style={{ 'display': 'grid', 'gridTemplateColumns': '300px 1fr', 'gap': '40px', 'marginBottom': '40px', 'alignItems': 'end' }}>
                    <div style={{ 'display': 'flex', 'flexDirection': 'column', 'gap': '10px' }}>
                        <div className="portrait-box-legacy" style={{ 'height': '350px', 'border': 'var(--sheet-border-thick)', 'borderRadius': '15px', 'position': 'relative', 'overflow': 'hidden', 'background': 'rgba(0,0,0,0.2)', 'cursor': 'pointer' }} data-action="triggerPortrait">
                            <div id="portrait-preview" style={{ 'width': '100%', 'height': '100%', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'overflow': 'hidden' }}>
                                {portraitData ? <img src={portraitData} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${portraitSettings.scale || 1}) translate(${portraitSettings.x || 0}px, ${portraitSettings.y || 0}px)`, transition: 'transform 0.1s ease-out' }} /> : <i className="fa-solid fa-user-shield fa-4x" style={{ color: 'rgba(197, 160, 89, 0.2)' }}></i>}
                            </div>
                            <span style={{ 'position': 'absolute', 'bottom': '10px', 'width': '100%', 'textAlign': 'center', 'fontSize': '0.6rem', 'fontWeight': '800', 'background': 'rgba(0,0,0,0.6)', 'color': 'var(--sheet-label-color)' }}>MUDAR RETRATO</span>
                            <input type="file" id="portrait-input" style={{ 'display': 'none' }} accept="image/*" />
                        </div>
                        
                        {/* PORTRAIT CONTROLS */}
                        <div className="skills-list" style={{ 'padding': '10px', 'fontSize': '0.6rem', 'display': portraitData ? 'flex' : 'none', 'flexDirection': 'column', 'gap': '5px' }}>
                            <div className="flex justify-between items-center mb-1.5">
                                <label style={{ 'fontWeight': '800' }}>CONTROLE DE FOTO</label>
                                <button type="button" className="btn btn-ghost btn-sm" style={{ 'fontSize': '0.5rem', 'padding': '2px 5px' }} data-action="resetPortrait">CENTRALIZAR</button>
                            </div>
                            <label>ZOOM: <input type="range" min="0.5" max="3" step="0.1" value={portraitSettings.scale || 1} data-action="updatePortrait" data-key="scale" /></label>
                            <label>POS X: <input type="range" min="-200" max="200" step="1" value={portraitSettings.x || 0} data-action="updatePortrait" data-key="x" /></label>
                            <label>POS Y: <input type="range" min="-200" max="200" step="1" value={portraitSettings.y || 0} data-action="updatePortrait" data-key="y" /></label>
                        </div>
                    </div>

                    <div style={{ 'display': 'flex', 'flexDirection': 'column', 'gap': '15px' }}>
                        <div style={{ 'borderBottom': 'var(--sheet-border-thick)', 'paddingBottom': '5px', 'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'gap': '10px' }}>
                            <input className="legacy-input" type="text" id="input-hero-name" name="name" value={p.name || ''} placeholder="NOME DO PERSONAGEM" style={{ 'fontSize': '3rem', 'flex': '1', 'fontFamily': 'var(--sheet-font-header)', 'fontWeight': '900' }} />
                            <div style={{ 'display': 'flex', 'gap': '5px' }}>
                                <button type="button" className="btn btn-ghost" style={{ 'border': '1px solid rgba(197, 160, 89, 0.3)', 'fontSize': '0.6rem' }} data-action="openImporter" title="Importar PDF/Texto">📥 PDF/Texto</button>
                                <button type="button" className="btn btn-ghost" style={{ 'border': '1px solid rgba(197, 160, 89, 0.3)', 'fontSize': '0.6rem' }} data-action="importHeroJSON" title="Importar JSON">📂 JSON</button>
                                <button type="button" className="btn btn-ghost" style={{ 'border': '1px solid rgba(197, 160, 89, 0.3)', 'fontSize': '0.6rem' }} data-action="downloadHeroJSON" title="Exportar JSON">💾 JSON</button>
                                <button type="button" className="btn btn-ghost" style={{ 'border': '1px solid rgba(197, 160, 89, 0.3)', 'fontSize': '0.6rem' }} data-action="printOfficialSheet" title="Imprimir PDF Oficial D&D 5e">🖨️ Imprimir</button>
                                <button type="button" className="btn btn-ghost" style={{ 'border': '1px solid rgba(197, 160, 89, 0.3)', 'fontSize': '0.6rem', 'color': 'var(--danger)' }} data-action="cloneToBestiary" title="Clonar para Bestiário">😈 NPC</button>
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
                            <div className="form-group" style={{ 'display': 'flex', 'alignItems': 'end', 'justifyContent': 'center', 'fontSize': '0.75rem', 'fontWeight': '800', 'fontFamily': 'Outfit', 'letterSpacing': '1px', 'textTransform': 'uppercase' }}>DOMÍNIO RPG 5E</div>
                        </div>
                    </div>
                </header>

                {/* ════ TAB NAVIGATION ════ */}
                <nav className="sheet-tabs" style={{ 'justifyContent': 'center', 'gap': '20px', 'borderBottom': '3px solid var(--sheet-border-color)', 'marginBottom': '40px' }}>
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

                <footer style={{ 'marginTop': '60px', 'textAlign': 'center', 'paddingBottom': '60px' }}>
                    <button type="button" className="btn btn-primary" data-action="submitForm" style={{ 'padding': '20px 80px', 'fontSize': '1.5rem', 'fontFamily': 'var(--sheet-font-header)', 'letterSpacing': '3px', 'boxShadow': '0 0 15px var(--accent)' }}>
                        <i className="fa-solid fa-bookmark"></i> {isEditing ? 'ATUALIZAR HERÓI' : 'REGISTRAR LENDA'}
                    </button>
                </footer>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                    {actions._renderPlayerList()}
                </div>

                {/* IMPOSTER / IMPORT MODAL */}
                <div id="importer-modal" className="modal" style={{ 'display': 'none', 'position': 'fixed', 'inset': '0', 'background': 'rgba(0,0,0,0.85)', 'zIndex': '2000', 'alignItems': 'center', 'justifyContent': 'center', 'backdropFilter': 'blur(10px)' }}>
                    <div className="card glass-accent" style={{ 'width': '620px', 'padding': '35px', 'border': '2px solid var(--accent)', 'borderRadius': '15px', 'animation': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 'background': 'rgba(18,18,22,0.95)', 'boxShadow': '0 20px 50px rgba(0,0,0,0.7)' }}>
                        <h2 style={{ 'marginTop': '0', 'borderBottom': '1px solid rgba(255,255,255,0.1)', 'paddingBottom': '12px', 'display': 'flex', 'alignItems': 'center', 'gap': '10px' }}>
                            <i className="fa-solid fa-file-import"></i> IMPORTAR FICHA D&D 5E
                        </h2>
                        <p style={{ 'fontSize': '0.75rem', 'marginBottom': '20px', 'lineHeight': '1.4' }}>
                            Importe seus dados instantaneamente usando um arquivo **PDF Oficial** preenchido (D&D Beyond, Aurora, etc) ou colando o texto extraído da sua ficha.
                        </p>
                        
                        {/* Drag and Drop PDF Zone */}
                        <div id="pdf-drop-zone" style={{ 'border': '2px dashed var(--accent)', 'borderRadius': '10px', 'padding': '25px', 'textAlign': 'center', 'cursor': 'pointer', 'background': 'rgba(0,0,0,0.3)', 'transition': 'all 0.2s', 'marginBottom': '15px' }} data-action="triggerPDFUpload">
                            <i className="fa-solid fa-file-pdf fa-3x" style={{ 'marginBottom': '10px', 'opacity': '0.8' }}></i>
                            <h4 style={{ 'margin': '0', 'color': '#fff', 'fontSize': '0.9rem' }}>Importar PDF Oficial</h4>
                            <p style={{ 'margin': '5px 0 0', 'fontSize': '0.7rem' }}>Clique ou arraste o arquivo PDF preenchido da sua ficha aqui</p>
                            <input type="file" id="pdf-file-input" style={{ 'display': 'none' }} accept=".pdf" />
                        </div>

                        <div style={{ 'textAlign': 'center', 'margin': '15px 0', 'fontSize': '0.75rem', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center', 'gap': '10px' }}>
                            <span style={{ 'display': 'inline-block', 'width': '40px', 'height': '1px', 'background': 'rgba(255,255,255,0.15)' }}></span>
                            <span>OU VIA TEXTO COPIADO</span>
                            <span style={{ 'display': 'inline-block', 'width': '40px', 'height': '1px', 'background': 'rgba(255,255,255,0.15)' }}></span>
                        </div>

                        <textarea id="import-text" className="legacy-textarea" placeholder="Cole o texto copiado da ficha aqui..." style={{ 'height': '150px', 'fontSize': '0.75rem', 'padding': '10px', 'background': 'rgba(0,0,0,0.2) !important' }}></textarea>
                        
                        <div style={{ 'display': 'flex', 'gap': '15px', 'justifyContent': 'flex-end', 'marginTop': '20px' }}>
                            <button type="button" className="btn btn-ghost" data-action="closeImporter" style={{ 'fontSize': '0.8rem' }}>CANCELAR</button>
                            <button type="button" className="btn btn-primary" data-action="processImport" style={{ 'fontSize': '0.8rem', 'fontWeight': '800' }}>PROCESSAR DADOS</button>
                        </div>
                    </div>
                </div>

                </form>
            </div>
        );
}
