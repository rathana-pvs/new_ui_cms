import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteHostModal, deleteHost } from '../hostSlice';

export default function DeleteHostModal() {
  const dispatch = useDispatch();
  const { isDeleteHostModalOpen, hostToDeleteUid, hostToDeleteAlias, hosts, loading, error: apiError } = useSelector((state) => state.host);

  if (!isDeleteHostModalOpen) return null;

  const handleDelete = async () => {
    if (hostToDeleteUid) {
      dispatch(deleteHost(hostToDeleteUid));
    }
  };

  const handleClose = () => {
    dispatch(closeDeleteHostModal());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[400px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/60"></div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/60 dark:bg-bk-side/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">Deleting host...</span>
            </div>
          </div>
        )}

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <span className="material-symbols-outlined text-rose-500 text-xl">delete_forever</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Delete host connection</h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={handleClose}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded">
              <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
              <p className="text-[11px] text-rose-500 font-medium tracking-tight">{apiError}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Warning</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[13px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                Are you sure you want to permanently delete the connection for <span className="text-rose-500 font-medium">{hostToDeleteAlias || hostToDeleteUid}</span>?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                This action is irreversible. All saved credentials and configuration for this host will be removed from your local manager.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={handleClose}
          >
            Discard
          </button>
          <button 
            disabled={loading}
            className="px-6 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-[11px] font-medium tracking-wide rounded border border-rose-500/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
            onClick={handleDelete}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
