import React from 'react';
import Button from '../Foundation/Button';
import Icon from '../Foundation/Icon';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${className}`}>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon="chevron_left"
        >
          Prev
        </Button>
        <div className="flex items-center px-4 gap-2">
            <span className="text-[11px] font-bold text-foreground">{currentPage}</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">of</span>
            <span className="text-[11px] font-bold text-foreground">{totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon="chevron_right"
          iconPosition="right"
        >
          Next
        </Button>
      </div>
      
      {/* Optional Page Direct Access for larger sets */}
      {totalPages > 5 && (
          <div className="hidden md:flex items-center gap-1.5 bg-muted/20 p-1 rounded-md border border-border/50">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2">Jump to</span>
              <input 
                type="text" 
                placeholder="..."
                className="w-10 h-7 text-[11px] font-black text-center bg-card border border-border rounded focus:border-primary outline-none"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                            onPageChange(val);
                            e.target.value = '';
                        }
                    }
                }}
              />
          </div>
      )}
    </div>
  );
}
