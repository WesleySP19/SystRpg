import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { Dice } from '../../utils/Dice.js';

/**
 * COMBAT TRACKER v6.0 — "THE ARCHITECT'S ARENA"
 * Production-grade combat management with high-fidelity UI/UX.
 */
export class CombatTracker extends Component {
    constructor(opts) {
        super(opts);
        this._turnIndex = 0;
        this._targetName = null;
        this._rollMod = 'normal';
        this._battleLog = [];
        this._selectedCondition = 'blinded';
        this._showDetailsId = null;
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
    }

    template() {
        const { initiativeOrder, combatRound, combatActive } = this.store.state;
        const current = (initiativeOrder || [])[this._turnIndex];

        if (!combatActive || !initiativeOrder?.length) {
            return this._renderEmptyState();
        }

        return `
            <div class="combat-arena animate-fadeIn">
                <!-- HEADER: COMBAT STATS -->
                <header class="arena-header">
                    <div class="round-counter glass">
                        <span class="label">RODADA</span>
                        <span class="value">${combatRound || 1}</span>
                    </div>
                    <div class="turn-announcer glass-accent">
                        <i class="fa-solid fa-swords"></i>
                        TURNO DE <span class="highlight">${current?.name.toUpperCase()}</span>
                    </div>
                    <div class="arena-actions">
                        <div class="roll-mods glass">
                            <button class="${this._rollMod==='advantage'?'active':''}" data-action="setRollMod" data-mode="advantage">VANT</button>
                            <button class="${this._rollMod==='normal'?'active':''}" data-action="setRollMod" data-mode="normal">NORM</button>
                            <button class="${this._rollMod==='disadvantage'?'active':''}" data-action="setRollMod" data-mode="disadvantage">DESV</button>
                        </div>
                        <button class="btn btn-primary" data-action="nextTurn">PRÓXIMO TURNO <i class="fa-solid fa-chevron-right"></i></button>
                        <button class="btn btn-danger btn-sm" data-action="finishBattle">ENCERRAR</button>
                    </div>
                </header>

                <main class="arena-grid">
                    <!-- LEFT: INITIATIVE LIST -->
                    <aside class="initiative-list glass">
                        <div class="panel-header">ORDEM DE INICIATIVA</div>
                        <div class="list-content">
                            ${initiativeOrder.map((c, idx) => this._renderInitiativeRow(c, idx === this._turnIndex)).join('')}
                        </div>
                    </aside>

                    <!-- CENTER: ACTIVE CHARACTER -->
                    <section class="active-actor">
                        ${this._renderActiveActor(current)}
                    </section>

                    <!-- RIGHT: TARGET & LOG -->
                    <aside class="battle-intel">
                        <div class="target-panel glass-accent">
                            <div class="panel-header">ALVO SELECIONADO</div>
                            ${this._renderTargetPanel(initiativeOrder)}
                        </div>
                        <div class="log-panel glass">
                            <div class="panel-header">RELATÓRIO DE BATALHA</div>
                            <div class="log-content scrollbar-custom">
                                ${this._renderLog()}
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        `;
    }

    _renderEmptyState() {
        return `
            <div class="empty-state-wrap animate-fadeIn">
                <div class="empty-card glass-accent">
                    <div class="icon-pulse"><i class="fa-solid fa-skull-crossbones"></i></div>
                    <h2>ARENA DE COMBATE</h2>
                    <p>Nenhum combate ativo no momento. Prepare seus heróis e inicie o rastreamento.</p>
                    <button class="btn btn-primary btn-lg" data-action="rollInitiative">
                        <i class="fa-solid fa-dice-d20"></i> GERAR INICIATIVA
                    </button>
                </div>
            </div>
        `;
    }

    _renderInitiativeRow(c, isActive) {
        const hpPct = Math.round(((c.hp_current || 0) / (c.hp_max || 1)) * 100);
        const hpColor = hpPct < 30 ? 'var(--danger)' : hpPct < 70 ? 'var(--warning)' : 'var(--success)';
        
        return `
            <div class="init-row ${isActive ? 'active' : ''} ${c.hp_current <= 0 ? 'dead' : ''}" data-action="selectTargetManual" data-name="${c.name}">
                <div class="init-value">${c.init || 0}</div>
                <div class="init-avatar" style="background-image: url('${c.img || c.portraitData || ''}')"></div>
                <div class="init-info">
                    <div class="name">${c.name}</div>
                    <div class="hp-bar-mini"><div class="fill" style="width:${hpPct}%; background:${hpColor}"></div></div>
                </div>
                ${isActive ? '<div class="turn-indicator"><i class="fa-solid fa-caret-left"></i></div>' : ''}
            </div>
        `;
    }

    _renderActiveActor(c) {
        if (!c) return '';
        const hpPct = Math.round(((c.hp_current || 0) / (c.hp_max || 1)) * 100);
        
        return `
            <div class="actor-card glass-accent animate-slideUp">
                <div class="actor-header">
                    <div class="avatar-large ${c.type === 'Player' ? 'player' : 'monster'}" style="background-image: url('${c.img || c.portraitData || ''}')"></div>
                    <div class="info">
                        <h1>${c.name}</h1>
                        <div class="economy-dots">
                            <span class="dot ${this._economy.action?'active':''}" title="Ação">A</span>
                            <span class="dot ${this._economy.bonus?'active':''}" title="Bônus">B</span>
                            <span class="dot ${this._economy.reaction?'active':''}" title="Reação">R</span>
                            <span class="mov">${this._economy.movement}ft</span>
                        </div>
                    </div>
                    <div class="hp-display">
                        <div class="label">VITALIDADE</div>
                        <div class="value">${c.hp_current} / ${c.hp_max}</div>
                        <div class="hp-bar-main"><div class="fill" style="width:${hpPct}%"></div></div>
                    </div>
                </div>

                <div class="actor-body">
                    ${c.type === 'Player' ? this._renderPlayerActions() : this._renderMonsterActions(c)}
                </div>

                <div class="actor-footer">
                    <div class="conditions-strip">
                        ${(c.conditions || []).map(cond => `<span class="cond-badge">${cond}</span>`).join('')}
                        <button class="add-cond-btn" data-action="showCondModal"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    _renderPlayerActions() {
        return `
            <div class="action-grid">
                <div class="action-box">
                    <label>CAUSAR DANO / CURA</label>
                    <div class="input-group">
                        <input type="text" id="dmg-input" placeholder="Ex: 2d8 + 4" class="glass-input">
                        <button class="btn btn-primary" data-action="applyAction">APLICAR</button>
                    </div>
                </div>
                <div class="economy-toggles">
                    <button class="btn-toggle ${!this._economy.action?'spent':''}" data-action="toggleEconomy" data-type="action">AÇÃO</button>
                    <button class="btn-toggle ${!this._economy.bonus?'spent':''}" data-action="toggleEconomy" data-type="bonus">BÔNUS</button>
                    <button class="btn-toggle ${!this._economy.reaction?'spent':''}" data-action="toggleEconomy" data-type="reaction">REAÇÃO</button>
                </div>
            </div>
        `;
    }

    _renderMonsterActions(m) {
        const actions = m.actions || m.originalData?.actions || [
            { name: 'Ataque Padrão', bonus: 4, damage: '1d8+2', type: 'single' }
        ];
        
        return `
            <div class="monster-actions-scroll scrollbar-custom">
                ${actions.map(a => `
                    <div class="action-item glass" data-action="monsterAttack" 
                         data-name="${a.name}" data-bonus="${a.bonus || 0}" data-damage="${a.damage}">
                        <div class="action-meta">
                            <span class="name">${a.name}</span>
                            <span class="bonus">+${a.bonus || 0}</span>
                        </div>
                        <div class="action-dmg">${a.damage}</div>
                        <i class="fa-solid fa-dice-d20 icon"></i>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _renderTargetPanel(order) {
        const target = order.find(x => x.name === this._targetName);
        if (!target) return `<div class="no-target">NENHUM ALVO SELECIONADO</div>`;

        return `
            <div class="target-info animate-fadeIn">
                <div class="avatar-small" style="background-image: url('${target.img || target.portraitData || ''}')"></div>
                <div class="details">
                    <div class="name">${target.name}</div>
                    <div class="hp-line">${target.hp_current} / ${target.hp_max} HP</div>
                </div>
                <button class="btn-close" data-action="clearTarget"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    }

    _renderLog() {
        if (!this._battleLog.length) return `<div class="empty-log">[AGUARDANDO AÇÕES]</div>`;
        return this._battleLog.map(l => `
            <div class="log-entry ${l.type}">
                <span class="time">${l.time}</span>
                <span class="message">${l.msg}</span>
            </div>
        `).join('');
    }

    /* ── LOGIC ─────────────────────────────────────────────────── */

    async rollInitiative() {
        const { players, monsters } = this.store.state;
        const all = [
            ...(players || []).map(p => this._mapToCombatant(p, 'Player')),
            ...(monsters || []).map(m => this._mapToCombatant(m, 'Monster'))
        ];

        const sorted = all.sort((a, b) => b.init - a.init);

        TOME.store.update(s => {
            s.initiativeOrder = sorted;
            s.combatActive = true;
            s.combatRound = 1;
        });
        this._turnIndex = 0;
        this.render();
        Toast.show('Iniciativa gerada!', 'success');
    }

    _mapToCombatant(e, type) {
        const dex = e.stats?.dex || 10;
        const mod = Math.floor((dex - 10) / 2);
        return {
            id: e.id,
            name: e.name,
            type: type,
            img: e.img || e.portraitData || '',
            hp_current: e.hp?.current || e.hp_current || 10,
            hp_max: e.hp?.max || e.hp_max || 10,
            ac: e.ac || 10,
            init: Dice.roll('1d20').total + mod,
            conditions: e.conditions || []
        };
    }

    async nextTurn() {
        const order = this.store.state.initiativeOrder;
        this._turnIndex = (this._turnIndex + 1) % order.length;
        this._economy = { action: true, bonus: true, reaction: true, movement: 30 };
        this._targetName = null;

        if (this._turnIndex === 0) {
            TOME.store.update(s => s.combatRound = (s.combatRound || 1) + 1);
        }

        const next = order[this._turnIndex];
        if (next.hp_current <= 0 && next.type === 'Player') {
            const confirmed = await Modal.confirm('TESTE DE MORTE', `${next.name} está caído! Deseja rolar o teste de morte?`, 'danger');
            if (confirmed) this._rollDeathSave(next);
        }

        this.render();
    }

    async applyAction() {
        const input = this.$('#dmg-input').value;
        if (!input || !this._targetName) return Toast.show('Selecione um alvo e defina o dano!', 'warning');

        const roll = Dice.roll(input);
        const dmg = roll.total || parseInt(input) || 0;

        TOME.store.update(s => {
            const target = s.initiativeOrder.find(c => c.name === this._targetName);
            if (target) {
                target.hp_current = Math.max(0, target.hp_current - dmg);
                this._syncGlobalHP(s, target);
            }
        });

        this._log(`✨ <b>${this._targetName}</b> sofre ${dmg} de dano!`, dmg > 0 ? 'damage' : 'heal');
        this.$('#dmg-input').value = "";
        this.render();
    }

    _syncGlobalHP(state, combatant) {
        const list = combatant.type === 'Player' ? state.players : state.monsters;
        const entity = list.find(e => e.id === combatant.id);
        if (entity) {
            if (entity.hp) entity.hp.current = combatant.hp_current;
            else entity.hp_current = combatant.hp_current;
        }
    }

    _log(msg, type = 'info') {
        this._battleLog.unshift({
            msg, type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    }

    setRollMod(e, el) { this._rollMod = el.dataset.mode; this.render(); }
    selectTargetManual(e, el) { this._targetName = el.dataset.name; this.render(); }
    clearTarget() { this._targetName = null; this.render(); }
    toggleEconomy(e, el) { this._economy[el.dataset.type] = !this._economy[el.dataset.type]; this.render(); }

    async finishBattle() {
        const confirmed = await Modal.confirm('ENCERRAR COMBATE', 'Deseja finalizar o rastreamento de combate e registrar a vitória?', 'confirm');
        if (confirmed) {
            TOME.store.update(s => {
                s.combatActive = false;
                s.initiativeOrder = [];
            });
            Toast.show('Combate encerrado.');
        }
    }
}
