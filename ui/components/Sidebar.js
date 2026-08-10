import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { PersistenceService } from '../../services/PersistenceService.js';

/**
 * SIDEBAR v15.0
 * Clean, minimalist navigation panel.
 */
export class Sidebar extends Component {
    template() {
        const { activeTab } = this.store.state;

        const items = [
            { id: 'dmtable',       label: 'Mesa do Mestre',        icon: 'fa-table-cells-large' },
            { id: 'dashboard',     label: 'Painel de Controle',    icon: 'fa-shield-halved' },
            { id: 'dmshield',      label: 'Escudo do Mestre',      icon: 'fa-scroll' },
            { id: 'combat',        label: 'Combate Tatico',        icon: 'fa-crosshairs' },
            { id: 'initiative',    label: 'Monitor de Iniciativa', icon: 'fa-swords' },
            { id: 'quest',         label: 'Gerenciador de Quests', icon: 'fa-hat-wizard' },
            { id: 'journal',       label: 'Diario de Sessao',      icon: 'fa-book-open-reader' },
            { id: 'npc',           label: 'Gerador de NPCs',       icon: 'fa-user-secret' },
            { id: 'herohub',       label: 'Monitor de Herois',     icon: 'fa-users' },
            { id: 'tomesinal',     label: 'Elo Arcano',            icon: 'fa-satellite-dish' },
            { id: 'cardgenerator', label: 'Gerador de Cartas',     icon: 'fa-address-card' },
            { id: 'bestiary',      label: 'Bestiario',             icon: 'fa-dragon' },
            { id: 'loot',          label: 'Gerador de Loot',       icon: 'fa-coins' },
            { id: 'settings',      label: 'Glossario de Regras',   icon: 'fa-book' }
        ];

        return `
            <style>
                /* ── Sidebar Minimalista v15.0 ("Modern Epic") ── */
                .sidebar {
                    display: flex;
                    flex-direction: column;
                    width: var(--sidebar-w, 265px);
                    height: 100vh;
                    background: #08090d !important;
                    border-right: 1px solid rgba(197, 160, 89, 0.12);
                    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.65);
                    overflow: hidden;
                    flex-shrink: 0;
                    z-index: 100;
                }

                /* Cabeçalho */
                .sm-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 18px 16px;
                    border-bottom: 1px solid rgba(197, 160, 89, 0.1);
                    background: #0a0c12 !important;
                    flex-shrink: 0;
                }
                .sm-header-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(15, 17, 26, 0.8) 100%);
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #d4af37;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }
                .sm-header-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }
                .sm-title {
                    font-family: 'Cinzel', serif;
                    font-size: 0.92rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: 0.05em;
                }
                .sm-badge {
                    font-size: 0.58rem;
                    color: #d4af37;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    font-weight: 700;
                    opacity: 0.9;
                }

                /* Nav */
                .sm-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .sm-nav::-webkit-scrollbar { width: 4px; }
                .sm-nav::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 4px; }

                .sm-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 9px 12px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    background: none;
                    color: #94a3b8;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.81rem;
                    font-weight: 500;
                    text-align: left;
                    width: 100%;
                    transition: color 0.18s, background 0.18s, border-color 0.18s, transform 0.18s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .sm-item i {
                    font-size: 0.82rem;
                    width: 16px;
                    text-align: center;
                    flex-shrink: 0;
                    opacity: 0.7;
                    transition: opacity 0.18s, color 0.18s, transform 0.18s;
                }
                .sm-item:hover {
                    background: rgba(255, 255, 255, 0.035);
                    color: #f8fafc;
                    border-color: rgba(255, 255, 255, 0.06);
                    transform: translateX(2px);
                }
                .sm-item:hover i { opacity: 1; color: #d4af37; }
                .sm-item.active {
                    background: linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 100%);
                    color: #f3e5ab;
                    border-color: rgba(212, 175, 55, 0.25);
                    font-weight: 600;
                    box-shadow: inset 3px 0 0 #d4af37;
                }
                .sm-item.active i { opacity: 1; color: #d4af37; filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.4)); }

                /* Separador */
                .sm-sep {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.15), transparent);
                    margin: 8px 4px;
                }

                /* Footer */
                .sm-footer {
                    padding: 12px 10px;
                    border-top: 1px solid rgba(197, 160, 89, 0.1);
                    background: #0a0c12 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    flex-shrink: 0;
                }
                .sm-footer-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 11px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    background: none;
                    color: #64748b;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.76rem;
                    font-weight: 500;
                    text-align: left;
                    width: 100%;
                    transition: all 0.18s ease;
                }
                .sm-footer-btn i {
                    font-size: 0.75rem;
                    width: 15px;
                    text-align: center;
                    flex-shrink: 0;
                }
                .sm-footer-btn:hover {
                    background: rgba(255, 255, 255, 0.04);
                    color: #cbd5e1;
                }
                .sm-footer-btn.danger {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.06);
                    border-color: rgba(239, 68, 68, 0.15);
                    font-weight: 600;
                }
                .sm-footer-btn.danger:hover {
                    background: rgba(239, 68, 68, 0.12);
                    color: #f87171;
                    box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
                }
                .sm-footer-btn.gold {
                    color: #d4af37;
                    background: rgba(212, 175, 55, 0.07);
                    border-color: rgba(212, 175, 55, 0.2);
                    font-weight: 600;
                }
                .sm-footer-btn.gold:hover {
                    background: rgba(212, 175, 55, 0.14);
                    color: #f3e5ab;
                    box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
                }

                /* Status */
                .sm-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px 2px;
                }
                .sm-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #22c55e;
                    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
                    flex-shrink: 0;
                }
                .sm-status-label {
                    font-size: 0.62rem;
                    color: #475569;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                /* Botões de ação lado a lado */
                .sm-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                }
            </style>

            <!-- Cabeçalho -->
            <div class="sm-header">
                <div class="sm-header-icon">
                    <i class="fa-solid fa-dice-d20"></i>
                </div>
                <div class="sm-header-text">
                    <span class="sm-title">Mesa do Mestre</span>
                    <span class="sm-badge">V18.5</span>
                </div>
            </div>

            <!-- Navegação principal -->
            <nav class="sm-nav">
                <button class="sm-item ${activeTab === 'campaign' ? 'active' : ''}"
                        data-action="navigate" data-tab="campaign">
                    <i class="fa-solid fa-users-viewfinder"></i>
                    <span>Gestão de Campanha</span>
                </button>

                <div class="sm-sep"></div>

                ${items.map(i => `
                    <button class="sm-item ${activeTab === i.id ? 'active' : ''}"
                            data-action="navigate" data-tab="${i.id}">
                        <i class="fa-solid ${i.icon}"></i>
                        <span>${i.label}</span>
                    </button>
                `).join('')}
            </nav>

            <!-- Rodapé com ações -->
            <div class="sm-footer">
                <div class="sm-row">
                    <button class="sm-footer-btn" data-action="exportCampaign">
                        <i class="fa-solid fa-file-export"></i> Exportar
                    </button>
                    <button class="sm-footer-btn" data-action="importCampaign">
                        <i class="fa-solid fa-file-import"></i> Importar
                    </button>
                </div>

                <button class="sm-footer-btn" onclick="window.location.href='/index.html?reset=1'">
                    <i class="fa-solid fa-broom"></i> Limpar Cache
                </button>

                <button class="sm-footer-btn gold" data-action="openTolkienSummon">
                    <i class="fa-solid fa-dragon"></i> Invocação de Tolkien
                </button>

                <button class="sm-footer-btn danger" data-action="finishSession">
                    <i class="fa-solid fa-flag-checkered"></i> Finalizar Sessão
                </button>

                <div class="sm-status">
                    <div class="sm-status-dot"></div>
                    <span class="sm-status-label">Sistema Ativo</span>
                </div>
            </div>
        `;
    }

    async finishSession() {
        const stats = TOME.store.state;
        const activeFileName = TOME.persistence?.filename || 'state.json';
        let sessionList = [];
        try {
            const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || '';
            const key = activeTable ? `TOME_SESSION_LIST_${activeTable}` : 'TOME_SESSION_LIST';
            sessionList = JSON.parse(localStorage.getItem(key) || '[]');
        } catch(e){}
        const currentSession = sessionList.find(s => s.file === activeFileName);
        const sessionName = currentSession ? currentSession.name : 'Mesa Padrão';
        
        let sessionNum = 1;
        if (stats.journalEntries && stats.journalEntries.length > 0) {
            sessionNum = stats.journalEntries.length;
        }
        
        const startTime = parseInt(localStorage.getItem('DM_SESSION_START') || Date.now());
        const diffMs = Date.now() - startTime;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const durationStr = `${diffHrs}h ${diffMins}m`;
        const today = new Date().toLocaleDateString('pt-BR');
        
        const masterName = localStorage.getItem('DM_MASTER_NAME') || 'Mestre';
        const internalId = localStorage.getItem('DM_INTERNAL_ID') || 'DGH-MST-8F2A91';
        const activeTableId = localStorage.getItem('DM_ACTIVE_TABLE') || 'Sem Mesa';
        
        const playersList = stats.players ? stats.players.map(p => p.name) : [];
        const eventsList = stats.journalEntries ? stats.journalEntries.map(e => e.content || e.title || '') : [];
        const lootList = stats.sessionLoot ? stats.sessionLoot.split('\n').map(i => i.trim()).filter(Boolean) : [];
        const summaryText = stats._aiCronicle || stats.sessionNotes || "Nenhum resumo narrativo registrado.";

        const technicalJSON = {
            session_id: `SES-${String(sessionNum).padStart(3, '0')}`,
            mesa: sessionName,
            mestre: masterName,
            inicio: new Date(startTime).toLocaleString('pt-BR'),
            fim: new Date().toLocaleString('pt-BR'),
            jogadores: playersList,
            eventos: eventsList,
            xp_distribuido: stats.xpDistributed || 0,
            itens_obtidos: lootList,
            resumo: summaryText
        };

        const existing = document.getElementById('close-session-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'close-session-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            box-sizing: border-box;
        `;

        modal.innerHTML = `
            <div class="card glass-accent" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 30px; border-radius: 18px; border: 2px solid rgba(197, 160, 89, 0.35); background: rgba(10,12,16,0.98); box-shadow: 0 20px 50px rgba(0,0,0,0.9); text-align: left; display: flex; flex-direction: column; gap: 20px;">
                
                <div style="border-bottom: 1.5px solid rgba(197, 160, 89, 0.25); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.65rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Cinzel';">Fechamento do Grimório</span>
                        <h3 style="margin: 5px 0 0; font-family: 'Cinzel', serif; font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                            🏁 Portal de Encerramento da Sessão
                        </h3>
                    </div>
                    <button class="btn btn-ghost close-btn" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; overflow-y: auto; max-height: 50vh;">
                    
                    <div style="border: 1px solid rgba(197, 160, 89, 0.2); padding: 15px; border-radius: 10px; background: rgba(0,0,0,0.25); overflow-y: auto;">
                        <h4 style="font-family: 'Cinzel'; font-size: 0.95rem; color: var(--accent); margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">📖 Relatório Narrativo (Preview)</h4>
                        <div style="font-size: 0.8rem; line-height: 1.6; display: flex; flex-direction: column; gap: 10px;">
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Título:</strong>
                                <span>${stats.sessionTitle || 'Aventura de ' + today}</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Mesa:</strong>
                                <span>${sessionName}</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Duração:</strong>
                                <span>${durationStr} (Encerrado em ${today})</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Heróis Ativos:</strong>
                                <span style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-top: 2px;">
                                    ${playersList.length > 0 ? playersList.join(', ') : 'Nenhum jogador ativo'}
                                </span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">XP Distribuído:</strong>
                                <span style="color: var(--success); font-weight: bold;">+${stats.xpDistributed || 0} XP</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Tesouros Obtidos:</strong>
                                <span style="display: block; font-size: 0.75rem; color: #cbd5e1; font-style: italic; margin-top: 2px;">
                                    ${lootList.length > 0 ? lootList.join(' • ') : 'Nenhum item especial.'}
                                </span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Crônica do Bardo:</strong>
                                <p style="font-size: 0.75rem; font-style: italic; color: #cbd5e1; margin: 4px 0 0 0; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); max-height: 120px; overflow-y: auto;">
                                    ${summaryText}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style="border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 10px; background: rgba(5,5,8,0.6); display: flex; flex-direction: column;">
                        <h4 style="font-family: 'Cinzel'; font-size: 0.95rem; color: var(--accent); margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">⚙️ JSON Técnico</h4>
                        <textarea readonly style="flex: 1; min-height: 200px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; background: rgba(0,0,0,0.4); color: #22c55e; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px; resize: none; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">${JSON.stringify(technicalJSON, null, 2)}</textarea>
                    </div>

                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-ghost cancel-btn" style="border-radius: 8px; font-weight: 700; font-family: 'Cinzel'; font-size: 0.75rem;">Voltar ao Jogo</button>
                    
                    <button class="btn btn-premium print-pdf-btn" style="border-radius: 8px; font-weight: 800; font-family: 'Cinzel'; font-size: 0.75rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-file-pdf"></i> Imprimir PDF
                    </button>
                    
                    <button class="btn btn-premium download-json-btn" style="border-radius: 8px; font-weight: 800; font-family: 'Cinzel'; font-size: 0.75rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-download"></i> Baixar JSON
                    </button>
                    
                    <button class="btn btn-primary finalize-btn" style="background: linear-gradient(135deg, #7f1d1d, #c5a059); border-color: transparent; border-radius: 8px; font-weight: 800; font-family: 'Cinzel'; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(153, 27, 27, 0.45);">
                        <i class="fa-solid fa-flag-checkered"></i> Encerrar e Sair
                    </button>
                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        modal.querySelector('.close-btn').onclick = closeModal;
        modal.querySelector('.cancel-btn').onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.querySelector('.print-pdf-btn').onclick = () => {
            const printTarget = document.createElement('div');
            printTarget.className = 'dnd-report-template';
            printTarget.style.cssText = 'background: #ffffff; color: #000000; padding: 40px;';
            printTarget.innerHTML = `
                <div style="text-align:center; border-bottom:3px double #000; padding-bottom:20px; margin-bottom:30px; font-family: 'Cinzel', serif;">
                    <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px;">Relatório Oficial de Aventura</span>
                    <h1 style="font-size:28px; font-weight:900; margin:10px 0 5px; text-transform:uppercase;">${stats.sessionTitle || 'Aventura de ' + today}</h1>
                    <span style="font-size:11px; color:#555; font-weight:700;">Data: ${today} • Mestre: ${masterName} (${internalId}) • Mesa: ${sessionName}</span>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-bottom:30px; font-family: 'Outfit', sans-serif;">
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; text-transform:uppercase; font-size:12px;">👥 Heróis Ativos</strong>
                        <ul style="margin:0; padding-left:20px; font-size:11px; line-height:1.6;">
                            ${playersList.map(p => `<li><strong>${p}</strong></li>`).join('') || '<li>Nenhum herói ativo.</li>'}
                        </ul>
                    </div>
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; text-transform:uppercase; font-size:12px;">⚔️ Status do Encontro</strong>
                        <div style="font-size:11px; line-height:1.8;">
                            <div>XP Distribuído na Sessão: <strong>+${stats.xpDistributed || 0} XP</strong></div>
                            <div>Duração da Sessão: <strong>${durationStr}</strong></div>
                        </div>
                    </div>
                </div>
                <div style="border:1.5px solid #000; padding:20px; border-radius:8px; background:#fffcf5; margin-bottom:35px; font-family: 'Outfit', sans-serif;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; text-transform:uppercase; color:#8b1e0f; font-size:13px;">📖 Crônica Narrativa</strong>
                    <p style="font-size:11px; line-height:1.8; font-style:italic; margin:0; white-space:pre-wrap;">${summaryText}</p>
                </div>
                <div style="border:1.5px solid #000; padding:15px; border-radius:8px; margin-bottom:35px; font-family: 'Outfit', sans-serif;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; text-transform:uppercase; font-size:12px;">🎒 Tesouros & Itens Obtidos</strong>
                    <ul style="margin:0; padding-left:20px; font-size:11px; line-height:1.6;">
                        ${lootList.map(item => `<li>${item}</li>`).join('') || '<li>Nenhum item especial.</li>'}
                    </ul>
                </div>
                <div style="font-family: 'Outfit', sans-serif;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:15px; text-transform:uppercase; font-size:12px;">⏳ Linha do Tempo dos Acontecimentos</strong>
                    <div style="display:flex; flex-direction:column; gap:10px; padding-left:10px;">
                        ${(stats.journalEntries || []).map(e => `
                            <div style="border-left:2px solid #000; padding-left:12px; font-size:10.5px; line-height:1.5;">
                                <div style="font-weight:800; color:#555; font-size:9.5px; text-transform:uppercase;">
                                    ${new Date(e.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${e.title || 'Evento'}
                                </div>
                                <div style="color:#222; margin-top:2px;">${e.content}</div>
                            </div>
                        `).join('') || '<div style="font-size:11px; color:#555; font-style:italic;">Nenhum evento registrado.</div>'}
                    </div>
                </div>
            `;
            document.body.appendChild(printTarget);
            document.body.classList.add('print-report-mode');
            window.print();
            setTimeout(() => {
                document.body.classList.remove('print-report-mode');
                printTarget.remove();
            }, 500);
        };

        modal.querySelector('.download-json-btn').onclick = () => {
            const jsonStr = JSON.stringify(technicalJSON, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sessao_tecnica_${activeTableId || 'mesa'}_SES${sessionNum}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };

        modal.querySelector('.finalize-btn').onclick = async () => {
            if (!confirm('ATENÇÃO: Deseja fechar e arquivar permanentemente esta sessão no seu Registro Arcano?')) return;
            
            try {
                TOME.store.update(s => {
                    s.combatRound = 0;
                    s.combatActive = false;
                    s.xpDistributed = 0;
                });
                
                const list = await PersistenceService.getTablesDirectory();
                const table = list.find(t => t.id === activeTableId);
                if (table) {
                    table.sessionNum += 1;
                    await PersistenceService.saveTablesDirectory(list);
                }
                
                await TOME.persistence.save();
                closeModal();
                
                import('./Toast.js').then(m => m.Toast.show('Grimório fechado e sincronizado offline!', 'success'));
                
                localStorage.removeItem('DM_SESSION_ID');
                localStorage.removeItem('DM_SESSION_START');
                localStorage.removeItem('DM_ACTIVE_TABLE');
                localStorage.removeItem('DM_PHONE');
                localStorage.removeItem('DM_MASTER_NAME');
                localStorage.removeItem('DM_MASTER_ID');
                localStorage.removeItem('DM_INTERNAL_ID');
                localStorage.removeItem('TOME_ACTIVE_SESSION');
                
                setTimeout(() => {
                    window.location.reload();
                }, 1200);
            } catch (err) {
                alert('Erro ao fechar sessão: ' + err.message);
            }
        };
    }

    onMount() {
    }

    exportCampaign() {
        const data = JSON.stringify(this.store.state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tome_pro_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        import('./Toast.js').then(m => m.Toast.show('Campanha exportada com sucesso!')).catch(() => {});
    }

    importCampaign() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (re) => {
                try {
                    const state = JSON.parse(re.target.result);
                    TOME.store.update(s => Object.assign(s, state));
                    import('./Toast.js').then(m => m.Toast.show('Campanha importada!')).catch(() => {});
                    window.location.reload();
                } catch (err) {
                    import('./Toast.js').then(m => m.Toast.show('Erro ao importar arquivo.', 'error')).catch(() => {});
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    openTolkienSummon() {
        const existing = document.getElementById('tolkien-summon-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'tolkien-summon-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            box-sizing: border-box;
        `;

        const monsters = [
            { id: 'tolk_goblin', name: 'Goblin da Névoa', type: 'monster', hp_max: 7, ac: 15, emoji: '👺', desc: 'Pequeno humanoide furtivo e astuto que prefere atacar em emboscadas na escuridão.', size: 'small', speed: 30 },
            { id: 'tolk_orc', name: 'Orc Guerreiro', type: 'monster', hp_max: 15, ac: 13, emoji: '👹', desc: 'Criatura brutal de pele cinzenta e dentes caninos salientes, implacável no combate corporal.', size: 'medium', speed: 30 },
            { id: 'tolk_troll', name: 'Troll da Caverna', type: 'monster', hp_max: 84, ac: 15, emoji: '👾', desc: 'Gigante monstruoso dotado de regeneração acelerada, capaz de curar ferimentos graves a cada turno.', size: 'large', speed: 30 },
            { id: 'tolk_balrog', name: 'Balrog (Flagelo)', type: 'monster', hp_max: 262, ac: 19, emoji: '🔥', desc: 'Demônio ancestral de sombra e chama, envolto em aura de calor escaldante e portando chicote de fogo.', size: 'huge', speed: 40 }
        ];

        modal.innerHTML = `
            <div class="card glass" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 16px; border: 1px solid rgba(197, 160, 89, 0.4); background: rgba(10,12,16,0.96); box-shadow: 0 20px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 18px;">
                <div style="border-bottom: 1px solid rgba(197, 160, 89, 0.2); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.6rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Cinzel';">Evocação Arcana</span>
                        <h3 style="margin: 4px 0 0; font-family: 'Cinzel', serif; font-size: 1.3rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                            ⚔️ Portão de Invocação de Tolkien
                        </h3>
                    </div>
                    <button class="btn btn-ghost close-btn" style="border-radius: 50%; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <p style="font-size: 0.75rem; color: var(--text-dim); margin: 0;">Selecione um lacaio ou criatura colossal da Terra-Média para invocar no mapa tático.</p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${monsters.map(m => `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 15px; transition: all 0.2s;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 2px solid ${m.id === 'tolk_balrog' ? 'var(--danger)' : 'var(--accent)'}; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0;">
                                ${m.emoji}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <strong style="color: #fff; font-size: 0.9rem;">${m.name}</strong>
                                    <span style="font-size: 0.7rem; background: rgba(197, 160, 89, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">
                                        CA ${m.ac} • HP ${m.hp_max}
                                    </span>
                                </div>
                                <p style="font-size: 0.7rem; color: var(--text-dim); margin: 4px 0 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.desc}">${m.desc}</p>
                            </div>
                            <button class="btn btn-primary btn-sm summon-btn" data-monster='${JSON.stringify(m)}' style="font-size: 0.7rem; border-radius: 6px; padding: 6px 12px;">Invocar</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        modal.querySelector('.close-btn').onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.querySelectorAll('.summon-btn').forEach(btn => {
            btn.onclick = () => {
                const m = JSON.parse(btn.dataset.monster);
                closeModal();
                
                // 1. Não muda mais para a aba 'map', mantendo o mestre na DM Table.
                
                // 2. Cria a entidade estruturada do monstro
                let entity = {
                    id: m.id + '_' + Date.now(),
                    name: m.name,
                    hp_max: m.hp_max,
                    hp: m.hp_max, // Current HP
                    ac: m.ac,
                    emoji: m.emoji,
                    size: m.size,
                    speed: m.speed,
                    type: 'monster'
                };

                // 3. Emite o evento global de invocação para o Combat Tracker ouvir
                setTimeout(() => {
                    if (window.TOME && window.TOME.events) {
                        window.TOME.events.emit('MONSTER_INVOKED', entity);
                    }
                }, 100);
            };
        });
    }

    navigate(e, el) {
        const tab = el.dataset.tab;
        if (tab) TOME.store.update(s => s.activeTab = tab);
    }
}
