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
  <div className="relative border border-slate-200 dark:border-slate-800 rounded-sm p-3 pt-4 bg-white dark:bg-slate-900">
    <div className="absolute -top-2.5 left-4 px-2 bg-white dark:bg-[#1e2230] text-[11px] font-black text-slate-400 dark:text-slate-500">
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-5xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Locking Information
          </h3>
          <button 
            onClick={() => dispatch(closeLockInfoModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
          <button 
            onClick={() => setActiveTab('client')}
            className={`px-5 py-2.5 text-[12px] font-bold transition-all relative
              ${activeTab === 'client' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Lock setting/client information
            {activeTab === 'client' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
          <button 
            onClick={() => setActiveTab('object')}
            className={`px-5 py-2.5 text-[12px] font-bold transition-all relative
              ${activeTab === 'object' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            Object lock table
            {activeTab === 'object' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />}
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-sm animate-spin"></div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Refreshing Data...</p>
            </div>
          ) : activeTab === 'client' ? (
            <>
              {/* Server Settings */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pl-1 italic">The lock setting for the server</div>
                <div className="p-3.5 border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 rounded-lg flex gap-10 text-[13px] shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">Lock escalation :</span>
                    <span className="text-slate-900 dark:text-white font-bold">{settings.esc || '100000'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">Run deadlock interval :</span>
                    <span className="text-slate-900 dark:text-white font-bold">{settings.dinterval || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Clients Table */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pl-1 italic">Clients currently</div>
                <div className="border border-slate-200 dark:border-slate-800/60 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] border-collapse whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-2">Index</th>
                          <th className="px-4 py-2">Pname</th>
                          <th className="px-4 py-2">Uid</th>
                          <th className="px-4 py-2">Host</th>
                          <th className="px-4 py-2">Pid</th>
                          <th className="px-4 py-2">Isolation level</th>
                          <th className="px-4 py-2">Time out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {transactions.length > 0 ? transactions.map((client, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                            <td className="px-4 py-1.5">{client.index}</td>
                            <td className="px-4 py-1.5 font-bold text-blue-600 dark:text-blue-400">{client.pname || ''}</td>
                            <td className="px-4 py-1.5">{client['@uid'] || ''}</td>
                            <td className="px-4 py-1.5 text-slate-500 dark:text-slate-400">{client.host || ''}</td>
                            <td className="px-4 py-1.5 font-mono">{client.pid}</td>
                            <td className="px-4 py-1.5">{client.isolevel}</td>
                            <td className="px-4 py-1.5">{client.timeout}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" className="px-4 py-12 text-center text-slate-400 italic">No active clients found</td>
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
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pl-1 italic">The contents of the object lock table</div>
                <div className="p-3.5 border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 rounded-lg text-[13px] space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-medium w-[300px]">Current number of objects which are locked :</span>
                    <span className="text-slate-900 dark:text-white font-bold">{settings.numlocked || 0}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-medium w-[300px]">Current number of objects which are allocated :</span>
                    <span className="text-slate-900 dark:text-white font-bold">{settings.numallocated || 5000}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-medium w-[300px]">Current size of objects which are allocated :</span>
                    <span className="text-slate-900 dark:text-white font-bold font-mono">{settings.sizelock || '1M'}</span>
                  </div>
                </div>
              </div>

              {/* Object Lock Detail Table */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pl-1 italic">Locked Objects Details</div>
                <div className="border border-slate-200 dark:border-slate-800/60 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="overflow-x-auto h-[300px]">
                    <table className="w-full text-left text-[13px] border-collapse whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-2">Oid</th>
                          <th className="px-4 py-2">Object type</th>
                          <th className="px-4 py-2">Num holders</th>
                          <th className="px-4 py-2">Num blocked</th>
                          <th className="px-4 py-2">Num waiters</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {/* Empty state */}
                        <tr>
                          <td colSpan="5" className="px-4 py-24 text-center text-slate-400 italic">No locking data available</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button className="h-[28px] px-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] rounded border border-slate-200 dark:border-slate-700 transition-all font-bold">
                      View Detail
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50 font-sans">
          <button 
            onClick={() => dispatch(closeLockInfoModal())}
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={fetchLockInfo}
            disabled={loading}
            className="h-[34px] px-8 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-sm animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Refresh Information</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
