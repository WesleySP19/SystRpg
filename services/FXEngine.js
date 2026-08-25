/**
 * FX ENGINE v1.0 — "Animações e Dramatização Cinematográfica TOME"
 * 
 * Gerencia efeitos visuais imersivos em tempo real:
 *  - Aniquilação de Monstros (ENTITY_SLAIN): Tremor na tela, flash escarlate e anúncio dramático.
 *  - Queda de Heróis (HERO_FALLEN): Luto arcano (tela desvanecida/escura), vibração cardíaca e réquiem.
 *  - Sincronização automática entre Mestre, Celular dos Jogadores e TV/Telão via BroadcastChannel, Socket e REST.
 */

import { TOME } from '../core/Registry.js';
import { battleManager } from './BattleManager.js';

class FXEngineService {
    constructor() {
        this._bc = null;
        this._injectedStyles = false;
        this._overlayRoot = null;
    }

    init() {
        this._injectCSS();
        this._ensureOverlayRoot();

        // Inicializa canal local de abas/telão
        if (typeof BroadcastChannel !== 'undefined') {
            this._bc = new BroadcastChannel('tome_fx_mesh');
            this._bc.onmessage = (ev) => {
                if (ev && ev.data && ev.data.event) {
                    this.play(ev.data.event, ev.data.targetName, ev.data.details, false);
                }
            };
        }

        // Conecta aos Eventos Desacoplados do BattleManager
        battleManager.on('ENTITY_SLAIN', ({ entity, name, id }) => {
            this.trigger('ENTITY_SLAIN', name || entity?.name || 'Monstro Desconhecido', id || 'm-slain');
        });
        battleManager.on('HERO_FALLEN', ({ entity, name, id }) => {
            this.trigger('HERO_FALLEN', name || entity?.name || 'Herói Bravo', id || 'p-fallen');
        });

        // Conecta ao barramento interno de eventos do TOME genérico
        if (TOME?.events) {
            TOME.events.on('FX_TRIGGERED', (data) => {
                this.play(data.event, data.targetName, data.details, false);
            });
        }

        // Conecta ao Socket.IO global caso exista ou quando se conectar
        window.addEventListener('tome:socket_ready', () => this._bindSocket());
        if (window.TOME?.socket) {
            this._bindSocket();
        }

        console.log('[FXEngine] Sistema de Animações Cinematográficas inicializado com sucesso.');
    }

    _bindSocket() {
        const socket = window.TOME?.socket;
        if (socket && !socket._fxBound) {
            socket._fxBound = true;
            socket.on('fx_animation', (data) => {
                if (data && data.event) {
                    this.play(data.event, data.targetName, data.details, false);
                }
            });
        }
    }

    /**
     * Dispara um efeito FX em toda a rede (Mestre, Jogadores e TV)
     */
    async trigger(eventName, targetName, targetId, details = {}) {
        console.log(`[FXEngine] Disparando evento cinemático: ${eventName} para [${targetName}]`);

        // 1. Executa localmente
        this.play(eventName, targetName, details, true);

        // 2. BroadcastChannel
        if (this._bc) {
            this._bc.postMessage({ event: eventName, targetName, targetId, details });
        }

        // 3. Socket.IO
        if (window.TOME?.socket) {
            window.TOME.socket.emit('fx_animation', { event: eventName, targetName, targetId, details });
        }

        // 4. REST Fallback & Registro no Chat Arcano
        try {
            fetch('/api/fx/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: eventName, targetName, targetId, details })
            }).catch(() => {});

            // Gera notificação dramática no chat
            let chatText = '';
            if (eventName === 'ENTITY_SLAIN') {
                chatText = `⚡ ANIQUILAÇÃO ARCANA: A criatura hostil [${targetName}] foi inteiramente destruída no campo de batalha!`;
            } else if (eventName === 'HERO_FALLEN') {
                chatText = `🥀 RÉQUIEM DOS BRAVOS: O destino sela o fim... O herói [${targetName}] sucumbiu ferido em seu último teste de sobrevivência!`;
            }

            if (chatText) {
                const tableId = TOME?.state?.currentTableId || 'global';
                fetch('/api/chat/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tableId,
                        message: {
                            sender: 'Sistema Arcano',
                            conteudo: chatText,
                            isSystem: true,
                            tipo: 'sistema'
                        }
                    })
                }).catch(() => {});
            }
        } catch (err) {
            console.warn('[FXEngine] Aviso no envio HTTP de rede:', err.message);
        }

        // 5. Se estiver no painel do Mestre, grava no Diário
        if (TOME?.store?.update) {
            TOME.store.update(s => {
                s.journalEntries = s.journalEntries || [];
                s.journalEntries.push({
                    type: eventName === 'ENTITY_SLAIN' ? 'combat' : 'danger',
                    title: eventName === 'ENTITY_SLAIN' ? `Monstro Aniquilado: ${targetName}` : `Morte em Batalha: ${targetName}`,
                    content: eventName === 'ENTITY_SLAIN' 
                        ? `A ameaça imposta por ${targetName} foi erradicada em combate ardente.` 
                        : `O aventureiro ${targetName} pereceu no campo, deixando uma lenda de honra e sacrifício.`,
                    timestamp: Date.now()
                });
            });
        }
    }

    /**
     * Executa a animação visual e áudio/vibração na tela atual
     */
    play(eventName, targetName = 'Alvo Arcano', details = {}, isOrigin = false) {
        this._ensureOverlayRoot();

        if (eventName === 'ENTITY_SLAIN') {
            this._playMonsterSlain(targetName);
        } else if (eventName === 'HERO_FALLEN') {
            this._playHeroFallen(targetName);
        }
    }

    _playMonsterSlain(name) {
        // Vibração agressiva (se no mobile)
        if (typeof navigator.vibrate === 'function') {
            navigator.vibrate([150, 80, 150, 80, 400]);
        }

        // Screen shake em toda a interface
        const appEl = document.getElementById('app') || document.body;
        appEl.classList.add('fx-screen-shake');
        setTimeout(() => appEl.classList.remove('fx-screen-shake'), 600);

        // Renderiza Banner Sanguinário / Arcano
        const el = document.createElement('div');
        el.className = 'fx-banner fx-banner-slain';
        el.innerHTML = `
            <div class="fx-icon-pulse" style="font-size: 3.5rem; margin-bottom: 8px;">⚔️ 💀 ⚔️</div>
            <h1 style="font-family: 'Cinzel', serif; color: #f87171; font-size: 2.2rem; font-weight: 900; text-shadow: 0 0 25px rgba(239, 68, 68, 0.9); margin: 0; letter-spacing: 2px;">ANIQUILAÇÃO!</h1>
            <div style="width: 60%; height: 2px; background: linear-gradient(to right, transparent, #ef4444, transparent); margin: 10px auto;"></div>
            <p style="font-size: 1.4rem; color: #f3f4f6; margin: 0; text-shadow: 0 2px 8px rgba(0,0,0,0.9); font-family: 'Inter', sans-serif;">
                <strong style="color: #ffdda1; font-size: 1.6rem; text-transform: uppercase;">${name}</strong> foi destroçado em combate!
            </p>
        `;

        this._overlayRoot.appendChild(el);

        // Flash de borda na tela
        const flash = document.createElement('div');
        flash.className = 'fx-screen-flash-red';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 800);

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.8) translateY(-30px)';
            setTimeout(() => el.remove(), 500);
        }, 3800);
    }

    _playHeroFallen(name) {
        // Vibração lenta e cardíaca (réquiem) no mobile
        if (typeof navigator.vibrate === 'function') {
            navigator.vibrate([400, 200, 400, 300, 700]);
        }

        // Luto na tela (Des saturação / tom frio)
        const appEl = document.getElementById('app') || document.body;
        appEl.classList.add('fx-mourning-screen');
        setTimeout(() => appEl.classList.remove('fx-mourning-screen'), 7000);

        // Renderiza Réquiem dos Bravos
        const el = document.createElement('div');
        el.className = 'fx-banner fx-banner-fallen';
        el.innerHTML = `
            <div class="fx-icon-pulse" style="font-size: 4rem; margin-bottom: 12px;">🥀 🖤 🕊️</div>
            <h1 style="font-family: 'Cinzel', serif; color: #e5c17b; font-size: 2.5rem; font-weight: 900; text-shadow: 0 0 30px rgba(229, 193, 123, 0.8); margin: 0; letter-spacing: 3px;">O RÉQUIEM DOS BRAVOS</h1>
            <div style="width: 75%; height: 2px; background: linear-gradient(to right, transparent, #e5c17b, #a855f7, transparent); margin: 14px auto;"></div>
            <p style="font-size: 1.3rem; color: #e5e7eb; margin: 0; line-height: 1.6; max-width: 650px; text-shadow: 0 2px 10px rgba(0,0,0,0.9); font-family: 'Inter', sans-serif;">
                As chamas de um destino heroico se apagam no silêncio da eternidade...<br/>
                O herói <strong style="color: #f87171; font-size: 1.7rem; font-family: 'Cinzel', serif; text-decoration: underline;">${name}</strong> tombou em batalha!
            </p>
        `;

        this._overlayRoot.appendChild(el);

        // Vinheta sombria nas bordas
        const darkVignette = document.createElement('div');
        darkVignette.className = 'fx-screen-vignette';
        document.body.appendChild(darkVignette);
        setTimeout(() => darkVignette.remove(), 7000);

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.9) translateY(20px)';
            setTimeout(() => el.remove(), 800);
        }, 6500);
    }

    _ensureOverlayRoot() {
        if (!this._overlayRoot) {
            let el = document.getElementById('tome-fx-root');
            if (!el) {
                el = document.createElement('div');
                el.id = 'tome-fx-root';
                el.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 99999; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 20px; overflow: hidden;';
                document.body.appendChild(el);
            }
            this._overlayRoot = el;
        }
    }

    _injectCSS() {
        if (this._injectedStyles || document.getElementById('tome-fx-styles')) return;
        this._injectedStyles = true;

        const link = document.createElement('link');
        link.id = 'tome-fx-styles';
        link.rel = 'stylesheet';
        link.href = '/css/tome-fx.css';
        document.head.appendChild(link);
    }
}

export const FXEngine = new FXEngineService();
