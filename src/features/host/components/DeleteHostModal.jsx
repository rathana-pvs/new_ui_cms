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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all z-10">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
              <svg className="animate-spin h-8 w-8 text-accent-red" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Deleting Host...</span>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-red">delete_forever</span>
            Delete Host
          </h3>
          <button 
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-50"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
          {apiError && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-xl">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {apiError}
            </div>
          )}

          <p>Are you sure you want to delete the host <strong>{hostToDeleteAlias || hostToDeleteUid}</strong>?</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">This action cannot be undone and will permanently remove the host configuration.</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-accent-red text-white hover:bg-accent-red/90 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-50"
            onClick={handleDelete}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
