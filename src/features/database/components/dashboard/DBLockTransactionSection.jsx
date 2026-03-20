import React from 'react';
import Card from '../../../../components/ui/Layout/Card';
import Table from '../../../../components/ui/Layout/Table';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function DBLockTransactionSection({ locks }) {
  const columns = [
    { key: 'index', label: 'Tran Index' },
    { key: 'user', label: 'User Name' },
    { key: 'host', label: 'Host' },
    { key: 'pid', label: 'Process ID' },
    { key: 'obj', label: 'Object Type' },
    { key: 'mode', label: 'Lock Mode' },
  ];

  const renderRow = (row, i) => (
    <tr key={i} className="text-foreground border-b border-border/50 hover:bg-muted/5 transition-colors group/row text-[11px] font-medium">
      <td className="px-4 py-3 opacity-60 font-mono">{row.index}</td>
      <td className="px-4 py-3">{row.user}</td>
      <td className="px-4 py-3 font-mono opacity-50">{row.host}</td>
      <td className="px-4 py-3 font-mono opacity-50">{row.pid}</td>
      <td className="px-4 py-3">
         <div className="flex items-center gap-2">
            <Icon name="description" size="xs" className="opacity-20" />
            <Typography variant="span" className="font-bold">{row.obj}</Typography>
         </div>
      </td>
      <td className="px-4 py-3">
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-sm
          ${row.mode === 'X_LOCK' 
            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5' 
            : 'bg-primary/10 text-primary border-primary/20 shadow-primary/5'}`}>
          {row.mode === 'X_LOCK' && <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
          {row.mode}
        </div>
      </td>
    </tr>
  );

  return (
    <Card className="overflow-hidden border-border/50 bg-background shadow-sm group">
      <details className="w-full" open>
        <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer list-none hover:bg-muted/5 transition-all border-b border-border/50 select-none">
          <Icon name="expand_more" size="xs" className="text-secondary transition-transform group-open:rotate-180" />
          <div className="flex items-center gap-2 flex-1">
             <Icon name="lock" size="xs" className="text-primary opacity-60" />
             <Typography variant="h4" className="font-black tracking-tight">Active Locks & Transactions</Typography>
          </div>
          <Typography variant="caption" className="font-bold opacity-30 uppercase tracking-widest text-[8px]">Real-time Telemetry</Typography>
        </summary>
        <div className="p-1">
           <Table 
              columns={columns}
              data={locks}
              renderRow={renderRow}
              variant="compact"
           />
        </div>
      </details>
    </Card>
  );
}
