import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { MatchHistoryService } from '../../services/MatchHistoryService.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';
import { Modal } from './Modal.js';
import { renderQuickQuests } from './QuestLog.js';
import { renderQuickJournal } from './CampaignNotes.js';
import { renderQuickMonsters } from './NPCList.js';
/**
 * CAMPAIGN COMMAND CENTER v6.0 — "The Official Sheet"
 * Integrated D&D 5e Official Layout for PDF/Print Export.
 */
export class CampaignManager extends ReactiveComponent {
    constructor(opts = {}) {
        opts.storePath = 'campaign';
        super(opts);
        this._selectedHeroId = null;
        this._timerInterval = null;
        this._timerDisplay = '00:00:00';
        this._showLootModalId = null;
        this._selectedLootPlayers = [];
        this._lootGold = 0;
        this._lootItems = '';
    }

    template() {
        const { players } = this.store.state;
        const selected = players?.find(p => p.id === this._selectedHeroId);

        return html`
            <div class="page max-w-[1400px] mx-auto">
                <!-- HIDDEN PRINT TEMPLATES (SHEET & COMBAT CARD) -->
                ${selected ? this._renderPrintTemplate(selected) : ''}
                ${selected ? this._renderCardTemplate(selected) : ''}

                <div class="section-header flex justify-between items-center mb-6">
                    <div>
                        <h2 class="section-title m-0"><i class="fa-solid fa-users-rectangle text-tomeGold mr-3"></i> Gestão de Campanha</h2>
                        <p class="section-subtitle mt-1 text-slate-400">Sincronização Total com a Sessão Ativa</p>
                    </div>
                    <div class="flex gap-2.5">
                        <button class="btn btn-ghost text-xs" data-action="importCamp"><i class="fa-solid fa-file-import"></i> Importar</button>
                        <button class="btn btn-primary text-xs" data-action="exportCamp"><i class="fa-solid fa-download"></i> Exportar Dados</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start min-w-0">
                    <div class="flex flex-col gap-5">
                        <!-- ACTIVE SESSION SELECTOR -->
                        <div id="session-control-card" class="card glass-accent p-6 rounded-2xl flex flex-col gap-4 border border-tomeGold/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                            <div class="absolute -top-10 -right-10 w-32 h-32 bg-tomeGold/10 rounded-full blur-3xl pointer-events-none"></div>
                            <style>
                                @keyframes timerPulse { 0%,100%{text-shadow:0 0 8px rgba(197,160,89,0.5);} 50%{text-shadow:0 0 18px rgba(197,160,89,0.9), 0 0 30px rgba(197,160,89,0.4);} }
                                @keyframes statusBlink { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
                                .session-timer-display { animation: timerPulse 2s ease-in-out infinite; }
                                .timer-running-dot { animation: statusBlink 1.2s ease-in-out infinite; }
                                .session-opt-open::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:#22c55e; margin-right:6px; box-shadow:0 0 6px #22c55e; vertical-align:middle; }
                                .session-opt-closed::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:#64748b; margin-right:6px; vertical-align:middle; }
                                .session-status-badge { display:inline-flex; align-items:center; gap:5px; font-size:0.6rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; padding:3px 8px; border-radius:99px; font-family:'Cinzel', serif; }
                                .badge-open { background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.35); color:#22c55e; }
                                .badge-closed { background:rgba(100,116,139,0.12); border:1px solid rgba(100,116,139,0.3); color:#64748b; }
                                .badge-active { background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.5); color:#fbbf24; }
                                .timer-btn { border:none; border-radius:8px; font-family:'Cinzel', serif; font-size:0.65rem; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:8px 10px; cursor:pointer; transition:all 0.25s cubic-bezier(0.16,1,0.3,1); display:flex; align-items:center; justify-content:center; gap:6px; }
                                .timer-btn:hover { transform:translateY(-1px); }
                                .timer-btn-start { background:rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color:#4ade80; box-shadow:0 3px 12px rgba(34,197,94,0.1); }
                                .timer-btn-start:hover { background:rgba(34,197,94,0.25); box-shadow:0 5px 18px rgba(34,197,94,0.3); }
                                .timer-btn-pause { background:rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.4); color:#fbbf24; box-shadow:0 3px 12px rgba(251,191,36,0.1); }
                                .timer-btn-pause:hover { background:rgba(251,191,36,0.25); box-shadow:0 5px 18px rgba(251,191,36,0.3); }
                                .timer-btn-end { background:rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color:#f87171; box-shadow:0 3px 12px rgba(239,68,68,0.1); }
                                .timer-btn-end:hover { background:rgba(239,68,68,0.25); box-shadow:0 5px 18px rgba(239,68,68,0.3); }
                            </style>

                            <!-- HEADER -->
                            <div class="font-cinzel text-xs font-extrabold text-tomeGold uppercase tracking-wide border-b border-tomeGold/20 pb-2 flex items-center justify-between">
                                <div>
                                    <span><i class="fa-solid fa-folder-open mr-1.5"></i> Sessão do Jogo</span>
                                    <button class="btn btn-ghost btn-sm py-0.5 px-1.5 text-[0.6rem] ml-2 rounded" data-action="editCampaign"><i class="fa-solid fa-pen"></i> Editar</button>
                                </div>
                                ${this._getActiveSessionStatus()}
                            </div>

                            <!-- ACTIVE SESSION INFO -->
                            <div class="text-[0.65rem] text-slate-400">
                                Sessão Ativa: <b class="text-tomeGold">${TOME.persistence?.filename || 'state.json'}</b>
                            </div>

                            <!-- TIMER DISPLAY -->
                            <div class="glass p-4 rounded-xl flex flex-col gap-3">
                                <div class="flex justify-between items-center w-full">
                                    <div>
                                        <div class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-wide mb-1">Tempo de Sessão</div>
                                        <div id="session-timer-display" class="session-timer-display font-mono text-2xl font-black text-tomeGold tracking-wider leading-none">
                                            ${this._getTimerDisplay()}
                                        </div>
                                        ${this._isTimerRunning() ? html`<div class="text-[0.55rem] text-green-500 mt-1 flex items-center gap-1"><span class="timer-running-dot w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>Em andamento</div>` : ''}
                                    </div>
                                    <div style="min-width: 130px; max-width: 140px; display:flex; flex-direction:column; gap:6px;">
                                        ${this._renderTimerButtons()}
                                    </div>
                                </div>
                                <div class="w-full border-t border-white/5 pt-2">
                                    <label class="block text-[0.55rem] text-slate-500 font-bold uppercase mb-1">Limite de Duração</label>
                                    <select class="legacy-input w-full" id="timer-limit-select">
                                        <option value="0" ${!this._getSessionMeta(TOME.persistence?.filename || 'state.json').timerLimitMs ? 'selected' : ''}>Livre (Progressivo)</option>
                                        <option value="3600000" ${this._getSessionMeta(TOME.persistence?.filename || 'state.json').timerLimitMs === 3600000 ? 'selected' : ''}>1 Hora (Regressivo)</option>
                                        <option value="7200000" ${this._getSessionMeta(TOME.persistence?.filename || 'state.json').timerLimitMs === 7200000 ? 'selected' : ''}>2 Horas (Regressivo)</option>
                                        <option value="10800000" ${this._getSessionMeta(TOME.persistence?.filename || 'state.json').timerLimitMs === 10800000 ? 'selected' : ''}>3 Horas (Regressivo)</option>
                                        <option value="14400000" ${this._getSessionMeta(TOME.persistence?.filename || 'state.json').timerLimitMs === 14400000 ? 'selected' : ''}>4 Horas (Regressivo)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- DROPDOWN SELECTOR -->
                            <select class="legacy-input w-full mt-2" id="session-dropdown" data-action="changeSession">
                                ${this._getSessionsList().map(s => {
                                    const meta = this._getSessionMeta(s.file);
                                    const isOpen = meta.status === 'open';
                                    const isCurrent = TOME.persistence?.filename === s.file;
                                    const duration = meta.totalElapsed ? ` • ${this._formatElapsed(meta.totalElapsed)}` : '';
                                    return html`<option value="${s.file}" class="${isOpen ? 'session-opt-open' : 'session-opt-closed'}" ${isCurrent ? 'selected' : ''}>${
                                        isOpen ? '🟢' : '⚫'
                                    } ${s.name}${duration}</option>`;
                                })}
                            </select>

                            <!-- SESSION STATUS LIST -->
                            <div class="flex flex-col gap-1 max-h-32 overflow-y-auto pr-0.5">
                                ${this._getSessionsList().map(s => {
                                    const meta = this._getSessionMeta(s.file);
                                    const isCurrent = TOME.persistence?.filename === s.file;
                                    const isOpen = meta.status === 'open';
                                    const duration = meta.totalElapsed ? this._formatElapsed(meta.totalElapsed) : '--:--:--';
                                    return html`
                                        <div class="flex items-center justify-between py-2 px-3 rounded-lg text-[0.65rem] border transition-all ${isCurrent ? 'bg-tomeGold/10 border-tomeGold/40' : 'glass hover:bg-white/10 border-transparent'}">
                                            <div class="flex items-center gap-1.5 overflow-hidden">
                                                <span class="w-1.5 h-1.5 rounded-full shrink-0 ${isOpen ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-500'}"></span>
                                                <span class="whitespace-nowrap overflow-hidden text-ellipsis ${isCurrent ? 'text-tomeGold font-bold' : 'text-slate-400 font-medium'}">${s.name}</span>
                                            </div>
                                            <div class="flex items-center gap-1.5 shrink-0">
                                                <span class="font-mono text-slate-600 text-[0.6rem]">${duration}</span>
                                                <span class="session-status-badge ${isOpen ? 'badge-open' : 'badge-closed'}">${isOpen ? 'Aberta' : 'Finalizada'}</span>
                                            </div>
                                        </div>
                                    `;
                                })}
                            </div>

                            <!-- ACTIONS -->
                            <div class="grid grid-cols-2 gap-2 mt-1">
                                <button class="btn btn-ghost btn-sm rounded-lg text-[0.7rem] font-bold p-2" data-action="createNewSession">
                                    <i class="fa-solid fa-plus mr-1"></i> Nova Sessão
                                </button>
                                <button class="btn btn-ghost btn-sm rounded-lg text-[0.7rem] font-bold p-2" data-action="cloneSession">
                                    <i class="fa-solid fa-copy mr-1"></i> Clonar Sessão
                                </button>
                                <button class="btn btn-success btn-sm rounded-lg text-[0.7rem] font-bold p-2 col-span-2" data-action="startCampaignForm">
                                    <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Iniciar Nova Campanha
                                </button>
                                <button class="btn btn-danger btn-sm rounded-lg text-[0.7rem] font-bold p-2 col-span-2" data-action="resetCampaignState">
                                    <i class="fa-solid fa-power-off mr-1"></i> Zerar Estado da Campanha
                                </button>
                            </div>
                        </div>

                        <!-- HERO SELECTOR -->
                        <div class="card glass p-0 overflow-hidden rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" id="management-sidebar">
                            <div class="card-header bg-gradient-to-r from-tomeGold/20 to-transparent p-4 m-0 border-b border-tomeGold/30 backdrop-blur-md">
                                <span class="card-title text-xs font-cinzel font-bold tracking-[2px] text-tomeGold drop-shadow-md flex items-center gap-2"><i class="fa-solid fa-users"></i> Heróis do Grupo</span>
                            </div>
                            <div class="flex flex-col bg-black/40">
                                ${players?.map(p => this._renderHeroItem(p)).join('') || html`<p class="p-5 text-[0.7rem] opacity-50 text-center">Crie heróis na aba de criação.</p>`}
                            </div>
                        </div>
                    </div>

                    <!-- COMMAND PANEL & DYNAMIC INTEGRATED SECTIONS (Prime Dashboard) -->
                    <div class="flex flex-col gap-5 min-w-0">

                        <!-- PRIME CAMPAIGN INFO BANNER -->
                        ${this._renderCampaignBanner()}
                        
                        <!-- COMMAND PANEL -->
                        <div id="command-ui">
                            ${selected ? this._renderCommandPanel(selected) : html`
                                <div class="card glass-accent min-h-[200px] rounded-2xl flex flex-col items-center justify-center gap-3 border border-dashed border-tomeGold/30">
                                    <i class="fa-solid fa-user-plus text-[2.5rem] text-tomeGold/20"></i>
                                    <p class="text-xs text-slate-400 font-cinzel uppercase tracking-wide">Selecione um herói ao lado para gerenciar</p>
                                </div>
                            `}
                        </div>

                        <!-- DYNAMIC INTEGRATED SECTIONS (Modular Visibility) -->
                        <div class="grid grid-cols-2 gap-5">
                            
                            <!-- QUEST COMMAND -->
                            <div class="card glass p-0 rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                                <h3 class="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                                    <span><i class="fa-solid fa-list-check mr-2"></i> Quadro de Missões</span>
                                    <button class="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded" data-action="quickAddQuest"><i class="fa-solid fa-plus"></i> Adicionar</button>
                                </h3>
                                <div class="flex flex-col gap-2 max-h-[180px] overflow-y-auto p-4 bg-black/40">
                                    ${renderQuickQuests(this)}
                                </div>
                            </div>
                            
                            <!-- NARRATIVE / DIARY -->
                            <div class="card glass p-0 rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                                <h3 class="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                                    <span><i class="fa-solid fa-book-journal-whills mr-2"></i> Diário Narrativo</span>
                                    <button class="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded" data-action="quickOracleInspire"><i class="fa-solid fa-wand-magic-sparkles"></i> Oráculo</button>
                                </h3>
                                <div class="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto p-4 bg-black/40">
                                    ${renderQuickJournal(this)}
                                </div>
                            </div>

                            <!-- COMBAT & BESTIARY PREVIEW -->
                            <div class="card glass p-0 rounded-2xl col-span-2 border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                                <h3 class="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                                    <span><i class="fa-solid fa-dragon mr-2"></i> Bestiário & Combates Ativos</span>
                                    <span class="text-[0.6rem] text-slate-300 font-mono tracking-wider bg-black/50 px-2 py-1 rounded-md border border-tomeGold/20">${(this.store.state.monsters||[]).length} criatura(s)</span>
                                </h3>
                                <div class="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto p-4 bg-black/40">
                                    ${renderQuickMonsters(this)}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <!-- Loot Distribution Modal -->
                ${this._showLootModalId ? this._renderLootModal() : ''}
            </div>
        `;
    }

    _renderPrintTemplate(p) {
        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const getMod = (v) => Math.floor((v - 10) / 2);
        
        return html`
            <div class="dnd-print-template">
                <div class="dnd-header">
                    <div style="flex:1;">
                        <h1 style="margin:0; font-size:24px;">${p.name}</h1>
                        <span style="font-size:10px; text-transform:uppercase;">Nome do Personagem</span>
                    </div>
                    <div style="flex:2; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; font-size:10px;">
                        <div><strong>Classe/Nível:</strong> ${p.class} ${p.level}</div>
                        <div><strong>Raça:</strong> ${p.race}</div>
                        <div><strong>XP:</strong> ${p.xp || 0}</div>
                    </div>
                </div>

                <div class="dnd-main-stats">
                    <div class="dnd-box"><div class="val">${10 + getMod(stats.dex)}</div><div class="label">CA</div></div>
                    <div class="dnd-box"><div class="val">+${getMod(stats.dex)}</div><div class="label">Iniciativa</div></div>
                    <div class="dnd-box"><div class="val">${p.speed || 30}ft</div><div class="label">Deslocamento</div></div>
                    <div class="dnd-box" style="flex:2;"><div class="val">${p.hp?.current} / ${p.hp?.max}</div><div class="label">Pontos de Vida Atuais</div></div>
                </div>

                <div class="dnd-grid">
                    <div class="dnd-stats-column">
                        ${Object.entries(stats).map(([s, v]) => html`
                            <div class="stat-box">
                                <div class="stat-label">${s}</div>
                                <div class="stat-mod">${getMod(v) >= 0 ? '+' : ''}${getMod(v)}</div>
                                <div class="stat-val">${v}</div>
                            </div>
                        `)}
                    </div>
                    
                    <div class="skill-list card" style="padding:15px; border:2px solid #000;">
                        <div style="font-weight:800; border-bottom:1px solid #000; margin-bottom:10px;">PERÍCIAS & TESTES</div>
                        <div class="skill-item">○ Acrobacia (Des)</div>
                        <div class="skill-item">○ Adestrar Animais (Sab)</div>
                        <div class="skill-item">○ Arcanismo (Int)</div>
                        <div class="skill-item">○ Atletismo (For)</div>
                        <div class="skill-item">○ Atuação (Car)</div>
                        <div class="skill-item">○ Enganação (Car)</div>
                        <div class="skill-item">○ Furtividade (Des)</div>
                        <div class="skill-item">○ História (Int)</div>
                        <div class="skill-item">○ Intimidação (Car)</div>
                        <div class="skill-item">○ Intuição (Sab)</div>
                        <div class="skill-item">○ Investigação (Int)</div>
                        <div class="skill-item">○ Medicina (Sab)</div>
                        <div class="skill-item">○ Natureza (Int)</div>
                        <div class="skill-item">○ Percepção (Sab)</div>
                        <div class="skill-item">○ Persuasão (Car)</div>
                        <div class="skill-item">○ Prestidigitação (Des)</div>
                        <div class="skill-item">○ Religião (Int)</div>
                        <div class="skill-item">○ Sobrevivência (Sab)</div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <div class="card" style="border:2px solid #000; padding:10px; flex:1;">
                            <div class="stat-label">Equipamento & Itens</div>
                            <div style="font-size:9px; margin-top:5px; white-space:pre-wrap;">${Array.isArray(p.equipment?.items) ? p.equipment.items.map(i => `${i.qty}x ${i.name}`).join('\n') : p.equipment?.items || ''}</div>
                        </div>
                        <div class="card" style="border:2px solid #000; padding:10px; flex:1;">
                            <div class="stat-label">Características & Traços</div>
                            <div style="font-size:9px; margin-top:5px; white-space:pre-wrap;">${p.roleplay?.traits || ''}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:20px; font-size:8px; text-align:center; opacity:0.5;">
                    Gerado pela Mesa do Mestre — Ficha Oficial de Referência 5e
                </div>
            </div>
        `;
    }

    _renderHeroItem(p) {
        const isActive = p.id === this._selectedHeroId;
        return html`
            <div class="init-row ${isActive ? 'active' : ''}" style="padding:15px; cursor:pointer;" data-action="selectHero" data-id="${p.id}">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="token-avatar" style="width:35px; height:35px; border-color:${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}; ${p.img ? `background:url(${p.img}) center/cover;` : ''}">${p.img ? '' : p.name.substring(0,2)}</div>
                    <div>
                        <div style="font-weight:700; font-size:0.85rem; color:${isActive ? 'var(--accent)' : 'var(--text)'}">${p.name}</div>
                        <div style="font-size:0.6rem; color:var(--text-dim);">Nv ${p.level} • ${p.hp?.current}/${p.hp?.max} HP</div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderCommandPanel(p) {
        const hpPct = (p.hp?.current / p.hp?.max) * 100;
        
        // D&D 5e XP levels threshold mapping
        const levelsXP = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
        const lvl = parseInt(p.level) || 1;
        const currentXP = parseInt(p.xp) || 0;
        const nextXP = levelsXP[lvl + 1] || levelsXP[20] || 300;
        const prevXP = levelsXP[lvl] || 0;
        const xpDiff = nextXP - prevXP;
        const progress = xpDiff > 0 ? Math.min(100, Math.max(0, ((currentXP - prevXP) / xpDiff) * 100)) : 100;

        // Parse items to display without [object Object] bug
        let itemsVal = '';
        if (p.equipment?.items) {
            if (Array.isArray(p.equipment.items)) {
                itemsVal = p.equipment.items.map(i => `${i.qty}x ${i.name}`).join('\n');
            } else {
                itemsVal = String(p.equipment.items);
            }
        }

        const attrNames = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };

        return html`
            <div class="flex flex-col gap-6 animate-fade-in font-sans">
                
                <!-- TOP CARD HEADER WITH XP PROGRESS TRACKER -->
                <div class="card glass-accent p-8">
                    <div class="flex gap-6 items-center flex-wrap">
                        <div class="token-avatar w-[90px] h-[90px] border-[3px] border-tomeGold font-cinzel text-3xl shadow-[0_0_15px_rgba(197,160,89,0.3)] bg-black/80 flex items-center justify-center">${p.name.substring(0,2)}</div>
                        <div class="flex-1 min-w-[250px]">
                            <h1 class="m-0 text-4xl font-cinzel text-tomeGold drop-shadow-md tracking-wide">${p.name}</h1>
                            <p class="text-slate-300 text-[0.95rem] mt-1.5 font-semibold uppercase tracking-wide"><i class="fa-solid fa-wand-magic-sparkles text-tomeGold"></i> ${p.race} ${p.class} • Nível ${lvl}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-[0.65rem] text-tomeGold font-extrabold tracking-[1.5px] uppercase">Experiência Acumulada</div>
                            <div class="text-3xl font-black text-white font-cinzel drop-shadow-sm">${currentXP} <span class="text-base text-tomeGold">XP</span></div>
                        </div>
                    </div>

                    <!-- PROGRESS BAR -->
                    <div class="mt-6 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                        <div class="flex justify-between text-xs text-slate-300 mb-2 font-bold">
                            <span class="text-tomeGold">Nível ${lvl}</span>
                            <span class="text-white">${currentXP} / ${nextXP} XP (${Math.round(progress)}%)</span>
                            <span class="opacity-60">Nível ${lvl + 1}</span>
                        </div>
                        <div class="h-2.5 bg-black/80 rounded border border-tomeGold/25 overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-tomeGold to-yellow-400 shadow-[0_0_10px_rgba(197,160,89,0.5)] transition-all duration-500 ease-out" style="width:${progress}%;"></div>
                        </div>
                    </div>
                </div>

                <!-- QUICK ACTIONS SECTION -->
                <div class="grid grid-cols-3 gap-6">
                    
                    <!-- HP CARD -->
                    <div class="card glass rounded-2xl p-5 flex flex-col justify-between">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs text-slate-400 font-extrabold uppercase"><i class="fa-solid fa-heart text-dndRedBright mr-1.5"></i> Vida do Herói</span>
                            <span class="text-sm font-extrabold text-white">${p.hp?.current} / ${p.hp?.max} HP</span>
                        </div>
                        <div class="hp-bar h-2.5 mb-5 bg-black/40 rounded border border-white/5 overflow-hidden">
                            <div class="hp-bar-fill ${hpPct < 30 ? 'bg-dndRedBright' : 'bg-green-500'} h-full transition-all duration-300" style="width:${hpPct}%;"></div>
                        </div>
                        <div class="grid grid-cols-4 gap-1.5">
                            <button class="btn btn-danger btn-sm rounded-md font-bold" data-action="adjustHP" data-val="-5">-5</button>
                            <button class="btn btn-ghost btn-sm rounded-md text-dndRedBright border-dndRedBright/15 font-bold" data-action="adjustHP" data-val="-1">-1</button>
                            <button class="btn btn-ghost btn-sm rounded-md text-green-500 border-green-500/15 font-bold" data-action="adjustHP" data-val="1">+1</button>
                            <button class="btn btn-primary btn-sm bg-green-500 border-green-500 font-bold rounded-md" data-action="adjustHP" data-val="5">+5</button>
                        </div>
                    </div>

                    <!-- XP MANAGEMENT CARD -->
                    <div class="card glass rounded-2xl p-5 flex flex-col justify-between">
                        <span class="text-xs font-extrabold text-blue-500 uppercase"><i class="fa-solid fa-star mr-1.5"></i> Canalizar Experiência</span>
                        <div class="grid grid-cols-2 gap-2 my-4">
                            <button class="btn btn-ghost btn-sm rounded-md font-bold font-cinzel" data-action="adjustXP" data-val="100">+100 XP</button>
                            <button class="btn btn-ghost btn-sm rounded-md font-bold font-cinzel" data-action="adjustXP" data-val="500">+500 XP</button>
                        </div>
                        <button class="btn btn-info btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm" data-action="customXP">
                            <i class="fa-solid fa-circle-plus mr-1.5"></i> Adicionar XP Customizado
                        </button>
                    </div>

                    <!-- PDF TOOLS CARD -->
                    <div class="card glass rounded-2xl p-5 flex flex-col justify-between gap-2.5">
                        <span class="text-xs font-extrabold text-tomeGold uppercase"><i class="fa-solid fa-print mr-1.5"></i> Ferramentas Físicas</span>
                        <button class="btn btn-primary btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm bg-tomeGold border-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.25)] text-black" data-action="printSheet">
                            <i class="fa-solid fa-file-pdf mr-1.5"></i> Imprimir Ficha Oficial 5e
                        </button>
                        <button class="btn btn-ghost btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm" data-action="printCard">
                            <i class="fa-solid fa-id-card mr-1.5"></i> Imprimir Card Rápido
                        </button>
                    </div>
                </div>

                <!-- INTERACTIVE ATTRIBUTE GRID WITH CLICK-TO-ROLL -->
                <div class="card glass p-6 rounded-2xl border-transparent">
                    <div class="text-sm text-tomeGold font-extrabold uppercase mb-4.5 font-cinzel tracking-wide"><i class="fa-solid fa-dice-d20"></i> Atributos do Personagem (Clique para Rolar d20)</div>
                    <div class="grid grid-cols-6 gap-4">
                        ${Object.entries(p.stats || {str:10,dex:10,con:10,int:10,wis:10,cha:10}).map(([s,v]) => {
                            const mod = Math.floor((v-10)/2);
                            return html`
                                <div class="glass hover:scale-105 hover:border-tomeGold hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] text-center p-4 rounded-xl border border-transparent cursor-pointer transition-all duration-300 ease-out group"
                                     data-action="rollAttribute" data-attr="${s}" data-val="${v}">
                                    <div class="text-[0.7rem] text-tomeGold font-black tracking-wide uppercase mb-1.5 font-cinzel">${attrNames[s] || s}</div>
                                    <div class="text-3xl font-black text-white leading-none font-cinzel">${v}</div>
                                    <div class="text-xs ${mod >= 0 ? 'text-green-500' : 'text-dndRedBright'} font-extrabold mt-2 bg-black/30 py-1 px-2 rounded-full inline-block">
                                        MOD ${mod >= 0 ? '+' : ''}${mod}
                                    </div>
                                </div>
                            `;
                        })}
                    </div>
                </div>

                <!-- INVENTORY & NARRATIVE PARCHMENT TEXTAREAS -->
                <div class="grid grid-cols-2 gap-6">
                    
                    <!-- ITEMS INVENTORY -->
                    <div class="card glass rounded-2xl p-6 flex flex-col gap-3 border-transparent">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-tomeGold font-extrabold uppercase font-cinzel tracking-wide"><i class="fa-solid fa-backpack mr-1.5"></i> 🎒 Inventário de Itens</span>
                            <span id="items-save-status" class="text-[0.65rem] text-green-500 font-extrabold opacity-0 transition-opacity duration-300"><i class="fa-solid fa-circle-check"></i> Auto-salvo</span>
                        </div>
                        <p class="text-[0.65rem] text-slate-400 m-0">Digite os itens um por linha. Ex: <b class="text-tomeGold">2x Poção de Cura</b> ou <b class="text-tomeGold">Escudo de Aço</b>.</p>
                        <textarea class="form-textarea w-full font-mono text-sm leading-relaxed p-4 bg-black/40 border border-white/10 rounded-xl text-white" rows="6" 
                                  placeholder="Digite um item por linha..." 
                                  data-action="updateItems"
                                  oninput="const status = document.getElementById('items-save-status'); if(status){ status.style.opacity=1; setTimeout(()=>status.style.opacity=0, 1000); }">${itemsVal}</textarea>
                    </div>

                    <!-- NARRATIVE NOTES -->
                    <div class="card glass bg-black/50 rounded-2xl border border-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-tomeGold font-extrabold uppercase font-cinzel tracking-wide"><i class="fa-solid fa-pen-nib mr-1.5"></i> 📝 Características & Diário</span>
                            <span id="notes-save-status" class="text-[0.65rem] text-green-500 font-extrabold opacity-0 transition-opacity duration-300"><i class="fa-solid fa-circle-check"></i> Auto-salvo</span>
                        </div>
                        <p class="text-[0.65rem] text-slate-400 m-0">Registre traços de personalidade, antecedente, e notas de interpretação do herói.</p>
                        <textarea class="form-textarea w-full font-sans text-sm leading-relaxed p-4 bg-black/40 border border-white/10 rounded-xl text-white" rows="6" 
                                  placeholder="Escreva traços ou anotações..." 
                                  data-action="updateNotes"
                                  oninput="const status = document.getElementById('notes-save-status'); if(status){ status.style.opacity=1; setTimeout(()=>status.style.opacity=0, 1000); }">${p.roleplay?.traits || ''}</textarea>
                    </div>

                </div>

            </div>
        `;
    }

    selectHero(e, el) { this._selectedHeroId = el.dataset.id; this.render(); }

    printSheet() {
        document.body.classList.add('print-sheet-mode');
        window.print();
        setTimeout(() => document.body.classList.remove('print-sheet-mode'), 500);
    }

    printCard() {
        document.body.classList.add('print-card-mode');
        window.print();
        setTimeout(() => document.body.classList.remove('print-card-mode'), 500);
    }

    _renderCardTemplate(p) {
        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const getMod = (v) => Math.floor((v - 10) / 2);
        
        return html`
            <div class="dnd-card-template box-border w-[450px] bg-white border-[3px] border-double border-black rounded-xl p-5 text-black font-sans my-5 mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
                <div class="flex justify-between items-center border-b-[2.5px] border-black pb-2 mb-3">
                    <div>
                        <h2 class="m-0 text-xl font-cinzel font-black tracking-wide text-black">${p.name}</h2>
                        <span class="text-[9.5px] text-[#444] font-bold uppercase tracking-wide">${p.race} • ${p.class} Nível ${p.level}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[13px] font-black border-2 border-black py-1 px-2 rounded-md bg-[#f0f0f0]">CA ${p.ac}</span>
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2 mb-3.5 text-center">
                    <div class="border-[1.5px] border-black py-1.5 px-1 rounded-md">
                        <div class="text-[8px] uppercase font-extrabold text-[#555]">Iniciativa</div>
                        <div class="text-[15px] font-black text-black">${getMod(stats.dex) >= 0 ? '+' : ''}${getMod(stats.dex)}</div>
                    </div>
                    <div class="border-[1.5px] border-black py-1.5 px-1 rounded-md">
                        <div class="text-[8px] uppercase font-extrabold text-[#555]">Desloc.</div>
                        <div class="text-[15px] font-black text-black">9m</div>
                    </div>
                    <div class="border-[1.5px] border-black py-1.5 px-1 rounded-md col-span-2 bg-[#f5f5f5]">
                        <div class="text-[8px] uppercase font-extrabold text-[#555]">Pontos de Vida</div>
                        <div class="text-[15px] font-black text-black">${p.hp?.current} / ${p.hp?.max} HP</div>
                    </div>
                </div>

                <div class="grid grid-cols-6 gap-1.5 mb-3.5 text-center">
                    ${Object.entries(stats).map(([s, v]) => html`
                        <div class="border-[1.5px] border-black py-1 px-0.5 rounded-md bg-[#fffcf5]">
                            <div class="text-[8px] uppercase font-black text-[#555]">${s.toUpperCase()}</div>
                            <div class="text-[14px] font-black text-black my-0.5">${v}</div>
                            <div class="text-[8.5px] text-[#444] font-bold bg-black/5 py-[1px] rounded-sm">${getMod(v) >= 0 ? '+' : ''}${getMod(v)}</div>
                        </div>
                    `)}
                </div>

                <div class="grid grid-cols-2 gap-3 text-[10px]">
                    <div class="border-[1.5px] border-black p-2.5 rounded-lg bg-[#fffcfc]">
                        <strong class="block border-b-[1.5px] border-black pb-1 mb-1.5 text-[9.5px] uppercase font-cinzel text-black">🎒 Inventário</strong>
                        <div class="whitespace-pre-wrap text-[8.5px] leading-relaxed text-[#222]">${Array.isArray(p.equipment?.items) ? p.equipment.items.map(i => `${i.qty}x ${i.name}`).join('\n') : p.equipment?.items || 'Nenhum item.'}</div>
                    </div>
                    <div class="border-[1.5px] border-black p-2.5 rounded-lg bg-[#fffcfc]">
                        <strong class="block border-b-[1.5px] border-black pb-1 mb-1.5 text-[9.5px] uppercase font-cinzel text-black">📝 Diário & Notas</strong>
                        <div class="whitespace-pre-wrap text-[8.5px] leading-relaxed text-[#222]">${p.roleplay?.traits || 'Nenhuma nota.'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    _getSessionListKey() {
        const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || '';
        return activeTable ? `TOME_SESSION_LIST_${activeTable}` : 'TOME_SESSION_LIST';
    }

    _getSessionMetaKey(file) {
        const tableKey = localStorage.getItem('DM_ACTIVE_TABLE') || 'default';
        return html`TOME_SESSION_META_${tableKey}_${file}`;
    }

    _getSessionMeta(file) {
        try {
            return JSON.parse(localStorage.getItem(this._getSessionMetaKey(file)) || '{}');
        } catch (_) { return {}; }
    }

    _saveSessionMeta(file, data) {
        const existing = this._getSessionMeta(file);
        localStorage.setItem(this._getSessionMetaKey(file), JSON.stringify({ ...existing, ...data }));
    }

    _getSessionsList() {
        let list = [];
        try {
            list = JSON.parse(localStorage.getItem(this._getSessionListKey()) || '[]');
        } catch (_) {}
        if (!list.some(s => s.file === 'state.json')) {
            list.unshift({ name: 'Sessão Padrão', file: 'state.json' });
            localStorage.setItem(this._getSessionListKey(), JSON.stringify(list));
        }
        return list;
    }

    _isTimerRunning() {
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        return meta.status === 'open' && !!meta.timerStart && !meta.timerPaused;
    }

    _getTimerDisplay() {
        if (this._timerInterval) return this._timerDisplay;
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        if (!meta.totalElapsed && !meta.timerStart) return '00:00:00';
        let total = meta.totalElapsed || 0;
        if (meta.timerStart && !meta.timerPaused) {
            total += Date.now() - meta.timerStart;
        }
        return this._formatElapsed(total);
    }

    _formatElapsed(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    _getActiveSessionStatus() {
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        if (meta.status === 'open' && !meta.timerPaused && meta.timerStart) {
            return html`<span class="session-status-badge badge-active"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> Em Andamento</span>`;
        } else if (meta.status === 'open') {
            return html`<span class="session-status-badge badge-open"><i class="fa-solid fa-door-open" style="font-size:0.55rem;"></i> Aberta</span>`;
        } else if (meta.status === 'closed') {
            return html`<span class="session-status-badge badge-closed"><i class="fa-solid fa-check" style="font-size:0.55rem;"></i> Finalizada</span>`;
        }
        return html`<span class="session-status-badge badge-closed">Não Iniciada</span>`;
    }

    _renderTimerButtons() {
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        const isRunning = meta.status === 'open' && !!meta.timerStart && !meta.timerPaused;
        const isPaused = meta.status === 'open' && meta.timerPaused;
        const isClosed = meta.status === 'closed';

        let startPauseBtn = '';
        if (isClosed) {
            startPauseBtn = html`<button class="timer-btn timer-btn-start" data-action="startSessionTimer" style="width:100%;">
                <i class="fa-solid fa-rotate-left"></i> Reabrir
            </button>`;
        } else if (isRunning) {
            startPauseBtn = html`<button class="timer-btn timer-btn-pause" data-action="pauseSessionTimer" style="width:100%;">
                <i class="fa-solid fa-pause"></i> Pausar
            </button>`;
        } else if (isPaused) {
            startPauseBtn = html`<button class="timer-btn timer-btn-start" data-action="startSessionTimer" style="width:100%;">
                <i class="fa-solid fa-play"></i> Continuar
            </button>`;
        } else {
            startPauseBtn = html`<button class="timer-btn timer-btn-start" data-action="startSessionTimer" style="width:100%;">
                <i class="fa-solid fa-play"></i> Iniciar
            </button>`;
        }

        const zerarBtn = html`<button class="timer-btn timer-btn-end" style="width:100%; margin-top: 4px;" data-action="resetSessionTimer" title="Zerar o cronômetro e gerar relatório de consistência">
            <i class="fa-solid fa-flag-checkered"></i> Zerar
        </button>`;

        return startPauseBtn + zerarBtn;
    }

    _startTickInterval() {
        if (this._timerInterval) return;
        this._timerInterval = setInterval(() => {
            const file = TOME.persistence?.filename || 'state.json';
            const meta = this._getSessionMeta(file);
            if (!meta.timerStart || meta.timerPaused) {
                this._stopTickInterval();
                return;
            }
            const total = (meta.totalElapsed || 0) + (Date.now() - meta.timerStart);
            const limit = meta.timerLimitMs || 0;
            
            let display = total;
            if (limit > 0) {
                const remaining = limit - total;
                if (remaining <= 0) {
                    this._timerDisplay = '00:00:00';
                    const el = document.getElementById('session-timer-display');
                    if (el) el.textContent = this._timerDisplay;
                    this.autoEndAndReport();
                    return;
                }
                display = remaining;
            } else {
                display = total;
            }
            
            this._timerDisplay = this._formatElapsed(display);
            const el = document.getElementById('session-timer-display');
            if (el) el.textContent = this._timerDisplay;
        }, 1000);
    }

    _stopTickInterval() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    }

    startSessionTimer() {
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        if (meta.status === 'closed') {
            // Reopen
            this._saveSessionMeta(file, { status: 'open', timerStart: Date.now(), timerPaused: false });
            Toast.show('Sessão reaberta e cronômetro reiniciado!', 'success');
        } else if (meta.timerPaused) {
            this._saveSessionMeta(file, { timerStart: Date.now(), timerPaused: false });
            Toast.show('Cronômetro retomado!', 'success');
        } else {
            this._saveSessionMeta(file, { status: 'open', timerStart: Date.now(), timerPaused: false, totalElapsed: meta.totalElapsed || 0 });
            Toast.show('Sessão iniciada! Cronômetro rodando.', 'success');
        }
        this._startTickInterval();
        this.render();
    }

    pauseSessionTimer() {
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        if (!meta.timerStart) return;
        const elapsed = (meta.totalElapsed || 0) + (Date.now() - meta.timerStart);
        this._saveSessionMeta(file, { totalElapsed: elapsed, timerPaused: true, timerStart: null });
        this._timerDisplay = this._formatElapsed(elapsed);
        this._stopTickInterval();
        Toast.show(`Cronômetro pausado em ${this._timerDisplay}`, 'warning');
        this.render();
    }

    endSessionTimer() {
        if (!confirm('Deseja encerrar e finalizar esta sessão?\nO tempo total será salvo e a sessão ficará marcada como Finalizada.')) return;
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        let total = meta.totalElapsed || 0;
        if (meta.timerStart && !meta.timerPaused) {
            total += Date.now() - meta.timerStart;
        }
        const endedAt = new Date().toLocaleString('pt-BR');
        this._saveSessionMeta(file, { status: 'closed', totalElapsed: total, timerStart: null, timerPaused: false, endedAt });
        this._timerDisplay = this._formatElapsed(total);
        this._stopTickInterval();
        TOME.store.update(s => {
            s.journalEntries = s.journalEntries || [];
            s.journalEntries.push({ type: 'info', title: 'Sessão Encerrada', content: `Duração total: ${this._formatElapsed(total)} — Encerrada em ${endedAt}`, timestamp: Date.now() });
        });
        Toast.show(`Sessão encerrada! Duração: ${this._formatElapsed(total)}`, 'success');
        this.render();
    }

    async resetSessionTimer() {
        if (!confirm('Tem certeza que deseja ZERAR o cronômetro da sessão atual? Isso também executará uma análise completa do sistema e gerará o relatório.')) return;
        
        this._stopTickInterval();
        const file = TOME.persistence?.filename || 'state.json';
        this._saveSessionMeta(file, { totalElapsed: 0, timerStart: null, timerPaused: false });
        this._timerDisplay = '00:00:00';
        this.render();
        
        await this.runSystemAnalysisAndReport("Zerar Cronômetro (Reset Manual)");
    }

    autoEndAndReport() {
        this._stopTickInterval();
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        
        let total = meta.totalElapsed || 0;
        if (meta.timerStart && !meta.timerPaused) {
            total += Date.now() - meta.timerStart;
        }
        
        const endedAt = new Date().toLocaleString('pt-BR');
        this._saveSessionMeta(file, { status: 'closed', totalElapsed: total, timerStart: null, timerPaused: false, endedAt });
        this._timerDisplay = '00:00:00';
        
        TOME.store.update(s => {
            s.journalEntries = s.journalEntries || [];
            s.journalEntries.push({ 
                type: 'info', 
                title: 'Sessão Encerrada por Limite', 
                content: `A sessão atingiu o limite configurado de ${this._formatElapsed(meta.timerLimitMs)} e foi encerrada automaticamente.`, 
                timestamp: Date.now() 
            });
        });
        
        this.render();
        this.runSystemAnalysisAndReport("Limite de Tempo Atingido (00:00:00)");
    }

    async runSystemAnalysisAndReport(triggerReason) {
        Toast.show('Executando análise de consistência do sistema...', 'info');
        
        const state = TOME.store.snapshot();
        const players = state.players || [];
        const monsters = state.monsters || [];
        const journal = state.journalEntries || [];
        const quests = state.quests || [];
        
        // Diagnostic calculations
        const faintedPlayers = players.filter(p => p.hp?.current === 0).map(p => p.name);
        const aliveMonsters = monsters.filter(m => m.hp?.current > 0).map(m => m.name);
        const resolvedQuests = quests.filter(q => q.completed || q.status === 'completed').length;
        const pendingQuests = quests.filter(q => !q.completed && !q.failed && (q.status === 'pending' || q.status === 'active' || !q.status)).length;
        const totalXp = state.xpDistributed || 0;
        
        // Run consistency scoring
        let healthScore = 100;
        const diagnostics = [];
        
        if (faintedPlayers.length > 0) {
            healthScore -= faintedPlayers.length * 15;
            diagnostics.push(`⚠️ Alerta: ${faintedPlayers.length} herói(s) inconsciente(s)/caído(s): ${faintedPlayers.join(', ')}.`);
        }
        if (aliveMonsters.length > 0 && state.combatActive) {
            healthScore -= 10;
            diagnostics.push(`⚠️ Combate: ${aliveMonsters.length} criatura(s) hostil(is) ainda ativa(s) na arena.`);
        }
        if (pendingQuests > 5) {
            healthScore -= 5;
            diagnostics.push(`ℹ️ Quests: Há muitas missões pendentes (${pendingQuests}). Recomenda-se focar na resolução.`);
        }
        if (journal.length === 0) {
            healthScore -= 10;
            diagnostics.push(`⚠️ Diário: Nenhum evento ou marco narrativo registrado na linha do tempo.`);
        }
        
        healthScore = Math.max(0, healthScore);
        
        let scoreColor = '#2ecc71';
        let scoreRating = 'Excelente';
        if (healthScore < 50) {
            scoreColor = '#e74c3c';
            scoreRating = 'Crítico';
        } else if (healthScore < 80) {
            scoreColor = '#f1c40f';
            scoreRating = 'Estável / Atenção';
        }

        const reportHtml = html`
            <div style="font-family:'Outfit', sans-serif; text-align:left; color:#fff;">
                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(197,160,89,0.25); border-radius:12px; padding:18px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                    <div>
                        <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Gatilho do Relatório</div>
                        <strong style="color:var(--accent); font-size:1rem;">${triggerReason}</strong>
                        <div style="font-size:0.7rem; color:#64748b; margin-top:4px;">Data: ${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.8rem; font-weight:900; color:${scoreColor}; font-family:'Cinzel';">${healthScore}%</div>
                        <div style="font-size:0.65rem; color:${scoreColor}; font-weight:800; text-transform:uppercase;">Status: ${scoreRating}</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                        <span style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Estatísticas de Combate</span>
                        <div style="font-size:0.85rem; color:#fff; font-weight:600; margin-top:4px;">Heróis Vivos: ${players.length - faintedPlayers.length} / ${players.length}</div>
                        <div style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">Inimigos Derrotados: ${monsters.length - aliveMonsters.length} / ${monsters.length}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                        <span style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Riquezas & Progresso</span>
                        <div style="font-size:0.85rem; color:#fff; font-weight:600; margin-top:4px;">Total XP Distribuído: ${totalXp} XP</div>
                        <div style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">Missões Concluídas: ${resolvedQuests} / ${quests.length}</div>
                    </div>
                </div>

                <h4 style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px; margin:0 0 10px 0;">
                    <i class="fa-solid fa-list-check"></i> Diagnósticos e Recomendações
                </h4>
                <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px; max-height:180px; overflow-y:auto;">
                    ${diagnostics.map(d => html`<div style="font-size:0.8rem; line-height:1.4; color:#e2e8f0;">${d}</div>`).join('') || '<div style="font-size:0.8rem; color:#64748b; font-style:italic;">Nenhuma inconformidade encontrada no sistema. Integridade perfeita!</div>'}
                </div>
            </div>
        `;
        
        Modal.show({
            title: 'Relatório de Consistência e Desempenho',
            content: reportHtml,
            type: healthScore < 50 ? 'danger' : (healthScore < 80 ? 'confirm' : 'info')
        });
    }

    startCampaignForm() {
        const existing = document.getElementById('campaign-form-modal');
        if (existing) existing.remove();

        const dmName = localStorage.getItem('DM_MASTER_NAME') || '';
        
        const modal = document.createElement('div');
        modal.id = 'campaign-form-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = html`
            <div class="card glass-accent" style="width:90%; max-width:480px; padding:30px; border-radius:18px; border:2px solid var(--accent); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0 0 8px 0; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:10px;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:8px;"></i> Iniciar Nova Campanha
                </h3>
                <p style="font-size:0.75rem; color:var(--text-dim); margin-bottom:20px;">Insira os dados iniciais do novo reino e da jornada do seu grupo.</p>
                
                <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:25px;">
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Nome da Campanha</label>
                        <input type="text" id="new-camp-name" class="form-input" value="A Lenda de Hawnk" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff;" />
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Mestre / DM</label>
                        <input type="text" id="new-camp-dm" class="form-input" value="${dmName}" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff;" />
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Sistema de Jogo</label>
                        <select id="new-camp-system" class="form-select" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; cursor:pointer;">
                            <option value="D&D 5e">D&D 5e (Dungeons & Dragons)</option>
                            <option value="Pathfinder 2e">Pathfinder 2e</option>
                            <option value="Tormenta20">Tormenta20</option>
                            <option value="Outro">Outro Sistema</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Introdução Histórica (Lore)</label>
                        <textarea id="new-camp-lore" class="form-textarea" rows="3" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; font-size:0.8rem;">Uma nova jornada épica se inicia nas terras de Arcanum...</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Nível Inicial</label>
                            <input type="number" id="new-camp-lvl" class="form-input" value="1" min="1" max="20" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; text-align:center;" />
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Limite do Timer</label>
                            <select id="new-camp-timer" class="form-select" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; cursor:pointer;">
                                <option value="0">Sem Limite</option>
                                <option value="3600000">1 Hora</option>
                                <option value="7200000">2 Horas</option>
                                <option value="10800000">3 Horas</option>
                                <option value="14400000">4 Horas</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-ghost close-btn">Cancelar</button>
                    <button class="btn btn-primary start-btn" style="background:#2ecc71; border-color:#2ecc71;">Iniciar Campanha</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('.start-btn').onclick = async () => {
            const name = modal.querySelector('#new-camp-name').value;
            const dm = modal.querySelector('#new-camp-dm').value;
            const system = modal.querySelector('#new-camp-system').value;
            const lore = modal.querySelector('#new-camp-lore').value;
            const lvl = parseInt(modal.querySelector('#new-camp-lvl').value) || 1;
            const timerLimit = parseInt(modal.querySelector('#new-camp-timer').value) || 0;

            localStorage.setItem('DM_SYSTEM', system);
            localStorage.setItem('DM_MASTER_NAME', dm);

            const slug = name.trim().toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_');
            const file = `${slug}.json`;

            let list = this._getSessionsList();
            if (list.some(s => s.file === file)) {
                Toast.show('Uma campanha com este nome já existe!', 'danger');
                return;
            }

            list.push({ name: name.trim(), file: file });
            localStorage.setItem(this._getSessionListKey(), JSON.stringify(list));

            this._saveSessionMeta(file, { 
                status: 'open', 
                totalElapsed: 0, 
                timerStart: null, 
                timerPaused: false,
                timerLimitMs: timerLimit
            });

            TOME.persistence.filename = file;
            localStorage.setItem('TOME_ACTIVE_SESSION', file);

            TOME.store.update(s => {
                s.sessionTitle = name.trim();
                s.sessionNumber = 1;
                s.sessionNotes = lore;
                s.players = s.players || [];
                s.players.forEach(p => {
                    p.level = lvl;
                    p.xp = 0;
                });
                s.monsters = [];
                s.initiativeOrder = [];
                s.concentration = [];
                s.combatRound = 0;
                s.combatActive = false;
                s.journalEntries = [
                    {
                        id: Date.now(),
                        timestamp: Date.now(),
                        type: 'info',
                        title: 'Campanha Iniciada',
                        content: `Mestre ${dm} iniciou a campanha "${name}" usando o sistema ${system}.`
                    }
                ];
                s.tacticalMap = { fog: null, mapUrl: null, tokens: [] };
                s.lastLoot = null;
                s.xpDistributed = 0;
            });

            await TOME.persistence.save();
            modal.remove();
            
            await this._applySessionSwitch(file);
            Toast.show(`Campanha "${name}" criada e iniciada!`, 'success');
        };
    }



    _renderCampaignBanner() {
        const state = this.store.state;
        const title = state.sessionTitle || 'Nova Campanha';
        const system = localStorage.getItem('DM_SYSTEM') || 'D&D 5e';
        const dm = localStorage.getItem('DM_MASTER_NAME') || 'Mestre';
        const sessionNum = state.sessionNumber || 1;
        const players = state.players || [];
        const alivePlayers = players.filter(p => (p.hp?.current || 0) > 0).length;
        const totalXp = state.xpDistributed || 0;
        const combatActive = state.combatActive;
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        const timerDisplay = this._timerDisplay || this._getTimerDisplay();

        const statusColor = combatActive ? '#ef4444' : '#22c55e';
        const statusText = combatActive ? 'Em Combate' : 'Explorando';
        const statusIcon = combatActive ? 'fa-swords' : 'fa-compass';

        return html`
            <div style="
                background: linear-gradient(135deg, rgba(197,160,89,0.06), rgba(10,12,16,0.8));
                border: 1px solid rgba(197,160,89,0.25);
                border-radius: 16px;
                padding: 20px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                flex-wrap: wrap;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 0 40px rgba(197,160,89,0.02);
                position: relative;
                overflow: hidden;
            ">
                <!-- Decorative glow -->
                <div style="position:absolute; top:-40px; left:-40px; width:200px; height:200px; background:radial-gradient(circle, rgba(197,160,89,0.08), transparent 70%); pointer-events:none;"></div>

                <!-- Campaign Identity -->
                <div style="display:flex; flex-direction:column; gap:4px; min-width:200px;">
                    <div style="font-size:0.55rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:2px; font-family:'Cinzel';">Campanha Ativa</div>
                    <div style="font-family:'Cinzel', serif; font-size:1.35rem; font-weight:900; color:var(--accent); text-shadow:0 2px 10px rgba(197,160,89,0.3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px;">${title}</div>
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <span style="font-size:0.65rem; color:#94a3b8;"><i class="fa-solid fa-scroll" style="margin-right:3px; color:var(--accent);"></i>${system}</span>
                        <span style="font-size:0.65rem; color:#94a3b8;"><i class="fa-solid fa-user-shield" style="margin-right:3px; color:var(--accent);"></i>${dm}</span>
                        <span style="font-size:0.65rem; color:#94a3b8;"><i class="fa-solid fa-book-open" style="margin-right:3px; color:var(--accent);"></i>Sessão ${sessionNum}</span>
                    </div>
                </div>

                <!-- Stats Row -->
                <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:900; color:#22c55e; font-family:'Cinzel';">${alivePlayers}<span style="font-size:0.9rem; color:#64748b;">/${players.length}</span></div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Heróis Vivos</div>
                    </div>
                    <div style="width:1px; height:32px; background:rgba(255,255,255,0.06);"></div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:900; color:var(--accent); font-family:'JetBrains Mono',monospace;">${timerDisplay}</div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Tempo Sessão</div>
                    </div>
                    <div style="width:1px; height:32px; background:rgba(255,255,255,0.06);"></div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:900; color:#60a5fa; font-family:'Cinzel';">${totalXp.toLocaleString('pt-BR')}</div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">XP Total</div>
                    </div>
                    <div style="width:1px; height:32px; background:rgba(255,255,255,0.06);"></div>
                    <div style="text-align:center;">
                        <div style="font-size:0.8rem; font-weight:800; color:${statusColor}; display:flex; align-items:center; gap:5px; font-family:'Cinzel';"><i class="fa-solid ${statusIcon}"></i>${statusText}</div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Status</div>
                    </div>
                </div>
            </div>
        `;
    }

    quickAddQuest() {
        const title = prompt('Digite o título da nova Quest/Missão:');
        if (!title || !title.trim()) return;
        const reward = prompt('Digite a recompensa (Ex: 200 GP, Anel Mágico):') || '';
        
        TOME.store.update(s => {
            s.quests = s.quests || [];
            s.quests.push({
                id: 'q-' + Date.now(),
                title: title.trim(),
                description: 'Missão rápida cadastrada via central de comando.',
                type: 'side',
                difficulty: 'medium',
                levelRange: '1-4',
                faction: 'Nenhuma',
                xpType: 'xp',
                xpReward: 100,
                reward: reward.trim() || 'Nenhuma',
                milestones: [],
                completed: false,
                failed: false,
                xpDistributed: false,
                status: 'active'
            });
        });
        Toast.show('Nova missão adicionada ao painel!', 'success');
        this.render();
    }

    quickCompleteQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;

        TOME.store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (String(q.id) === String(id)) {
                    const sessionNum = s.sessionNumber || 1;
                    const logMsg = `⚔️ MISSÃO CONCLUÍDA: Os heróis completaram a missão "${q.title}"!`;
                    s.journalEntries = [...(s.journalEntries || []), {
                        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                        session: sessionNum,
                        timestamp: Date.now(),
                        text: logMsg,
                        type: 'system'
                    }];

                    // Auto award renown if faction is set
                    if (q.faction && q.faction !== 'Nenhuma') {
                        const ptsAward = q.difficulty === 'easy' ? 1 : q.difficulty === 'hard' ? 3 : q.difficulty === 'deadly' ? 5 : 2;
                        s.factionRenown = s.factionRenown || { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
                        
                        const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
                        const fKey = keyMap[q.faction] || 'Harpers';
                        s.factionRenown[fKey] = (s.factionRenown[fKey] || 0) + ptsAward;

                        const fLog = `🚩 RENOME DE FACÇÃO: A influência com os ${q.faction} aumentou em +${ptsAward} pontos pela conclusão de "${q.title}".`;
                        s.journalEntries.push({
                            id: 'log-f-' + Date.now(),
                            session: sessionNum,
                            timestamp: Date.now(),
                            text: fLog,
                            type: 'system'
                        });
                    }

                    return { 
                        ...q, 
                        completed: true,
                        failed: false,
                        status: 'completed'
                    };
                }
                return q;
            });
        });
        
        // Log to Chronicles
        const qObj = this.store.state.quests?.find(q => String(q.id) === String(id));
        if (qObj) {
            this._logChronicleEntry(`Aventura Concluída: "${qObj.title}". Os heróis conquistaram as metas e foram agraciados com recompensas.`, 'quest_completed');
        }

        TOME.persistence.save().catch(err => console.warn(err));
        Toast.show('Missão marcada como concluída!', 'success');
        this.render();
    }

    quickFailQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        if (confirm('Marcar esta missão como fracassada? O fracasso será arquivado na crônica da campanha.')) {
            TOME.store.update(s => {
                s.quests = (s.quests || []).map(q => {
                    if (String(q.id) === String(id)) {
                        const sessionNum = s.sessionNumber || 1;
                        const logMsg = `💀 MISSÃO FRACASSADA: Os heróis falharam na missão "${q.title}".`;
                        s.journalEntries = [...(s.journalEntries || []), {
                            id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                            session: sessionNum,
                            timestamp: Date.now(),
                            text: logMsg,
                            type: 'system'
                        }];

                        return {
                            ...q,
                            failed: true,
                            completed: false,
                            status: 'failed'
                        };
                    }
                    return q;
                });
            });

            const qObj = this.store.state.quests?.find(q => String(q.id) === String(id));
            if (qObj) {
                this._logChronicleEntry(`Aventura Fracassada: "${qObj.title}". Um capítulo sombrio se fecha com a derrota ou falha dos heróis nas suas metas.`, 'quest_failed');
            }

            TOME.persistence.save().catch(err => console.warn(err));
            this.render();
        }
    }

    quickDeleteQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        if (confirm('Deseja excluir esta missão permanentemente? Esta ação não pode ser desfeita.')) {
            TOME.store.update(s => {
                s.quests = (s.quests || []).filter(q => String(q.id) !== String(id));
            });
            TOME.persistence.save().catch(err => console.warn(err));
            this.render();
            Toast.show('Missão removida permanentemente.');
        }
    }

    quickLootQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        const quest = this.store.state.quests?.find(q => String(q.id) === String(id));
        if (!quest) return;

        // Parse reward text to look for coins
        let goldVal = 0;
        const rewardText = quest.reward || '';
        const matchGold = rewardText.match(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)/);
        if (matchGold) {
            goldVal = parseInt(matchGold[1]) || 0;
        }

        // Filter out gold string for items if possible
        const remainingItems = rewardText.replace(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)(?:,?\s*e?\s*)?/, '').trim();

        this._showLootModalId = id;
        this._selectedLootPlayers = (this.store.state.players || []).map(p => p.id);
        this._lootGold = goldVal;
        this._lootItems = remainingItems !== 'Nenhuma' ? remainingItems : '';
        this.render();
    }

    closeLootModal() {
        this._showLootModalId = null;
        this.render();
    }

    toggleLootPlayer(id) {
        if (this._selectedLootPlayers.includes(id)) {
            this._selectedLootPlayers = this._selectedLootPlayers.filter(x => x !== id);
        } else {
            this._selectedLootPlayers.push(id);
        }
        this.render();
    }

    confirmLootDistribution() {
        if (!this._showLootModalId || this._selectedLootPlayers.length === 0) return;
        const qId = this._showLootModalId;

        const goldVal = parseInt(this._lootGold) || 0;
        const itemsText = (this._lootItems || '').trim();

        const goldPerHero = goldVal > 0 ? Math.floor(goldVal / this._selectedLootPlayers.length) : 0;

        TOME.store.update(s => {
            s.players.forEach(p => {
                if (this._selectedLootPlayers.includes(p.id)) {
                    // Currency update
                    if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
                    p.currency.gp = (parseInt(p.currency.gp) || 0) + goldPerHero;

                    // Items update
                    if (itemsText) {
                        if (!p.equipment) p.equipment = { items: [], notes: '' };
                        if (typeof p.equipment.items === 'string') {
                            p.equipment.items = p.equipment.items.trim() ? p.equipment.items + '\n• ' + itemsText : '• ' + itemsText;
                        } else {
                            p.equipment.items = p.equipment.items || [];
                            p.equipment.items.push({
                                id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                                name: itemsText,
                                qty: 1,
                                weight: 0.5
                            });
                        }
                    }
                }
            });

            // Mark quest reward as distributed
            s.quests = (s.quests || []).map(q => String(q.id) === String(qId) ? { ...q, rewardDistributed: true } : q);

            // Log session journal
            const beneficiaryNames = s.players.filter(p => this._selectedLootPlayers.includes(p.id)).map(p => p.name).join(', ');
            const sessionNum = s.sessionNumber || 1;
            let logMsg = `💰 DIVISÃO DE SAQUE: Riquezas da missão foram distribuídas para: ${beneficiaryNames}.`;
            if (goldVal > 0) logMsg += ` Cada herói recebeu +${goldPerHero} PO.`;
            if (itemsText) logMsg += ` Itens entregues: "${itemsText}".`;

            s.journalEntries = [...(s.journalEntries || []), {
                id: 'log-loot-' + Date.now(),
                session: sessionNum,
                timestamp: Date.now(),
                text: logMsg,
                type: 'loot'
            }];
        });

        const qObj = this.store.state.quests?.find(q => String(q.id) === String(qId));
        if (qObj) {
            let chronMsg = `Tesouros da missão "${qObj.title}" divididos entre o grupo.`;
            if (goldVal > 0) chronMsg += ` +${goldVal} PO partilhados.`;
            if (itemsText) chronMsg += ` Artefatos obtidos: ${itemsText}.`;
            this._logChronicleEntry(chronMsg, 'loot_divided');
        }

        TOME.persistence.save().catch(err => console.warn(err));
        Toast.show('Riquezas e itens distribuídos com sucesso!', 'success');
        this._showLootModalId = null;
        this.render();
    }

    _logChronicleEntry(text, type = 'custom') {
        const sessionNum = this.store.state.sessionNumber || 1;
        TOME.store.update(s => {
            s.chronicleEntries = [...(s.chronicleEntries || []), {
                id: 'chron-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                session: sessionNum,
                timestamp: Date.now(),
                text,
                type
            }];
        });
    }

    _renderLootModal() {
        const quest = this.store.state.quests?.find(q => String(q.id) === String(this._showLootModalId));
        if (!quest) return '';

        const players = this.store.state.players || [];

        return html`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.campaign-manager').__component.closeLootModal()">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9); text-align:left; background:rgba(10,12,16,0.95);" onclick="event.stopPropagation()">
                    <div style="text-align:center; margin-bottom:20px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:15px;">
                        <i class="fa-solid fa-gift fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                        <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.6rem;">💰 Distribuir Tesouro</h3>
                        <p style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                            Recompensa da Missão: <strong style="color:#fff;">"${quest.reward}"</strong>
                        </p>
                    </div>

                    <!-- Input Gold -->
                    <div class="form-group" style="margin-bottom:15px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Ouro Total a Dividir (GP / PO)</label>
                        <input type="number" id="loot-gold-input" value="${this._lootGold}" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.campaign-manager').__component._lootGold = parseInt(this.value) || 0" />
                    </div>

                    <!-- Input Items -->
                    <div class="form-group" style="margin-bottom:20px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Itens Mágicos / Equipamentos a Entregar</label>
                        <input type="text" id="loot-items-input" value="${this._lootItems}" placeholder="Ex: Poção de Cura Maior, Anel de Proteção" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.campaign-manager').__component._lootItems = this.value" />
                    </div>

                    <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800; display:block; margin-bottom:8px;">Selecione os Heróis Beneficiários</label>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:180px; overflow-y:auto; padding-right:5px; scrollbar-width:thin;">
                        ${players.map(p => {
                            const selected = this._selectedLootPlayers.includes(p.id);
                            return html`
                                <label style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:${selected ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)'}; border-radius:10px; cursor:pointer; border:1px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}; transition:all 0.2s;">
                                    <input type="checkbox" style="width:18px; height:18px; accent-color:var(--accent); cursor:pointer;" 
                                           ${selected ? 'checked' : ''}
                                           onchange="this.closest('.campaign-manager').__component.toggleLootPlayer('${p.id}')" />
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.9rem; color:#fff;">${p.name}</div>
                                        <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">${p.class || 'Aventureiro'}</div>
                                    </div>
                                </label>
                            `;
                        })}
                    </div>

                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" data-action="closeLootModal">Cancelar</button>
                        <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" data-action="confirmLootDistribution" ${this._selectedLootPlayers.length === 0 ? 'disabled' : ''}>
                            Confirmar Distribuição
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async quickOracleInspire() {
        Toast.show('Consultando o Oráculo IA...', 'info');
        const system = localStorage.getItem('DM_SYSTEM') || 'D&D 5e';
        const title = TOME.store.state.sessionTitle || 'Nova Campanha';
        const heroes = (TOME.store.state.players || []).map(p => `${p.name} (Nv ${p.level} ${p.class})`).join(', ');
        
        try {
            const promptText = `Crie um gancho narrativo dramático e curto (2 frases) para a campanha "${title}" usando o sistema "${system}" com os heróis: ${heroes}. Foque em mistério ou perigo imediato.`;
            const hook = await TOME.ai.ask(promptText);
            
            TOME.store.update(s => {
                s.journalEntries = s.journalEntries || [];
                s.journalEntries.push({
                    id: Date.now(),
                    timestamp: Date.now(),
                    type: 'oracle',
                    title: 'Oráculo da Campanha',
                    content: hook
                });
            });
            Toast.show('O Oráculo soprou uma inspiração narrativa no diário!', 'success');
            this.render();
        } catch (e) {
            Toast.show('O Oráculo falhou em se comunicar: ' + e.message, 'danger');
        }
    }

    adjustMonsterHP(e, el) {
        const monsterId = parseInt(el.dataset.id);
        const val = parseInt(el.dataset.val);
        TOME.store.update(s => {
            const m = s.monsters.find(x => x.id === monsterId);
            if (m) {
                m.hp.current = Math.max(0, Math.min(m.hp.max, m.hp.current + val));
                const combatant = s.initiativeOrder?.find(c => c.id === m.id);
                if (combatant) combatant.hp_current = m.hp.current;
            }
        });
        this.render();
    }

    onMount() {
        this.element.classList.add('campaign-manager');
        this.element.__component = this;
        const file = TOME.persistence?.filename || 'state.json';
        const meta = this._getSessionMeta(file);
        if (meta.status === 'open' && meta.timerStart && !meta.timerPaused) {
            this._startTickInterval();
        }
        
        const limitSelect = this.$('#timer-limit-select');
        if (limitSelect) {
            limitSelect.addEventListener('change', (e) => {
                this.changeTimerLimit(e, e.target);
            });
        }
    }

    onUnmount() {
        this._stopTickInterval();
    }

    changeTimerLimit(e, el) {
        const file = TOME.persistence?.filename || 'state.json';
        const limitMs = parseInt(el.value) || 0;
        this._saveSessionMeta(file, { timerLimitMs: limitMs });
        this._timerDisplay = this._getTimerDisplay();
        const disp = document.getElementById('session-timer-display');
        if (disp) disp.textContent = this._timerDisplay;
        Toast.show(limitMs > 0 ? `Limite de tempo definido para ${this._formatElapsed(limitMs)}` : 'Duração da sessão definida como Livre.', 'info');
        this.render();
    }

    createNewSession() {
        const name = prompt('Digite o nome da nova sessão/campanha:');
        if (!name || !name.trim()) return;

        const slug = name.trim().toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_');
        const file = `${slug}.json`;

        let list = this._getSessionsList();
        if (list.some(s => s.file === file)) {
            Toast.show('Uma sessão com este nome já existe!', 'danger');
            return;
        }

        list.push({ name: name.trim(), file: file });
        localStorage.setItem(this._getSessionListKey(), JSON.stringify(list));
        // New session starts as 'open' but not yet timed
        this._saveSessionMeta(file, { status: 'open', totalElapsed: 0, timerStart: null, timerPaused: false });
        MatchHistoryService.register(name.trim(), file);
        this._applySessionSwitch(file);
    }

    cloneSession() {
        const name = prompt('Digite o nome para o clone da sessão atual:');
        if (!name || !name.trim()) return;

        const slug = name.trim().toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_');
        const file = `${slug}.json`;

        let list = this._getSessionsList();
        if (list.some(s => s.file === file)) {
            Toast.show('Uma sessão com este nome já existe!', 'danger');
            return;
        }

        list.push({ name: name.trim(), file: file });
        localStorage.setItem(this._getSessionListKey(), JSON.stringify(list));

        TOME.persistence.filename = file;
        localStorage.setItem('TOME_ACTIVE_SESSION', file);
        TOME.persistence.save().then(() => {
            MatchHistoryService.register(name.trim(), file, { clonedFrom: TOME.persistence.filename });
            Toast.show(`Sessão clonada como: ${name}`, 'success');
            this.render();
        });
    }

    changeSession(e, el) {
        this._applySessionSwitch(el.value);
    }

    async _applySessionSwitch(file) {
        // Pause current timer before switching
        this._stopTickInterval();
        this._timerDisplay = '00:00:00';

        Toast.show('Carregando sessão...', 'info');
        TOME.store.update(s => {
            s.initiativeOrder = [];
        });
        
        await TOME.persistence.switchSession(file);
        MatchHistoryService.touchSession(file, TOME.store.state);
        
        this._selectedHeroId = null;
        // Auto-resume tick if this session's timer is already running
        const meta = this._getSessionMeta(file);
        if (meta.status === 'open' && meta.timerStart && !meta.timerPaused) {
            this._startTickInterval();
        }
        Toast.show('Sessão carregada com sucesso!', 'success');
        this.render();
    }

    resetCampaignState() {
        if (!confirm("Tem certeza que deseja ZERAR os status e iniciar a campanha com base em D&D 5e?\nOs heróis não serão afetados, mas os combates, mapa e registros da sessão atual serão reiniciados.")) {
            return;
        }

        // Reset session timer metadata too
        const file = TOME.persistence?.filename || 'state.json';
        this._stopTickInterval();
        this._timerDisplay = '00:00:00';
        this._saveSessionMeta(file, { status: 'open', totalElapsed: 0, timerStart: null, timerPaused: false, endedAt: null });

        TOME.store.update(s => {
            // Keep s.players and s.savedNPCs intact.
            // Reset game state for a new D&D 5e start
            s.monsters = [];
            s.initiativeOrder = [];
            s.concentration = [];
            s.combatRound = 0;
            s.combatActive = false;
            s.journalEntries = [];
            s.sessionNotes = '';
            s.tacticalMap = { fog: null, mapUrl: null, tokens: [] };
            s.lastLoot = null;
            s.resources = { potions: 0, scrolls: 0 };
        });

        TOME.persistence.save().then(() => {
            import('./Toast.js').then(m => m.Toast.show('Status da campanha zerados com sucesso para o início!', 'success'));
            this.render();
        });
    }

    adjustHP(e, el) {
        const val = parseInt(el.dataset.val);
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) {
                p.hp.current = Math.max(0, Math.min(p.hp.max, p.hp.current + val));
                const combatant = s.initiativeOrder?.find(c => c.name === p.name);
                if (combatant) combatant.hp_current = p.hp.current;
            }
        });
        this.render();
    }

    adjustXP(e, el) {
        const val = parseInt(el.dataset.val);
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) {
                p.xp = (p.xp || 0) + val;
                s.xpDistributed = (s.xpDistributed || 0) + val;
                if (!s.journalEntries) s.journalEntries = [];
                s.journalEntries.push({
                    id: Date.now(),
                    timestamp: Date.now(),
                    date: new Date().toLocaleDateString('pt-BR'),
                    type: 'loot',
                    title: 'XP Distribuído',
                    content: `Adjudicado +${val} XP para o herói ${p.name}.`
                });
            }
        });
        this.render();
    }

    customXP() {
        const val = parseInt(prompt('Quantidade de XP:'));
        if (!isNaN(val)) {
            TOME.store.update(s => {
                const p = s.players.find(x => x.id === this._selectedHeroId);
                if (p) {
                    p.xp = (p.xp || 0) + val;
                    s.xpDistributed = (s.xpDistributed || 0) + val;
                    if (!s.journalEntries) s.journalEntries = [];
                    s.journalEntries.push({
                        id: Date.now(),
                        timestamp: Date.now(),
                        date: new Date().toLocaleDateString('pt-BR'),
                        type: 'loot',
                        title: 'XP Distribuído',
                        content: `Adjudicado +${val} XP para o herói ${p.name}.`
                    });
                }
            });
            this.render();
        }
    }

    rollAttribute(e, el) {
        const attr = el.dataset.attr;
        const val = parseInt(el.dataset.val) || 10;
        const p = this.store.state.players.find(x => x.id === this._selectedHeroId);
        if (!p) return;
        
        this.showAttributeModal(attr, val, p);
    }

    showAttributeModal(attr, val, p) {
        const mod = Math.floor((val - 10) / 2);
        
        // Remove existing modal if any
        const existing = document.getElementById('attr-roll-modal');
        if (existing) existing.remove();

        const attrNames = {
            str: { name: 'Força', icon: 'fa-dumbbell', desc: 'Mede o poder físico bruto, força muscular e proeza atlética.', skills: 'Atletismo', examples: 'Levantar portões pesados, quebrar correntes, empurrar oponentes.' },
            dex: { name: 'Destreza', icon: 'fa-person-running', desc: 'Mede a agilidade, reflexos, equilíbrio e coordenação motora fina.', skills: 'Acrobacia, Furtividade, Prestidigitação', examples: 'Esquivar de armadilhas, andar em silêncio, roubar bolsos.' },
            con: { name: 'Constituição', icon: 'fa-heart-pulse', desc: 'Mede a saúde, vigor, resistência física e força vital.', skills: 'Resistência Geral (Nenhuma perícia direta)', examples: 'Resistir a toxinas/venenos, suportar exaustão, manter concentração.' },
            int: { name: 'Inteligência', icon: 'fa-brain', desc: 'Mede a acuidade mental, precisão de memória e raciocínio lógico.', skills: 'Arcanismo, História, Investigação, Natureza, Religião', examples: 'Identificar itens mágicos, decifrar enigmas, investigar pistas.' },
            wis: { name: 'Sabedoria', icon: 'fa-eye', desc: 'Mede a percepção sensorial, intuição, bom senso e sintonia.', skills: 'Adestrar Animais, Intuição, Medicina, Percepção, Sobrevivência', examples: 'Detectar emboscadas, ler linguagem corporal, rastrear presas.' },
            cha: { name: 'Carisma', icon: 'fa-comments', desc: 'Mede a força de personalidade, magnetismo pessoal e influência.', skills: 'Atuação, Enganação, Intimidação, Persuasão', examples: 'Convencer guardas, acalmar turbas, mentir sem ser notado.' }
        };

        const info = attrNames[attr] || { name: attr.toUpperCase(), icon: 'fa-dice-d20', desc: '', skills: '', examples: '' };
        
        const modal = document.createElement('div');
        modal.id = 'attr-roll-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `;

        modal.innerHTML = html`
            <div class="card glass-accent" style="max-width:500px; width:90%; padding:30px; border-radius:18px; border:2px solid rgba(197,160,89,0.35); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(197,160,89,0.05); text-align:left;">
                
                <!-- HEADER -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1.5px solid rgba(197,160,89,0.2); padding-bottom:15px; margin-bottom:20px;">
                    <div>
                        <span style="font-size:0.65rem; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1.5px; font-family:'Cinzel';">Orientação de Regras D&D 5e</span>
                        <h3 style="margin:5px 0 0; font-family:'Cinzel', serif; font-size:1.6rem; color:#fff; display:flex; align-items:center; gap:10px;">
                            <i class="fa-solid ${info.icon}" style="color:var(--accent);"></i> ${info.name.toUpperCase()}
                        </h3>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:1.8rem; font-weight:900; color:#fff; font-family:'Cinzel'; line-height:1;">${val}</span>
                        <div style="font-size:0.75rem; color:${mod >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:800; margin-top:4px;">MOD ${mod >= 0 ? '+' : ''}${mod}</div>
                    </div>
                </div>

                <!-- LORE / DESCRIPTION -->
                <div style="font-size:0.8rem; color:#d1d5db; line-height:1.6; margin-bottom:18px; display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <strong style="color:var(--accent); display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">O que representa:</strong>
                        <span style="color:#e2e8f0;">${info.desc}</span>
                    </div>
                    <div>
                        <strong style="color:var(--accent); display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">Perícias comuns:</strong>
                        <span style="color:#93c5fd; font-weight:600;">${info.skills}</span>
                    </div>
                    <div>
                        <strong style="color:var(--accent); display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">Exemplos de uso:</strong>
                        <span style="font-style:italic; color:#a1a1aa;">"${info.examples}"</span>
                    </div>
                </div>

                <!-- FORMULA GUIDE -->
                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:20px; text-align:center;">
                    <span style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; display:block; margin-bottom:4px;">Fórmula D&D do Teste</span>
                    <strong style="font-size:1.1rem; color:var(--accent); font-family:'Cinzel';">d20 ${mod >= 0 ? '+' : ''}${mod}</strong>
                </div>

                <!-- ACTION BUTTONS -->
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn btn-primary btn-sm btn-block roll-action" data-mode="normal" style="background:var(--accent); border-color:var(--accent); font-weight:800; padding:12px; font-size:0.8rem; border-radius:8px; display:flex; justify-content:center; align-items:center; gap:8px;">
                        <i class="fa-solid fa-dice-d20"></i> Rolar Teste Simples (d20)
                    </button>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <button class="btn btn-ghost btn-sm roll-action" data-mode="advantage" style="border-color:rgba(46,204,113,0.3); color:var(--success); font-weight:800; padding:10px; font-size:0.75rem; border-radius:8px;">
                            🟢 Com Vantagem
                        </button>
                        <button class="btn btn-ghost btn-sm roll-action" data-mode="disadvantage" style="border-color:rgba(231,76,60,0.3); color:var(--danger); font-weight:800; padding:10px; font-size:0.75rem; border-radius:8px;">
                            🔴 Com Desvantagem
                        </button>
                    </div>

                    <button class="btn btn-ghost btn-sm btn-block roll-action" data-mode="save" style="border-color:rgba(96,165,250,0.3); color:var(--info); font-weight:800; padding:10px; font-size:0.75rem; border-radius:8px;">
                        🛡️ Rolar Salvaguarda (+Proficiência)
                    </button>

                    <button class="btn btn-ghost btn-sm btn-block close-modal" style="border-color:rgba(255,255,255,0.08); color:var(--text-dim); font-weight:800; padding:8px; font-size:0.75rem; border-radius:8px; margin-top:10px;">
                        Fechar
                    </button>
                </div>

            </div>
        `;

        // Append to body
        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelectorAll('.roll-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                modal.remove();
                this._performRuleRoll(info.name, mod, mode, p);
            });
        });
    }

    _performRuleRoll(attrName, mod, mode, p) {
        const r1 = Dice.roll('1d20');
        const r2 = Dice.roll('1d20');
        let finalVal = 0;
        let rollText = '';
        
        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');

        if (mode === 'normal') {
            finalVal = r1.total + mod;
            rollText = `Rolo d20(${r1.total}) ${mod >= 0 ? '+' : ''}${mod} = **${finalVal}**`;
        } else if (mode === 'advantage') {
            const chosen = Math.max(r1.total, r2.total);
            finalVal = chosen + mod;
            rollText = `Rolo com **Vantagem** [d20(${r1.total}), d20(${r2.total})] ➔ Maior (${chosen}) ${mod >= 0 ? '+' : ''}${mod} = **${finalVal}**`;
        } else if (mode === 'disadvantage') {
            const chosen = Math.min(r1.total, r2.total);
            finalVal = chosen + mod;
            rollText = `Rolo com **Desvantagem** [d20(${r1.total}), d20(${r2.total})] ➔ Menor (${chosen}) ${mod >= 0 ? '+' : ''}${mod} = **${finalVal}**`;
        } else if (mode === 'save') {
            const prof = p.proficiencyBonus || 2;
            // D&D 5e default rules assume proficiency applies on designated saves
            const totalMod = mod + prof;
            finalVal = r1.total + totalMod;
            rollText = `Rolo **Salvaguarda** d20(${r1.total}) + Mod(${mod}) + Proficiência(+${prof}) = **${finalVal}**`;
        }

        import('./Toast.js').then(m => {
            m.Toast.show(`🎲 **${p.name}** fez um teste de **${attrName}**!<br />${rollText}`, 'success');
        });
    }

    exportCamp() {
        const state = TOME.store.snapshot();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `mdm_backup_${state.sessionTitle || 'campanha'}_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        import('./Toast.js').then(m => m.Toast.show('Backup exportado com sucesso!', 'success'));
    }

    importCamp() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm("Isto substituirá TODOS os dados atuais pela importação. Deseja continuar?")) {
                        TOME.store.update(s => Object.assign(s, data));
                        TOME.persistence.save();
                        import('./Toast.js').then(m => m.Toast.show('Campanha importada!', 'success'));
                        this.render();
                    }
                } catch (err) {
                    alert("Arquivo inválido.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }



    editCampaign() {
        const currentName = TOME.store.state.sessionTitle || 'Nova Campanha';
        const currentSystem = localStorage.getItem('DM_SYSTEM') || 'D&D 5e';
        const isCombat = TOME.store.state.combatActive;
        
        const existing = document.getElementById('edit-campaign-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'edit-campaign-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `;

        modal.innerHTML = html`
            <div class="card glass-accent" style="width:90%; max-width:400px; padding:25px; border-radius:16px;">
                <h3 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:20px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:10px;">Editar Campanha</h3>
                
                <label style="display:block; margin-bottom:5px; font-size:0.75rem; color:var(--text-dim);">Nome da Campanha</label>
                <input type="text" id="camp-name-input" class="form-input" value="${currentName}" style="width:100%; margin-bottom:15px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(197,160,89,0.3); padding:10px; border-radius:8px;" />
                
                <label style="display:block; margin-bottom:5px; font-size:0.75rem; color:var(--text-dim);">Sistema de Jogo</label>
                <input type="text" id="camp-system-input" class="form-input" value="${currentSystem}" style="width:100%; margin-bottom:20px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(197,160,89,0.3); padding:10px; border-radius:8px;" />
                
                <label style="display:block; margin-bottom:5px; font-size:0.75rem; color:var(--text-dim);">Status da Sessão (Forçar)</label>
                <select id="camp-status-input" class="form-select" style="width:100%; margin-bottom:25px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(197,160,89,0.3); padding:10px; border-radius:8px;">
                    <option value="explore" ${!isCombat ? 'selected' : ''}>Exploração (Pacífico)</option>
                    <option value="combat" ${isCombat ? 'selected' : ''}>Em Combate (Iniciativa)</option>
                </select>

                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-ghost close-btn">Cancelar</button>
                    <button class="btn btn-primary save-btn">Salvar Alterações</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('.save-btn').onclick = () => {
            const newName = modal.querySelector('#camp-name-input').value;
            const newSystem = modal.querySelector('#camp-system-input').value;
            const newStatus = modal.querySelector('#camp-status-input').value;

            localStorage.setItem('DM_SYSTEM', newSystem);
            TOME.store.update(s => {
                s.sessionTitle = newName;
                s.combatActive = (newStatus === 'combat');
            });
            modal.remove();
            this.render();
            import('./Toast.js').then(m => m.Toast.show('Campanha atualizada!', 'success'));
        };
    }

    updateItems(e, el) {
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) {
                const lines = el.value.split('\n').filter(line => line.trim());
                p.equipment.items = lines.map(line => {
                    const match = line.match(/^(\d+)x?\s+(.+)$/);
                    if (match) {
                        return { qty: parseInt(match[1]) || 1, name: match[2].trim(), weight: 0 };
                    }
                    return { qty: 1, name: line.trim(), weight: 0 };
                });
            }
        });
    }

    updateNotes(e, el) {
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) {
                if (!p.roleplay) p.roleplay = { traits: '' };
                p.roleplay.traits = el.value;
            }
        });
    }
}
