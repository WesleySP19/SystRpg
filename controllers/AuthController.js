import jwt from 'jsonwebtoken';
import { getDocument, saveDocument, getDbType, getPrisma } from '../utils/db.js';

export function createAuthMiddleware(JWT_SECRET) {
    return function authenticateToken(req, res, next) {
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
    };
}

export async function getOrCreateMasterInDb(name, phone, dataDir) {
    const prisma = getPrisma();
    const normalizedPhone = phone.replace(/\D/g, '');
    
    if (getDbType() === 'sqlite' && prisma) {
        let master = await prisma.master.findUnique({
            where: { phone: normalizedPhone }
        });
        
        if (!master) {
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
                    masterId: masterId,
                    internalId: internalId,
                    tables: '[]'
                }
            });
        } else if (name && name.trim() && master.name !== name.trim()) {
            master = await prisma.master.update({
                where: { phone: normalizedPhone },
                data: { name: name.trim() }
            });
        }
        
        return {
            ...master,
            tables: JSON.parse(master.tables || '[]'),
            createdAt: master.createdAt.getTime()
        };
    } else {
        const directory = await getDocument('masters_directory.json', dataDir) || [];
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
                phone: normalizedPhone,
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
}
