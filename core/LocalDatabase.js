import Dexie from 'dexie';

/**
 * Banco de Dados Local-First (IndexedDB via Dexie)
 * Utilizado para persistência offline e cache imediato.
 */
export const db = new Dexie('TomeRpgManagerDB');

db.version(1).stores({
    // Armazena o estado do jogo (personagens, combate, etc)
    states: 'filename, timestamp',
    
    // Cache offline temporário
    offline_queue: 'filename, timestamp'
});

export async function saveLocalState(filename, data) {
    return await db.states.put({
        filename,
        data,
        timestamp: Date.now()
    });
}

export async function getLocalState(filename) {
    const record = await db.states.get(filename);
    return record ? record.data : null;
}

export async function queueOfflineSave(filename, data) {
    return await db.offline_queue.put({
        filename,
        data,
        timestamp: Date.now()
    });
}

export async function popOfflineSaves() {
    const saves = await db.offline_queue.toArray();
    await db.offline_queue.clear();
    return saves;
}
