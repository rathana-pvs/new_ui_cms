import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

export default function VolumeCategoryMonitor({ hostUid, dbname, category }) {
  const { spaceInfo } = useSelector((state) => state.database);
  
  const dbSpace = spaceInfo[dbname];
  
  const volumes = useMemo(() => {
    if (!dbSpace || !dbSpace.volumes) return [];
    const allVolumes = dbSpace.volumes;
    
    switch (category) {
      case 'Permanent_PermanentData':
        return allVolumes.filter(v => v.type === 'PERMANENT' && (v.purpose === 'PERMANENT' || !v.purpose));
      case 'Permanent_TemporaryData':
        return allVolumes.filter(v => v.type === 'PERMANENT' && v.purpose === 'TEMPORARY');
      case 'Temporary_TemporaryData':
        return allVolumes.filter(v => v.type === 'TEMPORARY');
      case 'Active':
        return allVolumes.filter(v => v.type === 'Active_log');
      case 'Archive':
        return allVolumes.filter(v => v.type === 'Archive_log');
      default:
        return [];
    }
  }, [dbSpace, category]);

  const pageSize = parseInt(dbSpace?.pagesize || 4096);

  const formatMB = (pages) => {
    return ((parseInt(pages) * pageSize) / (1024 * 1024)).toFixed(2);
  };

  const formatSize = (pages) => {
    const bytes = parseInt(pages) * pageSize;
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const summary = useMemo(() => {
    let total = 0;
    let used = 0;
    volumes.forEach(v => {
      total += parseInt(v.totalpage || 0);
      used += parseInt(v.usedpage || 0);
    });
    return {
      total,
      used,
      free: total - used,
      pct: total > 0 ? (used / total) * 100 : 0
    };
  }, [volumes]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0b0c10] overflow-hidden font-sans select-none animate-in fade-in duration-500">
      {/* Premium Header */}
      <header className="px-8 py-6 border-b border-slate-100 dark:border-white/[0.03] flex items-center justify-between relative overflow-hidden shrink-0">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
             <span className="material-symbols-outlined text-amber-500 text-[28px]" style={{ fontVariationSettings: "'wght' 300" }}>
               database
             </span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Volume Information
            </h1>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.2em] mt-1 opacity-90">
              Category: {category.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        
        {/* Quick Highlights */}
        <div className="hidden md:flex items-center gap-8 relative z-10">
           <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total capacity</span>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono tracking-tighter">
                {formatSize(summary.total)}
              </span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Utilization</span>
              <span className={`text-sm font-black font-mono tracking-tighter ${summary.pct > 80 ? 'text-rose-500' : 'text-amber-500'}`}>
                {summary.pct.toFixed(2)}%
              </span>
           </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-amber-500/[0.03] to-transparent pointer-events-none" />
      </header>
      
      <div className="flex-1 overflow-auto p-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/5">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Summary Breadcrumbs / Mini-Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
               { label: 'Units Detected', val: volumes.length, icon: 'analytics', color: 'text-blue-500', bg: 'bg-blue-500/10' },
               { label: 'Used Storage', val: formatSize(summary.used), icon: 'pie_chart', color: 'text-amber-500', bg: 'bg-amber-500/10' },
               { label: 'Available free', val: formatSize(summary.free), icon: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
             ].map((stat, i) => (
                <div key={i} className="px-5 py-4 rounded-[6px] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] flex items-center gap-4 group hover:border-amber-500/30 transition-all">
                   <div className={`w-10 h-10 rounded-[6px] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
                      <span className="text-sm font-black text-slate-700 dark:text-slate-100 font-mono tracking-tight">{stat.val}</span>
                   </div>
                </div>
             ))}
          </div>

          <div className="rounded-[6px] bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.05] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.02] uppercase tracking-wider">
                  <th className="px-6 py-4">Volume Name</th>
                  <th className="px-6 py-4 min-w-[300px]">Physical Allocation (Used / Free)</th>
                  <th className="px-6 py-4 text-right">Provisioned</th>
                  <th className="px-6 py-4 text-right pr-8">Total Pages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                {volumes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-xs">
                      No volumes found in this category
                    </td>
                  </tr>
                ) : (
                  volumes.map((vol, idx) => {
                    const usedPages = parseInt(vol.usedpage || 0);
                    const totalPages = parseInt(vol.totalpage || 0);
                    const freePages = totalPages - usedPages;
                    const pct = totalPages > 0 ? (usedPages / totalPages) * 100 : 0;
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-[6px] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">description</span>
                             </div>
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono tracking-tight">
                               {vol.spacename.split(/[\\/]/).pop()}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-[10px] font-bold font-mono">
                                 <span className="text-blue-600 dark:text-blue-400 tracking-tighter">USED: {formatMB(usedPages)} MB</span>
                                 <span className="text-slate-400 tracking-tighter">FREE: {formatMB(freePages)} MB</span>
                              </div>
                              <div className="w-full h-4 flex bg-slate-100 dark:bg-white/10 rounded-[6px] overflow-hidden p-[2px]">
                                 <div 
                                   className="h-full bg-blue-600 dark:bg-blue-500 rounded-[6px] relative group/bar"
                                   style={{ width: `${pct}%` }}
                                 >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                 </div>
                                 <div 
                                   className="h-full flex-1 bg-amber-500/20 dark:bg-amber-500/10 rounded-[6px] ml-[2px]"
                                 />
                              </div>
                              <div className="text-[9px] text-slate-400/60 font-medium">Relative distribution based on page count</div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-[13px] font-black text-slate-700 dark:text-slate-300">
                          {formatSize(totalPages)}
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-[11px] text-slate-400 dark:text-slate-500 pr-8">
                          {parseInt(totalPages).toLocaleString()} <span className="text-[10px] uppercase opacity-50">Pages</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Refined Footer */}
      <footer className="px-8 py-4 border-t border-slate-100 dark:border-white/[0.03] bg-slate-50/50 dark:bg-white/[0.01] shrink-0">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </div>
               <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                 Live Telemetry Active
               </span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">
              Metadata gathered from {dbname} @ host
            </span>
         </div>
      </footer>
    </div>
  );
}
