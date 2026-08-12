import { Component } from '../core/Component.js';
import { html } from 'htm/preact';

export class SoundboardModal extends Component {
    template() {
        return html`
            <div class="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center animate-fadeIn">
                <div class="bg-obsidian-800/90 border border-tomeGold-muted/30 p-8 text-center min-w-[300px] rounded-xl shadow-2xl backdrop-blur-md">
                    <h3 class="text-tomeGold font-cinzel text-xl mb-4">Soundboard & SFX</h3>
                    <p class="text-gray-400 mb-6 text-sm">Módulo em desenvolvimento (V19.1).</p>
                    <button class="btn btn-primary" onClick=${() => this.element.remove()}>Fechar</button>
                </div>
            </div>
        `;
    }
}
