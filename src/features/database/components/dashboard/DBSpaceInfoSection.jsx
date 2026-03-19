export default function DBSpaceInfoSection({ spaceInfo }) {
  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Space info for files</span>
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Type</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">File Count</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Used Pages</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">File Table Pages</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Reserved Pages</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Total Pages</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {spaceInfo.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-sans font-medium">{row.type}</td>
                <td className="px-4 py-3">{row.fileCount}</td>
                <td className="px-4 py-3">{row.usedPages}</td>
                <td className="px-4 py-3">{row.fileTablePages}</td>
                <td className="px-4 py-3">{row.reservedPages}</td>
                <td className="px-4 py-3">{row.totalPages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
