import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../databaseSlice';
import DBPerformanceSection from './dashboard/DBPerformanceSection';
import DBVolumesSection from './dashboard/DBVolumesSection';
import DBSpaceInfoSection from './dashboard/DBSpaceInfoSection';
import DBBrokersCASSection from './dashboard/DBBrokersCASSection';
import DBLockTransactionSection from './dashboard/DBLockTransactionSection';

export default function DatabaseDashboard({ dbname }) {
  const dispatch = useDispatch();
  const { activeHost } = useSelector((state) => state.host);
  const { dashboardData, dashboardLoading } = useSelector((state) => state.database);
  const { brokers } = useSelector((state) => state.monitoring);
  
  const hostUid = activeHost?.uid;
  const data = dashboardData[dbname] || { volumes: [], spaceInfo: [], locks: [] };
  const isLoading = dashboardLoading[dbname];

  useEffect(() => {
    if (hostUid && dbname) {
      
      dispatch(fetchDashboardData({ hostUid, dbname }));
    }
  }, [hostUid, dbname, dispatch]);

  const handleRefresh = () => {
    if (hostUid && dbname) {
      dispatch(fetchDashboardData({ hostUid, dbname }));
    }
  };

  // 1. Map Volumes
  const mappedVolumes = data.volumes.map(v => ({
    name: v.spacename,
    type: v.type,
    purpose: v.purpose || '-',
    free: v.freepage ? `${v.freepage} pages` : '-',
    total: v.totalpage ? `${v.totalpage} pages` : '-',
    freePct: v.totalpage && v.totalpage !== '0' ? (parseInt(v.freepage) / parseInt(v.totalpage)) * 100 : 0,
    date: v.date || '-',
    path: v.location
  }));

  // 2. Map Space Info
  const mappedSpaceInfo = data.spaceInfo.map(f => ({
    type: f.data_type,
    fileCount: f.file_count,
    usedPages: f.used_size,
    fileTablePages: f.file_table_size,
    reservedPages: f.reserved_size,
    totalPages: f.total_size
  }));

  // 3. Map Performance (CPU/Mem/Hit Ratio/IO - still need backend for these, using placeholders)
  const dbStats = [
    { 
      cpu: "0%", cpuPct: 0, 
      memory: "0MB", memPct: 0, 
      qps: "0", 
      hitRatio: "0%", hitPct: 0, 
      fetch: "0", dirty: "0", 
      ioReads: "0", ioWrites: "0" 
    }
  ];

  // 4. Map Brokers (Filter by DB name if possible, or show all for now)
  const mappedBrokers = brokers?.filter(b => b.dbname === dbname || !b.dbname).map(b => ({
    broker: b.name,
    id: b.as_id || '1',
    pid: b.pid || '-',
    qps: b.query || '0',
    lqs: b.tran || '0',
    status: b.status || 'READY',
    lastConn: b.last_access_time || '-'
  })) || [];

  // 5. Map Locks
  const mappedLocks = data.locks.map((l, i) => ({
    index: i + 1,
    user: l['@uid'] || 'dba',
    host: l.host || 'localhost',
    pid: l.pid || '-',
    obj: l.pname || '-',
    mode: l.isolevel || '-'
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-bk-side/50">
        <span className="font-medium text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-1.5 font-sans">
          <span className="material-symbols-outlined text-[14px]">database</span>
          Database - {dbname}{activeHost ? `@${activeHost.address}:${activeHost.port}` : ''}
        </span>
        <button 
          className={`ml-auto text-slate-500 opacity-70 hover:text-bk-yellow dark:hover:text-bk-yellow transition-colors ${isLoading ? 'animate-spin' : ''}`} 
          title="Reload View"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
        </button>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        {isLoading && (!data.volumes || data.volumes.length === 0) ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
             <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                <span className="text-sm">Loading database dashboard...</span>
             </div>
          </div>
        ) : (
          <>
            <DBPerformanceSection dbStats={dbStats} />
            <DBVolumesSection volumes={mappedVolumes} />
            <DBSpaceInfoSection spaceInfo={mappedSpaceInfo} />
            <DBBrokersCASSection brokersCAS={mappedBrokers} />
            <DBLockTransactionSection locks={mappedLocks} />
          </>
        )}
      </div>
    </div>
  );
}
