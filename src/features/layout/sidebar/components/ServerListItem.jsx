import { useDispatch } from 'react-redux';
import { setSelectedHost } from '../../../host/hostSlice';
import { setActiveMainTab } from '../../layoutSlice';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function ServerListItem({ host, isSelected, isAuthorized, onContextMenu }) {
  const dispatch = useDispatch();

  return (
    <div
      title={`${host.address}:${host.port}`}
      className={`flex flex-col px-4 py-1.5 cursor-pointer transition-all select-none rounded-xl group relative mb-1 border
        ${isSelected
          ? 'bg-bk-yellow/5 border-bk-yellow/40 dark:border-bk-yellow/20 shadow-lg shadow-bk-yellow/5'
          : 'bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-bk-yellow/30 hover:bg-slate-50 dark:hover:bg-white/[0.08]'
        }`}
      onClick={() => {
        dispatch(setSelectedHost(host.uid));
        dispatch(setActiveMainTab('host:' + host.uid));
      }}
      onContextMenu={(e) => onContextMenu(e, host.alias || host.id, host.uid, host.alias || host.id)}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-7 h-7 rounded-xl transition-all duration-300 flex items-center justify-center border
          ${isSelected 
            ? 'bg-bk-yellow border-bk-yellow/20 shadow-md shadow-bk-yellow/20 rotate-0' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 group-hover:rotate-6 group-hover:border-bk-yellow/30'}`}>
          <Icon 
            name={isSelected ? 'dns' : 'storage'} 
            size="12px" 
            className={isSelected ? 'text-bk-side' : 'text-slate-400 group-hover:text-bk-yellow'} 
            weight={isSelected ? 900 : 300}
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Typography 
              variant="span" 
              className={`text-[13px] font-medium truncate tracking-tight transition-colors 
                ${isSelected ? 'text-bk-yellow' : 'text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow'}`}
            >
              {host.alias || host.id}
            </Typography>
            {isAuthorized && (
              <div className="relative group/status">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex-shrink-0 animate-pulse"></span>
                <div className="absolute right-0 top-full mt-1 bg-bk-side text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Authorized
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="absolute left-[-1px] top-3 bottom-3 w-[3px] bg-bk-yellow rounded-full shadow-[0_0_10px_rgba(255,193,7,0.5)]"></div>
      )}
    </div>
  );
}
