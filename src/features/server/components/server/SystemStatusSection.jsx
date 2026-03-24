import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonitoringData, clearMonitoring } from '../../monitoringSlice';
import { Card } from '../../../../components/ds/layout/Card';
import { Table } from '../../../../components/ds/layout/Table';
import { Icon } from '../../../../components/ds/foundation/Icon';
import { Button } from '../../../../components/ds/foundation/Button';
import { Spinner } from '../../../../components/ds/foundation/Spinner';
import { Typography } from '../../../../components/ds/foundation/Typography';

export default function SystemStatusSection({ hostUid }) {
  const dispatch = useDispatch();
  const { currentStatus, averages, history, loading, error } = useSelector((state) => state.monitoring);
  const { authorizedHosts } = useSelector((state) => state.host);
  const isAuthorized = hostUid && authorizedHosts.includes(hostUid);
  
  const [isStopped, setIsStopped] = useState(false);
  const pollTimer = useRef(null);
  const fetchCountRef = useRef(0);

  const startPolling = () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (!isAuthorized) return;
    setIsStopped(false);
    fetchCountRef.current = 0;
    dispatch(clearMonitoring());
    dispatch(fetchMonitoringData(hostUid));
    scheduleNext(1000);
  };

  const scheduleNext = (delay) => {
    pollTimer.current = setTimeout(() => {
      if (!isAuthorized) {
        setIsStopped(true);
        return;
      }
      
      dispatch(fetchMonitoringData(hostUid));
      fetchCountRef.current += 1;

      // Determine next delay based on the ref value
      const nextDelay = fetchCountRef.current < 15 ? 1000 : 30000;
      
      // Stop after ~5 minutes total
      if (fetchCountRef.current < 30) {
        scheduleNext(nextDelay);
      } else {
        setIsStopped(true);
      }
    }, delay);
  };

  useEffect(() => {
    if (!hostUid || !isAuthorized) {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      return;
    }

    // Initial fetch and start polling
    dispatch(fetchMonitoringData(hostUid));
    scheduleNext(1000);

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [hostUid, isAuthorized, dispatch]);

  const formatBytes = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const rows = [
    {
      id: 'now',
      time: 'Now',
      memory: currentStatus?.memTotal ? { display: `${formatBytes(currentStatus.memUsed)} / ${formatBytes(currentStatus.memTotal)}`, pct: currentStatus.memory } : null,
      disk: history[history.length - 1]?.disk || '-',
      cpu: { display: `${(currentStatus?.cpu || 0).toFixed(1)}%`, pct: currentStatus?.cpu || 0 },
      tps: (currentStatus?.tps || 0).toFixed(2),
      qps: (currentStatus?.qps || 0).toFixed(2)
    },
    {
      id: 'avg',
      time: '5 min Avg',
      memory: { display: (averages?.memory || 0).toFixed(1) + '%', pct: averages?.memory || 0 },
      disk: '-',
      cpu: { display: `${(averages?.cpu || 0).toFixed(1)}%`, pct: averages?.cpu || 0 },
      tps: (averages?.tps || 0).toFixed(2),
      qps: (averages?.qps || 0).toFixed(2)
    }
  ];

  const columns = [
    { header: 'Time', accessor: 'time', className: 'font-bold' },
    { 
      header: 'Memory', 
      accessor: 'memory',
      render: (val) => val ? (
        <div className="flex flex-col gap-1 w-full max-w-[160px]">
          <span className="text-[10px] font-mono opacity-80">{val.display}</span>
          <div className="w-full bg-slate-100 dark:bg-black/40 rounded-full h-1 overflow-hidden border border-slate-200 dark:border-white/5">
            <div className={`h-full rounded-full shadow-[0_0_8px] transition-all duration-300 ${val.pct > 80 ? 'bg-rose-500 shadow-rose-500/20' : 'bg-bk-yellow shadow-bk-yellow/20'}`} style={{ width: `${val.pct}%` }}></div>
          </div>
        </div>
      ) : '-'
    },
    { header: 'Disk', accessor: 'disk' },
    { 
      header: 'CPU', 
      accessor: 'cpu',
      render: (val) => val ? (
        <div className="flex flex-col gap-1 w-full max-w-[120px]">
          <span className="text-[10px] font-mono opacity-80">{val.display}</span>
          <div className="w-full bg-slate-100 dark:bg-black/40 rounded-full h-1 overflow-hidden border border-slate-200 dark:border-white/5">
            <div className={`h-full rounded-full shadow-[0_0_8px] transition-all duration-300 ${val.pct > 80 ? 'bg-rose-500 shadow-rose-500/20' : val.pct > 50 ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`} style={{ width: `${val.pct}%` }}></div>
          </div>
        </div>
      ) : '-'
    },
    { header: 'TPS', accessor: 'tps' },
    { header: 'QPS', accessor: 'qps' }
  ];

  const cardTitle = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Icon name="bar_chart" size="sm" className="text-bk-yellow"  weight={300} />
        <span>System Status</span>
        <span className="font-normal text-slate-500 dark:text-slate-400 ml-1 text-[11px]">
          {isStopped ? '(Paused to save resources)' : '(Refreshes dynamically)'}
        </span>
      </div>
      {isStopped && (
        <Button 
          variant="secondary" 
          size="xs" 
          icon="refresh" 
          onClick={startPolling}
          className="text-[10px]"
        >
          Resume
        </Button>
      )}
    </div>
  );

  return (
    <Card title={cardTitle} bodyClassName="p-0">
      {error && (
        <div className="p-3 text-[11px] text-rose-500 bg-rose-500/10 border-b border-rose-500/20">
          Error: {typeof error === 'object' ? (error.message || error.note || JSON.stringify(error)) : error}
        </div>
      )}
      <Table columns={columns} data={rows} className="font-mono text-[12px]" />
    </Card>
  );
}
