import React from 'react';

export default function Icon({ 
  name, 
  size = 'md', // sm: 16px, md: 20px, lg: 24px, xl: 32px
  className = '', 
  weight = 300,
  ...props 
}) {
  const sizeMap = {
    sm: 'text-[16px]',
    md: 'text-[20px]',
    lg: 'text-[24px]',
    xl: 'text-[32px]',
  };

  return (
    <span 
      className={`material-symbols-outlined select-none ${sizeMap[size] || sizeMap.md} ${className}`}
      style={{ fontVariationSettings: `'wght' ${weight}` }}
      {...props}
    >
      {name}
    </span>
  );
}
