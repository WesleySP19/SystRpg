import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { TOME } from '../../../core/Registry.js';
import { Toast } from '../../components/core/Toast.jsx';
export function SessionControl({
onSystemAnalysis,
onStartCampaignForm
}) {
const [sessions, setSessions] = useState([]);
const [timerDisplay, setTimerDisplay] = useState('00:00:00');
const [timerRunning, setTimerRunning] = useState(false);
const [timerLimit, setTimerLimit] = useState(0);
const [activeStatus, setActiveStatus] = useState('Não Iniciada');
const intervalRef = useRef(null);
const getSessionListKey = () => {
const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || '';
return activeTable ? `TOME_SESSION_LIST_${activeTable}` : 'TOME_SESSION_LIST';
};
const getSessionMetaKey = (file) => {
const tableKey = localStorage.getItem('DM_ACTIVE_TABLE') || 'default';
return `TOME_SESSION_META_${tableKey}_${file}`;
};
const getSessionMeta = (file) => {
try {
return JSON.parse(localStorage.getItem(getSessionMetaKey(file)) || '{}');
} catch (_) { return {}; }
};
const saveSessionMeta = (file, data) => {
const existing = getSessionMeta(file);
localStorage.setItem(getSessionMetaKey(file), JSON.stringify({ ...existing, ...data }));
};
const getSessionsList = () => {
let list = [];
try {
list = JSON.parse(localStorage.getItem(getSessionListKey()) || '[]');
} catch (_) {}
if (!list.some(s => s.file === 'state.json')) {
list.unshift({ name: 'Sessão Padrão', file: 'state.json' });
localStorage.setItem(getSessionListKey(), JSON.stringify(list));
}
return list;
};
const formatElapsed = (ms) => {
const totalSec = Math.floor(ms / 1000);
const h = Math.floor(totalSec / 3600);
const m = Math.floor((totalSec % 3600) / 60);
const s = totalSec % 60;
return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};
const updateTimerState = () => {
const file = TOME.persistence?.filename || 'state.json';
const meta = getSessionMeta(file);
const limit = meta.timerLimitMs || 0;
setTimerLimit(limit);
const isRunning = meta.status === 'open' && !!meta.timerStart && !meta.timerPaused;
setTimerRunning(isRunning);
let total = meta.totalElapsed || 0;
if (isRunning) {
total += Date.now() - meta.timerStart;
}
let display = total;
if (limit > 0) {
const remaining = limit - total;
display = remaining > 0 ? remaining : 0;
}
if (total === 0 && !meta.timerStart) {
setTimerDisplay('00:00:00');
} else {
setTimerDisplay(formatElapsed(display));
}
if (isRunning) {
setActiveStatus('Em Andamento');
} else if (meta.status === 'open') {
setActiveStatus('Aberta');
} else if (meta.status === 'closed') {
setActiveStatus('Finalizada');
} else {
setActiveStatus('Não Iniciada');
}
};
useEffect(() => {
setSessions(getSessionsList());
updateTimerState();
return () => stopTickInterval();
}, []);
useEffect(() => {
if (timerRunning) {
startTickInterval();
} else {
stopTickInterval();
}
}, [timerRunning]);
const startTickInterval = () => {
if (intervalRef.current) return;
intervalRef.current = setInterval(() => {
const file = TOME.persistence?.filename || 'state.json';
const meta = getSessionMeta(file);
if (!meta.timerStart || meta.timerPaused) {
stopTickInterval();
return;
}
const total = (meta.totalElapsed || 0) + (Date.now() - meta.timerStart);
const limit = meta.timerLimitMs || 0;
let display = total;
if (limit > 0) {
const remaining = limit - total;
if (remaining <= 0) {
setTimerDisplay('00:00:00');
autoEndAndReport();
return;
}
display = remaining;
} else {
display = total;
}
setTimerDisplay(formatElapsed(display));
}, 1000);
};
const stopTickInterval = () => {
if (intervalRef.current) {
clearInterval(intervalRef.current);
intervalRef.current = null;
}
};
const startSessionTimer = () => {
const file = TOME.persistence?.filename || 'state.json';
const meta = getSessionMeta(file);
if (meta.status === 'closed') {
saveSessionMeta(file, { status: 'open', timerStart: Date.now(), timerPaused: false });
Toast.show('Sessão reaberta e cronômetro reiniciado!', 'success');
} else if (meta.timerPaused) {
saveSessionMeta(file, { timerStart: Date.now(), timerPaused: false });
Toast.show('Cronômetro retomado!', 'success');
} else {
saveSessionMeta(file, { status: 'open', timerStart: Date.now(), timerPaused: false, totalElapsed: meta.totalElapsed || 0 });
Toast.show('Sessão iniciada! Cronômetro rodando.', 'success');
}
updateTimerState();
setSessions(getSessionsList()); // refresh list to show green dot
};
const pauseSessionTimer = () => {
const file = TOME.persistence?.filename || 'state.json';
const meta = getSessionMeta(file);
if (!meta.timerStart) return;
const elapsed = (meta.totalElapsed || 0) + (Date.now() - meta.timerStart);
saveSessionMeta(file, { totalElapsed: elapsed, timerPaused: true, timerStart: null });
Toast.show(`Cronômetro pausado em ${formatElapsed(elapsed)}`, 'warning');
updateTimerState();
setSessions(getSessionsList());
};
const resetSessionTimer = async () => {
if (!confirm('Tem certeza que deseja ZERAR o cronômetro da sessão atual? Isso também executará uma análise completa do sistema e gerará o relatório.')) return;
stopTickInterval();
const file = TOME.persistence?.filename || 'state.json';
saveSessionMeta(file, { totalElapsed: 0, timerStart: null, timerPaused: false });
updateTimerState();
if (onSystemAnalysis) await onSystemAnalysis("Zerar Cronômetro (Reset Manual)");
};
const autoEndAndReport = () => {
stopTickInterval();
const file = TOME.persistence?.filename || 'state.json';
const meta = getSessionMeta(file);
let total = meta.totalElapsed || 0;
if (meta.timerStart && !meta.timerPaused) {
total += Date.now() - meta.timerStart;
}
const endedAt = new Date().toLocaleString('pt-BR');
saveSessionMeta(file, { status: 'closed', totalElapsed: total, timerStart: null, timerPaused: false, endedAt });
TOME.store.update(s => {
s.journalEntries = s.journalEntries || [];
s.journalEntries.push({
type: 'info',
title: 'Sessão Encerrada por Limite',
content: `A sessão atingiu o limite configurado de ${formatElapsed(meta.timerLimitMs)} e foi encerrada automaticamente.`,
timestamp: Date.now()
});
});
updateTimerState();
if (onSystemAnalysis) onSystemAnalysis("Limite de Tempo Atingido (00:00:00)");
};
const createNewSession = () => {
const name = prompt('Digite o nome da nova sessão/campanha:');
if (!name || !name.trim()) return;
const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
const file = `${slug}.json`;
let list = getSessionsList();
if (list.some(s => s.file === file)) {
Toast.show('Uma sessão com este nome já existe!', 'danger');
return;
}
list.push({ name: name.trim(), file });
localStorage.setItem(getSessionListKey(), JSON.stringify(list));
saveSessionMeta(file, {
status: 'open',
totalElapsed: 0,
timerStart: null,
timerPaused: false,
timerLimitMs: 0
});
TOME.persistence.filename = file;
localStorage.setItem('TOME_ACTIVE_SESSION', file);
TOME.store.update(s => {
s.sessionTitle = name.trim();
s.sessionNumber = 1;
s.players = s.players || [];
s.monsters = [];
s.initiativeOrder = [];
s.combatActive = false;
});
TOME.persistence.save().then(() => {
window.location.reload();
});
};
const cloneSession = () => {
const file = TOME.persistence?.filename || 'state.json';
const name = prompt('Digite um nome para a CÓPIA da sessão atual:');
if (!name || !name.trim()) return;
const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
const newFile = `${slug}.json`;
let list = getSessionsList();
if (list.some(s => s.file === newFile)) {
Toast.show('Já existe uma sessão com este nome!', 'danger');
return;
}
list.push({ name: name.trim(), file: newFile });
localStorage.setItem(getSessionListKey(), JSON.stringify(list));
saveSessionMeta(newFile, {
status: 'open',
totalElapsed: 0,
timerStart: null,
timerPaused: false,
timerLimitMs: 0
});
TOME.persistence.filename = newFile;
localStorage.setItem('TOME_ACTIVE_SESSION', newFile);
TOME.store.update(s => {
s.sessionTitle = name.trim();
});
TOME.persistence.save().then(() => {
Toast.show('Sessão clonada com sucesso!', 'success');
window.location.reload();
});
};
const resetCampaignState = () => {
if (!confirm('ATENÇÃO: Deseja zerar TODO o estado atual (Combates, Iniciativa, Monstros)? Heróis serão mantidos.')) return;
TOME.store.update(s => {
s.monsters = [];
s.initiativeOrder = [];
s.combatActive = false;
s.combatRound = 0;
s.concentration = [];
s.tacticalMap = { fog: null, mapUrl: null, tokens: [] };
});
TOME.persistence.save().catch(e => console.warn(e));
Toast.show('Estado limpo. Heróis foram preservados.', 'info');
};
const changeSession = (e) => {
const file = e.target.value;
if (!file) return;
TOME.persistence.filename = file;
localStorage.setItem('TOME_ACTIVE_SESSION', file);
window.location.reload();
};
const renderStatusBadge = () => {
if (activeStatus === 'Em Andamento') {
return <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[1px] px-2 py-1 rounded-full font-cinzel bg-yellow-400/10 border border-yellow-400/50 text-yellow-400"><i className="fa-solid fa-circle text-[0.5rem]"></i> Em Andamento</span>;
} else if (activeStatus === 'Aberta') {
return <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[1px] px-2 py-1 rounded-full font-cinzel bg-green-500/10 border border-green-500/35 text-green-500"><i className="fa-solid fa-door-open text-[0.55rem]"></i> Aberta</span>;
}
return <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-extrabold uppercase tracking-[1px] px-2 py-1 rounded-full font-cinzel bg-slate-500/10 border border-slate-500/30 text-slate-400"><i className="fa-solid fa-check text-[0.55rem]"></i> Finalizada</span>;
};
return (
<div className="card glass-accent p-6 rounded-2xl flex flex-col gap-4 border border-tomeGold/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
<div className="absolute -top-10 -right-10 w-32 h-32 bg-tomeGold/10 rounded-full blur-3xl pointer-events-none"></div>
<div className="font-cinzel text-xs font-extrabold text-tomeGold uppercase tracking-wide border-b border-tomeGold/20 pb-2 flex items-center justify-between">
<div>
<span><i className="fa-solid fa-folder-open mr-1.5"></i> Sessão do Jogo</span>
<button className="btn btn-ghost btn-sm py-0.5 px-1.5 text-[0.6rem] ml-2 rounded" onClick={onStartCampaignForm}>
<i className="fa-solid fa-pen"></i> Editar
</button>
</div>
{renderStatusBadge()}
</div>
<div className="text-[0.65rem] text-slate-400">
Sessão Ativa: <b className="text-tomeGold">{TOME.persistence?.filename || 'state.json'}</b>
</div>
{}
<div className="glass p-4 rounded-xl flex flex-col gap-3">
<div className="flex justify-between items-center w-full">
<div>
<div className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-wide mb-1">Tempo de Sessão</div>
<div className="font-mono text-2xl font-black text-tomeGold tracking-wider leading-none" style={{ textShadow: timerRunning ? '0 0 10px rgba(197,160,89,0.5)' : 'none' }}>
{timerDisplay}
</div>
{timerRunning && (
<div className="text-[0.55rem] text-green-500 mt-1 flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>Em andamento
</div>
)}
</div>
<div className="flex flex-col gap-1.5 w-[130px]">
{activeStatus === 'Finalizada' ? (
<button className="btn btn-success btn-sm w-full font-cinzel text-[0.65rem] font-bold" onClick={startSessionTimer}>
<i className="fa-solid fa-rotate-left mr-1"></i> Reabrir
</button>
) : timerRunning ? (
<button className="btn btn-warning btn-sm w-full font-cinzel text-[0.65rem] font-bold" onClick={pauseSessionTimer}>
<i className="fa-solid fa-pause mr-1"></i> Pausar
</button>
) : activeStatus === 'Aberta' ? (
<button className="btn btn-success btn-sm w-full font-cinzel text-[0.65rem] font-bold" onClick={startSessionTimer}>
<i className="fa-solid fa-play mr-1"></i> Continuar
</button>
) : (
<button className="btn btn-success btn-sm w-full font-cinzel text-[0.65rem] font-bold" onClick={startSessionTimer}>
<i className="fa-solid fa-play mr-1"></i> Iniciar
</button>
)}
<button className="btn btn-danger btn-sm w-full font-cinzel text-[0.65rem] font-bold" onClick={resetSessionTimer} title="Zerar cronômetro e gerar relatório">
<i className="fa-solid fa-flag-checkered mr-1"></i> Zerar
</button>
</div>
</div>
<div className="w-full border-t border-white/5 pt-2">
<label className="block text-[0.55rem] text-slate-500 font-bold uppercase mb-1">Limite de Duração</label>
<select
className="legacy-input w-full"
value={timerLimit}
onChange={(e) => {
const val = parseInt(e.target.value) || 0;
saveSessionMeta(TOME.persistence?.filename || 'state.json', { timerLimitMs: val });
setTimerLimit(val);
updateTimerState();
Toast.show(val > 0 ? `Limite definido.` : 'Duração Livre.', 'info');
}}
>
<option value="0">Livre (Progressivo)</option>
<option value="3600000">1 Hora (Regressivo)</option>
<option value="7200000">2 Horas (Regressivo)</option>
<option value="10800000">3 Horas (Regressivo)</option>
<option value="14400000">4 Horas (Regressivo)</option>
</select>
</div>
</div>
{}
<select className="legacy-input w-full mt-2" value={TOME.persistence?.filename} onChange={changeSession}>
{sessions.map(s => {
const meta = getSessionMeta(s.file);
const isOpen = meta.status === 'open';
const duration = meta.totalElapsed ? ` • ${formatElapsed(meta.totalElapsed)}` : '';
return (
<option key={s.file} value={s.file}>
{isOpen ? '🟢' : '⚫'} {s.name}{duration}
</option>
);
})}
</select>
{}
<div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-0.5 mt-2">
{sessions.map(s => {
const meta = getSessionMeta(s.file);
const isCurrent = TOME.persistence?.filename === s.file;
const isOpen = meta.status === 'open';
const duration = meta.totalElapsed ? formatElapsed(meta.totalElapsed) : '--:--:--';
return (
<div key={s.file} className={`flex items-center justify-between py-2 px-3 rounded-lg text-[0.65rem] border transition-all ${isCurrent ? 'bg-tomeGold/10 border-tomeGold/40' : 'glass hover:bg-white/10 border-transparent'}`}>
<div className="flex items-center gap-1.5 overflow-hidden">
<span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOpen ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-500'}`}></span>
<span className={`whitespace-nowrap overflow-hidden text-ellipsis ${isCurrent ? 'text-tomeGold font-bold' : 'text-slate-400 font-medium'}`}>{s.name}</span>
</div>
<div className="flex items-center gap-1.5 shrink-0">
<span className="font-mono text-slate-600 text-[0.6rem]">{duration}</span>
</div>
</div>
);
})}
</div>
{}
<div className="grid grid-cols-2 gap-2 mt-1">
<button className="btn btn-ghost btn-sm rounded-lg text-[0.7rem] font-bold p-2" onClick={createNewSession}>
<i className="fa-solid fa-plus mr-1"></i> Nova Sessão
</button>
<button className="btn btn-ghost btn-sm rounded-lg text-[0.7rem] font-bold p-2" onClick={cloneSession}>
<i className="fa-solid fa-copy mr-1"></i> Clonar Sessão
</button>
<button className="btn btn-success btn-sm rounded-lg text-[0.7rem] font-bold p-2 col-span-2" onClick={onStartCampaignForm}>
<i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Iniciar Nova Campanha
</button>
<button className="btn btn-danger btn-sm rounded-lg text-[0.7rem] font-bold p-2 col-span-2" onClick={resetCampaignState}>
<i className="fa-solid fa-power-off mr-1"></i> Zerar Estado da Campanha
</button>
</div>
</div>
);
}