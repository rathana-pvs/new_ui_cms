import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function SidebarHeader() {
  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] flex items-center gap-3 bg-white dark:bg-white/[0.01] relative overflow-hidden group/header transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
      {/* Background Accent - simplified */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover/header:bg-amber-500/10 transition-all duration-700"></div>
      
      <div className="relative flex-shrink-0 animate-in zoom-in duration-500">
        <div className="relative w-8 h-8 rounded-lg bg-white dark:bg-white/[0.08] border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center justify-center p-1.5 transition-all group-hover/header:border-amber-500/40 group-hover/header:shadow-amber-500/10 active:scale-95">
          <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-full h-full object-contain filter group-hover/header:scale-110 transition-transform duration-500" />
        </div>
      </div>
      
      <div className="flex flex-col min-w-0 relative z-10">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors group-hover/header:text-amber-500">
            CUBRID
          </span>
          <span className="text-[10px] font-bold text-amber-500/80 border border-amber-500/20 bg-amber-500/10 rounded px-1 py-0.5 leading-none tracking-tighter">
            Admin
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none uppercase tracking-[0.2em] opacity-80 mt-1">
          Technical Console
        </span>
      </div>
    </div>
  );
}
