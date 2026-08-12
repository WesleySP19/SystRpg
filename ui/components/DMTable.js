import { Component } from '../core/Component.js';
import { html } from 'htm/preact';
import { CombatTrackerV19 } from './combat/CombatTrackerV19.js';
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
            <div class="dmtable-layout animate-fadeIn" style="display: grid; grid-template-columns: 2fr 1.2fr; grid-template-rows: auto 1fr; gap: 20px; padding: 20px; height: 100vh; max-height: 100vh; overflow: hidden; background: var(--bg-main);">
                
                <!-- HEADER (Controle Rápido) -->
                <header style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px 25px; border-radius: 12px; border: 1px solid rgba(197, 160, 89, 0.3);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 40px; height: 40px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #fff; box-shadow: 0 0 15px var(--accent);">
                            <i class="fa-solid fa-crown"></i>
                        </div>
                        <div>
                            <h2 style="margin: 0; font-family: 'Cinzel', serif; font-size: 1.4rem; color: var(--accent);">Mesa de Controle do Mestre</h2>
                            <span style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px;">Gestão de Campanha & Combate Tático</span>
                        </div>
                        <div id="dmtable-ai-status" class="${this._aiProcessing ? 'animate-pulse' : 'hidden'}" style="margin-left: 10px; padding: 4px 10px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.5); border-radius: 12px; font-size: 0.7rem; color: #d8b4fe; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" style="background: linear-gradient(135deg, #10b981, #047857); color: #fff; border: 1px solid #34d399; box-shadow: 0 0 15px rgba(16,185,129,0.4); font-weight: bold;" onClick=${() => this.openTacticalEye()}>
                            <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                        </button>
                        <button class="btn btn-ghost" style="border: 1px solid #66fcf1; color: #66fcf1; background: rgba(102, 252, 241, 0.05); font-weight: bold;" onClick=${() => this.openSoundboard()}>
                            <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                        </button>
                        <button class="btn btn-ghost" style="border: 1px solid #a855f7; color: #d8b4fe; background: rgba(168, 85, 247, 0.1); font-weight: bold; box-shadow: 0 0 12px rgba(168,85,247,0.3);" onClick=${() => this.openOracle()}>
                            <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                        </button>
                        <button class="btn btn-ghost" style="border: 1px solid var(--accent); color: var(--accent);" onClick=${() => this.openSpellBook()}>
                            <i class="fa-solid fa-scroll"></i> Grimório
                        </button>
                        <button class="btn btn-ghost" style="border: 1px solid var(--accent); color: var(--accent);" onClick=${() => this.openLootGenerator()}>
                            <i class="fa-solid fa-coins"></i> Gerar Tesouro
                        </button>

                        <button class="btn btn-secondary" onClick=${() => this.openEncounterGenerator()}>
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                        </button>
                        <button class="btn btn-ghost" style="border: 1px solid #3b82f6; color: #60a5fa; background: rgba(59,130,246,0.1); font-weight: bold;" onClick=${() => exportCampaignBackup(this.store)} title="Exportar backup completo (.tome)">
                            <i class="fa-solid fa-file-export"></i> Backup (.tome)
                        </button>
                        <button class="btn btn-ghost" style="border: 1px solid #10b981; color: #34d399; background: rgba(16,185,129,0.1); font-weight: bold;" onClick=${() => importCampaignBackup(this.store, () => this.render())} title="Restaurar campanha (.tome / .json)">
                            <i class="fa-solid fa-file-import"></i> Restaurar
                        </button>
                        <button class="btn btn-primary" onClick=${() => document.querySelector('#dmtable-dice-tray')?.classList.toggle('hidden')}>
                            <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                        </button>
                    </div>
                </header>

                <!-- COLUNA ESQUERDA (Tracker e Notas) -->
                <div style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto; padding-right: 10px; scrollbar-width: thin;">
                    <div id="dmtable-tracker" style="background: rgba(10, 10, 15, 0.8); border-radius: 12px; border: 1px solid rgba(197,160,89,0.2); min-height: 50vh; overflow: hidden; position: relative;">
                        <!-- O Combat Tracker será montado aqui -->
                        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:var(--text-dim);">Carregando Tracker...</div>
                    </div>
                    
                    <div id="dmtable-journal" style="background: rgba(10, 10, 15, 0.8); border-radius: 12px; border: 1px solid rgba(197,160,89,0.2); flex: 1; min-height: 30vh; overflow: hidden;">
                        <!-- Session Journal será montado aqui -->
                    </div>
                </div>

                <!-- COLUNA DIREITA (Bestiário Rápido) -->
                <div style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto; padding-right: 5px; scrollbar-width: thin;">
                    <div style="background: rgba(15, 17, 26, 0.9); border-radius: 12px; border: 1px solid rgba(197, 160, 89, 0.25); flex: 1; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                        <div style="background: linear-gradient(90deg, rgba(212, 175, 55, 0.15), rgba(15, 17, 26, 0.95)); padding: 12px 15px; color: var(--accent); font-family: 'Cinzel', serif; font-weight: bold; text-align: center; border-bottom: 1px solid rgba(197, 160, 89, 0.25); letter-spacing: 0.08em;">
                            <i class="fa-solid fa-dragon" style="margin-right: 8px;"></i> ACESSO RÁPIDO: BESTIÁRIO
                        </div>
                        <div id="dmtable-bestiary" style="flex: 1; overflow-y: auto; padding: 12px; background: rgba(10, 11, 16, 0.95);">
                            <!-- Bestiary será montado aqui -->
                        </div>
                    </div>
                </div>

                <!-- BANDEJA DE DADOS FLUTUANTE (Oculta por padrão) -->
                <div id="dmtable-dice-tray" class="hidden" style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(15, 12, 16, 0.95); border: 2px solid var(--accent); border-radius: 16px; padding: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); z-index: 1000; display: flex; gap: 15px; align-items: center; backdrop-filter: blur(10px);">
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary" style="font-size: 1.2rem; padding: 10px 20px;" onClick=${() => window.TOME.events.emit('DICE_ROLL_REQUESTED', 20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-danger" style="margin-left: 15px;" onClick=${() => document.querySelector('#dmtable-dice-tray')?.classList.add('hidden')}><i class="fa-solid fa-times"></i></button>
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
