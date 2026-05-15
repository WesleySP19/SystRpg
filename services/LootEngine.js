/**
 * LOOT ENGINE SERVICE
 * Gera tesouros e recompensas baseados no SRD de D&D 5e.
 */
export class LootEngine {
    /**
     * Gera tesouro individual para um monstro
     * @param {number} cr Challenge Rating 
     */
    static generateIndividual(cr) {
        const roll = Math.floor(Math.random() * 100) + 1;
        let loot = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

        if (cr <= 4) {
            if (roll <= 30) loot.cp = this.rollDice(5, 6);
            else if (roll <= 60) loot.sp = this.rollDice(4, 6);
            else if (roll <= 70) loot.ep = this.rollDice(3, 6);
            else if (roll <= 95) loot.gp = this.rollDice(3, 6);
            else loot.pp = this.rollDice(1, 6);
        } else if (cr <= 10) {
            if (roll <= 30) { loot.cp = this.rollDice(4, 6) * 100; loot.ep = this.rollDice(1, 6) * 10; }
            else if (roll <= 60) { loot.sp = this.rollDice(6, 6) * 10; loot.gp = this.rollDice(2, 6) * 10; }
            else if (roll <= 70) { loot.ep = this.rollDice(3, 6) * 10; loot.gp = this.rollDice(2, 6) * 10; }
            else if (roll <= 95) { loot.gp = this.rollDice(4, 6) * 10; }
            else { loot.gp = this.rollDice(2, 6) * 10; loot.pp = this.rollDice(3, 6); }
        } else if (cr <= 16) {
            if (roll <= 20) { loot.sp = this.rollDice(4, 6) * 100; loot.gp = this.rollDice(1, 6) * 100; }
            else if (roll <= 35) { loot.ep = this.rollDice(1, 6) * 100; loot.gp = this.rollDice(1, 6) * 100; }
            else if (roll <= 75) { loot.gp = this.rollDice(2, 6) * 100; loot.pp = this.rollDice(1, 6) * 10; }
            else { loot.gp = this.rollDice(2, 6) * 100; loot.pp = this.rollDice(2, 6) * 10; }
        } else {
            // CR 17+
            if (roll <= 15) { loot.gp = this.rollDice(2, 6) * 1000; loot.pp = this.rollDice(8, 6) * 100; }
            else if (roll <= 55) { loot.gp = this.rollDice(1, 6) * 1000; loot.pp = this.rollDice(1, 6) * 100; }
            else { loot.gp = this.rollDice(2, 6) * 1000; loot.pp = this.rollDice(2, 6) * 100; }
        }
        return loot;
    }

    static rollDice(num, sides) {
        let total = 0;
        for (let i = 0; i < num; i++) total += Math.floor(Math.random() * sides) + 1;
        return total;
    }
}
