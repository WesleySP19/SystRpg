import re
import os

with open('ui/components/PlayerForm.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We will generate a new functional component file.
new_code = []

imports = []
import_matches = re.finditer(r'^import .*?;$', code, re.MULTILINE)
for m in import_matches:
    imp = m.group(0)
    if 'ReactiveComponent' not in imp:
        imports.append(imp)

imports.append("import { useState, useEffect, useRef } from 'preact/hooks';")
imports.append("import { useHeroData } from '../hooks/useHeroData.js';")
imports.append("import { useVanillaActions } from '../hooks/useVanillaActions.js';")

# Get the template block
template_match = re.search(r'template\(\) \{(.*?)\n    _renderInventoryRows', code, re.DOTALL)
if template_match:
    template_body = template_match.group(1)
    # Remove 'const editingPlayer = ...' because we get it from hook
    template_body = re.sub(r'const editingPlayer = .*?;', '', template_body)
    template_body = re.sub(r'const p = editingPlayer \|\| this\._draftData \|\| \{\};', '', template_body)
    # Replace this._currentTab with currentTab
    template_body = template_body.replace('this._currentTab', 'currentTab')
    # Replace this._editingId with isEditing
    template_body = template_body.replace('this._editingId', 'isEditing')
    template_body = template_body.replace('this._portraitData', 'portraitData')
    template_body = template_body.replace('this._portraitSettings', 'portraitSettings')
    template_body = template_body.replace('this._renderCardTab()', 'actions._renderCardTab()')
    template_body = template_body.replace('this._renderPlayerList()', 'actions._renderPlayerList()')
    # Replace {renderCoreTab(p, this)} with {renderCoreTab(p, actions)}
    template_body = template_body.replace('renderCoreTab(p, this)', 'renderCoreTab(p, actions)')
    template_body = template_body.replace('renderBioInventoryTab(p, this)', 'renderBioInventoryTab(p, actions)')
    template_body = template_body.replace('renderSpellsTab(p, this)', 'renderSpellsTab(p, actions)')

# Get all other methods
methods_match = re.findall(r'^    ([a-zA-Z0-9_]+)\((.*?)\) \{(.*?)\n    }(?=\n\n    [a-zA-Z0-9_]+|\n}$)', code, re.DOTALL | re.MULTILINE)

methods_dict = {}
for name, args, body in methods_match:
    if name in ['constructor', 'template', 'mount', 'onUnmount', 'onMount']:
        continue
    
    # Replace 'this.' with nothing or state references
    body = re.sub(r'this\.store\.state', 'TOME.store.state', body)
    body = body.replace('this.store.dispatch', 'TOME.store.dispatch')
    body = body.replace('this.store', 'TOME.store')
    body = body.replace('this._editingId', 'editingHeroId')
    body = body.replace('this._portraitData', 'portraitData')
    body = body.replace('this._portraitSettings', 'portraitSettings')
    body = body.replace('this._inventoryRows', 'inventoryRows')
    body = body.replace('this._attackRows', 'attackRows')
    body = body.replace('this._currentTab', 'currentTab')
    body = body.replace('this._skills', 'skills')
    body = body.replace('this._draftData', 'draftData')
    body = body.replace('this.update()', 'forceUpdate()')
    body = body.replace('this.', 'actions.') # generic fallback for this.method()

    methods_dict[name] = f"const {name} = ({args}) => {{{body}\n    }};"

with open('ui/components/PlayerFormFunctional.jsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(imports) + '\n\n')
    f.write('export function PlayerForm({ store }) {\n')
    f.write('    const { heroData: p, isEditing, updateHero, draftData, setDraftData } = useHeroData();\n')
    f.write('    const editingHeroId = isEditing ? p.id : null;\n')
    f.write('    const [currentTab, setCurrentTab] = useState(\'core\');\n')
    f.write('    const [portraitData, setPortraitData] = useState(null);\n')
    f.write('    const [portraitSettings, setPortraitSettings] = useState({ x: 0, y: 0, scale: 1 });\n')
    f.write('    const [inventoryRows, setInventoryRows] = useState([{ name: \'\', qty: 1, weight: 0 }]);\n')
    f.write('    const [attackRows, setAttackRows] = useState([{ name: \'\', bonus: \'\', damage: \'\' }]);\n')
    f.write('    const [, setTick] = useState(0);\n')
    f.write('    const forceUpdate = () => setTick(t => t + 1);\n')
    f.write('    \n')
    f.write('    const skills = [\n')
    f.write('        { id: \'athletics\', label: \'Atletismo\', stat: \'str\' },\n')
    f.write('        { id: \'acrobatics\', label: \'Acrobacia\', stat: \'dex\' },\n')
    f.write('        { id: \'sleightOfHand\', label: \'Prestidigitação\', stat: \'dex\' },\n')
    f.write('        { id: \'stealth\', label: \'Furtividade\', stat: \'dex\' },\n')
    f.write('        { id: \'arcana\', label: \'Arcanismo\', stat: \'int\' },\n')
    f.write('        { id: \'history\', label: \'História\', stat: \'int\' },\n')
    f.write('        { id: \'investigation\', label: \'Investigação\', stat: \'int\' },\n')
    f.write('        { id: \'nature\', label: \'Natureza\', stat: \'int\' },\n')
    f.write('        { id: \'religion\', label: \'Religião\', stat: \'int\' },\n')
    f.write('        { id: \'insight\', label: \'Intuição\', stat: \'wis\' },\n')
    f.write('        { id: \'medicine\', label: \'Medicina\', stat: \'wis\' },\n')
    f.write('        { id: \'perception\', label: \'Percepção\', stat: \'wis\' },\n')
    f.write('        { id: \'survival\', label: \'Sobrevivência\', stat: \'wis\' },\n')
    f.write('        { id: \'animalHandling\', label: \'Adestrar Animais\', stat: \'wis\' },\n')
    f.write('        { id: \'deception\', label: \'Enganação\', stat: \'cha\' },\n')
    f.write('        { id: \'intimidation\', label: \'Intimidação\', stat: \'cha\' },\n')
    f.write('        { id: \'performance\', label: \'Atuação\', stat: \'cha\' },\n')
    f.write('        { id: \'persuasion\', label: \'Persuasão\', stat: \'cha\' }\n')
    f.write('    ];\n')
    f.write('    \n')
    f.write('    const actions = {};\n')
    for m in methods_dict.values():
        f.write('    ' + m.replace('\n', '\n    ') + '\n')
    
    f.write('    \n')
    f.write('    Object.assign(actions, {\n')
    for name in methods_dict.keys():
        f.write(f'        {name},\n')
    f.write('        // state setters exposed\n')
    f.write('        setCurrentTab,\n')
    f.write('        setPortraitData,\n')
    f.write('        setPortraitSettings,\n')
    f.write('        setInventoryRows,\n')
    f.write('        setAttackRows,\n')
    f.write('        forceUpdate,\n')
    f.write('        _currentTab: currentTab,\n')
    f.write('        _skills: skills\n')
    f.write('    });\n')
    
    f.write('    \n')
    f.write('    const containerRef = useVanillaActions(actions);\n')
    f.write('    \n')
    if template_match:
        body = template_body.replace('class="page legacy-sheet-container"', 'class="page legacy-sheet-container" ref={containerRef}')
        f.write(body + '\n')
    f.write('}\n')
print('Generated PlayerFormFunctional.jsx')
