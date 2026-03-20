import React from 'react';
import Card from '../../../../components/ui/Layout/Card';
import Table from '../../../../components/ui/Layout/Table';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';
import Button from '../../../../components/ui/Foundation/Button';

export default function DBBrokersCASSection({ brokersCAS, onViewSQLLog, onViewSlowQueryLog, onRestartCAS }) {
  const columns = [
    { key: 'broker', label: 'Broker' },
    { key: 'id', label: 'ID' },
    { key: 'pid', label: 'PID' },
    { key: 'qps', label: 'QPS' },
    { key: 'lqs', label: 'LQS' },
    { key: 'status', label: 'Status' },
    { key: 'lastConn', label: 'Last Connection' },
    { key: 'actions', label: 'Actions', className: 'text-center' },
  ];

  const renderRow = (row, i) => (
    <tr key={i} className="text-foreground border-b border-border/50 hover:bg-muted/5 transition-colors group/row text-[11px] font-medium">
      <td className="px-4 py-3 font-bold">{row.broker}</td>
      <td className="px-4 py-3 font-mono opacity-60">{row.id}</td>
      <td className="px-4 py-3 font-mono opacity-60">{row.pid}</td>
      <td className="px-4 py-3">
         <div className="flex items-center gap-1.5">
            <Icon name="bolt" size="xs" className="text-primary opacity-30" />
            <Typography variant="span" className="font-mono font-black text-primary">{row.qps}</Typography>
         </div>
      </td>
      <td className="px-4 py-3 font-mono opacity-60">{row.lqs}</td>
      <td className="px-4 py-3">
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm
          ${row.status === 'READY' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5' 
            : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5'}`}>
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${row.status === 'READY' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {row.status}
        </div>
      </td>
      <td className="px-4 py-3 opacity-40 italic">{row.lastConn}</td>
      <td className="px-4 py-3">
         <div className="flex items-center justify-center gap-2">
            <Button 
               variant="ghost" 
               className="w-8 h-8 p-0 min-w-0 border-border/50 hover:text-primary hover:bg-primary/5" 
               onClick={() => onRestartCAS?.(row)}
               title="Restart CAS"
            >
               <Icon name="restart_alt" size="xs" />
            </Button>
            <Button 
               variant="ghost" 
               className="w-8 h-8 p-0 min-w-0 border-border/50 hover:text-secondary hover:bg-secondary/5" 
               onClick={() => onViewSQLLog?.(row)}
               title="SQL Log"
            >
               <Icon name="terminal" size="xs" />
            </Button>
            <Button 
               variant="ghost" 
               className="w-8 h-8 p-0 min-w-0 border-border/50 hover:text-rose-500 hover:bg-rose-500/5" 
               onClick={() => onViewSlowQueryLog?.(row)}
               title="Slow Query Log"
            >
               <Icon name="timer_off" size="xs" />
            </Button>
         </div>
      </td>
    </tr>
  );

  return (
    <Card className="overflow-hidden border-border/50 bg-background shadow-sm group">
      <details className="w-full" open>
        <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none hover:bg-muted/5 transition-all border-b border-border/50 select-none">
          <Icon name="expand_more" size="xs" className="text-primary transition-transform group-open:rotate-180" />
          <div className="flex items-center gap-2 flex-1">
             <Icon name="hub" size="xs" className="text-secondary opacity-60" />
             <Typography variant="h4" className="font-black tracking-tight">Brokers (CAS Instances)</Typography>
          </div>
          <Typography variant="caption" className="font-bold opacity-30 uppercase tracking-widest text-[8px]">Session Manager</Typography>
        </summary>
        <div className="p-1">
           <Table 
              columns={columns}
              data={brokersCAS}
              renderRow={renderRow}
              variant="compact"
           />
        </div>
      </details>
    </Card>
  );
}
