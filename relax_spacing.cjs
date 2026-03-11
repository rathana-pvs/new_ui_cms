const fs = require('fs');
const path = require('path');

const replacements = [
    // Increase Table Padding and Font Size
    [/<table className="([^"]*)text-xs([^"]*)"/g, '<table className="$1text-sm$2"'],
    [/<th className="px-2 py-1/g, '<th className="px-4 py-2'],
    [/<td className="px-4 py-2/g, '<td className="px-6 py-3'],
    [/<td className="px-2 py-1/g, '<td className="px-5 py-2.5'],
    
    // Fix the broken .5.5 remnant if it exists
    [/py-0\.5\.5/g, 'py-2'],
    
    // Sidebar items shouldn't be TOO small either
    [/px-1\.5 py-0\.5/g, 'px-3 py-1.5'],
    
    // Standardize header font size if it's text-[11px]
    [/text-\[11px\] tracking-wider/g, 'text-xs tracking-widest font-bold'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Relaxed Spacing in:', filePath);
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
console.log('Spacing relaxation complete.');
