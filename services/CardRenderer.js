/**
 * CARD RENDERER v7.0 — "Premium Physical Edition"
 * Generates stunning, professional-grade tactile physical D&D 5e cards.
 * Inspired by premium tabletop board game cards (Warm paper texture, custom banner badges, double borders).
 */
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

        // 1. Background (Parchment Paper Base)
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, H);
        
        try {
            const parchment = await this._loadImage('assets/parchment.png');
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.drawImage(parchment, 0, 0, W, H);
            ctx.restore();
        } catch (e) { /* Fallback */ }

        // 2. White Card Board Container (framed with rounded borders)
        ctx.fillStyle = '#ffffff';
        this._roundRect(ctx, 12, 12, W - 24, H - 24, 16);
        ctx.fill();
        
        ctx.strokeStyle = '#3E3A35';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Portrait Area (takes up the entire top section of the card)
        const portraitY = 12;
        const portraitW = W - 24;
        const portraitH = 378;
        ctx.save();
        this._roundRect(ctx, 12, portraitY, portraitW, portraitH, 16);
        ctx.clip();

        if (data.portraitData) {
            try {
                const img = await this._loadImage(data.portraitData);
                const settings = data.portraitSettings || { x: 0, y: 0, scale: 1 };
                const baseScale = Math.max(portraitW / img.width, portraitH / img.height);
                const finalScale = baseScale * (settings.scale || 1);
                const sw = img.width * finalScale;
                const sh = img.height * finalScale;
                
                // Allow direct user offset without clamps to keep full control of positioning
                const sx = 12 + (portraitW - sw) / 2 + (settings.x || 0);
                const sy = portraitY + (portraitH - sh) / 2 + (settings.y || 0);
                
                ctx.drawImage(img, sx, sy, sw, sh);
            } catch (err) {
                this._drawPlaceholder(ctx, 12, portraitY, portraitW, portraitH);
            }
        } else {
            this._drawPlaceholder(ctx, 12, portraitY, portraitW, portraitH);
        }

        ctx.restore();

        // Draw portrait boundary border
        ctx.strokeStyle = '#3E3A35';
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, 12, 12, W - 24, portraitH, 16);
        ctx.stroke();

        // 4. Top Left Red Level Ribbon (drawn on top of the image)
        const ribbonX = 24;
        const ribbonY = 12;
        const ribbonW = 46;
        const ribbonH = 86;
        ctx.fillStyle = '#C82333'; // Vibrant red
        ctx.fillRect(ribbonX, ribbonY, ribbonW, ribbonH);

        // White level number inside ribbon
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 32px "Outfit"';
        ctx.fillText(data.level || 1, ribbonX + ribbonW / 2, ribbonY + 38);

        // Stat frame drop icon below the number inside the ribbon
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(ribbonX + 13, ribbonY + 48, 20, 20);
        ctx.font = '10px "Outfit"';
        ctx.fillText('💧', ribbonX + ribbonW / 2, ribbonY + 62);

        // 5. Armor Class (Shield) badge drawn below the ribbon
        ctx.fillStyle = '#2E2B27';
        ctx.font = 'bold 24px "Outfit"';
        ctx.fillText(data.ac || 10, ribbonX + ribbonW / 2, 132);
        ctx.font = '12px "Outfit"';
        ctx.fillText('🛡️', ribbonX + ribbonW / 2, 148);



        // 7. Delicate Portrait Divider
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

        // 8. Character Name & Subtitle
        ctx.fillStyle = '#2E2B27';
        ctx.textAlign = 'left';
        ctx.font = 'bold 22px "Outfit"';
        const charName = (data.name || 'HERÓI').toUpperCase();
        ctx.fillText(charName, 24, 418);

        ctx.font = 'bold 11px "Outfit"';
        ctx.fillStyle = '#6E6A63';
        const subtitle = `${data.race || 'Humano'} ${data.class || 'Guerreiro'} • Nível ${data.level || 1}`;
        ctx.fillText(subtitle, 24, 434);

        // 9. Red Outlined D&D Stats Panels
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#D32F2F';

        const panelW = 168;
        const panelGap = 16;
        const colW = panelW / 3;

        // Panel 1: Physical attributes (FOR/DES/CON)
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

        // Panel 2: Mental attributes (INT/SAB/CAR)
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

        // 10. Combat Action Rows Section Header
        ctx.fillStyle = '#6E6A63';
        ctx.font = 'bold 9px "Outfit"';
        ctx.textAlign = 'left';
        ctx.fillText('AÇÕES & ATAQUES', 24, 485);
        ctx.textAlign = 'right';
        ctx.fillText('RESULTADOS (DANO)', W - 24, 485);

        // Collect Actions List
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

        // Draw 3 Action Rows
        for (let idx = 0; idx < 3; idx++) {
            const rowY = 492 + (idx * 24);
            const act = actions[idx];
            
            // Red container bar
            ctx.fillStyle = '#C82333';
            this._roundRect(ctx, 24, rowY, W - 48, 20, 4);
            ctx.fill();
            
            // Left circular indicator
            ctx.fillStyle = '#2E2B27';
            ctx.beginPath();
            ctx.arc(36, rowY + 10, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 8px "Outfit"';
            ctx.fillText(idx + 1, 36, rowY + 13);
            
            // Action/Attack Name
            ctx.textAlign = 'left';
            ctx.font = 'bold 9px "Outfit"';
            ctx.fillText(act.name.substring(0, 24), 50, rowY + 13);
            
            // Right-aligned Result Badge (White background rectangle)
            ctx.fillStyle = '#ffffff';
            this._roundRect(ctx, W - 24 - 86, rowY + 2, 82, 16, 2);
            ctx.fill();
            
            ctx.fillStyle = '#2E2B27';
            ctx.textAlign = 'center';
            ctx.font = 'bold 8px "Outfit"';
            const resLabel = `${act.bonus} : ${act.damage}`;
            ctx.fillText(resLabel, W - 24 - 43, rowY + 13);
        }

        // 11. Narrative Passive Ability Block
        ctx.fillStyle = '#2E2B27';
        this._roundRect(ctx, 24, 568, W - 48, 22, 4);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = 'bold 8px "Outfit"';
        const passiveText = `💀 PASSIVA: ${data.roleplay?.traits ? data.roleplay.traits.split(/[.,;]/)[0] : 'Heroísmo Inabalável'}`;
        ctx.fillText(passiveText.substring(0, 72), 34, 582);

        // 12. Rulebook Vitals Footer Panel
        ctx.fillStyle = '#F3EFE3';
        ctx.strokeStyle = '#D5D1C3';
        ctx.lineWidth = 1;
        this._roundRect(ctx, 24, 598, W - 48, 42, 6);
        ctx.fill();
        ctx.stroke();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 8px "Outfit"';
        
        // Part A: Iniciativa e HP
        ctx.fillStyle = '#2E2B27'; ctx.fillText('A', 34, 615);
        ctx.fillStyle = '#6E6A63'; ctx.fillText(`INICIATIVA: +${data.initiative || 0}  |  PV MÁXIMO: ${data.hp?.max || 10}`, 46, 615);

        // Part B: Deslocamento e Idiomas
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

        // 13. Card Footer
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

        // 1. Background (Parchment Paper)
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, H);
        
        try {
            const parchment = await this._loadImage('assets/parchment.png');
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.drawImage(parchment, 0, 0, W, H);
            ctx.restore();
        } catch (e) { /* Fallback */ }

        // 2. Borders
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 3;
        this._roundRect(ctx, 12, 12, W - 24, H - 24, 16);
        ctx.stroke();
        ctx.lineWidth = 1;
        this._roundRect(ctx, 18, 18, W - 36, H - 36, 12);
        ctx.stroke();

        // 3. Compass Rose/Mystical Rune background graphic (soft overlay)
        this._drawMysticalCompass(ctx, W / 2, H / 2, 180, C.accentGold);

        // 4. Back Header Title
        ctx.fillStyle = C.textDark;
        ctx.font = 'bold 24px "Cinzel"';
        ctx.textAlign = 'center';
        ctx.fillText('HISTÓRIA & POSSES', W / 2, 70);

        this._drawTacticalDivider(ctx, W / 2, 85, W - 160, C.border, C.accentGold);

        // 5. Narrative Backstory Box
        ctx.font = '13px "Outfit"';
        ctx.fillStyle = C.textDark;
        ctx.textAlign = 'center';
        
        const backstoryY = 115;
        const bioText = data.bio || 'Esta lenda ainda não possui crônicas escritas nos arquivos do Grimório RPG. Cabe ao mestre e ao jogador trilharem sua jornada épica...';

        // 6. Bottom Gold Vault Box (Currency, Proficiencies and Possessions)
        const vaultY = H - 240;
        const vaultW = W - 70;
        const vaultH = 175;

        // Wrap backstory with safe limit to prevent overlap with the bottom box
        this._wrapText(ctx, bioText, W / 2, backstoryY, W - 90, 20, vaultY - 30);
        
        ctx.fillStyle = C.bgAccent;
        this._roundRect(ctx, 35, vaultY, vaultW, vaultH, 8);
        ctx.fill();
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 2;
        this._roundRect(ctx, 35, vaultY, vaultW, vaultH, 8);
        ctx.stroke();

        // Vertical divider in the center of the vault box
        ctx.strokeStyle = C.borderLight;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W / 2, vaultY + 12);
        ctx.lineTo(W / 2, vaultY + vaultH - 12);
        ctx.stroke();

        // ═ LEFT COLUMN: TESOURO & IDIOMAS ═
        const leftCenterX = 35 + (vaultW / 4);
        ctx.fillStyle = C.textDark;
        ctx.font = 'bold 10px "Cinzel"';
        ctx.textAlign = 'center';
        ctx.fillText('TESOURO & IDIOMAS', leftCenterX, vaultY + 22);
        this._drawDivider(ctx, leftCenterX - 70, vaultY + 28, 140);

        // Coins row
        ctx.font = 'bold 9px "Outfit"';
        ctx.fillStyle = C.textDark;
        const coinsText = `PO: ${data.currency?.gp || 0}  |  PP: ${data.currency?.sp || 0}  |  PC: ${data.currency?.cp || 0}`;
        ctx.fillText(coinsText.toUpperCase(), leftCenterX, vaultY + 44);

        // Proficiencies title
        ctx.font = 'bold 8px "Outfit"';
        ctx.fillStyle = C.textMuted;
        ctx.fillText('PROFICIÊNCIAS & IDIOMAS', leftCenterX, vaultY + 68);

        // Proficiencies list
        ctx.font = '9px "Outfit"';
        ctx.fillStyle = C.textDark;
        let profText = data.otherProfs || 'Nenhuma proficiência adicional registrada.';
        if (profText.length > 70) profText = profText.substring(0, 67) + '...';
        this._wrapText(ctx, profText, leftCenterX, vaultY + 82, 170, 12, vaultY + vaultH - 15);

        // ═ RIGHT COLUMN: POSSES & ITENS ═
        const rightCenterX = W - 35 - (vaultW / 4);
        ctx.fillStyle = C.textDark;
        ctx.font = 'bold 10px "Cinzel"';
        ctx.textAlign = 'center';
        ctx.fillText('POSSES & ITENS', rightCenterX, vaultY + 22);
        this._drawDivider(ctx, rightCenterX - 70, vaultY + 28, 140);

        // Dynamic items list (Render up to 5 items)
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

        // 7. Footer
        ctx.textAlign = 'center';
        ctx.fillStyle = C.bannerRed;
        ctx.font = 'bold 9px "Outfit"';
        ctx.fillText('GRIMÓRIO RPG • LEGENDARY CAMPAIGN SYSTEM', W / 2, H - 35);
    }

    // --- PREMIUM DRAWING HELPERS ---

    static _drawVerticalBanner(ctx, x, y, w, h, level, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#2E2B27';
        ctx.lineWidth = 2;

        // Draw ribbon shape with notch at bottom
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w / 2, y + h - 12);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Level Number
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px "Outfit"';
        ctx.fillText(level, x + w / 2, y + 36);

        // Circular Target glyph below level
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

    static _drawStatusBeads(ctx, x, y, colorRed, colorGold) {
        ctx.save();
        // 4 stacked mechanical beads
        for (let i = 0; i < 4; i++) {
            const cy = y + i * 16;
            
            // Outer ring
            ctx.strokeStyle = '#2E2B27';
            ctx.lineWidth = 1.5;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, cy, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Inner colored core
            ctx.fillStyle = i === 3 ? colorGold : colorRed;
            ctx.beginPath();
            ctx.arc(x, cy, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    static _drawTacticalDivider(ctx, cx, cy, w, colorBorder, colorCenter) {
        ctx.save();
        ctx.strokeStyle = colorBorder;
        ctx.lineWidth = 1.5;

        // Draw elegant split line
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, cy);
        ctx.lineTo(cx - 15, cy);
        ctx.moveTo(cx + 15, cy);
        ctx.lineTo(cx + w / 2, cy);
        ctx.stroke();

        // Center terracotta diamond
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

    static _drawActionPill(ctx, x, y, w, h, text, bgColor, textColor) {
        ctx.save();
        
        // Draw pill button
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = '#2E2B27';
        ctx.lineWidth = 2;
        this._roundRect(ctx, x, y, w, h, h / 2);
        ctx.fill();
        ctx.stroke();

        // White Text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.font = 'bold 11px "Outfit"';
        ctx.fillText(text, x + w / 2, y + h / 2 + 4);

        ctx.restore();
    }

    static _drawCircularHPBadge(ctx, cx, cy, w, h, curHP, maxHP, bgColor, textColor, accentColor) {
        ctx.save();

        // Draw pill background
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        this._roundRect(ctx, cx, cy, w, h, 8);
        ctx.fill();
        ctx.stroke();

        // Draw double black outer border
        ctx.strokeStyle = '#2E2B27';
        ctx.lineWidth = 2;
        this._roundRect(ctx, cx, cy, w, h, 8);
        ctx.stroke();

        // Text display: HP Value / Max HP
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.font = 'bold 16px "Outfit"';
        ctx.fillText(curHP, cx + w / 2, cy + 22);

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 8px "Outfit"';
        ctx.fillText(`MAX: ${maxHP}`, cx + w / 2, cy + 34);

        ctx.restore();
    }

    static _drawMysticalCompass(ctx, cx, cy, radius, color) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 1.5;

        // Multiple concentric rings
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
        ctx.arc(cx, cy, radius - 60, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - radius - 10, cy);
        ctx.lineTo(cx + radius + 10, cy);
        ctx.moveTo(cx, cy - radius - 10);
        ctx.lineTo(cx, cy + radius + 10);
        ctx.stroke();

        // Points of interest
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
        ctx.fillStyle = '#E8E5DA';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#6E6A63';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👤', x + w / 2, y + h / 2 + 15);
    }

    static _drawDivider(ctx, x, y, w) {
        ctx.strokeStyle = this.COLORS.borderLight;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
    }

    static _wrapText(ctx, text, x, y, maxWidth, lineHeight, maxY = null) {
        const paragraphs = text.split('\n');
        
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
