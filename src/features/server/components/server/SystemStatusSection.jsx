export default function SystemStatusSection({ systemStatus }) {
  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span className="material-symbols-outlined text-[16px] text-slate-400">bar_chart</span>
        <span>System status <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-[11px]">(Refreshes dynamically)</span></span>
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              {["Time", "Memory", "Disk", "CPU", "TPS", "QPS"].map(col => (
                <th key={col} className="px-4 py-3 font-medium text-[10px] tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {systemStatus.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-sans">{row.time}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 w-full max-w-[160px]">
                    <span>{row.memory}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full ${row.memPct > 80 ? 'bg-rose-500' : 'bg-bk-yellow'}`} style={{ width: `${row.memPct}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{row.disk}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 w-full max-w-[80px]">
                    <span>{row.cpu}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                      <div className={`h-full rounded-full ${row.cpuPct > 80 ? 'bg-rose-500' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.cpuPct}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{row.tps}</td>
                <td className="px-4 py-3">{row.qps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
