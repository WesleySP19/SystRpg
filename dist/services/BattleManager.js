import { RulesEngine } from '../core/RulesEngine.js';
const validatePosition = (pos) => {
if (!pos || typeof pos !== 'object') return { x: 0, y: 0 };
return {
x: typeof pos.x === 'number' ? pos.x : (typeof pos.q === 'number' ? pos.q : 0),
y: typeof pos.y === 'number' ? pos.y : (typeof pos.r === 'number' ? pos.r : 0),
z: typeof pos.z === 'number' ? pos.z : 0
};
};
const validateEntity = (e) => {
if (!e || typeof e !== 'object') return null;
return {
entityId: String(e.entityId || e.id || 'unknown'),
position: validatePosition(e.position || { x: e.x, y: e.y, q: e.q, r: e.r }),
hp: typeof e.hp === 'number' ? e.hp : 10,
maxHp: typeof e.maxHp === 'number' ? e.maxHp : 10,
conditions: Array.isArray(e.conditions) ? e.conditions : [],
visible: e.visible !== false
};
};
class BattleManager {
constructor() {
this.battles = new Map();
this.eventListeners = new Map();
setInterval(() => this._cleanupInactiveBattles(), 60 * 60 * 1000);
}
on(event, callback) {
if (!this.eventListeners.has(event)) {
this.eventListeners.set(event, []);
}
this.eventListeners.get(event).push(callback);
}
_emit(event, ...args) {
const listeners = this.eventListeners.get(event);
if (listeners) {
listeners.forEach(cb => cb(...args));
}
}
_cleanupInactiveBattles() {
const now = Date.now();
const INACTIVITY_LIMIT = 12 * 60 * 60 * 1000; // 12 horas sem atividade
for (const [sessionId, battle] of this.battles.entries()) {
if (now - battle.lastActivity > INACTIVITY_LIMIT) {
this.endBattle(sessionId);
}
}
}
endBattle(sessionId) {
this.battles.delete(sessionId);
console.log(`[BattleManager] Batalha encerrada e limpada da memória: ${sessionId}`);
}
_getOrCreateBattle(sessionId) {
if (!this.battles.has(sessionId)) {
this.battles.set(sessionId, {
battleId: `battle-${Date.now()}`,
roundNumber: 1,
activeEntityId: null,
entities: new Map(), // entityId -> state
lastActivity: Date.now()
});
}
const battle = this.battles.get(sessionId);
battle.lastActivity = Date.now();
return battle;
}
upsertEntity(sessionId, entityData) {
const battle = this._getOrCreateBattle(sessionId);
const entityId = entityData.entityId || entityData.id;
if (!entityId) return null;
const existing = battle.entities.get(entityId) || { conditions: [], visible: true, position: { x: 0, y: 0 } };
const updated = { ...existing, ...entityData, entityId };
battle.entities.set(entityId, updated);
const oldHp = existing.hp ?? existing.hp_current;
const newHp = updated.hp ?? updated.hp_current;
if (newHp === 0 && oldHp !== undefined && oldHp > 0) {
console.log(`[BattleManager] Entidade eliminada na sessão ${sessionId}: ${updated.name || entityId}`);
const eventType = (updated.type === 'Player' || updated.isPlayer) ? 'HERO_FALLEN' : 'ENTITY_SLAIN';
this._emit(eventType, { entity: updated, name: updated.name || 'Alvo Arcano', id: entityId });
}
return battle.entities.get(entityId);
}
removeEntity(sessionId, entityId) {
const battle = this.battles.get(sessionId);
if (battle) {
battle.entities.delete(entityId);
}
}
moveEntity(sessionId, entityId, targetPosition) {
const battle = this._getOrCreateBattle(sessionId);
let entity = battle.entities.get(entityId);
if (!entity) {
console.warn(`[BattleManager] Tentativa de mover entidade inexistente (${entityId}) na sessão ${sessionId}.`);
return false;
}
let maxSpeed = entity.speed || 30; // Considerando 30ft ou 6 squares, dependendo do sistema
let distance = RulesEngine.calculateDistance(entity.position, targetPosition, 'square');
if (distance > maxSpeed) {
console.warn(`[BattleManager] Movimento inválido: distância (${distance}) excede a velocidade (${maxSpeed}).`);
}
entity.position = targetPosition;
return true;
}
getSnapshot(sessionId) {
const battle = this._getOrCreateBattle(sessionId);
const entitiesArray = Array.from(battle.entities.values())
.map(e => validateEntity(e))
.filter(Boolean);
const snapshot = {
battleId: String(battle.battleId || ''),
roundNumber: typeof battle.roundNumber === 'number' ? battle.roundNumber : 1,
activeEntityId: battle.activeEntityId ? String(battle.activeEntityId) : null,
entities: entitiesArray
};
return snapshot;
}
validateCRDTMove(sessionId, entityId, newEntityData, yMapInstance) {
const battle = this._getOrCreateBattle(sessionId);
const oldEntity = battle.entities.get(entityId);
const getCoord = (e) => {
if (!e) return null;
if (e.position && typeof e.position.x === 'number') return e.position;
if (e.q !== undefined && e.r !== undefined) return { x: e.q, y: e.r }; // Mapeamento q/r para x/y
if (e.x !== undefined && e.y !== undefined) return { x: e.x, y: e.y };
return null;
};
const oldPos = getCoord(oldEntity);
const newPos = getCoord(newEntityData);
const validNewEntity = validateEntity(newEntityData);
if (!validNewEntity) {
console.warn(`[BattleManager] Payload CRDT de entidade inválido descartado.`);
return false;
}
if (!oldEntity || !oldPos || !newPos) {
this.upsertEntity(sessionId, newEntityData);
return true;
}
const maxSpeed = oldEntity.speed || (newEntityData.speed !== undefined ? newEntityData.speed : 30);
const gridMode = newPos.q !== undefined ? 'hex' : 'square';
const distance = RulesEngine.calculateDistance(oldPos, newPos, gridMode);
if (distance > maxSpeed && maxSpeed > 0) {
console.warn(`[BattleManager] [CRDT Anti-Cheat] Bloqueando salto irreal de ${distance} (Max: ${maxSpeed}) para a entidade ${entityId}`);
if (yMapInstance && typeof yMapInstance.set === 'function') {
const currentYVal = yMapInstance.get(entityId);
if (JSON.stringify(currentYVal) !== JSON.stringify(oldEntity)) {
yMapInstance.set(entityId, JSON.parse(JSON.stringify(oldEntity)));
}
}
return false;
}
this.upsertEntity(sessionId, newEntityData);
return true;
}
}
export const battleManager = new BattleManager();