import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';

/**
 * CharacterEditor – simple form to edit a hero's stats.
 * Integrated into Dashboard via tab 'character'.
 */
export function CharacterEditor() {
    const storeState = useStore();
    const currentHero = storeState?.currentHero || {};

    const [name, setName] = useState(currentHero.name || '');
    const [cls, setCls] = useState(currentHero.cls || '');
    const [hpMax, setHpMax] = useState(currentHero.hp?.max || 0);
    const [hpCurrent, setHpCurrent] = useState(currentHero.hp?.current || 0);

    // Update state when currentHero changes
    useEffect(() => {
        setName(currentHero.name || '');
        setCls(currentHero.cls || '');
        setHpMax(currentHero.hp?.max || 0);
        setHpCurrent(currentHero.hp?.current || 0);
    }, [currentHero]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const hero = {
            ...currentHero,
            name: name,
            cls: cls,
            hp: { max: Number(hpMax), current: Number(hpCurrent) }
        };
        
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                const idx = (s.players || []).findIndex(p => p.id === hero.id);
                if (idx >= 0) {
                    s.players[idx] = hero;
                } else {
                    s.players = s.players || [];
                    s.players.push(hero);
                }
                s.currentHero = hero;
                s.activeTab = 'dashboard';
            });
        }
    };

    return (
        <div class="card glass-accent" style={{ padding: '30px', maxWidth: '600px', margin: 'auto' }}>
            <h2 style={{ fontFamily: 'Cinzel', color: 'var(--accent)', textAlign: 'center' }}>🧙‍♂️ Editor de Personagem</h2>
            <form id="char-form" onSubmit={handleSubmit}>
                <div class="form-group" style={{ marginBottom: '15px' }}>
                    <label>Nome</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        value={name} 
                        onInput={(e) => setName(e.target.value)}
                        required 
                    />
                </div>
                <div class="form-group" style={{ marginBottom: '15px' }}>
                    <label>Classe</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        value={cls} 
                        onInput={(e) => setCls(e.target.value)} 
                    />
                </div>
                <div class="form-group" style={{ marginBottom: '15px' }}>
                    <label>HP Máximo</label>
                    <input 
                        type="number" 
                        class="form-control" 
                        value={hpMax} 
                        onInput={(e) => setHpMax(e.target.value)}
                        min="0" 
                    />
                </div>
                <div class="form-group" style={{ marginBottom: '15px' }}>
                    <label>HP Atual</label>
                    <input 
                        type="number" 
                        class="form-control" 
                        value={hpCurrent} 
                        onInput={(e) => setHpCurrent(e.target.value)}
                        min="0" 
                    />
                </div>
                <button type="submit" class="btn btn-primary btn-block">Salvar</button>
            </form>
        </div>
    );
}
