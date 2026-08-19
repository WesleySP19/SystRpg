import { useState, useMemo } from 'preact/hooks';
import spellsData from '../../data/spells-5e.js';

export function useSpells() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterLevel, setFilterLevel] = useState('all');
    const [activeSpellTab, setActiveSpellTab] = useState('spells'); // 'spells' | 'cantrips'

    const allSpells = useMemo(() => {
        const index = [];

        // Adiciona todos os truques (cantrips)
        spellsData.cantrips?.forEach(cantrip => {
            index.push({
                ...cantrip,
                level: 0,
                sortKey: `0_${cantrip.name}`
            });
        });

        // Adiciona todas as magias por nível
        Object.entries(spellsData.spellsByLevel || {}).forEach(([level, spells]) => {
            spells?.forEach(spell => {
                index.push({
                    ...spell,
                    sortKey: `${spell.level}_${spell.name}`
                });
            });
        });

        return index.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });
    }, []);

    const filteredSpells = useMemo(() => {
        return allSpells.filter(spell => {
            // Separação por aba principal
            if (activeSpellTab === 'cantrips' && spell.level > 0) return false;
            if (activeSpellTab === 'spells' && spell.level === 0) return false;

            // Busca textual
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = spell.name.toLowerCase().includes(q);
                const matchDesc = spell.description?.toLowerCase().includes(q);
                if (!matchName && !matchDesc) return false;
            }

            // Filtro por Classe
            if (filterClass !== 'all') {
                if (!spell.classes || !spell.classes.includes(filterClass)) return false;
            }

            // Filtro por Escola/Tipo
            if (filterType !== 'all') {
                if (spell.school !== filterType) return false;
            }

            // Filtro por Nível
            if (filterLevel !== 'all') {
                if (spell.level !== parseInt(filterLevel, 10)) return false;
            }

            return true;
        });
    }, [allSpells, searchQuery, filterClass, filterType, filterLevel, activeSpellTab]);

    const clearFilters = () => {
        setSearchQuery('');
        setFilterClass('all');
        setFilterType('all');
        setFilterLevel('all');
    };

    return {
        allSpells,
        filteredSpells,
        searchQuery, setSearchQuery,
        filterClass, setFilterClass,
        filterType, setFilterType,
        filterLevel, setFilterLevel,
        activeSpellTab, setActiveSpellTab,
        clearFilters
    };
}
