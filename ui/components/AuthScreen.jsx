import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { PersistenceService } from '../../services/PersistenceService.js';
import { injectStyles } from './AuthScreenStyles.jsx';

export function AuthScreenComponent({ closeAuthScreen, initialOnLogin }) {
    const [step, setStep] = useState('login'); // 'login', 'register', 'tables', 'session_choice', 'forgot_password'
    const [phone, setPhone] = useState('');
    const [masterName, setMasterName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
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
            setStep('login');
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

    const handleLogin = async () => {
        const val = phone.replace(/\D/g, '');
        if (val.length < 10) {
            showError('Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>.');
            return;
        }
        if (!password) {
            showError('Por favor, insira sua senha.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: val, password })
            });
            const resData = await response.json();
            
            if (response.ok && resData.status === 'success') {
                localStorage.setItem('DM_JWT_TOKEN', resData.token);
                localStorage.setItem('DM_SESSION_ID', 'DM-' + btoa(phone + Date.now()).substring(0, 16));
                localStorage.setItem('DM_SESSION_START', Date.now().toString());
                localStorage.setItem('DM_PHONE', phone);
                localStorage.setItem('DM_MASTER_NAME', resData.master.name);
                localStorage.setItem('DM_MASTER_ID', resData.master.masterId);
                localStorage.setItem('DM_INTERNAL_ID', resData.master.internalId);
                setMasterName(resData.master.name);
                setStep('tables');
            } else {
                showError(resData.message || 'Erro ao efetuar login.');
            }
        } catch (e) {
            console.error('[AuthScreen] Erro no login:', e);
            showError('Falha de conexão ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async () => {
        const val = phone.replace(/\D/g, '');
        if (val.length < 10) {
            showError('Insira seu telefone com <strong>DDD + 9 dígitos</strong> para acesso direto.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/quick-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: val })
            });
            const resData = await response.json();
            
            if (response.ok && resData.status === 'success') {
                localStorage.setItem('DM_JWT_TOKEN', resData.token);
                localStorage.setItem('DM_SESSION_ID', 'DM-' + btoa(val + Date.now()).substring(0, 16));
                localStorage.setItem('DM_SESSION_START', Date.now().toString());
                localStorage.setItem('DM_PHONE', phone);
                localStorage.setItem('DM_MASTER_NAME', resData.master.name);
                localStorage.setItem('DM_MASTER_ID', resData.master.masterId);
                localStorage.setItem('DM_INTERNAL_ID', resData.master.internalId);
                setMasterName(resData.master.name);
                setStep('tables');
            } else {
                showError(resData.message || 'Mestre não encontrado. Crie sua conta de Mestre abaixo.');
            }
        } catch (e) {
            console.error('[AuthScreen] Erro no acesso rápido:', e);
            showError('Falha de conexão ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const val = phone.replace(/\D/g, '');
        if (val.length < 10) {
            showError('Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            showError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showError('As senhas digitadas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: val, newPassword })
            });
            const resData = await response.json();

            if (response.ok && resData.status === 'success') {
                localStorage.setItem('DM_JWT_TOKEN', resData.token);
                localStorage.setItem('DM_SESSION_ID', 'DM-' + btoa(val + Date.now()).substring(0, 16));
                localStorage.setItem('DM_SESSION_START', Date.now().toString());
                localStorage.setItem('DM_PHONE', phone);
                localStorage.setItem('DM_MASTER_NAME', resData.master.name);
                localStorage.setItem('DM_MASTER_ID', resData.master.masterId);
                localStorage.setItem('DM_INTERNAL_ID', resData.master.internalId);
                setMasterName(resData.master.name);
                showError('Senha redefinida com sucesso! Entrando...', true);
                setTimeout(() => setStep('tables'), 1000);
            } else {
                showError(resData.message || 'Erro ao redefinir senha.');
            }
        } catch (e) {
            console.error('[AuthScreen] Erro no reset de senha:', e);
            showError('Falha de conexão ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!masterName || !masterName.trim()) {
            showError('Por favor, insira seu <strong>nome de Mestre</strong>.');
            return;
        }
        const val = phone.replace(/\D/g, '');
        if (val.length < 10) {
            showError('Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>.');
            return;
        }
        if (!password || password.length < 6) {
            showError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: masterName, phone: val, password })
            });
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
                showError(resData.message || 'Erro ao efetuar cadastro.');
            }
        } catch (e) {
            console.error('[AuthScreen] Erro no registro:', e);
            showError('Falha de conexão ao servidor.');
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
                if (!localStorage.getItem('DM_JWT_TOKEN')) {
                    localStorage.setItem('DM_JWT_TOKEN', 'local_lan_token_' + Date.now());
                }
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
            if (!localStorage.getItem('DM_JWT_TOKEN')) {
                localStorage.setItem('DM_JWT_TOKEN', 'local_lan_token_' + Date.now());
            }
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
        localStorage.removeItem('DM_JWT_TOKEN');
        setStep('login');
        setPhone('');
        setPassword('');
        setMasterName('');
    };

    const handleContinueSession = () => {
        localStorage.setItem('DM_ACTIVE_TABLE', selectedTableId);
        localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${selectedTableId}.json`);
        if (!localStorage.getItem('DM_JWT_TOKEN')) {
            localStorage.setItem('DM_JWT_TOKEN', 'local_lan_token_' + Date.now());
        }
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
            if (!localStorage.getItem('DM_JWT_TOKEN')) {
                localStorage.setItem('DM_JWT_TOKEN', 'local_lan_token_' + Date.now());
            }
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

    // Render components
    const renderLoginStep = () => (
        <>
            <p className="auth-description">Entre com seu telefone e senha para acessar o Grimório.</p>
            <input type="tel" id="auth-phone-login" className="auth-input mb-3" placeholder="(11) 99999-9999" value={phone} onInput={(e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.slice(0, 11);
                if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
                setPhone(v);
            }} onKeyDown={(e) => e.key === "Enter" && document.getElementById("auth-pass-login")?.focus()} />
            
            <input type="password" id="auth-pass-login" className="auth-input" placeholder="Sua Senha" value={password} onInput={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            
            <button className="auth-btn mt-4" onClick={handleLogin} disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Entrando...</> : "Entrar com Senha"}
            </button>

            <button className="auth-btn mt-2.5 bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600 hover:to-amber-800 border border-amber-500/40 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer" onClick={handleQuickLogin} disabled={loading} title="Acessar diretamente apenas com seu telefone (Modo Clássico)">
                <i className="fa-solid fa-bolt text-yellow-400"></i> Acesso Rápido com Telefone
            </button>

            <div className="flex justify-between items-center w-full mt-4 text-xs px-1">
                <button className="auth-back-link text-slate-400 hover:text-amber-400 cursor-pointer bg-transparent border-none p-0" onClick={() => { setStep('forgot_password'); setInlineError(null); }}>
                    <i className="fa-solid fa-key mr-1"></i> Esqueci a Senha
                </button>
                <button className="auth-back-link text-amber-400 hover:underline cursor-pointer bg-transparent border-none p-0" onClick={() => { setStep('register'); setPassword(''); setInlineError(null); }}>
                    Novo Mestre? Criar Conta
                </button>
            </div>
        </>
    );

    const renderForgotPasswordStep = () => (
        <>
            <p className="auth-description">Redefina sua senha informando seu telefone cadastrado.</p>
            <input type="tel" id="auth-phone-reset" className="auth-input mb-3" placeholder="(11) 99999-9999" value={phone} onInput={(e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.slice(0, 11);
                if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
                setPhone(v);
            }} onKeyDown={(e) => e.key === "Enter" && document.getElementById("auth-pass-new")?.focus()} />
            
            <input type="password" id="auth-pass-new" className="auth-input mb-3" placeholder="Nova Senha (mín. 6 caracteres)" value={newPassword} onInput={(e) => setNewPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && document.getElementById("auth-pass-confirm")?.focus()} />
            
            <input type="password" id="auth-pass-confirm" className="auth-input" placeholder="Confirmar Nova Senha" value={confirmPassword} onInput={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleResetPassword()} />
            
            <button className="auth-btn mt-4 bg-gradient-to-r from-amber-600 to-amber-800 cursor-pointer" onClick={handleResetPassword} disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Redefinindo...</> : <><i className="fa-solid fa-unlock mr-1.5"></i> Redefinir Senha & Entrar</>}
            </button>
            <button className="auth-back-link mt-4 bg-transparent border-none text-slate-400 hover:text-white cursor-pointer" onClick={() => { setStep('login'); setInlineError(null); }}>
                <i className="fa-solid fa-arrow-left mr-1"></i> Voltar para o Login
            </button>
        </>
    );

    const renderRegisterStep = () => (
        <>
            <p className="auth-description">Crie sua conta para salvar suas aventuras na nuvem.</p>
            <input type="text" className="auth-input mb-3 font-outfit" placeholder="Nome do Mestre" value={masterName} onInput={(e) => setMasterName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && document.getElementById("auth-phone-reg")?.focus()} />
            
            <input type="tel" id="auth-phone-reg" className="auth-input mb-3" placeholder="(11) 99999-9999" value={phone} onInput={(e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.slice(0, 11);
                if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
                if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
                setPhone(v);
            }} onKeyDown={(e) => e.key === "Enter" && document.getElementById("auth-pass-reg")?.focus()} />
            
            <input type="password" id="auth-pass-reg" className="auth-input" placeholder="Crie uma Senha (mín. 6 chars)" value={password} onInput={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRegister()} />

            <button className="auth-btn mt-4 bg-gradient-to-br from-green-600 to-green-800" onClick={handleRegister} disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Cadastrando...</> : "Criar Conta"}
            </button>
            <button className="auth-back-link mt-4" onClick={() => { setStep('login'); setPassword(''); }}>Já tem conta? Entrar</button>
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
    } else if (step === 'forgot_password') {
        titleHtml = (
            <>
                <h2 className="auth-title">Recuperação de Acesso</h2>
                <p className="auth-subtitle">Redefina sua Senha de <span className="text-amber-500 font-extrabold">Mestre</span></p>
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

            {step === 'login' && renderLoginStep()}
            {step === 'register' && renderRegisterStep()}
            {step === 'forgot_password' && renderForgotPasswordStep()}
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
