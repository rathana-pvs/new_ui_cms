import React from 'react';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

export default function Breadcrumbs({ 
  items = [], 
  onNavigate, 
  className = "" 
}) {
  return (
    <nav className={`flex items-center gap-2 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <button
              onClick={() => !isLast && onNavigate?.(item)}
              disabled={isLast}
              className={`
                flex items-center gap-1.5 transition-colors group
                ${isLast ? 'cursor-default' : 'hover:text-primary cursor-pointer'}
              `}
            >
              {item.icon && (
                <Icon 
                  name={item.icon} 
                  size="sm" 
                  className={isLast ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} 
                />
              )}
              <Typography 
                variant="span" 
                className={`
                  font-bold tracking-tight text-[11px] uppercase
                  ${isLast ? 'text-foreground' : 'text-muted-foreground'}
                `}
              >
                {item.label}
              </Typography>
            </button>
            {!isLast && (
              <Icon name="chevron_right" size="sm" className="text-muted-foreground/30" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
