import { h } from 'preact';

export function EncounterCalculator({ players, monsters }) {
    if (!players?.length || !monsters?.length) {
        return (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                <i className="fa-solid fa-feather-pointed fa-2x opacity-20"></i>
                <span>Adicione aventureiros e monstros para computar a taxa de perigo.</span>
            </div>
        );
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
    let colorClass = "text-gray-500";
    let borderClass = "border-gray-500";
    let bgGradient = "from-white/5 to-white/10";
    
    if (adjustedXP >= deadTotal) { 
        diff = "MORTAL 💀"; 
        colorClass = "text-red-500"; 
        borderClass = "border-red-500";
        bgGradient = "from-red-500/10 to-red-500/25";
    } else if (adjustedXP >= hardTotal) { 
        diff = "Difícil ⚠️"; 
        colorClass = "text-yellow-500"; 
        borderClass = "border-yellow-500";
        bgGradient = "from-yellow-500/10 to-yellow-500/20";
    } else if (adjustedXP >= medTotal) { 
        diff = "Médio ⚔️"; 
        colorClass = "text-blue-500"; 
        borderClass = "border-blue-500";
        bgGradient = "from-blue-500/10 to-blue-500/20";
    } else if (adjustedXP >= easyTotal) { 
        diff = "Fácil 🛡️"; 
        colorClass = "text-green-500"; 
        borderClass = "border-green-500";
        bgGradient = "from-green-500/10 to-green-500/20";
    }

    return (
        <div className={`p-5 flex justify-between items-center border-l-4 transition-all duration-300 bg-gradient-to-r ${bgGradient} ${borderClass}`}>
            <div>
                <div className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Letalidade Avaliada</div>
                <div className={`text-2xl font-black font-cinzel drop-shadow-md ${colorClass}`}>{diff}</div>
            </div>
            <div className="text-right">
                <div className="text-[0.65rem] text-gray-400 uppercase tracking-widest">XP do Desafio</div>
                <div className="text-xl font-black text-white font-cinzel">{adjustedXP} <span className="text-xs text-tomeGold">XP</span></div>
            </div>
        </div>
    );
}
