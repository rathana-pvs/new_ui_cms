import React from 'react';
import Typography from '../Foundation/Typography';

export default function Input({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  disabled = false,
  ...props 
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <Typography variant="label" className="ml-0.5 text-muted-foreground">
          {label}
        </Typography>
      )}
      <div className="relative group/field">
        <input
          disabled={disabled}
          className={`
            w-full h-9 px-3 bg-muted/30 border rounded-lg text-[12px] font-medium transition-all
            placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20
            ${error ? 'border-destructive/50 ring-destructive/20' : 'border-border focus:border-primary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-primary/30'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <Typography variant="caption" className="mt-1 text-destructive font-bold ml-0.5">
            {error}
          </Typography>
        )}
      </div>
    </div>
  );
}
