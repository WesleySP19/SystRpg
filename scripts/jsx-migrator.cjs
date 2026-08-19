const fs = require('fs');
const path = require('path');

function convertToJSX(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove import { html } from 'htm/preact';
    content = content.replace(/import\s+\{\s*html\s*\}\s+from\s+['"]htm\/preact['"];?\n?/, '');

    // 2. Replace html` ... ` with ( <> ... </> )
    // This is tricky with regex if there are nested template literals.
    // We will use a token-based approach or simplified regexes.
    
    // Instead of full AST parsing, let's just do targeted string replacements.
    let inHtmlBlock = false;
    let newContent = '';
    
    // To properly handle html`...`, we can use a basic scanner.
    let i = 0;
    while (i < content.length) {
        if (content.slice(i, i + 5) === 'html`') {
            newContent += '(';
            i += 5;
            // Now we are inside a template literal.
            let templateStr = '';
            let depth = 0;
            while (i < content.length) {
                if (content[i] === '`' && depth === 0) {
                    newContent += templateStr + ')';
                    i++;
                    break;
                }
                if (content.slice(i, i + 2) === '${') {
                    depth++;
                    templateStr += '{';
                    i += 2;
                    continue;
                }
                if (content[i] === '}' && depth > 0) {
                    depth--;
                    templateStr += '}';
                    i++;
                    continue;
                }
                
                // For class="... ${...} ..." we need className={`... ${...} ...`}
                // It's safer to just let the user fix specific styling things, or we can leave `class=` because Preact SUPPORTS class= natively!
                
                templateStr += content[i];
                i++;
            }
        } else {
            newContent += content[i];
            i++;
        }
    }
    
    // Replace class= with class= (Preact supports class=).
    // Preact also supports string styles if it's not React compat.
    // Wait, Vite's React plugin compiles JSX using `React.createElement` or `jsx-runtime`!
    // By default, vite uses `jsx` from `preact/jsx-runtime` which DOES support `class=`!
    // But does it support `style="width: 50%"`? Yes, Preact supports string styles!
    
    // BUT what about self-closing tags? HTML `htm` allows `<input>` without `/>`.
    // Native JSX STRICTLY requires `/>`.
    // We must fix unclosed tags: <input>, <img>, <hr>, <br>
    
    newContent = newContent.replace(/<(input|img|hr|br|meta|link)([^>]*?)(?<!\/)>/gi, '<$1$2 />');
    
    // Also `onSubmit=${...}` -> `onSubmit={...}` is already handled because `${` became `{`
    
    const newPath = filePath.replace('.js', '.jsx');
    fs.writeFileSync(newPath, newContent, 'utf8');
    
    console.log(`Migrated ${path.basename(filePath)} to ${path.basename(newPath)}`);
}

const files = [
    'ui/components/PlayerForm.js',
    'ui/components/PlayerSpells.js',
    'ui/components/PlayerInventory.js',
    'ui/components/PlayerAttributes.js'
];

files.forEach(f => {
    try {
        convertToJSX(path.resolve(__dirname, '..', f));
    } catch(e) {
        console.error('Error on', f, e);
    }
});
