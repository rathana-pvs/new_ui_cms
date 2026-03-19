import { useState } from 'react';

export default function UnloadConfigSection({ formData, handleInputChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Target configuration</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Database name</label>
          <input 
            type="text" 
            value={formData.targetDbName}
            readOnly
            className="w-full h-9 px-3 bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-slate-800/50 rounded text-[12px] text-slate-400 dark:text-slate-500 cursor-default font-medium outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Target directory</label>
          <input 
            type="text" 
            name="targetDirectory"
            value={formData.targetDirectory}
            onChange={handleInputChange}
            placeholder="e.g. /home/cubrid/backup"
            className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-white/5 pt-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">DB Username</label>
          <input 
            type="text" 
            name="dbUsername"
            value={formData.dbUsername}
            onChange={handleInputChange}
            placeholder="dba"
            className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium"
          />
        </div>
        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">DB Password</label>
          <input 
            type={showPassword ? "text" : "password"} 
            name="dbPassword"
            value={formData.dbPassword}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium pr-9"
          />
          <button 
            className="absolute right-2.5 bottom-1.5 text-slate-400 hover:text-bk-yellow dark:text-slate-500 dark:hover:text-bk-yellow transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined text-[18px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
