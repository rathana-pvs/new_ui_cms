import React from 'react';

const variants = {
  h1: 'text-3xl font-black tracking-tight',
  h2: 'text-2xl font-black tracking-tight',
  h3: 'text-xl font-bold tracking-tight',
  h4: 'text-lg font-bold tracking-tight',
  h5: 'text-base font-bold tracking-tight',
  h6: 'text-sm font-bold tracking-tight',
  p: 'text-sm leading-relaxed',
  span: 'text-sm',
  label: 'text-[10px] font-bold uppercase tracking-widest',
  caption: 'text-[11px] font-medium text-muted-foreground',
  code: 'font-mono text-[12px] bg-muted px-1.5 py-0.5 rounded-sm',
};

export default function Typography({ 
  variant = 'p', 
  as, 
  className = '', 
  children,
  ...props 
}) {
  const Component = as || (variant === 'caption' ? 'span' : variant === 'code' ? 'code' : variant);
  
  const baseClasses = variants[variant] || variants.p;
  
  return (
    <Component 
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
