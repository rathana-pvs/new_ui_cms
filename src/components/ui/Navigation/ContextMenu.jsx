import React, { useRef, useState, useLayoutEffect } from 'react';

/**
 * A premium context menu wrapper designed for the CUBRID Design System.
 * Features viewport-aware positioning, sophisticated shadows, and glassmorphism.
 */
export default function ContextMenuWrapper({ x, y, children, onClose, width = "min-w-[240px]" }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: y, left: x });
  const [isPositioned, setIsPositioned] = useState(false);

  useLayoutEffect(() => {
    if (menuRef.current && !isPositioned) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newLeft = x;
      let newTop = y;

      // Viewport safety checks
      if (x + rect.width > viewportWidth) {
        newLeft = x - rect.width;
      }
      if (y + rect.height > viewportHeight) {
        newTop = y - rect.height;
      }

      // Safe boundaries
      newLeft = Math.max(8, newLeft);
      newTop = Math.max(8, newTop);

      setPosition({ top: newTop, left: newLeft });
      setIsPositioned(true);
    }
  }, [x, y, isPositioned]);

  return (
    <div
      ref={menuRef}
      className={`fixed z-[500] ${width} bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-premium p-1.5 animate-in fade-in zoom-in-95 duration-200 context-menu-container ${isPositioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="flex flex-col gap-0.5">
         {children}
      </div>
    </div>
  );
}
