const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Sidebar & Navigation Tabs & Items
    content = content.replace(/px-3 py-2(\s|")/g, 'px-2 py-1$1');
    content = content.replace(/px-2.5 py-1.5/g, 'px-2 py-1');
    content = content.replace(/px-4 py-2.5/g, 'px-3 py-1.5');
    content = content.replace(/px-4 py-2/g, 'px-2 py-1');
    
    // Header/Footer buttons
    content = content.replace(/px-6 py-2(\s|")/g, 'px-4 py-1.5$1');
    content = content.replace(/px-4 py-1.5/g, 'px-3 py-1');
    
    // Tabs specific
    content = content.replace(/px-1.5 py-1.5/g, 'px-1 py-1');
    content = content.replace(/px-3 pt-3 pb-2/g, 'px-2 pt-2 pb-1.5');
    
    // Database tree spacing
    content = content.replace(/px-3 pb-3/g, 'px-2 pb-2');

    // Make table paddings dense
    content = content.replace(/px-3 py-1.5/g, 'px-2 py-1');
    content = content.replace(/px-2 py-1(\s|")/g, 'px-2 py-1$1'); // stay same if already changed

    // table headers
    content = content.replace(/px-4 py-3/g, 'px-2 py-1.5');
    content = content.replace(/px-5 py-4/g, 'px-3 py-2');

    // Sidebar items specifically
    content = content.replace(/px-6 py-35/g, 'px-4 py-2');

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
console.log('Very tight padding replacement complete.');
