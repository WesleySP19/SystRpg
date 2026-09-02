import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { WebSocketServer } from 'ws';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import { getDocument, saveDocument, getDbType, getPrisma } from '../utils/db.js';
import { battleManager } from '../services/BattleManager.js';
import { generatePatch, isPatchEmpty, patchSize } from '../utils/DeltaSync.js';
import * as Y from 'yjs';

const activeYDocs = new Map();
const messageHistory = new Map();
const stateSnapshots = new Map(); // mesaId -> último estado salvo (para calcular deltas)

// LRU Set para deduplicação robusta de mensagens por ID
class LRUSet {
    constructor(maxSize = 500) {
        this._set = new Set();
        this._maxSize = maxSize;
    }
    has(id) { return this._set.has(id); }
    add(id) {
        if (this._set.has(id)) return;
        this._set.add(id);
        if (this._set.size > this._maxSize) {
            const first = this._set.values().next().value;
            this._set.delete(first);
        }
    }
}
const processedMessageIds = new Map(); // tableId -> LRUSet

export function normalizeChatMessage(msg = {}) {
    const id = msg.id || crypto.randomUUID();
    const timestamp = msg.timestamp || Date.now();
    const isSystem = msg.isSystem || msg.tipo === 'sistema';
    const isRoll = msg.isRoll || msg.tipo === 'rolagem';
    const sender = msg.sender || msg.nome || msg.de || (isSystem ? 'Sistema' : 'Aventureiro');
    const content = msg.message !== undefined ? msg.message : (msg.conteudo !== undefined ? msg.conteudo : '');
    const avatar = msg.avatar || '';

    return {
        id,
        sender,
        message: content,
        isSystem,
        isRoll,
        formula: msg.formula || '',
        total: msg.total !== undefined ? msg.total : null,
        details: msg.details || '',
        timestamp,
        avatar,
        tipo: isSystem ? 'sistema' : (isRoll ? 'rolagem' : (msg.tipo || 'geral')),
        nome: sender,
        de: msg.de || sender,
        para: msg.para || 'todos',
        conteudo: content
    };
}

async function getTableChatHistory(tableId, dataDir) {
    const cleanId = tableId.replace(/^table-/, '');
    if (!messageHistory.has(cleanId)) {
        const prisma = getPrisma();
        if (getDbType() === 'postgresql' && prisma) {
            try {
                const messages = await prisma.chatMessage.findMany({
                    where: { tableId: cleanId },
                    orderBy: { timestamp: 'asc' },
                    take: 300
                });
                const mapped = messages.map(m => {
                    const parsed = JSON.parse(m.message);
                    return {
                        id: m.id,
                        sender: m.sender,
                        timestamp: m.timestamp.getTime(),
                        ...parsed
                    };
                });
                messageHistory.set(cleanId, mapped);
            } catch (err) {
                console.warn(`[Sync-Mesh] Erro ao carregar histórico do DB:`, err.message);
                messageHistory.set(cleanId, []);
            }
        } else {
            try {
                const persisted = await getDocument(`chat_${cleanId}.json`, dataDir);
                if (Array.isArray(persisted)) {
                    messageHistory.set(cleanId, persisted);
                } else {
                    messageHistory.set(cleanId, []);
                }
            } catch {
                messageHistory.set(cleanId, []);
            }
        }
    }
    return messageHistory.get(cleanId);
}

async function saveTableChatHistory(tableId, history, dataDir) {
    const cleanId = tableId.replace(/^table-/, '');
    const prisma = getPrisma();
    if (getDbType() === 'postgresql' && prisma) {
        try {
            for (const msg of history) {
                await prisma.chatMessage.upsert({
                    where: { id: msg.id },
                    update: {},
                    create: {
                        id: msg.id,
                        tableId: cleanId,
                        sender: msg.sender,
                        message: JSON.stringify(msg),
                        timestamp: new Date(msg.timestamp || Date.now())
                    }
                });
            }
        } catch (err) {
            console.warn(`[Sync-Mesh] Erro ao salvar histórico no PostgreSQL:`, err.message);
        }
    } else {
        try {
            await saveDocument(`chat_${cleanId}.json`, history, dataDir);
        } catch (err) {
            console.warn(`[Sync-Mesh] Erro ao salvar histórico de chat em chat_${cleanId}.json:`, err.message);
        }
    }
}

async function processAndBroadcastMessage(io, dataDir, tableId, rawMsg, source = 'unknown') {
    const cleanId = (tableId || 'global').replace(/^table-/, '');
    const norm = normalizeChatMessage(rawMsg);

    // Dedup robusto por message ID (LRU Set por mesa)
    if (!processedMessageIds.has(cleanId)) {
        processedMessageIds.set(cleanId, new LRUSet(500));
    }
    const dedupSet = processedMessageIds.get(cleanId);
    if (dedupSet.has(norm.id)) {
        return { status: 'duplicate', entry: norm };
    }
    dedupSet.add(norm.id);

    const history = await getTableChatHistory(cleanId, dataDir);
    history.push(norm);
    if (history.length > 300) {
        history.splice(0, history.length - 300);
    }
    await saveTableChatHistory(cleanId, history, dataDir);

    io.to(cleanId).emit('chat_message', norm);
    io.to(`table-${cleanId}`).emit('chat_message', norm);
    if (cleanId === 'global' || cleanId === 'default' || cleanId === 'default-table') {
        io.emit('chat_message', norm);
    }

    if (source !== 'yjs') {
        const ydoc = activeYDocs.get(`table-${cleanId}`) || activeYDocs.get(cleanId);
        if (ydoc) {
            try {
                const yChat = ydoc.getArray('chatHistory');
                if (!yChat.toArray().some(m => m.id === norm.id)) {
                    yChat.push([norm]);
                    if (yChat.length > 300) yChat.delete(0, yChat.length - 300);
                }
            } catch (err) {
                console.warn('[Sync-Mesh] Falha ao injetar no Yjs:', err.message);
            }
        }
    }

    return { status: 'success', entry: norm };
}

export function setupSyncEngine(server, io, dataDir, app) {
    // ── ROTAS REST DE CHAT ──
    app.get('/api/chat/sync', async (req, res) => {
        try {
            const tableId = req.query.tableId || 'global';
            const since = parseInt(req.query.since || '0', 10);
            const history = await getTableChatHistory(tableId, dataDir);
            const msgs = history.filter(m => m.timestamp > since);
            res.json({ status: 'success', messages: msgs.map(normalizeChatMessage) });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    app.post('/api/chat/send', async (req, res) => {
        try {
            const { tableId, message } = req.body;
            if (!tableId || !message) return res.status(400).json({ error: 'Dados insuficientes' });
            
            const result = await processAndBroadcastMessage(io, dataDir, tableId, message, 'rest');
            res.json({ status: 'success', entry: result.entry });
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    });

    // ── GERENCIAMENTO DE CONEXÕES SOCKET.IO ──
    io.on('connection', (socket) => {
        console.log(`[NodeServer] [Socket] Novo cliente conectado: ${socket.id}`);
        
        socket.on('joinRoom', ({ mesaId }) => {
            if (mesaId) {
                socket.join(mesaId);
                console.log(`[NodeServer] [Socket] Cliente ${socket.id} entrou na sala da mesa: ${mesaId}`);
            }
        });
        
        socket.on('save_state', async (payload) => {
            try {
                const { filename, data } = payload;
                let rawName = filename || 'state.json';
                let safeName = path.basename(rawName).replace(/[^a-zA-Z0-9_.-]/g, '');
                if (!safeName.toLowerCase().endsWith('.json')) safeName += '.json';
                if (!safeName || safeName === '.json') safeName = 'state.json';

                await saveDocument(safeName, data, dataDir);

                const match = safeName.match(/^mesa_(\d+)\.json$/);
                if (match) {
                    const mesaId = match[1];
                    const previousState = stateSnapshots.get(mesaId);
                    
                    if (previousState) {
                        // Calcula e envia delta (muito menor que o estado completo)
                        const patches = generatePatch(previousState, data);
                        if (!isPatchEmpty(patches)) {
                            const deltaBytes = patchSize(patches);
                            const fullBytes = JSON.stringify(data).length;
                            console.log(`[Sync-Mesh] Delta: ${deltaBytes}B vs Full: ${fullBytes}B (${Math.round((1 - deltaBytes/fullBytes) * 100)}% economia)`);
                            io.to(mesaId).emit('delta_state_update', { patches, version: Date.now() });
                        }
                    } else {
                        // Primeiro save — envia estado completo
                        io.to(mesaId).emit('state_update', data);
                    }
                    
                    // Atualiza snapshot em memória
                    stateSnapshots.set(mesaId, JSON.parse(JSON.stringify(data)));
                    console.log(`[Sync-Mesh] State salvo e sincronizado via delta para sala: ${mesaId}`);
                }
                socket.emit('save_success', { filename: safeName });
            } catch (err) {
                console.error('[NodeServer] Erro no save via socket:', err);
                socket.emit('save_error', { error: err.message });
            }
        });
        
        socket.on('ping_perf', (sentTimestamp) => {
            socket.emit('pong_perf', sentTimestamp);
        });

        socket.on('player_ping', (payload) => {
            if (payload && payload.charId && payload.tableId) {
                // Broadcast to the DM's room so TomeSinalPanel can update presence
                io.to(payload.tableId).emit('player_presence', {
                    charId: payload.charId,
                    status: 'online',
                    timestamp: Date.now()
                });
                // Attach info to socket for disconnect handling
                socket._charId = payload.charId;
                socket._tableId = payload.tableId;
            }
        });

        socket.on('disconnect', () => {
            console.log(`[NodeServer] [Socket] Cliente desconectado: ${socket.id}`);
            if (socket._charId && socket._tableId) {
                io.to(socket._tableId).emit('player_offline', {
                    charId: socket._charId,
                    status: 'offline',
                    timestamp: Date.now()
                });
            }
        });

        socket.on('state_update', (data) => {
            if (socket.rooms && socket.rooms.size > 1) {
                for (const r of socket.rooms) {
                    if (r !== socket.id) socket.to(r).emit('state_update', data);
                }
            } else {
                io.emit('state_update', data);
            }
        });

        socket.on('delta_update', (data) => {
            if (socket.rooms && socket.rooms.size > 1) {
                for (const r of socket.rooms) {
                    if (r !== socket.id) socket.to(r).emit('delta_update', data);
                }
            } else {
                io.emit('delta_update', data);
            }
        });

        socket.on('chat_message', async (payload = {}) => {
            const tableId = payload.tableId || 'global';
            const msgData = payload.message || payload;
            await processAndBroadcastMessage(io, dataDir, tableId, msgData, 'socket');
        });

        socket.on('fx_animation', (data) => {
            io.emit('fx_animation', data);
        });

        // --- WebRTC Signaling ---
        socket.on('webrtc-join', ({ mesaId, userId }) => {
            const room = `webrtc-${mesaId}`;
            socket.join(room);
            console.log(`[WebRTC] Peer ${socket.id} entrou na sala ${room}`);
            socket.to(room).emit('webrtc-peer-joined', { peerId: socket.id, userId });
        });

        socket.on('webrtc-offer', (payload) => {
            socket.to(payload.targetId).emit('webrtc-offer', { senderId: socket.id, sdp: payload.sdp });
        });

        socket.on('webrtc-answer', (payload) => {
            socket.to(payload.targetId).emit('webrtc-answer', { senderId: socket.id, sdp: payload.sdp });
        });

        socket.on('webrtc-ice-candidate', (payload) => {
            socket.to(payload.targetId).emit('webrtc-ice-candidate', { senderId: socket.id, candidate: payload.candidate });
        });

        socket.on('disconnect', () => {
            console.log(`[NodeServer] [Socket] Cliente desconectado: ${socket.id}`);
            io.emit('webrtc-peer-left', { peerId: socket.id });
        });
    });

    // ── CONFIGURAÇÃO DE PERSISTÊNCIA DO YJS ──
    const yjsDir = path.join(dataDir, 'yjs');
    if (!fs.existsSync(yjsDir)) fs.mkdirSync(yjsDir, { recursive: true });

    setPersistence({
        bindState: async (docName, ydoc) => {
            activeYDocs.set(docName, ydoc);
            const cleanDocName = docName.replace(/[^a-zA-Z0-9_-]/g, '');
            const docPath = path.join(yjsDir, `${cleanDocName}.bin`);
            try {
                let encodedState;
                const prisma = getPrisma();
                if (getDbType() === 'postgresql' && prisma) {
                    const blob = await prisma.yjsBlob.findUnique({ where: { id: cleanDocName } });
                    if (blob && blob.data) {
                        encodedState = blob.data;
                    }
                }
                
                if (!encodedState) {
                    encodedState = await fs.promises.readFile(docPath);
                }
                
                if (encodedState) {
                    Y.applyUpdate(ydoc, encodedState);
                    console.log(`[Yjs] Estado carregado para o documento: ${docName}`);
                }
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`[Yjs] Erro ao carregar o estado do documento ${docName}:`, err);
                }
            }
            
            const yChat = ydoc.getArray('chatHistory');
            yChat.observe(async event => {
                const tableId = docName.replace(/^table-/, '');
                for (const item of event.changes.added) {
                    const content = item.content.getContent();
                    for (const rawMsg of content) {
                        await processAndBroadcastMessage(io, dataDir, tableId, rawMsg, 'yjs');
                    }
                }
            });

            ['battleEntities', 'tokens'].forEach(mapName => {
                const yMapInstance = ydoc.getMap(mapName);
                yMapInstance.observe(event => {
                    event.changes.keys.forEach((change, key) => {
                        if (change.action === 'add' || change.action === 'update') {
                            const newEntityData = yMapInstance.get(key);
                            if (newEntityData) {
                                const isValid = battleManager.validateCRDTMove(docName, key, newEntityData, yMapInstance);
                                if (isValid) {
                                    const tableId = docName.replace(/^table-/, '');
                                    io.to(tableId).emit('delta_update', {
                                        deltaType: mapName === 'tokens' ? 'TOKEN_MOVE' : 'ENTITY_UPDATE',
                                        data: newEntityData
                                    });
                                }
                            }
                        }
                    });
                });
            });
        },
        writeState: async (docName, ydoc) => {
            const cleanDocName = docName.replace(/[^a-zA-Z0-9_-]/g, '');
            const docPath = path.join(yjsDir, `${cleanDocName}.bin`);
            try {
                const encodedState = Y.encodeStateAsUpdate(ydoc);
                
                const prisma = getPrisma();
                if (getDbType() === 'postgresql' && prisma) {
                    await prisma.yjsBlob.upsert({
                        where: { id: cleanDocName },
                        update: { data: Buffer.from(encodedState) },
                        create: { id: cleanDocName, data: Buffer.from(encodedState) }
                    });
                }
                
                // Fallback de segurança: escreve no disco local também
                await fs.promises.writeFile(docPath, encodedState);
                console.log(`[Yjs] Estado salvo (PostgreSQL + Disco) para: ${docName}`);
            } catch (err) {
                console.error(`[Yjs] Erro ao salvar o documento ${docName}:`, err);
            }
        }
    });

    const wss = new WebSocketServer({ 
        noServer: true,
        perMessageDeflate: {
            zlibDeflateOptions: { chunkSize: 1024, memLevel: 7, level: 3 },
            zlibInflateOptions: { chunkSize: 10 * 1024 },
            clientNoContextTakeover: true,
            serverNoContextTakeover: true,
            serverMaxWindowBits: 10,
            concurrencyLimit: 10,
            threshold: 1024
        }
    });

    const wssSignaling = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        if (request.url.startsWith('/yjs/')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        } else if (request.url.startsWith('/webrtc/')) {
            wssSignaling.handleUpgrade(request, socket, head, (ws) => {
                wssSignaling.emit('connection', ws, request);
            });
        }
    });

    wss.on('connection', (ws, req) => {
        const docName = req.url.slice(5) || 'global';
        req.url = `/${docName}`;
        setupWSConnection(ws, req, { docName });
    });

    wssSignaling.on('connection', (ws) => {
        ws.on('message', (message) => {
            wssSignaling.clients.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                    client.send(message);
                }
            });
        });
    });
}

/**
 * Limpa todos os recursos em memória associados a uma sessão/mesa.
 * Deve ser chamado quando uma sessão é encerrada via /api/sessao/encerrar.
 * @param {string} tableId
 */
export function cleanupSession(tableId) {
    const cleanId = (tableId || '').replace(/^table-/, '');
    
    // Limpa Yjs docs
    const ydocKey1 = `table-${cleanId}`;
    const ydocKey2 = cleanId;
    if (activeYDocs.has(ydocKey1)) {
        try { activeYDocs.get(ydocKey1).destroy(); } catch {}
        activeYDocs.delete(ydocKey1);
    }
    if (activeYDocs.has(ydocKey2)) {
        try { activeYDocs.get(ydocKey2).destroy(); } catch {}
        activeYDocs.delete(ydocKey2);
    }
    
    // Limpa histórico de chat em memória
    messageHistory.delete(cleanId);
    
    // Limpa snapshot de estado
    stateSnapshots.delete(cleanId);
    
    // Limpa dedup set
    processedMessageIds.delete(cleanId);
    
    console.log(`[Sync-Mesh] Sessão ${cleanId} limpa da memória (YDocs, Chat, Snapshots, Dedup).`);
}
