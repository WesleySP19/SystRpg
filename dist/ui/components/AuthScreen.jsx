import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { PersistenceService } from '../../services/PersistenceService.js';
import { injectStyles } from './AuthScreenStyles.js';
function AuthScreenComponent({ closeAuthScreen, initialOnLogin }) {
const [step, setStep] = useState('phone');
const [phone, setPhone] = useState('');
const [masterName, setMasterName] = useState('');
const [code, setCode] = useState('');
const [generatedCode, setGeneratedCode] = useState('');
const [tables, setTables] = useState([]);
const [loading, setLoading] = useState(false);
const [selectedTableId, setSelectedTableId] = useState(null);
const [selectedTableData, setSelectedTableData] = useState(null);
const [inlineError, setInlineError] = useState(null);
useEffect(() => {
const sessionId = localStorage.getItem('DM_SESSION_ID');
const savedPhone = localStorage.getItem('DM_PHONE');
const savedMasterName = localStorage.getItem('DM_MASTER_NAME');
if (sessionId && savedPhone && savedMasterName) {
setStep('tables');
setPhone(savedPhone);
setMasterName(savedMasterName);
} else {
setStep('phone');
}
}, []);
useEffect(() => {
if (step === 'tables') {
loadTables();
}
}, [step]);
const showError = (message, isSuccess = false) => {
setInlineError({ message, isSuccess });
setTimeout(() => setInlineError(null), 4000);
};
const loadTables = async () => {
setLoading(true);
try {
const list = await PersistenceService.getTablesDirectory();
const normalizedPhone = phone.replace(/\D/g, '');
const mDir = await PersistenceService.getMastersDirectory();
const master = mDir.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
const masterTables = master?.tables || [];
setTables(list.filter(t => {
const tPhone = t.mestrePhone ? t.mestrePhone.replace(/\D/g, '') : '';
return tPhone === normalizedPhone || masterTables.includes(t.id);
}));
} catch (e) {
console.error('Falha ao carregar mesas:', e);
setTables([]);
} finally {
setLoading(false);
}
};
const handleSendCode = async () => {
if (!masterName || !masterName.trim()) {
showError('Por favor, insira seu <strong>nome de Mestre</strong> antes de continuar.');
return;
}
const val = phone.replace(/\D/g, '');
if (val.length < 10) {
showError('Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>.');
return;
}
setLoading(true);
try {
const response = await fetch('/api/auth/send-code', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name: masterName, phone: phone })
});
if (!response.ok) throw new Error(`Server status ${response.status}`);
const resData = await response.json();
if (response.ok && resData.status === 'success') {
setGeneratedCode(resData.simulatedCode || '');
setStep('code');
} else {
showError(resData.message || 'Erro ao enviar código SMS.');
}
} catch (e) {
console.warn('[AuthScreen] Endpoint falhou. Usando fallback simulado.', e);
setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
setStep('code');
} finally {
setLoading(false);
}
};
const handleVerifyCode = async () => {
setLoading(true);
try {
const response = await fetch('/api/auth/verify-code', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name: masterName, phone: phone, code: code })
});
if (!response.ok) throw new Error(`Server status ${response.status}`);
const resData = await response.json();
if (response.ok && resData.status === 'success') {
localStorage.setItem('DM_JWT_TOKEN', resData.token);
localStorage.setItem('DM_SESSION_ID', 'DM-' + btoa(phone + Date.now()).substring(0, 16));
localStorage.setItem('DM_SESSION_START', Date.now().toString());
localStorage.setItem('DM_PHONE', phone);
localStorage.setItem('DM_MASTER_NAME', resData.master.name);
localStorage.setItem('DM_MASTER_ID', resData.master.masterId);
localStorage.setItem('DM_INTERNAL_ID', resData.master.internalId);
setStep('tables');
} else {
throw new Error(resData.message || 'Código inválido.');
}
} catch (s) {
console.warn('[AuthScreen] Endpoint falhou. Usando fallback offline.', s);
if (code === generatedCode) {
try {
const t = await PersistenceService.getOrCreateMaster(masterName, phone);
const r = 'DM-' + btoa(phone + Date.now()).substring(0, 16);
localStorage.setItem('DM_SESSION_ID', r);
localStorage.setItem('DM_SESSION_START', Date.now().toString());
localStorage.setItem('DM_PHONE', phone);
localStorage.setItem('DM_MASTER_NAME', t.name);
localStorage.setItem('DM_MASTER_ID', t.masterId);
localStorage.setItem('DM_INTERNAL_ID', t.internalId);
localStorage.setItem('DM_JWT_TOKEN', 'offline_mode');
setStep('tables');
} catch (err) {
showError('Erro ao registrar localmente: ' + err.message);
}
} else {
showError('Código incorreto — verifique o código e tente novamente.');
}
} finally {
setLoading(false);
}
};
const handleEnterTable = async (tableId) => {
setLoading(true);
try {
const response = await fetch(`/data/mesa_${tableId}.json?t=${Date.now()}`);
if (response.ok) {
const state = await response.json();
setSelectedTableId(tableId);
setSelectedTableData(state);
setStep('session_choice');
} else {
localStorage.setItem('DM_ACTIVE_TABLE', tableId);
localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${tableId}.json`);
closeAuthScreen();
}
} catch (e) {
showError('Erro ao carregar mesa: ' + (e.message || 'verifique a conexão'));
} finally {
setLoading(false);
}
};
const handleCreateTable = async () => {
setLoading(true);
try {
const newTable = await PersistenceService.createTable(phone);
localStorage.setItem('DM_ACTIVE_TABLE', newTable.id);
localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${newTable.id}.json`);
closeAuthScreen();
} catch (e) {
showError('Erro ao criar mesa: ' + (e.message || 'falha de rede'));
setLoading(false);
}
};
const handleLinkTable = async () => {
const inputCode = prompt('Digite o ID de 6 dígitos da mesa a ser vinculada:');
if (!inputCode || !inputCode.trim()) return;
const tableId = inputCode.trim();
if (!/^\d{6}$/.test(tableId)) {
alert('O ID da mesa deve ter exatamente 6 números.');
return;
}
setLoading(true);
try {
const linkedTable = await PersistenceService.linkTable(tableId, phone);
localStorage.setItem('DM_ACTIVE_TABLE', linkedTable.id);
localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${linkedTable.id}.json`);
showError(`Mesa #${linkedTable.id} vinculada com sucesso! Carregando...`, true);
setTimeout(() => closeAuthScreen(), 1200);
} catch (e) {
showError('Mesa não encontrada — verifique o ID de 6 dígitos e tente novamente.');
setLoading(false);
}
};
const handleLogout = () => {
localStorage.removeItem('DM_SESSION_ID');
localStorage.removeItem('DM_SESSION_START');
localStorage.removeItem('DM_ACTIVE_TABLE');
localStorage.removeItem('DM_PHONE');
localStorage.removeItem('DM_MASTER_NAME');
localStorage.removeItem('DM_MASTER_ID');
localStorage.removeItem('DM_INTERNAL_ID');
localStorage.removeItem('TOME_ACTIVE_SESSION');
setStep('phone');
setPhone('');
setMasterName('');
};
const handleContinueSession = () => {
localStorage.setItem('DM_ACTIVE_TABLE', selectedTableId);
localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${selectedTableId}.json`);
closeAuthScreen();
};
const handleNewSession = async () => {
const nextSessionNum = (selectedTableData?.sessionNumber || 1) + 1;
if (!confirm('Deseja iniciar um novo capitulo? Os dados da sessao atual serao arquivados no diario e uma nova sessao limpa sera iniciada para os mesmos herois.')) {
return;
}
setLoading(true);
try {
await PersistenceService.startNewSession(selectedTableId);
localStorage.setItem('DM_ACTIVE_TABLE', selectedTableId);
localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${selectedTableId}.json`);
closeAuthScreen();
} catch (e) {
alert('Erro ao iniciar nova sessao: ' + e.message);
setLoading(false);
}
};
const copyToClipboard = (val, e) => {
navigator.clipboard.writeText(val).then(() => {
const el = e.currentTarget;
const orig = el.innerHTML;
el.innerHTML = `<i class="fa-solid fa-check" style="color: #22c55e;"></i> Copiado!`;
setTimeout(() => el.innerHTML = orig, 2000);
});
};
const renderPhoneStep = () => (
<>
<p className="auth-description">Digite seu nome de Mestre e número de telefone (com DDD) para confirmar sua identidade arcanamente.</p>
<input type="text" className="auth-input mb-3 font-outfit" placeholder="Nome do Mestre" value={masterName} onInput={(e) => setMasterName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && document.getElementById("auth-phone")?.focus()} />
<input type="tel" id="auth-phone" className="auth-input" placeholder="(11) 99999-9999" value={phone} onInput={(e) => {
let v = e.target.value.replace(/\D/g, '');
if (v.length > 11) v = v.slice(0, 11);
if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
setPhone(v);
}} onKeyDown={(e) => e.key === "Enter" && handleSendCode()} />
<button className="auth-btn" onClick={handleSendCode} disabled={loading}>
{loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Enviando...</> : "Enviar Código SMS"}
</button>
</>
);
const renderCodeStep = () => (
<>
<p className="auth-description">Enviamos um SMS para <strong className="text-tomeGold">{phone}</strong>. Digite o código de 6 dígitos abaixo.</p>
<div className="auth-sim-box">
<i className="fa-solid fa-tower-broadcast"></i>
<span>SIMULAÇÃO: Seu código é:</span>
<span className="auth-sim-code">{generatedCode}</span>
</div>
<input type="text" className="auth-input text-[1.4rem] tracking-[8px]" placeholder="000000" maxLength="6" value={code} onInput={(e) => setCode(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()} />
<button className="auth-btn" onClick={handleVerifyCode} disabled={loading}>
{loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Autenticando...</> : "Confirmar e Logar"}
</button>
<button className="auth-back-link" onClick={() => setStep('phone')}>Voltar</button>
</>
);
const renderTablesStep = () => {
if (loading) {
return (
<div className="py-10 flex flex-col items-center justify-center gap-4">
<i className="fa-solid fa-spinner fa-spin text-[2.5rem] text-tomeGold"></i>
<p className="text-slate-400 text-[0.9rem] tracking-wide">Invocando o Grimório de Mesas...</p>
</div>
);
}
return (
<>
{tables.length === 0 ? (
<div className="p-6 rounded-xl bg-white/5 border border-dashed border-tomeGold/20 mb-6 box-border">
<i className="fa-solid fa-folder-open text-3xl text-slate-400 mb-2.5 block"></i>
<p className="text-slate-400 text-[0.85rem] leading-relaxed m-0">Você ainda não possui mesas ativas.<br />Crie uma nova mesa ou vincule uma existente abaixo.</p>
</div>
) : (
<div className="tables-scroll-container">
{tables.map(t => (
<div key={t.id} className="table-card">
<div className="table-card-header">
<span className="table-card-id"><i className="fa-solid fa-dungeon"></i> MESA #{t.id}</span>
<span className="table-card-date">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
</div>
<div className="table-card-body">
<div className="table-stat-badge session-badge">
<i className="fa-solid fa-hourglass-half"></i> {t.sessionNum}ª Sessão
</div>
<div className="table-stat-badge hero-badge">
<i className="fa-solid fa-shield-halved"></i> {t.heroesCount} {t.heroesCount === 1 ? 'Herói' : 'Heróis'}
</div>
</div>
<button className="table-enter-btn" onClick={() => handleEnterTable(t.id)}>Carregar Mesa <i className="fa-solid fa-chevron-right"></i></button>
</div>
))}
</div>
)}
<div className="grid grid-cols-2 gap-3 mt-4">
<button className="auth-btn-secondary" onClick={handleCreateTable} disabled={loading}><i className="fa-solid fa-plus"></i> Nova Mesa</button>
<button className="auth-btn-secondary" onClick={handleLinkTable} disabled={loading}><i className="fa-solid fa-link"></i> Vincular ID</button>
</div>
<button className="auth-back-link mt-6" onClick={handleLogout}><i className="fa-solid fa-sign-out-alt"></i> Sair da Conta</button>
</>
);
};
const renderSessionChoiceStep = () => {
const state = selectedTableData || {};
const sessionNum = state.sessionNumber || 1;
const heroesCount = (state.players || []).length;
const lastTitle = state.sessionTitle || 'Sem Título';
return (
<>
<p className="auth-description text-center mb-5 text-[0.95rem] font-outfit">
Mesa <strong className="text-tomeGold">#{selectedTableId}</strong> selecionada.<br />
<span className="text-[0.85rem] text-slate-400">Sessão Atual: <strong className="text-tomeGold">{sessionNum}ª Sessão</strong> ({lastTitle})</span><br />
<span className="text-[0.85rem] text-slate-400">Heróis no Grimório: <strong>{heroesCount}</strong></span>
</p>
<div className="flex flex-col gap-3.5 mb-5">
<button className="auth-btn bg-gradient-to-br from-slate-800 to-slate-900 border border-tomeGold/40 text-left p-4 flex flex-col gap-1 h-auto rounded-xl cursor-pointer leading-tight" onClick={handleContinueSession}>
<span className="font-cinzel font-extrabold text-base text-white"><i className="fa-solid fa-play text-green-500 mr-2"></i> Continuar Sessão Atual</span>
<span className="text-xs text-slate-400 font-normal ml-6 whitespace-normal">Continua exatamente de onde parou (combates, notas e logs ativos).</span>
</button>
<button className="auth-btn bg-gradient-to-br from-red-900 to-red-800 border border-yellow-400 text-left p-4 flex flex-col gap-1 h-auto rounded-xl cursor-pointer leading-tight" onClick={handleNewSession} disabled={loading}>
{loading ? <span className="font-cinzel font-extrabold text-base text-white"><i className="fa-solid fa-spinner fa-spin text-yellow-400 mr-2"></i> Arquivando...</span> : <span className="font-cinzel font-extrabold text-base text-white"><i className="fa-solid fa-forward text-yellow-400 mr-2"></i> Iniciar Nova Sessão (Capítulo {sessionNum + 1})</span>}
<span className="text-xs text-red-300 font-normal ml-6 whitespace-normal">Preserva os Heróis (fichas, itens e XP) e cria um novo capítulo limpo arquivando o anterior.</span>
</button>
</div>
<button className="auth-back-link bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setStep('tables')}><i className="fa-solid fa-chevron-left"></i> Voltar para as Mesas</button>
</>
);
};
const internalId = localStorage.getItem('DM_INTERNAL_ID') || 'DGH-MST-XXXXXX';
const mName = localStorage.getItem('DM_MASTER_NAME') || masterName || 'Mestre';
let titleHtml;
if (step === 'tables' || step === 'session_choice') {
titleHtml = (
<>
<h2 className="auth-title text-[1.6rem] tracking-wide">Saudações, {mName}</h2>
<p className="auth-subtitle mb-6">Sessão de Hoje: <span className="text-[0.9rem]">{new Date().toLocaleDateString('pt-BR')}</span></p>
</>
);
} else {
titleHtml = (
<>
<h2 className="auth-title">Mesa do Mestre</h2>
<p className="auth-subtitle">Acesso Restrito ao <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] font-extrabold">Mestre</span></p>
</>
);
}
let logoHtml;
if ((step === 'tables' || step === 'session_choice') && internalId) {
let displayId = internalId;
let idLabel = "ID Mestre";
let copyValue = internalId;
if (step === 'session_choice' && selectedTableId) {
displayId = selectedTableId;
idLabel = "ID Mesa";
copyValue = selectedTableId;
}
logoHtml = (
<div className="auth-logo-container">
<img src="assets/logo.png" alt="Logo" className="auth-logo" />
<div className="auth-logo-balloon" onClick={(e) => copyToClipboard(copyValue, e)} title="Clique para copiar">
{idLabel}: {displayId} <i className="fa-regular fa-copy ml-1.5 opacity-80"></i>
</div>
</div>
);
} else {
logoHtml = (
<div className="auth-logo-container">
<img src="assets/logo.png" alt="Logo" className="auth-logo" />
<div className="auth-logo-balloon">
Sua aventura começa aqui! 🧙‍♂️✨<br /><span className="text-[0.7rem] text-[#888]">By Programador</span>
</div>
</div>
);
}
return (
<div className="auth-card">
{logoHtml}
{titleHtml}
{inlineError && (
<div className={`auth-error-banner ${inlineError.isSuccess ? 'auth-error-success' : ''}`}>
<span className="auth-error-icon">{inlineError.isSuccess ? '✅' : '⚠️'}</span>
<span dangerouslySetInnerHTML={{__html: inlineError.message}}></span>
</div>
)}
{step === 'phone' && renderPhoneStep()}
{step === 'code' && renderCodeStep()}
{step === 'tables' && renderTablesStep()}
{step === 'session_choice' && renderSessionChoiceStep()}
</div>
);
}
export class AuthScreen {
constructor({ onLogin }) {
this.onLogin = onLogin;
}
mount() {
this.container = document.createElement('div');
this.container.id = 'auth-screen';
this.container.className = 'fixed inset-0 bg-[#050508] bg-[radial-gradient(circle_at_center,_#23080d_0%,_#050508_100%)] flex flex-col items-center justify-center z-[999999] font-outfit';
document.body.appendChild(this.container);
injectStyles();
render(<AuthScreenComponent closeAuthScreen={() => this.closeAuthScreen()} initialOnLogin={this.onLogin} />, this.container);
}
closeAuthScreen() {
const card = this.container.querySelector('.auth-card');
if (card) {
card.style.animation = 'authFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
}
this.container.style.transition = 'opacity 0.4s ease';
this.container.style.opacity = '0';
setTimeout(() => {
render(null, this.container);
this.container.remove();
const style = document.getElementById('auth-screen-styles');
if (style) style.remove();
if (this.onLogin) this.onLogin();
}, 400);
}
}