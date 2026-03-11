import { useState, useRef, useCallback, useLayoutEffect } from 'react';

/**
 * Reusable submenu component with hover delay.
 * Keeps the submenu open for delay ms after mouse leaves,
 * giving users time to move from the trigger to the submenu.
 */
export function SubMenu({ icon, iconColor = '', label, children, width = 'w-56', gap = 'ml-1' }) {
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
    }, 100);
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
    <div ref={containerRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="w-full text-left px-3 py-1.5 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between transition-colors rounded-sm group">
        <span className="flex items-center gap-2">
          {icon && <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>}
          {label}
        </span>
        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-100 transition-colors">
          {position.x === 'right' ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
      {open && (
        <div 
          ref={menuRef}
          className={`absolute ${position.y === 'bottom' ? 'top-0' : 'bottom-0'} ${position.x === 'right' ? 'left-full ml-1' : 'right-full mr-1'} ${width} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm p-1.5 z-50 animate-in fade-in zoom-in-95 duration-75 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Reusable top-level dropdown menu with hover delay.
 */
export function DropdownMenu({ label, children, width = 'w-48' }) {
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
    }, 100);
  }, []);

  useLayoutEffect(() => {
    if (open && menuRef.current && !isPositioned) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      let newAlign = 'left';
      if (rect.right > viewportWidth) {
        newAlign = 'right';
      } else if (rect.left < 0) {
        newAlign = 'left';
      }

      setAlign(newAlign);
      setIsPositioned(true);
    }
  }, [open, isPositioned]);

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className={`flex items-center gap-1 hover:text-primary transition-colors py-1 ${open ? 'text-primary' : ''}`}>
        <span>{label}</span>
        <span className="material-symbols-outlined text-[16px]">expand_more</span>
      </button>
      {open && (
        <div 
          ref={menuRef}
          className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} top-full mt-1 ${width} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm p-1.5 z-50 animate-in fade-in zoom-in-95 duration-75 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="space-y-0.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple menu item for use inside DropdownMenu or SubMenu.
 */
export function MenuItem({ icon, iconColor = '', label, onClick, href, disabled = false }) {
  const cls = `flex items-center gap-2 px-3 py-1.5 text-[13px] transition-colors w-full text-left rounded-sm ${disabled ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`;
  
  if (href) {
    return (
      <a className={cls} href={href}>
        {icon && <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button className={cls} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {icon && <span className={`material-symbols-outlined text-[16px] ${disabled ? 'text-slate-400' : iconColor}`}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

export function MenuDivider() {
  return <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>;
}
