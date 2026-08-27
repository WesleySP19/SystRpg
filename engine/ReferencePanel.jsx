/**
 * REFERENCE PANEL v1.0 — D&D 5e Tactical Map
 * Sidebar panel for GM to upload and display scene reference images.
 * Players see the current image in their view.
 * Uses BroadcastChannel to sync with player-view.html.
 */
import { useState, useEffect, useRef } from "preact/hooks";
import { useStore } from "../ui/core/hooks.js";
import { html } from "htm/preact";
import { TOME } from '../core/Registry.js';
import { Toast } from '../ui/components/Toast.js';
import { PersistenceService } from '../services/PersistenceService.js';

export function ReferencePanel(opts) {
    const storeState = useStore();
    const [images, setImages] = useState(storeState.referenceImages || []);
    const [activeIdx, setActiveIdx] = useState(storeState.referenceActiveIdx ?? 0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [channel, setChannel] = useState(null);
    const containerRef = useRef(null);

    const legacyCtx = {
        store: window.TOME?.store || { state: storeState },
        _images: images,
        _activeIdx: activeIdx,
        _lightboxOpen: lightboxOpen,
        _channel: channel,
        render: () => {},
        $: (sel) => containerRef.current ? containerRef.current.querySelector(sel) : null,
        $$: (sel) => containerRef.current ? containerRef.current.querySelectorAll(sel) : []
    };

    const self = new Proxy(legacyCtx, {
        get: (target, prop) => {
            if (prop in target) return target[prop];
            return eval(prop);
        },
        set: (target, prop, value) => {
            if (prop === "_images") setImages(value);
            else if (prop === "_activeIdx") setActiveIdx(value);
            else if (prop === "_lightboxOpen") setLightboxOpen(value);
            else if (prop === "_channel") setChannel(value);
            target[prop] = value;
            return true;
        }
    });

    function template() {

    const handleGlobalClick = (e) => {
        const btn = e.target.closest("[data-action]");
        if (btn) {
            const action = btn.dataset.action;
            if (action === "openSpectatorTV") self.openSpectatorTV(e, btn);
            if (action === "uploadImage") self.uploadImage(e, btn);
            if (action === "clearAll") self.clearAll(e, btn);
            if (action === "toggleLightbox") self.toggleLightbox(e, btn);
            if (action === "broadcastActive") self.broadcastActive(e, btn);
            if (action === "deleteActive") self.deleteActive(e, btn);
            if (action === "selectImage") self.selectImage(e, btn);
            if (action === "deleteImage") self.deleteImage(e, btn);
        }
    };
    
    useEffect(() => {
        try {
            self._channel = new BroadcastChannel('tome_reference');
        } catch (e) { /* Safari private */ }
        
        if (self.onMount) self.onMount();
        return () => { if (self.onUnmount) self.onUnmount(); };
    }, []);

    return (function() {
        const active = _images[_activeIdx];
        return `
            <div class="ref-panel">
                <!-- Header -->
                <div class="ref-panel-header">
                    <span class="ref-panel-title">
                        <i class="fa-solid fa-image"></i> Referência Visual
                    </span>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-ghost btn-sm" data-action="openSpectatorTV" title="Abrir Telão Espectador (TV/Projetor)">
                            <i class="fa-solid fa-desktop"></i>
                        </button>
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
                <div class="ref-display ${_lightboxOpen ? 'ref-lightbox' : ''}">
                    ${active ? `
                        <img src="${active.data}" alt="${active.name}"
                             class="ref-img" data-action="toggleLightbox"
                             title="Clique para ampliar" />
                        <div class="ref-img-label">${active.name}</div>
                        <div class="ref-img-controls">
                            <button class="ref-ctrl-btn" data-action="broadcastActive" title="Enviar para Jogadores e Telão">
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
                ${_images.length > 1 ? `
                    <div class="ref-thumb-strip">
                        ${_images.map((img, i) => `
                            <div class="ref-thumb ${i === _activeIdx ? 'active' : ''}"
                                 data-action="selectImage" data-idx="${i}"
                                 title="${img.name}">
                                <img src="${img.data}" alt="${img.name}" />
                                <div class="ref-thumb-del" data-action="deleteImage" data-idx="${i}">✕</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Broadcast status -->
                ${store.state.referenceBroadcast ? `
                    <div style="font-size:0.6rem;color:var(--success);text-align:center;padding:4px;display:flex;align-items:center;gap:4px;justify-content:center;">
                        <span style="width:6px;height:6px;background:var(--success);border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
                        Transmitindo para Jogadores e Telão TV
                    </div>
                ` : ''}
            </div>
        `;
    }

    /* ── Actions ────────────────────────────────────────────────── */

    function openSpectatorTV() {
        window.open('/transmissao.html', '_blank', 'noopener,noreferrer,width=1280,height=720');
        Toast.show('📺 Telão do Espectador acionado para TV / Segunda Tela!', 'info');
    }

    function uploadImage() {
        $('#ref-upload').click();
    }

    function selectImage(e, el) {
        const idx = parseInt(el.dataset.idx);
        if (!isNaN(idx)) {
            _activeIdx = idx;
            _sync();
            if (store.state.referenceBroadcast) {
                broadcastActive();
            } else {
                render();
            }
        }
    }

    function toggleLightbox() {
        _lightboxOpen = !_lightboxOpen;
        render();
    }

    function broadcastActive() {
        const img = _images[_activeIdx];
        if (!img) return;

        // Sync via store (for localStorage broadcast)
        TOME.store.update(s => {
            s.referenceBroadcast = true;
            s.referenceCurrentImg = img.data;
            s.referenceCurrentName = img.name;
        });

        // BroadcastChannel for instant sync
        if (_channel) {
            _channel.postMessage({
                type: 'REFERENCE_IMAGE',
                data: img.data,
                name: img.name
            });
        }

        // Sincroniza diretamente com o Telão de TV da sala / modo espectador LAN!
        try {
            if (typeof window !== 'undefined' && window.socket && typeof window.socket.emit === 'function') {
                window.socket.emit('state_update', { mapImage: img.data });
            } else if (typeof io !== 'undefined') {
                const tempSocket = io();
                const tableId = localStorage.getItem('tome_last_table') || 'default-table';
                tempSocket.emit('joinRoom', { mesaId: tableId });
                tempSocket.emit('state_update', { mapImage: img.data });
            }
        } catch(e) { console.warn("Falha de envio socket ao telão TV"); }

        Toast.show(`📡 "${img.name}" enviado para Telão e Celulares dos Jogadores!`, 'success');
        render();
    }

    function deleteActive() {
        _images.splice(_activeIdx, 1);
        _activeIdx = Math.max(0, _activeIdx - 1);
        _sync();
        if (store.state.referenceBroadcast) {
            if (_images.length > 0) {
                broadcastActive();
            } else {
                TOME.store.update(s => {
                    s.referenceBroadcast = false;
                    s.referenceCurrentImg = null;
                });
                if (_channel) {
                    _channel.postMessage({
                        type: 'REFERENCE_IMAGE',
                        data: null,
                        name: ''
                    });
                }
                render();
            }
        } else {
            render();
        }
    }

    function deleteImage(e, el) {
        e.stopPropagation();
        const idx = parseInt(el.dataset.idx);
        if (!isNaN(idx)) {
            _images.splice(idx, 1);
            if (_activeIdx >= _images.length) _activeIdx = Math.max(0, _images.length - 1);
            _sync();
            if (store.state.referenceBroadcast) {
                if (_images.length > 0) {
                    broadcastActive();
                } else {
                    TOME.store.update(s => {
                        s.referenceBroadcast = false;
                        s.referenceCurrentImg = null;
                    });
                    if (_channel) {
                        _channel.postMessage({
                            type: 'REFERENCE_IMAGE',
                            data: null,
                            name: ''
                        });
                    }
                    render();
                }
            } else {
                render();
            }
        }
    }

    function clearAll() {
        if (!_images.length) return;
        if (!confirm('Remover todas as imagens de referência?')) return;
        _images = [];
        _activeIdx = 0;
        TOME.store.update(s => {
            s.referenceBroadcast = false;
            s.referenceCurrentImg = null;
        });
        if (_channel) {
            _channel.postMessage({
                type: 'REFERENCE_IMAGE',
                data: null,
                name: ''
            });
        }
        _sync();
        render();
    }

    function _sync() {
        TOME.store.update(s => {
            s.referenceImages = _images;
            s.referenceActiveIdx = _activeIdx;
        });
    }

    function _compressImage(base64Str, maxWidth = 1000, maxHeight = 1000, quality = 0.8) {
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

    function onMount() {
        const upload = $('#ref-upload');
        if (upload) {
            upload.onchange = (e) => {
                const files = [...e.target.files];
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = async (re) => {
                        const raw = re.target.result;
                        const compressed = await _compressImage(raw);
                        const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                        const fileName = `ref_${Date.now()}_${cleanName}`;
                        const finalUrl = await PersistenceService.uploadImage(fileName, compressed);
                        
                        _images.push({ name: file.name.replace(/\.[^.]+$/, ''), data: finalUrl });
                        _activeIdx = _images.length - 1;
                        _sync();
                        if (store.state.referenceBroadcast) {
                            broadcastActive();
                        } else {
                            render();
                        }
                        onMount(); // Re-bind file input
                    };
                    reader.readAsDataURL(file);
                });
            };
        }
    return html`<div ref=${containerRef} onClick=${handleGlobalClick} dangerouslySetInnerHTML=${{__html: self.template()}}></div>`;
}
