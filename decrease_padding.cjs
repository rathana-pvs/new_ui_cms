const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Sidebar & Navigation
    content = content.replace(/px-4 py-3/g, 'px-3 py-2');
    content = content.replace(/px-3 py-2\.5/g, 'px-2.5 py-1.5');
    content = content.replace(/px-6 py-3\.5/g, 'px-4 py-2.5');
    content = content.replace(/px-6 py-3/g, 'px-4 py-2');
    content = content.replace(/px-5 py-4/g, 'px-3 py-2');
    
    // Tables
    content = content.replace(/px-6 py-4/g, 'px-4 py-2');
    content = content.replace(/px-5 py-3/g, 'px-3 py-2');
    content = content.replace(/px-6 py-2/g, 'px-4 py-1.5');
    content = content.replace(/px-4 py-3/g, 'px-3 py-2');
    
    // Header/Footer buttons
    content = content.replace(/px-8 py-2\.5/g, 'px-6 py-2');
    content = content.replace(/px-6 py-2\.5/g, 'px-4 py-1.5');
    
    // Tabs
    content = content.replace(/px-4 pt-5 pb-3/g, 'px-3 pt-3 pb-2');
    content = content.replace(/px-2 py-3/g, 'px-1.5 py-1.5');
    
    // Database tree specific
    content = content.replace(/px-4 pb-4/g, 'px-3 pb-3');

    fs.writeFileSync(filePath, content, 'utf8');
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
console.log('Padding replacement complete.');
