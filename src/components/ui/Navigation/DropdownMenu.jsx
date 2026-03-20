import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import Typography from '../Foundation/Typography';
import Icon from '../Foundation/Icon';

/**
 * Premium SubMenu component with hover-sensing technology and viewport-aware positioning.
 */
export function SubMenu({ icon, iconColor = '', label, children, width = 'w-64' }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 'right', y: 'bottom' });
  const [isPositioned, setIsPositioned] = useState(false);
  const timerRef = useRef(null);
  const menuRef = useRef(null);
  const containerRef = useRef(null);

  const handleEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
      setIsPositioned(false);
    }, 150);
  }, []);

  useLayoutEffect(() => {
    if (open && menuRef.current && containerRef.current && !isPositioned) {
      const parentRect = containerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = 'right';
      let newY = 'bottom';

      if (parentRect.right + menuRect.width > viewportWidth) {
        newX = 'left';
      }
      if (parentRect.top + menuRect.height > viewportHeight) {
        newY = 'top';
      }

      setPosition({ x: newX, y: newY });
      setIsPositioned(true);
    }
  }, [open, isPositioned]);

  return (
    <div ref={containerRef} className="relative px-1" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className={`w-full text-left px-3 py-2 text-[12px] font-bold tracking-tight transition-all rounded-lg flex items-center justify-between group
        ${open ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted/5 hover:text-primary active:scale-[0.98]'}`}>
        <span className="flex items-center gap-2.5">
          {icon && (
            <Icon 
               name={icon} 
               size="xs" 
               className={`transition-all ${open ? 'text-primary scale-110' : (iconColor || 'opacity-40 group-hover:opacity-100 group-hover:text-primary')}`} 
            />
          )}
          <span>{label}</span>
        </span>
        <Icon 
           name={position.x === 'right' ? 'chevron_right' : 'chevron_left'} 
           size="xs" 
           className={`transition-transform duration-200 ${open ? 'text-primary translate-x-0.5' : 'opacity-20'}`} 
        />
      </button>

      {open && (
        <div 
          ref={menuRef}
          className={`absolute ${position.y === 'bottom' ? 'top-0' : 'bottom-0'} 
            ${position.x === 'right' ? 'left-full ml-2' : 'right-full mr-2'} 
            ${width} bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl 
            shadow-premium p-1.5 z-[501] animate-in fade-in zoom-in-95 duration-200
            ${isPositioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95 origin-left'}`}
        >
          {/* Accent indicator */}
          <div className="absolute left-0 top-3 bottom-3 w-[2.5px] bg-primary rounded-full shadow-premium"></div>
          <div className="flex flex-col gap-0.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Premium Dropdown Menu for top-level navigation.
 */
export function DropdownMenu({ label, children, width = 'w-60' }) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState('left');
  const [isPositioned, setIsPositioned] = useState(false);
  const timerRef = useRef(null);
  const menuRef = useRef(null);

  const handleEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
      setIsPositioned(false);
    }, 150);
  }, []);

  useLayoutEffect(() => {
    if (open && menuRef.current && !isPositioned) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      let newAlign = 'left';
      if (rect.right > viewportWidth) {
        newAlign = 'right';
      }

      setAlign(newAlign);
      setIsPositioned(true);
    }
  }, [open, isPositioned]);

  return (
    <div className="relative font-sans" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-black tracking-tight transition-all duration-300
        ${open ? 'text-primary bg-primary/10 shadow-premium-sm' : 'text-foreground/60 hover:text-primary hover:bg-muted/5'}`}>
        <span>{label}</span>
        <Icon 
           name="expand_more" 
           size="xs" 
           className={`transition-transform duration-300 ${open ? 'rotate-180 text-primary' : 'opacity-40'}`} 
        />
      </button>

      {open && (
        <div 
          ref={menuRef}
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} top-full mt-2
            ${width} bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl 
            shadow-premium p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-300
            ${isPositioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="flex flex-col gap-0.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Premium Menu Item with high-fidelity hover interactions.
 */
export function MenuItem({ icon, iconColor = '', label, onClick, href, disabled = false }) {
  const baseClasses = `flex items-center gap-3 px-3 py-2 text-[12px] font-bold tracking-tight transition-all w-full text-left rounded-lg relative group overflow-hidden`;
  const stateClasses = disabled 
    ? 'opacity-30 cursor-not-allowed grayscale' 
    : 'text-foreground/70 hover:bg-primary/5 hover:text-primary active:scale-[0.98]';

  const content = (
    <>
      {icon && (
        <Icon 
           name={icon} 
           size="xs" 
           className={`transition-all ${disabled ? 'opacity-20' : (iconColor || 'opacity-40 group-hover:opacity-100 group-hover:text-primary group-hover:scale-110')}`} 
        />
      )}
      <span className="flex-1 truncate tracking-tight">{label}</span>
      
      {!disabled && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-4 bg-primary transition-all duration-300 group-hover:w-[3px] rounded-r-full shadow-premium"></div>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <a className={`${baseClasses} ${stateClasses}`} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button className={`${baseClasses} ${stateClasses}`} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {content}
    </button>
  );
}

export function MenuDivider() {
  return (
    <div className="px-3 py-2 flex items-center gap-3 opacity-20">
      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
        <div className="w-1 h-1 rounded-full bg-border/50"></div>
      </div>
    </div>
  );
}
