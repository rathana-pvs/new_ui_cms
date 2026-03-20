import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAutoVolumeLog, closeAutoVolumeLogModal } from '../databaseSlice';

export default function AutoVolumeLogModal() {
  const dispatch = useDispatch();
  const { isAutoVolumeLogModalOpen, selectedDatabase, autoVolumeLogs, logsLoading } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAutoVolumeLogModalOpen && selectedHostUid) {
      dispatch(fetchAutoVolumeLog({ hostUid: selectedHostUid }));
    }
  }, [isAutoVolumeLogModalOpen, selectedHostUid, dispatch]);

  if (!isAutoVolumeLogModalOpen) return null;

  const filteredLogs = autoVolumeLogs.filter(log => {
      const matchesDB = selectedDatabase ? log.dbname === selectedDatabase : true;
      const matchesSearch = log.volname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.outcome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.dbname?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDB && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[900px] h-[640px] rounded-[6px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-amber-500/60"></div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-sm">
              <span className="material-symbols-outlined text-amber-500 text-[22px]">history_edu</span>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-900 dark:text-white leading-none tracking-tight">Auto volume log</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                {selectedDatabase ? `Audit history for: ${selectedDatabase}` : 'Global automation history'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 group-focus-within:text-amber-500 transition-colors">search</span>
                <input 
                  type="text" placeholder="Filter logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-56 h-8 pl-9 pr-3 rounded-[6px] bg-white dark:bg-bk-main border border-slate-200 dark:border-white/5 text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all"
                />
             </div>
             <button onClick={() => dispatch(closeAutoVolumeLogModal())} className="w-8 h-8 rounded-[6px] hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group">
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">close</span>
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <div className="border border-slate-100 dark:border-slate-800 rounded-[6px] overflow-hidden shadow-sm">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02] backdrop-blur-sm sticky top-0 z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3 text-left border-b border-slate-100 dark:border-slate-800">Database</th>
                  <th className="px-5 py-3 text-left border-b border-slate-100 dark:border-slate-800">Volume Name</th>
                  <th className="px-5 py-3 text-left border-b border-slate-100 dark:border-slate-800">Purpose</th>
                  <th className="px-5 py-3 text-left border-b border-slate-100 dark:border-slate-800">Pages</th>
                  <th className="px-5 py-3 text-left border-b border-slate-100 dark:border-slate-800">Time</th>
                  <th className="px-5 py-3 text-left border-b border-slate-100 dark:border-slate-800">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {logsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan="6" className="px-5 py-4"><div className="h-4 bg-slate-100 dark:bg-white/5 rounded-[6px] w-full"></div></td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-20 text-center">
                       <div className="flex flex-col items-center gap-2 text-slate-400">
                          <span className="material-symbols-outlined text-4xl">inventory_2</span>
                          <span className="text-[11px] font-bold uppercase tracking-widest">No automation logs found</span>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => {
                  const isSuccess = log.outcome?.toLowerCase() === 'success';
                  const isStart = log.outcome?.toLowerCase() === 'start';
                  const isError = !isSuccess && !isStart;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-bold text-slate-700 dark:text-slate-200">{log.dbname}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-mono text-amber-600 dark:text-bk-yellow">{log.volname}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.5 rounded-[6px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-[9px] uppercase font-bold tracking-tighter">{log.purpose}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">{log.page}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">{log.time}</td>
                      <td className="px-5 py-3.5">
                         <div className={`flex items-center gap-2 text-[11px] font-bold ${isSuccess ? 'text-emerald-500' : isStart ? 'text-amber-500' : 'text-rose-500'}`}>
                           <span className="material-symbols-outlined text-[16px]">
                             {isSuccess ? 'check_circle' : isStart ? 'play_circle' : 'report'}
                           </span>
                           <span className="uppercase tracking-tight">{log.outcome}</span>
                         </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Server:</span>
             <span className="text-[11px] font-bold text-emerald-500">Connected</span>
          </div>
          <button className="px-6 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-[6px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-[0.98]" onClick={() => dispatch(closeAutoVolumeLogModal())}>Close audit</button>
        </div>
      </div>
    </div>
  );
}
