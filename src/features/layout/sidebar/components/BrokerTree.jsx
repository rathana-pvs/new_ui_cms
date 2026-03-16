import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBroker, setSelectedBrokerSubItem, fetchBrokerLogs } from '../../../broker/brokerSlice';
import { openTab } from '../../layoutSlice';

export default function BrokerTree({ hostUid, onContextMenu }) {
  const dispatch = useDispatch();
  const { brokers, loading, logsByBroker, selectedBroker, selectedBrokerSubItem, logsLoading } = useSelector((state) => state.broker);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (brokers.length === 0) {
    return <div className="px-3 py-2 text-xs text-slate-400">No brokers found</div>;
  }

  return (
    <div className="space-y-1">
      {brokers.map((broker) => {
        const isOn = broker.state === 'ON';
        const isBrokerSelected = selectedBroker === broker.name;
        const brokerLogs = (logsByBroker[broker.name] || []).filter(log => log.path.toLowerCase().endsWith('.log'));
        
        return (
          <details 
            key={broker.name} 
            className="group/broker"
            onToggle={(e) => {
              if (e.target.open && !logsByBroker[broker.name]) {
                dispatch(fetchBrokerLogs({ hostUid: hostUid, brokerName: broker.name }));
              }
            }}
          >
            <summary
              className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer list-none rounded-lg transition-all duration-200 select-none mb-1.5 group/sum border relative
                ${isBrokerSelected && !selectedBrokerSubItem ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/5 dark:bg-bk-yellow/5 font-medium border-bk-yellow/40 dark:border-bk-yellow/20' : 'bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-bk-yellow/30 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
              onClick={() => {
                dispatch(setSelectedBroker(broker.name));
                dispatch(setSelectedBrokerSubItem(null));
              }}
              onContextMenu={(e) => onContextMenu(e, broker.name, broker.state)}
            >
              <span className={`material-symbols-outlined text-[16px] group-open/broker:rotate-90 transition-transform ${isBrokerSelected && !selectedBrokerSubItem ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`} style={{ fontVariationSettings: "'wght' 300" }}>chevron_right</span>
              <span className={`material-symbols-outlined transition-colors text-[16px] ${isBrokerSelected && !selectedBrokerSubItem ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-bk-yellow'}`} style={{ fontVariationSettings: "'wght' 300" }}>hub</span>
              <div className="flex-1 min-w-0">
                <span className={`text-[11.5px] font-medium transition-colors truncate block ${isBrokerSelected && !selectedBrokerSubItem ? 'text-amber-600 dark:text-bk-yellow' : 'group-hover/sum:text-amber-600 dark:group-hover/sum:text-bk-yellow'}`}>
                  {broker.name} <span className="opacity-50 font-normal ml-1">({broker.port})</span>
                </span>
              </div>
              {isBrokerSelected && !selectedBrokerSubItem && (
                <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full shadow-[0_0_8px_rgba(217,119,6,0.4)]"></div>
              )}

              {isOn ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 rounded-full tracking-tighter">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  On
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20 rounded-full tracking-tighter">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Off
                </span>
              )}
            </summary>

            <div className="ml-[22px] border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
              <details className="group/nested">
                <summary 
                  className={`flex items-center gap-2 px-3.5 py-1.5 w-full text-left transition-all group/item cursor-pointer list-none rounded-r-md relative select-none border border-transparent
                    ${(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') ? 'text-amber-600 dark:text-bk-yellow font-medium' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                  onClick={() => {
                    dispatch(setSelectedBroker(broker.name));
                    dispatch(setSelectedBrokerSubItem('SQL Log'));
                  }}
                >
                  <span className={`material-symbols-outlined text-[14px] group-open/nested:rotate-90 transition-transform ${(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`}>chevron_right</span>
                  <span className={`material-symbols-outlined text-[16px] transition-colors
                    ${(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow'}`} 
                    style={{ fontVariationSettings: "'wght' 300" }}>
                    history_edu
                  </span>
                  <span className="text-[11px] tracking-wide whitespace-nowrap">SQL Log</span>
                  {(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') && (
                    <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                  )}
                </summary>
                
                <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5">
                  {logsLoading && <div className="px-4 py-1 text-[10px] text-slate-400 animate-pulse">Loading logs...</div>}
                  {brokerLogs.map((log, idx) => {
                    const fileName = log.path.split('/').pop();
                    const isLogSelected = isBrokerSelected && selectedBrokerSubItem === log.path;
                    return (
                      <button
                        key={idx}
                        className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border
                          ${isLogSelected ? 'text-amber-600 dark:text-bk-yellow font-medium border-transparent' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow border-transparent'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(setSelectedBroker(broker.name));
                          dispatch(setSelectedBrokerSubItem(log.path));
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          dispatch(openTab(`log:${hostUid}:${log.path}`));
                        }}
                      >
                        <span className={`material-symbols-outlined text-[15px]
                          ${isLogSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/child:text-amber-600 dark:group-hover/child:text-bk-yellow'}`}>
                          description
                        </span>
                        <span className="text-[10.5px] tracking-wide truncate" title={fileName}>{fileName}</span>
                        {isLogSelected && (
                          <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                  {!logsLoading && brokerLogs.length === 0 && (
                    <div className="px-4 py-1 text-[10px] text-slate-400 italic">No logs found</div>
                  )}
                </div>
              </details>
            </div>
          </details>
        );
      })}
    </div>
  );
}
