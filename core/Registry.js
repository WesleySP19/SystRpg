import { Store } from './Store.js';
import { events } from './EventBus.js';

/**
 * APPLICATION REGISTRY v3.1
 * Central singleton hub for all services, state, and events.
 */
class Registry {
    constructor() {
        this.store = new Store({
            // Navigation
            activeView: 'home',
            activeTab: 'dashboard',

            // Party
            players: [],
            monsters: [],
            savedNPCs: [],

            // Combat
            initiativeOrder: [],
            concentration: [],
            combatRound: 0,
            combatActive: false,

            // Journal & Timeline
            journalEntries: [],
            sessionNotes: '',
            sessionTitle: '',

            // Campaign
            campaigns: [],
            activeCampaignId: null,
            quests: [],

            // Map
            tacticalMap: { fog: null, mapUrl: null, tokens: [] },

            // Loot
            lastLoot: null,

            // Audio & Preferences
            audioMuted: false,
            currentTheme: 'default',
            currentEnvironment: 'default',
            resources: { potions: 0, scrolls: 0 },

            // Meta
            schemaVersion: 5
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
