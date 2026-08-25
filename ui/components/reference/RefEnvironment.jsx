import { h } from 'preact';

export function RefEnvironment() {
    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--success)", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(16,185,129,0.4)" }}>
                <i className="fa-solid fa-mountain-sun" style={{ marginRight: "10px" }}></i> Ambiente, Cobertura & Movimento
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                O ambiente tático altera diretamente o acerto das flechas, a eficácia de magias e o deslocamento físico dos personagens. Use isso a seu favor.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
                {/* Iluminação */}
                <div className="glass card-hover tome-hover-badge" style={{ padding: "25px", borderRadius: "16px", borderTop: "4px solid var(--warning)", background: "rgba(0,0,0,0.3)" }}>
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--warning)", marginBottom: "15px", fontSize: "1.2rem" }}><i className="fa-solid fa-sun" style={{ marginRight: "10px" }}></i> Iluminação</h4>
                    <ul style={{ fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "15px", color: "var(--text-dim)", margin: "0" }}>
                        <li><strong style={{ color: "#fff" }}>Luz Plena:</strong> Condição padrão de visibilidade sem penalidades.</li>
                        <li style={{ marginTop: "8px" }}><strong style={{ color: "#fff" }}>Penumbra:</strong> Luz tênue (tochas, lua). Causa <strong>Desvantagem</strong> em testes de Sabedoria (Percepção) baseados na visão.</li>
                        <li style={{ marginTop: "8px" }}><strong style={{ color: "#fff" }}>Escuridão Total:</strong> Bloqueia a visão comum. Personagens sem Visão no Escuro são considerados <strong style={{ color: "var(--danger)" }}>Cegos</strong>.</li>
                    </ul>
                </div>

                {/* Cobertura */}
                <div className="glass card-hover tome-hover-badge" style={{ padding: "25px", borderRadius: "16px", borderTop: "4px solid var(--success)", background: "rgba(0,0,0,0.3)" }}>
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--success)", marginBottom: "15px", fontSize: "1.2rem" }}><i className="fa-solid fa-shield-halved" style={{ marginRight: "10px" }}></i> Cobertura (CA)</h4>
                    <ul style={{ fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "15px", color: "var(--text-dim)", margin: "0" }}>
                        <li><strong style={{ color: "#fff" }}>Meia Cobertura (1/2):</strong> Concede um bônus de <strong style={{ color: "var(--success)" }}>+2 na CA</strong> e em salvaguardas de Destreza (ex: lutar atrás de um tronco).</li>
                        <li style={{ marginTop: "8px" }}><strong style={{ color: "#fff" }}>Três Quartos (3/4):</strong> Concede um bônus massivo de <strong style={{ color: "var(--success)" }}>+5 na CA</strong> e em salvaguardas de Destreza (ex: fresta de muralha).</li>
                        <li style={{ marginTop: "8px" }}><strong style={{ color: "#fff" }}>Total:</strong> O alvo não pode ser atacado diretamente.</li>
                    </ul>
                </div>

                {/* Movimento Especial */}
                <div className="glass card-hover tome-hover-badge" style={{ padding: "25px", borderRadius: "16px", borderTop: "4px solid var(--info)", background: "rgba(0,0,0,0.3)" }}>
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--info)", marginBottom: "15px", fontSize: "1.2rem" }}><i className="fa-solid fa-shoe-prints" style={{ marginRight: "10px" }}></i> Movimentação</h4>
                    <ul style={{ fontSize: "0.85rem", lineHeight: "1.8", paddingLeft: "15px", color: "var(--text-dim)", margin: "0" }}>
                        <li><strong style={{ color: "#fff" }}>Terreno Difícil:</strong> Cada 1,5m de movimento custa 3m (dobro do custo). Lama, gelo, entulho, escadarias longas.</li>
                        <li style={{ marginTop: "8px" }}><strong style={{ color: "#fff" }}>Quedas:</strong> Sofre <strong style={{ color: "var(--danger)" }}>1d6 de dano de Concussão</strong> para cada 3m de queda livre (máx: 20d6) e cai Caído (Prone).</li>
                        <li style={{ marginTop: "8px" }}><strong style={{ color: "#fff" }}>Levantar do Chão:</strong> Levantar-se da condição Caído consome <strong style={{ color: "var(--warning)" }}>metade de todo o seu deslocamento</strong> no turno.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
