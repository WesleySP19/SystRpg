/**
 * TELEMETRY & OBSERVABILITY SERVICE v2.0 — "O Olho Arcano"
 * Monitoramento dinâmico de performance de execução (FPS/Latência/Erros) sem impactar a jogabilidade ou inundar o console.
 */
export class TelemetryService {
    static sentryLoaded = false;
    static fpsInterval = null;
    static latencyInterval = null;
    static metrics = {
        fps: 60,
        latency: 0,
        status: 'OTIMO', // OTIMO, ATENCAO, DEGRADADO
        errorsCount: 0,
        lastUpdated: Date.now()
    };

    static _updateStatus() {
        this.metrics.lastUpdated = Date.now();
        if (this.metrics.fps < 20 || this.metrics.latency > 500) {
            this.metrics.status = 'DEGRADADO';
        } else if (this.metrics.fps < 40 || this.metrics.latency > 200) {
            this.metrics.status = 'ATENCAO';
        } else {
            this.metrics.status = 'OTIMO';
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tome:telemetry_update', { detail: this.metrics }));
        }
    }

    /**
     * Retorna o diagnóstico contínuo em tempo real para inspeção ou widgets de campanha
     */
    static getExecutionReport() {
        return {
            ...this.metrics,
            uptimeSeconds: Math.round((performance.now() / 1000)),
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'N/A'
        };
    }

    /**
     * Inicializa a telemetria do frontend (Sentry SDK se o DSN estiver configurado)
     * @param {string} dsn 
     */
    static async init(dsn) {
        if (!dsn) return;
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://browser.sentry-cdn.com/7.100.0/bundle.min.js';
                script.crossOrigin = 'anonymous';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });

            if (window.Sentry) {
                window.Sentry.init({
                    dsn: dsn,
                    tracesSampleRate: 0.1,
                    replaysSessionSampleRate: 0.1,
                    replaysOnErrorSampleRate: 1.0,
                });
                this.sentryLoaded = true;
                console.log('[Telemetry] Sentry SDK inicializado com sucesso.');
            }
        } catch (err) {
            console.warn('[Telemetry] Falha silenciosa no Sentry (LAN/Offline ativo):', err.message);
        }
    }

    /**
     * Captura um erro e envia para o Sentry sem paralisar o jogo
     */
    static captureError(err, context = {}) {
        this.metrics.errorsCount++;
        console.error('[Telemetry] Anomalia Capturada:', err, context);
        if (this.sentryLoaded && window.Sentry) {
            window.Sentry.captureException(err, { extra: context });
        }
        this._updateStatus();
    }

    /**
     * Inicializa o monitoramento de taxa de quadros (FPS) no Canvas/UI.
     */
    static initFpsMonitor(onFpsUpdate = null) {
        if (this.fpsInterval) clearInterval(this.fpsInterval);

        let frameCount = 0;
        let lastTime = performance.now();

        const countFrame = () => {
            frameCount++;
            requestAnimationFrame(countFrame);
        };
        requestAnimationFrame(countFrame);

        this.fpsInterval = setInterval(() => {
            if (document.hidden) {
                frameCount = 0;
                lastTime = performance.now();
                return;
            }

            const now = performance.now();
            const delta = now - lastTime;
            if (delta < 100) return;

            const fps = Math.round((frameCount * 1000) / delta);
            frameCount = 0;
            lastTime = now;

            this.metrics.fps = fps;
            this._updateStatus();

            if (onFpsUpdate) onFpsUpdate(fps);

            if (fps > 0 && fps < 20) {
                console.warn(`[Telemetry] Queda temporária de FPS detectada: ${fps} FPS.`);
            }
        }, 10000);
    }

    /**
     * Inicializa o monitoramento de latência do WebSocket (Ping-Pong silencioso)
     */
    static initLatencyMonitor(socket, onLatencyUpdate = null) {
        if (!socket) return;
        if (this.latencyInterval) clearInterval(this.latencyInterval);

        socket.on('pong_perf', (sentTimestamp) => {
            const latency = Date.now() - sentTimestamp;
            this.metrics.latency = latency;
            this._updateStatus();

            if (onLatencyUpdate) onLatencyUpdate(latency);

            if (latency > 600) {
                console.warn(`[Telemetry] Latência LAN/Móvel elevada: ${latency}ms`);
            }
        });

        this.latencyInterval = setInterval(() => {
            if (socket.connected) {
                socket.emit('ping_perf', Date.now());
            }
        }, 5000);
    }
}
