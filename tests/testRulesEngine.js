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

    // Test 5: Negative context and complex formulas
    const ctx2 = { INT: 3, PENALTY: -2 };
    const roll5 = RulesEngine.resolveFormula('2d6+INT+PENALTY-1', ctx2);
    console.log(`2d6+INT+PENALTY-1 (Context: INT=3, PENALTY=-2): Total=${roll5.total} (Rolls: ${roll5.rolls.join(',')})`);

    // Test 6: Distance Calculations
    console.log("\n--- Testing Distance Calculations ---");
    const posA = { x: 0, y: 0 };
    const posB = { x: 3, y: 4 };
    
    const distChebyshev = RulesEngine.calculateDistance(posA, posB, 'square');
    console.log(`Chebyshev Distance (0,0 to 3,4) = ${distChebyshev} (Expected: 4)`);
    
    const distManhattan = RulesEngine.calculateDistance(posA, posB, 'manhattan');
    console.log(`Manhattan Distance (0,0 to 3,4) = ${distManhattan} (Expected: 7)`);
    
    const distHex = RulesEngine.calculateDistance(posA, posB, 'hex');
    console.log(`Hex/Axial Distance (0,0 to 3,4) = ${distHex} (Expected: 7)`);

    console.log("\nAll tests completed successfully!");
} catch (e) {
    console.error("Test failed:", e.message);
}
