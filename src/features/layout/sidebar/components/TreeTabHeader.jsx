import { useDispatch } from 'react-redux';
import { setSelectedDatabase, setSelectedDatabaseSubItem } from '../../../database/databaseSlice';
import { setSelectedBroker } from '../../../broker/brokerSlice';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Icon } from '../../../../components/ds/foundation/Icon';

export default function TreeTabHeader({ activeTab, setActiveTab, onDbTabContextMenu, onBrokerTabContextMenu }) {
  const dispatch = useDispatch();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setSelectedDatabase(null));
    dispatch(setSelectedDatabaseSubItem(null));
    dispatch(setSelectedBroker(null));
  };

  const tabs = [
    { id: 'db', label: 'Database', icon: 'database', onContextMenu: onDbTabContextMenu },
    { id: 'broker', label: 'Broker', icon: 'hub', onContextMenu: onBrokerTabContextMenu },
    { id: 'log', label: 'Log', icon: 'receipt_long' },
  ];

  return (
    <div className="px-4 py-3 bg-white dark:bg-bk-side border-b border-slate-100 dark:border-white/5">
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-black/20 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 relative group select-none
                ${isActive 
                  ? 'bg-white dark:bg-[#282a2d] shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                  : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              onClick={() => handleTabChange(tab.id)}
              onContextMenu={tab.onContextMenu}
            >
              <div className={`transition-all duration-300 flex items-center justify-center ${isActive ? 'text-bk-yellow scale-110 drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]' : 'group-hover:scale-110 opacity-60 group-hover:opacity-100 text-slate-500 dark:text-slate-400'}`}>
                <Icon name={tab.icon} size="sm" weight={300} />
              </div>
              <div className={`mt-0.5 text-[10px] font-medium tracking-wider uppercase transition-colors duration-200 ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400/80'}`}>
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
