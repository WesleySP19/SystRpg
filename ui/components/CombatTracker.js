import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { CombatTimer } from '../components/CombatTimer.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { MonsterData } from '../../data/MonsterData.js';

/**
 * DYNAMIC TACTICAL COMBAT ENGINE v6.0 — "Elysium Arena"
 * Fully implements D&D 5e Action Economy, Advantage/Disadvantage, 
 * Dynamic Initiative sorting, established Monster Library integration,
 * active combatant/target highlighting, and a highly visual, animated Dice Roller.
 */
export class CombatTracker extends Component {
    constructor(opts) {
        super(opts);
        this._turnIndex = 0;
        this._targetId = null; // Single target ID for automation
        this._viewMode = 'tracker';
        this._rollMod = 'normal';
        this._tempDamage = "";
        this._battleLog = []; // Persistent Log storage
        this._selectedCR = 'Nível 1';
        this._searchQuery = '';
        
        // Cache variables for granular rendering
        this._lastOrderJson = "";
        this._lastTurnIndex = 0;
        this._lastTargetId = null;
        this._lastActiveRoll = null;
        this._lastShowDetailsId = null;
        this._lastRollMod = 'normal';
        
        // Economy state (reset each turn start)
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        this._selectedCondition = 'caído';
        this._showDetailsId = null; // State for Modal
        this._activeRoll = null; // State for Visual Dice Roller

        // Timer de Turno
        this._timerDuration = 30; // segundos (0 = desligado)
        this._timer = new CombatTimer({
            duration: this._timerDuration,
            onExpire: () => {
                Toast.show('⏰ Tempo esgotado! Próximo turno.', 'warning');
                const timerEl = document.getElementById('combat-timer-bar');
                if (timerEl) timerEl.style.animation = 'timerExpire 0.5s ease';
            },
            onTick: (remaining, pct) => {
                // Atualiza apenas o elemento do timer sem re-render completo
                const timerEl = document.getElementById('combat-timer-bar');
                if (timerEl) this._timer.renderInto(timerEl, this._currentActorName);
            }
        });
        this._currentActorName = '';

        // Narrative Quotes
        this._narrativeQuotes = {
            hit: [
                "A lâmina corta o ar com precisão!",
                "Um golpe certeiro nas defesas do inimigo!",
                "O impacto ressoa por toda a arena!",
                "Sangue e faíscas voam com o acerto!",
                "O ataque encontra uma brecha na armadura!"
            ],
            miss: [
                "O golpe passa raspando!",
                "A defesa se mantém impenetrável.",
                "O herói vacila por um momento...",
                "O ataque atinge apenas o vácuo.",
                "Um desvio ágil no último segundo!"
            ],
            crit: [
                "UM GOLPE LENDÁRIO! A criatura cambaleia!",
                "PERFEIÇÃO TÁTICA! O dano é devastador!",
                "A força do destino guia esta arma!"
            ]
        };
    }

    _getNarrative(type, targetName, damage = 0) {
        const base = this._narrativeQuotes[type][Math.floor(Math.random() * this._narrativeQuotes[type].length)];
        if (type === 'hit' || type === 'crit') {
            return `${base} <br> ⚔️ <strong>${targetName}</strong> sofre <strong>${damage}</strong> de dano!`;
        }
        return `${base} <br> 🛡️ <strong>${targetName}</strong> escapa ileso!`;
    }

    onMount() {
        // Renderiza o timer visual após cada ciclo de DOM
        const timerEl = document.getElementById('combat-timer-bar');
        if (timerEl && this._timerDuration > 0) {
            this._timer.renderInto(timerEl, this._currentActorName);
        } else if (timerEl) {
            timerEl.innerHTML = '';
        }

        // Bind events that may be inside modal or sub-templates
        const rootModal = this.element.querySelector('.combat-tracker-root');
        if (rootModal) rootModal.__component = this;

        // Auto focus search query if searched
        const searchEl = this.$('#monster-lib-search');
        if (searchEl && this._searchQuery) {
            searchEl.focus();
            searchEl.setSelectionRange(searchEl.value.length, searchEl.value.length);
        }

        // Cache last states for surgical DOM updates
        const { initiativeOrder } = this.store.state;
        const sanitizedOrder = (initiativeOrder || []).map(c => {
            const hp = RulesEngine.getHP(c);
            return { id: c.id, name: c.name, type: c.type, hp_current: hp.current, hp_max: hp.max, conditions: [...(c.conditions || [])] };
        });
        this._lastOrderJson = JSON.stringify(sanitizedOrder);
        this._lastTurnIndex = this._turnIndex;
        this._lastTargetId = this._targetId;
        this._lastActiveRoll = this._activeRoll;
        this._lastShowDetailsId = this._showDetailsId;
        this._lastRollMod = this._rollMod;
    }

    onStoreUpdate(state) {
        if (state.activeView !== 'combat') return; // Only apply if combat tab is active

        const { initiativeOrder } = state;
        const sanitizedOrder = (initiativeOrder || []).map(c => {
            const hp = RulesEngine.getHP(c);
            return { id: c.id, name: c.name, type: c.type, hp_current: hp.current, hp_max: hp.max, conditions: [...(c.conditions || [])] };
        });

        const currentOrderJson = JSON.stringify(sanitizedOrder);

        // If structure or turn details changed, do a full render
        if (currentOrderJson !== this._lastOrderJson ||
            this._turnIndex !== this._lastTurnIndex ||
            this._targetId !== this._lastTargetId ||
            !!this._activeRoll !== !!this._lastActiveRoll ||
            this._showDetailsId !== this._lastShowDetailsId ||
            this._rollMod !== this._lastRollMod) {
            
            this.render();
            return;
        }

        // Otherwise, update HP bars and numbers surgically
        sanitizedOrder.forEach(c => {
            const cardEl = this.element.querySelector(`[data-id="${c.id}"]`);
            if (cardEl) {
                // Update HP text
                const hpTextEl = cardEl.querySelector('div[style*="justify-content:space-between"] span:first-child');
                if (hpTextEl) {
                    hpTextEl.textContent = `HP: ${c.hp_current}/${c.hp_max}`;
                }
                const hpPctTextEl = cardEl.querySelector('div[style*="justify-content:space-between"] span:last-child');
                if (hpPctTextEl) {
                    hpPctTextEl.textContent = `${Math.round((c.hp_current/c.hp_max)*100)}%`;
                }
                // Update HP fill
                const hpBarFillEl = cardEl.querySelector('div[style*="height:4px"] div[style*="height:100%"]');
                if (hpBarFillEl) {
                    const pct = Math.min(100, Math.max(0, Math.round((c.hp_current/c.hp_max)*100)));
                    hpBarFillEl.style.width = `${pct}%`;
                    hpBarFillEl.style.background = c.hp_current <= 0 ? 'var(--text-dim)' : (c.type === 'Player' ? 'var(--success)' : 'var(--danger)');
                }
            }
        });

        // Update VS / Duel HP views
        const currentActor = sanitizedOrder[this._turnIndex];
        const targetActor = sanitizedOrder.find(c => c.id === this._targetId);

        if (currentActor) {
            const currentVsCard = this.element.querySelector('.combat-tracker-root div[style*="border:2px solid var(--accent)"]');
            if (currentVsCard) {
                const currentHpText = currentVsCard.querySelector('span[style*="color:var(--success)"]');
                if (currentHpText) currentHpText.textContent = `${currentActor.hp_current} / ${currentActor.hp_max} HP`;
                const currentHpFill = currentVsCard.querySelector('div[style*="background:var(--success)"]');
                if (currentHpFill) currentHpFill.style.width = `${Math.min(100, Math.max(0, (currentActor.hp_current/currentActor.hp_max)*100))}%`;
            }

            const wideCard = this.element.querySelector('.combat-tracker-root div[style*="border-bottom: 4px solid"]');
            if (wideCard) {
                const wideHpVal = wideCard.querySelector('div[style*="color:var(--success)"], div[style*="color:var(--danger)"]');
                if (wideHpVal) wideHpVal.textContent = String(currentActor.hp_current);
                const wideHpMax = wideCard.querySelector('div[style*="opacity:0.5"]');
                if (wideHpMax) wideHpMax.textContent = `/ ${currentActor.hp_max} HP`;
            }
        }

        if (targetActor) {
            const targetVsCard = this.element.querySelector('.combat-tracker-root div[style*="border:2px dashed var(--danger)"]');
            if (targetVsCard) {
                const targetHpText = targetVsCard.querySelector('span[style*="color:var(--danger)"]');
                if (targetHpText) targetHpText.textContent = `${targetActor.hp_current} / ${targetActor.hp_max} HP`;
                const targetHpFill = targetVsCard.querySelector('div[style*="background:var(--danger)"]');
                if (targetHpFill) targetHpFill.style.width = `${Math.min(100, Math.max(0, (targetActor.hp_current/targetActor.hp_max)*100))}%`;
            }
        }

        // Sync local _lastHTML cache
        this._lastHTML = this.template().trim();
    }

    template() {
        const { initiativeOrder, combatRound } = this.store.state;
        const sanitizedOrder = (initiativeOrder || []).map(c => {
            const hp = RulesEngine.getHP(c);
            return { ...c, hp_current: hp.current, hp_max: hp.max };
        });
        const current = sanitizedOrder[this._turnIndex];

        // Insert gorgeous styling inline to keep styles fully self-contained and modular
        const customStyle = `
            <style>
                @keyframes pulseActiveTurn {
                    0% { box-shadow: 0 0 10px rgba(197, 160, 89, 0.4), inset 0 0 5px rgba(197, 160, 89, 0.2); border-color: rgba(197, 160, 89, 0.8); }
                    50% { box-shadow: 0 0 25px rgba(197, 160, 89, 0.8), inset 0 0 15px rgba(197, 160, 89, 0.4); border-color: rgba(229, 193, 123, 1); }
                    100% { box-shadow: 0 0 10px rgba(197, 160, 89, 0.4), inset 0 0 5px rgba(197, 160, 89, 0.2); border-color: rgba(197, 160, 89, 0.8); }
                }

                @keyframes pulseTargeted {
                    0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), inset 0 0 5px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.8); }
                    50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.9), inset 0 0 15px rgba(239, 68, 68, 0.5); border-color: rgba(248, 113, 113, 1); }
                    100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.4), inset 0 0 5px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.8); }
                }

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

                .combatant-card {
                    position: relative;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .combatant-card.active-turn {
                    animation: pulseActiveTurn 2s infinite ease-in-out;
                    border: 2px solid var(--accent) !important;
                    background: rgba(197, 160, 89, 0.08) !important;
                }

                .combatant-card.target-selected {
                    animation: pulseTargeted 1.5s infinite ease-in-out;
                    border: 2px dashed var(--danger) !important;
                    background: rgba(239, 68, 68, 0.08) !important;
                }

                .versus-clash {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .versus-badge {
                    background: linear-gradient(135deg, var(--danger), var(--accent));
                    color: white;
                    font-family: 'Cinzel', serif;
                    font-weight: 900;
                    padding: 8px 16px;
                    border-radius: 50%;
                    border: 2.5px solid var(--bg-surface);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    z-index: 5;
                    font-size: 1rem;
                    animation: diceShake 2s infinite;
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

                /* ── Action Economy Token Buttons ── */
                .action-token {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    border: 1.5px solid;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
                    padding: 0;
                    line-height: 1;
                }
                .token-available {
                    background: rgba(34,197,94,0.12);
                    border-color: rgba(34,197,94,0.45);
                    box-shadow: 0 0 8px rgba(34,197,94,0.25);
                }
                .token-available:hover {
                    background: rgba(34,197,94,0.22);
                    transform: scale(1.1);
                    box-shadow: 0 0 14px rgba(34,197,94,0.4);
                }
                .token-spent {
                    background: rgba(100,116,139,0.08);
                    border-color: rgba(100,116,139,0.2);
                    opacity: 0.45;
                    filter: grayscale(1);
                    cursor: default;
                }
                .token-reset {
                    background: rgba(197,160,89,0.1);
                    border-color: rgba(197,160,89,0.3);
                    color: #c5a059;
                    font-size: 1.1rem !important;
                }
                .token-reset:hover {
                    background: rgba(197,160,89,0.2);
                    transform: rotate(180deg) scale(1.1);
                }
            </style>
        `;

        if (!sanitizedOrder?.length) {
            return `
                ${customStyle}
                <div class="page animate-fadeIn">
                    <div class="card glass-accent" style="max-width:700px; margin: 60px auto; padding:40px; text-align:center; border: 1.5px solid rgba(197, 160, 89, 0.2); box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
                        <i class="fa-solid fa-swords fa-4x" style="color:var(--accent); margin-bottom:20px;"></i>
                        <h2 style="font-family:'Cinzel'; font-size:2.2rem; color:var(--accent); text-shadow:0 0 15px rgba(197, 160, 89, 0.3);">Arena Tática</h2>
                        <p style="color:var(--text-dim); margin-bottom:30px; font-size: 0.95rem;">Pronto para iniciar uma batalha? Insira os heróis e monstros em combate.</p>
                        
                        <!-- CONFIGURAÇÕES DE TRILHA -->
                        <div style="margin: 20px 0 30px; display:grid; grid-template-columns: 1fr 1fr; gap:15px; text-align:left; border-top:1px solid rgba(255,255,255,0.08); padding-top:20px;">
                            <div>
                                <label style="font-size:0.7rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-music"></i> TRILHA DE COMBATE</label>
                                <select class="form-select" id="combat-audio-select" style="width:100%; margin-top:6px;">
                                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">⚔️ Batalha Épica (Helix 1)</option>
                                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">💀 Encontro Sombrio (Helix 3)</option>
                                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3">🔥 Fúria do Dragão (Helix 5)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.7rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-tree"></i> TRILHA AMBIENTE</label>
                                <select class="form-select" id="explore-audio-select" style="width:100%; margin-top:6px;">
                                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3">🌿 Exploração Épica (Helix 2)</option>
                                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3">🌲 Floresta Misteriosa (Helix 4)</option>
                                    <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3">🍺 Taverna Alegre (Helix 8)</option>
                                </select>
                            </div>
                        </div>

                        <button class="btn btn-primary btn-lg btn-block" style="padding:15px; font-family:'Cinzel'; font-size:1.1rem; letter-spacing:1px;" data-action="rollInitiative">
                            <i class="fa-solid fa-dice-d20"></i> GERAR INICIATIVA AUTOMÁTICA
                        </button>
                    </div>
                </div>
            `;
        }

        const target = sanitizedOrder.find(c => c.id === this._targetId);

        return `
            ${customStyle}
            <div class="page animate-fadeIn combat-tracker-root" style="max-width:1500px; margin: 0 auto; padding-bottom: 50px;">
                
                <!-- TOP HEADER BAR -->
                <div class="section-header" style="margin-bottom:20px; background: rgba(0,0,0,0.2); padding: 15px 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel'; font-size:1.8rem; margin:0; display:flex; align-items:center; gap:12px;">
                            <span style="color:var(--danger); text-shadow:0 0 10px rgba(239, 68, 68, 0.4);">⚔️</span> Arena Tática
                        </h2>
                        <p class="section-subtitle" style="margin:4px 0 0 0; color:var(--text-dim);">
                            Rodada ${combatRound || 1} • Turno de <strong style="color:var(--accent);">${current?.name}</strong>
                        </p>
                    </div>
                    
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div class="glass" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:12px; font-size:0.6rem; color:var(--success); border: 1px solid rgba(34, 197, 94, 0.2);">
                            <span class="status-dot" style="display:inline-block; width:6px; height:6px; background:var(--success); border-radius:50%; animation: pulse 1.5s infinite;"></span>
                            <span>SINCRO ÁUDIO ATIVO</span>
                        </div>
                        <div id="combat-timer-bar" style="min-width:180px;"></div>
                        
                        <div class="glass" style="display:flex; padding:4px; border-radius:8px; background:rgba(0,0,0,0.3);">
                            <button class="btn btn-sm ${this._rollMod === 'advantage' ? 'btn-primary' : 'btn-ghost'}" style="padding:4px 10px; font-size:0.65rem;" data-action="setRollMod" data-mode="advantage">VANT</button>
                            <button class="btn btn-sm ${this._rollMod === 'normal' ? 'btn-primary' : 'btn-ghost'}" style="padding:4px 10px; font-size:0.65rem;" data-action="setRollMod" data-mode="normal">NORM</button>
                            <button class="btn btn-sm ${this._rollMod === 'disadvantage' ? 'btn-primary' : 'btn-ghost'}" style="padding:4px 10px; font-size:0.65rem;" data-action="setRollMod" data-mode="disadvantage">DESV</button>
                        </div>
                        
                        <button class="btn btn-primary" style="font-family:'Cinzel';" data-action="nextTurn">PRÓXIMO TURNO <i class="fa-solid fa-chevron-right"></i></button>
                        <button class="btn btn-danger btn-sm" style="padding:8px 12px;" data-action="endCombat" title="Encerrar Combate"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>

                <!-- MAIN WORKSPACE: 3 COLUMNS -->
                <div style="display:grid; grid-template-columns: 310px 1fr 340px; gap:var(--space-md); align-items:start;">
                    
                    <!-- COLUMN 1: INITIATIVE QUEUE (DYNAMIC POSITIONING) -->
                    <div class="glass" style="padding:15px; border-radius:15px; background: rgba(15, 17, 21, 0.4); max-height:82vh; overflow-y:auto; display:flex; flex-direction:column; gap:10px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px;">
                            <label style="font-size:0.65rem; font-weight:800; color:var(--accent); letter-spacing:1px;">ORDEM DE INICIATIVA</label>
                            <span class="badge badge-ghost" style="font-size:0.55rem;">${sanitizedOrder.length} Combatentes</span>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${sanitizedOrder.map((c, i) => {
                                const isActive = i === this._turnIndex;
                                const isTarget = this._targetId === c.id;
                                
                                return `
                                    <div class="card combatant-card ${isActive ? 'active-turn' : ''} ${isTarget ? 'target-selected' : ''}" 
                                         style="padding:10px; border-left:4px solid ${c.type === 'Player' ? 'var(--info)' : 'var(--danger)'}; cursor:pointer; background:rgba(255,255,255,0.01);"
                                         data-action="selectTarget" data-id="${c.id}">
                                        
                                        <!-- DYNAMIC ORDER SHIFTING BUTTONS -->
                                        <div style="position:absolute; right:8px; top:8px; display:flex; gap:3px; z-index:10;">
                                            <button class="btn btn-ghost" style="padding:2px 5px; font-size:0.6rem; border-radius:3px; background:rgba(0,0,0,0.4);" 
                                                    data-action="moveUp" data-id="${c.id}" title="Subir Iniciativa" onclick="event.stopPropagation()">
                                                ▲
                                            </button>
                                            <button class="btn btn-ghost" style="padding:2px 5px; font-size:0.6rem; border-radius:3px; background:rgba(0,0,0,0.4);" 
                                                    data-action="moveDown" data-id="${c.id}" title="Descer Iniciativa" onclick="event.stopPropagation()">
                                                ▼
                                            </button>
                                            <button class="btn btn-ghost" style="padding:2px 5px; font-size:0.6rem; border-radius:3px; color:var(--danger); background:rgba(0,0,0,0.4);" 
                                                    data-action="removeActor" data-id="${c.id}" title="Remover" onclick="event.stopPropagation()">
                                                <i class="fa-solid fa-trash-can" style="font-size:0.6rem;"></i>
                                            </button>
                                        </div>

                                        <div style="display:flex; gap:10px; align-items:center; padding-right:60px;">
                                            <div class="token-avatar" style="width:34px; height:34px; border-radius:50%; border:1.5px solid ${c.type === 'Player' ? 'var(--info)' : 'var(--danger)'}; background-image:url('${c.img || c.portraitData || (c.type !== 'Player' ? MonsterArt.getImage(c) : '') || ''}'); background-size:cover; flex-shrink:0;">
                                                ${!(c.img || c.portraitData || (c.type !== 'Player' ? MonsterArt.getImage(c) : null)) ? c.name.substring(0,2) : ''}
                                            </div>
                                            <div style="flex:1; min-width:0;">
                                                <div style="display:flex; align-items:center; gap:5px;">
                                                    ${c.type === 'Player' ? `
                                                        <span style="font-weight:700; font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:${isActive ? 'var(--accent-bright)' : '#fff'}; cursor:pointer; text-decoration:underline; text-underline-offset:2px;" 
                                                              title="Clique para abrir a Ficha de ${c.name}"
                                                              onmouseover="this.style.color='var(--accent)'"
                                                              onmouseout="this.style.color='${isActive ? 'var(--accent-bright)' : '#fff'}'"
                                                              data-action="viewHeroSheet" 
                                                              data-id="${c.id}">${c.name}</span>
                                                    ` : `
                                                        <span style="font-weight:700; font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:${isActive ? 'var(--accent-bright)' : '#fff'};">${c.name}</span>
                                                    `}
                                                    ${isActive ? '<span style="font-size:0.5rem; background:var(--accent); color:black; padding:1px 4px; border-radius:3px; font-weight:800;">VEZ</span>' : ''}
                                                    ${isTarget ? '<span style="font-size:0.5rem; background:var(--danger); color:white; padding:1px 4px; border-radius:3px; font-weight:800;">ALVO</span>' : ''}
                                                </div>
                                                <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">
                                                    Inic: <strong>${c.init}</strong> | CA <strong>${c.ac}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- HP Mini Bar -->
                                        <div style="margin-top:8px;">
                                            <div style="display:flex; justify-content:space-between; font-size:0.55rem; opacity:0.7; margin-bottom:2px;">
                                                <span>HP: ${c.hp_current}/${c.hp_max}</span>
                                                <span>${Math.round((c.hp_current/c.hp_max)*100)}%</span>
                                            </div>
                                            <div style="height:4px; background:rgba(0,0,0,0.4); border-radius:2px; overflow:hidden;">
                                                <div style="height:100%; width:${Math.min(100, (c.hp_current/c.hp_max)*100)}%; background:${c.hp_current <= 0 ? 'var(--text-dim)' : (c.type==='Player'?'var(--success)':'var(--danger)')}; transition: width 0.3s ease;"></div>
                                            </div>
                                        </div>

                                        <!-- Conditions List -->
                                        ${c.conditions?.length ? `
                                            <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:6px;">
                                                ${c.conditions.map(cond => `<span style="font-size:0.55rem; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:var(--danger); padding:1px 5px; border-radius:3px; text-transform:uppercase;">${cond}</span>`).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- COLUMN 2: CENTRAL ARENA & DUEL INTERFACE -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                        
                        <!-- DUAL / DUEL VIEW (If a target is selected) -->
                        ${target ? `
                            <div class="card glass-accent" style="padding:25px; border-radius:20px; border-bottom:4px solid var(--accent); background:rgba(197, 160, 89, 0.02);">
                                
                                <div style="display:grid; grid-template-columns: 1fr 100px 1fr; gap:15px; align-items:center;">
                                    
                                    <!-- ACTIVE CHARACTER CARD -->
                                    <div class="glass" style="padding:20px; border-radius:15px; border:2px solid var(--accent); position:relative; background:rgba(197,160,89,0.06);">
                                        <span style="position:absolute; top:12px; left:12px; font-size:0.55rem; background:var(--accent); color:black; font-weight:800; padding:2px 8px; border-radius:4px; letter-spacing:0.5px;">VEZ ATUAL</span>
                                        
                                        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; margin-top:10px;">
                                            <div class="token-avatar" style="width:75px; height:75px; border: 3px solid var(--accent); background-image:url('${current?.img || current?.portraitData || (current?.type !== 'Player' ? MonsterArt.getImage(current) : '') || ''}');">
                                                ${!(current?.img || current?.portraitData || (current?.type !== 'Player' ? MonsterArt.getImage(current) : null)) ? current?.name.substring(0,2) : ''}
                                            </div>
                                            ${current?.type === 'Player' ? `
                                                <h3 style="font-family:'Cinzel'; margin:12px 0 4px 0; font-size:1.4rem; color:var(--accent); cursor:pointer; text-decoration:underline;" 
                                                    title="Clique para abrir a Ficha de ${current.name}"
                                                    onmouseover="this.style.color='var(--accent-bright)'"
                                                    onmouseout="this.style.color='var(--accent)'"
                                                    data-action="viewHeroSheet" data-id="${current.id}">${current.name}</h3>
                                            ` : `
                                                <h3 style="font-family:'Cinzel'; margin:12px 0 4px 0; font-size:1.4rem; color:var(--accent);">${current?.name}</h3>
                                            `}
                                            <span class="badge ${current?.type === 'Player' ? 'badge-info' : 'badge-danger'}" style="font-size:0.6rem;">${current?.type === 'Player' ? 'Herói' : 'Criatura'}</span>
                                            
                                            <!-- Economia de Ações clicáveis -->
                                            <div style="display:flex; gap:5px; margin-top:12px;" title="Clique para consumir ação">
                                                <button class="action-token ${this._economy.action ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="action" title="${this._economy.action ? 'Gastar Ação' : 'Ação usada'}" onclick="event.stopPropagation()">
                                                    ⚔️
                                                </button>
                                                <button class="action-token ${this._economy.bonus ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="bonus" title="${this._economy.bonus ? 'Gastar Bônus' : 'Bônus usado'}" onclick="event.stopPropagation()">
                                                    ⚡
                                                </button>
                                                <button class="action-token ${this._economy.reaction ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="reaction" title="${this._economy.reaction ? 'Gastar Reação' : 'Reação usada'}" onclick="event.stopPropagation()">
                                                    🛡️
                                                </button>
                                                <button class="action-token token-reset" data-action="resetEconomy" title="Resetar ações" onclick="event.stopPropagation()" style="font-size:0.6rem; letter-spacing:0.5px;">
                                                    ↺
                                                </button>
                                            </div>

                                            <!-- HP Bar -->
                                            <div style="width:100%; margin-top:15px;">
                                                <div style="display:flex; justify-content:space-between; font-size:0.65rem; margin-bottom:4px;">
                                                    <span style="color:var(--success); font-weight:800;">${current?.hp_current} / ${current?.hp_max} HP</span>
                                                </div>
                                                <div style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden;">
                                                    <div style="height:100%; width:${(current?.hp_current/current?.hp_max)*100}%; background:var(--success); transition:width 0.3s;"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- VERSUS BANNER -->
                                    <div class="versus-clash">
                                        <div class="versus-badge">VS</div>
                                    </div>

                                    <!-- SELECTED TARGET CARD -->
                                    <div class="glass" style="padding:20px; border-radius:15px; border:2px dashed var(--danger); position:relative; background:rgba(239,68,68,0.06);">
                                        <button style="position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.5); border:none; color:var(--text-dim); width:20px; height:20px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.6rem;" 
                                                data-action="clearTarget" title="Limpar Alvo">✕</button>
                                        <span style="position:absolute; top:12px; left:12px; font-size:0.55rem; background:var(--danger); color:white; font-weight:800; padding:2px 8px; border-radius:4px; letter-spacing:0.5px;">ALVO SELECIONADO</span>
                                        
                                        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; margin-top:10px;">
                                            <div class="token-avatar" style="width:75px; height:75px; border:3px dashed var(--danger); background-image:url('${target.img || target.portraitData || (target.type !== 'Player' ? MonsterArt.getImage(target) : '') || ''}');">
                                                ${!(target.img || target.portraitData || (target.type !== 'Player' ? MonsterArt.getImage(target) : null)) ? target.name.substring(0,2) : ''}
                                            </div>
                                            ${target.type === 'Player' ? `
                                                <h3 style="font-family:'Cinzel'; margin:12px 0 4px 0; font-size:1.4rem; color:var(--danger); cursor:pointer; text-decoration:underline;" 
                                                    title="Clique para abrir a Ficha de ${target.name}"
                                                    onmouseover="this.style.color='var(--accent)'"
                                                    onmouseout="this.style.color='var(--danger)'"
                                                    data-action="viewHeroSheet" data-id="${target.id}">${target.name}</h3>
                                            ` : `
                                                <h3 style="font-family:'Cinzel'; margin:12px 0 4px 0; font-size:1.4rem; color:var(--danger);">${target.name}</h3>
                                            `}
                                            <span class="badge ${target.type === 'Player' ? 'badge-info' : 'badge-danger'}" style="font-size:0.6rem;">CA ${target.ac || 10}</span>

                                            <!-- HP Bar -->
                                            <div style="width:100%; margin-top:20px;">
                                                <div style="display:flex; justify-content:space-between; font-size:0.65rem; margin-bottom:4px;">
                                                    <span style="color:var(--danger); font-weight:800;">${target.hp_current} / ${target.hp_max} HP</span>
                                                </div>
                                                <div style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden;">
                                                    <div style="height:100%; width:${(target.hp_current/target.hp_max)*100}%; background:var(--danger); transition:width 0.3s;"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ` : `
                            <!-- WIDESCREEN ACTIVE HERO VIEW -->
                            <div class="card glass-accent" style="padding:25px; border-radius:20px; border-bottom: 4px solid ${current?.type === 'Player' ? 'var(--info)' : 'var(--danger)'};">
                                <div style="display:flex; gap:25px; align-items:center; margin-bottom:20px;">
                                    <div class="token-avatar" style="width:85px; height:85px; border-width:3px; border-color:${current?.type === 'Player' ? 'var(--info)' : 'var(--danger)'}; background-image: url('${current?.img || current?.portraitData || (current?.type !== 'Player' ? MonsterArt.getImage(current) : '') || ''}');">
                                        ${!(current?.img || current?.portraitData || (current?.type !== 'Player' ? MonsterArt.getImage(current) : null)) ? current?.name.substring(0,2) : ''}
                                    </div>
                                    <div style="flex:1;">
                                        <div style="display:flex; align-items:center; gap:8px;">
                                            ${current?.type === 'Player' ? `
                                                <h3 style="margin:0; font-family:'Cinzel'; font-size:1.8rem; color:var(--accent); cursor:pointer; text-decoration:underline;" 
                                                    title="Clique para abrir a Ficha de ${current.name}"
                                                    onmouseover="this.style.color='var(--accent-bright)'"
                                                    onmouseout="this.style.color='var(--accent)'"
                                                    data-action="viewHeroSheet" data-id="${current.id}">${current.name}</h3>
                                            ` : `
                                                <h3 style="margin:0; font-family:'Cinzel'; font-size:1.8rem; color:var(--accent);">${current?.name}</h3>
                                            `}
                                            <span class="badge ${current?.type === 'Player' ? 'badge-info' : 'badge-danger'}" style="font-size:0.6rem;">${current?.type === 'Player' ? 'Herói' : 'Criatura'}</span>
                                        </div>
                                        <div style="display:flex; gap:5px; margin-top:8px;" title="Clique para consumir ação">
                                            <button class="action-token ${this._economy.action ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="action" title="${this._economy.action ? 'Gastar Ação' : 'Ação usada'}">
                                                ⚔️
                                            </button>
                                            <button class="action-token ${this._economy.bonus ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="bonus" title="${this._economy.bonus ? 'Gastar Bônus' : 'Bônus usado'}">
                                                ⚡
                                            </button>
                                            <button class="action-token ${this._economy.reaction ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="reaction" title="${this._economy.reaction ? 'Gastar Reação' : 'Reação usada'}">
                                                🛡️
                                            </button>
                                            <button class="action-token token-reset" data-action="resetEconomy" title="Resetar ações" style="font-size:0.6rem; letter-spacing:0.5px;">
                                                ↺
                                            </button>
                                            <span class="badge badge-primary" style="font-size:0.6rem; margin-left:4px;">${this._economy.movement}ft</span>
                                        </div>
                                    </div>
                                    <div style="text-align:right;">
                                        <div style="font-size:2.2rem; font-weight:900; line-height:1; color:${current?.hp_current <= 0 ? 'var(--danger)' : 'var(--success)'};">${current?.hp_current}</div>
                                        <div style="font-size:0.75rem; opacity:0.5;">/ ${current?.hp_max} HP</div>
                                    </div>
                                </div>
                                
                                <div class="glass" style="padding:15px; border-radius:10px; background:rgba(0,0,0,0.25); text-align:center; border: 1px dashed rgba(255,255,255,0.08);">
                                    <span style="font-size:0.8rem; color:var(--text-dim);"><i class="fa-solid fa-crosshairs" style="color:var(--danger); margin-right:6px;"></i> Selecione um oponente ou alvo na fila de iniciativa ao lado para travar ações diretas!</span>
                                </div>
                            </div>
                        `}

                        <!-- ACTIONS PANEL -->
                        <div class="card glass" style="padding:22px; border-radius:15px; border:1px solid rgba(255,255,255,0.06);">
                            <h4 style="font-size:0.75rem; color:var(--accent); margin:0 0 15px 0; letter-spacing:1px; text-transform:uppercase; font-family:'Cinzel'; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-bolt" style="color:var(--accent);"></i> HABILIDADES E ATAQUES DISPONÍVEIS
                            </h4>
                            
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
                                ${this._getActorActions(current).map((a, i) => `
                                    <div class="glass" style="padding:14px; display:flex; justify-content:space-between; align-items:center; border-radius:12px; border:1px solid rgba(255,255,255,0.05); transition:all 0.2s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
                                        <div style="font-size:0.8rem; padding-right:10px; min-width:0;">
                                            <div style="font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${a.name}</div>
                                            <div style="font-size:0.65rem; opacity:0.6; margin-top:2px;">
                                                ${a.bonus !== undefined ? `+${a.bonus} Acerto` : 'Ataque Especial'} | ${a.damage || '1d6'}
                                            </div>
                                        </div>
                                        <button class="btn btn-primary btn-sm" style="font-size:0.6rem; padding:6px 12px; border-radius:6px; flex-shrink:0;" 
                                                data-action="rollPlayerAttack" data-index="${i}">
                                            ⚔️ ROLAR
                                        </button>
                                    </div>
                                `).join('')}
                                
                                ${!this._getActorActions(current).length ? `
                                    <div style="grid-column: 1 / -1; text-align:center; padding:20px; opacity:0.4; font-size:0.8rem;">
                                        Nenhum ataque predefinido para esta ficha.<br>Use os controles manuais abaixo para aplicar dano direto ou cura.
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- MANUAL CONTROLS PANEL -->
                        <div class="card glass" style="padding:20px; border-radius:15px; background:rgba(0,0,0,0.25);">
                            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                                
                                <!-- Dmg / Heal Input -->
                                <div>
                                    <label class="form-label" style="font-size:0.65rem;">Causar Dano / Cura Rápida</label>
                                    <div style="display:flex; gap:8px; margin-top:6px;">
                                        <input type="text" class="form-input" id="player-dmg-input" style="flex:1;" placeholder="Ex: 2d6+3 ou 10">
                                        <button class="btn btn-primary" style="font-size:0.75rem; padding:6px 16px;" data-action="applyPlayerAction">Aplicar</button>
                                    </div>
                                </div>
                                
                                <!-- Consumables / Economy -->
                                <div>
                                    <label class="form-label" style="font-size:0.65rem;">Economia de Ações</label>
                                    <div style="display:flex; gap:4px; margin-top:6px; flex-wrap:wrap;">
                                        <button class="action-token ${this._economy.action ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="action" style="width:auto; padding:4px 10px; font-size:0.65rem;">
                                            ⚔️ Ação
                                        </button>
                                        <button class="action-token ${this._economy.bonus ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="bonus" style="width:auto; padding:4px 10px; font-size:0.65rem;">
                                            ⚡ Bônus
                                        </button>
                                        <button class="action-token ${this._economy.reaction ? 'token-available' : 'token-spent'}" data-action="consumeEconomy" data-type="reaction" style="width:auto; padding:4px 10px; font-size:0.65rem;">
                                            🛡️ Reação
                                        </button>
                                        <button class="action-token token-reset" data-action="resetEconomy" style="width:auto; padding:4px 10px; font-size:0.65rem;">
                                            ↺ Resetar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style="margin-top:15px; padding-top:12px; border-top: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                                <div style="display:flex; gap:6px; align-items:center;">
                                    <select class="form-select" style="font-size:0.7rem; width:130px;" id="cond-select">
                                        <option value="caído">🤕 Caído</option>
                                        <option value="cego">🙈 Cego</option>
                                        <option value="envenenado">🤢 Envenenado</option>
                                        <option value="preso">🕸️ Preso</option>
                                        <option value="incapacitado">😵 Incapacitado</option>
                                        <option value="amaldiçoado">🧿 Amaldiçoado</option>
                                    </select>
                                    <button class="btn btn-ghost btn-sm" style="font-size:0.65rem; padding:5px 12px;" data-action="applyCondition">Aplicar Status</button>
                                </div>
                                <button class="btn btn-danger btn-sm" style="font-size:0.65rem; padding:5px 12px;" data-action="clearConditions">Limpar Status</button>
                            </div>
                        </div>

                        <!-- BATTLE LOG REPORT -->
                        <div class="card glass" style="display:flex; flex-direction:column; padding:0; overflow:hidden; border-radius:15px; border:1px solid rgba(255,255,255,0.04);">
                            <div style="padding:12px 20px; background:rgba(0,0,0,0.3); font-size:0.7rem; font-weight:800; color:var(--danger); border-bottom:1px solid rgba(255,255,255,0.05); font-family:'Cinzel'; letter-spacing:1px;">NARRATIVA E RELATÓRIO DE DANOS</div>
                            <div id="combat-log" style="flex:1; max-height:200px; min-height:120px; overflow-y:auto; padding:15px; display:flex; flex-direction:column-reverse; gap:10px;">
                                ${this._battleLog.length > 0 
                                    ? this._battleLog.map(log => `<div class="animate-fadeIn" style="border-left:3px solid ${log.type === 'danger' ? 'var(--danger)' : log.type === 'success' ? 'var(--success)' : 'var(--info)'}; padding-left:15px; font-size:0.8rem; line-height:1.4;">${log.msg}</div>`).join('')
                                    : '<div style="opacity:0.25; text-align:center; padding:30px; font-size:0.8rem;">O silêncio precede a tempestade...</div>'}
                            </div>
                        </div>

                    </div>

                    <!-- COLUMN 3: ESTABLISHED MONSTER LIBRARY & QUICK ADD -->
                    <div class="glass" style="padding:15px; border-radius:15px; background: rgba(15, 17, 21, 0.4); max-height:82vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px;">
                            <label style="font-size:0.65rem; font-weight:800; color:var(--accent); letter-spacing:1px; display:block; margin-bottom:5px;">BIBLIOTECA DE MONSTROS</label>
                            <span style="font-size:0.55rem; color:var(--text-dim);">Adicione inimigos oficiais da biblioteca 5e</span>
                        </div>

                        <!-- Dropdown de CR -->
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <label style="font-size:0.55rem; font-weight:800; color:var(--text-dim);">DESAFIO / CR</label>
                            <select class="form-select" id="monster-lib-cr-select" style="font-size:0.7rem; padding:6px 10px;" data-action="changeLibraryCR">
                                ${Object.keys(MonsterData || {}).map(cr => `
                                    <option value="${cr}" ${this._selectedCR === cr ? 'selected' : ''}>${cr}</option>
                                `).join('')}
                            </select>
                        </div>

                        <!-- Campo de busca -->
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <input type="text" class="form-input" id="monster-lib-search" style="font-size:0.75rem; padding:6px 10px;" 
                                   placeholder="🔎 Buscar criatura..." value="${this._searchQuery || ''}" data-action="searchLibrary">
                        </div>

                        <!-- Lista de Monstros da Biblioteca -->
                        <div style="display:flex; flex-direction:column; gap:8px; margin-top:5px; max-height:45vh; overflow-y:auto; padding-right:4px;">
                            ${(() => {
                                const query = (this._searchQuery || '').toLowerCase();
                                const list = MonsterData[this._selectedCR] || [];
                                const filtered = list.filter(m => m.name.toLowerCase().includes(query));

                                if (!filtered.length) {
                                    return '<div style="font-size:0.7rem; opacity:0.4; text-align:center; padding:15px;">Nenhuma criatura encontrada.</div>';
                                }

                                return filtered.map(m => `
                                    <div class="glass" style="padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.03); background:rgba(255,255,255,0.01); display:flex; flex-direction:column; gap:6px;">
                                        <div style="display:flex; justify-content:space-between; align-items:center;">
                                            <span style="font-weight:700; font-size:0.75rem; color:var(--accent-bright);">${m.emoji || '🐾'} ${m.name}</span>
                                            <span style="font-size:0.55rem; background:rgba(255,255,255,0.05); padding:1px 4px; border-radius:3px;">CA ${m.ac}</span>
                                        </div>
                                        <div style="font-size:0.6rem; color:var(--text-dim);">
                                            HP: <strong>${m.hp}</strong> | Tipo: <strong>${m.type}</strong>
                                        </div>
                                        
                                        <!-- established attacks preview -->
                                        ${m.actions?.length ? `
                                            <div style="font-size:0.55rem; opacity:0.6; display:flex; flex-direction:column; gap:2px; border-top:1px solid rgba(255,255,255,0.05); padding-top:4px;">
                                                ${m.actions.slice(0, 2).map(act => `
                                                    <div>⚔️ <strong>${act.name}</strong> (${act.damage})</div>
                                                `).join('')}
                                            </div>
                                        ` : ''}

                                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:4px;">
                                            <button class="btn btn-ghost" style="font-size:0.55rem; padding:4px; text-align:center; background:rgba(197,160,89,0.05);" 
                                                    data-action="addMonsterFast" data-name="${m.name}">
                                                ➕ ROLAR INIC
                                            </button>
                                            <button class="btn btn-ghost" style="font-size:0.55rem; padding:4px; text-align:center;" 
                                                    data-action="addMonsterManual" data-name="${m.name}">
                                                ✍️ INIC MANUAL
                                            </button>
                                        </div>
                                    </div>
                                `).join('');
                            })()}
                        </div>
                    </div>

                </div>

                <!-- ESTABLISHED DETAILS MODAL -->
                ${this._showDetailsId ? this._renderMonsterModal() : ''}

                <!-- VISUAL DYNAMIC DICE ROLLER OVERLAY -->
                ${this._activeRoll ? this._renderVisualDiceRoller() : ''}
            </div>
        `;
    }

    // Dynamic library handlers
    changeLibraryCR(e, el) {
        this._selectedCR = el.value;
        this.render();
    }

    searchLibrary(e, el) {
        this._searchQuery = el.value;
        this.render();
    }

    addMonsterFast(e, el) {
        const name = el.dataset.name;
        const monster = (MonsterData[this._selectedCR] || []).find(m => m.name === name);
        if (!monster) return;

        // Roll random initiative: 1d20 + dex modifier
        const dexMod = Math.floor(((monster.stats?.dex || 10) - 10) / 2);
        const roll = Dice.quick(20);
        const initiativeTotal = roll + dexMod;

        // Count how many already in battle to suffix
        const list = this.store.state.initiativeOrder || [];
        const count = list.filter(c => c.name.startsWith(name)).length + 1;
        const uniqueName = count > 1 ? `${name} ${count}` : name;

        TOME.store.update(s => {
            const newActor = {
                id: 'm-' + Date.now() + Math.random().toString(36).substr(2, 4),
                name: uniqueName,
                type: 'Monster',
                ac: monster.ac || 10,
                hp_current: monster.hp,
                hp_max: monster.hp,
                hp: { current: monster.hp, max: monster.hp },
                init: initiativeTotal,
                stats: monster.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 },
                actions: monster.actions || [{ name: 'Ataque Padrão', bonus: 4, damage: '1d6+2' }],
                originalData: monster
            };
            s.initiativeOrder = [...(s.initiativeOrder || []), newActor].sort((a,b) => b.init - a.init);
        });

        Toast.show(`🔥 ${uniqueName} entrou na batalha com Iniciativa ${initiativeTotal}!`, 'success');
        this.render();
    }

    addMonsterManual(e, el) {
        const name = el.dataset.name;
        const monster = (MonsterData[this._selectedCR] || []).find(m => m.name === name);
        if (!monster) return;

        const val = prompt(`Digite a iniciativa manual para ${name}:`, "10");
        if (val === null) return;
        const init = parseInt(val) || 10;

        const list = this.store.state.initiativeOrder || [];
        const count = list.filter(c => c.name.startsWith(name)).length + 1;
        const uniqueName = count > 1 ? `${name} ${count}` : name;

        TOME.store.update(s => {
            const newActor = {
                id: 'm-' + Date.now() + Math.random().toString(36).substr(2, 4),
                name: uniqueName,
                type: 'Monster',
                ac: monster.ac || 10,
                hp_current: monster.hp,
                hp_max: monster.hp,
                hp: { current: monster.hp, max: monster.hp },
                init: init,
                stats: monster.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 },
                actions: monster.actions || [{ name: 'Ataque Padrão', bonus: 4, damage: '1d6+2' }],
                originalData: monster
            };
            s.initiativeOrder = [...(s.initiativeOrder || []), newActor].sort((a,b) => b.init - a.init);
        });

        Toast.show(`🔥 ${uniqueName} adicionado com Iniciativa ${init}!`, 'success');
        this.render();
    }

    // Dynamic manual sorting buttons
    moveUp(e, el) {
        const id = el.dataset.id;
        TOME.store.update(s => {
            const order = s.initiativeOrder || [];
            const idx = order.findIndex(c => c.id === id);
            if (idx > 0) {
                // Swap elements
                const temp = order[idx];
                order[idx] = order[idx - 1];
                order[idx - 1] = temp;

                // Adjust turnIndex to stick with same active actor
                const activeId = order[this._turnIndex]?.id;
                s.initiativeOrder = [...order];
                
                // Recalculate turnIndex based on active actor ID
                const newActiveIdx = s.initiativeOrder.findIndex(c => c.id === activeId);
                if (newActiveIdx !== -1) {
                    this._turnIndex = newActiveIdx;
                }
            }
        });
        this.render();
    }

    moveDown(e, el) {
        const id = el.dataset.id;
        TOME.store.update(s => {
            const order = s.initiativeOrder || [];
            const idx = order.findIndex(c => c.id === id);
            if (idx !== -1 && idx < order.length - 1) {
                // Swap elements
                const temp = order[idx];
                order[idx] = order[idx + 1];
                order[idx + 1] = temp;

                // Adjust turnIndex to stick with same active actor
                const activeId = order[this._turnIndex]?.id;
                s.initiativeOrder = [...order];
                
                // Recalculate turnIndex based on active actor ID
                const newActiveIdx = s.initiativeOrder.findIndex(c => c.id === activeId);
                if (newActiveIdx !== -1) {
                    this._turnIndex = newActiveIdx;
                }
            }
        });
        this.render();
    }

    // Dynamic High-Fidelity visual dice roller overlay
    _renderVisualDiceRoller() {
        const roll = this._activeRoll;
        const isD20Stage = roll.stage === 'd20';
        const isDamageStage = roll.stage === 'damage';
        const isComplete = roll.stage === 'complete';

        return `
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(10,12,16,0.9); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:4000; display:flex; align-items:center; justify-content:center; padding:20px;">
                <div class="card glass-accent animate-scaleIn" style="max-width:550px; width:100%; border:2px solid ${isComplete ? (roll.isHit ? 'var(--success)' : 'var(--danger)') : 'var(--accent)'}; padding:35px; text-align:center; background:var(--bg-surface); box-shadow: 0 25px 60px rgba(0,0,0,0.85);">
                    
                    <!-- Attacker Header info -->
                    <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <span>🛡️ ${roll.attacker.name}</span>
                        <i class="fa-solid fa-right-long" style="color:var(--accent);"></i>
                        <span>🎯 ${roll.target.name}</span>
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
                                                CONCLUIR TURNO
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
                                ✔️ APLICAR RESULTADO E CONTINUAR
                            </button>
                        </div>
                    ` : ''}

                </div>
            </div>
        `;
    }

    startVisualRoll(attacker, target, action) {
        // Initialize roll details
        this._activeRoll = {
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
        this.render();

        // Shaking sound effect
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2771/2771-preview.mp3');

        // Resolve D20 Hit Resolution after a short dramatic delay
        setTimeout(() => {
            const hitRes = RulesEngine.checkHit(action.bonus || 0, target.ac || 10, this._rollMod);
            
            this._activeRoll.rolling = false;
            this._activeRoll.d20Roll = hitRes.roll;
            this._activeRoll.d20Total = hitRes.total;
            this._activeRoll.isCrit = hitRes.isCrit;
            this._activeRoll.isHit = hitRes.success;

            if (hitRes.success) {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');
            } else {
                TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
                
                // Build Miss Narrative right away
                const text = this._getNarrative('miss', target.name);
                this._activeRoll.narrativeText = text;
            }

            this.render();
        }, 1100);
    }

    proceedToDamage() {
        this._activeRoll.stage = 'damage';
        this.render();

        // Play crushing damage sound
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/2770/2770-preview.mp3');

        setTimeout(() => {
            const dmgNotation = this._activeRoll.action.damage || '1d6';
            const dmgRoll = Dice.roll(dmgNotation);
            
            // Critical hits double damage roll outputs in standard D&D rules
            let totalDmg = this._activeRoll.isCrit ? (dmgRoll.total * 2) : dmgRoll.total;
            if (isNaN(totalDmg)) totalDmg = 4; // safe default fallback

            this._activeRoll.stage = 'complete';
            this._activeRoll.damageRolls = dmgRoll.rolls || [totalDmg];
            this._activeRoll.damageTotal = totalDmg;

            // Generate combat description
            const text = this._getNarrative(this._activeRoll.isCrit ? 'crit' : 'hit', this._activeRoll.target.name, totalDmg);
            this._activeRoll.narrativeText = text;

            this.render();
        }, 1100);
    }

    applyVisualRollResult() {
        const roll = this._activeRoll;
        if (roll.isHit && roll.damageTotal) {
            // Apply HP subtraction in the store
            TOME.store.update(s => {
                s.initiativeOrder = s.initiativeOrder.map(c => {
                    if (c.id === roll.target.id) {
                        const newHp = Math.max(0, c.hp_current - roll.damageTotal);
                        
                        // Check death conditions
                        if (newHp === 0) {
                            setTimeout(() => this.handleDeath(c), 500);
                        }

                        return { ...c, hp_current: newHp, hp: { ...c.hp, current: newHp } };
                    }
                    return c;
                });
            });

            // Write Battle log entry
            this._log(`⚔️ <strong>${roll.attacker.name}</strong> usa <strong>${roll.action.name}</strong>:<br>${roll.narrativeText}`, roll.isCrit ? 'danger' : 'success');
        }

        this._activeRoll = null;
        this.render();
    }

    closeVisualRoll() {
        const roll = this._activeRoll;
        // Even on a miss, we register the attempt to the log
        this._log(`🛡️ <strong>${roll.attacker.name}</strong> desfere <strong>${roll.action.name}</strong> contra <strong>${roll.target.name}</strong>, mas falha!`, 'ghost');
        
        this._activeRoll = null;
        this.render();
    }

    _getActorActions(actor) {
        if (!actor) return [];
        
        let actions = actor.actions || [];
        if (actor.type === 'Player' && (!actions.length)) {
            actions = actor.attacks || [];
        }
        
        if (actions.length > 0) {
            return actions;
        }
        
        // Generate default actions for creatures/monsters with empty actions
        if (actor.type === 'Monster' || actor.type === 'Criatura') {
            const nameLower = (actor.name || '').toLowerCase();
            const stats = actor.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
            const strMod = Math.floor(((stats.str || 10) - 10) / 2);
            const dexMod = Math.floor(((stats.dex || 10) - 10) / 2);
            const primaryMod = Math.max(strMod, dexMod);
            
            // Proficiency bonus based on level/CR
            let prof = 2;
            const levelStr = String(actor.level || actor.cr || 'Nível 1');
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
        
        return [];
    }

    rollPlayerAttack(e, el) {
        const actionIdx = parseInt(el.dataset.index);
        const order = this.store.state.initiativeOrder;
        const attacker = order[this._turnIndex];

        if (!this._targetId) {
            Toast.show('Selecione um oponente na fila lateral de iniciativa primeiro!', 'warning');
            return;
        }

        const target = order.find(c => c.id === this._targetId);
        if (!target) return;

        const actions = this._getActorActions(attacker);
        const action = actions[actionIdx] || { name: 'Ataque Corporal', bonus: 0, damage: '1d6' };

        // Execute beautiful visual roll sequence
        this.startVisualRoll(attacker, target, action);
    }

    consumeEconomy(e, el) {
        const type = el.dataset.type;
        if (this._economy[type] === false) return; // já consumido, não faz nada ao clicar no spent
        this._economy[type] = false;
        const names = { action: 'Ação', bonus: 'Ação de Bônus', reaction: 'Reação' };
        Toast.show(`${names[type] || type} consumida neste turno!`, 'info');
        this.render();
    }

    resetEconomy() {
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        Toast.show('Ações resetadas para este turno!', 'success');
        this.render();
    }

    applyPlayerAction() {
        const input = this.$('#player-dmg-input').value;
        if (!input) return;

        if (!this._targetId) {
            Toast.show('Selecione um combatente na fila lateral primeiro!', 'warning');
            return;
        }

        const order = this.store.state.initiativeOrder;
        const currentActor = order[this._turnIndex];
        const target = order.find(c => c.id === this._targetId);
        if (!target) return;

        const res = Dice.roll(input);
        const dmg = res.total || parseInt(input) || 0;

        TOME.store.update(s => {
            s.initiativeOrder = s.initiativeOrder.map(c => {
                if (c.id === target.id) {
                    const currentHP = c.hp?.current !== undefined ? c.hp.current : (c.hp_current || 0);
                    const newHp = Math.max(0, currentHP - dmg);
                    
                    if (newHp === 0) {
                        setTimeout(() => this.handleDeath(c), 500);
                    }

                    return { ...c, hp_current: newHp, hp: { ...c.hp, current: newHp } };
                }
                return c;
            });
        });

        const narrative = this._getNarrative(dmg > 0 ? 'hit' : 'miss', target.name, dmg);
        this._log(`✨ <strong>${currentActor.name}</strong> descarrega energia pura:<br>${narrative}`, dmg > 0 ? 'info' : 'ghost');
        this.$('#player-dmg-input').value = "";
        this.render();
    }

    applyCondition() {
        const cond = this.$('#cond-select').value;
        const current = this.store.state.initiativeOrder[this._turnIndex];
        TOME.store.update(s => {
            s.initiativeOrder = s.initiativeOrder.map(c => {
                if (c.id === current.id) {
                    const conds = new Set(c.conditions || []);
                    conds.add(cond);
                    return { ...c, conditions: Array.from(conds) };
                }
                return c;
            });
        });
        this.render();
        Toast.show(`${current.name} agora está sob efeito de: ${cond}!`);
    }

    clearConditions() {
        const current = this.store.state.initiativeOrder[this._turnIndex];
        TOME.store.update(s => {
            s.initiativeOrder = s.initiativeOrder.map(c => {
                if (c.id === current.id) return { ...c, conditions: [] };
                return c;
            });
        });
        this.render();
        Toast.show(`Condições de status removidas de ${current.name}.`);
    }

    setRollMod(e, el) { 
        this._rollMod = el.dataset.mode; 
        this.render(); 
    }

    selectTarget(e, el) {
        const id = el.dataset.id;
        // Toggles selection
        this._targetId = (this._targetId === id) ? null : id;
        this.render();
    }

    clearTarget() {
        this._targetId = null;
        this.render();
    }

    nextTurn() {
        const order = this.store.state.initiativeOrder || [];
        if (!order.length) return;

        this._turnIndex = (this._turnIndex + 1) % order.length;
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 }; // Reset economy
        this._targetId = null; // Clear active targets for the next turn

        if (this._turnIndex === 0) {
            TOME.store.update(s => s.combatRound = (s.combatRound || 1) + 1);
        }

        // Reset timer for new turn
        if (this._timerDuration > 0) this._timer.restart(this._timerDuration);
        
        const next = order[this._turnIndex];
        this._currentActorName = next?.name || '';
        
        if (next && next.hp_current === 0 && next.type === 'Player') {
            setTimeout(() => {
                if (confirm(`Turno de ${next.name}. Ele está caído! Rolar teste de salvamento de morte?`)) {
                    this.rollDeathSave();
                }
            }, 500);
        }

        this.render();
    }

    rollDeathSave() {
        const current = this.store.state.initiativeOrder[this._turnIndex];
        const res = Dice.roll('1d20').total;
        
        TOME.store.update(s => {
            s.initiativeOrder = s.initiativeOrder.map(c => {
                if (c.id === current.id) {
                    let saves = c.deathSaves || { successes: 0, failures: 0 };
                    if (res >= 10) {
                        saves.successes++;
                        this._log(`👼 <strong>${c.name}</strong> resiste à morte... (Rolagem: ${res})`, 'success');
                    } else {
                        saves.failures++;
                        this._log(`💀 <strong>${c.name}</strong> fraqueja... (Rolagem: ${res})`, 'danger');
                    }
                    
                    if (saves.successes >= 3) {
                        this._log(`🌟 <strong>${c.name}</strong> ESTABILIZOU!`, 'success');
                        return { ...c, hp_current: 1, deathSaves: { successes: 0, failures: 0 } };
                    }
                    if (saves.failures >= 3) {
                        this._log(`🪦 <strong>${c.name}</strong> faleceu no campo de batalha...`, 'danger');
                    }
                    return { ...c, deathSaves: saves };
                }
                return c;
            });
        });
        this.render();
    }

    _log(msg, type = '') {
        const logEntry = { msg, type, time: new Date().toLocaleTimeString() };
        this._battleLog.unshift(logEntry);

        const logEl = this.$('#combat-log');
        if (logEl) {
            // Remove empty state message if it is there
            if (this._battleLog.length === 1) {
                logEl.innerHTML = '';
            }
            const itemHtml = `<div class="animate-fadeIn" style="border-left:3px solid ${type === 'danger' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : 'var(--info)'}; padding-left:15px; font-size:0.8rem; line-height:1.4;">${msg}</div>`;
            logEl.insertAdjacentHTML('afterbegin', itemHtml);
            
            // Sync local _lastHTML cache
            this._lastHTML = this.template().trim();
        } else {
            this.render();
        }
    }

    handleDeath(actor) {
        if (actor.type === 'Player') {
            Toast.show(`🚨 ${actor.name} está caído!`, 'danger');
            return;
        }

        const choice = confirm(`💀 ${actor.name} foi derrotado!\n\nDeseja remover este oponente da batalha e continuar?\n(OK = Remover e Próximo, Cancelar = Manter no campo)`);
        
        if (choice) {
            TOME.store.update(s => {
                s.initiativeOrder = s.initiativeOrder.filter(c => c.id !== actor.id);
            });
            this._log(`🪦 <strong>${actor.name}</strong> tombou em combate e foi removido.`, 'danger');
            
            const monstersLeft = this.store.state.initiativeOrder.filter(c => c.type === 'Monster').length;
            if (monstersLeft === 0) {
                if (confirm('🎉 Todos os inimigos foram derrotados! Ir para o Loot?')) {
                    this.finishBattle();
                }
            } else {
                this.nextTurn();
            }
        }
    }

    finishBattle() {
        const defeatedMonsters = this.store.state.initiativeOrder.filter(c => c.type === 'Monster' && c.hp_current <= 0);
        const totalXP = defeatedMonsters.reduce((acc, m) => {
            const cr = parseFloat(m.originalData?.cr || 0);
            return acc + (cr * 200 || 50); // Simple XP calc: CR * 200
        }, 0);

        const loot = totalXP > 0 ? `${Math.floor(totalXP/2)} PO, e talvez um item mágico menor.` : "Nenhum loot relevante.";

        const report = `
            🏆 VITÓRIA ALCANÇADA!
            
            - XP Total: ${totalXP}
            - Loot Sugerido: ${loot}
            
            Deseja registrar essa vitória no Diário e abrir o Gerador de Loot?
        `;

        if (confirm(report)) {
            TOME.store.update(s => {
                const sessionEntry = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    type: 'combat',
                    title: 'Batalha Finalizada',
                    content: `A equipe venceu o combate contra hordas de inimigos. Recompensas: ${totalXP} XP e ${loot}.`,
                    log: document.getElementById('combat-log')?.innerText || ''
                };
                s.journalEntries = [...(s.journalEntries || []), sessionEntry];
                s.combatActive = false;
                s.initiativeOrder = [];
                s.lastXP = totalXP;
            });

            Toast.show('Vitória registrada! Redirecionando para Loot...', 'success');
            
            // FADE BACK TO EXPLORE/AMBIENT MUSIC AUTOMATICALLY
            const exploreTrack = this.store.state.explorationMusicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
            TOME.audio.fadeTo('music', exploreTrack);

            setTimeout(() => {
                TOME.store.update(s => s.activeTab = 'loot');
            }, 1000);
        }
    }

    rollInitiative() {
        const combatTrack = this.$('#combat-audio-select')?.value || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        const exploreTrack = this.$('#explore-audio-select')?.value || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

        const { players, monsters } = this.store.state;
        const all = [
            ...(players || []).map(p => ({ 
                ...p, 
                type: 'Player', 
                hp_current: p.hp?.current || p.hp_current || 10,
                hp_max: p.hp?.max || p.hp_max || 10,
                ac: p.ac || 10,
                init: Dice.roll('1d20').total + (p.stats?.dex ? Math.floor((p.stats.dex-10)/2) : 0) 
            })),
            ...(monsters || []).map(m => ({ 
                ...m, 
                type: 'Monster', 
                hp_current: m.hp?.current || m.hp_current || 10,
                hp_max: m.hp?.max || m.hp_max || 10,
                ac: m.ac || 10,
                init: Dice.roll('1d20').total + (m.stats?.dex ? Math.floor((m.stats.dex-10)/2) : 0) 
            }))
        ];

        const sorted = all.sort((a, b) => b.init - a.init);

        TOME.store.update(s => {
            s.initiativeOrder = sorted;
            s.combatActive = true;
            s.combatRound = 1;
            s.combatMusicUrl = combatTrack;
            s.explorationMusicUrl = exploreTrack;
            
            if (!s.journalEntries) s.journalEntries = [];
            s.journalEntries.push({
                id: Date.now(),
                timestamp: Date.now(),
                type: 'combat',
                title: 'Início de Combate',
                content: `Uma nova batalha se iniciou! Rodada 1. Heróis e Criaturas prontos na arena.`
            });
        });
        
        TOME.audio.fadeTo('music', combatTrack); 
        
        this._turnIndex = 0;
        this._currentActorName = sorted[0]?.name || '';
        if (this._timerDuration > 0) this._timer.restart(this._timerDuration);
        this.render();
        Toast.show('⚔️ Iniciativa Gerada! Combate Iniciado.', 'success');
    }

    endCombat() { 
        if (confirm('Encerrar Combate?')) {
            const exploreTrack = this.store.state.explorationMusicUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
            TOME.store.update(s => { 
                s.initiativeOrder = []; 
                s.combatActive = false; 
                
                if (!s.journalEntries) s.journalEntries = [];
                s.journalEntries.push({
                    id: Date.now(),
                    timestamp: Date.now(),
                    type: 'combat',
                    title: 'Fim de Combate',
                    content: `A batalha foi encerrada. Os heróis prevaleceram ou recuaram estrategicamente.`
                });
            }); 
            TOME.audio.fadeTo('music', exploreTrack);
        }
    }

    removeActor(e, el) {
        const id = el.dataset.id;
        if (!confirm('Remover este personagem do combate definitivamente?')) return;
        
        TOME.store.update(s => {
            s.initiativeOrder = s.initiativeOrder.filter(c => c.id !== id);
            // Adjust turn index if needed
            if (this._turnIndex >= s.initiativeOrder.length) {
                this._turnIndex = 0;
            }
        });
        this.render();
        Toast.show('Personagem removido da batalha.');
    }

    showMonsterDetails(e, el) {
        const id = el.dataset.id;
        this._showDetailsId = id;
        this.render();
    }

    closeModal() {
        this._showDetailsId = null;
        this.render();
    }

    _renderMonsterModal() {
        const actor = this.store.state.initiativeOrder.find(c => c.id === this._showDetailsId);
        if (!actor) return '';

        const data = actor.originalData || {};
        const stats = data.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        const actions = data.actions || [];

        return `
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.combat-tracker').__component.closeModal()">
                <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; max-height:90vh; overflow-y:auto; padding:0; border:1px solid var(--danger);" onclick="event.stopPropagation()">
                    
                    <!-- HEADER / SPRITE -->
                    <div style="height:250px; background: url('${actor.img || actor.portraitData || (actor.type !== 'Player' ? MonsterArt.getImage(actor) : '') || ''}') center/contain no-repeat, linear-gradient(to bottom, rgba(244,63,94,0.15), transparent); position:relative; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <button style="position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.6); border:none; color:#fff; width:36px; height:36px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;" onclick="this.closest('.combat-tracker').__component.closeModal()">
                            ✕
                        </button>
                        <div style="position:absolute; bottom:20px; left:30px;">
                            <h2 style="font-family:'Cinzel'; font-size:2.2rem; margin:0; color:#fff; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">${actor.name}</h2>
                            <span class="badge badge-danger" style="margin-top:6px;">CR ${data.cr || '---'}</span>
                        </div>
                    </div>

                    <!-- CONTENT -->
                    <div style="padding:30px; display:grid; grid-template-columns: 220px 1fr; gap:30px;">
                        
                        <!-- LEFT COL: STATS -->
                        <div style="display:flex; flex-direction:column; gap:15px;">
                            <div class="glass" style="padding:15px; border-radius:10px; text-align:center;">
                                <div style="font-size:0.6rem; color:var(--text-dim);">ARMADURA</div>
                                <div style="font-size:1.5rem; font-weight:800; color:var(--accent);">${actor.ac || 10}</div>
                            </div>
                            <div class="glass" style="padding:15px; border-radius:10px; text-align:center;">
                                <div style="font-size:0.6rem; color:var(--text-dim);">PONTOS DE VIDA</div>
                                <div style="font-size:1.5rem; font-weight:800; color:var(--success);">${actor.hp_max || 10}</div>
                            </div>
                            
                            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:5px; font-size:0.65rem;">
                                ${Object.entries(stats).map(([k, v]) => `
                                    <div class="glass" style="padding:6px; border-radius:6px; text-align:center;">
                                        <div style="text-transform:uppercase; opacity:0.6; font-weight:800;">${k}</div>
                                        <div style="font-weight:900; margin-top:2px;">${v}</div>
                                        <div style="opacity:0.6; font-size:0.55rem;">(${Math.floor((v-10)/2) >= 0 ? '+' : ''}${Math.floor((v-10)/2)})</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- RIGHT COL: ACTIONS -->
                        <div>
                            <h4 style="color:var(--accent); border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:5px; margin:0 0 15px 0; text-transform:uppercase; letter-spacing:1px; font-family:'Cinzel';">Ações e Habilidades</h4>
                            <div style="display:flex; flex-direction:column; gap:15px;">
                                ${actions.map(a => `
                                    <div style="border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
                                        <strong style="color:var(--danger);">${a.name}.</strong>
                                        <p style="font-size:0.8rem; color:var(--text-dim); margin: 5px 0;">${a.desc || a.description || `Dano: ${a.damage || '---'} | Bônus: +${a.bonus || 0}`}</p>
                                    </div>
                                `).join('')}
                                ${actions.length === 0 ? '<p style="opacity:0.3; font-size:0.8rem;">Nenhuma ação especial listada.</p>' : ''}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    viewHeroSheet(e, el) {
        if (e) e.stopPropagation();
        TOME.store.update(s => {
            s.viewingHeroId = el.dataset.id;
            s.activeTab = 'herosheet';
        });
    }
}
