import{R as I,d as T,A as q,h as U,T as c}from"./FXEngine-BAazb45g.js";import{a as g,u as Y,m as C}from"./Boot-0-7AJiQi.js";import{Toast as h}from"./Toast-m0Ci56ke.js";import{e as J}from"./imageExport-BGvIrfaA.js";import"./main-Z61bTTRY.js";import"./tailwind-CVCQhc7L.js";function V({title:N,content:a,type:r,onConfirm:m,onCancel:x,onClose:z}){const w=r==="danger"?"fa-triangle-exclamation":r==="confirm"?"fa-circle-question":"fa-circle-info",$=r==="danger"?"border-red-500":"border-tomeGold",y=r==="danger"?"text-red-500":"text-tomeGold",f=r==="danger"?"bg-red-500 hover:bg-red-600":"bg-tomeGold hover:bg-tomeGold-bright",d=typeof a=="string"?a.split(`
`).map((E,j)=>g("span",{children:[E,g("br",{})]},j)):a;return g("div",{class:"modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-5 animate-in fade-in duration-300",children:g("div",{class:`modal-card relative w-full max-w-[500px] border-t-4 ${$} bg-obsidian-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden animate-in zoom-in-95 duration-300`,children:[g("div",{class:"modal-header px-6 py-5 border-b border-white/5 flex items-center gap-3",children:[g("i",{class:`fa-solid ${w} ${y} text-xl`}),g("h2",{class:"m-0 font-cinzel text-lg font-bold tracking-wide text-slate-100",children:N})]}),g("div",{class:"modal-body px-7 py-6 text-sm text-slate-300 leading-relaxed font-sans",children:d}),g("div",{class:"modal-footer px-7 py-4 bg-black/40 flex justify-end gap-3",children:[(r==="confirm"||r==="danger")&&g("button",{class:"px-4 py-2 rounded-lg font-sans text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-slate-200 transition-colors",onClick:x,children:"CANCELAR"}),g("button",{class:`px-6 py-2 rounded-lg font-sans text-sm font-semibold text-white ${f} min-w-[100px] transition-colors shadow-lg`,onClick:m,children:r==="confirm"||r==="danger"?"CONFIRMAR":"OK"})]})]})})}class k{static show(a){const r=document.createElement("div");r.id=`modal-${Date.now()}`,document.body.appendChild(r);const m=()=>{I(null,r),r.remove()},x=()=>{a.onConfirm&&a.onConfirm(),m()},z=()=>{a.onCancel&&a.onCancel(),m()};I(g(V,{title:a.title||"Aviso",content:a.content||"",type:a.type||"info",onConfirm:x,onCancel:z,onClose:m}),r)}static confirm(a,r,m="confirm"){return new Promise(x=>{k.show({title:a,content:r,type:m,onConfirm:()=>x(!0),onCancel:()=>x(!1)})})}static alert(a,r,m="info"){return new Promise(x=>{k.show({title:a,content:r,type:m,onConfirm:()=>x(!0)})})}}function te(N){var R;const a=Y(),[r,m]=T(!1),[x,z]=T(null),w=q(null),[,$]=T(0),y=()=>$(t=>t+1),f=((R=window.TOME)==null?void 0:R.store)||{state:a},d=t=>w.current?w.current.querySelector(t):null;function E(){if(x){const{id:e,start:s,end:l}=x,n=d("#"+e);if(n&&(n.focus(),s!==null&&l!==null))try{n.setSelectionRange(s,l)}catch{}z(null)}const t=d("#session-title-input"),o=d("#session-notes-textarea"),i=d("#session-loot-textarea");t&&t.addEventListener("change",e=>{c.store.update(s=>s.sessionTitle=e.target.value)}),o&&o.addEventListener("change",e=>{c.store.update(s=>s.sessionNotes=e.target.value)}),i&&i.addEventListener("change",e=>{c.store.update(s=>s.sessionLoot=e.target.value)})}function j(){var e,s,l;const t=(e=d("#session-title-input"))==null?void 0:e.value,o=(s=d("#session-notes-textarea"))==null?void 0:s.value,i=(l=d("#session-loot-textarea"))==null?void 0:l.value;c.store.update(n=>{t!==void 0&&(n.sessionTitle=t),o!==void 0&&(n.sessionNotes=o),i!==void 0&&(n.sessionLoot=i)})}const L=t=>{const o=t.target.closest("[data-action]");if(o){const i=o.dataset.action;i==="generateAICronicle"&&O(),i==="exportReport"&&B(),i==="exportSummaryPNG"&&F(),i==="viewPastSession"&&P(t,o),i==="copyCronicle"&&_(),i==="addManualEvent"&&G(),i==="deleteEvent"&&M(t,o),i==="closeModal"&&closeModal(t,o)}},S=t=>{var i;const o=(i=t.target)==null?void 0:i.id;o==="session-title-input"?c.store.update(e=>e.sessionTitle=t.target.value):o==="session-notes-textarea"?c.store.update(e=>e.sessionNotes=t.target.value):o==="session-loot-textarea"&&c.store.update(e=>e.sessionLoot=t.target.value)};U(()=>(E(),()=>j()),[]);function D(){const{players:t,combatRound:o,sessionNumber:i}=f.state;return`
            <style>
                @keyframes journalFadeIn {
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
                }
            </style>

            <div class="journal-page p-6 max-w-[1200px] mx-auto animate-fadeIn relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div class="journal-header flex flex-wrap justify-between items-end border-b border-white/10 pb-6 mb-8">
                    <div>
                        <h2 class="journal-title-text font-cinzel text-3xl font-bold m-0 text-white flex items-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]"><i class="fa-solid fa-scroll text-accent"></i>Diário de Sessão</h2>
                        <p class="journal-subtitle-text font-outfit text-sm text-slate-400 mt-2 uppercase tracking-widest">Registre as crônicas da sua campanha e gere relatos oficiais de aventura</p>
                    </div>
                    <div style="display:flex; gap:12px;" class="mt-4 lg:mt-0">
                        <button class="btn btn-magic" data-action="generateAICronicle" ${r?"disabled":""}>
                            ${r?'<i class="fa-solid fa-spinner fa-spin"></i> Tecendo história...':'<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Crônica IA'}
                        </button>
                        <button class="btn btn-premium" data-action="exportReport">
                            <i class="fa-solid fa-file-export"></i> Exportar Relatório
                        </button>
                        <button class="btn btn-premium" style="border-color: #66fcf1; color: #66fcf1; background: rgba(102, 252, 241, 0.05);" data-action="exportSummaryPNG" title="Exportar imagem para Discord/WhatsApp">
                            <i class="fa-solid fa-image"></i> Cartão PNG
                        </button>
                    </div>
                </div>

                <div class="journal-layout grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- LEFT SIDE: STATS & LOOT -->
                    <div class="flex flex-col gap-6">
                        <!-- SESSION STATS -->
                        <div class="journal-card bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl hover:border-accent/30 transition-colors">
                            <h3 class="font-cinzel text-accent text-lg font-bold flex items-center gap-2 mb-5 border-b border-white/10 pb-3">
                                <i class="fa-solid fa-chart-simple"></i> Status da Aventura
                            </h3>
                            
                            <div class="journal-input-group flex flex-col gap-2 mb-6">
                                <label class="journal-label text-[0.65rem] uppercase tracking-widest text-slate-400 font-bold">Título da Sessão</label>
                                <input type="text" id="session-title-input" class="journal-input bg-black/50 border border-white/10 p-3 rounded-lg text-white font-cinzel focus:border-accent outline-none w-full transition-colors" value="${a.sessionTitle}" placeholder="Ex: O Despertar do Dragão" />
                            </div>

                            <div class="flex flex-col gap-3">
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Heróis Ativos</span>
                                    <strong class="text-blue-400"><i class="fa-solid fa-shield-halved mr-1.5"></i> ${(t==null?void 0:t.length)||0}</strong>
                                </div>
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Combates</span>
                                    <strong class="text-red-400"><i class="fa-solid fa-swords mr-1.5"></i> ${o||0}</strong>
                                </div>
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Sessão Atual</span>
                                    <strong class="text-purple-400"><i class="fa-solid fa-hashtag mr-1.5"></i> ${i||1}</strong>
                                </div>
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Data</span>
                                    <strong class="text-accent"><i class="fa-solid fa-calendar-days mr-1.5"></i> ${new Date().toLocaleDateString("pt-BR")}</strong>
                                </div>
                            </div>
                        </div>

                        <!-- CAPITULOS ANTERIORES -->
                        ${f.state.sessionsHistory&&f.state.sessionsHistory.length>0?`
                        <div class="journal-card" style="margin-top: 10px;">
                            <h3 style="font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-clock-rotate-left"></i> Crônicas Passadas (${f.state.sessionsHistory.length})
                            </h3>
                            <div style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;">
                                ${f.state.sessionsHistory.map(e=>`
                                    <div class="tome-hover-row" style="background:rgba(255,255,255,0.02); border:1px solid rgba(197,160,89,0.15); border-radius:8px; padding:10px; font-size:0.8rem; cursor:pointer;" 
                                         data-action="viewPastSession" data-id="${e.sessionNumber}">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; width:100%;">
                                            <strong style="color:#fbbf24;">Sessão #${e.sessionNumber}</strong>
                                            <span style="font-size:0.7rem; color:#64748b; margin-left:auto;">${new Date(e.timestamp).toLocaleDateString("pt-BR")}</span>
                                        </div>
                                        <div style="color:#e2e8f0; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.sessionTitle}</div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                        `:""}

                        <!-- LOOT & FEATS -->
                        <div class="journal-card">
                            <h3 style="font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-coins"></i> Tesouros & Feitos
                            </h3>
                            <textarea id="session-loot-textarea" class="journal-textarea-styled" rows="5" placeholder="Itens mágicos, ouro, segredos ou conquistas épicas dos heróis...">${a.sessionLoot}</textarea>
                        </div>
                    </div>

                    <!-- RIGHT SIDE: NARRATIVE & TIMELINE -->
                    <div style="display:flex; flex-direction:column; gap:24px;">
                        <!-- NARRATIVE TEXTAREA -->
                        <div class="journal-card">
                            <h3 style="font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-book-open"></i> Registro Crônico (Manual)
                            </h3>
                            <textarea id="session-notes-textarea" class="journal-textarea-styled" style="min-height: 250px; font-size:0.95rem; line-height:1.7;" 
                                      placeholder="Comece a redigir a história e os acontecimentos memoráveis desta sessão aqui...">${a.sessionNotes}</textarea>
                        </div>

                        <!-- AI CRONICLE BANNER -->
                        ${a._aiCronicle?`
                            <div class="chronicle-container animate-fadeIn">
                                <h3 class="chronicle-title">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i> A Crônica do Bardo Real
                                </h3>
                                <div class="chronicle-text">${a._aiCronicle}</div>
                                <div style="display:flex; justify-content:flex-end; margin-top:18px;">
                                    <button class="btn btn-premium" style="font-size:0.75rem; padding:8px 16px;" data-action="copyCronicle">
                                        <i class="fa-solid fa-copy"></i> Copiar Crônica
                                    </button>
                                </div>
                            </div>
                        `:""}

                        <!-- EVENT TIMELINE -->
                        <div class="journal-card">
                            <h3 style="font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 20px 0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-hourglass-half"></i> Linha do Tempo da Sessão
                            </h3>

                            <div style="display:flex; gap:10px; margin-bottom:25px;">
                                <input type="text" id="manual-event-input" class="journal-input" placeholder="Adicionar evento (Ex: Dia 3 - Encontro na taverna)..." style="flex:1;" />
                                <button class="btn btn-primary" data-action="addManualEvent" style="padding:12px 20px; border-radius:10px;"><i class="fa-solid fa-plus"></i></button>
                            </div>

                            <div class="timeline-track">
                                <div class="timeline-line"></div>
                                
                                ${(f.state.journalEntries||[]).slice().reverse().map(e=>{const s=e.type||"info",l={combat:"fa-swords",loot:"fa-coins",social:"fa-comments",info:"fa-scroll",oracle:"fa-wand-magic-sparkles"},n={combat:"#ef4444",loot:"#22c55e",social:"#3b82f6",info:"#c5a059",oracle:"#a855f7"},p={combat:"rgba(239, 68, 68, 0.35)",loot:"rgba(34, 197, 94, 0.35)",social:"rgba(59, 130, 246, 0.35)",info:"rgba(197, 160, 89, 0.35)",oracle:"rgba(168, 85, 247, 0.35)"},b=n[s]||n.info,u=p[s]||p.info,v=l[s]||l.info;return`
                                        <div class="timeline-item" style="--badge-color: ${b}; --badge-glow: ${u};">
                                            <div class="timeline-badge">
                                                <i class="fa-solid ${v}"></i>
                                            </div>
                                            <div class="timeline-content-card">
                                                <div class="timeline-item-header">
                                                    <div>
                                                        <span class="timeline-item-title">${e.title||"Evento"}</span>
                                                        <span class="timeline-item-time" style="margin-left:10px;">${new Date(e.timestamp||Date.now()).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                                                    </div>
                                                    <button class="btn btn-ghost btn-sm" data-action="deleteEvent" data-id="${e.id}" style="color:var(--danger); padding:4px 8px; border-radius:6px;"><i class="fa-solid fa-trash-can"></i></button>
                                                </div>
                                                <p class="timeline-item-body">${e.content}</p>
                                            </div>
                                        </div>
                                    `}).join("")||`
                                    <div style="text-align:center; padding:40px 0; color:#64748b;">
                                        <i class="fa-solid fa-feather" style="font-size:2rem; opacity:0.3; margin-bottom:12px; display:block;"></i>
                                        <span style="font-size:0.85rem; font-style:italic;">Nenhum evento registrado nesta linha do tempo ainda...</span>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${H()}
        `}async function O(){var s,l,n;const t=((s=d("#session-title-input"))==null?void 0:s.value)||"",o=((l=d("#session-notes-textarea"))==null?void 0:l.value)||"",i=((n=d("#session-loot-textarea"))==null?void 0:n.value)||"";c.store.update(p=>{p.sessionTitle=t,p.sessionNotes=o,p.sessionLoot=i});const e=f.state.journalEntries||[];if(e.length===0&&!o){h.show("Escreva algumas notas ou comece o combate para ter fatos a narrar!","warning");return}m(!0),y();try{const b=`Como um bardo medieval lendário, teça uma crônica literária emocionante e poética (máximo 4 parágrafos) narrando os acontecimentos desta sessão de RPG.
            Escreva em português medieval literário e dramático.
            
            FATOS DA LINHA DO TEMPO:
            ${e.map(v=>`[${v.type.toUpperCase()}] ${v.title}: ${v.content}`).join(`
`)}
            
            TESOUROS ENCONTRADOS:
            ${i}
            
            ANOTAÇÕES DO MESTRE:
            ${o}
            
            Foque nos heróis e no destino que os aguarda.`,u=await c.ai.ask(b);c.store.update(v=>{v._aiCronicle=u}),h.show("A crônica foi tecida pelos deuses!","success")}catch{h.show("O bardo está sem voz agora... Tente novamente.","danger")}finally{m(!1),y()}}function G(){const t=d("#manual-event-input");!t||!t.value.trim()||(c.store.update(o=>{o.journalEntries||(o.journalEntries=[]),o.journalEntries.push({id:Date.now(),timestamp:Date.now(),date:new Date().toLocaleDateString("pt-BR"),type:"info",title:"Anotação do Mestre",content:t.value.trim()})}),t.value="",h.show("Evento adicionado à linha do tempo!","success"),y())}function M(t,o){const i=o.dataset.id;!i||!confirm("Remover este evento da linha do tempo?")||(c.store.update(e=>{e.journalEntries&&(e.journalEntries=e.journalEntries.filter(s=>String(s.id)!==String(i)))}),h.show("Evento removido.","info"),y())}function P(t,o){const i=parseInt(o.dataset.id),e=(f.state.sessionsHistory||[]).find(b=>b.sessionNumber===i);if(!e)return;const s=new Date(e.timestamp).toLocaleDateString("pt-BR"),l=e.sessionNotes?e.sessionNotes:"Nenhuma nota registrada.",n=e.sessionLoot?e.sessionLoot:"Nenhum tesouro registrado.",p=(e.journalEntries||[]).map(b=>C`
            <div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.05); font-size:0.8rem;">
                <span style="color:#c5a059; font-weight:bold;">[${b.type.toUpperCase()}]</span> <strong>${b.title}:</strong> ${b.content}
            </div>
        `);k.show({title:`Sessão #${e.sessionNumber}`,content:C`
                <div style="max-height:60vh; overflow-y:auto; padding-right:8px; text-align:left; font-family:'Outfit', sans-serif;">
                    <div style="text-align:center; margin-bottom:15px; border-bottom:1px solid rgba(197,160,89,0.15); padding-bottom:10px;">
                        <h3 style="font-family:'Cinzel', serif; color:#fbbf24; margin:0; font-size:1.3rem;">${e.sessionTitle}</h3>
                        <span style="font-size:0.75rem; color:#64748b;">Registrada em ${s}</span>
                    </div>
                    
                    <h4 style="font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                        <i class="fa-solid fa-book-open" style="margin-right:6px;"></i> Notas Narrativas
                    </h4>
                    <p style="color:#cbd5e1; font-size:0.8rem; line-height:1.5; margin:0; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; white-space:pre-wrap;">${l}</p>
                    
                    <h4 style="font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                        <i class="fa-solid fa-coins" style="margin-right:6px;"></i> Tesouros & Feitos
                    </h4>
                    <p style="color:#cbd5e1; font-size:0.8rem; line-height:1.5; margin:0; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; white-space:pre-wrap;">${n}</p>
                    
                    <h4 style="font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                        <i class="fa-solid fa-list-ul" style="margin-right:6px;"></i> Eventos da Sessão
                    </h4>
                    <div style="background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; color:#cbd5e1;">
                        ${p.length>0?p:C`<span>Sem eventos registrados.</span>`}
                    </div>
                </div>
            `,type:"info"})}function _(){a._aiCronicle&&(navigator.clipboard.writeText(a._aiCronicle),h.show("Crônica copiada com sucesso!","success"))}function B(){var e,s,l;const t=((e=d("#session-title-input"))==null?void 0:e.value)||"",o=((s=d("#session-notes-textarea"))==null?void 0:s.value)||"",i=((l=d("#session-loot-textarea"))==null?void 0:l.value)||"";c.store.update(n=>{n.sessionTitle=t,n.sessionNotes=o,n.sessionLoot=i}),h.show("Gerando relatório ilustrado para impressão...","info"),document.body.classList.add("print-report-mode"),window.print(),setTimeout(()=>document.body.classList.remove("print-report-mode"),500)}async function F(){var n,p,b;const t=((n=d("#session-title-input"))==null?void 0:n.value)||a.sessionTitle,o=((p=d("#session-notes-textarea"))==null?void 0:p.value)||a.sessionNotes,i=((b=d("#session-loot-textarea"))==null?void 0:b.value)||a.sessionLoot,{players:e,sessionNumber:s,journalEntries:l}=f.state;c.store.update(u=>{u.sessionTitle=t,u.sessionNotes=o,u.sessionLoot=i}),h.show("Renderizando cartão místico PNG da sessão...","info");try{const u=(l||[]).map(A=>`• [${A.title}] ${A.content}`).join(`
`),v=a._aiCronicle||u||o;await J({title:t,sessionNumber:s||1,date:new Date().toLocaleDateString("pt-BR"),players:e||[],loot:i,chronicle:v,notes:o}),h.show("Cartão PNG gerado e baixado com sucesso!","success")}catch(u){console.error("[SessionJournal] Erro ao exportar PNG:",u),h.show("Falha ao exportar cartão PNG. Tente novamente.","danger")}}function H(){const{players:t,combatRound:o,journalEntries:i,sessionNumber:e}=f.state,s=a.sessionLoot||"Nenhum item especial registrado.",l=new Date().toLocaleDateString("pt-BR");return`
            <div class="dnd-report-template" style="box-sizing:border-box; width:100%; max-width:800px; margin:0 auto; padding:40px; background:#ffffff; color:#000000; font-family:'Outfit', sans-serif;">
                <!-- HEADER -->
                <div style="text-align:center; border-bottom:3px double #000; padding-bottom:20px; margin-bottom:30px;">
                    <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; font-family:'Cinzel';">Relatório Oficial de Aventura</span>
                    <h1 style="font-family:'Cinzel', serif; font-size:28px; font-weight:900; margin:10px 0 5px; text-transform:uppercase; color:#000;">${a.sessionTitle}</h1>
                    <span style="font-size:11px; color:#555; font-weight:700;">Sessão Nº ${e||1} • Data: ${l} • Gerado pelo Grimório RPG</span>
                </div>

                <!-- STATS & PARTY GRID -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-bottom:30px;">
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">👥 Heróis Ativos</strong>
                        <ul style="margin:0; padding-left:20px; font-size:11px; line-height:1.6; color:#222;">
                            ${(t||[]).map(n=>`<li><strong>${n.name}</strong> (${n.race||""} ${n.class||""} Nív ${n.level||1})</li>`).join("")||"<li>Nenhum herói ativo.</li>"}
                        </ul>
                    </div>
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">⚔️ Resumo de Combate</strong>
                        <div style="font-size:11px; line-height:1.8; color:#222;">
                            <div>Rodadas Totais de Combate: <strong>${o||0} rodadas</strong></div>
                            <div style="margin-top:6px;">Tesouros Adquiridos:</div>
                            <div style="font-style:italic; color:#333; padding-left:10px; white-space:pre-wrap;">${s}</div>
                        </div>
                    </div>
                </div>

                <!-- CRONICA IA -->
                ${a._aiCronicle?`
                    <div style="border:1.5px solid #000; padding:20px; border-radius:8px; background:#fffcf5; margin-bottom:35px; box-shadow:inset 0 0 10px rgba(0,0,0,0.02);">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; font-family:'Cinzel'; font-size:13px; text-transform:uppercase; color:#8b1e0f;">📖 A Crônica do Bardo</strong>
                        <p style="font-size:11px; line-height:1.8; color:#111; font-style:italic; margin:0; white-space:pre-wrap;">${a._aiCronicle}</p>
                    </div>
                `:""}

                <!-- NOTES -->
                <div style="margin-bottom:35px;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">📝 Notas Narrativas do Mestre</strong>
                    <p style="font-size:11px; line-height:1.6; color:#222; margin:0; white-space:pre-wrap;">${a.sessionNotes||"Nenhuma nota narrativa registrada."}</p>
                </div>

                <!-- TIMELINE -->
                <div>
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:15px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">⏳ Linha do Tempo dos Acontecimentos</strong>
                    <div style="display:flex; flex-direction:column; gap:10px; padding-left:10px;">
                        ${(i||[]).map(n=>`
                            <div style="border-left:2px solid #000; padding-left:12px; font-size:10.5px; line-height:1.5;">
                                <div style="font-weight:800; color:#555; font-size:9.5px; text-transform:uppercase;">
                                    ${new Date(n.timestamp||Date.now()).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} - ${n.title||"Evento"}
                                </div>
                                <div style="color:#222; margin-top:2px;">${n.content}</div>
                            </div>
                        `).join("")||'<div style="font-size:11px; color:#555; font-style:italic;">Nenhum evento registrado nesta linha do tempo...</div>'}
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="margin-top:50px; border-top:1px solid #ddd; padding-top:15px; text-align:center; font-size:9px; color:#777;">
                    Documento de Campanha Oficial • Domínio RPG v10.0
                </div>
            </div>
        `}return C`<div ref=${w} onClick=${L} onInput=${S} onChange=${S} dangerouslySetInnerHTML=${{__html:D()}}></div>`}export{te as SessionJournal};
