import { describe, test, expect } from '@jest/globals';
import {
    CommandStack,
    PixiAddWallCommand,
    PixiPaintFogCommand,
    PixiMoveTokenCommand
} from '../engine/UndoRedo.js';

describe('Undo / Redo Command Pattern (VTT Engine 2026)', () => {
    test('CommandStack executes, undoes and redoes correctly', () => {
        const stack = new CommandStack(null, 10);
        let value = 0;

        const cmd = {
            execute: () => { value += 10; },
            undo: () => { value -= 10; }
        };

        expect(stack.canUndo()).toBe(false);
        expect(stack.canRedo()).toBe(false);

        stack.execute(cmd);
        expect(value).toBe(10);
        expect(stack.canUndo()).toBe(true);
        expect(stack.canRedo()).toBe(false);

        stack.undo();
        expect(value).toBe(0);
        expect(stack.canUndo()).toBe(false);
        expect(stack.canRedo()).toBe(true);

        stack.redo();
        expect(value).toBe(10);
        expect(stack.canUndo()).toBe(true);
        expect(stack.canRedo()).toBe(false);
    });

    test('CommandStack respects maximum history limit', () => {
        const stack = new CommandStack(null, 3);
        for (let i = 0; i < 5; i++) {
            stack.execute({ execute: () => {}, undo: () => {} });
        }
        expect(stack.undoStack.length).toBe(3);
    });

    test('PixiAddWallCommand adds and removes wall from tactical engine', () => {
        let rerenderCalled = false;
        const fakeEngine = {
            walls: [],
            _renderWalls: () => { rerenderCalled = true; }
        };

        const wall = { id: 'w1', x1: 0, y1: 0, x2: 100, y2: 100 };
        const cmd = new PixiAddWallCommand(wall);

        cmd.execute(fakeEngine);
        expect(fakeEngine.walls).toHaveLength(1);
        expect(fakeEngine.walls[0].id).toBe('w1');
        expect(rerenderCalled).toBe(true);

        rerenderCalled = false;
        cmd.undo(fakeEngine);
        expect(fakeEngine.walls).toHaveLength(0);
        expect(rerenderCalled).toBe(true);

        cmd.execute(fakeEngine);
        expect(fakeEngine.walls).toHaveLength(1);
    });

    test('PixiPaintFogCommand correctly undoes fog brush stroke', () => {
        let fogRefreshCalled = false;
        const fakeEngine = {
            fogPaths: [],
            _paintFog: (x, y, radius) => {
                fakeEngine.fogPaths.push({ x, y, radius });
            },
            setFog: (opts) => { fogRefreshCalled = true; }
        };

        const point = { x: 250, y: 300, radius: 150 };
        const cmd = new PixiPaintFogCommand(point);

        cmd.execute(fakeEngine);
        expect(fakeEngine.fogPaths).toHaveLength(1);
        expect(fakeEngine.fogPaths[0].x).toBe(250);

        cmd.undo(fakeEngine);
        expect(fakeEngine.fogPaths).toHaveLength(0);
        expect(fogRefreshCalled).toBe(true);

        cmd.execute(fakeEngine);
        expect(fakeEngine.fogPaths).toHaveLength(1);
    });

    test('PixiMoveTokenCommand smoothly undoes and redoes token coordinates', () => {
        const fakeToken = { x: 50, y: 50, targetX: 50, targetY: 50 };
        const fakeEngine = {
            tokens: new Map([['hero-1', fakeToken]])
        };

        const cmd = new PixiMoveTokenCommand('hero-1', 50, 50, 200, 300);

        cmd.execute(fakeEngine);
        expect(fakeToken.x).toBe(200);
        expect(fakeToken.y).toBe(300);

        cmd.undo(fakeEngine);
        expect(fakeToken.x).toBe(50);
        expect(fakeToken.y).toBe(50);

        cmd.execute(fakeEngine);
        expect(fakeToken.x).toBe(200);
        expect(fakeToken.y).toBe(300);
    });
});
