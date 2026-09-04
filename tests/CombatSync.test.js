import { describe, test, expect } from '@jest/globals';
import { Store } from '../core/Store.js';

describe('Combat State & Action Economy Synchronization (2026)', () => {
    test('Combat initialization prepares initiative order and action economy', () => {
        const store = new Store({
            initiativeOrder: [],
            combatants: [],
            initiativeIndex: 0,
            combatRound: 0,
            combatActive: false
        });

        const heroes = [
            { id: 'p1', name: 'Guerreiro', init: 14, hp: 32, type: 'Player' },
            { id: 'p2', name: 'Maga', init: 19, hp: 18, type: 'Player' },
            { id: 'm1', name: 'Goblin', init: 8, hp: 7, type: 'Enemy' }
        ];

        store.update(s => {
            s.initiativeOrder = [...heroes].sort((a, b) => b.init - a.init);
            s.combatants = s.initiativeOrder;
            s.combatActive = true;
            s.combatRound = 1;
            s.initiativeIndex = 0;
            // Initialize action economy for first combatant
            s.initiativeOrder[0].actions = { action: true, bonus: true, reaction: true, movement: 30 };
        });

        expect(store.state.initiativeOrder[0].name).toBe('Maga');
        expect(store.state.initiativeOrder[1].name).toBe('Guerreiro');
        expect(store.state.initiativeOrder[2].name).toBe('Goblin');
        expect(store.state.initiativeOrder[0].actions.action).toBe(true);
        expect(store.state.initiativeOrder[0].actions.movement).toBe(30);
    });

    test('Turn advance cycles through combatants and resets action economy', () => {
        const store = new Store({
            initiativeOrder: [
                { id: 'p1', name: 'Maga', actions: { action: false, bonus: false, reaction: false, movement: 0 } },
                { id: 'p2', name: 'Guerreiro', actions: { action: true, bonus: true, reaction: true, movement: 30 } }
            ],
            initiativeIndex: 0,
            combatRound: 1
        });

        // Simulate nextTurn advance
        store.update(s => {
            const nextIndex = (s.initiativeIndex + 1) % s.initiativeOrder.length;
            s.initiativeIndex = nextIndex;
            if (nextIndex === 0) s.combatRound++;
            
            // Auto reset action economy for next turn
            s.initiativeOrder[nextIndex].actions = { action: true, bonus: true, reaction: true, movement: 30 };
        });

        expect(store.state.initiativeIndex).toBe(1);
        expect(store.state.combatRound).toBe(1);
        expect(store.state.initiativeOrder[1].actions.action).toBe(true);
        expect(store.state.initiativeOrder[1].actions.movement).toBe(30);

        // Turn advance completing full round
        store.update(s => {
            const nextIndex = (s.initiativeIndex + 1) % s.initiativeOrder.length;
            s.initiativeIndex = nextIndex;
            if (nextIndex === 0) s.combatRound++;
            s.initiativeOrder[nextIndex].actions = { action: true, bonus: true, reaction: true, movement: 30 };
        });

        expect(store.state.initiativeIndex).toBe(0);
        expect(store.state.combatRound).toBe(2);
        expect(store.state.initiativeOrder[0].actions.action).toBe(true);
    });

    test('Action economy spending toggles individual actions properly', () => {
        const combatant = {
            id: 'p1',
            name: 'Paladino',
            actions: { action: true, bonus: true, reaction: true, movement: 30 }
        };

        // Spend Action
        combatant.actions.action = false;
        expect(combatant.actions.action).toBe(false);
        expect(combatant.actions.bonus).toBe(true);

        // Spend Movement in increments
        combatant.actions.movement = Math.max(0, combatant.actions.movement - 10);
        expect(combatant.actions.movement).toBe(20);

        // Spend Reaction
        combatant.actions.reaction = false;
        expect(combatant.actions.reaction).toBe(false);
    });
});
