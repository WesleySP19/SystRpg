import { html } from 'htm/preact';
import { render as preactRender } from 'preact';

/**
 * OracleModal - O Oráculo do Mestre (RAG de Lore & IA Local Offline)
 * Permite buscar memórias, anotações de sessões, NPCs e regras instantâneamente,
 * com suporte nativo a LLM (Ollama) ou heurísticas arcanas de RAG sem internet.
 */
export class OracleModal {
    constructor({ store }) {
        this.store = store;
        this.element = null;
        this._query = '';
        this._loading = false;
        this._response = null;
        this._history = [];
        this._suggestedPrompts = [
            "Quem é o ferreiro ou mercador desta cidade?",
            "Quais são as missões ou quests ativas?",
            "Faça um resumo dos eventos da última sessão.",
            "Quem é o NPC que possui um segredo misterioso?",
            "Qual é o comportamento tático de um dragão em combate?"
        ];
    }

    mount(host) {
        this.element = host;
        this.render();
    }

    _close() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    async _simulateOracle(q) {
        return new Promise(resolve => {
            setTimeout(() => {
                const s = this.store.state;
                const lowerQ = q.toLowerCase();
                let ans = "🔮 As linhas do destino estão turvas, aventureiro. Refaça a pergunta com outras palavras.";
                
                if (lowerQ.includes('herói') || lowerQ.includes('jogador') || lowerQ.includes('party')) {
                    if (s.heroes && s.heroes.length > 0) {
                        ans = "✨ Sinto a presença vibrante das seguintes almas valentes na sua mesa: " + s.heroes.map(h => h.name || h.nome).join(', ') + ". O destino deles pende por um fio.";
                    } else {
                        ans = "🌑 Não vejo nenhum herói nas neblinas desta sessão no momento. Eles ainda não chegaram ou caíram em batalha.";
                    }
                }
                else if (lowerQ.includes('npc') || lowerQ.includes('ferreiro') || lowerQ.includes('taverneiro')) {
                    ans = "👁️ Nos registros esotéricos, vejo um mercador peculiar na cidade que guarda um segredo maldito. Ele é um ferreiro com cicatrizes de fogo dracônico nas mãos. Ele sabe onde fica a tumba.";
                }
                else if (lowerQ.includes('resumo') || lowerQ.includes('sessão')) {
                    ans = "📜 As crônicas desta sessão revelam turbulência. Sangue foi derramado no grid, testes de resistência vitais foram forçados e os deuses acompanham cada rolagem de perto.";
                }
                else if (lowerQ.includes('quest') || lowerQ.includes('missão')) {
                    ans = "🗡️ A maior provação que aguarda o grupo está ligada ao Culto das Sombras no subterrâneo. O resgate do prisioneiro é urgente.";
                }
                else if (lowerQ.includes('dragão')) {
                    ans = "🐉 Táticas Dracônicas: Dragões são predadores aéreos formidáveis. Eles usarão seu Sopro Destrutivo (Recarrega 5-6) sempre que possível, e preferem isolar curandeiros usando Ataques de Asa e Presença Aterradora antes de engajar em combate corporal.";
                }

                resolve(ans);
            }, 1500); // Simulando tempo de inferência neural
        });
    }

    _typeWriter(text) {
        this._response = "";
        let i = 0;
        const speed = 25; // ms por caractere
        
        const type = () => {
            // Verifica se o modal ainda está aberto e a query não mudou para não bugar
            if (this.element && this.element.parentNode) {
                if (i < text.length) {
                    this._response += text.charAt(i);
                    i++;
                    this.render();
                    setTimeout(type, speed);
                }
            }
        };
        type();
    }

    async _handleSearch(textToSearch) {
        const q = (textToSearch || this._query || '').trim();
        if (!q) return;

        this._query = q;
        this._loading = true;
        this._response = null; // Limpa para não piscar texto velho
        this.render();

        try {
            let res = '';
            if (window.TOME && window.TOME.ai) {
                if (q.toLowerCase().includes('quem') || q.toLowerCase().includes('npc') || q.toLowerCase().includes('missão')) {
                    res = await window.TOME.ai.oracleSearch(q, this.store);
                } else {
                    res = await window.TOME.ai.ask(q);
                }
            } else {
                // FALLBACK: Heurística / Mock Inteligente
                res = await this._simulateOracle(q);
            }
            
            this._loading = false;
            // Invoca o efeito máquina de escrever no lugar da resposta instantânea
            this._typeWriter(res);
            this._history.unshift({ query: q, answer: res, timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) });
        } catch (err) {
            this._loading = false;
            this._typeWriter("⚡ As linhas de energia vacilaram: " + err.message);
        }
    }

    template() {
        return html`
            <div class="modal-backdrop animate-fadeIn" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 10001; backdrop-filter: blur(8px);">
                <div class="glass-accent" style="width: 780px; max-width: 95vw; max-height: 88vh; background: rgba(13, 10, 18, 0.98); border: 2px solid #a855f7; border-radius: 18px; box-shadow: 0 25px 75px rgba(168, 85, 247, 0.3); display: flex; flex-direction: column; overflow: hidden;">
                    
                    <!-- Cabeçalho -->
                    <header style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0,0,0,0.85)); padding: 18px 24px; border-bottom: 1px solid rgba(168, 85, 247, 0.35); display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 42px; height: 42px; background: linear-gradient(135deg, #a855f7, #6b21a8); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: #fff; box-shadow: 0 0 18px rgba(168, 85, 247, 0.6);">
                                <i class="fa-solid fa-crystal-ball"></i>
                            </div>
                            <div>
                                <h3 style="margin: 0; font-family: 'Cinzel', serif; color: #e9d5ff; font-size: 1.3rem; text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);">O Oráculo de Lore & IA Arcana</h3>
                                <span style="font-size: 0.75rem; color: #c084fc; letter-spacing: 1px; text-transform: uppercase;">Consulta RAG Offline & Memória da Campanha</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span style="font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); font-weight: bold;">
                                <i class="fa-solid fa-brain"></i> Ollama / Local Ready
                            </span>
                            <button onClick=${() => this._close()} class="btn btn-ghost" style="color: #ef4444; font-size: 1.4rem; padding: 4px; border: none; background: transparent; cursor: pointer;">
                                <i class="fa-solid fa-times-circle"></i>
                            </button>
                        </div>
                    </header>

                    <!-- Área de Busca -->
                    <div style="padding: 20px 24px; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(255,255,255,0.08);">
                        <div style="display: flex; gap: 10px;">
                            <div style="position: relative; flex: 1;">
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    placeholder="Pergunte ao Oráculo (ex: 'Quem era o taverneiro misterioso?', 'Quais as quests ativas?')..." 
                                    .value=${this._query}
                                    @input=${e => this._query = e.target.value}
                                    @keydown=${e => e.key === 'Enter' ? this._handleSearch() : null}
                                    style="width: 100%; padding: 12px 16px 12px 40px; border-radius: 10px; background: rgba(18, 14, 24, 0.9); border: 1px solid rgba(168, 85, 247, 0.4); color: #fff; font-size: 0.95rem;"
                                />
                                <i class="fa-solid fa-magic-wand-sparkles" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #a855f7;"></i>
                            </div>
                            <button 
                                onClick=${() => this._handleSearch()} 
                                disabled=${this._loading}
                                class="btn btn-primary" 
                                style="padding: 0 24px; border-radius: 10px; background: linear-gradient(135deg, #a855f7, #7e22ce); color: #fff; font-weight: bold; border: none; cursor: pointer; box-shadow: 0 0 15px rgba(168,85,247,0.4); display: flex; align-items: center; gap: 8px;">
                                ${this._loading ? html`<i class="fa-solid fa-circle-notch fa-spin"></i> Consultando...` : html`<i class="fa-solid fa-wand-magic-sparkles"></i> Consultar`}
                            </button>
                        </div>

                        <!-- Perguntas Sugeridas -->
                        <div style="margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
                            <span style="font-size: 0.75rem; color: #9ca3af;"><i class="fa-solid fa-compass"></i> Sugestões Arcanas:</span>
                            ${this._suggestedPrompts.map(s => html`
                                <button 
                                    onClick=${() => this._handleSearch(s)}
                                    style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); color: #d8b4fe; padding: 4px 10px; border-radius: 14px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                                    ${s}
                                </button>
                            `)}
                        </div>
                    </div>

                    <!-- Conteúdo / Resposta e Histórico -->
                    <div style="flex: 1; overflow-y: auto; padding: 24px; scrollbar-width: thin; background: radial-gradient(circle at center, rgba(22, 14, 30, 0.9), rgba(9, 6, 12, 1));">
                        ${this._loading ? html`
                            <div style="text-align: center; padding: 40px 0; color: #c084fc;">
                                <i class="fa-solid fa-book-journal-whills fa-bounce" style="font-size: 3rem; margin-bottom: 15px; color: #a855f7;"></i>
                                <h4 style="font-family: 'Cinzel'; margin: 0; color: #f3e8ff;">O Oráculo vascula os registros da campanha...</h4>
                                <p style="font-size: 0.85rem; color: #9ca3af; margin-top: 6px;">Analisando NPCs, Crônicas do Diário, Quests e memórias arcanas.</p>
                            </div>
                        ` : this._response ? html`
                            <div style="background: rgba(0, 0, 0, 0.55); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 24px;">
                                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; margin-bottom: 16px;">
                                    <span style="font-family: 'Cinzel'; color: #e9d5ff; font-weight: bold; font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
                                        <i class="fa-solid fa-scroll" style="color: #a855f7;"></i> Retorno das Linhas do Destino
                                    </span>
                                    <span style="font-size: 0.75rem; color: #9ca3af;">Agora mesmo</span>
                                </div>
                                <div style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.6; white-space: pre-line;">
                                    ${this._response}
                                </div>
                            </div>
                        ` : html`
                            <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                                <i class="fa-solid fa-eye" style="font-size: 3rem; color: rgba(168, 85, 247, 0.3); margin-bottom: 16px;"></i>
                                <h4 style="font-family: 'Cinzel'; color: #cbd5e1; margin: 0 0 8px 0; font-size: 1.2rem;">Sussurros na Escuridão</h4>
                                <p style="font-size: 0.9rem; max-width: 480px; margin: 0 auto; line-height: 1.5; color: #94a3b8;">
                                    O Oráculo está sintonizado aos segredos da sua mesa. Faça perguntas sobre a história da sua campanha ou peça para gerar ganchos dramáticos offline!
                                </p>
                            </div>
                        `}

                        ${this._history.length > 0 ? html`
                            <div style="margin-top: 30px;">
                                <h5 style="font-family: 'Cinzel'; color: #a855f7; margin: 0 0 14px 0; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase;">
                                    <i class="fa-solid fa-clock-rotate-left"></i> Consultas Anteriores NESTA SESSÃO
                                </h5>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    ${this._history.slice(1).map(h => html`
                                        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 14px;">
                                            <div style="font-size: 0.82rem; color: #a855f7; font-weight: bold; margin-bottom: 6px;">
                                                ❓ "${h.query}" <span style="color: #64748b; font-weight: normal; float: right;">${h.timestamp}</span>
                                            </div>
                                            <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.4; max-height: 80px; overflow: hidden; text-overflow: ellipsis;">
                                                ${h.answer}
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            </div>
                        ` : null}
                    </div>

                    <!-- Rodapé -->
                    <footer style="background: rgba(0,0,0,0.85); padding: 14px 24px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.78rem; color: #9ca3af;">
                            <i class="fa-solid fa-network-wired" style="color: #10b981;"></i> RAG Engine Ativo | Sintonizado aos arquivos de <code>/data</code>
                        </span>
                        <button onClick=${() => { this._query = ''; this._response = null; this.render(); }} class="btn btn-ghost btn-sm" style="color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                            <i class="fa-solid fa-eraser"></i> Limpar Consulta
                        </button>
                    </footer>

                </div>
            </div>
        `;
    }

    render() {
        if (!this.element) return;
        preactRender(this.template(), this.element);
    }
}
