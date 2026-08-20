import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { TOME } from '../../core/Registry.js';

/**
 * Custom Hook para consumir o Store de forma reativa.
 * Exemplo de uso:
 * const players = useStore('players');
 * const [state, updateState] = useStore(); // Todo o estado
 */
export function useStore(path) {
    const [value, setValue] = useState(() => {
        if (!TOME.store) return null;
        return path ? TOME.store.state[path] : TOME.store.snapshot();
    });

    useEffect(() => {
        if (!TOME.store) return;
        
        let unsubscribe;
        if (path) {
            unsubscribe = TOME.store.subscribeTo(path, (newVal) => {
                setValue(newVal);
            });
        } else {
            unsubscribe = TOME.store.subscribe((newVal) => {
                setValue(newVal);
            });
        }
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [path]);

    const updater = (updaterFn) => {
        if (TOME.store) {
            TOME.store.update(updaterFn);
        }
    };

    return path ? value : [value, updater];
}

/**
 * Custom Hook para consumir um Signal diretamente.
 * Isso impede que o componente pai re-renderize, atualizando apenas o nó DOM atrelado ao Signal.
 */
export function useSignalPath(path) {
    if (!TOME.store) return null;
    if (!TOME.store.pathSignals[path]) {
        TOME.store.pathSignals[path] = signal(TOME.store.state[path]);
    }
    return TOME.store.pathSignals[path];
}
