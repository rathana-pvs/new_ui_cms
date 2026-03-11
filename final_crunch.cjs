const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Extreme Padding Crunch
    [/px-[3456] py-[234]/g, 'px-1.5 py-0.5'],
    [/px-8/g, 'px-2'],
    [/px-6/g, 'px-1.5'],
    [/px-4/g, 'px-1'],
    [/py-4/g, 'py-1'],
    [/py-3/g, 'py-0.5'],
    [/p-[34568]/g, 'p-1'],
    [/p-2/g, 'p-0.5'],
    [/gap-[34568]/g, 'gap-1'],
    [/gap-2/g, 'gap-0.5'],
    [/space-y-[34568]/g, 'space-y-1'],
    [/space-y-2/g, 'space-y-0.5'],
    
    // 2. Strict Square/1px Corners
    [/rounded-[a-z0-9-]*/g, 'rounded-sm'],
    
    // 3. Flat colors (removing subtle glows/shadows)
    [/shadow-[a-z0-9-]*/g, ''],
    [/animate-[a-z0-9-]*/g, ''],
    [/backdrop-blur-[a-z0-9-]*/g, ''],
    [/bg-gradient-to-[a-z-]*/g, ''],
    
    // 4. Shrink UI Elements
    [/h-1[024]/g, 'h-8'],
    [/w-1[024]/g, 'w-8'],
    [/h-[56]/g, 'h-4'],
    [/w-[56]/g, 'w-4'],
    [/text-[23][0-9]px/g, 'text-[14px]'],
    [/text-xl/g, 'text-sm'],
    [/text-lg/g, 'text-xs'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Cleanup word breaks
    content = content.replace(/\s+/g, ' ');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Final Flattened:', filePath);
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

processDirectory(path.join(__dirname, 'src'));
console.log('Final industrial crunch complete.');
