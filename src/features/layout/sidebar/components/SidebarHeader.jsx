import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function SidebarHeader() {
  return (
    <div className="px-6 py-6 border-b border-slate-200 dark:border-white/5 flex items-center gap-4 bg-white dark:bg-bk-side relative overflow-hidden group/header transition-all duration-500 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-bk-yellow/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover/header:bg-bk-yellow/10 transition-all duration-700"></div>
      
      <div className="relative flex-shrink-0 animate-in zoom-in duration-700 delay-100">
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-white/[0.08] dark:to-transparent border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center justify-center p-2.5 transition-all duration-500 group-hover/header:-translate-y-1 group-hover/header:rotate-[-4deg] group-hover/header:shadow-bk-yellow/30 group-hover/header:shadow-xl group-hover/header:border-bk-yellow/40">
          <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-full h-full object-contain filter drop-shadow-sm group-hover/header:scale-110 transition-transform duration-500" />
          
          {/* Subtle Glow Ring */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
        </div>
      </div>
      
      <div className="flex flex-col min-w-0 relative z-10 transition-transform duration-500 group-hover/header:translate-x-0.5">
        <div className="flex items-center gap-2">
          <Typography variant="h1" className="text-[15px] font-black tracking-[0.12em] text-slate-800 dark:text-white leading-none uppercase group-hover/header:text-bk-yellow transition-colors duration-300">
            CUBRID
          </Typography>
        </div>
        <Typography variant="caption" className="text-[9px] font-black text-slate-400 dark:text-slate-500 leading-tight uppercase tracking-[0.2em] opacity-80 mt-1">
          Manager
        </Typography>
      </div>
    </div>
  );
}
