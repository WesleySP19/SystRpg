import { h } from 'preact';

export function RefActions() {
    const acts = [
        { name: 'Atacar (Attack)', cost: 'Ação', desc: 'Realiza um ataque corpo-a-corpo ou à distância com armas ou magias.' },
        { name: 'Conjurar Magia', cost: 'Varie', desc: 'Conjura uma magia cujo tempo de conjuração seja 1 ação (ou ação bônus se permitido).' },
        { name: 'Correr (Dash)', cost: 'Ação', desc: 'Ganha deslocamento extra igual ao seu deslocamento máximo na rodada atual.' },
        { name: 'Desengajar', cost: 'Ação', desc: 'Seu movimento não provoca nenhum ataque de oportunidade até o final da rodada.' },
        { name: 'Esquivar (Dodge)', cost: 'Ação', desc: 'Até o início do seu próximo turno, ataques contra você têm Desvantagem e seus testes de Destreza têm Vantagem.' },
        { name: 'Ajudar (Help)', cost: 'Ação', desc: 'Concede Vantagem ao teste de habilidade de um aliado ou na primeira jogada de ataque dele contra um monstro.' },
        { name: 'Esconder (Hide)', cost: 'Ação', desc: 'Faz um teste de Destreza (Furtividade) para sumir do campo de visão de inimigos (requer cobertura).' },
        { name: 'Preparar (Ready)', cost: 'Ação', desc: 'Escolhe um gatilho. Se o gatilho acontecer antes do seu próximo turno, você usa sua Reação para agir.' },
        { name: 'Usar Objeto', cost: 'Ação', desc: 'Interage com um segundo objeto complexo na mesma rodada (beber poção, abrir baú chaveado, etc).' }
    ];

    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--info)", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(59,130,246,0.4)" }}>
                <i className="fa-solid fa-swords" style={{ marginRight: "10px" }}></i> Ações no Turno de Combate
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                Em um combate de D&D, seu turno tático é composto por <strong>Movimento</strong>, <strong>1 Ação</strong>, <strong>1 Reação</strong> (fora do turno) e <strong>1 Ação Bônus</strong> (se aplicável).
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", maxHeight: "60vh", overflowY: "auto", paddingRight: "15px", scrollbarWidth: "thin" }}>
                {acts.map((a, i) => (
                    <div key={i} className="card glass-accent ref-card-blue" style={{ background: "rgba(0,0,0,0.4)", padding: "20px", border: "1px solid rgba(59,130,246,0.15)", borderLeft: "4px solid var(--info)", borderRadius: "12px", position: "relative", overflow: "hidden" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <strong style={{ color: "#fff", fontSize: "1.1rem", fontFamily: "'Cinzel', serif" }}>{a.name}</strong>
                            <span className="badge" style={{ fontSize: "0.65rem", padding: "4px 8px", borderRadius: "6px", background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)", fontWeight: "800", letterSpacing: "0.5px" }}>{a.cost}</span>
                        </div>
                        <p style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "var(--text-dim)", margin: "0" }}>{a.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
