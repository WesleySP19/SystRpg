import jwt from 'jsonwebtoken';

export default function registerAuthRoutes(app, { smsCodes, JWT_SECRET, getOrCreateMasterInDb }) {
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
}
