import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';

/**
 * DM SHIELD v4.0 — "Dungeon Master's Guide" Edition
 * Includes Core Tables (DC, Travel, Light) and Encounter Difficulty Calculator.
 */
export class DMShield extends Component {
    constructor(opts) {
        super(opts);
        this._selectedTable = 'dc'; // dc, travel, light
    }

    template() {
        const { resources, players, monsters, initiativeOrder } = this.store.state;

        return `
            <div class="page">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">🛡️ Escudo do Mestre Avançado</h2>
                        <p class="section-subtitle">Referências oficiais (PHB/DMG) e Gestão de Batalha</p>
                    </div>
                </div>

                <div class="grid grid-auto" style="grid-template-columns: 1fr 340px; gap:var(--space-lg);">
                    <!-- LEFT COLUMN: TABLES & TOOLS -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-lg);">
                        
                        <!-- CORE TABLES TABS -->
                        <div class="card glass-accent">
                            <div style="display:flex; gap:8px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px;">
                                <button class="btn btn-sm ${this._selectedTable === 'dc' ? 'btn-primary' : 'btn-ghost'}" data-action="setTable" data-tab="dc">Graus de Dificuldade</button>
                                <button class="btn btn-sm ${this._selectedTable === 'travel' ? 'btn-primary' : 'btn-ghost'}" data-action="setTable" data-tab="travel">Ritmo de Viagem</button>
                                <button class="btn btn-sm ${this._selectedTable === 'light' ? 'btn-primary' : 'btn-ghost'}" data-action="setTable" data-tab="light">Visibilidade & Luz</button>
                            </div>
                            <div id="table-content">
                                ${this._renderTable()}
                            </div>
                        </div>

                        <!-- ENCOUNTER CALCULATOR -->
                        <div class="card" style="border-top: 3px solid var(--warning);">
                            <div class="card-header"><span class="card-title">⚔️ Analisador de Encontro</span></div>
                            <div id="encounter-difficulty" style="padding:15px; background:rgba(0,0,0,0.2); border-radius:8px; margin-bottom:15px;">
                                ${this._calculateEncounterDifficulty()}
                            </div>
                            <div style="font-size:0.6rem; color:var(--text-dim);">Dificuldade baseada nos limites de XP do DMG por nível de personagem.</div>
                        </div>

                        <!-- RECENT EVENTS / LOG -->
                        <div class="card">
                            <div class="card-header"><span class="card-title">📜 Relatório Rápido da Sessão</span></div>
                            <div style="display:flex; flex-direction:column; gap:8px; font-size:0.7rem;">
                                <div class="glass" style="padding:10px;">
                                    <strong style="color:var(--accent);">Combatentes Ativos:</strong> ${initiativeOrder?.length || 0}
                                </div>
                                <div class="glass" style="padding:10px;">
                                    <strong style="color:var(--info);">Grupo (Players):</strong> ${players?.map(p => `${p.name} (Lv ${p.level})`).join(', ') || 'Nenhum'}
                                </div>
                                <button class="btn btn-ghost btn-sm" data-action="generateFinalReport">Gerar Relatório de Sessão</button>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: INITIATIVE & QUICK ACTIONS -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-lg);">
                        <div class="card" style="border-top: 3px solid var(--accent);">
                            <div class="card-header">
                                <span class="card-title">⚡ Iniciativa</span>
                                <button class="btn btn-primary btn-sm" data-action="rollInitiative">Novo Combate</button>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:5px;">
                                ${this._renderInitiative()}
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header"><span class="card-title">🧪 Recursos do Grupo</span></div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <div>
                                    <div class="form-label" style="font-size:0.6rem;">Poções</div>
                                    <div class="counter">
                                        <button data-action="decPotion">-</button>
                                        <span>${resources?.potions || 0}</span>
                                        <button data-action="incPotion">+</button>
                                    </div>
                                </div>
                                <div>
                                    <div class="form-label" style="font-size:0.6rem;">Pergaminhos</div>
                                    <div class="counter">
                                        <button data-action="decScroll">-</button>
                                        <span>${resources?.scrolls || 0}</span>
                                        <button data-action="incScroll">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header"><span class="card-title">🧠 Concentração</span></div>
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                ${this._renderConcentration()}
                                <button class="btn btn-ghost btn-sm btn-block" data-action="addConcentration">+ Adicionar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderTable() {
        if (this._selectedTable === 'dc') {
            return `
                <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                    <tr style="color:var(--accent); text-align:left; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <th style="padding:8px;">Dificuldade</th>
                        <th style="padding:8px;">CD</th>
                    </tr>
                    <tr><td style="padding:8px;">Muito Fácil</td><td style="padding:8px;">5</td></tr>
                    <tr><td style="padding:8px;">Fácil</td><td style="padding:8px;">10</td></tr>
                    <tr><td style="padding:8px;">Médio</td><td style="padding:8px;">15</td></tr>
                    <tr><td style="padding:8px;">Difícil</td><td style="padding:8px;">20</td></tr>
                    <tr><td style="padding:8px;">Muito Difícil</td><td style="padding:8px;">25</td></tr>
                    <tr><td style="padding:8px;">Quase Impossível</td><td style="padding:8px;">30</td></tr>
                </table>
            `;
        }
        if (this._selectedTable === 'travel') {
            return `
                <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                    <tr style="color:var(--info); text-align:left; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <th style="padding:8px;">Ritmo</th>
                        <th style="padding:8px;">Km/Dia</th>
                        <th style="padding:8px;">Efeito</th>
                    </tr>
                    <tr><td style="padding:8px;">Rápido</td><td style="padding:8px;">45km</td><td style="padding:8px;">-5 Percepção Passiva</td></tr>
                    <tr><td style="padding:8px;">Normal</td><td style="padding:8px;">36km</td><td style="padding:8px;">—</td></tr>
                    <tr><td style="padding:8px;">Lento</td><td style="padding:8px;">27km</td><td style="padding:8px;">Pode Furtar</td></tr>
                </table>
            `;
        }
        return `
            <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                <tr style="color:var(--warning); text-align:left; border-bottom:1px solid rgba(255,255,255,0.1);">
                    <th style="padding:8px;">Fonte</th>
                    <th style="padding:8px;">Luz Plena</th>
                    <th style="padding:8px;">Luz Ofuscada</th>
                </tr>
                <tr><td style="padding:8px;">Tocha</td><td style="padding:8px;">6m</td><td style="padding:8px;">+6m</td></tr>
                <tr><td style="padding:8px;">Lanterna (Foco)</td><td style="padding:8px;">18m (cone)</td><td style="padding:8px;">+18m (cone)</td></tr>
                <tr><td style="padding:8px;">Vela</td><td style="padding:8px;">1,5m</td><td style="padding:8px;">+1,5m</td></tr>
            </table>
        `;
    }

    _calculateEncounterDifficulty() {
        const { players, monsters } = this.store.state;
        if (!players?.length || !monsters?.length) return '<div style="color:var(--text-dim);">Adicione players e monstros para calcular.</div>';

        // XP Thresholds Table (Full DMG — Easy, Medium, Hard, Deadly)
        const thresholds = {
            1: [25, 50, 75, 100],
            2: [50, 100, 150, 200],
            3: [75, 150, 225, 400],
            4: [125, 250, 375, 500],
            5: [250, 500, 750, 1100],
            6: [300, 600, 900, 1400],
            7: [350, 750, 1100, 1700],
            8: [450, 900, 1400, 2100],
            9: [550, 1100, 1600, 2400],
            10: [600, 1200, 1900, 2800],
            11: [800, 1600, 2400, 3600],
            12: [1000, 2000, 3000, 4500],
            13: [1100, 2200, 3400, 5100],
            14: [1250, 2500, 3800, 5700],
            15: [1400, 2800, 4300, 6400],
            16: [1600, 3200, 4800, 7200],
            17: [2000, 3900, 5900, 8800],
            18: [2100, 4200, 6300, 9500],
            19: [2400, 4900, 7300, 10900],
            20: [2800, 5700, 8500, 12700]
        };

        let easyTotal = 0, medTotal = 0, hardTotal = 0, deadTotal = 0;
        players.forEach(p => {
            const lv = Math.min(10, p.level || 1); // Cap for demo
            const t = thresholds[lv] || thresholds[1];
            easyTotal += t[0]; medTotal += t[1]; hardTotal += t[2]; deadTotal += t[3];
        });

        // Calculate Monster XP (Simplified based on CR)
        const crXP = { "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "10": 5900 };
        let monsterXP = monsters.reduce((acc, m) => acc + (crXP[m.cr] || 100), 0);
        
        // Multiplier based on number of monsters
        const count = monsters.length;
        const mult = count === 1 ? 1 : count === 2 ? 1.5 : count < 7 ? 2 : count < 11 ? 2.5 : 3;
        const adjustedXP = monsterXP * mult;

        let diff = "Trivial";
        let color = "var(--success)";
        if (adjustedXP >= deadTotal) { diff = "MORTAL"; color = "var(--danger)"; }
        else if (adjustedXP >= hardTotal) { diff = "Difícil"; color = "var(--warning)"; }
        else if (adjustedXP >= medTotal) { diff = "Médio"; color = "var(--info)"; }
        else if (adjustedXP >= easyTotal) { diff = "Fácil"; color = "var(--success)"; }

        return `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase;">Dificuldade Estimada</div>
                    <div style="font-size:1.4rem; font-weight:800; color:${color}">${diff}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase;">XP Ajustado</div>
                    <div style="font-size:1.1rem; font-weight:700;">${adjustedXP} XP</div>
                </div>
            </div>
        `;
    }

    setTable(e, el) { this._selectedTable = el.dataset.tab; this.render(); }

    _renderInitiative() {
        const { initiativeOrder } = this.store.state;
        if (!initiativeOrder?.length) return `<div style="padding:10px; color:var(--text-dim); font-size:0.7rem; border:1px dashed rgba(255,255,255,0.05); text-align:center;">Nenhum combate iniciado.</div>`;
        return initiativeOrder.map((c, i) => `
            <div class="init-row ${i === 0 ? 'active' : ''}" style="padding:8px 12px; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.03);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="number" value="${c.roll}" data-action="updateManualRoll" data-index="${i}" style="width:35px; background:transparent; border:none; color:var(--accent); font-weight:800; text-align:center;">
                    <div style="font-weight:600; color:${c.type === 'Player' ? 'var(--info)' : 'var(--danger)'};">${c.name}</div>
                </div>
                <div style="font-size:0.6rem; opacity:0.6;">HP ${c.hp_current}/${c.hp_max}</div>
            </div>
        `).join('');
    }

    updateManualRoll(e, el) {
        const idx = parseInt(el.dataset.index);
        const val = parseInt(el.value) || 0;
        TOME.store.update(s => {
            if (s.initiativeOrder && s.initiativeOrder[idx]) {
                s.initiativeOrder[idx].roll = val;
                // Re-sort the entire combat order based on the new value
                s.initiativeOrder.sort((a, b) => b.roll - a.roll);
            }
        });
        Toast.show('Ordem de combate sincronizada!');
    }

    rollInitiative() {
        const { players, monsters } = this.store.state;
        const calcMod = (stat) => Math.floor(((stat || 10) - 10) / 2);
        if (!players?.length && !monsters?.length) { Toast.show('Adicione heróis ou monstros.', 'info'); return; }

        const monsterList = (monsters || []).map(m => ({
            name: m.name, type: 'Criatura', hp_current: m.hp?.current || 10, hp_max: m.hp?.max || 10,
            roll: Dice.roll('1d20').total + calcMod(m.stats?.dex), originalData: m
        }));

        const playerList = (players || []).map(p => ({
            name: p.name, type: 'Player', hp_current: p.hp?.current || 10, hp_max: p.hp?.max || 10, roll: 0
        }));

        TOME.store.update(s => {
            s.initiativeOrder = [...monsterList, ...playerList].sort((a, b) => b.roll - a.roll);
            s.combatActive = true;
            s.combatRound = 1;
        });
        Toast.show('Novo combate iniciado!');
    }

    _renderConcentration() {
        const { concentration } = this.store.state;
        if (!concentration?.length) return `<div style="font-size:0.65rem; color:var(--text-dim); text-align:center; padding:5px;">Ninguém concentrado.</div>`;
        return concentration.map((c, i) => `
            <div class="glass" style="padding:6px 10px; display:flex; justify-content:space-between; align-items:center; font-size:0.7rem;">
                <div><strong style="color:var(--accent);">${c.name}</strong><br><span style="font-size:0.6rem; opacity:0.7;">${c.spell}</span></div>
                <button class="btn btn-danger btn-sm" style="padding:2px 6px;" data-action="removeConcentration" data-index="${i}">✕</button>
            </div>
        `).join('');
    }

    addConcentration() {
        const name = prompt('Nome do herói:');
        const spell = prompt('Nome da magia:');
        if (name && spell) {
            TOME.store.update(s => s.concentration = [...(s.concentration || []), { name, spell }]);
        }
    }

    removeConcentration(e, el) {
        const idx = parseInt(el.dataset.index);
        TOME.store.update(s => s.concentration = s.concentration.filter((_, i) => i !== idx));
    }

    generateFinalReport() {
        const { players, combatRound } = this.store.state;
        const time = new Date().toLocaleString();
        const report = `
            RELATÓRIO DE SESSÃO TOME PRO
            Data: ${time}
            Rodadas de Combate: ${combatRound}
            Heróis: ${players.map(p => p.name).join(', ')}
            --------------------------
            Aventura concluída com sucesso!
        `;
        alert(report);
        Toast.show('Relatório gerado!');
    }

    incPotion() { TOME.store.update(s => s.resources.potions++); }
    decPotion() { TOME.store.update(s => { if (s.resources.potions > 0) s.resources.potions--; }); }
    incScroll() { TOME.store.update(s => s.resources.scrolls++); }
    decScroll() { TOME.store.update(s => { if (s.resources.scrolls > 0) s.resources.scrolls--; }); }
}
