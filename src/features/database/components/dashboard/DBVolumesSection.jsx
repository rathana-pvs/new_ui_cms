export default function DBVolumesSection({ volumes }) {
  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Volumes</span>
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Volume</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Type</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Purpose</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Free size / Total size</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Modify date</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Volume Path</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {volumes?.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-sans font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.purpose}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 w-full max-w-[150px]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span>{row.free} / {row.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden" title={`${row.freePct}% Free`}>
                      <div className="h-full rounded-full bg-bk-yellow" style={{ width: `${row.freePct}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 font-sans">{row.path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
