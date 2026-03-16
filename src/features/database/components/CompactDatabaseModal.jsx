import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCompactDatabaseModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { showStatusModal } from '../../layout/layoutSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function CompactDatabaseModal() {
  const dispatch = useDispatch();
  const { isCompactDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  const [verbose, setVerbose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isCompactDatabaseModalOpen) return null;

  const handleCompact = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        verbose: verbose ? 'y' : 'n'
      };
      const response = await databaseApi.compactDatabase(selectedHostUid, selectedDatabase, payload);
      
      dispatch(closeCompactDatabaseModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Compaction success',
        message: response.note || 'Database compaction completed successfully.'
      }));
    } catch (err) {
      setError(err.response?.data?.note || err.response?.data?.message || 'Database compaction failed. Ensure no other maintenance tasks are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[440px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={loading} 
            title="Compacting database" 
            subtitle="Optimizing storage and reclaiming space..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleCompact}
          onClose={() => setError(null)}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">compress</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Compact database</h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeCompactDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Section: Target Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Maintenance target</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Database identifier</label>
              <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200">
                {selectedDatabase}
              </div>
            </div>
          </div>

          {/* Section: Optimization Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Parameters & Scope</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg">
                <div className="flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-bk-yellow text-sm mt-0.5">info</span>
                  <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    <p>Compaction utility reclaims storage space from:</p>
                    <ul className="list-disc pl-4 space-y-0.5 opacity-80">
                      <li>OIDs of deleted objects</li>
                      <li>Redundant table representations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all group active:scale-[0.99]">
                <input 
                  type="checkbox" 
                  checked={verbose}
                  onChange={(e) => setVerbose(e.target.checked)}
                  className="w-4 h-4 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow transition-colors tracking-tight">Verbose report</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Enable detailed status reporting during process</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeCompactDatabaseModal())}
          >
            Discard
          </button>
          <button 
            disabled={loading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
            onClick={handleCompact}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Run compact</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
