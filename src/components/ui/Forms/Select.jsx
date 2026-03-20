import React from 'react';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

export default function Select({ 
  label, 
  error, 
  options = [], 
  value, 
  onChange, 
  className = '', 
  containerClassName = '',
  disabled = false,
  placeholder = 'Select an option',
  ...props 
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <Typography variant="label" className="ml-0.5 text-muted-foreground">
          {label}
        </Typography>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`
            w-full h-9 px-3 bg-muted/30 border rounded-lg text-[12px] font-medium appearance-none transition-all
            focus:outline-none focus:ring-2 focus:ring-primary/20
            ${error ? 'border-destructive/50 ring-destructive/20' : 'border-border focus:border-primary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/30 cursor-pointer'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option 
              key={option.value || option} 
              value={option.value || option}
              className="bg-card text-foreground"
            >
              {option.label || option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
          <Icon name="expand_more" size="sm" />
        </div>
      </div>
      {error && (
        <Typography variant="caption" className="mt-1 text-destructive font-bold ml-0.5">
          {error}
        </Typography>
      )}
    </div>
  );
}
