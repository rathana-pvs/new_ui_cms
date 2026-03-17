import { useDispatch } from 'react-redux';
import { setSelectedDatabase, setSelectedDatabaseSubItem } from '../../../database/databaseSlice';
import { setSelectedBroker } from '../../../broker/brokerSlice';

export default function TreeTabHeader({ activeTab, setActiveTab, onDbTabContextMenu, onBrokerTabContextMenu }) {
  const dispatch = useDispatch();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setSelectedDatabase(null));
    dispatch(setSelectedDatabaseSubItem(null));
    dispatch(setSelectedBroker(null));
  };

  return (
    <div className="px-3 py-1.5 bg-white dark:bg-bk-side border-b border-slate-100 dark:border-slate-800/50">
      <div className="flex items-center gap-1 p-0.5 bg-slate-50 dark:bg-bk-main/40 rounded-md">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all ${activeTab === 'db' ? 'bg-bk-yellow text-slate-900 font-medium shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => handleTabChange('db')}
          onContextMenu={onDbTabContextMenu}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 500" }}>database</span>
          <span className="text-[11px] font-medium tracking-tight">Database</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all ${activeTab === 'broker' ? 'bg-bk-yellow text-slate-900 font-medium shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => handleTabChange('broker')}
          onContextMenu={onBrokerTabContextMenu}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 500" }}>hub</span>
          <span className="text-[11px] font-medium tracking-tight">Broker</span>
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all ${activeTab === 'log' ? 'bg-bk-yellow text-slate-900 font-medium shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
          onClick={() => handleTabChange('log')}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 500" }}>receipt_long</span>
          <span className="text-[11px] font-medium tracking-tight">Log</span>
        </button>
      </div>
    </div>
  );
}
