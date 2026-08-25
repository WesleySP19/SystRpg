import { h } from 'preact';

export function RefConditions() {
    const conds = [
        { name: 'Caído (Prone)', icon: 'fa-person-falling', effect: 'Movimento apenas rastejando (dobro do custo). Jogadas de ataque contra a criatura têm Vantagem a 1.5m e Desvantagem para ataques à distância.' },
        { name: 'Cego (Blinded)', icon: 'fa-eye-slash', effect: 'Falha automática em testes que requerem visão. Jogadas de ataque contra o cego têm Vantagem, e os ataques dele têm Desvantagem.' },
        { name: 'Envenenado (Poisoned)', icon: 'fa-skull-crossbones', effect: 'A criatura sente náuseas intensas e tremores. Tem Desvantagem em todas as jogadas de ataque e testes de habilidade.' },
        { name: 'Enfeitiçado (Charmed)', icon: 'fa-heart', effect: 'Não pode atacar o conjurador do feitiço. O conjurador tem Vantagem em testes de interação social com a criatura.' },
        { name: 'Agarrado (Grappled)', icon: 'fa-hand-back-fist', effect: 'Deslocamento da criatura torna-se 0. O agarrador pode arrastá-la consigo pela metade do seu próprio deslocamento.' },
        { name: 'Incapacitado', icon: 'fa-ban', effect: 'A criatura perde o controle motor ou foco mental imediato. Não pode realizar nenhuma ação ou reação sob nenhuma hipótese.' },
        { name: 'Invisível', icon: 'fa-ghost', effect: 'Impossível de ser visto a olho nu (mas faz barulho e deixa pegadas). Ataques contra ela têm Desvantagem; ataques dela têm Vantagem.' },
        { name: 'Paralisado', icon: 'fa-bolt', effect: 'Incapacitada e incapaz de se mover ou falar. Falha em testes de FOR/DES. Qualquer ataque feito a 1.5m é um Golpe Crítico Automático.' },
        { name: 'Petrificado', icon: 'fa-gem', effect: 'Transformada em pedra sólida. Peso multiplicado por 10. Imune a venenos e doenças, e tem Resistência a todo tipo de dano físico.' },
        { name: 'Ensurdecido (Deafened)', icon: 'fa-ear-slash', effect: 'Falha automática em testes de audição. Não ouve comandos e está imune a efeitos mágicos baseados em som.' }
    ];

    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--danger)", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(239,68,68,0.4)" }}>
                <i className="fa-solid fa-skull-crossbones" style={{ marginRight: "10px" }}></i> Condições de Status
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                Efeitos mágicos, armadilhas ou ferimentos de combate que alteram temporariamente as capacidades físicas ou mentais dos heróis e monstros.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                {/* Left: List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "60vh", overflowY: "auto", paddingRight: "15px", scrollbarWidth: "thin" }}>
                    {conds.map((c, i) => (
                        <div key={i} className="glass card-hover ref-card-red" style={{ padding: "18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", borderLeft: "4px solid var(--danger)", background: "rgba(0,0,0,0.3)", position: "relative", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "800", color: "#fff", fontSize: "1.1rem", fontFamily: "'Cinzel', serif", marginBottom: "8px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className={`fa-solid ${c.icon}`} style={{ fontSize: "1rem" }}></i>
                                </div>
                                {c.name}
                            </div>
                            <p style={{ fontSize: "0.8rem", lineHeight: "1.6", color: "var(--text-dim)", margin: "0" }}>{c.effect}</p>
                        </div>
                    ))}
                </div>
                
                {/* Right: Exhaustion rules */}
                <div style={{ position: "sticky", top: "0" }}>
                    <div className="hp-container glass" style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.05), rgba(0,0,0,0.6))", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "30px", display: "flex", flexDirection: "column", justifyContent: "flex-start", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                        <span className="hp-label-float" style={{ background: "#08080a", color: "var(--danger)", borderColor: "var(--danger)", boxShadow: "0 0 10px rgba(239,68,68,0.2)" }}>⚠️ REGRAS ESPECIAIS</span>
                        <h4 style={{ fontFamily: "'Cinzel', serif", color: "#fff", marginBottom: "15px", fontSize: "1.3rem", borderBottom: "1px solid rgba(239,68,68,0.2)", paddingBottom: "12px", textShadow: "0 0 10px rgba(239,68,68,0.3)" }}>Níveis de Exaustão</h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: "1.6", marginBottom: "20px" }}>Fadiga extrema, frio congelante ou rituais necromânticos causam exaustão acumulativa. Um descanso longo remove 1 nível.</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}><strong>Nível 1:</strong> <span style={{ color: "var(--danger)" }}>Desvantagem em testes de atributos</span></div>
                            <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}><strong>Nível 2:</strong> <span style={{ color: "var(--danger)" }}>Deslocamento cortado pela metade</span></div>
                            <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}><strong>Nível 3:</strong> <span style={{ color: "var(--danger)" }}>Desvantagem em ataques e salvaguardas</span></div>
                            <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}><strong>Nível 4:</strong> <span style={{ color: "var(--danger)" }}>Máximo de PV reduzido pela metade</span></div>
                            <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}><strong>Nível 5:</strong> <span style={{ color: "var(--danger)" }}>Deslocamento reduzido para 0</span></div>
                            <div style={{ fontSize: "0.95rem", display: "flex", justifyContent: "space-between", paddingTop: "4px", fontWeight: "900", background: "rgba(239,68,68,0.1)", padding: "8px", borderRadius: "6px", marginTop: "4px" }}><strong>Nível 6:</strong> <span style={{ color: "red", textShadow: "0 0 10px red" }}>Morte Instantânea 💀</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
