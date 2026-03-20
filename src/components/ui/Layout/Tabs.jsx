import React from 'react';
import Typography from '../Foundation/Typography';

export default function Tabs({ 
  tabs = [], 
  activeTab, 
  onChange, 
  className = '', 
  variant = 'line', // 'line', 'pills'
}) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className={`flex items-center gap-1 ${variant === 'line' ? 'border-b border-border' : ''}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          if (variant === 'pills') {
            return (
              <button
                key={tab.id}
                onClick={() => onChange?.(tab.id)}
                className={`
                  px-4 py-1.5 rounded-full text-[12px] font-bold transition-all
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                {tab.label}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange?.(tab.id)}
              className={`
                px-4 py-3 relative text-[12px] font-bold transition-colors
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>
      <div className="animate-in fade-in duration-300">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
