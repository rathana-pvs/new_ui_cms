import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMonitoringData, clearMonitoring } from '../../monitoringSlice';
import { Card } from '../../../../components/ds/layout/Card';
import { Table } from '../../../../components/ds/layout/Table';
import { Icon } from '../../../../components/ds/foundation/Icon';
import { Button } from '../../../../components/ds/foundation/Button';
import { Spinner } from '../../../../components/ds/foundation/Spinner';
import { Typography } from '../../../../components/ds/foundation/Typography';

const MetricBar = ({ pct, colorFn }) => (
  <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.06] overflow-hidden mt-1">
    <div className={`h-full transition-all duration-300 ${colorFn(pct)}`} style={{ width: `${pct}%` }} />
  </div>
);

const cpuColor  = (p) => p > 80 ? 'bg-rose-500' : p > 50 ? 'bg-amber-500' : 'bg-emerald-500';
const memColor  = (p) => p > 80 ? 'bg-rose-500' : 'bg-amber-500';

export default function SystemStatusSection({ hostUid }) {
  const dispatch = useDispatch();
  const { currentStatus, averages, history, loading, error } = useSelector((state) => state.monitoring);
  const { authorizedHosts } = useSelector((state) => state.host);
  const isAuthorized = hostUid && authorizedHosts.includes(hostUid);

  const [isStopped, setIsStopped] = useState(false);
  const pollTimer     = useRef(null);
  const fetchCountRef = useRef(0);

  const scheduleNext = (delay) => {
    pollTimer.current = setTimeout(() => {
      if (!isAuthorized) { setIsStopped(true); return; }
      dispatch(fetchMonitoringData(hostUid));
      fetchCountRef.current += 1;
      const nextDelay = fetchCountRef.current < 15 ? 1000 : 30000;
      if (fetchCountRef.current < 30) scheduleNext(nextDelay);
      else setIsStopped(true);
    }, delay);
  };

  const startPolling = () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (!isAuthorized) return;
    setIsStopped(false);
    fetchCountRef.current = 0;
    dispatch(clearMonitoring());
    dispatch(fetchMonitoringData(hostUid));
    scheduleNext(1000);
  };

  useEffect(() => {
    if (!hostUid || !isAuthorized) {
      if (pollTimer.current) clearTimeout(pollTimer.current);
      return;
    }
    dispatch(fetchMonitoringData(hostUid));
    scheduleNext(1000);
    return () => { if (pollTimer.current) clearTimeout(pollTimer.current); };
  }, [hostUid, isAuthorized, dispatch]);

  const formatBytes = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const rows = [
    {
      id: 'now', time: 'Now',
      memory: currentStatus?.memTotal ? { display: `${formatBytes(currentStatus.memUsed)} / ${formatBytes(currentStatus.memTotal)}`, pct: currentStatus.memory } : null,
      disk: history[history.length - 1]?.disk || '-',
      cpu: { display: `${(currentStatus?.cpu || 0).toFixed(1)}%`, pct: currentStatus?.cpu || 0 },
      tps: (currentStatus?.tps || 0).toFixed(2),
      qps: (currentStatus?.qps || 0).toFixed(2),
    },
    {
      id: 'avg', time: '5 min Avg',
      memory: { display: `${(averages?.memory || 0).toFixed(1)}%`, pct: averages?.memory || 0 },
      disk: '-',
      cpu: { display: `${(averages?.cpu || 0).toFixed(1)}%`, pct: averages?.cpu || 0 },
      tps: (averages?.tps || 0).toFixed(2),
      qps: (averages?.qps || 0).toFixed(2),
    }
  ];

  const columns = [
    { header: 'Period', accessor: 'time', render: (val) => <span className="font-semibold text-[12px] text-slate-600 dark:text-slate-300">{val}</span> },
    {
      header: 'Memory',
      accessor: 'memory',
      render: (val) => val ? (
        <div className="min-w-[150px]">
          <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{val.display}</span>
          <MetricBar pct={val.pct} colorFn={memColor} />
        </div>
      ) : <span className="text-slate-300">—</span>
    },
    { header: 'Disk', accessor: 'disk', render: (val) => <span className="font-mono text-[12px] text-slate-500">{val}</span> },
    {
      header: 'CPU',
      accessor: 'cpu',
      render: (val) => val ? (
        <div className="min-w-[100px]">
          <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200">{val.display}</span>
          <MetricBar pct={val.pct} colorFn={cpuColor} />
        </div>
      ) : <span className="text-slate-300">—</span>
    },
    { header: 'TPS', accessor: 'tps', render: (val) => <span className="font-mono text-[12px] text-amber-600 dark:text-amber-400 font-semibold">{val}</span> },
    { header: 'QPS', accessor: 'qps', render: (val) => <span className="font-mono text-[12px] text-amber-600 dark:text-amber-400 font-semibold">{val}</span> },
  ];

  return (
    <Card
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon name="bar_chart" size="sm" weight={300} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">System Status</span>
            <span className="text-[10px] text-slate-400 font-normal ml-1">
              {isStopped ? '· Paused' : '· Live'}
            </span>
          </div>
          {isStopped && (
            <Button variant="secondary" size="xs" icon="refresh" onClick={startPolling} className="text-[10px]">
              Resume
            </Button>
          )}
        </div>
      }
      collapsible
      defaultCollapsed
    >
      {error && (
        <div className="px-4 py-2 text-[11px] text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-b border-rose-200 dark:border-rose-500/20">
          {typeof error === 'object' ? (error.message || error.note || JSON.stringify(error)) : error}
        </div>
      )}
      <Table columns={columns} data={rows} className="font-mono text-[12px]" />
    </Card>
  );
}
