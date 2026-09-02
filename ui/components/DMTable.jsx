import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';

import { CombatTrackerV22 } from './combat/CombatTrackerV22.jsx';
import { Bestiary } from '../pages/Bestiary.jsx';
import { SessionJournal } from './SessionJournal.jsx';

import { TacticalEyeModal } from './TacticalEyeModal.jsx';
import { HeroInspectorModal } from './HeroInspectorModal.jsx';
import { SoundboardModal } from './SoundboardModal.jsx';
import { exportCampaignBackup, importCampaignBackup } from '../utils/tomeBackup.js';
import { render } from 'preact';

export function DMTable() {
    const players = useStore('players') || [];
    const [aiProcessing, setAiProcessing] = useState(false);
    const [showDiceTray, setShowDiceTray] = useState(false);
    const [inspectedPlayerId, setInspectedPlayerId] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'tacticalEye' | 'soundboard' | 'oracle' | 'loot' | 'spellbook' | 'encounter'

    useEffect(() => {
        const handleAiStatus = (e) => setAiProcessing(e.detail?.active || false);
        window.addEventListener('tome:ai_processing', handleAiStatus);

        return () => {
            window.removeEventListener('tome:ai_processing', handleAiStatus);
        };
    }, []);

    const mountLegacyModal = (ComponentClass, props = {}) => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        try {
            render(html`<${ComponentClass} store=${TOME.store} ...${props} unmount=${() => host.remove()} />`, host);
        } catch (e) {
            const instance = new ComponentClass({ store: TOME.store, element: host, ...props });
            if (typeof instance.mount === 'function') instance.mount(host);
        }
    };

    const openTacticalEye = () => mountLegacyModal(TacticalEyeModal);
    const openEncounterGenerator = () => import('./EncounterGenerator.jsx').then(m => mountLegacyModal(m.EncounterGenerator));
    const openSoundboard = () => mountLegacyModal(SoundboardModal);
    
    const openLootGenerator = () => {
        import('./LootGenerator.jsx').then(m => mountLegacyModal(m.LootGenerator));
    };

    const openSpellBook = () => {
        import('./SpellBook.jsx').then(m => mountLegacyModal(m.SpellBook));
    };

    const openOracle = () => {
        import('./OracleModal.jsx').then(m => {
            if (m.OracleModal) mountLegacyModal(m.OracleModal);
        }).catch(err => console.warn('OracleModal module missing', err));
    };

    const inspectHero = (playerId) => setInspectedPlayerId(playerId);

    const requestRoll = (sides) => {
        if (window.TOME && window.TOME.events) {
            window.TOME.events.emit('DICE_ROLL_REQUESTED', sides);
        }
    };

    return html`
        <div class="animate-fadeIn grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-5 p-5 h-screen max-h-screen overflow-hidden bg-bgbase">
            <!-- HEADER (Controle Rápido) -->
            <header class="col-span-full card glass-accent flex justify-between items-center py-4 px-6 shadow-md flex-wrap gap-3">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-xl text-black shadow-[0_0_15px_var(--accent)]">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <div>
                        <h2 class="m-0 font-cinzel text-2xl text-accent font-extrabold tracking-wide">Mesa de Controle do Mestre</h2>
                        <span class="text-xs text-slate-400 uppercase tracking-widest font-bold">Gestão de Campanha & Combate Tático</span>
                    </div>
                    ${aiProcessing && html`
                        <div class="ml-3 px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    `}
                </div>
                <div class="flex gap-2.5 flex-wrap">
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-3.5" onClick=${openTacticalEye}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-3.5" onClick=${openSoundboard}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-3.5" onClick=${openOracle}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${openSpellBook}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${openLootGenerator}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-3.5" onClick=${openEncounterGenerator}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-3" onClick=${() => exportCampaignBackup(TOME.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-3" onClick=${() => importCampaignBackup(TOME.store, () => window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-3.5" onClick=${() => setShowDiceTray(!showDiceTray)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
                    <${CombatTrackerV22} />
                </div>
                
                <div class="card glass-accent flex-1 min-h-[30vh] p-4 overflow-hidden shadow-md">
                    <${SessionJournal} />
                </div>
            </div>

            <!-- COLUNA DIREITA (Heróis & Bestiário) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar min-w-0">
                <!-- ROSTER DOS HERÓIS -->
                <div class="card glass-accent flex-none flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-accent/20">
                    <div class="bg-gradient-to-r from-accent/10 to-transparent py-2.5 px-4 text-accent font-cinzel font-bold text-xs text-center border-b border-accent/20 tracking-[0.15em]">
                        <i class="fa-solid fa-users mr-1.5"></i> HERÓIS ATIVOS (CLIQUE PARA INSPECIONAR)
                    </div>
                    <div class="p-3 bg-black/20">
                        ${players.length === 0 
                            ? html`<div class="text-center p-3 text-slate-500 text-[0.8rem]">Nenhum herói ativo.</div>`
                            : html`
                                <div class="flex flex-wrap gap-2 justify-center">
                                    ${players.map(p => html`
                                        <div class="cursor-pointer flex items-center gap-2.5 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2.5 py-1.5 transition-all hover:bg-white/5 shadow-sm" 
                                             onClick=${() => inspectHero(p.id)} title="Inspecionar ${p.name}">
                                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden shrink-0">
                                                ${p.img ? html`<img src="${p.img}" class="w-full h-full object-cover" />` : p.name.substring(0,1)}
                                            </div>
                                            <div class="pr-2 min-w-0">
                                                <div class="text-xs font-bold text-white leading-tight truncate max-w-[100px]">${p.name}</div>
                                                <div class="text-[0.55rem] text-accent uppercase font-cinzel tracking-wider mt-0.5">Nv. ${p.level || 1}</div>
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            `
                        }
                    </div>
                </div>

                <!-- BESTIÁRIO RÁPIDO -->
                <div class="card glass-accent flex-1 flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-accent/20 min-h-[400px]">
                    <div class="bg-gradient-to-r from-accent/15 to-transparent py-3 px-4 text-accent font-cinzel font-bold text-center border-b border-accent/25 tracking-[0.15em]">
                        <i class="fa-solid fa-dragon mr-2"></i> ACESSO RÁPIDO: BESTIÁRIO
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 bg-black/40 custom-scrollbar relative">
                        <${Bestiary} />
                    </div>
                </div>
            </div>

            <!-- MODAL DE INSPEÇÃO DE HERÓI -->
            ${inspectedPlayerId && html`
                <div class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-obsidian-900 border border-accent/40 rounded-2xl p-6 shadow-2xl">
                        <button class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl" onClick=${() => setInspectedPlayerId(null)}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <${HeroInspectorModal} playerId=${inspectedPlayerId} onClose=${() => setInspectedPlayerId(null)} />
                    </div>
                </div>
            `}

            <!-- BANDEJA DE DADOS -->
            ${showDiceTray && html`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${() => requestRoll(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${() => requestRoll(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${() => requestRoll(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${() => requestRoll(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${() => requestRoll(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${() => requestRoll(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${() => setShowDiceTray(false)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `;
}

