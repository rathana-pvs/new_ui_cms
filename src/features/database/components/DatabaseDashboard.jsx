import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../databaseSlice';
import DBPerformanceSection from './dashboard/DBPerformanceSection';
import DBVolumesSection from './dashboard/DBVolumesSection';
import DBSpaceInfoSection from './dashboard/DBSpaceInfoSection';
import DBBrokersCASSection from './dashboard/DBBrokersCASSection';
import DBLockTransactionSection from './dashboard/DBLockTransactionSection';
import CASLogModal from './CASLogModal';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Button } from '../../../components/ds/foundation/Button';
import { Select } from '../../../components/ds/forms/Select';
import { Typography } from '../../../components/ds/foundation/Typography';

export default function DatabaseDashboard({ dbname }) {
  const dispatch = useDispatch();
  const { selectedHostUid, hosts } = useSelector((state) => state.host);
  const { dashboardData, dashboardLoading } = useSelector((state) => state.database);
  
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
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main font-sans custom-scrollbar">
      {/* Refined Top Breadcrumb Bar (Matches ServerContent Style) */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-2 text-xs border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-bk-side/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Typography variant="span" className="font-bold text-slate-700 dark:text-bk-yellow tracking-wide flex items-center gap-2">
            <Icon name="database" size="14px" weight={400} />
            Database - {dbname}
          </Typography>
          
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <Typography variant="caption" className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Running</Typography>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 ml-2">
            <Icon name="dns" size="12px" weight={300} className="text-slate-400" />
            <Typography variant="caption" className="text-slate-500 dark:text-slate-400 font-bold tracking-tight text-[10px]">
              {activeHost?.address}:{activeHost?.port}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Toolbar */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100/50 dark:bg-black/20 rounded-lg border border-slate-200/50 dark:border-white/5">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setAutoRefresh(!autoRefresh)}
              icon={autoRefresh ? 'sync' : 'sync_disabled'}
              className={`rounded-md h-7 ${autoRefresh ? 'text-emerald-500' : 'text-slate-400'}`}
              title={autoRefresh ? "Live Monitoring Active" : "Auto Refresh Off"}
            />
            <Button 
              variant="ghost"
              size="xs"
              onClick={handleRefresh}
              loading={isLoading}
              icon="refresh"
              className="rounded-md h-7 text-slate-500"
              title="Manual Refresh"
            />
          </div>

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>

          <Button 
            variant="ghost" 
            size="xs"
            onClick={() => setShowSettings(!showSettings)}
            icon="tune"
            className={`rounded-md h-7 ${showSettings ? 'bg-bk-yellow/10 text-bk-yellow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            title="Dashboard Settings"
          />

          <Button 
            variant="ghost"
            size="xs"
            onClick={handleExport}
            icon="ios_share"
            className="rounded-md h-7 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
            title="Export Metrics"
          />
        </div>
      </div>

      {/* Settings Panel Popover */}
      {showSettings && (
        <div className="mx-6 mt-4 p-5 bg-white dark:bg-bk-side border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-bk-yellow"></div>
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <Icon name="tune" size="xs" weight={300} className="text-bk-yellow" />
               <Typography variant="label" className="font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard Configuration</Typography>
             </div>
             <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} icon="close" />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="w-64">
                 <Select 
                    label="Refresh Interval"
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    options={[
                      { label: '1 second (Realtime)', value: 1 },
                      { label: '5 seconds', value: 5 },
                      { label: '10 seconds (Standard)', value: 10 },
                      { label: '30 seconds', value: 30 },
                      { label: '1 minute (Conservative)', value: 60 },
                    ]}
                  />
              </div>
              <div className="flex-1 p-4 bg-bk-yellow/5 rounded-xl border border-bk-yellow/10">
                 <div className="flex gap-3">
                   <Icon name="info" size="xs" weight={300} className="text-bk-yellow shrink-0 mt-0.5" />
                   <Typography variant="p" className="text-[11px] text-slate-500 dark:text-slate-400 italic font-medium leading-normal">
                     Lower refresh intervals increase the polling frequency. This may impact server performance and network overhead in high-traffic environments.
                   </Typography>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col p-6 space-y-6">
        {isLoading && (!data.volumes || data.volumes.length === 0) ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-bk-yellow/10 border-t-bk-yellow animate-spin flex items-center justify-center">
                  <Icon name="refresh" size="lg" weight={100} className="text-bk-yellow/20" />
                </div>
                <Typography variant="label" className="font-black uppercase tracking-[0.3em] text-bk-yellow/60">Hydrating Dashboard...</Typography>
             </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-700">
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


