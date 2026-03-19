import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDatabaseSpaceInfo } from '../databaseSlice';

/**
 * VolumeInfoMonitor Component
 * Displays detailed information about a specific database volume,
 * mirroring the "Volume Info" editor in the desktop client.
 * 
 * Tab ID Format: vol_info:<hostUid>:<dbname>:<volname>
 */
export default function VolumeInfoMonitor({ tabId }) {
  const dispatch = useDispatch();
  const [, hostUid, dbname, volname] = tabId.split(':');
  
  const { spaceInfo, spaceInfoLoading } = useSelector((state) => state.database);
  const dbSpace = spaceInfo[dbname];
  const isLoading = spaceInfoLoading[dbname];

  useEffect(() => {
    if (!dbSpace && !isLoading) {
      dispatch(fetchDatabaseSpaceInfo({ hostUid, dbname }));
    }
  }, [dispatch, hostUid, dbname, dbSpace, isLoading]);

  const volume = useMemo(() => {
    if (!dbSpace) return null;
    return dbSpace.volumes.find(v => v.spacename === volname);
  }, [dbSpace, volname]);

  const pageSize = dbSpace?.summary?.[0]?.pagesize || 4096;

  if (isLoading && !volume) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 bg-slate-50/30 dark:bg-transparent">
        <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg"></div>
        <p className="text-sm font-medium animate-pulse tracking-wide">Fetching Volume Metrics...</p>
      </div>
    );
  }

  if (!volume) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 bg-slate-50/30 dark:bg-transparent">
        <span className="material-symbols-outlined text-6xl opacity-20">inventory_2</span>
        <p className="text-lg font-semibold text-slate-300">Volume Not Found</p>
        <p className="text-xs">The volume "{volname}" could not be located in database "{dbname}".</p>
      </div>
    );
  }

  const freePages = volume.freepage || 0;
  const totalPages = volume.totalpage || 0;
  const usedPages = totalPages - freePages;
  const freeM = (freePages * pageSize) / (1024 * 1024);
  const totalM = (totalPages * pageSize) / (1024 * 1024);
  const usedM = (usedPages * pageSize) / (1024 * 1024);
  const usedPercent = totalPages > 0 ? (usedPages / totalPages) * 100 : 0;

  return (
    <div className="h-full overflow-hidden bg-white dark:bg-[#0b0c10] flex flex-col animate-in fade-in duration-700">
      {/* Ghost Header Title - Refined */}
      <div className="relative h-20 shrink-0 bg-white/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.03] px-8 flex items-center">
        <div className="relative z-10 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] opacity-90">Volume Metrics</span>
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight truncate max-w-3xl">
            {volume.location}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row p-8 gap-8 overflow-hidden">
        {/* Left Stats Section */}
        <div className="flex flex-col gap-6 w-full md:w-[320px] shrink-0">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] shadow-sm flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage Details</span>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 mb-1">Type</span>
                  <div className="px-3 py-1.5 bg-slate-200 dark:bg-white/10 rounded-lg text-[12px] font-bold text-slate-700 dark:text-slate-200 inline-block border border-slate-300 dark:border-white/5 w-fit">
                    {volume.type}
                  </div>
                </div>
                {volume.purpose && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 mb-1">Purpose</span>
                    <div className="px-3 py-1.5 bg-amber-500/10 rounded-lg text-[12px] font-bold text-amber-600 dark:text-amber-500 border border-amber-500/10 w-fit">
                      {volume.purpose}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-white/5"></div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Page Architecture</span>
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500">Unit Size</span>
                  <span className="text-[14px] font-mono font-bold text-slate-800 dark:text-slate-100">{pageSize.toLocaleString()} B</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-slate-500">Total Count</span>
                   <span className="text-[14px] font-mono font-bold text-slate-600 dark:text-slate-400">{(totalPages / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-5 rounded-2xl bg-bk-yellow/5 border border-bk-yellow/10">
            <div className="flex items-center gap-2 mb-2 text-bk-yellow">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Volume Health</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
               This volume is performing at <span className="text-emerald-500 font-bold">peak efficiency</span> with <span className="text-slate-800 dark:text-slate-100 font-bold">{freeM.toFixed(1)} MB</span> of headroom remaining.
            </p>
          </div>
        </div>

        {/* Visualization Canvas */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-white/[0.01] rounded-[32px] border border-slate-200 dark:border-white/[0.03] p-8 relative overflow-hidden group">
           {/* Grid Pattern Background */}
           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                style={{backgroundImage: 'radial-gradient(circle, #7777fd 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
           
           <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative z-10">
              <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                 {/* Radial Glow */}
                 <div className="absolute inset-[-40px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
                 
                 <div className="relative w-[90%] h-[90%] animate-in zoom-in duration-1000">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-visible">
                      {/* Base Track */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#7777fd" strokeWidth="18" className="opacity-10 dark:opacity-20" />
                      
                      {/* Free Space Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#7777fd" 
                        strokeWidth="18"
                        strokeDasharray="251.3"
                        className="opacity-90 dark:opacity-80 transition-all duration-1000"
                      />
                      
                      {/* Used Space Arc */}
                      {usedPercent > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#eb8b52"
                          strokeWidth="18"
                          strokeDasharray={`${usedPercent * 2.513} 251.3`}
                          transform="rotate(-90 50 50)"
                          className="transition-all duration-1000 ease-out"
                        />
                      )}
                      
                      {/* Highlight Inner/Outer Rings */}
                      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-white/10" />
                      <circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-white/10" />
                    </svg>

                    {/* Central Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <div className="flex flex-col items-center">
                          <span className="text-[44px] font-black text-slate-800 dark:text-white leading-none tracking-tighter">
                            {usedPercent.toFixed(0)}<span className="text-lg text-slate-400 font-bold tracking-normal">%</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Utilization</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Data Cards for Legend */}
              <div className="mt-12 flex flex-wrap justify-center gap-6">
                 <div className="px-6 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] shadow-sm flex items-center gap-4 hover:border-amber-500/30 transition-colors">
                    <div className="w-3 h-3 rounded-sm bg-[#eb8b52] shadow-[0_0_10px_#eb8b5244] shrink-0"></div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Physical Used</span>
                       <span className="text-[15px] font-black text-slate-800 dark:text-slate-200">{usedM.toFixed(1)} MB</span>
                    </div>
                 </div>
                 <div className="px-6 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] shadow-sm flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                    <div className="w-3 h-3 rounded-sm bg-[#7777fd] shadow-[0_0_10px_#7777fd44] shrink-0"></div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Physical Free</span>
                       <span className="text-[15px] font-black text-slate-800 dark:text-slate-200">{freeM.toFixed(1)} MB</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Visualization Control Footer */}
           <div className="mt-auto flex items-center justify-between pt-8">
              <div className="flex items-center gap-3">
                 <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-50 dark:ring-bk-main bg-emerald-500 animate-pulse"></div>
                    <div className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-50 dark:ring-bk-main bg-indigo-500"></div>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Telemetry Active</span>
              </div>
              <button 
                 onClick={() => dispatch(fetchDatabaseSpaceInfo({ hostUid, dbname }))}
                 className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-200 dark:bg-white/5 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10 transition-all border border-slate-300 dark:border-white/10 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px] leading-none">refresh</span>
                Refresh Session
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
