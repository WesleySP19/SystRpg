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
            <div class="page p-6 w-full max-w-[1400px] mx-auto animate-fadeIn relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div class="section-header border-b border-white/10 pb-6 mb-8 relative z-10">
                    <h2 class="font-cinzel text-3xl font-bold m-0 text-white flex items-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]"><i class="fa-solid fa-address-card text-accent"></i> Gerador de Cartas de Heróis</h2>
                    <p class="font-outfit text-sm text-slate-400 mt-2 uppercase tracking-widest">Gere os cards físicos de frente e verso baseados nos status em tempo real</p>
                </div>

                <div class="flex gap-5 mb-8 bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 shadow-xl relative z-10">
                    <div class="flex-1">
                        <label class="text-[0.8rem] font-bold text-accent tracking-widest uppercase mb-2 block">Selecione a Lenda:</label>
                        <select class="legacy-input w-full text-lg mt-2 p-3 bg-black/50 border border-white/10 rounded-lg text-white focus:border-accent outline-none transition-colors" data-action="selectHero">
                            <option value="" class="bg-black text-white">-- Escolha um Herói --</option>
                            ${players ? players.map(hero => `<option value="${hero.id}" class="bg-black text-white" ${this._selectedHeroId === hero.id ? 'selected' : ''}>${hero.name} (Nv. ${hero.level || 1})</option>`).join('') : ''}
                        </select>
                    </div>
                </div>

                ${!p ? `
                    <div class="card empty-state h-[40vh] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center bg-black/20 relative z-10">
                        <i class="fa-solid fa-wand-magic-sparkles text-5xl opacity-30 mb-5 text-accent"></i>
                        <p class="font-cinzel text-xl text-slate-400">Selecione um herói acima para invocar as suas cartas.</p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start w-full relative z-10">
                        
                        <!-- LEFT PANEL: CANVAS PREVIEWS -->
                        <div class="flex flex-col items-center gap-5 p-8 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
                            <p class="text-slate-400 text-sm text-center m-0 flex items-center justify-center gap-2">
                                <i class="fa-solid fa-circle-info text-accent"></i> Clique em qualquer uma das cartas abaixo para fazer o download em alta resolução (PNG de 300 DPI).
                            </p>
                            
                            <div class="flex gap-8 justify-center flex-wrap mt-5 w-full">
                                <div class="flex flex-col items-center gap-3">
                                    <h4 class="m-0 font-cinzel text-accent font-bold tracking-widest text-sm">FRENTE (COMBATE)</h4>
                                    <canvas id="tool-card-front" data-action="downloadCard" data-side="front" class="rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(197,160,89,0.1)] max-w-full h-auto cursor-pointer border border-accent/30 hover:scale-105 transition-transform duration-300"></canvas>
                                </div>
                                <div class="flex flex-col items-center gap-3">
                                    <h4 class="m-0 font-cinzel text-accent font-bold tracking-widest text-sm">VERSO (HISTÓRIA)</h4>
                                    <canvas id="tool-card-back" data-action="downloadCard" data-side="back" class="rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(197,160,89,0.1)] max-w-full h-auto cursor-pointer border border-accent/30 hover:scale-105 transition-transform duration-300"></canvas>
                                </div>
                            </div>
                            
                            <div class="mt-4 w-full flex justify-center">
                                <button class="btn btn-primary py-3 px-8 text-sm font-cinzel tracking-widest shadow-[0_0_12px_rgba(197,160,89,0.5)] font-bold rounded-xl flex items-center justify-center gap-2" data-action="downloadPrintablePair">
                                    <i class="fa-solid fa-file-image"></i> BAIXAR PAR IMPRIMÍVEL LADO A LADO (5:7)
                                </button>
                            </div>
                        </div>

                        <!-- RIGHT PANEL: PREMIUM CARD CUSTOMIZER -->
                        <div class="card glass-accent p-6 flex flex-col gap-5 border border-accent/30 rounded-2xl sticky top-5 bg-black/60 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
                            <h3 class="m-0 font-cinzel text-accent flex items-center gap-3 border-b border-white/10 pb-3 font-black tracking-widest text-lg">
                                <i class="fa-solid fa-sliders"></i> AJUSTES DO CARD
                            </h3>
                            
                            <!-- Portrait Image Section -->
                            <!-- Portrait Image Section -->
                            <div class="flex flex-col gap-2.5">
                                <label class="text-[0.75rem] font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                                    <i class="fa-solid fa-image"></i> Imagem de Retrato
                                </label>
                                <button class="btn btn-ghost btn-sm w-full border border-dashed border-accent/50 p-2.5 text-xs font-bold hover:bg-accent/10" data-action="triggerPortrait">
                                    <i class="fa-solid fa-upload mr-1.5"></i> MUDAR ARQUIVO DE FOTO
                                </button>
                                <input type="file" id="tool-portrait-input" class="hidden" accept="image/*">
                            </div>

                            <!-- Sliders Section -->
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-4">
                                <div class="flex justify-between items-center">
                                    <label class="text-[0.75rem] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                                        <i class="fa-solid fa-up-down-left-right"></i> Enquadramento
                                    </label>
                                    <button class="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 border border-white/20 font-bold rounded hover:bg-white/10" data-action="resetPortrait">
                                        CENTRALIZAR
                                    </button>
                                </div>
                                
                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between text-[0.7rem] font-bold">
                                        <span class="text-slate-400">ZOOM (ESCALA)</span>
                                        <span id="label-scale" class="text-accent">${(p.portraitSettings?.scale || 1).toFixed(2)}x</span>
                                    </div>
                                    <input type="range" class="w-full accent-accent" min="0.5" max="3" step="0.05" value="${p.portraitSettings?.scale || 1}" data-action="updatePortrait" data-key="scale">
                                </div>

                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between text-[0.7rem] font-bold">
                                        <span class="text-slate-400">DESLOCAMENTO X</span>
                                        <span id="label-x" class="text-accent">${p.portraitSettings?.x || 0}px</span>
                                    </div>
                                    <input type="range" class="w-full accent-accent" min="-250" max="250" step="1" value="${p.portraitSettings?.x || 0}" data-action="updatePortrait" data-key="x">
                                </div>

                                <div class="flex flex-col gap-1.5">
                                    <div class="flex justify-between text-[0.7rem] font-bold">
                                        <span class="text-slate-400">DESLOCAMENTO Y</span>
                                        <span id="label-y" class="text-accent">${p.portraitSettings?.y || 0}px</span>
                                    </div>
                                    <input type="range" class="w-full accent-accent" min="-250" max="250" step="1" value="${p.portraitSettings?.y || 0}" data-action="updatePortrait" data-key="y">
                                </div>
                            </div>

                            <!-- Verso Text Customizer Section -->
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-2">
                                <label class="text-[0.75rem] font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                                    <i class="fa-solid fa-scroll"></i> História & Bio (Verso)
                                </label>
                                <textarea id="tool-bio-input" class="legacy-textarea h-[120px] text-xs leading-relaxed p-3 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-accent resize-none text-slate-300" placeholder="Escreva a biografia ou os traços do herói aqui..." data-action="updateBio">${p.bio || p.roleplay?.traits || ''}</textarea>
                            </div>

                            <!-- Card Back Icon (Logo) Customizer Section -->
                            <div class="border-t border-white/10 pt-4 flex flex-col gap-3">
                                <label class="text-[0.75rem] font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
                                    <i class="fa-solid fa-dice"></i> Ícone do Verso (Logo)
                                </label>
                                
                                <div class="grid grid-cols-2 gap-1 bg-black/30 p-1 rounded-lg border border-white/5">
                                    <button type="button" class="btn btn-sm ${p.cardIconType !== 'image' ? 'bg-accent/20 text-accent font-bold' : 'btn-ghost text-slate-400'} text-[0.65rem] py-1 rounded" data-action="toggleIconType" data-type="emoji">EMOJI / SÍMBOLO</button>
                                    <button type="button" class="btn btn-sm ${p.cardIconType === 'image' ? 'bg-accent/20 text-accent font-bold' : 'btn-ghost text-slate-400'} text-[0.65rem] py-1 rounded" data-action="toggleIconType" data-type="image">IMAGEM UPLOAD</button>
                                </div>

                                ${p.cardIconType === 'image' ? `
                                    <button class="btn btn-ghost btn-sm w-full border border-dashed border-accent/50 p-2 text-xs font-bold hover:bg-accent/10" data-action="triggerCardIconUpload">
                                        <i class="fa-solid fa-cloud-arrow-up mr-1.5"></i> ${p.cardIconImage ? 'ALTERAR ÍCONE' : 'SUBIR ÍCONE PNG/SVG'}
                                    </button>
                                    <input type="file" id="tool-cardicon-input" class="hidden" accept="image/*">
                                    ${p.cardIconImage ? `
                                        <div class="flex justify-center items-center bg-black/20 p-2.5 rounded-lg border border-white/5 mt-1">
                                            <img src="${p.cardIconImage}" class="w-10 h-10 object-contain">
                                        </div>
                                    ` : ''}
                                ` : `
                                    <div class="flex gap-2.5 mt-1">
                                        <input type="text" id="tool-emoji-input" class="legacy-input w-12 text-center text-xl p-1 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-accent" value="${p.cardIconEmoji || '🎲'}" data-action="changeEmojiInput">
                                        <div class="grid grid-cols-5 gap-1.5 flex-1">
                                            ${['🎲', '⚔️', '🛡️', '🔮', '💀', '🐉', '🏹', '🌿', '🪙', '🧪'].map(em => `
                                                <button type="button" class="btn btn-ghost p-1 text-lg border border-white/5 rounded-lg hover:border-accent/50 hover:bg-white/5 transition-colors" style="background:${(p.cardIconEmoji || '🎲') === em ? 'rgba(197, 160, 89, 0.2)' : 'transparent'};" data-action="selectQuickEmoji" data-emoji="${em}">${em}</button>
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

    onUnmount() {
        if (this._redrawTimer) {
            clearTimeout(this._redrawTimer);
            this._redrawTimer = null;
        }
    }
}
