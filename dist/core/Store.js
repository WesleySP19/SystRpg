import { signal } from '@preact/signals';
export class Store {
constructor(initialState = {}) {
this._pendingNotify = false;
this._data = this._sanitize(initialState);
this.signal = signal(this._data);
this.pathSignals = {};
for (const key of Object.keys(this._data)) {
this.pathSignals[key] = signal(this._data[key]);
}
this.state = new Proxy(this._data, {
get: (target, prop) => {
return target[prop];
},
set: (target, prop, value) => {
const cloned = this._deepClone(value);
target[prop] = cloned;
if (!this.pathSignals[prop]) {
this.pathSignals[prop] = signal(cloned);
} else {
this.pathSignals[prop].value = cloned;
}
this._scheduleNotify();
this.signal.value = { ...this._data };
return true;
}
});
}
_sanitize(obj) {
if (!obj || typeof obj !== 'object') return {};
const copy = this._deepClone(obj);
let result = { ...copy };
while (result && result.state && typeof result.state === 'object' && !Array.isArray(result.state)) {
const nested = result.state;
delete result.state;
result = { ...nested, ...result };
}
return result;
}
_deepClone(value) {
if (value === null || value === undefined) return value;
if (typeof value !== 'object') return value;
try {
return JSON.parse(JSON.stringify(value));
} catch {
return value;
}
}
_scheduleNotify() {
if (this._pendingNotify) return;
this._pendingNotify = true;
queueMicrotask(() => {
this._pendingNotify = false;
});
}
update(fn) {
const draft = this._deepClone(this._data);
fn(draft);
let changed = false;
for (const key of Object.keys(draft)) {
const oldStr = JSON.stringify(this._data[key]);
const newStr = JSON.stringify(draft[key]);
if (oldStr !== newStr) {
this._data[key] = draft[key];
if (!this.pathSignals[key]) {
this.pathSignals[key] = signal(this._data[key]);
} else {
this.pathSignals[key].value = this._data[key];
}
changed = true;
}
}
if (changed) {
this._scheduleNotify();
this.signal.value = { ...this._data };
}
}
merge(partial) {
if (!partial || typeof partial !== 'object') return;
const clean = this._sanitize(partial);
let changed = false;
for (const key of Object.keys(clean)) {
const oldStr = JSON.stringify(this._data[key]);
const newStr = JSON.stringify(clean[key]);
if (oldStr !== newStr) {
this._data[key] = this._deepClone(clean[key]);
if (!this.pathSignals[key]) {
this.pathSignals[key] = signal(this._data[key]);
} else {
this.pathSignals[key].value = this._data[key];
}
changed = true;
}
}
if (changed) {
this._scheduleNotify();
this.signal.value = { ...this._data };
}
}
subscribe(listener) {
return this.signal.subscribe(listener);
}
subscribeTo(path, listener) {
if (!this.pathSignals[path]) {
this.pathSignals[path] = signal(this._data[path]);
}
return this.pathSignals[path].subscribe(listener);
}
snapshot() {
try {
return this._deepClone(this._data) || {};
} catch {
return {};
}
}
}