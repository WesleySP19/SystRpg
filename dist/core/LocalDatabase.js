import Dexie from './dexie.mjs';
export const db = new Dexie('TomeRpgManagerDB');
db.version(1).stores({
states: 'filename, timestamp',
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