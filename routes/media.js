import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

export default function registerMediaRoutes(app, { authenticateToken, uploadDir }) {
    
    // Configuração do Multer para armazenamento em disco, poupando a RAM do Node.js
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const originalName = file.originalname || 'upload.png';
            const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '');
            const hex = crypto.randomBytes(8).toString('hex');
            cb(null, `${hex}_${safeName}`);
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 50 * 1024 * 1024 } // 50MB
    });

    // Rota de Upload Otimizada (Streaming via Multer - V19.2)
    app.post('/api/upload', authenticateToken, upload.single('imageFile'), async (req, res) => {
        try {
            // Caso seja feito upload tradicional (form-data) via Multer
            if (req.file) {
                const url = `/public/uploads/${req.file.filename}`;
                return res.json({ status: 'success', url });
            }

            // Fallback: se o cliente enviar base64 (req.body.image ou req.body.base64)
            const { filename, base64 } = req.body;
            let rawName = filename || `upload_${Date.now()}.png`;
            let rawBase = req.body.base64 || req.body.image;

            if (rawBase) {
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

                let baseNameWithoutExt = path.basename(rawName, path.extname(rawName));
                let safeName = baseNameWithoutExt.replace(/[^a-zA-Z0-9_.-]/g, '') + ext;

                const buffer = Buffer.from(cleanBase64, 'base64');
                const filePath = path.join(uploadDir, safeName);
                await fs.promises.writeFile(filePath, buffer);

                const urlPath = `/public/uploads/${safeName}`;
                return res.json({ status: 'success', url: urlPath });
            }

            return res.status(400).json({ error: 'Nenhum arquivo ou dado de imagem fornecido.' });
        } catch (err) {
            console.error('[Upload API] Erro no upload:', err);
            res.status(500).json({ status: 'error', message: err.message });
        }
    });

    // Rota para Trilha Sonora Local
    app.post('/api/map-audio', (req, res) => {
        try {
            const { action, filename } = req.body;
            res.json({ status: 'success' });
        } catch(e) {
            res.status(500).json({ status: 'error' });
        }
    });
}
