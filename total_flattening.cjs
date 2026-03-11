const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Flatten the Design - Corners
    [/rounded-full/g, 'rounded-sm'],
    [/rounded-r-full/g, 'rounded-r-sm'],
    [/rounded-3xl/g, 'rounded-sm'],
    [/rounded-2xl/g, 'rounded-sm'],
    [/rounded-xl/g, 'rounded-sm'],
    [/rounded-lg/g, 'rounded-sm'],
    [/rounded-md/g, 'rounded-sm'],
    
    // 2. Flatten the Design - Shadows
    [/shadow-m3-[123]/g, ''],
    [/shadow-sm/g, ''],
    [/shadow-md/g, ''],
    [/shadow-lg/g, ''],
    [/shadow-xl/g, ''],
    [/shadow/g, ''],
    
    // 3. Flatten the Design - Gradients and Blur
    [/bg-gradient-to-br/g, ''],
    [/from-primary/g, ''],
    [/to-primary-600/g, ''],
    [/backdrop-blur-sm/g, ''],
    [/backdrop-blur-md/g, ''],
    [/backdrop-blur-lg/g, ''],
    [/backdrop-blur/g, ''],
    
    // 4. Flatten the Design - Hover and Active effects
    [/hover:translate-y-\[-2px\]/g, ''],
    [/active:scale-95/g, ''],
    [/active:scale-\[0.98\]/g, ''],
    [/hover:shadow-md/g, ''],
    [/hover:shadow-sm/g, ''],
    [/hover:shadow/g, ''],
    
    // 5. Refine backgrounds (ensure solidness)
    [/bg-primary\/5/g, 'bg-slate-100 dark:bg-slate-800'],
    [/bg-primary\/10/g, 'bg-primary/20'], // slightly more visible in flat
    [/bg-surface\/50/g, 'bg-surface'],
    [/bg-surface-dark\/50/g, 'bg-surface-dark'],
    [/bg-white\/50/g, 'bg-white'],
    [/bg-slate-900\/50/g, 'bg-slate-900'],
    
    // 6. Table row hover refinement - make it more "Linear" style
    [/hover:bg-white/g, 'hover:bg-slate-50'],
    [/hover:bg-slate-800\/50/g, 'hover:bg-slate-800'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Cleanup double spaces
    content = content.replace(/\s{2,}/g, ' ');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Flattened:', filePath);
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
console.log('Total flattening complete.');
