export function generatePatch(oldObj, newObj, basePath = '') {
const patches = [];
if (oldObj === newObj) return patches;
if (oldObj === null || oldObj === undefined || newObj === null || newObj === undefined) {
if (oldObj !== newObj) {
patches.push({ op: 'replace', path: basePath || '/', value: newObj });
}
return patches;
}
if (typeof oldObj !== typeof newObj) {
patches.push({ op: 'replace', path: basePath || '/', value: newObj });
return patches;
}
if (typeof oldObj !== 'object') {
if (oldObj !== newObj) {
patches.push({ op: 'replace', path: basePath || '/', value: newObj });
}
return patches;
}
if (Array.isArray(oldObj) && Array.isArray(newObj)) {
if (oldObj.length === newObj.length) {
let identical = true;
for (let i = 0; i < oldObj.length; i++) {
if (typeof oldObj[i] === 'object' || typeof newObj[i] === 'object') {
identical = false;
break;
}
if (oldObj[i] !== newObj[i]) {
identical = false;
break;
}
}
if (identical) return patches;
}
const oldStr = JSON.stringify(oldObj);
const newStr = JSON.stringify(newObj);
if (oldStr !== newStr) {
patches.push({ op: 'replace', path: basePath, value: newObj });
}
return patches;
}
const oldKeys = Object.keys(oldObj);
const newKeys = Object.keys(newObj);
const allKeys = new Set([...oldKeys, ...newKeys]);
for (const key of allKeys) {
const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
const fullPath = `${basePath}/${escapedKey}`;
if (!(key in oldObj)) {
patches.push({ op: 'add', path: fullPath, value: newObj[key] });
} else if (!(key in newObj)) {
patches.push({ op: 'remove', path: fullPath });
} else {
const subPatches = generatePatch(oldObj[key], newObj[key], fullPath);
patches.push(...subPatches);
}
}
return patches;
}
export function applyPatch(target, patches) {
if (!patches || patches.length === 0) return target;
let result;
try {
result = JSON.parse(JSON.stringify(target));
} catch {
result = { ...target };
}
for (const patch of patches) {
try {
_applyOp(result, patch);
} catch (err) {
console.warn(`[DeltaSync] Falha ao aplicar patch ${patch.op} em ${patch.path}:`, err.message);
}
}
return result;
}
function _applyOp(obj, patch) {
const { op, path, value } = patch;
if (path === '/' || path === '') {
if (op === 'replace' && typeof value === 'object' && value !== null) {
Object.keys(obj).forEach(k => delete obj[k]);
Object.assign(obj, value);
}
return;
}
const segments = path.split('/').filter(Boolean).map(s =>
s.replace(/~1/g, '/').replace(/~0/g, '~')
);
if (segments.length === 0) return;
let current = obj;
for (let i = 0; i < segments.length - 1; i++) {
const seg = segments[i];
if (current === null || current === undefined) return;
if (Array.isArray(current)) {
const idx = parseInt(seg, 10);
if (isNaN(idx) || idx < 0 || idx >= current.length) return;
current = current[idx];
} else if (typeof current === 'object') {
if (!(seg in current) && op === 'add') {
current[seg] = {};
}
current = current[seg];
} else {
return;
}
}
const lastSeg = segments[segments.length - 1];
switch (op) {
case 'add':
case 'replace':
if (Array.isArray(current)) {
const idx = parseInt(lastSeg, 10);
if (!isNaN(idx)) {
current[idx] = value;
}
} else if (typeof current === 'object' && current !== null) {
current[lastSeg] = value;
}
break;
case 'remove':
if (Array.isArray(current)) {
const idx = parseInt(lastSeg, 10);
if (!isNaN(idx)) {
current.splice(idx, 1);
}
} else if (typeof current === 'object' && current !== null) {
delete current[lastSeg];
}
break;
}
}
export function isPatchEmpty(patches) {
return !patches || patches.length === 0;
}
export function patchSize(patches) {
if (!patches || patches.length === 0) return 0;
try {
return JSON.stringify(patches).length;
} catch {
return 0;
}
}