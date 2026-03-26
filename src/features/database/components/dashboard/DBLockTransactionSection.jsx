import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBLockTransactionSection({ locks }) {
  const columns = [
    { header: '#',       accessor: 'index', render: (val) => <span className="font-mono text-[12px] text-slate-400">{val}</span> },
    { header: 'User',    accessor: 'user',  render: (val) => <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{val}</span> },
    { header: 'Host',    accessor: 'host',  render: (val) => <span className="font-mono text-[12px] text-slate-400">{val}</span> },
    { header: 'PID',     accessor: 'pid',   render: (val) => <span className="font-mono text-[12px] text-slate-400">{val}</span> },
    { header: 'Object',  accessor: 'obj',   render: (val) => <span className="font-mono text-[12px] text-slate-500">{val}</span> },
    {
      header: 'Lock Mode',
      accessor: 'mode',
      render: (val) => {
        const isX = val === 'X_LOCK';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
            ${isX
              ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isX ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
            {val}
          </span>
        );
      }
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Icon name="lock" size="sm" weight={300} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Active Transactions & Locks</span>
          <span className="text-[10px] text-slate-400 font-normal ml-1">· Concurrency Status</span>
          {locks.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold">
              {locks.length}
            </span>
          )}
        </div>
      }
      bodyClassName="p-0"
      collapsible
    >
      <Table columns={columns} data={locks} />
    </Card>
  );
}
