import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeBackupDatabaseModal } from '../databaseSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function BackupDatabaseModal() {
  const dispatch = useDispatch();
  const { isBackupDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  
  const [formData, setFormData] = useState({
    volPath: 'db1_backup_lv0',
    backupId: '0',
    backupLevel: 'level 0',
    backupDir: '/var/lib/cubrid/db1/backup',
    parallelBackup: '0',
    checkConsistency: true,
    deleteUnnecessary: false,
    compress: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isBackupDatabaseModalOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackup = () => {
    if (!formData.volPath || !formData.backupDir) {
      setError("Mandatory fields 'Volume path' and 'Backup directory' are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (formData.backupDir.includes('/error')) {
        setLoading(false);
        setError("Insufficient disk space in the specified backup directory.");
      } else {
        setLoading(false);
        dispatch(closeBackupDatabaseModal());
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[500px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={loading} 
            title="Processing backup" 
            subtitle="Creating database volume snapshots..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleBackup}
          onClose={() => setError(null)}
        />
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">backup</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white leading-none">Backup database</h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Section: Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Archive configuration</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Target database</label>
                <input 
                  type="text" 
                  value={selectedDatabase || 'db1'} 
                  readOnly
                  className="w-full h-9 px-3 bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] text-slate-400 font-medium outline-none cursor-default"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Volume path</label>
                <input 
                  type="text" 
                  value={formData.volPath}
                  onChange={(e) => handleInputChange('volPath', e.target.value)}
                  placeholder="db_backup_path"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Backup ID</label>
                <input 
                  type="text" 
                  value={formData.backupId}
                  onChange={(e) => handleInputChange('backupId', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Backup level</label>
                <div className="relative">
                  <select
                    value={formData.backupLevel}
                    onChange={(e) => handleInputChange('backupLevel', e.target.value)}
                    className="w-full h-9 px-3 pr-8 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium appearance-none transition-all"
                  >
                    <option value="level 0">Level 0 (Full)</option>
                    <option value="level 1">Level 1 (Incremental)</option>
                    <option value="level 2">Level 2 (Differential)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Backup directory</label>
                <input 
                  type="text" 
                  value={formData.backupDir}
                  onChange={(e) => handleInputChange('backupDir', e.target.value)}
                  placeholder="/var/lib/backup"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Parallel threads</label>
                <input 
                  type="number" 
                  value={formData.parallelBackup}
                  onChange={(e) => handleInputChange('parallelBackup', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Advanced Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Process flags</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-2 px-1">
              {[
                { label: 'Check database consistency', field: 'checkConsistency' },
                { label: 'Delete unnecessary log archives', field: 'deleteUnnecessary' },
                { label: 'Compress backup volumes', field: 'compress' },
              ].map(opt => (
                <label key={opt.field} className="flex items-center gap-3 p-2.5 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
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
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeBackupDatabaseModal())}
          >
            Discard
          </button>
          <button 
            disabled={loading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
            onClick={handleBackup}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Run backup</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
