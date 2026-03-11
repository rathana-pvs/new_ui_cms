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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e2230] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white dark:bg-[#1e2230]/80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-sm animate-spin"></div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans tracking-wide">Deleting Host...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Delete Host
          </h3>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-[13.5px] text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1e2230]">
          {apiError && (
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span className="font-medium">{apiError}</span>
            </div>
          )}

          <div className="space-y-4">
            <p className="leading-relaxed">
              Are you sure you want to delete the host <strong className="text-blue-600 dark:text-blue-400">{hostToDeleteAlias || hostToDeleteUid}</strong>?
            </p>
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-lg">
              <p className="text-rose-600/80 dark:text-rose-400/80 text-[12px] font-medium leading-relaxed">
                This action cannot be undone and will permanently remove the host configuration.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 font-sans bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
          <button 
            disabled={loading}
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold disabled:opacity-50"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="h-[34px] px-6 bg-rose-600 hover:bg-rose-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={handleDelete}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-sm animate-spin"></div>
            ) : (
              'Delete Host'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
