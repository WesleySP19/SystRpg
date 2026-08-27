import { useState, useEffect, useRef } from "preact/hooks";
import { useStore } from "../ui/core/hooks.js";
import { html } from "htm/preact";
import { TOME } from '../core/Registry.js';
import { Toast } from '../ui/components/Toast.js';
import { PersistenceService } from '../services/PersistenceService.js';
export function ReferencePanel() {
const storeState = useStore();
const [images, setImages] = useState(storeState.referenceImages || []);
const [activeIdx, setActiveIdx] = useState(storeState.referenceActiveIdx ?? 0);
const [lightboxOpen, setLightboxOpen] = useState(false);
const [channel, setChannel] = useState(null);
const fileInputRef = useRef(null);
const store = window.TOME?.store || { state: storeState };
useEffect(() => {
try {
setChannel(new BroadcastChannel('tome_reference'));
} catch (e) {  }
}, []);
const _sync = (newImages, newIdx) => {
TOME.store.update(s => {
s.referenceImages = newImages;
s.referenceActiveIdx = newIdx;
});
setImages(newImages);
setActiveIdx(newIdx);
};
const openSpectatorTV = () => {
window.open('/transmissao.html', '_blank', 'noopener,noreferrer,width=1280,height=720');
Toast.show('📺 Telão do Espectador acionado para TV / Segunda Tela!', 'info');
};
const uploadImage = () => {
if (fileInputRef.current) fileInputRef.current.click();
};
const selectImage = (idx) => {
setActiveIdx(idx);
TOME.store.update(s => { s.referenceActiveIdx = idx; });
if (store.state.referenceBroadcast) {
broadcastActive(images[idx]);
}
};
const toggleLightbox = () => {
setLightboxOpen(!lightboxOpen);
};
const broadcastActive = (img = images[activeIdx]) => {
if (!img) return;
TOME.store.update(s => {
s.referenceBroadcast = true;
s.referenceCurrentImg = img.data;
s.referenceCurrentName = img.name;
});
if (channel) {
channel.postMessage({
type: 'REFERENCE_IMAGE',
data: img.data,
name: img.name
});
}
try {
if (typeof window !== 'undefined' && window.socket && typeof window.socket.emit === 'function') {
window.socket.emit('state_update', { mapImage: img.data });
}
} catch(e) { console.warn("Falha de envio socket ao telão TV"); }
Toast.show(`📡 "${img.name}" enviado para Telão e Celulares dos Jogadores!`, 'success');
};
const deleteActive = () => {
const newImages = [...images];
newImages.splice(activeIdx, 1);
const newIdx = Math.max(0, activeIdx - 1);
_sync(newImages, newIdx);
if (store.state.referenceBroadcast) {
if (newImages.length > 0) {
broadcastActive(newImages[newIdx]);
} else {
clearBroadcast();
}
}
};
const deleteImage = (e, idx) => {
e.stopPropagation();
const newImages = [...images];
newImages.splice(idx, 1);
const newIdx = activeIdx >= newImages.length ? Math.max(0, newImages.length - 1) : activeIdx;
_sync(newImages, newIdx);
if (store.state.referenceBroadcast) {
if (newImages.length > 0) {
broadcastActive(newImages[newIdx]);
} else {
clearBroadcast();
}
}
};
const clearAll = () => {
if (!images.length) return;
if (!confirm('Remover todas as imagens de referência?')) return;
_sync([], 0);
clearBroadcast();
};
const clearBroadcast = () => {
TOME.store.update(s => {
s.referenceBroadcast = false;
s.referenceCurrentImg = null;
});
if (channel) {
channel.postMessage({
type: 'REFERENCE_IMAGE',
data: null,
name: ''
});
}
};
const _compressImage = (base64Str, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
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
};
const handleFileChange = (e) => {
const files = [...e.target.files];
if (fileInputRef.current) fileInputRef.current.value = ""; // reset
files.forEach(file => {
const reader = new FileReader();
reader.onload = async (re) => {
const raw = re.target.result;
const compressed = await _compressImage(raw);
const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
const fileName = `ref_${Date.now()}_${cleanName}`;
const finalUrl = await PersistenceService.uploadImage(fileName, compressed);
const newImages = [...images, { name: file.name.replace(/\.[^.]+$/, ''), data: finalUrl }];
_sync(newImages, newImages.length - 1);
if (store.state.referenceBroadcast) {
broadcastActive(newImages[newImages.length - 1]);
}
};
reader.readAsDataURL(file);
});
};
const active = images[activeIdx];
return html`
<div class="ref-panel">
<div class="ref-panel-header">
<span class="ref-panel-title">
<i class="fa-solid fa-image"></i> Referência Visual
</span>
<div style="display:flex;gap:4px;">
<button class="btn btn-ghost btn-sm" onClick=${openSpectatorTV} title="Abrir Telão Espectador (TV/Projetor)">
<i class="fa-solid fa-desktop"></i>
</button>
<button class="btn btn-ghost btn-sm" onClick=${uploadImage} title="Carregar Imagem">
<i class="fa-solid fa-upload"></i>
</button>
<button class="btn btn-ghost btn-sm" onClick=${clearAll} title="Limpar Tudo">
<i class="fa-solid fa-trash"></i>
</button>
</div>
</div>
<input ref=${fileInputRef} type="file" id="ref-upload" accept="image/*" style="display:none;" multiple onChange=${handleFileChange} />
<div class="ref-display ${lightboxOpen ? 'ref-lightbox' : ''}">
${active ? html`
<img src="${active.data}" alt="${active.name}"
class="ref-img" onClick=${toggleLightbox}
title="Clique para ampliar" />
<div class="ref-img-label">${active.name}</div>
<div class="ref-img-controls">
<button class="ref-ctrl-btn" onClick=${() => broadcastActive()} title="Enviar para Jogadores e Telão">
<i class="fa-solid fa-broadcast-tower"></i>
</button>
<button class="ref-ctrl-btn danger" onClick=${deleteActive} title="Remover">
<i class="fa-solid fa-trash"></i>
</button>
</div>
` : html`
<div class="ref-empty">
<i class="fa-solid fa-image"></i>
<span>Sem imagem</span>
<button class="btn btn-ghost btn-sm" onClick=${uploadImage}>
Carregar
</button>
</div>
`}
</div>
${images.length > 1 ? html`
<div class="ref-thumb-strip">
${images.map((img, i) => html`
<div class="ref-thumb ${i === activeIdx ? 'active' : ''}"
onClick=${() => selectImage(i)}
title="${img.name}">
<img src="${img.data}" alt="${img.name}" />
<div class="ref-thumb-del" onClick=${(e) => deleteImage(e, i)}>✕</div>
</div>
`)}
</div>
` : ''}
${store.state.referenceBroadcast ? html`
<div style="font-size:0.6rem;color:var(--success);text-align:center;padding:4px;display:flex;align-items:center;gap:4px;justify-content:center;">
<span style="width:6px;height:6px;background:var(--success);border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
Transmitindo para Jogadores e Telão TV
</div>
` : ''}
</div>
`;
}