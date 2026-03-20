import React from 'react';
import Typography from '../Foundation/Typography';
import Spinner from './Spinner';

const LoadingOverlay = ({ isVisible, title = "Processing", subtitle = "Please wait while we complete your request..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-12">
        <div className="relative h-24 w-24">
          <Spinner size="lg" className="scale-150" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-4 w-4 bg-primary rounded-full shadow-premium animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <Typography variant="h3" className="font-black tracking-tight">{title}</Typography>
          <div className="flex flex-col items-center gap-2">
            <Typography variant="body" className="opacity-60 max-w-[280px] leading-relaxed italic">{subtitle}</Typography>
            <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
               <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
               <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-[8px] text-primary">System Processing</Typography>
            </div>
          </div>
        </div>

        {/* Premium Loading Strip */}
        <div className="w-64 h-[2.5px] bg-border/30 rounded-full overflow-hidden mt-4 shadow-inner">
          <div className="h-full bg-primary w-1/3 animate-[reloading_1.5s_infinite_offset] rounded-full shadow-premium"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
