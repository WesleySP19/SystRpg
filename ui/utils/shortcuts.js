/**
 * GLOBAL KEYBOARD SHORTCUTS MANAGER v15.9 (Scalability)
 * Enhances DM workflow with composite asynchronous macros.
 */
import { AIService } from '../../services/AIService.js';

export function initGlobalShortcuts(store) {
    const ai = new AIService();

    window.addEventListener('keydown', async (e) => {
        // Ignore keypresses inside input fields, textareas or contenteditables
        const targetTag = e.target.tagName?.toLowerCase();
        if (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable) {
            return;
        }

        const key = e.key.toLowerCase();

        // ----------------------------------------------------
        // MACROS ASSÍNCRONAS COMPOSTAS (V15.9) - Worker Offloading
        // ----------------------------------------------------
        
        // Shift + T: Analisador Tático Automático
        if (key === 't' && e.shiftKey) {
            e.preventDefault();
            const activeId = store.state?.battle?.activeEntityId;
            if (activeId) {
                if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', 'IA tática analisando alvo...');
                // O processamento ocorre no Web Worker, sem dropar frames da UI
                const advice = await ai.ask(`Forneça 1 tática de combate brutal em 1 linha para a entidade ID ${activeId}`);
                if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', `🎲 **Conselho Tático:** ${advice}`);
            } else {
                if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', 'Nenhuma criatura ativa no tracker.');
            }
            return;
        }

        // Shift + O: Consulta Rápida ao Oráculo em Background
        if (key === 'o' && e.shiftKey) {
            e.preventDefault();
            const query = prompt("🔮 Oráculo Arcano: O que desejas consultar?");
            if (query) {
                if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', `Enviando oração aos deuses por: "${query}"...`);
                // Busca RAG massiva processada no Web Worker
                const answer = await ai.oracleSearch(query, store);
                if (window.TOME?.events) window.TOME.events.emit('CHAT_SYSTEM', answer);
            }
            return;
        }

        // ----------------------------------------------------
        // ATALHOS CLÁSSICOS DE NAVEGAÇÃO RÁPIDA
        // ----------------------------------------------------

        // Key 'd': Toggle Floating Dice Roller
        if (key === 'd' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            const tray = document.getElementById('dice-tray');
            if (tray) {
                tray.classList.toggle('active');
                e.preventDefault();
            }
        }
        // Key 'w': Switch to Split Workspace (Central do Mestre)
        else if (key === 'w' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            store.update(s => s.activeTab = 'workspace');
            e.preventDefault();
        }
        // Key 'm': Switch to Map
        else if (key === 'm' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            store.update(s => s.activeTab = 'map');
            e.preventDefault();
        }
        // Key 'c': Switch to Combat Tracker
        else if (key === 'c' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            store.update(s => s.activeTab = 'combat');
            e.preventDefault();
        }
        // Key 'b': Switch to Bestiary
        else if (key === 'b' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            store.update(s => s.activeTab = 'bestiary');
            e.preventDefault();
        }
    });
}

