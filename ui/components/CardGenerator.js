import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { CardRenderer } from '../../services/CardRenderer.js';
import { Toast } from '../components/Toast.js';
import { exportFrontBackPNG } from '../utils/imageExport.js';
import { PersistenceService } from '../../services/PersistenceService.js';


export class CardGenerator extends Component {
    constructor(opts) {
        super(opts);
        this._selectedHeroId = null;
        this._redrawTimer = null;
    }

    template() {
        const { players } = this.store.state;
        const p = players?.find(h => h.id === this._selectedHeroId);

        return `
            <div class="page" style="max-width: 1400px; animation: fadeIn 0.4s ease-out;">
                <div class="section-header" style="margin-bottom: 25px;">
                    <h2 class="section-title"><i class="fa-solid fa-address-card" style="color:var(--accent); margin-right:12px;"></i> Gerador de Cartas de Heróis</h2>
                    <p class="section-subtitle">Gere os cards físicos de frente e verso baseados nos status em tempo real</p>
                </div>

                <div style="display:flex; gap:20px; margin-bottom:30px; background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="flex:1;">
                        <label style="font-size:0.85rem; font-weight:800; color:var(--accent); letter-spacing:1px; text-transform:uppercase;">Selecione a Lenda:</label>
                        <select class="legacy-input" style="width:100%; font-size:1.1rem; margin-top:8px; padding:10px; background:rgba(0,0,0,0.4) !important;" data-action="selectHero">
                            <option value="">-- Escolha um Herói --</option>
                            ${players ? players.map(hero => `<option value="${hero.id}" ${this._selectedHeroId === hero.id ? 'selected' : ''}>${hero.name} (Nv. ${hero.level || 1})</option>`).join('') : ''}
                        </select>
                    </div>
                </div>

                ${!p ? `
                    <div class="card empty-state" style="height:40vh; border:2px dashed rgba(255,255,255,0.1); border-radius:15px;">
                        <i class="fa-solid fa-wand-magic-sparkles fa-3x" style="opacity:0.3; margin-bottom:20px; color:var(--accent);"></i>
                        <p style="font-family:'Cinzel'; font-size:1.2rem; color:var(--text-dim);">Selecione um herói acima para invocar as suas cartas.</p>
                    </div>
                ` : `
                    <div style="display:grid; grid-template-columns: 1fr 380px; gap:40px; align-items:start; width:100%;">
                        
                        <!-- LEFT PANEL: CANVAS PREVIEWS -->
                        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; padding:30px; background:rgba(255,255,255,0.02); border-radius:15px; border:1px solid rgba(255,255,255,0.05); backdrop-filter:blur(10px);">
                            <p style="color:var(--text-dim); font-size:0.85rem; text-align:center; margin:0;">
                                <i class="fa-solid fa-circle-info" style="color:var(--accent); margin-right:5px;"></i> Clique em qualquer uma das cartas abaixo para fazer o download em alta resolução (PNG de 300 DPI).
                            </p>
                            
                            <div style="display:flex; gap:30px; justify-content:center; flex-wrap:wrap; margin-top:20px; width:100%;">
                                <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                                    <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-weight:800; letter-spacing:1px; font-size:0.9rem;">FRENTE (COMBATE)</h4>
                                    <canvas id="tool-card-front" data-action="downloadCard" data-side="front" style="border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(197, 160, 89, 0.1); max-width:100%; height:auto; cursor:pointer; border:1px solid rgba(197, 160, 89, 0.3); transition:transform 0.2s;"></canvas>
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
                                    <h4 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-weight:800; letter-spacing:1px; font-size:0.9rem;">VERSO (HISTÓRIA)</h4>
                                    <canvas id="tool-card-back" data-action="downloadCard" data-side="back" style="border-radius:15px; box-shadow:0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(197, 160, 89, 0.1); max-width:100%; height:auto; cursor:pointer; border:1px solid rgba(197, 160, 89, 0.3); transition:transform 0.2s;"></canvas>
                                </div>
                            </div>
                            
                            <div style="margin-top:15px; width:100%; display:flex; justify-content:center;">
                                <button class="btn btn-primary" data-action="downloadPrintablePair" style="padding:12px 30px; font-size:0.85rem; font-family:'Cinzel'; letter-spacing:1.5px; box-shadow:0 0 12px var(--accent); font-weight:800;">
                                    <i class="fa-solid fa-file-image" style="margin-right:8px;"></i> BAIXAR PAR IMPRIMÍVEL LADO A LADO (5:7)
                                </button>
                            </div>
                        </div>

                        <!-- RIGHT PANEL: PREMIUM CARD CUSTOMIZER -->
                        <div class="card glass-accent" style="padding:25px; display:flex; flex-direction:column; gap:20px; border:2px solid var(--accent); border-radius:15px; position:sticky; top:20px; background:rgba(18,18,22,0.9); backdrop-filter:blur(15px); box-shadow:0 15px 40px rgba(0,0,0,0.6);">
                            <h3 style="margin:0; font-family:'Cinzel'; color:var(--accent); display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; font-weight:900; letter-spacing:1px; font-size:1.1rem;">
                                <i class="fa-solid fa-sliders"></i> AJUSTES DO CARD
                            </h3>
                            
                            <!-- Portrait Image Section -->
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <label style="font-size:0.8rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fa-solid fa-image"></i> Imagem de Retrato
                                </label>
                                <button class="btn btn-ghost btn-sm btn-block" data-action="triggerPortrait" style="border:1px dashed var(--accent); padding:10px; font-size:0.75rem; font-weight:800;">
                                    <i class="fa-solid fa-upload"></i> MUDAR ARQUIVO DE FOTO
                                </button>
                                <input type="file" id="tool-portrait-input" style="display:none;" accept="image/*">
                            </div>

                            <!-- Sliders Section -->
                            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:15px; display:flex; flex-direction:column; gap:15px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <label style="font-size:0.8rem; font-weight:800; color:var(--accent); text-transform:uppercase; letter-spacing:0.5px;">
                                        <i class="fa-solid fa-up-down-left-right"></i> Enquadramento
                                    </label>
                                    <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:2px 8px; border:1px solid rgba(255,255,255,0.2); font-weight:800;" data-action="resetPortrait">
                                        CENTRALIZAR
                                    </button>
                                </div>
                                
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;">
                                        <span style="color:#aaa;">ZOOM (ESCALA)</span>
                                        <span id="label-scale" style="color:var(--accent);">${(p.portraitSettings?.scale || 1).toFixed(2)}x</span>
                                    </div>
                                    <input type="range" class="btn-block" min="0.5" max="3" step="0.05" value="${p.portraitSettings?.scale || 1}" data-action="updatePortrait" data-key="scale" style="accent-color:var(--accent);">
                                </div>

                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;">
                                        <span style="color:#aaa;">DESLOCAMENTO X</span>
                                        <span id="label-x" style="color:var(--accent);">${p.portraitSettings?.x || 0}px</span>
                                    </div>
                                    <input type="range" class="btn-block" min="-250" max="250" step="1" value="${p.portraitSettings?.x || 0}" data-action="updatePortrait" data-key="x" style="accent-color:var(--accent);">
                                </div>

                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; font-weight:800;">
                                        <span style="color:#aaa;">DESLOCAMENTO Y</span>
                                        <span id="label-y" style="color:var(--accent);">${p.portraitSettings?.y || 0}px</span>
                                    </div>
                                    <input type="range" class="btn-block" min="-250" max="250" step="1" value="${p.portraitSettings?.y || 0}" data-action="updatePortrait" data-key="y" style="accent-color:var(--accent);">
                                </div>
                            </div>

                            <!-- Verso Text Customizer Section -->
                            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:15px; display:flex; flex-direction:column; gap:8px;">
                                <label style="font-size:0.8rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fa-solid fa-scroll"></i> História & Bio (Verso)
                                </label>
                                <textarea id="tool-bio-input" class="legacy-textarea" style="height:120px; font-size:0.75rem; line-height:1.4; padding:10px; background:rgba(0,0,0,0.3);" placeholder="Escreva a biografia ou os traços do herói aqui..." data-action="updateBio">${p.bio || p.roleplay?.traits || ''}</textarea>
                            </div>

                            <!-- Card Back Icon (Logo) Customizer Section -->
                            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:15px; display:flex; flex-direction:column; gap:12px;">
                                <label style="font-size:0.8rem; font-weight:800; color:var(--accent); display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    <i class="fa-solid fa-dice"></i> Ícone do Verso (Logo)
                                </label>
                                
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; background:rgba(0,0,0,0.3); padding:3px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                                    <button type="button" class="btn btn-sm ${p.cardIconType !== 'image' ? 'btn-primary' : 'btn-ghost'}" style="font-size:0.65rem; padding:4px;" data-action="toggleIconType" data-type="emoji">EMOJI / SÍMBOLO</button>
                                    <button type="button" class="btn btn-sm ${p.cardIconType === 'image' ? 'btn-primary' : 'btn-ghost'}" style="font-size:0.65rem; padding:4px;" data-action="toggleIconType" data-type="image">IMAGEM UPLOAD</button>
                                </div>

                                ${p.cardIconType === 'image' ? `
                                    <button class="btn btn-ghost btn-sm btn-block" data-action="triggerCardIconUpload" style="border:1px dashed var(--accent); padding:8px; font-size:0.7rem; font-weight:800;">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> ${p.cardIconImage ? 'ALTERAR ÍCONE' : 'SUBIR ÍCONE PNG/SVG'}
                                    </button>
                                    <input type="file" id="tool-cardicon-input" style="display:none;" accept="image/*">
                                    ${p.cardIconImage ? `
                                        <div style="display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px;">
                                            <img src="${p.cardIconImage}" style="width:40px; height:40px; object-fit:contain;">
                                        </div>
                                    ` : ''}
                                ` : `
                                    <div style="display:flex; gap:10px;">
                                        <input type="text" id="tool-emoji-input" class="legacy-input" style="width:50px; text-align:center; font-size:1.2rem; padding:5px; background:rgba(0,0,0,0.3) !important;" value="${p.cardIconEmoji || '🎲'}" data-action="changeEmojiInput">
                                        <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:5px; flex:1;">
                                            ${['🎲', '⚔️', '🛡️', '🔮', '💀', '🐉', '🏹', '🌿', '🪙', '🧪'].map(em => `
                                                <button type="button" class="btn btn-ghost" style="padding:4px; font-size:1rem; border:1px solid rgba(255,255,255,0.05); background:${(p.cardIconEmoji || '🎲') === em ? 'rgba(197, 160, 89, 0.2)' : 'transparent'};" data-action="selectQuickEmoji" data-emoji="${em}">${em}</button>
                                            `).join('')}
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    onMount() {
        if (this._selectedHeroId) {
            this._drawCards();
            
            // Set up portrait upload change handler
            const pInput = this.$('#tool-portrait-input');
            if (pInput) {
                pInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                            const rawBase64 = ev.target.result;
                            const compressed = await this._compressImage(rawBase64);
                            const fileName = `portrait_${Date.now()}_${file.name}`;
                            const uploadedUrl = await PersistenceService.uploadImage(fileName, compressed);
                            TOME.store.update(s => {
                                const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
                                if (idx !== -1) {
                                    s.players[idx].portraitData = uploadedUrl;
                                }
                            });
                            this.render();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            // Set up card icon upload handler
            const cInput = this.$('#tool-cardicon-input');
            if (cInput) {
                cInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = async (ev) => {
                            const rawBase64 = ev.target.result;
                            const compressed = await this._compressImage(rawBase64);
                            const fileName = `icon_${Date.now()}_${file.name}`;
                            const uploadedUrl = await PersistenceService.uploadImage(fileName, compressed);
                            TOME.store.update(s => {
                                const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
                                if (idx !== -1) {
                                    s.players[idx].cardIconImage = uploadedUrl;
                                    s.players[idx].cardIconType = 'image';
                                }
                            });
                            this.render();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }
        }
    }

    selectHero(e, el) {
        this._selectedHeroId = el.value;
        this.render();
    }

    triggerPortrait() {
        const pInput = this.$('#tool-portrait-input');
        if (pInput) pInput.click();
    }

    updatePortrait(e, el) {
        const key = el.dataset.key;
        const val = parseFloat(el.value);
        
        // Instant visual feedback for range slider labels
        const lbl = this.$(`#label-${key}`);
        if (lbl) {
            lbl.textContent = key === 'scale' ? `${val.toFixed(2)}x` : `${val}px`;
        }

        TOME.store.update(s => {
            const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
            if (idx !== -1) {
                if (!s.players[idx].portraitSettings) {
                    s.players[idx].portraitSettings = { x: 0, y: 0, scale: 1 };
                }
                s.players[idx].portraitSettings[key] = val;
            }
        });

        // Debounced redraw for high performance drag
        clearTimeout(this._redrawTimer);
        this._redrawTimer = setTimeout(() => {
            this._drawCards();
        }, 50);
    }

    resetPortrait() {
        TOME.store.update(s => {
            const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
            if (idx !== -1) {
                s.players[idx].portraitSettings = { x: 0, y: 0, scale: 1 };
            }
        });
        this.render();
    }

    updateBio(e, el) {
        const val = el.value;
        TOME.store.update(s => {
            const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
            if (idx !== -1) {
                s.players[idx].bio = val;
                if (!s.players[idx].roleplay) s.players[idx].roleplay = {};
                s.players[idx].roleplay.traits = val;
            }
        });

        clearTimeout(this._redrawTimer);
        this._redrawTimer = setTimeout(() => {
            this._drawCards();
        }, 150);
    }

    toggleIconType(e, el) {
        const type = el.dataset.type;
        TOME.store.update(s => {
            const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
            if (idx !== -1) {
                s.players[idx].cardIconType = type;
            }
        });
        this.render();
    }

    triggerCardIconUpload() {
        const cInput = this.$('#tool-cardicon-input');
        if (cInput) cInput.click();
    }

    changeEmojiInput(e, el) {
        const val = el.value || '🎲';
        TOME.store.update(s => {
            const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
            if (idx !== -1) {
                s.players[idx].cardIconEmoji = val;
            }
        });
        this._drawCards();
    }

    selectQuickEmoji(e, el) {
        const em = el.dataset.emoji;
        TOME.store.update(s => {
            const idx = s.players.findIndex(h => h.id === this._selectedHeroId);
            if (idx !== -1) {
                s.players[idx].cardIconEmoji = em;
            }
        });
        this.render();
    }

    _drawCards() {
        const { players } = this.store.state;
        const p = players?.find(h => h.id === this._selectedHeroId);
        if (!p) return;

        const data = {
            ...p,
            bio: p.bio || p.roleplay?.traits || 'Nenhuma história registrada para esta lenda.'
        };

        const cFront = this.$('#tool-card-front');
        const cBack = this.$('#tool-card-back');
        if (cFront) CardRenderer.renderFront(data, cFront);
        if (cBack) CardRenderer.renderBack(data, cBack);
    }

    async downloadCard(e, el) {
        const side = el.dataset.side;
        const { players } = this.store.state;
        const p = players?.find(h => h.id === this._selectedHeroId);
        if (!p) {
            Toast.show('❌ Personagem não encontrado para exportação.', 'danger');
            return;
        }
        
        Toast.show('🔮 Preparando imagem em alta resolução...');
        try {
            const data = {
                ...p,
                bio: p.bio || p.roleplay?.traits || 'Nenhuma história registrada para esta lenda.'
            };
            
            const tempCanvas = document.createElement('canvas');
            if (side === 'front') {
                await CardRenderer.renderFront(data, tempCanvas, { scale: 4 });
            } else {
                await CardRenderer.renderBack(data, tempCanvas, { scale: 4 });
            }
            
            const name = p.name.toLowerCase().replace(/\s+/g, '_');
            CardRenderer.download(tempCanvas, `${name}_card_${side}.png`);
            Toast.show(`📥 Carta (${side}) baixada com sucesso!`);
        } catch (err) {
            console.error('Erro ao baixar carta:', err);
            Toast.show('❌ Erro ao exportar carta.', 'danger');
        }
    }

    async downloadPrintablePair() {
        const { players } = this.store.state;
        const p = players?.find(h => h.id === this._selectedHeroId);
        if (!p) {
            Toast.show('❌ Personagem não encontrado para exportação.', 'danger');
            return;
        }

        Toast.show('🔮 Preparando par imprimível em alta resolução...');
        try {
            const data = {
                ...p,
                bio: p.bio || p.roleplay?.traits || 'Nenhuma história registrada para esta lenda.'
            };
            
            const tempFront = document.createElement('canvas');
            const tempBack = document.createElement('canvas');
            
            await CardRenderer.renderFront(data, tempFront, { scale: 4 });
            await CardRenderer.renderBack(data, tempBack, { scale: 4 });
            
            const frontDataUrl = tempFront.toDataURL('image/png');
            const backDataUrl = tempBack.toDataURL('image/png');
            
            const name = p.name.toLowerCase().replace(/\s+/g, '_');
            
            await exportFrontBackPNG(frontDataUrl, backDataUrl, {
                filename: `${name}_card_print_pair.png`,
                printWidthCm: 7.0,
                printHeightCm: 9.8
            });
            
            Toast.show('✅ Par imprimível (5:7) baixado com sucesso!');
        } catch (err) {
            console.error('Erro ao exportar par imprimível:', err);
            Toast.show('❌ Erro ao exportar par imprimível.', 'danger');
        }
    }

    _compressImage(base64Str, maxWidth = 400, maxHeight = 400, quality = 0.75) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/webp', quality);
                resolve(compressed);
            };
            img.onerror = () => resolve(base64Str);
            img.src = base64Str;
        });
    }
}
