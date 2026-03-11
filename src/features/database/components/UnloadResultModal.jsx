import { useDispatch, useSelector } from 'react-redux';
import { closeUnloadResultModal } from '../databaseSlice';

export default function UnloadResultModal() {
  const dispatch = useDispatch();
  const { isUnloadResultModalOpen, unloadResultData } = useSelector((state) => state.database);

  if (!isUnloadResultModalOpen) return null;

  // Transform object into array for the table
  // The structure from user is { data: [ { table: "info", ... } ], ... }
  const resultObj = unloadResultData?.[0] || {};
  const rows = Object.entries(resultObj).map(([tableName, stats]) => ({
    tableName,
    stats
  }));

  // The new structure expects `listData` with `classname`, `totalinstance`, `successinstance`
  // This transformation is based on the new table headers and data structure implied by the edit.
  // Assuming `unloadResultData` might now contain an array of objects like:
  // [{ classname: "User", totalinstance: 100, successinstance: 95 }, ...]
  const listData = unloadResultData || [];


  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white flex items-center gap-2">
            Unload Detail Result
          </h3>
          <button 
            onClick={() => dispatch(closeUnloadResultModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          <div className="border border-slate-200 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2">CLASS NAME</th>
                  <th className="px-4 py-2 text-center">TOTAL INSTANCE</th>
                  <th className="px-4 py-2 text-center">SUCCESS INSTANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {listData.length > 0 ? listData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-2 font-bold text-blue-600 dark:text-blue-400 tracking-tight">{row.classname}</td>
                    <td className="px-4 py-2 text-center font-mono">{row.totalinstance}</td>
                    <td className="px-4 py-2 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">{row.successinstance}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-12 text-center text-slate-400 italic">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50 font-sans">
          <button 
            onClick={() => dispatch(closeUnloadResultModal())}
            className="h-[34px] px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Finished</span>
          </button>
        </div>
      </div>
    </div>
  );
}
