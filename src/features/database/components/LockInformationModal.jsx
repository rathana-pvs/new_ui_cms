import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLockInfoModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';

const TabButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-[13px] font-bold transition-all border-b-2 
      ${active 
        ? 'text-primary border-primary bg-primary/5' 
        : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
  >
    {label}
  </button>
);



export default function LockInformationModal() {
  const dispatch = useDispatch();
  const { isLockInfoModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'object'
  const [settings, setSettings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLockInfo = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-4xl rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-[13px] font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
            Locking Information
          </h3>
          <button 
            onClick={() => dispatch(closeLockInfoModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 dark:bg-[#1e2230] px-4 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('client')}
            className={`px-4 py-1.5 text-[11px] font-normal transition-all border-b-2 
              ${activeTab === 'client' 
                ? 'text-primary border-primary dark:text-white dark:border-primary' 
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            Lock setting/client information
          </button>
          <button 
            onClick={() => setActiveTab('object')}
            className={`px-4 py-1.5 text-[11px] font-normal transition-all border-b-2 
              ${activeTab === 'object' 
                ? 'text-primary border-primary dark:text-white dark:border-primary' 
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            Object lock table
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Refreshing Data...</p>
            </div>
          ) : activeTab === 'client' ? (
            <>
              {/* Server Settings */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 mt-2">
                <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                    Server Lock Settings
                  </span>
                </div>
                <div className="flex justify-center gap-8 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-normal text-slate-400">Lock escalation:</span>
                    <span className="text-slate-700 dark:text-slate-200 font-normal font-mono">{settings.esc || '100,000'}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-100 dark:bg-slate-800/50 self-center"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-normal text-slate-400">Run deadlock interval:</span>
                    <span className="text-slate-700 dark:text-slate-200 font-normal font-mono">{settings.dinterval || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Clients Table */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 mt-2">
                <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                    Current Clients
                  </span>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded min-h-[300px] flex flex-col bg-slate-50/10 dark:bg-slate-900/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight uppercase">
                        <tr>
                          <th className="px-3 py-1.5 font-medium">Index</th>
                          <th className="px-3 py-1.5 font-medium">Pname</th>
                          <th className="px-3 py-1.5 font-medium">Uid</th>
                          <th className="px-3 py-1.5 font-medium">Host</th>
                          <th className="px-3 py-1.5 font-medium">Pid</th>
                          <th className="px-3 py-1.5 font-medium">Isolation level</th>
                          <th className="px-3 py-1.5 font-medium">Time out</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-600 dark:text-slate-400 divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.length > 0 ? transactions.map((client, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-3 py-1">{client.index}</td>
                            <td className="px-3 py-1 font-normal text-slate-700 dark:text-slate-300">{client.pname || ''}</td>
                            <td className="px-3 py-1">{client['@uid'] || ''}</td>
                            <td className="px-3 py-1 text-slate-400 dark:text-slate-500">{client.host || ''}</td>
                            <td className="px-3 py-1 font-mono text-[10px]">{client.pid}</td>
                            <td className="px-3 py-1">{client.isolevel}</td>
                            <td className="px-3 py-1">{client.timeout}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" className="px-3 py-20 text-center text-slate-400 italic">No active clients found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Object Lock Table Content Information */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 mt-2">
                <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                    Object Lock Statistics
                  </span>
                </div>
                <div className="space-y-2.5 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Current number of objects which are locked</span>
                    <span className="text-slate-700 dark:text-slate-300 font-normal font-mono text-[12px]">{settings.numlocked || 0}</span>
                  </div>
                  <div className="h-px bg-slate-50 dark:bg-slate-800/50"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Current number of objects which are allocated</span>
                    <span className="text-slate-700 dark:text-slate-300 font-normal font-mono text-[12px]">{settings.numallocated || 5000}</span>
                  </div>
                  <div className="h-px bg-slate-50 dark:bg-slate-800/50"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">Current size of objects which are allocated</span>
                    <span className="text-slate-700 dark:text-slate-300 font-normal font-mono text-[12px]">{settings.sizelock || '1M'}</span>
                  </div>
                </div>
              </div>

              {/* Object Lock Detail Table */}
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 mt-4">
                <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                    Object Lock Detail
                  </span>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded min-h-[300px] flex flex-col bg-slate-50/10 dark:bg-slate-900/10 overflow-hidden relative">
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight uppercase">
                        <tr>
                          <th className="px-3 py-1.5 font-medium">Oid</th>
                          <th className="px-3 py-1.5 font-medium">Object type</th>
                          <th className="px-3 py-1.5 font-medium">Num holders</th>
                          <th className="px-3 py-1.5 font-medium">Num blocked</th>
                          <th className="px-3 py-1.5 font-medium">Num waiters</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty/Placeholder state to match image */}
                        <tr>
                          <td colSpan="5" className="px-3 py-20 text-center text-slate-400 italic">No locking details available</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2 flex justify-end bg-white/50 dark:bg-[#1e2230]/50 border-t border-slate-100 dark:border-slate-800">
                    <button className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] rounded border border-slate-200 dark:border-slate-700 transition-colors font-normal">
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            onClick={() => dispatch(closeLockInfoModal())}
            className="px-6 py-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-normal"
          >
            Cancel
          </button>
          <button 
            onClick={fetchLockInfo}
            disabled={loading}
            className="px-6 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-xs rounded shadow transition-all flex items-center justify-center gap-2 min-w-[100px] font-normal"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
