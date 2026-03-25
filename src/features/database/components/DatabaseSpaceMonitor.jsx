import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { databaseApi } from '../databaseApi';
import { setActiveMainTab } from '../../layout/layoutSlice';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Card } from '../../../components/ds/layout/Card';
import { Table } from '../../../components/ds/layout/Table';

const TYPE_BADGE = (val = '') => {
  const t = val.toUpperCase();
  if (t.includes('PERMANENT'))  return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
  if (t.includes('TEMPORARY'))  return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
  if (t.includes('ACTIVE_LOG')) return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
  if (t.includes('ARCHIVE_LOG'))return 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20';
  return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
};

export default function DatabaseSpaceMonitor({ hostUid, dbname }) {
  const dispatch = useDispatch();
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchSpaceInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await databaseApi.getVolumeInfo(hostUid, dbname);
      setData(response);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError('Could not retrieve database space information.');
    } finally {
      setLoading(false);
    }
  }, [hostUid, dbname]);

  useEffect(() => { fetchSpaceInfo(); }, [fetchSpaceInfo]);

  const formatSize = (bytes) => {
    if (!bytes || bytes === '0') return '0 B';
    const b = parseInt(bytes);
    if (b >= 1024 ** 4) return `${(b / 1024 ** 4).toFixed(2)} TB`;
    if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(2)} GB`;
    if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(2)} MB`;
    if (b >= 1024)      return `${(b / 1024).toFixed(2)} KB`;
    return `${b} B`;
  };

  const formatPages = (pages) => (!pages ? '0' : parseInt(pages).toLocaleString());

  const totals = useMemo(() => {
    if (!data?.dbinfo) return null;
    let total = 0, free = 0;
    data.dbinfo.forEach(i => { total += parseInt(i.total_size || 0); free += parseInt(i.free_size || 0); });
    return { total, free, used: total - free, pct: total > 0 ? ((total - free) / total) * 100 : 0 };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-background-dark gap-3">
        <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <Typography variant="p" className="text-xs text-slate-400">Analyzing storage capacity…</Typography>
      </div>
    );
  }

  const usageSeverity = (pct) => pct > 85 ? 'text-rose-500' : pct > 60 ? 'text-amber-500' : 'text-emerald-500';
  const barColor      = (pct) => pct > 85 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-amber-500';

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-background-dark overflow-hidden select-none">

      {/* ── Header ── */}
      <header className="px-6 py-3.5 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between shrink-0 sticky top-0 z-10 bg-white dark:bg-background-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Icon name="donut_small" size="sm" weight={300} className="text-amber-500" />
          </div>
          <div>
            <Typography variant="h1" className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Database Space Monitor
            </Typography>
            <Typography variant="label" className="text-[10px] text-slate-400 font-mono">{dbname}</Typography>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Typography variant="label" className="text-[10px] text-slate-400 font-mono hidden md:block">
            Refreshed {lastRefreshed.toLocaleTimeString()}
          </Typography>
          <button
            onClick={fetchSpaceInfo}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95 border border-slate-200 dark:border-white/[0.06] disabled:opacity-50"
          >
            <Icon name="refresh" size="sm" weight={300} className={loading ? 'animate-spin text-amber-500' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <Icon name="error" size="sm" weight={300} />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* DB name */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
            <Typography variant="label" className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Database</Typography>
            <Typography variant="p" className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono truncate">{data?.dbname || dbname}</Typography>
          </div>

          {/* Consumed */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
            <Typography variant="label" className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Used</Typography>
            <Typography variant="p" className="text-lg font-black text-slate-700 dark:text-slate-100 font-mono leading-none">{formatSize(totals?.used)}</Typography>
            <Typography variant="label" className="text-[9px] text-slate-400">of {formatSize(totals?.total)} total</Typography>
          </div>

          {/* Free */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
            <Typography variant="label" className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Free</Typography>
            <Typography variant="p" className="text-lg font-black text-emerald-500 font-mono leading-none">{formatSize(totals?.free)}</Typography>
            <Typography variant="label" className="text-[9px] text-slate-400">headroom available</Typography>
          </div>

          {/* Utilization */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Typography variant="label" className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Utilization</Typography>
              <Typography variant="label" className={`text-[9px] font-black font-mono ${usageSeverity(totals?.pct || 0)}`}>{(totals?.pct || 0).toFixed(1)}%</Typography>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.06] overflow-hidden mt-1">
              <div
                className={`h-full ${barColor(totals?.pct || 0)} transition-all duration-1000`}
                style={{ width: `${totals?.pct || 0}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <Typography variant="label" className="text-[9px] text-slate-400 font-mono">Page {data?.pagesize}B</Typography>
              <Typography variant="label" className="text-[9px] text-slate-400 font-mono text-right">Log {data?.logpagesize}B</Typography>
            </div>
          </div>
        </div>

        {/* ── Volume Categorization ── */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Icon name="layers" size="sm" weight={300} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Volume Categorization</span>
            </div>
          }
          bodyClassName="p-0"
          collapsible
        >
          <Table
            columns={[
              {
                header: 'Storage Type',
                accessor: 'type',
                render: (val) => (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${TYPE_BADGE(val)}`}>{val}</span>
                )
              },
              { header: 'Volumes', accessor: 'volume_count', className: 'text-center' },
              { header: 'Used', accessor: 'used_size', render: (val) => <span className="font-mono text-[12px]">{formatSize(val)}</span> },
              { header: 'Free', accessor: 'free_size', render: (val) => <span className="font-mono text-[12px] text-slate-400">{formatSize(val)}</span> },
              { header: 'Total', accessor: 'total_size', render: (val) => <span className="font-mono text-[12px] font-bold">{formatSize(val)}</span> },
              {
                header: 'Utilization',
                accessor: 'pct',
                render: (_, row) => {
                  const pct = parseInt(row.total_size) > 0 ? (parseInt(row.used_size) / parseInt(row.total_size)) * 100 : 0;
                  return (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className={`h-full ${barColor(pct)} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold font-mono w-8 text-right ${usageSeverity(pct)}`}>{pct.toFixed(0)}%</span>
                    </div>
                  );
                }
              }
            ]}
            data={data?.dbinfo || []}
          />
        </Card>

        {/* ── Physical Volume Topology ── */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Icon name="dataset" size="sm" weight={300} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Physical Volume Topology</span>
            </div>
          }
          bodyClassName="p-0"
          collapsible
        >
          <Table
            columns={[
              { header: 'ID', accessor: 'volid', className: 'text-center w-10', render: (val) => <span className="font-mono text-[12px] text-slate-400">{val}</span> },
              {
                header: 'Volume',
                accessor: 'spacename',
                render: (val) => {
                  const name = val?.split(/[/\\]/).pop() || val;
                  return (
                    <div className="flex items-center gap-2">
                      <Icon name="draft" size="sm" weight={300} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <span className="font-mono text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[160px]" title={val}>{name}</span>
                    </div>
                  );
                }
              },
              {
                header: 'Class',
                accessor: 'type',
                render: (val) => (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight border ${TYPE_BADGE(val)}`}>{val}</span>
                )
              },
              {
                header: 'Allocation',
                accessor: 'usedpage',
                render: (val, row) => {
                  const used  = parseInt(val || 0);
                  const total = parseInt(row.totalpage || 0);
                  const pct   = total > 0 ? (used / total) * 100 : 0;
                  return (
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <div className="flex justify-between">
                        <span className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-200">{formatPages(val)}</span>
                        <span className={`text-[10px] font-mono font-bold ${usageSeverity(pct)}`}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className={`h-full ${barColor(pct)} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                }
              },
              { header: 'Total', accessor: 'totalpage', render: (val) => <span className="font-mono text-[12px] text-slate-400">{formatPages(val)}</span>, className: 'text-right' },
              {
                header: 'Path',
                accessor: 'location',
                render: (val) => (
                  <div className="flex items-center gap-1.5 max-w-[260px]">
                    <Icon name="folder" size="sm" weight={300} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    <span className="text-[11px] text-slate-400 font-mono truncate" title={val}>{val}</span>
                  </div>
                )
              }
            ]}
            data={data?.spaceinfo || []}
          />
        </Card>

        {/* ── Bottom Grid: File Space + Distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* File Space Usage */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Icon name="analytics" size="sm" weight={300} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">File Space Usage</span>
              </div>
            }
            bodyClassName="p-0"
          >
            <Table
              columns={[
                {
                  header: 'Type',
                  accessor: 'data_type',
                  render: (val) => (
                    <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 font-bold text-[10px] uppercase tracking-wide">{val}</span>
                  )
                },
                { header: 'Files', accessor: 'file_count', className: 'text-center', render: (val) => <span className="font-mono text-[12px]">{val}</span> },
                { header: 'Used', accessor: 'used_size', className: 'text-right', render: (val) => <span className="font-mono text-[12px] font-bold">{formatPages(val)}</span> },
                { header: 'Reserved', accessor: 'reserved_size', className: 'text-right', render: (val) => <span className="font-mono text-[12px] text-slate-400">{formatPages(val)}</span> },
                { header: 'Total', accessor: 'total_size', className: 'text-right', render: (val) => <span className="font-mono text-[12px] text-slate-400">{formatPages(val)}</span> },
              ]}
              data={data?.fileinfo || []}
            />
          </Card>

          {/* Utilization Distribution */}
          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-xl p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Icon name="pie_chart" size="sm" weight={300} className="text-amber-500" />
              <Typography variant="p" className="text-sm font-semibold text-slate-800 dark:text-slate-100">Utilization Distribution</Typography>
            </div>

            <div className="flex items-center gap-8">
              {/* Donut */}
              <div className="relative w-28 h-28 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="16" className="dark:opacity-20" />
                  {(totals?.pct || 0) > 0 && (
                    <circle
                      cx="50" cy="50" r="38"
                      fill="none"
                      stroke="#ffc107"
                      strokeWidth="16"
                      strokeDasharray={`${(totals?.pct / 100) * 238.76} 238.76`}
                      strokeLinecap="butt"
                      style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-black font-mono leading-none ${usageSeverity(totals?.pct || 0)}`}>{(totals?.pct || 0).toFixed(0)}%</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider mt-0.5">Used</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <Typography variant="label" className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Used</Typography>
                    <Typography variant="label" className="text-[10px] font-black text-slate-700 dark:text-slate-200 font-mono">{formatSize(totals?.used)}</Typography>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-white/10 shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <Typography variant="label" className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Free</Typography>
                    <Typography variant="label" className="text-[10px] font-black text-slate-700 dark:text-slate-200 font-mono">{formatSize(totals?.free)}</Typography>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                  <div className="flex justify-between">
                    <Typography variant="label" className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Total</Typography>
                    <Typography variant="label" className="text-[10px] font-black text-slate-600 dark:text-slate-300 font-mono">{formatSize(totals?.total)}</Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini breakdown bars per category */}
            {data?.dbinfo && data.dbinfo.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                <Typography variant="label" className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">By Category</Typography>
                {data.dbinfo.map((row, i) => {
                  const pct = parseInt(row.total_size) > 0 ? (parseInt(row.used_size) / parseInt(row.total_size)) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 w-28 truncate font-mono">{row.type}</span>
                      <div className="flex-1 h-1 bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                        <div className={`h-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-mono font-bold w-8 text-right ${usageSeverity(pct)}`}>{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
