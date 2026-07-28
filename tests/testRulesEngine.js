import { RulesEngine } from '../core/RulesEngine.js';

console.log("--- Testing Rules Engine Parser ---");

try {
    // Test 1: d20 roll
    const roll1 = RulesEngine.rollExpression('1d20+5');
    console.log(`1d20+5: Total=${roll1.total} (Rolls: ${roll1.rolls.join(',')})`);

    // Test 2: d20 with advantage
    const roll2 = RulesEngine.rollExpression('1d20+3', 'advantage');
    console.log(`1d20+3 (Advantage): Total=${roll2.total} (Rolls: ${roll2.rolls.join(',')})`);

    // Test 3: Multi dice
    const roll3 = RulesEngine.rollExpression('2d6+4');
    console.log(`2d6+4: Total=${roll3.total} (Rolls: ${roll3.rolls.join(',')})`);

    // Test 4: Formula with context
    const context = { FOR: 4, PROF: 2 };
    const formulaRoll = RulesEngine.resolveFormula('1d20+FOR+PROF', context);
    console.log(`1d20+FOR+PROF (Context: FOR=4, PROF=2): Total=${formulaRoll.total} (Rolls: ${formulaRoll.rolls.join(',')})`);

    console.log("All tests completed successfully!");
} catch (e) {
    console.error("Test failed:", e.message);
}
