/**
 * DELTA SYNC v1.0 — Lightweight JSON Diff & Patch
 * Implementação zero-dependência de RFC 6902 (JSON Patch) otimizada para o estado da mesa.
 * 
 * Gera patches compactos representando apenas as diferenças entre dois estados,
 * reduzindo o tráfego de rede de ~200KB (estado completo) para ~0.5-5KB (delta).
 */

/**
 * Calcula as diferenças entre dois objetos JSON planos/aninhados.
 * Retorna um array de operações RFC 6902 (add, remove, replace).
 * 
 * @param {Object} oldObj - Estado anterior
 * @param {Object} newObj - Estado novo
 * @param {string} basePath - Caminho base (para recursão)
 * @returns {Array} Array de operações patch [{op, path, value}]
 */
export function generatePatch(oldObj, newObj, basePath = '') {
    const patches = [];

    if (oldObj === newObj) return patches;
    if (oldObj === null || oldObj === undefined || newObj === null || newObj === undefined) {
        if (oldObj !== newObj) {
            patches.push({ op: 'replace', path: basePath || '/', value: newObj });
        }
        return patches;
    }

    // Tipos primitivos diferentes
    if (typeof oldObj !== typeof newObj) {
        patches.push({ op: 'replace', path: basePath || '/', value: newObj });
        return patches;
    }

    // Primitivos iguais do mesmo tipo
    if (typeof oldObj !== 'object') {
        if (oldObj !== newObj) {
            patches.push({ op: 'replace', path: basePath || '/', value: newObj });
        }
        return patches;
    }

    // Arrays — usa comparação por posição (não por conteúdo)
    if (Array.isArray(oldObj) && Array.isArray(newObj)) {
        // Otimização: se arrays forem idênticos via stringify rápido, pula
        if (oldObj.length === newObj.length) {
            let identical = true;
            for (let i = 0; i < oldObj.length; i++) {
                if (typeof oldObj[i] === 'object' || typeof newObj[i] === 'object') {
                    identical = false;
                    break;
                }
                if (oldObj[i] !== newObj[i]) {
                    identical = false;
                    break;
                }
            }
            if (identical) return patches;
        }

        // Para arrays grandes ou com mudanças complexas, substitui o array inteiro
        // (mais eficiente que gerar patches por índice para arrays de combatentes, jogadores, etc.)
        const oldStr = JSON.stringify(oldObj);
        const newStr = JSON.stringify(newObj);
        if (oldStr !== newStr) {
            patches.push({ op: 'replace', path: basePath, value: newObj });
        }
        return patches;
    }

    // Objetos — diff profundo por chave
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
        const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
        const fullPath = `${basePath}/${escapedKey}`;

        if (!(key in oldObj)) {
            // Chave nova adicionada
            patches.push({ op: 'add', path: fullPath, value: newObj[key] });
        } else if (!(key in newObj)) {
            // Chave removida
            patches.push({ op: 'remove', path: fullPath });
        } else {
            // Chave existe em ambos — diff recursivo
            const subPatches = generatePatch(oldObj[key], newObj[key], fullPath);
            patches.push(...subPatches);
        }
    }

    return patches;
}

/**
 * Aplica um array de operações RFC 6902 a um objeto.
 * Retorna uma nova cópia do objeto com as alterações aplicadas.
 * 
 * @param {Object} target - Objeto alvo
 * @param {Array} patches - Array de operações [{op, path, value}]
 * @returns {Object} Novo objeto com patches aplicados
 */
export function applyPatch(target, patches) {
    if (!patches || patches.length === 0) return target;
    
    // Deep clone para evitar mutação
    let result;
    try {
        result = JSON.parse(JSON.stringify(target));
    } catch {
        result = { ...target };
    }

    for (const patch of patches) {
        try {
            _applyOp(result, patch);
        } catch (err) {
            console.warn(`[DeltaSync] Falha ao aplicar patch ${patch.op} em ${patch.path}:`, err.message);
        }
    }

    return result;
}

/**
 * Aplica uma única operação de patch ao objeto (mutação in-place).
 */
function _applyOp(obj, patch) {
    const { op, path, value } = patch;

    // Caso especial: path raiz
    if (path === '/' || path === '') {
        if (op === 'replace' && typeof value === 'object' && value !== null) {
            Object.keys(obj).forEach(k => delete obj[k]);
            Object.assign(obj, value);
        }
        return;
    }

    const segments = path.split('/').filter(Boolean).map(s => 
        s.replace(/~1/g, '/').replace(/~0/g, '~')
    );

    if (segments.length === 0) return;

    // Navega até o penúltimo segmento
    let current = obj;
    for (let i = 0; i < segments.length - 1; i++) {
        const seg = segments[i];
        if (current === null || current === undefined) return;
        
        if (Array.isArray(current)) {
            const idx = parseInt(seg, 10);
            if (isNaN(idx) || idx < 0 || idx >= current.length) return;
            current = current[idx];
        } else if (typeof current === 'object') {
            if (!(seg in current) && op === 'add') {
                current[seg] = {};
            }
            current = current[seg];
        } else {
            return;
        }
    }

    const lastSeg = segments[segments.length - 1];

    switch (op) {
        case 'add':
        case 'replace':
            if (Array.isArray(current)) {
                const idx = parseInt(lastSeg, 10);
                if (!isNaN(idx)) {
                    current[idx] = value;
                }
            } else if (typeof current === 'object' && current !== null) {
                current[lastSeg] = value;
            }
            break;
        case 'remove':
            if (Array.isArray(current)) {
                const idx = parseInt(lastSeg, 10);
                if (!isNaN(idx)) {
                    current.splice(idx, 1);
                }
            } else if (typeof current === 'object' && current !== null) {
                delete current[lastSeg];
            }
            break;
    }
}

/**
 * Verifica se um patch está vazio (nenhuma alteração).
 * @param {Array} patches 
 * @returns {boolean}
 */
export function isPatchEmpty(patches) {
    return !patches || patches.length === 0;
}

/**
 * Estima o tamanho em bytes de um patch (para logging/telemetria).
 * @param {Array} patches 
 * @returns {number}
 */
export function patchSize(patches) {
    if (!patches || patches.length === 0) return 0;
    try {
        return JSON.stringify(patches).length;
    } catch {
        return 0;
    }
}
