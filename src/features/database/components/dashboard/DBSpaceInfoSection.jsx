import React from 'react';
import Card from '../../../../components/ui/Layout/Card';
import Table from '../../../../components/ui/Layout/Table';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function DBSpaceInfoSection({ spaceInfo }) {
  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'fileCount', label: 'File Count' },
    { key: 'usedPages', label: 'Used Pages' },
    { key: 'fileTablePages', label: 'File Table Pages' },
    { key: 'reservedPages', label: 'Reserved Pages' },
    { key: 'totalPages', label: 'Total Pages' },
  ];

  return (
    <Card className="overflow-hidden border-border/50 bg-background shadow-sm group">
      <details className="w-full" open>
        <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer list-none hover:bg-muted/5 transition-all border-b border-border/50 select-none">
          <Icon name="expand_more" size="xs" className="text-primary transition-transform group-open:rotate-180" />
          <div className="flex items-center gap-2 flex-1">
             <Icon name="pie_chart" size="xs" className="text-secondary opacity-60" />
             <Typography variant="h4" className="font-black tracking-tight">Space Usage Distribution</Typography>
          </div>
          <Typography variant="caption" className="font-bold opacity-30 uppercase tracking-widest text-[8px]">File Catalog Metrics</Typography>
        </summary>
        <div className="p-1">
           <Table 
              columns={columns}
              data={spaceInfo}
              variant="compact"
           />
        </div>
      </details>
    </Card>
  );
}
