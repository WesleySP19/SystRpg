import { h } from 'preact';

export function RefResting() {
    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "#ffd700", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(255,215,0,0.4)" }}>
                <i className="fa-solid fa-campground" style={{ marginRight: "10px" }}></i> Descansos, Cura & Sobrevivência
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                As jornadas épicas exigem que os heróis parem para recuperar forças, tratar ferimentos letais e recarregar seu poder arcano.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                {/* Descanso Curto */}
                <div className="glass" style={{ padding: "30px", borderRadius: "16px", borderLeft: "5px solid var(--accent)", background: "rgba(0,0,0,0.4)", position: "relative", overflow: "hidden" }}>
                    <i className="fa-solid fa-mug-hot" style={{ position: "absolute", bottom: "-20px", right: "-20px", fontSize: "100px", color: "rgba(197,160,89,0.05)", pointerEvents: "none" }}></i>
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--accent)", marginBottom: "15px", fontSize: "1.3rem" }}><i className="fa-solid fa-hourglass-half" style={{ marginRight: "8px" }}></i> Descanso Curto (1 Hora)</h4>
                    <p style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--text-dim)", marginBottom: "20px" }}>Uma pausa que não exige mais do que comer, beber, ler ou cuidar de ferimentos de forma rústica.</p>
                    
                    <div style={{ background: "rgba(197,160,89,0.05)", border: "1px solid rgba(197,160,89,0.2)", padding: "20px", borderRadius: "12px" }}>
                        <strong style={{ color: "#fff", fontSize: "1rem", display: "block", marginBottom: "10px", fontFamily: "'Cinzel', serif" }}>Gasto de Dados de Vida (Hit Dice)</strong>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: "1.5", margin: "0" }}>Um herói pode gastar um ou mais dos seus Dados de Vida no final do descanso. Para cada dado gasto, jogue-o e adicione o <strong>Modificador de Constituição</strong>. O total é recuperado em Pontos de Vida (HP).</p>
                    </div>
                </div>

                {/* Descanso Longo */}
                <div className="glass" style={{ padding: "30px", borderRadius: "16px", borderLeft: "5px solid var(--success)", background: "rgba(0,0,0,0.4)", position: "relative", overflow: "hidden" }}>
                    <i className="fa-solid fa-bed" style={{ position: "absolute", bottom: "-20px", right: "-20px", fontSize: "100px", color: "rgba(16,185,129,0.05)", pointerEvents: "none" }}></i>
                    <h4 style={{ fontFamily: "'Cinzel', serif", color: "var(--success)", marginBottom: "15px", fontSize: "1.3rem" }}><i className="fa-solid fa-moon" style={{ marginRight: "8px" }}></i> Descanso Longo (8 Horas)</h4>
                    <p style={{ fontSize: "0.85rem", lineHeight: "1.6", color: "var(--text-dim)", marginBottom: "20px" }}>Equivale a uma noite de sono segura. O herói não pode ter se envolvido em combate ou esforço por mais de 1 hora no total.</p>
                    
                    <ul style={{ fontSize: "0.85rem", lineHeight: "2.0", color: "var(--text-dim)", paddingLeft: "15px", margin: "0" }}>
                        <li><strong style={{ color: "#fff" }}>Cura Completa:</strong> Restaura 100% dos Pontos de Vida perdidos.</li>
                        <li><strong style={{ color: "#fff" }}>Espaços de Magia:</strong> Todos os slots de magia consumidos são recarregados.</li>
                        <li><strong style={{ color: "#fff" }}>Dados de Vida:</strong> Recupera <strong>metade</strong> do total máximo de Dados de Vida (arredondado para baixo, mínimo 1).</li>
                        <li><strong style={{ color: "#fff" }}>Fadiga:</strong> Reduz exatamente <strong>1 nível</strong> a exaustão física da criatura.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
