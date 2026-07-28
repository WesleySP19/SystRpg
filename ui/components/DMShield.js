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
            <div class="page" style="max-width: 1300px; padding: 20px; animation: fadeIn 0.4s ease-out;">
                <style>
                    /* Custom scrollbar for tables & threats */
                    .custom-scroll::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    .custom-scroll::-webkit-scrollbar-track {
                        background: rgba(0,0,0,0.15);
                        border-radius: 4px;
                    }
                    .custom-scroll::-webkit-scrollbar-thumb {
                        background: rgba(197, 160, 89, 0.4);
                        border-radius: 4px;
                    }
                    .custom-scroll::-webkit-scrollbar-thumb:hover {
                        background: rgba(197, 160, 89, 0.7);
                    }

                    /* Tables Style */
                    .shield-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: 'Outfit', sans-serif;
                    }
                    .shield-table th {
                        font-family: 'Cinzel', serif;
                        color: var(--accent);
                        border-bottom: 2px solid rgba(197, 160, 89, 0.3);
                        padding: 10px 8px;
                        text-align: left;
                    }
                    .shield-table td {
                        padding: 10px 8px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        transition: background-color 0.15s ease;
                    }
                    .shield-table tr:hover td {
                        background-color: rgba(255, 255, 255, 0.02);
                    }

                    /* Glowing threat banners */
                    .letalidade-banner {
                        transition: all 0.3s ease;
                        border-radius: 12px;
                    }
                    
                    /* Keyframes for pulsars */
                    @keyframes pulseTrivial {
                        0% { box-shadow: 0 0 8px rgba(255,255,255,0.05); }
                        50% { box-shadow: 0 0 16px rgba(255,255,255,0.15); }
                        100% { box-shadow: 0 0 8px rgba(255,255,255,0.05); }
                    }
                    @keyframes pulseFacil {
                        0% { box-shadow: 0 0 8px rgba(46,204,113,0.15); }
                        50% { box-shadow: 0 0 18px rgba(46,204,113,0.35); }
                        100% { box-shadow: 0 0 8px rgba(46,204,113,0.15); }
                    }
                    @keyframes pulseMedio {
                        0% { box-shadow: 0 0 8px rgba(52,152,219,0.15); }
                        50% { box-shadow: 0 0 18px rgba(52,152,219,0.35); }
                        100% { box-shadow: 0 0 8px rgba(52,152,219,0.15); }
                    }
                    @keyframes pulseDificil {
                        0% { box-shadow: 0 0 8px rgba(241,196,15,0.15); }
                        50% { box-shadow: 0 0 18px rgba(241,196,15,0.40); }
                        100% { box-shadow: 0 0 8px rgba(241,196,15,0.15); }
                    }
                    @keyframes pulseMortal {
                        0% { box-shadow: 0 0 10px rgba(231,76,60,0.25); }
                        50% { box-shadow: 0 0 22px rgba(231,76,60,0.55); }
                        100% { box-shadow: 0 0 10px rgba(231,76,60,0.25); }
                    }

                    .glow-trivial { animation: pulseTrivial 2.5s infinite ease-in-out; }
                    .glow-facil { animation: pulseFacil 2.5s infinite ease-in-out; }
                    .glow-medio { animation: pulseMedio 2.5s infinite ease-in-out; }
                    .glow-dificil { animation: pulseDificil 2.5s infinite ease-in-out; }
                    .glow-mortal { animation: pulseMortal 2.5s infinite ease-in-out; }
                </style>
                <div class="section-header" style="border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:20px; margin-bottom:30px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.5);">
                            <i class="fa-solid fa-shield-halved" style="margin-right:12px;"></i> Escudo do Mestre Lendário
                        </h2>
                        <p class="section-subtitle" style="color:var(--text-dim);">Referências rápidas do Livro do Jogador (PHB) e analistas táticos em tempo real.</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 360px; gap:30px; align-items:start;">
                    <!-- LEFT COLUMN: TABLES & TOOLS -->
                    <div style="display:flex; flex-direction:column; gap:25px;">
                        
                        <!-- CORE TABLES TABS -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px;">
                            <div class="custom-scroll" style="display:flex; gap:8px; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px; overflow-x:auto;">
                                <button class="btn btn-sm ${this._selectedTable === 'dc' ? 'btn-primary' : 'btn-ghost'}" style="border-radius:20px; padding:6px 15px; white-space:nowrap;" data-action="setTable" data-tab="dc">
                                    <i class="fa-solid fa-chart-line" style="margin-right:6px;"></i> Graus de CD
                                </button>
                                <button class="btn btn-sm ${this._selectedTable === 'travel' ? 'btn-primary' : 'btn-ghost'}" style="border-radius:20px; padding:6px 15px; white-space:nowrap;" data-action="setTable" data-tab="travel">
                                    <i class="fa-solid fa-boot" style="margin-right:6px;"></i> Ritmo de Viagem
                                </button>
                                <button class="btn btn-sm ${this._selectedTable === 'light' ? 'btn-primary' : 'btn-ghost'}" style="border-radius:20px; padding:6px 15px; white-space:nowrap;" data-action="setTable" data-tab="light">
                                    <i class="fa-solid fa-sun" style="margin-right:6px;"></i> Luz
                                </button>
                                <button class="btn btn-sm ${this._selectedTable === 'armor' ? 'btn-primary' : 'btn-ghost'}" style="border-radius:20px; padding:6px 15px; white-space:nowrap;" data-action="setTable" data-tab="armor">
                                    <i class="fa-solid fa-shield" style="margin-right:6px;"></i> Armaduras
                                </button>
                                <button class="btn btn-sm ${this._selectedTable === 'prof' ? 'btn-primary' : 'btn-ghost'}" style="border-radius:20px; padding:6px 15px; white-space:nowrap;" data-action="setTable" data-tab="prof">
                                    <i class="fa-solid fa-star" style="margin-right:6px;"></i> Proficiência
                                </button>
                                <button class="btn btn-sm ${this._selectedTable === 'conditions' ? 'btn-primary' : 'btn-ghost'}" style="border-radius:20px; padding:6px 15px; white-space:nowrap;" data-action="setTable" data-tab="conditions">
                                    <i class="fa-solid fa-skull-crossbones" style="margin-right:6px;"></i> Condições
                                </button>
                            </div>
                            <div id="table-content" style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.04);">
                                ${this._renderTable()}
                            </div>
                        </div>

                        <!-- ENCOUNTER CALCULATOR -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px; border-top:3px solid var(--accent);">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-calculator" style="margin-right:8px;"></i> Analisador de Margem de Encontro
                            </div>
                            <div id="encounter-difficulty" style="background:rgba(0,0,0,0.4); border-radius:12px; border:1px solid rgba(255,255,255,0.05); overflow:hidden;">
                                ${this._calculateEncounterDifficulty()}
                            </div>
                            <div style="font-size:0.7rem; color:var(--text-dim); margin-top:10px; opacity:0.7;">
                                <i class="fa-solid fa-info-circle"></i> Cálculos oficiais baseados nos limiares de XP por Nível (DMG cap. 3).
                            </div>
                        </div>

                        <!-- XP & SUMMONED MONSTERS PANEL -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px; border-top:3px solid var(--accent); display:flex; flex-direction:column; gap:20px;">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                                <span><i class="fa-solid fa-award" style="margin-right:8px;"></i> Painel de Ordem e Recompensas</span>
                                <span style="font-size:0.7rem; color:var(--text-dim); font-family:'Roboto'; font-weight:normal;">XP & Efeitos</span>
                            </div>

                            <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:25px;">
                                <!-- Left Section: XP Distributor -->
                                <div style="border-right:1px solid rgba(255,255,255,0.06); padding-right:20px;">
                                    <div style="font-weight:700; font-size:0.85rem; color:var(--accent); text-transform:uppercase; margin-bottom:12px; font-family:'Cinzel';">💰 Distribuidor de XP</div>
                                    
                                    <div style="display:flex; flex-direction:column; gap:12px;">
                                        <div>
                                            <small style="color:var(--text-dim); display:block; margin-bottom:5px;">Montante Total de XP:</small>
                                            <div style="display:flex; gap:8px;">
                                                <input type="number" id="dm-xp-input" value="0" min="0" class="legacy-input" style="flex:1; text-align:center; font-weight:800; font-size:1.1rem; background:rgba(0,0,0,0.5); border:1px solid rgba(197, 160, 89, 0.3);">
                                                <button class="btn btn-ghost" style="padding:6px 12px; font-size:0.75rem; border:1px solid rgba(197, 160, 89, 0.4);" data-action="autoCalcMonsterXP" title="Auto-Somar XP dos monstros invocados">
                                                    ⚡ AUTO-SOMAR
                                                </button>
                                            </div>
                                        </div>

                                        <button class="btn btn-primary btn-block" style="padding:10px; font-family:'Cinzel'; margin-top:5px;" data-action="distributeXP">
                                            ✨ DISTRIBUIR ENTRE JOGADORES
                                        </button>
                                        
                                        <div style="font-size:0.65rem; color:var(--text-dim); line-height:1.4;">
                                            * Divide o montante de XP igualmente entre todos os <strong>${players?.length || 0}</strong> jogadores ativos. O XP é injetado diretamente em suas fichas.
                                        </div>
                                    </div>
                                </div>

                                <!-- Right Section: Summoned Monsters Banish/Clean-up -->
                                <div>
                                    <div style="font-weight:700; font-size:0.85rem; color:var(--danger); text-transform:uppercase; margin-bottom:12px; font-family:'Cinzel';">🗑️ Ameaças Ativas</div>
                                    
                                    <div class="custom-scroll" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:5px;">
                                        ${(monsters || []).map((m, idx) => `
                                            <div class="glass" style="padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-radius:10px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.25);">
                                                <div style="min-width:0; flex:1; padding-right:10px;">
                                                    <div style="font-weight:800; font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                                        ${m.emoji || '🐾'} ${m.name}
                                                    </div>
                                                    <div style="font-size:0.65rem; opacity:0.6; margin-top:2px;">
                                                        ND ${m.cr || '1'} | HP: ${m.hp?.current || 0}/${m.hp?.max || 0}
                                                    </div>
                                                </div>
                                                <button class="btn btn-danger btn-sm" style="padding:5px 8px; font-size:0.65rem; border-radius:6px; flex-shrink:0; background:rgba(239, 68, 68, 0.2); border-color:rgba(239, 68, 68, 0.4);" 
                                                        data-action="banishSummonedMonster" data-id="${m.id}" data-name="${m.name}" title="Eliminar monstro do mapa e combate">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        `).join('')}

                                        ${!(monsters?.length) ? `
                                            <div style="text-align:center; padding:30px 10px; opacity:0.3; font-size:0.75rem; border:1px dashed rgba(255,255,255,0.05); border-radius:10px;">
                                                Nenhum monstro invocado atualmente.
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RECENT EVENTS / LOG -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px;">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-scroll" style="margin-right:8px;"></i> Relatório de Crônicas Rápidas
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:15px;">
                                <div style="background:rgba(197,160,89,0.05); border:1px solid rgba(197,160,89,0.15); padding:12px; border-radius:10px; text-align:center;">
                                    <div style="font-size:0.65rem; color:var(--accent); text-transform:uppercase; letter-spacing:1px;">Combatentes em Fila</div>
                                    <div style="font-size:1.8rem; font-weight:900; color:#fff; font-family:'Cinzel'; margin-top:5px;">${initiativeOrder?.length || 0}</div>
                                </div>
                                <div style="background:rgba(52,152,219,0.05); border:1px solid rgba(52,152,219,0.15); padding:12px; border-radius:10px; text-align:center;">
                                    <div style="font-size:0.65rem; color:var(--info); text-transform:uppercase; letter-spacing:1px;">Heróis na Campanha</div>
                                    <div style="font-size:1.8rem; font-weight:900; color:#fff; font-family:'Cinzel'; margin-top:5px;">${players?.length || 0}</div>
                                </div>
                            </div>
                            <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" data-action="generateFinalReport">
                                <i class="fa-solid fa-file-invoice" style="margin-right:8px;"></i> Compilar Resumo da Sessão
                            </button>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: INITIATIVE & QUICK ACTIONS -->
                    <div style="display:flex; flex-direction:column; gap:25px;">
                        
                        <!-- INITIATIVE TRACKER -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px; border-top:3px solid var(--accent);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
                                <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700;">
                                    <i class="fa-solid fa-bolt" style="margin-right:6px;"></i> Fila de Iniciativa
                                </div>
                                <button class="btn btn-primary btn-sm" style="border-radius:15px; padding:4px 12px; font-size:0.75rem;" data-action="rollInitiative">
                                    <i class="fa-solid fa-play"></i> Iniciar
                                </button>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${this._renderInitiative()}
                            </div>
                        </div>

                        <!-- PARTY RESOURCES -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px;">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-suitcase" style="margin-right:8px;"></i> Consumíveis do Grupo
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:12px;">
                                    <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; text-align:center;">🧪 Poções de Cura</div>
                                    <div class="counter" style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border-radius:8px; overflow:hidden;">
                                        <button style="border:none; background:none; color:var(--danger); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="decPotion">-</button>
                                        <span style="font-weight:900; font-size:1.1rem; color:#fff;">${resources?.potions || 0}</span>
                                        <button style="border:none; background:none; color:var(--success); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="incPotion">+</button>
                                    </div>
                                </div>
                                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:12px;">
                                    <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; text-align:center;">📜 Pergaminhos</div>
                                    <div class="counter" style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border-radius:8px; overflow:hidden;">
                                        <button style="border:none; background:none; color:var(--danger); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="decScroll">-</button>
                                        <span style="font-weight:900; font-size:1.1rem; color:#fff;">${resources?.scrolls || 0}</span>
                                        <button style="border:none; background:none; color:var(--success); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="incScroll">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CONCENTRATION -->
                        <div class="card glass-accent" style="padding:25px; border-radius:16px;">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-brain" style="margin-right:8px;"></i> Foco & Concentração
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px;">
                                ${this._renderConcentration()}
                            </div>
                            <button class="btn btn-ghost btn-sm btn-block" style="border-radius:8px; padding:8px;" data-action="addConcentration">
                                <i class="fa-solid fa-plus" style="margin-right:6px;"></i> Registrar Concentrador
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderTable() {
        if (this._selectedTable === 'dc') {
            return `
                <table class="shield-table">
                    <thead>
                        <tr style="text-align:left;">
                            <th>Grau de Dificuldade</th>
                            <th style="text-align:right;">Classe de Dificuldade (CD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Muito Fácil</td><td style="text-align:right; font-weight:800; color:var(--accent);">05</td></tr>
                        <tr><td>Fácil</td><td style="text-align:right; font-weight:800; color:var(--accent);">10</td></tr>
                        <tr><td>Médio</td><td style="text-align:right; font-weight:800; color:var(--accent);">15</td></tr>
                        <tr><td>Difícil</td><td style="text-align:right; font-weight:800; color:var(--accent);">20</td></tr>
                        <tr><td>Muito Difícil</td><td style="text-align:right; font-weight:800; color:var(--accent);">25</td></tr>
                        <tr><td>Quase Impossível</td><td style="text-align:right; font-weight:800; color:var(--accent);">30</td></tr>
                    </tbody>
                </table>
            `;
        }
        if (this._selectedTable === 'travel') {
            return `
                <table class="shield-table">
                    <thead>
                        <tr style="text-align:left;">
                            <th style="color:var(--info);">Ritmo de Marcha</th>
                            <th>Distância/Dia</th>
                            <th style="text-align:right;">Efeito em Jogo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="font-weight:800; color:var(--info);">Rápido</td><td>45 km (30 milhas)</td><td style="text-align:right; color:var(--danger);">-5 Percepção Passiva</td></tr>
                        <tr><td style="font-weight:800; color:var(--info);">Normal</td><td>36 km (24 milhas)</td><td style="text-align:right; color:var(--text-dim);">Nenhum</td></tr>
                        <tr><td style="font-weight:800; color:var(--info);">Lento</td><td>27 km (18 milhas)</td><td style="text-align:right; color:var(--success);">Permite Furtividade</td></tr>
                    </tbody>
                </table>
            `;
        }
        if (this._selectedTable === 'light') {
            return `
                <table class="shield-table">
                    <thead>
                        <tr style="text-align:left;">
                            <th style="color:var(--warning);">Fonte de Ignição</th>
                            <th>Luminosidade Plena</th>
                            <th style="text-align:right;">Luz Ofuscada</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="font-weight:800; color:var(--warning);">Tocha</td><td>Raio de 6m (20ft)</td><td style="text-align:right; color:var(--text-dim);">Mais 6m adicionais</td></tr>
                        <tr><td style="font-weight:800; color:var(--warning);">Lanterna Furta-Fogo</td><td>Cone de 18m (60ft)</td><td style="text-align:right; color:var(--text-dim);">Cone de +18m</td></tr>
                        <tr><td style="font-weight:800; color:var(--warning);">Vela</td><td>Raio de 1,5m (5ft)</td><td style="text-align:right; color:var(--text-dim);">Mais 1,5m adicionais</td></tr>
                    </tbody>
                </table>
            `;
        }
        if (this._selectedTable === 'armor') {
            return `
                <table class="shield-table" style="font-size:0.75rem;">
                    <thead>
                        <tr style="text-align:left;">
                            <th>Armadura</th>
                            <th>Classe de Armadura (CA)</th>
                            <th style="text-align:right;">Furtividade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Leves -->
                        <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Leves</td></tr>
                        <tr><td>Acolchoada</td><td>11 + mod. Des</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                        <tr><td>Couro</td><td>11 + mod. Des</td><td style="text-align:right;">—</td></tr>
                        <tr><td>Couro Batido</td><td>12 + mod. Des</td><td style="text-align:right;">—</td></tr>
                        <!-- Médias -->
                        <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Médias</td></tr>
                        <tr><td>Camisão de Malha</td><td>13 + mod. Des (máx +2)</td><td style="text-align:right;">—</td></tr>
                        <tr><td>Peitoral</td><td>14 + mod. Des (máx +2)</td><td style="text-align:right;">—</td></tr>
                        <tr><td>Meia Armadura</td><td>15 + mod. Des (máx +2)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                        <!-- Pesadas -->
                        <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Pesadas</td></tr>
                        <tr><td>Cota de Malha</td><td>16 (Req: For 13)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                        <tr><td>Placas</td><td>18 (Req: For 15)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                        <!-- Escudo -->
                        <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Escudos</td></tr>
                        <tr><td>Escudo comum</td><td>+2 de Bônus na CA</td><td style="text-align:right;">—</td></tr>
                    </tbody>
                </table>
            `;
        }
        if (this._selectedTable === 'prof') {
            return `
                <div style="display:flex; gap:15px;">
                    <table class="shield-table" style="flex:1;">
                        <thead>
                            <tr style="text-align:center;">
                                <th style="color:var(--success); text-align:center;">Níveis (1 a 10)</th>
                                <th style="color:var(--success); text-align:center;">Bônus</th>
                            </tr>
                        </thead>
                        <tbody style="text-align:center;">
                            <tr>
                                <td>Nível 1 a 4</td>
                                <td style="font-weight:800; color:var(--success);">+2</td>
                            </tr>
                            <tr>
                                <td>Nível 5 a 8</td>
                                <td style="font-weight:800; color:var(--success);">+3</td>
                            </tr>
                            <tr>
                                <td>Nível 9 a 10</td>
                                <td style="font-weight:800; color:var(--success);">+4</td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="shield-table" style="flex:1;">
                        <thead>
                            <tr style="text-align:center;">
                                <th style="color:var(--success); text-align:center;">Níveis (11 a 20)</th>
                                <th style="color:var(--success); text-align:center;">Bônus</th>
                            </tr>
                        </thead>
                        <tbody style="text-align:center;">
                            <tr>
                                <td>Nível 11 a 12</td>
                                <td style="font-weight:800; color:var(--success);">+4</td>
                            </tr>
                            <tr>
                                <td>Nível 13 a 16</td>
                                <td style="font-weight:800; color:var(--success);">+5</td>
                            </tr>
                            <tr>
                                <td>Nível 17 a 20</td>
                                <td style="font-weight:800; color:var(--success);">+6</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }
        if (this._selectedTable === 'conditions') {
            return `
                <div class="custom-scroll" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                    <table class="shield-table" style="font-size:0.75rem;">
                        <thead>
                            <tr style="text-align:left;">
                                <th style="color:var(--danger); width:35%;">Condição</th>
                                <th style="color:var(--danger);">Efeitos Principais</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Agarramento</td>
                                <td style="color:var(--text-dim);">Deslocamento torna-se 0 e não se beneficia de bônus no deslocamento. Termina se o agarrador for incapacitado.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Amedrontado</td>
                                <td style="color:var(--text-dim);">Desvantagem em ataques e testes se puder ver a fonte do medo. Não pode se aproximar voluntariamente da fonte.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Atordoado</td>
                                <td style="color:var(--text-dim);">Incapacitado, não pode se mover, falha automática em For/Des. Ataques contra têm Vantagem.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Caído</td>
                                <td style="color:var(--text-dim);">Apenas rasteja. Desvantagem nos próprios ataques. Ataques corpo-a-corpo contra têm Vantagem. Distância têm Desvantagem.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Cego</td>
                                <td style="color:var(--text-dim);">Falha automática em testes de visão. Ataques do alvo têm Desvantagem; ataques contra o alvo têm Vantagem.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Enfeitiçado</td>
                                <td style="color:var(--text-dim);">Não pode atacar o charmoso. Charmoso tem Vantagem em interações sociais com o alvo.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Envenenado</td>
                                <td style="color:var(--text-dim);">Desvantagem em jogadas de ataque e testes de habilidade.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Impedido</td>
                                <td style="color:var(--text-dim);">Deslocamento 0. Ataques do alvo têm Desvantagem; contra têm Vantagem. Desvantagem em testes de Des.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Invisível</td>
                                <td style="color:var(--text-dim);">Inalvejável para coisas que requerem visão. Ataques têm Vantagem; ataques contra têm Desvantagem.</td>
                            </tr>
                            <tr>
                                <td style="font-weight:800; color:var(--danger); vertical-align:top;">Paralisado</td>
                                <td style="color:var(--text-dim);">Incapacitado e não se move. Falha auto For/Des. Ataques contra têm Vantagem. Acertos corpo-a-corpo são críticos automáticos.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    _calculateEncounterDifficulty() {
        const { players, monsters } = this.store.state;
        if (!players?.length || !monsters?.length) {
            return `
                <div style="padding:25px; text-align:center; color:var(--text-dim); display:flex; flex-direction:column; align-items:center; gap:8px;">
                    <i class="fa-solid fa-feather-pointed fa-2x" style="opacity:0.2;"></i>
                    <span>Adicione aventureiros e monstros para computar a taxa de perigo.</span>
                </div>
            `;
        }

        // XP Thresholds Table — DMG oficial (todos os níveis 1-20)
        const thresholds = {
            1:  [25,   50,   75,   100],
            2:  [50,   100,  150,  200],
            3:  [75,   150,  225,  400],
            4:  [125,  250,  375,  500],
            5:  [250,  500,  750,  1100],
            6:  [300,  600,  900,  1400],
            7:  [350,  750,  1100, 1700],
            8:  [450,  900,  1400, 2100],
            9:  [550,  1100, 1600, 2400],
            10: [600,  1200, 1900, 2800],
            11: [800,  1600, 2400, 3600],
            12: [1000, 2000, 3000, 4500],
            13: [1100, 2200, 3400, 5100],
            14: [1250, 2500, 3800, 5700],
            15: [1400, 2800, 4300, 6400],
            16: [1600, 3200, 4800, 7200],
            17: [2000, 3900, 5900, 8800],
            18: [2100, 4200, 6300, 9500],
            19: [2400, 4900, 7300, 10900],
            20: [2800, 5700, 8500, 12700],
        };

        let easyTotal = 0, medTotal = 0, hardTotal = 0, deadTotal = 0;
        players.forEach(p => {
            const lv = Math.min(20, Math.max(1, parseInt(p.level) || 1));
            const t = thresholds[lv] || thresholds[1];
            easyTotal += t[0]; medTotal += t[1]; hardTotal += t[2]; deadTotal += t[3];
        });

        // XP por CR — tabela completa CR 0 até CR 30 (DMG oficial)
        const crXP = {
            "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
            "1": 200, "2": 450, "3": 700, "4": 1100,
            "5": 1800, "6": 2300, "7": 2900, "8": 3900,
            "9": 5000, "10": 5900, "11": 7200, "12": 8400,
            "13": 10000, "14": 11500, "15": 13000, "16": 15000,
            "17": 18000, "18": 20000, "19": 22000, "20": 25000,
            "21": 33000, "22": 41000, "23": 50000, "24": 62000,
            "25": 75000, "26": 90000, "27": 105000, "28": 120000,
            "29": 135000, "30": 155000
        };
        let monsterXP = monsters.reduce((acc, m) => acc + (crXP[String(m.cr).trim()] || 100), 0);
        
        // Multiplier based on number of monsters
        const count = monsters.length;
        const mult = count === 1 ? 1 : count === 2 ? 1.5 : count < 7 ? 2 : count < 11 ? 2.5 : 3;
        const adjustedXP = monsterXP * mult;

        let diff = "Trivial";
        let color = "var(--text-dim)";
        let glowClass = "glow-trivial";
        let bgGradient = "linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.08))";
        if (adjustedXP >= deadTotal) { diff = "MORTAL 💀"; color = "var(--danger)"; glowClass = "glow-mortal"; bgGradient = "linear-gradient(to right, rgba(231,76,60,0.1), rgba(231,76,60,0.25))"; }
        else if (adjustedXP >= hardTotal) { diff = "Difícil ⚠️"; color = "var(--warning)"; glowClass = "glow-dificil"; bgGradient = "linear-gradient(to right, rgba(241,196,15,0.08), rgba(241,196,15,0.2))"; }
        else if (adjustedXP >= medTotal) { diff = "Médio ⚔️"; color = "var(--info)"; glowClass = "glow-medio"; bgGradient = "linear-gradient(to right, rgba(52,152,219,0.08), rgba(52,152,219,0.2))"; }
        else if (adjustedXP >= easyTotal) { diff = "Fácil 🛡️"; color = "var(--success)"; glowClass = "glow-facil"; bgGradient = "linear-gradient(to right, rgba(46,204,113,0.08), rgba(46,204,113,0.2))"; }

        return `
            <div class="letalidade-banner ${glowClass}" style="background:${bgGradient}; padding:20px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid ${color}; transition: all 0.3s ease;">
                <div>
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Letalidade Avaliada</div>
                    <div style="font-size:1.6rem; font-weight:900; color:${color}; font-family:'Cinzel'; text-shadow:0 0 10px rgba(0,0,0,0.5);">${diff}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">XP do Desafio</div>
                    <div style="font-size:1.4rem; font-weight:800; color:#fff; font-family:'Cinzel';">${adjustedXP} <span style="font-size:0.75rem; color:var(--accent);">XP</span></div>
                </div>
            </div>
        `;
    }

    setTable(e, el) { this._selectedTable = el.dataset.tab; this.render(); }

    _renderInitiative() {
        const { initiativeOrder } = this.store.state;
        if (!initiativeOrder?.length) return `
            <div style="padding:25px; text-align:center; color:var(--text-dim); display:flex; flex-direction:column; align-items:center; gap:8px; border:1px dashed rgba(255,255,255,0.08); border-radius:12px;">
                <i class="fa-solid fa-hourglass-empty" style="opacity:0.2; font-size:1.5rem;"></i>
                <span style="font-size:0.75rem;">A fila de iniciativa está vazia.</span>
            </div>
        `;
        return initiativeOrder.map((c, i) => {
            const active = i === 0;
            const isPlayer = c.type === 'Player';
            return `
                <div class="init-row" style="
                    display:flex; justify-content:space-between; align-items:center;
                    padding:10px 15px; border-radius:10px;
                    background:${active ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)'};
                    border:1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.05)'};
                    box-shadow:${active ? '0 0 10px rgba(197,160,89,0.15)' : 'none'};
                    transition:all 0.2s;
                ">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <input type="number" value="${c.roll}" data-action="updateManualRoll" data-index="${i}" 
                               style="width:32px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--accent); font-weight:900; text-align:center; font-size:0.85rem; padding:3px 0;">
                        <div>
                            <div style="font-weight:800; font-size:0.85rem; color:${isPlayer ? 'var(--info)' : 'var(--danger)'};">${c.name}</div>
                            <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">${c.type}</div>
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:6px; font-size:0.7rem; border:1px solid rgba(255,255,255,0.04); font-weight:700;">
                        HP <span style="color:${c.hp_current <= c.hp_max * 0.3 ? 'var(--danger)' : 'var(--success)'};">${c.hp_current}</span>/${c.hp_max}
                    </div>
                </div>
            `;
        }).join('');
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
            id: m.id,
            name: m.name, type: 'Criatura', hp_current: m.hp?.current || 10, hp_max: m.hp?.max || 10,
            roll: Dice.roll('1d20').total + calcMod(m.stats?.dex), originalData: m
        }));

        const playerList = (players || []).map(p => ({
            id: p.id || `p-${Date.now()}-${Math.random()}`,
            name: p.name, type: 'Player', hp_current: p.hp?.current || 10, hp_max: p.hp?.max || 10, roll: 0
        }));

        TOME.store.update(s => {
            s.initiativeOrder = [...monsterList, ...playerList].sort((a, b) => b.roll - a.roll);
            s.combatActive = true;
            s.combatRound = 1;
        });
        Toast.show('Novo combate iniciado!');
    }

    autoCalcMonsterXP() {
        const { monsters } = this.store.state;
        // Tabela XP por CR completa até CR 30 (DMG oficial)
        const crXP = {
            "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
            "1": 200, "2": 450, "3": 700, "4": 1100,
            "5": 1800, "6": 2300, "7": 2900, "8": 3900,
            "9": 5000, "10": 5900, "11": 7200, "12": 8400,
            "13": 10000, "14": 11500, "15": 13000, "16": 15000,
            "17": 18000, "18": 20000, "19": 22000, "20": 25000,
            "21": 33000, "22": 41000, "23": 50000, "24": 62000,
            "25": 75000, "26": 90000, "27": 105000, "28": 120000,
            "29": 135000, "30": 155000,
            "BOSS": 50000
        };
        
        let total = 0;
        (monsters || []).forEach(m => {
            let crStr = String(m.cr || '1').trim();
            crStr = crStr.replace('Nível ', '');
            const xpVal = crXP[crStr] || 200;
            total += xpVal;
        });

        const input = this.$('#dm-xp-input');
        if (input) {
            input.value = total;
            Toast.show(`XP somado de monstros invocados: +${total} XP!`, 'info');
        } else {
            Toast.show(`Soma de XP calculada: ${total} XP`, 'info');
        }
    }

    distributeXP() {
        const input = this.$('#dm-xp-input');
        const xpVal = parseInt(input ? input.value : 0) || 0;
        const { players } = this.store.state;

        if (xpVal <= 0) {
            Toast.show('Por favor, defina um montante positivo de XP para distribuir.', 'warning');
            return;
        }

        if (!players || players.length === 0) {
            Toast.show('Nenhum jogador cadastrado na campanha para receber XP!', 'warning');
            return;
        }

        const share = Math.floor(xpVal / players.length);
        if (share <= 0) {
            Toast.show('O XP total é muito baixo para dividir entre os jogadores.', 'warning');
            return;
        }

        const levelsXP = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000];

        TOME.store.update(s => {
            s.players = (s.players || []).map(p => {
                const oldXP = parseInt(p.xp) || 0;
                const newXP = oldXP + share;
                
                let currentLevel = parseInt(p.level) || 1;
                let newLevel = currentLevel;
                
                for (let lvl = 2; lvl < levelsXP.length; lvl++) {
                    if (newXP >= levelsXP[lvl]) {
                        newLevel = lvl;
                    }
                }
                
                if (newLevel > currentLevel) {
                    setTimeout(() => {
                        Toast.show(`🎉 ${p.name} SUBIU DE NÍVEL! Agora é Nível ${newLevel}!`, 'success');
                    }, 100);
                }
                
                return {
                    ...p,
                    xp: newXP,
                    level: newLevel
                };
            });
        });

        Toast.show(`Experiência distribuída! +${share} XP para cada um dos ${players.length} heróis!`, 'success');
        if (input) input.value = 0;
        this.render();
    }

            // New helper: calculate XP based on master level and monster difficulty
        _xpBasedOnMasterLevel(masterLevel, monster) {
            const crXP = { "0": 10, "1/8": 25, "1/4": 50, "1/2": 100, "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900, "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000, "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000, "21": 33000, "BOSS": 50000 };
            const crStr = String(monster.cr || '1').trim().replace('Nível ', '');
            const baseXP = crXP[crStr] || 200;

            // Thresholds per player level (used for encounter difficulty)
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
                10: [600, 1200, 1900, 2800]
            };
            const lvl = Math.min(10, masterLevel || 1);
            const t = thresholds[lvl] || thresholds[1];
            // Determine difficulty bucket and apply multiplier
            let multiplier = 1;
            if (baseXP > t[3]) multiplier = 2.5; // Deadly or higher
            else if (baseXP > t[2]) multiplier = 2; // Hard
            else if (baseXP > t[1]) multiplier = 1.5; // Medium
            else multiplier = 1; // Easy

            return Math.round(baseXP * multiplier);
        }

        banishSummonedMonster(e, el) {
        const id = el.dataset.id;
        const name = el.dataset.name;

        if (!id) return;

        if (confirm(`Deseja mesmo banir e apagar permanentemente "${name}" da campanha? Isso removerá o monstro de todas as listas e do combate atual.`)) {
            TOME.store.update(s => {
                s.monsters = (s.monsters || []).filter(m => m.id !== id);
                s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id && c.name !== name);
            });
            Toast.show(`${name} foi banido e limpo com sucesso!`, 'success');
            this.render();
        }
    }

    _renderConcentration() {
        const { concentration } = this.store.state;
        if (!concentration?.length) return `
            <div style="font-size:0.7rem; color:var(--text-dim); text-align:center; padding:15px; border:1px dashed rgba(255,255,255,0.06); border-radius:10px;">
                Nenhum herói concentrando magias.
            </div>
        `;
        return concentration.map((c, i) => `
            <div style="
                background:rgba(255,255,255,0.02);
                border:1px solid rgba(255,255,255,0.06);
                border-radius:10px;
                padding:10px 15px;
                display:flex; justify-content:space-between; align-items:center;
                box-shadow:inset 0 0 10px rgba(0,0,0,0.2);
                transition:all 0.2s;
            " onmouseover="this.style.background='rgba(197,160,89,0.04)'; this.style.borderColor='rgba(197,160,89,0.3)';" 
               onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='rgba(255,255,255,0.06)';">
                <div>
                    <strong style="color:var(--accent); font-size:0.85rem;">${c.name}</strong>
                    <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">✨ Magia: <span style="color:#fff; font-weight:700;">${c.spell}</span></div>
                </div>
                <button class="btn btn-danger" style="padding:6px 10px; font-size:0.7rem; border-radius:6px; background:rgba(231,76,60,0.15); border-color:rgba(231,76,60,0.3);" data-action="removeConcentration" data-index="${i}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
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
