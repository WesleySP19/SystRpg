import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';

export function useHeroData() {
    const players = useStore('players') || [];
    const editingHeroId = useStore('editingHeroId');
    
    // Rascunho para criação de novos heróis
    const [draftData, setDraftData] = useState({});

    // Encontrar o herói atual sendo editado, se houver
    const editingPlayer = editingHeroId ? players.find(p => p.id === editingHeroId) : null;
    const heroData = editingPlayer || draftData;

    const updateHero = (newData) => {
        if (editingHeroId) {
            // Atualiza o herói existente via dispatch
            TOME.store.dispatch('updatePlayer', { id: editingHeroId, updates: newData });
        } else {
            // Atualiza o rascunho local
            setDraftData(prev => ({ ...prev, ...newData }));
        }
    };

    return {
        heroData,
        isEditing: !!editingHeroId,
        updateHero,
        draftData,
        setDraftData
    };
}
