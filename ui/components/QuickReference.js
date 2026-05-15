import { Component } from '../core/Component.js';

/**
 * QUICK REFERENCE v5.0 — "The Beginner DM's Guide"
 * Detailed mechanical help for new DMs, presented clearly.
 */
export class QuickReference extends Component {
    constructor(opts) {
        super(opts);
        this._activeSection = 'conditions';
    }

    template() {
        return `
            <div class="page" style="max-width: 1200px;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title"><i class="fa-solid fa-book-sparkles" style="color:var(--accent); margin-right:12px;"></i> Guia do Mestre Iniciante</h2>
                        <p class="section-subtitle">Regras explicadas de forma simples para facilitar sua narração</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 250px 1fr; gap:var(--space-lg); align-items:start;">
                    <!-- NAVIGATION MENU -->
                    <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px;">
                        <button class="btn btn-sm ${this._activeSection === 'conditions' ? 'btn-primary' : 'btn-ghost'}" style="justify-content:flex-start;" data-action="setSection" data-section="conditions">
                            <i class="fa-solid fa-skull-crossbones" style="margin-right:10px;"></i> Condições de Status
                        </button>
                        <button class="btn btn-sm ${this._activeSection === 'actions' ? 'btn-primary' : 'btn-ghost'}" style="justify-content:flex-start;" data-action="setSection" data-section="actions">
                            <i class="fa-solid fa-swords" style="margin-right:10px;"></i> Ações em Combate
                        </button>
                        <button class="btn btn-sm ${this._activeSection === 'environment' ? 'btn-primary' : 'btn-ghost'}" style="justify-content:flex-start;" data-action="setSection" data-section="environment">
                            <i class="fa-solid fa-mountain-sun" style="margin-right:10px;"></i> Luz e Ambiente
                        </button>
                        <button class="btn btn-sm ${this._activeSection === 'dc' ? 'btn-primary' : 'btn-ghost'}" style="justify-content:flex-start;" data-action="setSection" data-section="dc">
                            <i class="fa-solid fa-target-pointer" style="margin-right:10px;"></i> Dificuldades (CD)
                        </button>
                        <button class="btn btn-sm ${this._activeSection === 'abbreviations' ? 'btn-primary' : 'btn-ghost'}" style="justify-content:flex-start;" data-action="setSection" data-section="abbreviations">
                            <i class="fa-solid fa-font" style="margin-right:10px;"></i> Siglas e Termos
                        </button>
                    </div>

                    <!-- CONTENT AREA -->
                    <div class="card glass-accent" style="min-height:60vh; padding:30px;">
                        ${this._renderActiveContent()}
                    </div>
                </div>
            </div>
        `;
    }

    _renderActiveContent() {
        switch(this._activeSection) {
            case 'conditions': return this._renderConditions();
            case 'actions': return this._renderActions();
            case 'environment': return this._renderEnvironment();
            case 'dc': return this._renderDC();
            case 'abbreviations': return this._renderAbbreviations();
            default: return '';
        }
    }

    _renderConditions() {
        const conds = [
            { name: 'Caído (Prone)', effect: 'O personagem só pode se mover rastejando. Ataques corpo-a-corpo contra ele têm Vantagem. Ataques à distância têm Desvantagem.' },
            { name: 'Cego (Blinded)', effect: 'O personagem não enxerga. Ataques contra ele têm Vantagem. Os ataques dele têm Desvantagem.' },
            { name: 'Envenenado', effect: 'O personagem sente náuseas. Ele tem Desvantagem em todas as jogadas de ataque e testes de habilidade.' },
            { name: 'Incapacitado', effect: 'O personagem não pode realizar nenhuma ação ou reação.' },
            { name: 'Amedrontado', effect: 'O personagem tem Desvantagem em testes enquanto a fonte do medo estiver visível e não pode se aproximar dela.' },
            { name: 'Paralisado', effect: 'O personagem está travado. Ele falha em testes de Destreza/Força. Ataques feitos a 1.5m dele são Críticos Automáticos.' }
        ];

        return `
            <h3 style="color:var(--accent); margin-bottom:20px;">🩸 Condições de Status</h3>
            <p style="font-size:0.85rem; color:var(--text-dim); margin-bottom:25px;">Quando um efeito mágico ou golpe afeta um herói ou monstro, aplique estas regras:</p>
            <div style="display:flex; flex-direction:column; gap:15px;">
                ${conds.map(c => `
                    <div class="glass" style="padding:15px; border-radius:10px;">
                        <strong style="color:#fff; font-size:1rem;">${c.name}</strong>
                        <p style="font-size:0.85rem; margin-top:8px; line-height:1.5; color:rgba(255,255,255,0.7);">${c.effect}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _renderActions() {
        const acts = [
            { name: 'Correr (Dash)', desc: 'Ganha movimento extra igual ao seu deslocamento neste turno.' },
            { name: 'Desengajar', desc: 'Sua movimentação não provoca ataques de oportunidade pelo resto do turno.' },
            { name: 'Esconder', desc: 'Faz um teste de Furtividade para tentar não ser visto (precisa de cobertura).' },
            { name: 'Ajudar', desc: 'Dá Vantagem para um aliado no próximo teste ou ataque dele.' },
            { name: 'Esquivar', desc: 'Até o início do seu próximo turno, qualquer ataque contra você tem Desvantagem.' }
        ];
        return `
            <h3 style="color:var(--info); margin-bottom:20px;">⚔️ Ações em Combate</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                ${acts.map(a => `
                    <div class="card" style="background:rgba(0,0,0,0.2); padding:15px;">
                        <strong style="color:var(--info);">${a.name}</strong>
                        <p style="font-size:0.75rem; margin-top:5px; opacity:0.8;">${a.desc}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _renderEnvironment() {
        return `
            <h3 style="color:var(--warning); margin-bottom:20px;">⛰️ Luz e Cobertura</h3>
            <div class="grid grid-2" style="gap:20px;">
                <div class="glass" style="padding:15px;">
                    <h4 style="color:var(--warning); margin-bottom:10px;">Iluminação</h4>
                    <ul style="font-size:0.8rem; line-height:2;">
                        <li><strong>Tocha/Magia Luz:</strong> 6m luz plena + 6m luz plena penumbra.</li>
                        <li><strong>Penumbra:</strong> Desvantagem em Percepção.</li>
                        <li><strong>Escuridão:</strong> Considerado Cego.</li>
                    </ul>
                </div>
                <div class="glass" style="padding:15px;">
                    <h4 style="color:var(--success); margin-bottom:10px;">Cobertura (Proteção)</h4>
                    <ul style="font-size:0.8rem; line-height:2;">
                        <li><strong>Meia Cobertura:</strong> +2 na CA e testes de Destreza.</li>
                        <li><strong>3/4 Cobertura:</strong> +5 na CA e testes de Destreza.</li>
                        <li><strong>Total:</strong> Não pode ser alvo de ataques diretos.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    _renderDC() {
        const dcs = [
            { val: 5, level: 'Muito Fácil', example: 'Arrombar uma porta velha e podre.' },
            { val: 10, level: 'Fácil', example: 'Ouvir uma conversa atrás de uma porta comum.' },
            { val: 15, level: 'Médio', example: 'Escalar uma parede com poucos apoios.' },
            { val: 20, level: 'Difícil', example: 'Convencer um guarda honesto a aceitar suborno.' },
            { val: 25, level: 'Heróico', example: 'Saltar um abismo de 6 metros.' },
            { val: 30, level: 'Impossível', example: 'Rastrear um assassino em meio a uma tempestade.' }
        ];
        return `
            <h3 style="color:var(--accent); margin-bottom:20px;">🎯 Dificuldades (CD)</h3>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${dcs.map(d => `
                    <div style="display:flex; align-items:center; gap:20px; padding:12px; background:rgba(212,175,55,0.05); border-radius:8px;">
                        <div style="width:40px; height:40px; border-radius:50%; background:var(--accent); color:#000; display:flex; align-items:center; justify-content:center; font-weight:900;">${d.val}</div>
                        <div style="flex:1;">
                            <div style="font-weight:700; font-size:0.9rem;">${d.level}</div>
                            <div style="font-size:0.75rem; color:var(--text-dim);">${d.example}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _renderAbbreviations() {
        const terms = [
            { s: 'CA / AC', m: 'Classe de Armadura. O número que um ataque deve igualar ou superar para atingir.' },
            { s: 'CD / DC', m: 'Classe de Dificuldade. O número alvo para testes de habilidade ou salvaguardas.' },
            { s: 'PV / HP', m: 'Pontos de Vida. Sua saúde atual.' },
            { s: 'PM / MP', m: 'Pontos de Mana (ou espaços de magia).' },
            { s: 'XP', m: 'Pontos de Experiência. Usados para subir de nível.' },
            { s: 'ND / CR', m: 'Nível de Desafio / Challenge Rating. Indica o poder de um monstro.' },
            { s: 'BBA / PB', m: 'Bônus de Proficiência. Adicionado a testes em que você é treinado.' },
            { s: 'TR / ST', m: 'Teste de Resistência / Saving Throw. Teste para evitar efeitos negativos.' },
            { s: 'AO / OoA', m: 'Ataque de Oportunidade. Ataque feito quando um inimigo sai do seu alcance.' },
            { s: 'Bônus (BA)', m: 'Ação Bônus. Uma ação extra menor permitida por certas habilidades.' }
        ];

        return `
            <h3 style="color:var(--accent); margin-bottom:20px;">🔡 Siglas e Termos Comuns</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                ${terms.map(t => `
                    <div class="glass" style="padding:12px;">
                        <strong style="color:var(--accent);">${t.s}</strong>
                        <p style="font-size:0.75rem; color:var(--text-dim); margin-top:4px;">${t.m}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setSection(e, el) { this._activeSection = el.dataset.section; this.render(); }
}
