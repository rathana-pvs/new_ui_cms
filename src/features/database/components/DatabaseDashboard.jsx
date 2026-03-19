import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../databaseSlice';
import { openTab } from '../../layout/layoutSlice';
import DBPerformanceSection from './dashboard/DBPerformanceSection';
import DBVolumesSection from './dashboard/DBVolumesSection';
import DBSpaceInfoSection from './dashboard/DBSpaceInfoSection';
import DBBrokersCASSection from './dashboard/DBBrokersCASSection';
import DBLockTransactionSection from './dashboard/DBLockTransactionSection';
import CASLogModal from './CASLogModal';
import CustomSelect from '../../../components/common/CustomSelect';


export default function DatabaseDashboard({ dbname }) {
  const dispatch = useDispatch();
  const { selectedHostUid, hosts } = useSelector((state) => state.host);
  const { dashboardData, dashboardLoading } = useSelector((state) => state.database);
  const { brokers } = useSelector((state) => state.monitoring);
  
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10); // Default 10s
  const [showSettings, setShowSettings] = useState(false);
  const [logModal, setLogModal] = useState({ isOpen: false, brokerName: '', casId: '', type: 'sql' });


  const activeHost = hosts.find(h => h.uid === selectedHostUid);
  const hostUid = selectedHostUid;
  const data = dashboardData[dbname] || { volumes: [], spaceInfo: [], locks: [], performance: {} };
  const isLoading = dashboardLoading[dbname];

  const handleRefresh = () => {
    if (hostUid && dbname) {
      dispatch(fetchDashboardData({ hostUid, dbname }));
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [hostUid, dbname, dispatch]);

  useEffect(() => {
    let interval;
    if (autoRefresh && hostUid && dbname) {
      interval = setInterval(() => {
        dispatch(fetchDashboardData({ hostUid, dbname }));
      }, refreshInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, hostUid, dbname, dispatch]);

  // 1. Map Volumes
  const mappedVolumes = (data.volumes || []).map(v => ({
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
  const mappedSpaceInfo = (data.spaceInfo || []).map(f => ({
    type: f.data_type,
    fileCount: f.file_count,
    usedPages: f.used_size,
    fileTablePages: f.file_table_size,
    reservedPages: f.reserved_size,
    totalPages: f.total_size
  }));

  // 3. Map Performance
  const perf = data.performance || {};
  const brokersCAS = data.brokersCAS || [];
  
  // Sum QPS from CAS processes serving this DB
  const totalQps = brokersCAS
    .filter(cas => cas.dbname?.toLowerCase() === dbname.toLowerCase())
    .reduce((acc, cas) => acc + parseInt(cas.qps || 0), 0);

  const dbStats = [
    { 
      cpu: "0.0%", cpuPct: 0, 
      memory: "0.0MB", memPct: 0, 
      qps: totalQps.toString(),
      hitRatio: (perf.data_page_buffer_hit_ratio || '0.00') + '%', 
      hitPct: parseFloat(perf.data_page_buffer_hit_ratio || '0'), 
      fetch: perf.num_data_page_fetches || '0', 
      dirty: perf.num_data_page_dirties || '0', 
      ioReads: perf.num_data_page_ioreads || '0', 
      ioWrites: perf.num_data_page_iowrites || '0' 
    }
  ];

  // 4. Map Brokers (Using real CAS info)
  const mappedBrokers = brokersCAS.map(cas => ({
    broker: cas.broker,
    id: cas.id,
    pid: cas.pid,
    qps: cas.qps,
    lqs: cas.lqs,
    status: cas.status,
    lastConn: cas.lastConn,
    dbname: cas.dbname
  }));

  // 5. Map Locks
  const mappedLocks = (data.locks || []).map((l, i) => ({
    index: l.index || i + 1,
    user: l.uid || '-',
    host: l.host || '-',
    pid: l.pid || '-',
    obj: l.object || '-',
    mode: l.granted_mode || '-'
  }));

  const handleExport = () => {
    // Basic CSV export logic
    const headers = ["Section", "Key", "Value"];
    const rows = [];
    
    // Summary
    rows.push(["Summary", "Database", dbname]);
    rows.push(["Summary", "Host", `${activeHost?.address}:${activeHost?.port}`]);
    
    // Performance
    rows.push(["Performance", "QPS", dbStats[0].qps]);
    rows.push(["Performance", "Hit Ratio", dbStats[0].hitRatio]);
    rows.push(["Performance", "Fetch", dbStats[0].fetch]);
    rows.push(["Performance", "Dirty", dbStats[0].dirty]);
    rows.push(["Performance", "IO Reads", dbStats[0].ioReads]);
    rows.push(["Performance", "IO Writes", dbStats[0].ioWrites]);

    // Volumes
    mappedVolumes.forEach(v => {
      rows.push(["Volume", v.name, `${v.free} / ${v.total}`]);
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${dbname}_dashboard_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main font-sans">
      {/* Header / Toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-white dark:bg-bk-side border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-bk-yellow/10 border border-bk-yellow/20">
             <span className="material-symbols-outlined text-bk-yellow text-[22px]">dashboard</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{dbname}</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
               <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Status: Running</span>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[9px] text-slate-500 dark:text-slate-400 font-bold tracking-tight">
            {activeHost?.address}:{activeHost?.port}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Auto Refresh Toggle */}
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all group ${autoRefresh ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}`}
            title={autoRefresh ? "Stop Auto Refresh" : "Start Auto Refresh"}
          >
            <span className={`material-symbols-outlined text-[18px] ${autoRefresh ? 'animate-spin' : ''}`}>sync</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{autoRefresh ? 'Live' : 'Auto'}</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Settings */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-8 h-8 flex items-center justify-center rounded transition-all ${showSettings ? 'bg-bk-yellow/10 text-bk-yellow border border-bk-yellow/20' : 'text-slate-400 hover:text-bk-yellow hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}`}
            title="Dashboard Settings"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>

          {/* Export */}
          <button 
            onClick={handleExport}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded transition-all border border-transparent"
            title="Export to CSV"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
          </button>

          {/* Manual Refresh */}
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`w-8 h-8 flex items-center justify-center text-slate-400 hover:text-bk-yellow hover:bg-bk-yellow/5 rounded transition-all border border-transparent ${isLoading ? 'animate-spin cursor-not-allowed' : ''}`}
            title="Refresh Now"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

        </div>
      </div>

      {/* Settings Panel Popover */}
      {showSettings && (
        <div className="mx-4 mt-2 p-3 bg-white dark:bg-bk-side border border-bk-yellow/20 rounded-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboard Configuration</span>
             <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-[16px]">close</span></button>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                 <label className="text-[9px] font-bold text-slate-500 uppercase">Refresh Interval (sec)</label>
                 <CustomSelect 
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    options={[
                      { label: '1 second', value: 1 },
                      { label: '5 seconds', value: 5 },
                      { label: '10 seconds', value: 10 },
                      { label: '30 seconds', value: 30 },
                      { label: '1 minute', value: 60 },
                    ]}
                  />
              </div>
              <div className="flex-1 items-end pt-5">
                 <p className="text-[9px] text-slate-400 italic font-medium leading-tight">Lower interval increases server load.</p>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col p-4 space-y-4">
        {isLoading && (!data.volumes || data.volumes.length === 0) ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
             <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-4xl text-bk-yellow/40">refresh</span>
                <span className="text-[11px] font-bold uppercase tracking-widest">Hydrating Dashboard...</span>
             </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            <DBPerformanceSection dbStats={dbStats} />
            <DBVolumesSection volumes={mappedVolumes} />
            <DBSpaceInfoSection spaceInfo={mappedSpaceInfo} />
            <DBBrokersCASSection 
              brokersCAS={mappedBrokers} 
              onViewSQLLog={(row) => setLogModal({ isOpen: true, brokerName: row.broker, casId: row.id, type: 'sql' })}
              onViewSlowQueryLog={(row) => setLogModal({ isOpen: true, brokerName: row.broker, casId: row.id, type: 'slow' })}
              onRestartCAS={(row) => alert(`Restart request sent for CAS ${row.id} on broker ${row.broker}. (This action will be fully integrated soon)`)}
            />
            <DBLockTransactionSection locks={mappedLocks} />
          </div>
        )}
      </div>

      <CASLogModal 
        isOpen={logModal.isOpen}
        onClose={() => setLogModal(prev => ({ ...prev, isOpen: false }))}
        hostUid={hostUid}
        brokerName={logModal.brokerName}
        casId={logModal.casId}
        type={logModal.type}
      />
    </div>
  );
}


