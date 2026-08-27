export function drawCardText(ctx, text, options = {}) {
const {
dpi = 300,
cardWidthCm = 6.75,
cardHeightCm = 9.29,
marginCm = 0.3,
fontFamily = 'Arial',
fontSizePx,
color = '#000',
align = 'center',
} = options;
const cmToPx = cm => Math.round((cm / 2.54) * dpi);
const cardW = cmToPx(cardWidthCm);
const cardH = cmToPx(cardHeightCm);
const marginPx = cmToPx(marginCm);
const usableW = cardW - marginPx * 2;
const usableH = cardH - marginPx * 2;
const sizePx = fontSizePx ?? Math.round(usableH * 0.1);
ctx.font = `${sizePx}px ${fontFamily}`;
ctx.fillStyle = color;
ctx.textBaseline = 'middle';
let x;
if (align === 'left') x = marginPx;
else if (align === 'right') x = cardW - marginPx;
else x = cardW / 2;
ctx.textAlign = align;
const y = cardH / 2;
ctx.fillText(text, x, y, usableW);
}
export function drawMultilineCardText(ctx, lines, options = {}) {
const { lineHeight = 1.2, startY, ...rest } = options;
const lineArray = Array.isArray(lines) ? lines : lines.split('\n');
const {
dpi = 300,
cardWidthCm = 6.75,
cardHeightCm = 9.29,
marginCm = 0.3,
fontFamily = 'Arial',
fontSizePx,
color = '#000',
align = 'center',
} = rest;
const cmToPx = cm => Math.round((cm / 2.54) * dpi);
const cardW = cmToPx(cardWidthCm);
const cardH = cmToPx(cardHeightCm);
const marginPx = cmToPx(marginCm);
const usableW = cardW - marginPx * 2;
const usableH = cardH - marginPx * 2;
const baseSize = fontSizePx ?? Math.round(usableH * 0.1);
const linePx = Math.round(baseSize * lineHeight);
const totalHeight = linePx * lineArray.length;
const defaultStartY = (cardH - totalHeight) / 2;
const yStart = startY ?? defaultStartY;
lineArray.forEach((txt, i) => {
const y = yStart + i * linePx + linePx / 2; // middle of each line slice
ctx.save();
ctx.translate(0, y - cardH / 2);
drawCardText(ctx, txt, { dpi, cardWidthCm, cardHeightCm, marginCm, fontFamily, fontSizePx: baseSize, color, align });
ctx.restore();
});
}