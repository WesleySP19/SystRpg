import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * SESSION JOURNAL v1.0
 * Live session logging and automated report generation.
 */
export class SessionJournal extends Component {
    constructor(opts) {
        super(opts);
        this._sessionNotes = "";
        this._sessionTitle = "Aventura de " + new Date().toLocaleDateString();
    }

    template() {
        const { players, combatRound, sessionData = { title: "Aventura de " + new Date().toLocaleDateString(), notes: "" } } = this.store.state;

        return `
            <div class="page" style="max-width: 1200px;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">✍️ Diário de Sessão</h2>
                        <p class="section-subtitle">Registre os eventos e gere o relatório final da aventura</p>
                    </div>
                    <button class="btn btn-primary" data-action="exportReport">
                        <i class="fa-solid fa-file-export" style="margin-right:8px;"></i> Finalizar & Exportar Relatório
                    </button>
                </div>

                <div style="display:grid; grid-template-columns: 350px 1fr; gap:var(--space-lg); align-items:start;">
                    <!-- LEFT: SESSION STATS -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                        <div class="card glass-accent">
                            <div class="card-header"><span class="card-title">📊 Resumo da Sessão</span></div>
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <div class="form-group">
                                    <label class="form-label">Título da Sessão</label>
                                    <input type="text" class="form-input" value="${sessionData.title}" data-action="updateTitle">
                                </div>
                                <div class="glass" style="padding:10px; font-size:0.75rem;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                        <span>Heróis Ativos:</span>
                                        <strong style="color:var(--info);">${players?.length || 0}</strong>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                        <span>Rodadas de Combate:</span>
                                        <strong style="color:var(--danger);">${combatRound || 0}</strong>
                                    </div>
                                    <div style="display:flex; justify-content:space-between;">
                                        <span>Data do Sistema:</span>
                                        <strong style="color:var(--accent);">${new Date().toLocaleDateString()}</strong>
                                    </div>
                                </div>
                                <button class="btn btn-ghost btn-sm" data-action="generateAIBrief">✨ Gerar Resumo Automático</button>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header"><span class="card-title">🎁 Tesouros & Conquistas</span></div>
                            <textarea class="form-textarea" rows="5" placeholder="Itens raros ou feitos épicos..." id="session-loot">${sessionData.loot || ''}</textarea>
                        </div>
                    </div>

                    <!-- RIGHT: NARRATIVE JOURNAL -->
                    <div style="display:flex; flex-direction:column; gap:var(--space-md);">
                        <div class="card" style="min-height: 40vh; display:flex; flex-direction:column;">
                            <div class="card-header">
                                <span class="card-title">📜 Registro Narrativo (Manual)</span>
                            </div>
                            <textarea class="form-textarea" style="flex:1; border:none; background:transparent; font-size:0.9rem; line-height:1.6; resize:none;" 
                                      placeholder="Comece a escrever a história da sessão aqui..." 
                                      data-action="updateNotes">${sessionData.notes || ''}</textarea>
                        </div>

                        <!-- AUTOMATED LOGS -->
                        <div class="card" style="background:rgba(0,0,0,0.1);">
                            <div class="card-header"><span class="card-title" style="color:var(--accent);">🤖 Registros Automáticos do Sistema</span></div>
                            <div style="max-height: 300px; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;">
                                ${(this.store.state.journalEntries || []).slice().reverse().map(entry => `
                                    <div class="glass" style="padding:12px; border-left:3px solid var(--success);">
                                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                            <strong style="font-size:0.75rem;">${entry.title || 'Evento'}</strong>
                                            <span style="font-size:0.6rem; color:var(--text-dim);">${new Date(entry.timestamp || Date.now()).toLocaleTimeString()}</span>
                                        </div>
                                        <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">${entry.content}</p>
                                    </div>
                                `).join('') || '<p style="text-align:center; color:var(--text-dim); font-size:0.7rem;">Nenhum evento registrado ainda.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateTitle(e, el) {
        TOME.store.update(s => {
            if (!s.sessionData) s.sessionData = {};
            s.sessionData.title = el.value;
        });
    }

    updateNotes(e, el) {
        clearTimeout(this._updTimer);
        this._updTimer = setTimeout(() => {
            TOME.store.update(s => {
                if (!s.sessionData) s.sessionData = {};
                s.sessionData.notes = el.value;
            });
        }, 500);
    }

    async generateAIBrief() {
        const entries = this.store.state.journalEntries || [];
        if (entries.length === 0) return Toast.show('Sem eventos suficientes para resumir.');
        
        Toast.show('Consultando oráculo...');
        try {
            const prompt = `Resuma os seguintes eventos de uma sessão de RPG em um parágrafo narrativo épico: ${entries.map(e => e.content).join('; ')}`;
            const summary = await TOME.get('ai').ask(prompt);
            TOME.store.update(s => {
                if (!s.sessionData) s.sessionData = {};
                s.sessionData.notes = (s.sessionData.notes || '') + "\n\n--- RESUMO AUTOMÁTICO ---\n" + summary;
            });
            this.render();
        } catch {
            Toast.show('Erro ao gerar resumo AI.', 'danger');
        }
    }

    exportReport() {
        const { players, combatRound, sessionData = {} } = this.store.state;
        const loot = this.$('#session-loot').value;
        const date = new Date().toLocaleString();

        const report = `
🛡️ TOME PRO — RELATÓRIO DE SESSÃO FINAL
========================================
TÍTULO: ${sessionData.title || 'Sem Título'}
DATA: ${date}
----------------------------------------

👥 O GRUPO:
${players.map(p => `- ${p.name} (${p.race} ${p.class} Lv${p.level})`).join('\n')}

⚔️ ESTATÍSTICAS DE COMBATE:
- Rodadas Totais: ${combatRound || 0}
- Mestre: RPGPsigologos Toolkit

🎁 TESOUROS & CONQUISTAS:
${loot || 'Nenhum item especial registrado.'}

📜 REGISTRO NARRATIVO:
----------------------------------------
${sessionData.notes || 'Nenhuma nota narrativa registrada.'}

========================================
Relatório gerado automaticamente pelo TOME PRO Architect.
`;

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RELATORIO_${(sessionData.title || 'sessao').replace(/ /g, '_')}.txt`;
        a.click();

        Toast.show('Relatório exportado com sucesso!', 'success');
    }
}
