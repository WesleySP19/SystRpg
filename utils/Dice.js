/**
 * DICE ENGINE (Architect Edition)
 * Robust utility for RPG dice notation parsing and execution.
 */
export class Dice {
    /**
     * Parses and rolls a dice notation string (e.g., "2d20h1 + 5", "1d12 + 3")
     * @param {string} notation 
     * @returns {Object} { total, rolls, modifier, type }
     */
    static roll(notation) {
        try {
            // Clean notation
            const cleanStr = notation.toLowerCase().replace(/\s+/g, '');
            
            // Regex for dice: [num]d[sides](kh/kl[num])?([*multiplier] or [+/-modifier])
            // Supports: 1d20, 2d20kh1, 2d20kl1, 2d6+4, 4d6*10
            const regex = /^(\d+)d(\d+)(kh\d+|kl\d+)?(?:(\*\d+)|([+-]\d+))?$/;
            const match = cleanStr.match(regex);
            
            if (!match) {
                if (/^[+-]?\d+$/.test(cleanStr)) {
                    const val = parseInt(cleanStr);
                    return { total: val, rolls: [], modifier: val, notation };
                }
                throw new Error("Formato de dado inválido.");
            }

            const count = parseInt(match[1]);
            const sides = parseInt(match[2]);
            const keepMatch = match[3];
            const multiplier = match[4] ? parseInt(match[4].slice(1)) : 1;
            const modifier = match[5] ? parseInt(match[5]) : 0;
            
            let rolls = [];
            for (let i = 0; i < count; i++) {
                rolls.push(Math.floor(Math.random() * sides) + 1);
            }

            let keptRolls = [...rolls];
            if (keepMatch) {
                const kCount = parseInt(keepMatch.slice(2));
                const mode = keepMatch.startsWith('kh') ? 'high' : 'low';
                keptRolls.sort((a,b) => mode === 'high' ? b-a : a-b);
                keptRolls = keptRolls.slice(0, kCount);
            }

            const total = (keptRolls.reduce((a,b) => a+b, 0) * multiplier) + modifier;

            return {
                total,
                rolls,
                keptRolls,
                modifier,
                multiplier,
                sides,
                count,
                notation
            };
        } catch (error) {
            console.error("[Dice Engine] Error:", error);
            return { error: error.message };
        }
    }

    /**
     * Helper for quick simple rolls
     */
    static quick(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }
}
