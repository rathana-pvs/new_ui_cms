import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBrokerList } from '../../broker/brokerSlice';

export default function Brokers({ hostUid }) {
  const dispatch = useDispatch();
  const { brokers, loading } = useSelector((state) => state.broker);

  useEffect(() => {
    if (hostUid) {
      dispatch(fetchBrokerList(hostUid));
    }
  }, [hostUid, dispatch]);

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm bg-white dark:bg-[#1a1d27] overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors bg-emerald-50/50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-emerald-500 dark:text-emerald-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Brokers</span>
        {loading && (
          <svg className="animate-spin h-3 w-3 text-emerald-500 ml-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-transparent border-b border-slate-100 dark:border-slate-800/50">
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">NAME</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">STATUS</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">PID</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">PORT</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">AS</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">JQ</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">REQ</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">TPS</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">QPS</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">LONG-T</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">LONG-Q</th>
              <th className="px-4 py-3 font-medium uppercase text-[11px] tracking-wider">ERR-Q</th>
            </tr>
          </thead>
          <tbody>
            {brokers.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-8 text-center text-slate-400 italic">
                  {loading ? 'Loading broker data...' : 'No brokers found'}
                </td>
              </tr>
            ) : (
              brokers.map((row) => (
                <tr key={row.key} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-medium">{row.name}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30">
                    <div className="flex items-center gap-2">
                      {row.state === 'ON' ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      ) : (
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                      <span>{row.state}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.pid}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.port}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.as}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.jq}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.req}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.tps}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.qps}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.long_tran_time || row.long_tran || '0'}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.long_query_time || row.long_query || '0'}</td>
                  <td className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.error_query || '0'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
