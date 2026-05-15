import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';

/**
 * LOOT GENERATOR v5.0 — "The Vault"
 * Official DMG Individual Treasure Tables with Combat Integration.
 */
export class LootGenerator extends Component {
    constructor(opts) {
        super(opts);
        this._selectedTier = '0-4';
        this._result = null;
        this._tables = {
            '0-4': [
                { range: [1, 30], dice: '5d6', coin: 'cp' },
                { range: [31, 60], dice: '4d4', coin: 'sp' },
                { range: [61, 70], dice: '3d6', coin: 'ep' },
                { range: [71, 95], dice: '3d6', coin: 'gp' },
                { range: [96, 100], dice: '1d6', coin: 'pp' }
            ],
            '5-10': [
                { range: [1, 30], dice: '4d6*10', coin: 'cp, 1d6*10 sp' },
                { range: [31, 60], dice: '3d6*10', coin: 'sp, 2d6*10 gp' },
                { range: [61, 70], dice: '3d6*10', coin: 'ep, 2d6*10 gp' },
                { range: [71, 95], dice: '4d10*10', coin: 'gp' },
                { range: [96, 100], dice: '2d6*10', coin: 'gp, 3d6 pp' }
            ],
            '11-16': [
                { range: [1, 20], dice: '4d6*100', coin: 'sp, 1d6*100 gp' },
                { range: [21, 35], dice: '1d6*100', coin: 'ep, 1d6*100 gp' },
                { range: [36, 75], dice: '2d10*100', coin: 'gp, 1d6*10 pp' },
                { range: [76, 100], dice: '2d10*100', coin: 'gp, 2d6*10 pp' }
            ],
            '17+': [
                { range: [1, 15], dice: '2d10*1000', coin: 'ep, 8d6*100 gp' },
                { range: [16, 55], dice: '1d6*1000', coin: 'gp, 1d6*100 pp' },
                { range: [56, 100], dice: '1d6*1000', coin: 'gp, 2d6*100 pp' }
            ]
        };
    }

    template() {
        const { monsters } = this.store.state;
        const suggestedTier = this._getSuggestedTier(monsters);

        return `
            <div class="page" style="max-width: 1200px;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title"><i class="fa-solid fa-coins" style="color:var(--accent); margin-right:12px;"></i> Gerador de Tesouros</h2>
                        <p class="section-subtitle">Tesouros Individuais baseados no Guia do Mestre (DMG)</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 350px; gap:var(--space-lg); align-items:start;">
                    
                    <!-- ROLLER SECTION -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                        <div class="card" style="padding:25px; background:rgba(212,175,55,0.03); border:1px solid rgba(212,175,55,0.1);">
                            <p style="font-size:0.8rem; margin-bottom:15px; color:var(--text-dim);">
                                <i class="fa-solid fa-bullseye" style="color:var(--accent);"></i> 
                                Sugestão baseada no último combate: <strong style="color:var(--accent);">ND ${suggestedTier}</strong>
                            </p>
                            
                            <div class="grid grid-4" style="gap:10px; margin-bottom:25px;">
                                ${Object.keys(this._tables).map(tier => `
                                    <button class="btn ${this._selectedTier === tier ? 'btn-primary' : 'btn-ghost'}" 
                                            style="height:auto; padding:15px; flex-direction:column;"
                                            data-action="setTier" data-tier="${tier}">
                                        <span style="font-size:0.6rem; opacity:0.7;">ND</span>
                                        <span style="font-size:1.1rem; font-weight:800;">${tier}</span>
                                    </button>
                                `).join('')}
                            </div>

                            <button class="btn btn-primary btn-block" style="padding:20px; font-size:1.1rem; letter-spacing:1px;" data-action="rollLoot">
                                <i class="fa-solid fa-dice-d20" style="margin-right:10px;"></i> GERAR SAQUE AGORA
                            </button>
                        </div>

                        ${this._result ? this._renderResult() : `<div class="card empty-state" style="height:200px; opacity:0.3;">Aguardando rolagem de tesouro...</div>`}
                    </div>

                    <!-- REFERENCE TABLE -->
                    <div class="card" style="padding:0; overflow:hidden;">
                        <div class="card-header" style="background:rgba(0,0,0,0.2); padding:15px; margin-bottom:0;">
                            <span class="card-title" style="font-size:0.75rem;">📋 TABELA DE PROBABILIDADES (ND ${this._selectedTier})</span>
                        </div>
                        <div style="padding:15px;">
                            <table style="width:100%; font-size:0.7rem; border-collapse:collapse;">
                                <thead style="color:var(--accent); text-align:left;">
                                    <tr>
                                        <th style="padding:8px 0;">d100</th>
                                        <th style="padding:8px 0;">Tesouro Estimado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this._tables[this._selectedTier].map(row => `
                                        <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                                            <td style="padding:8px 0; font-weight:700;">${row.range[0]}-${row.range[1]}</td>
                                            <td style="padding:8px 0; color:var(--text-dim);">${row.dice} ${row.coin}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderResult() {
        return `
            <div class="card glass-accent" style="padding:30px; border-top:4px solid var(--accent); text-align:center; animation: scaleIn 0.3s ease-out;">
                <div style="font-size:0.8rem; color:var(--text-dim); margin-bottom:10px;">RESULTADO DA ROLAGEM (${this._result.roll})</div>
                <div style="display:flex; justify-content:center; gap:20px; align-items:center;">
                    <i class="fa-solid fa-sack-dollar" style="font-size:3rem; color:var(--accent);"></i>
                    <div style="text-align:left;">
                        <div style="font-size:2.5rem; font-weight:800; color:#fff; line-height:1;">${this._result.total}</div>
                        <div style="font-size:1.1rem; color:var(--accent); font-weight:700; text-transform:uppercase;">${this._result.coin}</div>
                    </div>
                </div>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="btn btn-ghost btn-sm btn-block" data-action="copyLoot">Copiar para Notas</button>
                    <button class="btn btn-primary btn-sm btn-block" data-action="clearResult">Limpar</button>
                </div>
            </div>
        `;
    }

    _getSuggestedTier(monsters) {
        if (!monsters?.length) return '0-4';
        const maxCR = Math.max(...monsters.map(m => parseInt(m.cr) || 0));
        if (maxCR <= 4) return '0-4';
        if (maxCR <= 10) return '5-10';
        if (maxCR <= 16) return '11-16';
        return '17+';
    }

    setTier(e, el) { this._selectedTier = el.dataset.tier; this.render(); }

    rollLoot() {
        const audio = TOME.get('audio');
        if (audio) audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');
        const roll = Dice.roll('1d100').total;
        const table = this._tables[this._selectedTier];
        const match = table.find(r => roll >= r.range[0] && roll <= r.range[1]);

        if (match) {
            // Handle complex formulas like 4d6*10
            const diceParts = match.dice.split('*');
            let total = Dice.roll(diceParts[0]).total;
            if (diceParts[1]) total *= parseInt(diceParts[1]);

            this._result = {
                roll: roll,
                total: total,
                coin: match.coin
            };
            this.render();
        }
    }

    copyLoot() {
        if (!this._result) return;
        const text = `💰 Saque: ${this._result.total} ${this._result.coin}`;
        navigator.clipboard.writeText(text);
        Toast.show('Copiado para a área de transferência!');
    }

    clearResult() { this._result = null; this.render(); }
}
