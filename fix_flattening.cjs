const fs = require('fs');
const path = require('path');

const replacements = [
    // Fix the over-flattening of accent backgrounds
    [/bg-primary\s+flex\s+items-center\s+justify-center\s+text-primary/g, 'bg-primary/10 flex items-center justify-center text-primary'],
    [/bg-emerald-500\s+text-white/g, 'bg-emerald-500 text-white'], // this was fine
    [/bg-rose-500\s+hover:text-rose-500/g, 'hover:bg-rose-500/10 hover:text-rose-500'], // fix hover transparency
    [/bg-primary\s+text-white/g, 'bg-primary text-white'], // this was fine
    [/bg-primary-10/g, 'bg-primary/10'], // fix possible broken ones
    [/bg-primary-20/g, 'bg-primary/20'],
    
    // Header specific fixes
    [/bg-surface\s+dark:bg-surface-dark\s+border-b/g, 'bg-surface dark:bg-surface-dark border-b'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Specifically fix the icon backgrounds in headers/modals
    content = content.replace(/bg-primary\s+flex\s+items-center\s+justify-center\s+text-primary/g, 'bg-primary/10 flex items-center justify-center text-primary');
    content = content.replace(/bg-rose-500\s+flex\s+items-center\s+justify-center\s+text-rose-500/g, 'bg-rose-500/10 flex items-center justify-center text-rose-500');
    content = content.replace(/bg-accent-([a-z]+)\/([0-9]+)/g, 'bg-accent-$1/$2'); // Ensure accent colors keep their transparency

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed transparency in:', filePath);
    }
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src/features'));
console.log('Fixing complete.');
