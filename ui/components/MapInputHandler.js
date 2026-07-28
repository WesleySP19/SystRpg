import { Toast } from './Toast.js';
import { 
    AddWallCommand, 
    AddDoorCommand, 
    AddElementCommand, 
    AddLightCommand, 
    EraseCommand 
} from '../../engine/UndoRedo.js';
import { Pathfinding } from '../../engine/Pathfinding.js';
import { Position } from '../../engine/ECS.js';

export class MapInputHandler {
    constructor(mapManager) {
        this.map = mapManager;
        this.wrap = null;
        
        this.tools = {
            'select': new SelectTool(this.map, this),
            'measure': new MeasureTool(this.map, this),
            'fog': new FogTool(this.map, this),
            'stamp': new StampTool(this.map, this),
            'text': new TextTool(this.map, this),
            'light': new LightTool(this.map, this),
            'erase': new EraseTool(this.map, this),
            'wall': new ShapeTool(this.map, this, 'wall'),
            'door': new ShapeTool(this.map, this, 'door'),
            'floor_rect': new ShapeTool(this.map, this, 'floor_rect'),
            'floor_circle': new ShapeTool(this.map, this, 'floor_circle'),
            'stairs': new ShapeTool(this.map, this, 'stairs'),
            'freehand': new FreehandTool(this.map, this),
            'sphere': new EffectTool(this.map, this, 'sphere'),
            'cone': new EffectTool(this.map, this, 'cone'),
            'cube': new EffectTool(this.map, this, 'cube'),
            'line': new EffectTool(this.map, this, 'line'),
            'spawn': new SpawnTool(this.map)
        };
        
        this.isMouseDown = false;
        this.panStart = null;
        
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    attach(wrapElement) {
        if (this.wrap) this.detach();
        this.wrap = wrapElement;
        this.wrap.addEventListener('mousedown', this.onMouseDown);
        this.wrap.addEventListener('mousemove', this.onMouseMove);
        this.wrap.addEventListener('mouseup', this.onMouseUp);
        this.wrap.addEventListener('wheel', this.onWheel, {passive: false});
        this.wrap.addEventListener('contextmenu', this.onContextMenu);
        window.addEventListener('keydown', this.onKeyDown);
    }
    
    detach() {
        if (!this.wrap) return;
        this.wrap.removeEventListener('mousedown', this.onMouseDown);
        this.wrap.removeEventListener('mousemove', this.onMouseMove);
        this.wrap.removeEventListener('mouseup', this.onMouseUp);
        this.wrap.removeEventListener('wheel', this.onWheel);
        this.wrap.removeEventListener('contextmenu', this.onContextMenu);
        window.removeEventListener('keydown', this.onKeyDown);
        this.wrap = null;
    }

    getTool() {
        return this.tools[this.map._tool] || this.tools['select'];
    }

    onMouseDown(e) {
        if (e.button !== 0) return;
        this.isMouseDown = true;
        const mp = this.map.toMap(e.clientX, e.clientY);
        this.map._currentMousePos = mp;
        
        // Pings System (Alt + Click)
        if (e.altKey) {
            if (!this.map._activePings) this.map._activePings = [];
            const ping = { x: mp.x, y: mp.y, color: '#facc15', timestamp: performance.now() };
            this.map._activePings.push(ping);
            if (this.map._channel) {
                this.map._channel.postMessage({ type: 'PING', position: { x: mp.x, y: mp.y }, color: '#facc15' });
            }
            if (window.socket && window.socketConnected) {
                window.socket.emit('ping', { position: { x: mp.x, y: mp.y }, color: '#facc15', mesaId: this.map.store.state.activeSession });
            }
            this.map.requestRender();
            return;
        }

        const tool = this.getTool();
        if (tool && tool.onMouseDown) {
            tool.onMouseDown(e, mp);
        }
    }

    onMouseMove(e) {
        const mp = this.map.toMap(e.clientX, e.clientY);
        this.map._currentMousePos = mp;
        
        const tool = this.getTool();
        if (tool && tool.onMouseMove) {
            tool.onMouseMove(e, mp, this.isMouseDown);
        }
    }

    onMouseUp(e) {
        this.isMouseDown = false;
        const mp = this.map.toMap(e.clientX, e.clientY);
        
        const tool = this.getTool();
        if (tool && tool.onMouseUp) {
            tool.onMouseUp(e, mp);
        }
    }

    onWheel(e) {
        e.preventDefault();
        const tool = this.getTool();
        if (tool && tool.onWheel && tool.onWheel(e)) return;
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.map._zoom = Math.max(0.3, Math.min(3, this.map._zoom + delta));
        this.map._resizeCanvases();
    }

    onContextMenu(e) {
        e.preventDefault();
        const mp = this.map.toMap(e.clientX, e.clientY);
        const tool = this.getTool();
        if (tool && tool.onContextMenu) {
            tool.onContextMenu(e, mp);
        }
    }

    onKeyDown(e) {
        // Ctrl+Z (Undo)
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            const undone = this.map._undoRedo.undo();
            if (undone) {
                Toast.show('Ação desfeita!', 'info');
                this.map.render();
            }
        }
        // Ctrl+Y (Redo)
        else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            const redone = this.map._undoRedo.redo();
            if (redone) {
                Toast.show('Ação refeita!', 'info');
                this.map.render();
            }
        }
    }
}

// --- Tools ---

class SelectTool {
    constructor(map, handler) { this.map = map; this.handler = handler; }
    
    onMouseDown(e, mp) {
        const doors = this.map._grid.getDoors ? this.map._grid.getDoors() : [];
        const hitDoor = doors.find(d => {
            const mx = (d.x1 + d.x2) / 2;
            const my = (d.y1 + d.y2) / 2;
            return Math.hypot(mp.x - mx, mp.y - my) < 20;
        });

        if (hitDoor) {
            this.map._grid.toggleDoor(hitDoor.id);
            this.map._sync();
            this.map.render();
            Toast.show(hitDoor.isOpen ? '🚪 Porta aberta' : '🚪 Porta fechada', 'info');
            return;
        }

        const tok = this.map._hitToken(mp.x, mp.y);
        if (tok) {
            this.map._isDraggingToken = true;
            this.map._draggedTokenId = tok.id;
            this.map._selectedTokenId = tok.id;
            this.map._dragStartCell = this.map._grid.pixelToCell(tok.x, tok.y);
            this.map._dragPath = [];
            this.map.render();
            return;
        }

        const hitEl = [...this.map._mapElements].reverse().find(el => {
            if (el.type === 'stamp' || el.type === 'text') {
                return Math.hypot(mp.x - el.x, mp.y - el.y) < 25;
            }
            return false;
        });

        if (hitEl) {
            this.map._selectedElementId = hitEl.id;
            Toast.show(`Selecionado: ${hitEl.type === 'stamp' ? 'Carimbo' : 'Texto'}`, 'info');
            return;
        }

        this.handler.panStart = { x: e.clientX, y: e.clientY };
    }

    onMouseMove(e, mp, isMouseDown) {
        if (this.map._isDraggingToken && this.map._draggedTokenId) {
            let snap;
            if (this.map._gridType === 'hex') {
                const vSpacing = this.map._grid.cellSize * 0.866;
                let approxRow = Math.round(mp.y / vSpacing);
                let approxCol = Math.round((mp.x - (approxRow % 2 === 1 ? this.map._grid.cellSize / 2 : 0)) / this.map._grid.cellSize);
                snap = {
                    x: approxCol * this.map._grid.cellSize + (approxRow % 2 === 1 ? this.map._grid.cellSize / 2 : 0),
                    y: approxRow * vSpacing
                };
            } else {
                snap = this.map._grid.snapToCellClamped(mp.x, mp.y);
            }
            
            this.map._tokens.setPosition(this.map._draggedTokenId, snap.x, snap.y);

            // Live A* + JPS path preview from starting cell
            const hoverCell = this.map._grid.pixelToCell(mp.x, mp.y);
            if (this.map._dragStartCell) {
                this.map._dragPath = Pathfinding.findPath(
                    this.map._grid,
                    this.map._dragStartCell.col,
                    this.map._dragStartCell.row,
                    hoverCell.col,
                    hoverCell.row,
                    { useJPS: true }
                );
            }

            this.map._syncDelta('TOKEN_MOVE', { id: this.map._draggedTokenId, x: snap.x, y: snap.y });
            this.map.requestRender();
        } else if (this.handler.panStart) {
            this.map._pan.x += e.clientX - this.handler.panStart.x;
            this.map._pan.y += e.clientY - this.handler.panStart.y;
            this.handler.panStart = { x: e.clientX, y: e.clientY };
            this.map.requestRender();
        }
    }

    onMouseUp(e, mp) {
        if (this.map._isDraggingToken && this.map._draggedTokenId) {
            let snap;
            if (this.map._gridType === 'hex') {
                const vSpacing = this.map._grid.cellSize * 0.866;
                let approxRow = Math.round(mp.y / vSpacing);
                let approxCol = Math.round((mp.x - (approxRow % 2 === 1 ? this.map._grid.cellSize / 2 : 0)) / this.map._grid.cellSize);
                snap = {
                    x: approxCol * this.map._grid.cellSize + (approxRow % 2 === 1 ? this.map._grid.cellSize / 2 : 0),
                    y: approxRow * vSpacing
                };
            } else {
                snap = this.map._grid.snapToCellClamped(mp.x, mp.y);
            }
            
            // Move using ECS / Token system checks
            this.map._tokens.setPosition(this.map._draggedTokenId, snap.x, snap.y);
            
            // Update ECS world Position Component
            if (this.map._ecsWorld && this.map._ecsWorld.entities.has(this.map._draggedTokenId)) {
                const pos = this.map._ecsWorld.getComponent(this.map._draggedTokenId, Position);
                if (pos) { pos.x = snap.x; pos.y = snap.y; }
            }

            this.map._isDraggingToken = false;
            this.map._draggedTokenId = null;
            if (this.map._fogEnabled && this.map._fog) {
                this.map._fog.updateFromTokens(this.map._tokens.getAllTokens(), this.map._grid, this.map._vision);
            }
            this.map._sync();
        }
        this.handler.panStart = null;
    }
}

class MeasureTool {
    constructor(map) { this.map = map; }
    onMouseDown(e, mp) {
        this.map._measuring = true;
        this.map._measureStart = { x: mp.x, y: mp.y };
        this.map._measureEnd = { x: mp.x, y: mp.y };
    }
    onMouseMove(e, mp) {
        if (this.map._measuring && this.map._measureStart) {
            this.map._measureEnd = { x: mp.x, y: mp.y };
            const ft = this.map._grid.feetBetweenPixels(this.map._measureStart.x, this.map._measureStart.y, mp.x, mp.y);
            const hud = document.getElementById('tmap-measure-hud');
            if (hud) { hud.style.display = 'block'; hud.textContent = `${ft} ft`; }
            this.map.requestRender();
        }
    }
    onMouseUp() {
        if (this.map._measuring) {
            this.map._measuring = false;
            const hud = document.getElementById('tmap-measure-hud');
            if (hud) hud.style.display = 'none';
            this.map.requestRender();
        }
    }
}

class FogTool {
    constructor(map) { this.map = map; }
    onMouseDown(e, mp) { this._applyFog(mp); }
    onMouseMove(e, mp, isMouseDown) { if (isMouseDown) this._applyFog(mp); }
    onMouseUp() { this.map._sync(); }
    onContextMenu(e, mp) {
        if (this.map._fog) {
            const cell = this.map._grid.pixelToCell(mp.x, mp.y);
            this.map._fog.toggleCell(cell.col, cell.row);
            this.map._sync();
        }
    }
    _applyFog(mp) {
        const cell = this.map._grid.pixelToCell(mp.x, mp.y);
        if (this.map._fog) {
            if (this.map._fogMode === 'reveal') this.map._fog.paintReveal(cell.col, cell.row, this.map._fogBrush);
            else this.map._fog.paintHide(cell.col, cell.row, this.map._fogBrush);
            this.map.requestRender();
        }
    }
}

class EffectTool {
    constructor(map, handler, shape) { this.map = map; this.shape = shape; }
    onMouseDown(e, mp) {
        this.map._effectOrigin = { x: mp.x, y: mp.y };
        this.map._effectDragging = true;
        this.map._effectShape = this.shape;
    }
    onMouseMove(e, mp) {
        if (this.map._effectDragging && this.map._effectOrigin && this.map._effects) {
            this.map._effects.updatePreview(this.map._effectShape, this.map._effectOrigin.x, this.map._effectOrigin.y, mp.x, mp.y, this.map._effectSizeFt, this.map._effectColorKey);
            this.map.requestRender();
        }
    }
    onMouseUp(e, mp) {
        if (this.map._effectDragging && this.map._effectOrigin && this.map._effects) {
            this.map._effectDragging = false;
            this.map._effects.placeEffect(this.map._effectShape, this.map._effectOrigin.x, this.map._effectOrigin.y, mp.x, mp.y, this.map._effectSizeFt, this.map._effectColorKey, `${this.map._effectShape} ${this.map._effectSizeFt}ft`);
            this.map._effects.clearPreview();
            this.map._effectOrigin = null;
            this.map._sync();
        }
    }
}

class ShapeTool {
    constructor(map, handler, shape) { this.map = map; this.shape = shape; }
    
    _snap(p) {
        const cs = this.map._grid.cellSize;
        const half = cs / 2;
        return {
            x: Math.round(p.x / half) * half,
            y: Math.round(p.y / half) * half
        };
    }

    onMouseDown(e, mp) {
        this.map._drawingStart = this._snap(mp);
        this.map.requestRender();
    }
    
    onMouseMove(e, mp, isMouseDown) {
        if (isMouseDown && this.map._drawingStart) {
            this.map._currentMousePos = this._snap(mp);
            this.map.requestRender();
        }
    }

    onMouseUp(e, rawMp) {
        if (this.map._drawingStart) {
            const ms = this.map._drawingStart;
            const mp = this._snap(rawMp);
            
            if (Math.hypot(mp.x - ms.x, mp.y - ms.y) > 5) {
                if (this.shape === 'wall') {
                    const wall = { x1: ms.x, y1: ms.y, x2: mp.x, y2: mp.y, id: Date.now() + Math.random() };
                    this.map._undoRedo.execute(new AddWallCommand(wall));
                    Toast.show('Parede criada!', 'success');
                } else if (this.shape === 'door') {
                    const door = { x1: ms.x, y1: ms.y, x2: mp.x, y2: mp.y, isOpen: false, id: Date.now() + Math.random() };
                    this.map._undoRedo.execute(new AddDoorCommand(door));
                    Toast.show('Porta criada!', 'success');
                } else if (this.shape === 'floor_rect') {
                    const el = { id: `rect_${Date.now()}`, type: 'rect', x1: ms.x, y1: ms.y, x2: mp.x, y2: mp.y };
                    this.map._undoRedo.execute(new AddElementCommand(el));
                    Toast.show('Piso retangular criado!', 'success');
                } else if (this.shape === 'floor_circle') {
                    const el = { id: `circle_${Date.now()}`, type: 'circle', cx: ms.x, cy: ms.y, r: Math.hypot(mp.x - ms.x, mp.y - ms.y) };
                    this.map._undoRedo.execute(new AddElementCommand(el));
                    Toast.show('Piso circular criado!', 'success');
                } else if (this.shape === 'stairs') {
                    const el = { id: `stairs_${Date.now()}`, type: 'stairs', x1: ms.x, y1: ms.y, x2: mp.x, y2: mp.y };
                    this.map._undoRedo.execute(new AddElementCommand(el));
                    Toast.show('Escada posicionada!', 'success');
                }
            }
            this.map._drawingStart = null;
            this.map.requestRender();
        }
    }
}

class FreehandTool {
    constructor(map) { this.map = map; }
    onMouseDown(e, mp) { this.map._currentPath = [{ x: mp.x, y: mp.y }]; }
    onMouseMove(e, mp, isMouseDown) {
        if (isMouseDown && this.map._currentPath) {
            this.map._currentPath.push({ x: mp.x, y: mp.y });
            this.map.requestRender();
        }
    }
    onMouseUp() {
        if (this.map._currentPath && this.map._currentPath.length > 2) {
            const el = { id: `free_${Date.now()}`, type: 'freehand', points: this.map._currentPath };
            this.map._undoRedo.execute(new AddElementCommand(el));
        }
        this.map._currentPath = null;
        this.map.requestRender();
    }
}

class StampTool {
    constructor(map) { this.map = map; }
    onMouseDown(e, mp) {
        if (this.map._scatterStamps) {
            const count = 3 + Math.floor(Math.random() * 3);
            const cmdList = [];
            for (let i = 0; i < count; i++) {
                const rad = Math.random() * this.map._grid.cellSize * 1.2;
                const ang = Math.random() * Math.PI * 2;
                const el = {
                    id: `stamp_${Date.now()}_${Math.random()}`,
                    type: 'stamp',
                    x: mp.x + Math.cos(ang) * rad,
                    y: mp.y + Math.sin(ang) * rad,
                    key: this.map._stampKey,
                    scale: 0.6 + Math.random() * 0.5,
                    rotation: Math.floor(Math.random() * 360)
                };
                cmdList.push(el);
            }
            // Execute as compound addition
            cmdList.forEach(el => this.map._undoRedo.execute(new AddElementCommand(el)));
            Toast.show(`Espalhado carimbos ${this.map._stampKey}!`, 'success');
        } else {
            const el = {
                id: `stamp_${Date.now()}`,
                type: 'stamp',
                x: mp.x,
                y: mp.y,
                key: this.map._stampKey,
                scale: 1.0,
                rotation: 0
            };
            this.map._undoRedo.execute(new AddElementCommand(el));
            Toast.show('Carimbo posicionado!', 'success');
        }
        this.map.render();
    }
}

class TextTool {
    constructor(map) { this.map = map; }
    onMouseDown(e, mp) {
        const el = {
            id: `text_${Date.now()}`,
            type: 'text',
            x: mp.x,
            y: mp.y,
            text: this.map._textValue,
            size: this.map._textSize,
            color: this.map._textColor
        };
        this.map._undoRedo.execute(new AddElementCommand(el));
        Toast.show('Rótulo de texto posicionado!', 'success');
        this.map.render();
    }
}

class LightTool {
    constructor(map) { this.map = map; }
    onMouseDown(e, mp) {
        const light = {
            id: `light_${Date.now()}`,
            x: mp.x,
            y: mp.y,
            range: this.map._lightRange,
            color: this.map._lightColor,
            intensity: 1.1,
            flicker: true
        };
        this.map._undoRedo.execute(new AddLightCommand(light));
        Toast.show('Fonte de luz adicionada!', 'success');
        this.map.render();
    }
}

class EraseTool {
    constructor(map) { this.map = map; }
    
    onMouseDown(e, mp) {
        const x = mp.x;
        const y = mp.y;
        const thresh = 25;
        
        // Find elements near eraser
        const erasedElements = this.map._mapElements.filter(el => {
            if (el.type === 'stamp' || el.type === 'text') {
                return Math.hypot(el.x - x, el.y - y) <= thresh;
            }
            if (el.type === 'rect' || el.type === 'stairs') {
                const midX = (el.x1 + el.x2) / 2;
                const midY = (el.y1 + el.y2) / 2;
                return Math.hypot(midX - x, midY - y) <= thresh * 2;
            }
            if (el.type === 'circle') {
                return Math.hypot(el.cx - x, el.cy - y) <= el.r || Math.hypot(el.cx - x, el.cy - y) <= thresh;
            }
            return false;
        });

        const erasedLights = this.map._mapLights.filter(l => Math.hypot(l.x - x, l.y - y) <= thresh);

        const erasedWalls = this.map._grid._walls.filter(w => {
            const midX = (w.x1 + w.x2) / 2;
            const midY = (w.y1 + w.y2) / 2;
            return Math.hypot(midX - x, midY - y) <= thresh;
        });

        const erasedDoors = this.map._grid._doors.filter(d => {
            const midX = (d.x1 + d.x2) / 2;
            const midY = (d.y1 + d.y2) / 2;
            return Math.hypot(midX - x, midY - y) <= thresh;
        });

        if (erasedElements.length || erasedLights.length || erasedWalls.length || erasedDoors.length) {
            this.map._undoRedo.execute(new EraseCommand(erasedElements, erasedLights, erasedWalls, erasedDoors));
            Toast.show('Item apagado!', 'info');
            this.map.render();
        }
    }
}

class SpawnTool {
    constructor(map) { this.map = map; }
    
    onMouseDown(e, mp) {
        if (!this.map._spawnEntity) {
            Toast.show('Nenhuma entidade selecionada para invocação!', 'warning');
            this.map._tool = 'select';
            return;
        }

        const monstersCount = this.map._tokens.getAllTokens().filter(t => t.type === 'monster').length;
        const maxLimit = this.map._maxMonsters || 150;
        if (monstersCount >= maxLimit) {
            Toast.show(`Limite de monstros atingido (${maxLimit})!`, 'danger');
            this.map._tool = 'select';
            return;
        }
        
        let snap;
        if (this.map._gridType === 'hex') {
            const vSpacing = this.map._grid.cellSize * 0.866;
            let approxRow = Math.round(mp.y / vSpacing);
            let approxCol = Math.round((mp.x - (approxRow % 2 === 1 ? this.map._grid.cellSize / 2 : 0)) / this.map._grid.cellSize);
            snap = {
                x: approxCol * this.map._grid.cellSize + (approxRow % 2 === 1 ? this.map._grid.cellSize / 2 : 0),
                y: approxRow * vSpacing
            };
        } else {
            snap = this.map._grid.snapToCellClamped(mp.x, mp.y);
        }
        
        this.map._tokens.addToken(this.map._spawnEntity, snap.x, snap.y);
        this.map._sync();
        this.map.render();
    }
    
    onMouseMove(e, mp) {
        this.map.requestRender();
    }
}
