import React from 'react';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function SidebarEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden animate-in fade-in duration-1000 bg-transparent">
      {/* Minimalist Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Flat Technical Icon */}
        <div className="relative mb-10 group">
          <div className="w-14 h-14 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-bk-yellow/5 group-hover:border-bk-yellow/20">
            <Icon name="dns" size="lg" className="text-slate-600 dark:text-slate-300 group-hover:text-bk-yellow transition-colors" weight={200} />
          </div>
          {/* Subtle connection line placeholders */}
          <div className="absolute -top-4 left-1/2 w-px h-4 bg-gradient-to-t from-slate-200 dark:from-white/10 to-transparent"></div>
          <div className="absolute -bottom-4 left-1/2 w-px h-4 bg-gradient-to-b from-slate-200 dark:from-white/10 to-transparent"></div>
          <div className="absolute top-1/2 -left-4 w-4 h-px bg-gradient-to-l from-slate-200 dark:from-white/10 to-transparent"></div>
          <div className="absolute top-1/2 -right-4 w-4 h-px bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent"></div>
        </div>
        
        {/* Typography Content */}
        <div className="space-y-2.5 max-w-[220px] opacity-80">
          <Typography variant="h4" className="text-sm font-bold text-slate-800 dark:text-white text-center tracking-tight leading-none uppercase">
            No Host Selected
          </Typography>
          
          <Typography variant="p" className="text-[12px] leading-relaxed text-slate-500 dark:text-slate-500 font-medium text-center px-1">
            Browse the host list and select a system node to begin management.
          </Typography>
        </div>
      </div>
    </div>
  );
}
