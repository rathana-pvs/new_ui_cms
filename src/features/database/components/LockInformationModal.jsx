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

const GroupBox = ({ label, children }) => (
  <div className="relative border border-slate-200 dark:border-slate-800 rounded-lg p-5 pt-4 bg-white dark:bg-slate-900/50">
    <div className="absolute -top-2.5 left-4 px-2 bg-white dark:bg-[#1e2230] text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      {label}
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Locking Information
          </h3>
          <button 
            onClick={() => dispatch(closeLockInfoModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 dark:bg-[#1e2230] px-4">
          <button 
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2 text-[13px] font-bold transition-all border-b-2 
              ${activeTab === 'client' 
                ? 'text-primary border-primary dark:text-white dark:border-primary' 
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            Lock setting/client information
          </button>
          <button 
            onClick={() => setActiveTab('object')}
            className={`px-4 py-2 text-[13px] font-bold transition-all border-b-2 
              ${activeTab === 'object' 
                ? 'text-primary border-primary dark:text-white dark:border-primary' 
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            Object lock table
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Refreshing Data...</p>
            </div>
          ) : activeTab === 'client' ? (
            <>
              {/* Server Settings */}
              <div className="space-y-1">
                <div className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mb-1">The lock setting for the server</div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] rounded flex gap-4 text-[13px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1">
                    <span>Lock escalation:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{settings.esc || '100000'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Run deadlock interval:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{settings.dinterval || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Clients Table */}
              <div className="space-y-1">
                <div className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mb-1">Clients currently</div>
                <div className="border border-slate-200 dark:border-slate-800 rounded min-h-[300px] flex flex-col bg-white dark:bg-[#1e2230]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <thead className="text-slate-500 dark:text-slate-400 font-bold bg-slate-50/50 dark:bg-transparent">
                        <tr>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Index</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Pname</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Uid</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Host</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Pid</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Isolation level</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Time out</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700 dark:text-slate-300">
                        {transactions.length > 0 ? transactions.map((client, idx) => (
                          <tr key={idx} className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-b border-slate-50 dark:border-transparent">
                            <td className="px-3 py-1.5">{client.index}</td>
                            <td className="px-3 py-1.5 font-medium">{client.pname || ''}</td>
                            <td className="px-3 py-1.5">{client['@uid'] || ''}</td>
                            <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{client.host || ''}</td>
                            <td className="px-3 py-1.5 font-mono">{client.pid}</td>
                            <td className="px-3 py-1.5">{client.isolevel}</td>
                            <td className="px-3 py-1.5">{client.timeout}</td>
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
              <div className="space-y-1">
                <div className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mb-1">The contents of the object lock table</div>
                <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] rounded text-[13px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Current number of objects which are locked = <span className="text-slate-900 dark:text-white font-bold">{settings.numlocked || 0}</span></div>
                  <div>Current number of objects which are allocated = <span className="text-slate-900 dark:text-white font-bold">{settings.numallocated || 5000}</span></div>
                  <div>Current size of objects which are allocated = <span className="text-slate-900 dark:text-white font-bold">{settings.sizelock || '1M'}</span></div>
                </div>
              </div>

              {/* Object Lock Detail Table */}
              <div className="space-y-1">
                <div className="text-[13px] text-slate-500 dark:text-slate-300 font-medium mb-1">Clients currently</div>
                <div className="border border-slate-200 dark:border-slate-800 rounded min-h-[300px] flex flex-col bg-white dark:bg-[#1e2230] relative p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px] border-collapse text-slate-700 dark:text-slate-300">
                      <thead className="text-slate-500 dark:text-slate-400 font-bold bg-slate-50/50 dark:bg-transparent">
                        <tr>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Oid</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Object type</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Num holders</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Num blocked</th>
                          <th className="px-3 py-2 border-b border-slate-100 dark:border-transparent">Num waiters</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Empty/Placeholder state to match image */}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-auto flex justify-end">
                    <button className="px-6 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[12px] rounded border border-slate-300 dark:border-slate-700 transition-colors font-bold">
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button 
            onClick={() => dispatch(closeLockInfoModal())}
            className="px-8 py-1.5 text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={fetchLockInfo}
            disabled={loading}
            className="px-8 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm rounded shadow transition-all flex items-center justify-center gap-2 min-w-[100px] font-bold"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
