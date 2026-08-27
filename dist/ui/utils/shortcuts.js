import { AIService } from '../../services/AIService.js';
export function initGlobalShortcuts(store) {
const ai = new AIService();
window.addEventListener('keydown', async (e) => {
const targetTag = e.target.tagName?.toLowerCase();
if (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable) {
return;
}
const key = e.key.toLowerCase();
if (key === 't' && e.shiftKey) {
e.preventDefault();
const activeId = store.state?.battle?.activeEntityId;
if (activeId) {
if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', 'IA tática analisando alvo...');
const advice = await ai.ask(`Forneça 1 tática de combate brutal em 1 linha para a entidade ID ${activeId}`);
if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', `🎲 **Conselho Tático:** ${advice}`);
} else {
if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', 'Nenhuma criatura ativa no tracker.');
}
return;
}
if (key === 'o' && e.shiftKey) {
e.preventDefault();
const query = prompt("🔮 Oráculo Arcano: O que desejas consultar?");
if (query) {
if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', `Enviando oração aos deuses por: "${query}"...`);
const answer = await ai.oracleSearch(query, store);
if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', answer);
}
return;
}
if (key === 'd' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
const tray = document.getElementById('dice-tray');
if (tray) {
tray.classList.toggle('active');
e.preventDefault();
}
}
else if (key === 'w' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
store.update(s => s.activeTab = 'workspace');
e.preventDefault();
}
else if (key === 'm' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
store.update(s => s.activeTab = 'map');
e.preventDefault();
}
else if (key === 'c' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
store.update(s => s.activeTab = 'combat');
e.preventDefault();
}
else if (key === 'b' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
store.update(s => s.activeTab = 'bestiary');
e.preventDefault();
}
});
}