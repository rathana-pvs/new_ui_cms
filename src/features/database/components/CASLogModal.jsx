import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { brokerApi } from '../../broker/brokerApi';
import LogViewer from '../../broker/components/LogViewer';

export default function CASLogModal({ isOpen, onClose, hostUid, brokerName, casId, type = 'sql' }) {
  const [logPath, setLogPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && hostUid && brokerName && casId) {
      fetchLogPath();
    }
  }, [isOpen, hostUid, brokerName, casId, type]);

  const fetchLogPath = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await brokerApi.getBrokerLogs(hostUid, brokerName);
      const logs = response.logfileinfo?.[0]?.logfile || [];
      
      // Look for the specific CAS log file
      // SQL log: {brokerName}_{casId}.sql.log
      // Error log: {brokerName}_{casId}.err
      const suffix = type === 'sql' ? `_${casId}.sql.log` : `_${casId}.err`;
      const found = logs.find(log => log.path.endsWith(suffix));
      
      if (found) {
        setLogPath(found.path);
      } else {
        setError(`Could not find ${type === 'sql' ? 'SQL' : 'Slow Query'} log for CAS ID ${casId}`);
      }
    } catch (err) {
      setError('Failed to fetch broker log list');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-bk-side w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'sql' ? 'bg-sky-500/10 text-sky-500' : 'bg-rose-500/10 text-rose-500'}`}>
              <span className="material-symbols-outlined text-[24px]">
                {type === 'sql' ? 'terminal' : 'timer_off'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                {type === 'sql' ? 'CAS SQL Log' : 'CAS Slow Query Log'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Broker: <span className="text-bk-yellow">{brokerName}</span> • CAS ID: <span className="text-bk-yellow">{casId}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-rose-500 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-bk-main">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 border-4 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Locating log file...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <span className="material-symbols-outlined text-rose-500 text-5xl mb-4 opacity-50">warning</span>
              <h4 className="text-slate-800 dark:text-slate-200 font-bold mb-2">Log File Not Accessible</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {error}. Please ensure the broker is running and logging is enabled.
              </p>
              <button 
                onClick={fetchLogPath}
                className="mt-6 px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-bk-yellow hover:text-black rounded text-[11px] font-bold transition-all transition-colors"
              >
                Retry
              </button>
            </div>
          ) : logPath ? (
            <LogViewer hostUid={hostUid} path={logPath} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
