import React from 'react';
import Typography from '../Foundation/Typography';

export default function Toggle({ 
  label, 
  checked, 
  onChange, 
  disabled = false, 
  className = '',
  ...props 
}) {
  return (
    <label 
      className={`
        inline-flex items-center gap-3 cursor-pointer select-none group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex items-center">
        <input 
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className={`
          w-10 h-5.5 bg-muted-foreground/20 rounded-full transition-all border border-transparent
          peer-checked:bg-primary/90 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20
          group-hover:bg-muted-foreground/30 peer-checked:group-hover:bg-primary
          h-5 w-9
        `} />
        <div className={`
          absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all transform shadow-sm
          peer-checked:translate-x-4
        `} />
      </div>
      {label && (
        <Typography variant="span" className="font-medium text-slate-700 dark:text-slate-300">
          {label}
        </Typography>
      )}
    </label>
  );
}
