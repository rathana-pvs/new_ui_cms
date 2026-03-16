export default function SidebarEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-bk-yellow/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-[200px]">
        <div className="relative mb-6">
          {/* Background circles for depth */}
          <div className="absolute inset-0 scale-[1.5] bg-slate-100 dark:bg-white/5 rounded-full blur-xl opacity-50"></div>
          <div className="relative w-16 h-16 bg-white dark:bg-bk-side rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-white/5 transition-all">
            <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500" style={{ fontVariationSettings: "'wght' 200" }}>account_tree</span>
          </div>
          {/* Floating smaller icon */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-bk-yellow rounded-lg flex items-center justify-center shadow-md transition-all">
            <span className="material-symbols-outlined text-bk-side text-[18px]" style={{ fontVariationSettings: "'wght' 500" }}>dns</span>
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight mb-2">No Server Selected</h3>
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-500 font-medium">
          Select a connection from the list above to manage databases, brokers, and view logs.
        </p>
        
        {/* Subtle pointing arrow for UX */}
        <div className="mt-8 animate-bounce opacity-30">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_less</span>
        </div>
      </div>
    </div>
  );
}
