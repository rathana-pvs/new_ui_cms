import { Typography } from '../../../components/ds/foundation/Typography';
import { Icon } from '../../../components/ds/foundation/Icon';

/**
 * A single tab item in the Breadcrumb bar.
 */
export default function TabItem({ 
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
      className={`group flex items-center gap-3 px-5 h-full border-r border-slate-200 dark:border-white/5 cursor-pointer min-w-[140px] max-w-[240px] transition-all whitespace-nowrap relative select-none ${
        isActive 
          ? 'bg-white dark:bg-bk-side z-10' 
          : 'bg-slate-100 dark:bg-bk-main text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-bk-yellow shadow-[0_0_8px_rgba(255,193,7,0.4)]"></div>}
      
      <div className="relative flex items-center justify-center">
        <Icon 
           name={icon || 'description'} 
           size="18px" 
           className={isActive ? 'text-bk-yellow' : 'text-slate-400 opacity-60'} 
           weight={isActive ? 500 : 300}
        />
        {isDirty && (
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-500 rounded-full border border-white dark:border-bk-side shadow-sm"></div>
        )}
      </div>
      
      <Typography 
        variant="caption" 
        className={`truncate flex-1 font-medium text-[13px] ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
      >
        {label}
      </Typography>

      <div 
        className={`flex items-center justify-center size-6 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <Icon name="close" size="16px" weight={400} className="text-slate-400" />
      </div>
    </div>
  );
}
