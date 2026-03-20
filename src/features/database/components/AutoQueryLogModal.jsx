import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeAutoQueryLogModal, fetchQueryPlanLog } from '../databaseSlice';
import LoadingOverlay from '../../../components/ui/Feedback/LoadingOverlay';

export default function AutoQueryLogModal() {
  const dispatch = useDispatch();
  const { isAutoQueryLogModalOpen, queryPlanLogs, logsLoading, logsError, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAutoQueryLogModalOpen && selectedHostUid) {
      dispatch(fetchQueryPlanLog({ hostUid: selectedHostUid }));
    }
  }, [isAutoQueryLogModalOpen, selectedHostUid, dispatch]);

  if (!isAutoQueryLogModalOpen) return null;

  const filteredLogs = (queryPlanLogs || []).filter(log => {
    const matchesDB = selectedDatabase ? log.dbname === selectedDatabase : true;
    const matchesSearch = log.query_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.error_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.dbname?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDB && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[800px] h-[600px] rounded-[6px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-sky-500/60"></div>

        <LoadingOverlay 
          isVisible={logsLoading} 
          title="Fetching query logs" 
          subtitle="Retrieving historical automated query execution data..." 
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-sm">
              <span className="material-symbols-outlined text-sky-500 text-[22px]">history</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white leading-none tracking-tight">Auto Query Log</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                {selectedDatabase ? `History for database: ${selectedDatabase}` : 'Global Query Execution History'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 group-focus-within:text-sky-500 transition-colors">search</span>
                <input 
                   type="text"
                   placeholder="Filter logs..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-48 h-8 pl-9 pr-3 rounded-[6px] bg-white dark:bg-bk-main border border-slate-200 dark:border-white/5 text-[11px] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all"
                />
             </div>
             <button 
                onClick={() => dispatch(closeAutoQueryLogModal())}
                className="w-8 h-8 rounded-[6px] hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
              </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-bk-side">
          <div className="px-6 py-4 flex flex-col gap-3">
             <div className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
               Automated query execution historical entries
             </div>
             <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800"></div>
          </div>

          {logsError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 border border-rose-500/20">
                <span className="material-symbols-outlined text-rose-500 text-3xl">error</span>
              </div>
              <h4 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-2">Failed to load logs</h4>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{logsError}</p>
              <button 
                onClick={() => dispatch(fetchQueryPlanLog({ hostUid: selectedHostUid }))}
                className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-[6px] text-[12px] font-semibold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
              >
                Retry Fetch
              </button>
            </div>
          ) : filteredLogs.length === 0 && !logsLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-3xl italic">folder_off</span>
              </div>
              <h4 className="text-[14px] font-medium text-slate-800 dark:text-white mb-1">No execution logs found</h4>
              <p className="text-[11px] text-slate-400">There are no recorded error entries for the current filter criteria.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-6">
              <div className="border border-slate-100 dark:border-slate-800 rounded-[6px] overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50/90 dark:bg-bk-main/90 backdrop-blur-sm">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-left">Query ID</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-left">Execution Time</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredLogs.map((log, idx) => {
                      const isSuccess = log.error_desc?.toLowerCase().includes('success');
                      const isStart = log.error_desc?.toLowerCase().includes('auto job start');
                      
                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-5 py-4 whitespace-nowrap text-[11px] font-medium text-sky-600 dark:text-sky-400 italic">
                            {log.query_id}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {log.error_time}
                          </td>
                          <td className="px-5 py-4 text-[11px] font-medium leading-relaxed">
                            <div className="flex items-start gap-2.5">
                              {isSuccess ? (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                  <span className="material-symbols-outlined text-[16px] fill-current">check_circle</span>
                                  <span>{log.error_desc}</span>
                                </div>
                              ) : isStart ? (
                                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                                  <span className="material-symbols-outlined text-[16px] animate-pulse">play_circle</span>
                                  <span>{log.error_desc}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
                                  <span className="material-symbols-outlined text-[16px]">report</span>
                                  <span>{log.error_desc}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status:</span>
            {logsLoading ? (
               <span className="flex items-center gap-1.5 text-[10px] text-sky-500 font-bold animate-pulse uppercase">
                 <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                 Buffering
               </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 Synchronized
               </span>
            )}
          </div>
          
          <div className="flex gap-3">
             <button 
              className="px-6 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-[6px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-[0.98]"
              onClick={() => dispatch(closeAutoQueryLogModal())}
            >
              Cancel
            </button>
            <button 
              disabled={logsLoading}
              onClick={() => dispatch(fetchQueryPlanLog({ hostUid: selectedHostUid }))}
              className="px-6 py-1.5 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white text-[11px] font-bold rounded-[6px] border border-sky-500/50 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {logsLoading ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
