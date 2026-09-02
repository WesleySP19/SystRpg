import * as Y from '/public/vendor/yjs.js';
import { WebsocketProvider } from '/public/vendor/y-websocket.js';
import { FXEngine } from '/services/FXEngine.js';

export class Engine {
    constructor(ui) {
        this.ui = ui;
        this.playerId = localStorage.getItem('tome_player_id');
        if (!this.playerId) {
            this.playerId = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : this.generateUUID();
            localStorage.setItem('tome_player_id', this.playerId);
        }
        this.currentTable = null;
        this.currentName = null;
        this.currentCharId = null;
        this.currentAvatar = null;
        this.currentClass = null;
        
        this.provider = null;
        this.ydoc = new Y.Doc();
        this.chatHistory = this.ydoc.getArray('chatHistory');
        this.processedMessageIds = new Set();
        try { FXEngine.init(); } catch(e) {}
        
        this.lastSyncTimestamp = 0;
        this.pollingInterval = null;
        this.isSocketConnected = false;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async connectWithToken() {
        try {
            const res = await fetch(`/api/sessao/token-info`);
            if (res.ok) {
                const data = await res.json();
                this.sessionToken = data.sessionToken;
                this.currentTable = data.tableId;
                this.currentName = data.nome || 'Aventureiro';
                this.currentCharId = data.characterId;
                this.currentAvatar = data.avatar || localStorage.getItem('tome_last_avatar') || '';
                this.currentClass = data.classe || 'Herói do Reino';
                
                localStorage.setItem('tome_last_table', this.currentTable);
                localStorage.setItem('tome_last_name', this.currentName);
                if (this.currentAvatar) localStorage.setItem('tome_last_avatar', this.currentAvatar);
                
                this.ui.showMainApp(this);
                this.ui.renderProfile({
                    name: this.currentName,
                    avatar: this.currentAvatar,
                    classe: this.currentClass,
                    charId: this.currentCharId,
                    tableId: this.currentTable
                });
                
                this.initYjs(this.currentTable);
                this.initFallbackPolling();
            } else {
                alert("Token de sessão inválido ou expirado. Peça um novo QR Code ao Mestre.");
            }
        } catch(e) {
            alert("Erro ao se conectar ao servidor na LAN.");
        }
    }

    async connect() {
        const { tableId, playerName } = this.ui.getLoginData();
        if (!tableId || !playerName) {
            alert("Sintonização requer o ID da Mesa e o Nome!");
            return;
        }

        this.currentTable = tableId;
        this.currentName = playerName;
        this.currentCharId = this.playerId;
        this.currentAvatar = localStorage.getItem('tome_last_avatar') || '';
        this.currentClass = 'Aventureiro Sintonizado';
        
        localStorage.setItem('tome_last_table', tableId);
        localStorage.setItem('tome_last_name', playerName);

        this.ui.showMainApp(this);
        this.ui.renderProfile({
            name: this.currentName,
            avatar: this.currentAvatar,
            classe: this.currentClass,
            charId: this.currentCharId,
            tableId: this.currentTable
        });
        
        this.initYjs(tableId);
        this.initFallbackPolling();
    }

    initYjs(tableId) {
        if (this.provider) {
            this.provider.destroy();
        }

        let serverUrl = window.location.origin.replace(/^http/, 'ws');
        if (serverUrl.endsWith('/')) serverUrl = serverUrl.slice(0, -1);
        serverUrl += '/yjs';
        const roomName = `table-${tableId}`;
        try {
            this.provider = new WebsocketProvider(serverUrl, roomName, this.ydoc);

            if (this.provider.awareness) {
                this.provider.awareness.setLocalStateField('user', {
                    charId: this.currentCharId || this.playerId,
                    name: this.currentName
                });
            }

            this.provider.on('status', event => {
                if (event.status === 'connected') {
                    this.isSocketConnected = true;
                    this.ui.setStatus(true);
                    this.ui.renderMessage({ tipo: 'sistema', conteudo: `Sintonizado ao Mestre na mesa ${tableId}.` });
                } else {
                    this.isSocketConnected = false;
                    this.ui.setStatus(false);
                    // Aciona sync HTTP imediata ao cair o socket
                    this.syncHTTPFallback();
                }
            });
        } catch(e) {
            console.warn("WebSocket restrito, operando em modo Fallback HTTP.");
            this.isSocketConnected = false;
        }

        this.chatHistory.observe(event => {
            event.changes.added.forEach(item => {
                item.content.getContent().forEach(msgObj => {
                    if (msgObj.de === this.currentCharId && !msgObj.fromSystem) return; 
                    this._renderCRDTMessage(msgObj);
                });
            });
        });
        
        // Render initial history do CRDT se existir
        const arr = this.chatHistory.toArray();
        arr.forEach(msgObj => {
            this._renderCRDTMessage(msgObj, true);
        });

        // Sintoniza com o hub central Sync-Mesh (Socket.IO + FXEngine)
        if (typeof io !== 'undefined') {
            try {
                if (this.socket) this.socket.disconnect();
                this.socket = io();
                window.TOME = window.TOME || {};
                window.TOME.socket = this.socket;
                this.socket.on('connect', () => {
                    this.socket.emit('joinRoom', { mesaId: tableId });
                    window.dispatchEvent(new Event('tome:socket_ready'));
                });
                this.socket.on('chat_message', (msgObj) => {
                    if (msgObj && (msgObj.de !== this.currentCharId && msgObj.sender !== this.currentName)) {
                        this._renderCRDTMessage(msgObj, false);
                    }
                });
                this.socket.on('state_update', (data) => {
                    if (data) {
                        this.hydrate(data, true); // true = via WebSocket, não forçar re-render sujo
                    }
                });
                
                // Heartbeat de Presença (a cada 10s)
                if (this.presencePingInterval) clearInterval(this.presencePingInterval);
                this.presencePingInterval = setInterval(() => {
                    if (this.socket && this.socket.connected) {
                        this.socket.emit('player_ping', { 
                            charId: this.currentCharId || this.playerId,
                            tableId: this.currentTable 
                        });
                    }
                }, 10000);
                
            } catch(e) { console.warn('[Engine] Falha ao vincular Socket Sync-Mesh:', e); }
        }
    }

    // Sistema de Sincronização Inicial (Polling removido em favor do WebSocket)
    initFallbackPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.syncHTTPFallback(); // Sync inicial ao carregar
    }

    async syncHTTPFallback() {
        if (!this.currentTable) return;
        try {
            const res = await fetch(`/api/chat/sync?tableId=${this.currentTable}&since=${this.lastSyncTimestamp}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.messages && data.messages.length > 0) {
                    data.messages.forEach(msg => {
                        if (msg.timestamp > this.lastSyncTimestamp) {
                            this.lastSyncTimestamp = msg.timestamp;
                        }
                        // Evita eco local de mensagens próprias, a menos que marcadas por confirmação
                        if (msg.de === this.currentCharId || msg.nome === this.currentName) return;
                        this._renderCRDTMessage(msg, false);
                    });
                }
            }
        } catch(e) {
            // Silencioso em caso de queda momentânea do Wi-Fi
        }
    }

    _renderCRDTMessage(msgObj, isHistory = false) {
        const msgId = msgObj.id || `${msgObj.timestamp}_${msgObj.de || msgObj.sender || ''}_${msgObj.conteudo || msgObj.message || ''}`;
        if (this.processedMessageIds.has(msgId)) return;
        this.processedMessageIds.add(msgId);
        if (this.processedMessageIds.size > 500) {
            const first = this.processedMessageIds.values().next().value;
            this.processedMessageIds.delete(first);
        }

        const timestamp = msgObj.timestamp || Date.now();
        if (timestamp > this.lastSyncTimestamp) {
            this.lastSyncTimestamp = timestamp;
        }
        const isSystem = msgObj.isSystem || msgObj.tipo === 'sistema';
        const isRoll = msgObj.isRoll || msgObj.tipo === 'rolagem';
        const nome = msgObj.sender || msgObj.nome || msgObj.de || (isSystem ? 'Sistema' : 'Aventureiro');
        let conteudo = msgObj.message !== undefined ? msgObj.message : (msgObj.conteudo !== undefined ? msgObj.conteudo : '');

        if (isSystem) {
            this.ui.renderMessage({ tipo: 'sistema', conteudo, isHistory, timestamp });
        } else if (isRoll) {
            if (msgObj.formula && msgObj.total !== undefined) {
                conteudo = `🎲 ${msgObj.formula} = <strong>${msgObj.total}</strong> ${msgObj.details ? `(${msgObj.details})` : ''}`;
            }
            this.ui.renderMessage({ 
                tipo: 'jogador', 
                nome,
                conteudo,
                isHistory,
                timestamp,
                avatar: msgObj.avatar
            });
        } else {
            this.ui.renderMessage({ 
                tipo: (msgObj.de === this.currentCharId || msgObj.nome === this.currentName || msgObj.sender === this.currentName) ? 'jogador' : 'outro', 
                nome,
                conteudo,
                isHistory,
                timestamp,
                avatar: msgObj.avatar
            });
        }
    }

    async sendMessage(text) {
        if (!text) return;
        
        const now = Date.now();
        let newEntry = {
            id: now + Math.random().toString(36).substring(2, 6),
            tipo: 'geral',
            de: this.currentCharId || this.currentName,
            para: 'todos',
            conteudo: text,
            timestamp: now,
            nome: this.currentName,
            avatar: this.currentAvatar,
            // Fallback Universal (compatibilidade com Mestre / Desktop VTT)
            sender: this.currentName,
            message: text,
            isSystem: false,
            isRoll: false
        };

        this.lastSyncTimestamp = Math.max(this.lastSyncTimestamp, now);

        // Eco local instantâneo (UI 100% responsiva no cel)
        this._renderCRDTMessage(newEntry, false);

        // Canal Único com Fallback Cascata:
        // 1. Socket.IO (primário, menor latência)
        // 2. REST HTTP (backup silencioso, garante entrega)
        // O servidor injeta no Yjs CRDT automaticamente — não duplicamos aqui
        let sentViaSocket = false;
        if (this.socket && this.socket.connected) {
            try {
                this.socket.emit('chat_message', Object.assign({ tableId: this.currentTable }, newEntry));
                sentViaSocket = true;
            } catch(e) {
                console.warn("[Engine] Falha no Socket.IO, tentando REST...");
            }
        }

        // REST como backup silencioso (fire-and-forget)
        if (!sentViaSocket) {
            try {
                await fetch('/api/chat/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tableId: this.currentTable, message: newEntry })
                });
            } catch(e) {
                // Wi-Fi instável — mensagem fica no eco local, será sincronizada no próximo polling
                console.warn("[Engine] Mensagem em fila offline — será sincronizada ao reconectar.");
            }
        }
    }

    async uploadAvatar(base64Image) {
        if (!base64Image) return;
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: `avatar_${this.currentName || 'jogador'}_${Date.now()}.png`,
                    base64: base64Image
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    this.currentAvatar = data.url;
                    localStorage.setItem('tome_last_avatar', this.currentAvatar);
                    this.ui.updateAvatarDisplay(this.currentAvatar);
                    
                    // Avisa no chat que o herói tem um novo retrato arcano
                    this.sendMessage("🛡️ [SISTEMA] Atualizou o retrato do personagem!");
                    return true;
                }
            }
        } catch(e) {
            alert("Erro ao enviar imagem ao servidor LAN.");
        }
        return false;
    }

    async rollMacro(formula, label) {
        let total = 0;
        let details = "";
        
        if (formula === "2d20h1") {
            const r1 = Math.floor(Math.random() * 20) + 1;
            const r2 = Math.floor(Math.random() * 20) + 1;
            total = Math.max(r1, r2);
            details = `[${r1}, ${r2}] Vantagem`;
        } else if (formula === "2d20l1") {
            const r1 = Math.floor(Math.random() * 20) + 1;
            const r2 = Math.floor(Math.random() * 20) + 1;
            total = Math.min(r1, r2);
            details = `[${r1}, ${r2}] Desvantagem`;
        } else {
            const match = formula.match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/i);
            if (match) {
                const count = parseInt(match[1]) || 1;
                const sides = parseInt(match[2]) || 20;
                const sign = match[3];
                const mod = parseInt(match[4]) || 0;
                const rolls = [];
                for (let i = 0; i < count; i++) {
                    const val = Math.floor(Math.random() * sides) + 1;
                    rolls.push(val);
                    total += val;
                }
                details = `[${rolls.join(", ")}]`;
                if (sign === '+') { total += mod; details += ` + ${mod}`; }
                if (sign === '-') { total -= mod; details += ` - ${mod}`; }
            } else {
                total = Math.floor(Math.random() * 20) + 1;
                details = `[${total}]`;
            }
        }

        const now = Date.now();
        const newEntry = {
            id: now + Math.random().toString(36).substring(2, 6),
            tipo: 'rolagem',
            de: this.currentCharId || this.currentName,
            para: 'todos',
            conteudo: `🎲 ${label} (${formula}): ${total} ${details}`,
            timestamp: now,
            nome: this.currentName,
            avatar: this.currentAvatar,
            sender: this.currentName,
            message: `🎲 ${label} (${formula}): ${total} ${details}`,
            isSystem: false,
            isRoll: true,
            formula: `${label} (${formula})`,
            total: total,
            details: details
        };

        this.lastSyncTimestamp = Math.max(this.lastSyncTimestamp, now);
        this._renderCRDTMessage(newEntry, false);

        if (navigator.vibrate) navigator.vibrate([40, 50, 40]);

        if (this.isSocketConnected && this.provider) {
            try {
                this.chatHistory.push([newEntry]);
            } catch(e) {}
        }

        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId: this.currentTable, message: newEntry })
            });
        } catch(e) {}
    }
}
