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
if (this.map && this.map.socket && typeof this.map.socket.emit === 'function') {
this.map.socket.emit('state_update', this.map.getSnapshot ? this.map.getSnapshot() : { action: actionName });
}
}
execute(command) {
command.execute(this.map);
this.undoStack.push(command);
if (this.undoStack.length > this.maxStackSize) {
this.undoStack.shift();
}
this.redoStack = []; // Clear redo stack on new action
this._emitSyncEvent('execute');
}
undo() {
if (this.undoStack.length === 0) return false;
const command = this.undoStack.pop();
command.undo(this.map);
this.redoStack.push(command);
this._emitSyncEvent('undo');
return true;
}
redo() {
if (this.redoStack.length === 0) return false;
const command = this.redoStack.pop();
command.execute(this.map);
this.undoStack.push(command);
this._emitSyncEvent('redo');
return true;
}
clear() {
this.undoStack = [];
this.redoStack = [];
}
}
export class AddWallCommand extends Command {
constructor(wall) {
super();
this.wall = wall; // { id, x1, y1, x2, y2 }
}
execute(map) {
map._grid._walls.push(this.wall);
if (map._renderer) map._renderer.invalidateCache();
}
undo(map) {
map._grid._walls = map._grid._walls.filter(w => w.id !== this.wall.id);
if (map._renderer) map._renderer.invalidateCache();
}
}
export class AddDoorCommand extends Command {
constructor(door) {
super();
this.door = door;
}
execute(map) {
map._grid._doors.push(this.door);
if (map._renderer) map._renderer.invalidateCache();
}
undo(map) {
map._grid._doors = map._grid._doors.filter(d => d.id !== this.door.id);
if (map._renderer) map._renderer.invalidateCache();
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
map._grid._walls = map._grid._walls.filter(w => !wallIds.has(w.id));
map._grid._doors = map._grid._doors.filter(d => !doorIds.has(d.id));
map._mapElements = map._mapElements.filter(e => !elIds.has(e.id));
map._mapLights = map._mapLights.filter(l => !lightIds.has(l.id));
if (map._renderer) map._renderer.invalidateCache();
}
undo(map) {
map._grid._walls.push(...this.erasedWalls);
map._grid._doors.push(...this.erasedDoors);
map._mapElements.push(...this.erasedElements);
map._mapLights.push(...this.erasedLights);
if (map._renderer) map._renderer.invalidateCache();
}
}