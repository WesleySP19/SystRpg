import { TOME } from '../core/Registry.js';
import { Sidebar } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { Dice } from '../utils/Dice.js';
import { PersistenceService } from '../services/PersistenceService.js';
import { AudioService } from '../services/AudioService.js';
import { AIService } from '../services/AIService.js';
import { FXEngine } from '../services/FXEngine.js';
import { IndexedDBService } from '../services/IndexedDBService.js';
import { TelemetryService } from '../services/TelemetryService.js';
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

export async function startApp() {
    // Garantir que temos um registro de início
    if (!localStorage.getItem('DM_SESSION_START')) {
        localStorage.setItem('DM_SESSION_START', Date.now().toString());
    }

    try {
        let sentryDsn = null;
        try {
            const configRes = await fetch('/api/config');
            if (configRes.ok) {
                const config = await configRes.json();
                sentryDsn = config.sentryDsn;
            }
        } catch (cfgErr) {
            console.log('[Boot] Não foi possível obter configuração do servidor, usando fallback local.');
        }

        await TelemetryService.init(sentryDsn);
        TelemetryService.initFpsMonitor();
    } catch (e) {
        console.warn('[Boot] Falha ao inicializar TelemetryService:', e);
    }

    try {
        const idb = new IndexedDBService();
        await idb.init();
        TOME.db = idb;
        window.TOME.db = idb;
        console.log('[Boot] IndexedDB inicializado.');
    } catch (e) {
        console.error('[Boot] Falha grave no IndexedDB. O app pode nao funcionar corretamente offline.', e);
    }

    try {
        const activeTable = localStorage.getItem('DM_ACTIVE_TABLE');
        if (activeTable) {
            const socket = io('/', {
                reconnectionDelayMax: 10000,
                reconnectionAttempts: 10,
                autoConnect: true,
                transports: ['websocket', 'polling']
            });
            
            socket.on('connect_error', (err) => {
                console.warn('[Boot] GM Socket erro de conexão:', err.message);
                if (socket.io && socket.io.engine) {
                    socket.io.engine.id = null;
                }
            });

            window.TOME.socket = socket;
            socket.on('connect', () => {
                console.log('[Boot] GM Socket conectado ao servidor.');
                if (activeTable) {
                    socket.emit('joinRoom', { mesaId: activeTable });
                    console.log(`[Boot] GM entrou na sala: ${activeTable}`);
                }
            });
        }
    } catch (e) {
        console.warn('[Boot] Falha ao inicializar Socket.io:', e);
    }

    TOME.registerService('audio', new AudioService());
    TOME.registerService('ai', new AIService());
    FXEngine.init();

    if (window.TOME.socket) {
        window.TOME.socket.on('map_audio', (data) => {
            const action = data.action;
            const payload = data.payload || {};
            if (action === 'PLAY_MUSIC') TOME.audio.fadeTo('music', payload.url, 2000);
            else if (action === 'PLAY_AMB') TOME.audio.fadeTo('ambience', payload.url, 2000);
            else if (action === 'STOP_AUDIO') TOME.audio.stopAll();
            else if (action === 'SET_CHANNEL_VOL') TOME.audio.setChannelVolume(payload.channel, payload.volume);
            else if (action === 'SET_ENV') {
                TOME.store.update(s => s.currentEnvironment = payload.env);
            }
        });

        window.TOME.socket.on('state_update', async (data) => {
            if (data && typeof data === 'object') {
                try {
                    const SessionManager = (await import('../services/SessionManager.js')).SessionManager;
                    SessionManager._isApplyingNetworkState = true;
                    TOME.store.update(s => Object.assign(s, data));
                    setTimeout(() => SessionManager._isApplyingNetworkState = false, 500);
                } catch(e) {
                    console.error('[Boot] Erro ao sincronizar state_update', e);
                }
            }
        });
    }

    const persistence = new PersistenceService();
    TOME.registerService('persistence', persistence);

    try {
        await persistence.init();
        await persistence.load();
        persistence.startAutoSave();
    } catch (e) { console.warn('[Boot] persistence skipped:', e); }

    const sidebar = new Sidebar({
        store: TOME.store,
        element: document.getElementById('sidebar-target')
    });

    const dashboard = new Dashboard({
        store: TOME.store,
        element: document.getElementById('view-target')
    });

    sidebar.mount();
    dashboard.mount();

    TOME.events.on('DICE_ROLL_REQUESTED', (sides) => {
        const result = Dice.roll(`1d${sides}`);
        import('./components/Toast.js').then(m => {
            m.Toast.show(`d${sides}: ${result.total}`, 'info');
        }).catch(() => alert(`d${sides}: ${result.total}`));
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('[Boot] SW Ativo'))
            .catch(e => console.warn('[Boot] SW Falhou:', e));
    }

    console.log('Mesa do Mestre - online.');
}
