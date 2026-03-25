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
  const hostLabel = currentHost ? (currentHost.alias || currentHost.id) : 'Unknown Host';
  const [autoStartDBs, setAutoStartDBs] = useState([]);

  useEffect(() => {
    if (!hostUid || !authorizedHosts.includes(hostUid)) return;
    dispatch(fetchDatabaseStartInfo(hostUid));
    dispatch(fetchBrokerList(hostUid));
    dispatch(fetchHostEnv(hostUid));

    const fetchAutoStartInfo = async () => {
      try {
        const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
        const lines = response?.conflist?.[0]?.confdata || [];
        let serviceEnabled = false, servers = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed) continue;
          if (trimmed.startsWith('service=')) {
            const val = trimmed.split('=')[1] || '';
            if (val.split(',').map(s => s.trim().toLowerCase()).includes('server')) serviceEnabled = true;
          }
          if (trimmed.startsWith('server=')) {
            servers = (trimmed.split('=')[1] || '').split(',').map(s => s.trim());
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
      const payload = { confname: 'cubridconf', dbname };
      if (isCurrentlyAutoStart) await databaseApi.removeAutoStart(hostUid, payload);
      else await databaseApi.setAutoStart(hostUid, payload);

      const response = await hostApi.getHostConfig(hostUid, 'cubridconf');
      const lines = response?.conflist?.[0]?.confdata || [];
      let servers = [], serviceEnabled = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('service=')) {
          const val = trimmed.split('=')[1] || '';
          if (val.split(',').map(s => s.trim().toLowerCase()).includes('server')) serviceEnabled = true;
        }
        if (trimmed.startsWith('server=')) servers = (trimmed.split('=')[1] || '').split(',').map(s => s.trim());
      }
      setAutoStartDBs(serviceEnabled ? servers : []);
    } catch (err) {
      console.error('Failed to update auto-start:', err);
    }
  };

  const dbListDisplay = databases.map(db => ({
    db: db.dbname,
    autoStart: autoStartDBs.includes(db.dbname),
    status: activeDatabases.includes(db.dbname) ? 'On' : 'Off'
  }));

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-background-dark overflow-hidden">

      {/* ── Header ── */}
      <header className="px-6 py-3.5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between shrink-0 sticky top-0 z-20 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Icon name="dns" size="sm" weight={300} className="text-amber-500" />
          </div>
          <div>
            <Typography variant="h1" className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Server Dashboard
            </Typography>
            <Typography variant="label" className="text-[10px] text-slate-400 font-mono">{hostLabel}</Typography>
          </div>
        </div>
        <MonitoringSettingsPopover />
      </header>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <DatabaseVolumes hostUid={hostUid} />
        <Brokers hostUid={hostUid} />
        <SystemStatusSection hostUid={hostUid} />
        <DatabaseListSection dbListDisplay={dbListDisplay} handleAutoStartToggle={handleAutoStartToggle} />
        <SystemInfo hostUid={hostUid} />
      </div>
    </div>
  );
}
