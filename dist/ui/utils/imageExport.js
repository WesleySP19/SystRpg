export async function exportFrontBackPNG(frontSrc, backSrc, options = {}) {
const {
dpi = 300,
printWidthCm = 7.0,   // Default to 7 cm width per side as requested by the user
printHeightCm = 9.8,   // Default to 9.8 cm height to match 5:7 aspect ratio
autoDownload = true,
filename = 'front_back.png',
} = options;
const inchesW = printWidthCm / 2.54; // per side
const inchesH = printHeightCm / 2.54;
const pxW = Math.round(inchesW * dpi);
const pxH = Math.round(inchesH * dpi);
const loadImg = src =>
new Promise((resolve, reject) => {
const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => resolve(img);
img.onerror = () => reject(new Error('Failed to load image: ' + src));
img.src = src;
});
const [frontImg, backImg] = await Promise.all([loadImg(frontSrc), loadImg(backSrc)]);
const canvas = document.createElement('canvas');
canvas.width = pxW * 2; // two sides side-by-side
canvas.height = pxH;
const ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(frontImg, 0, 0, pxW, pxH);
ctx.drawImage(backImg, pxW, 0, pxW, pxH);
const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
if (autoDownload && blob) {
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.style.display = 'none';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}
return blob;
}
function wrapText(ctx, text, maxWidth) {
const lines = [];
const paragraphs = (text || '').split('\n');
for (const para of paragraphs) {
const words = para.split(' ');
let currentLine = words[0] || '';
for (let i = 1; i < words.length; i++) {
const word = words[i];
const width = ctx.measureText(currentLine + ' ' + word).width;
if (width < maxWidth) {
currentLine += ' ' + word;
} else {
lines.push(currentLine);
currentLine = word;
}
}
lines.push(currentLine);
}
return lines;
}
export async function exportSessionSummaryPNG(sessionData = {}, options = {}) {
const {
autoDownload = true,
filename = `Cronica_Sessao_${sessionData.sessionNumber || 1}_${Date.now()}.png`
} = options;
const width = 1080;
const height = 1350; // Aspect ratio 4:5 optimized for Discord and Mobile feeds
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0b0c10';
ctx.fillRect(0, 0, width, height);
const radGold = ctx.createRadialGradient(200, 200, 10, 200, 200, 600);
radGold.addColorStop(0, 'rgba(197, 160, 89, 0.15)');
radGold.addColorStop(1, 'transparent');
ctx.fillStyle = radGold;
ctx.fillRect(0, 0, width, height);
const radCyan = ctx.createRadialGradient(880, 1150, 10, 880, 1150, 600);
radCyan.addColorStop(0, 'rgba(102, 252, 241, 0.12)');
radCyan.addColorStop(1, 'transparent');
ctx.fillStyle = radCyan;
ctx.fillRect(0, 0, width, height);
ctx.strokeStyle = '#c5a059';
ctx.lineWidth = 4;
ctx.strokeRect(30, 30, width - 60, height - 60);
ctx.strokeStyle = 'rgba(197, 160, 89, 0.35)';
ctx.lineWidth = 1.5;
ctx.strokeRect(42, 42, width - 84, height - 84);
ctx.fillStyle = '#c5a059';
const cornerSize = 8;
const positions = [
[40, 40], [width - 40 - cornerSize, 40],
[40, height - 40 - cornerSize], [width - 40 - cornerSize, height - 40 - cornerSize]
];
positions.forEach(([x, y]) => ctx.fillRect(x, y, cornerSize, cornerSize));
let y = 110;
ctx.textAlign = 'center';
ctx.font = 'bold 20px Cinzel, serif';
ctx.fillStyle = '#c5a059';
ctx.fillText('• CRÔNICA OFICIAL DA AVENTURA •', width / 2, y);
y += 60;
ctx.font = 'bold 44px Cinzel, serif';
ctx.fillStyle = '#ffffff';
const titleText = sessionData.title || 'Aventura sem Título';
ctx.fillText(titleText.length > 32 ? titleText.substring(0, 30) + '...' : titleText, width / 2, y);
y += 45;
ctx.font = '22px Outfit, Inter, sans-serif';
ctx.fillStyle = '#66fcf1';
const dateStr = sessionData.date || new Date().toLocaleDateString('pt-BR');
ctx.fillText(`SESSÃO Nº ${sessionData.sessionNumber || 1}  |  DATA: ${dateStr}`, width / 2, y);
y += 35;
ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(200, y);
ctx.lineTo(width - 200, y);
ctx.stroke();
y += 60;
ctx.textAlign = 'left';
ctx.font = 'bold 24px Cinzel, serif';
ctx.fillStyle = '#c5a059';
ctx.fillText('HERÓIS ATIVOS NA SESSÃO', 80, y);
y += 35;
const heroes = (sessionData.players && sessionData.players.length > 0)
? sessionData.players
: [{ name: 'Nenhum aventureiro registrado.', class: '', level: '' }];
ctx.font = '22px Outfit, Inter, sans-serif';
let col = 0;
heroes.slice(0, 6).forEach((h, index) => {
const colX = 80 + (col * 460);
const rowY = y + (Math.floor(index / 2) * 40);
ctx.fillStyle = '#ffffff';
ctx.fillText(`⚔️ ${h.name || 'Anônimo'}`, colX, rowY);
if (h.class) {
const nameWidth = ctx.measureText(`⚔️ ${h.name} `).width;
ctx.fillStyle = '#94a3b8';
ctx.fillText(`(${h.class} Nív ${h.level || '?'})`, colX + nameWidth, rowY);
}
col = col === 0 ? 1 : 0;
});
y += Math.ceil(Math.min(heroes.length, 6) / 2) * 40 + 20;
ctx.fillStyle = 'rgba(23, 28, 38, 0.75)';
ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
ctx.lineWidth = 1;
const boxHeight = 180;
ctx.fillRect(80, y, width - 160, boxHeight);
ctx.strokeRect(80, y, width - 160, boxHeight);
ctx.fillStyle = '#c5a059';
ctx.fillRect(80, y, 6, boxHeight);
ctx.font = 'bold 22px Cinzel, serif';
ctx.fillStyle = '#fbbf24';
ctx.fillText('👑 TESOUROS & CONQUISTAS ÉPICAS', 110, y + 40);
ctx.font = '20px Outfit, Inter, sans-serif';
ctx.fillStyle = '#e2e8f0';
const lootText = sessionData.loot || 'Nenhum item ou ouro anotado na mesa.';
const lootLines = wrapText(ctx, lootText, width - 230);
lootLines.slice(0, 4).forEach((line, idx) => {
ctx.fillText(line, 110, y + 80 + (idx * 28));
});
y += boxHeight + 50;
ctx.font = 'bold 24px Cinzel, serif';
ctx.fillStyle = '#c5a059';
ctx.fillText('📜 MARCOS DA CRÔNICA NO GRIMÓRIO', 80, y);
y += 35;
ctx.font = '21px Outfit, Inter, sans-serif';
const narrative = sessionData.chronicle || sessionData.notes || 'As lendas desta sessão continuam a ecoar no TOME do Mestre...';
const narrativeLines = wrapText(ctx, narrative, width - 160);
narrativeLines.slice(0, 11).forEach((line, idx) => {
ctx.fillStyle = idx === 0 && sessionData.chronicle ? '#66fcf1' : '#cbd5e1';
ctx.fillText(line, 80, y + (idx * 32));
});
const footerY = height - 70;
ctx.textAlign = 'center';
ctx.font = '18px Cinzel, serif';
ctx.fillStyle = 'rgba(197, 160, 89, 0.7)';
ctx.fillText('GERADO PELO TOME VTT • O ELO ARCANO DEFINITIVO', width / 2, footerY);
const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
if (autoDownload && blob) {
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.style.display = 'none';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}
return blob;
}