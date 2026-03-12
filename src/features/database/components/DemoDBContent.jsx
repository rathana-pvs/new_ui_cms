export default function DemoDBContent() {
  const dbStats = [
    { cpu: "12%", cpuPct: 12, memory: "1.2GB", memPct: 15, qps: "150", hitRatio: "99.8%", hitPct: 99.8, fetch: "834", dirty: "12", ioReads: "51", ioWrites: "8" }
  ];

  const volumes = [
    { name: "demodb", type: "SYS", purpose: "PERMANENT", free: "40MB", total: "128MB", freePct: 31.2,  date: "2026-03-10 12:00:00", path: "/home/cubrid/CUBRID/databases/demodb" },
    { name: "demodb_l01", type: "LOG", purpose: "ACTIVE", free: "508MB", total: "512MB", freePct: 99.2, date: "2026-03-10 12:00:00", path: "/home/cubrid/CUBRID/databases/demodb/log" }
  ];

  const spaceInfo = [
    { type: "DATA", fileCount: "1", usedPages: "12", fileTablePages: "1", reservedPages: "512", totalPages: "525" },
    { type: "INDEX", fileCount: "2", usedPages: "4", fileTablePages: "1", reservedPages: "256", totalPages: "261" }
  ];

  const brokersCAS = [
    { broker: "query_editor", id: "1", pid: "19", qps: "8", lqs: "0", status: "READY", lastConn: "2026-03-10 13:40:02" },
    { broker: "broker1", id: "1", pid: "30", qps: "12", lqs: "2", status: "BUSY", lastConn: "2026-03-10 13:41:05" }
  ];

  const locks = [
    { index: "1", user: "dba", host: "localhost", pid: "1192", obj: "tb_user", mode: "X_LOCK" },
    { index: "2", user: "public", host: "192.168.1.5", pid: "1205", obj: "tb_product", mode: "S_LOCK" }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-bk-side/50">
        <span className="font-medium text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-1.5 font-sans">
          <span className="material-symbols-outlined text-[14px]">database</span>
          Database - demodb@localhost:8001
        </span>
        <button className="ml-auto text-slate-500 opacity-70 hover:text-bk-yellow dark:hover:text-bk-yellow transition-colors" title="Reload View">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
        </button>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        
        {/* Database Stats */}
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

        {/* Volumes */}
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
                {volumes.map((row, i) => (
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

        {/* Space Info For Files */}
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

        {/* Brokers (CAS) */}
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
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
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

        {/* Lock and Transaction */}
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

      </div>
    </div>

  );
}
