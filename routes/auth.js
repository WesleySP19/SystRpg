import jwt from 'jsonwebtoken';
import { registerMaster, loginMaster, quickLoginMaster, resetPassword } from '../controllers/AuthController.js';

function sanitizeMaster(master) {
    if (!master) return null;
    const safe = { ...master };
    delete safe.password;
    return safe;
}

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
            
            res.json({ status: 'success', message: 'Mestre registrado com sucesso.', token, master: sanitizeMaster(master) });
        } catch (err) {
            console.error('[NodeServer] Erro no registro:', err);
            res.status(500).json({ status: 'error', message: err.message });
        }
    });

    // Login do Mestre com Senha
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
            
            res.json({ status: 'success', token, master: sanitizeMaster(master) });
        } catch (err) {
            console.error('[NodeServer] Erro no login:', err);
            res.status(401).json({ status: 'error', message: err.message });
        }
    });

    // Acesso Rápido do Mestre (Modo Clássico / Sem Senha)
    app.post('/api/auth/quick-login', async (req, res) => {
        try {
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ status: 'error', message: 'Telefone é obrigatório.' });
            }

            const master = await quickLoginMaster(phone, req.app.locals.dataDir);

            const token = jwt.sign({
                phone: master.phone,
                masterId: master.masterId,
                internalId: master.internalId,
                name: master.name
            }, JWT_SECRET, { expiresIn: '30d' });

            res.json({ status: 'success', token, master: sanitizeMaster(master) });
        } catch (err) {
            console.error('[NodeServer] Erro no acesso rápido:', err);
            res.status(404).json({ status: 'error', message: err.message });
        }
    });

    // Redefinição de Senha do Mestre (Esqueci a Senha)
    app.post('/api/auth/reset-password', async (req, res) => {
        try {
            const { phone, newPassword } = req.body;
            if (!phone || !newPassword) {
                return res.status(400).json({ status: 'error', message: 'Telefone e nova senha são obrigatórios.' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ status: 'error', message: 'A nova senha deve possuir pelo menos 6 caracteres.' });
            }

            const master = await resetPassword(phone, newPassword, req.app.locals.dataDir);

            const token = jwt.sign({
                phone: master.phone,
                masterId: master.masterId,
                internalId: master.internalId,
                name: master.name
            }, JWT_SECRET, { expiresIn: '30d' });

            res.json({ status: 'success', message: 'Senha redefinida com sucesso.', token, master: sanitizeMaster(master) });
        } catch (err) {
            console.error('[NodeServer] Erro na redefinição de senha:', err);
            res.status(400).json({ status: 'error', message: err.message });
        }
    });
}
