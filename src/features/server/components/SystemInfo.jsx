import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../host/hostApi';

export default function SystemInfo({ hostUid }) {
  const { hosts, authorizedHosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  
  const [envData, setEnvData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEnv() {
      if (!hostUid || !authorizedHosts.includes(hostUid)) return;
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

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-500 font-medium text-[10px] tracking-wide font-sans">{label}</span>
      <span className="text-slate-900 dark:text-slate-200 truncate max-w-md font-mono text-[12px]">{value || 'N/A'}</span>
    </div>
  );

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span className="material-symbols-outlined text-[16px] text-slate-400">info</span>
        <div className="flex-1 flex items-center justify-between mr-2">
          <span>Environment details</span>
          {loading && (
            <svg className="animate-spin h-3.5 w-3.5 text-bk-yellow" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      </summary>
      
      <div className="p-4 space-y-0.5">
        {!envData && !loading ? (
          <p className="text-slate-400 italic py-4 text-center text-xs">Environment information unavailable</p>
        ) : (
          <>
            <InfoRow label="Access Point" value={currentHost ? `${currentHost.address}:${currentHost.port}` : 'unknown'} />
            <InfoRow label="Auth User" value={currentHost ? currentHost.id : 'unknown'} />
            {envData && (
              <>
                <InfoRow label="Operating System" value={envData.osinfo} />
                <InfoRow label="CUBRID Engine" value={envData.CUBRIDVER} />
                <InfoRow label="CAS Version" value={envData.BROKERVER} />
                <InfoRow label="Home Directory" value={envData.CUBRID} />
                <InfoRow label="Databases Root" value={envData.CUBRID_DATABASES} />
              </>
            )}
          </>
        )}
      </div>
    </details>
  );
}

