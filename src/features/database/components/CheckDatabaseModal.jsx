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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-md rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-[13px] font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            Check Database
          </h3>
          <button 
            onClick={() => dispatch(closeCheckDatabaseModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 bg-white dark:bg-[#1e2230]">
          <div className="flex items-center gap-2">
            <label className="w-32 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Database Name :</label>
            <div className="flex-1 h-8 flex items-center px-2 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-lg text-[12px] font-normal text-slate-600 dark:text-slate-300">
              {selectedDatabase}
            </div>
          </div>

          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 pt-4 mt-2">
             <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
               <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                 Description & Options
               </span>
             </div>

             <div className="space-y-3">
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-normal italic">
                    Verified a database. If inconsistencies are found, please contact CUBRID Support to help interpret the output and address any indicated problem.
                  </p>
                </div>

                <label className="flex items-center gap-2 p-2 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={repair}
                      onChange={(e) => setRepair(e.target.checked)}
                      className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400 transition-colors">
                    Repaired when inconsistency is found
                  </span>
                </label>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            onClick={() => dispatch(closeCheckDatabaseModal())}
            className="px-6 py-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-normal"
          >
            Cancel
          </button>
          <button 
            onClick={handleCheck}
            disabled={loading}
            className="px-6 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-xs rounded shadow transition-all flex items-center justify-center gap-2 min-w-[100px] font-normal disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Check Database'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
