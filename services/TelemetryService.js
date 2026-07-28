/**
 * TELEMETRY & OBSERVABILITY SERVICE v1.0
 * Handles error tracking (via Sentry SDK) and client-side performance metrics.
 */
export class TelemetryService {
    static sentryLoaded = false;
    static fpsInterval = null;
    static latencyInterval = null;

    /**
     * Inicializa a telemetria do frontend (Sentry SDK se o DSN estiver configurado)
     * @param {string} dsn 
     */
    static async init(dsn) {
        if (!dsn) {
            console.log('[Telemetry] Sentry DSN não configurado. Telemetria operando em modo console padrão.');
            return;
        }

        try {
            // Carrega assincronamente o SDK do Sentry via CDN
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
            console.warn('[Telemetry] Falha ao carregar Sentry SDK (está offline/LAN fallback?):', err.message);
        }
    }

    /**
     * Captura um erro e envia para o Sentry e console
     */
    static captureError(err, context = {}) {
        console.error('[Telemetry] Erro Capturado:', err, 'Contexto:', context);
        if (this.sentryLoaded && window.Sentry) {
            window.Sentry.captureException(err, {
                extra: context
            });
        }
    }

    /**
     * Inicializa o monitoramento de taxa de quadros (FPS) no Canvas.
     * Reporta via callback silenciosamente. Ignora medições com aba em background.
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
            // Skip measurement when tab is hidden (browser throttles rAF to 0)
            if (document.hidden) {
                frameCount = 0;
                lastTime = performance.now();
                return;
            }

            const now = performance.now();
            const delta = now - lastTime;
            if (delta < 100) return; // Guard against tiny deltas

            const fps = Math.round((frameCount * 1000) / delta);
            
            frameCount = 0;
            lastTime = now;

            if (onFpsUpdate) {
                onFpsUpdate(fps);
            }

            // Only warn on sustained low FPS (not transient spikes)
            if (fps > 0 && fps < 25) {
                const msg = `Desempenho degradado detectado: ${fps} FPS.`;
                console.warn(`[Telemetry] ${msg}`);
                if (this.sentryLoaded && window.Sentry) {
                    window.Sentry.captureMessage(msg, 'warning');
                }
            }
        }, 10000); // Poll every 10 seconds instead of 3
    }

    /**
     * Inicializa o monitoramento de latência do WebSocket (Ping-Pong)
     */
    static initLatencyMonitor(socket, onLatencyUpdate = null) {
        if (!socket) return;
        if (this.latencyInterval) clearInterval(this.latencyInterval);

        // Define a escuta para o retorno de ping
        socket.on('pong_perf', (sentTimestamp) => {
            const latency = Date.now() - sentTimestamp;
            console.log(`[Telemetry] Latência WebSocket: ${latency}ms`);
            
            if (onLatencyUpdate) {
                onLatencyUpdate(latency);
            }

            if (latency > 500) {
                const msg = `Latência de rede elevada: ${latency}ms`;
                console.warn(`[Telemetry] ${msg}`);
                if (this.sentryLoaded && window.Sentry) {
                    window.Sentry.captureMessage(msg, 'warning');
                }
            }
        });

        // Envia ping periódico a cada 5 segundos
        this.latencyInterval = setInterval(() => {
            if (socket.connected) {
                socket.emit('ping_perf', Date.now());
            }
        }, 5000);
    }
}
