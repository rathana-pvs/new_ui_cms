import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeTransactionInfoModal, openKillTransactionModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import KillTransactionModal from './KillTransactionModal';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Typography } from '../../../components/ds/foundation/Typography';

export default function TransactionInfoModal() {
  const dispatch = useDispatch();
  const { isTransactionInfoModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTranIndex, setSelectedTranIndex] = useState(null);

  const fetchTransactionInfo = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        dbuser: 'dba',
        dbpasswd: ''
      };
      const response = await databaseApi.getTransactionInfo(selectedHostUid, selectedDatabase, payload);
      const tranList = response?.transactioninfo?.[0]?.transaction || [];
      setTransactions(tranList);
    } catch (err) {
      console.error('Failed to fetch transaction info:', err);
      setError(err.response?.data?.note || err.response?.data?.message || 'Failed to fetch transaction information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTransactionInfoModalOpen) {
      fetchTransactionInfo();
      setSelectedTranIndex(null);
    }
  }, [isTransactionInfoModalOpen, selectedHostUid, selectedDatabase]);

  if (!isTransactionInfoModalOpen) return null;

  const handleOpenKillModal = () => {
    const selectedTran = transactions.find(t => t.tranindex === selectedTranIndex);
    if (selectedTran) {
      dispatch(openKillTransactionModal(selectedTran));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-4xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={loading && transactions.length > 0} 
            title="Refreshing data" 
            subtitle="Fetching latest transaction records..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={fetchTransactionInfo}
          onClose={() => setError(null)}
        />
        
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <Icon name="swap_horiz" size="sm" weight={300} className="text-bk-yellow text-xl" />
            </div>
            <div>
              <Typography variant="h3" className="text-sm font-medium text-slate-900 dark:text-white leading-none">Transaction monitor</Typography>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeTransactionInfoModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <Icon name="close" size="sm" weight={300} className="text-lg group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Typography variant="label" className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
                Database: <Typography variant="span" className="text-bk-yellow">{selectedDatabase}</Typography>
              </Typography>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/30">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50/80 dark:bg-bk-main/50 text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3"><Typography variant="label">Transaction idx</Typography></th>
                      <th className="px-4 py-3"><Typography variant="label">User session</Typography></th>
                      <th className="px-4 py-3"><Typography variant="label">Host addr</Typography></th>
                      <th className="px-4 py-3 text-center"><Typography variant="label">PID</Typography></th>
                      <th className="px-4 py-3"><Typography variant="label">Program</Typography></th>
                      <th className="px-4 py-3 text-right"><Typography variant="label">Exec time</Typography></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {loading && transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-16">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                             <Typography variant="span" className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Syncing...</Typography>
                          </div>
                        </td>
                      </tr>
                    ) : transactions.length > 0 ? (
                      transactions.map((tran, idx) => {
                        const tranIndex = tran.tranindex;
                        const isSelected = selectedTranIndex === tranIndex;
                        const isActive = String(tranIndex).includes('ACTIVE');
                        
                        return (
                          <tr 
                            key={idx} 
                            className={`cursor-pointer transition-all ${isSelected ? 'bg-bk-yellow/5 dark:bg-bk-yellow/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            onClick={() => setSelectedTranIndex(tranIndex)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {isActive ? (
                                  <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                                  </div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                )}
                                <Typography variant="span" className={`font-mono text-[11px] ${isSelected ? 'text-bk-yellow font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {tranIndex}
                                </Typography>
                              </div>
                            </td>
                            <td className={`px-4 py-3 font-medium ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                              <Typography variant="span">{tran['@user'] || '-'}</Typography>
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                              <Typography variant="span">{tran.host}</Typography>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Typography variant="span" className="bg-slate-100 dark:bg-bk-main/40 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5">
                                {tran.pid}
                              </Typography>
                            </td>
                            <td className="px-4 py-3 text-[11px] font-medium text-slate-500 dark:text-slate-500 italic max-w-[150px] truncate">
                              <Typography variant="span">{tran.program}</Typography>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Typography variant="span" className={`font-mono text-[11px] ${parseFloat(tran.query_time) > 5 ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                                {tran.query_time}s
                              </Typography>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-20 text-center">
                          <div className="flex flex-col items-center justify-center gap-3 opacity-30 grayscale items-center">
                            <Icon name="inventory_2" size="sm" weight={300} className="text-4xl" />
                             <Typography variant="p" className="text-[10px] font-medium tracking-wide">No active transactions</Typography>
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

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex items-center justify-between border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              disabled={!selectedTranIndex || loading}
              onClick={handleOpenKillModal}
              className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-[10px] font-medium tracking-wide rounded shadow-sm transition-all flex items-center gap-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-left"
            >
              <Icon name="cancel" size="sm" weight={300} />
              Kill process
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left"
              onClick={() => dispatch(closeTransactionInfoModal())}
            >
              Discard
            </button>
            <button 
              onClick={fetchTransactionInfo}
              disabled={loading}
              className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50 text-left"
            >
              {loading ? (
                <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
              ) : (
                <>
                  <Icon name="refresh" size="sm" weight={300} />
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <KillTransactionModal onTransactionKilled={fetchTransactionInfo} />
    </div>
  );
}
