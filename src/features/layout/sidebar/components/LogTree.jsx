import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBroker, setSelectedBrokerSubItem, fetchBrokerLogs, fetchAdminLogs, fetchCMSLogs, fetchDatabaseLogs } from '../../../broker/brokerSlice';
import { openTab } from '../../layoutSlice';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';
import Spinner from '../../../../components/ui/Feedback/Spinner';

export default function LogTree({ hostUid }) {
  const dispatch = useDispatch();
  const { databases } = useSelector((state) => state.database);
  const { brokers, logsByBroker, logsLoading, adminLogsByHost, adminLogsLoading, cmsLogsByHost, selectedBrokerSubItem, dbLogsByDbName, dbLogsLoading } = useSelector((state) => state.broker);

  return (
    <div className="flex flex-col gap-1 px-1">
      {/* Broker Logs Category */}
      <details className="group/log-broker">
        <summary 
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer list-none rounded-lg transition-all duration-300 select-none border relative group/sum
            ${selectedBrokerSubItem === 'log-broker-root' ? 'bg-primary/5 border-primary/40 text-primary shadow-premium-sm' : 'bg-transparent border-transparent text-foreground/60 hover:bg-muted/5 hover:text-primary'}`}
          onClick={() => {
            dispatch(setSelectedBroker(null));
            dispatch(setSelectedBrokerSubItem('log-broker-root'));
          }}
        >
          <Icon name="chevron_right" size="xs" className="transition-transform group-open/log-broker:rotate-90 opacity-20" />
          <Icon name="hub" size="xs" className="opacity-40 group-hover/sum:opacity-100 group-hover/sum:text-primary" />
          <Typography variant="span" className="text-[13px] font-bold tracking-tight">Broker</Typography>
        </summary>
        
        <div className="ml-5 mt-1 border-l border-border/30 pl-1 space-y-0.5 animate-in slide-in-from-left-2">
          {/* Access Logs */}
          <details className="group/log-access">
            <summary 
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer list-none rounded-lg transition-all select-none group/item relative border border-transparent
                ${selectedBrokerSubItem === 'log-access' ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
              onClick={() => {
                dispatch(setSelectedBroker(null));
                dispatch(setSelectedBrokerSubItem('log-access'));
              }}
            >
              <Icon name="chevron_right" size="xs" className="scale-[0.6] transition-transform group-open/log-access:rotate-90 opacity-20" />
              <Icon name="login" size="xs" className="opacity-40" />
              <Typography variant="span" className="text-[12px] font-bold">Access</Typography>
            </summary>
            {/* Empty for now as per original */}
          </details>

          {/* Error Logs */}
          <details 
            className="group/log-error"
            onToggle={(e) => {
              if (e.target.open && !logsLoading) {
                brokers.forEach(broker => {
                  if (!logsByBroker[broker.name]) {
                    dispatch(fetchBrokerLogs({ hostUid: hostUid, brokerName: broker.name }));
                  }
                });
              }
            }}
          >
            <summary 
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer list-none rounded-lg transition-all select-none group/item relative border border-transparent
                ${selectedBrokerSubItem === 'log-error' ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
              onClick={() => {
                dispatch(setSelectedBroker(null));
                dispatch(setSelectedBrokerSubItem('log-error'));
              }}
            >
              <Icon name="chevron_right" size="xs" className="scale-[0.6] transition-transform group-open/log-error:rotate-90 opacity-20" />
              <Icon name="report" size="xs" className="text-destructive/60 scale-90" />
              <Typography variant="span" className="text-[12px] font-bold">Error</Typography>
            </summary>
            <div className="ml-4 border-l border-border/10 pl-1 mt-0.5 space-y-0.5 whitespace-nowrap overflow-hidden">
               {logsLoading && <div className="px-4 py-2 flex items-center gap-2"><Spinner size="xs" /><Typography variant="caption" className="opacity-30">Loading...</Typography></div>}
               {(() => {
                const errorLogs = Object.values(logsByBroker).flat().filter(log => log.path.toLowerCase().endsWith('.err'));
                if (!logsLoading && errorLogs.length === 0) return <div className="px-4 py-2 opacity-20 italic text-[10px] font-bold">No error logs</div>;
                return errorLogs.map((log, idx) => {
                  const fileName = log.path.split('/').pop();
                  const isLogSelected = selectedBrokerSubItem === log.path;
                  return (
                    <button
                      key={idx}
                      className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all rounded-lg
                        ${isLogSelected ? 'bg-primary/10 text-primary font-black shadow-premium-sm border border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
                      onClick={(e) => { e.stopPropagation(); dispatch(setSelectedBroker(null)); dispatch(setSelectedBrokerSubItem(log.path)); }}
                      onDoubleClick={(e) => { e.stopPropagation(); dispatch(openTab(`log:${hostUid}:${log.path}`)); }}
                    >
                      <Icon name="description" size="xs" className="opacity-30" />
                      <Typography variant="caption" className="font-mono text-[11px] truncate">{fileName}</Typography>
                    </button>
                  );
                });
               })()}
            </div>
          </details>

          {/* Admin Logs */}
          <details 
            className="group/log-admin"
            onToggle={(e) => {
              if (e.target.open && !adminLogsByHost[hostUid] && !adminLogsLoading) {
                dispatch(fetchAdminLogs(hostUid));
              }
            }}
          >
            <summary 
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer list-none rounded-lg transition-all select-none group/item relative border border-transparent
                ${selectedBrokerSubItem === 'log-admin' ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
              onClick={() => {
                dispatch(setSelectedBroker(null));
                dispatch(setSelectedBrokerSubItem('log-admin'));
              }}
            >
              <Icon name="chevron_right" size="xs" className="scale-[0.6] transition-transform group-open/log-admin:rotate-90 opacity-20" />
              <Icon name="admin_panel_settings" size="xs" className="opacity-40" />
              <Typography variant="span" className="text-[12px] font-bold">Admin Log</Typography>
            </summary>
            <div className="ml-4 border-l border-border/10 pl-1 mt-0.5 space-y-0.5">
               {adminLogsLoading && <div className="px-4 py-2 flex items-center gap-2"><Spinner size="xs" /><Typography variant="caption" className="opacity-30">Loading...</Typography></div>}
               {(adminLogsByHost[hostUid] || []).map((log, idx) => {
                 const fileName = log.path.split('/').pop();
                 const isLogSelected = selectedBrokerSubItem === log.path;
                 return (
                   <button
                     key={idx}
                     className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all rounded-lg
                       ${isLogSelected ? 'bg-primary/10 text-primary font-black shadow-premium-sm border border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
                     onClick={(e) => { e.stopPropagation(); dispatch(setSelectedBroker(null)); dispatch(setSelectedBrokerSubItem(log.path)); }}
                     onDoubleClick={(e) => { e.stopPropagation(); dispatch(openTab(`log:${hostUid}:${log.path}`)); }}
                   >
                     <Icon name="description" size="xs" className="opacity-30" />
                     <Typography variant="caption" className="font-mono text-[11px] truncate">{fileName}</Typography>
                   </button>
                 );
               })}
            </div>
          </details>
        </div>
      </details>

      {/* Manager Logs Category */}
      <details 
        className="group/log-manager"
        onToggle={(e) => {
          if (e.target.open && !cmsLogsByHost[hostUid] && !logsLoading) {
            dispatch(fetchCMSLogs(hostUid));
          }
        }}
      >
        <summary 
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer list-none rounded-lg transition-all duration-300 select-none border border-transparent relative group/sum
            ${selectedBrokerSubItem === 'log-manager-root' ? 'bg-primary/5 text-primary border-primary/40' : 'text-foreground/60 hover:bg-muted/5'}`}
          onClick={() => {
            dispatch(setSelectedBroker(null));
            dispatch(setSelectedBrokerSubItem('log-manager-root'));
          }}
        >
          <Icon name="chevron_right" size="xs" className="transition-transform group-open/log-manager:rotate-90 opacity-20" />
          <Icon name="manage_accounts" size="xs" className="opacity-40 group-hover/sum:opacity-100 group-hover/sum:text-primary" />
          <Typography variant="span" className="text-[13px] font-bold tracking-tight">Manager</Typography>
        </summary>
        
        <div className="ml-5 mt-1 border-l border-border/30 pl-1 space-y-0.5">
           <button 
             className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all rounded-lg
               ${selectedBrokerSubItem === 'cms-access' ? 'bg-primary/10 text-primary font-black' : 'text-foreground/40 hover:bg-muted/5'}`}
             onClick={() => { dispatch(setSelectedBroker(null)); dispatch(setSelectedBrokerSubItem('cms-access')); }}
             onDoubleClick={() => dispatch(openTab(`cms-access:${hostUid}`))}
           >
             <Icon name="login" size="xs" className="opacity-30" />
             <Typography variant="span" className="text-[12px] font-bold">Access log</Typography>
           </button>
           <button 
             className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all rounded-lg
               ${selectedBrokerSubItem === 'cms-error' ? 'bg-rose-500/10 text-rose-500 font-black' : 'text-foreground/40 hover:bg-muted/5'}`}
             onClick={() => { dispatch(setSelectedBroker(null)); dispatch(setSelectedBrokerSubItem('cms-error')); }}
             onDoubleClick={() => dispatch(openTab(`cms-error:${hostUid}`))}
           >
             <Icon name="report" size="xs" className="text-rose-500/60" />
             <Typography variant="span" className="text-[12px] font-bold">Error log</Typography>
           </button>
        </div>
      </details>

      {/* Server Logs Category */}
      <details className="group/log-server">
        <summary 
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer list-none rounded-lg transition-all duration-300 select-none border border-transparent relative group/sum
            ${selectedBrokerSubItem === 'log-server-root' ? 'bg-primary/5 text-primary border-primary/40' : 'text-foreground/60 hover:bg-muted/5'}`}
          onClick={() => {
            dispatch(setSelectedBroker(null));
            dispatch(setSelectedBrokerSubItem('log-server-root'));
          }}
        >
          <Icon name="chevron_right" size="xs" className="transition-transform group-open/log-server:rotate-90 opacity-20" />
          <Icon name="dns" size="xs" className="opacity-40 group-hover/sum:opacity-100 group-hover/sum:text-primary" />
          <Typography variant="span" className="text-[13px] font-bold tracking-tight">Server logs</Typography>
        </summary>
        
        <div className="ml-5 mt-1 border-l border-border/30 pl-1 space-y-0.5">
          {(databases || []).map((db, idx) => (
            <details 
              key={idx} 
              className="group/log-db"
               onToggle={(e) => {
                if (e.target.open && !dbLogsByDbName[db.dbname] && !dbLogsLoading) {
                  dispatch(fetchDatabaseLogs({ hostUid: hostUid, dbname: db.dbname }));
                }
              }}
            >
              <summary 
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer list-none rounded-lg transition-all select-none group/item border border-transparent
                  ${selectedBrokerSubItem === `log-db-${db.dbname}` ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
                onClick={() => {
                  dispatch(setSelectedBroker(null));
                  dispatch(setSelectedBrokerSubItem(`log-db-${db.dbname}`));
                }}
              >
                <Icon name="chevron_right" size="xs" className="scale-[0.6] transition-transform group-open/log-db:rotate-90 opacity-20" />
                <Icon name="database" size="xs" className="opacity-40" />
                <Typography variant="span" className="text-[12px] font-bold">{db.dbname}</Typography>
              </summary>
              <div className="ml-4 border-l border-border/10 pl-1 mt-0.5 space-y-0.5 whitespace-nowrap overflow-hidden">
                  {dbLogsLoading && !dbLogsByDbName[db.dbname] && <div className="px-4 py-2 flex items-center gap-2"><Spinner size="xs" /><Typography variant="caption" className="opacity-30">Loading...</Typography></div>}
                  {(dbLogsByDbName[db.dbname] || []).map((log, lIdx) => {
                    const fileName = log.path.split('/').pop();
                    const isLogSelected = selectedBrokerSubItem === log.path;
                    return (
                      <button 
                        key={lIdx}
                        className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all rounded-lg
                          ${isLogSelected ? 'bg-primary/10 text-primary font-black shadow-premium-sm border border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
                        onClick={() => { dispatch(setSelectedBroker(null)); dispatch(setSelectedBrokerSubItem(log.path)); }}
                        onDoubleClick={() => dispatch(openTab(`log:${hostUid}:${log.path}`))}
                      >
                        <Icon name="description" size="xs" className="opacity-30" />
                        <Typography variant="caption" className="font-mono text-[11px] truncate">{fileName}</Typography>
                      </button>
                    );
                  })}
              </div>
            </details>
          ))}
        </div>
      </details>
    </div>
  );
}
