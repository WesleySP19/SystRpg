import { h } from 'preact';

export function RefSpellcasting() {
    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--warning)", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(245,158,11,0.4)" }}>
                <i className="fa-solid fa-hat-wizard" style={{ marginRight: "10px" }}></i> Arte e Conjuração da Magia
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                As artes arcanas e divinas seguem regras estritas para canalizar o poder mágico nos planos materiais.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "35px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="glass" style={{ padding: "25px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", borderLeft: "5px solid var(--warning)" }}>
                        <strong style={{ color: "#fff", fontFamily: "'Cinzel', serif", fontSize: "1.2rem", display: "block", marginBottom: "12px" }}><i className="fa-solid fa-brain" style={{ color: "var(--warning)", marginRight: "8px" }}></i> Concentração</strong>
                        <p style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--text-dim)", margin: "0" }}>Algumas magias requerem foco ativo para persistir. Se você sofrer dano enquanto se concentra, deve fazer uma <strong style={{ color: "#fff" }}>Salvaguarda de Constituição (CON)</strong>. A CD é <strong style={{ color: "var(--accent)" }}>10 ou metade do dano sofrido</strong> (o que for maior). Falhar significa que a magia se dissipa imediatamente.</p>
                    </div>
                    <div className="glass" style={{ padding: "25px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", borderLeft: "5px solid var(--warning)" }}>
                        <strong style={{ color: "#fff", fontFamily: "'Cinzel', serif", fontSize: "1.2rem", display: "block", marginBottom: "12px" }}><i className="fa-solid fa-flask" style={{ color: "var(--warning)", marginRight: "8px" }}></i> Componentes de Magia</strong>
                        <ul style={{ fontSize: "0.85rem", lineHeight: "1.8", color: "var(--text-dim)", margin: "0", paddingLeft: "15px" }}>
                            <li><strong style={{ color: "#fff" }}>V (Verbal):</strong> Entoação de palavras mágicas místicas em voz clara e audível.</li>
                            <li style={{ marginTop: "6px" }}><strong style={{ color: "#fff" }}>S (Somático):</strong> Gestos intrincados (requer pelo menos uma mão livre).</li>
                            <li style={{ marginTop: "6px" }}><strong style={{ color: "#fff" }}>M (Material):</strong> Foco arcano, símbolo sagrado ou ingredientes físicos listados na magia.</li>
                        </ul>
                    </div>
                </div>

                <div className="hp-container glass" style={{ background: "linear-gradient(145deg, rgba(245,158,11,0.05), rgba(0,0,0,0.6))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "16px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", position: "relative" }}>
                    <div style={{ position: "absolute", top: "0", right: "0", opacity: "0.05", pointerEvents: "none", fontSize: "120px" }}>
                        <i className="fa-solid fa-hat-wizard"></i>
                    </div>
                    <span className="hp-label-float" style={{ background: "#08080a", color: "var(--warning)", borderColor: "var(--warning)" }}>CÁLCULOS ARCANOS</span>
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: "#fff", marginBottom: "20px", fontSize: "1.3rem", borderBottom: "1px solid rgba(245,158,11,0.2)", paddingBottom: "12px" }}>Modificadores do Conjurador</h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative", zIndex: "1" }}>
                        <div>
                            <strong style={{ color: "var(--accent)", fontSize: "0.95rem", display: "block", marginBottom: "8px" }}>Jogada de Ataque de Magia:</strong>
                            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245,158,11,0.3)", padding: "12px", borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#fff", textAlign: "center", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
                                D20 + Bônus Proficiência + Mod. Conjurador
                            </div>
                        </div>
                        <div>
                            <strong style={{ color: "var(--accent)", fontSize: "0.95rem", display: "block", marginBottom: "8px" }}>Classe de Dificuldade (CD) da Magia:</strong>
                            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245,158,11,0.3)", padding: "12px", borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "#fff", textAlign: "center", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)" }}>
                                8 + Bônus Proficiência + Mod. Conjurador
                            </div>
                        </div>
                        <div style={{ background: "rgba(245,158,11,0.1)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.8rem", color: "var(--text-dim)", lineHeight: "1.5" }}>
                            <strong style={{ color: "var(--warning)" }}>Atributos por Classe:</strong><br />
                            • <span style={{ color: "#fff" }}>Inteligência:</span> Magos, Artífices<br />
                            • <span style={{ color: "#fff" }}>Sabedoria:</span> Clérigos, Druidas, Patrulheiros<br />
                            • <span style={{ color: "#fff" }}>Carisma:</span> Feiticeiros, Bruxos, Bardos, Paladinos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
