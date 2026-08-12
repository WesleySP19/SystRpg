import{P as l}from"./PersistenceService-BnWdIWzY.js";import"./BattleManager-CrdQ-hKX.js";class b{constructor({onLogin:n}){this.onLogin=n;const o=localStorage.getItem("DM_SESSION_ID"),a=localStorage.getItem("DM_PHONE"),e=localStorage.getItem("DM_MASTER_NAME");o&&a&&e?(this.step="tables",this.phone=a,this.masterName=e,this.loadTables()):(this.step="phone",this.phone="",this.masterName=""),this.code="",this.generatedCode="",this.tables=[],this.loading=!1,this.selectedTableId=null,this.selectedTableData=null}async loadTables(){this.loading=!0,this.render();try{const n=await l.getTablesDirectory(),o=this.phone.replace(/\D/g,""),e=(await l.getMastersDirectory()).find(t=>t.phone.replace(/\D/g,"")===o),s=(e==null?void 0:e.tables)||[];this.tables=n.filter(t=>(t.mestrePhone?t.mestrePhone.replace(/\D/g,""):"")===o||s.includes(t.id))}catch(n){console.error("Falha ao carregar mesas:",n),this.tables=[]}finally{this.loading=!1,this.render()}}mount(){this.container=document.createElement("div"),this.container.id="auth-screen",this.container.style.position="fixed",this.container.style.inset="0",this.container.style.backgroundColor="#050508",this.container.style.backgroundImage="radial-gradient(circle at center, #23080d 0%, #050508 100%)",this.container.style.display="flex",this.container.style.flexDirection="column",this.container.style.alignItems="center",this.container.style.justifyContent="center",this.container.style.zIndex="999999",this.container.style.fontFamily="'Outfit', sans-serif",document.body.appendChild(this.container),this.injectStyles(),this.render()}injectStyles(){if(document.getElementById("auth-screen-styles"))return;const n=document.createElement("style");n.id="auth-screen-styles",n.textContent=`
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
                border: 1px solid rgba(197, 160, 89, 0.25);
                background: rgba(5, 5, 8, 0.65);
                color: #fff;
                font-size: 1.1rem;
                outline: none;
                box-sizing: border-box;
                font-family: 'JetBrains Mono', monospace;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
                text-align: center;
                margin-bottom: 20px;
            }

            .auth-input:focus {
                border-color: #ef4444;
                background: rgba(153, 27, 27, 0.1);
                box-shadow: 0 0 15px rgba(239, 68, 68, 0.2), 
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
        `,document.head.appendChild(n)}render(){var n="";this.step==="phone"?n=this.renderPhoneStep():this.step==="code"?n=this.renderCodeStep():this.step==="tables"?n=this.renderTablesStep():this.step==="session_choice"&&(n=this.renderSessionChoiceStep());var o=localStorage.getItem("DM_MASTER_NAME")||this.masterName||"Mestre",a=localStorage.getItem("DM_INTERNAL_ID")||"DGH-MST-XXXXXX",e="";this.step==="tables"||this.step==="session_choice"?e='<h2 class="auth-title" style="font-size: 1.6rem; letter-spacing: 1px;">Saudações, '+o+'</h2><p class="auth-subtitle" style="margin-bottom: 25px;">Sessão de Hoje: <span style="font-size: 0.9rem;">'+new Date().toLocaleDateString("pt-BR")+"</span></p>":e='<h2 class="auth-title">Mesa do Mestre</h2><p class="auth-subtitle">Acesso Restrito ao <span>Mestre</span></p>';var s='<div class="auth-logo-container"><img src="assets/logo.png" alt="Logo" class="auth-logo">';if((this.step==="tables"||this.step==="session_choice")&&a){let t=a,r="ID Mestre",i=a;this.step==="session_choice"&&this.selectedTableId&&(t=this.selectedTableId,r="ID Mesa",i=this.selectedTableId),s+='<div class="auth-logo-balloon" id="auth-copy-id" data-copy="'+i+'" title="Clique para copiar">'+r+": "+t+' <i class="fa-regular fa-copy" style="margin-left:6px; opacity:0.8;"></i></div>'}else s+='<div class="auth-logo-balloon">Sua aventura começa aqui! 🧙‍♂️✨<br><span style="font-size:0.7rem; color:#888;">By Programador</span></div>';s+="</div>",this.container.innerHTML='<div class="auth-card">'+s+e+n+"</div>",this.attachEvents()}showInlineError(n,o=!1){const a=this.container.querySelector(".auth-error-banner");a&&a.remove();const e=document.createElement("div");e.className="auth-error-banner"+(o?" auth-error-success":""),e.innerHTML=`<span class="auth-error-icon">${o?"✅":"⚠️"}</span><span>${n}</span>`;const s=this.container.querySelector(".auth-card"),t=s==null?void 0:s.querySelector('button, input[type="tel"]');t?s.insertBefore(e,t):s==null||s.appendChild(e),clearTimeout(this._errorTimer),this._errorTimer=setTimeout(()=>{e.style.opacity="0",e.style.transition="opacity 0.3s",setTimeout(()=>e.remove(),300)},4e3)}renderPhoneStep(){return'<p class="auth-description">Digite seu nome de Mestre e número de telefone (com DDD) para confirmar sua identidade arcanamente.</p><input type="text" id="auth-name" class="auth-input" placeholder="Nome do Mestre" value="'+(this.masterName||"")+`" style="margin-bottom: 12px; font-family:'Outfit', sans-serif;"><input type="tel" id="auth-phone" class="auth-input" placeholder="(11) 99999-9999" value="`+(this.phone||"")+'"><button id="auth-send-code" class="auth-btn">Enviar Código SMS</button>'}renderCodeStep(){return'<p class="auth-description">Enviamos um SMS para <strong style="color:#c5a059">'+this.phone+'</strong>. Digite o código de 6 dígitos abaixo.</p><div class="auth-sim-box"><i class="fa-solid fa-tower-broadcast"></i> <span>SIMULAÇÃO: Seu código é:</span><span class="auth-sim-code">'+this.generatedCode+'</span></div><input type="text" id="auth-code" class="auth-input" placeholder="000000" maxlength="6" style="font-size: 1.4rem; letter-spacing: 8px;"><button id="auth-verify-code" class="auth-btn">Confirmar e Logar</button><button id="auth-back" class="auth-back-link">Voltar</button>'}renderTablesStep(){if(this.loading)return'<div style="padding: 40px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: #c5a059;"></i><p style="color: #94a3b8; font-size: 0.9rem; letter-spacing: 1px;">Invocando o Grimório de Mesas...</p></div>';var n="";if(this.tables.length===0)n='<div style="padding: 25px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(197,160,89,0.2); margin-bottom: 25px; box-sizing: border-box;"><i class="fa-solid fa-folder-open" style="font-size: 2rem; color: #94a3b8; margin-bottom: 10px; display: block;"></i><p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.4; margin: 0;">Você ainda não possui mesas ativas.<br>Crie uma nova mesa ou vincule uma existente abaixo.</p></div>';else{for(var o=[],a=0;a<this.tables.length;a++){var e=this.tables[a],s=new Date(e.createdAt).toLocaleDateString("pt-BR");o.push('<div class="table-card"><div class="table-card-header"><span class="table-card-id"><i class="fa-solid fa-dungeon"></i> MESA #'+e.id+'</span><span class="table-card-date">'+s+'</span></div><div class="table-card-body"><div class="table-stat-badge session-badge"><i class="fa-solid fa-hourglass-half"></i> '+e.sessionNum+'ª Sessão</div><div class="table-stat-badge hero-badge"><i class="fa-solid fa-shield-halved"></i> '+e.heroesCount+" "+(e.heroesCount===1?"Herói":"Heróis")+'</div></div><button class="table-enter-btn" data-id="'+e.id+'">Carregar Mesa <i class="fa-solid fa-chevron-right"></i></button></div>')}n='<div class="tables-scroll-container">'+o.join("")+"</div>"}return n+'<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px;"><button id="auth-create-table" class="auth-btn-secondary"><i class="fa-solid fa-plus"></i> Nova Mesa</button><button id="auth-link-table" class="auth-btn-secondary"><i class="fa-solid fa-link"></i> Vincular ID</button></div><button id="auth-logout" class="auth-back-link" style="margin-top: 25px;"><i class="fa-solid fa-sign-out-alt"></i> Sair da Conta</button>'}renderSessionChoiceStep(){const n=this.selectedTableId,o=this.selectedTableData||{},a=o.sessionNumber||1,e=(o.players||[]).length,s=o.sessionTitle||"Sem Título";return`<p class="auth-description" style="text-align: center; margin-bottom: 20px; font-size: 0.95rem; font-family:'Outfit', sans-serif;">Mesa <strong style="color: #c5a059;">#`+n+'</strong> selecionada.<br><span style="font-size: 0.85rem; color: #94a3b8;">Sessão Atual: <strong style="color:#c5a059;">'+a+"ª Sessão</strong> ("+s+')</span><br><span style="font-size: 0.85rem; color: #94a3b8;">Heróis no Grimório: <strong>'+e+`</strong></span></p><div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px;"><button id="auth-continue-session" class="auth-btn" style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(197, 160, 89, 0.4); text-align: left; padding: 15px; display: flex; flex-direction: column; gap: 4px; height: auto; border-radius: 12px; cursor: pointer; line-height: 1.3;"><span style="font-family:'Cinzel'; font-weight:800; font-size:1rem; color:#fff;"><i class="fa-solid fa-play" style="color: #22c55e; margin-right: 8px;"></i> Continuar Sessão Atual</span><span style="font-size: 0.75rem; color: #94a3b8; font-weight: normal; margin-left: 24px; white-space: normal;">Continua exatamente de onde parou (combates, notas e logs ativos).</span></button><button id="auth-new-session" class="auth-btn" style="background: linear-gradient(135deg, #7f1d1d, #991b1b); border: 1px solid #fbbf24; text-align: left; padding: 15px; display: flex; flex-direction: column; gap: 4px; height: auto; border-radius: 12px; cursor: pointer; line-height: 1.3;"><span style="font-family:'Cinzel'; font-weight:800; font-size:1rem; color:#fff;"><i class="fa-solid fa-forward" style="color: #fbbf24; margin-right: 8px;"></i> Iniciar Nova Sessão (Capítulo `+(a+1)+')</span><span style="font-size: 0.75rem; color: #fca5a5; font-weight: normal; margin-left: 24px; white-space: normal;">Preserva os Heróis (fichas, itens e XP) e cria um novo capítulo limpo arquivando o anterior.</span></button></div><button id="auth-cancel-choice" class="auth-back-link" style="background:none; border:none; color:#94a3b8; cursor:pointer;"><i class="fa-solid fa-chevron-left"></i> Voltar para as Mesas</button>'}closeAuthScreen(){const n=this.container.querySelector(".auth-card");n&&(n.style.animation="authFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"),this.container.style.transition="opacity 0.4s ease",this.container.style.opacity="0",setTimeout(()=>{this.container.remove();const o=document.getElementById("auth-screen-styles");o&&o.remove(),this.onLogin&&this.onLogin()},400)}attachEvents(){const n=document.getElementById("auth-copy-id");if(n&&(n.onclick=()=>{const o=n.getAttribute("data-copy");navigator.clipboard.writeText(o).then(()=>{const a=n.innerHTML;n.innerHTML='<i class="fa-solid fa-check" style="color: #22c55e;"></i> Copiado!',setTimeout(()=>{n.innerHTML=a},2e3)}).catch(a=>{console.error("Erro ao copiar",a)})}),this.step==="phone"){const o=document.getElementById("auth-send-code"),a=document.getElementById("auth-phone"),e=document.getElementById("auth-name");a&&(a.oninput=t=>{let r=t.target.value.replace(/\D/g,"");r.length>11&&(r=r.slice(0,11)),r.length>2&&(r=`(${r.slice(0,2)}) ${r.slice(2)}`),r.length>10&&(r=`${r.slice(0,10)}-${r.slice(10)}`),t.target.value=r,this.phone=r}),e&&(e.oninput=t=>{this.masterName=t.target.value});const s=async()=>{if(!this.masterName||!this.masterName.trim()){this.showInlineError("Por favor, insira seu <strong>nome de Mestre</strong> antes de continuar."),e==null||e.focus();return}if(a.value.replace(/\D/g,"").length<10){this.showInlineError("Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>."),a==null||a.focus();return}this.phone=a.value,o.disabled=!0,o.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';try{const r=await fetch("/api/auth/send-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.masterName,phone:this.phone})});if(!r.ok)throw new Error(`Server returned status ${r.status}`);const i=await r.json();r.ok&&i.status==="success"?(this.generatedCode=i.simulatedCode||"",this.step="code",this.render()):(this.showInlineError(i.message||"Erro ao enviar código SMS."),o.disabled=!1,o.innerHTML="Enviar Código SMS")}catch(r){console.warn("[AuthScreen] Endpoint /api/auth/send-code falhou (Servidor PowerShell offline?). Usando fallback local simulado.",r),this.generatedCode=Math.floor(1e5+Math.random()*9e5).toString(),this.step="code",this.render()}};a&&(a.onkeydown=t=>{t.key==="Enter"&&s()}),e&&(e.onkeydown=t=>{t.key==="Enter"&&a.focus()}),o&&(o.onclick=s),e&&!e.value?e.focus():a&&a.focus()}else if(this.step==="code"){const o=document.getElementById("auth-verify-code"),a=document.getElementById("auth-back"),e=document.getElementById("auth-code");e&&(e.oninput=s=>{s.target.value=s.target.value.replace(/\D/g,"")},e.onkeydown=s=>{s.key==="Enter"&&o.click()}),o&&(o.onclick=async()=>{o.disabled=!0,o.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';try{const s=await fetch("/api/auth/verify-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.masterName,phone:this.phone,code:e.value})});if(!s.ok)throw new Error(`Server returned status ${s.status}`);const t=await s.json();if(s.ok&&t.status==="success")localStorage.setItem("DM_JWT_TOKEN",t.token),localStorage.setItem("DM_SESSION_ID","DM-"+btoa(this.phone+Date.now()).substring(0,16)),localStorage.setItem("DM_SESSION_START",Date.now().toString()),localStorage.setItem("DM_PHONE",this.phone),localStorage.setItem("DM_MASTER_NAME",t.master.name),localStorage.setItem("DM_MASTER_ID",t.master.masterId),localStorage.setItem("DM_INTERNAL_ID",t.master.internalId),this.step="tables",this.loadTables();else throw new Error(t.message||"Código inválido.")}catch(s){if(console.warn("[AuthScreen] Endpoint /api/auth/verify-code falhou. Usando fallback offline.",s),e.value===this.generatedCode)try{const t=await l.getOrCreateMaster(this.masterName,this.phone),r="DM-"+btoa(this.phone+Date.now()).substring(0,16);localStorage.setItem("DM_SESSION_ID",r),localStorage.setItem("DM_SESSION_START",Date.now().toString()),localStorage.setItem("DM_PHONE",this.phone),localStorage.setItem("DM_MASTER_NAME",t.name),localStorage.setItem("DM_MASTER_ID",t.masterId),localStorage.setItem("DM_INTERNAL_ID",t.internalId),this.step="tables",this.loadTables()}catch(t){this.showInlineError("Erro ao registrar Mestre localmente: "+t.message),o.disabled=!1,o.innerHTML="Confirmar e Logar"}else e.style.borderColor="#ef4444",e.style.animation="shake 0.4s",setTimeout(()=>e.style.animation="",400),this.showInlineError(s.message||"Código incorreto — verifique o código e tente novamente."),o.disabled=!1,o.innerHTML="Confirmar e Logar"}}),a&&(a.onclick=()=>{this.step="phone",this.render()}),e&&e.focus()}else if(this.step==="tables"){this.container.querySelectorAll(".table-enter-btn").forEach(t=>{t.onclick=async()=>{const r=t.dataset.id;t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Lendo Mesa...';try{const i=await fetch(`/data/mesa_${r}.json?t=${Date.now()}`);if(i.ok){const c=await i.json();this.selectedTableId=r,this.selectedTableData=c,this.step="session_choice",this.render()}else localStorage.setItem("DM_ACTIVE_TABLE",r),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${r}.json`),this.closeAuthScreen()}catch(i){this.showInlineError("Erro ao carregar mesa: "+(i.message||"verifique a conexão")),t.disabled=!1,t.innerHTML='Carregar Mesa <i class="fa-solid fa-chevron-right"></i>'}}});const a=document.getElementById("auth-create-table");a&&(a.onclick=async()=>{a.disabled=!0,a.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Criando...';try{const t=await l.createTable(this.phone);localStorage.setItem("DM_ACTIVE_TABLE",t.id),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${t.id}.json`),this.closeAuthScreen()}catch(t){this.showInlineError("Erro ao criar mesa: "+(t.message||"falha de rede")),a.disabled=!1,a.innerHTML='<i class="fa-solid fa-plus"></i> Nova Mesa'}});const e=document.getElementById("auth-link-table");e&&(e.onclick=async()=>{const t=prompt("Digite o ID de 6 dígitos da mesa a ser vinculada:");if(!t||!t.trim())return;const r=t.trim();if(!/^\d{6}$/.test(r)){alert("O ID da mesa deve ter exatamente 6 números.");return}e.disabled=!0,e.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Vinculando...';try{const i=await l.linkTable(r,this.phone);localStorage.setItem("DM_ACTIVE_TABLE",i.id),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${i.id}.json`),this.showInlineError(`Mesa #${i.id} vinculada com sucesso! Carregando...`,!0),setTimeout(()=>this.closeAuthScreen(),1200)}catch{this.showInlineError("Mesa não encontrada — verifique o ID de 6 dígitos e tente novamente."),e.disabled=!1,e.innerHTML='<i class="fa-solid fa-link"></i> Vincular ID'}});const s=document.getElementById("auth-logout");s&&(s.onclick=()=>{localStorage.removeItem("DM_SESSION_ID"),localStorage.removeItem("DM_SESSION_START"),localStorage.removeItem("DM_ACTIVE_TABLE"),localStorage.removeItem("DM_PHONE"),localStorage.removeItem("DM_MASTER_NAME"),localStorage.removeItem("DM_MASTER_ID"),localStorage.removeItem("DM_INTERNAL_ID"),localStorage.removeItem("TOME_ACTIVE_SESSION"),this.step="phone",this.phone="",this.masterName="",this.render()})}else if(this.step==="session_choice"){const o=document.getElementById("auth-continue-session"),a=document.getElementById("auth-new-session"),e=document.getElementById("auth-cancel-choice");o&&(o.onclick=()=>{const s=this.selectedTableId;localStorage.setItem("DM_ACTIVE_TABLE",s),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${s}.json`),this.closeAuthScreen()}),a&&(a.onclick=async()=>{const s=(this.selectedTableData.sessionNumber||1)+1;if(confirm("Deseja iniciar um novo capitulo? Os dados da sessao atual serao arquivados no diario e uma nova sessao limpa sera iniciada para os mesmos herois.")){a.disabled=!0,a.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Arquivando e Criando Capitulo...';try{const t=this.selectedTableId;await l.startNewSession(t),localStorage.setItem("DM_ACTIVE_TABLE",t),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${t}.json`),this.closeAuthScreen()}catch(t){alert("Erro ao iniciar nova sessao: "+t.message),a.disabled=!1,a.innerHTML=`<span style="font-family:'Cinzel'; font-weight:800; font-size:1rem; color:#fff;"><i class="fa-solid fa-forward" style="color: #fbbf24; margin-right: 8px;"></i> Iniciar Nova Sessão (Capítulo `+s+")</span>"}}}),e&&(e.onclick=()=>{this.step="tables",this.render()})}}}export{b as AuthScreen};
