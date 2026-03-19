const fs = require('fs');
const filePath = '/home/rathana/Desktop/design/src/features/layout/components/Sidebar.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replacements
content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-card');
content = content.replace(/bg-white dark:bg-slate-800/g, 'bg-card');
content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-muted');
content = content.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-muted/50');
content = content.replace(/hover:bg-slate-50 dark:hover:bg-slate-800/g, 'hover:bg-muted/50 hover:text-foreground');
content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-muted');
content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-700/g, 'hover:bg-muted');
content = content.replace(/hover:bg-white\/50 dark:hover:bg-slate-800/g, 'hover:bg-background/50 hover:text-foreground');
content = content.replace(/bg-white\/60 dark:bg-slate-900\/60/g, 'bg-background/80');

content = content.replace(/border-slate-200 dark:border-slate-800/g, 'border-border');
content = content.replace(/border-slate-200 dark:border-slate-700/g, 'border-border');
content = content.replace(/border-slate-100 dark:border-slate-700/g, 'border-border');

content = content.replace(/text-slate-900 dark:text-white/g, 'text-foreground');
content = content.replace(/text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/g, 'text-muted-foreground hover:bg-muted/50 hover:text-foreground');
content = content.replace(/text-slate-700 dark:text-slate-200/g, 'text-muted-foreground');
content = content.replace(/text-slate-600 hover:text-primary dark:text-slate-400/g, 'text-muted-foreground hover:text-foreground');
content = content.replace(/text-slate-600 dark:text-slate-300/g, 'text-foreground');
content = content.replace(/text-slate-500/g, 'text-muted-foreground');
content = content.replace(/text-slate-400/g, 'text-muted-foreground opacity-80');

content = content.replace(/bg-primary\/10 text-primary font-semibold/g, 'bg-muted text-foreground font-semibold shadow-ob-inset');

fs.writeFileSync(filePath, content);
console.log('Sidebar replacements done');
