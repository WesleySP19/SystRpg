import express from 'express';
import fs from 'fs';
import path from 'path';
import net from 'net';
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { initDb, getDocument, saveDocument, getDbType } from './utils/db.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Aumenta o limite de payload JSON para suportar uploads base64 grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sincroniza o diretório de trabalho com a pasta do script
const PSScriptRoot = __dirname;
process.chdir(PSScriptRoot);

// Garante que os diretórios necessários existam
const dataDir = path.join(PSScriptRoot, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
const uploadDir = path.join(PSScriptRoot, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Chave Secreta JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tome_secret_rpg_2026_default';
const smsCodes = new Map(); // phone -> { code, name, expires }

// Helper para gerenciar o diretório de mestres
async function getOrCreateMasterInDb(name, phone) {
    const directory = await getDocument('masters_directory.json', dataDir) || [];
    const normalizedPhone = phone.replace(/\D/g, '');
    let master = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
    
    if (!master) {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const masterId = `${cleanName}-${normalizedPhone}`;
        
        let internalId = '';
        let isUnique = false;
        while (!isUnique) {
            const hex = Math.floor(0x100000 + Math.random() * 0xefffff).toString(16).toUpperCase();
            internalId = `DGH-MST-${hex}`;
            isUnique = !directory.some(m => m.internalId === internalId);
        }
        
        master = {
            name: name.trim(),
            phone: phone.trim(),
            masterId: masterId,
            internalId: internalId,
            tables: [],
            createdAt: Date.now()
        };
        directory.push(master);
        await saveDocument('masters_directory.json', directory, dataDir);
    } else if (name && name.trim() && master.name !== name.trim()) {
        master.name = name.trim();
        await saveDocument('masters_directory.json', directory, dataDir);
    }
    return master;
}

// Middleware de Autenticação JWT Opcional/Resiliente
function authenticateToken(req, res, next) {
    // Se estiver rodando sem banco de dados (LAN offline local), ignora JWT
    if (getDbType() === 'file') {
        return next();
    }
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Acesso negado. Token não fornecido.' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ status: 'error', message: 'Sessão inválida ou expirada. Faça login novamente.' });
        }
        req.user = user;
        next();
    });
}

// ── ROTAS DE AUTENTICAÇÃO (JWT & SMS Simulado) ──

// Envia código de verificação
app.post('/api/auth/send-code', (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ status: 'error', message: 'Nome e telefone são obrigatórios.' });
        }
        
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        smsCodes.set(phone, {
            code,
            name,
            expires: Date.now() + 5 * 60 * 1000 // 5 minutos de validade
        });
        
        console.log(`[NodeServer] [SMS SIMULADO] Código de verificação para ${name} (${phone}): ${code}`);
        res.json({ status: 'success', message: 'Código SMS gerado com sucesso.', simulatedCode: code });
    } catch (err) {
        console.error('[NodeServer] Erro no send-code:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Verifica código e emite JWT
app.post('/api/auth/verify-code', async (req, res) => {
    try {
        const { name, phone, code } = req.body;
        if (!phone || !code) {
            return res.status(400).json({ status: 'error', message: 'Telefone e código são obrigatórios.' });
        }
        
        const record = smsCodes.get(phone);
        if (!record || record.code !== code || Date.now() > record.expires) {
            return res.status(400).json({ status: 'error', message: 'Código incorreto ou expirado.' });
        }
        
        smsCodes.delete(phone);
        
        const masterName = name || record.name;
        const master = await getOrCreateMasterInDb(masterName, phone);
        
        const token = jwt.sign({
            phone: master.phone,
            masterId: master.masterId,
            internalId: master.internalId,
            name: master.name
        }, JWT_SECRET, { expiresIn: '30d' });
        
        res.json({ status: 'success', token, master });
    } catch (err) {
        console.error('[NodeServer] Erro no verify-code:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Intercepta arquivos JSON do diretório /data/ servindo via Banco de Dados
app.get('/data/:filename', async (req, res, next) => {
    const filename = req.params.filename;
    
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

// --- ROTA DO SISTEMA DE REGRAS ATIVO ---
app.get('/api/system/active', async (req, res) => {
    try {
        const activeSystem = await prisma.ruleSystem.findFirst({
            where: { isActive: true }
        });
        
        if (!activeSystem) {
            // Fallback para caso o DB não esteja pronto
            return res.json({ 
                status: 'error', 
                message: 'No active rule system found. Please run seed script.' 
            });
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

        // Se for um arquivo de mesa (ex: mesa_123456.json), propaga em tempo real via WebSockets
        const match = safeName.match(/^mesa_(\d+)\.json$/);
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

// 2. POST /api/upload — Faz o upload de imagens base64 decodificando e salvando em disco (Com JWT se em produção)
app.post('/api/upload', authenticateToken, (req, res) => {
    try {
        const { filename, base64 } = req.body;
        let rawName = filename || `upload_${Date.now()}.png`;

        // Resolve extensão a partir do cabeçalho base64 data URI se disponível
        let ext = path.extname(rawName) || '.png';
        let cleanBase64 = base64;
        
        const match = base64.match(/^data:image\/([a-zA-Z+.-]+);base64,/);
        if (match) {
            let mimeSub = match[1].toLowerCase();
            if (mimeSub === 'jpeg' || mimeSub === 'jpg') ext = '.jpg';
            else if (mimeSub === 'png') ext = '.png';
            else if (mimeSub === 'webp') ext = '.webp';
            else if (mimeSub === 'gif') ext = '.gif';
            else if (mimeSub === 'svg+xml') ext = '.svg';
            cleanBase64 = base64.replace(match[0], '');
        }

        // Sanitiza o nome final garantindo a extensão apropriada
        let baseNameWithoutExt = path.basename(rawName, path.extname(rawName));
        let safeName = baseNameWithoutExt.replace(/[^a-zA-Z0-9_.-]/g, '') + ext;

        const buffer = Buffer.from(cleanBase64, 'base64');
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, buffer);

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

// Serve estáticos da pasta /dist se o build do Vite foi feito, caso contrário serve da raiz
const distPath = path.join(PSScriptRoot, 'dist');
if (fs.existsSync(distPath)) {
    console.log('[NodeServer] Servindo arquivos de produção a partir de /dist');
    app.use('/', express.static(distPath));
} else {
    app.use('/', express.static(PSScriptRoot));
}

// Fallback para index.html nas rotas raiz
app.get('/', (req, res) => {
    const mainFile = fs.existsSync(distPath) 
        ? path.join(distPath, 'index.html') 
        : path.join(PSScriptRoot, 'index.html');
    res.sendFile(mainFile);
});

// ── GERENCIAMENTO DE CONEXÕES SOCKET.IO ──
io.on('connection', (socket) => {
    console.log(`[NodeServer] [Socket] Novo cliente conectado: ${socket.id}`);
    
    // Entrar na sala da mesa de jogo correspondente
    socket.on('joinRoom', ({ mesaId }) => {
        if (mesaId) {
            socket.join(mesaId);
            console.log(`[NodeServer] [Socket] Cliente ${socket.id} entrou na sala da mesa: ${mesaId}`);
        }
    });
    
    // Responder a ping de telemetria
    socket.on('ping_perf', (timestamp) => {
        socket.emit('pong_perf', timestamp);
    });

    // Escutar por Deltas (Performance / Escalabilidade)
    socket.on('delta_update', (payload) => {
        if (payload && payload.mesaId) {
            socket.to(payload.mesaId).emit('delta_update', payload);
        }
    });

    // Escutar por Estado Completo (Sincronização do Mestre para Jogadores)
    socket.on('state_update', (payload) => {
        if (payload && payload.mesaId) {
            socket.to(payload.mesaId).emit('state_update', payload.state);
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`[NodeServer] [Socket] Cliente desconectado: ${socket.id}`);
    });
});

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

    let port = 8000;
    const envPort = process.env.PORT || process.env.SERVER_PORT;
    if (envPort) {
        const parsed = parseInt(envPort, 10);
        if (!isNaN(parsed) && parsed !== 0) {
            port = parsed;
        }
    }

    const finalPort = await getAvailablePort(port);
    
    server.listen(finalPort, () => {
        console.log(`--- DOMÍNIO RPG VTT (Node.js + WebSockets + DB Híbrido) ---`);
        console.log(`Servidor Ativo em: http://localhost:${finalPort}`);
        console.log(`Pressione Ctrl+C para encerrar.`);
    });
}

start();
