import React from 'react';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function SidebarEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-background">
      {/* Ambient glass glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-[240px]">
        <div className="relative mb-8 group">
          {/* Depth layers */}
          <div className="absolute inset-0 scale-[1.8] bg-primary/5 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative w-20 h-20 bg-background border border-border/50 rounded-2xl flex items-center justify-center shadow-premium transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1">
            <Icon 
               name="account_tree" 
               size="lg" 
               className="text-foreground/20 group-hover:text-primary transition-colors duration-500" 
            />
          </div>
          
          {/* Floating accent icon */}
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-premium animate-bounce-slow">
            <Icon name="dns" size="xs" className="text-primary-foreground font-black" />
          </div>
        </div>
        
        <Typography variant="h4" className="mb-3 font-black tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
           Select a Server
        </Typography>
        <Typography variant="body2" className="text-foreground/40 leading-relaxed font-bold tracking-tight mb-8">
           Standardize your workflow. Select a connection above to manage databases, brokers, and real-time telemetry logs.
        </Typography>
        
        {/* Interaction hint */}
        <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
           <Icon name="expand_less" size="sm" className="animate-bounce" />
           <Typography variant="caption" className="uppercase font-black tracking-[0.2em] text-[8px]">Action Required Above</Typography>
        </div>
      </div>
    </div>
  );
}
