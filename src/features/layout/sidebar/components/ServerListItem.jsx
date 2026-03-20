import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedHost } from '../../../host/hostSlice';
import { setActiveMainTab } from '../../layoutSlice';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function ServerListItem({ host, isSelected, isAuthorized, onContextMenu }) {
  const dispatch = useDispatch();

  return (
    <div
      title={`${host.address}:${host.port}`}
      className={`flex flex-col px-4 py-3 cursor-pointer transition-all select-none rounded-xl group relative mb-2 border
        ${isSelected
          ? 'bg-primary/5 border-primary/40 shadow-premium-sm'
          : 'bg-background/40 border-border/50 hover:border-primary/30 hover:bg-muted/5'
        }`}
      onClick={() => {
        dispatch(setSelectedHost(host.uid));
        dispatch(setActiveMainTab('host:' + host.uid));
      }}
      onContextMenu={(e) => onContextMenu(e, host.alias || host.id, host.uid, host.alias || host.id)}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg transition-all flex items-center justify-center border shadow-sm
          ${isSelected 
            ? 'bg-primary/10 border-primary/20 text-primary scale-105' 
            : 'bg-muted/5 border-border/50 text-foreground/40 group-hover:bg-muted/10 group-hover:text-primary group-hover:border-primary/20'}`}>
          <Icon 
             name={isSelected ? 'dns' : 'storage'} 
             size="xs" 
             className={isSelected ? 'text-primary' : 'opacity-60'} 
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Typography 
               variant="span" 
               className={`text-[14px] truncate tracking-tight transition-colors 
                 ${isSelected ? 'text-primary font-bold' : 'text-foreground/70 group-hover:text-primary font-medium'}`}
            >
              {host.alias || host.id}
            </Typography>
            {isAuthorized && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-premium animate-pulse flex-shrink-0" />
                <Typography variant="caption" className="text-emerald-500 font-bold text-[7px] uppercase tracking-widest">Active</Typography>
              </div>
            )}
          </div>
          <Typography variant="caption" className="opacity-30 font-mono text-[9px] truncate">
             {host.address}:{host.port}
          </Typography>
        </div>
      </div>
      
      {isSelected && (
        <div className="absolute left-[-1px] top-3 bottom-3 w-[3px] bg-primary rounded-full shadow-premium animate-in slide-in-from-left-1 duration-300"></div>
      )}
    </div>
  );
}
