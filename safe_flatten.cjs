const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Flattening - Corners (Safer with boundaries)
    [/(^|\s)rounded-full(\s|$)/g, '$1rounded-sm$2'],
    [/(^|\s)rounded-3xl(\s|$)/g, '$1rounded-sm$2'],
    [/(^|\s)rounded-2xl(\s|$)/g, '$1rounded-sm$2'],
    [/(^|\s)rounded-xl(\s|$)/g, '$1rounded-sm$2'],
    [/(^|\s)rounded-lg(\s|$)/g, '$1rounded-sm$2'],
    [/(^|\s)rounded-md(\s|$)/g, '$1rounded-sm$2'],
    [/(^|\s)rounded-r-full(\s|$)/g, '$1rounded-r-none$2'],
    
    // 2. Shadows - Remove all
    [/(^|\s)shadow-m3-[123](\s|$)/g, '$1$2'],
    [/(^|\s)shadow-[a-z0-9-]*(\s|$)/g, '$1$2'],
    
    // 3. Gradients and Blur
    [/(^|\s)bg-gradient-to-[a-z-]*(\s|$)/g, '$1$2'],
    [/(^|\s)from-primary(\s|$)/g, '$1$2'],
    [/(^|\s)to-primary-600(\s|$)/g, '$1$2'],
    [/(^|\s)backdrop-blur-[a-z]*(\s|$)/g, '$1$2'],
    
    // 4. Tighten Paddings (Safer)
    [/(^|\s)p-6(\s|$)/g, '$1p-2$2'],
    [/(^|\s)p-5(\s|$)/g, '$1p-1.5$2'],
    [/(^|\s)p-4(\s|$)/g, '$1p-1$2'],
    [/(^|\s)px-6 py-4(\s|$)/g, '$1px-1.5 py-0.5$2'],
    [/(^|\s)px-5 py-3(\s|$)/g, '$1px-1.5 py-0.5$2'],
    [/(^|\s)px-2 py-1(\s|$)/g, '$1px-1 py-0.5$2'],
    
    // 5. Icons and boxes
    [/(^|\s)w-12 h-12(\s|$)/g, '$1w-9 h-9$2'],
    [/(^|\s)w-10 h-10(\s|$)/g, '$1w-8 h-8$2'],
    [/(^|\s)w-8 h-8(\s|$)/g, '$1w-6 h-6$2'],
    
    // 6. Color refinement (more solid)
    [/(^|\s)bg-white\/50(\s|$)/g, '$1bg-white$2'],
    [/(^|\s)bg-surface\/50(\s|$)/g, '$1bg-surface$2'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Safe Flattened:', filePath);
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
console.log('Safe Industrial flattening complete.');
