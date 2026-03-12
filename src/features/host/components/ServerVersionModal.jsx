import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeServerVersionModal } from '../hostSlice';
import { hostApi } from '../hostApi';
import LoadingOverlay from '../../../components/common/LoadingOverlay';

export default function ServerVersionModal() {
  const dispatch = useDispatch();
  const { isServerVersionModalOpen, serverVersionHostUid, hosts } = useSelector((state) => state.host);
  const [envData, setEnvData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isServerVersionModalOpen && serverVersionHostUid) {
      setLoading(true);
      hostApi.getHostEnv(serverVersionHostUid)
        .then(res => {
          setEnvData(res);
        })
        .catch(err => {
          console.error("Failed to fetch server version:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isServerVersionModalOpen, serverVersionHostUid]);

  if (!isServerVersionModalOpen) return null;

  const currentHost = hosts.find(h => h.uid === serverVersionHostUid);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[420px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        <LoadingOverlay isVisible={loading} title="Fetching env..." />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">info</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Server Version</h3>
              <p className="text-[9px] text-slate-400 font-medium mt-1">Host: {currentHost?.alias || currentHost?.id}</p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeServerVersionModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 p-2 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm flex items-center justify-center">
             <img src="/cubrid-logo.png" alt="CUBRID logo" className="w-full h-auto object-contain" />
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-bk-yellow uppercase tracking-widest">Cubrid Version</span>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-200 leading-relaxed max-w-[320px] mx-auto">
                {envData?.CUBRIDVER || 'Loading...'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 border-t border-slate-50 dark:border-white/5 pt-4">
              <div className="flex justify-between items-center py-1">
                <span className="text-[11px] font-medium text-slate-400">OS Platform</span>
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200">{envData?.osinfo || '-'}</span>
              </div>
               <div className="flex justify-between items-center py-1">
                <span className="text-[11px] font-medium text-slate-400">Broker Version</span>
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200">{envData?.BROKERVER || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[11px] font-medium text-slate-400">Install Path</span>
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200 truncate ml-4 max-w-[200px]" title={envData?.CUBRID}>{envData?.CUBRID || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[11px] font-medium text-slate-400">Databases Path</span>
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-200 truncate ml-4 max-w-[200px]" title={envData?.CUBRID_DATABASES}>{envData?.CUBRID_DATABASES || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center min-w-[100px]"
            onClick={() => dispatch(closeServerVersionModal())}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
