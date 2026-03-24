import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDatabaseVolumes } from '../../database/databaseSlice';
import { Card } from '../../../components/ds/layout/Card';
import { Table } from '../../../components/ds/layout/Table';
import { Icon } from '../../../components/ds/foundation/Icon';
import { Spinner } from '../../../components/ds/foundation/Spinner';

const getSizeFormat = (size) => {
  if (size >= 1024 ** 3) {
    return `${(size / 1024 ** 3).toFixed(0)}GB`;
  } else if (size >= 1024 ** 2) {
    return `${(size / 1024 ** 2).toFixed(0)}MB`;
  } else if (size >= 1024) {
    return `${(size / 1024).toFixed(0)}KB`;
  } else {
    return `${size}B`;
  }
};

const getVolumeColumn = (dbSpace, type) => {
  if (!dbSpace || !dbSpace.spaceinfo) return { display: '-', pct: 0 };
  let totalPage = 0;
  let freePage = 0;
  let pageSize = parseInt(dbSpace.pagesize || 0);
  if (pageSize === 0) return { display: '-', pct: 0 };

  for (const space of dbSpace.spaceinfo) {
    if (space.type === type) {
      totalPage += parseInt(space.totalpage || 0);
      freePage += parseInt(space.freepage || 0);
    }
  }
  if (totalPage > 0) {
    const used = (totalPage - freePage) * pageSize;
    const total = totalPage * pageSize;
    const pct = ((freePage * 100) / totalPage).toFixed(0);
    return {
      display: `${getSizeFormat(used)} / ${getSizeFormat(total)} / ${pct}%`,
      pct: 100 - parseInt(pct) // Percentage used
    };
  }
  return { display: '-', pct: 0 };
};

const getLogColumn = (dbSpace, type) => {
  let totalPage = 0;
  let pageSize = parseInt(dbSpace.pagesize);
  for (const space of dbSpace.spaceinfo) {
    if (space.type === type) {
      totalPage += parseInt(space.totalpage);
    }
  }
  if (totalPage > 0) {
    return getSizeFormat(totalPage * pageSize);
  }
  return '-';
};

export default function DatabaseVolumes({ hostUid }) {
  const dispatch = useDispatch();
  const { authorizedHosts } = useSelector((state) => state.host);
  const { activeDatabases, volumes, volumesLoading: loading } = useSelector((state) => state.database);

  const fetchVolumes = useCallback(async () => {
    if (!hostUid || !authorizedHosts.includes(hostUid) || activeDatabases.length === 0) {
      return;
    }
    dispatch(fetchDatabaseVolumes({ hostUid, activeDatabases }));
  }, [hostUid, authorizedHosts, activeDatabases, dispatch]);

  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);

  const volumeData = volumes?.map((result) => {
    let permanent = { display: '-', pct: 0 };
    let temporary = { display: '-', pct: 0 };
    let activeLog = '-';
    let archiveLog = '-';
    let storageFree = '-';

    if (result && result.spaceinfo) {
      permanent = getVolumeColumn(result, 'PERMANENT');
      temporary = getVolumeColumn(result, 'TEMPORARY');
      activeLog = getLogColumn(result, 'Active_log');
      archiveLog = getLogColumn(result, 'Archive_log');
      storageFree = result.freespace ? getSizeFormat(parseInt(result.freespace) * 1024) : '-';
    }

    return {
      id: result.dbname,
      db: result.dbname,
      permanent,
      temporary,
      activeLog,
      archiveLog,
      storageFree
    };
  }) || [];

  const columns = [
    { header: 'Database', accessor: 'db', className: 'font-bold' },
    { 
      header: 'Permanent (U/T/F%)', 
      accessor: 'permanent',
      render: (val) => (
        <div className="flex flex-col gap-1 w-full max-w-[160px]">
          <div className="text-[10px] font-mono opacity-80">{val.display}</div>
          <div className="w-full bg-slate-100 dark:bg-black/40 rounded-full h-1 overflow-hidden border border-slate-200 dark:border-white/5">
            <div 
              className={`h-full rounded-full shadow-[0_0_8px] transition-all duration-500 ${val.pct > 80 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-bk-yellow shadow-bk-yellow/20'}`} 
              style={{ width: `${val.pct}%` }} 
            />
          </div>
        </div>
      )
    },
    { 
      header: 'Temporary (U/T/F%)', 
      accessor: 'temporary',
      render: (val) => (
        <div className="flex flex-col gap-1 w-full max-w-[160px]">
          <div className="text-[10px] font-mono opacity-80">{val.display}</div>
          <div className="w-full bg-slate-100 dark:bg-black/40 rounded-full h-1 overflow-hidden border border-slate-200 dark:border-white/5">
            <div 
              className={`h-full rounded-full shadow-[0_0_8px] transition-all duration-500 ${val.pct > 80 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`} 
              style={{ width: `${val.pct}%` }} 
            />
          </div>
        </div>
      )
    },
    { header: 'Active Log', accessor: 'activeLog' },
    { header: 'Archive Log', accessor: 'archiveLog' },
    { header: 'Free Storage', accessor: 'storageFree', className: 'opacity-60' }
  ];

  const cardTitle = (
    <div className="flex items-center gap-2">
      <Icon name="storage" size="sm" className="text-bk-yellow"  weight={300} />
      <span>Storage Volumes</span>
      {loading && <Spinner size="xs" className="ml-2" />}
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0">
      <Table 
        columns={columns} 
        data={volumeData} 
        loading={loading}
        className="font-mono text-[12px]"
      />
    </Card>
  );
}
