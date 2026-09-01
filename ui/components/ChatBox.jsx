import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { CRDTManager } from '../core/CRDTManager.js';
import { Button } from './core/Button.jsx';
import { Input } from './core/Input.jsx';

/**
 * Componente Global de Chat da Mesa Virtual Avançada (v15.9 Reativo & Unificado)
 * Refatorado para usar exclusivamente o CRDTManager (Yjs) como única fonte de verdade.
 */
export function ChatBox() {
    const storeState = useStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [log, setLog] = useState([]);
    
    const historyRef = useRef(null);
    const inputRef = useRef(null);
    const connectedRef = useRef(false);

    useEffect(() => {
        if (!connectedRef.current && CRDTManager) {
            connectedRef.current = true;
            const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || 'global';
            CRDTManager.connect(activeTable);
        }

        const handleChatChange = () => {
            const rawLog = CRDTManager?.chatHistory ? CRDTManager.chatHistory.toArray() : [];
            const newLog = rawLog.length > 0 ? rawLog.slice(-50) : [{ 
                id: 'sys_msg', 
                sender: 'Sistema', 
                message: 'Grimórios conectados via Y-Websocket. Sincronização offline-first ativa! Digite /roll 1d20+FOR para rolar dados.', 
                isSystem: true 
            }];
            setLog(newLog);
            scrollToBottom();
        };

        if (CRDTManager && CRDTManager.chatHistory) {
            CRDTManager.chatHistory.observe(handleChatChange);
            handleChatChange(); // initial load
        }
    }, []);

    useEffect(() => {
        if (isExpanded) {
            scrollToBottom();
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 50);
        }
    }, [isExpanded]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (historyRef.current) {
                historyRef.current.scrollTop = historyRef.current.scrollHeight;
            }
        }, 10);
    };

    const toggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const input = inputRef.current;
        if (!input || !input.value.trim()) return;
        
        handleMessage(input.value.trim());
        input.value = '';
    };

    const handleMessage = (text) => {
        const hero = storeState?.currentHero || { name: 'Mestre', attributes: {} };
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
            
            if (localStorage.getItem('DM_ACTIVE_TABLE') && CRDTManager.chatHistory.length > 250) {
                setTimeout(() => {
                    if (CRDTManager.chatHistory.length > 250) {
                         CRDTManager.chatHistory.delete(0, CRDTManager.chatHistory.length - 200);
                    }
                }, 5000);
            }
        }
    };

    const renderMessage = (entry) => {
        if (!entry) return null;
        const isSystem = entry.isSystem || entry.tipo === 'sistema';
        const isRoll = entry.isRoll || entry.tipo === 'rolagem';
        const sender = entry.sender || entry.nome || entry.de || (isSystem ? 'Sistema' : 'Aventureiro');
        const message = entry.message !== undefined ? entry.message : (entry.conteudo !== undefined ? entry.conteudo : '');

        if (isSystem) {
            return (
                <div key={entry.id || entry.timestamp} className="text-center my-1.5 animate-fadeIn">
                    <span className="text-xs text-accent italic bg-accent/10 px-3 py-1 rounded-xl border border-accent/25 inline-block">
                        <i class="fa-solid fa-sparkles mr-1"></i> {message}
                    </span>
                </div>
            );
        }
        
        if (isRoll) {
            const formula = entry.formula || '';
            const total = entry.total !== undefined && entry.total !== null ? entry.total : '🎲';
            const details = entry.details || '';
            return (
                <div key={entry.id || entry.timestamp} className="bg-gradient-to-br from-green-500/10 to-black/90 border border-green-500/35 rounded-xl p-3 shadow-lg animate-scaleUp">
                    <div className="text-xs text-slate-400 mb-1.5 flex justify-between items-center">
                        <span><i class="fa-solid fa-dice-d20 text-success mr-1"></i> <strong>{sender}</strong> rolou os dados</span>
                        <span className="text-[0.65rem] opacity-70">🎲 Rolagem Arcana</span>
                    </div>
                    <div className="font-cinzel text-lg text-success text-center bg-black/30 p-2 rounded-md border border-white/5">
                        {formula ? <><span className="text-sm text-white font-mono opacity-85">{formula}</span><br/></> : null}
                        <strong className="text-3xl text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)] inline-block mt-0.5">{total}</strong>
                    </div>
                    {details ? <div className="text-xs text-slate-400 text-center mt-1.5 font-mono">{details}</div> : null}
                </div>
            );
        }

        return (
            <div key={entry.id || entry.timestamp} className="bg-white/5 border-l-4 border-l-accent rounded-r-lg p-2.5 animate-fadeInRight">
                <span className="text-xs text-accent font-bold block mb-1 font-cinzel">{sender}</span>
                <span className="text-[0.92rem] text-gray-100 break-words leading-relaxed">{message}</span>
            </div>
        );
    };

    return (
        <div id="chat-container" className={`glass-accent fixed bottom-5 right-5 z-[9999] flex flex-col overflow-hidden backdrop-blur-md shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_15px_rgba(197,160,89,0.25)] border border-accent/50 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isExpanded ? 'w-[350px] h-[460px] rounded-2xl bg-[#0f0c12]/75' : 'w-[60px] h-[60px] rounded-full bg-accent'}`}>
            {!isExpanded ? (
                <Button 
                    id="chat-toggle" 
                    onClick={toggleExpand} 
                    className="w-full h-full rounded-full p-0 bg-transparent text-white text-2xl hover:scale-110 border-none"
                    icon="fa-comment-dots"
                    variant="ghost"
                />
            ) : (
                <>
                    <div className="bg-gradient-to-br from-accent/20 to-black/80 px-4 py-3 border-b border-accent/30 flex justify-between items-center">
                        <h4 className="font-cinzel m-0 text-accent text-base flex items-center gap-2">
                            <i class="fa-solid fa-dice-d20 text-accent drop-shadow-[0_0_5px_rgba(197,160,89,0.5)]"></i> 
                            Chat Arcana
                        </h4>
                        <Button 
                            onClick={toggleExpand} 
                            variant="ghost" 
                            size="icon" 
                            icon="fa-chevron-down" 
                            className="text-slate-400 hover:text-white"
                        />
                    </div>
                    
                    <div id="chat-history" ref={historyRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5 custom-scrollbar scroll-smooth">
                        {log.map(entry => renderMessage(entry))}
                    </div>
                    
                    <div className="p-3 border-t border-accent/30 bg-black/50">
                        <form id="chat-form" onSubmit={handleSubmit} className="flex gap-2 m-0">
                            <Input 
                                type="text" 
                                name="message" 
                                id="chat-input" 
                                ref={inputRef}
                                placeholder="/roll 1d20+FOR..." 
                                autoComplete="off" 
                                className="flex-1"
                            />
                            <Button 
                                type="submit" 
                                variant="primary"
                                icon="fa-paper-plane"
                                className="px-4 text-lg bg-gradient-to-br from-[#d4af37] to-[#b38b2d] text-[#0a0c10] shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:scale-105"
                            />
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
