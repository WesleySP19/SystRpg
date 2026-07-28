/**
 * ENTITY COMPONENT SYSTEM (ECS) v1.0
 * Decoupled data-driven architecture for tabletop entity management.
 * Consists of ECSWorld, Entities, Components, and Systems.
 */

// --- 1. ECS Core ---

export class ECSWorld {
    constructor() {
        this.entities = new Map(); // entityId -> Map of componentName -> componentInstance
        this.systems = [];
        this.nextEntityId = 1;
    }

    createEntity(idPreset = null) {
        const id = idPreset || `ent-${Date.now()}-${this.nextEntityId++}`;
        this.entities.set(id, new Map());
        return id;
    }

    destroyEntity(id) {
        return this.entities.delete(id);
    }

    addComponent(entityId, component) {
        const comps = this.entities.get(entityId);
        if (comps) {
            comps.set(component.constructor.name, component);
        }
    }

    getComponent(entityId, ComponentClass) {
        const comps = this.entities.get(entityId);
        return comps ? comps.get(ComponentClass.name) : null;
    }

    hasComponent(entityId, ComponentClass) {
        const comps = this.entities.get(entityId);
        return comps ? comps.has(ComponentClass.name) : false;
    }

    removeComponent(entityId, ComponentClass) {
        const comps = this.entities.get(entityId);
        if (comps) {
            comps.delete(ComponentClass.name);
        }
    }

    addSystem(system) {
        this.systems.push(system);
        system.world = this;
    }

    update(dt) {
        for (const system of this.systems) {
            system.update(dt);
        }
    }

    queryEntities(componentClasses) {
        const results = [];
        for (const [entityId, comps] of this.entities.entries()) {
            let matches = true;
            for (const cls of componentClasses) {
                if (!comps.has(cls.name)) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                results.push(entityId);
            }
        }
        return results;
    }
}

// --- 2. Components ---

export class Position {
    constructor(x = 0, y = 0, rotation = 0) {
        this.x = x;
        this.y = y;
        this.rotation = rotation; // In radians
    }
}

export class Vision {
    constructor(range = 60, darkvision = 0, arcAngle = 360, facingAngle = 0) {
        this.range = range;
        this.darkvision = darkvision;
        this.arcAngle = arcAngle; // e.g. 90, 180, 360 degrees
        this.facingAngle = facingAngle; // facing direction in radians
    }
}

export class Health {
    constructor(current = 10, max = 10, ac = 10, speed = 30) {
        this.current = current;
        this.max = max;
        this.ac = ac;
        this.speed = speed; // speed in feet
    }
}

export class Light {
    constructor(range = 0, color = '#ff9c33', intensity = 1.0, arc = 360, flicker = true) {
        this.range = range; // radius in feet
        this.color = color;
        this.intensity = intensity;
        this.arc = arc;
        this.flicker = flicker;
        this.flickerSeed = Math.random() * 100;
    }
}

export class Aura {
    constructor(radius = 0, color = 'rgba(255,255,255,0.2)', label = '') {
        this.radius = radius;
        this.color = color;
        this.label = label;
    }
}

export class CombatState {
    constructor(initiative = 0) {
        this.initiative = initiative;
        this.isCurrentTurn = false;
        this.movedFt = 0;
        this.actionsLeft = { action: 1, bonus: 1, reaction: 1 };
    }
}

// --- 3. Systems ---

export class ECSSystem {
    constructor() {
        this.world = null;
    }
    update(dt) {}
}

export class MovementSystem extends ECSSystem {
    constructor(gridEngine) {
        super();
        this.grid = gridEngine;
    }

    update(dt) {
        // Query entities with position and combat state to track movement budget
        const entities = this.world.queryEntities([Position, CombatState]);
        for (const ent of entities) {
            const pos = this.world.getComponent(ent, Position);
            const state = this.world.getComponent(ent, CombatState);
            const hp = this.world.getComponent(ent, Health);
            
            // Check speed and verify remaining budget
            if (state.isCurrentTurn && hp) {
                const maxSpeed = hp.speed || 30;
                if (state.movedFt >= maxSpeed) {
                    state.actionsLeft.action = 0; // Exhausted movement
                }
            }
        }
    }

    /**
     * Try to move an entity by verifying wall collisions
     */
    tryMoveEntity(entityId, targetX, targetY) {
        const pos = this.world.getComponent(entityId, Position);
        const state = this.world.getComponent(entityId, CombatState);
        const hp = this.world.getComponent(entityId, Health);

        if (!pos) return false;

        // Collision check
        if (this.grid.hasWallBetween(pos.x, pos.y, targetX, targetY)) {
            return false;
        }

        // Calculate distance moved in feet
        if (state && hp) {
            const distPx = Math.hypot(targetX - pos.x, targetY - pos.y);
            const distFt = (distPx / this.grid.cellSize) * this.grid.feetPerCell;
            const terrainCost = this.grid.isDifficultTerrain(
                Math.floor(targetX / this.grid.cellSize),
                Math.floor(targetY / this.grid.cellSize)
            ) ? distFt : 0;
            const totalCost = distFt + terrainCost;

            if (state.isCurrentTurn && state.movedFt + totalCost > hp.speed) {
                // Not enough movement speed left
                return false;
            }
            state.movedFt += totalCost;
        }

        pos.x = targetX;
        pos.y = targetY;
        return true;
    }
}

export class VisionSystem extends ECSSystem {
    constructor(gridEngine, fogEngine) {
        super();
        this.grid = gridEngine;
        this.fog = fogEngine;
    }

    update(dt) {
        if (!this.fog || !this.fog.enabled) return;

        // Reset visibility to explored or hidden
        this.fog.resetToHidden();

        const entities = this.world.queryEntities([Position, Vision]);
        for (const ent of entities) {
            const pos = this.world.getComponent(ent, Position);
            const vis = this.world.getComponent(ent, Vision);

            const cell = this.grid.pixelToCell(pos.x, pos.y);
            const maxRange = Math.max(vis.range, vis.darkvision);
            const radiusCells = Math.ceil(maxRange / this.grid.feetPerCell);

            // Compute visible area using raycasting or simple radius reveal
            for (let dc = -radiusCells; dc <= radiusCells; dc++) {
                for (let dr = -radiusCells; dr <= radiusCells; dr++) {
                    const col = cell.col + dc;
                    const row = cell.row + dr;

                    if (col >= 0 && col < this.grid.cols && row >= 0 && row < this.grid.rows) {
                        const target = this.grid.cellCenter(col, row);
                        
                        // Distance check
                        const distPx = Math.hypot(target.x - pos.x, target.y - pos.y);
                        const distFt = (distPx / this.grid.cellSize) * this.grid.feetPerCell;
                        if (distFt > maxRange) continue;

                        // Check vision arc
                        if (vis.arcAngle < 360) {
                            const angle = Math.atan2(target.y - pos.y, target.x - pos.x);
                            let diff = Math.abs(angle - vis.facingAngle);
                            if (diff > Math.PI) diff = 2 * Math.PI - diff;
                            if (diff > (vis.arcAngle * Math.PI) / 360) {
                                continue;
                            }
                        }

                        // Wall block check
                        if (!this.grid.hasWallBetween(pos.x, pos.y, target.x, target.y)) {
                            this.fog.reveal(col, row);
                        }
                    }
                }
            }
        }
    }
}

export class CombatSystem extends ECSSystem {
    update(dt) {
        // Simple combat turn management inside ECS
        const entities = this.world.queryEntities([CombatState]);
        // Sorted by initiative
        entities.sort((a, b) => {
            const sa = this.world.getComponent(a, CombatState);
            const sb = this.world.getComponent(b, CombatState);
            return sb.initiative - sa.initiative;
        });
    }

    attackRoll(attackerId, targetId, advantage = 'normal') {
        const attackerAc = this.world.getComponent(attackerId, Health);
        const targetHp = this.world.getComponent(targetId, Health);

        if (!targetHp) return { error: 'Target has no health stats.' };

        // Roll d20
        const r1 = Math.floor(Math.random() * 20) + 1;
        const r2 = Math.floor(Math.random() * 20) + 1;
        let roll = r1;
        if (advantage === 'advantage') roll = Math.max(r1, r2);
        if (advantage === 'disadvantage') roll = Math.min(r1, r2);

        const mod = 5; // Fixed proficiency + strength mod
        const hitVal = roll + mod;
        const isHit = hitVal >= targetHp.ac;

        let dmg = 0;
        if (isHit) {
            // Roll damage e.g. 1d8 + 3
            dmg = Math.floor(Math.random() * 8) + 4;
            targetHp.current = Math.max(0, targetHp.current - dmg);
        }

        return {
            roll,
            totalAttack: hitVal,
            acChecked: targetHp.ac,
            hit: isHit,
            damage: dmg,
            hpRemaining: targetHp.current
        };
    }
}
