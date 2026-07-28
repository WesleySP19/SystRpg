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

    /**
     * Generic ask(): tenta backend; se falhar, gera fallback heuristico em JSON quando o prompt pede.
     * Usado por NPCHelper e outros geradores.
     */
    async ask(prompt) {
        try {
            const data = await this._fetch('/ai/ask', { prompt });
            if (data && (data.text || data.response)) return data.text || data.response;
        } catch (_) { /* fallback abaixo */ }
        return this._localAsk(prompt);
    }

    _localAsk(prompt) {
        const p = String(prompt || '').toLowerCase();
        // Fallback NPC: detecta pedido de JSON e gera um NPC plausivel.
        if (p.includes('npc') && p.includes('json')) {
            const races = ['Humano','Elfo','Anão','Halfling','Meio-Orc','Tiefling','Draconato'];
            const jobs = ['Taverneiro','Mercador','Guarda','Ferreiro','Sacerdote','Caçador','Escriba'];
            const adjs = ['enigmatico','sereno','irritadiço','melancolico','arrogante','generoso','tímido'];
            const looks = ['cicatriz no rosto','olhos heterocromaticos','barba grisalha','tatuagens tribais','manto puido'];
            const motives = ['proteger a familia','vingar uma traição','encontrar um artefato perdido','quitar uma dívida antiga'];
            const secrets = ['é um espião disfarçado','possui um item amaldiçoado','tem um irmão gemeo criminoso','viu algo que não devia'];
            const pick = arr => arr[Math.floor(Math.random()*arr.length)];
            const npc = {
                name: pick(['Aldric','Mira','Oren','Sela','Bran','Ysolde','Dorin','Kaelen']) + ' ' + pick(['de Pedravale','Sangre-de-Lua','o Velho','Pés-de-Vento','Coração de Aço']),
                race: pick(races),
                job: pick(jobs),
                personality: 'Trato ' + pick(adjs) + ', fala devagar e observa muito.',
                appearance: pick(looks) + ', estatura mediana, vestes simples.',
                motivation: pick(motives) + '.',
                secret: pick(secrets) + '.'
            };
            return JSON.stringify(npc);
        }
        // Fallback narrativo curto.
        return 'O destino sussurra, mas as palavras se perdem na brisa antes que possamos ouvi-las claramente.';
    }
}
