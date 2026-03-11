const fs = require('fs');
const path = require('path');

const replacements = [
    // Clean up broken remnants from previous Turn
    [/\s+-m3-[123]/g, ''],
    [/\s+-sm/g, ''],
    [/\s+-md/g, ''],
    [/\s+-lg/g, ''],
    [/\s+-xl/g, ''],
    [/\s+-2xl/g, ''],
    [/\s+-3xl/g, ''],
    [/bg-gradient-to-br from-primary to-primary-600/g, 'bg-primary'],
    [/bg-gradient-to-br from-white\/10 to-transparent/g, ''],
    [/\s+backdrop-blur-(sm|md|lg|xl)/g, ''],
    [/\//g, ' / '], // Temporary to catch broken gradient remnants like " /10"
    [/\s+\/\s+10\s+/g, ' '], // Catch remnants of white/10
    [/\s+\/\s+/g, '/'], // Restore slashes
    
    // Flattening Design
    [/rounded-\[2rem\]/g, 'rounded-xl'],
    [/rounded-3xl/g, 'rounded-xl'],
    [/rounded-2xl/g, 'rounded-lg'],
    [/rounded-xl/g, 'rounded-md'],
    
    // Borders and Shadows
    [/shadow-m3-3/g, 'shadow-md'],
    [/shadow-m3-2/g, 'shadow-sm'],
    [/shadow-m3-1/g, ''],
    
    // Refine surface backgrounds (remove transparency for slab/flat look)
    [/bg-surface\/[0-9]+/g, 'bg-surface'],
    [/bg-surface-dark\/[0-9]+/g, 'bg-surface-dark'],
    [/bg-white\/[0-9]+/g, 'bg-white'],
    [/bg-slate-900\/50/g, 'bg-slate-900'],
    
    // Hover effects - make them subtler
    [/hover:shadow-m3-3/g, ''],
    [/hover:shadow-m3-2/g, 'shadow-sm'],
    [/hover:translate-y-\[-2px\]/g, ''],
    [/active:scale-\[0.98\]/g, ''],
    [/active:scale-95/g, '']
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Additional cleanup for broken CSS class strings
    content = content.replace(/className={`([^`]+)`}/g, (match, classes) => {
        // Remove double spaces and trailing spaces
        const cleaned = classes.replace(/\s+/g, ' ').trim();
        return `className={\`${cleaned}\`}`;
    });

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
        } else if (entry.isFile() && fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
}

processDirectory(path.join(__dirname, 'src/features'));
console.log('Design flattening complete.');
