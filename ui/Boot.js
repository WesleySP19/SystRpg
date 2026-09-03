import { TOME } from '../core/Registry.js';
import { App } from './App.jsx';
import { Dice } from '../utils/Dice.js';
import { PersistenceService } from '../services/PersistenceService.js';
import { AudioService } from '../services/AudioService.js';
import { FXEngine } from '../services/FXEngine.js';
import { IndexedDBService } from '../services/IndexedDBService.js';
import { TelemetryService } from '../services/TelemetryService.js';
import { RulesEngine } from '../core/RulesEngine.js';
import { WebRTCManager } from '../services/WebRTCManager.js';
import { render } from 'preact';
import { html } from 'htm/preact';

export async function startApp() {
    // Garantir que temos um registro de início
    if (!localStorage.getItem('DM_SESSION_START')) {
        localStorage.setItem('DM_SESSION_START', Date.now().toString());
    }

    TOME.events.on('AUTH_REQUIRED', () => {
        console.warn('[Boot] AUTH_REQUIRED recebido. Sessão requer autenticação.');
        localStorage.removeItem('DM_JWT_TOKEN');
    });

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
        const ioClient = window.io || (typeof io !== 'undefined' ? io : null);
        if (activeTable && ioClient) {
            const socket = ioClient('/', {
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
                
                // Inicializa WebRTC após ter o socket conectado
                try {
                    const webrtc = new WebRTCManager();
                    TOME.registerService('webrtc', webrtc);
                } catch (e) {
                    console.warn('[Boot] Falha ao inicializar WebRTC:', e);
                }
            });
        }
    } catch (e) {
        console.warn('[Boot] Falha ao inicializar Socket.io:', e);
    }

    TOME.registerService('audio', new AudioService());
    
    // Lazy Load AIService
    import('../services/AIService.js').then(({ AIService }) => {
        TOME.registerService('ai', new AIService());
    }).catch(e => console.warn('[Boot] Failed to load AIService', e));

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

        // Delta State Update — recebe apenas patches (RFC 6902) ao invés do estado completo
        window.TOME.socket.on('delta_state_update', async (payload) => {
            if (payload && payload.patches && Array.isArray(payload.patches)) {
                try {
                    const { applyPatch } = await import('../utils/DeltaSync.js');
                    const SessionManager = (await import('../services/SessionManager.js')).SessionManager;
                    SessionManager._isApplyingNetworkState = true;
                    
                    const currentState = TOME.store.snapshot();
                    const patched = applyPatch(currentState, payload.patches);
                    TOME.store.update(s => Object.assign(s, patched));
                    
                    console.log(`[Boot] Delta sync aplicado: ${payload.patches.length} patches (v${payload.version})`);
                    setTimeout(() => SessionManager._isApplyingNetworkState = false, 500);
                } catch(e) {
                    console.error('[Boot] Erro no delta_state_update, solicitando estado completo:', e);
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
        
        const corePersistence = (await import('../core/PersistenceService.js')).PersistenceService;
        corePersistence.initNetworkListeners();
    } catch (e) { console.warn('[Boot] persistence skipped:', e); }

    // Carregar Ruleset do Sistema
    try {
        await RulesEngine.loadRuleset('dnd5e'); // Fallback para dnd5e, pode ser lido do localStorage depois
    } catch (e) {
        console.warn('[Boot] Failed to load ruleset', e);
    }

    // Render unified UI single-tree using Preact
    render(html`<${App} />`, document.getElementById('app-root'));

    // Lazy load DiceBoxService only when requested
    TOME.events.on('DICE_ROLL_REQUESTED', async (sides) => {
        try {
            let dice3d = TOME.dice3d;
            if (!dice3d) {
                const { DiceBoxService } = await import('../services/DiceBoxService.js');
                dice3d = new DiceBoxService();
                TOME.registerService('dice3d', dice3d);
            }
            
            const total = await dice3d.roll(sides);
            import('./components/Toast.js').then(m => {
                m.Toast.show(`Rolou d${sides}: Resultou em ${total}! 🎲`, 'success');
            });
        } catch (err) {
            console.error(err);
            // Fallback
            const result = Dice.roll(`1d${sides}`);
            import('./components/Toast.js').then(m => {
                m.Toast.show(`d${sides}: ${result.total}`, 'info');
            });
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('[Boot] SW Ativo'))
            .catch(e => console.warn('[Boot] SW Falhou:', e));
    }

    console.log('Mesa do Mestre - online.');
}
