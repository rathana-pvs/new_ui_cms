import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBroker, setSelectedBrokerSubItem, fetchBrokerLogs } from '../../../broker/brokerSlice';
import { openTab } from '../../layoutSlice';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';
import Spinner from '../../../../components/ui/Feedback/Spinner';

export default function BrokerTree({ hostUid, onContextMenu }) {
  const dispatch = useDispatch();
  const { brokers, loading, logsByBroker, selectedBroker, selectedBrokerSubItem, logsLoading } = useSelector((state) => state.broker);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  if (brokers.length === 0) {
    return (
      <div className="px-5 py-4 text-center">
        <Typography variant="caption" className="opacity-40 italic font-medium">No brokers found</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-1">
      {brokers.map((broker) => {
        const isOn = broker.state === 'ON';
        const isBrokerSelected = selectedBroker === broker.name;
        const brokerLogs = (logsByBroker[broker.name] || []).filter(log => log.path.toLowerCase().endsWith('.log'));
        const isMainSelected = isBrokerSelected && !selectedBrokerSubItem;
        
        return (
          <details 
            key={broker.name} 
            className="group/broker"
            onToggle={(e) => {
              if (e.target.open && !logsByBroker[broker.name] && !logsLoading) {
                dispatch(fetchBrokerLogs({ hostUid: hostUid, brokerName: broker.name }));
              }
            }}
          >
            <summary
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer list-none rounded-lg transition-all duration-300 select-none border relative group/sum
                ${isMainSelected 
                  ? 'bg-primary/5 border-primary/40 text-primary shadow-premium-sm' 
                  : 'bg-transparent border-transparent text-foreground/60 hover:bg-muted/5 hover:text-primary hover:border-border/50'}`}
              onClick={() => {
                dispatch(setSelectedBroker(broker.name));
                dispatch(setSelectedBrokerSubItem(null));
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                dispatch(openTab(`broker_status:${hostUid}:${broker.name}`));
              }}
              onContextMenu={(e) => onContextMenu(e, broker.name, broker.state)}
            >
              <Icon 
                 name="chevron_right" 
                 size="xs" 
                 className={`transition-transform duration-300 group-open/broker:rotate-90 ${isMainSelected ? 'text-primary' : 'opacity-20'}`} 
              />
              <Icon 
                 name="hub" 
                 size="xs" 
                 className={`transition-all duration-300 ${isMainSelected ? 'text-primary scale-110 shadow-premium' : 'opacity-40 group-hover/sum:opacity-100 group-hover/sum:text-primary'}`} 
              />
              <div className="flex-1 min-w-0">
                <Typography 
                   variant="span" 
                   className={`text-[13px] font-medium tracking-tight truncate block transition-colors ${isMainSelected ? 'text-primary font-bold' : ''}`}
                >
                  {broker.name} <span className="opacity-30 font-normal ml-1">({broker.port})</span>
                </Typography>
              </div>
              
              {isMainSelected && (
                <div className="absolute left-[-1px] top-2 bottom-2 w-[3px] bg-primary rounded-full shadow-premium animate-in fade-in duration-500"></div>
              )}

              {isOn ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-premium animate-pulse" />
                  <Typography variant="caption" className="text-emerald-500 font-bold text-[7px] uppercase tracking-widest">ON</Typography>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/10 border border-border/20 rounded-full opacity-40">
                  <div className="h-1 w-1 rounded-full bg-foreground/40" />
                  <Typography variant="caption" className="text-foreground/60 font-bold text-[7px] uppercase tracking-widest">OFF</Typography>
                </div>
              )}
            </summary>

            <div className="ml-5 mt-1 border-l border-border/30 pl-1 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              <details className="group/nested">
                <summary 
                  className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-all group/item-sum cursor-pointer list-none rounded-lg relative border border-transparent
                    ${(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') 
                      ? 'bg-primary/5 text-primary border-primary/20' 
                      : 'text-foreground/50 hover:bg-muted/5 hover:text-primary'}`}
                  onClick={() => {
                    dispatch(setSelectedBroker(broker.name));
                    dispatch(setSelectedBrokerSubItem('SQL Log'));
                  }}
                >
                  <Icon 
                     name="chevron_right" 
                     size="xs" 
                     className={`scale-[0.7] transition-transform duration-300 group-open/nested:rotate-90 ${(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') ? 'text-primary' : 'opacity-20'}`} 
                  />
                  <Icon 
                     name="history_edu" 
                     size="xs" 
                     className={`transition-colors ${(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') ? 'text-primary' : 'opacity-40 group-hover/item-sum:opacity-100 group-hover/item-sum:text-primary'}`} 
                  />
                  <Typography variant="span" className="text-[12px] font-medium tracking-tight">SQL Log</Typography>
                  {(isBrokerSelected && selectedBrokerSubItem === 'SQL Log') && (
                    <div className="absolute left-[-1px] top-1.5 bottom-1.5 w-[2.5px] bg-primary rounded-full shadow-premium"></div>
                  )}
                </summary>
                
                <div className="ml-4 border-l border-border/20 pl-1 mt-0.5 space-y-0.5">
                  {logsLoading && (
                    <div className="px-4 py-2 flex items-center gap-2">
                       <Spinner size="xs" />
                       <Typography variant="caption" className="opacity-40 font-bold">Loading logs...</Typography>
                    </div>
                  )}
                  {brokerLogs.map((log, idx) => {
                    const fileName = log.path.split('/').pop();
                    const isLogSelected = isBrokerSelected && selectedBrokerSubItem === log.path;
                    return (
                      <button
                        key={idx}
                        className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-lg
                          ${isLogSelected 
                             ? 'bg-primary/10 text-primary shadow-premium-sm border border-primary/20' 
                             : 'text-foreground/40 hover:bg-muted/5 hover:text-primary'}`}
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
                        <Icon 
                           name="description" 
                           size="xs" 
                           className={`opacity-30 transition-all ${isLogSelected ? 'opacity-100 scale-110 text-primary' : 'group-hover/child:opacity-100 group-hover/child:text-primary'}`} 
                        />
                        <Typography 
                           variant="caption" 
                           className={`truncate font-mono tracking-tighter text-[11px] ${isLogSelected ? 'font-bold' : 'font-medium'}`}
                           title={fileName}
                        >
                           {fileName}
                        </Typography>
                        {isLogSelected && (
                          <div className="absolute left-[-1px] top-1.5 bottom-1.5 w-[2.5px] bg-primary rounded-full shadow-premium"></div>
                        )}
                      </button>
                    );
                  })}
                  {!logsLoading && brokerLogs.length === 0 && (
                    <div className="px-4 py-1.5 opacity-20 italic text-[11px] font-bold uppercase tracking-wider">No logs found</div>
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
