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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-2xl rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Unload Detail Result
          </h3>
          <button 
            onClick={() => dispatch(closeUnloadResultModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          <div className="border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-[#1e2230] overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-slate-100 dark:bg-slate-800/50 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">CLASS NAME</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-center">TOTAL INSTANCE</th>
                  <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 text-center">SUCCESS INSTANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                {listData.length > 0 ? listData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2.5 font-bold uppercase tracking-tight">{row.classname}</td>
                    <td className="px-4 py-2.5 text-center font-mono">{row.totalinstance}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-emerald-500 dark:text-emerald-400">{row.successinstance}</td>
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
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1e2230] flex justify-end border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => dispatch(closeUnloadResultModal())}
            className="px-10 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm rounded shadow-lg shadow-primary/20 transition-all font-bold"
          >
            Finished
          </button>
        </div>
      </div>
    </div>
  );
}
