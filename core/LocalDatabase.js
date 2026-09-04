import Dexie from './dexie.mjs';

/**
 * Banco de Dados Local-First (IndexedDB via Dexie)
 * Utilizado para persistência offline, cache imediato e histórico de snapshots.
 */
export const db = new Dexie('TomeRpgManagerDB');

db.version(2).stores({
    // Armazena o estado do jogo (personagens, combate, etc)
    states: 'filename, timestamp',
    
    // Cache offline temporário
    offline_queue: 'filename, timestamp',

    // Snapshots e pontos de restauração manuais / automáticos
    snapshots: '++id, filename, timestamp, label'
});

export async function saveLocalState(filename, data) {
    try {
        return await db.states.put({
            filename,
            data,
            timestamp: Date.now()
        });
    } catch (err) {
        console.error(`[LocalDatabase] Erro ao salvar estado local '${filename}':`, err);
        return null;
    }
}

export async function getLocalState(filename) {
    try {
        const record = await db.states.get(filename);
        return record ? record.data : null;
    } catch (err) {
        console.error(`[LocalDatabase] Erro ao recuperar estado local '${filename}':`, err);
        return null;
    }
}

export async function deleteLocalState(filename) {
    try {
        await db.states.delete(filename);
        return true;
    } catch (err) {
        console.error(`[LocalDatabase] Erro ao deletar estado local '${filename}':`, err);
        return false;
    }
}

export async function getAllLocalSessions() {
    try {
        const records = await db.states.toArray();
        return records.map(r => ({
            filename: r.filename,
            timestamp: r.timestamp,
            title: r.data?.sessionTitle || r.filename,
            heroesCount: (r.data?.players || []).length,
            round: r.data?.combatRound || 0
        }));
    } catch (err) {
        console.error('[LocalDatabase] Erro ao listar sessões locais:', err);
        return [];
    }
}

export async function queueOfflineSave(filename, data) {
    try {
        return await db.offline_queue.put({
            filename,
            data,
            timestamp: Date.now()
        });
    } catch (err) {
        console.error('[LocalDatabase] Erro ao enfileirar save offline:', err);
        return null;
    }
}

export async function popOfflineSaves() {
    try {
        const saves = await db.offline_queue.toArray();
        await db.offline_queue.clear();
        return saves;
    } catch (err) {
        console.error('[LocalDatabase] Erro ao consumir fila offline:', err);
        return [];
    }
}

export async function createSnapshot(filename, data, label = 'Auto') {
    try {
        return await db.snapshots.add({
            filename,
            data,
            timestamp: Date.now(),
            label
        });
    } catch (err) {
        console.error('[LocalDatabase] Erro ao criar snapshot:', err);
        return null;
    }
}

export async function getStorageStats() {
    try {
        const stateCount = await db.states.count();
        const queueCount = await db.offline_queue.count();
        const snapshotCount = await db.snapshots.count();
        
        let quota = null;
        if (navigator.storage && navigator.storage.estimate) {
            quota = await navigator.storage.estimate();
        }

        return {
            stateCount,
            queueCount,
            snapshotCount,
            quota
        };
    } catch (err) {
        return { stateCount: 0, queueCount: 0, snapshotCount: 0, quota: null };
    }
}
