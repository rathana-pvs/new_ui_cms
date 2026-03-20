import React from 'react';
import Typography from '../Foundation/Typography';

export default function Table({ 
  columns = [], 
  data = [], 
  onRowClick, 
  emptyMessage = "No data available",
  className = "",
  containerClassName = "",
  headersVisible = true,
  ...props
}) {
  return (
    <div className={`overflow-x-auto custom-scrollbar rounded-lg border border-border bg-card/50 ${containerClassName}`}>
      <table className={`w-full text-left border-collapse table-fixed ${className}`} {...props}>
        {headersVisible && (
          <thead className="bg-muted/30 sticky top-0 z-10">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 ${col.headerClassName || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border/20">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick?.(row)}
                className={`
                  group/row transition-all duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : 'hover:bg-muted/10'}
                `}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    className={`px-4 py-2.5 text-[12px] font-medium text-foreground transition-colors ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground/20" style={{ fontVariationSettings: "'wght' 100" }}>
                    inbox
                  </span>
                  <Typography variant="caption" className="text-muted-foreground/60 italic font-medium">
                    {emptyMessage}
                  </Typography>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
