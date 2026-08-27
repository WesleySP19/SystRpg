export class CanvasUtils {
static drawVerticalBanner(ctx, x, y, w, h, level, color) {
ctx.save();
ctx.fillStyle = color;
ctx.strokeStyle = '#2E2B27';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x + w, y);
ctx.lineTo(x + w, y + h);
ctx.lineTo(x + w / 2, y + h - 12);
ctx.lineTo(x, y + h);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#ffffff';
ctx.textAlign = 'center';
ctx.font = 'bold 18px "Outfit"';
ctx.fillText(level, x + w / 2, y + 36);
ctx.strokeStyle = 'rgba(255,255,255,0.7)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(x + w / 2, y + 56, 8, 0, Math.PI * 2);
ctx.stroke();
ctx.fillStyle = 'rgba(255,255,255,0.9)';
ctx.beginPath();
ctx.arc(x + w / 2, y + 56, 3, 0, Math.PI * 2);
ctx.fill();
ctx.restore();
}
static drawStatusBeads(ctx, x, y, colorRed, colorGold) {
ctx.save();
for (let i = 0; i < 4; i++) {
const cy = y + i * 16;
ctx.strokeStyle = '#2E2B27';
ctx.lineWidth = 1.5;
ctx.fillStyle = '#ffffff';
ctx.beginPath();
ctx.arc(x, cy, 5, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
ctx.fillStyle = i === 3 ? colorGold : colorRed;
ctx.beginPath();
ctx.arc(x, cy, 2.5, 0, Math.PI * 2);
ctx.fill();
}
ctx.restore();
}
static drawTacticalDivider(ctx, cx, cy, w, colorBorder, colorCenter) {
ctx.save();
ctx.strokeStyle = colorBorder;
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(cx - w / 2, cy);
ctx.lineTo(cx - 15, cy);
ctx.moveTo(cx + 15, cy);
ctx.lineTo(cx + w / 2, cy);
ctx.stroke();
ctx.fillStyle = colorCenter;
ctx.strokeStyle = colorBorder;
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(cx, cy - 6);
ctx.lineTo(cx + 6, cy);
ctx.lineTo(cx, cy + 6);
ctx.lineTo(cx - 6, cy);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.restore();
}
static drawActionPill(ctx, x, y, w, h, text, bgColor, textColor) {
ctx.save();
ctx.fillStyle = bgColor;
ctx.strokeStyle = '#2E2B27';
ctx.lineWidth = 2;
this.roundRect(ctx, x, y, w, h, h / 2);
ctx.fill();
ctx.stroke();
ctx.fillStyle = textColor;
ctx.textAlign = 'center';
ctx.font = 'bold 11px "Outfit"';
ctx.fillText(text, x + w / 2, y + h / 2 + 4);
ctx.restore();
}
static drawCircularHPBadge(ctx, cx, cy, w, h, curHP, maxHP, bgColor, textColor, accentColor) {
ctx.save();
ctx.fillStyle = bgColor;
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 1.5;
this.roundRect(ctx, cx, cy, w, h, 8);
ctx.fill();
ctx.stroke();
ctx.strokeStyle = '#2E2B27';
ctx.lineWidth = 2;
this.roundRect(ctx, cx, cy, w, h, 8);
ctx.stroke();
ctx.fillStyle = textColor;
ctx.textAlign = 'center';
ctx.font = 'bold 16px "Outfit"';
ctx.fillText(curHP, cx + w / 2, cy + 22);
ctx.fillStyle = accentColor;
ctx.fillText(`MAX: ${maxHP}`, cx + w / 2, cy + 34);
ctx.restore();
}
static drawMysticalCompass(ctx, cx, cy, radius, color) {
ctx.save();
ctx.strokeStyle = color;
ctx.globalAlpha = 0.08;
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
ctx.arc(cx, cy, radius - 60, 0, Math.PI * 2);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(cx - radius - 10, cy);
ctx.lineTo(cx + radius + 10, cy);
ctx.moveTo(cx, cy - radius - 10);
ctx.lineTo(cx, cy + radius + 10);
ctx.stroke();
for (let i = 0; i < 8; i++) {
const angle = (i * Math.PI) / 4;
const px = cx + Math.cos(angle) * (radius - 10);
const py = cy + Math.sin(angle) * (radius - 10);
ctx.beginPath();
ctx.arc(px, py, 3, 0, Math.PI * 2);
ctx.stroke();
}
ctx.restore();
}
static drawBadge(ctx, x, y, val, label, color) {
ctx.fillStyle = 'white';
this.roundRect(ctx, x, y, 45, 45, 4);
ctx.fill();
ctx.strokeStyle = color;
ctx.lineWidth = 2;
ctx.stroke();
ctx.fillStyle = color;
ctx.font = 'bold 8px "Outfit"';
ctx.textAlign = 'center';
ctx.fillText(label, x + 22, y + 12);
ctx.font = 'bold 18px "Outfit"';
ctx.fillText(val, x + 22, y + 35);
}
static drawPlaceholder(ctx, x, y, w, h) {
ctx.fillStyle = '#E8E5DA';
ctx.fillRect(x, y, w, h);
ctx.fillStyle = '#6E6A63';
ctx.font = '48px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('👤', x + w / 2, y + h / 2 + 15);
}
static drawDivider(ctx, x, y, w, borderColor) {
ctx.strokeStyle = borderColor || 'rgba(62, 58, 53, 0.15)';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(x + w, y);
ctx.stroke();
}
static wrapText(ctx, text, x, y, maxWidth, lineHeight, maxY = null) {
const paragraphs = text.split('\\n');
for (let p of paragraphs) {
if (maxY && y > maxY) {
ctx.fillText('...', x, y - lineHeight + 12);
break;
}
const words = p.split(' ');
let line = '';
for (let n = 0; n < words.length; n++) {
if (maxY && y > maxY) {
ctx.fillText('...', x, y - lineHeight + 12);
return;
}
let word = words[n];
if (ctx.measureText(word).width > maxWidth) {
if (line) {
ctx.fillText(line.trim(), x, y);
line = '';
y += lineHeight;
}
let segment = '';
for (let char of word) {
if (maxY && y > maxY) {
ctx.fillText('...', x, y - lineHeight + 12);
return;
}
const testSegment = segment + char;
if (ctx.measureText(testSegment).width > maxWidth) {
ctx.fillText(segment, x, y);
segment = char;
y += lineHeight;
} else {
segment = testSegment;
}
}
line = segment + ' ';
} else {
const testLine = line + word + ' ';
const metrics = ctx.measureText(testLine);
if (metrics.width > maxWidth) {
ctx.fillText(line.trim(), x, y);
line = word + ' ';
y += lineHeight;
} else {
line = testLine;
}
}
}
if (line) {
ctx.fillText(line.trim(), x, y);
y += lineHeight;
}
}
}
static roundRect(ctx, x, y, w, h, r) {
ctx.beginPath();
ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
ctx.quadraticCurveTo(x + w, y, x + w, y + r);
ctx.lineTo(x + w, y + h - r);
ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
ctx.closePath();
}
static loadImage(src) {
return new Promise((res, rej) => {
const img = new Image();
img.onload = () => res(img);
img.onerror = rej;
img.src = src;
});
}
}