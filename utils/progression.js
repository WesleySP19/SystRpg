export function calculateLevelAndXP(xp, currentLevel = 1) {
    const lvl = parseInt(currentLevel) || 1;
    const currentXP = xp || 0;
    
    // XP Scaling
    let nextXP = 300;
    if (lvl === 1) nextXP = 300;
    else if (lvl === 2) nextXP = 900;
    else if (lvl === 3) nextXP = 2700;
    else if (lvl === 4) nextXP = 6500;
    else if (lvl >= 5) nextXP = lvl * 2000;
    
    let progress = Math.min((currentXP / nextXP) * 100, 100);

    return {
        lvl,
        currentXP,
        nextXP,
        progress
    };
}
