import express from 'express';
import fs from 'fs';
import path from 'path';
import net from 'net';
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import os from 'os';
import { initDb, getDocument, saveDocument, getDbType, getPrisma } from './utils/db.js';
import { battleManager } from './services/BattleManager.js';
import { WebSocketServer } from 'ws';
import compression from 'compression';

import registerAuthRoutes from './routes/auth.js';
import registerSystemRoutes, { getNetworkInfo } from './routes/system.js';
import registerMediaRoutes from './routes/media.js';
import { createAuthMiddleware } from './controllers/AuthController.js';
import { setupSyncEngine, cleanupSession } from './sockets/SyncEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    destroyUpgrade: false
});

// Aumenta o limite de payload JSON para suportar uploads base64 grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Habilita Compressão GZIP/Brotli para todas as rotas (reduz tamanho JSON e assets em até 90%)
app.use(compression());

// Sincroniza o diretório de trabalho com a pasta do script
const PSScriptRoot = __dirname;
process.chdir(PSScriptRoot);

// Middleware de Relatório de Requisições (Debug Console)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        if (req.url.startsWith('/api/') || req.url.startsWith('/socket.io/')) {
            const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, Green for success
            console.log(`[REQ] ${req.method} ${req.url} -> ${statusColor}Status ${res.statusCode}\x1b[0m (${Date.now() - start}ms)`);
        }
    });
    next();
});

// Garante que os diretórios necessários existam
const dataDir = path.join(PSScriptRoot, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const uploadDir = path.join(PSScriptRoot, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'tome_secret_jwt_key_v23_local_lan_dev';
const smsCodes = new Map(); // phone -> { code, name, expires }

// Limpeza periódica de memória e códigos SMS expirados
setInterval(() => {
    const now = Date.now();
    for (const [phone, record] of smsCodes.entries()) {
        if (now > record.expires) {
            smsCodes.delete(phone);
        }
    }

    // Monitoramento e Purge de memória (V17.9 - Pre-V18 Polishing)
    const memUse = process.memoryUsage();
    if (memUse.heapUsed > 250 * 1024 * 1024) { 
        // Acima de 250MB de Heap, alerta de possível memory leak
        console.warn(`[Servidor] ATENÇÃO: Alto consumo de RAM (${Math.round(memUse.heapUsed / 1024 / 1024)}MB)`);
        if (global.gc) {
            global.gc();
            console.log('[Servidor] Garbage Collector forçado (V17.9 Profiling Ativo).');
        }
    }
}, 60 * 1000); // Roda a cada minuto

const authenticateToken = createAuthMiddleware(JWT_SECRET);

// Middlewares JWT e Rotas estão injetados
registerSystemRoutes(app); 
registerMediaRoutes(app, { authenticateToken, uploadDir });

app.locals.dataDir = dataDir;

// ── ROTAS DE AUTENTICAÇÃO (JWT & Senha) ──
registerAuthRoutes(app, { JWT_SECRET });

// ── ELO ARCANO (MENSAGERIA MOBILE SSE) PREMIUM ──
const playerConnections = new Map(); // characterId -> { res, tableId, nome, sessionToken }
const masterConnections = new Map(); // masterId -> res
const messageHistory = new Map(); // tableId -> Array of messages
const throttleState = new Map(); // masterId -> lastMessageTime

// ── SESSÕES POR QR CODE (TOME.SINAL V2) ──
let sessionTokens = new Map(); // sessionToken -> { characterId, tableId, connected, nome, avatar, classe }
let activeTables = new Map(); // tableId -> Set of sessionTokens

async function loadSessions() {
    const prisma = getPrisma();
    if (prisma) {
        try {
            const tableSessions = await prisma.tableSession.findMany();
            const playerSessions = await prisma.playerSession.findMany();
            
            activeTables = new Map();
            for (const t of tableSessions) {
                activeTables.set(t.tableId, new Set());
            }
            
            sessionTokens = new Map();
            for (const p of playerSessions) {
                if (activeTables.has(p.tableId)) {
                    activeTables.get(p.tableId).add(p.sessionToken);
                } else {
                    activeTables.set(p.tableId, new Set([p.sessionToken]));
                }
                
                sessionTokens.set(p.sessionToken, {
                    characterId: p.characterId,
                    tableId: p.tableId,
                    connected: false,
                    nome: p.nome,
                    avatar: p.avatar,
                    classe: p.classe
                });
            }
            console.log(`[NodeServer] Carregado ${sessionTokens.size} sessões do banco de dados (${getDbType()}).`);
        } catch (err) {
             console.error(`[NodeServer] Erro ao carregar sessões do Prisma:`, err);
        }
    } else {
        try {
            const data = await getDocument('sessions_db.json', dataDir);
            if (data && data.tokens && data.tables) {
                sessionTokens = new Map(data.tokens);
                activeTables = new Map(data.tables.map(([k, v]) => [k, new Set(v)]));
                for (const session of sessionTokens.values()) {
                    session.connected = false;
                }
                console.log(`[NodeServer] Carregado ${sessionTokens.size} sessões persistidas (Legado).`);
            }
        } catch(err) {
            console.log(`[NodeServer] Nenhuma sessão anterior encontrada.`);
        }
    }
}

async function saveSessions() {
    const prisma = getPrisma();
    if (prisma) {
        try {
            for (const [tableId] of activeTables.entries()) {
                await prisma.tableSession.upsert({
                    where: { tableId },
                    update: {},
                    create: { tableId }
                });
            }
            for (const [token, data] of sessionTokens.entries()) {
                await prisma.playerSession.upsert({
                    where: { sessionToken: token },
                    update: {
                        characterId: data.characterId,
                        connected: data.connected,
                        nome: data.nome,
                        avatar: data.avatar,
                        classe: data.classe,
                        updatedAt: new Date()
                    },
                    create: {
                        sessionToken: token,
                        tableId: data.tableId,
                        characterId: data.characterId,
                        connected: data.connected,
                        nome: data.nome,
                        avatar: data.avatar,
                        classe: data.classe
                    }
                });
            }
        } catch (err) {
            console.error('[NodeServer] Erro ao persistir sessões no Prisma:', err);
        }
    } else {
        const data = {
            tokens: Array.from(sessionTokens.entries()),
            tables: Array.from(activeTables.entries()).map(([k, v]) => [k, Array.from(v)])
        };
        await saveDocument('sessions_db.json', data, dataDir);
    }
}

// Limpeza de conexões antigas
setInterval(() => {
    // Manutenção preventiva de estruturas em memória (o histórico agora é persistido no disco via Sync-Mesh)
}, 15 * 60 * 1000); // A cada 15 minutos

// Rota de Sistema e QR Code Extraída

// Iniciar Sessão de Chat
app.post('/api/sessao/iniciar', (req, res) => {
    const { tableId, personagens } = req.body;
    if (!tableId || !personagens) {
        return res.status(400).json({ error: 'Missing tableId or personagens' });
    }

    if (activeTables.has(tableId)) {
        for (const token of activeTables.get(tableId)) {
            sessionTokens.delete(token);
        }
    }
    const newTokens = new Set();
    const result = [];

    for (const char of personagens) {
        const token = crypto.randomUUID();
        newTokens.add(token);
        sessionTokens.set(token, {
            characterId: char.id,
            tableId: tableId,
            connected: false,
            nome: char.name || 'Desconhecido',
            avatar: char.avatar || '',
            classe: char.class || ''
        });
        result.push({ characterId: char.id, sessionToken: token, nome: char.name });
    }
    activeTables.set(tableId, newTokens);
    saveSessions(); // Persiste a nova sessão

    res.json({ status: 'success', tokens: result });
});

// Resgatar Tokens Ativos de uma Mesa
app.get('/api/sessao/:tableId/tokens', (req, res) => {
    const tableId = req.params.tableId;
    if (!activeTables.has(tableId)) {
        return res.json({ status: 'inactive', tokens: [] });
    }
    
    const result = [];
    for (const token of activeTables.get(tableId)) {
        const info = sessionTokens.get(token);
        if (info) {
            result.push({
                characterId: info.characterId,
                sessionToken: token,
                nome: info.nome,
                connected: info.connected
            });
        }
    }
    res.json({ status: 'active', tokens: result });
});

// Encerrar Sessão de Chat
app.post('/api/sessao/encerrar', (req, res) => {
    const { tableId } = req.body;
    if (tableId && activeTables.has(tableId)) {
        for (const token of activeTables.get(tableId)) {
            sessionTokens.delete(token);
            // Drop connection if active
            for (const [charId, conn] of playerConnections.entries()) {
                if (conn.sessionToken === token) {
                    conn.res.end();
                    playerConnections.delete(charId);
                }
            }
        }
        activeTables.delete(tableId);
        saveSessions(); // Atualiza persistência
        cleanupSession(tableId); // Limpa memória do SyncEngine
    }
    res.json({ status: 'success' });
});

// Servir app do jogador mapeado pelo token
app.get('/jogador/:sessionToken', (req, res) => {
    const { sessionToken } = req.params;
    
    // Se a rota for exatamente /jogador
    if (!sessionToken || sessionToken === 'index.html' || sessionToken === 'js' || sessionToken === 'css') {
        // Verifica se tem cookie
        const cookieHeader = req.headers.cookie || '';
        const match = cookieHeader.match(/(?:^| )tome_player_session=([^;]+)/);
        const token = match ? match[1] : null;

        if (!token || !sessionTokens.has(token)) {
            return res.status(401).send('Acesso Negado: Você precisa escanear o QR Code da mesa.');
        }
        return res.sendFile(path.join(PSScriptRoot, 'jogador', 'index.html'));
    }

    if (!sessionTokens.has(sessionToken)) {
        return res.status(404).send('Sessão expirada ou token inválido. Peça um novo QR Code ao Mestre.');
    }
    
    // Configura cookie HTTP-Only
    res.cookie('tome_player_session', sessionToken, { 
        httpOnly: true, 
        maxAge: 12 * 60 * 60 * 1000, // 12h
        sameSite: 'lax'
    });
    
    // Redireciona para a URL limpa para esconder o token
    return res.redirect('/jogador');
});

// A Rota base /jogador (após o redirect)
app.get('/jogador', (req, res) => {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/(?:^| )tome_player_session=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token || !sessionTokens.has(token)) {
        return res.status(401).send('Acesso Negado: Você precisa escanear o QR Code da mesa.');
    }
    res.sendFile(path.join(PSScriptRoot, 'jogador', 'index.html'));
});

app.get('/api/sessao/token-info', (req, res) => {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/(?:^| )tome_player_session=([^;]+)/);
    const sessionToken = match ? match[1] : null;

    const sessionData = sessionTokens.get(sessionToken);

    if (!sessionData) {
        return res.status(401).json({ error: 'Token inválido ou sessão expirada' });
    }

    res.json({ ...sessionData, sessionToken });
});

// ── SYSTEMA SYNC-MESH MOVED TO SyncEngine.js ──

// Endpoint para acionar eventos de animação / FX via HTTP
app.post('/api/fx/trigger', (req, res) => {
    try {
        const { event, targetName, targetId, details } = req.body;
        io.emit('fx_animation', { event, targetName, targetId, details, timestamp: Date.now() });
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Rota para Tela de Transmissão (TV / Espectadores na sala)
app.get(['/transmissao', '/transmissão', '/espectador', '/transmissao.html', '/player-view.html'], (req, res) => {
    const targetPath = path.join(PSScriptRoot, 'public', 'transmissao.html');
    if (fs.existsSync(targetPath)) {
        res.sendFile(targetPath);
    } else {
        res.status(404).send('Página de transmissão indisponível no momento.');
    }
});


// Intercepta arquivos JSON do diretório /data/ servindo via Banco de Dados
app.get('/data/*', async (req, res, next) => {
    const filename = req.params[0];
    
    if (filename.endsWith('.json')) {
        try {
            const data = await getDocument(filename, dataDir);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ status: 'error', message: `Arquivo ${filename} não encontrado.` });
            }
        } catch (err) {
            console.error(`[NodeServer] Erro ao servir /data/${filename}:`, err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
    }
    
    next();
});

// --- ROTA DE CONFIGURAÇÃO DO CLIENTE ---
app.get('/api/config', (req, res) => {
    res.json({
        sentryDsn: process.env.SENTRY_DSN || null
    });
});

app.get('/api/proxy', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).send('Falta ?url=');
        const resposta = await fetch(url);
        const buffer = await resposta.arrayBuffer();
        const contentType = resposta.headers.get('content-type') || 'application/octet-stream';
        res.set('Content-Type', contentType);
        res.send(Buffer.from(buffer));
    } catch(err) {
        console.error('[Proxy] Erro:', err.message);
        res.status(500).send('Erro no proxy');
    }
});

app.post('/api/map-audio', (req, res) => {
    try {
        console.log('[NodeServer] Recebido comando de áudio do mapa:', req.body);
        // Broadcast para todos os clientes conectados (Master e Players)
        io.emit('map_audio', req.body);
        res.json({ status: 'success' });
    } catch(err) {
        console.error('[NodeServer] Erro ao retransmitir comando de áudio:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// --- ROTA DO SISTEMA DE REGRAS ATIVO ---
app.get('/api/system/active', async (req, res) => {
    try {
        let activeSystem = await getDocument('rule_system.json', dataDir);
        if (!activeSystem) {
            // Fallback padrão nativo D&D 5e e sistemas agnósticos TOME
            activeSystem = {
                id: 'default-5e',
                name: 'Dungeons & Dragons 5th Edition / Agnostic TOME',
                isActive: true,
                attributes: ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'],
                skills: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Persuasion', 'Stealth']
            };
        }
        res.json({ status: 'success', data: activeSystem });
    } catch (err) {
        console.error('[NodeServer] Erro ao buscar RuleSystem:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// 1. POST /api/save — Salva o estado completo da mesa (Com JWT se em produção)
app.post('/api/save', authenticateToken, async (req, res) => {
    try {
        const { filename, data } = req.body;
        let rawName = filename || 'state.json';
        
        // Sanitiza o nome do arquivo para evitar Directory Traversal
        let safeName = path.basename(rawName);
        safeName = safeName.replace(/[^a-zA-Z0-9_.-]/g, '');
        if (!safeName.toLowerCase().endsWith('.json')) {
            safeName = safeName + '.json';
        }
        if (!safeName || safeName === '.json') {
            safeName = 'state.json';
        }

        // Grava no banco de dados (ou fallback local)
        await saveDocument(safeName, data, dataDir);

        // Se for um arquivo de mesa (ex: mesa_123456.json ou mesa_campanha-1.json), propaga em tempo real via WebSockets
        const match = safeName.match(/^mesa_([a-zA-Z0-9_-]+)\.json$/);
        if (match) {
            const mesaId = match[1];
            io.to(mesaId).emit('state_update', data);
            console.log(`[NodeServer] [Socket.io] Broadcast de atualização de mesa enviado para a sala: ${mesaId}`);
        }

        res.json({ status: 'success' });
    } catch (err) {
        console.error('[NodeServer] Erro ao salvar:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// 1.1 GET /api/load — Carrega o estado de um documento (com suporte a Prisma ou fallback local)
app.get(['/api/load', '/api/data/:filename'], async (req, res) => {
    try {
        const rawName = req.query.filename || req.params.filename || 'state.json';
        let safeName = path.basename(rawName).replace(/[^a-zA-Z0-9_.-]/g, '');
        if (!safeName.toLowerCase().endsWith('.json')) {
            safeName += '.json';
        }
        const doc = await getDocument(safeName, dataDir);
        if (doc) {
            return res.json(doc);
        }
        res.status(404).json({ error: 'Documento não encontrado' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. POST /api/upload — Faz o upload de imagens base64 decodificando e salvando em disco (Com JWT se em produção)
app.post('/api/upload', authenticateToken, async (req, res) => {
    try {
        const { filename, base64 } = req.body;
        let rawName = filename || `upload_${Date.now()}.png`;

        let rawBase = req.body.base64 || req.body.image;
        if (!rawBase) return res.status(400).json({ error: 'Nenhum base64 fornecido.' });

        // Resolve extensão a partir do cabeçalho base64 data URI se disponível
        let ext = path.extname(rawName) || '.png';
        let cleanBase64 = rawBase;
        
        const match = rawBase.match(/^data:image\/([a-zA-Z+.-]+);base64,/);
        if (match) {
            let mimeSub = match[1].toLowerCase();
            if (mimeSub === 'jpeg' || mimeSub === 'jpg') ext = '.jpg';
            else if (mimeSub === 'png') ext = '.png';
            else if (mimeSub === 'webp') ext = '.webp';
            else if (mimeSub === 'gif') ext = '.gif';
            else if (mimeSub === 'svg+xml') ext = '.svg';
            cleanBase64 = rawBase.replace(match[0], '');
        }

        // Sanitiza o nome final garantindo a extensão apropriada
        let baseNameWithoutExt = path.basename(rawName, path.extname(rawName));
        let safeName = baseNameWithoutExt.replace(/[^a-zA-Z0-9_.-]/g, '') + ext;

        const buffer = Buffer.from(cleanBase64, 'base64');
        const filePath = path.join(uploadDir, safeName);
        await fs.promises.writeFile(filePath, buffer);

        const urlPath = `/public/uploads/${safeName}`;
        console.log(`[NodeServer] Imagem salva: ${urlPath}`);
        res.json({ status: 'success', url: urlPath });
    } catch (err) {
        console.error('[NodeServer] Erro no upload:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Cache control matches PowerShell implementation (no-store)
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Explicitly serve service-worker and manifest from public when in dev mode
app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(PSScriptRoot, 'public', 'service-worker.js'));
});
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(PSScriptRoot, 'public', 'manifest.json'));
});

// Serve estáticos da pasta /dist se o build do Vite foi feito, caso contrário serve da raiz
const distPath = path.join(PSScriptRoot, 'dist');
const cacheOptions = {
    setHeaders: (res, pathStr) => {
        if (pathStr.match(/\.(png|jpg|jpeg|webp|gif|svg|mp3|wav|ogg|mp4|webm)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days for heavy assets
        } else if (pathStr.match(/\.(js|css)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for code
        } else {
            res.setHeader('Cache-Control', 'no-cache'); // HTML always revalidates
        }
    }
};

if (fs.existsSync(distPath)) {
    console.log('[NodeServer] Diretório /dist encontrado. Servindo build de produção.');
    app.use('/', express.static(distPath, cacheOptions));
    // Serve os assets originais caso o Vite tenha alterado o nome com hash mas o código JS chame o path antigo
    app.use('/assets', express.static(path.join(PSScriptRoot, 'assets'), cacheOptions));
    app.use('/vendor', express.static(path.join(PSScriptRoot, 'public', 'vendor'), cacheOptions));
    app.use('/public', express.static(path.join(PSScriptRoot, 'public'), cacheOptions));
    app.use('/data', express.static(dataDir, cacheOptions));
    app.use('/node_modules', express.static(path.join(PSScriptRoot, 'node_modules'), cacheOptions));
} else {
    console.log('[NodeServer] Servindo arquivos estáticos a partir do modo desenvolvedor.');
    app.use('/', express.static(PSScriptRoot, cacheOptions));
    app.use('/vendor', express.static(path.join(PSScriptRoot, 'public', 'vendor'), cacheOptions));
    app.use('/public', express.static(path.join(PSScriptRoot, 'public'), cacheOptions));
    app.use('/data', express.static(dataDir, cacheOptions));
}

// Fallback para index.html nas rotas raiz
app.get('/', (req, res) => {
    const mainFile = fs.existsSync(distPath) 
        ? path.join(distPath, 'index.html') 
        : path.join(PSScriptRoot, 'index.html');
    res.sendFile(mainFile);
});

// ── GERENCIAMENTO DE CONEXÕES SOCKET.IO MOVED TO SyncEngine.js ──

// Função auxiliar para testar se uma porta está disponível
function testPort(port) {
    return new Promise((resolve) => {
        const serverInstance = net.createServer();
        serverInstance.once('error', () => {
            resolve(false);
        });
        serverInstance.once('listening', () => {
            serverInstance.close(() => {
                resolve(true);
            });
        });
        serverInstance.listen(port, '127.0.0.1');
    });
}

// Busca porta livre em cascata e com range alternativo
async function getAvailablePort(preferredPort) {
    const candidates = [...new Set([preferredPort, 8080, 8001])];
    for (const port of candidates) {
        if (port > 0 && await testPort(port)) {
            return port;
        }
    }
    
    // Escaneia portas livres aleatórias entre 9001 e 9999
    for (let i = 0; i < 100; i++) {
        const randomPort = Math.floor(Math.random() * (9999 - 9001 + 1)) + 9001;
        if (await testPort(randomPort)) {
            return randomPort;
        }
    }
    return preferredPort;
}

// Express error middleware
app.use((err, req, res, next) => {
    console.error('[NodeServer] Erro interno:', err);
    if (sentrySDK) {
        sentrySDK.captureException(err);
    }
    res.status(500).json({ status: 'error', message: err.message });
});

// Inicialização
let sentrySDK = null;
const SENTRY_DSN = process.env.SENTRY_DSN;

async function start() {
    // 1. Inicializa Conexão com o Banco de Dados (Postgres, MongoDB ou Fallback local)
    await initDb();
    
    // 2. Carrega as sessões ativas no disco
    await loadSessions();

    // Inicializa Sentry opcionalmente no backend
    if (SENTRY_DSN) {
        try {
            console.log('[NodeServer] Inicializando Sentry no backend...');
            sentrySDK = await import('@sentry/node');
            sentrySDK.init({
                dsn: SENTRY_DSN,
                tracesSampleRate: 0.1
            });
            console.log('[NodeServer] Sentry carregado com sucesso no backend.');
        } catch (e) {
            console.warn('[NodeServer] Falha ao carregar Sentry SDK backend (não instalado?):', e.message);
        }
    }

    let port = 4455;
    const envPort = process.env.PORT || process.env.SERVER_PORT;
    if (envPort) {
        const parsed = parseInt(envPort, 10);
        if (!isNaN(parsed) && parsed !== 0) {
            port = parsed;
        }
    }

    const finalPort = await getAvailablePort(port);
    
    server.listen(finalPort, '0.0.0.0', async () => {
        const { localIp } = getNetworkInfo();
        console.log(`\n================================================================================`);
        console.log(`           ✨ Mesa Psigologos — THE ATOMIC ENGINE ✨           
================================================================`);
        console.log(` [MESA DO MESTRE]    http://localhost:${finalPort}/`);
        console.log(` [TELÃO / PROJETOR]  http://localhost:${finalPort}/player-view.html`);
        console.log(` [APP LAN JOGADORES] http://${localIp}:${finalPort}/ (Conecte via Wi-Fi ou QR Code)`);
        
        // ── NOVO ACESSO ALTERNATIVO (Secundário) ──
        try {
            const secondaryPort = await getAvailablePort(8080);
            const serverLivre = http.createServer(app);
            io.attach(serverLivre); // Compartilha o mesmo WebSocket Engine
            serverLivre.listen(secondaryPort, '0.0.0.0', () => {
                console.log(`--------------------------------------------------------------------------------`);
                console.log(` [ACESSO ALTERNATIVO] http://${localIp}:${secondaryPort}/ (Livre para qualquer PC)`);
            });
        } catch(e) {
            console.log(` [ACESSO ALTERNATIVO] Indisponível no momento.`);
        }

        console.log(`--------------------------------------------------------------------------------`);
        console.log(` [STATUS] Yjs CRDT + Sockets LAN Ativos | Sincronização Delta (<16ms)`);
        console.log(` [STATUS] Banco de Dados (${getDbType()}) Integrado`);
        console.log(`================================================================================\n`);
        console.log(` Pressione Ctrl+C para encerrar com segurança.\n`);
    });

    // ── CONFIGURAÇÃO DO ENGINE DE SINCRONIZAÇÃO (WebSockets, Yjs, Socket.IO) ──
    setupSyncEngine(server, io, dataDir, app);
}

start();
