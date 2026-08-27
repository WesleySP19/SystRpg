import { useState, useRef, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/core/Toast.jsx';

/**
 * DM SHIELD v1.0
 * AI-assisted tools for scene description and worldbuilding.
 */
export function DMShield(opts) {
    const storeState = useStore();
    const [lastDescription, setLastDescription] = useState("");
    const [tone, setTone] = useState('mysterious');
    const containerRef = useRef(null);

    const handleGlobalClick = (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) {
            const action = btn.dataset.action;
            if (action === 'generateScene') generateScene();
            if (action === 'copyToJournal') copyToJournal();
        }
    };

    const generateScene = async () => {
        const inputEl = containerRef.current?.querySelector('#scene-input');
        const toneEl = containerRef.current?.querySelector('#tone-select');
        const input = inputEl ? inputEl.value : '';
        const toneVal = toneEl ? toneEl.value : 'mysterious';
        
        if (!input) return Toast.show('Descreva brevemente o local.', 'warning');

        Toast.show('Tecendo a narrativa...');
        
        try {
            const prompt = `Descreva em um parágrafo imersivo para um mestre de RPG ler para os jogadores: ${input}. O tom deve ser ${toneVal}.`;
            const description = await TOME.ai.narrate(prompt); 
            setLastDescription(description);
        } catch (err) {
            Toast.show('O oráculo está em silêncio...', 'danger');
        }
    };

    const copyToJournal = () => {
        if (!lastDescription) return;
        TOME.store.update(s => {
            s.journalEntries = [...(s.journalEntries || []), {
                id: Date.now(),
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('pt-BR'),
                type: 'info',
                title: 'Descrição de Cena',
                content: lastDescription
            }];
        });
        Toast.show('Cena salva na linha do tempo!');
    };

    return html`
        <div class="page" ref=${containerRef} onClick=${handleGlobalClick} style="max-width:900px; margin:0 auto;">
            <div class="section-header">
                <div>
                    <h2 class="section-title">🏛️ Construtor de Mundos</h2>
                    <p class="section-subtitle">Use a IA para descrever cenas e locais instantaneamente.</p>
                </div>
            </div>

            <div class="grid grid-2" style="gap:20px;">
                <!-- Controls -->
                <div class="card glass-accent" style="padding:20px;">
                    <h3 style="font-size:1rem; margin-bottom:15px;">Gerar Descrição de Cena</h3>
                    <div class="form-group">
                        <label class="form-label">O que os heróis veem?</label>
                        <input type="text" id="scene-input" class="form-input" placeholder="Ex: Uma cripta antiga, uma taverna cheia..." />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tom da Narração</label>
                        <select id="tone-select" class="form-select">
                            <option value="mysterious">Misterioso & Sombrio</option>
                            <option value="epic">Épico & Majestoso</option>
                            <option value="horror">Horror & Agonizante</option>
                            <option value="peaceful">Calmo & Sereno</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-block" data-action="generateScene" style="margin-top:10px;">
                        <i class="fa-solid fa-wand-sparkles"></i> DESCREVER CENA
                    </button>
                </div>

                <!-- Result -->
                <div class="card" style="padding:20px; display:flex; flex-direction:column; min-height:300px;">
                    <h3 style="font-size:0.8rem; color:var(--accent); text-transform:uppercase; margin-bottom:10px;">Box Text (Narração)</h3>
                    <div id="description-result" style="flex:1; font-family: 'Crimson Text', serif; font-size:1.1rem; line-height:1.6; font-style:italic; color:var(--text-dim); overflow-y:auto; padding:15px; background:rgba(0,0,0,0.2); border-radius:8px;">
                        ${lastDescription || 'Aguardando inspiração...'}
                    </div>
                    <button class="btn btn-ghost btn-sm" style="margin-top:10px;" data-action="copyToJournal" ${!lastDescription ? 'disabled' : ''}>
                        <i class="fa-solid fa-book"></i> Copiar para o Diário
                    </button>
                </div>
            </div>
        </div>
    `;
}
