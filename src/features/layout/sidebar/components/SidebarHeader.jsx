import React from 'react';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function SidebarHeader() {
  return (
    <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3 bg-background relative overflow-hidden group/header">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative flex-shrink-0">
        <div className="relative w-8 h-8 rounded-[10px] bg-muted/5 border border-border/50 shadow-premium-sm flex items-center justify-center p-1.5 transition-all duration-500 group-hover/header:-translate-y-1 group-hover/header:rotate-6">
          <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-full h-full object-contain" />
        </div>
      </div>
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
           <Typography variant="h4" className="font-black tracking-tight text-foreground leading-none uppercase flex items-center gap-1">
             <span className="text-primary">CUBRID</span>
             <span className="opacity-30 font-light lowercase">manager</span>
           </Typography>
           <div className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
              <Typography variant="caption" className="font-black text-primary text-[7px] uppercase tracking-widest">v1.0</Typography>
           </div>
        </div>
        <Typography variant="caption" className="text-[8px] font-bold opacity-20 uppercase tracking-[0.2em] mt-1 group-hover/header:opacity-40 transition-opacity">
           Distributed Enterprise Suite
        </Typography>
      </div>
    </div>
  );
}
