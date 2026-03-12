import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../host/hostApi';
import { databaseApi } from '../../database/databaseApi';
import DatabaseVolumes from './DatabaseVolumes';
import Brokers from './Brokers';
import SystemInfo from './SystemInfo';

export default function ServerContent({ hostUid }) {
  const { databases, activeDatabases } = useSelector((state) => state.database);
  const { hosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  const [autoStartDBs, setAutoStartDBs] = useState([]);

  const systemStatus = [
    { time: "Now", memory: "15.86GB / 31.09GB", memPct: 51, disk: "227.4GB", cpu: "10%", cpuPct: 10, tps: "39", qps: "4" },
    { time: "5 min Avg", memory: "15.89GB / 31.09GB", memPct: 51.1, disk: "-", cpu: "11.5%", cpuPct: 11.5, tps: "32", qps: "2.25" },
  ];

  useEffect(() => {
    const fetchAutoStartInfo = async () => {
      try {
        const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
        const lines = response?.conflist?.[0]?.confdata || [];
        
        let serviceEnabled = false;
        let servers = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed) continue;
          
          if (trimmed.startsWith('service=')) {
            const val = trimmed.split('=')[1] || '';
            const services = val.split(',').map(s => s.trim().toLowerCase());
            if (services.includes('server')) {
              serviceEnabled = true;
            }
          }
          
          if (trimmed.startsWith('server=')) {
            const val = trimmed.split('=')[1] || '';
            servers = val.split(',').map(s => s.trim());
          }
        }
        
        if (serviceEnabled) {
          setAutoStartDBs(servers);
        } else {
          setAutoStartDBs([]);
        }
      } catch (err) {
        console.error('Failed to fetch auto-start info:', err);
        setAutoStartDBs([]);
      }
    };
    
    if (hostUid) {
      fetchAutoStartInfo();
    }
  }, [hostUid]);

  const handleAutoStartToggle = async (dbname, isCurrentlyAutoStart) => {
    try {
      const payload = {
        confname: 'cubridconf',
        dbname: dbname
      };

      if (isCurrentlyAutoStart) {
        await databaseApi.removeAutoStart(hostUid, payload);
      } else {
        await databaseApi.setAutoStart(hostUid, payload);
      }

      // Refresh info
      const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
      const lines = response?.conflist?.[0]?.confdata || [];
      
      let serviceEnabled = false;
      let servers = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed) continue;
        
        if (trimmed.startsWith('service=')) {
          const val = trimmed.split('=')[1] || '';
          const services = val.split(',').map(s => s.trim().toLowerCase());
          if (services.includes('server')) serviceEnabled = true;
        }
        
        if (trimmed.startsWith('server=')) {
          const val = trimmed.split('=')[1] || '';
          servers = val.split(',').map(s => s.trim());
        }
      }
      
      if (serviceEnabled) {
        setAutoStartDBs(servers);
      } else {
        setAutoStartDBs([]);
      }
    } catch (err) {
      console.error('Failed to update auto-start:', err);
    }
  };

  const dbListDisplay = databases.map(db => ({
    db: db.dbname,
    autoStart: autoStartDBs.includes(db.dbname),
    status: activeDatabases.includes(db.dbname) ? "On" : "Off"
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-bk-side/50">
        <span className="font-medium text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-1.5 font-sans">
          <span className="material-symbols-outlined text-[14px]">dns</span>
          Host - {currentHost ? (currentHost.alias || currentHost.id) : 'unknown'}
        </span>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        
        {/* Database Volumes Section */}
        <DatabaseVolumes hostUid={hostUid} />

        {/* Brokers Section */}
        <Brokers hostUid={hostUid} />
        
        {/* System Status Section */}
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
        
        {/* Databases Section */}
        <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
            <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">database</span>
            <span>Databases</span>
          </summary>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap font-sans">
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Database</th>
                  <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Auto Startup</th>
                  <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {dbListDisplay.map((row, i) => (
                  <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-sans font-medium">{row.db}</td>
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 cursor-pointer accent-bk-yellow" 
                        checked={row.autoStart} 
                        onChange={() => handleAutoStartToggle(row.db, row.autoStart)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {row.status === 'On' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          On
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          Off
                        </span>
                      )}

                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        
        {/* System Info Section */}
        <SystemInfo hostUid={hostUid} />

      </div>
    </div>

  );
}
