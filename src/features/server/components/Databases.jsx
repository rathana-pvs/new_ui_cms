export default function Databases() {
  return (
    <details className="lg:col-span-2 group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-fit" open>
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Databases</h3>
        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
      </summary>
      <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">Database</th>
              <th className="px-6 py-3">Auto Startup</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="px-6 font-medium py-2">demodb</td>
              <td className="px-6 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">ON</span>
              </td>
              <td className="px-6 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">ACTIVE</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <td className="px-6 font-medium py-2">db1</td>
              <td className="px-6 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">OFF</span>
              </td>
              <td className="px-6 py-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">INACTIVE</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}
