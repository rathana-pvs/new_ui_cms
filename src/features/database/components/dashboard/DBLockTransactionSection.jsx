import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBLockTransactionSection({ locks }) {
  const columns = [
    { 
      header: 'Tran Index', 
      accessor: 'index',
      render: (val) => <Typography variant="p" className="font-bold text-slate-700 dark:text-white tabular-nums">{val}</Typography>
    },
    { header: 'Username', accessor: 'user' },
    { 
      header: 'Remote Host', 
      accessor: 'host',
      render: (val) => <Typography variant="caption" className="font-medium text-slate-500 dark:text-slate-400">{val}</Typography>
    },
    { header: 'Process ID', accessor: 'pid' },
    { header: 'Object Identifier', accessor: 'obj' },
    { 
      header: 'Lock Mode', 
      accessor: 'mode',
      render: (val) => (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border font-bold uppercase tracking-widest ${
          val === 'X_LOCK' 
            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
            : 'bg-bk-yellow/10 border-bk-yellow/20 text-bk-yellow shadow-[0_0_8px_rgba(255,215,0,0.3)]'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${val === 'X_LOCK' ? 'bg-rose-500 animate-pulse' : 'bg-bk-yellow'}`}></div>
          <Typography variant="caption" className="font-black">{val}</Typography>
        </div>
      )
    },
  ];

  const cardTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Icon name="lock" size="sm" weight={300} className="text-bk-yellow" />
        <span>Active Transactions & Locks</span>
        <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-[11px] uppercase tracking-wider">
          (Concurrency Status)
        </span>
      </div>
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0" collapsible={true}>
      <Table 
        columns={columns}
        data={locks}
      />
    </Card>
  );
}
