import { useState, useEffect, useRef } from "preact/hooks";
import { useStore } from "../core/hooks.js";
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/core/Toast.jsx';
import { Modal } from './Modal.js';
import { exportSessionSummaryPNG } from '../utils/imageExport.js';

/**
 * SESSION JOURNAL v2.0 - Premium Edition
 * Live session logging, automated reports, and high-fidelity bard chronicle generator.
 */
export function SessionJournal(opts) {
    const storeState = useStore();
    const [loadingCronicle, setLoadingCronicle] = useState(false);
    const [focusedElement, setFocusedElement] = useState(null);
    const containerRef = useRef(null);


    const store = window.TOME?.store || { state: storeState };
    const $ = (sel) => containerRef.current ? containerRef.current.querySelector(sel) : null;
    const $$ = (sel) => containerRef.current ? containerRef.current.querySelectorAll(sel) : [];


    function onMount() {
        if (focusedElement) {
            const { id, start, end } = focusedElement;
            const el = $('#' + id);
            if (el) {
                el.focus();
                if (start !== null && end !== null) {
                    try {
                        el.setSelectionRange(start, end);
                    } catch (e) {}
                }
            }
            setFocusedElement(null);
        }

        // Keep state in sync on blur / change events
        const titleInput = $('#session-title-input');
        const notesInput = $('#session-notes-textarea');
        const lootInput = $('#session-loot-textarea');

        if (titleInput) {
            titleInput.addEventListener('change', (e) => {
                TOME.store.update(s => s.sessionTitle = e.target.value);
            });
        }
        if (notesInput) {
            notesInput.addEventListener('change', (e) => {
                TOME.store.update(s => s.sessionNotes = e.target.value);
            });
        }
        if (lootInput) {
            lootInput.addEventListener('change', (e) => {
                TOME.store.update(s => s.sessionLoot = e.target.value);
            });
        }
    }

    function onUnmount() {
        // Safe check and final commit of DOM content to state before component unmounts
        const title = $('#session-title-input')?.value;
        const notes = $('#session-notes-textarea')?.value;
        const loot = $('#session-loot-textarea')?.value;
        TOME.store.update(s => {
            if (title !== undefined) s.sessionTitle = title;
            if (notes !== undefined) s.sessionNotes = notes;
            if (loot !== undefined) s.sessionLoot = loot;
        });
    }

    const handleGlobalClick = (e) => {
        const btn = e.target.closest("[data-action]");
        if (btn) {
            const action = btn.dataset.action;
            if (action === "generateAICronicle") generateAICronicle(e, btn);
            if (action === "exportReport") exportReport(e, btn);
            if (action === "exportSummaryPNG") exportSummaryPNG(e, btn);
            if (action === "viewPastSession") viewPastSession(e, btn);
            if (action === "copyCronicle") copyCronicle(e, btn);
            if (action === "addManualEvent") addManualEvent(e, btn);
            if (action === "deleteEvent") deleteEvent(e, btn);
            if (action === "closeModal") closeModal(e, btn);
        }
    };
    
    useEffect(() => {
        onMount();
        return () => onUnmount();
    }, []);


    function template() {
        const { players, combatRound, sessionNumber } = store.state;

        return `
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
                        <button class="btn btn-magic" data-action="generateAICronicle" ${loadingCronicle ? 'disabled' : ''}>
                            ${loadingCronicle ? html`<i class="fa-solid fa-spinner fa-spin"></i> Tecendo história...` : html`<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Crônica IA`}
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
                                <input type="text" id="session-title-input" class="journal-input bg-black/50 border border-white/10 p-3 rounded-lg text-white font-cinzel focus:border-accent outline-none w-full transition-colors" value="${storeState.sessionTitle}" placeholder="Ex: O Despertar do Dragão" />
                            </div>

                            <div class="flex flex-col gap-3">
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Heróis Ativos</span>
                                    <strong class="text-blue-400"><i class="fa-solid fa-shield-halved mr-1.5"></i> ${players?.length || 0}</strong>
                                </div>
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Combates</span>
                                    <strong class="text-red-400"><i class="fa-solid fa-swords mr-1.5"></i> ${combatRound || 0}</strong>
                                </div>
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Sessão Atual</span>
                                    <strong class="text-purple-400"><i class="fa-solid fa-hashtag mr-1.5"></i> ${sessionNumber || 1}</strong>
                                </div>
                                <div class="stat-pill bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm border border-white/5">
                                    <span class="text-slate-400 uppercase tracking-wider text-[0.7rem] font-bold">Data</span>
                                    <strong class="text-accent"><i class="fa-solid fa-calendar-days mr-1.5"></i> ${new Date().toLocaleDateString('pt-BR')}</strong>
                                </div>
                            </div>
                        </div>

                        <!-- CAPITULOS ANTERIORES -->
                        ${store.state.sessionsHistory && store.state.sessionsHistory.length > 0 ? html`
                        <div class="journal-card" style="margin-top: 10px;">
                            <h3 style="font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-clock-rotate-left"></i> Crônicas Passadas (${store.state.sessionsHistory.length})
                            </h3>
                            <div style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;">
                                ${store.state.sessionsHistory.map(hist => html`
                                    <div class="tome-hover-row" style="background:rgba(255,255,255,0.02); border:1px solid rgba(197,160,89,0.15); border-radius:8px; padding:10px; font-size:0.8rem; cursor:pointer;" 
                                         data-action="viewPastSession" data-id="${hist.sessionNumber}">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; width:100%;">
                                            <strong style="color:#fbbf24;">Sessão #${hist.sessionNumber}</strong>
                                            <span style="font-size:0.7rem; color:#64748b; margin-left:auto;">${new Date(hist.timestamp).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div style="color:#e2e8f0; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hist.sessionTitle}</div>
                                    </div>
                                `)}
                            </div>
                        </div>
                        ` : ''}

                        <!-- LOOT & FEATS -->
                        <div class="journal-card">
                            <h3 style="font-family:'Cinzel'; color:#c5a059; font-size:1.05rem; margin: 0 0 15px 0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-coins"></i> Tesouros & Feitos
                            </h3>
                            <textarea id="session-loot-textarea" class="journal-textarea-styled" rows="5" placeholder="Itens mágicos, ouro, segredos ou conquistas épicas dos heróis...">${storeState.sessionLoot}</textarea>
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
                                      placeholder="Comece a redigir a história e os acontecimentos memoráveis desta sessão aqui...">${storeState.sessionNotes}</textarea>
                        </div>

                        <!-- AI CRONICLE BANNER -->
                        ${storeState._aiCronicle ? html`
                            <div class="chronicle-container animate-fadeIn">
                                <h3 class="chronicle-title">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i> A Crônica do Bardo Real
                                </h3>
                                <div class="chronicle-text">${storeState._aiCronicle}</div>
                                <div style="display:flex; justify-content:flex-end; margin-top:18px;">
                                    <button class="btn btn-premium" style="font-size:0.75rem; padding:8px 16px;" data-action="copyCronicle">
                                        <i class="fa-solid fa-copy"></i> Copiar Crônica
                                    </button>
                                </div>
                            </div>
                        ` : ''}

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
                                
                                ${(store.state.journalEntries || []).slice().reverse().map(entry => {
                                    const type = entry.type || 'info';
                                    const icons = { combat: 'fa-swords', loot: 'fa-coins', social: 'fa-comments', info: 'fa-scroll', oracle: 'fa-wand-magic-sparkles' };
                                    const colors = { combat: '#ef4444', loot: '#22c55e', social: '#3b82f6', info: '#c5a059', oracle: '#a855f7' };
                                    const glows = { combat: 'rgba(239, 68, 68, 0.35)', loot: 'rgba(34, 197, 94, 0.35)', social: 'rgba(59, 130, 246, 0.35)', info: 'rgba(197, 160, 89, 0.35)', oracle: 'rgba(168, 85, 247, 0.35)' };
                                    
                                    const badgeColor = colors[type] || colors.info;
                                    const badgeGlow = glows[type] || glows.info;
                                    const iconClass = icons[type] || icons.info;
                                    
                                    return html`
                                        <div class="timeline-item" style="--badge-color: ${badgeColor}; --badge-glow: ${badgeGlow};">
                                            <div class="timeline-badge">
                                                <i class="fa-solid ${iconClass}"></i>
                                            </div>
                                            <div class="timeline-content-card">
                                                <div class="timeline-item-header">
                                                    <div>
                                                        <span class="timeline-item-title">${entry.title || 'Evento'}</span>
                                                        <span class="timeline-item-time" style="margin-left:10px;">${new Date(entry.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    <button class="btn btn-ghost btn-sm" data-action="deleteEvent" data-id="${entry.id}" style="color:var(--danger); padding:4px 8px; border-radius:6px;"><i class="fa-solid fa-trash-can"></i></button>
                                                </div>
                                                <p class="timeline-item-body">${entry.content}</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('') || html`
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
            ${_renderReportTemplate()}
        `;
    }

    async function generateAICronicle() {
        const title = $('#session-title-input')?.value || '';
        const notes = $('#session-notes-textarea')?.value || '';
        const loot = $('#session-loot-textarea')?.value || '';

        TOME.store.update(s => {
            s.sessionTitle = title;
            s.sessionNotes = notes;
            s.sessionLoot = loot;
        });

        const entries = store.state.journalEntries || [];

        if (entries.length === 0 && !notes) {
            Toast.show('Escreva algumas notas ou comece o combate para ter fatos a narrar!', 'warning');
            return;
        }

        setLoadingCronicle(true);
        render();

        try {
            const logText = entries.map(e => `[${e.type.toUpperCase()}] ${e.title}: ${e.content}`).join('\n');
            const prompt = `Como um bardo medieval lendário, teça uma crônica literária emocionante e poética (máximo 4 parágrafos) narrando os acontecimentos desta sessão de RPG.
            Escreva em português medieval literário e dramático.
            
            FATOS DA LINHA DO TEMPO:
            ${logText}
            
            TESOUROS ENCONTRADOS:
            ${loot}
            
            ANOTAÇÕES DO MESTRE:
            ${notes}
            
            Foque nos heróis e no destino que os aguarda.`;

            const response = await TOME.ai.ask(prompt);
            TOME.store.update(s => {
                s._aiCronicle = response;
            });
            Toast.show('A crônica foi tecida pelos deuses!', 'success');
        } catch (err) {
            Toast.show('O bardo está sem voz agora... Tente novamente.', 'danger');
        } finally {
            setLoadingCronicle(false);
            render();
        }
    }

    function addManualEvent() {
        const input = $('#manual-event-input');
        if (!input || !input.value.trim()) return;

        TOME.store.update(s => {
            if (!s.journalEntries) s.journalEntries = [];
            s.journalEntries.push({
                id: Date.now(),
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('pt-BR'),
                type: 'info',
                title: 'Anotação do Mestre',
                content: input.value.trim()
            });
        });
        
        input.value = '';
        import('./Toast.js').then(m => m.Toast.show('Evento adicionado à linha do tempo!', 'success'));
        render();
    }

    function deleteEvent(e, el) {
        const id = el.dataset.id;
        if (!id || !confirm("Remover este evento da linha do tempo?")) return;

        TOME.store.update(s => {
            if (s.journalEntries) {
                s.journalEntries = s.journalEntries.filter(entry => String(entry.id) !== String(id));
            }
        });
        
        import('./Toast.js').then(m => m.Toast.show('Evento removido.', 'info'));
        render();
    }

    function viewPastSession(e, el) {
        const id = parseInt(el.dataset.id);
        const hist = (store.state.sessionsHistory || []).find(h => h.sessionNumber === id);
        if (!hist) return;
        
        const dateStr = new Date(hist.timestamp).toLocaleDateString('pt-BR');
        const notesHtml = hist.sessionNotes ? hist.sessionNotes : 'Nenhuma nota registrada.';
        const lootHtml = hist.sessionLoot ? hist.sessionLoot : 'Nenhum tesouro registrado.';
        const eventsHtml = (hist.journalEntries || []).map(e => html`
            <div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed rgba(255,255,255,0.05); font-size:0.8rem;">
                <span style="color:#c5a059; font-weight:bold;">[${e.type.toUpperCase()}]</span> <strong>${e.title}:</strong> ${e.content}
            </div>
        `).join('') || 'Sem eventos registrados.';

        Modal.show({
            title: `Sessão #${hist.sessionNumber}`,
            content: html`
                <div style="max-height:60vh; overflow-y:auto; padding-right:8px; text-align:left; font-family:'Outfit', sans-serif;">
                    <div style="text-align:center; margin-bottom:15px; border-bottom:1px solid rgba(197,160,89,0.15); padding-bottom:10px;">
                        <h3 style="font-family:'Cinzel', serif; color:#fbbf24; margin:0; font-size:1.3rem;">${hist.sessionTitle}</h3>
                        <span style="font-size:0.75rem; color:#64748b;">Registrada em ${dateStr}</span>
                    </div>
                    
                    <h4 style="font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                        <i class="fa-solid fa-book-open" style="margin-right:6px;"></i> Notas Narrativas
                    </h4>
                    <p style="color:#cbd5e1; font-size:0.8rem; line-height:1.5; margin:0; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; white-space:pre-wrap;">${notesHtml}</p>
                    
                    <h4 style="font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                        <i class="fa-solid fa-coins" style="margin-right:6px;"></i> Tesouros & Feitos
                    </h4>
                    <p style="color:#cbd5e1; font-size:0.8rem; line-height:1.5; margin:0; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; white-space:pre-wrap;">${lootHtml}</p>
                    
                    <h4 style="font-family:'Cinzel', serif; color:#c5a059; margin:15px 0 8px 0; font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">
                        <i class="fa-solid fa-list-ul" style="margin-right:6px;"></i> Eventos da Sessão
                    </h4>
                    <div style="background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; color:#cbd5e1;">
                        ${eventsHtml}
                    </div>
                </div>
            `,
            type: 'info'
        });
    }

    function copyCronicle() {
        if (!storeState._aiCronicle) return;
        navigator.clipboard.writeText(storeState._aiCronicle);
        Toast.show('Crônica copiada com sucesso!', 'success');
    }

    function exportReport() {
        const title = $('#session-title-input')?.value || '';
        const notes = $('#session-notes-textarea')?.value || '';
        const loot = $('#session-loot-textarea')?.value || '';

        TOME.store.update(s => {
            s.sessionTitle = title;
            s.sessionNotes = notes;
            s.sessionLoot = loot;
        });

        Toast.show('Gerando relatório ilustrado para impressão...', 'info');
        document.body.classList.add('print-report-mode');
        window.print();
        setTimeout(() => document.body.classList.remove('print-report-mode'), 500);
    }

    async function exportSummaryPNG() {
        const title = $('#session-title-input')?.value || storeState.sessionTitle;
        const notes = $('#session-notes-textarea')?.value || storeState.sessionNotes;
        const loot = $('#session-loot-textarea')?.value || storeState.sessionLoot;
        const { players, sessionNumber, journalEntries } = store.state;

        TOME.store.update(s => {
            s.sessionTitle = title;
            s.sessionNotes = notes;
            s.sessionLoot = loot;
        });

        Toast.show('Renderizando cartão místico PNG da sessão...', 'info');

        try {
            const milestones = (journalEntries || []).map(e => `• [${e.title}] ${e.content}`).join('\n');
            const chronicleText = storeState._aiCronicle || milestones || notes;

            await exportSessionSummaryPNG({
                title,
                sessionNumber: sessionNumber || 1,
                date: new Date().toLocaleDateString('pt-BR'),
                players: players || [],
                loot,
                chronicle: chronicleText,
                notes
            });

            Toast.show('Cartão PNG gerado e baixado com sucesso!', 'success');
        } catch (err) {
            console.error('[SessionJournal] Erro ao exportar PNG:', err);
            Toast.show('Falha ao exportar cartão PNG. Tente novamente.', 'danger');
        }
    }

    function _renderReportTemplate() {
        const { players, combatRound, journalEntries, sessionNumber } = store.state;
        const loot = storeState.sessionLoot || 'Nenhum item especial registrado.';
        const date = new Date().toLocaleDateString('pt-BR');

        return html`<div ref=${containerRef} onClick=${handleGlobalClick}>` + html`
            <div class="dnd-report-template" style="box-sizing:border-box; width:100%; max-width:800px; margin:0 auto; padding:40px; background:#ffffff; color:#000000; font-family:'Outfit', sans-serif;">
                <!-- HEADER -->
                <div style="text-align:center; border-bottom:3px double #000; padding-bottom:20px; margin-bottom:30px;">
                    <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; font-family:'Cinzel';">Relatório Oficial de Aventura</span>
                    <h1 style="font-family:'Cinzel', serif; font-size:28px; font-weight:900; margin:10px 0 5px; text-transform:uppercase; color:#000;">${storeState.sessionTitle}</h1>
                    <span style="font-size:11px; color:#555; font-weight:700;">Sessão Nº ${sessionNumber || 1} • Data: ${date} • Gerado pelo Grimório RPG</span>
                </div>

                <!-- STATS & PARTY GRID -->
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-bottom:30px;">
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">👥 Heróis Ativos</strong>
                        <ul style="margin:0; padding-left:20px; font-size:11px; line-height:1.6; color:#222;">
                            ${(players || []).map(p => html`<li><strong>${p.name}</strong> (${p.race} ${p.class} Nív ${p.level})</li>`).join('') || '<li>Nenhum herói ativo.</li>'}
                        </ul>
                    </div>
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">⚔️ Resumo de Combate</strong>
                        <div style="font-size:11px; line-height:1.8; color:#222;">
                            <div>Rodadas Totais de Combate: <strong>${combatRound || 0} rodadas</strong></div>
                            <div style="margin-top:6px;">Tesouros Adquiridos:</div>
                            <div style="font-style:italic; color:#333; padding-left:10px; white-space:pre-wrap;">${loot}</div>
                        </div>
                    </div>
                </div>

                <!-- CRONICA IA -->
                ${storeState._aiCronicle ? html`
                    <div style="border:1.5px solid #000; padding:20px; border-radius:8px; background:#fffcf5; margin-bottom:35px; box-shadow:inset 0 0 10px rgba(0,0,0,0.02);">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; font-family:'Cinzel'; font-size:13px; text-transform:uppercase; color:#8b1e0f;">📖 A Crônica do Bardo</strong>
                        <p style="font-size:11px; line-height:1.8; color:#111; font-style:italic; margin:0; white-space:pre-wrap;">${storeState._aiCronicle}</p>
                    </div>
                ` : ''}

                <!-- NOTES -->
                <div style="margin-bottom:35px;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">📝 Notas Narrativas do Mestre</strong>
                    <p style="font-size:11px; line-height:1.6; color:#222; margin:0; white-space:pre-wrap;">${storeState.sessionNotes || 'Nenhuma nota narrativa registrada.'}</p>
                </div>

                <!-- TIMELINE -->
                <div>
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:15px; font-family:'Cinzel'; font-size:12px; text-transform:uppercase;">⏳ Linha do Tempo dos Acontecimentos</strong>
                    <div style="display:flex; flex-direction:column; gap:10px; padding-left:10px;">
                        ${(journalEntries || []).map(e => html`
                            <div style="border-left:2px solid #000; padding-left:12px; font-size:10.5px; line-height:1.5;">
                                <div style="font-weight:800; color:#555; font-size:9.5px; text-transform:uppercase;">
                                    ${new Date(e.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${e.title || 'Evento'}
                                </div>
                                <div style="color:#222; margin-top:2px;">${e.content}</div>
                                `).join('') || html`<div style="font-size:11px; color:#555; font-style:italic;">Nenhum evento registrado nesta linha do tempo...</div>`}
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="margin-top:50px; border-top:1px solid #ddd; padding-top:15px; text-align:center; font-size:9px; color:#777;">
                    Documento de Campanha Oficial • Domínio RPG v10.0
                </div>
            </div>
        `;
    }

    return html`<div ref=${containerRef} onClick=${handleGlobalClick} dangerouslySetInnerHTML=${{__html: template()}}></div>`;
}
