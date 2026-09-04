/**
 * DiceBoxService - Gerencia o motor de física 3D para dados (Phase 10)
 * Suporta @3d-dice/dice-box com fallback 100% autônomo offline na LAN.
 */
export class DiceBoxService {
    constructor() {
        this.box = null;
        this.initialized = false;
        this.failed = false;
        this.containerId = 'dice-box-container';
        
        // Garantir que o container existe no DOM
        if (typeof document !== 'undefined' && !document.getElementById(this.containerId)) {
            const container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }

        try {
            this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('tome_dice') : null;
            if (this.channel) {
                this.channel.onmessage = async (e) => {
                    if (e.data?.type === 'DICE_ROLL_3D' && e.data.notation) {
                        await this._handleRemoteRoll(e.data.notation);
                    }
                };
            }
        } catch(e) {}

        this._setupSocketListener();
    }

    _setupSocketListener() {
        if (typeof window === 'undefined') return;
        const attach = () => {
            const s = window.TOME?.socket;
            if (s && !s._tomeDiceBoxAttached) {
                s._tomeDiceBoxAttached = true;
                s.on('dice_roll_3d', async (data) => {
                    if (data && data.notation) {
                        await this._handleRemoteRoll(data.notation);
                    }
                });
            }
        };
        attach();
        window.addEventListener('tome:socket_ready', attach);
    }

    async _handleRemoteRoll(notation) {
        if (!this.initialized && !this.failed) {
            try { await this.init(); } catch(e) {}
        }
        if (this.box && this.initialized) {
            try {
                this.box.roll(notation);
                setTimeout(() => this.box?.clear(), 3500);
            } catch(e) {}
        }
        try {
            window.TOME?.audio?.playSyntheticSFX('dice');
        } catch(e) {}
    }

    /**
     * Inicializa preguiçosamente (lazy load) o motor 3D
     */
    async init() {
        if (this.initialized || this.failed) return;
        
        try {
            // Importar dinamicamente o ES Module do CDN se online
            const { default: DiceBox } = await import('https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js');
            
            this.box = new DiceBox(`#${this.containerId}`, {
                assetPath: 'https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/assets/',
                theme: 'default',
                themeColor: '#c5a059',
                scale: 6,
                spinForce: 5,
                throwForce: 7,
                gravity: 3,
                mass: 2,
                friction: 0.8
            });

            await this.box.init();
            
            const canvas = document.querySelector(`#${this.containerId} canvas`);
            if (canvas) {
                canvas.style.pointerEvents = 'none';
            }

            this.initialized = true;
            console.log('[DiceBoxService] Motor de física 3D inicializado com sucesso.');
        } catch (error) {
            this.failed = true;
            console.warn('[DiceBoxService] Motor 3D indisponível (Modo LAN/Offline ativo, usando síntese sonora):', error.message);
        }
    }

    /**
     * Rola dados com física 3D ou fallback matemático offline
     * @param {string|number} notation Pode ser "1d20", "2d6+2" ou apenas o número de lados (ex: 20)
     * @returns {Promise<number>} O total numérico da rolagem
     */
    async roll(notation) {
        let rollString = typeof notation === 'number' ? `1d${notation}` : String(notation || '1d20');

        if (!this.initialized && !this.failed) {
            try { await this.init(); } catch(e) {}
        }

        try {
            let total = 0;
            if (this.box && this.initialized) {
                const results = await this.box.roll(rollString);
                if (Array.isArray(results)) {
                    total = results.reduce((acc, group) => acc + (group.value || 0), 0);
                } else if (results && results.value !== undefined) {
                    total = results.value;
                } else {
                    total = Number(results) || 1;
                }
                setTimeout(() => {
                    try { this.box?.clear(); } catch(e) {}
                }, 3000);
            } else {
                // Fallback offline puro
                const sides = typeof notation === 'number' ? notation : (parseInt(rollString.replace(/\D/g, '')) || 20);
                total = Math.floor(Math.random() * sides) + 1;
                try {
                    window.TOME?.audio?.playSyntheticSFX('dice');
                } catch(e) {}
            }

            // Broadcast do dado para o Telão e dispositivos LAN
            try {
                this.channel?.postMessage({ type: 'DICE_ROLL_3D', notation: rollString, total });
                if (window.TOME?.socket) {
                    window.TOME.socket.emit('dice_roll_3d', { notation: rollString, total });
                }
            } catch(e) {}

            return total;
        } catch (err) {
            console.warn('[DiceBoxService] Fallback de rolagem ativado:', err);
            const sides = typeof notation === 'number' ? notation : 20;
            return Math.floor(Math.random() * sides) + 1;
        }
    }
}
