import React from 'react';
import { Typography } from '../foundation/Typography';

export const Card = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`bg-white dark:bg-bk-side border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          {title && <Typography variant="h4" className="text-base font-bold text-slate-900 dark:text-white leading-tight">{title}</Typography>}
          {subtitle && <Typography variant="p" className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</Typography>}
        </div>
      )}
      
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
          {footer}
        </div>
      )}
    </div>
  );
};
