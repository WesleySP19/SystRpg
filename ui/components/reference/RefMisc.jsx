import { h } from 'preact';

export function RefDC() {
    const dcs = [
        { val: 5, level: 'Muito Fácil', example: 'Arrombar uma porta de madeira velha e podre.' },
        { val: 10, level: 'Fácil', example: 'Ouvir uma conversa abafada atrás de uma porta comum.' },
        { val: 15, level: 'Médio', example: 'Escalar uma parede de pedra molhada com poucos apoios.' },
        { val: 20, level: 'Difícil', example: 'Decifrar um manuscrito antigo em dialeto morto.' },
        { val: 25, level: 'Muito Difícil', example: 'Saltar um desfiladeiro ventoso de 6 metros.' },
        { val: 30, level: 'Quase Impossível', example: 'Rastrear um assassino na lama sob tempestade torrencial.' }
    ];

    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "var(--accent)", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(197,160,89,0.4)" }}>
                <i className="fa-solid fa-bullseye" style={{ marginRight: "10px" }}></i> Escala de Classes de Dificuldade (CD)
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                A Classe de Dificuldade (DC) determina o quão heróico ou excepcional deve ser o esforço de um personagem para realizar um teste de atributo e ter sucesso na história.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px", maxHeight: "60vh", overflowY: "auto", paddingRight: "15px", scrollbarWidth: "thin" }}>
                {dcs.map((d, i) => (
                    <div key={i} className="glass card-hover ref-card-gold" style={{ display: "flex", alignItems: "center", gap: "25px", padding: "20px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(197,160,89,0.1)", borderRadius: "12px", position: "relative" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(197,160,89,0.2), rgba(255,170,0,0.1))", color: "var(--accent)", border: "1px solid rgba(197,160,89,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontFamily: "'Cinzel', serif", fontSize: "1.5rem", boxShadow: "0 0 15px rgba(197,160,89,0.1)", flexShrink: "0" }}>
                            {d.val}
                        </div>
                        <div style={{ flex: "1" }}>
                            <div style={{ fontWeight: "800", fontSize: "1.1rem", color: "#fff", fontFamily: "'Cinzel', serif", letterSpacing: "0.5px", marginBottom: "4px" }}>{d.level}</div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: "1.4" }}><em>Ex: {d.example}</em></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RefAbbreviations() {
    const terms = [
        { s: 'CA / AC', m: 'Classe de Armadura. O valor numérico que um ataque inimigo deve igualar ou superar para desferir um golpe físico com sucesso.' },
        { s: 'CD / DC', m: 'Classe de Dificuldade. A meta numérica a ser atingida em testes de perícia ou testes de resistência.' },
        { s: 'PV / HP', m: 'Pontos de Vida. Representação abstrata da vitalidade e da integridade física de uma criatura.' },
        { s: 'TR / ST', m: 'Teste de Resistência (Saving Throw). Teste reativo feito para evitar ou reduzir os efeitos nocivos de magias ou perigos.' },
        { s: 'Vantagem', m: 'Role dois dados d20 no teste e utilize o maior resultado obtido para somar seus modificadores.' },
        { s: 'Desvantagem', m: 'Role dois dados d20 no teste e utilize o menor resultado obtido para somar seus modificadores.' },
        { s: 'Surpresa', m: 'Inimigos pegos de surpresa não se movem, não executam ações na 1ª rodada e não podem usar reações.' },
        { s: 'Ataque de Oportunidade', m: 'Uso de uma Reação para desferir um ataque físico em um oponente que sai do seu alcance de combate corpo-a-corpo.' },
        { s: 'Ação Bônus', m: 'Uma ação extra menor concedida por magias, talentos especiais ou características de classe específicas.' },
        { s: 'ND / CR', m: 'Nível de Desafio. Métrica indicadora do poder relativo de monstros para equilibrar encontros de combate tático.' }
    ];

    return (
        <div className="animate-fade-in" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", color: "#fff", marginBottom: "15px", fontSize: "1.8rem", textShadow: "0 0 15px rgba(255,255,255,0.3)" }}>
                <i className="fa-solid fa-language" style={{ marginRight: "10px" }}></i> Dicionário de Termos e Siglas
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-dim)", marginBottom: "30px", lineHeight: "1.6" }}>
                Lista de siglas, definições rápidas e convenções mais comuns usadas pelas regras oficiais de D&D 5e e presentes nas fichas.
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", maxHeight: "60vh", overflowY: "auto", paddingRight: "15px", scrollbarWidth: "thin" }}>
                {terms.map((t, i) => (
                    <div key={i} className="glass card-hover ref-card-gold" style={{ padding: "20px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                        <strong style={{ color: "var(--accent)", fontFamily: "'Cinzel', serif", fontSize: "1.1rem", display: "block", marginBottom: "8px", textShadow: "0 0 8px rgba(197,160,89,0.3)" }}>{t.s}</strong>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", lineHeight: "1.6", margin: "0" }}>{t.m}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function RefQuickRef() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(197,160,89,0.3)", paddingBottom: "12px", marginBottom: "10px" }}>
                <h3 style={{ fontFamily: "'Cinzel'", color: "var(--accent)", margin: "0", fontSize: "1.5rem" }}>
                    <i className="fa-solid fa-compass" style={{ marginRight: "10px" }}></i> Guia Rápido Interativo D&D 5e (PT-BR)
                </h3>
                <a href="https://diogoan.github.io/dnd5e-quickref/" target="_blank" className="btn btn-ghost btn-sm" style={{ fontSize: "0.7rem", border: "1px solid rgba(197,160,89,0.3)", color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <i className="fa-solid fa-up-right-from-square"></i> Abrir em Nova Aba
                </a>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", margin: "0", lineHeight: "1.5" }}>
                Clique nas abas e nos cartões abaixo para ver as descrições mecânicas completas em <strong>Português</strong> de ações, reações, movimentação e condições oficiais de D&D 5e.
            </p>
            <div style={{ flex: "1", border: "var(--sheet-border-thick)", borderRadius: "12px", overflow: "hidden", background: "#ffffff", position: "relative", minHeight: "650px" }}>
                <iframe src="https://diogoan.github.io/dnd5e-quickref/" style={{ width: "100%", height: "650px", border: "none" }} sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
            </div>
        </div>
    );
}
