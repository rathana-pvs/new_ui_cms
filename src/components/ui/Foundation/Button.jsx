import React from 'react';
import Spinner from '../Feedback/Spinner';
import Icon from './Icon';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-primary/20',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
  outline: 'bg-transparent border border-border hover:bg-muted text-foreground',
  ghost: 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-destructive/20',
};

const sizes = {
  sm: 'h-8 px-3 text-[11px] gap-1.5',
  md: 'h-9 px-4 text-[12px] gap-2',
  lg: 'h-10 px-6 text-[13px] gap-2.5',
  icon: 'h-9 w-9 p-0',
};

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  disabled = false, 
  icon, 
  iconPosition = 'left',
  children, 
  ...props 
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-bold tracking-wide rounded-lg transition-all 
        active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-0" />}
      
      {!loading && icon && iconPosition === 'left' && (
        <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
      )}
      
      {children && <span>{children}</span>}
      
      {!loading && icon && iconPosition === 'right' && (
        <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
      )}
    </button>
  );
}
