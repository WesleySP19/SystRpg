import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export default function registerMediaRoutes(app, { authenticateToken, uploadDir }) {
    // Rota de Upload de Imagens
    app.post('/api/upload', authenticateToken, async (req, res) => {
        try {
            const { filename, image } = req.body;
            if (!filename || !image) {
                return res.status(400).json({ error: 'Missing filename or image data' });
            }

            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const safeFilename = `${crypto.randomBytes(8).toString('hex')}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
            const filepath = path.join(uploadDir, safeFilename);

            await fs.promises.writeFile(filepath, buffer);
            const url = `/uploads/${safeFilename}`;
            
            res.json({ status: 'success', url });
        } catch (err) {
            console.error('[Upload API] Falha no upload:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Rota para Trilha Sonora Local
    app.post('/api/map-audio', (req, res) => {
        try {
            const { action, filename } = req.body;
            // A lógica de broadcast do áudio pode ser disparada via socket no Frontend
            // Isso aqui serve apenas como um middleware de validação se necessário
            res.json({ status: 'success' });
        } catch(e) {
            res.status(500).json({ status: 'error' });
        }
    });
}
