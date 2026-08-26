import{u as e,P as f}from"./jsxRuntime.module-C8ftNBXQ.js";import{R as z,d as c,h as L,S as g}from"./BattleManager-Q-hDRRLg.js";import"./main-BTQ5YZrv.js";function Z(){if(document.getElementById("auth-screen-styles"))return;const i=document.createElement("style");i.id="auth-screen-styles",i.textContent=`
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
        `,document.head.appendChild(i)}function ee({closeAuthScreen:i,initialOnLogin:u}){const[r,l]=c("phone"),[n,y]=c(""),[h,w]=c(""),[I,j]=c(""),[M,E]=c(""),[D,T]=c([]),[d,s]=c(!1),[b,P]=c(null),[S,R]=c(null),[N,C]=c(null);L(()=>{const a=localStorage.getItem("DM_SESSION_ID"),t=localStorage.getItem("DM_PHONE"),o=localStorage.getItem("DM_MASTER_NAME");a&&t&&o?(l("tables"),y(t),w(o)):l("phone")},[]),L(()=>{r==="tables"&&V()},[r]);const m=(a,t=!1)=>{C({message:a,isSuccess:t}),setTimeout(()=>C(null),4e3)},V=async()=>{s(!0);try{const a=await f.getTablesDirectory(),t=n.replace(/\D/g,""),p=(await f.getMastersDirectory()).find(x=>x.phone.replace(/\D/g,"")===t),Q=(p==null?void 0:p.tables)||[];T(a.filter(x=>(x.mestrePhone?x.mestrePhone.replace(/\D/g,""):"")===t||Q.includes(x.id)))}catch(a){console.error("Falha ao carregar mesas:",a),T([])}finally{s(!1)}},A=async()=>{if(!h||!h.trim()){m("Por favor, insira seu <strong>nome de Mestre</strong> antes de continuar.");return}if(n.replace(/\D/g,"").length<10){m("Número inválido — insira um telefone com <strong>DDD + 9 dígitos</strong>.");return}s(!0);try{const t=await fetch("/api/auth/send-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:h,phone:n})});if(!t.ok)throw new Error(`Server status ${t.status}`);const o=await t.json();t.ok&&o.status==="success"?(E(o.simulatedCode||""),l("code")):m(o.message||"Erro ao enviar código SMS.")}catch(t){console.warn("[AuthScreen] Endpoint falhou. Usando fallback simulado.",t),E(Math.floor(1e5+Math.random()*9e5).toString()),l("code")}finally{s(!1)}},O=async()=>{s(!0);try{const a=await fetch("/api/auth/verify-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:h,phone:n,code:I})});if(!a.ok)throw new Error(`Server status ${a.status}`);const t=await a.json();if(a.ok&&t.status==="success")localStorage.setItem("DM_JWT_TOKEN",t.token),localStorage.setItem("DM_SESSION_ID","DM-"+btoa(n+Date.now()).substring(0,16)),localStorage.setItem("DM_SESSION_START",Date.now().toString()),localStorage.setItem("DM_PHONE",n),localStorage.setItem("DM_MASTER_NAME",t.master.name),localStorage.setItem("DM_MASTER_ID",t.master.masterId),localStorage.setItem("DM_INTERNAL_ID",t.master.internalId),l("tables");else throw new Error(t.message||"Código inválido.")}catch(a){if(console.warn("[AuthScreen] Endpoint falhou. Usando fallback offline.",a),I===M)try{const t=await f.getOrCreateMaster(h,n),o="DM-"+btoa(n+Date.now()).substring(0,16);localStorage.setItem("DM_SESSION_ID",o),localStorage.setItem("DM_SESSION_START",Date.now().toString()),localStorage.setItem("DM_PHONE",n),localStorage.setItem("DM_MASTER_NAME",t.name),localStorage.setItem("DM_MASTER_ID",t.masterId),localStorage.setItem("DM_INTERNAL_ID",t.internalId),localStorage.setItem("DM_JWT_TOKEN","offline_mode"),l("tables")}catch(t){m("Erro ao registrar localmente: "+t.message)}else m("Código incorreto — verifique o código e tente novamente.")}finally{s(!1)}},H=async a=>{s(!0);try{const t=await fetch(`/data/mesa_${a}.json?t=${Date.now()}`);if(t.ok){const o=await t.json();P(a),R(o),l("session_choice")}else localStorage.setItem("DM_ACTIVE_TABLE",a),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${a}.json`),i()}catch(t){m("Erro ao carregar mesa: "+(t.message||"verifique a conexão"))}finally{s(!1)}},$=async()=>{s(!0);try{const a=await f.createTable(n);localStorage.setItem("DM_ACTIVE_TABLE",a.id),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${a.id}.json`),i()}catch(a){m("Erro ao criar mesa: "+(a.message||"falha de rede")),s(!1)}},B=async()=>{const a=prompt("Digite o ID de 6 dígitos da mesa a ser vinculada:");if(!a||!a.trim())return;const t=a.trim();if(!/^\d{6}$/.test(t)){alert("O ID da mesa deve ter exatamente 6 números.");return}s(!0);try{const o=await f.linkTable(t,n);localStorage.setItem("DM_ACTIVE_TABLE",o.id),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${o.id}.json`),m(`Mesa #${o.id} vinculada com sucesso! Carregando...`,!0),setTimeout(()=>i(),1200)}catch{m("Mesa não encontrada — verifique o ID de 6 dígitos e tente novamente."),s(!1)}},X=()=>{localStorage.removeItem("DM_SESSION_ID"),localStorage.removeItem("DM_SESSION_START"),localStorage.removeItem("DM_ACTIVE_TABLE"),localStorage.removeItem("DM_PHONE"),localStorage.removeItem("DM_MASTER_NAME"),localStorage.removeItem("DM_MASTER_ID"),localStorage.removeItem("DM_INTERNAL_ID"),localStorage.removeItem("TOME_ACTIVE_SESSION"),l("phone"),y(""),w("")},G=()=>{localStorage.setItem("DM_ACTIVE_TABLE",b),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${b}.json`),i()},F=async()=>{if(((S==null?void 0:S.sessionNumber)||1)+1,!!confirm("Deseja iniciar um novo capitulo? Os dados da sessao atual serao arquivados no diario e uma nova sessao limpa sera iniciada para os mesmos herois.")){s(!0);try{await f.startNewSession(b),localStorage.setItem("DM_ACTIVE_TABLE",b),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${b}.json`),i()}catch(a){alert("Erro ao iniciar nova sessao: "+a.message),s(!1)}}},q=(a,t)=>{navigator.clipboard.writeText(a).then(()=>{const o=t.currentTarget,p=o.innerHTML;o.innerHTML='<i class="fa-solid fa-check" style="color: #22c55e;"></i> Copiado!',setTimeout(()=>o.innerHTML=p,2e3)})},Y=()=>e(g,{children:[e("p",{className:"auth-description",children:"Digite seu nome de Mestre e número de telefone (com DDD) para confirmar sua identidade arcanamente."}),e("input",{type:"text",className:"auth-input mb-3 font-outfit",placeholder:"Nome do Mestre",value:h,onInput:a=>w(a.target.value),onKeyDown:a=>{var t;return a.key==="Enter"&&((t=document.getElementById("auth-phone"))==null?void 0:t.focus())}}),e("input",{type:"tel",id:"auth-phone",className:"auth-input",placeholder:"(11) 99999-9999",value:n,onInput:a=>{let t=a.target.value.replace(/\D/g,"");t.length>11&&(t=t.slice(0,11)),t.length>2&&(t=`(${t.slice(0,2)}) ${t.slice(2)}`),t.length>10&&(t=`${t.slice(0,10)}-${t.slice(10)}`),y(t)},onKeyDown:a=>a.key==="Enter"&&A()}),e("button",{className:"auth-btn",onClick:A,disabled:d,children:d?e(g,{children:[e("i",{className:"fa-solid fa-spinner fa-spin"})," Enviando..."]}):"Enviar Código SMS"})]}),J=()=>e(g,{children:[e("p",{className:"auth-description",children:["Enviamos um SMS para ",e("strong",{className:"text-tomeGold",children:n}),". Digite o código de 6 dígitos abaixo."]}),e("div",{className:"auth-sim-box",children:[e("i",{className:"fa-solid fa-tower-broadcast"}),e("span",{children:"SIMULAÇÃO: Seu código é:"}),e("span",{className:"auth-sim-code",children:M})]}),e("input",{type:"text",className:"auth-input text-[1.4rem] tracking-[8px]",placeholder:"000000",maxLength:"6",value:I,onInput:a=>j(a.target.value.replace(/\D/g,"")),onKeyDown:a=>a.key==="Enter"&&O()}),e("button",{className:"auth-btn",onClick:O,disabled:d,children:d?e(g,{children:[e("i",{className:"fa-solid fa-spinner fa-spin"})," Autenticando..."]}):"Confirmar e Logar"}),e("button",{className:"auth-back-link",onClick:()=>l("phone"),children:"Voltar"})]}),K=()=>d?e("div",{className:"py-10 flex flex-col items-center justify-center gap-4",children:[e("i",{className:"fa-solid fa-spinner fa-spin text-[2.5rem] text-tomeGold"}),e("p",{className:"text-slate-400 text-[0.9rem] tracking-wide",children:"Invocando o Grimório de Mesas..."})]}):e(g,{children:[D.length===0?e("div",{className:"p-6 rounded-xl bg-white/5 border border-dashed border-tomeGold/20 mb-6 box-border",children:[e("i",{className:"fa-solid fa-folder-open text-3xl text-slate-400 mb-2.5 block"}),e("p",{className:"text-slate-400 text-[0.85rem] leading-relaxed m-0",children:["Você ainda não possui mesas ativas.",e("br",{}),"Crie uma nova mesa ou vincule uma existente abaixo."]})]}):e("div",{className:"tables-scroll-container",children:D.map(a=>e("div",{className:"table-card",children:[e("div",{className:"table-card-header",children:[e("span",{className:"table-card-id",children:[e("i",{className:"fa-solid fa-dungeon"})," MESA #",a.id]}),e("span",{className:"table-card-date",children:new Date(a.createdAt).toLocaleDateString("pt-BR")})]}),e("div",{className:"table-card-body",children:[e("div",{className:"table-stat-badge session-badge",children:[e("i",{className:"fa-solid fa-hourglass-half"})," ",a.sessionNum,"ª Sessão"]}),e("div",{className:"table-stat-badge hero-badge",children:[e("i",{className:"fa-solid fa-shield-halved"})," ",a.heroesCount," ",a.heroesCount===1?"Herói":"Heróis"]})]}),e("button",{className:"table-enter-btn",onClick:()=>H(a.id),children:["Carregar Mesa ",e("i",{className:"fa-solid fa-chevron-right"})]})]},a.id))}),e("div",{className:"grid grid-cols-2 gap-3 mt-4",children:[e("button",{className:"auth-btn-secondary",onClick:$,disabled:d,children:[e("i",{className:"fa-solid fa-plus"})," Nova Mesa"]}),e("button",{className:"auth-btn-secondary",onClick:B,disabled:d,children:[e("i",{className:"fa-solid fa-link"})," Vincular ID"]})]}),e("button",{className:"auth-back-link mt-6",onClick:X,children:[e("i",{className:"fa-solid fa-sign-out-alt"})," Sair da Conta"]})]}),U=()=>{const a=S||{},t=a.sessionNumber||1,o=(a.players||[]).length,p=a.sessionTitle||"Sem Título";return e(g,{children:[e("p",{className:"auth-description text-center mb-5 text-[0.95rem] font-outfit",children:["Mesa ",e("strong",{className:"text-tomeGold",children:["#",b]})," selecionada.",e("br",{}),e("span",{className:"text-[0.85rem] text-slate-400",children:["Sessão Atual: ",e("strong",{className:"text-tomeGold",children:[t,"ª Sessão"]})," (",p,")"]}),e("br",{}),e("span",{className:"text-[0.85rem] text-slate-400",children:["Heróis no Grimório: ",e("strong",{children:o})]})]}),e("div",{className:"flex flex-col gap-3.5 mb-5",children:[e("button",{className:"auth-btn bg-gradient-to-br from-slate-800 to-slate-900 border border-tomeGold/40 text-left p-4 flex flex-col gap-1 h-auto rounded-xl cursor-pointer leading-tight",onClick:G,children:[e("span",{className:"font-cinzel font-extrabold text-base text-white",children:[e("i",{className:"fa-solid fa-play text-green-500 mr-2"})," Continuar Sessão Atual"]}),e("span",{className:"text-xs text-slate-400 font-normal ml-6 whitespace-normal",children:"Continua exatamente de onde parou (combates, notas e logs ativos)."})]}),e("button",{className:"auth-btn bg-gradient-to-br from-red-900 to-red-800 border border-yellow-400 text-left p-4 flex flex-col gap-1 h-auto rounded-xl cursor-pointer leading-tight",onClick:F,disabled:d,children:[d?e("span",{className:"font-cinzel font-extrabold text-base text-white",children:[e("i",{className:"fa-solid fa-spinner fa-spin text-yellow-400 mr-2"})," Arquivando..."]}):e("span",{className:"font-cinzel font-extrabold text-base text-white",children:[e("i",{className:"fa-solid fa-forward text-yellow-400 mr-2"})," Iniciar Nova Sessão (Capítulo ",t+1,")"]}),e("span",{className:"text-xs text-red-300 font-normal ml-6 whitespace-normal",children:"Preserva os Heróis (fichas, itens e XP) e cria um novo capítulo limpo arquivando o anterior."})]})]}),e("button",{className:"auth-back-link bg-transparent border-none text-slate-400 cursor-pointer",onClick:()=>l("tables"),children:[e("i",{className:"fa-solid fa-chevron-left"})," Voltar para as Mesas"]})]})},v=localStorage.getItem("DM_INTERNAL_ID")||"DGH-MST-XXXXXX",W=localStorage.getItem("DM_MASTER_NAME")||h||"Mestre";let _;r==="tables"||r==="session_choice"?_=e(g,{children:[e("h2",{className:"auth-title text-[1.6rem] tracking-wide",children:["Saudações, ",W]}),e("p",{className:"auth-subtitle mb-6",children:["Sessão de Hoje: ",e("span",{className:"text-[0.9rem]",children:new Date().toLocaleDateString("pt-BR")})]})]}):_=e(g,{children:[e("h2",{className:"auth-title",children:"Mesa do Mestre"}),e("p",{className:"auth-subtitle",children:["Acesso Restrito ao ",e("span",{className:"text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] font-extrabold",children:"Mestre"})]})]});let k;if((r==="tables"||r==="session_choice")&&v){let a=v,t="ID Mestre",o=v;r==="session_choice"&&b&&(a=b,t="ID Mesa",o=b),k=e("div",{className:"auth-logo-container",children:[e("img",{src:"assets/logo.png",alt:"Logo",className:"auth-logo"}),e("div",{className:"auth-logo-balloon",onClick:p=>q(o,p),title:"Clique para copiar",children:[t,": ",a," ",e("i",{className:"fa-regular fa-copy ml-1.5 opacity-80"})]})]})}else k=e("div",{className:"auth-logo-container",children:[e("img",{src:"assets/logo.png",alt:"Logo",className:"auth-logo"}),e("div",{className:"auth-logo-balloon",children:["Sua aventura começa aqui! 🧙‍♂️✨",e("br",{}),e("span",{className:"text-[0.7rem] text-[#888]",children:"By Programador"})]})]});return e("div",{className:"auth-card",children:[k,_,N&&e("div",{className:`auth-error-banner ${N.isSuccess?"auth-error-success":""}`,children:[e("span",{className:"auth-error-icon",children:N.isSuccess?"✅":"⚠️"}),e("span",{dangerouslySetInnerHTML:{__html:N.message}})]}),r==="phone"&&Y(),r==="code"&&J(),r==="tables"&&K(),r==="session_choice"&&U()]})}class se{constructor({onLogin:u}){this.onLogin=u}mount(){this.container=document.createElement("div"),this.container.id="auth-screen",this.container.className="fixed inset-0 bg-[#050508] bg-[radial-gradient(circle_at_center,_#23080d_0%,_#050508_100%)] flex flex-col items-center justify-center z-[999999] font-outfit",document.body.appendChild(this.container),Z(),z(e(ee,{closeAuthScreen:()=>this.closeAuthScreen(),initialOnLogin:this.onLogin}),this.container)}closeAuthScreen(){const u=this.container.querySelector(".auth-card");u&&(u.style.animation="authFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"),this.container.style.transition="opacity 0.4s ease",this.container.style.opacity="0",setTimeout(()=>{z(null,this.container),this.container.remove();const r=document.getElementById("auth-screen-styles");r&&r.remove(),this.onLogin&&this.onLogin()},400)}}export{se as AuthScreen};
