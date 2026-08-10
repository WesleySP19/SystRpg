/**
 * Gerencia o estado em memória dos combates ativos.
 * Isso permite responder instantaneamente ao CartoRPG (Mapa) e validar movimentos.
 */
import { RulesEngine } from '../core/RulesEngine.js';

class BattleManager {
    constructor() {
        // Map<sessionId, { entities: Map, activeEntityId: string, roundNumber: number, lastActivity: number }>
        this.battles = new Map();
        this.eventListeners = new Map();
        
        // Limpeza de batalhas inativas (a cada hora)
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

    /**
     * Adiciona ou atualiza uma entidade na batalha.
     */
    upsertEntity(sessionId, entityData) {
        const battle = this._getOrCreateBattle(sessionId);
        const entityId = entityData.entityId || entityData.id;
        if (!entityId) return null;
        
        // Mantem estado antigo se existir (merge básico)
        const existing = battle.entities.get(entityId) || { conditions: [], visible: true, position: { x: 0, y: 0 } };
        const updated = { ...existing, ...entityData, entityId };
        battle.entities.set(entityId, updated);
        
        const oldHp = existing.hp ?? existing.hp_current;
        const newHp = updated.hp ?? updated.hp_current;
        if (newHp === 0 && oldHp !== undefined && oldHp > 0) {
            console.log(`[BattleManager] Entidade eliminada na sessão ${sessionId}: ${updated.name || entityId}`);
            const eventType = (updated.type === 'Player' || updated.isPlayer) ? 'HERO_FALLEN' : 'ENTITY_SLAIN';
            
            // Dispara evento interno de forma desacoplada
            this._emit(eventType, { entity: updated, name: updated.name || 'Alvo Arcano', id: entityId });
        }
        
        return battle.entities.get(entityId);
    }

    /**
     * Remove uma entidade da batalha.
     */
    removeEntity(sessionId, entityId) {
        const battle = this.battles.get(sessionId);
        if (battle) {
            battle.entities.delete(entityId);
        }
    }

    /**
     * Valida e atualiza o movimento de uma entidade.
     */
    moveEntity(sessionId, entityId, targetPosition) {
        const battle = this._getOrCreateBattle(sessionId);

        // Bloqueia movimento se a entidade não existir (evita ghosting)
        let entity = battle.entities.get(entityId);
        if (!entity) {
            console.warn(`[BattleManager] Tentativa de mover entidade inexistente (${entityId}) na sessão ${sessionId}.`);
            return false;
        }

        // Valida o deslocamento máximo usando a RulesEngine
        let maxSpeed = entity.speed || 30; // Considerando 30ft ou 6 squares, dependendo do sistema
        let distance = RulesEngine.calculateDistance(entity.position, targetPosition, 'square');
        
        if (distance > maxSpeed) {
            console.warn(`[BattleManager] Movimento inválido: distância (${distance}) excede a velocidade (${maxSpeed}).`);
            // Descomente a linha abaixo para bloquear estritamente o movimento
            // return false;
        }

        entity.position = targetPosition;
        return true;
    }

    /**
     * Retorna o Snapshot formatado para o sync-protocol Zod Schema.
     */
    getSnapshot(sessionId) {
        const battle = this._getOrCreateBattle(sessionId);
        
        // Converte o Map de entidades para Array compatível com TOME e CartoRPG
        const entitiesArray = Array.from(battle.entities.values()).map(e => ({
            entityId: e.entityId || e.id || 'unknown',
            position: e.position || { x: e.x !== undefined ? e.x : (e.q || 0), y: e.y !== undefined ? e.y : (e.r || 0) },
            hp: e.hp || 10,
            maxHp: e.maxHp || 10,
            conditions: e.conditions || [],
            visible: e.visible !== false
        }));

        return {
            battleId: battle.battleId,
            roundNumber: battle.roundNumber,
            activeEntityId: battle.activeEntityId,
            entities: entitiesArray
        };
    }

    /**
     * Validação Passiva para CRDT (Yjs)
     * Quando um cliente altera a Y.Map ('battleEntities' ou 'tokens'), o servidor verifica a distância.
     */
    validateCRDTMove(sessionId, entityId, newEntityData, yMapInstance) {
        const battle = this._getOrCreateBattle(sessionId);
        const oldEntity = battle.entities.get(entityId);

        // Extrair coordenadas unificadas (Mesa: position.{x,y} | CartoRPG: {q,r} ou {x,y})
        const getCoord = (e) => {
            if (!e) return null;
            if (e.position) return e.position;
            if (e.q !== undefined && e.r !== undefined) return { q: e.q, r: e.r };
            if (e.x !== undefined && e.y !== undefined) return { x: e.x, y: e.y };
            return null;
        };

        const oldPos = getCoord(oldEntity);
        const newPos = getCoord(newEntityData);

        // Se é uma entidade nova ou não tinha posição antiga, aceita no registro
        if (!oldEntity || !oldPos || !newPos) {
            this.upsertEntity(sessionId, newEntityData);
            return true;
        }

        const maxSpeed = oldEntity.speed || (newEntityData.speed !== undefined ? newEntityData.speed : 30);
        const gridMode = newPos.q !== undefined ? 'hex' : 'square';

        const distance = RulesEngine.calculateDistance(oldPos, newPos, gridMode);
        if (distance > maxSpeed && maxSpeed > 0) {
            console.warn(`[BattleManager] [CRDT Anti-Cheat] Bloqueando salto irreal de ${distance} (Max: ${maxSpeed}) para a entidade ${entityId}`);
            
            // Reverte com segurança no Yjs e impede loops infinitos de reflexo
            if (yMapInstance && typeof yMapInstance.set === 'function') {
                const currentYVal = yMapInstance.get(entityId);
                if (JSON.stringify(currentYVal) !== JSON.stringify(oldEntity)) {
                    yMapInstance.set(entityId, JSON.parse(JSON.stringify(oldEntity)));
                }
            }
            return false;
        }

        // Se for válido, salva no cache em memória e sincroniza com os ouvintes do sistema
        this.upsertEntity(sessionId, newEntityData);
        return true;
    }
}

// Exporta como Singleton para ser usado em todo o backend
export const battleManager = new BattleManager();
