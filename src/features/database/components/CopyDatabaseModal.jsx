import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCopyDatabaseModal, copyDatabase } from '../databaseSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function CopyDatabaseModal() {
  const dispatch = useDispatch();
  const { isCopyDatabaseModalOpen, selectedDatabase, actionLoading, error: sliceError } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [formData, setFormData] = useState({
    destName: '',
    destPath: '/home/cubrid/CUBRID/databases/',
    extPath: '/home/cubrid/CUBRID/databases/',
    logPath: '/home/cubrid/CUBRID/databases/',
    replaceExisting: false,
    deleteSource: false
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sliceError) {
      setError(sliceError);
    }
  }, [sliceError]);

  if (!isCopyDatabaseModalOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopy = () => {
    if (!formData.destName) {
      setError("Please provide a destination database name.");
      return;
    }
    
    setError(null);
    
    const payload = {
      srcdbname: selectedDatabase,
      destname: formData.destName,
      destpath: formData.destPath,
      expath: formData.extPath,
      logpath: formData.logPath,
      replace: formData.replaceExisting ? 'y' : 'n',
      unlink: formData.deleteSource ? 'y' : 'n'
    };

    dispatch(copyDatabase({ 
      hostUid: selectedHostUid, 
      payload 
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[620px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={actionLoading} 
            title="Duplicating database" 
            subtitle="Cloning volumes and migrating metadata..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleCopy}
          onClose={() => setError(null)}
        />
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">content_copy</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white leading-none">Copy database</h3>
            </div>
          </div>
          <button 
            disabled={actionLoading}
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Section: Source Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Input mapping</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Source database</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default">
                  {selectedDatabase}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Source volume root</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default">
                  {`/home/cubrid/databases/${selectedDatabase}`}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Destination Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Destination profile</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 tracking-tighter">New database name</label>
                <input 
                  type="text" 
                  value={formData.destName}
                  onChange={(e) => handleInputChange('destName', e.target.value)}
                  placeholder="e.g. clone_db"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 tracking-tighter">New volume root</label>
                <input 
                  type="text" 
                  value={formData.destPath}
                  onChange={(e) => handleInputChange('destPath', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 tracking-tighter">Extent volume root</label>
                <input 
                  type="text" 
                  value={formData.extPath}
                  onChange={(e) => handleInputChange('extPath', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 tracking-tighter">New log root</label>
                <input 
                  type="text" 
                  value={formData.logPath}
                  onChange={(e) => handleInputChange('logPath', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Diagnostics & Migration Flags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Capacity & Flags</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="flex items-center justify-between p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Available capacity</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-mono font-medium text-slate-700 dark:text-slate-200 tracking-tighter">232,420</span>
                  <span className="text-[10px] font-medium text-slate-400">MB (Free)</span>
                </div>
              </div>
              <div className="w-[1px] h-10 bg-bk-yellow/20"></div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Database footprint</span>
                <div className="flex items-baseline gap-1.5 justify-end">
                  <span className="text-xl font-mono font-medium text-rose-500 tracking-tighter">128</span>
                  <span className="text-[10px] font-medium text-rose-500/60">MB (Required)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 px-1">
              {[
                { label: 'Replace existing database', field: 'replaceExisting' },
                { label: 'Unlink source database', field: 'deleteSource' },
              ].map(opt => (
                <label key={opt.field} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all group active:scale-[0.99]">
                  <input 
                    type="checkbox" 
                    checked={formData[opt.field]}
                    onChange={(e) => handleInputChange(opt.field, e.target.checked)}
                    className="w-4 h-4 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                  />
                  <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 group-hover:text-bk-yellow transition-colors tracking-tight">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={actionLoading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeCopyDatabaseModal())}
          >
            Discard
          </button>
          <button 
            disabled={actionLoading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
            onClick={handleCopy}
          >
            {actionLoading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Run clone</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
