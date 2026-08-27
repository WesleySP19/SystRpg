import { Store } from './Store.js';
import { events } from './EventBus.js';
class Registry {
constructor() {
this.store = new Store({
activeView: 'home',
activeTab: 'dashboard',
players: [],
monsters: [],
savedNPCs: [],
initiativeOrder: [],
concentration: [],
combatRound: 0,
combatActive: false,
journalEntries: [],
sessionNotes: '',
sessionTitle: '',
campaigns: [],
activeCampaignId: null,
quests: [],
tacticalMap: { fog: null, mapUrl: null, tokens: [] },
lastLoot: null,
audioMuted: false,
currentTheme: 'default',
currentEnvironment: 'default',
resources: { potions: 0, scrolls: 0 },
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