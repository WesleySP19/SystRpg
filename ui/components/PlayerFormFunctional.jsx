import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/core/Toast.jsx';
import { Schemas } from '../../data/schemas.js';
import { CardRenderer } from '../../services/CardRenderer.js';
import { exportFrontBackPNG } from '../utils/imageExport.js';
import { PersistenceService } from '../../services/PersistenceService.js';
import { FXEngine } from '../../services/FXEngine.js';
import { renderSpellsTab } from './PlayerSpells.jsx';
import { renderBioInventoryTab } from './PlayerInventory.jsx';
import { renderCoreTab } from './PlayerAttributes.jsx';
import { HeroImporter } from '../utils/HeroImporter.js';
import { HeroExporter } from '../utils/HeroExporter.js';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useHeroData } from '../hooks/useHeroData.js';
import { useVanillaActions } from '../hooks/useVanillaActions.js';
import { RulesEngine } from '../../core/RulesEngine.js';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useHeroData } from '../hooks/useHeroData.js';
import { useVanillaActions } from '../hooks/useVanillaActions.js';

export function PlayerForm({ store }) {
    const { heroData: p, isEditing, updateHero, draftData, setDraftData } = useHeroData();
    const editingHeroId = isEditing ? p.id : null;
    const [currentTab, setCurrentTab] = useState('core');
    const [portraitData, setPortraitData] = useState(null);
    const [portraitSettings, setPortraitSettings] = useState({ x: 0, y: 0, scale: 1 });
    const [inventoryRows, setInventoryRows] = useState([{ name: '', qty: 1, weight: 0 }]);
    const [attackRows, setAttackRows] = useState([{ name: '', bonus: '', damage: '' }]);
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);
    
    const skills = [
        { id: 'athletics', label: 'Atletismo', stat: 'str' },
        { id: 'acrobatics', label: 'Acrobacia', stat: 'dex' },
        { id: 'sleightOfHand', label: 'Prestidigitação', stat: 'dex' },
        { id: 'stealth', label: 'Furtividade', stat: 'dex' },
        { id: 'arcana', label: 'Arcanismo', stat: 'int' },
        { id: 'history', label: 'História', stat: 'int' },
        { id: 'investigation', label: 'Investigação', stat: 'int' },
        { id: 'nature', label: 'Natureza', stat: 'int' },
        { id: 'religion', label: 'Religião', stat: 'int' },
        { id: 'insight', label: 'Intuição', stat: 'wis' },
        { id: 'medicine', label: 'Medicina', stat: 'wis' },
        { id: 'perception', label: 'Percepção', stat: 'wis' },
        { id: 'survival', label: 'Sobrevivência', stat: 'wis' },
        { id: 'animalHandling', label: 'Adestrar Animais', stat: 'wis' },
        { id: 'deception', label: 'Enganação', stat: 'cha' },
        { id: 'intimidation', label: 'Intimidação', stat: 'cha' },
        { id: 'performance', label: 'Atuação', stat: 'cha' },
        { id: 'persuasion', label: 'Persuasão', stat: 'cha' }
    ];
    
    const actions = {};
    
    Object.assign(actions, {
        // state setters exposed
        setCurrentTab,
        setPortraitData,
        setPortraitSettings,
        setInventoryRows,
        setAttackRows,
        forceUpdate,
        _currentTab: currentTab,
        _skills: skills
    });
    
    const containerRef = useVanillaActions(actions);
    
}
