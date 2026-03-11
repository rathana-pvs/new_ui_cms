const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Flatten all rounding
    [/rounded-(full|3xl|2xl|xl|lg|md)/g, 'rounded-sm'],
    
    // 2. Remove shadows
    [/\s+shadow-(m3-[123]|lg|md|sm|xl|2xl|inner)/g, ''],
    
    // 3. Tighten sidebar and specific containers
    [/(^|\s)p-4(\s|$)/g, '$1p-2$2'],
    [/(^|\s)p-6(\s|$)/g, '$1p-3$2'],
    [/(^|\s)px-4 py-2(\s|$)/g, '$1px-2 py-1$2'],
    
    // 4. Remove dark-only shadow insets I added earlier
    [/dark:shadow-ob-inset/g, ''],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Radii Flattened in:', filePath);
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
processDirectory(path.join(__dirname, 'src/app'));
processDirectory(path.join(__dirname, 'src/components'));

console.log('Final Polish Complete.');
