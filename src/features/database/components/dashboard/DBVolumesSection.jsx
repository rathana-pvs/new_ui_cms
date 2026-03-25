import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Button } from '../../../../components/ds/foundation/Button';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBVolumesSection({ volumes }) {
  const columns = [
    { 
      header: 'Volume Name', 
      accessor: 'name',
      render: (val) => {
        const lastPath = val.split(/[/\\]/).pop() || val;
        return <Typography variant="p" className="font-medium text-slate-700 dark:text-white tracking-tight">{lastPath}</Typography>
      }
    },
    { header: 'Type', accessor: 'type' },
    { header: 'Purpose', accessor: 'purpose' },
    { 
      header: 'Space Utilization (Free / Total)', 
      accessor: 'free',
      render: (val, row) => (
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <div className="flex items-center justify-between">
            <Typography variant="p" className="font-bold text-slate-700 dark:text-white tabular-nums">{val} / {row.total}</Typography>
            <Typography variant="caption" className="font-black text-bk-yellow">{Math.round(row.freePct)}% Free</Typography>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full rounded-full bg-bk-yellow shadow-[0_0_8px_rgba(255,215,0,0.4)] transition-all duration-500" 
              style={{ width: `${row.freePct}%` }}
            ></div>
          </div>
        </div>
      )
    },
    { header: 'Modify Date', accessor: 'date' },
    { 
      header: 'Physical Path', 
      accessor: 'path',
      render: (val) => <Typography variant="caption" className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[300px]">{val}</Typography>
    },
  ];

  const cardTitle = (
    <div className="flex items-center gap-2">
      <Icon name="storage" size="sm" weight={300} className="text-bk-yellow" />
      <span>Storage Volumes</span>
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0" collapsible={true}>
      <Table 
        columns={columns}
        data={volumes}
      />
    </Card>
  );
}
