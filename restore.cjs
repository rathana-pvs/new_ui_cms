const fs = require('fs');
const path = require('path');

const replacements = {
    // Sidebar.jsx
    "Connected Systems": "Hosts",
    "No Nodes Found": "No Hosts Found",
    "Resource Hierarchy": "Databases",
    "Operational Nodes": "Brokers",
    "System Analytics": "Logs",
    "No Active Instances": "No databases found",
    "No Active Brokers": "No brokers found",
    "User Management": "User",
    "Automation": "Trigger",
    "Query Plans": "Plan",
    "Space Analysis": "Space",
    "Operation Logs": "Log",
    "Endpoint Config": "Broker Status",
    "Real-time Stats": "Broker Log",
    "Register Node": "Add Host",
    "Terminate Engine": "Stop Database",
    "Initialize Engine": "Start Database",
    "Database Operations": "Manage Database",
    "Unload Utility": "Database Unload",
    "Load Utility": "Database Load",
    "Integrity Check": "Check Database",
    "Space Optimization": "Compact Database",
    "Cloning Utility": "Copy Database",
    "New Database": "Create Database",
    "Alias Refactor": "Rename Database",
    "Disaster Recovery": "Restore Database",
    "Snapshots/Backup": "Backup Database",
    "Purge Instance": "Delete Database",
    "Insights & Health": "Database Info",
    "Lock Analyzer": "Lock Information",
    "Transaction Tracker": "Transaction Info",
    "Query Execution Plan": "Plan Dump",
    "Parameters State": "Param Dump",
    "Object Exploration": "OID Navigation",
    "Instance Preferences": "Properties",
    "Broker Engine Trace": "Broker Log",
    "Manager Audit Log": "Manager Log",
    "Node Error Stream": "Error Log",
    "Database Configuration": "Database Configuration", 
    "System Idle": "Select a host to view databases", 

    // Header.jsx
    "Change Host": "Edit Host",
    "Export Host": "Export Hosts",
    "Import Host": "Import Hosts",
    "Start Service": "Start Service",
    "Stop Service": "Stop Service",
    "Dashboard Config": "Dashboard Settings",
    "Edit Cubrid Config": "Edit cubrid.conf",
    "Edit Broker Config": "Edit broker.conf",
    "Cubrid Manager Config": "Edit cm.conf",

    // Modals
    "Pre-Execution Configuration": "Option",
    "Unload Data Registry": "Select Unload Option",
    "Source Instance": "Source Database",
    "Source Context": "Database Information",
    "Target Repository": "Target directory",
    "Secret Key": "Password",
    "Object Resource Table": "Object/Class",
    "System & Client Map": "Client",
    "Global Server Constraints": "Server Info",
    "Active Transactional Streams": "Client Map",
    "Lock Escalation Threshold": "Escalation",
    "Deadlock Detection Interval": "Deadlock interval",
    "Process Path": "Pname",
    "Wait": "Timeout",
    "Security UID": "Uid",
    "Host Node": "Host",
    "Isolation": "Isolation Level",
    "Post-Egress Audit Log": "Unload Result",
    "Resource Identity": "Class Name",
    "Total Objects": "Total Instance",
    "Success Delta": "Success Instance",
    "Finalize Log": "Close",
    "Execution Summary": "Unload Result",
    "Session Analysis": "Lock Information",
    "Locking Information": "Lock Information"
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
