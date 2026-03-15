import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonitoringData, clearMonitoring } from '../../monitoringSlice';

export default function SystemStatusSection({ hostUid }) {
  const dispatch = useDispatch();
  const { currentStatus, averages, history, loading, error } = useSelector((state) => state.monitoring);
  const { authorizedHosts } = useSelector((state) => state.host);
  const isAuthorized = hostUid && authorizedHosts.includes(hostUid);
  
  const [isStopped, setIsStopped] = useState(false);
  const pollTimer = useRef(null);
  const fetchCountRef = useRef(0);

  const startPolling = () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (!isAuthorized) return;
    setIsStopped(false);
    fetchCountRef.current = 0;
    dispatch(clearMonitoring());
    dispatch(fetchMonitoringData(hostUid));
    scheduleNext(1000);
  };

  const scheduleNext = (delay) => {
    pollTimer.current = setTimeout(() => {
      if (!isAuthorized) {
        setIsStopped(true);
        return;
      }
      
      dispatch(fetchMonitoringData(hostUid));
      fetchCountRef.current += 1;

      // Determine next delay based on the ref value
      const nextDelay = fetchCountRef.current < 15 ? 1000 : 30000;
      
      // Stop after ~5 minutes total
      if (fetchCountRef.current < 30) {
        scheduleNext(nextDelay);
      } else {
        setIsStopped(true);
      }
    }, delay);
  };

  useEffect(() => {
    if (!hostUid || !isAuthorized) {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      return;
    }

    // Initial fetch and start polling
    dispatch(fetchMonitoringData(hostUid));
    scheduleNext(1000);

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [hostUid, isAuthorized, dispatch]);

  const formatBytes = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const rows = [
    {
      time: 'Now',
      memory: currentStatus?.memTotal ? `${formatBytes(currentStatus.memUsed)} / ${formatBytes(currentStatus.memTotal)}` : '-',
      memPct: currentStatus?.memory || 0,
      disk: history[history.length - 1]?.disk || '-',
      cpu: `${(currentStatus?.cpu || 0).toFixed(1)}%`,
      cpuPct: currentStatus?.cpu || 0,
      tps: (currentStatus?.tps || 0).toFixed(2),
      qps: (currentStatus?.qps || 0).toFixed(2)
    },
    {
      time: '5 min Avg',
      memory: (averages?.memory || 0).toFixed(1) + '%',
      memPct: averages?.memory || 0,
      disk: '-',
      cpu: `${(averages?.cpu || 0).toFixed(1)}%`,
      cpuPct: averages?.cpu || 0,
      tps: (averages?.tps || 0).toFixed(2),
      qps: (averages?.qps || 0).toFixed(2)
    }
  ];

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">bar_chart</span>
          <span>System status <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-[11px]">
            {isStopped ? '(Paused to save resources)' : '(Refreshes dynamically)'}
          </span></span>
        </div>
        {isStopped && (
          <button 
            onClick={(e) => { e.preventDefault(); startPolling(); }}
            className="flex items-center gap-1 px-2 py-1 text-[10px] bg-bk-yellow hover:bg-bk-yellow/80 text-bk-side rounded-md font-bold transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
             Resume
          </button>
        )}
      </summary>
      <div className="overflow-x-auto w-full">
        {error && (
          <div className="p-3 text-[11px] text-rose-500 bg-rose-500/10 border-b border-rose-500/20">
            Error: {typeof error === 'object' ? (error.message || error.note || JSON.stringify(error)) : error}
          </div>
        )}
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              {["Time", "Memory", "Disk", "CPU", "TPS", "QPS"].map(col => (
                <th key={col} className="px-4 py-3 font-medium text-[10px] tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => (
              <tr key={i} className="text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-sans">{row.time}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 w-full max-w-[160px]">
                    <span className="text-[10px]">{row.memory}</span>
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
