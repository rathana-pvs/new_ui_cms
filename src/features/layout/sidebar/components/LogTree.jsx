import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBroker, setSelectedBrokerSubItem, fetchBrokerLogs, fetchAdminLogs, fetchCMSLogs, fetchDatabaseLogs } from '../../../broker/brokerSlice';
import { openTab } from '../../layoutSlice';

export default function LogTree({ hostUid }) {
  const dispatch = useDispatch();
  const { databases } = useSelector((state) => state.database);
  const { brokers, logsByBroker, logsLoading, adminLogsByHost, adminLogsLoading, cmsLogsByHost, selectedBrokerSubItem, dbLogsByDbName, dbLogsLoading } = useSelector((state) => state.broker);

  return (
    <div className="space-y-1">
      <details className="group/log-broker" open>
        <summary className="flex items-center gap-1 px-3 py-1.5 cursor-pointer list-none rounded transition-all duration-200 select-none mb-0.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow border border-transparent">
          <span className="material-symbols-outlined text-[16px] group-open/log-broker:rotate-90 transition-transform text-slate-400 dark:text-slate-500" style={{ fontVariationSettings: "'wght' 300" }}>chevron_right</span>
          <span className="material-symbols-outlined transition-colors text-[16px] text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-bk-yellow" style={{ fontVariationSettings: "'wght' 300" }}>hub</span>
          <span className="text-[11.5px] font-medium tracking-tight">Broker</span>
        </summary>
        
        <div className="ml-[22px] border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
          <details className="group/log-access">
            <summary className="flex items-center gap-2 px-3.5 py-1.5 cursor-pointer list-none rounded-r-md transition-all select-none text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow group/item">
              <span className="material-symbols-outlined text-[14px] group-open/log-access:rotate-90 transition-transform text-slate-400 dark:text-slate-500">chevron_right</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow">login</span>
              <span className="text-[11px] tracking-wide">Access</span>
            </summary>
            <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5 whitespace-nowrap overflow-hidden">
              {/* Children here */}
            </div>
          </details>

          <details 
            className="group/log-error"
            onToggle={(e) => {
              if (e.target.open) {
                brokers.forEach(broker => {
                  if (!logsByBroker[broker.name]) {
                    dispatch(fetchBrokerLogs({ hostUid: hostUid, brokerName: broker.name }));
                  }
                });
              }
            }}
          >
            <summary className="flex items-center gap-2 px-3.5 py-1.5 cursor-pointer list-none rounded-r-md transition-all select-none text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow group/item">
              <span className="material-symbols-outlined text-[14px] group-open/log-error:rotate-90 transition-transform text-slate-400 dark:text-slate-500">chevron_right</span>
              <span className="material-symbols-outlined text-[16px] text-rose-400/80 dark:text-rose-500/80 group-hover/item:text-rose-500 dark:group-hover/item:text-rose-400">report</span>
              <span className="text-[11px] tracking-wide">Error</span>
            </summary>
            <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5 whitespace-nowrap overflow-hidden">
              {logsLoading && <div className="px-4 py-1.5 text-[10px] text-slate-400 animate-pulse">Loading error logs...</div>}
              {(() => {
                const errorLogs = Object.values(logsByBroker)
                  .flat()
                  .filter(log => log.path.toLowerCase().endsWith('.err'));

                if (!logsLoading && errorLogs.length === 0) {
                  return <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No error logs found</div>;
                }

                return errorLogs.map((log, idx) => {
                  const fileName = log.path.split('/').pop();
                  const isLogSelected = selectedBrokerSubItem === log.path;
                  return (
                    <button
                      key={idx}
                      className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border border-transparent
                        ${isLogSelected ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/10 dark:bg-bk-yellow/5 font-medium border-bk-yellow/20 dark:border-bk-yellow/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setSelectedBroker(null));
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
                });
              })()}
            </div>
          </details>

          <details 
            className="group/log-admin"
            onToggle={(e) => {
              if (e.target.open && !adminLogsByHost[hostUid]) {
                dispatch(fetchAdminLogs(hostUid));
              }
            }}
          >
            <summary className="flex items-center gap-2 px-3.5 py-1.5 cursor-pointer list-none rounded-r-md transition-all select-none text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow group/item">
              <span className="material-symbols-outlined text-[14px] group-open/log-admin:rotate-90 transition-transform text-slate-400 dark:text-slate-500">chevron_right</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow">admin_panel_settings</span>
              <span className="text-[11px] tracking-wide">Admin Log</span>
            </summary>
            <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5 whitespace-nowrap overflow-hidden">
              {adminLogsLoading && <div className="px-4 py-1.5 text-[10px] text-slate-400 animate-pulse">Loading logs...</div>}
              {(adminLogsByHost[hostUid] || []).map((log, idx) => {
                const fileName = log.path.split('/').pop();
                const isLogSelected = selectedBrokerSubItem === log.path;
                return (
                  <button
                    key={idx}
                    className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border border-transparent
                      ${isLogSelected ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/10 dark:bg-bk-yellow/5 font-medium border-bk-yellow/20 dark:border-bk-yellow/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedBroker(null));
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
              {!adminLogsLoading && (adminLogsByHost[hostUid] || []).length === 0 && (
                <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No admin logs found</div>
              )}
            </div>
          </details>
        </div>
      </details>

      <details 
        className="group/log-manager"
        onToggle={(e) => {
          if (e.target.open && !cmsLogsByHost[hostUid]) {
            dispatch(fetchCMSLogs(hostUid));
          }
        }}
      >
        <summary className="flex items-center gap-1 px-3 py-1.5 cursor-pointer list-none rounded transition-all duration-200 select-none mb-0.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow border border-transparent">
          <span className="material-symbols-outlined text-[16px] group-open/log-manager:rotate-90 transition-transform text-slate-400 dark:text-slate-500" style={{ fontVariationSettings: "'wght' 300" }}>chevron_right</span>
          <span className="material-symbols-outlined transition-colors text-[16px] text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-bk-yellow" style={{ fontVariationSettings: "'wght' 300" }}>manage_accounts</span>
          <span className="text-[11.5px] font-medium tracking-tight">Manager</span>
        </summary>
        
        <div className="ml-[22px] border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
          <button 
            className={`flex items-center gap-2 px-3.5 py-1.5 w-full text-left transition-all select-none rounded-r-md group/item
              ${selectedBrokerSubItem === 'cms-access' ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/10 dark:bg-bk-yellow/5 font-medium border-bk-yellow/20 dark:border-bk-yellow/10' : 'border-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
            onClick={() => {
              dispatch(setSelectedBroker(null));
              dispatch(setSelectedBrokerSubItem('cms-access'));
            }}
            onDoubleClick={() => dispatch(openTab(`cms-access:${hostUid}`))}
          >
            <span className={`material-symbols-outlined text-[16px] ${selectedBrokerSubItem === 'cms-access' ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow'}`}>login</span>
            <span className="text-[11px] tracking-wide">Access log</span>
          </button>

          <button 
            className={`flex items-center gap-2 px-3.5 py-1.5 w-full text-left transition-all select-none rounded-r-md group/item
              ${selectedBrokerSubItem === 'cms-error' ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/10 dark:bg-bk-yellow/5 font-medium border-bk-yellow/20 dark:border-bk-yellow/10' : 'border-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
            onClick={() => {
              dispatch(setSelectedBroker(null));
              dispatch(setSelectedBrokerSubItem('cms-error'));
            }}
            onDoubleClick={() => dispatch(openTab(`cms-error:${hostUid}`))}
          >
            <span className={`material-symbols-outlined text-[16px] ${selectedBrokerSubItem === 'cms-error' ? 'text-rose-400/80 dark:text-rose-500/80 group-hover/item:text-rose-500 dark:group-hover/item:text-rose-400' : 'text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow'}`}>report</span>
            <span className="text-[11px] tracking-wide">Error log</span>
          </button>
        </div>
      </details>

      <details className="group/log-server">
        <summary className="flex items-center gap-1 px-3 py-1.5 cursor-pointer list-none rounded transition-all duration-200 select-none mb-0.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow border border-transparent">
          <span className="material-symbols-outlined text-[16px] group-open/log-server:rotate-90 transition-transform text-slate-400 dark:text-slate-500" style={{ fontVariationSettings: "'wght' 300" }}>chevron_right</span>
          <span className="material-symbols-outlined transition-colors text-[16px] text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-bk-yellow" style={{ fontVariationSettings: "'wght' 300" }}>dns</span>
          <span className="text-[11.5px] font-medium tracking-tight">Server logs</span>
        </summary>
        
        <div className="ml-[22px] border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
          {(databases || []).map((db, idx) => (
            <details 
              key={idx} 
              className="group/log-db"
              onToggle={(e) => {
                if (e.target.open && !dbLogsByDbName[db.dbname]) {
                  dispatch(fetchDatabaseLogs({ hostUid: hostUid, dbname: db.dbname }));
                }
              }}
            >
              <summary className="flex items-center gap-2 px-3.5 py-1.5 cursor-pointer list-none rounded-r-md transition-all select-none text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow group/item">
                <span className="material-symbols-outlined text-[14px] group-open/log-db:rotate-90 transition-transform text-slate-400 dark:text-slate-500">chevron_right</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow">database</span>
                <span className="text-[11px] tracking-wide">{db.dbname}</span>
              </summary>
              <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5 whitespace-nowrap overflow-hidden">
                  {dbLogsLoading && !dbLogsByDbName[db.dbname] && (
                    <div className="px-4 py-1.5 text-[10px] text-slate-400 animate-pulse">Loading logs...</div>
                  )}
                  {(dbLogsByDbName[db.dbname] || []).map((log, lIdx) => {
                    const fileName = log.path.split('/').pop();
                    const isLogSelected = selectedBrokerSubItem === log.path;
                    return (
                      <button 
                        key={lIdx}
                        className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border border-transparent
                          ${isLogSelected ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/10 dark:bg-bk-yellow/5 font-medium border-bk-yellow/20 dark:border-bk-yellow/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                        onClick={() => {
                          dispatch(setSelectedBroker(null));
                          dispatch(setSelectedBrokerSubItem(log.path));
                        }}
                        onDoubleClick={() => dispatch(openTab(`log:${hostUid}:${log.path}`))}
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
                  {!dbLogsLoading && (dbLogsByDbName[db.dbname] || []).length === 0 && (
                    <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No logs found</div>
                  )}
              </div>
            </details>
          ))}
          {(!databases || databases.length === 0) && (
            <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No databases found</div>
          )}
        </div>
      </details>
    </div>
  );
}
