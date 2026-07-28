import fs from 'fs';
import path from 'path';

let pgClient = null;
let mongoClient = null;
let dbType = 'file'; // 'file', 'postgres', 'mongodb'

export async function initDb() {
    const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

    if (dbUrl) {
        try {
            console.log('[DB] Tentando inicializar conexão PostgreSQL...');
            const { default: pg } = await import('pg');
            const { Client } = pg;
            
            pgClient = new Client({
                connectionString: dbUrl,
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
            });
            await pgClient.connect();

            // Cria a tabela padrão para armazenamento de documentos se não existir
            await pgClient.query(`
                CREATE TABLE IF NOT EXISTS tome_data (
                    filename VARCHAR(255) PRIMARY KEY,
                    data JSONB NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            dbType = 'postgres';
            console.log('[DB] Conectado ao PostgreSQL com sucesso. Tabela "tome_data" pronta.');
            return;
        } catch (err) {
            console.error('[DB] Erro ao conectar ao PostgreSQL, tentando outros métodos:', err.message);
        }
    }

    if (mongoUri) {
        try {
            console.log('[DB] Tentando inicializar conexão MongoDB...');
            const { MongoClient } = await import('mongodb');
            
            mongoClient = new MongoClient(mongoUri);
            await mongoClient.connect();

            dbType = 'mongodb';
            console.log('[DB] Conectado ao MongoDB com sucesso.');
            return;
        } catch (err) {
            console.error('[DB] Erro ao conectar ao MongoDB, caindo no filesystem:', err.message);
        }
    }

    console.log('[DB] Usando persistência baseada em arquivos JSON locais (Modo LAN/Offline).');
}

export function getDbType() {
    return dbType;
}

export async function getDocument(filename, dataDir) {
    if (dbType === 'postgres') {
        try {
            const res = await pgClient.query('SELECT data FROM tome_data WHERE filename = $1', [filename]);
            if (res.rows.length > 0) {
                return res.rows[0].data;
            }
            
            // Fallback: se não estiver no banco, tenta ler do arquivo físico local e auto-migra
            const localPath = path.join(dataDir, filename);
            if (fs.existsSync(localPath)) {
                const content = fs.readFileSync(localPath, 'utf8');
                try {
                    const parsed = JSON.parse(content);
                    await saveDocument(filename, parsed, dataDir);
                    console.log(`[DB] Auto-migrado arquivo local '${filename}' para o PostgreSQL.`);
                    return parsed;
                } catch (e) {
                    console.error(`[DB] Erro ao ler JSON local para migração '${filename}':`, e.message);
                }
            }
        } catch (err) {
            console.error(`[DB] Erro ao recuperar documento '${filename}' no PostgreSQL:`, err.message);
        }
        return null;
    } else if (dbType === 'mongodb') {
        try {
            const db = mongoClient.db();
            const doc = await db.collection('tome_data').findOne({ _id: filename });
            if (doc) {
                return doc.data;
            }

            // Fallback: tenta ler do arquivo físico local e auto-migra
            const localPath = path.join(dataDir, filename);
            if (fs.existsSync(localPath)) {
                const content = fs.readFileSync(localPath, 'utf8');
                try {
                    const parsed = JSON.parse(content);
                    await saveDocument(filename, parsed, dataDir);
                    console.log(`[DB] Auto-migrado arquivo local '${filename}' para o MongoDB.`);
                    return parsed;
                } catch (e) {
                    console.error(`[DB] Erro ao ler JSON local para migração '${filename}':`, e.message);
                }
            }
        } catch (err) {
            console.error(`[DB] Erro ao recuperar documento '${filename}' no MongoDB:`, err.message);
        }
        return null;
    } else {
        // Filesystem local
        const localPath = path.join(dataDir, filename);
        if (fs.existsSync(localPath)) {
            try {
                const content = fs.readFileSync(localPath, 'utf8');
                return JSON.parse(content);
            } catch (e) {
                console.error(`[DB] Erro ao analisar arquivo JSON '${filename}':`, e.message);
                return null;
            }
        }
        return null;
    }
}

export async function saveDocument(filename, data, dataDir) {
    if (dbType === 'postgres') {
        try {
            await pgClient.query(`
                INSERT INTO tome_data (filename, data, updated_at) 
                VALUES ($1, $2, CURRENT_TIMESTAMP) 
                ON CONFLICT (filename) 
                DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
            `, [filename, JSON.stringify(data)]);
        } catch (err) {
            console.error(`[DB] Erro ao salvar documento '${filename}' no PostgreSQL:`, err.message);
            throw err;
        }
    } else if (dbType === 'mongodb') {
        try {
            const db = mongoClient.db();
            await db.collection('tome_data').updateOne(
                { _id: filename },
                { $set: { data, updated_at: new Date() } },
                { upsert: true }
            );
        } catch (err) {
            console.error(`[DB] Erro ao salvar documento '${filename}' no MongoDB:`, err.message);
            throw err;
        }
    } else {
        // Filesystem local
        const localPath = path.join(dataDir, filename);
        try {
            fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            console.error(`[DB] Erro ao gravar arquivo local '${filename}':`, err.message);
            throw err;
        }
    }
}
