import { Component } from '../core/Component.js';
import { html } from 'htm/preact';
import { CombatTrackerV14 } from './combat/CombatTrackerV14.js';
import { Bestiary } from '../pages/Bestiary.js';
import { SessionJournal } from './SessionJournal.js';
import { EncounterGenerator } from './EncounterGenerator.js';
import { LootGenerator } from './LootGenerator.js';
import { SpellBook } from './SpellBook.js';
import { TacticalEyeModal } from './TacticalEyeModal.js';
import { SoundboardModal } from './SoundboardModal.js';
import { OracleModal } from './OracleModal.js';
import { exportCampaignBackup, importCampaignBackup } from '../utils/tomeBackup.js';

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

    openSoundboard() {
        const soundboard = new SoundboardModal({ store: this.store });
        const host = document.createElement('div');
        document.body.appendChild(host);
        soundboard.mount(host);
        if (soundboard.element && soundboard.element.parentNode) {
            soundboard.element.parentNode.__component = soundboard;
        }
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

    template() {
        return html`
            <div class="dmtable-layout animate-fadeIn grid grid-cols-[2fr_1.2fr] grid-rows-[auto_1fr] gap-5 p-5 h-screen max-h-screen overflow-hidden bg-obsidian-900">
                
                <!-- HEADER (Controle Rápido) -->
                <header class="col-span-full flex justify-between items-center bg-black/50 py-4 px-6 rounded-xl border border-tomeGold-muted/30">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-tomeGold rounded-lg flex items-center justify-center text-2xl text-white shadow-[0_0_15px_var(--accent)]">
                            <i class="fa-solid fa-crown"></i>
                        </div>
                        <div>
                            <h2 class="m-0 font-cinzel text-2xl text-tomeGold">Mesa de Controle do Mestre</h2>
                            <span class="text-xs text-gray-400 uppercase tracking-widest">Gestão de Campanha & Combate Tático</span>
                        </div>
                        <div id="dmtable-ai-status" class="${this._aiProcessing ? 'animate-pulse' : 'hidden'} ml-3 px-3 py-1 bg-purple-500/15 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-primary bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold transition-all hover:scale-105" onClick=${() => this.openTacticalEye()}>
                            <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                        </button>
                        <button class="btn btn-ghost border border-cyan-300 text-cyan-300 bg-cyan-300/5 font-bold hover:bg-cyan-300/10 transition-all" onClick=${() => this.openSoundboard()}>
                            <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                        </button>
                        <button class="btn btn-ghost border border-purple-500 text-purple-300 bg-purple-500/10 font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:bg-purple-500/20 transition-all hover:scale-105" onClick=${() => this.openOracle()}>
                            <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                        </button>
                        <button class="btn btn-ghost border border-tomeGold text-tomeGold hover:bg-tomeGold/10 transition-all" onClick=${() => this.openSpellBook()}>
                            <i class="fa-solid fa-scroll"></i> Grimório
                        </button>
                        <button class="btn btn-ghost border border-tomeGold text-tomeGold hover:bg-tomeGold/10 transition-all" onClick=${() => this.openLootGenerator()}>
                            <i class="fa-solid fa-coins"></i> Gerar Tesouro
                        </button>
                        <button class="btn btn-secondary transition-all hover:scale-105" onClick=${() => this.openEncounterGenerator()}>
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                        </button>
                        <button class="btn btn-ghost border border-blue-500 text-blue-400 bg-blue-500/10 font-bold hover:bg-blue-500/20 transition-all" onClick=${() => exportCampaignBackup(this.store)} title="Exportar backup completo (.tome)">
                            <i class="fa-solid fa-file-export"></i> Backup (.tome)
                        </button>
                        <button class="btn btn-ghost border border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold hover:bg-emerald-500/20 transition-all" onClick=${() => importCampaignBackup(this.store, () => this.render())} title="Restaurar campanha (.tome / .json)">
                            <i class="fa-solid fa-file-import"></i> Restaurar
                        </button>
                        <button class="btn btn-primary transition-all hover:scale-105" onClick=${() => document.querySelector('#dmtable-dice-tray')?.classList.toggle('hidden')}>
                            <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                        </button>
                    </div>
                </header>

                <!-- COLUNA ESQUERDA (Tracker e Notas) -->
                <div class="flex flex-col gap-5 overflow-y-auto pr-2 scroll-smooth">
                    <div id="dmtable-tracker" class="bg-obsidian-800/80 rounded-xl border border-tomeGold-muted/20 min-h-[50vh] overflow-hidden relative">
                        <!-- O Combat Tracker será montado aqui -->
                        <div class="absolute inset-0 flex items-center justify-center text-gray-500">Carregando Tracker...</div>
                    </div>
                    
                    <div id="dmtable-journal" class="bg-obsidian-800/80 rounded-xl border border-tomeGold-muted/20 flex-1 min-h-[30vh] overflow-hidden">
                        <!-- Session Journal será montado aqui -->
                    </div>
                </div>

                <!-- COLUNA DIREITA (Bestiário Rápido) -->
                <div class="flex flex-col gap-5 overflow-y-auto pr-1">
                    <div class="bg-obsidian-800/90 rounded-xl border border-tomeGold-muted/25 flex-1 flex flex-col overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                        <div class="bg-gradient-to-r from-tomeGold/15 to-obsidian-800/95 py-3 px-4 text-tomeGold font-cinzel font-bold text-center border-b border-tomeGold-muted/25 tracking-wider">
                            <i class="fa-solid fa-dragon mr-2"></i> ACESSO RÁPIDO: BESTIÁRIO
                        </div>
                        <div id="dmtable-bestiary" class="flex-1 overflow-y-auto p-3 bg-obsidian-900/95">
                            <!-- Bestiary será montado aqui -->
                        </div>
                    </div>
                </div>

                <!-- BANDEJA DE DADOS FLUTUANTE (Oculta por padrão) -->
                <div id="dmtable-dice-tray" class="hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-obsidian-800/95 border-2 border-tomeGold rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[1000] flex gap-4 items-center backdrop-blur-md">
                    <button class="btn btn-ghost hover:scale-110 transition-transform" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 4)} aria-label="Rolar d4"><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost hover:scale-110 transition-transform" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 6)} aria-label="Rolar d6"><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost hover:scale-110 transition-transform" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 8)} aria-label="Rolar d8"><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost hover:scale-110 transition-transform" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 10)} aria-label="Rolar d10"><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost hover:scale-110 transition-transform" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 12)} aria-label="Rolar d12"><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary text-xl px-5 py-2 hover:scale-110 transition-transform" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 20)} aria-label="Rolar d20"><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-danger ml-4 hover:scale-110 transition-transform" onClick=${() => document.querySelector('#dmtable-dice-tray')?.classList.add('hidden')} aria-label="Fechar Bandeja"><i class="fa-solid fa-times"></i></button>
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
            this._tracker = new CombatTrackerV14({ store: this.store, root: trackerContainer });
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
