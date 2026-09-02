import { useState, useEffect, useRef } from "preact/hooks";
import { useStore } from "../core/hooks.js";
import { html } from "htm/preact";
import { TOME } from '../../core/Registry.js';
import { MonsterData } from '../../data/MonsterData.js';
import { Toast } from '../components/core/Toast.jsx';
import { Dice } from '../../utils/Dice.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';

/**
 * BESTIARY / BESTIÁRIO ARCANO v7.0
 * Complete creature library with custom forged/imported monsters,
 * level filters, detail stats sheets, and mass JSON importing.
 */
export function Bestiary(opts) {
    const storeState = useStore();
    const [selectedId, setSelectedId] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("Nível 1");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [selectedCreature, setSelectedCreature] = useState(null);
    const [showForgeModal, setShowForgeModal] = useState(false);
    const [activeRoll, setActiveRoll] = useState(null);
    const [rollMod, setRollMod] = useState("normal");
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);
    const render = forceUpdate;
    const containerRef = useRef(null);

    const handleGlobalClick = (e) => {
        const btn = e.target.closest("[data-action]");
        if (btn) {
            const action = btn.dataset.action;
            if (action === "selectLevel") selectLevel(e, btn);
            if (action === "viewCreature") viewCreature(e, btn);
            if (action === "spawnCreature") spawnCreature(e, btn);
            if (action === "spawnFromDetail") spawnFromDetail(e, btn);
            if (action === "deleteCustomMonster") deleteCustomMonster(e, btn);
            if (action === "addCustomMonster") addCustomMonster(e, btn);
            if (action === "triggerImportJSON") triggerImportJSON(e, btn);
            if (action === "rollBestiaryAttack") rollBestiaryAttack(e, btn);
            if (action === "proceedToDamage") proceedToDamage(e, btn);
            if (action === "applyVisualRollResult") applyVisualRollResult(e, btn);
            if (action === "closeVisualRoll") closeVisualRoll(e, btn);
            if (action === "closeForgeModal") closeForgeModal(e, btn);
            if (action === "forgeCustomMonster") forgeCustomMonster(e, btn);
            if (action === "backToGrid") backToGrid(e, btn);
        }
    };

    const narrativeQuotes = {
        hit: [
            "A lâmina corta o ar com precisão!",
            "Um golpe certeiro nas defesas do inimigo!",
            "O impacto ressoa por toda a biblioteca!",
            "Sangue e faíscas voam com o acerto!",
            "O ataque encontra uma brecha na armadura!"
        ],
        miss: [
            "O golpe passa raspando!",
            "A defesa se mantém impenetrável.",
            "O monstro vacila por um momento...",
            "O ataque atinge apenas o vácuo.",
            "Um desvio ágil no último segundo!"
        ],
        crit: [
            "UM GOLPE LENDÁRIO! A criatura cambaleia!",
            "PERFEIÇÃO TÁTICA! O dano é devastador!",
            "A força do destino guia esta arma!"
        ]
    };


    const store = window.TOME?.store || { state: storeState };
    const $ = (sel) => containerRef.current ? containerRef.current.querySelector(sel) : null;
    const $$ = (sel) => containerRef.current ? containerRef.current.querySelectorAll(sel) : [];

    function _getCombinedCreatures() {
        const staticCreatures = MonsterData[selectedLevel] || [];
        const customCreatures = (store.state.customMonsters || [])
            .filter(m => m.level === selectedLevel || m.cr === selectedLevel || (!m.level && selectedLevel === 'Nível 1'));
        return [...customCreatures, ...staticCreatures];
    }

    function _getNarrative(type, targetName, damage = 0) {
        const base = narrativeQuotes[type][Math.floor(Math.random() * narrativeQuotes[type].length)];
        if (type === 'hit' || type === 'crit') {
            return `${base} <br> ⚔️ <strong>${targetName}</strong> sofre <strong>${damage}</strong> de dano!`;
        }
        return `${base} <br> 🛡️ <strong>${targetName}</strong> escapa ileso!`;
    }

    function _getCreatureActions(m) {
        if (m.actions && m.actions.length > 0) {
            return m.actions.map(act => ({
                name: act.name || 'Ataque',
                bonus: act.bonus !== undefined ? act.bonus : (act.hit !== undefined ? act.hit : 4),
                damage: act.damage || act.dmg || '1d8+2',
                desc: act.desc || act.description || `Ataque especial causando ${act.damage || act.dmg || '1d8+2'} de dano.`
            }));
        }
        
        const nameLower = (m.name || '').toLowerCase();
        let prof = 2;
        const levelStr = String(m.level || m.cr || 'Nível 1');
        if (levelStr.includes('BOSS')) prof = 6;
        else {
            const num = parseInt(levelStr.replace(/\D/g, '')) || 1;
            if (num >= 17) prof = 6;
            else if (num >= 13) prof = 5;
            else if (num >= 9) prof = 4;
            else if (num >= 5) prof = 3;
        }
        
        const bonus = primaryMod + prof;
        
        // Damage formula based on level/CR
        let damageDice = "1d6";
        let damageBonus = primaryMod >= 0 ? `+${primaryMod}` : `${primaryMod}`;
        if (levelStr.includes('BOSS')) {
            damageDice = "4d10";
        } else {
            const num = parseInt(levelStr.replace(/\D/g, '')) || 1;
            if (num >= 17) damageDice = "4d8";
            else if (num >= 13) damageDice = "3d8";
            else if (num >= 9) damageDice = "2d10";
            else if (num >= 5) damageDice = "2d6";
            else if (num >= 3) damageDice = "1d10";
            else if (num >= 2) damageDice = "1d8";
        }
        
        const damage = `${damageDice}${primaryMod !== 0 ? damageBonus : ''}`;
        
        // Determine attack name
        let attackName1 = "Ataque Corporal";
        let attackName2 = "Ataque de Garra";
        
        if (nameLower.includes('lobo') || nameLower.includes('werewolf') || nameLower.includes('cão') || nameLower.includes('dragão') || nameLower.includes('dragon')) {
            attackName1 = "Mordida";
            attackName2 = "Garras";
        } else if (nameLower.includes('esqueleto') || nameLower.includes('goblin') || nameLower.includes('orc') || nameLower.includes('humano')) {
            attackName1 = "Espada Curta";
            attackName2 = "Arco Curto";
        } else if (nameLower.includes('mago') || nameLower.includes('bruxo') || nameLower.includes('spell')) {
            attackName1 = "Disparo Místico";
            attackName2 = "Cajado";
        }
        
        return [
            { name: attackName1, bonus: bonus, damage: damage, desc: `Ataque corporal com bônus de +${bonus} e dano de ${damage}.` },
            { name: attackName2, bonus: bonus, damage: damageDice, desc: `Ataque rápido com bônus de +${bonus} e dano de ${damageDice}.` }
        ];
    }
    
    useEffect(() => {
        if (onMount) onMount();
        return () => { if (onUnmount) onUnmount(); };
    }, []);

    function template() {
        const levels = Object.keys(MonsterData);
        const allCreatures = _getCombinedCreatures();
        const filtered = allCreatures.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const isBoss = selectedLevel === 'BOSS';

        const customStyle = `
            <style>
                @keyframes diceSpin {
                    0% { transform: rotate(0deg) scale(0.6); opacity: 0; }
                    30% { transform: rotate(360deg) scale(1.2); opacity: 1; }
                    60% { transform: rotate(720deg) scale(0.9); }
                    100% { transform: rotate(1080deg) scale(1); }
                }

                @keyframes diceShake {
                    0% { transform: translate(2px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(0px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(2px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(2px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }

                .dice-preview-box {
                    font-size: 4rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 120px;
                    color: var(--accent);
                    text-shadow: 0 0 20px rgba(197, 160, 89, 0.5);
                }

                .dice-preview-box.spinning {
                    animation: diceSpin 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .dice-preview-box.shaking {
                    animation: diceShake 0.6s infinite linear;
                    color: var(--danger);
                }
            </style>
        `;

        return `
            ${customStyle}
            <div class="page bestiary animate-fadeIn" style="max-width:1400px; padding:20px;">
                <!-- HEADER -->
                <div class="section-header" style="flex-wrap:wrap; gap:15px; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:20px; margin-bottom:20px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.5);"><i class="fa-solid fa-book-skull" style="margin-right:12px;"></i> Bestiário Arcano</h2>
                        <p class="section-subtitle" style="color:var(--text-dim);">Biblioteca de criaturas e ameaças lendárias.</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                        <div style="position:relative; margin-right: 10px;">
                            <i class="fa-solid fa-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--accent); opacity:0.7;"></i>
                            <input type="text" class="legacy-input" placeholder="Buscar criatura..." value="${searchQuery}"
                                   style="min-width:250px; padding-left:35px !important; border-radius:20px !important; background:rgba(0,0,0,0.5) !important;"
                                   oninput="closest('.bestiary').__component._doSearch(value)">
                        </div>
                        
                        <button class="btn btn-ghost" data-action="triggerImportJSON" style="border-radius:20px; border:1px solid rgba(255,255,255,0.15); padding:8px 20px; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-file-import"></i> Importar JSON
                        </button>
                        <input type="file" id="bestiary-json-input" style="display:none;" accept=".json" multiple>
                        
                        <button class="btn btn-primary" data-action="addCustomMonster" style="border-radius:20px; padding:8px 20px; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-hammer"></i> Forjar Monstro
                        </button>
                    </div>
                </div>

                <!-- LEVEL FILTER BAR -->
                <div style="display:flex; overflow-x:auto; gap:10px; padding-bottom:15px; margin-bottom:20px; scrollbar-width:thin;">
                    ${levels.map(lvl => {
                        const isActive = selectedLevel === lvl;
                        const isBossTab = lvl === 'BOSS';
                        return `
                            <button class="btn ${isActive ? (isBossTab ? 'btn-danger' : 'btn-primary') : 'btn-ghost'}"
                                    style="border-radius:20px; padding:6px 16px; white-space:nowrap; border:1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.1)'}; ${isBossTab && !isActive ? 'color:var(--danger); border-color:var(--danger);' : ''}"
                                    data-action="selectLevel" data-level="${lvl}">
                                ${isBossTab ? '<i class="fa-solid fa-skull-crossbones" style="margin-right:6px;"></i>' : ''}
                                ${lvl}
                            </button>
                        `;
                    }).join('')}
                </div>

                <!-- MAIN CONTENT -->
                ${selectedCreature ? _renderDetailView(selectedCreature, isBoss) : _renderGridView(filtered, isBoss)}
                
                <!-- FORGE MODAL -->
                ${showForgeModal ? _renderForgeModal() : ''}

                <!-- VISUAL DYNAMIC DICE ROLLER OVERLAY -->
                ${activeRoll ? _renderVisualDiceRoller() : ''}
            </div>
        `;
    }

    /* ── Grid View ─────────────────────────────────────────────── */
    function _renderGridView(creatures, isBoss) {
        if (creatures.length === 0) {
            return `
                <div class="card empty-state" style="height:40vh; border-color:var(--danger); background:rgba(255,0,0,0.02);">
                    <i class="fa-solid fa-dragon fa-3x" style="opacity:0.2; margin-bottom:20px; color:var(--danger);"></i>
                    <h3 style="font-family:'Cinzel';">Santuário Vazio</h3>
                    <p style="color:var(--text-dim);">Nenhuma criatura deste poder foi encontrada.</p>
                </div>
            `;
        }

        return `
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                ${creatures.map((m, i) => _renderCreatureCard(m, i, isBoss)).join('')}
            </div>
        `;
    }

    function _renderCreatureCard(m, index, isBoss) {
        const img = MonsterArt.getImage(m);
        const delay = index * 0.04;
        const isCustom = m.id && String(m.id).startsWith('custom_');
        const portraitImg = img
            ? `<img src="${img}" alt="${m.name}" loading="lazy" onerror="style.display='none';nextElementSibling.style.display='flex';">`
            : '';

        const levelStr = String(m.level || m.cr || 1);
        const levelNum = levelStr.replace(/\D/g, '') || 1;

        return `
            <div class="card bestiary-card-premium"
                 style="animation: fadeIn 0.4s ease-out ${delay}s both;"
                 data-action="viewCreature" data-name="${m.name}">
                
                <div class="bc-inner">
                    <!-- Badges -->
                    <span class="bc-badge level">Nível ${levelNum}</span>
                    ${isBoss ? '<span class="bc-badge boss">Boss</span>' : ''}
                    ${isCustom ? '<span class="bc-badge forged">Forjado</span>' : ''}

                    <!-- Top Banner -->
                    <div class="bc-top-banner">
                        <h4 class="bc-name">${m.name}</h4>
                    </div>
                    
                    <!-- Full Bleed Image (Inside Inner) -->
                    <div class="bc-portrait">
                        ${portraitImg}
                        <span class="bc-emoji" style="${img ? 'display:none;' : ''}">${m.emoji || '🐾'}</span>
                    </div>

                    <!-- Bottom Banner (Type & Actions) -->
                    <div class="bc-bottom-banner creature-action-btn">
                        <div class="bc-type">${m.type || 'Monstro'}</div>
                        <div class="bc-actions-bar">
                            <button class="btn btn-sm" style="border: 2px solid #1a1a1a; font-weight: 900; color: #1a1a1a; background: #fff; box-shadow: 2px 2px 0 #1a1a1a; font-family: 'Outfit', sans-serif;" onclick="event.stopPropagation(); closest('.bestiary-card-premium').click();">
                                VER FICHA
                            </button>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-sm" style="background:#1a1a1a; color:#fff; border: 2px solid #1a1a1a; box-shadow: 2px 2px 0 #1a1a1a;" data-action="spawnCreature" data-name="${m.name}" title="Invocar no Mapa">
                                    <i class="fa-solid fa-swords"></i>
                                </button>
                                ${isCustom ? `<button class="btn btn-sm" style="background:#cc1111; color:#fff; border: 2px solid #1a1a1a; box-shadow: 2px 2px 0 #1a1a1a;" data-action="deleteCustomMonster" data-id="${m.id}"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Floating Stats Box (Bottom Right) -->
                    <div class="bc-stats-box">
                        <div class="stat-line ac"><i class="fa-solid fa-shield-halved"></i> ${m.ac}</div>
                        <div class="stat-divider"></div>
                        <div class="stat-line hp"><i class="fa-solid fa-heart"></i> ${m.hp}</div>
                    </div>
                </div>

            </div>
        `;
    }

    /* ── Detail View (Monster Sheet) ────────────────────────── */
    function _renderDetailView(m, isBoss) {
        const stats = m.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        const actions = _getCreatureActions(m);
        const statNames = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
        const getMod = (v) => Math.floor((v - 10) / 2);
        const dmgType = (a) => {
            const n = (a.name || '').toLowerCase();
            if (n.includes('sopro') || n.includes('fogo') || n.includes('gelo') || n.includes('relampago') || n.includes('relâmpago')) return 'Elemental';
            if (n.includes('mordida') || n.includes('garra') || n.includes('bico')) return 'Slashing';
            return 'Bludgeoning';
        };

        const actionCards = actions.slice(0, 4).map((a, idx) => {
            const melee = MonsterArt.isMeleeAction(a);
            const icon = melee ? 'fa-swords' : 'fa-wand-sparkles';
            return `
                <div class="sb-action-card">
                    <h4><i class="fa-solid ${icon}"></i> ${a.name}</h4>
                    <div class="sb-action-stat">
                        <strong>+${a.bonus || 0}</strong> para atingir ·
                        <strong>${(a.damage || '1d6').toUpperCase()}</strong> ${dmgType(a)} DMG
                    </div>
                    <button type="button" class="sb-action-roll" data-action="rollBestiaryAttack" data-index="${idx}">Rolar ataque</button>
                </div>`;
        }).join('');

        const abilityBoxes = Object.entries(stats).map(([k, v]) => {
            const mod = getMod(v);
            return `
                <div class="sb-ability">
                    <div class="sb-ability-mod">${mod >= 0 ? '+' : ''}${mod}</div>
                    <div class="sb-ability-score">${v}</div>
                    <div class="sb-ability-name">${statNames[k] || k.toUpperCase()}</div>
                </div>`;
        }).join('');

        const notes = m.notes || m.traits || '';
        const traitsBlock = notes
            ? `<div class="sb-trait-title">${notes.split(/[.!]/)[0]}</div><p>${notes}</p>`
            : `<p><strong>Percepção Passiva</strong> ${10 + getMod(stats.wis)} · <strong>Idiomas</strong> Comum</p>`;

        const descriptionBlock = (m.description || m.lore) ? `
            <div style="padding: 15px 25px 0; font-family: 'Cinzel', serif; font-style: italic; font-size: 0.95rem; color: #444; text-align: center; line-height: 1.5; border-bottom: 2px dashed rgba(26,26,26,0.2); padding-bottom: 15px; margin-bottom: 10px;">
                "${m.description || m.lore}"
            </div>
        ` : '';

        return `
            <div class="animate-fadeIn" style="max-width:960px; margin:0 auto; padding-bottom:40px;">
                <button class="btn" style="background:#fff; border:3px solid #1a1a1a; box-shadow:4px 4px 0 #1a1a1a; color:#1a1a1a; font-weight:900; font-family:'Outfit',sans-serif; text-transform:uppercase; margin-bottom:20px; transition:transform 0.1s, box-shadow 0.1s;" onmousedown="style.transform='translate(2px,2px)';style.boxShadow='0 0 0 #1a1a1a'" onmouseup="style.transform='';style.boxShadow='4px 4px 0 #1a1a1a'" data-action="backToGrid">
                    <i class="fa-solid fa-arrow-left"></i> Voltar ao Bestiário
                </button>

                <div class="bestiary-statblock ${isBoss ? 'is-boss' : ''}">
                    <header class="sb-header">
                        <h1 class="sb-name">${m.name}</h1>
                        <p class="sb-subtitle">${MonsterArt.getSubtitle(m, selectedLevel)}</p>
                    </header>
                    ${descriptionBlock}

                    <div class="sb-class-bar">
                        <span>${MonsterArt.getClassification(m)}</span>
                        <span class="sb-cr">${MonsterArt.getCrDisplay(selectedLevel)}</span>
                    </div>

                    <div class="sb-hero">
                        <div class="sb-side-left">
                            <div class="sb-vital-box ac"><i class="fa-solid fa-shield-halved"></i><div class="sb-vital-value">${m.ac}</div><div class="sb-vital-label">Armor Class</div></div>
                            <div class="sb-vital-box hp"><i class="fa-solid fa-heart"></i><div class="sb-vital-value">${m.hp}</div><div class="sb-vital-label">Health</div></div>
                            <div class="sb-vital-box spd"><i class="fa-solid fa-person-running"></i><div class="sb-vital-value">${MonsterArt.getSpeed(m).replace(' ft.', '')}</div><div class="sb-vital-label">Speed</div></div>
                        </div>

                        ${MonsterArt.renderPortrait(m)}

                        <div class="sb-side-right">
                            <div class="sb-multi-box">Multi-Atk<br>${MonsterArt.getMultiattackSummary(actions)}</div>
                            ${actionCards}
                        </div>
                    </div>

                    <div class="sb-abilities">${abilityBoxes}</div>

                    <div class="sb-traits">
                        <p><strong>ND</strong> ${selectedLevel.replace('Nível ', '')} · <strong>Tipo</strong> ${m.type || 'Monstro'}</p>
                        ${traitsBlock}
                    </div>

                    ${isBoss ? '<div class="sb-boss-banner">Criatura Lendária</div>' : ''}

                    <footer class="sb-footer">
                        <div class="sb-test-ac">
                            <span>CA de teste:</span>
                            <input type="number" id="bestiary-test-ac" value="13" min="1" max="30">
                        </div>
                        <button class="btn" style="background:${isBoss ? '#cc1111' : '#eb5e28'}; color:#fff; border:3px solid #1a1a1a; box-shadow:4px 4px 0 #1a1a1a; font-weight:900; font-family:'Outfit',sans-serif; text-transform:uppercase; transition:transform 0.1s, box-shadow 0.1s;" onmousedown="style.transform='translate(2px,2px)';style.boxShadow='0 0 0 #1a1a1a'" onmouseup="style.transform='';style.boxShadow='4px 4px 0 #1a1a1a'" data-action="spawnFromDetail">
                            <i class="fa-solid fa-swords"></i> Invocação Direta
                        </button>
                    </footer>
                </div>
            </div>
        `;
    }

    function _renderForgeModal() {
        const levels = Object.keys(MonsterData);
        return `
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:2000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:650px; width:100%; padding:30px; border:2px solid var(--accent); max-height: 90vh; overflow-y: auto;">
                    <h2 style="font-family:'Cinzel'; color:var(--accent); margin-top:0; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:10px;"><i class="fa-solid fa-hammer"></i> Forjar Nova Criatura</h2>
                    
                    <form id="forge-monster-form" onsubmit="event.preventDefault(); closest('.bestiary').__component.saveForgedMonster(this);">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Nome da Ameaça</small>
                                <input class="legacy-input" name="name" required placeholder="Ex: Dragão de Cinzas" style="width:100%;">
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Tipo de Criatura</small>
                                <input class="legacy-input" name="type" placeholder="Ex: Dragão, Humanoide" style="width:100%;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Categoria / Nível</small>
                                <select class="legacy-input" name="level" style="width:100%; background: #1a1a1f; color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 6px;">
                                    ${levels.map(lvl => `<option value="${lvl}">${lvl}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Classe de Armadura (CA)</small>
                                <input class="legacy-input" type="number" name="ac" value="10" min="1" max="40" style="width:100%;">
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Pontos de Vida (HP)</small>
                                <input class="legacy-input" type="number" name="hp" value="10" min="1" max="1000" style="width:100%;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Emoji Representativo</small>
                                <input class="legacy-input" name="emoji" value="👿" placeholder="👿" style="width:100%; text-align:center;">
                            </div>
                            <div>
                                <small style="display:block; color:var(--text-dim); margin-bottom:4px;">Imagem Sprite (URL)</small>
                                <input class="legacy-input" name="img" placeholder="https://..." style="width:100%;">
                            </div>
                        </div>

                        <h4 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:10px;">Atributos Básicos</h4>
                        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:10px; margin-bottom:20px; text-align:center;">
                            <div><small style="color:var(--text-dim);">FOR</small><input class="legacy-input" type="number" name="stat_str" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">DES</small><input class="legacy-input" type="number" name="stat_dex" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">CON</small><input class="legacy-input" type="number" name="stat_con" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">INT</small><input class="legacy-input" type="number" name="stat_int" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">SAB</small><input class="legacy-input" type="number" name="stat_wis" value="10" style="width:100%; text-align:center;"></div>
                            <div><small style="color:var(--text-dim);">CAR</small><input class="legacy-input" type="number" name="stat_cha" value="10" style="width:100%; text-align:center;"></div>
                        </div>

                        <h4 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:10px;">Ação Principal de Combate</h4>
                        <div style="display:grid; grid-template-columns: 1.5fr 80px 1.2fr; gap:10px; margin-bottom:25px;">
                            <input class="legacy-input" name="action_name" placeholder="Nome: Garra, Sopro" style="width:100%;">
                            <input class="legacy-input" type="number" name="action_bonus" value="4" placeholder="+4" style="width:100%; text-align:center;">
                            <input class="legacy-input" name="action_damage" placeholder="Dano: 2d6+2" style="width:100%;">
                        </div>

                        <div style="display:flex; gap:15px; justify-content:flex-end; border-top:1px solid rgba(197,160,89,0.3); padding-top:20px;">
                            <button type="button" class="btn btn-ghost" onclick="closest('.bestiary').__component.closeForgeModal()">CANCELAR</button>
                            <button type="submit" class="btn btn-primary">FORJAR CRIATURA</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    function saveForgedMonster(form) {
        const fd = new FormData(form);
        const name = fd.get('name');
        if (!name) return;
        
        const actionName = fd.get('action_name');
        const actions = [];
        if (actionName) {
            actions.push({
                name: actionName,
                bonus: parseInt(fd.get('action_bonus')) || 0,
                damage: fd.get('action_damage') || '1d6'
            });
        }

        const forged = {
            id: `custom_${Date.now()}`,
            name: name,
            type: fd.get('type') || 'Monstro',
            ac: parseInt(fd.get('ac')) || 10,
            hp: parseInt(fd.get('hp')) || 10,
            level: fd.get('level') || 'Nível 1',
            emoji: fd.get('emoji') || '👿',
            img: fd.get('img') || '',
            stats: {
                str: parseInt(fd.get('stat_str')) || 10,
                dex: parseInt(fd.get('stat_dex')) || 10,
                con: parseInt(fd.get('stat_con')) || 10,
                int: parseInt(fd.get('stat_int')) || 10,
                wis: parseInt(fd.get('stat_wis')) || 10,
                cha: parseInt(fd.get('stat_cha')) || 10
            },
            actions: actions
        };

        TOME.store.update(s => {
            if (!s.customMonsters) s.customMonsters = [];
            s.customMonsters.push(forged);
        });

        Toast.show(`🔥 ${name} foi forjado no fogo eterno do Bestiário!`, 'success');
        setShowForgeModal(false);
        render();
    }

    function closeForgeModal() {
        setShowForgeModal(false);
        render();
    }

    /* ── Actions ───────────────────────────────────────────────── */
    function selectLevel(e, el) {
        setSelectedLevel(el.dataset.level);
        setSelectedCreature(null);
        setSearchQuery('');
        render();
    }

    function rollBestiaryAttack(e, el) {
        const idx = parseInt(el.dataset.index);
        const m = selectedCreature;
        if (!m) return;
        
        const actions = _getCreatureActions(m);
        const action = actions[idx];
        if (!action) return;
        
        // Get test AC from input
        const acInput = $('#bestiary-test-ac');
        const testAC = acInput ? (parseInt(acInput.value) || 13) : 13;
        
        const attacker = { name: m.name, emoji: m.emoji || '🐾' };
        const target = { name: `Alvo de Treino`, ac: testAC };
        
        startVisualRoll(attacker, target, action);
    }

    function startVisualRoll(attacker, target, action) {
        const newRoll = {
            stage: 'd20',
            rolling: true,
            attacker,
            target,
            action,
            d20Roll: null,
            d20Total: null,
            isCrit: false,
            isHit: false,
            damageNotation: action.damage || '1d6',
            damageRolls: [],
            damageTotal: null,
            narrativeText: ''
        };
        setActiveRoll(newRoll);

        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');

        setTimeout(() => {
            const hitRes = RulesEngine.checkHit(action.bonus || 0, target.ac || 10, rollMod);
            let narrative = '';
            if (hitRes.success) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');
            } else {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                narrative = _getNarrative('miss', target.name);
            }

            setActiveRoll(prev => prev ? ({
                ...prev,
                rolling: false,
                d20Roll: hitRes.roll,
                d20Total: hitRes.total,
                isCrit: hitRes.isCrit,
                isHit: hitRes.success,
                narrativeText: narrative
            }) : null);
        }, 1100);
    }

    function proceedToDamage() {
        setActiveRoll(prev => prev ? ({ ...prev, stage: 'damage' }) : null);

        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');

        setTimeout(() => {
            setActiveRoll(prev => {
                if (!prev) return null;
                const dmgNotation = prev.action?.damage || '1d6';
                const dmgRoll = Dice.roll(dmgNotation);
                
                let totalDmg = prev.isCrit ? (dmgRoll.total * 2) : dmgRoll.total;
                if (isNaN(totalDmg)) totalDmg = 4;

                const text = _getNarrative(prev.isCrit ? 'crit' : 'hit', prev.target?.name || 'Alvo', totalDmg);
                return {
                    ...prev,
                    stage: 'complete',
                    damageRolls: dmgRoll.rolls || [totalDmg],
                    damageTotal: totalDmg,
                    narrativeText: text
                };
            });
        }, 1100);
    }

    function applyVisualRollResult() {
        setActiveRoll(null);
        render();
    }

    function closeVisualRoll() {
        setActiveRoll(null);
        render();
    }

    function _renderVisualDiceRoller() {
        const roll = activeRoll;
        const isD20Stage = roll.stage === 'd20';
        const isDamageStage = roll.stage === 'damage';
        const isComplete = roll.stage === 'complete';

        return `
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(10,12,16,0.9); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:4000; display:flex; align-items:center; justify-content:center; padding:20px;">
                <div class="card glass-accent animate-scaleIn" style="max-width:550px; width:100%; border:2px solid ${isComplete ? (roll.isHit ? 'var(--success)' : 'var(--danger)') : 'var(--accent)'}; padding:35px; text-align:center; background:var(--bg-surface); box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
                    
                    <!-- Attacker Header info -->
                    <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span>${roll.attacker.name}</span>
                        <i class="fa-solid fa-right-long" style="color:var(--accent);"></i>
                        <span>🎯 ${roll.target.name} (CA ${roll.target.ac})</span>
                    </div>

                    <h2 style="font-family:'Cinzel'; font-size:1.8rem; margin:10px 0 25px 0; color:var(--accent-bright); border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px;">
                        Usa: ${roll.action.name}
                    </h2>

                    <!-- STAGE 1: D20 TO HIT ROLL -->
                    ${isD20Stage ? `
                        <div>
                            <div class="dice-preview-box ${roll.rolling ? 'spinning' : ''}">
                                🎲
                            </div>
                            
                            ${roll.rolling ? `
                                <div style="font-size:1rem; font-family:'Cinzel'; color:var(--accent); letter-spacing:1px; margin-top:15px;">
                                    Sacudindo d20...
                                </div>
                            ` : `
                                <div class="animate-fadeIn" style="margin-top:15px;">
                                    <div style="font-size:3.2rem; font-weight:900; color:white; line-height:1;">
                                        ${roll.d20Total}
                                    </div>
                                    <div style="font-size:0.75rem; color:var(--text-dim); margin-top:8px;">
                                        Rolagem: <strong>${roll.d20Roll}</strong> | Bônus: +${roll.action.bonus || 0} vs CA ${roll.target.ac}
                                    </div>
                                    
                                    <div style="margin-top:25px; padding:15px; border-radius:10px; background:${roll.isHit ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border:1px solid ${roll.isHit ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'};">
                                        <div style="font-size:1.6rem; font-weight:800; font-family:'Cinzel'; color:${roll.isHit ? 'var(--success)' : 'var(--danger)'};">
                                            ${roll.isCrit ? '🔥 ACERTO CRÍTICO!' : roll.isHit ? '⚔️ ACERTOU!' : '🛡️ ERROU...'}
                                        </div>
                                        <p style="font-size:0.8rem; color:var(--text-main); margin:6px 0 0 0;">
                                            ${roll.isHit ? 'Prepare-se para desferir o dano!' : 'A criatura escapou ilesa desta investida.'}
                                        </p>
                                    </div>

                                    <div style="display:flex; gap:10px; margin-top:30px;">
                                        ${roll.isHit ? `
                                            <button class="btn btn-primary btn-block" style="padding:12px; font-family:'Cinzel';" data-action="proceedToDamage">
                                                💥 ROLAR DANO (${roll.action.damage || '1d6'})
                                            </button>
                                        ` : `
                                            <button class="btn btn-danger btn-block" style="padding:12px; font-family:'Cinzel';" data-action="closeVisualRoll">
                                                CONCLUIR TESTE
                                            </button>
                                        `}
                                    </div>
                                </div>
                            `}
                        </div>
                    ` : ''}

                    <!-- STAGE 2: DAMAGE ROLLING -->
                    ${isDamageStage ? `
                        <div>
                            <div class="dice-preview-box shaking">
                                💥
                            </div>
                            <div style="font-size:1.1rem; font-family:'Cinzel'; color:var(--danger); letter-spacing:1px; margin-top:15px;">
                                Destruindo armaduras com ${roll.action.damage}...
                            </div>
                        </div>
                    ` : ''}

                    <!-- STAGE 3: COMPLETE -->
                    ${isComplete ? `
                        <div class="animate-fadeIn">
                            <div class="dice-preview-box" style="font-size:4.5rem; color:var(--success);">
                                🩸
                            </div>
                            
                            <div style="font-size:3.5rem; font-weight:900; color:var(--danger); line-height:1; text-shadow:0 0 20px rgba(239, 68, 68, 0.4);">
                                - ${roll.damageTotal} HP
                            </div>
                            <div style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                                Dado de Dano: <strong>${roll.action.damage}</strong> | Resultado: <strong>${roll.damageRolls.join(' + ')}</strong>
                            </div>

                            <div style="margin-top:25px; padding:15px; border-radius:10px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); font-style:italic; font-size:0.85rem; color:var(--text-main);">
                                "${roll.narrativeText}"
                            </div>

                            <button class="btn btn-primary btn-block" style="padding:14px; margin-top:35px; font-family:'Cinzel'; background:var(--success); border-color:#1b9d4c;" data-action="applyVisualRollResult">
                                ✔️ CONCLUIR TESTE
                            </button>
                        </div>
                    ` : ''}

                </div>
            </div>
        `;
    }

    function viewCreature(e, el) {
        if (el.closest('.creature-action-btn')) return;
        const name = el.dataset.name;
        const all = _getCombinedCreatures();
        const m = all.find(c => c.name === name);
        if (m) {
            setSelectedCreature(m);
            render();
        }
    }

    function backToGrid() {
        setSelectedCreature(null);
        render();
    }

    function spawnCreature(e, el) {
        e.stopPropagation();
        const name = el.dataset.name;
        const all = _getCombinedCreatures();
        const m = all.find(c => c.name === name);
        if (m) _addToStore(m);
    }

    function spawnFromDetail() {
        if (selectedCreature) {
            _addToStore(selectedCreature);
        }
    }

    function deleteCustomMonster(e, el) {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja banir esta criatura da sua biblioteca para sempre?')) {
            const id = el.dataset.id;
            TOME.store.update(s => {
                s.customMonsters = (s.customMonsters || []).filter(m => m.id !== id);
            });
            Toast.show('Criatura deletada da biblioteca.');
            render();
        }
    }

    function _addToStore(m) {
        let entity = {
            id: 'm-' + Date.now(),
            name: m.name,
            cr: selectedLevel.replace('Nível ', ''),
            hp_max: m.hp,
            hp: m.hp, // hp atual
            ac: m.ac || 10,
            emoji: m.emoji || '👹',
            img: m.img || MonsterArt.getImage(m) || '',
            size: m.size || 'medium',
            speed: m.speed || '30 ft.',
            type: m.type || 'monster',
            originalData: { ...m, cr: selectedLevel }
        };

        if (window.TOME && window.TOME.events) {
            window.TOME.events.emit('MONSTER_INVOKED', entity);
        }
    }

    function addCustomMonster() {
        setShowForgeModal(true);
        render();
    }

    function triggerImportJSON() {
        $('#bestiary-json-input').click();
    }

    function _doSearch(val) {
        setSearchQuery(val);
        render();
    }

    function search(val) {
        setSearchQuery(val);
        render();
    }

    function select(id) {
        setSelectedId(id);
        render();
    }

    function onMount() {
        // Set __component reference for inline event handlers
        const el = containerRef.current?.querySelector('.bestiary');
        if (el) el.__component = this;

        // Mass JSON Import logic
        const input = $('#bestiary-json-input');
        if (input) {
            input.onchange = async (e) => {
                const files = Array.from(e.target.files);
                if (files.length === 0) return;
                
                Toast.show(`📥 Lendo ${files.length} arquivo(s)...`);
                let importedCount = 0;
                
                for (const file of files) {
                    try {
                        const content = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target.result);
                            reader.onerror = reject;
                            reader.readAsText(file);
                        });
                        
                        const parsed = JSON.parse(content);
                        const list = Array.isArray(parsed) ? parsed : [parsed];
                        
                        // Validate and sanitize each monster in list
                        const validatedList = list.filter(m => m && m.name).map((m, idx) => ({
                            id: m.id || `custom_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
                            name: m.name || 'Criatura Sem Nome',
                            type: m.type || 'Monstro',
                            ac: parseInt(m.ac) || 10,
                            hp: parseInt(m.hp) || 10,
                            level: m.level || m.cr || 'Nível 1',
                            emoji: m.emoji || '🐾',
                            img: m.img || '',
                            stats: m.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
                            actions: Array.isArray(m.actions) ? m.actions : []
                        }));
                        
                        if (validatedList.length > 0) {
                            TOME.store.update(s => {
                                if (!s.customMonsters) s.customMonsters = [];
                                s.customMonsters = [...s.customMonsters, ...validatedList];
                            });
                            importedCount += validatedList.length;
                        }
                    } catch (err) {
                        console.error('Erro ao ler arquivo do bestiário:', err);
                    }
                }
                
                if (importedCount > 0) {
                    Toast.show(`✅ Sucesso! ${importedCount} monstros importados para o Bestiário!`, 'success');
                    render();
                } else {
                    Toast.show('❌ Nenhum monstro válido encontrado nos arquivos.', 'danger');
                }
            };
        }
    }

    return html`<div ref=${containerRef} onClick=${handleGlobalClick} dangerouslySetInnerHTML=${{__html: template()}}></div>`;
}
