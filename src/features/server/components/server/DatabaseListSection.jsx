import React from 'react';
import { Card } from '../../../../components/ds/layout/Card';
import { Table } from '../../../../components/ds/layout/Table';
import { Icon } from '../../../../components/ds/foundation/Icon';
import { Typography } from '../../../../components/ds/foundation/Typography';

export default function DatabaseListSection({ dbListDisplay, handleAutoStartToggle }) {
  const columns = [
    { header: 'Database', accessor: 'db', className: 'font-bold' },
    { 
      header: 'Auto Startup', 
      accessor: 'autoStart',
      render: (val, row) => (
        <input 
          type="checkbox" 
          className="size-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 cursor-pointer accent-bk-yellow" 
          checked={val} 
          onChange={() => handleAutoStartToggle(row.db, val)}
        />
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border
          ${val === 'On' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
          <span className={`size-1.5 rounded-full ${val === 'On' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          {val}
        </span>
      )
    },
  ];

  const cardTitle = (
    <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-medium">
      <Icon name="database" size="sm" className="text-bk-yellow"  weight={300} />
      <span>Databases</span>
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0">
      <Table columns={columns} data={dbListDisplay} />
    </Card>
  );
}
