const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Remove M3 reflections and shadows
    [/\s+shadow-m3-[123]/g, ''],
    [/\s+shadow-(lg|md|xl|2xl|sm)/g, ''],
    [/\s+bg-gradient-to-[a-z-]*/g, ''],
    [/\s+from-[a-z0-9-\/]*/g, ''],
    [/\s+to-[a-z0-9-\/]*/g, ''],
    [/\s+via-[a-z0-9-\/]*/g, ''],
    [/\s+backdrop-blur-[a-z]*/g, ''],
    [/\s+-m3-[123]/g, ''], // cleanup broken remnants
    
    // 2. Tighten Paddings (more conservative than before to avoid breaking layout)
    [/px-6 py-4/g, 'px-3 py-1.5'],
    [/px-5 py-3/g, 'px-2 py-1'],
    [/px-4 py-3/g, 'px-2 py-1'],
    [/px-4 py-2\.5/g, 'px-2 py-1'],
    [/px-3 py-2/g, 'px-1.5 py-0.5'],
    [/p-6/g, 'p-4'],
    [/p-5/g, 'p-3'],
    [/gap-6/g, 'gap-3'],
    [/gap-4/g, 'gap-2'],
    [/space-y-6/g, 'space-y-4'],
    [/space-y-4/g, 'space-y-2'],
    
    // 3. Remove scale-down/up animations on hover for a flatter feel
    [/hover:translate-y-\[-2px\]/g, ''],
    [/active:scale-\[0\.98\]/g, ''],
    [/active:scale-95/g, ''],
    [/hover:shadow-m3-3/g, ''],
    [/hover:shadow-lg/g, ''],
    
    // 4. Solidify surface colors (remove transparency)
    [/bg-surface\/[0-9]+/g, 'bg-surface'],
    [/bg-surface-dark\/[0-9]+/g, 'bg-surface-dark'],
    [/bg-white\/[0-9]+/g, 'bg-white'],
    [/bg-slate-900\/[0-9]+/g, 'bg-slate-900']
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Flattened Design applied to:', filePath);
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

console.log('Safe Flattening Complete.');
