import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { html } from 'htm/preact';

export class SoundboardModal extends Component {
    constructor(opts) {
        super(opts);
        this.categories = [
            {
                name: 'Combate & Ação',
                sounds: [
                    { id: 'sword_clash', name: 'Golpe de Espada', url: 'https://freesound.org/data/previews/415/415209_5121236-lq.mp3', color: '#ef4444' },
                    { id: 'bow_shoot', name: 'Flecha', url: 'https://freesound.org/data/previews/344/344276_5121236-lq.mp3', color: '#f59e0b' },
                    { id: 'fireball', name: 'Bola de Fogo', url: 'https://freesound.org/data/previews/442/442953_4523992-lq.mp3', color: '#f97316' },
                    { id: 'magic_blast', name: 'Explosão Arcana', url: 'https://freesound.org/data/previews/404/404764_118613-lq.mp3', color: '#8b5cf6' },
                    { id: 'shield_block', name: 'Defesa de Escudo', url: 'https://freesound.org/data/previews/399/399303_7614679-lq.mp3', color: '#3b82f6' }
                ]
            },
            {
                name: 'Ambiente & Tensão',
                sounds: [
                    { id: 'thunder', name: 'Trovão', url: 'https://freesound.org/data/previews/102/102723_1739504-lq.mp3', color: '#64748b' },
                    { id: 'wolf_howl', name: 'Uivo Distante', url: 'https://freesound.org/data/previews/148/148705_1385413-lq.mp3', color: '#a3e635' },
                    { id: 'door_creak', name: 'Porta Rangendo', url: 'https://freesound.org/data/previews/119/119864_1896899-lq.mp3', color: '#84cc16' },
                    { id: 'heartbeat', name: 'Batimentos', url: 'https://freesound.org/data/previews/332/332056_5316315-lq.mp3', color: '#dc2626' }
                ]
            }
        ];
    }

    playSound(url) {
        if (TOME.audio) {
            TOME.audio.playSFX(url);
            
            // Avisa rede
            if (TOME.socket) {
                TOME.socket.emit('fx_animation', { event: 'SOUNDBOARD', details: { url } });
            }
        }
    }

    closeModal() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.unmount();
    }

    setMasterVolume(val) {
        if (TOME.audio) {
            TOME.audio.setMasterVolume(parseFloat(val));
        }
    }

    template() {
        return html`
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fadeIn">
                
                <div class="bg-gradient-to-br from-bgbase to-black border border-accent/40 rounded-xl w-[90%] max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all animate-slideUp">
                    
                    <div class="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                        <h2 class="font-cinzel text-accent text-xl font-bold m-0 flex items-center gap-3">
                            <i class="fa-solid fa-music"></i> SOUNDBOARD TÁTICO
                        </h2>
                        <button class="btn btn-ghost text-gray-400 p-2" onClick=${() => this.closeModal()}>
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>

                    <div class="p-6 max-h-[70vh] overflow-y-auto">
                        ${this.categories.map(cat => html`
                            <div class="mb-8 last:mb-0">
                                <h3 class="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                                    ${cat.name}
                                </h3>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    ${cat.sounds.map(s => html`
                                        <button class="btn flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer hover:scale-105"
                                                style="border-color: ${s.color}40;"
                                                onMouseOver=${e => { e.currentTarget.style.background = s.color + '20'; e.currentTarget.style.borderColor = s.color; }}
                                                onMouseOut=${e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = s.color + '40'; }}
                                                onClick=${() => this.playSound(s.url)}>
                                            <i class="fa-solid fa-volume-high text-xl" style="color: ${s.color};"></i>
                                            <span class="text-xs font-bold text-white text-center">${s.name}</span>
                                        </button>
                                    `)}
                                </div>
                            </div>
                        `)}
                    </div>

                    <!-- Volume Master -->
                    <div class="px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider"><i class="fa-solid fa-sliders"></i> Volume Master</span>
                        <input type="range" min="0" max="1" step="0.05" value="1" 
                               onInput=${e => this.setMasterVolume(e.target.value)}
                               class="w-40 accent-accent cursor-pointer" />
                    </div>

                </div>
            </div>
        `;
    }
}
