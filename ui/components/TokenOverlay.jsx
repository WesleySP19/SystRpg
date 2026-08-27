/**
 * TokenOverlay - Displays a single token's overlay info (HP bar, status, name).
 * Used inside CombatArena for per-token rendering.
 */
export function TokenOverlay({ token, isActive = false }) {
    if (!token) return null;
    
    const hpPct = Math.round((token.hp.current / token.hp.max) * 100);
    const hpColor = hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444';

    return (
        <div class="token-overlay flex flex-col items-center gap-[2px] absolute pointer-events-none">
            <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.6rem',
                fontWeight: 800,
                color: isActive ? 'var(--accent)' : '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap'
            }}>
                {token.name}
            </div>
            
            <div style={{
                width: '40px',
                height: '4px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '2px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, hpPct))}%`,
                    background: hpColor,
                    transition: 'width 0.3s ease'
                }}></div>
            </div>
            
            {token.conditions && token.conditions.length > 0 && (
                <div style={{ fontSize: '0.7rem', marginTop: '1px' }}>
                    {token.conditions.slice(0, 3).join('')}
                </div>
            )}
        </div>
    );
}
