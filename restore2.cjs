const fs = require('fs');
const path = require('path');

const replacements = {
    // UnloadDatabaseModal.jsx Additions
    "Extracting Assets": "Unloading Database...",
    "Initiating instance decommissioning...": "Please wait while the database is being unloaded.",
    "Instance Egress": "Unload Database",
    "Unload Data Registry": "Unload settings for",
    "Tuning & Manifest": "Additional Options",
    "Commit Unload": "Proceed Unload",
    "DBA Identity Proxy": "As dba",
    "Discrete Schema Mapping": "Split schema",
    "Declaration Only": "Class only",
    "Bypass Index Journal": "Skip index",
    "Atomic Identifiers": "Delimited identifier",
    "Traverse Dependencies": "Include referenced tables",
    "Egress Filename Mask": "Prefix for output files",
    "Resource Hash Journal": "File for hash",
    "Active Persistence Buffer": "Number of cached pages",
    "Load Scaling Predictor": "Estimate number of instances",
    "Large Object Repository": "Lo file for current directory",
};

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const [newText, oldText] of Object.entries(replacements)) {
        // match exact text inside tags or attributes to be safe
        const regex = new RegExp(newText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, oldText);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Restored text in', filePath);
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
console.log('Text restoration complete.');
