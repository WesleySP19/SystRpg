// PlayerState.js
// Redux-like State Management para o VTT

let state = {
    tacticalMap: null,
    combatInitiative: [],
    combatActive: false,
    combatCurrentTurn: 0,
    combatRound: 1,
    referenceCurrentImg: null,
    referenceBroadcast: false,
    currentEnvironment: 'default'
};

const listeners = new Set();

export function getState() {
    return state;
}

export function setState(newStateStr) {
    try {
        const parsed = typeof newStateStr === 'string' ? JSON.parse(newStateStr) : newStateStr;
        state = { ...state, ...parsed };
        notifyListeners();
    } catch (e) {
        console.error('[PlayerState] Falha ao processar estado:', e);
    }
}

export function applyDelta(deltaType, data) {
    if (!state.tacticalMap || !state.tacticalMap.tokens) return;
    
    if (deltaType === 'TOKEN_MOVE') {
        const tok = state.tacticalMap.tokens.find(t => t.id === data.id);
        if (tok) {
            // Em uma evolução real, registraríamos um 'targetX' para interpolar
            tok.x = data.x;
            tok.y = data.y;
            notifyListeners('delta');
        }
    }
}

export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notifyListeners(eventType = 'full') {
    for (const listener of listeners) {
        listener(state, eventType);
    }
}
