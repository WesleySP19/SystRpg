export class AIService {
constructor() {
this._baseUrl = 'http://localhost:3001/api';
this._ollamaUrl = 'http://localhost:11434/api/generate';
this._ollamaModel = 'llama3';
this._token = 'tome_secure_2026';
this._timeout = 8000;
this._worker = null;
this._workerCallbacks = new Map();
if (typeof window !== 'undefined' && window.Worker) {
try {
this._worker = new Worker('/public/workers/aiWorker.js');
this._worker.onmessage = (e) => {
const { id, result, status, error } = e.data;
if (this._workerCallbacks.has(id)) {
const { resolve, reject } = this._workerCallbacks.get(id);
if (status === 'success') resolve(result);
else reject(new Error(error));
this._workerCallbacks.delete(id);
}
};
} catch (err) {
console.warn('[AIService] Não foi possível iniciar AI Worker, operando na main thread.', err);
}
}
}
_runInWorker(type, query, payload = {}) {
if (!this._worker) return null;
return new Promise((resolve, reject) => {
const id = Math.random().toString(36).substring(2);
this._workerCallbacks.set(id, { resolve, reject });
this._worker.postMessage({ id, type, query, payload });
});
}
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
async narrate(logs) {
try {
const data = await this._fetch('/ai/narrate', { logs });
return data.narrative;
} catch {
return 'A névoa do destino impede a visão clara do momento...';
}
}
async generateRumor(context) {
try {
const data = await this._fetch('/ai/rumor', { context });
return data.rumor;
} catch {
const rumors = [
"Dizem que as luzes na floresta não são fadas, mas sim olhos de algo antigo...",
"O taverneiro jura que viu o barão conversando com uma sombra no jardim.",
"Há uma recompensa para quem encontrar o medalhão perdido da sacerdotisa.",
"Dizem que o poço da vila está secando por causa de uma maldição."
];
return rumors[Math.floor(Math.random() * rumors.length)];
}
}
_localTactics(monster) {
const type = (monster.type || '').toLowerCase();
const cr = parseFloat(monster.cr || 0);
if (type.includes('besta')) return 'Comportamento Animal: Ataca o alvo mais próximo. Se cair abaixo de 25% HP, tenta fugir.';
if (type.includes('humanoide')) return 'Combate Tático: Flanqueia alvos isolados. Foca em conjuradores. Usa cobertura.';
if (type.includes('morto-vivo')) return 'Incansável: Ataca sem medo até ser destruído. Ignora táticas defensivas.';
if (type.includes('dragão') || cr > 10) return 'Predador de Elite: Usa sopro/área sempre que disponível. Mantém distância voando.';
return 'Instinto de Combate: Ataca quem estiver mais perto. Troca de alvo se receber golpe crítico.';
}
async ask(prompt, systemContext = '', onChunk = null) {
try {
const data = await this._fetch('/ai/ask', { prompt, context: systemContext });
if (data && (data.text || data.response)) {
const res = data.text || data.response;
if (onChunk) onChunk(res);
return res;
}
} catch (_) {}
try {
const ollamaRes = await this._fetchOllama(prompt, systemContext, onChunk);
if (ollamaRes) return ollamaRes;
} catch (_) {}
const localRes = await this._localAsk(prompt);
if (onChunk) onChunk(localRes);
return localRes;
}
async _fetchOllama(prompt, systemContext, onChunk = null) {
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), onChunk ? 60000 : 6000); // 1 minuto para streams longos
try {
const res = await fetch(this._ollamaUrl, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
model: this._ollamaModel,
prompt: systemContext ? `${systemContext}\n\nPergunta: ${prompt}` : prompt,
stream: !!onChunk,
options: { temperature: 0.7 }
}),
signal: controller.signal
});
clearTimeout(timer);
if (!res.ok) return null;
if (onChunk) {
const reader = res.body.getReader();
const decoder = new TextDecoder();
let fullResponse = '';
while (true) {
const { done, value } = await reader.read();
if (done) break;
const chunk = decoder.decode(value, { stream: true });
const lines = chunk.split('\n').filter(l => l.trim());
for (const line of lines) {
try {
const parsed = JSON.parse(line);
if (parsed.response) {
fullResponse += parsed.response;
onChunk(parsed.response);
}
} catch(e) {}
}
}
return fullResponse.trim();
} else {
const data = await res.json();
return data.response ? data.response.trim() : null;
}
} catch (_) {
clearTimeout(timer);
return null;
}
}
async oracleSearch(query, store, onChunk = null) {
if (!store || !store.state) return "Nenhum arquivo de campanha carregado no Oráculo.";
if (this._worker) {
try {
if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tome:ai_processing', { detail: { active: true } }));
const workerResult = await this._runInWorker('ORACLE_SEARCH', query, { state: store.state });
if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tome:ai_processing', { detail: { active: false } }));
try {
if (onChunk) onChunk(`✨ **Resposta do Oráculo:**\n\n`);
const aiSynthesis = await this._fetchOllama(
`A partir das notas de RPG abaixo, responda concisamente em bom português de fantasia: "${query}"\n\nNotas:\n${workerResult}`,
null,
onChunk
);
if (aiSynthesis) {
const finalNote = `\n\n*Fontes Originais:*\n${workerResult}`;
if (onChunk) onChunk(finalNote);
return `✨ **Resposta do Oráculo:**\n\n${aiSynthesis}${finalNote}`;
}
} catch(_) {}
if (onChunk) onChunk(workerResult);
return workerResult;
} catch (err) {
if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tome:ai_processing', { detail: { active: false } }));
console.warn('[AIService] Falha na delegação do Worker:', err);
}
}
return "O Oráculo não conseguiu invocar os espíritos auxiliares (Worker) a tempo. Conexão nebulosa...";
}
async _localAsk(prompt) {
if (this._worker) {
try {
if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tome:ai_processing', { detail: { active: true } }));
const res = await this._runInWorker('LOCAL_ASK', prompt);
if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tome:ai_processing', { detail: { active: false } }));
return res;
} catch(e) {}
}
return 'O destino sussurra, mas a Main Thread está sobrecarregada demais para ouvir claramente.';
}
}