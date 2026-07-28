import { TOME } from '../../core/Registry.js';
import { Store } from '../../core/Store.js';
import { PersistenceService } from '../../services/PersistenceService.js';
import { MapManager } from '../components/MapManager.js';
import { Toast } from '../components/Toast.js';

// Boot standalone map window
window.onload = async () => {
    console.log('[MasterMap] Iniciando Mesa Virtual Dedicada...');
    
    // Initialize the store
    TOME.store = new Store({});
    
    // Initialize persistence (this will load from state.json or localStorage backup)
    TOME.persistence = new PersistenceService();
    await TOME.persistence.load();

    // Listen to localStorage changes from the main Dashboard to keep the Map synced
    window.addEventListener('storage', (e) => {
        const activeSession = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
        if (e.key === `TOME_PRO_STATE_${activeSession}`) {
            try {
                const state = JSON.parse(e.newValue);
                // Update store without triggering a save back to JSON (which would loop)
                // PersistenceService listens to TOME.store to save, but it's debounced.
                // Actually, if we just assign, it's fine.
                TOME.store.update(s => {
                    // Update tokens, players, etc, but DO NOT overwrite tacticalMap if we are editing it here
                    // Wait, the GM is editing the map HERE. We only want to sync players/monsters HP!
                    s.players = state.players;
                    s.monsters = state.monsters;
                    s.initiativeOrder = state.initiativeOrder;
                    s.initiativeIndex = state.initiativeIndex;
                    s.combatRound = state.combatRound;
                });
            } catch (err) {}
        }
    });

    // We also need to send Map changes BACK to the Dashboard.
    // The MapManager already uses BroadcastChannel 'tome_map'.
    // Or, because PersistenceService listens to TOME.store, any change made here WILL save to state.json
    // and localStorage, which the Dashboard will see if it listens to 'storage'!

    // Mount MapManager into app-root
    const mapApp = new MapManager({ store: TOME.store });
    mapApp.mount(document.getElementById('app-root'));
    
    Toast.show('Mesa do Mestre Carregada com Sucesso!', 'success');
};
