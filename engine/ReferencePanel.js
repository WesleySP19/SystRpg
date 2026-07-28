/**
 * REFERENCE PANEL v1.0 — D&D 5e Tactical Map
 * Sidebar panel for GM to upload and display scene reference images.
 * Players see the current image in their view.
 * Uses BroadcastChannel to sync with player-view.html.
 */
import { Component } from '../ui/core/Component.js';
import { TOME } from '../core/Registry.js';
import { Toast } from '../ui/components/Toast.js';
import { PersistenceService } from '../services/PersistenceService.js';

export class ReferencePanel extends Component {
    constructor(opts) {
        super(opts);
        this._images = this.store.state.referenceImages || [];
        this._activeIdx = this.store.state.referenceActiveIdx ?? 0;
        this._lightboxOpen = false;
        this._channel = null;

        // BroadcastChannel for player sync
        try {
            this._channel = new BroadcastChannel('tome_reference');
        } catch (e) { /* Safari private */ }
    }

    template() {
        const active = this._images[this._activeIdx];
        return `
            <div class="ref-panel">
                <!-- Header -->
                <div class="ref-panel-header">
                    <span class="ref-panel-title">
                        <i class="fa-solid fa-image"></i> Referência Visual
                    </span>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-ghost btn-sm" data-action="uploadImage" title="Carregar Imagem">
                            <i class="fa-solid fa-upload"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" data-action="clearAll" title="Limpar Tudo">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>

                <input type="file" id="ref-upload" accept="image/*" style="display:none;" multiple>

                <!-- Active Image -->
                <div class="ref-display ${this._lightboxOpen ? 'ref-lightbox' : ''}">
                    ${active ? `
                        <img src="${active.data}" alt="${active.name}"
                             class="ref-img" data-action="toggleLightbox"
                             title="Clique para ampliar" />
                        <div class="ref-img-label">${active.name}</div>
                        <div class="ref-img-controls">
                            <button class="ref-ctrl-btn" data-action="broadcastActive" title="Enviar para Jogadores">
                                <i class="fa-solid fa-broadcast-tower"></i>
                            </button>
                            <button class="ref-ctrl-btn danger" data-action="deleteActive" title="Remover">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ` : `
                        <div class="ref-empty">
                            <i class="fa-solid fa-image"></i>
                            <span>Sem imagem</span>
                            <button class="btn btn-ghost btn-sm" data-action="uploadImage">
                                Carregar
                            </button>
                        </div>
                    `}
                </div>

                <!-- Thumbnail Strip -->
                ${this._images.length > 1 ? `
                    <div class="ref-thumb-strip">
                        ${this._images.map((img, i) => `
                            <div class="ref-thumb ${i === this._activeIdx ? 'active' : ''}"
                                 data-action="selectImage" data-idx="${i}"
                                 title="${img.name}">
                                <img src="${img.data}" alt="${img.name}" />
                                <div class="ref-thumb-del" data-action="deleteImage" data-idx="${i}">✕</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Broadcast status -->
                ${this.store.state.referenceBroadcast ? `
                    <div style="font-size:0.6rem;color:var(--success);text-align:center;padding:4px;display:flex;align-items:center;gap:4px;justify-content:center;">
                        <span style="width:6px;height:6px;background:var(--success);border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
                        Transmitindo para Jogadores
                    </div>
                ` : ''}
            </div>
        `;
    }

    /* ── Actions ────────────────────────────────────────────────── */

    uploadImage() {
        this.$('#ref-upload').click();
    }

    selectImage(e, el) {
        const idx = parseInt(el.dataset.idx);
        if (!isNaN(idx)) {
            this._activeIdx = idx;
            this._sync();
            if (this.store.state.referenceBroadcast) {
                this.broadcastActive();
            } else {
                this.render();
            }
        }
    }

    toggleLightbox() {
        this._lightboxOpen = !this._lightboxOpen;
        this.render();
    }

    broadcastActive() {
        const img = this._images[this._activeIdx];
        if (!img) return;

        // Sync via store (for localStorage broadcast)
        TOME.store.update(s => {
            s.referenceBroadcast = true;
            s.referenceCurrentImg = img.data;
            s.referenceCurrentName = img.name;
        });

        // BroadcastChannel for instant sync
        if (this._channel) {
            this._channel.postMessage({
                type: 'REFERENCE_IMAGE',
                data: img.data,
                name: img.name
            });
        }

        Toast.show(`📡 "${img.name}" enviado para jogadores!`, 'success');
        this.render();
    }

    deleteActive() {
        this._images.splice(this._activeIdx, 1);
        this._activeIdx = Math.max(0, this._activeIdx - 1);
        this._sync();
        if (this.store.state.referenceBroadcast) {
            if (this._images.length > 0) {
                this.broadcastActive();
            } else {
                TOME.store.update(s => {
                    s.referenceBroadcast = false;
                    s.referenceCurrentImg = null;
                });
                if (this._channel) {
                    this._channel.postMessage({
                        type: 'REFERENCE_IMAGE',
                        data: null,
                        name: ''
                    });
                }
                this.render();
            }
        } else {
            this.render();
        }
    }

    deleteImage(e, el) {
        e.stopPropagation();
        const idx = parseInt(el.dataset.idx);
        if (!isNaN(idx)) {
            this._images.splice(idx, 1);
            if (this._activeIdx >= this._images.length) this._activeIdx = Math.max(0, this._images.length - 1);
            this._sync();
            if (this.store.state.referenceBroadcast) {
                if (this._images.length > 0) {
                    this.broadcastActive();
                } else {
                    TOME.store.update(s => {
                        s.referenceBroadcast = false;
                        s.referenceCurrentImg = null;
                    });
                    if (this._channel) {
                        this._channel.postMessage({
                            type: 'REFERENCE_IMAGE',
                            data: null,
                            name: ''
                        });
                    }
                    this.render();
                }
            } else {
                this.render();
            }
        }
    }

    clearAll() {
        if (!this._images.length) return;
        if (!confirm('Remover todas as imagens de referência?')) return;
        this._images = [];
        this._activeIdx = 0;
        TOME.store.update(s => {
            s.referenceBroadcast = false;
            s.referenceCurrentImg = null;
        });
        if (this._channel) {
            this._channel.postMessage({
                type: 'REFERENCE_IMAGE',
                data: null,
                name: ''
            });
        }
        this._sync();
        this.render();
    }

    _sync() {
        TOME.store.update(s => {
            s.referenceImages = this._images;
            s.referenceActiveIdx = this._activeIdx;
        });
    }

    _compressImage(base64Str, maxWidth = 1000, maxHeight = 1000, quality = 0.8) {
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

    onMount() {
        const upload = this.$('#ref-upload');
        if (upload) {
            upload.onchange = (e) => {
                const files = [...e.target.files];
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = async (re) => {
                        const raw = re.target.result;
                        const compressed = await this._compressImage(raw);
                        const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                        const fileName = `ref_${Date.now()}_${cleanName}`;
                        const finalUrl = await PersistenceService.uploadImage(fileName, compressed);
                        
                        this._images.push({ name: file.name.replace(/\.[^.]+$/, ''), data: finalUrl });
                        this._activeIdx = this._images.length - 1;
                        this._sync();
                        if (this.store.state.referenceBroadcast) {
                            this.broadcastActive();
                        } else {
                            this.render();
                        }
                        this.onMount(); // Re-bind file input
                    };
                    reader.readAsDataURL(file);
                });
            };
        }
    }
}
