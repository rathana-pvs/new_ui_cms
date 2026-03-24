import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function SidebarHeader() {
  return (
    <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 bg-white dark:bg-bk-side relative overflow-hidden group/header">
      <div className="relative flex-shrink-0 animate-in zoom-in duration-500">
        <div className="relative w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center p-2 transition-all duration-300 group-hover/header:-translate-y-0.5 group-hover/header:shadow-bk-yellow/20 group-hover/header:shadow-lg">
          <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-full h-full object-contain" />
        </div>
      </div>
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 translate-y-0.5">
          <Typography variant="h1" className="text-[13px] font-black tracking-[0.1em] text-bk-yellow leading-none uppercase">
            CUBRID
          </Typography>
          <div className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-[4px] shadow-sm">
             <Typography variant="caption" className="text-[7px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">
              v1.0
             </Typography>
          </div>
        </div>
        <Typography variant="caption" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-tight lowercase tracking-widest opacity-60">
          management system
        </Typography>
      </div>
    </div>
  );
}
