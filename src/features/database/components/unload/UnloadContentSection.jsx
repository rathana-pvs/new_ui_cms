export default function UnloadContentSection({ 
  formData, 
  handleInputChange, 
  handleSchemaChange, 
  handleTableToggle, 
  dynamicTables, 
  isTablesLoading 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Unload parameters</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50/50 dark:bg-bk-main/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[14px] text-bk-yellow">terminal</span>
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 tracking-wide">Objects</span>
          </div>
          <div className="space-y-2">
            {['All', 'Selected tables', 'Not include'].map(opt => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="schemaOption" 
                    value={opt}
                    checked={formData.schemaOption === opt}
                    onChange={handleSchemaChange}
                    className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer" 
                  />
                  <div className="absolute w-1.5 h-1.5 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">Schema: {opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-bk-main/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[14px] text-bk-yellow">dataset</span>
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 tracking-wide">Data</span>
          </div>
          <div className="space-y-2">
            {['Selected tables', 'Not include'].map(opt => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="radio" 
                    name="dataOption" 
                    value={opt}
                    checked={formData.dataOption === opt}
                    onChange={handleInputChange}
                    className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer" 
                  />
                  <div className="absolute w-1.5 h-1.5 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">Data: {opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-bk-main/20 overflow-hidden flex flex-col">
        <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-bk-main/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Available classes</span>
          <span className="text-[10px] text-slate-400 font-medium">{formData.selectedTables.length} selected</span>
        </div>
        <div className="max-h-[140px] overflow-y-auto p-2 custom-scrollbar">
          {isTablesLoading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="w-4 h-4 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Fetching schema...</span>
            </div>
          ) : dynamicTables.length === 0 ? (
            <div className="py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 italic" text-slate-400 dark:text-slate-500 italic>No classes found in this database.</div>
          ) : (
            <div className="grid grid-cols-2 gap-1 px-1">
              {dynamicTables.map(table => (
                <label key={table} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white dark:hover:bg-white/5 rounded active:scale-[0.99] transition-all cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.selectedTables.includes(table)}
                    onChange={() => handleTableToggle(table)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
                  />
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200 truncate">{table}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
