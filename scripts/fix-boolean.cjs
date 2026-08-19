const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = [
    'ui/components/PlayerForm.jsx',
    'ui/components/PlayerSpells.jsx',
    'ui/components/PlayerInventory.jsx',
    'ui/components/PlayerAttributes.jsx'
];

files.forEach(f => {
    let p = path.resolve(__dirname, '..', f);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace {EXPR ? 'checked' : ''} with checked={!!(EXPR)}
    content = content.replace(/\{([^}]+)\s*\?\s*['"`]?checked['"`]?\s*:\s*['"`]?['"`]?\}/g, 'checked={!!($1)}');
    content = content.replace(/\{([^}]+)\s*\?\s*['"`]?selected['"`]?\s*:\s*['"`]?['"`]?\}/g, 'selected={!!($1)}');
    content = content.replace(/\{([^}]+)\s*\?\s*['"`]?disabled['"`]?\s*:\s*['"`]?['"`]?\}/g, 'disabled={!!($1)}');
    
    // Also handle {EXPR ? 'active' : ''} if it's outside class string but usually they are inside class="tab {EXPR}" which works fine.
    
    fs.writeFileSync(p, content, 'utf8');
});
console.log('Fixed boolean attributes!');
