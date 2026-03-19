export default function LoadConfigSection({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Profile context</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Target database</label>
          <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default">
            {formData.targetDbName}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">DB Authority</label>
          <input 
            type="text" 
            name="dbUsername"
            value={formData.dbUsername}
            onChange={handleInputChange}
            className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>
      </div>
    </div>
  );
}
