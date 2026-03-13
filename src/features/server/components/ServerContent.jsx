import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { hostApi } from '../../host/hostApi';
import { databaseApi } from '../../database/databaseApi';
import DatabaseVolumes from './DatabaseVolumes';
import Brokers from './Brokers';
import SystemInfo from './SystemInfo';

import SystemStatusSection from './server/SystemStatusSection';
import DatabaseListSection from './server/DatabaseListSection';

export default function ServerContent({ hostUid }) {
  const { databases, activeDatabases } = useSelector((state) => state.database);
  const { hosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  const [autoStartDBs, setAutoStartDBs] = useState([]);

  const systemStatus = [
    { time: "Now", memory: "15.86GB / 31.09GB", memPct: 51, disk: "227.4GB", cpu: "10%", cpuPct: 10, tps: "39", qps: "4" },
    { time: "5 min Avg", memory: "15.89GB / 31.09GB", memPct: 51.1, disk: "-", cpu: "11.5%", cpuPct: 11.5, tps: "32", qps: "2.25" },
  ];

  useEffect(() => {
    const fetchAutoStartInfo = async () => {
      try {
        const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
        const lines = response?.conflist?.[0]?.confdata || [];
        
        let serviceEnabled = false;
        let servers = [];
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed) continue;
          
          if (trimmed.startsWith('service=')) {
            const val = trimmed.split('=')[1] || '';
            const services = val.split(',').map(s => s.trim().toLowerCase());
            if (services.includes('server')) {
              serviceEnabled = true;
            }
          }
          
          if (trimmed.startsWith('server=')) {
            const val = trimmed.split('=')[1] || '';
            servers = val.split(',').map(s => s.trim());
          }
        }
        
        if (serviceEnabled) {
          setAutoStartDBs(servers);
        } else {
          setAutoStartDBs([]);
        }
      } catch (err) {
        console.error('Failed to fetch auto-start info:', err);
        setAutoStartDBs([]);
      }
    };
    
    if (hostUid) {
      fetchAutoStartInfo();
    }
  }, [hostUid]);

  const handleAutoStartToggle = async (dbname, isCurrentlyAutoStart) => {
    try {
      const payload = {
        confname: 'cubridconf',
        dbname: dbname
      };

      if (isCurrentlyAutoStart) {
        await databaseApi.removeAutoStart(hostUid, payload);
      } else {
        await databaseApi.setAutoStart(hostUid, payload);
      }

      // Refresh info
      const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
      const lines = response?.conflist?.[0]?.confdata || [];
      
      let serviceEnabled = false;
      let servers = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed) continue;
        
        if (trimmed.startsWith('service=')) {
          const val = trimmed.split('=')[1] || '';
          const services = val.split(',').map(s => s.trim().toLowerCase());
          if (services.includes('server')) serviceEnabled = true;
        }
        
        if (trimmed.startsWith('server=')) {
          const val = trimmed.split('=')[1] || '';
          servers = val.split(',').map(s => s.trim());
        }
      }
      
      if (serviceEnabled) {
        setAutoStartDBs(servers);
      } else {
        setAutoStartDBs([]);
      }
    } catch (err) {
      console.error('Failed to update auto-start:', err);
    }
  };

  const dbListDisplay = databases.map(db => ({
    db: db.dbname,
    autoStart: autoStartDBs.includes(db.dbname),
    status: activeDatabases.includes(db.dbname) ? "On" : "Off"
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-bk-side/50">
        <span className="font-medium text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-1.5 font-sans">
          <span className="material-symbols-outlined text-[14px]">dns</span>
          Host - {currentHost ? (currentHost.alias || currentHost.id) : 'unknown'}
        </span>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        
        {/* Database Volumes Section */}
        <DatabaseVolumes hostUid={hostUid} />

        {/* Brokers Section */}
        <Brokers hostUid={hostUid} />
        
        {/* System Status Section */}
        <SystemStatusSection systemStatus={systemStatus} />
        
        {/* Databases Section */}
        <DatabaseListSection 
          dbListDisplay={dbListDisplay} 
          handleAutoStartToggle={handleAutoStartToggle} 
        />
        
        {/* System Info Section */}
        <SystemInfo hostUid={hostUid} />

      </div>
    </div>
  );
}
