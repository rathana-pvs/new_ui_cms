import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeRenameDatabaseModal, renameDatabase, fetchDatabaseStartInfo } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function RenameDatabaseModal() {
  const dispatch = useDispatch();
  const { isRenameDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [newDbName, setNewDbName] = useState('');
  const [forcedel, setForcedel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isRenameDatabaseModalOpen) {
      setNewDbName('');
      setForcedel(false);
      setError(null);
    }
  }, [isRenameDatabaseModalOpen]);

  if (!isRenameDatabaseModalOpen) return null;

  const handleRename = async () => {
    if (!selectedHostUid || !selectedDatabase || !newDbName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        rename: newDbName.trim(),
        exvolpath: 'none',
        advanced: 'off',
        forcedel: forcedel ? 'y' : 'n'
      };
      
      await dispatch(renameDatabase({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        payload 
      })).unwrap();
      
      // Refresh the database list to show the new name in the tree
      dispatch(fetchDatabaseStartInfo(selectedHostUid));
      
      dispatch(showStatusModal({
        type: 'success',
        title: 'Rename successful',
        message: `Database "${selectedDatabase}" has been renamed to "${newDbName.trim()}".`
      }));
    } catch (err) {
      setError(err || 'Failed to rename database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[440px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={loading} 
            title="Renaming database" 
            subtitle="Migrating files and updating configuration..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleRename}
          onClose={() => setError(null)}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">drive_file_rename_outline</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Rename database</h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeRenameDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Section: current Name */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Source identity</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Current database name</label>
              <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-500 dark:text-slate-400">
                {selectedDatabase}
              </div>
            </div>
          </div>

          {/* Section: New Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Destination identity</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">New database name</label>
              <input 
                type="text"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="Enter unique identifier..."
                className="w-full h-9 px-3 bg-white dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800/50 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-colors"
                autoFocus
              />
            </div>

            <div className="p-3 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg">
              <div className="flex gap-2.5 items-start">
                <span className="material-symbols-outlined text-bk-yellow text-sm mt-0.5">warning</span>
                <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  Renaming moves log files, volumes, and configuration. Ensure the database is stopped before proceeding.
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all group active:scale-[0.99]">
              <input 
                type="checkbox" 
                checked={forcedel}
                onChange={(e) => setForcedel(e.target.checked)}
                className="w-4 h-4 cursor-pointer rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow transition-colors tracking-tight">Overwrite if exists</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Force deletion of destination files if they already exist</span>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeRenameDatabaseModal())}
          >
            Discard
          </button>
          <button 
            disabled={loading || !newDbName.trim()}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
            onClick={handleRename}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">drive_file_rename_outline</span>
                <span>Confirm rename</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
