import { Icon } from '../../../../components/ds/foundation/Icon';
import { Table } from '../../../../components/ds/layout/Table';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Card } from '../../../../components/ds/layout/Card';

export default function DBSpaceInfoSection({ spaceInfo }) {
  const columns = [
    { 
      header: 'Storage Object Type', 
      accessor: 'type',
      render: (val) => <Typography variant="p" className="font-bold text-slate-700 dark:text-white uppercase tracking-tight">{val}</Typography>
    },
    { header: 'File Count', accessor: 'fileCount' },
    { header: 'Used Pages', accessor: 'usedPages' },
    { header: 'File Table Pages', accessor: 'fileTablePages' },
    { header: 'Reserved Pages', accessor: 'reservedPages' },
    { header: 'Total Resource Pages', accessor: 'totalPages' },
  ];

  const cardTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Icon name="file_present" size="sm" weight={300} className="text-bk-yellow" />
        <span>File Distribution Metadata</span>
        <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-[11px] uppercase tracking-wider">
          (Logical Partitioning)
        </span>
      </div>
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0" collapsible={true}>
      <Table 
        columns={columns}
        data={spaceInfo}
      />
    </Card>
  );
}
