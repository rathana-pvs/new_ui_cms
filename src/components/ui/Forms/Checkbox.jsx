import React from 'react';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

export default function Checkbox({ 
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
        inline-flex items-center gap-2 cursor-pointer select-none group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className={`
          w-5 h-5 border-2 rounded-[4px] transition-all
          border-border bg-muted/30 group-hover:border-primary/50
          peer-checked:bg-primary peer-checked:border-primary
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20
        `} />
        <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity text-primary-foreground pointer-events-none">
          <Icon name="check" size="sm" weight="600" />
        </div>
      </div>
      {label && (
        <Typography variant="span" className="font-medium text-slate-700 dark:text-slate-300">
          {label}
        </Typography>
      )}
    </label>
  );
}
