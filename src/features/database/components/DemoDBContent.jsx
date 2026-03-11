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
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f1116]">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 text-[13px] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <span className="font-medium hover:text-primary cursor-pointer transition-colors">localhost</span>
        <span className="text-slate-500 opacity-60">›</span>
        <span className="font-semibold text-slate-900 dark:text-white">Database - demodb@localhost:8001</span>
        <button className="ml-auto text-slate-500 opacity-70 hover:text-primary dark:hover:text-white transition-colors" title="Reload View">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
        </button>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        
        {/* Database Stats */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-blue-500 dark:text-blue-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>Database</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">CPU</th>
                  <th className="px-4 py-3 font-medium">Memory (MB)</th>
                  <th className="px-4 py-3 font-medium">QPS</th>
                  <th className="px-4 py-3 font-medium">Hit Ratio</th>
                  <th className="px-4 py-3 font-medium">Fetch pages</th>
                  <th className="px-4 py-3 font-medium">Dirty pages</th>
                  <th className="px-4 py-3 font-medium">I/O Reads</th>
                  <th className="px-4 py-3 font-medium">I/O Writes</th>
                </tr>
              </thead>
              <tbody>
                {dbStats.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 w-full max-w-[80px]">
                        <span>{row.cpu}</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                          <div className={`h-full rounded-full ${row.cpuPct > 80 ? 'bg-red-500' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.cpuPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 w-full max-w-[120px]">
                        <span>{row.memory}</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                          <div className={`h-full rounded-full ${row.memPct > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${row.memPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium">{row.qps}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 w-full max-w-[120px]">
                        <span>{row.hitRatio}</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                          <div className={`h-full rounded-full ${row.hitPct < 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${row.hitPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.fetch}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.dirty}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.ioReads}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.ioWrites}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Volumes */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors bg-emerald-50/50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-emerald-500 dark:text-emerald-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>Volumes</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">Volume</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Free size / Total size</th>
                  <th className="px-4 py-3 font-medium">Modify date</th>
                  <th className="px-4 py-3 font-medium">Volume Path</th>
                </tr>
              </thead>
              <tbody>
                {volumes.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium">{row.name}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.type}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.purpose}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 w-full max-w-[150px]">
                        <div className="flex items-center justify-between text-xs">
                          <span>{row.free} / {row.total}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden" title={`${row.freePct}% Free`}>
                          <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500" style={{ width: `${row.freePct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.date}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">{row.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Space Info For Files */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors bg-purple-50/50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-purple-500 dark:text-purple-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>Space Info For Files</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">File Count</th>
                  <th className="px-4 py-3 font-medium">Used Pages</th>
                  <th className="px-4 py-3 font-medium">File Table Pages</th>
                  <th className="px-4 py-3 font-medium">Reserved Pages</th>
                  <th className="px-4 py-3 font-medium">Total Pages</th>
                </tr>
              </thead>
              <tbody>
                {spaceInfo.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium">{row.type}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.fileCount}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.usedPages}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.fileTablePages}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.reservedPages}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.totalPages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Brokers (CAS) */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors bg-amber-50/50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-amber-500 dark:text-amber-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>Brokers (CAS)</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">Broker</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">PID</th>
                  <th className="px-4 py-3 font-medium">QPS</th>
                  <th className="px-4 py-3 font-medium">LQS</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last connection time</th>
                </tr>
              </thead>
              <tbody>
                {brokersCAS.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium">{row.broker}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.id}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.pid}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.qps}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.lqs}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {row.status === 'READY' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                        {row.status === 'BUSY' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        )}
                        <span>{row.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-slate-500">{row.lastConn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Lock and Transaction */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-colors bg-rose-50/50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-rose-500 dark:text-rose-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>Lock and Transaction</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">Tran index</th>
                  <th className="px-4 py-3 font-medium">User name</th>
                  <th className="px-4 py-3 font-medium">Host</th>
                  <th className="px-4 py-3 font-medium">Process id</th>
                  <th className="px-4 py-3 font-medium">Object type</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                </tr>
              </thead>
              <tbody>
                {locks.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium">{row.index}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.user}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px]">{row.host}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.pid}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.obj}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${row.mode === 'X_LOCK' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
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
