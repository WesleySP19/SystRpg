self.onmessage = function(e) {
const { id, type, query, payload } = e.data;
try {
if (type === 'ORACLE_SEARCH') {
const result = performOracleSearch(query, payload.state);
self.postMessage({ id, result, status: 'success' });
} else if (type === 'LOCAL_ASK') {
const result = performLocalAsk(query);
self.postMessage({ id, result, status: 'success' });
}
} catch (err) {
self.postMessage({ id, error: err.message, status: 'error' });
}
};
function performOracleSearch(query, state) {
if (!state) return "Nenhum arquivo de campanha carregado no Oráculo.";
const qWords = String(query).toLowerCase().split(' ').filter(w => w.length > 2);
const results = [];
if (Array.isArray(state.npcs)) {
state.npcs.forEach(npc => {
const text = JSON.stringify(npc).toLowerCase();
const hits = qWords.filter(w => text.includes(w)).length;
if (hits > 0 || String(query).toLowerCase().includes('npc')) {
results.push({ type: 'NPC', title: npc.name || npc.nome, content: `${npc.job || 'NP'}, Personalidade: ${npc.personality || 'N/A'}. Segredo/Nota: ${npc.secret || npc.notes || 'Nenhum'}` });
}
});
}
if (Array.isArray(state.sessions)) {
state.sessions.forEach(sec => {
const text = JSON.stringify(sec).toLowerCase();
if (qWords.some(w => text.includes(w)) || String(query).toLowerCase().includes('sessão') || String(query).toLowerCase().includes('resumo')) {
results.push({ type: 'Crônica / Diário', title: sec.title || `Sessão #${sec.number || '?'}`, content: String(sec.notes || sec.summary || sec.content || 'Sem notas').slice(0, 350) });
}
});
}
if (Array.isArray(state.quests)) {
state.quests.forEach(q => {
const text = JSON.stringify(q).toLowerCase();
if (qWords.some(w => text.includes(w))) {
results.push({ type: 'Quest / Missão', title: q.title || 'Missão', content: `${q.status || 'Ativa'}: ${q.description || ''}` });
}
});
}
if (results.length === 0) {
return `📜 **Consulta do Oráculo:** Não encontrei registros diretos contendo os termos "${query}" nos pergaminhos desta campanha.\n\n*Dica do Oráculo:* Certifique-se de registrar nomes e notas no Diário de Sessão ou na lista de NPCs.`;
}
let reply = `🔮 **O Oráculo Arcano revelou ${results.length} pergaminhos relevantes para sua consulta:**\n\n`;
results.slice(0, 5).forEach((r, i) => {
reply += `**${i+1}. [${r.type}] ${r.title}**\n> "${r.content}"\n\n`;
});
return reply;
}
function performLocalAsk(prompt) {
const p = String(prompt || '').toLowerCase();
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
return 'O destino sussurra, mas as palavras se perdem na brisa antes que possamos ouvi-las claramente.';
}