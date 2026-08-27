import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
export function useHeroData() {
const players = useStore('players') || [];
const editingHeroId = useStore('editingHeroId');
const [draftData, setDraftData] = useState({});
const editingPlayer = editingHeroId ? players.find(p => p.id === editingHeroId) : null;
const heroData = editingPlayer || draftData;
const updateHero = (newData) => {
if (editingHeroId) {
TOME.store.dispatch('updatePlayer', { id: editingHeroId, updates: newData });
} else {
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