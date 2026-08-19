import re

with open('ui/components/SpellBook.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace class definition
text = text.replace('export class SpellBook extends ReactiveComponent {', 'export function SpellBook({ store }) {')

# Remove constructor
text = re.sub(r'    constructor\(opts\) \{.*?\n    \}', '', text, flags=re.DOTALL)

# Add hooks
hooks_str = '''
    const {
        allSpells, filteredSpells,
        searchQuery, setSearchQuery,
        filterClass, setFilterClass,
        filterType, setFilterType,
        filterLevel, setFilterLevel,
        activeSpellTab, setActiveSpellTab,
        clearFilters: doClearFilters
    } = useSpells();

    const [selectedSpell, setSelectedSpell] = useState(null);
    const [popupSpell, setPopupSpell] = useState(null);
    const [popupMode, setPopupMode] = useState(null);
    const [popupPos, setPopupPos] = useState({x: 0, y: 0});
    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);
'''
text = text.replace('export function SpellBook({ store }) {\n', 'export function SpellBook({ store }) {\n' + hooks_str)

# Replace 'this.' with nothing or state references
text = text.replace('this._allSpells', 'allSpells')
text = text.replace('this._filtered', 'filteredSpells')
text = text.replace('this._searchQuery', 'searchQuery')
text = text.replace('this._filterClass', 'filterClass')
text = text.replace('this._filterType', 'filterType')
text = text.replace('this._filterLevel', 'filterLevel')
text = text.replace('this._activeSpellTab', 'activeSpellTab')
text = text.replace('this._selectedSpell', 'selectedSpell')
text = text.replace('this._activePopupSpell', 'popupSpell')
text = text.replace('this._popupMode', 'popupMode')
text = text.replace('this._popupPosition', 'popupPos')
text = text.replace('this.store', 'store')
text = text.replace('this.unmount', '(() => {})')
text = text.replace('this.', 'actions.')

# Extract methods to actions map
methods_match = re.findall(r'^    ([a-zA-Z0-9_]+)\((.*?)\) \{(.*?)\n    }(?=\n\n    [a-zA-Z0-9_]+|\n}$)', text, re.DOTALL | re.MULTILINE)

methods_dict = {}
for name, args, body in methods_match:
    if name in ['constructor', 'template', 'mount', 'onUnmount', 'onMount']:
        continue
    methods_dict[name] = f"const {name} = ({args}) => {{{body}\n    }};"

# Remove old methods
text = re.sub(r'^    ([a-zA-Z0-9_]+)\((.*?)\) \{(.*?)\n    }(?=\n\n    [a-zA-Z0-9_]+|\n}$)', '', text, flags=re.DOTALL | re.MULTILINE)

# Build actions map
actions_map = "    const actions = {};\n"
for m in methods_dict.values():
    actions_map += '    ' + m.replace('\n', '\n    ') + '\n'
actions_map += "    Object.assign(actions, {\n"
for name in methods_dict.keys():
    actions_map += f"        {name},\n"
actions_map += "    });\n"

text = text.replace(hooks_str, hooks_str + '\n' + actions_map)

# Replace template() { ... } with return ( ... )
template_match = re.search(r'    template\(\) \{(.*?)\n    }\n$', text, re.DOTALL)
if template_match:
    template_body = template_match.group(1)
    text = text.replace(template_match.group(0), template_body)
    
# Add imports
imports = "import { useState, useEffect, useRef } from 'preact/hooks';\nimport { useSpells } from '../hooks/useSpells.js';\nimport { useVanillaActions } from '../hooks/useVanillaActions.js';\n"
text = imports + text

# Add useVanillaActions ref to root
text = text.replace('<div class="page"', 'const containerRef = useVanillaActions(actions);\n    return (\n    <div class="page" ref={containerRef}')
text = text + "\n    );\n}\n"

with open('ui/components/SpellBookFunctional.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
