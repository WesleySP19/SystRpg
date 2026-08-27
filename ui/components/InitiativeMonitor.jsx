import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Dice } from '../../utils/Dice.js';
import { Toast } from '../components/Toast.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { FXEngine } from '../../services/FXEngine.js';

/**
 * MONITOR DE INICIATIVA v1.0 — "Ordem de Batalha"
 * 
 * Painel dedicado ao rastreamento visual de turnos em combate D&D 5e.
 * Features:
 *  - Spotlight cinematográfico do combatente ativo
 *  - Timeline vertical com toda a fila de iniciativa
 *  - Economia de ações (Ação / Bônus / Reação / Movimento)
 *  - Aplicação rápida de dano/cura
 *  - Condições com ícones (envenenado, caído, etc.)
 *  - Adicionar combatente rápido com rolagem automática
 *  - Anúncio cinematográfico de turno e rodada
 *  - Sincronização em tempo real com player-view via BroadcastChannel
 */
export class InitiativeMonitor extends Component {
    constructor(opts) {
        super(opts);
        // Economia de ações do turno atual
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        // Formulário de adição rápida
        this._quickAdd = { name: '', init: '', hp: '', type: 'Enemy' };
        // Condição selecionada para aplicar
        this._selectedCond = 'envenenado';
        // ID do combatente selecionado para ações rápidas
        this._focusId = null;
        // Animação de novo turno
        this._showTurnAnnounce = false;
        this._announceText = '';
        // Canal de broadcast para player-view
        this._broadcast = null;
        // Damage input value
        this._dmgInput = '';
    }

    // ── CONSTANTES ───────────────────────────────────────────────────

    static CONDITIONS = {
        'abalado':       { emoji: '😰', label: 'Abalado' },
        'amedrontado':   { emoji: '😨', label: 'Amedrontado' },
        'agarrado':      { emoji: '🤝', label: 'Agarrado' },
        'atordoado':     { emoji: '💫', label: 'Atordoado' },
        'cego':          { emoji: '🙈', label: 'Cego' },
        'caído':         { emoji: '🤕', label: 'Caído' },
        'enfeitiçado':   { emoji: '💜', label: 'Enfeitiçado' },
        'envenenado':    { emoji: '🤢', label: 'Envenenado' },
        'exausto':       { emoji: '😫', label: 'Exausto' },
        'incapacitado':  { emoji: '😵', label: 'Incapacitado' },
        'invisível':     { emoji: '👻', label: 'Invisível' },
        'paralisado':    { emoji: '🧊', label: 'Paralisado' },
        'petrificado':   { emoji: '🗿', label: 'Petrificado' },
        'preso':         { emoji: '🕸️', label: 'Preso' },
        'amaldiçoado':   { emoji: '🧿', label: 'Amaldiçoado' },
        'surdo':         { emoji: '🔇', label: 'Surdo' },
    };

    // ── LIFECYCLE ────────────────────────────────────────────────────

    onMount() {
        // Inicializa BroadcastChannel para sincronizar player-view
        if (!this._broadcast) {
            this._broadcast = new BroadcastChannel('tome_map');
        }

        // Listener dinâmico de invocação
        this._handleSummon = this._handleSummon || this._onMonsterInvoked.bind(this);
        TOME.events.on('MONSTER_INVOKED', this._handleSummon);

        // Mantém foco no input de dano
        const dmgEl = this.$('#im-dmg-val');
        if (dmgEl && this._dmgInput) {
            dmgEl.value = this._dmgInput;
        }

        // Scroll para o combatente ativo na fila
        this._scrollToActive();

        // Limpa anuncio após animação
        if (this._showTurnAnnounce) {
            setTimeout(() => {
                this._showTurnAnnounce = false;
                this._announceText = '';
            }, 2000);
        }
    }

    onUnmount() {
        if (this._broadcast) {
            this._broadcast.close();
            this._broadcast = null;
        }
        if (this._handleSummon) {
            TOME.events.off('MONSTER_INVOKED', this._handleSummon);
        }
    }

    _onMonsterInvoked(entity) {
        let initRoll = Dice.roll(20).total;
        const combatant = {
            id: entity.id || 'm-' + Date.now(),
            name: entity.name,
            initiative: initRoll,
            hp: { current: entity.hp_max, max: entity.hp_max },
            ac: entity.ac || 10,
            type: entity.type || 'Enemy',
            emoji: entity.emoji || '👹',
            img: entity.img || '',
            conditions: []
        };
        
        this.store.update(s => {
            if (!s.initiativeOrder) s.initiativeOrder = [];
            s.initiativeOrder.push(combatant);
            if (s.combatActive) {
                 s.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
            }
        });
        
        Toast.show(`🧙 Invocação: ${entity.name} (Iniciativa: ${initRoll})`, 'success');
        this.render();
    }

    _scrollToActive() {
        const active = this.$('.im-combatant.im-active');
        if (active) {
            active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ── HELPERS ──────────────────────────────────────────────────────

    _getOrder() {
        return (this.store.state.initiativeOrder || []).map(c => {
            const hp = RulesEngine.getHP(c);
            return { ...c, _hpCurrent: hp.current, _hpMax: hp.max };
        });
    }

    _hpColor(current, max) {
        if (max <= 0) return 'var(--text-dim)';
        const pct = current / max;
        if (pct > 0.5) return 'var(--success)';
        if (pct > 0.2) return '#e5c17b';
        return 'var(--danger)';
    }

    _hpPct(current, max) {
        if (max <= 0) return 0;
        return Math.min(100, Math.max(0, Math.round((current / max) * 100)));
    }

    _broadcastState() {
        try {
            const state = this.store.state;
            const idx = state.initiativeIndex || 0;
            const current = (state.initiativeOrder || [])[idx];
            this._broadcast?.postMessage({
                type: 'COMBAT_UPDATE',
                state: {
                    combatActive: state.combatActive,
                    combatRound: state.combatRound,
                    initiativeOrder: state.initiativeOrder,
                    initiativeIndex: idx,
                }
            });
        } catch (e) { /* silencioso */ }
    }

    // ── TEMPLATE ─────────────────────────────────────────────────────

    template() {
        const { combatActive, combatRound } = this.store.state;
        const order = this._getOrder();
        const idx   = this.store.state.initiativeIndex || 0;
        const current = order[idx];

        // Foco: combatente selecionado para ações rápidas (ou ativo)
        const focused = this._focusId
            ? order.find(c => c.id === this._focusId) || current
            : current;

        const isEmpty = !combatActive || order.length === 0;

        return `


            <div class="im-root" style="height:100%; position:relative;">

                ${this._renderHeader(combatRound, order.length)}

                ${isEmpty
                    ? this._renderEmpty()
                    : `
                        ${this._renderSpotlight(current, idx)}
                        ${this._renderQueue(order, idx)}
                        ${this._renderQuickActions(focused)}
                        ${this._renderQuickAdd()}
                    `
                }

                ${this._showTurnAnnounce ? this._renderTurnAnnounce() : ''}

            </div>
        `;
    }

    // ── HEADER ───────────────────────────────────────────────────────

    _renderHeader(round, count) {
        const { combatActive } = this.store.state;
        return `
            <div class="im-header">
                <div style="display:flex; align-items:center; gap:12px;">
                    <h2 class="im-title">
                        <i class="fa-solid fa-swords" style="color:var(--danger); font-size:0.9rem;"></i>
                        ORDEM DE BATALHA
                    </h2>
                    ${combatActive
                        ? `<span class="im-round-badge">⚔️ RODADA ${round || 1}</span>`
                        : `<span class="im-round-badge" style="color:var(--text-dim); border-color:rgba(255,255,255,0.1);">COMBATE INATIVO</span>`
                    }
                </div>

                <div class="im-header-controls">
                    ${combatActive ? `
                        <button class="btn btn-ghost" style="font-size:0.6rem; padding:5px 10px;" data-action="rollAllInitiative" title="Rerolar Iniciativa">
                            <i class="fa-solid fa-dice-d20"></i> Rolar Tudo
                        </button>
                        <button class="btn btn-primary" style="font-size:0.7rem; padding:6px 16px; font-family:'Cinzel';" data-action="nextTurn">
                            PRÓXIMO <i class="fa-solid fa-chevron-right"></i>
                        </button>
                        <button class="btn btn-ghost" style="font-size:0.6rem; padding:5px 8px; color:var(--danger); border-color:rgba(239,68,68,0.2);" data-action="endCombat" title="Encerrar Combate">
                            <i class="fa-solid fa-flag-checkered"></i>
                        </button>
                    ` : `
                        <button class="btn btn-primary" style="font-size:0.75rem; padding:7px 18px; font-family:'Cinzel'; letter-spacing:1px;" data-action="startCombat">
                            <i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // ── SPOTLIGHT (Combatente Ativo) ──────────────────────────────────

    _renderSpotlight(current, idx) {
        if (!current) return `
            <div class="im-spotlight" style="padding:16px 28px;">
                <p style="color:var(--text-dim); font-size:0.8rem; opacity:0.5;">Nenhum combatente na fila.</p>
            </div>
        `;

        const hpPct   = this._hpPct(current._hpCurrent, current._hpMax);
        const hpColor = this._hpColor(current._hpCurrent, current._hpMax);
        const isEnemy = current.type !== 'Player';
        const rawImg = current.img || current.portraitData || (isEnemy ? MonsterArt.getImage(current) : null);
        const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;
        const avatarBg = safeImg
            ? `background-image:url('${safeImg}');`
            : '';

        return `
            <div class="im-spotlight" style="background: linear-gradient(to right, rgba(14,16,22,0.7), rgba(8,10,15,0.85)); backdrop-filter: blur(12px); border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 12px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); transition: all 0.3s ease;">
                <!-- Glowing accent strip -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${isEnemy ? 'var(--danger)' : 'var(--success)'}; box-shadow: 0 0 15px ${isEnemy ? 'var(--danger)' : 'var(--success)'};"></div>
                
                <div class="im-spotlight-inner" style="padding: 20px 24px; display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
                    <!-- Avatar -->
                    <div class="im-spotlight-avatar ${isEnemy ? 'enemy' : ''}" style="${avatarBg}; width: 85px; height: 85px; border-radius: 50%; box-shadow: 0 0 25px rgba(0,0,0,0.8); border: 2.5px solid ${isEnemy ? 'var(--danger)' : 'var(--success)'}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-family: 'Cinzel'; font-weight: 900; color: #fff; background-size: cover; background-position: center; background-color: rgba(0,0,0,0.5);">
                        ${!safeImg ? `<span>${current.name.substring(0,2).toUpperCase()}</span>` : ''}
                    </div>

                    <!-- Info -->
                    <div class="im-spotlight-info" style="flex: 1; min-width: 250px;">
                        <div class="im-spotlight-label" style="font-size: 0.65rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                            ${isEnemy ? '<i class="fa-solid fa-skull" style="color:var(--danger);"></i> <span style="color:var(--danger);">INIMIGO</span>' : '<i class="fa-solid fa-shield-halved" style="color:var(--success);"></i> <span style="color:var(--success);">HERÓI</span>'} 
                            <span style="color: rgba(255,255,255,0.2);">|</span> 
                            TURNO ${idx + 1}
                        </div>
                        <div class="im-spotlight-name" style="font-size: 1.8rem; font-family: 'Cinzel', serif; font-weight: 900; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.9); margin-bottom: 14px; line-height: 1.1;">
                            ${current.name}
                        </div>
                        
                        <div class="im-spotlight-meta" style="display: flex; gap: 30px; flex-wrap: wrap; align-items: center;">
                            <!-- HP Block -->
                            <div class="im-hp-block" style="min-width: 180px; flex-shrink: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px;">
                                    <div class="im-hp-label" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 800; color: var(--text-dim); letter-spacing: 1px;">Pontos de Vida</div>
                                    <div class="im-hp-values" style="color: ${hpColor}; font-weight: 900; font-size: 1.2rem; text-shadow: 0 0 12px ${hpColor}; line-height: 1;">
                                        ${current._hpCurrent} <span style="opacity: 0.5; font-size: 0.8rem; font-weight: 700;">/ ${current._hpMax}</span>
                                    </div>
                                </div>
                                <div class="im-hp-bar-track" style="width: 100%; height: 8px; background: rgba(0,0,0,0.7); border-radius: 4px; overflow: hidden; box-shadow: inset 0 1px 4px rgba(0,0,0,0.9);">
                                    <div class="im-hp-bar-fill" style="width: ${hpPct}%; height: 100%; background: ${hpColor}; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${hpColor};"></div>
                                </div>
                            </div>

                            <!-- Stats & Economy Block -->
                            <div style="display: flex; flex-direction: column; gap: 10px; flex: 1;">
                                <div style="display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-dim); font-weight: 700; background: rgba(255,255,255,0.02); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); width: fit-content;">
                                    <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bolt" style="color: var(--accent);"></i> Inic: <strong style="color: #fff; font-size:0.85rem;">${current.init ?? 0}</strong></span>
                                    <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-shield" style="color: #cbd5e1;"></i> CA: <strong style="color: #fff; font-size:0.85rem;">${current.ac ?? 10}</strong></span>
                                    ${current.speed ? `<span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-shoe-prints" style="color: #60a5fa;"></i> Mov: <strong style="color: #fff; font-size:0.85rem;">${current.speed}ft</strong></span>` : ''}
                                </div>

                                <!-- Economia de Ações -->
                                <div class="im-economy.value" style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <button class="im-econ-btn" style="background: ${this._economy.value.action ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.02)'}; color: ${this._economy.value.action ? '#86efac' : 'var(--text-dim)'}; border: 1px solid ${this._economy.value.action ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.05)'}; border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s;" data-action="toggleEconomy" data-type="action" title="Ação Principal (Clique para alternar)">
                                        <i class="fa-solid ${this._economy.value.action ? 'fa-play' : 'fa-check'}"></i> ${this._economy.value.action ? 'AÇÃO' : 'USADA'}
                                    </button>
                                    <button class="im-econ-btn" style="background: ${this._economy.value.bonus ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.02)'}; color: ${this._economy.value.bonus ? '#fde047' : 'var(--text-dim)'}; border: 1px solid ${this._economy.value.bonus ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.05)'}; border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s;" data-action="toggleEconomy" data-type="bonus" title="Ação Bônus (Clique para alternar)">
                                        <i class="fa-solid ${this._economy.value.bonus ? 'fa-sparkles' : 'fa-check'}"></i> ${this._economy.value.bonus ? 'BÔNUS' : 'USADO'}
                                    </button>
                                    <button class="im-econ-btn" style="background: ${this._economy.value.reaction ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.02)'}; color: ${this._economy.value.reaction ? '#93c5fd' : 'var(--text-dim)'}; border: 1px solid ${this._economy.value.reaction ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.05)'}; border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s;" data-action="toggleEconomy" data-type="reaction" title="Reação (Clique para alternar)">
                                        <i class="fa-solid ${this._economy.value.reaction ? 'fa-reply' : 'fa-check'}"></i> ${this._economy.value.reaction ? 'REAÇÃO' : 'USADA'}
                                    </button>
                                    <button class="im-econ-btn" style="background: rgba(168,85,247,0.15); color: #d8b4fe; border: 1px solid rgba(168,85,247,0.4); border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 10px rgba(168,85,247,0.1);" data-action="toggleMovement" title="Movimento (Clique para subtrair 5ft)">
                                        <i class="fa-solid fa-person-running"></i> ${this._economy.value.movement}ft
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Condições ativas -->
                        ${current.conditions?.length ? `
                            <div class="im-cond-list" style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
                                ${current.conditions.map(c => {
                                    const info = InitiativeMonitor.CONDITIONS[c] || { emoji: '⚠️', label: c };
                                    return `<button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.7rem; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; transition: all 0.2s;" data-action="removeConditionFromActive" data-cond="${c}" title="Clique para remover condição">${info.emoji} ${info.label} <i class="fa-solid fa-times" style="margin-left: 6px; opacity: 0.5; font-size: 0.6rem;"></i></button>`;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // ── FILA DE INICIATIVA ────────────────────────────────────────────

    _renderQueue(order, idx) {
        return `
            <div class="im-queue-section" style="margin-bottom: 24px;">
                <div class="im-queue-header" style="font-size: 0.65rem; font-weight: 900; letter-spacing: 2px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                    <span><i class="fa-solid fa-list-ol" style="margin-right: 6px;"></i> FILA DE INICIATIVA</span>
                    <span style="color: var(--accent);">${order.length} COMBATENTES</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${order.map((c, i) => this._renderCombatantCard(c, i, idx)).join('')}
                </div>
            </div>
        `;
    }

    _renderCombatantCard(c, i, activeIdx) {
        const isActive   = i === activeIdx;
        const isTargeted = this._focusId.value === c.id && !isActive;
        const isDead     = c._hpCurrent <= 0;
        const isUpcoming = i > activeIdx && !isDead;
        const isEnemy    = c.type !== 'Player';

        const hpPct   = this._hpPct(c._hpCurrent, c._hpMax);
        const hpColor = this._hpColor(c._hpCurrent, c._hpMax);

        const rawImg = c.img || c.portraitData || (c.type !== 'Player' ? MonsterArt.getImage(c) : null);
        const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;

        const avatarBg = safeImg
            ? `background-image:url('${safeImg}');`
            : '';

        const cardBg = isActive 
            ? 'linear-gradient(90deg, rgba(197, 160, 89, 0.1), rgba(14, 16, 22, 0.8))'
            : isTargeted 
                ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(14, 16, 22, 0.6))'
                : 'rgba(14, 16, 22, 0.6)';

        const cardBorder = isActive
            ? '1px solid rgba(197, 160, 89, 0.6)'
            : isTargeted
                ? '1px solid rgba(255, 255, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.03)';
                
        const cardGlow = isActive ? 'box-shadow: 0 0 15px rgba(197, 160, 89, 0.2);' : '';

        const condEmojis = (c.conditions || []).slice(0, 4).map(cond => {
            const info = InitiativeMonitor.CONDITIONS[cond] || { emoji: '⚠️' };
            return `<span style="font-size: 0.8rem;" title="${cond}">${info.emoji}</span>`;
        }).join('');

        return `
            <div class="im-combatant" style="background: ${cardBg}; backdrop-filter: blur(8px); border: ${cardBorder}; ${cardGlow} border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); opacity: ${isDead ? 0.5 : 1}; position: relative; overflow: hidden; min-height: 60px;"
                 onmouseover="this.style.transform='scale(1.02) translateX(4px)'; this.style.borderColor='rgba(197,160,89,0.8)';"
                 onmouseout="this.style.transform='none'; this.style.borderColor='${cardBorder.split('solid ')[1]}';"
                 data-action="selectFocus" data-id="${c.id}"
                 title="${isActive ? 'Turno Atual' : 'Clique para focar ações'}">
                 
                <!-- Indicator line -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${isEnemy ? 'var(--danger)' : 'var(--success)'}; opacity: ${isActive ? 1 : 0.4};"></div>

                <!-- Posição na ordem -->
                <div style="font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 900; color: ${isActive ? 'var(--accent)' : 'var(--text-dim)'}; width: 24px; text-align: center;">
                    ${i + 1}
                </div>

                <!-- Avatar -->
                <div style="${avatarBg} width: 40px; height: 40px; border-radius: 50%; background-size: cover; background-position: center; background-color: rgba(0,0,0,0.5); border: 1.5px solid ${isEnemy ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; color: #fff; flex-shrink: 0;">
                    ${!safeImg ? `<span>${c.name.substring(0,2).toUpperCase()}</span>` : ''}
                </div>

                <!-- Info -->
                <div style="flex: 1; min-width: 0;">
                    <div style="font-family: 'Outfit'; font-weight: 800; font-size: 0.95rem; color: ${isActive ? '#fff' : (isEnemy ? '#fca5a5' : '#e2e8f0')}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;">
                        ${isDead ? '<i class="fa-solid fa-skull"></i> ' : ''}${c.name}
                        ${isActive ? '<span style="font-size: 0.5rem; background: var(--accent); color: #000; padding: 2px 6px; border-radius: 10px; font-weight: 900; letter-spacing: 1px;">VEZ</span>' : ''}
                    </div>
                    <div style="font-size: 0.65rem; color: var(--text-dim); display: flex; gap: 12px; margin-top: 4px; font-weight: 600;">
                        <span style="display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-heart" style="color: ${hpColor};"></i> ${c._hpCurrent}/${c._hpMax}</span>
                        <span style="display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-shield-halved"></i> ${c.ac ?? 10}</span>
                        ${c.concentration?.length ? '<span title="Concentração" style="color: #60a5fa;"><i class="fa-solid fa-brain"></i> Conc</span>' : ''}
                    </div>
                    <!-- HP Bar mini -->
                    <div style="width: 100%; max-width: 200px; height: 3px; background: rgba(0,0,0,0.5); border-radius: 2px; margin-top: 6px; overflow: hidden;">
                        <div style="width: ${hpPct}%; height: 100%; background: ${hpColor}; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- Direita: Iniciativa + Condições + Controles -->
                <div style="display: flex; align-items: center; gap: 16px;">
                    ${condEmojis ? `<div style="display: flex; gap: 4px;">${condEmojis}</div>` : ''}
                    
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                        <div style="font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 900; color: var(--accent); text-shadow: 0 0 8px rgba(197,160,89,0.3);">
                            ${c.init ?? 0}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 4px; opacity: ${isActive ? 1 : 0.3}; transition: opacity 0.2s;" class="im-card-controls">
                        <button class="btn btn-ghost" style="padding: 6px; font-size: 0.65rem; border-radius: 6px; background: rgba(255,255,255,0.05);" data-action="moveUp" data-id="${c.id}" onclick="event.stopPropagation()" title="Subir Fila"><i class="fa-solid fa-chevron-up"></i></button>
                        <button class="btn btn-ghost" style="padding: 6px; font-size: 0.65rem; border-radius: 6px; background: rgba(255,255,255,0.05);" data-action="moveDown" data-id="${c.id}" onclick="event.stopPropagation()" title="Descer Fila"><i class="fa-solid fa-chevron-down"></i></button>
                        <button class="btn btn-ghost" style="padding: 6px; font-size: 0.65rem; border-radius: 6px; background: rgba(239,68,68,0.1); color: var(--danger);" data-action="removeCombatant" data-id="${c.id}" onclick="event.stopPropagation()" title="Remover"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    // ── AÇÕES RÁPIDAS (Dano / Cura / Condições) ──────────────────────

    _renderQuickActions(focused) {
        if (!focused) return '';

        const isFocusedActive = !this._focusId || this._focusId.value === focused.id;

        return `
            <div style="background: linear-gradient(to top, rgba(8,10,15,0.85), rgba(14,16,22,0.7)); backdrop-filter: blur(16px); border-top: 1px solid rgba(197, 160, 89, 0.4); padding: 16px 24px; flex-shrink: 0; box-shadow: 0 -10px 20px rgba(0,0,0,0.5); border-radius: 12px 12px 0 0; position: relative; z-index: 10;">
                
                <div style="font-size: 0.65rem; font-weight: 900; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-crosshairs"></i>
                        ${isFocusedActive ? 'AÇÕES DO COMBATENTE ATIVO' : `FOCO MANUL: ${focused.name}`}
                    </span>
                    ${!isFocusedActive
                        ? `<button class="btn btn-ghost" style="font-size: 0.6rem; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2);" data-action="clearFocus">✕ Limpar foco</button>`
                        : ''}
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; justify-content: flex-start; margin-bottom: 8px;">
                    <!-- Dano / Cura Group -->
                    <div style="display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.5); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <input type="number" id="im-dmg-val" class="form-input"
                               placeholder="Valor" min="0" style="width: 90px; font-size: 0.9rem; padding: 8px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;" data-action="dmgInputChange">
                        <button class="btn" style="background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); font-size: 0.75rem; padding: 6px 14px; border-radius: 6px; font-weight: 700; transition: all 0.2s;" data-action="applyDamage">
                            <i class="fa-solid fa-heart-crack" style="margin-right: 4px;"></i> Dano
                        </button>
                        <button class="btn" style="background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); font-size: 0.75rem; padding: 6px 14px; border-radius: 6px; font-weight: 700; transition: all 0.2s;" data-action="applyHeal">
                            <i class="fa-solid fa-heart-pulse" style="margin-right: 4px;"></i> Cura
                        </button>
                        <button class="btn btn-ghost" style="font-size: 0.75rem; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.05);" data-action="rollDice" title="Rolar 1d6">
                            <i class="fa-solid fa-dice"></i>
                        </button>
                    </div>

                    <!-- Condições Group -->
                    <div style="display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.5); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); flex: 1; min-width: 280px;">
                        <select class="form-select" id="im-cond-select" style="font-size: 0.85rem; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; flex: 1;" data-action="condSelectChange">
                            ${Object.entries(InitiativeMonitor.CONDITIONS).map(([k, v]) =>
                                `<option value="${k}" ${this._selectedCond.value === k ? 'selected' : ''}>${v.emoji} ${v.label}</option>`
                            ).join('')}
                        </select>
                        <button class="btn" style="background: rgba(168,85,247,0.15); color: #d8b4fe; border: 1px solid rgba(168,85,247,0.3); font-size: 0.75rem; padding: 6px 14px; border-radius: 6px; font-weight: 700;" data-action="applyCondition">
                            <i class="fa-solid fa-plus" style="margin-right: 4px;"></i> Status
                        </button>
                        <button class="btn btn-ghost" style="font-size: 0.75rem; padding: 6px 12px; color: var(--danger); border-radius: 6px; background: rgba(239,68,68,0.05);" data-action="clearConditions" title="Limpar todos os status">
                            <i class="fa-solid fa-broom"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ── ADICIONAR COMBATENTE RÁPIDO ───────────────────────────────────

    _renderQuickAdd() {
        return `
            <div class="im-quick-add">
                <div style="font-size:0.55rem; font-weight:800; color:var(--text-dim); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:6px;">
                    <i class="fa-solid fa-plus" style="margin-right:4px;"></i> ADICIONAR COMBATENTE
                </div>
                <div class="im-quick-add-row">
                    <input type="text"   id="qa-name" class="form-input" style="font-size:0.75rem; padding:6px 10px;" placeholder="Nome..." value="${this._quickAdd.value.name}">
                    <input type="number" id="qa-init" class="form-input" style="font-size:0.75rem; padding:6px 8px;" placeholder="Inic" min="-5" max="30" value="${this._quickAdd.value.init}">
                    <input type="number" id="qa-hp"   class="form-input" style="font-size:0.75rem; padding:6px 8px;" placeholder="HP" min="1" max="999" value="${this._quickAdd.value.hp}">
                    <div style="display:flex; gap:4px;">
                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:5px 8px; background:rgba(96,165,250,0.08); border-color:rgba(96,165,250,0.2); color:#93c5fd;" data-action="quickAddPlayer" title="Adicionar como Herói">
                            <i class="fa-solid fa-shield"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:5px 8px; background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.2); color:#fca5a5;" data-action="quickAddEnemy" title="Adicionar como Inimigo">
                            <i class="fa-solid fa-skull"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:5px 8px;" data-action="quickAddRollInit" title="Rolar iniciativa automática">
                            <i class="fa-solid fa-dice-d20"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ── ESTADO VAZIO ──────────────────────────────────────────────────

    _renderEmpty() {
        const { players, monsters } = this.store.state;
        const hasParty = (players?.length || 0) + (monsters?.length || 0) > 0;

        return `
            <div class="im-empty">
                <div class="im-empty-icon">⚔️</div>
                <div class="im-empty-title">Arena Silenciosa</div>
                <p class="im-empty-sub">
                    ${hasParty
                        ? 'Clique em "Iniciar Combate" para rolar iniciativa automática para toda a party e monstros ativos.'
                        : 'Adicione heróis e monstros à campanha, depois clique em "Iniciar Combate" para gerar a ordem de iniciativa.'}
                </p>
                ${hasParty ? `
                    <button class="btn btn-primary" style="font-family:'Cinzel'; padding:12px 28px; letter-spacing:1px; font-size:0.85rem;" data-action="startCombat">
                        <i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
                    </button>
                ` : `
                    <button class="btn btn-ghost" style="font-size:0.8rem;" data-action="navigateToCombat">
                        Ir para Campanha →
                    </button>
                `}
            </div>
        `;
    }

    // ── ANÚNCIO CINEMATOGRÁFICO ───────────────────────────────────────

    _renderTurnAnnounce() {
        return `
            <div class="im-turn-announce.value">
                <div class="im-turn-announce.value-inner">
                    <i class="fa-solid fa-swords" style="color:var(--accent);"></i>
                    ${this._announceText}
                </div>
            </div>
        `;
    }

    // ── AÇÕES ─────────────────────────────────────────────────────────

    /** Avança para o próximo turno */
    nextTurn() {
        const order = this._getOrder();
        if (!order.length) return;

        const { combatRound } = this.store.state;
        let idx = (this.store.state.initiativeIndex || 0) + 1;
        let newRound = combatRound || 1;
        let isNewRound = false;

        if (idx >= order.length) {
            idx = 0;
            newRound++;
            isNewRound = true;
        }

        // Reseta economia de ações
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        this._focusId = null;

        // Anúncio cinematográfico
        const nextActor = order[idx];
        if (nextActor) {
            this._showTurnAnnounce = true;
            this._announceText = isNewRound
                ? `⚔️ RODADA ${newRound} — Vez de ${nextActor.name}`
                : `Vez de ${nextActor.name}`;
        }

        this.store.update(s => {
            s.initiativeIndex = idx;
            if (isNewRound) s.combatRound = newRound;
            // Marca isCurrentTurn em todos os tokens do mapa
            if (s.initiativeOrder) {
                s.initiativeOrder = s.initiativeOrder.map((c, i) => ({
                    ...c,
                    isCurrentTurn: i === idx
                }));
            }
        });

        // Sincroniza player-view
        this._broadcastState();

        Toast.show(`⚔️ Vez de ${nextActor?.name}${isNewRound ? ` · Rodada ${newRound}` : ''}`, 'info');
    }

    /** Inicia combate rolando iniciativa para todos */
    startCombat() {
        const state = JSON.parse(JSON.stringify(this.store.state));
        const { players, monsters } = state;
        const allCombatants = [
            ...(players || []).map(p => ({
                ...p,
                type: 'Player',
                init: Dice.quick(20) + Math.floor(((p.stats?.dex || 10) - 10) / 2),
                conditions: p.conditions || [],
                isCurrentTurn: false,
            })),
            ...(monsters || []).map(m => ({
                ...m,
                type: 'Monster',
                init: Dice.quick(20) + Math.floor(((m.stats?.dex || 10) - 10) / 2),
                conditions: m.conditions || [],
                isCurrentTurn: false,
            }))
        ];

        if (!allCombatants.length) {
            Toast.show('Adicione heróis ou monstros antes de iniciar o combate.', 'warning');
            return;
        }

        // Ordena por iniciativa (decrescente)
        allCombatants.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));

        if (allCombatants.length > 0) {
            allCombatants[0].isCurrentTurn = true;
        }

        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        this._focusId = null;
        this._showTurnAnnounce = true;
        this._announceText = `⚔️ RODADA 1 — Vez de ${allCombatants[0]?.name}`;

        this.store.update(s => {
            s.initiativeOrder = allCombatants;
            s.initiativeIndex = 0;
            s.combatRound = 1;
            s.combatActive = true;
        });

        this._broadcastState();
        Toast.show('⚔️ Combate iniciado! Iniciativa rolada automaticamente.', 'success');
    }

    /** Rerola iniciativa para todos */
    rollAllInitiative() {
        this.store.update(s => {
            if (!s.initiativeOrder?.length) return;
            s.initiativeOrder = s.initiativeOrder.map(c => ({
                ...c,
                init: Dice.quick(20) + Math.floor(((c.stats?.dex || 10) - 10) / 2),
            })).sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
            s.initiativeIndex = 0;
            s.combatRound = 1;
        });
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        Toast.show('🎲 Iniciativa rerolada!', 'info');
    }

    /** Encerra combate */
    endCombat() {
        this.store.update(s => {
            s.combatActive = false;
            s.initiativeOrder = [];
            s.initiativeIndex = 0;
            s.combatRound = 0;
        });
        this._broadcastState();
        Toast.show('🏁 Combate encerrado.', 'info');
    }

    /** Seleciona combatente para foco de ações rápidas */
    selectFocus(e, el) {
        const id = el.dataset.id;
        this._focusId = this._focusId.value === id ? null : id;
        this.render();
    }

    clearFocus() {
        this._focusId = null;
        this.render();
    }

    /** Alterna estado da economia de ações */
    toggleEconomy(e, el) {
        const type = el.dataset.type;
        if (type in this._economy && typeof this._economy[type] === 'boolean') {
            this._economy[type] = !this._economy[type];
            this.render();
        }
    }

    /** Reduz movimento em 5ft por clique */
    toggleMovement() {
        this._economy.value.movement = Math.max(0, this._economy.value.movement - 5);
        this.render();
    }

    /** Mover combatente para cima na fila */
    moveUp(e, el) {
        const id = el.dataset.id;
        this.store.update(s => {
            const order = s.initiativeOrder || [];
            const i = order.findIndex(c => c.id === id);
            if (i > 0) {
                [order[i - 1], order[i]] = [order[i], order[i - 1]];
            }
        });
    }

    /** Mover combatente para baixo na fila */
    moveDown(e, el) {
        const id = el.dataset.id;
        this.store.update(s => {
            const order = s.initiativeOrder || [];
            const i = order.findIndex(c => c.id === id);
            if (i < order.length - 1) {
                [order[i], order[i + 1]] = [order[i + 1], order[i]];
            }
        });
    }

    /** Remove combatente da fila */
    removeCombatant(e, el) {
        const id = el.dataset.id;
        this.store.update(s => {
            s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id);
            if (s.initiativeIndex >= s.initiativeOrder.length) {
                s.initiativeIndex = Math.max(0, s.initiativeOrder.length - 1);
            }
        });
        if (this._focusId.value === id) this._focusId = null;
    }

    /** Obtém o combatente alvo (foco ou ativo) */
    _getTarget() {
        const order = this._getOrder();
        const idx   = this.store.state.initiativeIndex || 0;
        return this._focusId
            ? order.find(c => c.id === this._focusId) || order[idx]
            : order[idx];
    }

    /** Aplica dano ao alvo */
    applyDamage() {
        const target = this._getTarget();
        if (!target) return;

        const val = parseInt(this.$('#im-dmg-val')?.value || '0', 10);
        if (isNaN(val) || val <= 0) {
            Toast.show('Insira um valor de dano válido.', 'warning');
            return;
        }

        let killedNow = false;
        let actorType = 'Enemy';
        this.store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
            if (!actor) return;

            actorType = actor.type || 'Enemy';
            const oldHp = RulesEngine.getHP(actor).current;

            // Suporte a HP dinâmico (players vs monsters)
            if ('hp_current' in actor) {
                actor.hp_current = Math.max(0, (actor.hp_current ?? actor.hp_max) - val);
                if (actor.hp_current === 0 && oldHp > 0) killedNow = true;
            } else if (actor._tempHP !== undefined) {
                const tempDmg = Math.min(actor._tempHP || 0, val);
                actor._tempHP = (actor._tempHP || 0) - tempDmg;
                const remaining = val - tempDmg;
                if (actor.combat) {
                    actor.combat.hp_current = Math.max(0, (actor.combat.hp_current ?? 0) - remaining);
                    if (actor.combat.hp_current === 0 && oldHp > 0) killedNow = true;
                }
            } else if (actor.combat) {
                actor.combat.hp_current = Math.max(0, (actor.combat.hp_current ?? actor.combat.hp_max ?? 10) - val);
                if (actor.combat.hp_current === 0 && oldHp > 0) killedNow = true;
            }
        });

        this._broadcastState();
        Toast.show(`💥 ${val} de dano aplicado a ${target.name}`, 'danger');
        if (this.$('#im-dmg-val')) this.$('#im-dmg-val').value = '';

        if (killedNow) {
            if (actorType === 'Player' || target.type === 'Player') {
                FXEngine.trigger('HERO_FALLEN', target.name, target.id);
            } else {
                FXEngine.trigger('ENTITY_SLAIN', target.name, target.id);
            }
        }
    }

    /** Aplica cura ao alvo */
    applyHeal() {
        const target = this._getTarget();
        if (!target) return;

        const val = parseInt(this.$('#im-dmg-val')?.value || '0', 10);
        if (isNaN(val) || val <= 0) {
            Toast.show('Insira um valor de cura válido.', 'warning');
            return;
        }

        this.store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
            if (!actor) return;

            if ('hp_current' in actor) {
                actor.hp_current = Math.min(actor.hp_max ?? 999, (actor.hp_current ?? 0) + val);
            } else if (actor.combat) {
                actor.combat.hp_current = Math.min(
                    actor.combat.hp_max ?? 999,
                    (actor.combat.hp_current ?? 0) + val
                );
            }
        });

        this._broadcastState();
        Toast.show(`💚 ${val} HP restaurados para ${target.name}`, 'success');
        if (this.$('#im-dmg-val')) this.$('#im-dmg-val').value = '';
    }

    /** Rola 1d6 e preenche o campo de dano */
    rollDice() {
        const result = Dice.roll(6);
        const input = this.$('#im-dmg-val');
        if (input) input.value = result;
        Toast.show(`🎲 1d6 = ${result}`, 'info');
    }

    /** Armazena valor do input de dano sem re-render */
    dmgInputChange(e, el) {
        this._dmgInput = el.value;
    }

    /** Armazena condição selecionada */
    condSelectChange(e, el) {
        this._selectedCond = el.value;
    }

    /** Aplica condição ao alvo focado */
    applyCondition() {
        const target = this._getTarget();
        if (!target) return;

        const cond = this.$('#im-cond-select')?.value || this._selectedCond;

        this.store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
            if (!actor) return;
            if (!actor.conditions) actor.conditions = [];
            if (!actor.conditions.includes(cond)) {
                actor.conditions.push(cond);
            }
        });

        const info = InitiativeMonitor.CONDITIONS[cond] || { emoji: '⚠️', label: cond };
        Toast.show(`${info.emoji} ${info.label} aplicado a ${target.name}`, 'warning');
    }

    /** Remove condição do combatente ativo pelo spotlight */
    removeConditionFromActive(e, el) {
        const cond = el.dataset.cond;
        const order = this._getOrder();
        const idx   = this.store.state.initiativeIndex || 0;
        const current = order[idx];
        if (!current) return;

        this.store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === current.id);
            if (actor?.conditions) {
                actor.conditions = actor.conditions.filter(c => c !== cond);
            }
        });
    }

    /** Limpa todas as condições do alvo */
    clearConditions() {
        const target = this._getTarget();
        if (!target) return;

        this.store.update(s => {
            const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
            if (actor) actor.conditions = [];
        });
        Toast.show(`✅ Condições limpas de ${target.name}`, 'success');
    }

    /** Adiciona combatente como Herói */
    quickAddPlayer() { this._quickAddCombatant('Player'); }

    /** Adiciona combatente como Inimigo */
    quickAddEnemy() { this._quickAddCombatant('Monster'); }

    /** Adiciona combatente com iniciativa automática rolada */
    quickAddRollInit() {
        const init = Dice.quick(20);
        const initEl = this.$('#qa-init');
        if (initEl) initEl.value = init;
        this._quickAdd.value.init = init;
        Toast.show(`🎲 Iniciativa rolada: ${init}`, 'info');
    }

    _quickAddCombatant(type) {
        const name = this.$('#qa-name')?.value?.trim() || '';
        const init = parseInt(this.$('#qa-init')?.value || '0', 10) || Dice.quick(20);
        const hp   = parseInt(this.$('#qa-hp')?.value || '10', 10) || 10;

        if (!name) {
            Toast.show('Insira um nome para o combatente.', 'warning');
            return;
        }

        const newCombatant = {
            id: `qc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
            name,
            type,
            init,
            ac: 10,
            hp_current: hp,
            hp_max: hp,
            conditions: [],
            isCurrentTurn: false,
        };

        this.store.update(s => {
            if (!s.initiativeOrder) s.initiativeOrder = [];
            s.initiativeOrder.push(newCombatant);
            s.initiativeOrder.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
            if (!s.combatActive) {
                s.combatActive = true;
                s.combatRound  = s.combatRound || 1;
                s.initiativeIndex = 0;
            }
        });

        this._broadcastState();

        // Limpa formulário
        this._quickAdd = { name: '', init: '', hp: '', type: 'Enemy' };
        if (this.$('#qa-name'))  this.$('#qa-name').value  = '';
        if (this.$('#qa-init'))  this.$('#qa-init').value  = '';
        if (this.$('#qa-hp'))    this.$('#qa-hp').value    = '';

        Toast.show(`➕ ${name} adicionado como ${type === 'Player' ? 'Herói' : 'Inimigo'}`, 'success');
    }

    /** Navega para a aba de campanha */
    navigateToCombat() {
        this.store.update(s => { s.activeTab = 'campaign'; });
    }
}
