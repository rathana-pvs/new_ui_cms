import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBrokerList } from '../../broker/brokerSlice';

export default function Brokers({ hostUid }) {
  const dispatch = useDispatch();
  const { brokers, loading } = useSelector((state) => state.broker);
  const { authorizedHosts } = useSelector((state) => state.host);

  useEffect(() => {
    if (hostUid && authorizedHosts.includes(hostUid)) {
      dispatch(fetchBrokerList(hostUid));
    }
  }, [hostUid, authorizedHosts, dispatch]);

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span className="material-symbols-outlined text-[16px] text-slate-400">hub</span>
        <span>Brokers</span>
        {loading && (
          <svg className="animate-spin h-3 w-3 text-bk-yellow ml-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Name</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Status</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">PID</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Port</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">AS</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">JQ</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">REQ</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">TPS</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">QPS</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Long-T</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Long-Q</th>
              <th className="px-4 py-3 font-medium text-[10px] tracking-wide">Err-Q</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {brokers.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-8 text-center text-slate-400 italic">
                  {loading ? 'Loading broker data...' : 'No brokers found'}
                </td>
              </tr>
            ) : (
              brokers.map((row) => (
                <tr key={row.key} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-sans font-medium">{row.name}</td>
                  <td className="px-4 py-3">
                    {row.state === 'ON' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        On
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                        Off
                      </span>
                    )}


                  </td>
                  <td className="px-4 py-3">{row.pid}</td>
                  <td className="px-4 py-3">{row.port}</td>
                  <td className="px-4 py-3">{row.as}</td>
                  <td className="px-4 py-3">{row.jq}</td>
                  <td className="px-4 py-3">{row.req}</td>
                  <td className="px-4 py-3">{row.tps}</td>
                  <td className="px-4 py-3">{row.qps}</td>
                  <td className="px-4 py-3">{row.long_tran_time || row.long_tran || '0'}</td>
                  <td className="px-4 py-3">{row.long_query_time || row.long_query || '0'}</td>
                  <td className="px-4 py-3">{row.error_query || '0'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </details>

  );
}
