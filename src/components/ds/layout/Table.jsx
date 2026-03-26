import React, { useState } from 'react';
import { Icon } from '../foundation/Icon';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export const Table = ({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No data available',
  headersVisible = true,
  sortable = true,
  loading = false,
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState(null);

  const handleSort = (accessor) => {
    if (!sortable) return;
    let direction = 'asc';
    if (sortConfig && sortConfig.key === accessor && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: accessor, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading && data.length === 0) {
    return (
      <div className="w-full space-y-2 p-2">
        <Skeleton variant="rect" height="32px" />
        <Skeleton variant="rect" height="32px" />
        <Skeleton variant="rect" height="32px" />
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return <EmptyState title={emptyMessage} icon="table_chart" />;
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {headersVisible && (
          <thead>
            <tr className="bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
              {columns.map((col, idx) => (
                <th
                  key={col.accessor || idx}
                  className={`px-3 py-1 text-[13px] font-medium text-slate-500 ${col.className || ''} ${sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {col.header}
                    {sortable && sortConfig?.key === col.accessor && (
                      <Icon
                        name={sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        size="xs"
                        className="text-bk-yellow"
                       weight={300} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {sortedData.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              className={`hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.accessor || colIdx}
                  className="px-3 py-1 text-[12px] font-mono font-medium text-slate-700 dark:text-slate-300 border-r border-transparent last:border-r-0"
                >
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
};
