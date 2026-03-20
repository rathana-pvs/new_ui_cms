import React from 'react';

const sizes = {
  sm: 'w-3 h-3 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

export default function Spinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}) {
  const variantStyles = {
    primary: 'border-primary/30 border-t-primary',
    secondary: 'border-muted-foreground/30 border-t-muted-foreground',
    white: 'border-white/30 border-t-white',
    black: 'border-black/30 border-t-black',
  };

  return (
    <div 
      className={`
        rounded-full animate-spin
        ${sizes[size] || sizes.md} 
        ${variantStyles[variant] || variantStyles.primary} 
        ${className}
      `}
    />
  );
}
