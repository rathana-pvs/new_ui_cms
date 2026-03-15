export default function DBBrokersCASSection({ brokersCAS }) {
  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Brokers (CAS)</span>
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Broker</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">ID</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">PID</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">QPS</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">LQS</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Status</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Last connection time</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {brokersCAS.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-sans font-medium">{row.broker}</td>
                <td className="px-4 py-3">{row.id}</td>
                <td className="px-4 py-3">{row.pid}</td>
                <td className="px-4 py-3">{row.qps}</td>
                <td className="px-4 py-3">{row.lqs}</td>
                <td className="px-4 py-3">
                  {row.status === 'READY' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-500/20">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      Busy
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-sans">{row.lastConn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
