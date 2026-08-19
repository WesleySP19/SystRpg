import { useCombat } from '../../hooks/useCombat.js';
import { CombatControls } from './CombatControls.jsx';
import { CombatantListV19 } from './CombatantListV19.jsx';

/**
 * COMBAT TRACKER V21.0.0 — "The Atomic Engine"
 * Full React Hooks architecture with glassmorphism aesthetics.
 */
export function CombatTrackerV19() {
    const { combatants, turnIndex, combatRound } = useCombat();

    return (
        <div className="page" style={{ maxWidth: '1500px', paddingBottom: '100px', animation: 'fadeIn 0.3s ease-out' }}>
            {/* ARENA HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '25px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '100px', background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>
                <h1 style={{ fontFamily: "'Cinzel'", fontSize: '3rem', color: 'var(--text-main)', margin: 0, textShadow: '0 5px 20px rgba(212,175,55,0.4)', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <i className="fa-solid fa-khanda" style={{ color: 'var(--accent)', fontSize: '2.4rem' }}></i>
                    TOME ARENA <span style={{ fontSize: '1.2rem', color: 'var(--accent)', opacity: 0.8, marginTop: '15px' }}>V21.0.0</span>
                    <i className="fa-solid fa-khanda fa-flip-horizontal" style={{ color: 'var(--accent)', fontSize: '2.4rem' }}></i>
                </h1>
                <div style={{ fontSize: '1rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '6px', fontWeight: 800, marginTop: '5px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                    Rodada {combatRound}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* LEFT PANEL (Controls) */}
                <div style={{ position: 'sticky', top: '20px', background: 'rgba(10,12,16,0.6)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.6)' }}>
                    <CombatControls />
                </div>
                
                {/* MAIN ARENA (Initiative Queue) */}
                <div style={{ background: 'rgba(15,20,28,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(197,160,89,0.15)', borderRadius: '24px', padding: '35px', boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.4)', minHeight: '600px', position: 'relative', overflow: 'hidden' }}>
                    {/* Glow decorativo de fundo */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                    <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <CombatantListV19 />
                    </div>
                </div>
            </div>
        </div>
    );
}
