import React from 'react';
import { createPortal } from 'react-dom';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';
import Button from '../Foundation/Button';

/**
 * Standardized Modal Component
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  icon, 
  iconVariant = 'primary',
  footer, 
  maxWidth = 'max-w-lg', 
  centerHeader = false,
  children 
}) {
  if (!isOpen) return null;

  const getIconStyles = () => {
    switch (iconVariant) {
      case 'danger': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className={`relative w-full ${maxWidth} bg-card text-card-foreground rounded-lg shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${iconVariant === 'danger' ? 'bg-destructive/60' : 'bg-primary/60'}`}></div>
        
        {/* Header */}
        <div className={`px-5 py-4 border-b border-border/50 flex items-start justify-between bg-muted/10 ${centerHeader ? 'flex-col items-center pt-8' : ''}`}>
          <div className={`flex items-start gap-3 ${centerHeader ? 'flex-col items-center' : ''}`}>
            {icon && (
              <div className={`flex items-center justify-center rounded-lg border ${centerHeader ? 'w-12 h-12 mb-2' : 'w-8 h-8'} ${getIconStyles()}`}>
                <Icon name={icon} size={centerHeader ? 'lg' : 'md'} weight={centerHeader ? 300 : 400} />
              </div>
            )}
            <div className={centerHeader ? 'text-center' : ''}>
              <Typography variant={centerHeader ? 'h3' : 'h6'} className="font-bold tracking-tight">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" className="text-muted-foreground mt-0.5">
                  {subtitle}
                </Typography>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all ${centerHeader ? 'absolute top-3 right-3' : ''}`}
          >
            <Icon name="close" size="md" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-border/50 bg-muted/10 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
