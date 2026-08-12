import { useState, useEffect } from 'preact/hooks';
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
