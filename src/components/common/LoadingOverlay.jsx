import React from 'react';

const LoadingOverlay = ({ isVisible, title = "Processing", subtitle = "Please wait while we complete your request..." }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-[#1e2230] animate-in fade-in duration-300 overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
        <div className="relative h-20 w-20">
          {/* Main Spinning Orb */}
          <div className="absolute inset-0 border-[3px] border-primary/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-[3px] border-primary rounded-full animate-spin duration-[1.2s] ease-in-out shadow-[0_-4px_10px_rgba(var(--primary-rgb),0.3)]"></div>
          {/* Secondary Ring */}
          <div className="absolute inset-3 border-b-[2px] border-primary/30 rounded-full animate-spin duration-[2s] direction-reverse"></div>
          {/* Pulsing Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-[16px] font-medium text-white tracking-tight">{title}</h4>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[12px] text-slate-400 font-medium">{subtitle}</p>
            <p className="text-[10px] text-slate-500 tracking-wide animate-pulse">In Progress</p>
          </div>
        </div>

        {/* Modern Loading Strip */}
        <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-primary w-1/3 animate-[reloading_1.5s_infinite_ease-in-out] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
