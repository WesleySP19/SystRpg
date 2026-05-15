import { Store } from './Store.js';
import { events } from './EventBus.js';

/**
 * APPLICATION REGISTRY v3.1
 * Central singleton hub for all services, state, and events.
 */
class Registry {
    constructor() {
        this.store = new Store({
            activeView: 'home',
            activeTab: 'dashboard',
            players: [],
            monsters: [],
            logs: [],
            audioMuted: false,
            currentTheme: 'default',
            resources: { potions: 0, scrolls: 0 },
            initiativeOrder: [],
            concentration: [],
            combatRound: 0,
            combatActive: false,
            lastLoot: null,
            currentEnvironment: 'default',
            quests: [],
            journalEntries: [],
            tacticalMap: null,
            currentMap: '',
            selectedMonsterId: null,
            playerMapData: null,
            showPartyHUD: true,
            campaignData: {
                title: 'Nova Campanha',
                location: 'Desconhecido',
                day: 1,
                groupGold: 0,
                rations: 0,
                water: 0,
                factions: [
                    { name: 'Guarda da Cidade', status: 'Amigável' },
                    { name: 'Sindicato do Crime', status: 'Hostil' }
                ]
            }
        });

        this.events = events;
        this._services = new Map();
    }

    registerService(name, instance) {
        this._services.set(name, instance);
        this[name] = instance;
    }

    get(serviceName) {
        return this._services.get(serviceName) || null;
    }
}

export const TOME = new Registry();
window.TOME = TOME;
