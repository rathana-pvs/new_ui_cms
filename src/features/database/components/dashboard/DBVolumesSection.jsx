import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBVolumesSection({ volumes }) {
  const columns = [
    {
      header: 'Volume',
      accessor: 'name',
      render: (val) => {
        const name = val.split(/[/\\]/).pop() || val;
        return (
          <div className="flex items-center gap-2">
            <Icon name="draft" size="sm" weight={300} className="text-slate-300 dark:text-slate-600 shrink-0" />
            <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{name}</span>
          </div>
        );
      }
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (val) => {
        const t = (val || '').toUpperCase();
        const cls = t.includes('PERMANENT')   ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                  : t.includes('TEMPORARY')   ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                  : t.includes('ACTIVE_LOG')  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                  : t.includes('ARCHIVE_LOG') ? 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
                  : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${cls}`}>{val}</span>;
      }
    },
    { header: 'Purpose', accessor: 'purpose', render: (val) => <span className="font-mono text-[12px] text-slate-400">{val}</span> },
    {
      header: 'Free / Total',
      accessor: 'free',
      render: (val, row) => (
        <div className="min-w-[200px] flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="font-mono text-[12px] text-slate-600 dark:text-slate-300 font-semibold">{val} / {row.total}</span>
            <span className="font-mono text-[10px] font-bold text-amber-500">{Math.round(row.freePct)}% free</span>
          </div>
          <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${row.freePct}%` }} />
          </div>
        </div>
      )
    },
    { header: 'Modified', accessor: 'date', render: (val) => <span className="font-mono text-[11px] text-slate-400">{val}</span> },
    {
      header: 'Path',
      accessor: 'path',
      render: (val) => (
        <div className="flex items-center gap-1.5 max-w-[280px]">
          <Icon name="folder" size="sm" weight={300} className="text-slate-300 dark:text-slate-600 shrink-0" />
          <span className="font-mono text-[11px] text-slate-400 truncate" title={val}>{val}</span>
        </div>
      )
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Icon name="storage" size="sm" weight={300} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Storage Volumes</span>
        </div>
      }
      bodyClassName="p-0"
      collapsible
    >
      <Table columns={columns} data={volumes} />
    </Card>
  );
}
