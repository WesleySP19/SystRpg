import{m as o}from"./Boot-0-7AJiQi.js";import{R as n}from"./FXEngine-BAazb45g.js";import"./main-Z61bTTRY.js";import"./tailwind-CVCQhc7L.js";async function d(i,e){return new Promise(t=>{setTimeout(()=>{const a=e?e.state:{},s=i.toLowerCase();let r="🔮 As linhas do destino estão turvas, aventureiro. Refaça a pergunta com outras palavras.";s.includes("herói")||s.includes("jogador")||s.includes("party")?a.heroes&&a.heroes.length>0?r="✨ Sinto a presença vibrante das seguintes almas valentes na sua mesa: "+a.heroes.map(l=>l.name||l.nome).join(", ")+". O destino deles pende por um fio.":r="🌑 Não vejo nenhum herói nas neblinas desta sessão no momento. Eles ainda não chegaram ou caíram em batalha.":s.includes("npc")||s.includes("ferreiro")||s.includes("taverneiro")?r="👁️ Nos registros esotéricos, vejo um mercador peculiar na cidade que guarda um segredo maldito. Ele é um ferreiro com cicatrizes de fogo dracônico nas mãos. Ele sabe onde fica a tumba.":s.includes("resumo")||s.includes("sessão")?r="📜 As crônicas desta sessão revelam turbulência. Sangue foi derramado no grid, testes de resistência vitais foram forçados e os deuses acompanham cada rolagem de perto.":s.includes("quest")||s.includes("missão")?r="🗡️ A maior provação que aguarda o grupo está ligada ao Culto das Sombras no subterrâneo. O resgate do prisioneiro é urgente.":s.includes("dragão")&&(r="🐉 Táticas Dracônicas: Dragões são predadores aéreos formidáveis. Eles usarão seu Sopro Destrutivo (Recarrega 5-6) sempre que possível, e preferem isolar curandeiros usando Ataques de Asa e Presença Aterradora antes de engajar em combate corporal."),t(r)},1500)})}class h{constructor({store:e}){this.store=e,this.element=null,this._query="",this._loading=!1,this._response=null,this._history=[],this._suggestedPrompts=["Quem é o ferreiro ou mercador desta cidade?","Quais são as missões ou quests ativas?","Faça um resumo dos eventos da última sessão.","Quem é o NPC que possui um segredo misterioso?","Qual é o comportamento tático de um dragão em combate?"]}mount(e){this.element=e,this.render()}_close(){this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element)}_typeWriter(e){this._response="";let t=0;const a=25,s=()=>{this.element&&this.element.parentNode&&t<e.length&&(this._response+=e.charAt(t),t++,this.render(),setTimeout(s,a))};s()}async _handleSearch(e){const t=(e||this._query||"").trim();if(t){this._query=t,this._loading=!0,this._response="",this.render();try{const a=r=>{this._loading&&(this._loading=!1),this._response+=r,this.render()};let s="";window.TOME&&window.TOME.ai?t.toLowerCase().includes("quem")||t.toLowerCase().includes("npc")||t.toLowerCase().includes("missão")?s=await window.TOME.ai.oracleSearch(t,this.store,a):s=await window.TOME.ai.ask(t,"",a):(s=await d(t,this.store),this._typeWriter(s)),this._loading=!1,this._history.unshift({query:t,answer:s,timestamp:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})})}catch(a){this._loading=!1,this._typeWriter("⚡ As linhas de energia vacilaram: "+a.message)}}}template(){return o`
            <div class="modal-backdrop animate-fadeIn fixed inset-0 bg-black/85 flex items-center justify-center z-[10001] backdrop-blur-sm">
                <div class="glass-accent w-[780px] max-w-[95vw] max-h-[88vh] bg-obsidian-900/95 border-2 border-purple-500 rounded-2xl shadow-[0_25px_75px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden">
                    
                    <!-- Cabeçalho -->
                    <header class="bg-gradient-to-br from-purple-500/30 to-black/85 px-6 py-4 border-b border-purple-500/35 flex justify-between items-center">
                        <div class="flex items-center gap-3.5">
                            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-800 rounded-xl flex items-center justify-center text-2xl text-white shadow-[0_0_18px_rgba(168,85,247,0.6)]">
                                <i class="fa-solid fa-crystal-ball"></i>
                            </div>
                            <div>
                                <h3 class="m-0 font-cinzel text-purple-200 text-xl drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">O Oráculo de Lore & IA Arcana</h3>
                                <span class="text-xs text-purple-400 tracking-widest uppercase">Consulta RAG Offline & Memória da Campanha</span>
                            </div>
                        </div>
                        <div class="flex gap-2.5 items-center">
                            <span class="text-[0.72rem] px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                                <i class="fa-solid fa-brain"></i> Ollama / Local Ready
                            </span>
                            <button onClick=${()=>this._close()} class="btn btn-ghost text-red-500 text-2xl p-1 border-none bg-transparent cursor-pointer hover:text-red-400 transition-colors">
                                <i class="fa-solid fa-times-circle"></i>
                            </button>
                        </div>
                    </header>

                    <!-- Área de Busca -->
                    <div class="px-6 py-5 bg-black/50 border-b border-white/10">
                        <div class="flex gap-2.5">
                            <div class="relative flex-1">
                                <input 
                                    type="text" 
                                    class="form-control w-full py-3 pr-4 pl-10 rounded-xl bg-[#120e18e6] border border-purple-500/40 text-white text-[0.95rem] focus:outline-none focus:border-purple-500/80 transition-colors" 
                                    placeholder="Pergunte ao Oráculo (ex: 'Quem era o taverneiro misterioso?', 'Quais as quests ativas?')..." 
                                    .value=${this._query}
                                    @input=${e=>this._query=e.target.value}
                                    @keydown=${e=>e.key==="Enter"?this._handleSearch():null}
                                />
                                <i class="fa-solid fa-magic-wand-sparkles absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500"></i>
                            </div>
                            <button 
                                onClick=${()=>this._handleSearch()} 
                                disabled=${this._loading}
                                class="btn btn-primary px-6 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold border-none cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2 hover:from-purple-400 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                ${this._loading?o`<i class="fa-solid fa-circle-notch fa-spin"></i> Consultando...`:o`<i class="fa-solid fa-wand-magic-sparkles"></i> Consultar`}
                            </button>
                        </div>

                        <!-- Perguntas Sugeridas -->
                        <div class="mt-3.5 flex flex-wrap gap-2 items-center">
                            <span class="text-xs text-gray-400"><i class="fa-solid fa-compass"></i> Sugestões Arcanas:</span>
                            ${this._suggestedPrompts.map(e=>o`
                                <button 
                                    onClick=${()=>this._handleSearch(e)}
                                    class="bg-purple-500/10 border border-purple-500/25 text-purple-300 px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all hover:bg-purple-500/20 hover:border-purple-500/50 whitespace-nowrap">
                                    ${e}
                                </button>
                            `)}
                        </div>
                    </div>

                    <!-- Conteúdo / Resposta e Histórico -->
                    <div class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent bg-[radial-gradient(circle_at_center,rgba(22,14,30,0.9),rgba(9,6,12,1))]">
                        ${this._loading?o`
                            <div class="text-center py-10 text-purple-400">
                                <i class="fa-solid fa-book-journal-whills fa-bounce text-5xl mb-4 text-purple-500"></i>
                                <h4 class="font-cinzel m-0 text-purple-100 text-lg">O Oráculo vasculha os registros da campanha...</h4>
                                <p class="text-sm text-gray-400 mt-1.5">Analisando NPCs, Crônicas do Diário, Quests e memórias arcanas.</p>
                            </div>
                        `:this._response?o`
                            <div class="bg-black/55 border border-purple-500/35 rounded-xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6">
                                <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                    <span class="font-cinzel text-purple-200 font-bold text-lg flex items-center gap-2">
                                        <i class="fa-solid fa-scroll text-purple-500"></i> Retorno das Linhas do Destino
                                    </span>
                                    <span class="text-xs text-gray-400">Agora mesmo</span>
                                </div>
                                <div class="text-gray-200 text-[0.95rem] leading-relaxed whitespace-pre-line">
                                    ${this._response}
                                </div>
                            </div>
                        `:o`
                            <div class="text-center py-10 px-5 text-slate-500">
                                <i class="fa-solid fa-eye text-5xl text-purple-500/30 mb-4"></i>
                                <h4 class="font-cinzel text-slate-300 m-0 mb-2 text-xl">Sussurros na Escuridão</h4>
                                <p class="text-sm max-w-md mx-auto leading-relaxed text-slate-400">
                                    O Oráculo está sintonizado aos segredos da sua mesa. Faça perguntas sobre a história da sua campanha ou peça para gerar ganchos dramáticos offline!
                                </p>
                            </div>
                        `}

                        ${this._history.length>0?o`
                            <div class="mt-8">
                                <h5 class="font-cinzel text-purple-500 m-0 mb-3.5 text-sm tracking-widest uppercase">
                                    <i class="fa-solid fa-clock-rotate-left"></i> Consultas Anteriores NESTA SESSÃO
                                </h5>
                                <div class="flex flex-col gap-3">
                                    ${this._history.slice(1).map(e=>o`
                                        <div class="bg-black/35 border border-white/5 rounded-lg p-3.5">
                                            <div class="text-xs text-purple-500 font-bold mb-1.5 flex justify-between">
                                                <span>❓ "${e.query}"</span>
                                                <span class="text-slate-500 font-normal">${e.timestamp}</span>
                                            </div>
                                            <div class="text-sm text-slate-300 leading-relaxed max-h-20 overflow-hidden text-ellipsis">
                                                ${e.answer}
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            </div>
                        `:null}
                    </div>

                    <!-- Rodapé -->
                    <footer class="bg-black/85 px-6 py-3.5 border-t border-white/10 flex justify-between items-center">
                        <span class="text-xs text-gray-400">
                            <i class="fa-solid fa-network-wired text-emerald-500 mr-1"></i> RAG Engine Ativo | Sintonizado aos arquivos de <code class="bg-white/10 px-1 rounded">/data</code>
                        </span>
                        <button onClick=${()=>{this._query="",this._response=null,this.render()}} class="btn btn-ghost btn-sm text-slate-300 border border-white/15 px-3 py-1.5 rounded-md cursor-pointer hover:bg-white/5 transition-colors">
                            <i class="fa-solid fa-eraser mr-1"></i> Limpar Consulta
                        </button>
                    </footer>

                </div>
            </div>
        `}render(){this.element&&n(this.template(),this.element)}}export{h as OracleModal};
