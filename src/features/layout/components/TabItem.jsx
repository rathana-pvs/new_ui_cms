import React from 'react';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';

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
      className={`
        group relative flex items-center gap-2.5 px-5 py-2.5 
        border-r border-border/40 cursor-pointer 
        transition-all duration-500 min-w-[140px] max-w-[220px] select-none
        ${isActive 
          ? 'bg-background shadow-[0_4px_25px_rgba(0,0,0,0.12)] z-10' 
          : 'bg-muted/5 hover:bg-muted/10 opacity-50 hover:opacity-100'}
      `}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Icon 
        name={icon} 
        size="xs" 
        className={`transition-all duration-500 ${isActive ? 'text-primary scale-110' : 'text-foreground/30 group-hover:text-foreground/50'}`} 
      />
      
      <Typography 
        variant="caption" 
        className={`
          flex-1 truncate font-black tracking-tight text-[10px] uppercase
          transition-colors duration-500
          ${isActive ? 'text-foreground' : 'text-foreground/30 group-hover:text-foreground/50'}
        `}
      >
        {label}
        {isDirty && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
      </Typography>

      <button
        className={`
          p-1 rounded-lg opacity-0 group-hover:opacity-100 
          hover:bg-destructive/10 hover:text-destructive 
          transition-all duration-300 active:scale-90
          ${isActive ? 'opacity-40 hover:opacity-100' : ''}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <Icon name="close" size="xs" />
      </button>

      {/* Active High-Fidelity Indicator */}
      {isActive && (
        <div className="absolute inset-x-0 top-0 h-[3px] bg-primary animate-in slide-in-from-left-full duration-700 ease-out">
           <div className="absolute inset-0 bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]"></div>
        </div>
      )}
    </div>
  );
}
