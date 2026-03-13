export default function SidebarHeader() {
  return (
    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5 bg-white dark:bg-bk-side relative overflow-hidden group/header">
      <div className="relative flex-shrink-0">
        <div className="relative w-7 h-7 rounded-md bg-slate-50 dark:bg-bk-main border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center p-1.5 transition-all duration-500 group-hover/header:-translate-y-0.5">
          <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-full h-full object-contain" />
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 min-w-0">
        <h1 className="text-[12px] font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase flex items-center gap-1">
          <span className="text-bk-yellow font-extrabold tracking-wider">CUBRID</span>
          <span className="text-slate-400 dark:text-slate-500 font-light lowercase tracking-tight opacity-70">manager</span>
        </h1>
        <span className="px-1 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3px] text-[6px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter ml-1">
          v1.0
        </span>
      </div>
    </div>
  );
}
