import React from 'react';
import { Icon } from '../../ds/foundation/Icon';
import { Typography } from '../../ds/foundation/Typography';
import { Skeleton } from '../../ds/layout/Skeleton';
import { StatusIndicator } from '../atoms/StatusIndicator';
import { theme } from '../../../styles/theme';

export const TreeNode = ({
  id,
  label,
  icon = 'folder',
  level = 1,
  isActive = false,
  isLoading = false,
  hasChildren = false,
  status, // "on" | "off" | "unknown" (optional)
  onToggle,
  onSelect,
  onContextMenu,
  onDoubleClick,
  children,
  open: controlledOpen, // allow external control over open state
}) => {
  const indentClass = level === 1 ? theme.tree.levelOneIndent : theme.tree.levelDeepIndent;

  const handleToggle = (e) => {
    if (e.target.open && onToggle) {
      onToggle();
    }
  };

  const handleSelect = (e) => {
    // Stop propagation so parent trees aren't selected
    e.stopPropagation();
    if (onSelect) onSelect();
  };

  const handleContextMenu = (e) => {
    if (onContextMenu) {
      e.stopPropagation();
      e.preventDefault();
      onContextMenu(e);
    }
  };

  const handleDoubleClick = (e) => {
    if (onDoubleClick) {
      e.stopPropagation();
      onDoubleClick(e);
    }
  };

  // Common wrapper classes for the summary list item
  const summaryClasses = `flex items-center gap-1.5 px-3 py-1.5 w-full text-left transition-all duration-200 cursor-pointer list-none rounded-r-md select-none group/node relative border border-transparent ${
    isActive
      ? 'text-amber-600 dark:text-bk-yellow font-medium bg-bk-yellow/5'
      : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-amber-600 dark:hover:text-bk-yellow'
  }`;

  // If node has no children dynamically (like a leaf node)
  if (!hasChildren && !children && !isLoading) {
    return (
      <button
        className={summaryClasses}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        <Icon 
          name={icon} 
          size="md" 
          weight={300}
          className={`transition-colors ${isActive ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/node:text-amber-600 dark:group-hover/node:text-bk-yellow'}`} 
        />
        <Typography variant="span" className={theme.typography.treeLabel + " truncate flex-1"}>
          {label}
        </Typography>
        {status && <StatusIndicator status={status} animate={status === 'on'} />}
        {isActive && (
          <div className={`${theme.tree.activeBarClass} ${theme.tree.activeBarColor} rounded-full`}></div>
        )}
      </button>
    );
  }

  // Node with children or that can load children
  return (
    <details
      className="group/details block"
      onToggle={handleToggle}
      open={controlledOpen}
    >
      <summary
        className={summaryClasses}
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        <Icon
          name="chevron_right"
          size="sm"
          weight={300}
          className={`transition-transform duration-150 group-open/details:rotate-90 ${isActive ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`}
        />
        <Icon 
          name={icon} 
          size="md" 
          weight={300}
          className={`transition-colors ${isActive ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/node:text-amber-600 dark:group-hover/node:text-bk-yellow'}`} 
        />
        <Typography variant="span" className={theme.typography.treeLabel + " truncate flex-1"}>
          {label}
        </Typography>
        {status && <StatusIndicator status={status} animate={status === 'on'} />}
        {isActive && (
          <div className={`${theme.tree.activeBarClass} ${theme.tree.activeBarColor} rounded-full shadow-[0_0_8px_rgba(217,119,6,0.2)]`}></div>
        )}
      </summary>

      <div className={`${indentClass} border-l ${theme.colors.treeBorder} dark:${theme.colors.treeBorderDark} space-y-0.5 mt-0.5`}>
        {isLoading ? (
          <div className="px-4 py-2 flex items-center gap-2">
            <Skeleton variant="text" width="120px" height="16px" />
          </div>
        ) : (
          children
        )}
      </div>
    </details>
  );
};
