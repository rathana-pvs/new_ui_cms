const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Flatten - Final Rounding Cleanup
    [/rounded-full/g, 'rounded-sm'],
    [/rounded-r-full/g, 'rounded-r-sm'],
    [/rounded-\[2.5rem\]/g, 'rounded-sm'],
    
    // 2. Remove Glows and inline shadow remnants
    [/-\[0_0_8px_rgba\([^)]+\)\]/g, ''],
    [/-\[0_0_12px_rgba\([^)]+\)\]/g, ''],
    
    // 3. Remove animations for a more "Solid" industrial feel
    [/animate-pulse/g, ''],
    [/animate-ping/g, ''],
    
    // 4. Fix sidebar host indicator
    [/rounded-r-sm/g, 'rounded-r-none'], // make it a strict block
    
    // 5. Solidify Colors - remove some transparency that might look "soft"
    [/bg-emerald-500\/5/g, 'bg-emerald-50'],
    [/bg-primary\/5/g, 'bg-slate-100'],
    [/bg-primary\/20/g, 'bg-slate-200'],

    // 6. Sidebar tabs refinement
    [/bg-white\/50/g, 'bg-white'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Re-formatting roughly to avoid one-liners
    content = content.replace(/;\s/g, ';\n');
    content = content.replace(/{\s/g, '{\n');
    content = content.replace(/}\s/g, '}\n');
    content = content.replace(/const\s/g, '\nconst ');
    content = content.replace(/export\s/g, '\nexport ');
    content = content.replace(/return\s\(/g, '\nreturn (');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Deeply Flattened:', filePath);
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
console.log('Deep flattening and reformatting complete.');
