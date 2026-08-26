import shutil

shutil.copy('ui/components/InitiativeMonitor.js.bak', 'ui/components/InitiativeMonitor.jsx')

with open('ui/components/InitiativeMonitor.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Safe replacements for InitiativeMonitor
code = code.replace("import { useState, useEffect, useRef } from 'preact/hooks';", "import { useEffect, useRef } from 'preact/hooks';\nimport { useSignal, useComputed } from '@preact/signals';")
code = code.replace("const [economy, setEconomy] = useState({ action: true, bonus: true, reaction: true, movement: 30 });", "const economy = useSignal({ action: true, bonus: true, reaction: true, movement: 30 });")
code = code.replace("const [quickAdd, setQuickAdd] = useState({ name: '', init: '', hp: '', type: 'Enemy' });", "const quickAdd = useSignal({ name: '', init: '', hp: '', type: 'Enemy' });")
code = code.replace("const [selectedCond, setSelectedCond] = useState('envenenado');", "const selectedCond = useSignal('envenenado');")
code = code.replace("const [focusId, setFocusId] = useState(null);", "const focusId = useSignal(null);")
code = code.replace("const [announce, setAnnounce] = useState({ show: false, text: '' });", "const announce = useSignal({ show: false, text: '' });")
code = code.replace("const [dmgInput, setDmgInput] = useState('');", "const dmgInput = useSignal('');")

# Functional Setters replacement carefully mapping Exact full strings
code = code.replace("setEconomy(prev => ({ ...prev, action: !prev.action }))", "economy.value = { ...economy.value, action: !economy.value.action }")
code = code.replace("setEconomy(prev => ({ ...prev, bonus: !prev.bonus }))", "economy.value = { ...economy.value, bonus: !economy.value.bonus }")
code = code.replace("setEconomy(prev => ({ ...prev, reaction: !prev.reaction }))", "economy.value = { ...economy.value, reaction: !economy.value.reaction }")
code = code.replace("setEconomy(prev => ({ ...prev, movement: Math.max(0, prev.movement - 5) }))", "economy.value = { ...economy.value, movement: Math.max(0, economy.value.movement - 5) }")

code = code.replace("setQuickAdd(prev => ({...prev, name: e.target.value}))", "quickAdd.value = {...quickAdd.value, name: e.target.value}")
code = code.replace("setQuickAdd(prev => ({...prev, init: e.target.value}))", "quickAdd.value = {...quickAdd.value, init: e.target.value}")
code = code.replace("setQuickAdd(prev => ({...prev, hp: e.target.value}))", "quickAdd.value = {...quickAdd.value, hp: e.target.value}")
code = code.replace("setQuickAdd(prev => ({...prev, init: Dice.quick(20).toString()}))", "quickAdd.value = {...quickAdd.value, init: Dice.quick(20).toString()}")

# Direct assignments
code = code.replace("setEconomy({ action: true, bonus: true, reaction: true, movement: 30 })", "economy.value = { action: true, bonus: true, reaction: true, movement: 30 }")
code = code.replace("setQuickAdd({ name: '', init: '', hp: '', type: 'Enemy' })", "quickAdd.value = { name: '', init: '', hp: '', type: 'Enemy' }")
code = code.replace("setAnnounce({ show: false, text: '' })", "announce.value = { show: false, text: '' }")
code = code.replace("setAnnounce({ show: true, text: `▶ Turno de ${actor.name}` })", "announce.value = { show: true, text: `▶ Turno de ${actor.name}` }")

code = code.replace("setSelectedCond(e.target.value)", "selectedCond.value = e.target.value")
code = code.replace("setFocusId(null)", "focusId.value = null")
code = code.replace("setFocusId(c.id)", "focusId.value = c.id")
code = code.replace("setDmgInput(e.target.value)", "dmgInput.value = e.target.value")
code = code.replace("setDmgInput('')", "dmgInput.value = ''")

# Variable access
code = code.replace("economy.action", "economy.value.action")
code = code.replace("economy.bonus", "economy.value.bonus")
code = code.replace("economy.reaction", "economy.value.reaction")
code = code.replace("economy.movement", "economy.value.movement")

code = code.replace("quickAdd.name", "quickAdd.value.name")
code = code.replace("quickAdd.init", "quickAdd.value.init")
code = code.replace("quickAdd.hp", "quickAdd.value.hp")
code = code.replace("quickAdd.type", "quickAdd.value.type")

code = code.replace("selectedCond ===", "selectedCond.value ===")
code = code.replace("focusId ===", "focusId.value ===")
code = code.replace("announce.show", "announce.value.show")
code = code.replace("announce.text", "announce.value.text")
code = code.replace("value={dmgInput}", "value={dmgInput.value}")
code = code.replace("dmgInput ===", "dmgInput.value ===")

# Path signals global hook replacement
global_replace = """const combatActive = store.pathSignals.combatActive?.value;
    const combatRound = store.pathSignals.combatRound?.value;
    const initiativeOrder = store.pathSignals.initiativeOrder?.value || [];
    const initiativeIndex = store.pathSignals.initiativeIndex?.value || 0;
    const state = store.state;"""

code = code.replace("const state = store.state;\n    const { combatActive, combatRound, initiativeOrder = [], initiativeIndex = 0 } = state;", global_replace)

with open('ui/components/InitiativeMonitor.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('InitiativeMonitor.jsx fixed!')
