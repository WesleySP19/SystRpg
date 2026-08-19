import { PersistenceService } from '../../services/PersistenceService.js';

export class AuthScreen {
    constructor({ onLogin }) {
        this.onLogin = onLogin;
        
        const sessionId = localStorage.getItem('DM_SESSION_ID');
        const phone = localStorage.getItem('DM_PHONE');
        const masterName = localStorage.getItem('DM_MASTER_NAME');
        
        if (sessionId && phone && masterName) {
            this.step = 'tables';
            this.phone = phone;
            this.masterName = masterName;
            this.loadTables();
        } else {
            this.step = 'phone';
            this.phone = '';
            this.masterName = '';
        }
        
        this.code = '';
        this.generatedCode = '';
        this.tables = [];
        this.loading = false;
        this.selectedTableId = null;
        this.selectedTableData = null;
    }

    async loadTables() {
        this.loading = true;
        this.render();
        try {
            const list = await PersistenceService.getTablesDirectory();
            const normalizedPhone = this.phone.replace(/\D/g, '');
            const mDir = await PersistenceService.getMastersDirectory();
            const master = mDir.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
            const masterTables = master?.tables || [];
            
            this.tables = list.filter(t => {
                const tPhone = t.mestrePhone ? t.mestrePhone.replace(/\D/g, '') : '';
                return tPhone === normalizedPhone || masterTables.includes(t.id);
            });
        } catch (e) {
            console.error('Falha ao carregar mesas:', e);
            this.tables = [];
        } finally {
            this.loading = false;
            this.render();
        }
    }

    mount() {
        this.container = document.createElement('div');
        this.container.id = 'auth-screen';
        this.container.style.position = 'fixed';
        this.container.style.inset = '0';
        this.container.style.backgroundColor = '#050508';
        this.container.style.backgroundImage = 'radial-gradient(circle at center, #23080d 0%, #050508 100%)';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.zIndex = '999999';
        this.container.style.fontFamily = "'Outfit', sans-serif";
        document.body.appendChild(this.container);

        // Inject high-end dynamic styles
        this.injectStyles();

        this.render();
    }

    injectStyles() {
        if (document.getElementById('auth-screen-styles')) return;
        const style = document.createElement('style');
        style.id = 'auth-screen-styles';
        style.textContent = `
            @keyframes authFadeIn {
                from { opacity: 0; transform: scale(0.96) translateY(12px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes authFadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.96) translateY(12px); }
            }
            @keyframes floatLogo {
                0% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-6px) rotate(1.5deg); }
                100% { transform: translateY(0px) rotate(0deg); }
            }
            @keyframes eyeGlow {
                0% { box-shadow: 0 0 15px rgba(153, 27, 27, 0.4), 0 0 3px rgba(197, 160, 89, 0.2); border-color: #c5a059; }
                50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.7), 0 0 10px rgba(251, 191, 36, 0.5); border-color: #fbbf24; }
                100% { box-shadow: 0 0 15px rgba(153, 27, 27, 0.4), 0 0 3px rgba(197, 160, 89, 0.2); border-color: #c5a059; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-6px); }
                40%, 80% { transform: translateX(6px); }
            }
            @keyframes spinFast {
                0% { transform: rotate(0deg) scale(1.1); }
                100% { transform: rotate(360deg) scale(1.1); }
            }

            /* ── Inline error banner (B-04) ── */
            .auth-error-banner {
                display: flex;
                align-items: center;
                gap: 10px;
                background: rgba(239, 68, 68, 0.12);
                border: 1px solid rgba(239, 68, 68, 0.4);
                border-left: 3px solid #ef4444;
                border-radius: 10px;
                padding: 12px 15px;
                margin-bottom: 16px;
                font-size: 0.82rem;
                color: #fca5a5;
                text-align: left;
                line-height: 1.4;
                animation: authFadeIn 0.3s ease-out, shake 0.4s ease-out;
                box-sizing: border-box;
            }
            .auth-error-banner.auth-error-success {
                background: rgba(34, 197, 94, 0.1);
                border-color: rgba(34, 197, 94, 0.35);
                border-left-color: #22c55e;
                color: #86efac;
                animation: authFadeIn 0.3s ease-out;
            }
            .auth-error-banner .auth-error-icon {
                font-size: 1.1rem;
                flex-shrink: 0;
            }
            
            .auth-card {
                width: 100%;
                max-width: 420px;
                padding: 40px 30px;
                border-radius: 24px;
                background: rgba(8, 7, 10, 0.85);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(197, 160, 89, 0.25);
                position: relative;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9), 
                            0 0 80px rgba(153, 27, 27, 0.2);
                text-align: center;
                color: #f1f5f9;
                animation: authFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                overflow: visible;
                box-sizing: border-box;
            }

            .auth-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; height: 3px;
                border-radius: 24px 24px 0 0;
                background: linear-gradient(90deg, #991b1b, #c5a059, #991b1b);
                opacity: 0.8;
            }

            .auth-logo-container {
                position: relative;
                display: inline-block;
                margin-bottom: 18px;
            }

            .auth-logo {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #c5a059;
                background-color: #0b090a;
                animation: floatLogo 4.5s ease-in-out infinite, eyeGlow 4s ease-in-out infinite;
                box-shadow: 0 5px 15px rgba(0,0,0,0.6);
                transition: transform 0.2s;
            }
            .auth-logo-container:hover .auth-logo {
                animation: spinFast 0.3s linear infinite, eyeGlow 0.5s ease-in-out infinite;
            }

            .auth-logo-balloon {
                position: absolute;
                bottom: 110%;
                left: 50%;
                transform: translateX(-50%) scale(0.85);
                background: #ffffff;
                color: #0f172a;
                padding: 8px 14px;
                border-radius: 10px;
                font-family: 'Outfit', sans-serif;
                font-size: 0.82rem;
                font-weight: 800;
                white-space: nowrap;
                box-shadow: 0 10px 25px rgba(0,0,0,0.8);
                border: 2px solid #c5a059;
                opacity: 0;
                pointer-events: none;
                cursor: pointer;
                transition: opacity 0.25s ease, transform 0.25s ease;
                z-index: 1000;
                text-align: center;
                line-height: 1.3;
            }
            .auth-logo-balloon::before {
                content: '';
                position: absolute;
                bottom: -9px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 9px 8px 0 8px;
                border-style: solid;
                border-color: #c5a059 transparent transparent transparent;
            }
            .auth-logo-balloon::after {
                content: '';
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 7px 6px 0 6px;
                border-style: solid;
                border-color: #ffffff transparent transparent transparent;
            }
            .auth-logo-container:hover .auth-logo-balloon {
                opacity: 1;
                transform: translateX(-50%) scale(1);
                pointer-events: auto;
            }

            .auth-title {
                font-family: 'Cinzel', serif;
                font-size: 1.8rem;
                font-weight: 900;
                margin: 0 0 3px 0;
                background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 70%, #c5a059 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: 2px;
                text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            }

            .auth-subtitle {
                font-family: 'Outfit', sans-serif;
                color: #94a3b8;
                font-size: 0.8rem;
                margin-bottom: 25px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                font-weight: 600;
            }

            .auth-subtitle span {
                color: #ef4444;
                text-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
                font-weight: 800;
            }

            .auth-description {
                font-family: 'Outfit', sans-serif;
                font-size: 0.85rem;
                color: #cbd5e1;
                margin-bottom: 18px;
                text-align: left;
                line-height: 1.5;
            }

            .auth-input {
                width: 100%;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(197, 160, 89, 0.25);
                background: rgba(0, 0, 0, 0.65);
                color: #fff;
                font-size: 1.1rem;
                outline: none;
                box-sizing: border-box;
                font-family: 'JetBrains Mono', monospace;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.8);
                text-align: center;
                margin-bottom: 20px;
            }

            .auth-input:focus {
                border-color: #fbbf24;
                background: rgba(153, 27, 27, 0.15);
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.3), 
                            inset 0 2px 4px rgba(0,0,0,0.6);
            }

            .auth-btn {
                width: 100%;
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #7f1d1d;
                background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #c5a059 100%);
                color: #fff;
                font-weight: 800;
                font-size: 0.95rem;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 2px;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 12px rgba(153, 27, 27, 0.3);
                position: relative;
                overflow: hidden;
            }

            .auth-btn::after {
                content: '';
                position: absolute;
                top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
                transition: all 0.6s;
            }

            .auth-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35), 0 0 10px rgba(197, 160, 89, 0.25);
                background: linear-gradient(135deg, #991b1b 0%, #b91c1c 40%, #fbbf24 100%);
            }

            .auth-btn:hover::after {
                left: 100%;
            }

            .auth-btn:active {
                transform: translateY(0);
            }

            .auth-sim-box {
                background: rgba(153, 27, 27, 0.1);
                border: 1px dashed rgba(197, 160, 89, 0.45);
                padding: 12px;
                margin-bottom: 20px;
                border-radius: 10px;
                font-size: 0.8rem;
                color: #fcd34d;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                animation: authFadeIn 0.5s ease-out;
                box-sizing: border-box;
            }

            .auth-sim-code {
                font-family: 'JetBrains Mono', monospace;
                font-size: 1.15rem;
                font-weight: 800;
                letter-spacing: 3px;
                color: #fbbf24;
                text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
                background: rgba(0, 0, 0, 0.25);
                padding: 2px 8px;
                border-radius: 4px;
                margin-left: 4px;
            }

            .auth-back-link {
                display: inline-block;
                margin-top: 15px;
                background: transparent;
                border: none;
                color: #94a3b8;
                font-size: 0.8rem;
                cursor: pointer;
                font-family: 'Outfit', sans-serif;
                transition: color 0.2s, transform 0.2s;
                text-decoration: underline;
            }

            .auth-back-link:hover {
                color: #fbbf24;
                transform: translateX(-2px);
            }

            /* --- Portal de Seleção de Mesas --- */
            .tables-scroll-container {
                max-height: 260px;
                overflow-y: auto;
                margin-bottom: 20px;
                padding-right: 5px;
                box-sizing: border-box;
            }
            .tables-scroll-container::-webkit-scrollbar {
                width: 6px;
            }
            .tables-scroll-container::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
                border-radius: 3px;
            }
            .tables-scroll-container::-webkit-scrollbar-thumb {
                background: rgba(197, 160, 89, 0.3);
                border-radius: 3px;
            }
            .tables-scroll-container::-webkit-scrollbar-thumb:hover {
                background: rgba(197, 160, 89, 0.6);
            }
            
            .table-card {
                background: rgba(15, 12, 16, 0.65);
                border: 1px solid rgba(197, 160, 89, 0.15);
                border-radius: 14px;
                padding: 16px;
                margin-bottom: 12px;
                text-align: left;
                box-sizing: border-box;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }
            .table-card::after {
                content: '';
                position: absolute;
                left: 0; top: 0; bottom: 0; width: 3px;
                background: linear-gradient(to bottom, #c5a059, #991b1b);
                opacity: 0.6;
                transition: all 0.3s ease;
            }
            .table-card:hover {
                transform: translateY(-2px);
                border-color: rgba(251, 191, 36, 0.4);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), 
                            0 0 15px rgba(153, 27, 27, 0.1);
                background: rgba(25, 20, 26, 0.85);
            }
            .table-card:hover::after {
                width: 4px;
                opacity: 1;
            }
            
            .table-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .table-card-id {
                font-family: 'Cinzel', serif;
                font-weight: 700;
                font-size: 0.95rem;
                color: #c5a059;
                letter-spacing: 1px;
                text-shadow: 0 0 8px rgba(197, 160, 89, 0.2);
            }
            .table-card-date {
                font-size: 0.75rem;
                color: #64748b;
            }
            
            .table-card-body {
                display: flex;
                gap: 10px;
                margin-bottom: 14px;
            }
            .table-stat-badge {
                font-size: 0.75rem;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .session-badge {
                background: rgba(153, 27, 27, 0.2);
                color: #f87171;
                border: 1px solid rgba(153, 27, 27, 0.3);
            }
            .hero-badge {
                background: rgba(197, 160, 89, 0.15);
                color: #fbbf24;
                border: 1px solid rgba(197, 160, 89, 0.25);
            }
            
            .table-enter-btn {
                width: 100%;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid rgba(197, 160, 89, 0.25);
                background: rgba(0, 0, 0, 0.4);
                color: #f1f5f9;
                font-weight: 700;
                font-size: 0.8rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s ease;
            }
            .table-enter-btn:hover {
                background: linear-gradient(90deg, #991b1b 0%, #c5a059 100%);
                color: #000;
                font-weight: 800;
                border-color: transparent;
                box-shadow: 0 4px 10px rgba(197, 160, 89, 0.2);
            }
            
            .auth-btn-secondary {
                padding: 12px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(255, 255, 255, 0.03);
                color: #c5a059;
                font-weight: 700;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                box-sizing: border-box;
            }
            .auth-btn-secondary:hover {
                background: rgba(197, 160, 89, 0.1);
                border-color: rgba(197, 160, 89, 0.35);
                color: #fbbf24;
                box-shadow: 0 0 10px rgba(197, 160, 89, 0.1);
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        var innerContent = '';
        if (this.step === 'phone') {
            innerContent = this.renderPhoneStep();
        } else if (this.step === 'code') {
            innerContent = this.renderCodeStep();
        } else if (this.step === 'tables') {
            innerContent = this.renderTablesStep();
        } else if (this.step === 'session_choice') {
            innerContent = this.renderSessionChoiceStep();
        }
        
        var mName = localStorage.getItem('DM_MASTER_NAME') || this.masterName || 'Mestre';
        var internalId = localStorage.getItem('DM_INTERNAL_ID') || 'DGH-MST-XXXXXX';

        var titleHtml = '';
        if (this.step === 'tables' || this.step === 'session_choice') {
            titleHtml = '<h2 class="auth-title" style="font-size: 1.6rem; letter-spacing: 1px;">Saudações, ' + mName + '</h2>' +
                        '<p class="auth-subtitle" style="margin-bottom: 25px;">Sessão de Hoje: <span style="font-size: 0.9rem;">' + new Date().toLocaleDateString('pt-BR') + '</span></p>';
        } else {
            titleHtml = '<h2 class="auth-title">Mesa do Mestre</h2>' +
                        '<p class="auth-subtitle">Acesso Restrito ao <span>Mestre</span></p>';
        }

        var logoHtml = '<div class="auth-logo-container">' +
                           '<img src="assets/logo.png" alt="Logo" class="auth-logo">';
        if ((this.step === 'tables' || this.step === 'session_choice') && internalId) {
            let displayId = internalId;
            let idLabel = "ID Mestre";
            let copyValue = internalId;

            if (this.step === 'session_choice' && this.selectedTableId) {
                displayId = this.selectedTableId;
                idLabel = "ID Mesa";
                copyValue = this.selectedTableId;
            }

            logoHtml += '<div class="auth-logo-balloon" id="auth-copy-id" data-copy="' + copyValue + '" title="Clique para copiar">' + idLabel + ': ' + displayId + ' <i class="fa-regular fa-copy" style="margin-left:6px; opacity:0.8;"></i></div>';
        } else {
            // Assinatura do programador e easter egg na tela inicial
            logoHtml += '<div class="auth-logo-balloon">Sua aventura começa aqui! 🧙‍♂️✨<br><span style="font-size:0.7rem; color:#888;">By Programador</span></div>';
        }
        logoHtml += '</div>';

        this.container.innerHTML = '<div class="auth-card">' +
            logoHtml +
            titleHtml +
            innerContent +
        '</div>';

        this.attachEvents();
    }

    // B-04: Exibe banner de erro inline dentro do card (substitui alert)
    showInlineError(message, isSuccess = false) {
        // Remove qualquer banner anterior
        const prev = this.container.querySelector('.auth-error-banner');
        if (prev) prev.remove();

        const banner = document.createElement('div');
        banner.className = 'auth-error-banner' + (isSuccess ? ' auth-error-success' : '');
        banner.innerHTML = `<span class="auth-error-icon">${isSuccess ? '✅' : '⚠️'}</span><span>${message}</span>`;

        // Insere antes do primeiro botão no card
        const card = this.container.querySelector('.auth-card');
        const firstBtn = card?.querySelector('button, input[type="tel"]');
        if (firstBtn) {
            card.insertBefore(banner, firstBtn);
        } else {
            card?.appendChild(banner);
        }

        // Auto-remover após 4s
        clearTimeout(this._errorTimer);
        this._errorTimer = setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.3s';
            setTimeout(() => banner.remove(), 300);
        }, 4000);
    }

    renderPhoneStep() {
        return '<p class="auth-description">Digite seu nome de Mestre e número de telefone (com DDD) para confirmar sua identidade arcanamente.</p>' +
            '<input type="text" id="auth-name" class="auth-input" placeholder="Nome do Mestre" value="' + (this.masterName || '') + '" style="margin-bottom: 12px; font-family:\'Outfit\', sans-serif;">' +
            '<input type="tel" id="auth-phone" class="auth-input" placeholder="(11) 99999-9999" value="' + (this.phone || '') + '">' +
            '<button id="auth-send-code" class="auth-btn">Enviar Código SMS</button>';
    }

    renderCodeStep() {
        return '<p class="auth-description">Enviamos um SMS para <strong style="color:#c5a059">' + this.phone + '</strong>. Digite o código de 6 dígitos abaixo.</p>' +
            '<div class="auth-sim-box">' +
                '<i class="fa-solid fa-tower-broadcast"></i>' +
                ' <span>SIMULAÇÃO: Seu código é:</span>' +
                '<span class="auth-sim-code">' + this.generatedCode + '</span>' +
            '</div>' +
            '<input type="text" id="auth-code" class="auth-input" placeholder="000000" maxlength="6" style="font-size: 1.4rem; letter-spacing: 8px;">' +
            '<button id="auth-verify-code" class="auth-btn">Confirmar e Logar</button>' +
            '<button id="auth-back" class="auth-back-link">Voltar</button>';
    }

    renderTablesStep() {
        if (this.loading) {
            return '<div style="padding: 40px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">' +
                '<i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: #c5a059;"></i>' +
                '<p style="color: #94a3b8; font-size: 0.9rem; letter-spacing: 1px;">Invocando o Grimório de Mesas...</p>' +
            '</div>';
        }

        var tablesHtml = '';
        if (this.tables.length === 0) {
            tablesHtml = '<div style="padding: 25px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(197,160,89,0.2); margin-bottom: 25px; box-sizing: border-box;">' +
                '<i class="fa-solid fa-folder-open" style="font-size: 2rem; color: #94a3b8; margin-bottom: 10px; display: block;"></i>' +
                '<p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.4; margin: 0;">Você ainda não possui mesas ativas.<br>Crie uma nova mesa ou vincule uma existente abaixo.</p>' +
            '</div>';
        } else {
            var cards = [];
            for (var i = 0; i < this.tables.length; i++) {
                var t = this.tables[i];
                var dateStr = new Date(t.createdAt).toLocaleDateString('pt-BR');
                cards.push(
                    '<div class="table-card">' +
                        '<div class="table-card-header">' +
                            '<span class="table-card-id"><i class="fa-solid fa-dungeon"></i> MESA #' + t.id + '</span>' +
                            '<span class="table-card-date">' + dateStr + '</span>' +
                        '</div>' +
                        '<div class="table-card-body">' +
                            '<div class="table-stat-badge session-badge">' +
                                '<i class="fa-solid fa-hourglass-half"></i> ' + t.sessionNum + 'ª Sessão' +
                            '</div>' +
                            '<div class="table-stat-badge hero-badge">' +
                                '<i class="fa-solid fa-shield-halved"></i> ' + t.heroesCount + ' ' + (t.heroesCount === 1 ? 'Herói' : 'Heróis') +
                            '</div>' +
                        '</div>' +
                        '<button class="table-enter-btn" data-id="' + t.id + '">Carregar Mesa <i class="fa-solid fa-chevron-right"></i></button>' +
                    '</div>'
                );
            }
            tablesHtml = '<div class="tables-scroll-container">' + cards.join('') + '</div>';
        }

        return tablesHtml +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px;">' +
            '<button id="auth-create-table" class="auth-btn-secondary"><i class="fa-solid fa-plus"></i> Nova Mesa</button>' +
            '<button id="auth-link-table" class="auth-btn-secondary"><i class="fa-solid fa-link"></i> Vincular ID</button>' +
        '</div>' +
        '<button id="auth-logout" class="auth-back-link" style="margin-top: 25px;"><i class="fa-solid fa-sign-out-alt"></i> Sair da Conta</button>';
    }

    renderSessionChoiceStep() {
        const tableId = this.selectedTableId;
        const state = this.selectedTableData || {};
        const sessionNum = state.sessionNumber || 1;
        const heroesCount = (state.players || []).length;
        const lastTitle = state.sessionTitle || 'Sem Título';
        
        return '<p class="auth-description" style="text-align: center; margin-bottom: 20px; font-size: 0.95rem; font-family:\'Outfit\', sans-serif;">' +
            'Mesa <strong style="color: #c5a059;">#' + tableId + '</strong> selecionada.<br>' +
            '<span style="font-size: 0.85rem; color: #94a3b8;">Sessão Atual: <strong style="color:#c5a059;">' + sessionNum + 'ª Sessão</strong> (' + lastTitle + ')</span><br>' +
            '<span style="font-size: 0.85rem; color: #94a3b8;">Heróis no Grimório: <strong>' + heroesCount + '</strong></span>' +
        '</p>' +
        '<div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;">' +
            '<button id="auth-continue-session" class="auth-btn" style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(197, 160, 89, 0.4); text-align: left; padding: 15px; display: flex; flex-direction: column; gap: 4px; height: auto; border-radius: 12px; cursor: pointer; line-height: 1.3;">' +
                '<span style="font-family:\'Cinzel\'; font-weight:800; font-size:1rem; color:#fff;"><i class="fa-solid fa-play" style="color: #22c55e; margin-right: 8px;"></i> Continuar Sessão Atual</span>' +
                '<span style="font-size: 0.75rem; color: #94a3b8; font-weight: normal; margin-left: 24px; white-space: normal;">Continua exatamente de onde parou (combates, notas e logs ativos).</span>' +
            '</button>' +
            '<button id="auth-new-session" class="auth-btn" style="background: linear-gradient(135deg, #7f1d1d, #991b1b); border: 1px solid #fbbf24; text-align: left; padding: 15px; display: flex; flex-direction: column; gap: 4px; height: auto; border-radius: 12px; cursor: pointer; line-height: 1.3;">' +
                '<span style="font-family:\'Cinzel\'; font-weight:800; font-size:1rem; color:#fff;"><i class="fa-solid fa-forward" style="color: #fbbf24; margin-right: 8px;"></i> Iniciar Nova Sessão (Capítulo ' + (sessionNum + 1) + ')</span>' +
                '<span style="font-size: 0.75rem; color: #fca5a5; font-weight: normal; margin-left: 24px; white-space: normal;">Preserva os Heróis (fichas, itens e XP) e cria um novo capítulo limpo arquivando o anterior.</span>' +
            '</button>' +
        '</div>' +
        '<button id="auth-cancel-choice" class="auth-back-link" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><i class="fa-solid fa-chevron-left"></i> Voltar para as Mesas</button>';
    }


    closeAuthScreen() {
        const card = this.container.querySelector('.auth-card');
        if (card) {
            card.style.animation = 'authFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }
        this.container.style.transition = 'opacity 0.4s ease';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.container.remove();
            const style = document.getElementById('auth-screen-styles');
            if (style) style.remove();
            
            if (this.onLogin) this.onLogin();
        }, 400);
    }

    attachEvents() {
        const copyBtn = document.getElementById('auth-copy-id');
        if (copyBtn) {
            copyBtn.onclick = () => {
                const val = copyBtn.getAttribute('data-copy');
                navigator.clipboard.writeText(val).then(() => {
                    const originalHtml = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #22c55e;"></i> Copiado!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                }).catch(err => {
                    console.error('Erro ao copiar', err);
                });
            };
        }

        if (this.step === 'phone') {
            const btn = document.getElementById('auth-send-code');
            const inputPhone = document.getElementById('auth-phone');
            const inputName = document.getElementById('auth-name');
            
            if (inputPhone) {
                inputPhone.oninput = (e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 11) v = v.slice(0,11);
                    if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
                    if (v.length > 10) v = `${v.slice(0,10)}-${v.slice(10)}`;
                    e.target.value = v;
                    this.phone = v;
                };
            }

            if (inputName) {
                inputName.oninput = (e) => {
                    this.masterName = e.target.value;
                };
            }

            const handleNext = async () => {
                if (!this.masterName || !this.masterName.trim()) {
                    this.showInlineError('Por favor, insira seu <strong>nome de Mestre</strong> antes de continuar.');
                    inputName?.focus();
                    return;
                }
                const val = inputPhone.value.replace(/\D/g, '');
                if (val.length < 10) {
                    this.showInlineError('Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>.');
                    inputPhone?.focus();
                    return;
                }
                this.phone = inputPhone.value;
                
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
                
                try {
                    const response = await fetch('/api/auth/send-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: this.masterName, phone: this.phone })
                    });
                    if (!response.ok) {
                        throw new Error(`Server returned status ${response.status}`);
                    }
                    const resData = await response.json();
                    if (response.ok && resData.status === 'success') {
                        this.generatedCode = resData.simulatedCode || '';
                        this.step = 'code';
                        this.render();
                    } else {
                        this.showInlineError(resData.message || 'Erro ao enviar código SMS.');
                        btn.disabled = false;
                        btn.innerHTML = 'Enviar Código SMS';
                    }
                } catch (e) {
                    console.warn('[AuthScreen] Endpoint /api/auth/send-code falhou (Servidor offline/local?). Usando fallback simulado.', e);
                    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
                    this.step = 'code';
                    this.render();
                }
            };

            if (inputPhone) {
                inputPhone.onkeydown = (e) => {
                    if (e.key === 'Enter') handleNext();
                };
            }
            if (inputName) {
                inputName.onkeydown = (e) => {
                    if (e.key === 'Enter') inputPhone.focus();
                };
            }

            if (btn) btn.onclick = handleNext;
            
            if (inputName && !inputName.value) {
                inputName.focus();
            } else if (inputPhone) {
                inputPhone.focus();
            }
        } else if (this.step === 'code') {
            const btn = document.getElementById('auth-verify-code');
            const backBtn = document.getElementById('auth-back');
            const input = document.getElementById('auth-code');

            if (input) {
                input.oninput = (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                };

                input.onkeydown = (e) => {
                    if (e.key === 'Enter') btn.click();
                };
            }

            if (btn) {
                btn.onclick = async () => {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';
                    
                    try {
                        const response = await fetch('/api/auth/verify-code', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: this.masterName, phone: this.phone, code: input.value })
                        });
                        if (!response.ok) {
                            throw new Error(`Server returned status ${response.status}`);
                        }
                        const resData = await response.json();
                        
                        if (response.ok && resData.status === 'success') {
                            localStorage.setItem('DM_JWT_TOKEN', resData.token);
                            localStorage.setItem('DM_SESSION_ID', 'DM-' + btoa(this.phone + Date.now()).substring(0, 16));
                            localStorage.setItem('DM_SESSION_START', Date.now().toString());
                            localStorage.setItem('DM_PHONE', this.phone);
                            localStorage.setItem('DM_MASTER_NAME', resData.master.name);
                            localStorage.setItem('DM_MASTER_ID', resData.master.masterId);
                            localStorage.setItem('DM_INTERNAL_ID', resData.master.internalId);
                            
                            this.step = 'tables';
                            this.loadTables();
                        } else {
                            throw new Error(resData.message || 'Código inválido.');
                        }
                    } catch (e) {
                        console.warn('[AuthScreen] Endpoint /api/auth/verify-code falhou. Usando fallback offline.', e);
                        
                        // Fallback local se o backend não estiver respondendo na verificação
                        if (input.value === this.generatedCode) {
                            try {
                                const master = await PersistenceService.getOrCreateMaster(this.masterName, this.phone);
                                const sessionId = 'DM-' + btoa(this.phone + Date.now()).substring(0, 16);
                                localStorage.setItem('DM_SESSION_ID', sessionId);
                                localStorage.setItem('DM_SESSION_START', Date.now().toString());
                                localStorage.setItem('DM_PHONE', this.phone);
                                localStorage.setItem('DM_MASTER_NAME', master.name);
                                localStorage.setItem('DM_MASTER_ID', master.masterId);
                                localStorage.setItem('DM_INTERNAL_ID', master.internalId);
                                
                                // Simula um token vazio para que as requisições autenticadas locais não falhem se implementadas
                                localStorage.setItem('DM_JWT_TOKEN', 'offline_mode');
                                
                                this.step = 'tables';
                                this.loadTables();
                            } catch (err) {
                                this.showInlineError('Erro ao registrar Mestre localmente: ' + err.message);
                                btn.disabled = false;
                                btn.innerHTML = 'Confirmar e Logar';
                            }
                        } else {
                            input.style.borderColor = '#ef4444';
                            input.style.animation = 'shake 0.4s';
                            setTimeout(() => input.style.animation = '', 400);
                            this.showInlineError('Código incorreto — verifique o código e tente novamente.');
                            btn.disabled = false;
                            btn.innerHTML = 'Confirmar e Logar';
                        }
                    }
                };
            }

            if (backBtn) {
                backBtn.onclick = () => {
                    this.step = 'phone';
                    this.render();
                };
            }

            if (input) input.focus();
        } else if (this.step === 'tables') {
            const enterBtns = this.container.querySelectorAll('.table-enter-btn');
            enterBtns.forEach(btn => {
                btn.onclick = async () => {
                    const tableId = btn.dataset.id;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Lendo Mesa...';
                    
                    try {
                        const response = await fetch(`/data/mesa_${tableId}.json?t=${Date.now()}`);
                        if (response.ok) {
                            const state = await response.json();
                            this.selectedTableId = tableId;
                            this.selectedTableData = state;
                            this.step = 'session_choice';
                            this.render();
                        } else {
                            // Mesa ainda sem arquivo — inicia como mesa nova
                            localStorage.setItem('DM_ACTIVE_TABLE', tableId);
                            localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${tableId}.json`);
                            this.closeAuthScreen();
                        }
                    } catch (e) {
                        this.showInlineError('Erro ao carregar mesa: ' + (e.message || 'verifique a conexão'));
                        btn.disabled = false;
                        btn.innerHTML = 'Carregar Mesa <i class="fa-solid fa-chevron-right"></i>';
                    }
                };
            });

            const createBtn = document.getElementById('auth-create-table');
            if (createBtn) {
                createBtn.onclick = async () => {
                    createBtn.disabled = true;
                    createBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criando...';
                    try {
                        const newTable = await PersistenceService.createTable(this.phone);
                        localStorage.setItem('DM_ACTIVE_TABLE', newTable.id);
                        localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${newTable.id}.json`);
                        this.closeAuthScreen();
                    } catch (e) {
                        this.showInlineError('Erro ao criar mesa: ' + (e.message || 'falha de rede'));
                        createBtn.disabled = false;
                        createBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Nova Mesa';
                    }
                };
            }

            const linkBtn = document.getElementById('auth-link-table');
            if (linkBtn) {
                linkBtn.onclick = async () => {
                    const code = prompt('Digite o ID de 6 dígitos da mesa a ser vinculada:');
                    if (!code || !code.trim()) return;
                    const tableId = code.trim();
                    if (!/^\d{6}$/.test(tableId)) {
                        alert('O ID da mesa deve ter exatamente 6 números.');
                        return;
                    }
                    
                    linkBtn.disabled = true;
                    linkBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Vinculando...';
                    try {
                        const linkedTable = await PersistenceService.linkTable(tableId, this.phone);
                        localStorage.setItem('DM_ACTIVE_TABLE', linkedTable.id);
                        localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${linkedTable.id}.json`);
                        this.showInlineError(`Mesa #${linkedTable.id} vinculada com sucesso! Carregando...`, true);
                        setTimeout(() => this.closeAuthScreen(), 1200);
                    } catch (e) {
                        this.showInlineError('Mesa não encontrada — verifique o ID de 6 dígitos e tente novamente.');
                        linkBtn.disabled = false;
                        linkBtn.innerHTML = '<i class="fa-solid fa-link"></i> Vincular ID';
                    }
                };
            }

            const logoutBtn = document.getElementById('auth-logout');
            if (logoutBtn) {
                logoutBtn.onclick = () => {
                    localStorage.removeItem('DM_SESSION_ID');
                    localStorage.removeItem('DM_SESSION_START');
                    localStorage.removeItem('DM_ACTIVE_TABLE');
                    localStorage.removeItem('DM_PHONE');
                    localStorage.removeItem('DM_MASTER_NAME');
                    localStorage.removeItem('DM_MASTER_ID');
                    localStorage.removeItem('DM_INTERNAL_ID');
                    localStorage.removeItem('TOME_ACTIVE_SESSION');
                    this.step = 'phone';
                    this.phone = '';
                    this.masterName = '';
                    this.render();
                };
            }
        } else if (this.step === 'session_choice') {
            const continueBtn = document.getElementById('auth-continue-session');
            const newBtn = document.getElementById('auth-new-session');
            const cancelBtn = document.getElementById('auth-cancel-choice');
            
            if (continueBtn) {
                continueBtn.onclick = () => {
                    const tableId = this.selectedTableId;
                    localStorage.setItem('DM_ACTIVE_TABLE', tableId);
                    localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${tableId}.json`);
                    this.closeAuthScreen();
                };
            }
            
            if (newBtn) {
                newBtn.onclick = async () => {
                    const nextSessionNum = (this.selectedTableData.sessionNumber || 1) + 1;
                    if (!confirm('Deseja iniciar um novo capitulo? Os dados da sessao atual serao arquivados no diario e uma nova sessao limpa sera iniciada para os mesmos herois.')) {
                        return;
                    }
                    newBtn.disabled = true;
                    newBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Arquivando e Criando Capitulo...';
                    
                    try {
                        const tableId = this.selectedTableId;
                        await PersistenceService.startNewSession(tableId);
                        localStorage.setItem('DM_ACTIVE_TABLE', tableId);
                        localStorage.setItem('TOME_ACTIVE_SESSION', `mesa_${tableId}.json`);
                        this.closeAuthScreen();
                    } catch (e) {
                        alert('Erro ao iniciar nova sessao: ' + e.message);
                        newBtn.disabled = false;
                        newBtn.innerHTML = '<span style="font-family:\'Cinzel\'; font-weight:800; font-size:1rem; color:#fff;"><i class="fa-solid fa-forward" style="color: #fbbf24; margin-right: 8px;"></i> Iniciar Nova Sessão (Capítulo ' + nextSessionNum + ')</span>';
                    }
                };
            }
            
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    this.step = 'tables';
                    this.render();
                };
            }
        }
    }
}
