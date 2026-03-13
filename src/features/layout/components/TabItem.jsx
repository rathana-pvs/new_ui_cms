/**
 * A single tab item in the Breadcrumb bar.
 */
export default function TabItem({ 
  tabId, 
  isActive, 
  isDirty, 
  label, 
  icon, 
  onClick, 
  onClose, 
  onContextMenu 
}) {
  return (
    <div 
      className={`group flex items-center gap-2 px-5 py-2.5 border-r border-slate-200 dark:border-slate-800 font-medium text-[12px] tracking-wide cursor-pointer min-w-[140px] transition-all whitespace-nowrap relative select-none ${
        isActive 
          ? 'bg-white dark:bg-bk-side text-slate-800 dark:text-bk-yellow' 
          : 'bg-slate-100 dark:bg-bk-main text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {isActive && <div className="absolute top-0 left-0 right-0 h-[3px] bg-bk-yellow shadow-[0_0_8px_rgba(255,193,7,0.4)]"></div>}
      
      <div className="relative">
        <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-bk-yellow' : 'opacity-60 text-slate-400'}`} style={{ fontVariationSettings: isActive ? "'wght' 500" : "'wght' 300" }}>
          {icon}
        </span>
        {isDirty && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-white dark:border-bk-side shadow-sm"></div>
        )}
      </div>
      
      <span className="truncate flex-1">
        {label}
      </span>
      <div 
        className={`flex items-center justify-center p-1 ml-2 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 300" }}>close</span>
      </div>
    </div>
  );
}
