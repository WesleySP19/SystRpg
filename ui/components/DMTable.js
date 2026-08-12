import { Component } from '../core/Component.js';
import { html } from 'htm/preact';
import { CombatTrackerV19 } from './combat/CombatTrackerV19.js';
import { Bestiary } from '../pages/Bestiary.js';
import { SessionJournal } from './SessionJournal.js';
import { EncounterGenerator } from './EncounterGenerator.js';
import { LootGenerator } from './LootGenerator.js';
import { EncounterGeneratorModal } from './EncounterGeneratorModal.js';
import { SpellBookModal } from './SpellBookModal.js';
import { LootGeneratorModal } from './LootGeneratorModal.js';
import { HeroInspectorModal } from './HeroInspectorModal.js';
import { exportCampaignBackup, importCampaignBackup } from '../../utils/ExportUtils.js';

/**
 * DMTable - A "Mesa do Mestre Inteligente"
 * Um dashboard modular e dinâmico que centraliza Iniciativa, Bestiário e anotações
 * em uma única interface poderosa, substituindo a antiga tela dividida com mapa.
 */
export class DMTable extends Component {
    constructor(opts) {
        super(opts);
        this._tracker = null;
        this._bestiary = null;
        this._journal = null;
        this._aiProcessing = false;
        
        // v15.9 Async AI Processing Listener
        this._onAiStatus = (e) => {
            this._aiProcessing = e.detail?.active || false;
            this.render();
        };
    }

    onStoreUpdate() {
        // DMTable é um layout estático. Ignoramos os updates do store
        // para evitar que o Preact Virtual DOM apague os subcomponentes montados manualmente.
        // Os subcomponentes (CombatTracker, etc) reagem às mudanças por conta própria.
    }

    openTacticalEye() {
        const eye = new TacticalEyeModal({ store: this.store });
        const host = document.createElement('div');
        document.body.appendChild(host);
        eye.mount(host);
        if (eye.element && eye.element.parentNode) {
            eye.element.parentNode.__component = eye;
        }
    }

    openEncounterGenerator() {
        const gen = new EncounterGenerator({ store: this.store });
        const host = document.createElement('div');
        document.body.appendChild(host);
        gen.mount(host);
        gen.element.parentNode.__component = gen;
        gen._generateEncounter();
    }

    openLootGenerator() {
        const loot = new LootGenerator({ store: this.store });
        const host = document.createElement('div');
        document.body.appendChild(host);
        loot.mount(host);
        loot.element.parentNode.__component = loot;
    }

    openSpellBook() {
        const spellbook = new SpellBook({ store: this.store });
        const host = document.createElement('div');
        document.body.appendChild(host);
        spellbook.mount(host);
        spellbook.element.parentNode.__component = spellbook;
    }


    openOracle() {
        const oracle = new OracleModal({ store: this.store });
        const host = document.createElement('div');
        document.body.appendChild(host);
        oracle.mount(host);
        if (oracle.element && oracle.element.parentNode) {
            oracle.element.parentNode.__component = oracle;
        }
    }

    inspectHero(playerId) {
        const inspector = new HeroInspectorModal({ store: this.store, playerId });
        const host = document.createElement('div');
        document.body.appendChild(host);
        inspector.mount(host);
        inspector.element.parentNode.__component = inspector;
    }

    _renderParty() {
        const players = this.store.state.players || [];
        if (players.length === 0) return html`<div style="text-align:center; padding:10px; color:var(--text-dim); opacity:0.5; font-size:0.8rem;">Nenhum herói ativo.</div>`;
        
        return html`
            <div class="flex flex-wrap gap-2 justify-center">
                ${players.map(p => {
                    const avatar = p.img ? html`<img src="${p.img}" class="w-full h-full object-cover" />` : p.name.substring(0,1);
                    return html`
                        <div class="cursor-pointer flex items-center gap-2 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2 py-1 transition-all hover:bg-white/5 shadow-sm" 
                             onClick=${() => this.inspectHero(p.id)} title="Inspecionar ${p.name}">
                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden">
                                ${avatar}
                            </div>
                            <div class="pr-2">
                                <div class="text-xs font-bold text-white leading-tight">${p.name}</div>
                                <div class="text-[0.55rem] text-accent uppercase font-cinzel tracking-wider">Nv. ${p.level || 1}</div>
                            </div>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    template() {
        return html`
            <div class="dmtable-layout animate-fadeIn grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-5 p-5 h-screen max-h-screen overflow-hidden bg-bgbase">
                
                <!-- HEADER (Controle Rápido) -->
                <header class="col-span-full card glass-accent flex justify-between items-center py-4 px-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-xl text-black shadow-[0_0_15px_var(--accent)]">
                            <i class="fa-solid fa-crown"></i>
                        </div>
                        <div>
                            <h2 class="m-0 font-serif text-2xl text-accent">Mesa de Controle do Mestre</h2>
                            <span class="text-xs text-gray-400 uppercase tracking-widest">Gestão de Campanha & Combate Tático</span>
                        </div>
                        <div id="dmtable-ai-status" class="${this._aiProcessing ? 'animate-pulse' : 'hidden'} ml-3 px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" onClick=${() => this.openTacticalEye()}>
                            <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                        </button>
                        <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10" onClick=${() => this.openSoundboard()}>
                            <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                        </button>
                        <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)]" onClick=${() => this.openOracle()}>
                            <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                        </button>
                        <button class="btn btn-ghost border-accent text-accent" onClick=${() => this.openSpellBook()}>
                            <i class="fa-solid fa-scroll"></i> Grimório
                        </button>
                        <button class="btn btn-ghost border-accent text-accent" onClick=${() => this.openLootGenerator()}>
                            <i class="fa-solid fa-coins"></i> Gerar Tesouro
                        </button>
                        <button class="btn btn-magic" onClick=${() => this.openEncounterGenerator()}>
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                        </button>
                        <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20" onClick=${() => exportCampaignBackup(this.store)} title="Exportar backup completo (.tome)">
                            <i class="fa-solid fa-file-export"></i> Backup (.tome)
                        </button>
                        <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20" onClick=${() => importCampaignBackup(this.store, () => this.render())} title="Restaurar campanha (.tome / .json)">
                            <i class="fa-solid fa-file-import"></i> Restaurar
                        </button>
                        <button class="btn btn-primary" onClick=${() => document.querySelector('#dmtable-dice-tray')?.classList.toggle('hidden')}>
                            <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                        </button>
                    </div>
                </header>

                <!-- COLUNA ESQUERDA (Tracker e Notas) -->
                <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scroll min-w-0">
                    <div id="dmtable-tracker" class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden">
                        <!-- O Combat Tracker será montado aqui -->
                        <div class="absolute inset-0 flex items-center justify-center text-gray-500">Carregando Tracker...</div>
                    </div>
                    
                    <div id="dmtable-journal" class="card glass-accent flex-1 min-h-[30vh] p-0 overflow-hidden">
                        <!-- Session Journal será montado aqui -->
                    </div>
                </div>

                <!-- COLUNA DIREITA (Heróis & Bestiário) -->
                <div class="flex flex-col gap-5 overflow-y-auto pr-1 custom-scroll min-w-0">
                    <!-- ROSTER DOS HERÓIS -->
                    <div class="card glass-accent flex-none flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        <div class="bg-gradient-to-r from-accent/10 to-transparent py-2 px-4 text-accent font-serif font-bold text-xs text-center border-b border-accent/20 tracking-wider">
                            <i class="fa-solid fa-users mr-1"></i> HERÓIS ATIVOS (CLIQUE PARA INSPECIONAR)
                        </div>
                        <div class="p-3">
                            ${this._renderParty()}
                        </div>
                    </div>

                    <!-- BESTIÁRIO RÁPIDO -->
                    <div class="card glass-accent flex-1 flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        <div class="bg-gradient-to-r from-accent/15 to-transparent py-3 px-4 text-accent font-serif font-bold text-center border-b border-accent/25 tracking-wider">
                            <i class="fa-solid fa-dragon mr-2"></i> ACESSO RÁPIDO: BESTIÁRIO
                        </div>
                        <div id="dmtable-bestiary" class="flex-1 overflow-y-auto p-3 bg-black/40 custom-scroll">
                            <!-- Bestiary será montado aqui -->
                        </div>
                    </div>
                </div>

                <!-- BANDEJA DE DADOS FLUTUANTE (Oculta por padrão) -->
                <div id="dmtable-dice-tray" class="hidden dice-roller-tray" style="bottom: 30px; left: 50%; transform: translateX(-50%); right: auto; flex-direction: row; opacity: 1; pointer-events: auto;">
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-5 py-2 text-lg" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-danger ml-4" onClick=${() => document.querySelector('#dmtable-dice-tray')?.classList.add('hidden')}><i class="fa-solid fa-times"></i></button>
                </div>
            </div>
        `;
    }

    onMount() {
        // v15.9 Async listeners
        if (typeof window !== 'undefined') window.addEventListener('tome:ai_processing', this._onAiStatus);

        // Mount Combat Tracker
        const trackerContainer = this.$('#dmtable-tracker');
        if (trackerContainer) {
            trackerContainer.innerHTML = '';
            this._tracker = new CombatTrackerV19({ store: this.store, root: trackerContainer });
            this._tracker.mount();
        }

        // Mount Bestiary
        const bestiaryContainer = this.$('#dmtable-bestiary');
        if (bestiaryContainer) {
            bestiaryContainer.innerHTML = '';
            this._bestiary = new Bestiary({ store: this.store, element: bestiaryContainer });
            this._bestiary.mount();
        }

        // Mount Session Journal
        const journalContainer = this.$('#dmtable-journal');
        if (journalContainer) {
            journalContainer.innerHTML = '';
            this._journal = new SessionJournal({ store: this.store, element: journalContainer });
            this._journal.mount();
        }
    }

    unmount() {
        if (typeof window !== 'undefined') window.removeEventListener('tome:ai_processing', this._onAiStatus);
        
        if (this._tracker) this._tracker.unmount();
        if (this._bestiary) this._bestiary.unmount();
        if (this._journal) this._journal.unmount();
        super.unmount();
    }
}
