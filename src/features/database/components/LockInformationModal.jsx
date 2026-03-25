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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-4xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

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
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <Icon name="lock" size="sm" weight={300} className="text-bk-yellow text-xl" />
            </div>
            <div>
              <Typography variant="h3" className="text-sm font-medium text-slate-900 dark:text-white leading-none">Locking system monitor</Typography>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeLockInfoModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <Icon name="close" size="sm" weight={300} className="text-lg group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Tabs Control */}
        <div className="flex bg-slate-50/50 dark:bg-bk-main/20 px-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          {[
            { id: 'client', label: 'Client / Session Info' },
            { id: 'object', label: 'Object lock status' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-[10px] font-medium tracking-wide transition-all border-b-2 relative
                ${activeTab === tab.id 
                  ? 'text-bk-yellow border-bk-yellow' 
                  : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <Typography variant="label">{tab.label}</Typography>
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-bk-yellow/5 animate-pulse pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {loading && transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 min-h-[400px]">
              <div className="w-6 h-6 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
              <Typography variant="p" className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Syncing diagnostics...</Typography>
            </div>
          ) : activeTab === 'client' ? (
            <div className="space-y-6">
              {/* Server Context */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Typography variant="label" className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Server parameters</Typography>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-xl flex items-center justify-between">
                    <Typography variant="label" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Lock escalation</Typography>
                    <Typography variant="span" className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">{settings.esc || '100,000'}</Typography>
                  </div>
                  <div className="p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-xl flex items-center justify-between">
                    <Typography variant="label" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Deadlock interval</Typography>
                    <Typography variant="span" className="text-sm font-mono font-medium text-slate-700 dark:text-slate-200">{settings.dinterval || '0'} <Typography variant="span" className="text-[10px] opacity-60">ms</Typography></Typography>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Typography variant="label" className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Active client sessions</Typography>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/30">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50/80 dark:bg-bk-main/50 text-[10px] font-medium text-slate-400 tracking-wide border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2.5"><Typography variant="label">Idx</Typography></th>
                          <th className="px-3 py-2.5"><Typography variant="label">Pname</Typography></th>
                          <th className="px-3 py-2.5"><Typography variant="label">UID</Typography></th>
                          <th className="px-3 py-2.5"><Typography variant="label">Host address</Typography></th>
                          <th className="px-3 py-2.5 text-center"><Typography variant="label">PID</Typography></th>
                          <th className="px-3 py-2.5"><Typography variant="label">Isolation</Typography></th>
                          <th className="px-3 py-2.5 text-right"><Typography variant="label">Timeout</Typography></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[10px]">
                        {transactions.length > 0 ? transactions.map((client, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                            <td className="px-3 py-2"><Typography variant="span" className="text-bk-yellow font-medium">{client.index}</Typography></td>
                            <td className="px-3 py-2"><Typography variant="span" className="font-sans font-medium text-slate-700 dark:text-slate-300">{client.pname || '-'}</Typography></td>
                            <td className="px-3 py-2"><Typography variant="span" className="text-slate-400">{client['@uid'] || '-'}</Typography></td>
                            <td className="px-3 py-2"><Typography variant="span" className="text-slate-400">{client.host || '-'}</Typography></td>
                            <td className="px-3 py-2 text-center">
                              <Typography variant="span" className="bg-slate-100 dark:bg-bk-main/40 px-1.5 py-0.5 rounded text-[10px] border border-slate-200/50 dark:border-white/5">{client.pid}</Typography>
                            </td>
                            <td className="px-3 py-2"><Typography variant="span" className="text-slate-400">{client.isolevel}</Typography></td>
                            <td className="px-3 py-2 text-right"><Typography variant="span" className="text-slate-400">{client.timeout} <Typography variant="span" className="opacity-50 text-[9px]">sec</Typography></Typography></td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" className="px-3 py-16 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 opacity-30 grayscale">
                                <Icon name="group_off" size="sm" weight={300} className="text-3xl" />
                                <Typography variant="p" className="text-[10px] font-medium tracking-wide">No active sessions</Typography>
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
          ) : (
            <div className="space-y-6">
              {/* Object Stats */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Typography variant="label" className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Lock usage statistics</Typography>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Locked objects', value: settings.numlocked || 0, unit: 'count' },
                    { label: 'Allocated limit', value: settings.numallocated || 5000, unit: 'count' },
                    { label: 'Storage footprint', value: settings.sizelock || '1M', unit: 'B' }
                  ].map(stat => (
                    <div key={stat.label} className="p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-xl space-y-1">
                      <Typography variant="label" className="text-[9px] font-medium text-slate-400 tracking-wide">{stat.label}</Typography>
                      <div className="flex items-baseline gap-1">
                        <Typography variant="span" className="text-lg font-mono font-medium text-slate-700 dark:text-slate-200 tracking-tighter">{stat.value}</Typography>
                        <Typography variant="span" className="text-[10px] font-medium text-slate-400 opacity-60">{stat.unit}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Object Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Typography variant="label" className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Object level details</Typography>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/30 relative">
                  <div className="overflow-x-auto min-h-[200px] custom-scrollbar">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50/80 dark:bg-bk-main/50 text-[10px] font-medium text-slate-400 tracking-wide border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2.5"><Typography variant="label">Object ID (OID)</Typography></th>
                          <th className="px-3 py-2.5"><Typography variant="label">Structure type</Typography></th>
                          <th className="px-3 py-2.5 text-center"><Typography variant="label">Holders</Typography></th>
                          <th className="px-3 py-2.5 text-center"><Typography variant="label">Blocked</Typography></th>
                          <th className="px-3 py-2.5 text-right"><Typography variant="label">Waiters</Typography></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan="5" className="px-3 py-24 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 opacity-30 grayscale">
                              <Icon name="key_off" size="sm" weight={300} className="text-3xl" />
                                <Typography variant="p" className="text-[10px] font-medium tracking-wide">No lock contention discovered</Typography>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <button className="px-3 py-1 bg-bk-side dark:bg-bk-main text-white text-[10px] font-medium tracking-wide rounded border border-white/10 hover:bg-bk-main transition-all">
                      <Typography variant="p">Detailed telemetry</Typography>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left"
            onClick={() => dispatch(closeLockInfoModal())}
          >
            Discard
          </button>
          <button 
            onClick={fetchLockInfo}
            disabled={loading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50 text-left"
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <Icon name="refresh" size="sm" weight={300} />
                <span>Refresh stats</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
