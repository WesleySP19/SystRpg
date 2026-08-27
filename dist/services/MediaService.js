export class MediaService {
static _getAuthHeaders(headers = {}) {
const token = localStorage.getItem('DM_JWT_TOKEN');
const newHeaders = { ...headers };
if (token) {
newHeaders['Authorization'] = `Bearer ${token}`;
}
return newHeaders;
}
static async uploadImage(filename, base64) {
try {
const response = await fetch('/api/upload', {
method: 'POST',
headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
body: JSON.stringify({ filename, image: base64 })
});
if (!response.ok) throw new Error('Erro ao fazer upload da imagem.');
const data = await response.json();
return data.url;
} catch (err) {
console.error('[MediaService] Falha no upload:', err);
return null;
}
}
static async compressImageBase64(base64, maxWidth = 1080, quality = 0.8) {
return new Promise((resolve) => {
const img = new Image();
img.onload = () => {
let width = img.width;
let height = img.height;
if (width > maxWidth) {
height = Math.round((height * maxWidth) / width);
width = maxWidth;
}
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, width, height);
resolve(canvas.toDataURL('image/webp', quality));
};
img.onerror = () => resolve(base64); // Fallback
img.src = base64;
});
}
static async resolveAndUpload(filename, value) {
if (!value || typeof value !== 'string') return value;
if (value.startsWith('data:image/')) {
console.log(`[MediaService] Comprimindo imagem: ${filename}`);
const compressed = await this.compressImageBase64(value);
const uploadedUrl = await this.uploadImage(filename.replace(/\.png|\.jpg|\.jpeg/, '.webp'), compressed);
return uploadedUrl || compressed;
}
return value;
}
static async extractMedia(state, activeSessionId) {
const stateCopy = structuredClone(state);
const prefix = activeSessionId || 'default';
const processVal = async (filename, val) => {
return await this.resolveAndUpload(filename, val);
};
if (stateCopy.players) {
for (let i = 0; i < stateCopy.players.length; i++) {
const p = stateCopy.players[i];
if (p.avatar) {
p.avatar = await processVal(`player_${p.id}_${prefix}.png`, p.avatar);
}
}
}
if (stateCopy.monsters) {
for (let i = 0; i < stateCopy.monsters.length; i++) {
const m = stateCopy.monsters[i];
if (m.img) {
m.img = await processVal(`monster_${m.id}_${prefix}.png`, m.img);
}
}
}
if (stateCopy.savedNPCs) {
for (let i = 0; i < stateCopy.savedNPCs.length; i++) {
const n = stateCopy.savedNPCs[i];
if (n.avatar) {
n.avatar = await processVal(`npc_${n.id}_${prefix}.png`, n.avatar);
}
}
}
return stateCopy;
}
static async restoreMedia(state) {
const stateCopy = structuredClone(state);
const resolveUrl = async (url) => {
if (!url || typeof url !== 'string' || url.startsWith('data:image/')) return url;
return url;
};
const traverse = async (obj) => {
if (obj && typeof obj === 'object') {
for (let key in obj) {
if (key === 'avatar' || key === 'img') {
obj[key] = await resolveUrl(obj[key]);
} else if (typeof obj[key] === 'object') {
await traverse(obj[key]);
}
}
}
};
await traverse(stateCopy);
return stateCopy;
}
}