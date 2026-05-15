/**
 * CARD RENDERER v6.0 — "Legacy Edition"
 * Generates official-looking D&D 5e cards using Parchment & Ink aesthetic.
 */
export class CardRenderer {

    static COLORS = {
        bg: '#fdfcfc',
        bgAccent: '#eff5f9',
        border: '#1a1a1a',
        borderDim: 'rgba(0,0,0,0.15)',
        text: '#000000',
        textMuted: '#444444',
        textDim: '#777777',
        accent: '#d4af37',
        danger: '#b91c1c',
        success: '#166534',
        info: '#1e40af'
    };

    static CARD_W = 440;
    static CARD_H = 680;

    static async renderFront(data, canvas) {
        const C = this.COLORS;
        const W = this.CARD_W;
        const H = this.CARD_H;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // 1. Background (Parchment)
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, H);
        
        try {
            const parchment = await this._loadImage('assets/parchment.png');
            ctx.globalAlpha = 0.4;
            ctx.drawImage(parchment, 0, 0, W, H);
            ctx.globalAlpha = 1.0;
        } catch (e) { /* Fallback to solid color if image fails */ }

        // 2. Borders (Official Double Line Style)
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 3;
        this._roundRect(ctx, 10, 10, W - 20, H - 20, 4);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        this._roundRect(ctx, 15, 15, W - 30, H - 30, 2);
        ctx.stroke();

        // 3. Portrait Area
        const portraitH = H * 0.42;
        ctx.save();
        this._roundRect(ctx, 22, 22, W - 44, portraitH, 2);
        ctx.clip();

        if (data.portraitData) {
            try {
                const img = await this._loadImage(data.portraitData);
                const settings = data.portraitSettings || { x: 0, y: 0, scale: 1 };
                const baseScale = Math.max((W - 44) / img.width, portraitH / img.height);
                const finalScale = baseScale * (settings.scale || 1);
                const sw = img.width * finalScale;
                const sh = img.height * finalScale;
                const sx = 22 + ((W - 44) - sw) / 2 + (settings.x || 0);
                const sy = 22 + (portraitH - sh) / 2 + (settings.y || 0);
                ctx.drawImage(img, sx, sy, sw, sh);
            } catch (err) {
                this._drawPlaceholder(ctx, 22, 22, W - 44, portraitH);
            }
        } else {
            this._drawPlaceholder(ctx, 22, 22, W - 44, portraitH);
        }
        ctx.restore();

        // 4. Badges (HP/AC)
        this._drawBadge(ctx, 32, 32, `${data.hp?.current ?? data.hp?.max ?? 10}`, 'HP', C.danger);
        this._drawBadge(ctx, W - 76, 32, `${data.ac ?? 10}`, 'CA', C.info);

        // 5. Name & Info
        const nameY = portraitH + 45;
        ctx.textAlign = 'center';
        ctx.fillStyle = C.text;
        ctx.font = 'bold 26px "Cinzel"';
        ctx.fillText((data.name || 'HERÓI').toUpperCase(), W / 2, nameY);

        ctx.font = '14px "Outfit"';
        ctx.fillStyle = C.textMuted;
        const sub = `${data.race || ''} ${data.class || ''} • Nível ${data.level || 1}`;
        ctx.fillText(sub, W / 2, nameY + 22);

        // 6. Stats Bar
        const statsY = nameY + 45;
        this._drawDivider(ctx, 40, statsY, W - 80);
        
        const stats = [
            { l: 'FOR', v: data.stats?.str || 10 },
            { l: 'DES', v: data.stats?.dex || 10 },
            { l: 'CON', v: data.stats?.con || 10 },
            { l: 'INT', v: data.stats?.int || 10 },
            { l: 'SAB', v: data.stats?.wis || 10 },
            { l: 'CAR', v: data.stats?.cha || 10 }
        ];

        const sw = (W - 80) / 6;
        stats.forEach((s, i) => {
            const sx = 40 + i * sw;
            const mod = Math.floor((s.v - 10) / 2);
            
            ctx.fillStyle = C.bgAccent;
            this._roundRect(ctx, sx + 2, statsY + 15, sw - 4, 55, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = C.text;
            ctx.font = 'bold 10px "Outfit"';
            ctx.fillText(s.l, sx + sw/2, statsY + 30);
            ctx.font = 'bold 18px "Outfit"';
            ctx.fillText(s.v, sx + sw/2, statsY + 52);
            ctx.font = 'bold 12px "Outfit"';
            ctx.fillStyle = C.textMuted;
            ctx.fillText(mod >= 0 ? `+${mod}` : mod, sx + sw/2, statsY + 65);
        });

        // 7. Actions Section
        const actY = statsY + 90;
        ctx.fillStyle = C.text;
        ctx.font = 'bold 12px "Cinzel"';
        ctx.textAlign = 'left';
        ctx.fillText('AÇÕES E ATAQUES', 40, actY + 20);
        this._drawDivider(ctx, 40, actY + 25, W - 80);

        const attacks = data.attacks || [];
        attacks.slice(0, 5).forEach((atk, i) => {
            const ay = actY + 50 + i * 25;
            ctx.font = 'bold 13px "Outfit"';
            ctx.fillStyle = C.text;
            ctx.fillText(atk.name, 45, ay);
            ctx.textAlign = 'center';
            ctx.fillText(atk.bonus || '+0', W - 120, ay);
            ctx.textAlign = 'right';
            ctx.fillStyle = C.danger;
            ctx.fillText(atk.damage || '—', W - 45, ay);
            ctx.textAlign = 'left';
        });

        // Footer
        ctx.textAlign = 'center';
        ctx.fillStyle = C.textDim;
        ctx.font = '9px "Outfit"';
        ctx.fillText('TOMO RPG • LEGACY SYSTEM v6.0', W/2, H - 25);
    }

    static renderBack(data, canvas) {
        const C = this.COLORS;
        const W = this.CARD_W;
        const H = this.CARD_H;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, H);
        
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 3;
        this._roundRect(ctx, 10, 10, W - 20, H - 20, 4);
        ctx.stroke();

        ctx.fillStyle = C.text;
        ctx.font = 'bold 24px "Cinzel"';
        ctx.textAlign = 'center';
        ctx.fillText('HISTÓRIA & BIO', W/2, 60);
        this._drawDivider(ctx, 60, 75, W-120);

        ctx.font = '14px "Outfit"';
        ctx.fillStyle = C.textMuted;
        this._wrapText(ctx, data.bio || 'Sem registros.', 40, 110, W - 80, 20);

        // Logo D20 at bottom
        ctx.font = '40px sans-serif';
        ctx.fillText('🎲', W/2, H - 80);
    }

    // --- HELPERS ---
    static _drawBadge(ctx, x, y, val, label, color) {
        ctx.fillStyle = 'white';
        this._roundRect(ctx, x, y, 45, 45, 4);
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

    static _drawPlaceholder(ctx, x, y, w, h) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#ccc';
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👤', x + w/2, y + h/2 + 15);
    }

    static _drawDivider(ctx, x, y, w) {
        ctx.strokeStyle = this.COLORS.borderDim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
    }

    static _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else { line = testLine; }
        }
        ctx.fillText(line, x, y);
    }

    static _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    static _loadImage(src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.onload = () => res(img);
            img.onerror = rej;
            img.src = src;
        });
    }

    static download(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}
