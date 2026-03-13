export default function DBPerformanceSection({ dbStats }) {
  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Database performance</span>
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">CPU</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Memory (MB)</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">QPS</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Hit Ratio</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Fetch pages</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Dirty pages</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">I/O Reads</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">I/O Writes</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {dbStats.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 text-slate-900 dark:text-white">
                  <div className="flex flex-col gap-1 w-full max-w-[80px]">
                    <span>{row.cpu}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full ${row.cpuPct > 80 ? 'bg-rose-500' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.cpuPct}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 w-full max-w-[120px]">
                    <span>{row.memory}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full ${row.memPct > 80 ? 'bg-rose-500' : 'bg-bk-yellow'}`} style={{ width: `${row.memPct}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-sans font-medium">{row.qps}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 w-full max-w-[120px]">
                    <span>{row.hitRatio}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full ${row.hitPct < 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${row.hitPct}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{row.fetch}</td>
                <td className="px-4 py-3">{row.dirty}</td>
                <td className="px-4 py-3">{row.ioReads}</td>
                <td className="px-4 py-3">{row.ioWrites}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
