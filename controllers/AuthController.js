import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDocument, saveDocument, getDbType, getPrisma } from '../utils/db.js';

export function createAuthMiddleware(JWT_SECRET) {
    return function authenticateToken(req, res, next) {
        const isProduction = process.env.NODE_ENV === 'production';
        const isLocalFileMode = getDbType() === 'file';

        // Em modo de desenvolvimento ou rede local/arquivo, permite persistência sem bloquear com 401
        if (!isProduction || isLocalFileMode) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (token) {
                jwt.verify(token, JWT_SECRET, (err, user) => {
                    if (!err) req.user = user;
                });
            }
            return next();
        }
        
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        // Verifica se é uma requisição autenticada de jogador via QR code / sessionToken
        const playerToken = req.headers['x-player-token'] || 
            (req.headers.cookie && req.headers.cookie.match(/tome_player_session=([^;]+)/)?.[1]);
        if (playerToken && req.app?.locals?.sessionTokens?.has(playerToken)) {
            const playerSession = req.app.locals.sessionTokens.get(playerToken);
            req.user = { role: 'player', ...playerSession };
            return next();
        }

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
    };
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash) return false;
    const [salt, hash] = storedHash.split(':');
    const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}

export async function registerMaster(name, phone, password, dataDir) {
    const prisma = getPrisma();
    const normalizedPhone = phone.replace(/\D/g, '');
    const hashedPassword = hashPassword(password);
    
    if (prisma) {
        let master = await prisma.master.findUnique({
            where: { phone: normalizedPhone }
        });
        
        if (master) {
            throw new Error('Telefone já cadastrado.');
        }
        
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const masterId = `${cleanName}-${normalizedPhone}`;
        let internalId = '';
        let isUnique = false;
        while (!isUnique) {
            const hex = Math.floor(0x100000 + Math.random() * 0xefffff).toString(16).toUpperCase();
            internalId = `DGH-MST-${hex}`;
            const existing = await prisma.master.findUnique({ where: { internalId } });
            isUnique = !existing;
        }
        
        master = await prisma.master.create({
            data: {
                name: name.trim(),
                phone: normalizedPhone,
                password: hashedPassword,
                masterId: masterId,
                internalId: internalId,
                tables: '[]'
            }
        });
        
        return {
            ...master,
            tables: JSON.parse(master.tables || '[]'),
            createdAt: master.createdAt.getTime()
        };
    }
    
    // Fallback file persistence
    const directory = await getDocument('masters_directory.json', dataDir) || [];
    let master = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
    
    if (master) {
        throw new Error('Telefone já cadastrado.');
    }
    
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
        phone: normalizedPhone,
        password: hashedPassword,
        masterId: masterId,
        internalId: internalId,
        tables: [],
        createdAt: Date.now()
    };
    directory.push(master);
    await saveDocument('masters_directory.json', directory, dataDir);
    return master;
}

export async function loginMaster(phone, password, dataDir) {
    const prisma = getPrisma();
    const normalizedPhone = phone.replace(/\D/g, '');
    
    if (prisma) {
        let master = await prisma.master.findUnique({
            where: { phone: normalizedPhone }
        });
        
        if (!master) {
            const directory = await getDocument('masters_directory.json', dataDir) || [];
            const fileMaster = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
            if (fileMaster) {
                master = fileMaster;
            } else {
                throw new Error('Mestre não cadastrado. Verifique o número ou crie sua conta.');
            }
        }
        
        // Se a conta não possui senha cadastrada (criada no sistema anterior sem senha), salva a senha digitada agora!
        if (!master.password) {
            const hashedPassword = hashPassword(password);
            try {
                await prisma.master.update({
                    where: { phone: normalizedPhone },
                    data: { password: hashedPassword }
                }).catch(() => {});
            } catch(e) {}
            return {
                ...master,
                tables: typeof master.tables === 'string' ? JSON.parse(master.tables || '[]') : (master.tables || []),
                createdAt: master.createdAt ? (typeof master.createdAt.getTime === 'function' ? master.createdAt.getTime() : master.createdAt) : Date.now()
            };
        }
        
        if (!verifyPassword(password, master.password)) {
            throw new Error('Senha incorreta. Use a opção "Esqueci a Senha" ou acesse com Telefone.');
        }
        
        return {
            ...master,
            tables: typeof master.tables === 'string' ? JSON.parse(master.tables || '[]') : (master.tables || []),
            createdAt: master.createdAt ? (typeof master.createdAt.getTime === 'function' ? master.createdAt.getTime() : master.createdAt) : Date.now()
        };
    }
    
    // Fallback file persistence
    const directory = await getDocument('masters_directory.json', dataDir) || [];
    const master = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
    
    if (!master) {
        throw new Error('Mestre não cadastrado. Verifique o número ou crie sua conta.');
    }

    if (!master.password) {
        master.password = hashPassword(password);
        await saveDocument('masters_directory.json', directory, dataDir);
        return master;
    }
    
    if (!verifyPassword(password, master.password)) {
        throw new Error('Senha incorreta. Use a opção "Esqueci a Senha" ou acesse com Telefone.');
    }
    
    return master;
}

export async function quickLoginMaster(phone, dataDir) {
    const prisma = getPrisma();
    const normalizedPhone = phone.replace(/\D/g, '');
    
    if (prisma) {
        let master = await prisma.master.findUnique({
            where: { phone: normalizedPhone }
        });
        
        if (!master) {
            const directory = await getDocument('masters_directory.json', dataDir) || [];
            const fileMaster = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
            if (fileMaster) {
                master = fileMaster;
            }
        }
        
        if (!master) {
            throw new Error('Telefone não encontrado. Cadastre-se como Novo Mestre para começar.');
        }
        
        return {
            ...master,
            tables: typeof master.tables === 'string' ? JSON.parse(master.tables || '[]') : (master.tables || []),
            createdAt: master.createdAt ? (typeof master.createdAt.getTime === 'function' ? master.createdAt.getTime() : master.createdAt) : Date.now()
        };
    }
    
    const directory = await getDocument('masters_directory.json', dataDir) || [];
    const master = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
    if (!master) {
        throw new Error('Telefone não encontrado. Cadastre-se como Novo Mestre para começar.');
    }
    return master;
}

export async function resetPassword(phone, newPassword, dataDir) {
    const prisma = getPrisma();
    const normalizedPhone = phone.replace(/\D/g, '');
    const hashedPassword = hashPassword(newPassword);
    
    let updatedMaster = null;

    if (prisma) {
        try {
            const master = await prisma.master.findUnique({ where: { phone: normalizedPhone } });
            if (master) {
                const res = await prisma.master.update({
                    where: { phone: normalizedPhone },
                    data: { password: hashedPassword }
                });
                updatedMaster = {
                    ...res,
                    tables: typeof res.tables === 'string' ? JSON.parse(res.tables || '[]') : (res.tables || []),
                    createdAt: res.createdAt ? (typeof res.createdAt.getTime === 'function' ? res.createdAt.getTime() : res.createdAt) : Date.now()
                };
            }
        } catch (e) {
            console.warn('[AuthController] Falha ao atualizar senha no Prisma:', e.message);
        }
    }
    
    const directory = await getDocument('masters_directory.json', dataDir) || [];
    const fileMaster = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
    if (fileMaster) {
        fileMaster.password = hashedPassword;
        await saveDocument('masters_directory.json', directory, dataDir);
        if (!updatedMaster) {
            updatedMaster = fileMaster;
        }
    }
    
    if (!updatedMaster) {
        throw new Error('Nenhum mestre cadastrado com este telefone.');
    }
    
    return updatedMaster;
}
