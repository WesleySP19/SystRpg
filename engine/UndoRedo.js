/**
 * UNDO / REDO COMMAND STACK v1.0
 * Implements the Command Pattern for transactional map operations.
 * Allows undoing and redoing drawing, walls, doors, stamps, and lights.
 */

export class Command {
    execute() {}
    undo() {}
}

export class CommandStack {
    constructor(mapManager, maxStackSize = 100) {
        this.map = mapManager;
        this.maxStackSize = maxStackSize;
        this.undoStack = [];
        this.redoStack = [];
    }

    _emitSyncEvent(actionName) {
        if (this.map && typeof this.map._sync === 'function') {
            this.map._sync();
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('map-history-sync', { 
                detail: { action: actionName, timestamp: Date.now() } 
            }));
        }
        // Redireciona via Sockets do mapa e Telão de Transmissão se presentes no mapManager
        if (this.map && this.map.socket && typeof this.map.socket.emit === 'function') {
            this.map.socket.emit('state_update', this.map.getSnapshot ? this.map.getSnapshot() : { action: actionName });
        }
    }

    /**
     * Executes a new command and pushes it to the undo stack
     */
    execute(command) {
        command.execute(this.map);
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo stack on new action
        this._emitSyncEvent('execute');
    }

    /**
     * Undo the last command
     */
    undo() {
        if (this.undoStack.length === 0) return false;
        const command = this.undoStack.pop();
        command.undo(this.map);
        this.redoStack.push(command);
        this._emitSyncEvent('undo');
        return true;
    }

    /**
     * Redo the last undone command
     */
    redo() {
        if (this.redoStack.length === 0) return false;
        const command = this.redoStack.pop();
        command.execute(this.map);
        this.undoStack.push(command);
        this._emitSyncEvent('redo');
        return true;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this._emitSyncEvent('clear');
    }
}

// --- Concrete Commands ---

export class AddWallCommand extends Command {
    constructor(wall) {
        super();
        this.wall = wall; // { id, x1, y1, x2, y2 }
    }
    execute(map) {
        if (map._grid && map._grid._walls) {
            map._grid._walls.push(this.wall);
            if (map._renderer) map._renderer.invalidateCache();
        } else if (map.walls) {
            map.walls.push(this.wall);
            if (typeof map._renderWalls === 'function') map._renderWalls();
        }
    }
    undo(map) {
        if (map._grid && map._grid._walls) {
            map._grid._walls = map._grid._walls.filter(w => w.id !== this.wall.id);
            if (map._renderer) map._renderer.invalidateCache();
        } else if (map.walls) {
            map.walls = map.walls.filter(w => w.id !== this.wall.id);
            if (typeof map._renderWalls === 'function') map._renderWalls();
        }
    }
}

export class PixiAddWallCommand extends Command {
    constructor(wall) {
        super();
        this.wall = wall; // { id, x1, y1, x2, y2 }
    }
    execute(map) {
        if (!map.walls) map.walls = [];
        map.walls.push(this.wall);
        if (typeof map._renderWalls === 'function') map._renderWalls();
    }
    undo(map) {
        if (!map.walls) return;
        map.walls = map.walls.filter(w => w.id !== this.wall.id);
        if (typeof map._renderWalls === 'function') map._renderWalls();
    }
}

export class PixiPaintFogCommand extends Command {
    constructor(fogPoint) {
        super();
        this.fogPoint = fogPoint; // { x, y, radius }
    }
    execute(map) {
        if (typeof map._paintFog === 'function') {
            map._paintFog(this.fogPoint.x, this.fogPoint.y, this.fogPoint.radius, false);
        }
    }
    undo(map) {
        if (!map.fogPaths) return;
        map.fogPaths = map.fogPaths.filter(p => !(p.x === this.fogPoint.x && p.y === this.fogPoint.y && p.radius === this.fogPoint.radius));
        if (typeof map.setFog === 'function') {
            map.setFog({ enabled: true, paths: map.fogPaths });
        }
    }
}

export class PixiMoveTokenCommand extends Command {
    constructor(tokenId, oldX, oldY, newX, newY) {
        super();
        this.tokenId = tokenId;
        this.oldPos = { x: oldX, y: oldY };
        this.newPos = { x: newX, y: newY };
    }
    execute(map) {
        const token = map.tokens?.get(this.tokenId);
        if (token) {
            token.targetX = this.newPos.x;
            token.targetY = this.newPos.y;
            token.x = this.newPos.x;
            token.y = this.newPos.y;
        }
    }
    undo(map) {
        const token = map.tokens?.get(this.tokenId);
        if (token) {
            token.targetX = this.oldPos.x;
            token.targetY = this.oldPos.y;
            token.x = this.oldPos.x;
            token.y = this.oldPos.y;
        }
    }
}

export class AddDoorCommand extends Command {
    constructor(door) {
        super();
        this.door = door;
    }
    execute(map) {
        if (map._grid && map._grid._doors) {
            map._grid._doors.push(this.door);
            if (map._renderer) map._renderer.invalidateCache();
        }
    }
    undo(map) {
        if (map._grid && map._grid._doors) {
            map._grid._doors = map._grid._doors.filter(d => d.id !== this.door.id);
            if (map._renderer) map._renderer.invalidateCache();
        }
    }
}

export class AddElementCommand extends Command {
    constructor(element) {
        super();
        this.element = element;
    }
    execute(map) {
        map._mapElements.push(this.element);
        if (map._renderer) map._renderer.invalidateCache();
    }
    undo(map) {
        map._mapElements = map._mapElements.filter(el => el.id !== this.element.id);
        if (map._renderer) map._renderer.invalidateCache();
    }
}

export class AddLightCommand extends Command {
    constructor(light) {
        super();
        this.light = light;
    }
    execute(map) {
        map._mapLights.push(this.light);
    }
    undo(map) {
        map._mapLights = map._mapLights.filter(l => l.id !== this.light.id);
    }
}

export class EraseCommand extends Command {
    constructor(erasedElements, erasedLights, erasedWalls, erasedDoors) {
        super();
        this.erasedElements = erasedElements;
        this.erasedLights = erasedLights;
        this.erasedWalls = erasedWalls;
        this.erasedDoors = erasedDoors;
    }

    execute(map) {
        const wallIds = new Set(this.erasedWalls.map(w => w.id));
        const doorIds = new Set(this.erasedDoors.map(d => d.id));
        const elIds = new Set(this.erasedElements.map(e => e.id));
        const lightIds = new Set(this.erasedLights.map(l => l.id));

        if (map._grid) {
            map._grid._walls = map._grid._walls.filter(w => !wallIds.has(w.id));
            map._grid._doors = map._grid._doors.filter(d => !doorIds.has(d.id));
        }
        if (map.walls) {
            map.walls = map.walls.filter(w => !wallIds.has(w.id));
            if (typeof map._renderWalls === 'function') map._renderWalls();
        }
        if (map._mapElements) map._mapElements = map._mapElements.filter(e => !elIds.has(e.id));
        if (map._mapLights) map._mapLights = map._mapLights.filter(l => !lightIds.has(l.id));

        if (map._renderer) map._renderer.invalidateCache();
    }

    undo(map) {
        if (map._grid) {
            map._grid._walls.push(...this.erasedWalls);
            map._grid._doors.push(...this.erasedDoors);
        }
        if (map.walls) {
            map.walls.push(...this.erasedWalls);
            if (typeof map._renderWalls === 'function') map._renderWalls();
        }
        if (map._mapElements) map._mapElements.push(...this.erasedElements);
        if (map._mapLights) map._mapLights.push(...this.erasedLights);

        if (map._renderer) map._renderer.invalidateCache();
    }
}
