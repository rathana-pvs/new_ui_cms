import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBPerformanceSection({ dbStats }) {
  const columns = [
    { 
      header: 'CPU Utilization', 
      accessor: 'cpu',
      render: (val, row) => (
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <Typography variant="p" className="font-bold text-slate-700 dark:text-white tabular-nums">{val}</Typography>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${row.cpuPct > 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${row.cpuPct}%` }}
            ></div>
          </div>
        </div>
      )
    },
    { 
      header: 'Memory Usage', 
      accessor: 'memory',
      render: (val, row) => (
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <Typography variant="p" className="font-bold text-slate-700 dark:text-white tabular-nums">{val}</Typography>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${row.memPct > 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-bk-yellow'}`} 
              style={{ width: `${row.memPct}%` }}
            ></div>
          </div>
        </div>
      )
    },
    { 
      header: 'Query Performance', 
      accessor: 'qps',
      render: (val) => (
        <div className="flex flex-col">
          <Typography variant="h3" className="text-bk-yellow tabular-nums leading-none mb-0.5">{val}</Typography>
          <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-widest leading-none">Queries / SEC</Typography>
        </div>
      )
    },
    { 
      header: 'Buffer Hit Ratio', 
      accessor: 'hitRatio',
      render: (val, row) => (
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <Typography variant="p" className="font-bold text-slate-700 dark:text-white tabular-nums">{val}</Typography>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${row.hitPct < 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} 
              style={{ width: `${row.hitPct}%` }}
            ></div>
          </div>
        </div>
      )
    },
    { header: 'Page Fetches', accessor: 'fetch' },
    { header: 'Dirty Pages', accessor: 'dirty' },
    { header: 'I/O Reads', accessor: 'ioReads' },
    { header: 'I/O Writes', accessor: 'ioWrites' },
  ];

  const cardTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Icon name="monitoring" size="sm" weight={300} className="text-bk-yellow" />
        <span>Database Performance Metrics</span>
        <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-[11px] uppercase tracking-wider">
          (Real-time Stream)
        </span>
      </div>
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0" collapsible={true}>
      <Table 
        columns={columns}
        data={dbStats}
        hoverable={false}
      />
    </Card>
  );
}
