export default function DBLockTransactionSection({ locks }) {
  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Lock and transaction</span>
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Tran index</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">User name</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Host</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Process id</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Object type</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Mode</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {locks.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-sans font-medium">{row.index}</td>
                <td className="px-4 py-3 font-sans">{row.user}</td>
                <td className="px-4 py-3 text-[11px]">{row.host}</td>
                <td className="px-4 py-3">{row.pid}</td>
                <td className="px-4 py-3 font-sans">{row.obj}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${row.mode === 'X_LOCK' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20' : 'bg-bk-yellow/10 text-bk-yellow border-bk-yellow/20'}`}>
                    {row.mode === 'X_LOCK' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>}
                    {row.mode}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
