import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedDatabase, setSelectedDatabaseSubItem } from '../../../database/databaseSlice';
import { setSelectedBroker } from '../../../broker/brokerSlice';
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';

export default function TreeTabHeader({ activeTab, setActiveTab, onDbTabContextMenu, onBrokerTabContextMenu }) {
  const dispatch = useDispatch();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(setSelectedDatabase(null));
    dispatch(setSelectedDatabaseSubItem(null));
    dispatch(setSelectedBroker(null));
  };

  const tabs = [
    { id: 'db', label: 'Database', icon: 'database', menu: onDbTabContextMenu },
    { id: 'broker', label: 'Broker', icon: 'hub', menu: onBrokerTabContextMenu },
    { id: 'log', label: 'Log', icon: 'receipt_long' }
  ];

  return (
    <div className="px-4 py-3 bg-background border-b border-border/50">
      <div className="flex items-center gap-1 p-1 bg-muted/10 rounded-xl border border-border/20 shadow-inner-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-300 relative group
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-premium' 
                  : 'text-foreground/40 hover:bg-muted/10 hover:text-primary active:scale-[0.98]'}`}
              onClick={() => handleTabChange(tab.id)}
              onContextMenu={tab.menu}
            >
              <Icon 
                 name={tab.icon} 
                 size="xs" 
                 className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} 
              />
              <Typography 
                 variant="span" 
                 className={`text-[12px] font-black tracking-tight uppercase ${isActive ? '' : 'opacity-60'}`}
              >
                {tab.label}
              </Typography>
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full shadow-premium animate-in zoom-in-0 duration-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
