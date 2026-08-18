import { Component } from '../core/Component.js';
import { CRDTManager } from '../core/CRDTManager.js';

export class TomeSinalPanel extends Component {
    constructor(opts) {
        super(opts);
        this.masterId = 'DM_ACTIVE_MASTER';
        this.messages = {}; // charId -> array of messages
        this.eventSource = null;
        this.activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || 'Mesa-01';
        this.sessionActive = false;
        this.characterTokens = []; // { characterId, sessionToken, nome, connected }
        this.selectedCharId = null;
    }

    template() {
        const players = this.store.state.players || [];
        
        return `
            <div class="tome-sinal-pane animate-fadeIn" style="display:flex; flex-direction:column; height: 100vh; background:var(--bg-main); overflow:hidden;">
                <header style="background:var(--primary-dark); padding:20px; display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid var(--primary);">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <div style="width: 45px; height: 45px; background: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #fff; box-shadow: 0 0 15px var(--primary);">
                            <i class="fa-solid fa-satellite-dish"></i>
                        </div>
                        <div>
                            <h2 style="margin:0; font-family:'Cinzel',serif; color:#fff; font-size:1.5rem;">TOME.Sinal v2 — Sincronização por QR</h2>
                            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Módulo V14.2 — Central de Comunicações</span>
                        </div>
                    </div>
                    <div>
                        ${this.sessionActive 
                            ? `<button class="btn btn-danger" onclick="this.closest('.tome-sinal-pane').__component.encerrarSessao()"><i class="fa-solid fa-stop"></i> Encerrar Sessão Atual</button>`
                            : `<button class="btn btn-primary" onclick="this.closest('.tome-sinal-pane').__component.iniciarSessao()"><i class="fa-solid fa-play"></i> Iniciar Sessão de Hoje</button>`
                        }
                    </div>
                </header>

                <div style="display:flex; flex:1; overflow:hidden;">
                    <!-- Lista Lateral de Personagens -->
                    <div style="width: 280px; background: rgba(0,0,0,0.4); border-right: 1px solid rgba(197, 160, 89, 0.2); display: flex; flex-direction: column; overflow-y: auto;">
                        <div style="padding: 15px; font-family: 'Cinzel'; font-size: 1.1rem; color: var(--accent); border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            PERSONAGENS
                        </div>
                        <div id="character-list" style="display:flex; flex-direction:column;">
                            ${this.sessionActive ? this.renderCharacterList() : '<div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">Sessão inativa. Inicie a sessão para gerar QR Codes.</div>'}
                        </div>
                    </div>

                    <!-- Fio de Chat Privado -->
                    <div style="flex:1; display:flex; flex-direction:column; background: var(--bg-surface);">
                        ${this.selectedCharId ? this.renderChatArea() : '<div style="flex:1; display:flex; align-items:center; justify-content:center; color:var(--text-dim); font-family:Cinzel,serif; font-size:1.2rem;">Selecione um personagem ao lado para abrir o chat privado.</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    renderCharacterList() {
        return this.characterTokens.map(char => {
            const isSelected = this.selectedCharId === char.characterId;
            const statusColor = char.connected ? 'var(--success)' : 'var(--danger)';
            return `
                <div onclick="this.closest('.tome-sinal-pane').__component.selectCharacter('${char.characterId}')" 
                     style="padding: 15px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s; background: ${isSelected ? 'rgba(197, 160, 89, 0.15)' : 'transparent'}; border-left: ${isSelected ? '3px solid var(--accent)' : '3px solid transparent'};">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 5px ${statusColor};"></span>
                        <strong style="color: #fff; font-size: 0.95rem;">${char.nome}</strong>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderChatArea() {
        const char = this.characterTokens.find(c => c.characterId === this.selectedCharId);
        if (!char) return '';

        return `
            <!-- Chat Header -->
            <div style="padding: 15px 20px; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(197, 160, 89, 0.2); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: var(--accent); font-family: 'Cinzel';"><i class="fa-solid fa-shield-halved"></i> Chat: ${char.nome}</h3>
                </div>
                ${!char.connected ? `<button class="btn btn-ghost btn-sm" onclick="this.closest('.tome-sinal-pane').__component.showQRModal('${char.characterId}')"><i class="fa-solid fa-qrcode"></i> Ver QR desta Sessão</button>` : `<span style="font-size: 0.8rem; color: var(--success);"><i class="fa-solid fa-check-circle"></i> Jogador Online</span>`}
            </div>

            <!-- Messages Container -->
            <div id="chat-history-${char.characterId}" style="flex:1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
                ${this.renderMessages(char.characterId)}
            </div>

            <!-- Input Area -->
            <div style="padding: 15px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; gap: 10px; margin-bottom: 10px;">
                    <select id="msg-type-${char.characterId}" class="input" style="width: 180px;">
                        <option value="sussurro">Sussurro (Privado)</option>
                        <option value="voz_divina">Voz Divina</option>
                        <option value="alerta">Alerta (Vibração)</option>
                    </select>
                </div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="msg-input-${char.characterId}" class="input" style="flex:1; font-size: 1rem; padding: 12px;" placeholder="Mensagem para ${char.nome}..." onkeypress="if(event.key==='Enter') this.closest('.tome-sinal-pane').__component.sendMessage('${char.characterId}')">
                    <button class="btn btn-primary" onclick="this.closest('.tome-sinal-pane').__component.sendMessage('${char.characterId}')" style="padding: 0 25px;"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
                </div>
            </div>
        `;
    }

    renderMessages(charId) {
        const msgs = this.messages[charId] || [];
        if (msgs.length === 0) {
            return `<div style="text-align:center; opacity:0.5; font-size:0.9rem; margin-top:20px;">Nenhuma mensagem neste fio de conversa.</div>`;
        }

        return msgs.map(m => {
            const isMe = m.de === 'mestre';
            const isAlert = m.tipo === 'alerta';
            const isDivine = m.tipo === 'voz_divina';
            
            const align = isMe ? 'flex-end' : 'flex-start';
            let bg = isMe ? 'rgba(102,252,241,0.1)' : 'rgba(255,255,255,0.1)';
            if (isAlert) bg = 'rgba(239, 68, 68, 0.2)';
            if (isDivine) bg = 'rgba(255, 215, 0, 0.15)';
            
            let border = isMe ? 'border-right: 3px solid var(--primary)' : 'border-left: 3px solid var(--secondary)';
            if (isDivine) border = 'border-right: 3px solid gold';

            let typeLabel = isMe ? 'Mestre' : 'Jogador';
            if (isDivine) typeLabel = 'Voz Divina';
            
            return `
                <div style="align-self: ${align}; background: ${bg}; ${border}; padding: 10px 15px; border-radius: 8px; max-width: 80%; animation: fadeIn 0.3s ease;">
                    <div style="font-size:0.75rem; opacity:0.7; margin-bottom:5px;">
                        ${isMe ? typeLabel : '<i class="fa-solid fa-user"></i> ' + (m.nome || m.de)}
                    </div>
                    <div style="${isAlert ? 'color:#ef4444; font-weight:bold;' : ''} ${isDivine ? 'color:gold; font-style:italic;' : ''}">${m.conteudo}</div>
                </div>
            `;
        }).join('');
    }

    async onMount() {
        if (!window.QRious) {
            const script = document.createElement('script');
            script.src = './ui/utils/vendor/qr-encoder.js';
            document.head.appendChild(script);
        }

        try {
            const res = await fetch(`/api/sessao/${this.activeTable}/tokens`);
            const data = await res.json();
            if (data.status === 'active' && data.tokens && data.tokens.length > 0) {
                this.sessionActive = true;
                this.characterTokens = data.tokens;
                this.selectedCharId = this.characterTokens[0]?.characterId;
                this.render();
            }
        } catch(e) {
            console.error('Failed to fetch active tokens:', e);
        }

        this.connectCRDT();
    }

    connectCRDT() {
        CRDTManager.connect(this.activeTable, 'Mestre');
        
        // Listen to chat changes
        CRDTManager.chatHistory.observe(event => {
            // Rebuild messages dictionary from CRDT array
            this.messages = {};
            const arr = CRDTManager.chatHistory.toArray();
            arr.forEach(msg => {
                const charId = msg.de === 'mestre' ? msg.para : msg.de;
                if (charId) {
                    if (!this.messages[charId]) this.messages[charId] = [];
                    this.messages[charId].push(msg);
                }
            });
            // Re-render chat if open
            if (this.selectedCharId) {
                const historyContainer = this.element.querySelector(`#chat-history-${this.selectedCharId}`);
                if (historyContainer) {
                    historyContainer.innerHTML = this.renderMessages(this.selectedCharId);
                    this.scrollToBottom(this.selectedCharId);
                }
            }
        });

        // Listen to online presence using Yjs Awareness
        if (CRDTManager.provider && CRDTManager.provider.awareness) {
            CRDTManager.provider.awareness.on('change', () => {
                this.syncPresence();
            });
        }
        
        // Listen to Socket.IO fallback presence (ping heartbeat)
        if (window.TOME && window.TOME.socket) {
            window.TOME.socket.on('player_presence', (data) => {
                if (!data || !data.charId) return;
                const char = this.characterTokens.find(c => c.characterId === data.charId);
                if (char) {
                    char.lastSocketPing = Date.now();
                    this.syncPresence();
                }
            });
        }
        
        // Periodic check for stale Socket.IO pings (15s timeout)
        this.presenceInterval = setInterval(() => {
            this.syncPresence();
        }, 5000);
    }

    syncPresence() {
        if (!this.sessionActive) return;
        
        let onlineIds = [];
        const now = Date.now();
        
        // 1. Gather from Yjs Awareness
        if (CRDTManager.provider && CRDTManager.provider.awareness) {
            const states = Array.from(CRDTManager.provider.awareness.getStates().values());
            onlineIds = states.map(s => s.user?.charId).filter(Boolean);
        }
        
        // 2. Gather from Socket.IO recent pings
        this.characterTokens.forEach(char => {
            if (char.lastSocketPing && (now - char.lastSocketPing < 15000)) {
                if (!onlineIds.includes(char.characterId)) {
                    onlineIds.push(char.characterId);
                }
            }
        });
        
        this.updateOnlineStatus(onlineIds.map(id => ({ id })));
    }

    updateOnlineStatus(onlinePlayers) {
        if (!this.sessionActive) return;
        
        let changed = false;
        const onlineIds = onlinePlayers.map(p => p.id);
        
        this.characterTokens.forEach(char => {
            const isConnected = onlineIds.includes(char.characterId);
            if (char.connected !== isConnected) {
                char.connected = isConnected;
                changed = true;
            }
        });

        if (changed) {
            const listEl = this.element.querySelector('#character-list');
            if (listEl) {
                listEl.innerHTML = this.sessionActive ? this.renderCharacterList() : '<div style="padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">Sessão inativa. Inicie a sessão para gerar QR Codes.</div>';
            }
        }
    }

    async iniciarSessao() {
        const players = this.store.state.players || [];
        if (players.length === 0) {
            alert("Nenhum personagem registrado na mesa.");
            return;
        }

        try {
            const response = await fetch('/api/sessao/iniciar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableId: this.activeTable,
                    personagens: players
                })
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                this.characterTokens = data.tokens.map(t => ({
                    characterId: t.characterId,
                    sessionToken: t.sessionToken,
                    nome: t.nome,
                    connected: false
                }));
                this.sessionActive = true;
                this.selectedCharId = this.characterTokens[0]?.characterId;
                this.render();
            }
        } catch (e) {
            console.error("Erro ao iniciar sessão", e);
        }
    }

    async encerrarSessao() {
        if (!confirm("Tem certeza que deseja encerrar a sessão? Os links dos jogadores serão desativados.")) return;
        
        try {
            await fetch('/api/sessao/encerrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId: this.activeTable })
            });
            
            this.sessionActive = false;
            this.characterTokens = [];
            this.selectedCharId = null;
            this.render();
        } catch (e) {
            console.error("Erro ao encerrar sessão", e);
        }
    }

    selectCharacter(charId) {
        this.selectedCharId = charId;
        // Targeted re-render for the right pane and character list selection state
        const rightPane = this.element.querySelector('.tome-sinal-pane > div > div:nth-child(2)');
        if (rightPane) rightPane.innerHTML = this.renderChatArea();
        
        const listEl = this.element.querySelector('#character-list');
        if (listEl) listEl.innerHTML = this.renderCharacterList();
        
        setTimeout(() => this.scrollToBottom(charId), 50);
    }

    scrollToBottom(charId) {
        const container = this.element.querySelector(`#chat-history-${charId}`);
        if (container) container.scrollTop = container.scrollHeight;
    }

    async showQRModal(charId) {
        const char = this.characterTokens.find(c => c.characterId === charId);
        if (!char) return;

        let lanIp = window.location.hostname;
        let port = window.location.port || '4000';
        try {
            const netRes = await fetch('/api/system/network');
            const netInfo = await netRes.json();
            if (netInfo && netInfo.ip) {
                lanIp = netInfo.ip;
                port = netInfo.port || port;
            }
        } catch (e) {
            console.warn('Fallback para hostname atual', e);
        }

        const url = `http://${lanIp}:${port}/jogador/${char.sessionToken}`;
        
        const existing = document.getElementById('qr-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'qr-modal';
        modal.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);
        `;
        
        modal.innerHTML = `
            <div class="card glass-accent" style="padding: 30px; text-align: center; border-radius: 12px; background: rgba(10,12,16,0.95); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                <h3 style="font-family:'Cinzel'; color: var(--accent); margin-bottom: 5px;">Acesso de Jogador</h3>
                <p style="color: #fff; font-size: 1.2rem; margin-bottom: 20px;"><strong>${char.nome}</strong></p>
                <div style="background: #fff; padding: 15px; border-radius: 8px; display: inline-block;">
                    <canvas id="qr-canvas"></canvas>
                </div>
                <p style="color: var(--text-dim); font-size: 0.8rem; margin-top: 20px; max-width: 300px; word-break: break-all;">${url}</p>
                <button class="btn btn-ghost" style="margin-top: 20px; width: 100%;" onclick="this.closest('#qr-modal').remove()">Fechar</button>
            </div>
        `;
        
        document.body.appendChild(modal);

        setTimeout(() => {
            if (window.QRious) {
                new window.QRious({
                    element: document.getElementById('qr-canvas'),
                    value: url,
                    size: 250,
                    background: 'white',
                    foreground: 'black'
                });
            } else {
                console.error("QRious não carregou a tempo.");
            }
        }, 100);
    }

    async sendMessage(charId) {
        const input = this.element.querySelector(`#msg-input-${charId}`);
        const typeSelect = this.element.querySelector(`#msg-type-${charId}`);
        
        const content = input.value.trim();
        if (!content) return;

        const type = typeSelect.value;
        const msgObj = {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            tipo: type,
            de: 'mestre',
            para: charId,
            conteudo: content,
            timestamp: Date.now()
        };

        // Envia direto pro CRDT de forma offline-first
        CRDTManager.chatHistory.push([msgObj]);
        
        input.value = '';
    }

    unmount() {
        if (this.presenceInterval) clearInterval(this.presenceInterval);
        CRDTManager.disconnect();
        super.unmount();
    }
}
