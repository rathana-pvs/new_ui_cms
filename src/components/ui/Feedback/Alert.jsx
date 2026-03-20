import React from 'react';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

const variants = {
  info: 'bg-accent/10 border-accent/20 text-accent-foreground',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
};

const icons = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

export default function Alert({ 
  variant = 'info', 
  title, 
  onClose, 
  className = '', 
  children 
}) {
  return (
    <div className={`
      relative p-4 rounded-lg border flex items-start gap-3 transition-all animate-in fade-in zoom-in-95
      ${variants[variant] || variants.info}
      ${className}
    `}>
      <Icon name={icons[variant] || icons.info} className="mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && (
          <Typography variant="h6" className="font-bold leading-tight">
            {title}
          </Typography>
        )}
        <div className="text-[12px] font-medium leading-relaxed opacity-90">
          {children}
        </div>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
}
