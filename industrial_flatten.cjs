const fs = require('fs');
const path = require('path');

const replacements = [
    // 1. Shrink Paddings further for extreme density
    [/px-6 py-4/g, 'px-2 py-1'],
    [/px-5 py-5/g, 'px-2 py-1'],
    [/px-4 py-2/g, 'px-1.5 py-0.5'],
    [/px-3 py-2/g, 'px-1.5 py-0.5'],
    [/px-2 py-1/g, 'px-1.5 py-0.5'],
    [/p-6/g, 'p-2'],
    [/p-5/g, 'p-1.5'],
    [/p-4/g, 'p-1'],
    [/gap-6/g, 'gap-2'],
    [/gap-4/g, 'gap-1.5'],
    [/space-y-6/g, 'space-y-2'],
    [/space-y-4/g, 'space-y-1.5'],
    
    // 2. Shrink decorative boxes
    [/w-12 h-12/g, 'w-9 h-9'],
    [/w-10 h-10/g, 'w-8 h-8'],
    [/w-8 h-8/g, 'w-6 h-6'],
    [/text-\[28px\]/g, 'text-[18px]'],
    [/text-[22px]/g, 'text-[16px]'],
    [/text-[20px]/g, 'text-[14px]'],
    [/text-[18px]/g, 'text-[14px]'],
    
    // 3. Flatten Radii to zero or 1px for extreme "Industrial" look
    [/rounded-sm/g, 'rounded-none'],
    [/rounded-md/g, 'rounded-none'],
    [/rounded-xl/g, 'rounded-none'],
    
    // 4. Remove vibrant color backgrounds in headers
    [/bg-emerald-500/g, 'bg-emerald-600'],
    [/bg-purple-500/g, 'bg-purple-600'],
    [/bg-amber-500/g, 'bg-amber-600'],
    [/bg-rose-500/g, 'bg-rose-600'],
    
    // 5. Sidebar Tabs specific refinement
    [/p-1.5 bg-white/g, 'p-0.5 bg-white'],
    [/gap-1.5 p-1.5/g, 'gap-0 p-0'],
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    // Fix any broken class sequences
    content = content.replace(/\s+/g, ' ');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Industrially Flattened:', filePath);
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
console.log('Industrial flattening complete.');
