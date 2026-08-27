import fs from 'fs';
import path from 'path';
let prisma;
let dbType = 'file';
export async function initDb() {
try {
const { PrismaClient } = await import('@prisma/client');
console.log('[DB] Inicializando conexão SQLite (Prisma)...');
prisma = new PrismaClient();
await prisma.$connect();
await prisma.master.count().catch(() => {});
dbType = 'sqlite';
console.log('[DB] Conectado ao SQLite local com sucesso.');
} catch (err) {
console.log('[DB] Operando no modo nativo de arquivos locais (/data) - Rápido & Zero-Config.');
dbType = 'file';
prisma = null;
}
}
export function getDbType() {
return dbType;
}
export function getPrisma() {
return prisma;
}
export async function getDocument(filename, dataDir) {
if (dbType === 'sqlite' && prisma) {
try {
const docId = filename.replace('.json', '');
const doc = await prisma.stateDocument.findUnique({ where: { id: docId } });
if (doc && doc.content) {
return JSON.parse(doc.content);
}
} catch (e) {
console.error(`[DB] Erro ao ler document do Prisma: ${e.message}`);
}
}
const localPath = path.join(dataDir, filename);
try {
let content = await fs.promises.readFile(localPath, 'utf8');
content = content.replace(/^\uFEFF/, '').trim();
return JSON.parse(content);
} catch (e) {
return null;
}
}
export async function saveDocument(filename, data, dataDir) {
if (dbType === 'sqlite' && prisma) {
try {
const docId = filename.replace('.json', '');
const content = JSON.stringify(data);
await prisma.stateDocument.upsert({
where: { id: docId },
update: { content },
create: { id: docId, content }
});
return;
} catch (e) {
console.error(`[DB] Erro ao salvar document no Prisma: ${e.message}`);
}
}
const localPath = path.join(dataDir, filename);
const tempPath = path.join(dataDir, filename + '.tmp');
try {
await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2));
await fs.promises.rename(tempPath, localPath);
} catch (e) {
console.error(`[DB] Falha crítica ao salvar '${filename}' no filesystem:`, e.message);
}
}