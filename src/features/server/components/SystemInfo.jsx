import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../host/hostApi';

export default function SystemInfo({ hostUid }) {
  const { hosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  
  const [envData, setEnvData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEnv() {
      if (!hostUid) return;
      setLoading(true);
      try {
        const response = await hostApi.getHostEnv(hostUid);
        setEnvData(response);
      } catch (err) {
        console.error('Failed to fetch host env:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnv();
  }, [hostUid]);

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-[#1a1d27] overflow-hidden" open>
      <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer list-none hover:rose-100/50 dark:hover:rose-900/30 transition-colors bg-rose-50/50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-900/30 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-rose-500 dark:text-rose-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>System Information</span>
        {loading && (
          <svg className="animate-spin h-3 w-3 text-rose-500 ml-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </summary>
      <div className="w-full px-2 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
        {!envData && !loading ? (
          <p className="text-slate-400 italic">No information available</p>
        ) : (
          <ul className="list-disc list-inside ml-2 space-y-1 marker:text-slate-400 dark:marker:text-slate-500">
            <li>Host: <span className="text-slate-900 dark:text-slate-100 font-bold">{currentHost ? `${currentHost.address}:${currentHost.port}` : 'unknown'}</span></li>
            <li>User: <span className="text-slate-900 dark:text-slate-100 font-bold">{currentHost ? currentHost.id : 'unknown'}</span></li>
            {envData && (
              <>
                <li>OS Info: <span className="text-slate-900 dark:text-slate-100 font-bold">{envData.osinfo || 'N/A'}</span></li>
                <li>CUBRID Version: <span className="text-slate-900 dark:text-slate-100 font-bold">{envData.CUBRIDVER || 'N/A'}</span></li>
                <li>Broker Version: <span className="text-slate-900 dark:text-slate-100 font-bold">{envData.BROKERVER || 'N/A'}</span></li>
                <li>CUBRID Path: <span className="text-slate-900 dark:text-slate-100 font-bold">{envData.CUBRID || 'N/A'}</span></li>
                <li>Databases Path: <span className="text-slate-900 dark:text-slate-100 font-bold">{envData.CUBRID_DATABASES || 'N/A'}</span></li>
              </>
            )}
          </ul>
        )}
      </div>
    </details>
  );
}
