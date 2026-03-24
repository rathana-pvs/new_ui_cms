import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hostApi } from '../../host/hostApi';
import { databaseApi } from '../../database/databaseApi';
import { fetchHostEnv } from '../../host/hostSlice';
import { fetchDatabaseStartInfo } from '../../database/databaseSlice';
import { fetchBrokerList } from '../../broker/brokerSlice';
import DatabaseVolumes from './DatabaseVolumes';
import Brokers from './Brokers';
import SystemInfo from './SystemInfo';

import SystemStatusSection from './server/SystemStatusSection';
import DatabaseListSection from './server/DatabaseListSection';
import MonitoringSettingsPopover from '../../user/components/MonitoringSettingsPopover';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Icon } from '../../../components/ds/foundation/Icon';

export default function ServerContent({ hostUid }) {
  const dispatch = useDispatch();
  const { databases, activeDatabases } = useSelector((state) => state.database);
  const { hosts, authorizedHosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  const [autoStartDBs, setAutoStartDBs] = useState([]);

  // Fetch all required dashboard data
  useEffect(() => {
    if (!hostUid || !authorizedHosts.includes(hostUid)) return;

    // 1. Fetch Databases & their active status
    dispatch(fetchDatabaseStartInfo(hostUid));

    // 2. Fetch Broker List
    dispatch(fetchBrokerList(hostUid));

    // 3. Fetch System Info (Environment)
    dispatch(fetchHostEnv(hostUid));

    // 4. Fetch Auto-start info from cubrid.conf (Matches d-cms logic)
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
        
        setAutoStartDBs(serviceEnabled ? servers : []);
      } catch (err) {
        console.error('Failed to fetch auto-start info:', err);
      }
    };
    
    fetchAutoStartInfo();
  }, [hostUid, authorizedHosts, dispatch]);

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

      // Refresh auto-start list
      const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
      const lines = response?.conflist?.[0]?.confdata || [];
      let servers = [];
      let serviceEnabled = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('service=')) {
          const val = trimmed.split('=')[1] || '';
          if (val.split(',').map(s => s.trim().toLowerCase()).includes('server')) serviceEnabled = true;
        }
        if (trimmed.startsWith('server=')) {
          const val = trimmed.split('=')[1] || '';
          servers = val.split(',').map(s => s.trim());
        }
      }
      setAutoStartDBs(serviceEnabled ? servers : []);
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
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main custom-scrollbar">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between px-6 py-2 text-xs border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-bk-side/80 backdrop-blur-md sticky top-0 z-20">
        <Typography variant="span" className="font-bold text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-2 uppercase">
          <Icon name="dns" size="14px"  weight={300} />
          Host - {currentHost ? (currentHost.alias || currentHost.id) : 'unknown'}
        </Typography>
        <div className="flex items-center gap-2">
          <MonitoringSettingsPopover />
        </div>
      </div>

      <div className="flex flex-col p-6 space-y-6">
        
        {/* Database Volumes Section */}
        <DatabaseVolumes hostUid={hostUid} />

        {/* Brokers Section */}
        <Brokers hostUid={hostUid} />
        
        {/* System Status Section */}
        <SystemStatusSection hostUid={hostUid} />
        
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
