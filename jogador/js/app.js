import { UI } from './UI.js';
import { Engine } from './Engine.js';
import { TacticalMapEnginePixi } from '/ui/components/TacticalMapEnginePixi.js';

const ui = new UI();
const engine = new Engine(ui);

// Instancia a Engine PixiJS no Mobile do Jogador
let playerMapEngine = null;
let socket = null;

async function initPlayerMap(tableId) {
    const container = document.getElementById('player-map-container');
    const emptyHint = document.getElementById('player-map-empty');
    if (!container || playerMapEngine) return;

    playerMapEngine = new TacticalMapEnginePixi('player-map-container', {
        width: container.clientWidth || window.innerWidth,
        height: container.clientHeight || window.innerHeight,
        isDM: false
    });
    await playerMapEngine.init(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);

    // Redimensiona quando a aba Mapa for ativada
    window.addEventListener('tome:map_tab_activated', () => {
        if (playerMapEngine && playerMapEngine.app && playerMapEngine.app.renderer) {
            const rect = container.getBoundingClientRect();
            playerMapEngine.app.renderer.resize(rect.width || window.innerWidth, rect.height || window.innerHeight);
        }
    });

    // Socket.IO para sincronização com o Mestre na LAN
    try {
        if (!socket) {
            socket = engine.socket || (typeof io === 'function' ? io() : null);
        }
        if (socket) {
            if (socket.connected) {
                socket.emit('joinRoom', { mesaId: tableId });
            } else {
                socket.on('connect', () => {
                    socket.emit('joinRoom', { mesaId: tableId });
                });
            }

            socket.on('map_sync_event', (data) => {
                if (!data || !playerMapEngine) return;

                if (data.type === 'MAP_UPDATE') {
                    if (data.mapUrl !== undefined) {
                        playerMapEngine.setMapUrl(data.mapUrl);
                        if (data.mapUrl) emptyHint.style.display = 'none';
                        else emptyHint.style.display = 'flex';
                    }
                    if (data.fog !== undefined) playerMapEngine.setFog(data.fog);
                    if (data.gridActive !== undefined) {
                        playerMapEngine.setGrid(data.gridActive, data.gridScale || '1.5m');
                    }
                    if (data.tokens !== undefined) playerMapEngine.updateTokens(data.tokens);
                }
                if (data.type === 'TOKEN_MOVE' && data.data) {
                    const { id, x, y } = data.data;
                    const token = playerMapEngine.tokens.get(id);
                    if (token) {
                        token.targetX = x;
                        token.targetY = y;
                    }
                }
                if (data.type === 'PING') {
                    const pos = data.position || data;
                    playerMapEngine.showPing(pos.x, pos.y, data.color || '#10b981');
                }
                if (data.type === 'CAMERA_UPDATE' && data.data) {
                    playerMapEngine.setCamera(data.data.x, data.data.y, data.data.scale);
                }
                if ((data.type === 'FOG_PATH_UPDATE' || data.type === 'FOG_UPDATE') && data.data) {
                    const pt = data.data.points || data.data;
                    if (pt && pt.x !== undefined && pt.y !== undefined) {
                        playerMapEngine._paintFog(pt.x, pt.y, pt.radius || 150, false);
                    }
                }
                if (data.type === 'AOE_TEMPLATE' && data.data) {
                    playerMapEngine.setAoeTemplate(data.data);
                }
                if (data.type === 'SPELL_EFFECT') {
                    playerMapEngine.showSpellEffect(data.x, data.y, data.color || '#9c27b0', data.spellType || 'spell');
                }
                if (data.type === 'COMBAT_UPDATE' && data.state) {
                    updateCombatBanner(data.state);
                }
            });

            function updateCombatBanner(combatState) {
                const banner = document.getElementById('combat-hud-banner');
                const badge = document.getElementById('combat-status-badge');
                const actorName = document.getElementById('turn-actor-name');
                const myAlert = document.getElementById('my-turn-alert');
                if (!banner || !combatState) return;

                if (!combatState.combatActive || !combatState.initiativeOrder?.length) {
                    banner.style.display = 'none';
                    return;
                }

                banner.style.display = 'flex';
                badge.textContent = `Rodada ${combatState.combatRound || 1}`;
                const active = combatState.initiativeOrder[combatState.initiativeIndex || 0];
                actorName.textContent = `Vez de ${active?.name || 'Aventureiro'}`;

                const isMe = active && (
                    (active.name && engine.currentName && active.name.toLowerCase() === engine.currentName.toLowerCase()) ||
                    (active.id === engine.currentCharId)
                );

                if (isMe) {
                    myAlert.classList.remove('hidden');
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                } else {
                    myAlert.classList.add('hidden');
                }

                const actions = active?.actions || { action: true, bonus: true, reaction: true, movement: 30 };
                const btnAction = document.getElementById('btn-player-action');
                const btnBonus = document.getElementById('btn-player-bonus');
                const btnReaction = document.getElementById('btn-player-reaction');
                const btnMove = document.getElementById('btn-player-move');

                if (btnAction) {
                    btnAction.className = `flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[0.65rem] font-bold ${actions.action !== false ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-black/30 border-white/10 text-slate-500 line-through opacity-50'}`;
                }
                if (btnBonus) {
                    btnBonus.className = `flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[0.65rem] font-bold ${actions.bonus !== false ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-black/30 border-white/10 text-slate-500 line-through opacity-50'}`;
                }
                if (btnReaction) {
                    btnReaction.className = `flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[0.65rem] font-bold ${actions.reaction !== false ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-black/30 border-white/10 text-slate-500 line-through opacity-50'}`;
                }
                if (btnMove) {
                    btnMove.className = `flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[0.65rem] font-bold ${(actions.movement ?? 30) > 0 ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-black/30 border-white/10 text-slate-500 line-through opacity-50'}`;
                    btnMove.innerHTML = `<i class="fa-solid fa-shoe-prints text-[0.6rem]"></i> ${(actions.movement ?? 30) > 0 ? `${actions.movement ?? 30}ft` : '0ft'}`;
                }
            }

            socket.on('combat_update', updateCombatBanner);

            try {
                const mapBc = new BroadcastChannel('tome_map');
                mapBc.onmessage = (e) => {
                    if (e.data?.type === 'COMBAT_UPDATE' && e.data.state) {
                        updateCombatBanner(e.data.state);
                    }
                };
            } catch(e) {}

            document.getElementById('btn-player-action')?.addEventListener('click', () => {
                engine.sendMessage('⚔️ Utilizou sua Ação Padrão.');
            });
            document.getElementById('btn-player-bonus')?.addEventListener('click', () => {
                engine.sendMessage('⚡ Utilizou sua Ação Bônus.');
            });
            document.getElementById('btn-player-reaction')?.addEventListener('click', () => {
                engine.sendMessage('🛡️ Acionou sua Reação!');
            });
            document.getElementById('btn-player-move')?.addEventListener('click', () => {
                engine.sendMessage('🏃 Gastou deslocamento tático.');
            });

            // Solicita o mapa atual do servidor
            socket.emit('map_request_sync', { tableId });
        }
    } catch(err) {
        console.warn('[PlayerMap] Falha ao conectar ao Socket.io:', err);
    }

    // Controles rápidos do mobile
    const btnPing = document.getElementById('btn-map-ping');
    if (btnPing) {
        btnPing.addEventListener('click', () => {
            if (!playerMapEngine) return;
            const cx = (playerMapEngine.app.screen.width / 2 - playerMapEngine.mapContainer.x) / playerMapEngine.mapContainer.scale.x;
            const cy = (playerMapEngine.app.screen.height / 2 - playerMapEngine.mapContainer.y) / playerMapEngine.mapContainer.scale.y;
            playerMapEngine.showPing(cx, cy, '#f59e0b');
            if (socket) {
                socket.emit('map_sync_event', {
                    type: 'PING',
                    position: { x: cx, y: cy },
                    color: '#f59e0b',
                    sender: engine.currentName || 'Jogador'
                });
            }
        });
    }

    const btnCenter = document.getElementById('btn-map-center');
    if (btnCenter) {
        btnCenter.addEventListener('click', () => {
            if (!playerMapEngine) return;
            playerMapEngine.setCamera(0, 0, 1);
        });
    }
}

const sendAction = () => {
    const txt = ui.chatInput.value.trim();
    if (txt) {
        engine.sendMessage(txt);
        ui.chatInput.value = '';
    }
};

document.getElementById('send-btn')?.addEventListener('click', sendAction);
ui.chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendAction();
});

document.querySelectorAll('.macro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        engine.rollMacro(btn.getAttribute('data-formula'), btn.getAttribute('data-label'));
    });
});

const btnConnect = document.getElementById('btn-connect');
if (btnConnect) {
    btnConnect.addEventListener('click', async () => {
        await engine.connect();
        if (engine.currentTable) initPlayerMap(engine.currentTable);
    });
}

// Tenta autenticação automática se houver token ativo no cookie
engine.connectWithToken().then((connected) => {
    if (connected && engine.currentTable) {
        initPlayerMap(engine.currentTable);
    }
});

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[Elo Arcano] Pronto para instalar PWA!');
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/jogador/sw.js', { scope: '/jogador/' })
            .then(reg => console.log('[Elo Arcano PWA] SW Registrado:', reg.scope))
            .catch(err => console.warn('[Elo Arcano PWA] Falha no SW:', err));
    });
}
