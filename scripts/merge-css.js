const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '../assets');
const filesToMerge = [
    'styles.css',
    'sheet-theme.css',
    'bestiary-statblock.css',
    'initiative-monitor.css',
    'match-history.css'
];

let mergedCSS = '/* TOME MASTER THEME - BUNDLED */\n\n';

for (const file of filesToMerge) {
    const filePath = path.join(cssDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`Merging ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        mergedCSS += `/* --- ${file} --- */\n${content}\n\n`;
    } else {
        console.warn(`File not found: ${file}`);
    }
}

fs.writeFileSync(path.join(cssDir, 'tome-master.css'), mergedCSS, 'utf8');
console.log('Successfully created tome-master.css');

// Optionally delete old files
for (const file of filesToMerge) {
    const filePath = path.join(cssDir, file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${file}`);
    }
}
