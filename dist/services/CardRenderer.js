import { CanvasUtils } from '../ui/utils/CanvasUtils.js';
export class CardRenderer {
static async renderFront(data, canvas, options = {}) {
const scale = options.scale || 1;
const C = this.COLORS;
const W = this.CARD_W;
const H = this.CARD_H;
canvas.width = W * scale;
canvas.height = H * scale;
const ctx = canvas.getContext('2d');
if (scale !== 1) {
ctx.scale(scale, scale);
}
ctx.fillStyle = C.bg;
ctx.fillRect(0, 0, W, H);
try {
const parchment = await CanvasUtils.loadImage('assets/parchment.png');
ctx.save();
ctx.globalAlpha = 0.25;
ctx.drawImage(parchment, 0, 0, W, H);
ctx.restore();
} catch (e) {  }
ctx.fillStyle = '#ffffff';
CanvasUtils.roundRect(ctx, 12, 12, W - 24, H - 24, 16);
ctx.fill();
ctx.strokeStyle = '#3E3A35';
ctx.lineWidth = 1.5;
ctx.stroke();
const portraitY = 12;
const portraitW = W - 24;
const portraitH = 378;
ctx.save();
CanvasUtils.roundRect(ctx, 12, portraitY, portraitW, portraitH, 16);
ctx.clip();
if (data.portraitData) {
try {
const img = await CanvasUtils.loadImage(data.portraitData);
const settings = data.portraitSettings || { x: 0, y: 0, scale: 1 };
const baseScale = Math.max(portraitW / img.width, portraitH / img.height);
const finalScale = baseScale * (settings.scale || 1);
const sw = img.width * finalScale;
const sh = img.height * finalScale;
const sx = 12 + (portraitW - sw) / 2 + (settings.x || 0);
const sy = portraitY + (portraitH - sh) / 2 + (settings.y || 0);
ctx.drawImage(img, sx, sy, sw, sh);
} catch (err) {
CanvasUtils.drawPlaceholder(ctx, 12, portraitY, portraitW, portraitH);
}
} else {
CanvasUtils.drawPlaceholder(ctx, 12, portraitY, portraitW, portraitH);
}
ctx.restore();
ctx.strokeStyle = '#3E3A35';
ctx.lineWidth = 1.5;
CanvasUtils.roundRect(ctx, 12, 12, W - 24, portraitH, 16);
ctx.stroke();
const ribbonX = 24;
const ribbonY = 12;
const ribbonW = 46;
const ribbonH = 86;
ctx.fillStyle = '#C82333'; // Vibrant red
ctx.fillRect(ribbonX, ribbonY, ribbonW, ribbonH);
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.font = 'bold 32px "Outfit"';
ctx.fillText(data.level || 1, ribbonX + ribbonW / 2, ribbonY + 38);
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 1;
ctx.strokeRect(ribbonX + 13, ribbonY + 48, 20, 20);
ctx.font = '10px "Outfit"';
ctx.fillText('💧', ribbonX + ribbonW / 2, ribbonY + 62);
ctx.fillStyle = '#2E2B27';
ctx.font = 'bold 24px "Outfit"';
ctx.fillText(data.ac || 10, ribbonX + ribbonW / 2, 132);
ctx.font = '12px "Outfit"';
ctx.fillText('🛡️', ribbonX + ribbonW / 2, 148);
ctx.strokeStyle = '#3E3A35';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(24, 396);
ctx.lineTo(W - 24, 396);
ctx.stroke();
ctx.fillStyle = '#ffffff';
ctx.fillRect(W / 2 - 12, 391, 24, 10);
ctx.fillStyle = '#3E3A35';
ctx.font = '8px sans-serif';
ctx.fillText('⬦⬦', W / 2, 399);
ctx.fillStyle = '#2E2B27';
ctx.textAlign = 'left';
ctx.font = 'bold 22px "Outfit"';
const charName = (data.name || 'HERÓI').toUpperCase();
ctx.fillText(charName, 24, 418);
ctx.font = 'bold 11px "Outfit"';
ctx.fillStyle = '#6E6A63';
const subtitle = `${data.race || 'Humano'} ${data.class || 'Guerreiro'} • Nível ${data.level || 1}`;
ctx.fillText(subtitle, 24, 434);
ctx.lineWidth = 1;
ctx.strokeStyle = '#D32F2F';
const panelW = 168;
const panelGap = 16;
const colW = panelW / 3;
ctx.strokeRect(24, 444, panelW, 24);
ctx.beginPath();
ctx.moveTo(24 + colW, 444); ctx.lineTo(24 + colW, 468);
ctx.moveTo(24 + colW * 2, 444); ctx.lineTo(24 + colW * 2, 468);
ctx.stroke();
ctx.textAlign = 'center';
ctx.font = 'bold 9px "Outfit"';
ctx.fillStyle = '#6E6A63'; ctx.fillText('FOR', 24 + 22, 460);
ctx.fillStyle = '#D32F2F'; ctx.fillText(data.stats?.str || 10, 24 + 50, 460);
ctx.fillStyle = '#6E6A63'; ctx.fillText('DES', 24 + colW + 22, 460);
ctx.fillStyle = '#D32F2F'; ctx.fillText(data.stats?.dex || 10, 24 + colW + 50, 460);
ctx.fillStyle = '#6E6A63'; ctx.fillText('CON', 24 + colW * 2 + 22, 460);
ctx.fillStyle = '#D32F2F'; ctx.fillText(data.stats?.con || 10, 24 + colW * 2 + 50, 460);
const panel2X = 24 + panelW + panelGap;
ctx.strokeRect(panel2X, 444, panelW, 24);
ctx.beginPath();
ctx.moveTo(panel2X + colW, 444); ctx.lineTo(panel2X + colW, 468);
ctx.moveTo(panel2X + colW * 2, 444); ctx.lineTo(panel2X + colW * 2, 468);
ctx.stroke();
ctx.fillStyle = '#6E6A63'; ctx.fillText('INT', panel2X + 22, 460);
ctx.fillStyle = '#D32F2F'; ctx.fillText(data.stats?.int || 10, panel2X + 50, 460);
ctx.fillStyle = '#6E6A63'; ctx.fillText('SAB', panel2X + colW + 22, 460);
ctx.fillStyle = '#D32F2F'; ctx.fillText(data.stats?.wis || 10, panel2X + colW + 50, 460);
ctx.fillStyle = '#6E6A63'; ctx.fillText('CAR', panel2X + colW * 2 + 22, 460);
ctx.fillStyle = '#D32F2F'; ctx.fillText(data.stats?.cha || 10, panel2X + colW * 2 + 50, 460);
ctx.fillStyle = '#6E6A63';
ctx.font = 'bold 9px "Outfit"';
ctx.textAlign = 'left';
ctx.fillText('AÇÕES & ATAQUES', 24, 485);
ctx.textAlign = 'right';
ctx.fillText('RESULTADOS (DANO)', W - 24, 485);
const actions = [];
if (data.attacks && data.attacks.length > 0) {
data.attacks.forEach(a => {
if (a.name) {
actions.push({ name: a.name.toUpperCase(), bonus: a.bonus || '+0', damage: a.damage || '1d4' });
}
});
}
if (actions.length < 1) actions.push({ name: 'ATAQUE DESARMADO', bonus: '+4', damage: '1d4+2' });
if (actions.length < 2) actions.push({ name: 'EMPURRAR / AGARRAR', bonus: 'Atletismo', damage: 'Efeito' });
if (actions.length < 3) actions.push({ name: 'ESQUIVAR / PROTEGER', bonus: 'Desvant.', damage: 'Defesa' });
for (let idx = 0; idx < 3; idx++) {
const rowY = 492 + (idx * 24);
const act = actions[idx];
ctx.fillStyle = '#C82333';
CanvasUtils.roundRect(ctx, 24, rowY, W - 48, 20, 4);
ctx.fill();
ctx.fillStyle = '#2E2B27';
ctx.beginPath();
ctx.arc(36, rowY + 10, 8, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.font = 'bold 8px "Outfit"';
ctx.fillText(idx + 1, 36, rowY + 13);
ctx.textAlign = 'left';
ctx.font = 'bold 9px "Outfit"';
ctx.fillText(act.name.substring(0, 24), 50, rowY + 13);
ctx.fillStyle = '#ffffff';
CanvasUtils.roundRect(ctx, W - 24 - 86, rowY + 2, 82, 16, 2);
ctx.fill();
ctx.fillStyle = '#2E2B27';
ctx.textAlign = 'center';
ctx.font = 'bold 8px "Outfit"';
const resLabel = `${act.bonus} : ${act.damage}`;
ctx.fillText(resLabel, W - 24 - 43, rowY + 13);
}
ctx.fillStyle = '#2E2B27';
CanvasUtils.roundRect(ctx, 24, 568, W - 48, 22, 4);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'left';
ctx.font = 'bold 8px "Outfit"';
const passiveText = `💀 PASSIVA: ${data.roleplay?.traits ? data.roleplay.traits.split(/[.,;]/)[0] : 'Heroísmo Inabalável'}`;
ctx.fillText(passiveText.substring(0, 72), 34, 582);
ctx.fillStyle = '#F3EFE3';
ctx.strokeStyle = '#D5D1C3';
ctx.lineWidth = 1;
CanvasUtils.roundRect(ctx, 24, 598, W - 48, 42, 6);
ctx.fill();
ctx.stroke();
ctx.textAlign = 'left';
ctx.font = 'bold 8px "Outfit"';
ctx.fillStyle = '#2E2B27'; ctx.fillText('A', 34, 615);
ctx.fillStyle = '#6E6A63'; ctx.fillText(`INICIATIVA: +${data.initiative || 0}  |  PV MÁXIMO: ${data.hp?.max || 10}`, 46, 615);
ctx.fillStyle = '#2E2B27'; ctx.fillText('B', 34, 630);
ctx.fillStyle = '#6E6A63';
let speedVal = data.speed || 30;
let speedText = `${speedVal}ft`;
if (speedVal < 20) {
const feet = Math.round(speedVal / 1.5) * 5;
speedText = `${feet}ft (${speedVal}m)`;
}
let langText = data.otherProfs ? data.otherProfs.split(/[.,;]/)[0] : 'Comum, Élfico';
langText = langText.replace(/^(idiomas?|languages?)\s*:\s*/i, '').trim();
ctx.fillText(`DESLOCAMENTO: ${speedText}  |  IDIOMAS: ${langText.substring(0, 32)}`, 46, 630);
ctx.textAlign = 'center';
ctx.fillStyle = '#6E6A63';
ctx.font = 'bold 7px "Outfit"';
ctx.fillText('HawnkCorp. ©', W / 2, 658);
}
static async renderBack(data, canvas, options = {}) {
const scale = options.scale || 1;
const C = this.COLORS;
const W = this.CARD_W;
const H = this.CARD_H;
canvas.width = W * scale;
canvas.height = H * scale;
const ctx = canvas.getContext('2d');
if (scale !== 1) {
ctx.scale(scale, scale);
}
ctx.fillStyle = C.bg;
ctx.fillRect(0, 0, W, H);
try {
const parchment = await CanvasUtils.loadImage('assets/parchment.png');
ctx.save();
ctx.globalAlpha = 0.25;
ctx.drawImage(parchment, 0, 0, W, H);
ctx.restore();
} catch (e) {  }
ctx.strokeStyle = C.border;
ctx.lineWidth = 3;
CanvasUtils.roundRect(ctx, 12, 12, W - 24, H - 24, 16);
ctx.stroke();
ctx.lineWidth = 1;
CanvasUtils.roundRect(ctx, 18, 18, W - 36, H - 36, 12);
ctx.stroke();
CanvasUtils.drawMysticalCompass(ctx, W / 2, H / 2, 180, C.accentGold);
ctx.fillStyle = C.textDark;
ctx.font = 'bold 24px "Cinzel"';
ctx.textAlign = 'center';
ctx.fillText('HISTÓRIA & POSSES', W / 2, 70);
CanvasUtils.drawTacticalDivider(ctx, W / 2, 85, W - 160, C.border, C.accentGold);
ctx.font = '13px "Outfit"';
ctx.fillStyle = C.textDark;
ctx.textAlign = 'center';
const backstoryY = 115;
const bioText = data.bio || 'Esta lenda ainda não possui crônicas escritas nos arquivos do Grimório RPG. Cabe ao mestre e ao jogador trilharem sua jornada épica...';
const vaultY = H - 240;
const vaultW = W - 70;
const vaultH = 175;
CanvasUtils.wrapText(ctx, bioText, W / 2, backstoryY, W - 90, 20, vaultY - 30);
ctx.fillStyle = C.bgAccent;
CanvasUtils.roundRect(ctx, 35, vaultY, vaultW, vaultH, 8);
ctx.fill();
ctx.strokeStyle = C.border;
ctx.lineWidth = 2;
CanvasUtils.roundRect(ctx, 35, vaultY, vaultW, vaultH, 8);
ctx.stroke();
ctx.strokeStyle = C.borderLight;
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(W / 2, vaultY + 12);
ctx.lineTo(W / 2, vaultY + vaultH - 12);
ctx.stroke();
const leftCenterX = 35 + (vaultW / 4);
ctx.fillStyle = C.textDark;
ctx.font = 'bold 10px "Cinzel"';
ctx.textAlign = 'center';
ctx.fillText('TESOURO & IDIOMAS', leftCenterX, vaultY + 22);
CanvasUtils.drawDivider(ctx, leftCenterX - 70, vaultY + 28, 140);
ctx.font = 'bold 9px "Outfit"';
ctx.fillStyle = C.textDark;
const coinsText = `PO: ${data.currency?.gp || 0}  |  PP: ${data.currency?.sp || 0}  |  PC: ${data.currency?.cp || 0}`;
ctx.fillText(coinsText.toUpperCase(), leftCenterX, vaultY + 44);
ctx.font = 'bold 8px "Outfit"';
ctx.fillStyle = C.textMuted;
ctx.fillText('PROFICIÊNCIAS & IDIOMAS', leftCenterX, vaultY + 68);
ctx.font = '9px "Outfit"';
ctx.fillStyle = C.textDark;
let profText = data.otherProfs || 'Nenhuma proficiência adicional registrada.';
if (profText.length > 70) profText = profText.substring(0, 67) + '...';
CanvasUtils.wrapText(ctx, profText, leftCenterX, vaultY + 82, 170, 12, vaultY + vaultH - 15);
const rightCenterX = W - 35 - (vaultW / 4);
ctx.fillStyle = C.textDark;
ctx.font = 'bold 10px "Cinzel"';
ctx.textAlign = 'center';
ctx.fillText('POSSES & ITENS', rightCenterX, vaultY + 22);
CanvasUtils.drawDivider(ctx, rightCenterX - 70, vaultY + 28, 140);
const items = (data.equipment?.items || []).filter(it => it.name && it.name.trim());
if (items.length > 0) {
ctx.textAlign = 'left';
ctx.font = '9px "Outfit"';
ctx.fillStyle = C.textDark;
for (let i = 0; i < Math.min(5, items.length); i++) {
const item = items[i];
let itemStr = `• ${item.name}`;
if (item.qty > 1) itemStr += ` (x${item.qty})`;
if (itemStr.length > 26) itemStr = itemStr.substring(0, 23) + '...';
ctx.fillText(itemStr, rightCenterX - 75, vaultY + 44 + (i * 15));
}
if (items.length > 5) {
ctx.fillText('• ... e outros itens.', rightCenterX - 75, vaultY + 44 + (5 * 15));
}
} else {
ctx.textAlign = 'center';
ctx.font = 'italic 9px "Outfit"';
ctx.fillStyle = C.textMuted;
ctx.fillText('Nenhum item carregado nas posses.', rightCenterX, vaultY + 60);
}
ctx.textAlign = 'center';
ctx.fillStyle = C.bannerRed;
ctx.font = 'bold 9px "Outfit"';
ctx.fillText('GRIMÓRIO RPG • LEGENDARY CAMPAIGN SYSTEM', W / 2, H - 35);
}
static download(canvas, filename) {
const link = document.createElement('a');
link.download = filename;
link.href = canvas.toDataURL('image/png');
link.click();
}
}
CardRenderer.COLORS = {
bg: '#FAF8F2',           // Creamy high-quality paper background
bgAccent: '#F3EFE3',     // Warm accent paper
border: '#3E3A35',       // Dark charcoal gray
borderLight: 'rgba(62, 58, 53, 0.15)',
textDark: '#2E2B27',     // Almost black warm charcoal
textMuted: '#6E6A63',    // Soft medium gray
bannerRed: '#BC4A3C',    // Terracotta red accent
accentGold: '#D4AF37',   // Metallic gold
danger: '#B91C1C',
success: '#166534',
info: '#1E40AF'
};
CardRenderer.CARD_W = 500;
CardRenderer.CARD_H = 700;