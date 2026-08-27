import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { CRDTManager } from '../core/CRDTManager.js';

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
                <div key={entry.id || entry.timestamp} style={{ textAlign: 'center', margin: '6px 0', animation: 'fadeIn 0.3s ease' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontStyle: 'italic', background: 'rgba(197,160,89,0.12)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(197,160,89,0.25)', display: 'inline-block' }}>
                        <i class="fa-solid fa-sparkles" style={{ marginRight: '4px' }}></i> {message}
                    </span>
                </div>
            );
        }
        
        if (isRoll) {
            const formula = entry.formula || '';
            const total = entry.total !== undefined && entry.total !== null ? entry.total : '🎲';
            const details = entry.details || '';
            return (
                <div key={entry.id || entry.timestamp} style={{ background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.08), rgba(15, 20, 15, 0.9))', border: '1px solid rgba(34, 197, 94, 0.35)', borderRadius: '10px', padding: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', animation: 'scaleUp 0.25s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><i class="fa-solid fa-dice-d20" style={{ color: 'var(--success)', marginRight: '4px' }}></i> <strong>{sender}</strong> rolou os dados</span>
                        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>🎲 Rolagem Arcana</span>
                    </div>
                    <div style={{ fontFamily: "'Cinzel'", fontSize: '1.1rem', color: 'var(--success)', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', border: '1px inset rgba(255,255,255,0.05)' }}>
                        {formula ? <><span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace', opacity: 0.85 }}>{formula}</span><br/></> : null}
                        <strong style={{ fontSize: '1.8rem', color: '#22c55e', textShadow: '0 0 15px rgba(34, 197, 94, 0.6)', display: 'inline-block', marginTop: '2px' }}>{total}</strong>
                    </div>
                    {details ? <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '6px', fontFamily: 'monospace' }}>{details}</div> : null}
                </div>
            );
        }

        return (
            <div key={entry.id || entry.timestamp} style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '3px solid var(--accent)', borderRadius: '0 8px 8px 0', padding: '8px 12px', animation: 'fadeInRight 0.2s ease' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', display: 'block', marginBottom: '3px', fontFamily: "'Cinzel'" }}>{sender}</span>
                <span style={{ fontSize: '0.92rem', color: '#f3f4f6', wordBreak: 'break-word', lineHeight: 1.4 }}>{message}</span>
            </div>
        );
    };

    return (
        <div id="chat-container" class="glass-accent" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: isExpanded ? '350px' : '60px',
            height: isExpanded ? '460px' : '60px',
            borderRadius: isExpanded ? '16px' : '50%',
            boxShadow: '0 12px 35px rgba(0,0,0,0.85), 0 0 15px rgba(197, 160, 89, 0.25)',
            border: '1px solid rgba(197, 160, 89, 0.5)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: isExpanded ? 'rgba(15, 12, 18, 0.75)' : 'var(--accent)',
            backdropFilter: 'blur(12px)'
        }}>
            {!isExpanded ? (
                <button 
                    id="chat-toggle" 
                    onClick={toggleExpand} 
                    class="btn btn-ghost" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'transform 0.2s' }} 
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <i class="fa-solid fa-comment-dots"></i>
                </button>
            ) : (
                <>
                    <div style={{ background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.2), rgba(0,0,0,0.8))', padding: '12px 16px', borderBottom: '1px solid rgba(197, 160, 89, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontFamily: "'Cinzel'", margin: 0, color: 'var(--accent)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i class="fa-solid fa-dice-d20" style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 5px rgba(197,160,89,0.5))' }}></i> 
                            Chat Arcana
                        </h4>
                        <button onClick={toggleExpand} class="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <i class="fa-solid fa-chevron-down"></i>
                        </button>
                    </div>
                    
                    <div id="chat-history" ref={historyRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', scrollbarWidth: 'thin', scrollBehavior: 'smooth' }}>
                        {log.map(entry => renderMessage(entry))}
                    </div>
                    
                    <div style={{ padding: '12px', borderTop: '1px solid rgba(197, 160, 89, 0.3)', background: 'rgba(0,0,0,0.5)' }}>
                        <form id="chat-form" onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', margin: 0 }}>
                            <input 
                                type="text" 
                                name="message" 
                                id="chat-input" 
                                ref={inputRef}
                                placeholder="/roll 1d20+FOR..." 
                                autoComplete="off" 
                                style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(197, 160, 89, 0.4)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s, background 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }} 
                                onFocus={e => Object.assign(e.currentTarget.style, {background: 'rgba(255,255,255,0.12)', borderColor: 'var(--accent)'})} 
                                onBlur={e => Object.assign(e.currentTarget.style, {background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(197, 160, 89, 0.4)'})} 
                            />
                            <button 
                                type="submit" 
                                class="btn btn-primary btn-sm" 
                                style={{ padding: '0 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d4af37, #b38b2d)', color: '#0a0c10', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', transition: 'transform 0.2s' }} 
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
