import{m as p,_ as S}from"./main-Dh89y2UZ.js";import{R as I}from"./ReactiveComponent-I2rnF6vN.js";import{T as l,D as E}from"./BattleManager-2t4w_Qpj.js";import{M as k}from"./Boot-B2dG6x9f.js";import{Toast as g}from"./Toast-m0Ci56ke.js";import{M}from"./Modal-B7xxPl0j.js";import"./jsxRuntime.module-BN06QUIv.js";import"./FXEngine-BD9eU4lT.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";function D(y){const e=y.store.state.quests||[];return e.length===0?p`<div class="text-xs text-slate-500 italic text-center p-4">Nenhuma missão ativa no momento.</div>`:e.map(t=>{const s=t.completed||t.status==="completed",a=t.failed||t.status==="failed";return p`
            <div class="bg-white/5 border border-white/5 p-3 rounded-lg flex flex-col gap-2 text-xs">
                <div class="flex justify-between items-start">
                    <div class="flex-1 pr-2">
                        <strong class="${s?"text-green-500 line-through opacity-80":a?"text-red-500 line-through opacity-80":"text-slate-300"}">${t.title}</strong>
                        <span class="text-[0.65rem] text-slate-500 block mt-0.5">Recompensa: ${t.reward||"Nenhuma"}</span>
                    </div>
                    <span class="text-[0.6rem] uppercase font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 ${s?"text-green-500 bg-green-500/10":a?"text-red-500 bg-red-500/10":"text-yellow-400 bg-yellow-400/10"}">
                        ${s?"Concluída":a?"Fracassada":"Pendente"}
                    </span>
                </div>
                
                <div class="flex justify-between items-center border-t border-white/5 pt-1.5 mt-0.5">
                    <!-- Delete action -->
                    <button class="btn btn-ghost btn-sm px-1.5 py-0.5 text-[0.65rem] text-red-500 border border-red-500/20 bg-red-500/5 rounded" data-action="quickDeleteQuest" data-id="${t.id}">
                        <i class="fa-solid fa-trash-can mr-1"></i> Apagar
                    </button>
                    
                    <div class="flex gap-1">
                        ${!s&&!a?p`
                            <button class="btn btn-ghost btn-sm px-2 py-0.5 text-[0.65rem] text-red-500 border-2 border-red-500/20 rounded" data-action="quickFailQuest" data-id="${t.id}">
                                <i class="fa-solid fa-skull mr-1"></i> Falhar
                            </button>
                            <button class="btn btn-sm btn-ghost px-2 py-0.5 text-[0.65rem] text-green-400 border-2 border-green-500/30 bg-green-500/5 rounded" data-action="quickCompleteQuest" data-id="${t.id}">
                                <i class="fa-solid fa-check mr-1"></i> Concluir
                            </button>
                        `:""}
                        
                        ${s&&t.reward&&t.reward!=="Nenhuma"?p`
                            ${t.rewardDistributed?p`
                                <span class="text-[0.62rem] text-emerald-400 font-bold uppercase tracking-wide px-1.5 py-0.5 bg-emerald-500/5 rounded inline-flex items-center gap-1">
                                    <i class="fa-solid fa-circle-check"></i> Loot Entregue
                                </span>
                            `:p`
                                <button class="btn btn-ghost btn-sm px-2 py-0.5 text-[0.65rem] text-emerald-400 border-2 border-emerald-500/35 bg-emerald-500/10 rounded" data-action="quickLootQuest" data-id="${t.id}">
                                    <i class="fa-solid fa-hand-holding-dollar mr-1"></i> Loot
                                </button>
                            `}
                        `:""}
                    </div>
                </div>
            </div>
        `})}function C(y){const e=y.store.state.journalEntries||[];return e.length===0?p`<div style="font-size:0.75rem; color:#64748b; font-style:italic; text-align:center; padding:15px;">Nenhum evento recente registrado.</div>`:e.slice(-4).reverse().map(t=>p`
        <div style="font-size:0.7rem; color:#e2e8f0; line-height:1.4; padding-bottom:6px; border-bottom:1px dashed rgba(255,255,255,0.03);">
            <strong style="color:var(--accent); font-family:'Cinzel';">[${t.type.toUpperCase()}] ${t.title}</strong>: ${t.content}
        </div>
    `)}function T(y){const e=y.store.state.monsters||[];return e.length===0?p`<div class="text-xs text-slate-500 italic text-center p-4 col-span-2">Nenhum monstro ativo na arena de combate.</div>`:e.map(t=>{var s,a;return p`
        <div class="bg-red-500/5 border border-red-500/15 py-2 px-3 rounded-lg flex justify-between items-center text-xs">
            <div>
                <strong class="text-red-500">${t.name}</strong>
                <span class="text-[0.65rem] text-slate-500 block">ND ${t.cr||"0"} • HP: ${(s=t.hp)==null?void 0:s.current}/${(a=t.hp)==null?void 0:a.max}</span>
            </div>
            <div class="flex gap-1">
                <button class="btn btn-ghost btn-sm px-1.5 py-0.5 text-[0.6rem] border-white/5" data-action="adjustMonsterHP" data-id="${t.id}" data-val="-5">-5</button>
                <button class="btn btn-ghost btn-sm px-1.5 py-0.5 text-[0.6rem] text-green-400 border-white/5" data-action="adjustMonsterHP" data-id="${t.id}" data-val="5">+5</button>
            </div>
        </div>
    `})}class q extends I{constructor(e={}){e.storePath="campaign",super(e),this._selectedHeroId=null,this._timerInterval=null,this._timerDisplay="00:00:00",this._showLootModalId=null,this._selectedLootPlayers=[],this._lootGold=0,this._lootItems=""}template(){var s,a,i,o,r,d;const{players:e}=this.store.state,t=e==null?void 0:e.find(n=>n.id===this._selectedHeroId);return p`
            <div class="page max-w-[1400px] mx-auto">
                <!-- HIDDEN PRINT TEMPLATES (SHEET & COMBAT CARD) -->
                ${t?this._renderPrintTemplate(t):""}
                ${t?this._renderCardTemplate(t):""}

                <div class="section-header flex justify-between items-center mb-6">
                    <div>
                        <h2 class="section-title m-0"><i class="fa-solid fa-users-rectangle text-tomeGold mr-3"></i> Gestão de Campanha</h2>
                        <p class="section-subtitle mt-1 text-slate-400">Sincronização Total com a Sessão Ativa</p>
                    </div>
                    <div class="flex gap-2.5">
                        <button class="btn btn-ghost text-xs" data-action="importCamp"><i class="fa-solid fa-file-import"></i> Importar</button>
                        <button class="btn btn-primary text-xs" data-action="exportCamp"><i class="fa-solid fa-download"></i> Exportar Dados</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start min-w-0">
                    <div class="flex flex-col gap-5">
                        <!-- ACTIVE SESSION SELECTOR -->
                        <div id="session-control-card" class="card glass-accent p-6 rounded-2xl flex flex-col gap-4 border border-tomeGold/20 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
                            <div class="absolute -top-10 -right-10 w-32 h-32 bg-tomeGold/10 rounded-full blur-3xl pointer-events-none"></div>
                            <style>
                                @keyframes timerPulse { 0%,100%{text-shadow:0 0 8px rgba(197,160,89,0.5);} 50%{text-shadow:0 0 18px rgba(197,160,89,0.9), 0 0 30px rgba(197,160,89,0.4);} }
                                @keyframes statusBlink { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
                                .session-timer-display { animation: timerPulse 2s ease-in-out infinite; }
                                .timer-running-dot { animation: statusBlink 1.2s ease-in-out infinite; }
                                .session-opt-open::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:#22c55e; margin-right:6px; box-shadow:0 0 6px #22c55e; vertical-align:middle; }
                                .session-opt-closed::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:#64748b; margin-right:6px; vertical-align:middle; }
                                .session-status-badge { display:inline-flex; align-items:center; gap:5px; font-size:0.6rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; padding:3px 8px; border-radius:99px; font-family:'Cinzel', serif; }
                                .badge-open { background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.35); color:#22c55e; }
                                .badge-closed { background:rgba(100,116,139,0.12); border:1px solid rgba(100,116,139,0.3); color:#64748b; }
                                .badge-active { background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.5); color:#fbbf24; }
                                .timer-btn { border:none; border-radius:8px; font-family:'Cinzel', serif; font-size:0.65rem; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:8px 10px; cursor:pointer; transition:all 0.25s cubic-bezier(0.16,1,0.3,1); display:flex; align-items:center; justify-content:center; gap:6px; }
                                .timer-btn:hover { transform:translateY(-1px); }
                                .timer-btn-start { background:rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); color:#4ade80; box-shadow:0 3px 12px rgba(34,197,94,0.1); }
                                .timer-btn-start:hover { background:rgba(34,197,94,0.25); box-shadow:0 5px 18px rgba(34,197,94,0.3); }
                                .timer-btn-pause { background:rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.4); color:#fbbf24; box-shadow:0 3px 12px rgba(251,191,36,0.1); }
                                .timer-btn-pause:hover { background:rgba(251,191,36,0.25); box-shadow:0 5px 18px rgba(251,191,36,0.3); }
                                .timer-btn-end { background:rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color:#f87171; box-shadow:0 3px 12px rgba(239,68,68,0.1); }
                                .timer-btn-end:hover { background:rgba(239,68,68,0.25); box-shadow:0 5px 18px rgba(239,68,68,0.3); }
                            </style>

                            <!-- HEADER -->
                            <div class="font-cinzel text-xs font-extrabold text-tomeGold uppercase tracking-wide border-b border-tomeGold/20 pb-2 flex items-center justify-between">
                                <div>
                                    <span><i class="fa-solid fa-folder-open mr-1.5"></i> Sessão do Jogo</span>
                                    <button class="btn btn-ghost btn-sm py-0.5 px-1.5 text-[0.6rem] ml-2 rounded" data-action="editCampaign"><i class="fa-solid fa-pen"></i> Editar</button>
                                </div>
                                ${this._getActiveSessionStatus()}
                            </div>

                            <!-- ACTIVE SESSION INFO -->
                            <div class="text-[0.65rem] text-slate-400">
                                Sessão Ativa: <b class="text-tomeGold">${((s=l.persistence)==null?void 0:s.filename)||"state.json"}</b>
                            </div>

                            <!-- TIMER DISPLAY -->
                            <div class="glass p-4 rounded-xl flex flex-col gap-3">
                                <div class="flex justify-between items-center w-full">
                                    <div>
                                        <div class="text-[0.55rem] text-slate-500 font-bold uppercase tracking-wide mb-1">Tempo de Sessão</div>
                                        <div id="session-timer-display" class="session-timer-display font-mono text-2xl font-black text-tomeGold tracking-wider leading-none">
                                            ${this._getTimerDisplay()}
                                        </div>
                                        ${this._isTimerRunning()?p`<div class="text-[0.55rem] text-green-500 mt-1 flex items-center gap-1"><span class="timer-running-dot w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>Em andamento</div>`:""}
                                    </div>
                                    <div style="min-width: 130px; max-width: 140px; display:flex; flex-direction:column; gap:6px;">
                                        ${this._renderTimerButtons()}
                                    </div>
                                </div>
                                <div class="w-full border-t border-white/5 pt-2">
                                    <label class="block text-[0.55rem] text-slate-500 font-bold uppercase mb-1">Limite de Duração</label>
                                    <select class="legacy-input w-full" id="timer-limit-select">
                                        <option value="0" ${this._getSessionMeta(((a=l.persistence)==null?void 0:a.filename)||"state.json").timerLimitMs?"":"selected"}>Livre (Progressivo)</option>
                                        <option value="3600000" ${this._getSessionMeta(((i=l.persistence)==null?void 0:i.filename)||"state.json").timerLimitMs===36e5?"selected":""}>1 Hora (Regressivo)</option>
                                        <option value="7200000" ${this._getSessionMeta(((o=l.persistence)==null?void 0:o.filename)||"state.json").timerLimitMs===72e5?"selected":""}>2 Horas (Regressivo)</option>
                                        <option value="10800000" ${this._getSessionMeta(((r=l.persistence)==null?void 0:r.filename)||"state.json").timerLimitMs===108e5?"selected":""}>3 Horas (Regressivo)</option>
                                        <option value="14400000" ${this._getSessionMeta(((d=l.persistence)==null?void 0:d.filename)||"state.json").timerLimitMs===144e5?"selected":""}>4 Horas (Regressivo)</option>
                                    </select>
                                </div>
                            </div>

                            <!-- DROPDOWN SELECTOR -->
                            <select class="legacy-input w-full mt-2" id="session-dropdown" data-action="changeSession">
                                ${this._getSessionsList().map(n=>{var x;const m=this._getSessionMeta(n.file),c=m.status==="open",f=((x=l.persistence)==null?void 0:x.filename)===n.file,u=m.totalElapsed?` • ${this._formatElapsed(m.totalElapsed)}`:"";return p`<option value="${n.file}" class="${c?"session-opt-open":"session-opt-closed"}" ${f?"selected":""}>${c?"🟢":"⚫"} ${n.name}${u}</option>`})}
                            </select>

                            <!-- SESSION STATUS LIST -->
                            <div class="flex flex-col gap-1 max-h-32 overflow-y-auto pr-0.5">
                                ${this._getSessionsList().map(n=>{var x;const m=this._getSessionMeta(n.file),c=((x=l.persistence)==null?void 0:x.filename)===n.file,f=m.status==="open",u=m.totalElapsed?this._formatElapsed(m.totalElapsed):"--:--:--";return p`
                                        <div class="flex items-center justify-between py-2 px-3 rounded-lg text-[0.65rem] border transition-all ${c?"bg-tomeGold/10 border-tomeGold/40":"glass hover:bg-white/10 border-transparent"}">
                                            <div class="flex items-center gap-1.5 overflow-hidden">
                                                <span class="w-1.5 h-1.5 rounded-full shrink-0 ${f?"bg-green-500 shadow-[0_0_5px_#22c55e]":"bg-slate-500"}"></span>
                                                <span class="whitespace-nowrap overflow-hidden text-ellipsis ${c?"text-tomeGold font-bold":"text-slate-400 font-medium"}">${n.name}</span>
                                            </div>
                                            <div class="flex items-center gap-1.5 shrink-0">
                                                <span class="font-mono text-slate-600 text-[0.6rem]">${u}</span>
                                                <span class="session-status-badge ${f?"badge-open":"badge-closed"}">${f?"Aberta":"Finalizada"}</span>
                                            </div>
                                        </div>
                                    `})}
                            </div>

                            <!-- ACTIONS -->
                            <div class="grid grid-cols-2 gap-2 mt-1">
                                <button class="btn btn-ghost btn-sm rounded-lg text-[0.7rem] font-bold p-2" data-action="createNewSession">
                                    <i class="fa-solid fa-plus mr-1"></i> Nova Sessão
                                </button>
                                <button class="btn btn-ghost btn-sm rounded-lg text-[0.7rem] font-bold p-2" data-action="cloneSession">
                                    <i class="fa-solid fa-copy mr-1"></i> Clonar Sessão
                                </button>
                                <button class="btn btn-success btn-sm rounded-lg text-[0.7rem] font-bold p-2 col-span-2" data-action="startCampaignForm">
                                    <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Iniciar Nova Campanha
                                </button>
                                <button class="btn btn-danger btn-sm rounded-lg text-[0.7rem] font-bold p-2 col-span-2" data-action="resetCampaignState">
                                    <i class="fa-solid fa-power-off mr-1"></i> Zerar Estado da Campanha
                                </button>
                            </div>
                        </div>

                        <!-- HERO SELECTOR -->
                        <div class="card glass p-0 overflow-hidden rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" id="management-sidebar">
                            <div class="card-header bg-gradient-to-r from-tomeGold/20 to-transparent p-4 m-0 border-b border-tomeGold/30 backdrop-blur-md">
                                <span class="card-title text-xs font-cinzel font-bold tracking-[2px] text-tomeGold drop-shadow-md flex items-center gap-2"><i class="fa-solid fa-users"></i> Heróis do Grupo</span>
                            </div>
                            <div class="flex flex-col bg-black/40">
                                ${(e==null?void 0:e.map(n=>this._renderHeroItem(n)).join(""))||p`<p class="p-5 text-[0.7rem] opacity-50 text-center">Crie heróis na aba de criação.</p>`}
                            </div>
                        </div>
                    </div>

                    <!-- COMMAND PANEL & DYNAMIC INTEGRATED SECTIONS (Prime Dashboard) -->
                    <div class="flex flex-col gap-5 min-w-0">

                        <!-- PRIME CAMPAIGN INFO BANNER -->
                        ${this._renderCampaignBanner()}
                        
                        <!-- COMMAND PANEL -->
                        <div id="command-ui">
                            ${t?this._renderCommandPanel(t):p`
                                <div class="card glass-accent min-h-[200px] rounded-2xl flex flex-col items-center justify-center gap-3 border border-dashed border-tomeGold/30">
                                    <i class="fa-solid fa-user-plus text-[2.5rem] text-tomeGold/20"></i>
                                    <p class="text-xs text-slate-400 font-cinzel uppercase tracking-wide">Selecione um herói ao lado para gerenciar</p>
                                </div>
                            `}
                        </div>

                        <!-- DYNAMIC INTEGRATED SECTIONS (Modular Visibility) -->
                        <div class="grid grid-cols-2 gap-5">
                            
                            <!-- QUEST COMMAND -->
                            <div class="card glass p-0 rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                                <h3 class="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                                    <span><i class="fa-solid fa-list-check mr-2"></i> Quadro de Missões</span>
                                    <button class="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded" data-action="quickAddQuest"><i class="fa-solid fa-plus"></i> Adicionar</button>
                                </h3>
                                <div class="flex flex-col gap-2 max-h-[180px] overflow-y-auto p-4 bg-black/40">
                                    ${D(this)}
                                </div>
                            </div>
                            
                            <!-- NARRATIVE / DIARY -->
                            <div class="card glass p-0 rounded-2xl border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                                <h3 class="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                                    <span><i class="fa-solid fa-book-journal-whills mr-2"></i> Diário Narrativo</span>
                                    <button class="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded" data-action="quickOracleInspire"><i class="fa-solid fa-wand-magic-sparkles"></i> Oráculo</button>
                                </h3>
                                <div class="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto p-4 bg-black/40">
                                    ${C(this)}
                                </div>
                            </div>

                            <!-- COMBAT & BESTIARY PREVIEW -->
                            <div class="card glass p-0 rounded-2xl col-span-2 border border-tomeGold/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                                <h3 class="font-cinzel text-tomeGold text-[0.85rem] m-0 flex justify-between items-center border-b border-tomeGold/30 bg-gradient-to-r from-tomeGold/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                                    <span><i class="fa-solid fa-dragon mr-2"></i> Bestiário & Combates Ativos</span>
                                    <span class="text-[0.6rem] text-slate-300 font-mono tracking-wider bg-black/50 px-2 py-1 rounded-md border border-tomeGold/20">${(this.store.state.monsters||[]).length} criatura(s)</span>
                                </h3>
                                <div class="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto p-4 bg-black/40">
                                    ${T(this)}
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <!-- Loot Distribution Modal -->
                ${this._showLootModalId?this._renderLootModal():""}
            </div>
        `}_renderPrintTemplate(e){var a,i,o,r,d;const t=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},s=n=>Math.floor((n-10)/2);return p`
            <div class="dnd-print-template">
                <div class="dnd-header">
                    <div style="flex:1;">
                        <h1 style="margin:0; font-size:24px;">${e.name}</h1>
                        <span style="font-size:10px; text-transform:uppercase;">Nome do Personagem</span>
                    </div>
                    <div style="flex:2; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; font-size:10px;">
                        <div><strong>Classe/Nível:</strong> ${e.class} ${e.level}</div>
                        <div><strong>Raça:</strong> ${e.race}</div>
                        <div><strong>XP:</strong> ${e.xp||0}</div>
                    </div>
                </div>

                <div class="dnd-main-stats">
                    <div class="dnd-box"><div class="val">${10+s(t.dex)}</div><div class="label">CA</div></div>
                    <div class="dnd-box"><div class="val">+${s(t.dex)}</div><div class="label">Iniciativa</div></div>
                    <div class="dnd-box"><div class="val">${e.speed||30}ft</div><div class="label">Deslocamento</div></div>
                    <div class="dnd-box" style="flex:2;"><div class="val">${(a=e.hp)==null?void 0:a.current} / ${(i=e.hp)==null?void 0:i.max}</div><div class="label">Pontos de Vida Atuais</div></div>
                </div>

                <div class="dnd-grid">
                    <div class="dnd-stats-column">
                        ${Object.entries(t).map(([n,m])=>p`
                            <div class="stat-box">
                                <div class="stat-label">${n}</div>
                                <div class="stat-mod">${s(m)>=0?"+":""}${s(m)}</div>
                                <div class="stat-val">${m}</div>
                            </div>
                        `)}
                    </div>
                    
                    <div class="skill-list card" style="padding:15px; border:2px solid #000;">
                        <div style="font-weight:800; border-bottom:1px solid #000; margin-bottom:10px;">PERÍCIAS & TESTES</div>
                        <div class="skill-item">○ Acrobacia (Des)</div>
                        <div class="skill-item">○ Adestrar Animais (Sab)</div>
                        <div class="skill-item">○ Arcanismo (Int)</div>
                        <div class="skill-item">○ Atletismo (For)</div>
                        <div class="skill-item">○ Atuação (Car)</div>
                        <div class="skill-item">○ Enganação (Car)</div>
                        <div class="skill-item">○ Furtividade (Des)</div>
                        <div class="skill-item">○ História (Int)</div>
                        <div class="skill-item">○ Intimidação (Car)</div>
                        <div class="skill-item">○ Intuição (Sab)</div>
                        <div class="skill-item">○ Investigação (Int)</div>
                        <div class="skill-item">○ Medicina (Sab)</div>
                        <div class="skill-item">○ Natureza (Int)</div>
                        <div class="skill-item">○ Percepção (Sab)</div>
                        <div class="skill-item">○ Persuasão (Car)</div>
                        <div class="skill-item">○ Prestidigitação (Des)</div>
                        <div class="skill-item">○ Religião (Int)</div>
                        <div class="skill-item">○ Sobrevivência (Sab)</div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <div class="card" style="border:2px solid #000; padding:10px; flex:1;">
                            <div class="stat-label">Equipamento & Itens</div>
                            <div style="font-size:9px; margin-top:5px; white-space:pre-wrap;">${Array.isArray((o=e.equipment)==null?void 0:o.items)?e.equipment.items.map(n=>`${n.qty}x ${n.name}`).join(`
`):((r=e.equipment)==null?void 0:r.items)||""}</div>
                        </div>
                        <div class="card" style="border:2px solid #000; padding:10px; flex:1;">
                            <div class="stat-label">Características & Traços</div>
                            <div style="font-size:9px; margin-top:5px; white-space:pre-wrap;">${((d=e.roleplay)==null?void 0:d.traits)||""}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:20px; font-size:8px; text-align:center; opacity:0.5;">
                    Gerado pela Mesa do Mestre — Ficha Oficial de Referência 5e
                </div>
            </div>
        `}_renderHeroItem(e){var s,a;const t=e.id===this._selectedHeroId;return p`
            <div class="init-row ${t?"active":""}" style="padding:15px; cursor:pointer;" data-action="selectHero" data-id="${e.id}">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="token-avatar" style="width:35px; height:35px; border-color:${t?"var(--accent)":"rgba(255,255,255,0.1)"}; ${e.img?`background:url(${e.img}) center/cover;`:""}">${e.img?"":e.name.substring(0,2)}</div>
                    <div>
                        <div style="font-weight:700; font-size:0.85rem; color:${t?"var(--accent)":"var(--text)"}">${e.name}</div>
                        <div style="font-size:0.6rem; color:var(--text-dim);">Nv ${e.level} • ${(s=e.hp)==null?void 0:s.current}/${(a=e.hp)==null?void 0:a.max} HP</div>
                    </div>
                </div>
            </div>
        `}_renderCommandPanel(e){var f,u,x,h,w,b;const t=((f=e.hp)==null?void 0:f.current)/((u=e.hp)==null?void 0:u.max)*100,s=[0,0,300,900,2700,6500,14e3,23e3,34e3,48e3,64e3,85e3,1e5,12e4,14e4,165e3,195e3,225e3,265e3,305e3,355e3],a=parseInt(e.level)||1,i=parseInt(e.xp)||0,o=s[a+1]||s[20],r=s[a]||0,d=o-r,n=d>0?Math.min(100,Math.max(0,(i-r)/d*100)):100;let m="";(x=e.equipment)!=null&&x.items&&(Array.isArray(e.equipment.items)?m=e.equipment.items.map(v=>`${v.qty}x ${v.name}`).join(`
`):m=String(e.equipment.items));const c={str:"Força",dex:"Destreza",con:"Constituição",int:"Inteligência",wis:"Sabedoria",cha:"Carisma"};return p`
            <div class="flex flex-col gap-6 animate-fade-in font-sans">
                
                <!-- TOP CARD HEADER WITH XP PROGRESS TRACKER -->
                <div class="card glass-accent p-8">
                    <div class="flex gap-6 items-center flex-wrap">
                        <div class="token-avatar w-[90px] h-[90px] border-[3px] border-tomeGold font-cinzel text-3xl shadow-[0_0_15px_rgba(197,160,89,0.3)] bg-black/80 flex items-center justify-center">${e.name.substring(0,2)}</div>
                        <div class="flex-1 min-w-[250px]">
                            <h1 class="m-0 text-4xl font-cinzel text-tomeGold drop-shadow-md tracking-wide">${e.name}</h1>
                            <p class="text-slate-300 text-[0.95rem] mt-1.5 font-semibold uppercase tracking-wide"><i class="fa-solid fa-wand-magic-sparkles text-tomeGold"></i> ${e.race} ${e.class} • Nível ${a}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-[0.65rem] text-tomeGold font-extrabold tracking-[1.5px] uppercase">Experiência Acumulada</div>
                            <div class="text-3xl font-black text-white font-cinzel drop-shadow-sm">${i} <span class="text-base text-tomeGold">XP</span></div>
                        </div>
                    </div>

                    <!-- PROGRESS BAR -->
                    <div class="mt-6 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                        <div class="flex justify-between text-xs text-slate-300 mb-2 font-bold">
                            <span class="text-tomeGold">Nível ${a}</span>
                            <span class="text-white">${i} / ${o} XP (${Math.round(n)}%)</span>
                            <span class="opacity-60">Nível ${a+1}</span>
                        </div>
                        <div class="h-2.5 bg-black/80 rounded border border-tomeGold/25 overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-tomeGold to-yellow-400 shadow-[0_0_10px_rgba(197,160,89,0.5)] transition-all duration-500 ease-out" style="width:${n}%;"></div>
                        </div>
                    </div>
                </div>

                <!-- QUICK ACTIONS SECTION -->
                <div class="grid grid-cols-3 gap-6">
                    
                    <!-- HP CARD -->
                    <div class="card glass rounded-2xl p-5 flex flex-col justify-between">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs text-slate-400 font-extrabold uppercase"><i class="fa-solid fa-heart text-dndRedBright mr-1.5"></i> Vida do Herói</span>
                            <span class="text-sm font-extrabold text-white">${(h=e.hp)==null?void 0:h.current} / ${(w=e.hp)==null?void 0:w.max} HP</span>
                        </div>
                        <div class="hp-bar h-2.5 mb-5 bg-black/40 rounded border border-white/5 overflow-hidden">
                            <div class="hp-bar-fill ${t<30?"bg-dndRedBright":"bg-green-500"} h-full transition-all duration-300" style="width:${t}%;"></div>
                        </div>
                        <div class="grid grid-cols-4 gap-1.5">
                            <button class="btn btn-danger btn-sm rounded-md font-bold" data-action="adjustHP" data-val="-5">-5</button>
                            <button class="btn btn-ghost btn-sm rounded-md text-dndRedBright border-dndRedBright/15 font-bold" data-action="adjustHP" data-val="-1">-1</button>
                            <button class="btn btn-ghost btn-sm rounded-md text-green-500 border-green-500/15 font-bold" data-action="adjustHP" data-val="1">+1</button>
                            <button class="btn btn-primary btn-sm bg-green-500 border-green-500 font-bold rounded-md" data-action="adjustHP" data-val="5">+5</button>
                        </div>
                    </div>

                    <!-- XP MANAGEMENT CARD -->
                    <div class="card glass rounded-2xl p-5 flex flex-col justify-between">
                        <span class="text-xs font-extrabold text-blue-500 uppercase"><i class="fa-solid fa-star mr-1.5"></i> Canalizar Experiência</span>
                        <div class="grid grid-cols-2 gap-2 my-4">
                            <button class="btn btn-ghost btn-sm rounded-md font-bold font-cinzel" data-action="adjustXP" data-val="100">+100 XP</button>
                            <button class="btn btn-ghost btn-sm rounded-md font-bold font-cinzel" data-action="adjustXP" data-val="500">+500 XP</button>
                        </div>
                        <button class="btn btn-info btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm" data-action="customXP">
                            <i class="fa-solid fa-circle-plus mr-1.5"></i> Adicionar XP Customizado
                        </button>
                    </div>

                    <!-- PDF TOOLS CARD -->
                    <div class="card glass rounded-2xl p-5 flex flex-col justify-between gap-2.5">
                        <span class="text-xs font-extrabold text-tomeGold uppercase"><i class="fa-solid fa-print mr-1.5"></i> Ferramentas Físicas</span>
                        <button class="btn btn-primary btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm bg-tomeGold border-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.25)] text-black" data-action="printSheet">
                            <i class="fa-solid fa-file-pdf mr-1.5"></i> Imprimir Ficha Oficial 5e
                        </button>
                        <button class="btn btn-ghost btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm" data-action="printCard">
                            <i class="fa-solid fa-id-card mr-1.5"></i> Imprimir Card Rápido
                        </button>
                    </div>
                </div>

                <!-- INTERACTIVE ATTRIBUTE GRID WITH CLICK-TO-ROLL -->
                <div class="card glass p-6 rounded-2xl border-transparent">
                    <div class="text-sm text-tomeGold font-extrabold uppercase mb-4.5 font-cinzel tracking-wide"><i class="fa-solid fa-dice-d20"></i> Atributos do Personagem (Clique para Rolar d20)</div>
                    <div class="grid grid-cols-6 gap-4">
                        ${Object.entries(e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10}).map(([v,_])=>{const $=Math.floor((_-10)/2);return p`
                                <div class="glass hover:scale-105 hover:border-tomeGold hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] text-center p-4 rounded-xl border border-transparent cursor-pointer transition-all duration-300 ease-out group"
                                     data-action="rollAttribute" data-attr="${v}" data-val="${_}">
                                    <div class="text-[0.7rem] text-tomeGold font-black tracking-wide uppercase mb-1.5 font-cinzel">${c[v]||v}</div>
                                    <div class="text-3xl font-black text-white leading-none font-cinzel">${_}</div>
                                    <div class="text-xs ${$>=0?"text-green-500":"text-dndRedBright"} font-extrabold mt-2 bg-black/30 py-1 px-2 rounded-full inline-block">
                                        MOD ${$>=0?"+":""}${$}
                                    </div>
                                </div>
                            `})}
                    </div>
                </div>

                <!-- INVENTORY & NARRATIVE PARCHMENT TEXTAREAS -->
                <div class="grid grid-cols-2 gap-6">
                    
                    <!-- ITEMS INVENTORY -->
                    <div class="card glass rounded-2xl p-6 flex flex-col gap-3 border-transparent">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-tomeGold font-extrabold uppercase font-cinzel tracking-wide"><i class="fa-solid fa-backpack mr-1.5"></i> 🎒 Inventário de Itens</span>
                            <span id="items-save-status" class="text-[0.65rem] text-green-500 font-extrabold opacity-0 transition-opacity duration-300"><i class="fa-solid fa-circle-check"></i> Auto-salvo</span>
                        </div>
                        <p class="text-[0.65rem] text-slate-400 m-0">Digite os itens um por linha. Ex: <b class="text-tomeGold">2x Poção de Cura</b> ou <b class="text-tomeGold">Escudo de Aço</b>.</p>
                        <textarea class="form-textarea w-full font-mono text-sm leading-relaxed p-4 bg-black/40 border border-white/10 rounded-xl text-white" rows="6" 
                                  placeholder="Digite um item por linha..." 
                                  data-action="updateItems"
                                  oninput="const status = document.getElementById('items-save-status'); if(status){ status.style.opacity=1; setTimeout(()=>status.style.opacity=0, 1000); }">${m}</textarea>
                    </div>

                    <!-- NARRATIVE NOTES -->
                    <div class="card glass bg-black/50 rounded-2xl border border-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-tomeGold font-extrabold uppercase font-cinzel tracking-wide"><i class="fa-solid fa-pen-nib mr-1.5"></i> 📝 Características & Diário</span>
                            <span id="notes-save-status" class="text-[0.65rem] text-green-500 font-extrabold opacity-0 transition-opacity duration-300"><i class="fa-solid fa-circle-check"></i> Auto-salvo</span>
                        </div>
                        <p class="text-[0.65rem] text-slate-400 m-0">Registre traços de personalidade, antecedente, e notas de interpretação do herói.</p>
                        <textarea class="form-textarea w-full font-sans text-sm leading-relaxed p-4 bg-black/40 border border-white/10 rounded-xl text-white" rows="6" 
                                  placeholder="Escreva traços ou anotações..." 
                                  data-action="updateNotes"
                                  oninput="const status = document.getElementById('notes-save-status'); if(status){ status.style.opacity=1; setTimeout(()=>status.style.opacity=0, 1000); }">${((b=e.roleplay)==null?void 0:b.traits)||""}</textarea>
                    </div>

                </div>

            </div>
        `}selectHero(e,t){this._selectedHeroId=t.dataset.id,this.render()}printSheet(){document.body.classList.add("print-sheet-mode"),window.print(),setTimeout(()=>document.body.classList.remove("print-sheet-mode"),500)}printCard(){document.body.classList.add("print-card-mode"),window.print(),setTimeout(()=>document.body.classList.remove("print-card-mode"),500)}_renderCardTemplate(e){var a,i,o,r,d;const t=e.stats||{str:10,dex:10,con:10,int:10,wis:10,cha:10},s=n=>Math.floor((n-10)/2);return p`
            <div class="dnd-card-template box-border w-[450px] bg-white border-[3px] border-double border-black rounded-xl p-5 text-black font-sans my-5 mx-auto shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
                <div class="flex justify-between items-center border-b-[2.5px] border-black pb-2 mb-3">
                    <div>
                        <h2 class="m-0 text-xl font-cinzel font-black tracking-wide text-black">${e.name}</h2>
                        <span class="text-[9.5px] text-[#444] font-bold uppercase tracking-wide">${e.race} • ${e.class} Nível ${e.level}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[13px] font-black border-2 border-black py-1 px-2 rounded-md bg-[#f0f0f0]">CA ${e.ac}</span>
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2 mb-3.5 text-center">
                    <div class="border-[1.5px] border-black py-1.5 px-1 rounded-md">
                        <div class="text-[8px] uppercase font-extrabold text-[#555]">Iniciativa</div>
                        <div class="text-[15px] font-black text-black">${s(t.dex)>=0?"+":""}${s(t.dex)}</div>
                    </div>
                    <div class="border-[1.5px] border-black py-1.5 px-1 rounded-md">
                        <div class="text-[8px] uppercase font-extrabold text-[#555]">Desloc.</div>
                        <div class="text-[15px] font-black text-black">9m</div>
                    </div>
                    <div class="border-[1.5px] border-black py-1.5 px-1 rounded-md col-span-2 bg-[#f5f5f5]">
                        <div class="text-[8px] uppercase font-extrabold text-[#555]">Pontos de Vida</div>
                        <div class="text-[15px] font-black text-black">${(a=e.hp)==null?void 0:a.current} / ${(i=e.hp)==null?void 0:i.max} HP</div>
                    </div>
                </div>

                <div class="grid grid-cols-6 gap-1.5 mb-3.5 text-center">
                    ${Object.entries(t).map(([n,m])=>p`
                        <div class="border-[1.5px] border-black py-1 px-0.5 rounded-md bg-[#fffcf5]">
                            <div class="text-[8px] uppercase font-black text-[#555]">${n.toUpperCase()}</div>
                            <div class="text-[14px] font-black text-black my-0.5">${m}</div>
                            <div class="text-[8.5px] text-[#444] font-bold bg-black/5 py-[1px] rounded-sm">${s(m)>=0?"+":""}${s(m)}</div>
                        </div>
                    `)}
                </div>

                <div class="grid grid-cols-2 gap-3 text-[10px]">
                    <div class="border-[1.5px] border-black p-2.5 rounded-lg bg-[#fffcfc]">
                        <strong class="block border-b-[1.5px] border-black pb-1 mb-1.5 text-[9.5px] uppercase font-cinzel text-black">🎒 Inventário</strong>
                        <div class="whitespace-pre-wrap text-[8.5px] leading-relaxed text-[#222]">${Array.isArray((o=e.equipment)==null?void 0:o.items)?e.equipment.items.map(n=>`${n.qty}x ${n.name}`).join(`
`):((r=e.equipment)==null?void 0:r.items)||"Nenhum item."}</div>
                    </div>
                    <div class="border-[1.5px] border-black p-2.5 rounded-lg bg-[#fffcfc]">
                        <strong class="block border-b-[1.5px] border-black pb-1 mb-1.5 text-[9.5px] uppercase font-cinzel text-black">📝 Diário & Notas</strong>
                        <div class="whitespace-pre-wrap text-[8.5px] leading-relaxed text-[#222]">${((d=e.roleplay)==null?void 0:d.traits)||"Nenhuma nota."}</div>
                    </div>
                </div>
            </div>
        `}_getSessionListKey(){const e=localStorage.getItem("DM_ACTIVE_TABLE")||"";return e?`TOME_SESSION_LIST_${e}`:"TOME_SESSION_LIST"}_getSessionMetaKey(e){const t=localStorage.getItem("DM_ACTIVE_TABLE")||"default";return p`TOME_SESSION_META_${t}_${e}`}_getSessionMeta(e){try{return JSON.parse(localStorage.getItem(this._getSessionMetaKey(e))||"{}")}catch{return{}}}_saveSessionMeta(e,t){const s=this._getSessionMeta(e);localStorage.setItem(this._getSessionMetaKey(e),JSON.stringify({...s,...t}))}_getSessionsList(){let e=[];try{e=JSON.parse(localStorage.getItem(this._getSessionListKey())||"[]")}catch{}return e.some(t=>t.file==="state.json")||(e.unshift({name:"Sessão Padrão",file:"state.json"}),localStorage.setItem(this._getSessionListKey(),JSON.stringify(e))),e}_isTimerRunning(){var s;const e=((s=l.persistence)==null?void 0:s.filename)||"state.json",t=this._getSessionMeta(e);return t.status==="open"&&!!t.timerStart&&!t.timerPaused}_getTimerDisplay(){var a;if(this._timerInterval)return this._timerDisplay;const e=((a=l.persistence)==null?void 0:a.filename)||"state.json",t=this._getSessionMeta(e);if(!t.totalElapsed&&!t.timerStart)return"00:00:00";let s=t.totalElapsed||0;return t.timerStart&&!t.timerPaused&&(s+=Date.now()-t.timerStart),this._formatElapsed(s)}_formatElapsed(e){const t=Math.floor(e/1e3),s=Math.floor(t/3600),a=Math.floor(t%3600/60),i=t%60;return`${String(s).padStart(2,"0")}:${String(a).padStart(2,"0")}:${String(i).padStart(2,"0")}`}_getActiveSessionStatus(){var s;const e=((s=l.persistence)==null?void 0:s.filename)||"state.json",t=this._getSessionMeta(e);return t.status==="open"&&!t.timerPaused&&t.timerStart?p`<span class="session-status-badge badge-active"><i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> Em Andamento</span>`:t.status==="open"?p`<span class="session-status-badge badge-open"><i class="fa-solid fa-door-open" style="font-size:0.55rem;"></i> Aberta</span>`:t.status==="closed"?p`<span class="session-status-badge badge-closed"><i class="fa-solid fa-check" style="font-size:0.55rem;"></i> Finalizada</span>`:p`<span class="session-status-badge badge-closed">Não Iniciada</span>`}_renderTimerButtons(){var d;const e=((d=l.persistence)==null?void 0:d.filename)||"state.json",t=this._getSessionMeta(e),s=t.status==="open"&&!!t.timerStart&&!t.timerPaused,a=t.status==="open"&&t.timerPaused,i=t.status==="closed";let o="";i?o=p`<button class="timer-btn timer-btn-start" data-action="startSessionTimer" style="width:100%;">
                <i class="fa-solid fa-rotate-left"></i> Reabrir
            </button>`:s?o=p`<button class="timer-btn timer-btn-pause" data-action="pauseSessionTimer" style="width:100%;">
                <i class="fa-solid fa-pause"></i> Pausar
            </button>`:a?o=p`<button class="timer-btn timer-btn-start" data-action="startSessionTimer" style="width:100%;">
                <i class="fa-solid fa-play"></i> Continuar
            </button>`:o=p`<button class="timer-btn timer-btn-start" data-action="startSessionTimer" style="width:100%;">
                <i class="fa-solid fa-play"></i> Iniciar
            </button>`;const r=p`<button class="timer-btn timer-btn-end" style="width:100%; margin-top: 4px;" data-action="resetSessionTimer" title="Zerar o cronômetro e gerar relatório de consistência">
            <i class="fa-solid fa-flag-checkered"></i> Zerar
        </button>`;return o+r}_startTickInterval(){this._timerInterval||(this._timerInterval=setInterval(()=>{var r;const e=((r=l.persistence)==null?void 0:r.filename)||"state.json",t=this._getSessionMeta(e);if(!t.timerStart||t.timerPaused){this._stopTickInterval();return}const s=(t.totalElapsed||0)+(Date.now()-t.timerStart),a=t.timerLimitMs||0;let i=s;if(a>0){const d=a-s;if(d<=0){this._timerDisplay="00:00:00";const n=document.getElementById("session-timer-display");n&&(n.textContent=this._timerDisplay),this.autoEndAndReport();return}i=d}else i=s;this._timerDisplay=this._formatElapsed(i);const o=document.getElementById("session-timer-display");o&&(o.textContent=this._timerDisplay)},1e3))}_stopTickInterval(){this._timerInterval&&(clearInterval(this._timerInterval),this._timerInterval=null)}startSessionTimer(){var s;const e=((s=l.persistence)==null?void 0:s.filename)||"state.json",t=this._getSessionMeta(e);t.status==="closed"?(this._saveSessionMeta(e,{status:"open",timerStart:Date.now(),timerPaused:!1}),g.show("Sessão reaberta e cronômetro reiniciado!","success")):t.timerPaused?(this._saveSessionMeta(e,{timerStart:Date.now(),timerPaused:!1}),g.show("Cronômetro retomado!","success")):(this._saveSessionMeta(e,{status:"open",timerStart:Date.now(),timerPaused:!1,totalElapsed:t.totalElapsed||0}),g.show("Sessão iniciada! Cronômetro rodando.","success")),this._startTickInterval(),this.render()}pauseSessionTimer(){var a;const e=((a=l.persistence)==null?void 0:a.filename)||"state.json",t=this._getSessionMeta(e);if(!t.timerStart)return;const s=(t.totalElapsed||0)+(Date.now()-t.timerStart);this._saveSessionMeta(e,{totalElapsed:s,timerPaused:!0,timerStart:null}),this._timerDisplay=this._formatElapsed(s),this._stopTickInterval(),g.show(`Cronômetro pausado em ${this._timerDisplay}`,"warning"),this.render()}endSessionTimer(){var i;if(!confirm(`Deseja encerrar e finalizar esta sessão?
O tempo total será salvo e a sessão ficará marcada como Finalizada.`))return;const e=((i=l.persistence)==null?void 0:i.filename)||"state.json",t=this._getSessionMeta(e);let s=t.totalElapsed||0;t.timerStart&&!t.timerPaused&&(s+=Date.now()-t.timerStart);const a=new Date().toLocaleString("pt-BR");this._saveSessionMeta(e,{status:"closed",totalElapsed:s,timerStart:null,timerPaused:!1,endedAt:a}),this._timerDisplay=this._formatElapsed(s),this._stopTickInterval(),l.store.update(o=>{o.journalEntries=o.journalEntries||[],o.journalEntries.push({type:"info",title:"Sessão Encerrada",content:`Duração total: ${this._formatElapsed(s)} — Encerrada em ${a}`,timestamp:Date.now()})}),g.show(`Sessão encerrada! Duração: ${this._formatElapsed(s)}`,"success"),this.render()}async resetSessionTimer(){var t;if(!confirm("Tem certeza que deseja ZERAR o cronômetro da sessão atual? Isso também executará uma análise completa do sistema e gerará o relatório."))return;this._stopTickInterval();const e=((t=l.persistence)==null?void 0:t.filename)||"state.json";this._saveSessionMeta(e,{totalElapsed:0,timerStart:null,timerPaused:!1}),this._timerDisplay="00:00:00",this.render(),await this.runSystemAnalysisAndReport("Zerar Cronômetro (Reset Manual)")}autoEndAndReport(){var i;this._stopTickInterval();const e=((i=l.persistence)==null?void 0:i.filename)||"state.json",t=this._getSessionMeta(e);let s=t.totalElapsed||0;t.timerStart&&!t.timerPaused&&(s+=Date.now()-t.timerStart);const a=new Date().toLocaleString("pt-BR");this._saveSessionMeta(e,{status:"closed",totalElapsed:s,timerStart:null,timerPaused:!1,endedAt:a}),this._timerDisplay="00:00:00",l.store.update(o=>{o.journalEntries=o.journalEntries||[],o.journalEntries.push({type:"info",title:"Sessão Encerrada por Limite",content:`A sessão atingiu o limite configurado de ${this._formatElapsed(t.timerLimitMs)} e foi encerrada automaticamente.`,timestamp:Date.now()})}),this.render(),this.runSystemAnalysisAndReport("Limite de Tempo Atingido (00:00:00)")}async runSystemAnalysisAndReport(e){g.show("Executando análise de consistência do sistema...","info");const t=l.store.snapshot(),s=t.players||[],a=t.monsters||[],i=t.journalEntries||[],o=t.quests||[],r=s.filter(b=>{var v;return((v=b.hp)==null?void 0:v.current)===0}).map(b=>b.name),d=a.filter(b=>{var v;return((v=b.hp)==null?void 0:v.current)>0}).map(b=>b.name),n=o.filter(b=>b.completed||b.status==="completed").length,m=o.filter(b=>!b.completed&&!b.failed&&(b.status==="pending"||b.status==="active"||!b.status)).length,c=t.xpDistributed||0;let f=100;const u=[];r.length>0&&(f-=r.length*15,u.push(`⚠️ Alerta: ${r.length} herói(s) inconsciente(s)/caído(s): ${r.join(", ")}.`)),d.length>0&&t.combatActive&&(f-=10,u.push(`⚠️ Combate: ${d.length} criatura(s) hostil(is) ainda ativa(s) na arena.`)),m>5&&(f-=5,u.push(`ℹ️ Quests: Há muitas missões pendentes (${m}). Recomenda-se focar na resolução.`)),i.length===0&&(f-=10,u.push("⚠️ Diário: Nenhum evento ou marco narrativo registrado na linha do tempo.")),f=Math.max(0,f);let x="#2ecc71",h="Excelente";f<50?(x="#e74c3c",h="Crítico"):f<80&&(x="#f1c40f",h="Estável / Atenção");const w=p`
            <div style="font-family:'Outfit', sans-serif; text-align:left; color:#fff;">
                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(197,160,89,0.25); border-radius:12px; padding:18px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                    <div>
                        <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Gatilho do Relatório</div>
                        <strong style="color:var(--accent); font-size:1rem;">${e}</strong>
                        <div style="font-size:0.7rem; color:#64748b; margin-top:4px;">Data: ${new Date().toLocaleString("pt-BR")}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.8rem; font-weight:900; color:${x}; font-family:'Cinzel';">${f}%</div>
                        <div style="font-size:0.65rem; color:${x}; font-weight:800; text-transform:uppercase;">Status: ${h}</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                        <span style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Estatísticas de Combate</span>
                        <div style="font-size:0.85rem; color:#fff; font-weight:600; margin-top:4px;">Heróis Vivos: ${s.length-r.length} / ${s.length}</div>
                        <div style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">Inimigos Derrotados: ${a.length-d.length} / ${a.length}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
                        <span style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Riquezas & Progresso</span>
                        <div style="font-size:0.85rem; color:#fff; font-weight:600; margin-top:4px;">Total XP Distribuído: ${c} XP</div>
                        <div style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">Missões Concluídas: ${n} / ${o.length}</div>
                    </div>
                </div>

                <h4 style="font-family:'Cinzel'; color:var(--accent); font-size:0.85rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px; margin:0 0 10px 0;">
                    <i class="fa-solid fa-list-check"></i> Diagnósticos e Recomendações
                </h4>
                <div style="background:rgba(0,0,0,0.4); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px; max-height:180px; overflow-y:auto;">
                    ${u.map(b=>p`<div style="font-size:0.8rem; line-height:1.4; color:#e2e8f0;">${b}</div>`).join("")||'<div style="font-size:0.8rem; color:#64748b; font-style:italic;">Nenhuma inconformidade encontrada no sistema. Integridade perfeita!</div>'}
                </div>
            </div>
        `;M.show({title:"Relatório de Consistência e Desempenho",content:w,type:f<50?"danger":f<80?"confirm":"info"})}startCampaignForm(){const e=document.getElementById("campaign-form-modal");e&&e.remove();const t=localStorage.getItem("DM_MASTER_NAME")||"",s=document.createElement("div");s.id="campaign-form-modal",s.style.cssText=`
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s ease;
        `,s.innerHTML=p`
            <div class="card glass-accent" style="width:90%; max-width:480px; padding:30px; border-radius:18px; border:2px solid var(--accent); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0 0 8px 0; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:10px;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:8px;"></i> Iniciar Nova Campanha
                </h3>
                <p style="font-size:0.75rem; color:var(--text-dim); margin-bottom:20px;">Insira os dados iniciais do novo reino e da jornada do seu grupo.</p>
                
                <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:25px;">
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Nome da Campanha</label>
                        <input type="text" id="new-camp-name" class="form-input" value="A Lenda de Hawnk" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff;" />
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Mestre / DM</label>
                        <input type="text" id="new-camp-dm" class="form-input" value="${t}" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff;" />
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Sistema de Jogo</label>
                        <select id="new-camp-system" class="form-select" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; cursor:pointer;">
                            <option value="D&D 5e">D&D 5e (Dungeons & Dragons)</option>
                            <option value="Pathfinder 2e">Pathfinder 2e</option>
                            <option value="Tormenta20">Tormenta20</option>
                            <option value="Outro">Outro Sistema</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Introdução Histórica (Lore)</label>
                        <textarea id="new-camp-lore" class="form-textarea" rows="3" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; font-size:0.8rem;">Uma nova jornada épica se inicia nas terras de Arcanum...</textarea>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div>
                            <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Nível Inicial</label>
                            <input type="number" id="new-camp-lvl" class="form-input" value="1" min="1" max="20" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; text-align:center;" />
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:var(--accent); font-weight:800; text-transform:uppercase;">Limite do Timer</label>
                            <select id="new-camp-timer" class="form-select" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(197,160,89,0.3); padding:8px 12px; border-radius:8px; color:#fff; cursor:pointer;">
                                <option value="0">Sem Limite</option>
                                <option value="3600000">1 Hora</option>
                                <option value="7200000">2 Horas</option>
                                <option value="10800000">3 Horas</option>
                                <option value="14400000">4 Horas</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-ghost close-btn">Cancelar</button>
                    <button class="btn btn-primary start-btn" style="background:#2ecc71; border-color:#2ecc71;">Iniciar Campanha</button>
                </div>
            </div>
        `,document.body.appendChild(s),s.querySelector(".close-btn").onclick=()=>s.remove(),s.querySelector(".start-btn").onclick=async()=>{const a=s.querySelector("#new-camp-name").value,i=s.querySelector("#new-camp-dm").value,o=s.querySelector("#new-camp-system").value,r=s.querySelector("#new-camp-lore").value,d=parseInt(s.querySelector("#new-camp-lvl").value)||1,n=parseInt(s.querySelector("#new-camp-timer").value)||0;localStorage.setItem("DM_SYSTEM",o),localStorage.setItem("DM_MASTER_NAME",i);const c=`${a.trim().toLowerCase().replace(/[^a-z0-9]/g,"_").replace(/_+/g,"_")}.json`;let f=this._getSessionsList();if(f.some(u=>u.file===c)){g.show("Uma campanha com este nome já existe!","danger");return}f.push({name:a.trim(),file:c}),localStorage.setItem(this._getSessionListKey(),JSON.stringify(f)),this._saveSessionMeta(c,{status:"open",totalElapsed:0,timerStart:null,timerPaused:!1,timerLimitMs:n}),l.persistence.filename=c,localStorage.setItem("TOME_ACTIVE_SESSION",c),l.store.update(u=>{u.sessionTitle=a.trim(),u.sessionNumber=1,u.sessionNotes=r,u.players=u.players||[],u.players.forEach(x=>{x.level=d,x.xp=0}),u.monsters=[],u.initiativeOrder=[],u.concentration=[],u.combatRound=0,u.combatActive=!1,u.journalEntries=[{id:Date.now(),timestamp:Date.now(),type:"info",title:"Campanha Iniciada",content:`Mestre ${i} iniciou a campanha "${a}" usando o sistema ${o}.`}],u.tacticalMap={fog:null,mapUrl:null,tokens:[]},u.lastLoot=null,u.xpDistributed=0}),await l.persistence.save(),s.remove(),await this._applySessionSwitch(c),g.show(`Campanha "${a}" criada e iniciada!`,"success")}}_renderCampaignBanner(){var h;const e=this.store.state,t=e.sessionTitle||"Nova Campanha",s=localStorage.getItem("DM_SYSTEM")||"D&D 5e",a=localStorage.getItem("DM_MASTER_NAME")||"Mestre",i=e.sessionNumber||1,o=e.players||[],r=o.filter(w=>{var b;return(((b=w.hp)==null?void 0:b.current)||0)>0}).length,d=e.xpDistributed||0,n=e.combatActive,m=((h=l.persistence)==null?void 0:h.filename)||"state.json";this._getSessionMeta(m);const c=this._timerDisplay||this._getTimerDisplay(),f=n?"#ef4444":"#22c55e",u=n?"Em Combate":"Explorando",x=n?"fa-swords":"fa-compass";return p`
            <div style="
                background: linear-gradient(135deg, rgba(197,160,89,0.06), rgba(10,12,16,0.8));
                border: 1px solid rgba(197,160,89,0.25);
                border-radius: 16px;
                padding: 20px 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                flex-wrap: wrap;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 0 40px rgba(197,160,89,0.02);
                position: relative;
                overflow: hidden;
            ">
                <!-- Decorative glow -->
                <div style="position:absolute; top:-40px; left:-40px; width:200px; height:200px; background:radial-gradient(circle, rgba(197,160,89,0.08), transparent 70%); pointer-events:none;"></div>

                <!-- Campaign Identity -->
                <div style="display:flex; flex-direction:column; gap:4px; min-width:200px;">
                    <div style="font-size:0.55rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:2px; font-family:'Cinzel';">Campanha Ativa</div>
                    <div style="font-family:'Cinzel', serif; font-size:1.35rem; font-weight:900; color:var(--accent); text-shadow:0 2px 10px rgba(197,160,89,0.3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px;">${t}</div>
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <span style="font-size:0.65rem; color:#94a3b8;"><i class="fa-solid fa-scroll" style="margin-right:3px; color:var(--accent);"></i>${s}</span>
                        <span style="font-size:0.65rem; color:#94a3b8;"><i class="fa-solid fa-user-shield" style="margin-right:3px; color:var(--accent);"></i>${a}</span>
                        <span style="font-size:0.65rem; color:#94a3b8;"><i class="fa-solid fa-book-open" style="margin-right:3px; color:var(--accent);"></i>Sessão ${i}</span>
                    </div>
                </div>

                <!-- Stats Row -->
                <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:900; color:#22c55e; font-family:'Cinzel';">${r}<span style="font-size:0.9rem; color:#64748b;">/${o.length}</span></div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Heróis Vivos</div>
                    </div>
                    <div style="width:1px; height:32px; background:rgba(255,255,255,0.06);"></div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:900; color:var(--accent); font-family:'JetBrains Mono',monospace;">${c}</div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Tempo Sessão</div>
                    </div>
                    <div style="width:1px; height:32px; background:rgba(255,255,255,0.06);"></div>
                    <div style="text-align:center;">
                        <div style="font-size:1.4rem; font-weight:900; color:#60a5fa; font-family:'Cinzel';">${d.toLocaleString("pt-BR")}</div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">XP Total</div>
                    </div>
                    <div style="width:1px; height:32px; background:rgba(255,255,255,0.06);"></div>
                    <div style="text-align:center;">
                        <div style="font-size:0.8rem; font-weight:800; color:${f}; display:flex; align-items:center; gap:5px; font-family:'Cinzel';"><i class="fa-solid ${x}"></i>${u}</div>
                        <div style="font-size:0.55rem; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Status</div>
                    </div>
                </div>
            </div>
        `}quickAddQuest(){const e=prompt("Digite o título da nova Quest/Missão:");if(!e||!e.trim())return;const t=prompt("Digite a recompensa (Ex: 200 GP, Anel Mágico):")||"";l.store.update(s=>{s.quests=s.quests||[],s.quests.push({id:"q-"+Date.now(),title:e.trim(),description:"Missão rápida cadastrada via central de comando.",type:"side",difficulty:"medium",levelRange:"1-4",faction:"Nenhuma",xpType:"xp",xpReward:100,reward:t.trim()||"Nenhuma",milestones:[],completed:!1,failed:!1,xpDistributed:!1,status:"active"})}),g.show("Nova missão adicionada ao painel!","success"),this.render()}quickCompleteQuest(e,t){var i;e&&e.stopPropagation();const s=t.dataset.id;l.store.update(o=>{o.quests=(o.quests||[]).map(r=>{if(String(r.id)===String(s)){const d=o.sessionNumber||1,n=`⚔️ MISSÃO CONCLUÍDA: Os heróis completaram a missão "${r.title}"!`;if(o.journalEntries=[...o.journalEntries||[],{id:"log-"+Date.now()+"-"+Math.floor(Math.random()*100),session:d,timestamp:Date.now(),text:n,type:"system"}],r.faction&&r.faction!=="Nenhuma"){const m=r.difficulty==="easy"?1:r.difficulty==="hard"?3:r.difficulty==="deadly"?5:2;o.factionRenown=o.factionRenown||{Harpers:0,Alliance:0,Gauntlet:0,Enclave:0,Zhentarim:0};const f={Harpistas:"Harpers","Aliança dos Lordes":"Alliance","Ordem da Manopla":"Gauntlet","Enclave Esmeralda":"Enclave",Zhentarim:"Zhentarim"}[r.faction]||"Harpers";o.factionRenown[f]=(o.factionRenown[f]||0)+m;const u=`🚩 RENOME DE FACÇÃO: A influência com os ${r.faction} aumentou em +${m} pontos pela conclusão de "${r.title}".`;o.journalEntries.push({id:"log-f-"+Date.now(),session:d,timestamp:Date.now(),text:u,type:"system"})}return{...r,completed:!0,failed:!1,status:"completed"}}return r})});const a=(i=this.store.state.quests)==null?void 0:i.find(o=>String(o.id)===String(s));a&&this._logChronicleEntry(`Aventura Concluída: "${a.title}". Os heróis conquistaram as metas e foram agraciados com recompensas.`,"quest_completed"),l.persistence.save().catch(o=>console.warn(o)),g.show("Missão marcada como concluída!","success"),this.render()}quickFailQuest(e,t){var a;e&&e.stopPropagation();const s=t.dataset.id;if(confirm("Marcar esta missão como fracassada? O fracasso será arquivado na crônica da campanha.")){l.store.update(o=>{o.quests=(o.quests||[]).map(r=>{if(String(r.id)===String(s)){const d=o.sessionNumber||1,n=`💀 MISSÃO FRACASSADA: Os heróis falharam na missão "${r.title}".`;return o.journalEntries=[...o.journalEntries||[],{id:"log-"+Date.now()+"-"+Math.floor(Math.random()*100),session:d,timestamp:Date.now(),text:n,type:"system"}],{...r,failed:!0,completed:!1,status:"failed"}}return r})});const i=(a=this.store.state.quests)==null?void 0:a.find(o=>String(o.id)===String(s));i&&this._logChronicleEntry(`Aventura Fracassada: "${i.title}". Um capítulo sombrio se fecha com a derrota ou falha dos heróis nas suas metas.`,"quest_failed"),l.persistence.save().catch(o=>console.warn(o)),this.render()}}quickDeleteQuest(e,t){e&&e.stopPropagation();const s=t.dataset.id;confirm("Deseja excluir esta missão permanentemente? Esta ação não pode ser desfeita.")&&(l.store.update(a=>{a.quests=(a.quests||[]).filter(i=>String(i.id)!==String(s))}),l.persistence.save().catch(a=>console.warn(a)),this.render(),g.show("Missão removida permanentemente."))}quickLootQuest(e,t){var n;e&&e.stopPropagation();const s=t.dataset.id,a=(n=this.store.state.quests)==null?void 0:n.find(m=>String(m.id)===String(s));if(!a)return;let i=0;const o=a.reward||"",r=o.match(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)/);r&&(i=parseInt(r[1])||0);const d=o.replace(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)(?:,?\s*e?\s*)?/,"").trim();this._showLootModalId=s,this._selectedLootPlayers=(this.store.state.players||[]).map(m=>m.id),this._lootGold=i,this._lootItems=d!=="Nenhuma"?d:"",this.render()}closeLootModal(){this._showLootModalId=null,this.render()}toggleLootPlayer(e){this._selectedLootPlayers.includes(e)?this._selectedLootPlayers=this._selectedLootPlayers.filter(t=>t!==e):this._selectedLootPlayers.push(e),this.render()}confirmLootDistribution(){var o;if(!this._showLootModalId||this._selectedLootPlayers.length===0)return;const e=this._showLootModalId,t=parseInt(this._lootGold)||0,s=(this._lootItems||"").trim(),a=t>0?Math.floor(t/this._selectedLootPlayers.length):0;l.store.update(r=>{r.players.forEach(c=>{this._selectedLootPlayers.includes(c.id)&&(c.currency||(c.currency={pp:0,gp:0,ep:0,sp:0,cp:0}),c.currency.gp=(parseInt(c.currency.gp)||0)+a,s&&(c.equipment||(c.equipment={items:[],notes:""}),typeof c.equipment.items=="string"?c.equipment.items=c.equipment.items.trim()?c.equipment.items+`
• `+s:"• "+s:(c.equipment.items=c.equipment.items||[],c.equipment.items.push({id:"item-"+Date.now()+"-"+Math.floor(Math.random()*100),name:s,qty:1,weight:.5}))))}),r.quests=(r.quests||[]).map(c=>String(c.id)===String(e)?{...c,rewardDistributed:!0}:c);const d=r.players.filter(c=>this._selectedLootPlayers.includes(c.id)).map(c=>c.name).join(", "),n=r.sessionNumber||1;let m=`💰 DIVISÃO DE SAQUE: Riquezas da missão foram distribuídas para: ${d}.`;t>0&&(m+=` Cada herói recebeu +${a} PO.`),s&&(m+=` Itens entregues: "${s}".`),r.journalEntries=[...r.journalEntries||[],{id:"log-loot-"+Date.now(),session:n,timestamp:Date.now(),text:m,type:"loot"}]});const i=(o=this.store.state.quests)==null?void 0:o.find(r=>String(r.id)===String(e));if(i){let r=`Tesouros da missão "${i.title}" divididos entre o grupo.`;t>0&&(r+=` +${t} PO partilhados.`),s&&(r+=` Artefatos obtidos: ${s}.`),this._logChronicleEntry(r,"loot_divided")}l.persistence.save().catch(r=>console.warn(r)),g.show("Riquezas e itens distribuídos com sucesso!","success"),this._showLootModalId=null,this.render()}_logChronicleEntry(e,t="custom"){const s=this.store.state.sessionNumber||1;l.store.update(a=>{a.chronicleEntries=[...a.chronicleEntries||[],{id:"chron-"+Date.now()+"-"+Math.floor(Math.random()*100),session:s,timestamp:Date.now(),text:e,type:t}]})}_renderLootModal(){var s;const e=(s=this.store.state.quests)==null?void 0:s.find(a=>String(a.id)===String(this._showLootModalId));if(!e)return"";const t=this.store.state.players||[];return p`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.campaign-manager').__component.closeLootModal()">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9); text-align:left; background:rgba(10,12,16,0.95);" onclick="event.stopPropagation()">
                    <div style="text-align:center; margin-bottom:20px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:15px;">
                        <i class="fa-solid fa-gift fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                        <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.6rem;">💰 Distribuir Tesouro</h3>
                        <p style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                            Recompensa da Missão: <strong style="color:#fff;">"${e.reward}"</strong>
                        </p>
                    </div>

                    <!-- Input Gold -->
                    <div class="form-group" style="margin-bottom:15px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Ouro Total a Dividir (GP / PO)</label>
                        <input type="number" id="loot-gold-input" value="${this._lootGold}" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.campaign-manager').__component._lootGold = parseInt(this.value) || 0" />
                    </div>

                    <!-- Input Items -->
                    <div class="form-group" style="margin-bottom:20px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Itens Mágicos / Equipamentos a Entregar</label>
                        <input type="text" id="loot-items-input" value="${this._lootItems}" placeholder="Ex: Poção de Cura Maior, Anel de Proteção" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.campaign-manager').__component._lootItems = this.value" />
                    </div>

                    <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800; display:block; margin-bottom:8px;">Selecione os Heróis Beneficiários</label>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:180px; overflow-y:auto; padding-right:5px; scrollbar-width:thin;">
                        ${t.map(a=>{const i=this._selectedLootPlayers.includes(a.id);return p`
                                <label style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:${i?"rgba(197,160,89,0.08)":"rgba(255,255,255,0.02)"}; border-radius:10px; cursor:pointer; border:1px solid ${i?"var(--accent)":"rgba(255,255,255,0.06)"}; transition:all 0.2s;">
                                    <input type="checkbox" style="width:18px; height:18px; accent-color:var(--accent); cursor:pointer;" 
                                           ${i?"checked":""}
                                           onchange="this.closest('.campaign-manager').__component.toggleLootPlayer('${a.id}')" />
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.9rem; color:#fff;">${a.name}</div>
                                        <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">${a.class||"Aventureiro"}</div>
                                    </div>
                                </label>
                            `})}
                    </div>

                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" data-action="closeLootModal">Cancelar</button>
                        <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" data-action="confirmLootDistribution" ${this._selectedLootPlayers.length===0?"disabled":""}>
                            Confirmar Distribuição
                        </button>
                    </div>
                </div>
            </div>
        `}async quickOracleInspire(){g.show("Consultando o Oráculo IA...","info");const e=localStorage.getItem("DM_SYSTEM")||"D&D 5e",t=l.store.state.sessionTitle||"Nova Campanha",s=(l.store.state.players||[]).map(a=>`${a.name} (Nv ${a.level} ${a.class})`).join(", ");try{const a=`Crie um gancho narrativo dramático e curto (2 frases) para a campanha "${t}" usando o sistema "${e}" com os heróis: ${s}. Foque em mistério ou perigo imediato.`,i=await l.ai.ask(a);l.store.update(o=>{o.journalEntries=o.journalEntries||[],o.journalEntries.push({id:Date.now(),timestamp:Date.now(),type:"oracle",title:"Oráculo da Campanha",content:i})}),g.show("O Oráculo soprou uma inspiração narrativa no diário!","success"),this.render()}catch(a){g.show("O Oráculo falhou em se comunicar: "+a.message,"danger")}}adjustMonsterHP(e,t){const s=parseInt(t.dataset.id),a=parseInt(t.dataset.val);l.store.update(i=>{var r;const o=i.monsters.find(d=>d.id===s);if(o){o.hp.current=Math.max(0,Math.min(o.hp.max,o.hp.current+a));const d=(r=i.initiativeOrder)==null?void 0:r.find(n=>n.id===o.id);d&&(d.hp_current=o.hp.current)}}),this.render()}onMount(){var a;this.element.classList.add("campaign-manager"),this.element.__component=this;const e=((a=l.persistence)==null?void 0:a.filename)||"state.json",t=this._getSessionMeta(e);t.status==="open"&&t.timerStart&&!t.timerPaused&&this._startTickInterval();const s=this.$("#timer-limit-select");s&&s.addEventListener("change",i=>{this.changeTimerLimit(i,i.target)})}onUnmount(){this._stopTickInterval()}changeTimerLimit(e,t){var o;const s=((o=l.persistence)==null?void 0:o.filename)||"state.json",a=parseInt(t.value)||0;this._saveSessionMeta(s,{timerLimitMs:a}),this._timerDisplay=this._getTimerDisplay();const i=document.getElementById("session-timer-display");i&&(i.textContent=this._timerDisplay),g.show(a>0?`Limite de tempo definido para ${this._formatElapsed(a)}`:"Duração da sessão definida como Livre.","info"),this.render()}createNewSession(){const e=prompt("Digite o nome da nova sessão/campanha:");if(!e||!e.trim())return;const s=`${e.trim().toLowerCase().replace(/[^a-z0-9]/g,"_").replace(/_+/g,"_")}.json`;let a=this._getSessionsList();if(a.some(i=>i.file===s)){g.show("Uma sessão com este nome já existe!","danger");return}a.push({name:e.trim(),file:s}),localStorage.setItem(this._getSessionListKey(),JSON.stringify(a)),this._saveSessionMeta(s,{status:"open",totalElapsed:0,timerStart:null,timerPaused:!1}),k.register(e.trim(),s),this._applySessionSwitch(s)}cloneSession(){const e=prompt("Digite o nome para o clone da sessão atual:");if(!e||!e.trim())return;const s=`${e.trim().toLowerCase().replace(/[^a-z0-9]/g,"_").replace(/_+/g,"_")}.json`;let a=this._getSessionsList();if(a.some(i=>i.file===s)){g.show("Uma sessão com este nome já existe!","danger");return}a.push({name:e.trim(),file:s}),localStorage.setItem(this._getSessionListKey(),JSON.stringify(a)),l.persistence.filename=s,localStorage.setItem("TOME_ACTIVE_SESSION",s),l.persistence.save().then(()=>{k.register(e.trim(),s,{clonedFrom:l.persistence.filename}),g.show(`Sessão clonada como: ${e}`,"success"),this.render()})}changeSession(e,t){this._applySessionSwitch(t.value)}async _applySessionSwitch(e){this._stopTickInterval(),this._timerDisplay="00:00:00",g.show("Carregando sessão...","info"),l.store.update(s=>{s.initiativeOrder=[]}),await l.persistence.switchSession(e),k.touchSession(e,l.store.state),this._selectedHeroId=null;const t=this._getSessionMeta(e);t.status==="open"&&t.timerStart&&!t.timerPaused&&this._startTickInterval(),g.show("Sessão carregada com sucesso!","success"),this.render()}resetCampaignState(){var t;if(!confirm(`Tem certeza que deseja ZERAR os status e iniciar a campanha com base em D&D 5e?
Os heróis não serão afetados, mas os combates, mapa e registros da sessão atual serão reiniciados.`))return;const e=((t=l.persistence)==null?void 0:t.filename)||"state.json";this._stopTickInterval(),this._timerDisplay="00:00:00",this._saveSessionMeta(e,{status:"open",totalElapsed:0,timerStart:null,timerPaused:!1,endedAt:null}),l.store.update(s=>{s.monsters=[],s.initiativeOrder=[],s.concentration=[],s.combatRound=0,s.combatActive=!1,s.journalEntries=[],s.sessionNotes="",s.tacticalMap={fog:null,mapUrl:null,tokens:[]},s.lastLoot=null,s.resources={potions:0,scrolls:0}}),l.persistence.save().then(()=>{S(()=>import("./Toast-m0Ci56ke.js"),[]).then(s=>s.Toast.show("Status da campanha zerados com sucesso para o início!","success")),this.render()})}adjustHP(e,t){const s=parseInt(t.dataset.val);l.store.update(a=>{var o;const i=a.players.find(r=>r.id===this._selectedHeroId);if(i){i.hp.current=Math.max(0,Math.min(i.hp.max,i.hp.current+s));const r=(o=a.initiativeOrder)==null?void 0:o.find(d=>d.name===i.name);r&&(r.hp_current=i.hp.current)}}),this.render()}adjustXP(e,t){const s=parseInt(t.dataset.val);l.store.update(a=>{const i=a.players.find(o=>o.id===this._selectedHeroId);i&&(i.xp=(i.xp||0)+s,a.xpDistributed=(a.xpDistributed||0)+s,a.journalEntries||(a.journalEntries=[]),a.journalEntries.push({id:Date.now(),timestamp:Date.now(),date:new Date().toLocaleDateString("pt-BR"),type:"loot",title:"XP Distribuído",content:`Adjudicado +${s} XP para o herói ${i.name}.`}))}),this.render()}customXP(){const e=parseInt(prompt("Quantidade de XP:"));isNaN(e)||(l.store.update(t=>{const s=t.players.find(a=>a.id===this._selectedHeroId);s&&(s.xp=(s.xp||0)+e,t.xpDistributed=(t.xpDistributed||0)+e,t.journalEntries||(t.journalEntries=[]),t.journalEntries.push({id:Date.now(),timestamp:Date.now(),date:new Date().toLocaleDateString("pt-BR"),type:"loot",title:"XP Distribuído",content:`Adjudicado +${e} XP para o herói ${s.name}.`}))}),this.render())}rollAttribute(e,t){const s=t.dataset.attr,a=parseInt(t.dataset.val)||10,i=this.store.state.players.find(o=>o.id===this._selectedHeroId);i&&this.showAttributeModal(s,a,i)}showAttributeModal(e,t,s){const a=Math.floor((t-10)/2),i=document.getElementById("attr-roll-modal");i&&i.remove();const r={str:{name:"Força",icon:"fa-dumbbell",desc:"Mede o poder físico bruto, força muscular e proeza atlética.",skills:"Atletismo",examples:"Levantar portões pesados, quebrar correntes, empurrar oponentes."},dex:{name:"Destreza",icon:"fa-person-running",desc:"Mede a agilidade, reflexos, equilíbrio e coordenação motora fina.",skills:"Acrobacia, Furtividade, Prestidigitação",examples:"Esquivar de armadilhas, andar em silêncio, roubar bolsos."},con:{name:"Constituição",icon:"fa-heart-pulse",desc:"Mede a saúde, vigor, resistência física e força vital.",skills:"Resistência Geral (Nenhuma perícia direta)",examples:"Resistir a toxinas/venenos, suportar exaustão, manter concentração."},int:{name:"Inteligência",icon:"fa-brain",desc:"Mede a acuidade mental, precisão de memória e raciocínio lógico.",skills:"Arcanismo, História, Investigação, Natureza, Religião",examples:"Identificar itens mágicos, decifrar enigmas, investigar pistas."},wis:{name:"Sabedoria",icon:"fa-eye",desc:"Mede a percepção sensorial, intuição, bom senso e sintonia.",skills:"Adestrar Animais, Intuição, Medicina, Percepção, Sobrevivência",examples:"Detectar emboscadas, ler linguagem corporal, rastrear presas."},cha:{name:"Carisma",icon:"fa-comments",desc:"Mede a força de personalidade, magnetismo pessoal e influência.",skills:"Atuação, Enganação, Intimidação, Persuasão",examples:"Convencer guardas, acalmar turbas, mentir sem ser notado."}}[e]||{name:e.toUpperCase(),icon:"fa-dice-d20",desc:"",skills:"",examples:""},d=document.createElement("div");d.id="attr-roll-modal",d.style.cssText=`
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `,d.innerHTML=p`
            <div class="card glass-accent" style="max-width:500px; width:90%; padding:30px; border-radius:18px; border:2px solid rgba(197,160,89,0.35); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(197,160,89,0.05); text-align:left;">
                
                <!-- HEADER -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1.5px solid rgba(197,160,89,0.2); padding-bottom:15px; margin-bottom:20px;">
                    <div>
                        <span style="font-size:0.65rem; color:var(--accent); font-weight:800; text-transform:uppercase; letter-spacing:1.5px; font-family:'Cinzel';">Orientação de Regras D&D 5e</span>
                        <h3 style="margin:5px 0 0; font-family:'Cinzel', serif; font-size:1.6rem; color:#fff; display:flex; align-items:center; gap:10px;">
                            <i class="fa-solid ${r.icon}" style="color:var(--accent);"></i> ${r.name.toUpperCase()}
                        </h3>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:1.8rem; font-weight:900; color:#fff; font-family:'Cinzel'; line-height:1;">${t}</span>
                        <div style="font-size:0.75rem; color:${a>=0?"var(--success)":"var(--danger)"}; font-weight:800; margin-top:4px;">MOD ${a>=0?"+":""}${a}</div>
                    </div>
                </div>

                <!-- LORE / DESCRIPTION -->
                <div style="font-size:0.8rem; color:#d1d5db; line-height:1.6; margin-bottom:18px; display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <strong style="color:var(--accent); display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">O que representa:</strong>
                        <span style="color:#e2e8f0;">${r.desc}</span>
                    </div>
                    <div>
                        <strong style="color:var(--accent); display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">Perícias comuns:</strong>
                        <span style="color:#93c5fd; font-weight:600;">${r.skills}</span>
                    </div>
                    <div>
                        <strong style="color:var(--accent); display:block; font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px;">Exemplos de uso:</strong>
                        <span style="font-style:italic; color:#a1a1aa;">"${r.examples}"</span>
                    </div>
                </div>

                <!-- FORMULA GUIDE -->
                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:20px; text-align:center;">
                    <span style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; display:block; margin-bottom:4px;">Fórmula D&D do Teste</span>
                    <strong style="font-size:1.1rem; color:var(--accent); font-family:'Cinzel';">d20 ${a>=0?"+":""}${a}</strong>
                </div>

                <!-- ACTION BUTTONS -->
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn btn-primary btn-sm btn-block roll-action" data-mode="normal" style="background:var(--accent); border-color:var(--accent); font-weight:800; padding:12px; font-size:0.8rem; border-radius:8px; display:flex; justify-content:center; align-items:center; gap:8px;">
                        <i class="fa-solid fa-dice-d20"></i> Rolar Teste Simples (d20)
                    </button>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <button class="btn btn-ghost btn-sm roll-action" data-mode="advantage" style="border-color:rgba(46,204,113,0.3); color:var(--success); font-weight:800; padding:10px; font-size:0.75rem; border-radius:8px;">
                            🟢 Com Vantagem
                        </button>
                        <button class="btn btn-ghost btn-sm roll-action" data-mode="disadvantage" style="border-color:rgba(231,76,60,0.3); color:var(--danger); font-weight:800; padding:10px; font-size:0.75rem; border-radius:8px;">
                            🔴 Com Desvantagem
                        </button>
                    </div>

                    <button class="btn btn-ghost btn-sm btn-block roll-action" data-mode="save" style="border-color:rgba(96,165,250,0.3); color:var(--info); font-weight:800; padding:10px; font-size:0.75rem; border-radius:8px;">
                        🛡️ Rolar Salvaguarda (+Proficiência)
                    </button>

                    <button class="btn btn-ghost btn-sm btn-block close-modal" style="border-color:rgba(255,255,255,0.08); color:var(--text-dim); font-weight:800; padding:8px; font-size:0.75rem; border-radius:8px; margin-top:10px;">
                        Fechar
                    </button>
                </div>

            </div>
        `,document.body.appendChild(d),d.querySelector(".close-modal").addEventListener("click",()=>d.remove()),d.addEventListener("click",n=>{n.target===d&&d.remove()}),d.querySelectorAll(".roll-action").forEach(n=>{n.addEventListener("click",()=>{const m=n.dataset.mode;d.remove(),this._performRuleRoll(r.name,a,m,s)})})}_performRuleRoll(e,t,s,a){const i=E.roll("1d20"),o=E.roll("1d20");let r=0,d="";if(l.audio.playSFX("https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3"),s==="normal")r=i.total+t,d=`Rolo d20(${i.total}) ${t>=0?"+":""}${t} = **${r}**`;else if(s==="advantage"){const n=Math.max(i.total,o.total);r=n+t,d=`Rolo com **Vantagem** [d20(${i.total}), d20(${o.total})] ➔ Maior (${n}) ${t>=0?"+":""}${t} = **${r}**`}else if(s==="disadvantage"){const n=Math.min(i.total,o.total);r=n+t,d=`Rolo com **Desvantagem** [d20(${i.total}), d20(${o.total})] ➔ Menor (${n}) ${t>=0?"+":""}${t} = **${r}**`}else if(s==="save"){const n=a.proficiencyBonus||2,m=t+n;r=i.total+m,d=`Rolo **Salvaguarda** d20(${i.total}) + Mod(${t}) + Proficiência(+${n}) = **${r}**`}S(()=>import("./Toast-m0Ci56ke.js"),[]).then(n=>{n.Toast.show(`🎲 **${a.name}** fez um teste de **${e}**!<br />${d}`,"success")})}exportCamp(){const e=l.store.snapshot(),t="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(e,null,2)),s=document.createElement("a");s.setAttribute("href",t),s.setAttribute("download",`mdm_backup_${e.sessionTitle||"campanha"}_${Date.now()}.json`),document.body.appendChild(s),s.click(),s.remove(),S(()=>import("./Toast-m0Ci56ke.js"),[]).then(a=>a.Toast.show("Backup exportado com sucesso!","success"))}importCamp(){const e=document.createElement("input");e.type="file",e.accept="application/json",e.onchange=t=>{const s=t.target.files[0];if(!s)return;const a=new FileReader;a.onload=i=>{try{const o=JSON.parse(i.target.result);confirm("Isto substituirá TODOS os dados atuais pela importação. Deseja continuar?")&&(l.store.update(r=>Object.assign(r,o)),l.persistence.save(),S(()=>import("./Toast-m0Ci56ke.js"),[]).then(r=>r.Toast.show("Campanha importada!","success")),this.render())}catch{alert("Arquivo inválido.")}},a.readAsText(s)},e.click()}editCampaign(){const e=l.store.state.sessionTitle||"Nova Campanha",t=localStorage.getItem("DM_SYSTEM")||"D&D 5e",s=l.store.state.combatActive,a=document.getElementById("edit-campaign-modal");a&&a.remove();const i=document.createElement("div");i.id="edit-campaign-modal",i.style.cssText=`
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `,i.innerHTML=p`
            <div class="card glass-accent" style="width:90%; max-width:400px; padding:25px; border-radius:16px;">
                <h3 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:20px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:10px;">Editar Campanha</h3>
                
                <label style="display:block; margin-bottom:5px; font-size:0.75rem; color:var(--text-dim);">Nome da Campanha</label>
                <input type="text" id="camp-name-input" class="form-input" value="${e}" style="width:100%; margin-bottom:15px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(197,160,89,0.3); padding:10px; border-radius:8px;" />
                
                <label style="display:block; margin-bottom:5px; font-size:0.75rem; color:var(--text-dim);">Sistema de Jogo</label>
                <input type="text" id="camp-system-input" class="form-input" value="${t}" style="width:100%; margin-bottom:20px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(197,160,89,0.3); padding:10px; border-radius:8px;" />
                
                <label style="display:block; margin-bottom:5px; font-size:0.75rem; color:var(--text-dim);">Status da Sessão (Forçar)</label>
                <select id="camp-status-input" class="form-select" style="width:100%; margin-bottom:25px; background:rgba(0,0,0,0.5); color:#fff; border:1px solid rgba(197,160,89,0.3); padding:10px; border-radius:8px;">
                    <option value="explore" ${s?"":"selected"}>Exploração (Pacífico)</option>
                    <option value="combat" ${s?"selected":""}>Em Combate (Iniciativa)</option>
                </select>

                <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-ghost close-btn">Cancelar</button>
                    <button class="btn btn-primary save-btn">Salvar Alterações</button>
                </div>
            </div>
        `,document.body.appendChild(i),i.querySelector(".close-btn").onclick=()=>i.remove(),i.querySelector(".save-btn").onclick=()=>{const o=i.querySelector("#camp-name-input").value,r=i.querySelector("#camp-system-input").value,d=i.querySelector("#camp-status-input").value;localStorage.setItem("DM_SYSTEM",r),l.store.update(n=>{n.sessionTitle=o,n.combatActive=d==="combat"}),i.remove(),this.render(),S(()=>import("./Toast-m0Ci56ke.js"),[]).then(n=>n.Toast.show("Campanha atualizada!","success"))}}updateItems(e,t){l.store.update(s=>{const a=s.players.find(i=>i.id===this._selectedHeroId);if(a){const i=t.value.split(`
`).filter(o=>o.trim());a.equipment.items=i.map(o=>{const r=o.match(/^(\d+)x?\s+(.+)$/);return r?{qty:parseInt(r[1])||1,name:r[2].trim(),weight:0}:{qty:1,name:o.trim(),weight:0}})}})}updateNotes(e,t){l.store.update(s=>{const a=s.players.find(i=>i.id===this._selectedHeroId);a&&(a.roleplay||(a.roleplay={traits:""}),a.roleplay.traits=t.value)})}}export{q as CampaignManager};
