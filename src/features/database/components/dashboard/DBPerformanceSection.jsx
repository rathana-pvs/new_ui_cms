import React from 'react';
import Card from '../../../../components/ui/Layout/Card';
import Table from '../../../../components/ui/Layout/Table';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function DBPerformanceSection({ dbStats }) {
  const columns = [
    { key: 'cpu', label: 'CPU' },
    { key: 'memory', label: 'Memory (MB)' },
    { key: 'qps', label: 'QPS' },
    { key: 'hitRatio', label: 'Hit Ratio' },
    { key: 'fetch', label: 'Fetch Pages' },
    { key: 'dirty', label: 'Dirty Pages' },
    { key: 'ioReads', label: 'I/O Reads' },
    { key: 'ioWrites', label: 'I/O Writes' },
  ];

  const renderRow = (row, i) => (
    <tr key={i} className="text-foreground border-b border-border/50 hover:bg-muted/5 transition-colors group/row text-[11px] font-medium">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5 w-full max-w-[100px]">
          <Typography variant="span" className="font-mono font-black">{row.cpu}</Typography>
          <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${row.cpuPct > 80 ? 'bg-rose-500' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${row.cpuPct}%` }}></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
          <Typography variant="span" className="font-mono font-black">{row.memory}</Typography>
          <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${row.memPct > 80 ? 'bg-rose-500' : 'bg-secondary'}`} style={{ width: `${row.memPct}%` }}></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
         <div className="flex items-center gap-2">
            <Icon name="bolt" size="xs" className="text-primary opacity-40" />
            <Typography variant="span" className="font-mono font-black text-primary">{row.qps}</Typography>
         </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5 w-full max-w-[120px]">
          <Typography variant="span" className="font-mono font-black">{row.hitRatio}</Typography>
          <div className="w-full bg-muted/20 rounded-full h-1 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${row.hitPct < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${row.hitPct}%` }}></div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono opacity-50">{row.fetch}</td>
      <td className="px-4 py-3 font-mono opacity-50">{row.dirty}</td>
      <td className="px-4 py-3 font-mono opacity-50">{row.ioReads}</td>
      <td className="px-4 py-3 font-mono opacity-50">{row.ioWrites}</td>
    </tr>
  );

  return (
    <Card className="overflow-hidden border-border/50 bg-background shadow-sm group">
      <details className="w-full" open>
        <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none hover:bg-muted/5 transition-all border-b border-border/50 select-none">
          <Icon name="expand_more" size="xs" className="text-primary transition-transform group-open:rotate-180" />
          <div className="flex items-center gap-2 flex-1">
             <Icon name="trending_up" size="xs" className="text-secondary opacity-60" />
             <Typography variant="h4" className="font-black tracking-tight">Real-time Performance Metrics</Typography>
          </div>
          <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
             <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
             <Typography variant="caption" className="font-black uppercase tracking-widest text-[8px] text-primary">Live Telemetry</Typography>
          </div>
        </summary>
        <div className="p-1">
           <Table 
              columns={columns}
              data={dbStats}
              renderRow={renderRow}
              variant="compact"
           />
        </div>
      </details>
    </Card>
  );
}
