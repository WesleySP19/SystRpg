import re

with open('ui/components/InitiativeMonitor.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace useState imports
code = code.replace("import { useState, useEffect, useRef } from 'preact/hooks';", "import { useEffect, useRef } from 'preact/hooks';\nimport { useSignal, useComputed } from '@preact/signals';")

# Replace state with signals
code = code.replace("const [economy, setEconomy] = useState({ action: true, bonus: true, reaction: true, movement: 30 });", "const economy = useSignal({ action: true, bonus: true, reaction: true, movement: 30 });")
code = code.replace("const [quickAdd, setQuickAdd] = useState({ name: '', init: '', hp: '', type: 'Enemy' });", "const quickAdd = useSignal({ name: '', init: '', hp: '', type: 'Enemy' });")
code = code.replace("const [selectedCond, setSelectedCond] = useState('envenenado');", "const selectedCond = useSignal('envenenado');")
code = code.replace("const [focusId, setFocusId] = useState(null);", "const focusId = useSignal(null);")
code = code.replace("const [announce, setAnnounce] = useState({ show: false, text: '' });", "const announce = useSignal({ show: false, text: '' });")
code = code.replace("const [dmgInput, setDmgInput] = useState('');", "const dmgInput = useSignal('');")

# Replace state setters
code = re.sub(r'setEconomy\((.*?)\)', r'economy.value = \1', code)
code = re.sub(r'setQuickAdd\((.*?)\)', r'quickAdd.value = \1', code)
code = re.sub(r'setSelectedCond\((.*?)\)', r'selectedCond.value = \1', code)
code = re.sub(r'setFocusId\((.*?)\)', r'focusId.value = \1', code)
code = re.sub(r'setAnnounce\((.*?)\)', r'announce.value = \1', code)
code = re.sub(r'setDmgInput\((.*?)\)', r'dmgInput.value = \1', code)

# Handle functional updates
code = code.replace("economy.value = prev => ({ ...prev, action: !prev.action })", "economy.value = { ...economy.value, action: !economy.value.action }")
code = code.replace("economy.value = prev => ({ ...prev, bonus: !prev.bonus })", "economy.value = { ...economy.value, bonus: !economy.value.bonus }")
code = code.replace("economy.value = prev => ({ ...prev, reaction: !prev.reaction })", "economy.value = { ...economy.value, reaction: !economy.value.reaction }")
code = code.replace("economy.value = prev => ({ ...prev, movement: Math.max(0, prev.movement - 5) })", "economy.value = { ...economy.value, movement: Math.max(0, economy.value.movement - 5) }")

code = code.replace("quickAdd.value = prev => ({...prev, name: e.target.value})", "quickAdd.value = {...quickAdd.value, name: e.target.value}")
code = code.replace("quickAdd.value = prev => ({...prev, init: e.target.value})", "quickAdd.value = {...quickAdd.value, init: e.target.value}")
code = code.replace("quickAdd.value = prev => ({...prev, hp: e.target.value})", "quickAdd.value = {...quickAdd.value, hp: e.target.value}")
code = code.replace("quickAdd.value = prev => ({...prev, init: Dice.quick(20).toString()})", "quickAdd.value = {...quickAdd.value, init: Dice.quick(20).toString()}")

# Replace variable usages
code = re.sub(r'(?<!\.)\beconomy\b(?!\.value)', 'economy.value', code)
code = re.sub(r'(?<!\.)\bquickAdd\b(?!\.value)', 'quickAdd.value', code)
code = re.sub(r'(?<!\.)\bselectedCond\b(?!\.value)', 'selectedCond.value', code)
code = re.sub(r'(?<!\.)\bfocusId\b(?!\.value)', 'focusId.value', code)
code = re.sub(r'(?<!\.)\bannounce\b(?!\.value)', 'announce.value', code)
code = re.sub(r'(?<!\.)\bdmgInput\b(?!\.value)', 'dmgInput.value', code)

# Switch to reading store.pathSignals for reactivity
code = code.replace(
    "const state = store.state;\n    const { combatActive, combatRound, initiativeOrder = [], initiativeIndex = 0 } = state;",
    """const combatActive = store.pathSignals.combatActive?.value;
    const combatRound = store.pathSignals.combatRound?.value;
    const initiativeOrder = store.pathSignals.initiativeOrder?.value || [];
    const initiativeIndex = store.pathSignals.initiativeIndex?.value || 0;
    const state = store.state;"""
)

with open('ui/components/InitiativeMonitor.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
