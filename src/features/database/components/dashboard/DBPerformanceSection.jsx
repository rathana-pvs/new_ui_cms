import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

const Bar = ({ pct, colorClass }) => (
  <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.06] overflow-hidden mt-1">
    <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
  </div>
);

export default function DBPerformanceSection({ dbStats }) {
  const columns = [
    {
      header: 'CPU',
      accessor: 'cpu',
      render: (val, row) => (
        <div className="min-w-[90px]">
          <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{val}</span>
          <Bar pct={row.cpuPct} colorClass={row.cpuPct > 80 ? 'bg-rose-500' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'} />
        </div>
      )
    },
    {
      header: 'Memory',
      accessor: 'memory',
      render: (val, row) => (
        <div className="min-w-[100px]">
          <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{val}</span>
          <Bar pct={row.memPct} colorClass={row.memPct > 80 ? 'bg-rose-500' : 'bg-amber-500'} />
        </div>
      )
    },
    {
      header: 'QPS',
      accessor: 'qps',
      render: (val) => (
        <div className="flex flex-col">
          <span className="font-mono text-[18px] font-black text-amber-500 leading-none">{val}</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Queries/sec</span>
        </div>
      )
    },
    {
      header: 'Buffer Hit',
      accessor: 'hitRatio',
      render: (val, row) => (
        <div className="min-w-[100px]">
          <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{val}</span>
          <Bar pct={row.hitPct} colorClass={row.hitPct < 80 ? 'bg-rose-500' : 'bg-emerald-500'} />
        </div>
      )
    },
    { header: 'Fetches',   accessor: 'fetch',    render: (val) => <span className="font-mono text-[12px] text-slate-500">{val}</span> },
    { header: 'Dirty',     accessor: 'dirty',    render: (val) => <span className="font-mono text-[12px] text-slate-500">{val}</span> },
    { header: 'IO Reads',  accessor: 'ioReads',  render: (val) => <span className="font-mono text-[12px] text-slate-500">{val}</span> },
    { header: 'IO Writes', accessor: 'ioWrites', render: (val) => <span className="font-mono text-[12px] text-slate-500">{val}</span> },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Icon name="monitoring" size="sm" weight={300} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Performance Metrics</span>
          <span className="text-[10px] text-slate-400 font-normal ml-1">· Real-time</span>
        </div>
      }
      bodyClassName="p-0"
      collapsible
    >
      <Table columns={columns} data={dbStats} hoverable={false} />
    </Card>
  );
}
