// Script de higienização: limpa aninhamentos recursivos ("Boneca Russa") dos arquivos de estado JSON
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { clean: obj, wasCleaned: false };
    let clean = { ...obj };
    let wasCleaned = false;

    while (clean && clean.state && typeof clean.state === 'object') {
        wasCleaned = true;
        const nested = clean.state;
        delete clean.state;
        // Merge nested values directly to root
        clean = { ...nested, ...clean };
    }

    // Process nested structures
    for (const key of Object.keys(clean)) {
        if (clean[key] && typeof clean[key] === 'object') {
            const res = sanitizeObject(clean[key]);
            if (res.wasCleaned) {
                clean[key] = res.clean;
                wasCleaned = true;
            }
        }
    }

    return { clean, wasCleaned };
}

async function run() {
    const pruneEmpty = process.argv.includes('--prune-empty');
    console.log(`[Sanitizer] Iniciando inspeção de arquivos na pasta data/... ${pruneEmpty ? '(Modo Prune Empty ATIVO)' : ''}`);
    try {
        await fs.promises.access(dataDir);
    } catch {
        console.log('[Sanitizer] Pasta data/ não encontrada. Encerrando.');
        return;
    }

    const dirFiles = await fs.promises.readdir(dataDir);
    const files = dirFiles.filter(f => f.endsWith('.json'));
    let cleanedCount = 0;
    let prunedCount = 0;
    let totalBytesFreed = 0;

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        try {
            const statBefore = await fs.promises.stat(filePath);
            let content = await fs.promises.readFile(filePath, 'utf-8');
            content = content.replace(/^\uFEFF/, '').trim();
            const data = JSON.parse(content);

            // Check if file is an ephemeral empty session test table
            if (pruneEmpty && file.match(/^mesa_\d+\.json$/)) {
                const isEmpty = (!data.players || data.players.length === 0) &&
                                (!data.monsters || data.monsters.length === 0) &&
                                (!data.savedNPCs || data.savedNPCs.length === 0) &&
                                (!data.journalEntries || data.journalEntries.length === 0) &&
                                (!data.campaigns || data.campaigns.length === 0) &&
                                (!data.quests || data.quests.length === 0) &&
                                (!data.tacticalMap || !data.tacticalMap.mapUrl) &&
                                (!data.sessionNotes || data.sessionNotes.trim() === '') &&
                                (!data.sessionTitle || data.sessionTitle.trim() === '');
                
                if (isEmpty) {
                    await fs.promises.unlink(filePath);
                    prunedCount++;
                    totalBytesFreed += statBefore.size;
                    console.log(`[Sanitizer] Expurgo: Mesa efêmera vazia excluída -> ${file} (${(statBefore.size/1024).toFixed(2)} KB libertados)`);
                    continue;
                }
            }

            const result = sanitizeObject(data);
            if (result.wasCleaned) {
                const newContent = JSON.stringify(result.clean, null, 2);
                await fs.promises.writeFile(filePath, newContent, 'utf-8');
                const statAfter = await fs.promises.stat(filePath);
                const bytesFreed = statBefore.size - statAfter.size;
                totalBytesFreed += bytesFreed;
                cleanedCount++;
                console.log(`[Sanitizer] Arquivo higienizado: ${file} | Redução: ${(statBefore.size/1024).toFixed(2)}KB -> ${(statAfter.size/1024).toFixed(2)}KB (Economia de ${(bytesFreed/1024).toFixed(2)}KB)`);
            } else {
                // Console only if not pruned or cleaned to avoid spam, or keep silent for clean files
                // console.log(`[Sanitizer] Arquivo intacto: ${file}`);
            }
        } catch (err) {
            console.warn(`[Sanitizer] Falha ao processar arquivo ${file}:`, err.message);
        }
    }

    console.log(`[Sanitizer] Concluído! ${cleanedCount} arquivo(s) higienizado(s) | ${prunedCount} mesa(s) vazia(s) expurgadas. Total de espaço libertado: ${(totalBytesFreed/1024).toFixed(2)} KB.`);
}

run();

