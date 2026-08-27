import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { CRDTManager } from '../core/CRDTManager.js';
export function TomeSinalPanel() {
const storeState = useStore();
const players = storeState?.players || [];
const [activeTable, setActiveTable] = useState(() => localStorage.getItem('DM_ACTIVE_TABLE') || 'Mesa-01');
const [sessionActive, setSessionActive] = useState(false);
const [characterTokens, setCharacterTokens] = useState([]);
const [selectedCharId, setSelectedCharId] = useState(null);
const [messages, setMessages] = useState({});
const messagesRef = useRef({});
const chatHistoryRef = useRef(null);
const presenceRef = useRef({ sessionActive, characterTokens });
useEffect(() => {
presenceRef.current = { sessionActive, characterTokens };
}, [sessionActive, characterTokens]);
useEffect(() => {
if (!window.QRious) {
const script = document.createElement('script');
script.src = './ui/utils/vendor/qr-encoder.js';
document.head.appendChild(script);
}
const initSession = async () => {
try {
const res = await fetch(`/api/sessao/${activeTable}/tokens`);
const data = await res.json();
if (data.status === 'active' && data.tokens && data.tokens.length > 0) {
setSessionActive(true);
setCharacterTokens(data.tokens);
setSelectedCharId(data.tokens[0]?.characterId);
}
} catch(e) {
console.error('Failed to fetch active tokens:', e);
}
};
initSession();
CRDTManager.connect(activeTable, 'Mestre');
const handleChatChange = () => {
const newMessages = {};
const arr = CRDTManager.chatHistory.toArray();
arr.forEach(msg => {
const charId = msg.de === 'mestre' ? msg.para : msg.de;
if (charId) {
if (!newMessages[charId]) newMessages[charId] = [];
newMessages[charId].push(msg);
}
});
setMessages(newMessages);
messagesRef.current = newMessages;
setTimeout(() => {
if (chatHistoryRef.current) {
chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
}
}, 50);
};
CRDTManager.chatHistory.observe(handleChatChange);
handleChatChange();
const syncPresence = () => {
const { sessionActive, characterTokens } = presenceRef.current;
if (!sessionActive) return;
let onlineIds = [];
const now = Date.now();
if (CRDTManager.provider && CRDTManager.provider.awareness) {
const states = Array.from(CRDTManager.provider.awareness.getStates().values());
onlineIds = states.map(s => s.user?.charId).filter(Boolean);
}
characterTokens.forEach(char => {
if (char.lastSocketPing && (now - char.lastSocketPing < 15000)) {
if (!onlineIds.includes(char.characterId)) {
onlineIds.push(char.characterId);
}
}
});
setCharacterTokens(prev => {
let changed = false;
const next = prev.map(char => {
const isConnected = onlineIds.includes(char.characterId);
if (char.connected !== isConnected) {
changed = true;
return { ...char, connected: isConnected };
}
return char;
});
return changed ? next : prev;
});
};
if (CRDTManager.provider && CRDTManager.provider.awareness) {
CRDTManager.provider.awareness.on('change', syncPresence);
}
const socketPresenceHandler = (data) => {
if (!data || !data.charId) return;
setCharacterTokens(prev => {
const next = prev.map(char => {
if (char.characterId === data.charId) {
return { ...char, lastSocketPing: Date.now() };
}
return char;
});
return next;
});
syncPresence();
};
if (window.TOME && window.TOME.socket) {
window.TOME.socket.on('player_presence', socketPresenceHandler);
}
const presenceInterval = setInterval(syncPresence, 5000);
return () => {
clearInterval(presenceInterval);
CRDTManager.disconnect();
if (window.TOME && window.TOME.socket) {
window.TOME.socket.off('player_presence', socketPresenceHandler);
}
};
}, [activeTable]);
const iniciarSessao = async () => {
if (players.length === 0) {
alert("Nenhum personagem registrado na mesa.");
return;
}
try {
const response = await fetch('/api/sessao/iniciar', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
tableId: activeTable,
personagens: players
})
});
const data = await response.json();
if (data.status === 'success') {
const tokens = data.tokens.map(t => ({
characterId: t.characterId,
sessionToken: t.sessionToken,
nome: t.nome,
connected: false
}));
setCharacterTokens(tokens);
setSessionActive(true);
setSelectedCharId(tokens[0]?.characterId);
}
} catch (e) {
console.error("Erro ao iniciar sessão", e);
}
};
const encerrarSessao = async () => {
if (!confirm("Tem certeza que deseja encerrar a sessão? Os links dos jogadores serão desativados.")) return;
try {
await fetch('/api/sessao/encerrar', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ tableId: activeTable })
});
setSessionActive(false);
setCharacterTokens([]);
setSelectedCharId(null);
} catch (e) {
console.error("Erro ao encerrar sessão", e);
}
};
const showQRModal = async (charId) => {
const char = characterTokens.find(c => c.characterId === charId);
if (!char) return;
let lanIp = window.location.hostname;
let port = window.location.port || '4000';
try {
const netRes = await fetch('/api/system/network');
const netInfo = await netRes.json();
if (netInfo && netInfo.ip) {
lanIp = netInfo.ip;
port = netInfo.port || port;
}
} catch (e) {
console.warn('Fallback para hostname atual', e);
}
const url = `http://${lanIp}:${port}/jogador/${char.sessionToken}`;
const existing = document.getElementById('qr-modal');
if (existing) existing.remove();
const modal = document.createElement('div');
modal.id = 'qr-modal';
modal.style.cssText = `
position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);
`;
modal.innerHTML = `
<div class="card glass-accent" style="padding: 30px; text-align: center; border-radius: 12px; background: rgba(10,12,16,0.95); box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
<h3 style="font-family:'Cinzel'; color: var(--accent); margin-bottom: 5px;">Acesso de Jogador</h3>
<p style="color: #fff; font-size: 1.2rem; margin-bottom: 20px;"><strong>${char.nome}</strong></p>
<div style="background: #fff; padding: 15px; border-radius: 8px; display: inline-block;">
<canvas id="qr-canvas"></canvas>
</div>
<p style="color: var(--text-dim); font-size: 0.8rem; margin-top: 20px; max-width: 300px; word-break: break-all;">${url}</p>
<button class="btn btn-ghost" style="margin-top: 20px; width: 100%;" onclick="this.closest('#qr-modal').remove()">Fechar</button>
</div>
`;
document.body.appendChild(modal);
setTimeout(() => {
if (window.QRious) {
new window.QRious({
element: document.getElementById('qr-canvas'),
value: url,
size: 250,
background: 'white',
foreground: 'black'
});
} else {
console.error("QRious não carregou a tempo.");
}
}, 100);
};
const sendMessage = (charId, content, type) => {
if (!content || !content.trim()) return;
const msgObj = {
id: Date.now() + Math.random().toString(36).substr(2, 5),
tipo: type,
de: 'mestre',
para: charId,
conteudo: content.trim(),
timestamp: Date.now()
};
CRDTManager.chatHistory.push([msgObj]);
};
const handleInputKeyPress = (e, charId, type) => {
if (e.key === 'Enter') {
sendMessage(charId, e.target.value, type);
e.target.value = '';
}
};
const handleSendClick = (charId) => {
const input = document.getElementById(`msg-input-${charId}`);
const typeSelect = document.getElementById(`msg-type-${charId}`);
if (input && typeSelect) {
sendMessage(charId, input.value, typeSelect.value);
input.value = '';
}
};
const selectedChar = characterTokens.find(c => c.characterId === selectedCharId);
const selectedMsgs = selectedCharId ? (messages[selectedCharId] || []) : [];
return (
<div class="tome-sinal-pane animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-main)', overflow: 'hidden' }}>
<header style={{ background: 'var(--primary-dark)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
<div style={{ width: '45px', height: '45px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', boxShadow: '0 0 15px var(--primary)' }}>
<i class="fa-solid fa-satellite-dish"></i>
</div>
<div>
<h2 style={{ margin: 0, fontFamily: "'Cinzel',serif", color: '#fff', fontSize: '1.5rem' }}>TOME.Sinal v2 — Sincronização por QR</h2>
<span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Módulo V14.2 — Central de Comunicações</span>
</div>
</div>
<div>
{sessionActive
? <button class="btn btn-danger" onClick={encerrarSessao}><i class="fa-solid fa-stop"></i> Encerrar Sessão Atual</button>
: <button class="btn btn-primary" onClick={iniciarSessao}><i class="fa-solid fa-play"></i> Iniciar Sessão de Hoje</button>
}
</div>
</header>
<div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
{}
<div style={{ width: '280px', background: 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(197, 160, 89, 0.2)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
<div style={{ padding: '15px', fontFamily: "'Cinzel'", fontSize: '1.1rem', color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
PERSONAGENS
</div>
<div id="character-list" style={{ display: 'flex', flexDirection: 'column' }}>
{sessionActive ? characterTokens.map(char => {
const isSelected = selectedCharId === char.characterId;
const statusColor = char.connected ? 'var(--success)' : 'var(--danger)';
return (
<div key={char.characterId} onClick={() => setSelectedCharId(char.characterId)} style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s', background: isSelected ? 'rgba(197, 160, 89, 0.15)' : 'transparent', borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
<span style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}></span>
<strong style={{ color: '#fff', fontSize: '0.95rem' }}>{char.nome}</strong>
</div>
</div>
);
}) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>Sessão inativa. Inicie a sessão para gerar QR Codes.</div>}
</div>
</div>
{}
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>
{selectedCharId && selectedChar ? (
<>
{}
<div style={{ padding: '15px 20px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(197, 160, 89, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<div>
<h3 style={{ margin: 0, color: 'var(--accent)', fontFamily: "'Cinzel'" }}><i class="fa-solid fa-shield-halved"></i> Chat: {selectedChar.nome}</h3>
</div>
{!selectedChar.connected
? <button class="btn btn-ghost btn-sm" onClick={() => showQRModal(selectedChar.characterId)}><i class="fa-solid fa-qrcode"></i> Ver QR desta Sessão</button>
: <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}><i class="fa-solid fa-check-circle"></i> Jogador Online</span>
}
</div>
{}
<div id={`chat-history-${selectedChar.characterId}`} ref={chatHistoryRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
{selectedMsgs.length === 0 ? (
<div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.9rem', marginTop: '20px' }}>Nenhuma mensagem neste fio de conversa.</div>
) : selectedMsgs.map(m => {
const isMe = m.de === 'mestre';
const isAlert = m.tipo === 'alerta';
const isDivine = m.tipo === 'voz_divina';
const align = isMe ? 'flex-end' : 'flex-start';
let bg = isMe ? 'rgba(102,252,241,0.1)' : 'rgba(255,255,255,0.1)';
if (isAlert) bg = 'rgba(239, 68, 68, 0.2)';
if (isDivine) bg = 'rgba(255, 215, 0, 0.15)';
let border = isMe ? 'borderRight: 3px solid var(--primary)' : 'borderLeft: 3px solid var(--secondary)';
if (isDivine) border = 'borderRight: 3px solid gold';
let typeLabel = isMe ? 'Mestre' : 'Jogador';
if (isDivine) typeLabel = 'Voz Divina';
return (
<div key={m.id || m.timestamp} style={{ alignSelf: align, background: bg, ...(isMe || isDivine ? { borderRight: isDivine ? '3px solid gold' : '3px solid var(--primary)' } : { borderLeft: '3px solid var(--secondary)' }), padding: '10px 15px', borderRadius: '8px', maxWidth: '80%', animation: 'fadeIn 0.3s ease' }}>
<div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '5px' }}>
{isMe ? typeLabel : <><i class="fa-solid fa-user"></i> {m.nome || m.de}</>}
</div>
<div style={{ ...(isAlert ? { color: '#ef4444', fontWeight: 'bold' } : {}), ...(isDivine ? { color: 'gold', fontStyle: 'italic' } : {}) }}>{m.conteudo}</div>
</div>
);
})}
</div>
{}
<div style={{ padding: '15px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
<div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
<select id={`msg-type-${selectedChar.characterId}`} class="input" style={{ width: '180px' }}>
<option value="sussurro">Sussurro (Privado)</option>
<option value="voz_divina">Voz Divina</option>
<option value="alerta">Alerta (Vibração)</option>
</select>
</div>
<div style={{ display: 'flex', gap: '10px' }}>
<input type="text" id={`msg-input-${selectedChar.characterId}`} class="input" style={{ flex: 1, fontSize: '1rem', padding: '12px' }} placeholder={`Mensagem para ${selectedChar.nome}...`} onKeyPress={(e) => handleInputKeyPress(e, selectedChar.characterId, document.getElementById(`msg-type-${selectedChar.characterId}`).value)} />
<button class="btn btn-primary" onClick={() => handleSendClick(selectedChar.characterId)} style={{ padding: '0 25px' }}><i class="fa-solid fa-paper-plane"></i> Enviar</button>
</div>
</div>
</>
) : (
<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: "'Cinzel',serif", fontSize: '1.2rem' }}>Selecione um personagem ao lado para abrir o chat privado.</div>
)}
</div>
</div>
</div>
);
}