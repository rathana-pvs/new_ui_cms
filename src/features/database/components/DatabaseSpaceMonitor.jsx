import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { databaseApi } from '../databaseApi';
import { setActiveMainTab } from '../../layout/layoutSlice';

/**
 * DatabaseSpaceMonitor Component
 * Replicates the "Database space" view from CUBRID Manager desktop client.
 * Provides a comprehensive real-time view of database volumes, file usage, and capacity.
 */
export default function DatabaseSpaceMonitor({ hostUid, dbname }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchSpaceInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await databaseApi.getVolumeInfo(hostUid, dbname);
      setData(response);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch space info:', err);
      setError('Could not retrieve database space information.');
    } finally {
      setLoading(false);
    }
  }, [hostUid, dbname]);

  useEffect(() => {
    fetchSpaceInfo();
  }, [fetchSpaceInfo]);

  const formatSize = (bytes) => {
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    if (b >= 1024 ** 4) return `${(b / 1024 ** 4).toFixed(2)} TB`;
    if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(2)} GB`;
    if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(2)} MB`;
    if (b >= 1024) return `${(b / 1024).toFixed(2)} KB`;
    return `${b} B`;
  };

  const formatPages = (pages) => {
    if (!pages) return '0';
    return parseInt(pages).toLocaleString();
  };

  // Derived summaries
  const totals = useMemo(() => {
    if (!data || !data.dbinfo) return null;
    let totalSize = 0;
    let freeSize = 0;
    
    data.dbinfo.forEach(info => {
      totalSize += parseInt(info.total_size || 0);
      freeSize += parseInt(info.free_size || 0);
    });

    return {
      total: totalSize,
      free: freeSize,
      used: totalSize - freeSize,
      pct: totalSize > 0 ? ((totalSize - freeSize) / totalSize) * 100 : 0
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-bk-main text-slate-500 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-bk-yellow/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-bk-yellow border-transparent rounded-full animate-spin"></div>
        </div>
        <p className="animate-pulse font-medium">Analyzing database storage capacity...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-bk-main overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-bk-side border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-bk-yellow/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-bk-yellow text-2xl">donut_small</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none capitalize">
              {dbname} Space Monitor
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">
              Storage Topology & File Distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-4 hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Last refreshed</div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400">{lastRefreshed.toLocaleTimeString()}</div>
          </div>
          <button 
            onClick={fetchSpaceInfo}
            disabled={loading}
            className="p-2.5 rounded-[6px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Data"
          >
            <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin text-bk-yellow' : ''}`}>sync</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
        
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-[6px] flex items-center gap-3 text-rose-500">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* 1. CAPACITY OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-bk-side p-5 rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <span className="material-symbols-outlined text-sm">database</span>
              <span className="text-[10px] font-bold uppercase tracking-wider italic">Database Version</span>
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-white truncate" title={data?.dbname}>
               CUBRID {data?.dbname ? 'Managed' : 'N/A'}
            </div>
          </div>

          <div className="bg-white dark:bg-bk-side p-5 rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
               <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-sm">equalizer</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider italic">Total Capacity Usage</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-bk-yellow">
                      {totals?.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden mb-1">
                    <div 
                      className="h-full bg-gradient-to-r from-bk-yellow to-[#ffd700] rounded-full shadow-[0_0_10px_rgba(255,210,0,0.3)] transition-all duration-1000"
                      style={{ width: `${totals?.pct}%` }}
                    />
                  </div>
               </div>
               <div className="flex justify-between items-end">
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white font-mono tracking-tighter">
                      {formatSize(totals?.used)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Consumed Storage</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                      of {formatSize(totals?.total)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase text-right">Provisioned</div>
                  </div>
               </div>
            </div>
            {/* Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-bk-yellow/5 rounded-full blur-3xl group-hover:bg-bk-yellow/10 transition-colors" />
          </div>

          <div className="bg-white dark:bg-bk-side p-5 rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <span className="material-symbols-outlined text-sm">description</span>
              <span className="text-[10px] font-bold uppercase tracking-wider italic">Page Configuration</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Data Page</span>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{data?.pagesize} B</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Log Page</span>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{data?.logpagesize} B</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. VOLUME TYPE SUMMARY (PERMANENT / TEMPORARY) */}
        <section className="bg-white dark:bg-bk-side rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
             <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-bk-yellow">layers</span>
               <h2 className="font-bold text-slate-800 dark:text-white">Volume Categorization</h2>
             </div>
             <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                BY STORAGE CLASS
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-transparent">
                  <th className="px-6 py-4">Storage Type</th>
                  <th className="px-6 py-4">Functional Purpose</th>
                  <th className="px-6 py-4 text-center">Nodes</th>
                  <th className="px-6 py-4">Used Capacity</th>
                  <th className="px-6 py-4">Available Space</th>
                  <th className="px-6 py-4">Total Capacity</th>
                  <th className="px-6 py-4 text-center">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-mono">
                {data?.dbinfo?.map((info, idx) => {
                  const used = parseInt(info.used_size);
                  const total = parseInt(info.total_size);
                  const pct = total > 0 ? (used / total) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-[6px] bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-sans font-bold">
                          {info.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-sans italic opacity-70 italic">{info.purpose}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-500">{info.volume_count}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{formatSize(info.used_size)}</td>
                      <td className="px-6 py-4 text-slate-500">{formatSize(info.free_size)}</td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-bold">{formatSize(info.total_size)}</td>
                      <td className="px-6 py-4 min-w-[140px]">
                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${pct > 85 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : pct > 65 ? 'bg-amber-500' : 'bg-bk-yellow'}`}
                                style={{ width: `${pct}%` }}
                              />
                           </div>
                           <span className={`text-[10px] font-bold ${pct > 85 ? 'text-rose-500' : 'text-slate-400'}`}>
                             {pct.toFixed(0)}%
                           </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. PHYSICAL VOLUME TOPOLOGY */}
        <section className="bg-white dark:bg-bk-side rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
             <div className="flex items-center gap-3">
               <span className="material-symbols-outlined text-bk-yellow">dataset</span>
               <h2 className="font-bold text-slate-800 dark:text-white">Physical Volume Topology</h2>
             </div>
             <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Device Map
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-transparent">
                  <th className="px-6 py-4 text-center">ID</th>
                  <th className="px-6 py-4">Logical Segment</th>
                  <th className="px-6 py-4">Resource Class</th>
                  <th className="px-6 py-4">Allocation</th>
                  <th className="px-6 py-4">Total Pages</th>
                  <th className="px-6 py-4">Physical File Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-mono text-slate-600 dark:text-slate-400">
                {data?.spaceinfo?.map((vol, idx) => {
                  const usedPages = parseInt(vol.usedpage || 0);
                  const totalPages = parseInt(vol.totalpage || 0);
                  const pct = totalPages > 0 ? (usedPages / totalPages) * 100 : 0;
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {vol.volid ?? idx}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm text-bk-yellow/50">description</span>
                           <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[150px]" title={vol.spacename}>
                             {vol.spacename}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                           <span className="uppercase font-bold tracking-tighter text-slate-400">{vol.type}</span>
                           <span className="text-[9px] italic opacity-60 italic leading-none">{vol.purpose || 'DEFAULT'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col gap-0.5">
                           <div className="flex items-center justify-between">
                              <span className="text-slate-800 dark:text-slate-300 font-bold">{formatPages(vol.usedpage)} Used</span>
                              <span className={`text-[10px] ${pct > 90 ? 'text-rose-500' : ''}`}>{pct.toFixed(0)}%</span>
                           </div>
                           <div className="w-16 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${pct > 90 ? 'bg-rose-500' : 'bg-bk-yellow/50'}`} style={{ width: `${pct}%` }} />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-bold text-slate-500">{formatPages(vol.totalpage)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity max-w-[300px]">
                           <span className="material-symbols-outlined text-[14px]">folder_open</span>
                           <span className="font-sans truncate" title={vol.location}>{vol.location}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* 4. FILE SPACE ANALYTICS */}
          <section className="bg-white dark:bg-bk-side rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-bk-yellow">analytics</span>
                <h2 className="font-bold text-slate-800 dark:text-white">File Space Usage</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-transparent">
                    <th className="px-4 py-3">Data Object</th>
                    <th className="px-4 py-3 text-center">Count</th>
                    <th className="px-4 py-3 text-right">Used Pages</th>
                    <th className="px-4 py-3 text-right">Reserved</th>
                    <th className="px-4 py-3 text-right">Total Pages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-mono">
                  {data?.fileinfo?.map((file, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-[6px] bg-bk-yellow/10 text-bk-yellow font-bold text-[9px] uppercase tracking-tighter">
                          {file.data_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-500">{file.file_count}</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-200 font-bold">{formatPages(file.used_size)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{formatPages(file.reserved_size)}</td>
                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-400">{formatPages(file.total_size)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. VISUAL DISTRIBUTION (CSS PIE CHARTS) */}
          <section className="bg-white dark:bg-bk-side rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-bk-yellow">pie_chart</span>
              <h2 className="font-bold text-slate-800 dark:text-white">Utilization Distribution</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               {/* Just showing one or two relevant pies based on totals */}
               <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
                    style={{
                      background: `conic-gradient(
                        #ffda44 0% ${totals?.pct}%, 
                        rgba(200, 200, 200, 0.1) ${totals?.pct}% 100%
                      )`
                    }}
                  >
                     <div className="absolute w-28 h-28 bg-white dark:bg-bk-side rounded-full flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-slate-800 dark:text-white font-mono leading-none">
                          {totals?.pct.toFixed(0)}%
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Consumed</span>
                     </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Total System Storage</div>
                    <div className="text-[10px] text-slate-400">Aggregated volumes</div>
                  </div>
               </div>

               <div className="space-y-4 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-[6px] bg-bk-yellow shadow-[0_0_5px_rgba(255,218,68,0.5)]"></div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                           <span className="text-slate-500 uppercase">Utilized</span>
                           <span className="text-slate-800 dark:text-white">{formatSize(totals?.used)}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-[6px] bg-slate-200 dark:bg-white/10"></div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                           <span className="text-slate-500 uppercase">Available</span>
                           <span className="text-slate-800 dark:text-white">{formatSize(totals?.free)}</span>
                        </div>
                     </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                     <div className="text-[10px] text-slate-400 italic leading-relaxed">
                        Data reflects physical allocation tracking on nodes. Percentage reflects combined permanent and temporary pools.
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
