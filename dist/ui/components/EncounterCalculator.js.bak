import { html } from 'htm/preact';

export function calculateEncounterDifficulty(context) {
    const { players, monsters } = context.store.state;
    if (!players?.length || !monsters?.length) {
        return html`
            <div style="padding:25px; text-align:center; color:var(--text-dim); display:flex; flex-direction:column; align-items:center; gap:8px;">
                <i class="fa-solid fa-feather-pointed fa-2x" style="opacity:0.2;"></i>
                <span>Adicione aventureiros e monstros para computar a taxa de perigo.</span>
            </div>
        `;
    }

    // XP Thresholds Table — DMG oficial (todos os níveis 1-20)
    const thresholds = {
        1:  [25,   50,   75,   100],
        2:  [50,   100,  150,  200],
        3:  [75,   150,  225,  400],
        4:  [125,  250,  375,  500],
        5:  [250,  500,  750,  1100],
        6:  [300,  600,  900,  1400],
        7:  [350,  750,  1100, 1700],
        8:  [450,  900,  1400, 2100],
        9:  [550,  1100, 1600, 2400],
        10: [600,  1200, 1900, 2800],
        11: [800,  1600, 2400, 3600],
        12: [1000, 2000, 3000, 4500],
        13: [1100, 2200, 3400, 5100],
        14: [1250, 2500, 3800, 5700],
        15: [1400, 2800, 4300, 6400],
        16: [1600, 3200, 4800, 7200],
        17: [2000, 3900, 5900, 8800],
        18: [2100, 4200, 6300, 9500],
        19: [2400, 4900, 7300, 10900],
        20: [2800, 5700, 8500, 12700],
    };

    let easyTotal = 0, medTotal = 0, hardTotal = 0, deadTotal = 0;
    players.forEach(p => {
        const lv = Math.min(20, Math.max(1, parseInt(p.level) || 1));
        const t = thresholds[lv] || thresholds[1];
        easyTotal += t[0]; medTotal += t[1]; hardTotal += t[2]; deadTotal += t[3];
    });

    // XP por CR — tabela completa CR 0 até CR 30 (DMG oficial)
    const crXP = {
        "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
        "1": 200, "2": 450, "3": 700, "4": 1100,
        "5": 1800, "6": 2300, "7": 2900, "8": 3900,
        "9": 5000, "10": 5900, "11": 7200, "12": 8400,
        "13": 10000, "14": 11500, "15": 13000, "16": 15000,
        "17": 18000, "18": 20000, "19": 22000, "20": 25000,
        "21": 33000, "22": 41000, "23": 50000, "24": 62000,
        "25": 75000, "26": 90000, "27": 105000, "28": 120000,
        "29": 135000, "30": 155000
    };
    let monsterXP = monsters.reduce((acc, m) => acc + (crXP[String(m.cr).trim()] || 100), 0);
    
    // Multiplier based on number of monsters
    const count = monsters.length;
    const mult = count === 1 ? 1 : count === 2 ? 1.5 : count < 7 ? 2 : count < 11 ? 2.5 : 3;
    const adjustedXP = monsterXP * mult;

    let diff = "Trivial";
    let color = "var(--text-dim)";
    let glowClass = "glow-trivial";
    let bgGradient = "linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.08))";
    if (adjustedXP >= deadTotal) { diff = "MORTAL 💀"; color = "var(--danger)"; glowClass = "glow-mortal"; bgGradient = "linear-gradient(to right, rgba(231,76,60,0.1), rgba(231,76,60,0.25))"; }
    else if (adjustedXP >= hardTotal) { diff = "Difícil ⚠️"; color = "var(--warning)"; glowClass = "glow-dificil"; bgGradient = "linear-gradient(to right, rgba(241,196,15,0.08), rgba(241,196,15,0.2))"; }
    else if (adjustedXP >= medTotal) { diff = "Médio ⚔️"; color = "var(--info)"; glowClass = "glow-medio"; bgGradient = "linear-gradient(to right, rgba(52,152,219,0.08), rgba(52,152,219,0.2))"; }
    else if (adjustedXP >= easyTotal) { diff = "Fácil 🛡️"; color = "var(--success)"; glowClass = "glow-facil"; bgGradient = "linear-gradient(to right, rgba(46,204,113,0.08), rgba(46,204,113,0.2))"; }

    return html`
        <div class="letalidade-banner ${glowClass}" style="background:${bgGradient}; padding:20px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid ${color}; transition: all 0.3s ease;">
            <div>
                <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Letalidade Avaliada</div>
                <div style="font-size:1.6rem; font-weight:900; color:${color}; font-family:'Cinzel'; text-shadow:0 0 10px rgba(0,0,0,0.5);">${diff}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">XP do Desafio</div>
                <div style="font-size:1.4rem; font-weight:800; color:#fff; font-family:'Cinzel';">${adjustedXP} <span style="font-size:0.75rem; color:var(--accent);">XP</span></div>
            </div>
        </div>
    `;
}
