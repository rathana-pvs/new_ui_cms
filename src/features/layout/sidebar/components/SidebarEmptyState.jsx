import React from 'react';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function SidebarEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden animate-in fade-in duration-1000 bg-transparent">
      {/* Decorative Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-bk-yellow/[0.04] rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-[280px]">
        {/* Animated Icon Group */}
        <div className="relative mb-12 w-24 h-24 mx-auto flex items-center justify-center group">
          {/* Outer Glow */}
          <div className="absolute inset-0 scale-[2.5] bg-bk-yellow/[0.03] rounded-full blur-3xl opacity-50 group-hover:scale-[3] transition-transform duration-1000"></div>
          
          {/* Main Icon Container */}
          <div className="relative w-24 h-24 bg-white dark:bg-white/[0.03] rounded-[2.25rem] flex items-center justify-center shadow-2xl border border-white/5 transition-all group-hover:-translate-y-2 duration-700 backdrop-blur-sm">
            <Icon name="dns" size="xl" className="text-slate-300 dark:text-bk-yellow opacity-90 drop-shadow-[0_0_15px_rgba(255,193,7,0.3)]" weight={300} />
          </div>
        </div>
        
        {/* Typography Content */}
        <Typography variant="h3" className="text-xs font-black text-slate-800 dark:text-bk-yellow tracking-[0.3em] uppercase mb-5 leading-none opacity-90 drop-shadow-sm">
          No Node Selected
        </Typography>
        
        <Typography variant="p" className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400/60 font-medium tracking-tight px-4 max-w-[240px]">
          Select a system node from the host list to visualize architecture, manage brokers, and stream real-time logs.
        </Typography>
        
        {/* Animated Visual Cue */}
        <div className="mt-14 flex flex-col items-center space-y-4 opacity-30">
          <div className="w-px h-16 bg-gradient-to-b from-bk-yellow to-transparent"></div>
          <Icon name="keyboard_arrow_down" size="sm" className="animate-bounce text-bk-yellow"  weight={300} />
        </div>
      </div>
    </div>
  );
}
