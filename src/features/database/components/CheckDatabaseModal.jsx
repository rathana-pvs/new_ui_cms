import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCheckDatabaseModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { showStatusModal } from '../../layout/layoutSlice';

export default function CheckDatabaseModal() {
  const dispatch = useDispatch();
  const { isCheckDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  const [repair, setRepair] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isCheckDatabaseModalOpen) return null;

  const handleCheck = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setLoading(true);
    try {
      const payload = {
        repairdb: repair ? 'y' : 'n'
      };
      const response = await databaseApi.checkDatabase(selectedHostUid, selectedDatabase, payload);
      
      dispatch(closeCheckDatabaseModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Check Complete',
        message: response.note || 'Database check completed successfully.'
      }));
    } catch (err) {
      dispatch(showStatusModal({
        type: 'error',
        title: 'Check Failed',
        message: err.response?.data?.message || err.message || 'An error occurred during database check.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Check Database
          </h3>
          <button 
            onClick={() => dispatch(closeCheckDatabaseModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5 bg-white dark:bg-[#1e2230]">
          <div className="flex items-center gap-4">
            <label className="w-[120px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">Database :</label>
            <div className="flex-1 h-[34px] px-3 rounded-md bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/60 text-[13px] font-bold text-slate-700 dark:text-white flex items-center shadow-sm">
              {selectedDatabase}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pl-1">Description</div>
            <div className="p-3.5 bg-blue-50/20 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 rounded-lg">
              <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                Verified a database. If inconsistencies are found, please contact CUBRID Support to help interpret the output and address any indicated problem so that it will not reoccur.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-fit select-none ml-[120px]">
            <input 
              type="checkbox" 
              checked={repair}
              onChange={(e) => setRepair(e.target.checked)}
              className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]"
            />
            <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Repaired when inconsistent is found
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50 font-sans">
          <button 
            onClick={() => dispatch(closeCheckDatabaseModal())}
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={handleCheck}
            disabled={loading}
            className="h-[34px] px-8 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-sm animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Check Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
