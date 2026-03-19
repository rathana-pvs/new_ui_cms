import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeKillTransactionModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import SelectField from '../../../components/common/SelectField';

export default function KillTransactionModal({ onTransactionKilled }) {
  const dispatch = useDispatch();
  const { isKillTransactionModalOpen, killTransactionData, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [loading, setLoading] = useState(false);
  const [killType, setKillType] = useState('i'); // Default: Kill selected only

  useEffect(() => {
    if (isKillTransactionModalOpen) {
      setKillType('i');
    }
  }, [isKillTransactionModalOpen]);

  if (!isKillTransactionModalOpen || !killTransactionData) return null;

  const handleKill = async () => {
    if (!selectedHostUid) return;

    setLoading(true);
    try {
      const idx = killTransactionData.tranindex?.match(/\d+/)?.[0] || '';
      const payload = {
        dbname: selectedDatabase,
        type: killType,
        parameter: idx
      };

      const response = await databaseApi.killTransaction(selectedHostUid, selectedDatabase, payload);

      if (response.status === 201 || response.status === 200 || response.success) {
        dispatch(closeKillTransactionModal());
        if (onTransactionKilled) onTransactionKilled();
      }
    } catch (err) {
      console.error('Failed to kill transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[540px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent - Danger */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/60"></div>

        <LoadingOverlay
          isVisible={loading}
          title="Force terminating"
          subtitle="Aborting transaction handle and releasing locks..."
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <span className="material-symbols-outlined text-rose-500 text-xl font-medium">cancel</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white leading-none">Terminate transaction</h3>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeKillTransactionModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Transaction context</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Username</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default">
                  {killTransactionData['@user'] || '-'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Source host</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default">
                  {killTransactionData.host || '-'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Process ID</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded font-mono text-[12px] font-medium text-slate-400 truncate cursor-default">
                  {killTransactionData.pid || '-'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Application</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default" title={killTransactionData.program}>
                  {killTransactionData.program || '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Termination scope</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="relative">
              <SelectField
                value={killType}
                onChange={(val) => setKillType(val)}
                options={[
                  { value: 'i', label: 'Kill only the selected transaction handle' },
                  { value: 'h', label: 'Kill all transactions from this client host' },
                  { value: 'p', label: 'Kill all transactions from this program name' }
                ]}
                triggerClassName="focus:border-rose-500/50"
              />
            </div>
            <p className="px-1 text-[10px] text-slate-400 italic">This action will immediately abort the database connection and roll back any uncommitted changes.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeKillTransactionModal())}
          >
            Discard
          </button>
          <button
            onClick={handleKill}
            disabled={loading}
            className="px-6 py-1.5 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-[11px] font-medium tracking-wide rounded border border-rose-500/50 shadow-md shadow-rose-500/10 transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
          >
             {loading ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] font-medium">bolt</span>
                <span>Kill job</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
