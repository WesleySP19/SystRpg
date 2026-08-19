import{_ as x}from"./main-DDqU0aTS.js";import{T as c,k as t}from"./BattleManager-Dgd8rUvr.js";import{R as b}from"./ReactiveComponent-BpM9vWez.js";import{Toast as f}from"./Toast-m0Ci56ke.js";import{M as u}from"./Modal-TR46EOPQ.js";import{a as h}from"./imageExport-Ck9NIU6v.js";import"./Boot-CEGxKzpF.js";import"./PersistenceService-CYwAMgIf.js";import"./FXEngine-DWu1Buon.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class N extends b{constructor(o){super(o),this._loadingCronicle=!1,this._focusedElement=null}get _aiCronicle(){return this.store.state._aiCronicle||""}get _sessionNotes(){return this.store.state.sessionNotes||""}get _sessionTitle(){return this.store.state.sessionTitle||"Aventura de "+new Date().toLocaleDateString()}get _sessionLoot(){return this.store.state.sessionLoot||""}render(){let o=null,n=null,s=null;if(this._mounted&&document.activeElement){const e=document.activeElement;e.id&&(e.id==="session-title-input"||e.id==="session-notes-textarea"||e.id==="session-loot-textarea")&&(o=e.id,n=e.selectionStart,s=e.selectionEnd)}o&&(this._focusedElement={id:o,start:n,end:s}),super.render()}onMount(){if(this._focusedElement){const{id:e,start:a,end:r}=this._focusedElement,i=this.$("#"+e);if(i&&(i.focus(),a!==null&&r!==null))try{i.setSelectionRange(a,r)}catch{}this._focusedElement=null}const o=this.$("#session-title-input"),n=this.$("#session-notes-textarea"),s=this.$("#session-loot-textarea");o&&o.addEventListener("change",e=>{c.store.update(a=>a.sessionTitle=e.target.value)}),n&&n.addEventListener("change",e=>{c.store.update(a=>a.sessionNotes=e.target.value)}),s&&s.addEventListener("change",e=>{c.store.update(a=>a.sessionLoot=e.target.value)})}onUnmount(){var e,a,r;const o=(e=this.$("#session-title-input"))==null?void 0:e.value,n=(a=this.$("#session-notes-textarea"))==null?void 0:a.value,s=(r=this.$("#session-loot-textarea"))==null?void 0:r.value;c.store.update(i=>{o!==void 0&&(i.sessionTitle=o),n!==void 0&&(i.sessionNotes=n),s!==void 0&&(i.sessionLoot=s)})}template(){const{players:o,combatRound:n,sessionNumber:s}=this.store.state;return[t("style",null,`@keyframes journalFadeIn {
                    from { opacity: 0; transform: scale(0.98) translateY(12px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* ══ B-05: @media print — Relatório de Sessão ══ */
                @media print {
                    /* Ocultar toda a UI — mostrar apenas o relatório */
                    body > *:not(#app-root),
                    body > *:not(#app-root) *,
                    .sidebar, .sidebar *, nav, nav *,
                    header, header *,
                    .section-header, .section-subtitle,
                    .btn, button:not(.dnd-report-template button),
                    .toast-container,
                    [data-action],
                    #app-root > *:not(.journal-print-wrapper):not(.page) {
                        display: none !important;
                    }

                    /* Mostrar só o template de impressão */
                    body.print-report-mode .dnd-report-template {
                        display: block !important;
                        position: fixed !important;
                        inset: 0 !important;
                        z-index: 999999 !important;
                        background: #fff !important;
                        color: #000 !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                        max-width: 100% !important;
                        font-family: 'Cinzel', 'Times New Roman', serif !important;
                        font-size: 11pt !important;
                        line-height: 1.5 !important;
                    }

                    /* Garantir que cores sejam impressas */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

                    /* Tipografia */
                    .dnd-report-template h1 { font-size: 22pt; font-weight: 900; text-align: center; margin-bottom: 4mm; }
                    .dnd-report-template h2 { font-size: 14pt; font-weight: 800; border-bottom: 1.5pt solid #000; padding-bottom: 2mm; margin: 6mm 0 3mm; page-break-after: avoid; }
                    .dnd-report-template h3 { font-size: 11pt; font-weight: 700; margin: 4mm 0 2mm; page-break-after: avoid; }
                    .dnd-report-template p, .dnd-report-template li { font-size: 10pt; line-height: 1.6; }

                    /* Evitar quebra no meio de blocos */
                    .dnd-report-template > div,
                    .dnd-report-template section,
                    .dnd-report-template .report-block {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    /* Margens de página */
                    @page {
                        size: A4 portrait;
                        margin: 18mm 20mm;
                    }
                }

                .journal-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 60px;
                    animation: journalFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .journal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(197, 160, 89, 0.2);
                    padding-bottom: 24px;
                    margin-bottom: 35px;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .journal-title-text {
                    font-family: 'Cinzel', serif;
                    font-size: 2.2rem;
                    font-weight: 900;
                    margin: 0;
                    background: linear-gradient(135deg, #ffffff 40%, #e2e8f0 70%, #c5a059 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: 2px;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
                }

                .journal-subtitle-text {
                    font-family: 'Outfit', sans-serif;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    margin: 6px 0 0 0;
                    letter-spacing: 1.2px;
                }

                .journal-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 30px;
                    align-items: start;
                }

                @media (max-width: 950px) {
                    .journal-layout {
                        grid-template-columns: 1fr;
                    }
                }

                .journal-card {
                    background: rgba(15, 12, 16, 0.7);
                    border: 1px solid rgba(197, 160, 89, 0.15);
                    border-radius: 16px;
                    padding: 26px;
                    position: relative;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-sizing: border-box;
                }

                .journal-card:hover {
                    border-color: rgba(197, 160, 89, 0.35);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(197, 160, 89, 0.05);
                }

                .journal-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg, #991b1b, #c5a059, #991b1b);
                    opacity: 0.7;
                    border-radius: 16px 16px 0 0;
                }

                .journal-input-group {
                    margin-bottom: 22px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .journal-label {
                    font-family: 'Cinzel', serif;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #c5a059;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }

                .journal-input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 10px;
                    border: 1px solid rgba(197, 160, 89, 0.2);
                    background: rgba(5, 5, 8, 0.75) !important;
                    color: #fff !important;
                    font-size: 0.9rem;
                    font-family: 'Outfit', sans-serif;
                    outline: none;
                    box-sizing: border-box;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
                }

                .journal-input:focus {
                    border-color: #fbbf24;
                    background: rgba(197, 160, 89, 0.08) !important;
                    box-shadow: 0 0 15px rgba(251, 191, 36, 0.2), inset 0 2px 4px rgba(0,0,0,0.5);
                }

                .journal-textarea-styled {
                    width: 100%;
                    padding: 16px;
                    border-radius: 10px;
                    border: 1px solid rgba(197, 160, 89, 0.15);
                    background: rgba(5, 5, 8, 0.6);
                    color: #fff;
                    font-size: 0.9rem;
                    font-family: 'Outfit', sans-serif;
                    outline: none;
                    box-sizing: border-box;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    resize: vertical;
                    line-height: 1.6;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
                }

                .journal-textarea-styled:focus {
                    border-color: #fbbf24;
                    background: rgba(197, 160, 89, 0.08);
                    box-shadow: 0 0 15px rgba(251, 191, 36, 0.25), inset 0 2px 4px rgba(0,0,0,0.5);
                }

                .stat-pill {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                    transition: all 0.3s ease;
                }

                .stat-pill:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(197, 160, 89, 0.2);
                    transform: translateY(-1px);
                }

                .stat-pill span {
                    color: #94a3b8;
                    font-weight: 500;
                }

                .stat-pill strong {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.95rem;
                }

                /* AI Chronicle Banner */
                .chronicle-container {
                    background: linear-gradient(135deg, rgba(12, 10, 14, 0.85) 0%, rgba(35, 10, 15, 0.85) 100%);
                    border: 1px solid rgba(197, 160, 89, 0.25);
                    border-radius: 16px;
                    padding: 30px;
                    position: relative;
                    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(197, 160, 89, 0.06);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    animation: journalFadeIn 0.5s ease-out forwards;
                }

                .chronicle-container::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg, #c5a059, #991b1b, #c5a059);
                    opacity: 0.8;
                    border-radius: 16px 16px 0 0;
                }

                .chronicle-title {
                    font-family: 'Cinzel', serif;
                    color: #fbbf24;
                    font-size: 1.4rem;
                    font-weight: 800;
                    margin: 0 0 15px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
                }

                .chronicle-text {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1rem;
                    line-height: 1.8;
                    color: #e2e8f0;
                    font-style: italic;
                    white-space: pre-wrap;
                }

                /* Timeline Design */
                .timeline-track {
                    position: relative;
                    padding-left: 50px;
                    margin-top: 15px;
                }

                .timeline-line {
                    position: absolute;
                    left: 20px;
                    top: 5px;
                    bottom: 5px;
                    width: 2px;
                    background: linear-gradient(to bottom, rgba(197,160,89,0) 0%, rgba(197,160,89,0.3) 15%, rgba(197,160,89,0.3) 85%, rgba(197,160,89,0) 100%);
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 24px;
                }

                .timeline-item:last-child {
                    margin-bottom: 0;
                }

                .timeline-badge {
                    position: absolute;
                    left: -50px;
                    top: 4px;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: #0f1115;
                    border: 2px solid var(--badge-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 12px var(--badge-glow);
                    z-index: 2;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .timeline-item:hover .timeline-badge {
                    transform: scale(1.1);
                    box-shadow: 0 0 20px var(--badge-glow);
                }

                .timeline-badge i {
                    font-size: 0.85rem;
                    color: var(--badge-color);
                }

                .timeline-content-card {
                    background: rgba(15, 12, 16, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-left: 3px solid var(--badge-color);
                    border-radius: 12px;
                    padding: 18px 20px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }

                .timeline-content-card:hover {
                    background: rgba(20, 16, 22, 0.65);
                    border-color: rgba(255, 255, 255, 0.08);
                    transform: translateX(4px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
                }

                .timeline-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .timeline-item-title {
                    font-family: 'Cinzel', serif;
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: var(--badge-color);
                    letter-spacing: 0.5px;
                }

                .timeline-item-time {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .timeline-item-body {
                    font-size: 0.85rem;
                    color: #cbd5e1;
                    line-height: 1.5;
                    margin: 0;
                }

                /* Magical/Premium buttons */
                .btn-magic {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #c5a059 100%);
                    color: #fff;
                    border: 1px solid rgba(197, 160, 89, 0.4);
                    border-radius: 10px;
                    font-family: 'Cinzel', serif;
                    font-weight: 800;
                    font-size: 0.85rem;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    box-shadow: 0 4px 15px rgba(153, 27, 27, 0.4);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-magic:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4), 0 0 15px rgba(197, 160, 89, 0.3);
                    background: linear-gradient(135deg, #991b1b 0%, #b91c1c 40%, #fbbf24 100%);
                    border-color: #fbbf24;
                }

                .btn-magic:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    background: #1a1d23;
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: none;
                }

                .btn-premium {
                    padding: 12px 24px;
                    background: rgba(197, 160, 89, 0.08);
                    border: 1px solid rgba(197, 160, 89, 0.35);
                    color: #c5a059;
                    border-radius: 10px;
                    font-family: 'Cinzel', serif;
                    font-weight: 800;
                    font-size: 0.85rem;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-premium:hover {
                    background: rgba(197, 160, 89, 0.18);
                    border-color: #fbbf24;
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(197, 160, 89, 0.2);
                }`),t("div",{class:"journal-page"},t("div",{class:"journal-header"},t("div",null,t("h2",{class:"journal-title-text"},t("i",{class:"fa-solid fa-scroll",style:"margin-right:12px; color: #c5a059;"}),"Diário de Sessão"),t("p",{class:"journal-subtitle-text"},"Registre as crônicas da sua campanha e gere relatos oficiais de aventura")),t("div",{style:"display:flex; gap:12px;"},t("button",{class:"btn btn-magic","data-action":"generateAICronicle"},this._loadingCronicle?[t("i",{class:"fa-solid fa-spinner fa-spin"})," Tecendo história..."]:[t("i",{class:"fa-solid fa-wand-magic-sparkles"})," Gerar Crônica IA"]),t("button",{class:"btn btn-premium","data-action":"exportReport"},t("i",{class:"fa-solid fa-file-export"})," Exportar Relatório"),t("button",{class:"btn btn-premium",style:"border-color: #66fcf1; color: #66fcf1; background: rgba(102, 252, 241, 0.05);","data-action":"exportSummaryPNG",title:"Exportar imagem para Discord/WhatsApp"},t("i",{class:"fa-solid fa-image"})," Cartão PNG"))),t("div",{class:"journal-layout"},t("div",{style:"display:flex; flex-direction:column; gap:24px;"},t("div",{class:"journal-card"},t("h3",{style:"font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 20px 0; display:flex; align-items:center; gap:8px;"},t("i",{class:"fa-solid fa-chart-simple"})," Status da Aventura"),t("div",{class:"journal-input-group"},t("label",{class:"journal-label"},"Título da Sessão"),t("input",{type:"text",id:"session-title-input",class:"journal-input",value:this._sessionTitle,placeholder:"Ex: O Despertar do Dragão"})),t("div",{style:"display:flex; flex-direction:column; gap:10px;"},t("div",{class:"stat-pill"},t("span",null,"Heróis Ativos"),t("strong",{style:"color:#60a5fa;"},t("i",{class:"fa-solid fa-shield-halved",style:"margin-right:4px;"})," ",(o==null?void 0:o.length)||0)),t("div",{class:"stat-pill"},t("span",null,"Combates (Rodadas)"),t("strong",{style:"color:#f87171;"},t("i",{class:"fa-solid fa-swords",style:"margin-right:4px;"})," ",n||0)),t("div",{class:"stat-pill"},t("span",null,"Sessão Atual"),t("strong",{style:"color:#a78bfa;"},t("i",{class:"fa-solid fa-hashtag",style:"margin-right:4px;"})," ",s||1)),t("div",{class:"stat-pill"},t("span",null,"Data de Registro"),t("strong",{style:"color:#fbbf24;"},t("i",{class:"fa-solid fa-calendar-days",style:"margin-right:4px;"})," ",new Date().toLocaleDateString("pt-BR"))))),this.store.state.sessionsHistory&&this.store.state.sessionsHistory.length>0?t("div",{class:"journal-card",style:"margin-top: 10px;"},t("h3",{style:"font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;"},t("i",{class:"fa-solid fa-clock-rotate-left"})," Crônicas Passadas (",this.store.state.sessionsHistory.length,")"),t("div",{style:"display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;"},this.store.state.sessionsHistory.map(e=>t("div",{class:"tome-hover-row",style:"background:rgba(255,255,255,0.02); border:1px solid rgba(197,160,89,0.15); border-radius:8px; padding:10px; font-size:0.8rem; cursor:pointer;","data-action":"viewPastSession","data-id":e.sessionNumber},t("div",{style:"display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; width:100%;"},t("strong",{style:"color:#fbbf24;"},"Sessão #",e.sessionNumber),t("span",{style:"font-size:0.7rem; color:#64748b; margin-left:auto;"},new Date(e.timestamp).toLocaleDateString("pt-BR"))),t("div",{style:"color:#e2e8f0; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"},e.sessionTitle))))):"",t("div",{class:"journal-card"},t("h3",{style:"font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;"},t("i",{class:"fa-solid fa-coins"})," Tesouros & Feitos"),t("textarea",{id:"session-loot-textarea",class:"journal-textarea-styled",rows:"5",placeholder:"Itens mágicos, ouro, segredos ou conquistas épicas dos heróis..."},this._sessionLoot))),t("div",{style:"display:flex; flex-direction:column; gap:24px;"},t("div",{class:"journal-card"},t("h3",{style:"font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;"},t("i",{class:"fa-solid fa-book-open"})," Registro Crônico (Manual)"),t("textarea",{id:"session-notes-textarea",class:"journal-textarea-styled",style:"min-height: 250px; font-size:0.95rem; line-height:1.7;",placeholder:"Comece a redigir a história e os acontecimentos memoráveis desta sessão aqui..."},this._sessionNotes)),this._aiCronicle?t("div",{class:"chronicle-container animate-fadeIn"},t("h3",{class:"chronicle-title"},t("i",{class:"fa-solid fa-wand-magic-sparkles"})," A Crônica do Bardo Real"),t("div",{class:"chronicle-text"},this._aiCronicle),t("div",{style:"display:flex; justify-content:flex-end; margin-top:18px;"},t("button",{class:"btn btn-premium",style:"font-size:0.75rem; padding:8px 16px;","data-action":"copyCronicle"},t("i",{class:"fa-solid fa-copy"})," Copiar Crônica"))):"",t("div",{class:"journal-card"},t("h3",{style:"font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 20px 0; display:flex; align-items:center; gap:8px;"},t("i",{class:"fa-solid fa-hourglass-half"})," Linha do Tempo da Sessão"),t("div",{style:"display:flex; gap:10px; margin-bottom:25px;"},t("input",{type:"text",id:"manual-event-input",class:"journal-input",placeholder:"Adicionar evento (Ex: Dia 3 - Encontro na taverna)...",style:"flex:1;"}),t("button",{class:"btn btn-primary","data-action":"addManualEvent",style:"padding:12px 20px; border-radius:10px;"},t("i",{class:"fa-solid fa-plus"}))),t("div",{class:"timeline-track"},t("div",{class:"timeline-line"}),(this.store.state.journalEntries||[]).slice().reverse().map(e=>{const a=e.type||"info",r={combat:"fa-swords",loot:"fa-coins",social:"fa-comments",info:"fa-scroll",oracle:"fa-wand-magic-sparkles"},i={combat:"#ef4444",loot:"#22c55e",social:"#3b82f6",info:"#c5a059",oracle:"#a855f7"},l={combat:"rgba(239, 68, 68, 0.35)",loot:"rgba(34, 197, 94, 0.35)",social:"rgba(59, 130, 246, 0.35)",info:"rgba(197, 160, 89, 0.35)",oracle:"rgba(168, 85, 247, 0.35)"},d=i[a]||i.info,p=l[a]||l.info,m=r[a]||r.info;return t("div",{class:"timeline-item",style:"--badge-color: "+d+"; --badge-glow: "+p+";"},t("div",{class:"timeline-badge"},t("i",{class:"fa-solid "+m})),t("div",{class:"timeline-content-card"},t("div",{class:"timeline-item-header"},t("div",null,t("span",{class:"timeline-item-title"},e.title||"Evento"),t("span",{class:"timeline-item-time",style:"margin-left:10px;"},new Date(e.timestamp||Date.now()).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}))),t("button",{class:"btn btn-ghost btn-sm","data-action":"deleteEvent","data-id":e.id,style:"color:var(--danger); padding:4px 8px; border-radius:6px;"},t("i",{class:"fa-solid fa-trash-can"}))),t("p",{class:"timeline-item-body"},e.content)))}).join("")||t("div",{style:"text-align:center; padding:40px 0; color:#64748b;"},t("i",{class:"fa-solid fa-feather",style:"font-size:2rem; opacity:0.3; margin-bottom:12px; display:block;"}),t("span",{style:"font-size:0.85rem; font-style:italic;"},"Nenhum evento registrado nesta linha do tempo ainda..."))))))),this._renderReportTemplate()]}async generateAICronicle(){var a,r,i;const o=((a=this.$("#session-title-input"))==null?void 0:a.value)||"",n=((r=this.$("#session-notes-textarea"))==null?void 0:r.value)||"",s=((i=this.$("#session-loot-textarea"))==null?void 0:i.value)||"";c.store.update(l=>{l.sessionTitle=o,l.sessionNotes=n,l.sessionLoot=s});const e=this.store.state.journalEntries||[];if(e.length===0&&!n){f.show("Escreva algumas notas ou comece o combate para ter fatos a narrar!","warning");return}this._loadingCronicle=!0,this.render();try{const d=`Como um bardo medieval lendário, teça uma crônica literária emocionante e poética (máximo 4 parágrafos) narrando os acontecimentos desta sessão de RPG.
            Escreva em português medieval literário e dramático.
            
            FATOS DA LINHA DO TEMPO:
            ${e.map(m=>`[${m.type.toUpperCase()}] ${m.title}: ${m.content}`).join(`
`)}
            
            TESOUROS ENCONTRADOS:
            ${s}
            
            ANOTAÇÕES DO MESTRE:
            ${n}
            
            Foque nos heróis e no destino que os aguarda.`,p=await c.ai.ask(d);c.store.update(m=>{m._aiCronicle=p}),f.show("A crônica foi tecida pelos deuses!","success")}catch{f.show("O bardo está sem voz agora... Tente novamente.","danger")}finally{this._loadingCronicle=!1,this.render()}}addManualEvent(){const o=this.$("#manual-event-input");!o||!o.value.trim()||(c.store.update(n=>{n.journalEntries||(n.journalEntries=[]),n.journalEntries.push({id:Date.now(),timestamp:Date.now(),date:new Date().toLocaleDateString("pt-BR"),type:"info",title:"Anotação do Mestre",content:o.value.trim()})}),o.value="",x(()=>import("./Toast-m0Ci56ke.js"),[]).then(n=>n.Toast.show("Evento adicionado à linha do tempo!","success")),this.render())}deleteEvent(o,n){const s=n.dataset.id;!s||!confirm("Remover este evento da linha do tempo?")||(c.store.update(e=>{e.journalEntries&&(e.journalEntries=e.journalEntries.filter(a=>String(a.id)!==String(s)))}),x(()=>import("./Toast-m0Ci56ke.js"),[]).then(e=>e.Toast.show("Evento removido.","info")),this.render())}viewPastSession(o,n){const s=parseInt(n.dataset.id),e=(this.store.state.sessionsHistory||[]).find(d=>d.sessionNumber===s);if(!e)return;const a=new Date(e.timestamp).toLocaleDateString("pt-BR"),r=e.sessionNotes?e.sessionNotes:"Nenhuma nota registrada.",i=e.sessionLoot?e.sessionLoot:"Nenhum tesouro registrado.",l=(e.journalEntries||[]).map(d=>t("div",{style:"margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.05); font-size:0.8rem;"},t("span",{style:"color:#c5a059; font-weight:bold;"},"[",d.type.toUpperCase(),"]")," ",t("strong",null,d.title,":")," ",d.content)).join("")||"Sem eventos registrados.";u.show({title:`Sessão #${e.sessionNumber}`,content:t("div",{style:"max-height:60vh; overflow-y:auto; padding-right:8px; text-align:left; font-family:'Outfit', sans-serif;"},t("div",{style:"text-align:center; margin-bottom:15px; border-bottom:1px solid rgba(197,160,89,0.15); padding-bottom:10px;"},t("h3",{style:"font-family:'Cinzel', serif; color:#fbbf24; margin:0; font-size:1.3rem;"},e.sessionTitle),t("span",{style:"font-size:0.75rem; color:#64748b;"},"Registrada em ",a)),t("h4",{style:"font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;"},t("i",{class:"fa-solid fa-book-open",style:"margin-right:6px;"})," Notas Narrativas"),t("p",{style:"color:#cbd5e1; font-size:0.8rem; line-height:1.5; margin:0; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; white-space:pre-wrap;"},r),t("h4",{style:"font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;"},t("i",{class:"fa-solid fa-coins",style:"margin-right:6px;"})," Tesouros & Feitos"),t("p",{style:"color:#cbd5e1; font-size:0.8rem; line-height:1.5; margin:0; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; white-space:pre-wrap;"},i),t("h4",{style:"font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;"},t("i",{class:"fa-solid fa-list-ul",style:"margin-right:6px;"})," Eventos da Sessão"),t("div",{style:"background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; color:#cbd5e1;"},l)),type:"info"})}copyCronicle(){this._aiCronicle&&(navigator.clipboard.writeText(this._aiCronicle),f.show("Crônica copiada com sucesso!","success"))}exportReport(){var e,a,r;const o=((e=this.$("#session-title-input"))==null?void 0:e.value)||"",n=((a=this.$("#session-notes-textarea"))==null?void 0:a.value)||"",s=((r=this.$("#session-loot-textarea"))==null?void 0:r.value)||"";c.store.update(i=>{i.sessionTitle=o,i.sessionNotes=n,i.sessionLoot=s}),f.show("Gerando relatório ilustrado para impressão...","info"),document.body.classList.add("print-report-mode"),window.print(),setTimeout(()=>document.body.classList.remove("print-report-mode"),500)}async exportSummaryPNG(){var i,l,d;const o=((i=this.$("#session-title-input"))==null?void 0:i.value)||this._sessionTitle,n=((l=this.$("#session-notes-textarea"))==null?void 0:l.value)||this._sessionNotes,s=((d=this.$("#session-loot-textarea"))==null?void 0:d.value)||this._sessionLoot,{players:e,sessionNumber:a,journalEntries:r}=this.store.state;c.store.update(p=>{p.sessionTitle=o,p.sessionNotes=n,p.sessionLoot=s}),f.show("Renderizando cartão místico PNG da sessão...","info");try{const p=(r||[]).map(g=>`• [${g.title}] ${g.content}`).join(`
`),m=this._aiCronicle||p||n;await h({title:o,sessionNumber:a||1,date:new Date().toLocaleDateString("pt-BR"),players:e||[],loot:s,chronicle:m,notes:n}),f.show("Cartão PNG gerado e baixado com sucesso!","success")}catch(p){console.error("[SessionJournal] Erro ao exportar PNG:",p),f.show("Falha ao exportar cartão PNG. Tente novamente.","danger")}}_renderReportTemplate(){const{players:o,combatRound:n,journalEntries:s,sessionNumber:e}=this.store.state,a=this._sessionLoot||"Nenhum item especial registrado.",r=new Date().toLocaleDateString("pt-BR");return t("div",{class:"dnd-report-template",style:"box-sizing:border-box; width:100%; max-width:800px; margin:0 auto; padding:40px; background:#ffffff; color:#000000; font-family:'Outfit', sans-serif;"},t("div",{style:"text-align:center; border-bottom:3px double #000; padding-bottom:20px; margin-bottom:30px;"},t("span",{style:"font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; font-family:'Cinzel';"},"Relatório Oficial de Aventura"),t("h1",{style:"font-family:'Cinzel', serif; font-size:28px; font-weight:900; margin:10px 0 5px; text-transform:uppercase; color:#000;"},this._sessionTitle),t("span",{style:"font-size:11px; color:#555; font-weight:700;"},"Sessão Nº ",e||1," • Data: ",r," • Gerado pelo Grimório RPG")),t("div",{style:"display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-bottom:30px;"},t("div",{style:"border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;"},t("strong",{style:"display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;"},"👥 Heróis Ativos"),t("ul",{style:"margin:0; padding-left:20px; font-size:11px; line-height:1.6; color:#222;"},(o||[]).map(i=>t("li",null,t("strong",null,i.name)," (",i.race," ",i.class," Nív ",i.level,")")).join("")||"<li>Nenhum herói ativo.</li>")),t("div",{style:"border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;"},t("strong",{style:"display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;"},"⚔️ Resumo de Combate"),t("div",{style:"font-size:11px; line-height:1.8; color:#222;"},t("div",null,"Rodadas Totais de Combate: ",t("strong",null,n||0," rodadas")),t("div",{style:"margin-top:6px;"},"Tesouros Adquiridos:"),t("div",{style:"font-style:italic; color:#333; padding-left:10px; white-space:pre-wrap;"},a)))),this._aiCronicle?t("div",{style:"border:1.5px solid #000; padding:20px; border-radius:8px; background:#fffcf5; margin-bottom:35px; box-shadow:inset 0 0 10px rgba(0,0,0,0.02);"},t("strong",{style:"display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; font-family:'Cinzel'; font-size:13px; text-transform:uppercase; color:#8b1e0f;"},"📖 A Crônica do Bardo"),t("p",{style:"font-size:11px; line-height:1.8; color:#111; font-style:italic; margin:0; white-space:pre-wrap;"},this._aiCronicle)):"",t("div",{style:"margin-bottom:35px;"},t("strong",{style:"display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;"},"📝 Notas Narrativas do Mestre"),t("p",{style:"font-size:11px; line-height:1.6; color:#222; margin:0; white-space:pre-wrap;"},this._sessionNotes||"Nenhuma nota narrativa registrada.")),t("div",null,t("strong",{style:"display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:15px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;"},"⏳ Linha do Tempo dos Acontecimentos"),t("div",{style:"display:flex; flex-direction:column; gap:10px; padding-left:10px;"},(s||[]).map(i=>t("div",{style:"border-left:2px solid #000; padding-left:12px; font-size:10.5px; line-height:1.5;"},t("div",{style:"font-weight:800; color:#555; font-size:9.5px; text-transform:uppercase;"},new Date(i.timestamp||Date.now()).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})," - ",i.title||"Evento"),t("div",{style:"color:#222; margin-top:2px;"},i.content))).join("")||t("div",{style:"font-size:11px; color:#555; font-style:italic;"},"Nenhum evento registrado nesta linha do tempo..."))),t("div",{style:"margin-top:50px; border-top:1px solid #ddd; padding-top:15px; text-align:center; font-size:9px; color:#777;"},"Documento de Campanha Oficial • Domínio RPG v10.0"))}}export{N as SessionJournal};
