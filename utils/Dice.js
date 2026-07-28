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
            const cleanStr = notation.toLowerCase().replace(/\s+/g, '');
            // Regex for basic dice: [num]d[sides](kh1|kl1)?([modifier])
            // Supports: 1d20, 2d20kh1+5, 2d20kl1-2, 2d6+4
            const regex = /^(\d+)d(\d+)(kh1|kl1)?([+-]\d+)?$/;
            const match = cleanStr.match(regex);
            
            if (!match) {
                // Fallback for simple number (just modifier)
                if (/^[+-]?\d+$/.test(cleanStr)) {
                    const val = parseInt(cleanStr);
                    return { total: val, rolls: [], modifier: val, notation };
                }
                throw new Error("Formato de dado inválido. Use algo como '1d20', '2d20kh1' ou '2d6+4'.");
            }

            const count = parseInt(match[1]);
            const sides = parseInt(match[2]);
            const keep = match[3]; // kh1 or kl1
            const modifier = match[4] ? parseInt(match[4]) : 0;
            
            let rolls = [];
            for (let i = 0; i < count; i++) {
                rolls.push(Math.floor(Math.random() * sides) + 1);
            }

            let total = 0;
            let finalRolls = [...rolls];

            if (keep === 'kh1') {
                total = Math.max(...rolls);
                finalRolls = [total];
            } else if (keep === 'kl1') {
                total = Math.min(...rolls);
                finalRolls = [total];
            } else {
                total = rolls.reduce((a, b) => a + b, 0);
            }

            total += modifier;

            return {
                total,
                rolls: rolls,
                finalRolls,
                modifier,
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
