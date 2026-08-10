import { Component } from '../core/Component.js';
import { html } from 'htm/preact';
import { RulesEngine } from '../../core/RulesEngine.js';
import { CRDTManager } from '../core/CRDTManager.js';

/**
 * Componente Global de Chat da Mesa Virtual Avançada (v15.9 Reativo & Unificado)
 * Refatorado para usar exclusivamente o CRDTManager (Yjs) como única fonte de verdade.
 */
export class ChatBox extends Component {
    constructor(opts) {
        super(opts);
        this._isExpanded = false;
        this._connected = false;
        
        // Single Source of Truth: Yjs Array
        if (CRDTManager && CRDTManager.chatHistory) {
            CRDTManager.chatHistory.observe(() => {
                this.render();
                this._scrollToBottom();
            });
        }
    }

    onMount() {
        if (!this._connected && CRDTManager) {
            this._connected = true;
            const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || 'global';
            CRDTManager.connect(activeTable);
        }
        
        // Se já abriu carregado, scrolla pra baixo
        if (this._isExpanded) {
            this._scrollToBottom();
        }
    }

    _scrollToBottom() {
        // Debounce simples para garantir que o DOM renderizou
        setTimeout(() => {
            if (this.element) {
                const history = this.element.querySelector('#chat-history');
                if (history) history.scrollTop = history.scrollHeight;
            }
        }, 10);
    }

    _toggleExpand() {
        this._isExpanded = !this._isExpanded;
        this.render();
        
        if (this._isExpanded) {
            this._scrollToBottom();
            setTimeout(() => {
                const input = this.element?.querySelector('#chat-input');
                if (input) input.focus();
            }, 50);
        }
    }

    _onSubmit(e) {
        e.preventDefault();
        const input = e.currentTarget.querySelector('#chat-input');
        if (!input || !input.value.trim()) return;
        
        this._handleMessage(input.value.trim());
        input.value = '';
    }

    template() {
        // Lemos os dados diretamente de Yjs. O Yjs é ordenado e sincronizado. 
        // Não há necessidade de O(N) com Set() para desduplicar, a menos que alguém force um array quebrado.
        const rawLog = CRDTManager?.chatHistory ? CRDTManager.chatHistory.toArray() : [];
        const log = rawLog.length > 0 ? rawLog.slice(-50) : [{ 
            id: 'sys_msg', 
            sender: 'Sistema', 
            message: 'Grimórios conectados via Y-Websocket. Sincronização offline-first ativa! Digite /roll 1d20+FOR para rolar dados.', 
            isSystem: true 
        }];

        return html`
            <div id="chat-container" class="glass-accent" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${this._isExpanded ? '350px' : '60px'};
                height: ${this._isExpanded ? '460px' : '60px'};
                border-radius: ${this._isExpanded ? '16px' : '50%'};
                box-shadow: 0 12px 35px rgba(0,0,0,0.85), 0 0 15px rgba(197, 160, 89, 0.25);
                border: 1px solid rgba(197, 160, 89, 0.5);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: ${this._isExpanded ? 'rgba(15, 12, 18, 0.75)' : 'var(--accent)'};
                backdrop-filter: blur(12px);
            ">
                ${this._isExpanded ? this._renderExpanded(log) : this._renderCollapsed()}
            </div>
        `;
    }

    _renderCollapsed() {
        return html`
            <button id="chat-toggle" onClick=${() => this._toggleExpand()} class="btn btn-ghost" style="width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; color: #fff; font-size: 1.5rem; padding: 0; border: none; background: transparent; cursor: pointer; transition: transform 0.2s;" onMouseOver=${e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut=${e => e.currentTarget.style.transform = 'scale(1)'}>
                <i class="fa-solid fa-comment-dots"></i>
            </button>
        `;
    }

    _renderExpanded(log) {
        return html`
            <div style="background: linear-gradient(135deg, rgba(197, 160, 89, 0.2), rgba(0,0,0,0.8)); padding: 12px 16px; border-bottom: 1px solid rgba(197, 160, 89, 0.3); display: flex; justify-content: space-between; align-items: center;">
                <h4 style="font-family: 'Cinzel'; margin: 0; color: var(--accent); font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-dice-d20" style="color: var(--accent); filter: drop-shadow(0 0 5px rgba(197,160,89,0.5));"></i> 
                    Chat Arcana
                </h4>
                <button onClick=${() => this._toggleExpand()} class="btn btn-ghost btn-sm" style="padding: 4px 8px; color: var(--text-dim); background: transparent; border: none; cursor: pointer;">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
            
            <div id="chat-history" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin; scroll-behavior: smooth;">
                ${log.map(entry => this._renderMessage(entry))}
            </div>
            
            <div style="padding: 12px; border-top: 1px solid rgba(197, 160, 89, 0.3); background: rgba(0,0,0,0.5);">
                <form id="chat-form" onSubmit=${(e) => this._onSubmit(e)} style="display: flex; gap: 8px; margin: 0;">
                    <input type="text" name="message" id="chat-input" placeholder="/roll 1d20+FOR..." autocomplete="off" style="flex: 1; background: rgba(255,255,255,0.08); border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s, background 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);" onFocus=${e => Object.assign(e.currentTarget.style, {background: 'rgba(255,255,255,0.12)', borderColor: 'var(--accent)'})} onBlur=${e => Object.assign(e.currentTarget.style, {background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(197, 160, 89, 0.4)'})} />
                    <button type="submit" class="btn btn-primary btn-sm" style="padding: 0 16px; border-radius: 8px; border: none; background: linear-gradient(135deg, #d4af37, #b38b2d); color: #0a0c10; cursor: pointer; font-weight: 800; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: transform 0.2s;" onMouseOver=${e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut=${e => e.currentTarget.style.transform = 'scale(1)'}>
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        `;
    }

    _renderMessage(entry) {
        if (!entry) return null;
        const isSystem = entry.isSystem || entry.tipo === 'sistema';
        const isRoll = entry.isRoll || entry.tipo === 'rolagem';
        const sender = entry.sender || entry.nome || entry.de || (isSystem ? 'Sistema' : 'Aventureiro');
        const message = entry.message !== undefined ? entry.message : (entry.conteudo !== undefined ? entry.conteudo : '');

        if (isSystem) {
            return html`
                <div style="text-align: center; margin: 6px 0; animation: fadeIn 0.3s ease;" key=${entry.id}>
                    <span style="font-size: 0.75rem; color: var(--accent); font-style: italic; background: rgba(197,160,89,0.12); padding: 4px 12px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.25); display: inline-block;">
                        <i class="fa-solid fa-sparkles" style="margin-right: 4px;"></i> ${message}
                    </span>
                </div>
            `;
        }
        
        if (isRoll) {
            const formula = entry.formula || '';
            const total = entry.total !== undefined && entry.total !== null ? entry.total : '🎲';
            const details = entry.details || '';
            return html`
                <div style="background: linear-gradient(145deg, rgba(34, 197, 94, 0.08), rgba(15, 20, 15, 0.9)); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 10px; padding: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); animation: scaleUp 0.25s ease;" key=${entry.id}>
                    <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span><i class="fa-solid fa-dice-d20" style="color: var(--success); margin-right: 4px;"></i> <strong>${sender}</strong> rolou os dados</span>
                        <span style="font-size: 0.65rem; opacity: 0.7;">🎲 Rolagem Arcana</span>
                    </div>
                    <div style="font-family: 'Cinzel'; font-size: 1.1rem; color: var(--success); text-align: center; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; border: 1px inset rgba(255,255,255,0.05);">
                        ${formula ? html`<span style="font-size: 0.8rem; color: var(--text-main); font-family: monospace; opacity: 0.85;">${formula}</span><br/>` : null}
                        <strong style="font-size: 1.8rem; color: #22c55e; text-shadow: 0 0 15px rgba(34, 197, 94, 0.6); display: inline-block; margin-top: 2px;">${total}</strong>
                    </div>
                    ${details ? html`<div style="font-size: 0.75rem; color: var(--text-dim); text-align: center; margin-top: 6px; font-family: monospace;">${details}</div>` : null}
                </div>
            `;
        }

        return html`
            <div style="background: rgba(255,255,255,0.04); border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; padding: 8px 12px; animation: fadeInRight 0.2s ease;" key=${entry.id}>
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: bold; display: block; margin-bottom: 3px; font-family: 'Cinzel';">${sender}</span>
                <span style="font-size: 0.92rem; color: #f3f4f6; word-break: break-word; line-height: 1.4;">${message}</span>
            </div>
        `;
    }

    _handleMessage(text) {
        const hero = this.store.state.currentHero || { name: 'Mestre', attributes: {} };
        const sender = hero.name || 'Desconhecido';
        const timestamp = Date.now();
        const id = crypto.randomUUID ? crypto.randomUUID() : timestamp.toString();
        
        let newEntry = {
            id,
            timestamp,
            sender,
            message: text,
            isSystem: false,
            isRoll: false,
            tipo: 'geral',
            nome: sender,
            de: sender,
            para: 'todos',
            conteudo: text,
            avatar: ''
        };

        // Parsa comando de rolagem (/roll ou /r)
        if (text.startsWith('/roll ') || text.startsWith('/r ')) {
            const expression = text.replace(/^\/(roll|r)\s+/i, '');
            try {
                const result = RulesEngine.resolveFormula(expression, hero.attributes || {});
                
                newEntry.isRoll = true;
                newEntry.tipo = 'rolagem';
                newEntry.formula = result.formula;
                newEntry.total = result.total;
                newEntry.details = `[${result.rolls.join(', ')}] + MOD`;
                
                if (result.isCrit) newEntry.details += " 🎯 CRÍTICO!";
                if (result.isFumble) newEntry.details += " 💀 FALHA CRÍTICA!";
                
            } catch (err) {
                newEntry = {
                    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                    timestamp: Date.now(),
                    sender: 'Sistema',
                    message: `Erro na rolagem: ${err.message}`,
                    isSystem: true,
                    tipo: 'sistema'
                };
            }
        }

        if (CRDTManager && CRDTManager.chatHistory) {
            CRDTManager.chatHistory.push([newEntry]);
            
            // Limpeza leve de histórico offline de forma passiva 
            // Apenas o Mestre (Host) realiza a limpeza para evitar race conditions no CRDT
            if (localStorage.getItem('DM_ACTIVE_TABLE') && CRDTManager.chatHistory.length > 250) {
                // Em vez de fatiar brutalmente síncrono e forçar eventos a todos instantaneamente
                setTimeout(() => {
                    if (CRDTManager.chatHistory.length > 250) {
                         CRDTManager.chatHistory.delete(0, CRDTManager.chatHistory.length - 200);
                    }
                }, 5000);
            }
        }
        
        // Emissão e Fallback REST removidos! Y-Websocket cuida da rede com 100% de confiança.
    }
}

