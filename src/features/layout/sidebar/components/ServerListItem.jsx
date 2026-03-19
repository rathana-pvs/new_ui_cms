import { useDispatch, useSelector } from 'react-redux';
import { setSelectedHost } from '../../../host/hostSlice';
import { setActiveMainTab } from '../../layoutSlice';

export default function ServerListItem({ host, isSelected, isAuthorized, onContextMenu }) {
  const dispatch = useDispatch();

  return (
    <div
      title={`${host.address}:${host.port}`}
      className={`flex flex-col px-3 py-2 cursor-pointer transition-all select-none rounded-lg group relative mb-1.5 border
        ${isSelected
          ? 'bg-bk-yellow/5 border-bk-yellow/40 dark:border-bk-yellow/20'
          : 'bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-bk-yellow/30'
        }`}
      onClick={() => {
        dispatch(setSelectedHost(host.uid));
        dispatch(setActiveMainTab('host:' + host.uid));
      }}
      onContextMenu={(e) => onContextMenu(e, host.alias || host.id, host.uid, host.alias || host.id)}
    >
      <div className="flex items-center gap-1.5">
        <div className={`flex-shrink-0 w-5 h-5 rounded-[4px] transition-all flex items-center justify-center
          ${isSelected ? 'bg-bk-yellow/10 dark:bg-bk-yellow/10 text-amber-600 dark:text-bk-yellow' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
          <span className={`material-symbols-outlined text-[13px] leading-none ${isSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 group-hover:text-amber-600 dark:group-hover:text-bk-yellow'}`} style={{ fontVariationSettings: "'wght' 300" }}>
            {isSelected ? 'dns' : 'storage'}
          </span>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[13px] font-semibold truncate tracking-tight transition-colors 
              ${isSelected ? 'text-amber-600 dark:text-bk-yellow font-bold' : 'text-slate-800 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-bk-yellow'}`}>
              {host.alias || host.id}
            </span>
            {isAuthorized && (
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] flex-shrink-0"></span>
              </div>
            )}
          </div>
        </div>
      </div>
      {isSelected && (
        <div className="absolute left-[-1px] top-2 bottom-2 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
      )}
    </div>
  );
}
