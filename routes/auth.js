import jwt from 'jsonwebtoken';
import { registerMaster, loginMaster } from '../controllers/AuthController.js';

export default function registerAuthRoutes(app, { JWT_SECRET }) {
    // Registro de um novo Mestre
    app.post('/api/auth/register', async (req, res) => {
        try {
            const { name, phone, password } = req.body;
            if (!name || !phone || !password) {
                return res.status(400).json({ status: 'error', message: 'Nome, telefone e senha são obrigatórios.' });
            }
            
            const master = await registerMaster(name, phone, password, req.app.locals.dataDir);
            
            const token = jwt.sign({
                phone: master.phone,
                masterId: master.masterId,
                internalId: master.internalId,
                name: master.name
            }, JWT_SECRET, { expiresIn: '30d' });
            
            res.json({ status: 'success', message: 'Mestre registrado com sucesso.', token, master });
        } catch (err) {
            console.error('[NodeServer] Erro no registro:', err);
            res.status(500).json({ status: 'error', message: err.message });
        }
    });

    // Login do Mestre
    app.post('/api/auth/login', async (req, res) => {
        try {
            const { phone, password } = req.body;
            if (!phone || !password) {
                return res.status(400).json({ status: 'error', message: 'Telefone e senha são obrigatórios.' });
            }
            
            const master = await loginMaster(phone, password, req.app.locals.dataDir);
            
            const token = jwt.sign({
                phone: master.phone,
                masterId: master.masterId,
                internalId: master.internalId,
                name: master.name
            }, JWT_SECRET, { expiresIn: '30d' });
            
            res.json({ status: 'success', token, master });
        } catch (err) {
            console.error('[NodeServer] Erro no login:', err);
            res.status(401).json({ status: 'error', message: err.message });
        }
    });
}
