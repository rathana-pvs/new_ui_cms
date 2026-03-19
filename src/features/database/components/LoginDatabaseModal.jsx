import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginDatabase, registerDatabase, closeLoginDatabaseModal, fetchBackupSchedule, fetchQueryPlan } from '../databaseSlice';
import { fetchDatabaseUsers } from '../../user/userSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';

export default function LoginDatabaseModal() {
  const dispatch = useDispatch();
  const { isLoginDatabaseModalOpen, selectedDatabase, actionLoading, error: sliceError } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [formData, setFormData] = useState({
    dbuser: 'dba',
    dbpasswd: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoginDatabaseModalOpen) {
      setFormData({
        dbuser: 'dba',
        dbpasswd: ''
      });
      setRememberMe(true);
      setError(null);
    }
  }, [isLoginDatabaseModalOpen]);

  useEffect(() => {
    if (sliceError) {
      setError(sliceError);
    }
  }, [sliceError]);

  if (!isLoginDatabaseModalOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (!formData.dbuser) {
      setError("Database user is required.");
      return;
    }
    
    // If rememberMe is checked, call register first
    if (rememberMe) {
        dispatch(registerDatabase({ 
            hostUid: selectedHostUid, 
            dbname: selectedDatabase, 
            payload: { id: formData.dbuser, password: formData.dbpasswd } 
        }));
    }

    dispatch(loginDatabase({ 
      hostUid: selectedHostUid, 
      dbname: selectedDatabase, 
      payload: formData 
    })).unwrap()
      .then(() => {
        // Pre-fetch nested data to "warm up" the tree
        dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: selectedDatabase }));
      })
      .catch((err) => {
          setError(err || 'Failed to authenticate with database.');
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[400px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={actionLoading} 
            title="Authenticating" 
            subtitle={`Connecting to ${selectedDatabase}...`} 
        />
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">database_lock</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Database login</h3>
            </div>
          </div>
          <button 
            disabled={actionLoading}
            onClick={() => dispatch(closeLoginDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body & Footer */}
        <form onSubmit={handleLogin} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-5 overflow-y-auto">
             {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex gap-2.5 animate-in slide-in-from-top-1 duration-200">
                <span className="material-symbols-outlined text-rose-500 text-[16px]">error</span>
                <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 leading-relaxed flex-1">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Target database</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-bold text-bk-yellow">
                  {selectedDatabase}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Credentials</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">User name</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-[16px] group-focus-within:text-bk-yellow transition-colors">person</span>
                      <input 
                        type="text" 
                        autoFocus
                        value={formData.dbuser}
                        onChange={(e) => handleInputChange('dbuser', e.target.value)}
                        placeholder="dba"
                        className="w-full h-9 pl-9 pr-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded focus:outline-none focus:border-bk-yellow/50 focus:ring-1 focus:ring-bk-yellow/5 text-[12px] text-slate-900 dark:text-slate-100 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Database password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-[16px] group-focus-within:text-bk-yellow transition-colors">lock</span>
                      <input 
                        type="password" 
                        value={formData.dbpasswd}
                        onChange={(e) => handleInputChange('dbpasswd', e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 pl-9 pr-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded focus:outline-none focus:border-bk-yellow/50 focus:ring-1 focus:ring-bk-yellow/5 text-[12px] text-slate-900 dark:text-slate-100 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all group active:scale-[0.99] mt-2">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 cursor-pointer rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow transition-colors tracking-tight">Remember login info</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Enable auto-login for subsequent sessions</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <p className="p-3 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              <span className="font-bold text-bk-yellow uppercase tracking-tighter mr-1">Note:</span>
              Authenticated session is required to perform administrative operations and access schema details.
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
            <button 
              type="button"
              disabled={actionLoading}
              className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              onClick={() => dispatch(closeLoginDatabaseModal())}
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={actionLoading}
              className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Sign in</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
