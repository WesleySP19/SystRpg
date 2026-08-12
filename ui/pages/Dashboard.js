import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { MatchHistoryService } from '../../services/MatchHistoryService.js';
import { MainPanel } from '../components/MainPanel.js';
import { PersistenceService } from '../../services/PersistenceService.js';

/**
 * DASHBOARD v6.0 — "Master's Table" Edition
 * Unified with the Legacy Parchment theme.
 */
export class Dashboard extends Component {
    constructor(opts) {
        super(opts);
        this._activeChild = null;
        this._lastTab = null;
        this._showSnapshots = false;
        this._showMatchHistory = false;

        // Listen to changes made by the Standalone Map Window
        window.addEventListener('storage', (e) => {
            const activeSession = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
            if (e.key === `TOME_PRO_STATE_${activeSession}`) {
                try {
                    const state = JSON.parse(e.newValue);
                    TOME.store.update(s => {
                        // Only sync non-map things that the map might alter (HP, initiative, etc)
                        s.players = state.players;
                        s.monsters = state.monsters;
                        s.initiativeOrder = state.initiativeOrder;
                        s.initiativeIndex = state.initiativeIndex;
                        s.combatRound = state.combatRound;
                        s.combatActive = state.combatActive;
                    });
                } catch (err) {}
            }
        });
    }

    template() {
        return `
            <div id="view-content" style="width:100%; height:100%; overflow-y:auto; scrollbar-width:thin;"></div>
            <div id="hud-target"></div>
            <div id="chat-target"></div>
        `;
    }

    async onMount() {
        MatchHistoryService.syncFromSessionList();
        MatchHistoryService.updateCurrent(this.store.state, TOME.persistence?.filename);
        this._loadView();

        const { PartyStatusHUD } = await import('../components/PartyStatusHUD.js');
        this._hud = new PartyStatusHUD({
            store: this.store,
            element: this.$('#hud-target')
        });
        this._hud.mount();

        const { ChatBox } = await import('../components/ChatBox.js');
        this._chatBox = new ChatBox({
            store: this.store,
            element: this.$('#chat-target')
        });
        this._chatBox.mount();
    }

    render() {
        const tab = this.store.state.activeTab;
        const target = this.$('#view-content');
        if (!target) {
            super.render();
            return;
        }
        if (tab !== this._lastTab) {
            this._loadView();
        } else if (tab === 'dashboard') {
            // Re-render home page to reflect state changes (like Oracle hooks)
            target.innerHTML = this._homePage();
            this._bindHomeActions(target);
            // Mount MainPanel cinematic UI
            const mainPanel = new MainPanel({ store: this.store, element: target.querySelector('#main-panel') });
            mainPanel.mount();
        }
    }

    async _loadView() {
        const tab = this.store.state.activeTab;
        if (tab === this._lastTab && this._activeChild) return;
        this._lastTab = tab;

        const target = this.$('#view-content');
        if (!target) return;

        if (this._activeChild) {
            this._activeChild.unmount();
            this._activeChild = null;
        }

        if (tab === 'dashboard') {
            target.innerHTML = this._homePage();
            this._bindHomeActions(target);
            return;
        }

        // Cinematic Loader
        target.innerHTML = `
            <div style="height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--sheet-label-color); gap:20px;">
                <i class="fa-solid fa-feather-pointed fa-3x fa-bounce"></i>
                <div style="font-family:'Cinzel'; letter-spacing:3px;">Abrindo Grimório...</div>
            </div>
        `;

        try {
            const moduleMap = {
                'campaign': { path: '../components/CampaignManager.js', cls: 'CampaignManager' },
                'dmtable': { path: '../components/DMTable.js', cls: 'DMTable' },
                'dmshield': { path: '../components/DMShield.js', cls: 'DMShield' },
                'worldbuilder': { path: '../components/WorldBuilder.js', cls: 'WorldBuilder' },
                'combat': { path: '../components/combat/CombatTrackerV17.js', cls: 'CombatTrackerV17' },
                'quest': { path: '../components/QuestManager.js', cls: 'QuestManager' },
                'chareditor': { path: '../components/DynamicCharacterBuilder.js', cls: 'DynamicCharacterBuilder' },
                'character': { path: '../components/DynamicCharacterBuilder.js', cls: 'DynamicCharacterBuilder' },
                'builder': { path: '../components/PlayerForm.js', cls: 'PlayerForm' },
                'herohub': { path: '../components/HeroHub.js', cls: 'HeroHub' },
                'herosheet': { path: '../components/hero/HeroSheetV14.js', cls: 'HeroSheetV14' },
                'cardgenerator': { path: '../components/CardGenerator.js', cls: 'CardGenerator' },
                'bestiary': { path: './Bestiary.js', cls: 'Bestiary' },
                'journal': { path: '../components/SessionJournal.js', cls: 'SessionJournal' },
                'loot': { path: '../components/LootGenerator.js', cls: 'LootGenerator' },
                'spellbook': { path: '../components/SpellBook.js', cls: 'SpellBook' },
                'npc': { path: '../components/NPCHelper.js', cls: 'NPCHelper' },
                'settings': { path: '../components/QuickReference.js', cls: 'QuickReference' },
                'initiative': { path: '../components/InitiativeMonitor.js', cls: 'InitiativeMonitor' },
                'tomesinal': { path: '../components/TomeSinalPanel.js', cls: 'TomeSinalPanel' }
            };

            const entry = moduleMap[tab];
            if (!entry) {
                target.innerHTML = `<div class="legacy-sheet-container">Módulo não encontrado.</div>`;
                return;
            }

            // Skeleton Loading UI
            target.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--accent); padding: 30px; font-family: 'Cinzel', serif; animation: fadeIn 0.3s ease;">
                    <i class="fa-solid fa-circle-notch fa-spin fa-3x" style="margin-bottom: 20px; opacity: 0.8;"></i>
                    <h3 style="font-size: 1.2rem; margin: 0; color: var(--text-muted);">Invocando ${tab.toUpperCase()}...</h3>
                </div>
            `;

            // Aumentado timeout para 8s para conexões lentas ou re-cache
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de 8000ms excedido ao carregar módulo ' + tab)), 8000));
            const mod = await Promise.race([import(entry.path), timeoutPromise]);
            const Cls = mod[entry.cls];
            target.innerHTML = '';
            this._activeChild = new Cls({ store: this.store, element: target });
            this._activeChild.mount();

        } catch (err) {
            console.error('[Dashboard] Error boundary caught:', err);
            
            target.innerHTML = `
                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--accent); padding: 30px; font-family: 'Cinzel', serif; background: rgba(0,0,0,0.2);">
                    <i class="fa-solid fa-triangle-exclamation fa-3x" style="margin-bottom: 20px; color: var(--danger);"></i>
                    <h3 style="font-size: 1.4rem; margin: 0; color: #fff;">Falha ao Carregar o Módulo</h3>
                    <p style="font-family: 'Outfit', sans-serif; color: var(--text-dim); margin-top: 10px; max-width: 500px; line-height: 1.6;">
                        Ocorreu um erro interno ao tentar processar a interface <strong>${tab}</strong>. Isso geralmente ocorre por versões de cache conflitantes.
                    </p>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.5); border-left: 4px solid var(--danger); text-align: left; width: 100%; max-width: 600px; font-family: monospace; font-size: 0.75rem; color: #ff8a8a; overflow-x: auto;">
                        ${err.message || String(err)}
                    </div>
                    <button onclick="window.location.href='/index.html?reset=1'" class="btn btn-premium" style="margin-top: 25px; padding: 12px 24px; font-size: 0.85rem; font-weight: 800; border-radius: 10px; border: 1px solid var(--danger);">
                        <i class="fa-solid fa-broom"></i> Limpar Cache e Reiniciar App
                    </button>
                </div>
            `;
        }
    }

    _homePage() {
            const stats = this.store.state;
            const playerCount = (stats.players || []).length;
            const monsterCount = (stats.monsters || []).length;
            const npcCount = (stats.savedNPCs || []).length;
            const questCount = (stats.quests || []).length;
            const activeCombat = stats.combatActive ? '⚔️ EM COMBATE' : '📜 EXPLORAÇÃO';
            const combatColor = stats.combatActive ? 'var(--danger)' : 'var(--success)';
            const matchSummary = MatchHistoryService.getSummary();

            const masterName = localStorage.getItem('DM_MASTER_NAME') || 'Mestre';
            const masterId = localStorage.getItem('DM_MASTER_ID') || 'N/A';
            const internalId = localStorage.getItem('DM_INTERNAL_ID') || 'DGH-MST-8F2A91';

            const activeTableId = localStorage.getItem('DM_ACTIVE_TABLE') || 'Sem Mesa';

            let sessionNum = 1;
            if (stats.journalEntries && stats.journalEntries.length > 0) {
                sessionNum = stats.journalEntries.length + 1;
            }

            const lastActiveTime = parseInt(localStorage.getItem('DM_SESSION_LAST_ACTIVE') || Date.now());
            const diffMs = Date.now() - lastActiveTime;
            const diffDays = Math.floor(diffMs / 86400000);
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            let timeAgo = 'há pouco tempo';
            if (diffDays > 0) {
                timeAgo = `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
            } else if (diffHrs > 0) {
                timeAgo = `há ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
            } else if (diffMins > 0) {
                timeAgo = `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
            }

            let lastPlay = "Os jogadores se preparam para desbravar perigos desconhecidos.";
            if (stats.journalEntries && stats.journalEntries.length > 0) {
                const lastEntry = stats.journalEntries.slice().reverse().find(e => e.type !== 'info' && e.content);
                if (lastEntry) {
                    lastPlay = lastEntry.content;
                } else {
                    lastPlay = stats.journalEntries[stats.journalEntries.length - 1].content;
                }
            } else if (stats.sessionNotes) {
                lastPlay = stats.sessionNotes.split('.').filter(Boolean)[0] + '.';
            }
            if (lastPlay.length > 150) {
                lastPlay = lastPlay.substring(0, 147) + '...';
            }

            return `
            <div class="legacy-sheet-container" style="animation: fadeIn 0.6s ease-out;">
                <div id="main-panel"></div>

                <!-- BLOCO SUPERIOR (Mesa do Mestre Status) -->
                <div style="background: rgba(10, 12, 16, 0.7); border: 1px solid rgba(197, 160, 89, 0.25); border-radius: 16px; padding: 20px 30px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); position: relative; overflow: hidden;">
                    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to bottom, #c5a059, #991b1b);"></div>
                    <div>
                        <h2 style="font-family:'Cinzel'; font-size:1.4rem; margin:0; letter-spacing: 2px; color: #fff;">[MESA DO MESTRE]</h2>
                        <div style="display: flex; gap: 20px; margin-top: 6px; font-size: 0.8rem; color: var(--text-dim);">
                            <span>Mestre: <strong style="color: var(--accent);">${masterName}</strong></span>
                            <span>ID: <strong style="color: #fff; font-family: 'JetBrains Mono', monospace;">${internalId}</strong></span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); padding: 6px 14px; border-radius: 20px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e; display: inline-block; animation: statusBlink 1.5s infinite;"></span>
                        <span style="font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; color: #22c55e; text-transform: uppercase;">Sincronizado</span>
                    </div>
                </div>

                <!-- BARRA DE STATUS (5 CARDS NO TOPO) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid ${combatColor};">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Status da Sessão</div>
                        <div style="font-size: 1.1rem; font-weight: 800; color: ${combatColor}; margin-top: 5px; font-family: 'Cinzel'; text-shadow: 0 0 10px ${combatColor};">${activeCombat}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--accent);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Heróis no Grimório</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 5px; font-family: 'Cinzel';">${playerCount}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--danger);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Criaturas</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 5px; font-family: 'Cinzel';">${monsterCount}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--info);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">NPCs Salvos</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 5px; font-family: 'Cinzel';">${npcCount}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--success);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Data da Sessão</div>
                        <div style="font-size: 1rem; font-weight: 800; color: #fff; margin-top: 10px; font-family: 'Cinzel';">${new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>

                <!-- CENTRO: SISTEMA INTELIGENTE DE CONTINUIDADE -->
                <div style="background: linear-gradient(135deg, rgba(15, 12, 16, 0.85) 0%, rgba(5, 5, 8, 0.95) 100%); border: 1px solid rgba(197, 160, 89, 0.35); border-radius: 20px; padding: 35px; margin-bottom: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(197,160,89,0.03); position: relative;">
                    <div style="font-family: 'Cinzel'; font-size: 1.1rem; color: var(--accent); margin-bottom: 15px; letter-spacing: 1px; border-bottom: 1px solid rgba(197, 160, 89, 0.15); padding-bottom: 10px;">
                        🔮 Portal de Continuidade Arcana
                    </div>
                    
                    <h3 style="font-family: 'Cinzel'; font-size: 1.8rem; font-weight: 700; margin: 0 0 20px 0; color: #fff;">Bem-vindo de volta, Mestre ${masterName}.</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr; gap: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                            <div>
                                <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Última Sessão</span>
                                <span style="font-family: 'Cinzel'; font-size: 1.1rem; font-weight: 800; color: var(--accent);">Sessão #${sessionNum}</span>
                            </div>
                            <div>
                                <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Mesa</span>
                                <span style="font-size: 1.1rem; font-weight: 700; color: #fff;">${stats.sessionTitle || 'A Chama de Aelthorion'} (Mesa #${activeTableId})</span>
                            </div>
                            <div>
                                <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Última Atividade</span>
                                <span style="font-size: 1.1rem; color: #fff; font-weight: 600;">${timeAgo}</span>
                            </div>
                        </div>
                        <div style="border-top: 1px dashed rgba(197, 160, 89, 0.2); padding-top: 15px; margin-top: 5px;">
                            <span style="font-size: 0.65rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Última Jogada (Resumo Narrativo)</span>
                            <p style="font-family: 'Cinzel'; font-style: italic; font-size: 0.95rem; line-height: 1.6; color: #cbd5e1; margin: 0;">"${lastPlay}"</p>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; color: var(--text-dim); font-weight: 600; letter-spacing: 0.5px;">Deseja continuar?</span>
                        <button class="btn-magic" style="width: 100%; max-width: 320px; font-size: 1rem; padding: 14px 28px; border-radius: 12px;" data-action="quickNav" data-tab="campaign">
                            <i class="fa-solid fa-play"></i> Continuar Sessão
                        </button>
                    </div>
                </div>

                <!-- FERRAMENTAS RÁPIDAS (ATALHOS) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; margin-bottom: 40px;">
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="dmshield">
                        <i class="fa-solid fa-shield-halved fa-xl" style="color: var(--accent);"></i>
                        <span>Escudo</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="worldbuilder">
                        <i class="fa-solid fa-earth-americas fa-xl" style="color: var(--accent);"></i>
                        <span>Construtor</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="herohub">
                        <i class="fa-solid fa-users fa-xl" style="color: var(--accent);"></i>
                        <span>Heróis</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="chareditor">
                        <i class="fa-solid fa-user-pen fa-xl" style="color: var(--accent);"></i>
                        <span>Editor</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="lootgen">
                        <i class="fa-solid fa-coins fa-xl" style="color: var(--accent);"></i>
                        <span>Loot</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="spellbook">
                        <i class="fa-solid fa-book-open fa-xl" style="color: var(--accent);"></i>
                        <span>Grimório</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="vaultexplorer">
                        <i class="fa-solid fa-book-skull fa-xl" style="color: var(--accent);"></i>
                        <span>Bestiário</span>
                    </button>
                </div>

                <!-- SECONDARY WIDGETS -->
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px;">
                    <!-- LEFT COLUMN -->
                    <div style="display:flex; flex-direction:column; gap:30px;">
                        <!-- ORACLE DE SESSÃO -->
                        <div id="oracle-widget" class="card glass-accent" style="padding:25px; border-left:5px solid var(--accent); border-top:1px solid rgba(197,160,89,0.3); border-right:1px solid rgba(197,160,89,0.15); border-bottom:1px solid rgba(197,160,89,0.15); box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <div>
                                    <h3 style="font-family:'Cinzel'; font-size:1.1rem; margin:0; color:var(--accent); text-shadow:0 0 8px rgba(197,160,89,0.3);">🔮 Oráculo de Sessão</h3>
                                    <p style="font-size:0.7rem; color:var(--text-dim); margin:4px 0 0 0;">Gere um gancho narrativo para iniciar sua sessão com impacto.</p>
                                </div>
                                <button class="btn btn-primary btn-sm" data-action="generateOracleHook" id="oracle-btn">
                                    <i class="fa-solid fa-wand-sparkles"></i> Inspirar
                                </button>
                            </div>
                            <div id="oracle-result" style="font-family:'Cinzel'; font-size:0.9rem; font-style:italic; line-height:1.7; color:var(--text-main); min-height:40px; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                                ${stats._oracleHook || '<span style="opacity:0.4; color:var(--text-dim);">Clique em "Inspirar" para gerar um gancho narrativo personalizado para sua sessão...</span>'}
                            </div>
                            ${stats._oracleHook ? `
                            <div style="display:flex; gap:8px; margin-top:12px;">
                                <button class="btn btn-ghost btn-sm" data-action="saveOracleToJournal" style="font-size:0.65rem;">
                                    <i class="fa-solid fa-book"></i> Salvar no Diário
                                </button>
                                <button class="btn btn-ghost btn-sm" data-action="generateOracleHook" style="font-size:0.65rem;">
                                    <i class="fa-solid fa-rotate"></i> Novo Gancho
                                </button>
                            </div>` : ''}
                        </div>

                        <!-- HISTÓRICO DE PARTIDAS -->
                        <div class="card glass-accent" style="padding:30px; border-radius:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px;">
                                <h3 style="font-family:'Cinzel'; font-size:1.1rem; margin:0; color:var(--accent);">📜 HISTÓRICO DE PARTIDAS</h3>
                                <span style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em;">Acesso restrito</span>
                            </div>
                            <div class="match-history-teaser">
                                <div class="teaser-count">${matchSummary.total}</div>
                                <p style="font-size:0.7rem; color:var(--text-dim); margin:8px 0 4px; text-transform:uppercase; letter-spacing:0.1em;">Partidas registradas</p>
                                <p style="font-size:0.8rem; color:var(--text-main); margin:0 0 16px;">
                                    Ativa: <strong style="color:var(--accent);">${matchSummary.activeName}</strong>
                                </p>
                                <button class="btn btn-primary btn-block" data-action="openMatchHistory" style="font-family:'Cinzel'; letter-spacing:0.06em;">
                                    <i class="fa-solid fa-clock-rotate-left"></i> Abrir Histórico Completo
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div style="display:flex; flex-direction:column; gap:30px;">
                        <!-- MINI COMBAT MONITOR -->
                        <div class="card glass-accent" style="padding:25px; border-radius:12px; border-top:4px solid var(--accent); box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                            <h3 style="font-family:'Cinzel'; text-align:center; margin-bottom:15px; color:var(--accent); letter-spacing:1px;">MONITOR DE INICIATIVA</h3>
                            ${stats.combatActive ? this._renderCombatMiniPreview() : `<p style="text-align:center; opacity:0.5; padding:20px; color:var(--text-dim);">Nenhum combate ativo.</p>`}
                            <button class="btn btn-primary btn-block" style="margin-top:20px;" data-action="quickNav" data-tab="combat">ACESSAR ARENA</button>
                        </div>
                        
                        <!-- QUICK STATS SUMMARY FOI MOVIDO PARA O TOPO -->
                    </div>
                </div>
            </div>
            
            ${this._showSnapshots ? this._renderSnapshotModal() : ''}
            ${this._showMatchHistory ? this._renderMatchHistoryModal() : ''}
        `;
    }

    _renderSnapshotModal() {
        const snapshots = TOME.persistence.getSnapshots();
        return `
            <div class="modal-overlay animate-fadeIn dashboard-root" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:3000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.dashboard-root').__component.closeSnapshots()">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:1.5px solid var(--accent); background:var(--bg-surface); color:var(--text-main); box-shadow: 0 20px 50px rgba(0,0,0,0.8);" onclick="event.stopPropagation()">
                    <h3 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:15px; text-align:center; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:10px; text-shadow:0 0 10px rgba(197,160,89,0.3);">🛡️ Pontos de Restauração</h3>
                    <p style="font-size:0.75rem; text-align:center; opacity:0.7; margin-bottom:20px; color:var(--text-dim);">Recupere estados anteriores da sua campanha em caso de erro.</p>
                    
                    <button class="btn btn-primary btn-block" style="margin-bottom:20px;" data-action="createNewSnapshot">Criar Novo Snapshot Agora</button>

                    <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto; padding-right:5px;">
                        ${snapshots.map(s => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                                <div>
                                    <div style="font-weight:700; font-size:0.85rem; color:#fff;">${s.label}</div>
                                    <div style="font-size:0.6rem; opacity:0.5; color:var(--text-dim);">${s.timestamp}</div>
                                </div>
                                <button class="btn btn-ghost btn-sm" data-action="restoreSnapshot" data-id="${s.id}">Restaurar</button>
                            </div>
                        `).join('') || `<p style="text-align:center; opacity:0.4; font-size:0.7rem; color:var(--text-dim);">Nenhum snapshot encontrado.</p>`}
                    </div>

                    <button class="btn btn-ghost btn-block" style="margin-top:20px;" data-action="closeSnapshots">Fechar</button>
                </div>
            </div>
        `;
    }

    _renderCombatMiniPreview() {
        const combatants = (this.store.state.initiativeOrder || []).slice(0, 4);
        return `
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${combatants.map(c => `
                    <div style="display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div style="font-weight:900; font-family:'Cinzel'; color:var(--danger); text-shadow:0 0 5px rgba(231,76,60,0.5);">${c.initiative || 0}</div>
                        <div style="flex:1; font-weight:700; font-size:0.85rem; color:#fff;">${c.name}</div>
                        <div style="font-size:0.7rem; color:var(--text-dim); font-weight:800;">${c.hp?.current ?? c.hp_current ?? 0}/${c.hp?.max ?? c.hp_max ?? 0} HP</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    openSnapshotManager() { this._showSnapshots = true; this.render(); }
    closeSnapshots() { this._showSnapshots = false; this.render(); }

    openMatchHistory() {
        MatchHistoryService.updateCurrent(this.store.state, TOME.persistence?.filename);
        this._showMatchHistory = true;
        this.render();
    }

    closeMatchHistory() {
        this._showMatchHistory = false;
        this.render();
    }

    async loadMatchFromHistory(e, el) {
        const file = el.dataset.file;
        if (!file) return;
        if (!confirm('Carregar esta partida? O estado atual será substituído pelo arquivo salvo.')) return;

        const { Toast } = await import('../components/Toast.js');
        Toast.show('Carregando partida...', 'info');
        await TOME.persistence.switchSession(file);
        MatchHistoryService.touchSession(file, this.store.state);
        this._showMatchHistory = false;
        Toast.show('Partida carregada!', 'success');
        this.render();
    }

    removeMatchFromHistory(e, el) {
        e.stopPropagation();
        const file = el.dataset.file;
        if (!file) return;
        if (!confirm('Remover esta partida do histórico? (O arquivo JSON não será apagado do disco.)')) return;

        MatchHistoryService.remove(file);
        import('../components/Toast.js').then(m => m.Toast.show('Partida removida do histórico.', 'success'));
        this.render();
    }

    _renderMatchHistoryModal() {
        const activeFile = MatchHistoryService.getActiveFile();
        const entries = MatchHistoryService.getAll();

        return `
            <motionless class="match-history-overlay animate-fadeIn dashboard-root" data-action="closeMatchHistoryOverlay">
                <motionless class="match-history-panel animate-scaleIn" onclick="event.stopPropagation()">
                    <header class="match-history-header">
                        <h2><i class="fa-solid fa-clock-rotate-left"></i> Histórico de Partidas</h2>
                        <p>Campanhas e sessões criadas no DOMÍNIO RPG — consulta exclusiva desta janela.</p>
                    </header>

                    <motionless class="match-history-list">
                        ${entries.length === 0 ? `<p style="text-align:center; opacity:0.5; padding:40px; color:var(--text-dim);">Nenhuma partida registrada ainda.<br><small>Crie uma nova sessão em Campanha.</small></p>` : entries.map(entry => {
                            const isActive = entry.file === activeFile;
                            const status = entry.combatActive ? 'Em combate' : 'Exploração';
                            return `
                                <article class="match-history-item ${isActive ? 'is-active' : ''}">
                                    <motionless>
                                        <h4>${entry.name}${isActive ? '<span class="match-history-badge-active">Ativa</span>' : ''}</h4>
                                        <motionless class="match-history-meta">
                                            <div><strong>Criada:</strong> ${MatchHistoryService.formatCreated(entry)}</motionless>
                                            <div><strong>Último acesso:</strong> ${MatchHistoryService.formatLastPlayed(entry)}</motionless>
                                            <div><strong>Heróis:</strong> ${entry.heroCount} · <strong>Diário:</strong> ${entry.journalCount} · <strong>Rodadas:</strong> ${entry.combatRounds} · ${status}</motionless>
                                            ${entry.sessionTitle ? `<div><strong>Título:</strong> ${entry.sessionTitle}</motionless>` : ''}
                                        </motionless>
                                    </motionless>
                                    <motionless class="match-history-actions">
                                        ${!isActive ? `<button class="btn btn-primary btn-sm btn-block" data-action="loadMatchFromHistory" data-file="${entry.file}">Carregar</button>` : '<span style="font-size:0.65rem;color:var(--accent);text-align:center;">Em uso</span>'}
                                        <button class="btn btn-ghost btn-sm btn-block" data-action="removeMatchFromHistory" data-file="${entry.file}" style="color:var(--danger);">Remover</button>
                                    </motionless>
                                </article>
                            `;
                        }).join('')}
                    </motionless>

                    <footer class="match-history-footer">
                        <button class="btn btn-ghost" data-action="quickNav" data-tab="campaign">
                            <i class="fa-solid fa-folder-plus"></i> Gerenciar Campanhas
                        </button>
                        <button class="btn btn-primary" data-action="closeMatchHistory">Fechar</button>
                    </footer>
                </motionless>
            </motionless>
        `.replace(/motionless/g, 'div');
    }

    createNewSnapshot() {
        const label = prompt("Dê um nome para este Snapshot:", "Manual " + new Date().toLocaleTimeString());
        if (label) {
            TOME.persistence.createSnapshot(label);
            this.render();
        }
    }

    async generateOracleHook() {
        const btn = this.element.querySelector('#oracle-btn');
        const result = this.element.querySelector('#oracle-result');
        if (!btn || !result) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Consultando...';
        
        try {
            const stats = TOME.store.snapshot();
            const heroData = (stats.players || []).map(p => `${p.name} (Nível ${p.level || 1} ${p.class || ''})`).join(', ');
            const system = localStorage.getItem('DM_SYSTEM') || 'D&D 5e';
            const campaignName = stats.sessionTitle || 'Campanha';
            const status = stats.combatActive ? 'Em Combate' : 'Exploração';
            
            const prompt = `Gere um gancho narrativo dramático e personalizado para iniciar uma sessão de RPG. 
            Sistema: ${system}. Campanha: ${campaignName}. 
            Status atual: ${status}. 
            Heróis presentes: ${heroData || 'Nenhum herói registrado'}. 
            O gancho deve ser direto, imersivo e criativo. Faça algo único focado nos heróis citados.`;
            
            const hook = await TOME.ai.ask(prompt);
            TOME.store.update(s => s._oracleHook = hook);
        } catch (err) {
            import('../components/Toast.js').then(m => m.Toast.show('O Oráculo está em silêncio...', 'danger'));
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-wand-sparkles"></i> Inspirar';
        }
    }

    saveOracleToJournal() {
        const hook = this.store.state._oracleHook;
        if (!hook) return;

        TOME.store.update(s => {
            if (!s.journalEntries) s.journalEntries = [];
            s.journalEntries.push({
                id: Date.now(),
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('pt-BR'),
                type: 'oracle',
                content: `🔮 GANCHO DO ORÁCULO: ${hook}`
            });
        });
        import('../components/Toast.js').then(m => m.Toast.show('Gancho salvo no Diário!', 'success'));
    }

    restoreSnapshot(id) {
        if (confirm("ATENÇÃO: Isso substituirá todos os dados atuais (Heróis, Mapas, Diário) pelo estado deste backup. Continuar?")) {
            if (TOME.persistence.restoreSnapshot(parseInt(id))) {
                import('../components/Toast.js').then(m => m.Toast.show('Estado restaurado com sucesso!', 'success'));
                this.closeSnapshots();
            }
        }
    }

    showCreaturesModal() {
        const monsters = this.store.state.monsters || [];
        
        const existing = document.getElementById('manage-dashboard-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'manage-dashboard-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `;

        modal.innerHTML = `
            <div class="card glass-accent" style="max-width:500px; width:90%; padding:30px; border-radius:18px; border:2px solid rgba(197,160,89,0.35); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align:left;">
                <h3 style="font-family:'Cinzel', serif; font-size:1.4rem; color:var(--accent); border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:12px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-dragon" style="color:var(--danger);"></i> Criaturas da Sessão
                </h3>
                
                <div id="modal-list-container" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px; scrollbar-width:thin;">
                    ${monsters.map(m => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; transition: all 0.2s;">
                            <div>
                                <strong style="font-family:'Cinzel'; font-size:0.85rem; color:#fff; display:block;">${m.name}</strong>
                                <span style="font-size:0.7rem; color:var(--text-dim); display:flex; align-items:center; gap:6px; margin-top:2px;">
                                    <i class="fa-solid fa-heart" style="color:var(--danger); font-size:0.6rem;"></i> HP: ${m.hp?.current || m.hp_current || 0} / ${m.hp?.max || m.hp_max || 0}
                                </span>
                            </div>
                            <button class="btn btn-ghost btn-sm delete-btn" data-id="${m.id}" style="color:var(--danger); border-color:rgba(231,76,60,0.25); border-radius:6px; padding:6px 10px;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `).join('') || `<p style="text-align:center; opacity:0.4; font-size:0.8rem; padding:20px; color:var(--text-dim);">Nenhuma criatura ativa no campo de batalha.</p>`}
                </div>

                <div style="margin-top:25px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-ghost close-btn" style="border-radius:8px; font-weight:800; padding:8px 20px;">Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this._deleteCreature(id);
                this.showCreaturesModal();
            });
        });
    }

    _deleteCreature(id) {
        TOME.store.update(s => {
            s.monsters = (s.monsters || []).filter(m => String(m.id) !== String(id));
            if (s.initiativeOrder) {
                s.initiativeOrder = s.initiativeOrder.filter(c => String(c.id) !== String(id));
            }
        });
        import('../components/Toast.js').then(m => m.Toast.show('Criatura deletada com sucesso!', 'success'));
        this.render();
    }

    showNPCsModal() {
        const npcs = this.store.state.savedNPCs || [];
        
        const existing = document.getElementById('manage-dashboard-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'manage-dashboard-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `;

        modal.innerHTML = `
            <div class="card glass-accent" style="max-width:500px; width:90%; padding:30px; border-radius:18px; border:2px solid rgba(197,160,89,0.35); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align:left;">
                <h3 style="font-family:'Cinzel', serif; font-size:1.4rem; color:var(--accent); border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:12px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-user-tie" style="color:var(--accent);"></i> NPCs Salvos
                </h3>
                
                <div id="modal-list-container" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px; scrollbar-width:thin;">
                    ${npcs.map(n => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; transition: all 0.2s;">
                            <div>
                                <strong style="font-family:'Cinzel'; font-size:0.85rem; color:#fff; display:block;">${n.name}</strong>
                                <span style="font-size:0.7rem; color:var(--text-dim); display:block; margin-top:2px;">
                                    ${n.role || n.occupation || 'Personalidade sem cargo'}
                                </span>
                            </div>
                            <button class="btn btn-ghost btn-sm delete-btn" data-id="${n.id}" style="color:var(--danger); border-color:rgba(231,76,60,0.25); border-radius:6px; padding:6px 10px;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `).join('') || `<p style="text-align:center; opacity:0.4; font-size:0.8rem; padding:20px; color:var(--text-dim);">Nenhum NPC salvo nesta sessão.</p>`}
                </div>

                <div style="margin-top:25px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-ghost close-btn" style="border-radius:8px; font-weight:800; padding:8px 20px;">Fechar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bind events
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        modal.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this._deleteNPC(id);
                this.showNPCsModal();
            });
        });
    }

    _deleteNPC(id) {
        TOME.store.update(s => {
            s.savedNPCs = (s.savedNPCs || []).filter(n => String(n.id) !== String(id));
        });
        import('../components/Toast.js').then(m => m.Toast.show('NPC deletado com sucesso!', 'success'));
        this.render();
    }

    _bindHomeActions(target) {
        target.__component = this;
        const rootModal = target.querySelector('.dashboard-root');
        if (rootModal) rootModal.__component = this;

        target.querySelectorAll('[data-action="quickNav"]').forEach(el => {
            el.onclick = () => {
                this._showMatchHistory = false;
                TOME.store.update(s => s.activeTab = el.dataset.tab);
            };
        });
        target.querySelectorAll('[data-action="openSnapshotManager"]').forEach(el => el.onclick = () => this.openSnapshotManager());
        target.querySelectorAll('[data-action="closeSnapshots"]').forEach(el => el.onclick = () => this.closeSnapshots());
        target.querySelectorAll('[data-action="createNewSnapshot"]').forEach(el => el.onclick = () => this.createNewSnapshot());
        target.querySelectorAll('[data-action="restoreSnapshot"]').forEach(el => {
            el.onclick = () => this.restoreSnapshot(el.dataset.id);
        });
        target.querySelectorAll('[data-action="generateOracleHook"]').forEach(el => el.onclick = () => this.generateOracleHook());
        target.querySelectorAll('[data-action="saveOracleToJournal"]').forEach(el => el.onclick = () => this.saveOracleToJournal());
        
        target.querySelectorAll('[data-action="openMatchHistory"]').forEach(el => el.onclick = () => this.openMatchHistory());
        target.querySelectorAll('[data-action="closeMatchHistory"]').forEach(el => el.onclick = () => this.closeMatchHistory());
        target.querySelectorAll('[data-action="closeMatchHistoryOverlay"]').forEach(el => el.onclick = (e) => { if (e.target === el) this.closeMatchHistory(); });
        target.querySelectorAll('[data-action="loadMatchFromHistory"]').forEach(el => el.onclick = (e) => this.loadMatchFromHistory(e, el));
        target.querySelectorAll('[data-action="removeMatchFromHistory"]').forEach(el => el.onclick = (e) => this.removeMatchFromHistory(e, el));

        target.querySelectorAll('[data-action="openManageCreaturesModal"]').forEach(el => el.onclick = () => this.showCreaturesModal());
        target.querySelectorAll('[data-action="openManageNPCsModal"]').forEach(el => el.onclick = () => this.showNPCsModal());
        target.querySelectorAll('[data-action="createNewTable"]').forEach(el => el.onclick = () => this.createNewTable());
    }

    async createNewTable() {
        const name = prompt('Digite o nome da nova mesa de campanha:');
        if (!name || !name.trim()) return;
        const phone = localStorage.getItem('DM_PHONE') || '';
        try {
            const newTable = await PersistenceService.createTable(phone);
            localStorage.setItem('DM_ACTIVE_TABLE', newTable.id);
            localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${newTable.id}.json`);
            
            await TOME.persistence.switchSession(`mesa_${newTable.id}.json`);
            
            TOME.store.update(s => {
                s.sessionTitle = name.trim();
            });
            await TOME.persistence.save();
            
            import('../components/Toast.js').then(m => m.Toast.show(`Mesa #${newTable.id} "${name}" criada com sucesso!`, 'success'));
            this.render();
        } catch (err) {
            alert('Erro ao criar mesa: ' + err.message);
        }
    }
}