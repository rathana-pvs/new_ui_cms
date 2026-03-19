export default function LoadOptionsSection({ formData, handleCheckBoxChange, handleValueChange }) {
  const switches = [
    { id: 'checkoption', label: 'Verify syntax before load' },
    { id: 'nolog', label: "Suppress log generation" },
    { id: 'oiduse', label: "Ignore object identifiers (OID)" },
    { id: 'statisticsuse', label: "Skip statistics update" },
  ];

  const inputs = [
    { id: 'estimated', label: 'Estimated instance count', type: 'number', placeholder: '0' },
    { id: 'period', label: 'Periodic commit threshold', type: 'number', placeholder: '1000' },
    { id: 'errorcontrolfile', label: 'Error control definition', type: 'text' },
    { id: 'ignoreclassfile', label: 'Excluded table definition', type: 'text' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Load behaviors</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-1">
        {switches.map(opt => (
          <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
            <input 
              type="checkbox"
              checked={formData.checkBoxes[opt.id]}
              onChange={(e) => handleCheckBoxChange(opt.id, e.target.checked)}
              className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
            />
            <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors tracking-tight">{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-white/5">
        {inputs.map(item => (
          <div key={item.id} className="flex items-center gap-3 group">
            <div className="w-52 shrink-0 flex items-center gap-2.5">
                <input 
                  type="checkbox"
                  checked={formData.checkBoxes[item.id]}
                  onChange={(e) => handleCheckBoxChange(item.id, e.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                />
              <label className={`text-[10px] font-medium tracking-wide transition-colors ${formData.checkBoxes[item.id] ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{item.label}</label>
            </div>
            <input 
              type={item.type}
              value={formData.values[item.id]}
              onChange={(e) => handleValueChange(item.id, e.target.value)}
              disabled={!formData.checkBoxes[item.id]}
              placeholder={item.placeholder || ""}
              className={`flex-1 h-8 px-3 rounded text-[11px] border transition-all outline-none font-medium
                ${!formData.checkBoxes[item.id]
                  ? 'bg-slate-50 dark:bg-bk-main/10 border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed'
                  : 'bg-white dark:bg-bk-main/30 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-bk-yellow/50'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
