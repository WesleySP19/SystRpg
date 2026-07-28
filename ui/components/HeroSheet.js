import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';
import spellsData from '../../data/spells-5e.js';

export class HeroSheet extends Component {
    constructor(opts) {
        super(opts);
        this._selectedAttacksTab = 'weapons'; // 'weapons' or 'spells'
        this._hoverTimer = null;
        this._activePopupSpell = null;
        this._popupMode = null; // 'hover' or 'click'
        this._popupPosition = { x: 0, y: 0 };
        this._rollHistory = []; // Últimas 5 rolagens
        this._showRollModal = false;
        this._lastRoll = null;

        // Master Challenge section variables
        this._activeTab = 'sheet'; // 'sheet' | 'challenges'
        this._selectedChallengeFilter = 'all';
        this._challengeDC = 15;
        this._challengeDCMode = 'medium';
        this._challengeAdvantage = 'normal';
        this._showChallengeResult = null;
    }

    // ── Mapa de dado de vida por classe (D&D 5e oficial) ──
    _getHitDie(className) {
        if (!className) return 'd8';
        const cl = className.toLowerCase();
        if (cl.includes('bárbaro') || cl.includes('barbaro')) return 'd12';
        if (cl.includes('guerreiro') || cl.includes('paladino') || cl.includes('ranger') || cl.includes('patrulheiro')) return 'd10';
        if (cl.includes('ladino') || cl.includes('explorador') || cl.includes('monge') || cl.includes('bardo')) return 'd8';
        if (cl.includes('mago') || cl.includes('feiticeiro') || cl.includes('bruxo') || cl.includes('clérigo') || cl.includes('druida')) return 'd6';
        return 'd8'; // default
    }

    // ── Abre modal de rolagem animada ──
    _showDiceModal(label, bonus, modLabel) {
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + bonus;
        const isCrit = roll === 20;
        const isFail = roll === 1;
        const color = isCrit ? '#ffd700' : (isFail ? '#ef4444' : (total >= 15 ? '#22c55e' : '#fff'));
        const icon = isCrit ? '⭐ CRÍTICO!' : (isFail ? '💀 FALHA CRÍTICA!' : (total >= 15 ? '✅' : '🎲'));
        const entry = { label, roll, bonus, total, color, icon, ts: Date.now() };
        this._rollHistory = [entry, ...this._rollHistory].slice(0, 5);
        this._lastRoll = entry;
        this._showRollModal = true;
        this.render();
        // Auto-fechar após 3.5s
        setTimeout(() => { this._showRollModal = false; this.render(); }, 3500);
    }

    template() {
        const { players, viewingHeroId } = this.store.state;
        const p = players?.find(h => h.id === viewingHeroId);

        if (!p) {
            return `
                <div class="page" style="text-align:center; padding:100px;">
                    <h2 style="font-family:'Cinzel'; color:var(--accent);">Nenhum Herói Selecionado</h2>
                    <button class="btn btn-primary" data-action="goBack">Voltar para Monitoria</button>
                </div>
            `;
        }

        const heroSpells = [];
        if (p.spells) {
            Object.entries(p.spells).forEach(([lvlKey, spellListStr]) => {
                if (!spellListStr) return;
                const lvl = parseInt(lvlKey.replace('lvl', '')) || 0;
                const lines = spellListStr.split('\n').map(l => l.trim()).filter(Boolean);
                lines.forEach(name => {
                    const dbSpell = spellsData.cantrips?.find(s => s.name.toLowerCase() === name.toLowerCase()) || 
                                    Object.values(spellsData.spellsByLevel || {}).flat().find(s => s.name.toLowerCase() === name.toLowerCase());
                    
                    heroSpells.push({
                        name: name,
                        level: lvl,
                        dbSpell: dbSpell || null
                    });
                });
            });
        }

        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const getMod = (v) => Math.floor(((parseInt(v) || 10) - 10) / 2);
        
        // Vitals calculation
        const lvl = parseInt(p.level) || 1;
        const profBonus = Math.floor((lvl - 1) / 4) + 2;
        const acVal = p.ac || (10 + getMod(stats.dex));
        const initVal = getMod(stats.dex);
        const hitDie = this._getHitDie(p.class); // B-01: dado de vida correto por classe
        
        // Passive scores helper
        const getPassiveScore = (skillKey, statKey) => {
            const hasProf = p.skills?.some(s => s.toLowerCase() === skillKey.toLowerCase());
            return 10 + getMod(stats[statKey]) + (hasProf ? profBonus : 0);
        };
        
        const passivePerception = getPassiveScore('perception', 'wis');
        const passiveInvestigation = getPassiveScore('investigation', 'int');
        const passiveInsight = getPassiveScore('insight', 'wis');

        // Defensive local variables to avoid mutating frozen state
        const deathSuccess = p.deathSaves?.success || [false, false, false];
        const deathFailure = p.deathSaves?.failure || [false, false, false];
        const coins = p.coins || { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 };
        const hitDiceCurrent = p.hitDiceCurrent !== undefined ? p.hitDiceCurrent : lvl;

        // Skills definition list
        const skillList = [
            { key: 'athletics', name: 'Atletismo (FOR)', stat: 'str' },
            { key: 'acrobatics', name: 'Acrobacia (DES)', stat: 'dex' },
            { key: 'sleightOfHand', name: 'Prestidigitação (DES)', stat: 'dex' },
            { key: 'stealth', name: 'Furtividade (DES)', stat: 'dex' },
            { key: 'arcana', name: 'Arcanismo (INT)', stat: 'int' },
            { key: 'history', name: 'História (INT)', stat: 'int' },
            { key: 'investigation', name: 'Investigação (INT)', stat: 'int' },
            { key: 'nature', name: 'Natureza (INT)', stat: 'int' },
            { key: 'religion', name: 'Religião (INT)', stat: 'int' },
            { key: 'animalHandling', name: 'Adestrar Animais (SAB)', stat: 'wis' },
            { key: 'insight', name: 'Intuição (SAB)', stat: 'wis' },
            { key: 'medicine', name: 'Medicina (SAB)', stat: 'wis' },
            { key: 'perception', name: 'Percepção (SAB)', stat: 'wis' },
            { key: 'survival', name: 'Sobrevivência (SAB)', stat: 'wis' },
            { key: 'deception', name: 'Enganação (CAR)', stat: 'cha' },
            { key: 'intimidation', name: 'Intimidação (CAR)', stat: 'cha' },
            { key: 'performance', name: 'Atuação (CAR)', stat: 'cha' },
            { key: 'persuasion', name: 'Persuasão (CAR)', stat: 'cha' }
        ];

        // Saving throws definition list
        const savesList = [
            { key: 'str', name: 'Força (FOR)', stat: 'str' },
            { key: 'dex', name: 'Destreza (DES)', stat: 'dex' },
            { key: 'con', name: 'Constituição (CON)', stat: 'con' },
            { key: 'int', name: 'Inteligência (INT)', stat: 'int' },
            { key: 'wis', name: 'Sabedoria (SAB)', stat: 'wis' },
            { key: 'cha', name: 'Carisma (CAR)', stat: 'cha' }
        ];

        // Spellcasting DC and Attack
        const spellStat = p.class?.toLowerCase().includes('mago') ? 'int' : 
                            (p.class?.toLowerCase().includes('druida') || p.class?.toLowerCase().includes('clérigo') || p.class?.toLowerCase().includes('patrulheiro')) ? 'wis' : 'cha';
        const spellDC = 8 + profBonus + getMod(stats[spellStat]);
        const spellAttack = profBonus + getMod(stats[spellStat]);
        let popupHTML = '';
        if (this._activePopupSpell) {
            const spell = this._activePopupSpell;
            const isCantrip = spell.level === 0;
            const isAttack = spell.type === 'dano' || spell.baseDamage;
            
            let glowClass = 'circle-glow';
            if (isCantrip) glowClass = 'cantrip-glow';
            else if (isAttack) glowClass = 'attack-glow';

            const pinnedClass = this._popupMode === 'click' ? 'pinned' : '';
            
            popupHTML = `
                <div class="magic-popup ${glowClass} ${pinnedClass}" 
                     style="left: ${this._popupPosition.x}px; top: ${this._popupPosition.y}px;">
                    ${this._getSpellPopupHTML(spell)}
                </div>
            `;
        }

        return `
            <div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out; padding-bottom:50px;">
                <style>
                    .interactive-roll-card {
                        cursor: pointer !important;
                        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }
                    .interactive-roll-card:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 0 20px rgba(197, 160, 89, 0.45) !important;
                        border-color: var(--accent) !important;
                        background: rgba(197, 160, 89, 0.06) !important;
                    }
                    .interactive-roll-row {
                        cursor: pointer !important;
                        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }
                    .interactive-roll-row:hover {
                        box-shadow: 0 0 12px rgba(197, 160, 89, 0.25) !important;
                        border-color: var(--accent) !important;
                        background: rgba(197, 160, 89, 0.08) !important;
                        transform: scale(1.02);
                    }
                    .roll-modal-btn {
                        background: rgba(15, 15, 20, 0.85);
                        border: 1px solid rgba(255,255,255,0.08);
                        color: var(--text-main);
                        padding: 14px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 700;
                        font-size: 0.9rem;
                        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 12px;
                        width: 100%;
                    }
                    .roll-modal-btn:hover {
                        border-color: var(--accent);
                        background: rgba(197, 160, 89, 0.15);
                        color: var(--accent);
                        box-shadow: 0 0 12px rgba(197, 160, 89, 0.3);
                        transform: translateY(-2px);
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                </style>

                <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                    <button class="btn btn-ghost" data-action="goBack"><i class="fa-solid fa-arrow-left"></i> Voltar para Monitoria</button>
                    
                    <!-- Tabs Selection (Olho do Mestre vs Ficha) -->
                    <div style="display:flex; gap:8px; background:rgba(0,0,0,0.4); padding:4px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin: 0 auto;">
                        <button class="btn btn-sm ${this._activeTab === 'sheet' ? 'btn-primary' : 'btn-ghost'}" data-action="setMainTab" data-tab="sheet" style="font-family:'Cinzel', serif; font-size:0.75rem; font-weight:bold; border-radius:8px; padding:6px 16px; border:none; display:flex; align-items:center; gap:6px;">
                            🛡️ Ficha do Herói
                        </button>
                        <button class="btn btn-sm ${this._activeTab === 'challenges' ? 'btn-primary' : 'btn-ghost'}" data-action="setMainTab" data-tab="challenges" style="font-family:'Cinzel', serif; font-size:0.75rem; font-weight:bold; border-radius:8px; padding:6px 16px; border:none; display:flex; align-items:center; gap:6px; color:${this._activeTab === 'challenges' ? '#fff' : 'var(--accent)'}; border-color:${this._activeTab === 'challenges' ? 'var(--accent)' : 'transparent'};">
                            👁️ Desafios (Mestre)
                        </button>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-ghost" style="border:1px solid rgba(255,255,255,0.15);" data-action="toggleShortRest"><i class="fa-solid fa-bed"></i> Descanso Curto</button>
                        <button class="btn btn-ghost" style="border:1px solid rgba(197,160,89,0.3); color:var(--accent);" data-action="triggerPortraitUpload"><i class="fa-solid fa-image"></i> Mudar Retrato</button>
                        <button class="btn btn-primary" data-action="printSheet"><i class="fa-solid fa-print"></i> Imprimir Ficha 5e</button>
                    </div>
                </div>
                <!-- Portrait Upload Input (hidden) -->
                <input type="file" id="portrait-upload-input" accept="image/*" style="display:none;" data-action="handlePortraitUpload">

                <!-- ════ D&D 5E ULTRA HIGH FIDELITY LAYOUT ════ -->
                ${this._activeTab === 'challenges' ? this._renderChallengesTab(p, stats, profBonus) : `
                <div class="legacy-sheet-container" style="background:var(--bg-main); color:var(--text-main); font-family:'Outfit', sans-serif; padding:30px; border-radius:20px; border:1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    
                    <!-- HEADER SECTION -->
                    <div style="display:flex; border-bottom:3px solid var(--accent); padding-bottom:20px; margin-bottom:25px; gap:25px; align-items:flex-end; flex-wrap:wrap;">
                        <div style="width:130px; height:130px; border:3px solid var(--accent); border-radius:12px; background:url('${p.portraitData || 'assets/parchment.png'}') center/cover; box-shadow: 0 0 15px rgba(197, 160, 89, 0.25); cursor:pointer; position:relative; overflow:hidden;" data-action="triggerPortraitUpload" title="Clique para alterar retrato">
                            <div style="position:absolute; inset:0; background:rgba(0,0,0,0); display:flex; align-items:center; justify-content:center; transition:background 0.2s;" class="portrait-hover-overlay">
                                <i class="fa-solid fa-camera" style="color:rgba(255,255,255,0); font-size:1.5rem; transition:color 0.2s;"></i>
                            </div>
                        </div>
                        <style>.portrait-hover-overlay:hover { background:rgba(0,0,0,0.45) !important; } .portrait-hover-overlay:hover i { color:rgba(255,255,255,0.9) !important; }</style>
                        <div style="flex:1; min-width:250px;">
                            <h1 style="margin:0; font-size:2.8rem; font-family:'Cinzel'; color:var(--accent); text-transform:uppercase; letter-spacing:1px; line-height:1.1;">${p.name}</h1>
                            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-dim); letter-spacing:3px; font-weight:800;">Nome do Personagem</span>
                        </div>
                        <div style="flex:2; display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:15px; font-size:0.85rem; width:100%;">
                            <div class="card glass-accent" style="padding:12px 8px; text-align:center; background:rgba(0,0,0,0.25);"><strong style="color:var(--accent); font-size:0.65rem; letter-spacing:1px;">CLASSE / NÍVEL</strong><br><span style="font-weight:800; font-size:1rem;">${p.class} ${lvl}</span></div>
                            <div class="card glass-accent" style="padding:12px 8px; text-align:center; background:rgba(0,0,0,0.25);"><strong style="color:var(--accent); font-size:0.65rem; letter-spacing:1px;">RAÇA / SUBRAÇA</strong><br><span style="font-weight:800; font-size:1rem;">${p.race || 'Humana'}</span></div>
                            <div class="card glass-accent" style="padding:12px 8px; text-align:center; background:rgba(0,0,0,0.25);"><strong style="color:var(--accent); font-size:0.65rem; letter-spacing:1px;">EXPERIÊNCIA</strong><br><span style="font-weight:800; font-size:1rem;">${p.xp || 0} XP</span></div>
                        </div>
                    </div>

                    <!-- CORE VITALS GRID -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:30px;">
                        <div class="card glass-accent" style="text-align:center; padding:15px 10px; border-top: 3px solid var(--accent);">
                            <div style="font-size:2.2rem; font-weight:900; font-family:'Cinzel';">${acVal}</div>
                            <div style="font-size:0.65rem; color:var(--accent); font-weight:800; letter-spacing:1px; margin-top:4px;">🛡️ CLASSE DE ARMADURA</div>
                        </div>
                        <div class="card glass-accent interactive-roll-card" data-action="clickInitiative" data-bonus="${initVal}" style="text-align:center; padding:15px 10px; border-top: 3px solid var(--info);" title="Clique para rolar Iniciativa">
                            <div style="font-size:2.2rem; font-weight:900; font-family:'Cinzel';">${initVal >= 0 ? '+' : ''}${initVal}</div>
                            <div style="font-size:0.65rem; color:var(--info); font-weight:800; letter-spacing:1px; margin-top:4px;">⚡ INICIATIVA</div>
                        </div>
                        <div class="card glass-accent" style="text-align:center; padding:15px 10px; border-top: 3px solid var(--success);">
                            <div style="font-size:2.2rem; font-weight:900; font-family:'Cinzel';">${p.speed || 30}ft</div>
                            <div style="font-size:0.65rem; color:var(--success); font-weight:800; letter-spacing:1px; margin-top:4px;">👣 DESLOCAMENTO</div>
                        </div>
                        <div class="card glass-accent" style="text-align:center; padding:15px 10px; background:rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-top: 3px solid var(--danger);">
                            <div style="font-size:2.2rem; font-weight:900; color:var(--danger); font-family:'Cinzel';">${p.hp?.current} / ${p.hp?.max}</div>
                            <div style="font-size:0.65rem; color:var(--danger); font-weight:800; letter-spacing:1px; margin-top:4px;">❤️ PONTOS DE VIDA ATUAIS</div>
                        </div>
                    </div>

                    <!-- THREE COLUMN SHEET LAYOUT -->
                    <div style="display:grid; grid-template-columns: 140px 340px 1fr; gap:25px; align-items:start; flex-wrap:wrap;">
                        
                        <!-- COLUMN 1: ATTRIBUTES & PASSIVES -->
                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <!-- Attributes List -->
                            ${Object.entries(stats).map(([s, v]) => `
                                <div class="card glass-accent interactive-roll-card" data-action="clickAttribute" data-attr="${s}" data-val="${v}" style="height:105px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; padding-top:12px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.05);" title="Clique para rolar teste de ${s.toUpperCase()}">
                                    <div style="font-size:0.65rem; font-weight:900; text-transform:uppercase; color:var(--accent); letter-spacing:1px;">${s}</div>
                                    <div style="font-size:1.8rem; font-weight:900; margin-top:2px;">${v}</div>
                                    <div style="position:absolute; bottom:-12px; background:var(--bg-main); border:2px solid var(--accent); border-radius:50%; width:38px; height:32px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1rem; box-shadow:0 3px 6px rgba(0,0,0,0.5);">
                                        ${getMod(v) >= 0 ? '+' : ''}${getMod(v)}
                                    </div>
                                </div>
                            `).join('')}

                            <!-- Passives Summary -->
                            <div class="card glass-accent" style="padding:15px 10px; margin-top:20px; display:flex; flex-direction:column; gap:10px; background:rgba(0,0,0,0.3); border:1px dashed rgba(197, 160, 89, 0.35);">
                                <div style="font-size:0.6rem; font-weight:900; color:var(--accent); display:flex; align-items:center; justify-content:center; gap:4px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:5px; text-transform:uppercase;">
                                    <span>Sensorial & Percepção</span>
                                    <button class="btn btn-ghost btn-sm" style="padding:0 5px; height:auto; color:var(--accent); opacity:0.8;" data-action="showSensoryInfo" title="O que é isso?"><i class="fa-solid fa-circle-question" style="font-size:0.75rem;"></i></button>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">👁️ Percepção Passiva</span><strong style="color:var(--accent);">${passivePerception}</strong></div>
                                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🔎 Investigação Pass.</span><strong style="color:var(--info);">${passiveInvestigation}</strong></div>
                                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🧠 Intuição Passiva</span><strong style="color:var(--success);">${passiveInsight}</strong></div>
                            </div>
                        </div>
                        
                        <!-- COLUMN 2: PROFICIENCY, SAVING THROWS & ALL 18 SKILLS -->
                        <div style="display:flex; flex-direction:column; gap:20px;">
                            <!-- Proficiency Card -->
                            <div class="card glass-accent" style="padding:15px; display:flex; align-items:center; justify-content:space-between; background:rgba(197, 160, 89, 0.05); border:1px solid rgba(197, 160, 89, 0.2);">
                                <span style="font-weight:900; font-size:0.8rem; letter-spacing:1px; color:var(--accent); font-family:'Cinzel';">BÔNUS DE PROFICIÊNCIA</span>
                                <div style="font-size:1.4rem; font-weight:900; background:rgba(0,0,0,0.3); border:1.5px solid var(--accent); width:45px; height:35px; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 5px rgba(0,0,0,0.5);">
                                    +${profBonus}
                                </div>
                            </div>

                            <!-- Saving Throws -->
                            <div class="card glass-accent" style="padding:20px; background:rgba(0,0,0,0.25);">
                                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:5px; color:var(--accent); font-family:'Cinzel'; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-shield-halved" style="color:var(--accent);"></i> SALVAGUARDAS
                                </div>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.8rem;">
                                    ${savesList.map(item => {
                                        const isProf = Array.isArray(p.savingThrows) 
                                            ? p.savingThrows.some(s => s.toLowerCase() === item.key.toLowerCase())
                                            : !!p.savingThrows?.[item.key];
                                        
                                        const mod = getMod(stats[item.stat]);
                                        const totalSave = mod + (isProf ? profBonus : 0);
                                        return `
                                            <div class="interactive-roll-row" data-action="clickSave" data-save="${item.key}" data-bonus="${totalSave}" data-name="${item.name}" style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.04);" title="Rolar Salvaguarda de ${item.name}">
                                                <div style="display:flex; align-items:center; gap:6px;">
                                                    <i class="fa-${isProf ? 'solid' : 'regular'} fa-circle" style="color:${isProf ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}; font-size:0.65rem;"></i>
                                                    <span>${item.name}</span>
                                                </div>
                                                <strong style="color:${isProf ? 'var(--accent)' : 'inherit'};">${totalSave >= 0 ? '+' : ''}${totalSave}</strong>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>

                            <!-- Skills (Official Complete D&D 5e Table of 18 Skills) -->
                            <div class="card glass-accent" style="padding:20px; background:rgba(0,0,0,0.25);">
                                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:5px; color:var(--accent); font-family:'Cinzel'; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-list-check" style="color:var(--accent);"></i> PERÍCIAS & TESTES DE HABILIDADE
                                </div>
                                <div style="display:flex; flex-direction:column; gap:6px; max-height:430px; overflow-y:auto; padding-right:5px; scrollbar-width:thin; font-size:0.8rem;">
                                    ${skillList.map(item => {
                                        const isProf = p.skills?.some(s => s.toLowerCase() === item.key.toLowerCase());
                                        const mod = getMod(stats[item.stat]);
                                        const totalSkill = mod + (isProf ? profBonus : 0);
                                        return `
                                            <div class="interactive-roll-row" data-action="clickSkill" data-skill="${item.key}" data-bonus="${totalSkill}" data-name="${item.name}" style="display:flex; align-items:center; justify-content:space-between; background:${isProf ? 'rgba(197, 160, 89, 0.05)' : 'rgba(255,255,255,0.01)'}; padding:6px 10px; border-radius:6px; border:1px solid ${isProf ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.03)'};" title="Rolar Perícia ${item.name}">
                                                <div style="display:flex; align-items:center; gap:8px;">
                                                    <i class="fa-${isProf ? 'solid' : 'regular'} fa-circle" style="color:${isProf ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}; font-size:0.6rem;"></i>
                                                    <span style="opacity:${isProf ? '1' : '0.8'};">${item.name}</span>
                                                </div>
                                                <strong style="color:${isProf ? 'var(--accent)' : 'inherit'}; font-weight:800;">${totalSkill >= 0 ? '+' : ''}${totalSkill}</strong>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- COLUMN 3: VITAL CONTROLS, ATTACKS, SPELLS, INVENTORY, FEATURES -->
                        <div style="display:flex; flex-direction:column; gap:20px;">
                            
                            <!-- INTERACTIVE COMBAT CONTROLS (Death Saves & Hit Dice) -->
                            <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:20px;">
                                <!-- Death Saves -->
                                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); border-top:3px solid var(--danger);">
                                    <div style="font-size:0.65rem; color:var(--danger); font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:6px;">
                                        <span>💀 TESTES CONTRA A MORTE</span>
                                        <button class="btn btn-ghost btn-sm" style="padding:0 5px; height:auto; color:var(--danger); opacity:0.8;" data-action="showDeathInfo" title="O que é isso?"><i class="fa-solid fa-circle-question" style="font-size:0.8rem;"></i></button>
                                    </div>
                                    <div style="display:flex; flex-direction:column; gap:6px; font-size:0.8rem;">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span>Sucessos</span>
                                            <div style="display:flex; gap:6px;">
                                                ${deathSuccess.map((checked, i) => `
                                                    <i class="fa-${checked ? 'solid' : 'regular'} fa-heart" 
                                                       style="color:${checked ? 'var(--success)' : 'rgba(255,255,255,0.2)'}; cursor:pointer;" 
                                                       data-action="toggleDeathSave" data-type="success" data-index="${i}"></i>
                                                `).join('')}
                                            </div>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span>Falhas</span>
                                            <div style="display:flex; gap:6px;">
                                                ${deathFailure.map((checked, i) => `
                                                    <i class="fa-${checked ? 'solid' : 'regular'} fa-circle-xmark" 
                                                       style="color:${checked ? 'var(--danger)' : 'rgba(255,255,255,0.2)'}; cursor:pointer;" 
                                                       data-action="toggleDeathSave" data-type="failure" data-index="${i}"></i>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Hit Dice -->
                                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); display:flex; flex-direction:column; align-items:center; justify-content:center; border-top:3px solid var(--info);">
                                    <div style="font-size:0.65rem; color:var(--info); font-weight:900; letter-spacing:1px; text-transform:uppercase; margin-bottom:5px;">
                                        🎲 DADO DE VIDA
                                    </div>
                                    <div style="font-size:1.6rem; font-weight:900; font-family:'Cinzel'; cursor:pointer; display:flex; align-items:center; gap:8px;" data-action="toggleHitDie" title="Clique para consumir dado de vida">
                                        ${hitDiceCurrent} / ${lvl} <span style="font-size:0.75rem; color:var(--accent);">${hitDie}</span>
                                    </div>
                                    <div style="font-size:0.55rem; color:var(--text-dim); margin-top:4px;">Clique para gastar / recuperar</div>
                                </div>
                            </div>

                            <!-- ATTACKS & SPELLS SECTION -->
                            <div class="card glass-accent" style="padding:22px; background:rgba(0,0,0,0.25); border: 1px solid rgba(197, 160, 89, 0.2);">
                                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:5px; color:var(--accent); font-family:'Cinzel'; font-size:0.9rem; display:flex; justify-content:space-between; align-items:center;">
                                    <span><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:8px;"></i> ATAQUES & MAGIAS</span>
                                    <div style="display:flex; gap:10px; font-size:0.7rem; font-family:'Outfit'; font-weight:normal; opacity:0.8;">
                                        <span>CD CD: <strong>${spellDC}</strong></span>
                                        <span>•</span>
                                        <span>Ataque Místico: <strong>+${spellAttack}</strong></span>
                                    </div>
                                </div>

                                <!-- Sub-tabs -->
                                <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
                                    <button type="button" class="btn btn-ghost btn-sm" data-action="setAttacksTab" data-tab="weapons" style="font-size:0.7rem; padding:4px 12px; border-radius:6px; color: ${this._selectedAttacksTab === 'weapons' ? 'var(--accent)' : 'var(--text-dim)'}; border: 1px solid ${this._selectedAttacksTab === 'weapons' ? 'rgba(197,160,89,0.3)' : 'transparent'}; background: ${this._selectedAttacksTab === 'weapons' ? 'rgba(197,160,89,0.08)' : 'transparent'}; font-family: 'Cinzel', serif; font-weight: bold;">
                                        ⚔️ Armas & Ataques
                                    </button>
                                    <button type="button" class="btn btn-ghost btn-sm" data-action="setAttacksTab" data-tab="spells" style="font-size:0.7rem; padding:4px 12px; border-radius:6px; color: ${this._selectedAttacksTab === 'spells' ? 'var(--accent)' : 'var(--text-dim)'}; border: 1px solid ${this._selectedAttacksTab === 'spells' ? 'rgba(197,160,89,0.3)' : 'transparent'}; background: ${this._selectedAttacksTab === 'spells' ? 'rgba(197,160,89,0.08)' : 'transparent'}; font-family: 'Cinzel', serif; font-weight: bold;">
                                        🔮 Magias & Truques (${heroSpells.length})
                                    </button>
                                </div>

                                <div id="attacks-weapon-list" style="display:${this._selectedAttacksTab === 'weapons' ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
                                    ${p.attacks && p.attacks.length > 0 ? p.attacks.map(a => `
                                        <div class="glass interactive-roll-row" data-action="clickAttack" data-name="${a.name}" data-bonus="${a.bonus}" data-damage="${a.damage || '1d6'}" style="padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2);" title="Rolar Ataque e Dano de ${a.name}">
                                            <div>
                                                <strong style="color:var(--text-main); font-size:0.85rem;">${a.name}</strong>
                                                <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">Bônus de Acerto: +${a.bonus}</div>
                                            </div>
                                            <div style="text-align:right;">
                                                <span style="font-weight:900; color:var(--accent); font-size:0.9rem;">${a.damage || '1d6'}</span>
                                                <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">Dano</div>
                                            </div>
                                        </div>
                                    `).join('') : `
                                        <div style="opacity:0.4; font-size:0.75rem; text-align:center; padding:10px;">
                                            Nenhum ataque de arma cadastrado.
                                        </div>
                                    `}
                                </div>

                                <div id="attacks-spell-list" style="display:${this._selectedAttacksTab === 'spells' ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
                                    ${heroSpells.length > 0 ? heroSpells.map(hs => {
                                        const db = hs.dbSpell;
                                        const typeIcons = { 'dano': '⚔️', 'controle': '🔗', 'utilidade': '✨', 'cura': '🏥' };
                                        const icon = db ? (typeIcons[db.type] || '📜') : '🔮';
                                        const isCantrip = hs.level === 0;
                                        const levelLabel = isCantrip ? 'Truque' : `${hs.level}º Círc`;
                                        const damageDmg = db?.baseDamage ? `${db.baseDamage} ${db.damageType || ''}` : '';
                                        const actionLbl = db?.actionType === 'bonusAction' ? 'Ação Bônus' : (db?.actionType === 'reaction' ? 'Reação' : 'Ação');
                                        
                                        return `
                                            <div class="glass interactive-roll-row spell-trigger-card" 
                                                 data-action="rollHeroSpell" 
                                                 data-spell-name="${hs.name}" 
                                                 data-spell-level="${hs.level}"
                                                 style="padding:10px 14px; border-radius:10px; border:1px solid rgba(197,160,89,0.15); display:flex; justify-content:space-between; align-items:center; background:rgba(197,160,89,0.02); position:relative;" 
                                                 title="Clique para rolar / Pressione o botão (i) para detalhes">
                                                
                                                <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                                                    <span style="font-size:1.1rem; color:var(--accent);">${icon}</span>
                                                    <div style="min-width:0; flex:1;">
                                                        <div style="display:flex; align-items:center; gap:8px;">
                                                            <strong style="color:var(--text-main); font-size:0.85rem; font-family:'Cinzel'; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${hs.name}</strong>
                                                            <span style="background:rgba(255,255,255,0.08); font-size:0.6rem; padding:1px 5px; border-radius:4px; color:var(--text-dim); flex-shrink:0;">${levelLabel}</span>
                                                        </div>
                                                        <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                                                            ${actionLbl} | Alcance: ${db?.range || 'Toque'}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div style="text-align:right; flex-shrink:0; display:flex; align-items:center; gap:12px;">
                                                    ${damageDmg ? `
                                                        <div style="text-align:right;">
                                                            <span style="font-weight:900; color:var(--accent); font-size:0.95rem;">${damageDmg}</span>
                                                            <div style="font-size:0.6rem; color:var(--text-dim);">Fórmula</div>
                                                        </div>
                                                    ` : (db?.savingThrow ? `
                                                        <div style="text-align:right;">
                                                            <span style="font-weight:900; color:var(--info); font-size:0.85rem;">CD ${spellDC} ${db.savingThrow}</span>
                                                            <div style="font-size:0.6rem; color:var(--text-dim);">Salvaguarda</div>
                                                        </div>
                                                    ` : `
                                                        <div style="text-align:right; font-size:0.65rem; color:var(--text-dim);">Efeito Automático</div>
                                                    `)}
                                                    
                                                    <!-- Info hover trigger -->
                                                    <button type="button" class="btn btn-ghost btn-sm spell-info-trigger" 
                                                            data-action="toggleHeroSpellPopup" 
                                                            data-spell-name="${hs.name}" 
                                                            style="padding: 4px; height:auto; width:auto; min-width:0; color:var(--accent); opacity:0.8; font-size:0.8rem;">
                                                        <i class="fa-solid fa-circle-info"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        `;
                                    }).join('') : `
                                        <div style="opacity:0.4; font-size:0.75rem; text-align:center; padding:10px;">
                                            Nenhuma magia descrita no Grimório deste herói.
                                        </div>
                                    `}
                                </div>
                            </div>

                            <!-- EQUIPMENT & MONEY POUCH -->
                            <div class="card glass-accent" style="padding:22px; background:rgba(0,0,0,0.25);">
                                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:5px; color:var(--accent); font-family:'Cinzel'; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-bag-shopping" style="color:var(--accent);"></i> INVENTÁRIO & BOLSA DE MOEDAS
                                </div>

                                <!-- Currency pouch -->
                                <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-bottom:15px; background:rgba(0,0,0,0.3); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.04);">
                                    <div style="text-align:center;">
                                        <div style="font-size:0.55rem; color:#b87333; font-weight:800; text-transform:uppercase;">CP (Cobre)</div>
                                        <input type="number" class="form-input" style="padding:2px; font-size:0.75rem; text-align:center; font-weight:800; border:none; background:transparent; width:100%; color:#b87333;" data-action="changeCoin" data-coin="cp" value="${coins.cp}">
                                    </div>
                                    <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.06);">
                                        <div style="font-size:0.55rem; color:#aaa9ad; font-weight:800; text-transform:uppercase;">SP (Prata)</div>
                                        <input type="number" class="form-input" style="padding:2px; font-size:0.75rem; text-align:center; font-weight:800; border:none; background:transparent; width:100%; color:#aaa9ad;" data-action="changeCoin" data-coin="sp" value="${coins.sp}">
                                    </div>
                                    <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.06);">
                                        <div style="font-size:0.55rem; color:#d4af37; font-weight:800; text-transform:uppercase;">EP (Electro)</div>
                                        <input type="number" class="form-input" style="padding:2px; font-size:0.75rem; text-align:center; font-weight:800; border:none; background:transparent; width:100%; color:#d4af37;" data-action="changeCoin" data-coin="ep" value="${coins.ep}">
                                    </div>
                                    <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.06);">
                                        <div style="font-size:0.55rem; color:var(--accent); font-weight:800; text-transform:uppercase;">GP (Ouro)</div>
                                        <input type="number" class="form-input" style="padding:2px; font-size:0.75rem; text-align:center; font-weight:800; border:none; background:transparent; width:100%; color:var(--accent);" data-action="changeCoin" data-coin="gp" value="${coins.gp}">
                                    </div>
                                    <div style="text-align:center; border-left:1px solid rgba(255,255,255,0.06);">
                                        <div style="font-size:0.55rem; color:#e5e4e2; font-weight:800; text-transform:uppercase;">PP (Platina)</div>
                                        <input type="number" class="form-input" style="padding:2px; font-size:0.75rem; text-align:center; font-weight:800; border:none; background:transparent; width:100%; color:#e5e4e2;" data-action="changeCoin" data-coin="pp" value="${coins.pp}">
                                    </div>
                                </div>

                                <div style="font-size:0.85rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.15); padding:10px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.03);">
                                    ${p.equipment?.items?.map ? p.equipment.items.map(i => `• ${i.qty}x <strong>${i.name}</strong> (${i.weight}kg)`).join('\n') : p.equipment?.items || 'Inventário vazio.'}
                                </div>
                                ${p.equipment?.notes ? `<div style="font-size:0.8rem; margin-top:8px; opacity:0.6; font-style:italic;">* ${p.equipment.notes}</div>` : ''}
                            </div>
                            
                            <!-- FEATURES & CLASSES TRAITS -->
                            <div class="card glass-accent" style="padding:22px; background:rgba(0,0,0,0.25);">
                                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:5px; color:var(--accent); font-family:'Cinzel'; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-book-open-reader" style="color:var(--accent);"></i> TRAÇOS & ANOTAÇÕES DE HISTÓRIA
                                </div>
                                <div style="font-size:0.85rem; white-space:pre-wrap; opacity:0.85; line-height:1.6; background:rgba(0,0,0,0.15); padding:12px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.03);">
                                    ${p.roleplay?.traits || 'Nenhuma história ou traço de personalidade registrado.'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `}
            </div>
            ${popupHTML}
            ${this._renderChallengeResultPopup()}
            
            <!-- ════ ROLL HISTORY DOCK ════ -->
            ${this._rollHistory.length > 0 ? `
            <div style="position:fixed; bottom:20px; right:20px; z-index:5000; display:flex; flex-direction:column-reverse; gap:6px; pointer-events:none;">
                ${this._rollHistory.map((r, i) => `
                    <div style="
                        background:rgba(10,12,16,0.92);
                        border:1px solid ${r.color}44;
                        border-left:3px solid ${r.color};
                        border-radius:10px;
                        padding:8px 14px;
                        font-family:'JetBrains Mono',monospace;
                        font-size:0.75rem;
                        display:flex;
                        align-items:center;
                        gap:12px;
                        backdrop-filter:blur(12px);
                        opacity:${1 - i * 0.18};
                        transform:scale(${1 - i * 0.04});
                        box-shadow:0 4px 15px rgba(0,0,0,0.5), 0 0 8px ${r.color}22;
                        min-width:220px;
                        ${i === 0 && this._showRollModal ? 'animation: rollSlideIn 0.4s cubic-bezier(0.16,1,0.3,1);' : ''}
                    ">
                        <div style="font-size:1.5rem; line-height:1;">${r.icon.split(' ')[0]}</div>
                        <div style="flex:1;">
                            <div style="font-size:0.6rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">${r.label}</div>
                            <div style="color:${r.color}; font-weight:900; font-size:1.1rem; line-height:1.2;">${r.total >= 0 ? (r.total > 0 ? '+' : '') : ''}${r.total}</div>
                        </div>
                        <div style="text-align:right; color:#475569; font-size:0.65rem;">
                            <div style="color:#94a3b8;">d20: <strong style="color:${r.color};">${r.roll}</strong></div>
                            <div>mod: ${r.bonus >= 0 ? '+' : ''}${r.bonus}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <style>
                @keyframes rollSlideIn {
                    from { transform: translateX(40px) scale(0.9); opacity:0; }
                    to   { transform: translateX(0) scale(1); opacity:1; }
                }
            </style>
            ` : ''}
        `;
    }

    goBack() {
        TOME.store.update(s => s.activeTab = 'herohub');
    }

    printSheet() {
        window.print();
    }

    // ── 3.1: Upload de Retrato ──
    triggerPortraitUpload() {
        const input = this.$('#portrait-upload-input');
        if (input) input.click();
    }

    handlePortraitUpload(e, el) {
        const file = el.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const base64 = evt.target.result;
            TOME.store.update(s => {
                s.players = (s.players || []).map(player => {
                    if (player.id === s.viewingHeroId) {
                        return { ...player, portraitData: base64 };
                    }
                    return player;
                });
            });
            Toast.show('✨ Retrato do herói atualizado!', 'success');
            this.render();
        };
        reader.readAsDataURL(file);
    }

    showDeathInfo() {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(0, 0, 0, 0.75)';
        modalDiv.style.backdropFilter = 'blur(6px)';
        modalDiv.style.zIndex = '30000';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.padding = '20px';
        modalDiv.style.animation = 'fadeIn 0.25s ease-out';

        modalDiv.innerHTML = `
            <div class="card glass-accent" style="width: 100%; max-width: 450px; border-top: 4px solid var(--danger); padding: 0; overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0; font-family: 'Cinzel', serif; color: var(--danger); font-size: 1.2rem; letter-spacing: 1px;">💀 Regras: Testes Contra a Morte</h3>
                    </div>
                    <button style="background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.4rem;" id="close-info-modal">&times;</button>
                </div>
                <div style="padding: 25px; font-size: 0.85rem; line-height: 1.6; color: rgba(255,255,255,0.85); font-family: 'Outfit';">
                    Quando seu Herói cai para <strong>0 Pontos de Vida</strong>, ele fica inconsciente.<br><br>
                    No início de cada um dos seus turnos enquanto estiver a 0 HP, você deve rolar um <strong>d20 puro</strong> (sem modificadores) para lutar pela vida:<br>
                    <ul style="margin: 12px 0; padding-left: 20px;">
                        <li><strong>10 ou mais:</strong> Você marca 1 <span style="color:var(--success); font-weight:bold;">Sucesso</span> (coração).</li>
                        <li><strong>9 ou menos:</strong> Você marca 1 <span style="color:var(--danger); font-weight:bold;">Falha</span> (X).</li>
                    </ul>
                    <strong style="color:var(--success)">• 3 Sucessos:</strong> Você se <strong style="color:var(--info)">ESTABILIZA</strong>! Não precisa mais rolar testes, mas continua com 0 HP e inconsciente.<br>
                    <strong style="color:var(--danger)">• 3 Falhas:</strong> Seu personagem <strong>MORRE</strong> permanentemente.<br><br>
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); color:var(--text-dim);">
                        <strong style="color:var(--accent);">Críticos 🌟</strong><br>
                        • Rolar um <strong>20 Natural</strong> faz você recuperar 1 HP e acordar <strong>imediatamente</strong> no mesmo turno!<br>
                        • Rolar um <strong>1 Natural</strong> infelizmente conta como <strong>DUAS</strong> falhas.
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        const closeModal = () => {
            modalDiv.style.animation = 'fadeOut 0.2s ease-in';
            setTimeout(() => modalDiv.remove(), 200);
        };
        modalDiv.querySelector('#close-info-modal').onclick = closeModal;
        modalDiv.onclick = (e) => { if (e.target === modalDiv) closeModal(); };
    }

    showSensoryInfo() {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(0, 0, 0, 0.75)';
        modalDiv.style.backdropFilter = 'blur(6px)';
        modalDiv.style.zIndex = '30000';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.padding = '20px';
        modalDiv.style.animation = 'fadeIn 0.25s ease-out';

        modalDiv.innerHTML = `
            <div class="card glass-accent" style="width: 100%; max-width: 450px; border-top: 4px solid var(--accent); padding: 0; overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0; font-family: 'Cinzel', serif; color: var(--accent); font-size: 1.2rem; letter-spacing: 1px;">👁️ Sensorial & Percepção</h3>
                    </div>
                    <button style="background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.4rem;" id="close-sensory-modal">&times;</button>
                </div>
                <div style="padding: 25px; font-size: 0.85rem; line-height: 1.6; color: rgba(255,255,255,0.85); font-family: 'Outfit';">
                    Os atributos <strong>Passivos</strong> representam o nível médio e constante da sua atenção ou conhecimento quando você <em>não está</em> ativamente rolando dados.<br><br>
                    O Mestre utiliza esses valores em segredo para saber se você notou algo de forma automática, sem precisar pedir um teste.<br><br>
                    
                    <ul style="margin: 12px 0; padding-left: 0; list-style-type: none;">
                        <li style="margin-bottom:12px;">👁️ <strong>Percepção Passiva:</strong> É o seu "radar" natural. Determina se você nota inimigos furtivos, armadilhas não ocultas ou detalhes do ambiente apenas por estar lá.</li>
                        <li style="margin-bottom:12px;">🔎 <strong>Investigação Passiva:</strong> Sua capacidade automática de deduzir ou juntar pistas visuais. O mestre usa para ver se você deduz o funcionamento de algo instintivamente.</li>
                        <li>🧠 <strong>Intuição Passiva:</strong> Sua habilidade de ler as pessoas. Se alguém mentir para você e o teste de enganação dele for menor que sua intuição passiva, você percebe a mentira!</li>
                    </ul>
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); color:var(--text-dim); margin-top:16px;">
                        <strong style="color:var(--accent);">Cálculo Básico 🧮</strong><br>
                        Os atributos passivos são calculados como: <strong>10 + Modificador do Atributo + (Bônus de Proficiência, se você for proficiente na perícia)</strong>.
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);

        const closeModal = () => {
            modalDiv.style.animation = 'fadeOut 0.2s ease-in';
            setTimeout(() => modalDiv.remove(), 200);
        };
        modalDiv.querySelector('#close-sensory-modal').onclick = closeModal;
        modalDiv.onclick = (e) => { if (e.target === modalDiv) closeModal(); };
    }

    toggleDeathSave(e, el) {
        const type = el.dataset.type;
        const index = parseInt(el.dataset.index);
        TOME.store.update(s => {
            s.players = (s.players || []).map(player => {
                if (player.id === s.viewingHeroId) {
                    const deathSaves = player.deathSaves ? { ...player.deathSaves } : { success: [false, false, false], failure: [false, false, false] };
                    const success = [...(deathSaves.success || [false, false, false])];
                    const failure = [...(deathSaves.failure || [false, false, false])];
                    
                    if (type === 'success') {
                        success[index] = !success[index];
                    } else {
                        failure[index] = !failure[index];
                    }
                    
                    const stateWord = (type === 'success' ? success[index] : failure[index]) ? 'marcado' : 'desmarcado';
                    setTimeout(() => {
                        Toast.show(`Salva-vidas contra morte (${type === 'success' ? 'Sucesso' : 'Falha'} ${index + 1}) ${stateWord}!`, 'info');
                    }, 50);
                    
                    return {
                        ...player,
                        deathSaves: { success, failure }
                    };
                }
                return player;
            });
        });
        this.render();
    }

    toggleHitDie() {
        TOME.store.update(s => {
            s.players = (s.players || []).map(player => {
                if (player.id === s.viewingHeroId) {
                    const lvl = parseInt(player.level) || 1;
                    const current = player.hitDiceCurrent !== undefined ? player.hitDiceCurrent : lvl;
                    const nextVal = current > 0 ? current - 1 : lvl;
                    
                    setTimeout(() => {
                        if (current > 0) Toast.show('Você gastou 1 Dado de Vida (1d8).', 'info');
                        else Toast.show('Dados de Vida totalmente recuperados!', 'success');
                    }, 50);
                    
                    return {
                        ...player,
                        hitDiceCurrent: nextVal
                    };
                }
                return player;
            });
        });
        this.render();
    }

    changeCoin(e, el) {
        const coin = el.dataset.coin;
        const val = parseInt(el.value) || 0;
        TOME.store.update(s => {
            s.players = (s.players || []).map(player => {
                if (player.id === s.viewingHeroId) {
                    const coins = player.coins ? { ...player.coins } : { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
                    coins[coin] = val;
                    return {
                        ...player,
                        coins
                    };
                }
                return player;
            });
        });
    }

    toggleShortRest() {
        TOME.store.update(s => {
            s.players = (s.players || []).map(player => {
                if (player.id === s.viewingHeroId) {
                    const lvl = parseInt(player.level) || 1;
                    const maxHP = player.hp?.max || 10;
                    
                    const diceRoll = Math.floor(Math.random() * 8) + 1; // 1d8
                    const conVal = player.stats?.con || 10;
                    const conMod = Math.floor((conVal - 10) / 2);
                    const healed = Math.max(1, diceRoll + conMod);
                    const hitDieName = this._getHitDie(player.class);
                    
                    const oldHP = player.hp?.current || 0;
                    const newHP = Math.min(maxHP, oldHP + healed);
                    
                    setTimeout(() => {
                        Toast.show(`🌿 Descanso Curto! Curado +${healed} HP (1${hitDieName} + ${conMod})!`, 'success');
                    }, 50);

                    return {
                        ...player,
                        hitDiceCurrent: lvl,
                        deathSaves: { success: [false, false, false], failure: [false, false, false] },
                        hp: { ...(player.hp || { current: 10, max: 10 }), current: newHP }
                    };
                }
                return player;
            });
        });
        this.render();
    }

    // ════════════════════════════════════════════════════════
    // DYNAMIC RPG SESSION INTEGRATION & DICE ROLLING METHODS
    // ════════════════════════════════════════════════════════

    clickInitiative(e, el) {
        const bonus = parseInt(el.dataset.bonus) || 0;
        this.showRollModal({
            title: 'Rolar Iniciativa',
            subtitle: 'Determina sua ordem de combate nesta rodada',
            bonusStr: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            rollCallback: (mode) => {
                this._performRoll('Iniciativa', bonus, mode, 'combat');
            }
        });
    }

    clickAttribute(e, el) {
        const attr = el.dataset.attr;
        const val = parseInt(el.dataset.val) || 10;
        const bonus = Math.floor((val - 10) / 2);
        const attrNames = {
            str: 'Força (FOR)',
            dex: 'Destreza (DES)',
            con: 'Constituição (CON)',
            int: 'Inteligência (INT)',
            wis: 'Sabedoria (SAB)',
            cha: 'Carisma (CAR)'
        };
        const attrName = attrNames[attr.toLowerCase()] || attr.toUpperCase();
        
        this.showRollModal({
            title: `Teste de ${attrName}`,
            subtitle: `Rolar teste bruto para o atributo de ${attrName}`,
            bonusStr: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            rollCallback: (mode) => {
                this._performRoll(`Teste de ${attrName}`, bonus, mode, 'social');
            }
        });
    }

    clickSave(e, el) {
        const bonus = parseInt(el.dataset.bonus) || 0;
        const name = el.dataset.name;
        
        this.showRollModal({
            title: `Salvaguarda: ${name}`,
            subtitle: 'Teste de resistência contra perigos mágicos ou físicos',
            bonusStr: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            rollCallback: (mode) => {
                this._performRoll(`Salvaguarda de ${name}`, bonus, mode, 'combat');
            }
        });
    }

    clickSkill(e, el) {
        const bonus = parseInt(el.dataset.bonus) || 0;
        const name = el.dataset.name;
        
        this.showRollModal({
            title: `Perícia: ${name}`,
            subtitle: 'Teste de perícia especializada do personagem',
            bonusStr: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            rollCallback: (mode) => {
                this._performRoll(`Perícia: ${name}`, bonus, mode, 'social');
            }
        });
    }

    clickAttack(e, el) {
        const name = el.dataset.name;
        const bonus = parseInt(el.dataset.bonus) || 0;
        const damage = el.dataset.damage || '1d6';
        
        this.showRollModal({
            title: `Ataque com ${name}`,
            subtitle: `Rolar jogada de Ataque & Dano combinados`,
            bonusStr: bonus >= 0 ? `+${bonus}` : `${bonus}`,
            rollCallback: (mode) => {
                this._performAttackRoll(name, bonus, damage, mode);
            }
        });
    }

    /**
     * Renders a premium Glassmorphism overlay modal for Advantage/Disadvantage choices
     */
    showRollModal({ title, subtitle, bonusStr, rollCallback }) {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(0, 0, 0, 0.75)';
        modalDiv.style.backdropFilter = 'blur(6px)';
        modalDiv.style.zIndex = '30000';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.padding = '20px';
        modalDiv.style.animation = 'fadeIn 0.25s ease-out';

        modalDiv.innerHTML = `
            <div class="card glass-accent" style="width: 100%; max-width: 420px; border-top: 4px solid var(--accent); padding: 0; overflow: hidden; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
                <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <h3 style="margin: 0; font-family: 'Cinzel', serif; color: var(--accent); font-size: 1.2rem; letter-spacing: 1px;">${title}</h3>
                        <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">${subtitle}</div>
                    </div>
                    <button style="background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.2rem;" id="close-roll-modal">&times;</button>
                </div>
                
                <div style="padding: 25px; display: flex; flex-direction: column; gap: 15px;">
                    <button class="roll-modal-btn" data-mode="normal" style="border-left: 4px solid var(--info);">
                        <i class="fa-solid fa-dice-d20" style="color: var(--info);"></i>
                        <div style="flex: 1; text-align: left;">
                            <strong>Jogada Normal</strong>
                            <div style="font-size: 0.7rem; opacity: 0.7;">Rolar 1d20 + modificador</div>
                        </div>
                        <span style="font-size: 1.1rem; font-weight: 800; color: var(--info);">${bonusStr}</span>
                    </button>
                    
                    <button class="roll-modal-btn" data-mode="advantage" style="border-left: 4px solid var(--success);">
                        <i class="fa-solid fa-dice-d20" style="color: var(--success);"></i>
                        <div style="flex: 1; text-align: left;">
                            <strong>Com Vantagem</strong>
                            <div style="font-size: 0.7rem; opacity: 0.7;">Rolar 2d20 e escolher o MAIOR</div>
                        </div>
                        <span style="font-size: 1.1rem; font-weight: 800; color: var(--success);">${bonusStr}</span>
                    </button>
                    
                    <button class="roll-modal-btn" data-mode="disadvantage" style="border-left: 4px solid var(--danger);">
                        <i class="fa-solid fa-dice-d20" style="color: var(--danger);"></i>
                        <div style="flex: 1; text-align: left;">
                            <strong>Com Desvantagem</strong>
                            <div style="font-size: 0.7rem; opacity: 0.7;">Rolar 2d20 e escolher o MENOR</div>
                        </div>
                        <span style="font-size: 1.1rem; font-weight: 800; color: var(--danger);">${bonusStr}</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);

        const closeModal = () => {
            modalDiv.style.animation = 'fadeOut 0.2s ease-in';
            setTimeout(() => modalDiv.remove(), 200);
        };

        modalDiv.querySelector('#close-roll-modal').onclick = closeModal;
        modalDiv.onclick = (e) => {
            if (e.target === modalDiv) closeModal();
        };

        modalDiv.querySelectorAll('.roll-modal-btn').forEach(btn => {
            btn.onclick = () => {
                const mode = btn.dataset.mode;
                closeModal();
                rollCallback(mode);
            };
        });
    }

    /**
     * Resolves a d20 roll with advantage, disadvantage, or normal rules.
     */
    _rollD20(bonus, mode) {
        const r1 = Math.floor(Math.random() * 20) + 1;
        const r2 = Math.floor(Math.random() * 20) + 1;
        let finalRoll = r1;
        let rollDetails = '';
        
        if (mode === 'advantage') {
            finalRoll = Math.max(r1, r2);
            rollDetails = `[d20(${r1}), d20(${r2})] ➔ Maior (${finalRoll})`;
        } else if (mode === 'disadvantage') {
            finalRoll = Math.min(r1, r2);
            rollDetails = `[d20(${r1}), d20(${r2})] ➔ Menor (${finalRoll})`;
        } else {
            rollDetails = `d20(${r1})`;
        }
        
        const total = finalRoll + bonus;
        const isCrit = finalRoll === 20;
        const isFumble = finalRoll === 1;
        
        return { total, finalRoll, rolls: [r1, r2], isCrit, isFumble, rollDetails };
    }

    /**
     * Performs a standard attribute, skill, or save roll, plays audio, toast, and saves to state.
     */
    _performRoll(actionName, bonus, mode, type = 'social') {
        const { players, viewingHeroId } = this.store.state;
        const p = players?.find(h => h.id === viewingHeroId);
        if (!p) return;

        // Play rolling audio
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');

        const b = parseInt(bonus) || 0;
        const rollRes = this._rollD20(b, mode);

        const modeText = mode === 'advantage' ? 'Vantagem' : (mode === 'disadvantage' ? 'Desvantagem' : 'Normal');
        const sign = b >= 0 ? '+' : '';
        const rollMath = `${rollRes.rollDetails} ${sign}${b} = <strong>${rollRes.total}</strong>`;
        const critText = rollRes.isCrit ? '🌟 <strong>SUCESSO CRÍTICO!</strong> (20 Natural)' : (rollRes.isFumble ? '💀 <strong>FALHA CRÍTICA!</strong> (1 Natural)' : '');

        const rollText = `
            ${critText ? critText + '<br>' : ''}
            🎲 <strong>Modo:</strong> ${modeText}<br>
            📊 <strong>Resultado:</strong> ${rollMath}
        `;

        // Success or impact audio depending on result
        setTimeout(() => {
            if (rollRes.isCrit) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');
            } else if (rollRes.isFumble) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            }
        }, 300);

        // Show Toast
        Toast.show(`🎲 <strong>${p.name}</strong> fez um teste de <strong>${actionName}</strong>!<br>${rollText}`, rollRes.isCrit ? 'success' : (rollRes.isFumble ? 'error' : 'info'));

        // Push to global store timeline
        TOME.store.update(s => {
            const timelineContent = `
                🎲 <strong>Modo:</strong> ${modeText}<br>
                📊 <strong>Resultado total:</strong> <strong>${rollRes.total}</strong> ${critText ? ' (Crítico!)' : ''}<br>
                <span style="opacity: 0.6; font-size: 0.7rem;">Cálculo: ${rollMath}</span>
            `;
            s.journalEntries = [
                ...(s.journalEntries || []),
                {
                    id: Date.now(),
                    timestamp: Date.now(),
                    type: type,
                    title: `${p.name} - ${actionName}`,
                    content: timelineContent
                }
            ];
        });
    }

    /**
     * Performs a combined attack and damage roll, doubles dice on crits, plays sounds, and updates timeline.
     */
    _performAttackRoll(attackName, attackBonus, damageNotation, mode) {
        const { players, viewingHeroId } = this.store.state;
        const p = players?.find(h => h.id === viewingHeroId);
        if (!p) return;

        // Play rolling audio
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');

        // Roll attack (d20)
        const bonus = parseInt(attackBonus) || 0;
        const attackRes = this._rollD20(bonus, mode);

        // Parse/Roll damage
        let finalDamageNotation = damageNotation;
        let isCrit = attackRes.isCrit;
        
        // Classic D&D 5e Crit: Roll twice as many dice
        if (isCrit) {
            const damageMatch = damageNotation.toLowerCase().replace(/\s+/g, '').match(/^(\d+)d(\d+)(.*)$/);
            if (damageMatch) {
                const diceCount = parseInt(damageMatch[1]);
                const diceSides = damageMatch[2];
                const rest = damageMatch[3];
                finalDamageNotation = `${diceCount * 2}d${diceSides}${rest}`;
            }
        }

        const damageRes = Dice.roll(finalDamageNotation);
        
        // Build detailed narrative result
        const modeText = mode === 'advantage' ? 'Vantagem' : (mode === 'disadvantage' ? 'Desvantagem' : 'Normal');
        const rollDetails = attackRes.rollDetails;
        const sign = bonus >= 0 ? '+' : '';
        const attackMath = `${rollDetails} ${sign}${bonus} = <strong>${attackRes.total}</strong>`;
        
        let damageMath = '';
        if (damageRes.error) {
            damageMath = `Erro ao rolar dano (${damageNotation})`;
        } else {
            const dmgSign = damageRes.modifier >= 0 ? '+' : '';
            const rollsJoined = damageRes.rolls.join(' + ');
            damageMath = `[${rollsJoined}] ${dmgSign}${damageRes.modifier} = <strong>${damageRes.total}</strong> de dano (${finalDamageNotation})`;
        }

        const critText = isCrit ? '💥 <strong>ACERTO CRÍTICO!</strong> (Dano de Dados Dobrado!)' : (attackRes.isFumble ? '💀 <strong>FALHA CRÍTICA!</strong> (Erro Automático!)' : '');
        
        const rollText = `
            ${critText ? critText + '<br>' : ''}
            ⚔️ <strong>Ataque (${modeText}):</strong> ${attackMath}<br>
            🩸 <strong>Dano:</strong> ${damageMath}
        `;

        // Success or impact audio depending on result
        setTimeout(() => {
            if (isCrit) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');
            } else if (attackRes.isFumble) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            } else {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');
            }
        }, 300);

        // Show Toast
        Toast.show(`⚔️ <strong>${p.name}</strong> atacou com <strong>${attackName}</strong>!<br>${rollText}`, isCrit ? 'success' : (attackRes.isFumble ? 'error' : 'info'));

        // Push to global store timeline
        TOME.store.update(s => {
            const timelineContent = `
                ⚔️ <strong>Resultado do Ataque (${modeText}):</strong> <strong>${attackRes.total}</strong> para acertar. ${critText ? ' (Crítico!)' : ''} <br>
                🩸 <strong>Rolagem de Dano:</strong> <strong>${damageRes.total}</strong> de dano total. <br>
                <span style="opacity: 0.6; font-size: 0.7rem;">Cálculo: [Ataque: ${attackMath}] [Dano: ${damageMath}]</span>
            `;
            s.journalEntries = [
                ...(s.journalEntries || []),
                {
                    id: Date.now(),
                    timestamp: Date.now(),
                    type: 'combat',
                    title: `${p.name} - Ataque: ${attackName}`,
                    content: timelineContent
                }
            ];
        });
    }

    onMount() {

        // Safe mouse hover / click handlers for spells popup
        const triggers = this.$$('.spell-trigger-card .spell-info-trigger');
        triggers.forEach(trigger => {
            const spellName = trigger.dataset.spellName;
            const spell = this._findSpellByName(spellName);
            if (!spell) return;

            // Mouse Hover - Opens popup after 1 second
            this.listen(trigger, 'mouseenter', () => {
                if (this._popupMode === 'click') return; // Ignore hover if click-pinned

                this._hoverTimer = setTimeout(() => {
                    this._playMagicWhisperSound();
                    this._activePopupSpell = spell;
                    this._popupMode = 'hover';

                    // Position calculating
                    const rect = trigger.getBoundingClientRect();
                    let x = rect.right + 12;
                    if (x + 380 > window.innerWidth) {
                        x = rect.left - 392;
                    }
                    if (x < 10) x = 10;

                    let y = rect.top + window.scrollY; // adjust for scroll
                    if (y + 350 > window.innerHeight + window.scrollY) {
                        y = window.innerHeight + window.scrollY - 360;
                    }
                    if (y < 10) y = 10;

                    this._popupPosition = { x, y };
                    this.render();
                }, 1000);
            });

            // Mouse Leave - Closes popup if not pinned
            this.listen(trigger, 'mouseleave', () => {
                if (this._hoverTimer) {
                    clearTimeout(this._hoverTimer);
                    this._hoverTimer = null;
                }
                if (this._popupMode === 'hover') {
                    this._activePopupSpell = null;
                    this._popupMode = null;
                    this.render();
                }
            });
        });

        // Close when clicking outside of the click-pinned popup
        this.listen(document, 'mousedown', (e) => {
            if (this._popupMode === 'click') {
                const popupEl = this.$('.magic-popup');
                if (popupEl && !popupEl.contains(e.target)) {
                    // Check if clicked another info trigger to prevent double firing
                    const clickedTrigger = e.target.closest('.spell-info-trigger');
                    if (!clickedTrigger) {
                        this._activePopupSpell = null;
                        this._popupMode = null;
                        this.render();
                    }
                }
            }
        });
    }

    onUnmount() {
        if (this._hoverTimer) {
            clearTimeout(this._hoverTimer);
            this._hoverTimer = null;
        }
    }

    setAttacksTab(e, el) {
        if (e) e.preventDefault();
        this._selectedAttacksTab = el.dataset.tab;
        this.render();
    }

    toggleHeroSpellPopup(e, el) {
        if (e) e.stopPropagation();
        const spellName = el.dataset.spellName;
        const spell = this._findSpellByName(spellName);
        if (!spell) return;

        if (this._hoverTimer) {
            clearTimeout(this._hoverTimer);
            this._hoverTimer = null;
        }

        this._playMagicWhisperSound();

        if (this._activePopupSpell && this._activePopupSpell.name === spell.name && this._popupMode === 'click') {
            this._activePopupSpell = null;
            this._popupMode = null;
        } else {
            this._activePopupSpell = spell;
            this._popupMode = 'click';

            const rect = el.getBoundingClientRect();
            let x = rect.right + 12;
            if (x + 380 > window.innerWidth) {
                x = rect.left - 392;
            }
            if (x < 10) x = 10;

            let y = rect.top + window.scrollY; // adjust for scroll
            if (y + 350 > window.innerHeight + window.scrollY) {
                y = window.innerHeight + window.scrollY - 360;
            }
            if (y < 10) y = 10;

            this._popupPosition = { x, y };
        }
        this.render();
    }

    closeMagicPopup(e) {
        if (e) e.stopPropagation();
        this._activePopupSpell = null;
        this._popupMode = null;
        this.render();
    }

    viewFullSpell(e, el) {
        if (e) e.stopPropagation();
        const spellName = el.dataset.spellName;
        const spell = this._findSpellByName(spellName);
        
        this._activePopupSpell = null;
        this._popupMode = null;

        TOME.store.update(s => {
            s.selectedSpellId = spell?.id || null;
            s.activeTab = 'spellbook';
        });
    }

    rollHeroSpell(e, el) {
        if (e.target.closest('.spell-info-trigger')) {
            return; // ignore if clicking the info icon
        }

        const spellName = el.dataset.spellName;
        const spell = this._findSpellByName(spellName);
        if (!spell) return;

        const { players, viewingHeroId } = this.store.state;
        const p = players?.find(h => h.id === viewingHeroId);
        if (!p) return;

        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const lvl = parseInt(p.level) || 1;
        const profBonus = Math.floor((lvl - 1) / 4) + 2;
        const spellStat = p.class?.toLowerCase().includes('mago') ? 'int' : 
                            (p.class?.toLowerCase().includes('druida') || p.class?.toLowerCase().includes('clérigo') || p.class?.toLowerCase().includes('patrulheiro')) ? 'wis' : 'cha';
        const spellMod = Math.floor(((parseInt(stats[spellStat]) || 10) - 10) / 2);
        const spellAttackBonus = profBonus + spellMod;

        this.showRollModal({
            title: `Conjurar ${spell.name}`,
            subtitle: `Rolar jogada de conjuração para esta magia`,
            bonusStr: spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`,
            rollCallback: (mode) => {
                this._performSpellRoll(spell, spellAttackBonus, mode, p);
            }
        });
    }

    _findSpellByName(name) {
        if (!name) return null;
        const cleanName = name.toLowerCase().trim();
        let spell = spellsData.cantrips?.find(s => s.name.toLowerCase() === cleanName || (s.englishName && s.englishName.toLowerCase() === cleanName));
        if (spell) return { ...spell, level: 0 };

        if (spellsData.spellsByLevel) {
            for (const [levelStr, list] of Object.entries(spellsData.spellsByLevel)) {
                const level = parseInt(levelStr) || 0;
                const found = list?.find(s => s.name.toLowerCase() === cleanName || (s.englishName && s.englishName.toLowerCase() === cleanName));
                if (found) {
                    return { ...found, level };
                }
            }
        }
        
        // Fallback for custom player spells
        return {
            name: name,
            englishName: 'Magia Personalizada',
            level: 1,
            type: 'utilidade',
            range: 'Toque',
            duration: 'Instantâneo',
            actionType: 'action',
            effect: 'Efeito mágico customizado definido pelo jogador.',
            challenge: 'O Mestre decide a dificuldade e o efeito desta magia personalizada.'
        };
    }

    _performSpellRoll(spell, attackBonus, mode, p) {
        // Play rolling audio
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');

        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const lvl = parseInt(p.level) || 1;
        const profBonus = Math.floor((lvl - 1) / 4) + 2;
        const spellStat = p.class?.toLowerCase().includes('mago') ? 'int' : 
                            (p.class?.toLowerCase().includes('druida') || p.class?.toLowerCase().includes('clérigo') || p.class?.toLowerCase().includes('patrulheiro')) ? 'wis' : 'cha';
        const spellMod = Math.floor(((parseInt(stats[spellStat]) || 10) - 10) / 2);
        const spellDC = 8 + profBonus + spellMod;

        const isAttack = spell.type === 'dano' || spell.baseDamage;
        const hasSave = !!spell.savingThrow;

        let rollRes = null;
        let critText = '';
        let rollMath = '';

        if (isAttack) {
            rollRes = this._rollD20(attackBonus, mode);
            const sign = attackBonus >= 0 ? '+' : '';
            rollMath = `${rollRes.rollDetails} ${sign}${attackBonus} = <strong>${rollRes.total}</strong>`;
            critText = rollRes.isCrit ? '🔮 <strong>SUCESSO CRÍTICO MÁGICO!</strong> (Dano Dobrado!)' : (rollRes.isFumble ? '💀 <strong>FALHA CRÍTICA MÁGICA!</strong>' : '');
        }

        // Damage calculation
        let damageText = '';
        let damageResult = null;
        if (spell.baseDamage) {
            let finalDamageNotation = spell.baseDamage;
            if (isAttack && rollRes?.isCrit) {
                const damageMatch = spell.baseDamage.toLowerCase().replace(/\s+/g, '').match(/^(\d+)d(\d+)(.*)$/);
                if (damageMatch) {
                    const diceCount = parseInt(damageMatch[1]);
                    const diceSides = damageMatch[2];
                    const rest = damageMatch[3];
                    finalDamageNotation = `${diceCount * 2}d${diceSides}${rest}`;
                }
            }

            damageResult = Dice.roll(finalDamageNotation);
            if (damageResult.error) {
                damageText = `Erro ao rolar dano (${spell.baseDamage})`;
            } else {
                const dmgSign = damageResult.modifier >= 0 ? '+' : '';
                const rollsJoined = damageResult.rolls.join(' + ');
                damageText = `[${rollsJoined}] ${dmgSign}${damageResult.modifier} = <strong>${damageResult.total}</strong> de dano ${spell.damageType || ''} (${finalDamageNotation})`;
            }
        }

        const modeText = mode === 'advantage' ? 'Vantagem' : (mode === 'disadvantage' ? 'Desvantagem' : 'Normal');
        
        let rollText = '';
        let timelineContent = '';

        if (isAttack) {
            rollText = `
                ${critText ? critText + '<br>' : ''}
                🔮 <strong>Ataque Místico (${modeText}):</strong> ${rollMath}<br>
                ${damageText ? `🩸 <strong>Dano:</strong> ${damageText}` : ''}
            `;
            timelineContent = `
                🔮 <strong>Resultado do Ataque Místico (${modeText}):</strong> <strong>${rollRes.total}</strong> para acertar.<br>
                ${damageText ? `🩸 <strong>Rolagem de Dano:</strong> <strong>${damageResult.total}</strong> de dano. <br>` : ''}
                <span style="opacity: 0.6; font-size: 0.7rem;">Cálculo: [Ataque: ${rollMath}] ${damageText ? `[Dano: ${damageText}]` : ''}</span>
            `;
        } else if (hasSave) {
            const saveMap = { 'DEX': 'Destreza', 'WIS': 'Sabedoria', 'CON': 'Constituição', 'INT': 'Inteligência', 'STR': 'Força', 'CHA': 'Carisma' };
            const saveName = saveMap[spell.savingThrow] || spell.savingThrow;
            rollText = `
                🛡️ <strong>Dificuldade:</strong> CD <strong>${spellDC}</strong> contra salvaguarda de <strong>${saveName}</strong><br>
                ${damageText ? `🩸 <strong>Dano potencial:</strong> ${damageText}<br>` : ''}
                ✨ <strong>Efeito:</strong> ${spell.effect || 'O inimigo deve resistir ou sofrerá os efeitos.'}
            `;
            timelineContent = `
                🛡️ <strong>Salvaguarda exigida:</strong> CD <strong>${spellDC}</strong> de <strong>${saveName}</strong><br>
                ${damageText ? `🩸 <strong>Dano (caso falhe):</strong> <strong>${damageResult.total}</strong> de dano. <br>` : ''}
                ✨ <strong>Efeito:</strong> ${spell.effect || 'N/A'}<br>
                <span style="opacity: 0.6; font-size: 0.7rem;">${damageText ? `Cálculo de Dano: ${damageText}` : ''}</span>
            `;
        } else {
            rollText = `
                ✨ <strong>Efeito:</strong> ${spell.effect || spell.challenge || 'Efeito imediato.'}<br>
                ${damageText ? `💚 <strong>Cura/Valor:</strong> ${damageText}` : ''}
            `;
            timelineContent = `
                ✨ <strong>Magia Conjurada:</strong> ${spell.name}<br>
                📝 <strong>Efeito:</strong> ${spell.effect || spell.challenge || 'Efeito imediato.'}<br>
                ${damageText ? `💚 <strong>Cura/Valor rolado:</strong> <strong>${damageResult.total}</strong>.<br>` : ''}
                <span style="opacity: 0.6; font-size: 0.7rem;">${damageText ? `Cálculo: ${damageText}` : ''}</span>
            `;
        }

        setTimeout(() => {
            if (isAttack && rollRes?.isCrit) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');
            } else if (isAttack && rollRes?.isFumble) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            } else {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
            }
        }, 300);

        Toast.show(`🔮 <strong>${p.name}</strong> conjurou <strong>${spell.name}</strong>!<br>${rollText}`, (isAttack && rollRes?.isCrit) ? 'success' : ((isAttack && rollRes?.isFumble) ? 'error' : 'info'));

        TOME.store.update(s => {
            s.journalEntries = [
                ...(s.journalEntries || []),
                {
                    id: Date.now(),
                    timestamp: Date.now(),
                    type: 'magic',
                    title: `${p.name} - Conjurou: ${spell.name}`,
                    content: timelineContent
                }
            ];
        });
    }

    _playMagicWhisperSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(392, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.4);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(493.88, ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.5);
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);
            osc2.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.warn('[Audio] Sussurro mágico falhou:', e);
        }
    }

    _getSpellPopupHTML(spell) {
        const isCantrip = spell.level === 0;
        const circleLabel = isCantrip ? 'TRUQUE' : `${spell.level}º CÍRCULO`;
        
        const mainClass = spell.classes && spell.classes[0] ? spell.classes[0] : 'Conjurador';
        let modifierName = 'Carisma';
        if (['Clérigo', 'Druida', 'Ranger'].includes(mainClass)) modifierName = 'Sabedoria';
        else if (['Mago', 'Artífice'].includes(mainClass)) modifierName = 'Inteligência';
        
        let actionLabel = 'Ação';
        if (spell.actionType === 'bonusAction') actionLabel = 'Ação Bônus';
        else if (spell.actionType === 'reaction') actionLabel = 'Reação';
        
        const componentsLabel = spell.components ? spell.components.join('/') : 'V/S';
        const concentrationLabel = spell.concentration ? 'Sim' : 'Não';
        
        // Dynamic icons & colors based on type
        const typeIcons = { 'dano': 'fa-fire-flame-curved', 'controle': 'fa-hands-bound', 'utilidade': 'fa-wand-magic-sparkles', 'cura': 'fa-heart-pulse' };
        const typeColors = { 'dano': '#ef4444', 'controle': '#3b82f6', 'utilidade': '#a855f7', 'cura': '#22c55e' };
        
        const typeIcon = typeIcons[spell.type] || 'fa-scroll';
        const typeColor = typeColors[spell.type] || 'var(--accent)';
        
        let testBoxHTML = '';
        if (spell.savingThrow) {
            const saveMap = { 'DEX': 'Destreza', 'WIS': 'Sabedoria', 'CON': 'Constituição', 'INT': 'Inteligência', 'STR': 'Força', 'CHA': 'Carisma' };
            const saveName = saveMap[spell.savingThrow] || spell.savingThrow;
            testBoxHTML = `
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">SALVAGUARDA (Inimigo Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">CD da Magia contra o alvo:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        CD = 8 + Bônus Proficiência + Mod. ${modifierName}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Oponente rola salvaguarda de <strong>${saveName}</strong><br>
                        • Sucesso parcial: Metade do dano ou anula o efeito.
                    </div>
                </div>
            `;
        } else if (spell.baseDamage || spell.type === 'dano') {
            testBoxHTML = `
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">ATAQUE MÁGICO (Você Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">Jogada de ataque com d20:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        Mod. de Ataque = Bônus Proficiência + Mod. ${modifierName}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Role 1d20 + Modificador de Ataque.<br>
                        • O ataque atinge se o total for <strong>&ge; CA</strong> do alvo.
                    </div>
                </div>
            `;
        } else {
            testBoxHTML = `
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">EFEITO AUTOMÁTICO</div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Não requer jogada de ataque ou teste de salvaguarda do oponente.<br>
                        • O efeito ou cura ocorre instantaneamente no alvo ou área selecionada.
                    </div>
                </div>
            `;
        }

        const narrative = spell.challenge || spell.effect || 'Efeito mágico sob comando do conjurador.';
        
        let damageOrEffect = '';
        if (spell.baseDamage) {
            damageOrEffect = `<span style="font-size: 1.1rem; font-weight: 800; color: #fff; font-family: 'Cinzel', serif;">${spell.baseDamage}</span> <span style="font-size: 0.8rem; font-weight: 600; color: ${typeColor};">${spell.damageType || ''}</span>`;
            if (spell.scaling && !isCantrip) {
                damageOrEffect += ` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(+1d6 por nível de slot acima)</span>`;
            } else if (spell.scaling && isCantrip) {
                damageOrEffect += ` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(dano aumenta nos níveis 5, 11 e 17)</span>`;
            }
        } else {
            damageOrEffect = `<span style="font-size: 0.75rem; color: var(--text-main); font-weight: 500;">${spell.effect || 'Efeito imediato benéfico ou utilitário.'}</span>`;
        }

        let shortNarrative = narrative;
        if (shortNarrative.length > 180) {
            shortNarrative = shortNarrative.substring(0, 177) + '...';
        }

        return `
            <div style="display: flex; flex-direction: column; gap: 12px; position: relative;">
                <!-- Header Title -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1rem; color: ${typeColor}; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                            <i class="fa-solid ${typeIcon}"></i>
                        </span>
                        <div>
                            <h4 style="font-family: 'Cinzel', serif; font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 0 10px rgba(255,255,255,0.1);">${spell.name.toUpperCase()}</h4>
                            <span style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">${spell.englishName}</span>
                        </div>
                    </div>
                    <span class="badge" style="background: ${isCantrip ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; border: 1px solid ${isCantrip ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; color: ${isCantrip ? '#86efac' : '#93c5fd'}; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px;">
                        ${circleLabel}
                    </span>
                </div>

                <!-- Specs Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.72rem;">
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-regular fa-clock" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Execução: <strong style="color: #fff;">${actionLabel}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-arrows-left-right" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Alcance: <strong style="color: #fff;">${spell.range || '-'}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-flask" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Componentes: <strong style="color: #fff;">${componentsLabel}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-brain" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Conc.: <strong style="color: #fff;">${concentrationLabel}</strong></span>
                    </div>
                </div>

                <!-- Description -->
                <div style="background: rgba(255, 255, 255, 0.01); border-left: 2.5px solid ${typeColor}; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.72rem; line-height: 1.45; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--text-dim); font-size: 0.65rem; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">Como funciona:</div>
                    ${shortNarrative}
                </div>

                <!-- Test calculation box -->
                <div style="background: rgba(255,255,255,0.02); border: 1.5px solid rgba(197, 160, 89, 0.15); padding: 12px; border-radius: 8px;">
                    ${testBoxHTML}
                </div>

                <!-- Dano / Efeito box -->
                <div style="background: rgba(197, 160, 89, 0.05); border: 1.5px dashed rgba(197, 160, 89, 0.3); padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent); font-size: 0.95rem; display: inline-flex;">
                            <i class="fa-solid fa-dice-d20"></i>
                        </span>
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Dano / Efeito:</div>
                    </div>
                    <div style="text-align: right;">
                        ${damageOrEffect}
                    </div>
                </div>
            </div>
            
            ${this._popupMode === 'click' ? `
                <button class="btn btn-ghost" style="position: absolute; top: 12px; right: 12px; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; z-index: 10; border: none; background: transparent; color: var(--text-dim); cursor: pointer;" data-action="closeMagicPopup">✕</button>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; border-top: 1.5px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
                    <button class="btn btn-ghost" style="padding: 5px 12px; font-size: 0.68rem; border-radius: 6px; border: 1px solid rgba(197, 160, 89, 0.35); color: var(--accent); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: rgba(197,160,89,0.05);" data-action="viewFullSpell" data-spell-id="${spell.id}" data-spell-name="${spell.name}">
                        <i class="fa-solid fa-expand" style="font-size: 0.65rem;"></i> Ficha Completa
                    </button>
                </div>
            ` : ''}
        `;
    }

    setMainTab(e, el) {
        if (e) e.preventDefault();
        this._activeTab = el.dataset.tab;
        this.render();
    }

    selectChallengeDifficulty(e, el) {
        if (e) e.preventDefault();
        const mode = el.dataset.mode;
        this._challengeDCMode = mode;
        if (mode !== 'custom') {
            this._challengeDC = parseInt(el.dataset.val) || 15;
        }
        this.render();
    }

    selectChallengeAdvantage(e, el) {
        if (e) e.preventDefault();
        this._challengeAdvantage = el.dataset.mode;
        this.render();
    }

    selectChallengeFilter(e, el) {
        if (e) e.preventDefault();
        this._selectedChallengeFilter = el.dataset.filter;
        this.render();
    }

    closeChallengeResultPopup(e) {
        if (e) e.stopPropagation();
        this._showChallengeResult = null;
        this.render();
    }

    _getSpellcastingStat(playerClass) {
        if (!playerClass) return 'cha';
        const cl = playerClass.toLowerCase();
        if (cl.includes('mago') || cl.includes('wizard') || cl.includes('artífice') || cl.includes('artificer')) return 'int';
        if (cl.includes('druida') || cl.includes('druid') || cl.includes('clérigo') || cl.includes('cleric') || cl.includes('patrulheiro') || cl.includes('ranger') || cl.includes('monge') || cl.includes('monk')) return 'wis';
        return 'cha';
    }

    _getChallengeActions(p, stats, profBonus) {
        const actions = [];
        
        // 1. Attributes
        const attrKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const attrNames = {
            str: 'Força (FOR)',
            dex: 'Destreza (DES)',
            con: 'Constituição (CON)',
            int: 'Inteligência (INT)',
            wis: 'Sabedoria (SAB)',
            cha: 'Carisma (CAR)'
        };
        attrKeys.forEach(key => {
            const mod = Math.floor((stats[key] - 10) / 2);
            actions.push({
                type: 'attribute',
                key: key,
                name: attrNames[key],
                category: 'attribute',
                bonus: mod,
                detail: `Mod. ${key.toUpperCase()}: ${mod >= 0 ? '+' : ''}${mod}`
            });
        });
        
        // 2. Saving Throws
        const savesList = [
            { key: 'str', name: 'Resistência de Força', stat: 'str' },
            { key: 'dex', name: 'Resistência de Destreza', stat: 'dex' },
            { key: 'con', name: 'Resistência de Constituição', stat: 'con' },
            { key: 'int', name: 'Resistência de Inteligência', stat: 'int' },
            { key: 'wis', name: 'Resistência de Sabedoria', stat: 'wis' },
            { key: 'cha', name: 'Resistência de Carisma', stat: 'cha' }
        ];
        savesList.forEach(item => {
            const isProf = Array.isArray(p.savingThrows) 
                ? p.savingThrows.some(s => s.toLowerCase() === item.key.toLowerCase())
                : !!p.savingThrows?.[item.key];
            const mod = Math.floor((stats[item.stat] - 10) / 2);
            const total = mod + (isProf ? profBonus : 0);
            actions.push({
                type: 'save',
                key: item.key,
                name: item.name,
                category: 'save',
                bonus: total,
                detail: `${mod >= 0 ? '+' : ''}${mod} (${item.stat.toUpperCase()})` + (isProf ? ` + ${profBonus} (Prof)` : '')
            });
        });
        
        // 3. Skills
        const skillList = [
            { key: 'athletics', name: 'Atletismo (FOR)', stat: 'str' },
            { key: 'acrobatics', name: 'Acrobacia (DES)', stat: 'dex' },
            { key: 'sleightOfHand', name: 'Prestidigitação (DES)', stat: 'dex' },
            { key: 'stealth', name: 'Furtividade (DES)', stat: 'dex' },
            { key: 'arcana', name: 'Arcanismo (INT)', stat: 'int' },
            { key: 'history', name: 'História (INT)', stat: 'int' },
            { key: 'investigation', name: 'Investigação (INT)', stat: 'int' },
            { key: 'nature', name: 'Natureza (INT)', stat: 'int' },
            { key: 'religion', name: 'Religião (INT)', stat: 'int' },
            { key: 'animalHandling', name: 'Adestrar Animais (SAB)', stat: 'wis' },
            { key: 'insight', name: 'Intuição (SAB)', stat: 'wis' },
            { key: 'medicine', name: 'Medicina (SAB)', stat: 'wis' },
            { key: 'perception', name: 'Percepção (SAB)', stat: 'wis' },
            { key: 'survival', name: 'Sobrevivência (SAB)', stat: 'wis' },
            { key: 'deception', name: 'Enganação (CAR)', stat: 'cha' },
            { key: 'intimidation', name: 'Intimidação (CAR)', stat: 'cha' },
            { key: 'performance', name: 'Atuação (CAR)', stat: 'cha' },
            { key: 'persuasion', name: 'Persuasão (CAR)', stat: 'cha' }
        ];
        skillList.forEach(item => {
            const isProf = p.skills?.some(s => s.toLowerCase() === item.key.toLowerCase());
            const mod = Math.floor((stats[item.stat] - 10) / 2);
            const total = mod + (isProf ? profBonus : 0);
            actions.push({
                type: 'skill',
                key: item.key,
                name: item.name,
                category: 'skill',
                bonus: total,
                detail: `${mod >= 0 ? '+' : ''}${mod} (${item.stat.toUpperCase()})` + (isProf ? ` + ${profBonus} (Prof)` : '')
            });
        });
        
        // 4. Attacks
        if (p.attacks && p.attacks.length > 0) {
            p.attacks.forEach((a, idx) => {
                const bonus = parseInt(a.bonus) || 0;
                actions.push({
                    type: 'attack',
                    index: idx,
                    name: `Ataque: ${a.name}`,
                    category: 'combat',
                    bonus: bonus,
                    detail: `Dano: ${a.damage || '1d6'} | Bônus Acerto: +${bonus}`
                });
            });
        }
        
        // 5. Spells
        const spellcastingStat = this._getSpellcastingStat(p.class);
        const spellMod = Math.floor((stats[spellcastingStat] - 10) / 2);
        const spellAttackBonus = profBonus + spellMod;
        
        if (p.spells) {
            Object.entries(p.spells).forEach(([lvlKey, spellListStr]) => {
                if (!spellListStr) return;
                const lvl = parseInt(lvlKey.replace('lvl', '')) || 0;
                const lines = spellListStr.split('\n').map(l => l.trim()).filter(Boolean);
                lines.forEach(name => {
                    const isCantrip = lvl === 0;
                    actions.push({
                        type: 'spell',
                        name: name,
                        level: lvl,
                        category: isCantrip ? 'cantrip' : 'spell',
                        bonus: spellAttackBonus,
                        detail: `CD: ${8 + spellAttackBonus} | Bônus Acerto: +${spellAttackBonus} (${spellcastingStat.toUpperCase()})`
                    });
                });
            });
        }
        
        return actions;
    }

    rollChallengeAction(e, el) {
        const type = el.dataset.type;
        const actionName = el.dataset.name;
        const bonus = parseInt(el.dataset.bonus) || 0;
        
        const { players, viewingHeroId } = this.store.state;
        const p = players?.find(h => h.id === viewingHeroId);
        if (!p) return;
        
        // Play rolling audio
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');
        
        const rollRes = this._rollD20(bonus, this._challengeAdvantage);
        const passed = rollRes.total >= this._challengeDC;
        
        let detail = '';
        if (type === 'attribute') {
            detail = `Modificador Bruto de Atributo (${bonus >= 0 ? '+' : ''}${bonus})`;
        } else if (type === 'save') {
            detail = `Salvaguarda (Modificador + Proficiência se aplicável: ${bonus >= 0 ? '+' : ''}${bonus})`;
        } else if (type === 'skill') {
            detail = `Teste de Perícia (Modificador + Proficiência se aplicável: ${bonus >= 0 ? '+' : ''}${bonus})`;
        } else if (type === 'attack') {
            detail = `Bônus de Acerto da Arma (${bonus >= 0 ? '+' : ''}${bonus})`;
        } else if (type === 'spell') {
            detail = `Modificador de Conjuração + Proficiência: ${bonus >= 0 ? '+' : ''}${bonus}`;
        }
        
        const difficultyLabels = {
            easy: 'Fácil',
            medium: 'Médio',
            hard: 'Difícil',
            custom: 'Customizado'
        };
        const diffLabel = difficultyLabels[this._challengeDCMode] || 'Customizado';
        
        const entryId = Date.now();
        const resultObj = {
            charName: p.name,
            actionName: actionName,
            targetCD: this._challengeDC,
            difficultyLabel: diffLabel,
            advantage: this._challengeAdvantage,
            rolls: rollRes.rolls,
            finalRoll: rollRes.finalRoll,
            bonus: bonus,
            total: rollRes.total,
            passed: passed,
            detail: detail,
            entryId: entryId,
            ts: entryId
        };
        
        this._showChallengeResult = resultObj;
        
        const modeText = this._challengeAdvantage === 'advantage' ? 'Vantagem' : (this._challengeAdvantage === 'disadvantage' ? 'Desvantagem' : 'Normal');
        const outcomeIcon = passed ? '✅ SUCESSO' : '❌ FRACASSO';
        const outcomeColor = passed ? '#2ecc71' : '#e74c3c';
        
        const historyEntry = {
            label: `Desafio: ${actionName}`,
            roll: rollRes.finalRoll,
            bonus: bonus,
            total: rollRes.total,
            color: outcomeColor,
            icon: outcomeIcon,
            ts: entryId
        };
        this._rollHistory = [historyEntry, ...this._rollHistory].slice(0, 5);
        
        setTimeout(() => {
            if (passed) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');
            } else {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            }
        }, 300);
        
        const sign = bonus >= 0 ? '+' : '';
        const rollMath = `${rollRes.rollDetails} ${sign}${bonus} = <strong>${rollRes.total}</strong>`;
        const logText = `
            🎯 <strong>Dificuldade:</strong> CD ${this._challengeDC} (${diffLabel})<br>
            🎲 <strong>Modo:</strong> ${modeText}<br>
            📊 <strong>Resultado:</strong> ${rollMath}<br>
            🔥 <strong>Status:</strong> ${passed ? '<span style="color:#2ecc71; font-weight:bold;">APROVADO</span>' : '<span style="color:#e74c3c; font-weight:bold;">REPROVADO</span>'}
        `;
        Toast.show(`🎯 Desafio do Mestre para <strong>${p.name}</strong>!<br>${logText}`, passed ? 'success' : 'error');
        
        TOME.store.update(s => {
            const journalContent = `
                🎯 <strong>Dificuldade:</strong> CD ${this._challengeDC} (${diffLabel})<br>
                🎲 <strong>Modo:</strong> ${modeText}<br>
                📊 <strong>Jogada d20:</strong> ${rollRes.finalRoll} (Mod: ${bonus >= 0 ? '+' : ''}${bonus}) = <strong>${rollRes.total}</strong><br>
                🔥 <strong>Status:</strong> ${passed ? '<span style="color:#2ecc71; font-weight:bold;">APROVADO</span>' : '<span style="color:#e74c3c; font-weight:bold;">REPROVADO</span>'}<br>
                <span style="opacity: 0.6; font-size: 0.7rem;">Cálculo: ${rollMath}</span>
            `;
            s.journalEntries = [
                ...(s.journalEntries || []),
                {
                    id: entryId,
                    timestamp: entryId,
                    type: passed ? 'social' : 'combat',
                    title: `Desafio: ${p.name} - ${actionName}`,
                    content: journalContent
                }
            ];
        });
        
    }

    changeChallengePhysicalRoll(e, el) {
        if (!this._showChallengeResult) return;
        const index = parseInt(el.dataset.index) || 0;
        let val = parseInt(el.value);
        if (isNaN(val)) return;
        
        val = Math.max(1, Math.min(20, val));
        
        const res = this._showChallengeResult;
        res.rolls[index] = val;
        
        if (res.advantage === 'advantage') {
            res.finalRoll = Math.max(res.rolls[0] || 0, res.rolls[1] || 0);
        } else if (res.advantage === 'disadvantage') {
            res.finalRoll = Math.min(res.rolls[0] || 20, res.rolls[1] || 20);
        } else {
            res.finalRoll = val;
        }
        
        res.total = res.finalRoll + res.bonus;
        res.passed = res.total >= res.targetCD;
        
        if (this._rollHistory && this._rollHistory.length > 0) {
            const outcomeIcon = res.passed ? '✅ SUCESSO' : '❌ FRACASSO';
            const outcomeColor = res.passed ? '#2ecc71' : '#e74c3c';
            
            const historyIndex = this._rollHistory.findIndex(h => h.ts === res.ts || h.label === `Desafio: ${res.actionName}`);
            if (historyIndex !== -1) {
                this._rollHistory[historyIndex].roll = res.finalRoll;
                this._rollHistory[historyIndex].total = res.total;
                this._rollHistory[historyIndex].color = outcomeColor;
                this._rollHistory[historyIndex].icon = outcomeIcon;
            }
        }
        
        const modeText = res.advantage === 'advantage' ? 'Vantagem' : (res.advantage === 'disadvantage' ? 'Desvantagem' : 'Normal');
        const sign = res.bonus >= 0 ? '+' : '';
        
        let rollDetailsText = '';
        if (res.advantage === 'advantage') {
            rollDetailsText = `[d20(${res.rolls[0]}), d20(${res.rolls[1]})] ➔ Maior (${res.finalRoll})`;
        } else if (res.advantage === 'disadvantage') {
            rollDetailsText = `[d20(${res.rolls[0]}), d20(${res.rolls[1]})] ➔ Menor (${res.finalRoll})`;
        } else {
            rollDetailsText = `d20(${res.finalRoll})`;
        }
        
        const rollMath = `${rollDetailsText} ${sign}${res.bonus} = <strong>${res.total}</strong>`;
        const journalContent = `
            🎯 <strong>Dificuldade:</strong> CD ${res.targetCD} (${res.difficultyLabel})<br>
            🎲 <strong>Modo:</strong> ${modeText}<br>
            📊 <strong>Jogada d20:</strong> ${res.finalRoll} (Mod: ${res.bonus >= 0 ? '+' : ''}${res.bonus}) = <strong>${res.total}</strong><br>
            🔥 <strong>Status:</strong> ${res.passed ? '<span style="color:#2ecc71; font-weight:bold;">APROVADO</span>' : '<span style="color:#e74c3c; font-weight:bold;">REPROVADO</span>'}<br>
            <span style="opacity: 0.6; font-size: 0.7rem;">Cálculo: ${rollMath}</span>
        `;
        
        TOME.store.update(s => {
            const entry = s.journalEntries?.find(j => j.id === res.entryId);
            if (entry) {
                entry.content = journalContent;
                entry.type = res.passed ? 'social' : 'combat';
            }
        });
        
        TOME.persistence.save().catch(err => console.warn(err));
        
        this.render();
        
        requestAnimationFrame(() => {
            const activeInput = this.element.querySelector(`input[data-action="changeChallengePhysicalRoll"][data-index="${index}"]`);
            if (activeInput) {
                activeInput.focus();
                activeInput.select();
            }
        });
    }

    _renderChallengeResultPopup() {
        if (!this._showChallengeResult) return '';
        const res = this._showChallengeResult;
        
        const isPassed = res.passed;
        const statusBadge = isPassed 
            ? `<div class="badge-status-approved" style="
                color:#2ecc71; 
                background:rgba(46,204,113,0.12); 
                border:2.5px solid #2ecc71; 
                box-shadow:0 0 15px rgba(46,204,113,0.3);
                font-size:1.8rem; 
                font-weight:900; 
                padding:10px 20px; 
                border-radius:10px; 
                font-family:'Cinzel', serif;
                text-align:center;
                animation: pulseGlowGreen 1.5s infinite alternate;
               ">APROVADO</div>` 
            : `<div class="badge-status-reproved" style="
                color:#e74c3c; 
                background:rgba(231,76,60,0.12); 
                border:2.5px solid #e74c3c; 
                box-shadow:0 0 15px rgba(231,76,60,0.3);
                font-size:1.8rem; 
                font-weight:900; 
                padding:10px 20px; 
                border-radius:10px; 
                font-family:'Cinzel', serif;
                text-align:center;
                animation: pulseGlowRed 1.5s infinite alternate;
               ">REPROVADO</div>`;
        
        let diceHTML = '';
        if (res.advantage === 'advantage') {
            const highIndex = res.rolls[0] >= res.rolls[1] ? 0 : 1;
            diceHTML = `
                <div style="display:flex; gap:15px; justify-content:center; align-items:center; margin:15px 0;">
                    <div style="position:relative;">
                        <input type="number" 
                               min="1" max="20" 
                               value="${res.rolls[0]}"
                               data-action="changeChallengePhysicalRoll"
                               data-index="0"
                               style="
                                  border: 2px solid ${highIndex === 0 ? '#2ecc71' : 'rgba(255,255,255,0.15)'}; 
                                  background: ${highIndex === 0 ? 'rgba(46,204,113,0.15)' : 'rgba(0,0,0,0.4)'};
                                  color: ${highIndex === 0 ? '#2ecc71' : '#475569'};
                                  font-family:'Cinzel', serif; font-size:2rem; font-weight:900; width:65px; height:65px; 
                                  border-radius:12px; text-align:center;
                                  box-shadow: ${highIndex === 0 ? '0 0 12px #2ecc71' : 'none'};
                                  text-decoration: ${highIndex === 1 ? 'line-through' : 'none'};
                                  outline:none;
                               "
                               onfocus="this.select()">
                    </div>
                    <span style="color:#64748b; font-weight:bold; font-size:1rem;">VS</span>
                    <div style="position:relative;">
                        <input type="number" 
                               min="1" max="20" 
                               value="${res.rolls[1]}"
                               data-action="changeChallengePhysicalRoll"
                               data-index="1"
                               style="
                                  border: 2px solid ${highIndex === 1 ? '#2ecc71' : 'rgba(255,255,255,0.15)'}; 
                                  background: ${highIndex === 1 ? 'rgba(46,204,113,0.15)' : 'rgba(0,0,0,0.4)'};
                                  color: ${highIndex === 1 ? '#2ecc71' : '#475569'};
                                  font-family:'Cinzel', serif; font-size:2rem; font-weight:900; width:65px; height:65px; 
                                  border-radius:12px; text-align:center;
                                  box-shadow: ${highIndex === 1 ? '0 0 12px #2ecc71' : 'none'};
                                  text-decoration: ${highIndex === 0 ? 'line-through' : 'none'};
                                  outline:none;
                               "
                               onfocus="this.select()">
                    </div>
                </div>
                <div style="font-size:0.65rem; color:#2ecc71; text-align:center; font-weight:bold; margin-top:-5px; text-transform:uppercase;">
                    Vantagem: Mantido maior (${res.finalRoll}) · Edite os dados físicos acima
                </div>
            `;
        } else if (res.advantage === 'disadvantage') {
            const lowIndex = res.rolls[0] <= res.rolls[1] ? 0 : 1;
            diceHTML = `
                <div style="display:flex; gap:15px; justify-content:center; align-items:center; margin:15px 0;">
                    <div style="position:relative;">
                        <input type="number" 
                               min="1" max="20" 
                               value="${res.rolls[0]}"
                               data-action="changeChallengePhysicalRoll"
                               data-index="0"
                               style="
                                  border: 2px solid ${lowIndex === 0 ? '#e74c3c' : 'rgba(255,255,255,0.15)'}; 
                                  background: ${lowIndex === 0 ? 'rgba(231,76,60,0.15)' : 'rgba(0,0,0,0.4)'};
                                  color: ${lowIndex === 0 ? '#e74c3c' : '#475569'};
                                  font-family:'Cinzel', serif; font-size:2rem; font-weight:900; width:65px; height:65px; 
                                  border-radius:12px; text-align:center;
                                  box-shadow: ${lowIndex === 0 ? '0 0 12px #e74c3c' : 'none'};
                                  text-decoration: ${lowIndex === 1 ? 'line-through' : 'none'};
                                  outline:none;
                               "
                               onfocus="this.select()">
                    </div>
                    <span style="color:#64748b; font-weight:bold; font-size:1rem;">VS</span>
                    <div style="position:relative;">
                        <input type="number" 
                               min="1" max="20" 
                               value="${res.rolls[1]}"
                               data-action="changeChallengePhysicalRoll"
                               data-index="1"
                               style="
                                  border: 2px solid ${lowIndex === 1 ? '#e74c3c' : 'rgba(255,255,255,0.15)'}; 
                                  background: ${lowIndex === 1 ? 'rgba(231,76,60,0.15)' : 'rgba(0,0,0,0.4)'};
                                  color: ${lowIndex === 1 ? '#e74c3c' : '#475569'};
                                  font-family:'Cinzel', serif; font-size:2rem; font-weight:900; width:65px; height:65px; 
                                  border-radius:12px; text-align:center;
                                  box-shadow: ${lowIndex === 1 ? '0 0 12px #e74c3c' : 'none'};
                                  text-decoration: ${lowIndex === 0 ? 'line-through' : 'none'};
                                  outline:none;
                               "
                               onfocus="this.select()">
                    </div>
                </div>
                <div style="font-size:0.65rem; color:#e74c3c; text-align:center; font-weight:bold; margin-top:-5px; text-transform:uppercase;">
                    Desvantagem: Mantido menor (${res.finalRoll}) · Edite os dados físicos acima
                </div>
            `;
        } else {
            diceHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; gap:5px; margin:15px 0;">
                    <div style="position:relative;">
                        <input type="number" 
                               min="1" max="20" 
                               value="${res.finalRoll}"
                               data-action="changeChallengePhysicalRoll"
                               data-index="0"
                               style="
                                  border: 2.5px solid var(--accent); 
                                  background: rgba(0,0,0,0.5);
                                  color: #fff;
                                  font-family:'Cinzel', serif; font-size:2.4rem; font-weight:900; width:75px; height:75px; 
                                  border-radius:14px; text-align:center;
                                  box-shadow: 0 0 20px rgba(197,160,89,0.3);
                                  outline:none;
                               "
                               onfocus="this.select()">
                        <div style="position:absolute; bottom:2px; left:50%; transform:translateX(-50%); font-size:0.5rem; color:var(--accent); font-weight:800; font-family:'Outfit'; text-transform:uppercase; letter-spacing:0.5px; pointer-events:none;">FÍSICO</div>
                    </div>
                    <span style="font-size:0.65rem; color:var(--text-dim);">Clique e digite o valor do dado real</span>
                </div>
            `;
        }
        
        return `
            <div class="challenge-result-overlay" style="
                position:fixed; 
                inset:0; 
                background:rgba(0,0,0,0.82); 
                backdrop-filter:blur(10px); 
                z-index:40000; 
                display:flex; 
                align-items:center; 
                justify-content:center; 
                padding:20px; 
                animation: fadeIn 0.25s ease-out;
            ">
                <style>
                    @keyframes pulseGlowGreen {
                        from { box-shadow: 0 0 10px rgba(46,204,113,0.2), inset 0 0 10px rgba(46,204,113,0.1); }
                        to { box-shadow: 0 0 25px rgba(46,204,113,0.5), inset 0 0 20px rgba(46,204,113,0.25); }
                    }
                    @keyframes pulseGlowRed {
                        from { box-shadow: 0 0 10px rgba(231,76,60,0.2), inset 0 0 10px rgba(231,76,60,0.1); }
                        to { box-shadow: 0 0 25px rgba(231,76,60,0.5), inset 0 0 20px rgba(231,76,60,0.25); }
                    }
                    input[type=number]::-webkit-inner-spin-button, 
                    input[type=number]::-webkit-outer-spin-button { 
                        -webkit-appearance: none; 
                        margin: 0; 
                    }
                    input[type=number] {
                        -moz-appearance: textfield;
                    }
                </style>
                <div class="card glass-accent" style="
                    width: 100%; 
                    max-width: 460px; 
                    border: 2px solid ${isPassed ? '#2ecc71' : '#e74c3c'}; 
                    background: linear-gradient(135deg, rgba(10,12,16,0.95), rgba(20,24,30,0.95));
                    padding: 0; 
                    overflow: hidden; 
                    border-radius: 16px;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
                    box-shadow: 0 25px 60px rgba(0,0,0,0.8);
                ">
                    <div style="
                        padding: 20px; 
                        border-bottom: 1px solid rgba(255,255,255,0.06); 
                        display: flex; 
                        align-items: center; 
                        justify-content: space-between;
                        background: ${isPassed ? 'rgba(46,204,113,0.04)' : 'rgba(231,76,60,0.04)'};
                    ">
                        <div>
                            <h3 style="margin: 0; font-family: 'Cinzel', serif; color: var(--accent); font-size: 1.25rem; letter-spacing: 0.5px;">
                                🔮 Desafio do Mestre
                            </h3>
                            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">
                                Teste de Desafio realizado em tempo real
                            </div>
                        </div>
                        <button style="background: transparent; border: none; color: var(--text-dim); cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 5px;" data-action="closeChallengeResultPopup">&times;</button>
                    </div>
                    
                    <div style="padding: 25px; display:flex; flex-direction:column; gap:20px; text-align:center;">
                        <div>
                            <div style="font-size:0.65rem; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1.5px; font-family:'Cinzel';">Personagem: ${res.charName}</div>
                            <h2 style="font-family:'Cinzel', serif; font-size:1.6rem; color:#fff; margin:5px 0 0 0; font-weight:bold;">${res.actionName}</h2>
                        </div>
                        
                        <div style="
                            display:inline-flex; 
                            align-items:center; 
                            justify-content:center; 
                            gap:8px; 
                            background:rgba(0,0,0,0.3); 
                            padding:8px 16px; 
                            border-radius:20px; 
                            border:1px solid rgba(255,255,255,0.05); 
                            width:fit-content; 
                            margin:0 auto;
                            font-size:0.78rem;
                        ">
                            <span style="color:var(--text-dim);">Dificuldade:</span>
                            <strong style="color:var(--accent); text-transform:uppercase; letter-spacing:0.5px;">${res.difficultyLabel} (CD ${res.targetCD})</strong>
                        </div>
                        
                        ${diceHTML}
                        
                        <div style="
                            background: rgba(0,0,0,0.4); 
                            border: 1px solid rgba(255,255,255,0.04); 
                            border-radius: 10px; 
                            padding: 12px 15px; 
                            font-family: 'JetBrains Mono', monospace; 
                            font-size: 0.78rem;
                            color: #cbd5e1;
                            line-height:1.5;
                        ">
                            <div style="font-size:0.6rem; color:#64748b; text-transform:uppercase; margin-bottom:4px; font-family:'Outfit'; font-weight:bold;">Cálculo do Modificador</div>
                            <div>
                                ${res.finalRoll} <span style="color:#64748b;">(d20)</span> 
                                ${res.bonus >= 0 ? '+' : ''}${res.bonus} <span style="color:#64748b;">(Bônus)</span> 
                                = <strong style="font-size:1.15rem; color:#fff;">${res.total}</strong>
                            </div>
                            <div style="font-size:0.65rem; color:var(--text-dim); margin-top:5px; font-family:'Outfit';">
                                Detalhe: ${res.detail}
                            </div>
                        </div>
                        
                        ${statusBadge}
                        
                        <p style="font-size:0.8rem; color:var(--text-dim); line-height:1.5; margin:0; font-family:'Outfit';">
                            ${isPassed 
                                ? `Sucesso! O total de <strong>${res.total}</strong> atinge ou supera a classe de dificuldade CD <strong>${res.targetCD}</strong>.` 
                                : `Fracasso! O total de <strong>${res.total}</strong> foi menor que a classe de dificuldade CD <strong>${res.targetCD}</strong>.`}
                        </p>
                    </div>
                    
                    <div style="
                        padding: 15px 20px; 
                        background: rgba(0,0,0,0.4); 
                        border-top: 1px solid rgba(255,255,255,0.06); 
                        display:flex; 
                        justify-content:flex-end;
                    ">
                        <button class="btn btn-primary" style="font-family:'Cinzel'; font-weight:bold; font-size:0.75rem; border-radius:6px; padding:8px 20px;" data-action="closeChallengeResultPopup">
                            Confirmar & Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    _renderChallengesTab(p, stats, profBonus) {
        const actions = this._getChallengeActions(p, stats, profBonus);
        
        let filteredActions = actions;
        if (this._selectedChallengeFilter !== 'all') {
            filteredActions = actions.filter(act => act.category === this._selectedChallengeFilter);
        }
        
        const categoryLabels = {
            all: 'Todos',
            combat: 'Batalha',
            cantrip: 'Truques',
            spell: 'Magias',
            save: 'Defesa (Salvaguardas)',
            skill: 'Perícias',
            attribute: 'Atributos'
        };
        
        const cdModes = [
            { id: 'easy', label: 'Fácil (CD 10)', val: 10 },
            { id: 'medium', label: 'Médio (CD 15)', val: 15 },
            { id: 'hard', label: 'Difícil (CD 20)', val: 20 },
            { id: 'custom', label: 'Customizado', val: this._challengeDC }
        ];
        
        const advModes = [
            { id: 'normal', label: 'Normal', icon: 'fa-dice-d20', color: 'var(--info)' },
            { id: 'advantage', label: 'Vantagem', icon: 'fa-dice-d20', color: 'var(--success)' },
            { id: 'disadvantage', label: 'Desvantagem', icon: 'fa-dice-d20', color: 'var(--danger)' }
        ];

        return `
            <div style="display:grid; grid-template-columns: 320px 1fr; gap:25px; align-items:start; animation: fadeIn 0.35s ease-out; font-family:'Outfit';">
                <div class="card glass-accent" style="padding:22px; border-radius:14px; border:1px solid rgba(197,160,89,0.25); background:rgba(10,12,16,0.6); display:flex; flex-direction:column; gap:20px; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
                    <div style="border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:10px;">
                        <h3 style="font-family:'Cinzel', serif; color:var(--accent); font-size:1rem; margin:0; display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-eye"></i> Olho do Mestre
                        </h3>
                        <p style="font-size:0.68rem; color:var(--text-dim); margin:4px 0 0 0;">Configurações rápidas de dificuldade e vantagem para testes do herói.</p>
                    </div>
                    
                    <div>
                        <label style="display:block; font-size:0.65rem; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-family:'Cinzel';">Dificuldade do Desafio (CD)</label>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${cdModes.map(m => {
                                const active = this._challengeDCMode === m.id;
                                return `
                                    <button class="btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}" 
                                            data-action="selectChallengeDifficulty" 
                                            data-mode="${m.id}" 
                                            data-val="${m.val}"
                                            style="justify-content:flex-start; font-weight:bold; font-size:0.75rem; padding:8px 12px; border-radius:8px; ${active ? 'border-color:var(--accent);' : 'border-color:rgba(255,255,255,0.06);'}">
                                        <i class="fa-solid ${active ? 'fa-circle-dot' : 'fa-circle'}" style="margin-right:8px; font-size:0.7rem;"></i>
                                        <span>${m.label}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                        
                        ${this._challengeDCMode === 'custom' ? `
                            <div style="margin-top:10px; display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.4); padding:6px 10px; border-radius:6px; border:1px solid rgba(197,160,89,0.25); animation:slideUp 0.2s ease-out;">
                                <span style="font-size:0.7rem; color:var(--accent); font-weight:bold;">Definir CD:</span>
                                <input type="number" id="custom-cd-input" class="form-input" value="${this._challengeDC}" min="1" max="40" style="padding:2px 8px; font-size:0.8rem; background:transparent; border:none; width:60px; color:#fff; font-weight:bold; outline:none; text-align:center;">
                            </div>
                        ` : ''}
                    </div>
                    
                    <div>
                        <label style="display:block; font-size:0.65rem; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; font-family:'Cinzel';">Modo de Rolagem</label>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${advModes.map(m => {
                                const active = this._challengeAdvantage === m.id;
                                return `
                                    <button class="btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}" 
                                            data-action="selectChallengeAdvantage" 
                                            data-mode="${m.id}" 
                                            style="justify-content:flex-start; font-weight:bold; font-size:0.75rem; padding:8px 12px; border-radius:8px; ${active ? `border-color:${m.color}; color:${m.color}; background:rgba(255,255,255,0.03);` : 'border-color:rgba(255,255,255,0.06);'}">
                                        <i class="fa-solid ${m.icon}" style="margin-right:8px; color:${m.color};"></i>
                                        <span>${m.label}</span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="glass" style="padding:10px; border-radius:12px; display:flex; gap:6px; flex-wrap:wrap; border:1px solid rgba(197,160,89,0.15); background:rgba(0,0,0,0.25);">
                        ${Object.entries(categoryLabels).map(([fKey, fLabel]) => {
                            const active = this._selectedChallengeFilter === fKey;
                            return `
                                <button class="btn btn-ghost btn-sm" 
                                        data-action="selectChallengeFilter" 
                                        data-filter="${fKey}"
                                        style="font-size:0.72rem; padding:6px 12px; border-radius:6px; font-weight:bold; font-family:'Cinzel', serif;
                                               color: ${active ? 'var(--accent)' : 'var(--text-dim)'};
                                               border-color: ${active ? 'var(--accent)' : 'transparent'};
                                               background: ${active ? 'rgba(197,160,89,0.08)' : 'transparent'};">
                                    ${fLabel}
                                </button>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px; max-height:650px; overflow-y:auto; padding-right:5px; scrollbar-width:thin;">
                        ${filteredActions.length > 0 ? filteredActions.map(act => {
                            let icon = '🎲';
                            let iconColor = 'var(--text-dim)';
                            
                            if (act.type === 'attribute') { icon = '🧠'; iconColor = '#c5a059'; }
                            else if (act.type === 'save') { icon = '🛡️'; iconColor = '#3498db'; }
                            else if (act.type === 'skill') { icon = '📜'; iconColor = '#2ecc71'; }
                            else if (act.type === 'attack') { icon = '⚔️'; iconColor = '#ef4444'; }
                            else if (act.type === 'spell') {
                                icon = act.level === 0 ? '✨' : '🔮';
                                iconColor = '#a855f7';
                            }
                            
                            return `
                                <div class="glass interactive-roll-row" 
                                     style="
                                        padding: 14px 18px; 
                                        border-radius: 12px; 
                                        border: 1px solid rgba(255,255,255,0.05); 
                                        background: rgba(10,12,16,0.3);
                                        display: flex; 
                                        justify-content: space-between; 
                                        align-items: center; 
                                        gap: 12px;
                                        transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
                                     ">
                                    <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
                                        <span style="font-size:1.2rem; color:${iconColor};">${icon}</span>
                                        <div style="min-width:0; flex:1;">
                                            <strong style="color:#fff; font-size:0.82rem; font-family:'Cinzel'; display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${act.name}</strong>
                                            <span style="font-size:0.65rem; color:var(--text-dim); display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${act.detail}</span>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-ghost hover-scale" 
                                            data-action="rollChallengeAction" 
                                            data-type="${act.type}"
                                            data-key="${act.key || ''}"
                                            data-index="${act.index !== undefined ? act.index : ''}"
                                            data-name="${act.name}"
                                            data-bonus="${act.bonus}"
                                            style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; border-color: rgba(197,160,89,0.3); color: var(--accent); cursor: pointer; flex-shrink:0;">
                                        🎲 Rolar
                                    </button>
                                </div>
                            `;
                        }).join('') : `
                            <div style="grid-column: 1 / -1; opacity:0.4; font-size:0.8rem; text-align:center; padding:30px; font-style:italic;">
                                Nenhuma ação correspondente encontrada para este filtro.
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }
}
