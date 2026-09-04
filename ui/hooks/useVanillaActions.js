import { useEffect, useRef } from 'preact/hooks';

/**
 * Hook de transição para manter botões com `data-action="..."` funcionando
 * em componentes funcionais durante a refatoração do ReactiveComponent.
 */
export function useVanillaActions(actionsMap) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Inject helper methods for legacy vanilla components
        if (!actionsMap.$) {
            actionsMap.$ = (sel) => container.querySelector(sel);
            actionsMap.$$ = (sel) => container.querySelectorAll(sel);
        }
        if (!actionsMap.render) {
            actionsMap.render = () => {};
        }

        const handleClick = (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const actionName = actionBtn.dataset.action;
                if (actionsMap[actionName]) {
                    actionsMap[actionName](e, actionBtn);
                } else {
                    console.warn(`[useVanillaActions] Action '${actionName}' not defined in actionsMap.`);
                }
            }
        };

        const handleChange = (e) => {
             const actionNode = e.target.closest('[data-action]');
             if (actionNode && actionNode.tagName === 'INPUT' && actionNode.type === 'range') {
                 // For range inputs like updatePortrait
                 const actionName = actionNode.dataset.action;
                 if (actionsMap[actionName]) {
                     actionsMap[actionName](e, actionNode);
                 }
             }
        };

        container.addEventListener('click', handleClick);
        container.addEventListener('input', handleChange); // Para ranges

        return () => {
            container.removeEventListener('click', handleClick);
            container.removeEventListener('input', handleChange);
        };
    }, [actionsMap]);

    return containerRef;
}
