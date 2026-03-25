import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBBrokersCASSection({ brokersCAS, onViewSQLLog, onViewSlowQueryLog, onRestartCAS }) {
  const columns = [
    { 
      header: 'Broker Parent', 
      accessor: 'broker',
      render: (val) => <Typography variant="p" className="font-bold text-slate-700 dark:text-white uppercase tracking-tight">{val}</Typography>
    },
    { header: 'CAS ID', accessor: 'id' },
    { header: 'Process ID', accessor: 'pid' },
    { header: 'QPS', accessor: 'qps' },
    { header: 'LQS', accessor: 'lqs' },
    { 
      header: 'Service Status', 
      accessor: 'status',
      render: (val) => (
        <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border ${
          val === 'READY' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${val === 'READY' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
          <Typography variant="caption" className="font-black uppercase tracking-widest">{val}</Typography>
        </div>
      )
    },
    { header: 'Last Connection', accessor: 'lastConn' },
    { 
      header: 'Control Actions', 
      accessor: 'actions',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            icon="restart_alt" 
            title="Restart CAS Instance" 
            onClick={() => onRestartCAS?.(row)} 
            className="text-slate-400 hover:text-bk-yellow"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon="terminal" 
            title="View Real-time SQL Logs" 
            onClick={() => onViewSQLLog?.(row)} 
            className="text-slate-400 hover:text-sky-500"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon="timer_off" 
            title="Analyze Slow Query Logs" 
            onClick={() => onViewSlowQueryLog?.(row)} 
            className="text-slate-400 hover:text-rose-500"
          />
        </div>
      )
    },
  ];

  const cardTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Icon name="dns" size="sm" weight={300} className="text-bk-yellow" />
        <span>Application Server Brokers (CAS)</span>
        <div className="flex items-center gap-3 ml-4 bg-slate-100 dark:bg-black/20 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span>
            <span className="font-bold text-slate-500 uppercase tracking-tight text-[10px]">Ready: {brokersCAS.filter(c => c.status === 'READY').length}</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10"></div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="font-bold text-slate-500 uppercase tracking-tight text-[10px]">Busy: {brokersCAS.filter(c => c.status !== 'READY').length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0" collapsible={true}>
      <Table 
        columns={columns}
        data={brokersCAS}
      />
    </Card>
  );
}
