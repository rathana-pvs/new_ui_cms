import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLockInfoModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Typography } from '../../../components/ds/foundation/Typography';

export default function LockInformationModal() {
  const dispatch = useDispatch();
  const { isLockInfoModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'object'
  const [settings, setSettings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLockInfo = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
    setError(null);
    try {
      const response = await databaseApi.getLockInfo(selectedHostUid, selectedDatabase);
      const resultData = response;
      
      if (resultData && resultData.lockinfo && resultData.lockinfo.length > 0) {
        const { dinterval, esc, lot, transaction } = resultData.lockinfo[0];
        setSettings({
          dinterval,
          esc,
          ...(lot?.[0] || {})
        });
        setTransactions(transaction || []);
      }
    } catch (err) {
      console.error('Failed to fetch lock info:', err);
      setError(err.response?.data?.note || err.response?.data?.message || 'Failed to retrieve locking information. The database might be under high contention.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLockInfoModalOpen) {
      fetchLockInfo();
    }
  }, [isLockInfoModalOpen, selectedHostUid, selectedDatabase]);

  if (!isLockInfoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(closeLockInfoModal())}
      />

      <div className="relative bg-white dark:bg-background-dark w-full max-w-4xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-white/[0.08] overflow-hidden transform transition-all flex flex-col max-h-[90vh] text-left animate-in zoom-in-95 duration-200">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500/60"></div>

        <LoadingOverlay 
            isVisible={loading && transactions.length > 0} 
            title="Refreshing lock data" 
            subtitle="Syncing client and object statistics..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={fetchLockInfo}
          onClose={() => setError(null)}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Icon name="lock" size="sm" weight={300} className="text-amber-500" />
            </div>
            <div>
              <Typography variant="h3" className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">Locking System Monitor</Typography>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeLockInfoModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <Icon name="close" size="sm" weight={300} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Tabs Control */}
        <div className="flex bg-slate-50/20 dark:bg-white/[0.01] px-2 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
          {[
            { id: 'client', label: 'Client / Session Info' },
            { id: 'object', label: 'Object Lock Status' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 relative active:scale-95
                ${activeTab === tab.id 
                  ? 'text-amber-500 border-amber-500' 
                  : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none rounded-t-lg"></div>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {loading && transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 min-h-[400px]">
              <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Syncing Diagnostics...</span>
            </div>
          ) : activeTab === 'client' ? (
            <div className="animate-in fade-in duration-300">
              <div className="space-y-6">
                {/* Server Context */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Server Parameters</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06]"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-xl flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lock Escalation</span>
                      <span className="text-[13px] font-mono font-bold text-slate-700 dark:text-slate-200">{settings.esc || '100,000'}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-xl flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deadlock Interval</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[13px] font-mono font-bold text-slate-700 dark:text-slate-200">{settings.dinterval || '0'}</span>
                        <span className="text-[10px] font-bold text-slate-400">ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Active Client Sessions</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06]"></div>
                  </div>

                  <div className="border border-slate-200 dark:border-white/[0.08] rounded-lg overflow-hidden bg-white dark:bg-white/[0.01]">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-white/[0.03] text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06]">
                          <tr>
                            <th className="px-4 py-3">Idx</th>
                            <th className="px-4 py-3">Pname</th>
                            <th className="px-4 py-3">UID</th>
                            <th className="px-4 py-3">Host Address</th>
                            <th className="px-4 py-3 text-center">PID</th>
                            <th className="px-4 py-3">Isolation</th>
                            <th className="px-4 py-3 text-right">Timeout</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono text-[12px]">
                          {transactions.length > 0 ? transactions.map((client, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                              <td className="px-4 py-2.5 font-bold text-amber-500">{client.index}</td>
                              <td className="px-4 py-2.5">
                                <span className="font-sans font-semibold text-slate-700 dark:text-slate-200">{client.pname || '-'}</span>
                              </td>
                              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{client['@uid'] || '-'}</td>
                              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{client.host || '-'}</td>
                              <td className="px-4 py-2.5 text-center">
                                <span className="bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 rounded text-[11px] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300">
                                  {client.pid}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{client.isolevel}</td>
                              <td className="px-4 py-2.5 text-right">
                                <span className="text-slate-600 dark:text-slate-300 font-semibold">{client.timeout}</span>
                                <span className="text-[10px] text-slate-400 ml-1 font-bold">sec</span>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="7" className="px-4 py-16 text-center">
                                <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                                  <Icon name="group_off" size="md" weight={100} className="text-4xl" />
                                  <span className="text-[11px] font-bold uppercase tracking-widest">No Active Sessions</span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="space-y-6">
                {/* Object Stats */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Lock Usage Statistics</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06]"></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Locked Objects', value: settings.numlocked || 0, unit: 'items' },
                      { label: 'Allocated Limit', value: settings.numallocated || 5000, unit: 'max' },
                      { label: 'Memory Usage', value: settings.sizelock || '1M', unit: 'bytes' }
                    ].map(stat => (
                      <div key={stat.label} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.06] rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{stat.label}</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-mono font-bold text-slate-700 dark:text-slate-100">{stat.value}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Object Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Object Level Details</span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.06]"></div>
                  </div>

                  <div className="border border-slate-200 dark:border-white/[0.08] rounded-lg overflow-hidden bg-white dark:bg-white/[0.01]">
                    <div className="overflow-x-auto min-h-[220px] custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-white/[0.03] text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.06]">
                          <tr>
                            <th className="px-4 py-3">Object ID (OID)</th>
                            <th className="px-4 py-3">Structure Type</th>
                            <th className="px-4 py-3 text-center">Holders</th>
                            <th className="px-4 py-3 text-center">Blocked</th>
                            <th className="px-4 py-3 text-right">Waiters</th>
                          </tr>
                        </thead>
                        <tbody className="text-[12px] font-mono">
                          <tr>
                            <td colSpan="5" className="px-4 py-24 text-center">
                              <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                                <Icon name="key_off" size="md" weight={100} className="text-4xl" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">No Lock Contention</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50/20 dark:bg-white/[0.01] flex justify-end">
                      <button className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-white text-[11px] font-bold uppercase tracking-widest rounded hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10">
                        Detailed Telemetry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/[0.03] backdrop-blur-md flex justify-end gap-3 border-t border-slate-100 dark:border-white/[0.06] shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08] rounded-lg hover:bg-white dark:hover:bg-white/[0.04] hover:text-slate-700 dark:hover:text-slate-200 transition-all active:scale-95"
            onClick={() => dispatch(closeLockInfoModal())}
          >
            Discard
          </button>
          <button 
            onClick={fetchLockInfo}
            disabled={loading}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Icon name="refresh" size="sm" weight={400} />
                <span>Refresh Stats</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
