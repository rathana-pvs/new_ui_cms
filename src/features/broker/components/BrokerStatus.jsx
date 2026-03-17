import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDetailedBrokerStatus } from '../brokerSlice';

export default function BrokerStatus({ hostUid, brokerName }) {
  const dispatch = useDispatch();
  const { detailedStatus } = useSelector((state) => state.broker);
  const status = detailedStatus[brokerName] || { data: {}, loading: false, error: null };

  useEffect(() => {
    if (hostUid && brokerName) {
      dispatch(fetchDetailedBrokerStatus({ hostUid, brokerName }));
      
      // Auto refresh every 5 seconds (matching d-cms logic)
      const interval = setInterval(() => {
        dispatch(fetchDetailedBrokerStatus({ hostUid, brokerName }));
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [hostUid, brokerName, dispatch]);

  if (status.loading && !status.data?.asinfo) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-bk-main">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-bk-yellow" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-slate-500 text-sm">Loading broker status...</span>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-bk-main">
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-6 text-center max-w-lg mx-auto dark:bg-rose-900/10 dark:border-rose-500/20">
          <span className="material-symbols-outlined text-rose-500 text-4xl mb-4">error</span>
          <h3 className="text-rose-700 dark:text-rose-400 font-medium mb-2">Failed to Load Status</h3>
          <p className="text-rose-600/70 dark:text-rose-400/60 text-sm">{status.error}</p>
        </div>
      </div>
    );
  }

  const asInfo = status.data?.asinfo || [];
  const jobInfo = status.data?.jobinfo || [];
  const basicInfo = status.data?.binfo?.[0] || {}; // Basic Broker Info (PID, Port etc)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-bk-side/50">
        <span className="font-medium text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-1.5 font-sans">
          <span className="material-symbols-outlined text-[14px]">hub</span>
          Broker Status - {brokerName}
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bk-yellow opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-bk-yellow"></span>
            </span>
            Auto-refreshing (5s)
          </div>
          <button 
            onClick={() => dispatch(fetchDetailedBrokerStatus({ hostUid, brokerName }))}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400"
          >
            <span className={`material-symbols-outlined text-[14px] ${status.loading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col p-4 space-y-6">
        
        {/* Basic Info Table - Matching d-cms BrokerStatusBasicColumn */}
        <section className="bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-bk-yellow text-lg">info</span>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Basic Information</h3>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">PID</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Port</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Job Queue</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Auto Add AS</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">SQL Log Mode</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Long Trans Time</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Long Query Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                <tr className="dark:text-slate-300">
                  <td className="px-4 py-3 font-medium text-emerald-500">{basicInfo.pid || '-'}</td>
                  <td className="px-4 py-3">{basicInfo.port || '-'}</td>
                  <td className="px-4 py-3">{basicInfo.job_queue || '0'}</td>
                  <td className="px-4 py-3">{basicInfo.auto_add_as || 'OFF'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${basicInfo.sql_log_mode === 'ON' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                      {basicInfo.sql_log_mode || 'OFF'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{basicInfo.long_transaction_time || '0'}s</td>
                  <td className="px-4 py-3">{basicInfo.long_query_time || '0'}s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Apply Server Table - Matching d-cms BrokerStatusAsColumn */}
        <section className="bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-bk-yellow text-lg">dns</span>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Application Servers (AS)</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full">
              {asInfo.length} Running
            </span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ID</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">PID</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">QPS</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">TPS</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Port</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Size</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">DB</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Last Access</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                {asInfo.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-slate-400 italic font-sans text-xs">
                      No application servers currently active.
                    </td>
                  </tr>
                ) : (
                  asInfo.map((as) => (
                    <tr key={as.as_id} className="dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-bold text-bk-yellow">{as.as_id}</td>
                      <td className="px-4 py-3">{as.as_pid}</td>
                      <td className="px-4 py-3">{as.as_num_query}</td>
                      <td className="px-4 py-3">{as.as_num_tran}</td>
                      <td className="px-4 py-3">{as.as_port}</td>
                      <td className="px-4 py-3">{(parseInt(as.as_psize) / 1024).toFixed(1)}KB</td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${as.as_status === 'IDLE' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'}`}>
                          {as.as_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-bk-yellow/80">{as.as_dbname}</td>
                      <td className="px-4 py-3 text-[10px] text-slate-500">{as.as_last_access_time}</td>
                      <td className="px-4 py-3 text-slate-400">{as.as_client_ip || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Job Queue Table - Matching d-cms BrokerStatusJqColumn */}
        <section className="bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-bk-yellow text-lg">queue</span>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Job Queue</h3>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Job ID</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Priority</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">IP Address</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Elapsed Time</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Request</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                {jobInfo.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic font-sans text-xs">
                      Job queue is empty.
                    </td>
                  </tr>
                ) : (
                  jobInfo.map((job, idx) => (
                    <tr key={idx} className="dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">{job.job_id}</td>
                      <td className="px-4 py-3">{job.job_priority}</td>
                      <td className="px-4 py-3 font-medium text-bk-yellow/80">{job.job_ip}</td>
                      <td className="px-4 py-3 text-rose-500">{job.job_time}s</td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{job.job_request}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
