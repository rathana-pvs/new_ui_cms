import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteHostModal, deleteHost } from '../hostSlice';

export default function DeleteHostModal() {
  const dispatch = useDispatch();
  const { isDeleteHostModalOpen, hostToDeleteUid, hostToDeleteAlias, hosts, loading, error: apiError } = useSelector((state) => state.host);

  // Find the host details based on the selected hostToDeleteUid
  const hostToDelete = hosts.find((h) => h.uid === hostToDeleteUid);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-sm rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/80 dark:bg-[#1e2230]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Deleting Host...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-[13px] font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-[18px]">delete_forever</span>
            Delete Host
          </h3>
          <button 
            disabled={loading}
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 space-y-3 bg-white dark:bg-[#1e2230]">
          {apiError && (
            <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-lg font-normal">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {apiError}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[12px] font-normal text-slate-600 dark:text-slate-400">
              Are you sure you want to delete the host <span className="text-slate-900 dark:text-white">{hostToDeleteAlias || hostToDeleteUid}</span>?
            </p>
            <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 leading-relaxed italic">
              This action cannot be undone and will permanently remove the host configuration.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-6 py-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-normal"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="px-6 py-1.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs rounded shadow transition-all flex items-center justify-center gap-2 min-w-[100px] font-normal disabled:opacity-50"
            onClick={handleDelete}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-sm">delete</span>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
