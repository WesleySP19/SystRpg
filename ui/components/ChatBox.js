import { Component } from '../core/Component.js';
import { RulesEngine } from '../../core/RulesEngine.js';

/**
 * Componente Global de Chat da Mesa Virtual Avançada
 * Fica fixo no canto da tela, permitindo aos jogadores executarem `/roll` 
 * utilizando os atributos dinâmicos providos pelo motor multissistema.
 */
export class ChatBox extends Component {
    constructor(opts) {
        super(opts);
        this.state = this.store.state;
        
        // Inicializa o log no state se não existir
        if (!this.state.chatLog) {
            this.store.update(s => {
                s.chatLog = [
                    { 
                        id: Date.now(), 
                        sender: 'Sistema', 
                        message: 'Grimórios conectados. Digite /roll 1d20+STR para rolar dados usando a ficha ativa!', 
                        isSystem: true 
                    }
                ];
            });
        }
        
        this._isExpanded = false;
    }

    template() {
        const log = this.state.chatLog || [];
        
        // O ChatBox renderiza um botão flutuante e um painel de chat
        return `
            <div id="chat-container" class="glass-accent" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${this._isExpanded ? '350px' : '60px'};
                height: ${this._isExpanded ? '450px' : '60px'};
                border-radius: ${this._isExpanded ? '12px' : '50%'};
                box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                border: 1px solid rgba(197, 160, 89, 0.4);
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: ${this._isExpanded ? 'rgba(15, 12, 16, 0.95)' : 'var(--accent)'};
            ">
                ${this._isExpanded ? this._renderExpanded(log) : this._renderCollapsed()}
            </div>
        `;
    }

    _renderCollapsed() {
        return `
            <button id="chat-toggle" class="btn btn-ghost" style="width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; color: #fff; font-size: 1.5rem; padding: 0;">
                <i class="fa-solid fa-comment-dots"></i>
            </button>
        `;
    }

    _renderExpanded(log) {
        return `
            <div style="background: rgba(0,0,0,0.5); padding: 10px 15px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); display: flex; justify-content: space-between; align-items: center;">
                <h4 style="font-family: 'Cinzel'; margin: 0; color: var(--accent); font-size: 1rem;"><i class="fa-solid fa-dice-d20"></i> Chat Arcana</h4>
                <button id="chat-toggle" class="btn btn-ghost btn-sm" style="padding: 2px 8px; color: var(--text-dim);"><i class="fa-solid fa-chevron-down"></i></button>
            </div>
            
            <div id="chat-history" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin;">
                ${log.map(entry => this._renderMessage(entry)).join('')}
            </div>
            
            <div style="padding: 10px; border-top: 1px solid rgba(197, 160, 89, 0.2); background: rgba(0,0,0,0.3);">
                <form id="chat-form" style="display: flex; gap: 8px;">
                    <input type="text" name="message" id="chat-input" placeholder="/roll 1d20+FOR..." autocomplete="off" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 0.9rem;" />
                    <button type="submit" class="btn btn-primary btn-sm" style="padding: 0 12px;"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>
        `;
    }

    _renderMessage(entry) {
        if (entry.isSystem) {
            return `
                <div style="text-align: center; margin: 5px 0;">
                    <span style="font-size: 0.75rem; color: var(--accent); font-style: italic; background: rgba(197,160,89,0.1); padding: 3px 10px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.2);">${entry.message}</span>
                </div>
            `;
        }
        
        if (entry.isRoll) {
            return `
                <div style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 8px; padding: 10px;">
                    <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 4px;"><strong>${entry.sender}</strong> rolou os dados</div>
                    <div style="font-family: 'Cinzel'; font-size: 1.1rem; color: var(--success); text-align: center;">
                        <span style="font-size: 0.8rem; color: var(--text-main); font-family: monospace;">${entry.formula}</span> 
                        <br/>
                        <strong style="font-size: 1.5rem; text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);">${entry.total}</strong>
                    </div>
                    ${entry.details ? `<div style="font-size: 0.7rem; color: var(--text-dim); text-align: center; margin-top: 4px;">${entry.details}</div>` : ''}
                </div>
            `;
        }

        return `
            <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 8px 12px;">
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: bold; display: block; margin-bottom: 2px;">${entry.sender}</span>
                <span style="font-size: 0.9rem; color: #fff;">${entry.message}</span>
            </div>
        `;
    }

    onMount() {
        if (!this.element) return;
        
        const toggleBtn = this.element.querySelector('#chat-toggle');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                this._isExpanded = !this._isExpanded;
                this.render();
                
                // Scroll para o fim se expandiu
                if (this._isExpanded) {
                    setTimeout(() => {
                        const history = this.element.querySelector('#chat-history');
                        if (history) history.scrollTop = history.scrollHeight;
                        const input = this.element.querySelector('#chat-input');
                        if (input) input.focus();
                    }, 50);
                }
            };
        }

        const form = this.element.querySelector('#chat-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const input = form.querySelector('#chat-input');
                if (!input.value.trim()) return;
                
                this._handleMessage(input.value.trim());
                input.value = '';
            };
        }
    }
    
    // Atualiza o scroll e preserva o estado expandido ao re-renderizar devido a atualizações na store
    render() {
        super.render();
        if (this._isExpanded) {
            const history = this.element?.querySelector('#chat-history');
            if (history) history.scrollTop = history.scrollHeight;
        }
    }

    _handleMessage(text) {
        const hero = this.state.currentHero || { name: 'Mestre', attributes: {} };
        const sender = hero.name || 'Desconhecido';
        
        let newEntry = {
            id: Date.now(),
            sender: sender,
            message: text,
            isSystem: false,
            isRoll: false
        };

        // Parsa comando de rolagem (/roll ou /r)
        if (text.startsWith('/roll ') || text.startsWith('/r ')) {
            const expression = text.replace(/^\/(roll|r)\s+/i, '');
            try {
                // Tenta resolver com os atributos do herói logado usando RulesEngine
                const result = RulesEngine.resolveFormula(expression, hero.attributes || {});
                
                newEntry.isRoll = true;
                newEntry.formula = result.formula;
                newEntry.total = result.total;
                newEntry.details = `[${result.rolls.join(', ')}] + MOD`;
                
                if (result.isCrit) newEntry.details += " 🎯 CRÍTICO!";
                if (result.isFumble) newEntry.details += " 💀 FALHA CRÍTICA!";
                
            } catch (err) {
                // Se a expressão falhar, envia como mensagem de erro do sistema
                newEntry = {
                    id: Date.now(),
                    sender: 'Sistema',
                    message: `Erro na rolagem: ${err.message}`,
                    isSystem: true
                };
            }
        }

        this.store.update(s => {
            if (!s.chatLog) s.chatLog = [];
            s.chatLog.push(newEntry);
            
            // Limita o histórico para não pesar a memória (últimas 50 msgs)
            if (s.chatLog.length > 50) s.chatLog.shift();
        });
    }
}
