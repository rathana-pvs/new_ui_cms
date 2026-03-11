const fs = require('fs');
const path = require('path');

const replacements = [
    // Ensure all summary/header bars have enough horizontal space
    [/summary className="([^"]*)px-1\.5([^"]*)"/g, 'summary className="$1px-4$2"'],
    [/summary className="([^"]*)px-3([^"]*)"/g, 'summary className="$1px-4$2"'],
    
    // Standardize all px-6 to px-4 if it feels too wide now, 
    // but the user said "too small", so let's keep vertical padding high.
    
    // If table cells are px-5 py-2.5, let's make them py-3
    [/py-2\.5/g, 'py-3'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Final Spacing Polish in:', filePath);
    }
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js'))) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src/features'));
console.log('Final spacing polish complete.');
