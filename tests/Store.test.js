import { Store } from '../core/Store.js';

describe('Store Reactive State Management', () => {
    test('should initialize state correctly', () => {
        const store = new Store({ count: 0, players: [] });
        expect(store.state.count).toBe(0);
        expect(store.state.players).toEqual([]);
    });

    test('should update state via Proxy mutator', () => {
        const store = new Store({ hp: 10 });
        store.update(s => s.hp = 15);
        expect(store.state.hp).toBe(15);
    });

    test('should produce clean snapshot', () => {
        const store = new Store({ name: 'Hero', stats: { str: 18 } });
        const snap = store.snapshot();
        expect(snap).toEqual({ name: 'Hero', stats: { str: 18 } });
    });
});
