import React from 'react';
import Typography from '../Foundation/Typography';

export default function Radio({ 
  label, 
  value,
  name,
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
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className={`
          w-5 h-5 border-2 rounded-full transition-all
          border-border bg-muted/30 group-hover:border-primary/50
          peer-checked:border-primary peer-checked:bg-transparent
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20
        `} />
        <div className={`
          absolute w-2.5 h-2.5 rounded-full bg-primary
          scale-0 peer-checked:scale-100 transition-transform
          pointer-events-none
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
