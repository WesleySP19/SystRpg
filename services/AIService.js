/**
 * AI SERVICE v3.0
 * Handles narrative generation and tactical advice.
 * Uses backend proxy for API key security; falls back to local heuristics offline.
 */
export class AIService {
    constructor() {
        this._baseUrl = 'http://localhost:3001/api';
        this._token = 'tome_secure_2026';
        this._timeout = 8000; // 8s timeout
    }

    /**
     * Secure fetch wrapper with timeout and auth.
     */
    async _fetch(endpoint, body) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this._timeout);

        try {
            const res = await fetch(`${this._baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this._token}`
                },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }

    /**
     * Generate a narrative paragraph from combat logs.
     */
    async narrate(logs) {
        try {
            const data = await this._fetch('/ai/narrate', { logs });
            return data.narrative;
        } catch {
            return 'A névoa do destino impede a visão clara do momento...';
        }
    }

    /**
     * Generic AI prompt (used by NPCHelper, WorldBuilder, etc.)
     */
    async ask(prompt) {
        try {
            const data = await this._fetch('/ai/ask', { prompt });
            return data.response;
        } catch {
            throw new Error('AI offline');
        }
    }

    /**
     * Generate a localized rumor based on current campaign state.
     */
    async generateRumor(context) {
        try {
            const data = await this._fetch('/ai/rumor', { context });
            return data.rumor;
        } catch {
            const rumors = [
                "Dizem que as luzes na floresta não são fadas, mas sim olhos de algo antigo...",
                "O taverneiro jura que viu o barão conversando com uma sombra no jardim.",
                "Há uma recompensa para quem encontrar o medalhão perdido da sacerdotisa.",
                "Dizem que o poço da vila está secando por causa de uma maldição.",
                "Um viajante jurou ter visto um dragão de metal sobrevoando as montanhas."
            ];
            return rumors[Math.floor(Math.random() * rumors.length)];
        }
    }

    /**
     * Local fallback: heuristic-based tactics when backend is offline.
     */
    _localTactics(monster) {
        const type = (monster.type || '').toLowerCase();
        const cr = parseFloat(monster.cr || 0);

        if (type.includes('besta'))
            return 'Comportamento Animal: Ataca o alvo mais próximo. Se cair abaixo de 25% HP, tenta fugir.';
        if (type.includes('humanoide'))
            return 'Combate Tático: Flanqueia alvos isolados. Foca em conjuradores. Usa cobertura.';
        if (type.includes('morto-vivo'))
            return 'Incansável: Ataca sem medo até ser destruído. Ignora táticas defensivas.';
        if (type.includes('dragão') || cr > 10)
            return 'Predador de Elite: Usa sopro/área sempre que disponível. Mantém distância voando.';

        return 'Instinto de Combate: Ataca quem estiver mais perto. Troca de alvo se receber golpe crítico.';
    }
}
