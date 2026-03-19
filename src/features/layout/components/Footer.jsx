import { useSelector } from 'react-redux';

export default function Footer() {
  const { selectedHostUid, hosts, authorizedHosts, hostEnvs } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === selectedHostUid);
  const isConnected = selectedHostUid && authorizedHosts.includes(selectedHostUid);
  const version = hostEnvs[selectedHostUid]?.CUBRIDVER || '11.2.0.4501';

  return (
    <footer className="bg-white dark:bg-bk-main border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-sans">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2">
          {selectedHostUid ? (
            <>
              <span className={`size-2 rounded-full shadow-sm ${isConnected ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-300'}`}></span>
              <span className="dark:text-slate-300 font-medium">
                Connected to {currentHost?.address || 'unknown'}:{currentHost?.port || '1523'}
              </span>
            </>
          ) : (
            <span className="dark:text-slate-400">No host selected</span>
          )}
        </span>
        {selectedHostUid && (
          <span className="dark:text-slate-500">Version {version}</span>
        )}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">text_snippet</span>
          <span className="dark:text-slate-400">UTF-8</span>
        </div>
        <span className={`font-medium tracking-wide text-[11px] ${selectedHostUid ? 'text-bk-yellow' : 'text-slate-400'}`}>
          {selectedHostUid ? 'Ready' : 'Disconnected'}
        </span>
      </div>
    </footer>
  );
}
