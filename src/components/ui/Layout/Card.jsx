import React from 'react';
import Typography from '../Foundation/Typography';

export default function Card({ 
  title, 
  subtitle, 
  headerAction,
  className = '', 
  children, 
  ...props 
}) {
  return (
    <div 
      className={`bg-card text-card-foreground border rounded-lg shadow-sm overflow-hidden flex flex-col ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-5 py-4 border-b bg-muted/10 flex items-start justify-between">
          <div className="space-y-0.5">
            {title && (
              <Typography variant="h6" className="font-bold tracking-tight">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" className="text-muted-foreground">
                {subtitle}
              </Typography>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 p-5">
        {children}
      </div>
    </div>
  );
}
