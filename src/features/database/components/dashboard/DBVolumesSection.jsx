import React from 'react';
import Card from '../../../../components/ui/Layout/Card';
import Table from '../../../../components/ui/Layout/Table';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function DBVolumesSection({ volumes }) {
  const columns = [
    { key: 'name', label: 'Volume' },
    { key: 'type', label: 'Type' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'size', label: 'Storage Health (Free / Total)' },
    { key: 'date', label: 'Modified' },
    { key: 'path', label: 'Volume Path' },
  ];

  const renderRow = (row, i) => (
    <tr key={i} className="text-foreground border-b border-border/50 hover:bg-muted/5 transition-colors group/row text-[11px] font-medium">
      <td className="px-4 py-3 font-bold">{row.name}</td>
      <td className="px-4 py-3 opacity-60">{row.type}</td>
      <td className="px-4 py-3">
         <div className="flex items-center gap-2">
            <Icon name="storage" size="xs" className="text-secondary opacity-30" />
            <Typography variant="span" className="font-bold opacity-80">{row.purpose}</Typography>
         </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
          <div className="flex items-center justify-between">
            <Typography variant="span" className="font-mono font-black text-[10px] tabular-nums">{row.free} / {row.total}</Typography>
            <Typography variant="span" className="text-[9px] font-black opacity-30">{row.freePct}% FREE</Typography>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden" title={`${row.freePct}% Free`}>
            <div className={`h-full rounded-full transition-all duration-500 ${row.freePct < 15 ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${row.freePct}%` }}></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono opacity-40">{row.date}</td>
      <td className="px-4 py-3 font-mono opacity-40 italic tabular-nums">{row.path}</td>
    </tr>
  );

  return (
    <Card className="overflow-hidden border-border/50 bg-background shadow-sm group">
      <details className="w-full" open>
        <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none hover:bg-muted/5 transition-all border-b border-border/50 select-none">
          <Icon name="expand_more" size="xs" className="text-primary transition-transform group-open:rotate-180" />
          <div className="flex items-center gap-2 flex-1">
             <Icon name="layers" size="xs" className="text-secondary opacity-60" />
             <Typography variant="h4" className="font-black tracking-tight">Logical Storage Volumes</Typography>
          </div>
          <Typography variant="caption" className="font-bold opacity-30 uppercase tracking-widest text-[8px]">Disk Allocation</Typography>
        </summary>
        <div className="p-1">
           <Table 
              columns={columns}
              data={volumes}
              renderRow={renderRow}
              variant="compact"
           />
        </div>
      </details>
    </Card>
  );
}
