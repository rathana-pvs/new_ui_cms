import { useSelector } from 'react-redux';
import DatabaseVolumes from './DatabaseVolumes';
import Brokers from './Brokers';
import SystemInfo from './SystemInfo';

export default function ServerContent({ hostUid }) {
  const { databases, activeDatabases } = useSelector((state) => state.database);
  const { hosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);

  const systemStatus = [
    { time: "Now", memory: "15.86GB / 31.09GB", memPct: 51, disk: "227.4GB", cpu: "10%", cpuPct: 10, tps: "39", qps: "4" },
    { time: "5 min Avg", memory: "15.89GB / 31.09GB", memPct: 51.1, disk: "-", cpu: "11.5%", cpuPct: 11.5, tps: "32", qps: "2.25" },
  ];

  const dbListDisplay = databases.map(db => ({
    db: db.dbname,
    autoStart: false,
    status: activeDatabases.includes(db.dbname) ? "Running" : "Stopped"
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0f1116]">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 text-[13px] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <span className="material-symbols-outlined text-[14px]">storage</span>
          Host - {currentHost ? (currentHost.alias || currentHost.id) : 'unknown'}
        </span>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        
        {/* Database Volumes Section */}
        <DatabaseVolumes hostUid={hostUid} />

        {/* Brokers Section */}
        <Brokers hostUid={hostUid} />
        
        {/* System Status Section */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors bg-purple-50/50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-purple-500 dark:text-purple-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>System Status <span className="font-normal text-purple-600/70 dark:text-purple-400/70 ml-1">(Automatically reload. First 15 seconds it will be refreshed each 1 second. After 15 seconds, it will be refreshed each 30 seconds.)</span></span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  {["Time", "Memory", "Disk", "CPU", "TPS", "QPS"].map(col => (
                    <th key={col} className="px-4 py-3 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systemStatus.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.time}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 w-full max-w-[160px]">
                        <span>{row.memory}</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                          <div className={`h-full rounded-full ${row.memPct > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${row.memPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.disk}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col gap-1 w-full max-w-[80px]">
                        <span>{row.cpu}</span>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                          <div className={`h-full rounded-full ${row.cpuPct > 80 ? 'bg-red-500' : row.cpuPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.cpuPct}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.tps}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">{row.qps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        
        {/* Databases Section */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-slate-900 shadow-ob-subtle overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors bg-amber-50/50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 text-sm font-semibold text-slate-900 dark:text-white">
            <span className="material-symbols-outlined text-[16px] text-amber-500 dark:text-amber-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span>Databases</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 opacity-90 bg-slate-50/30 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium">Database</th>
                  <th className="px-4 py-3 font-medium">Auto Startup</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dbListDisplay.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 font-medium">{row.db}</td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/50 cursor-pointer" 
                        readOnly
                        checked={row.autoStart} 
                      />
                    </td>
                    <td className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {row.status === 'Running' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                        <span>{row.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        
        {/* System Info Section */}
        {/* System Info Section */}
        <SystemInfo hostUid={hostUid} />

      </div>
    </div>
  );
}
