export default function UnloadAdvancedOptions({ formData, handleInputChange }) {
  const checkboxes = [
    { label: 'As dba', name: 'asDba' },
    { label: 'Split schema files', name: 'splitSchema' },
    { label: 'Class Only', name: 'classOnly' },
    { label: 'Skip index detail', name: 'skipIndex' },
    { label: 'Use delimited identifier', name: 'useDelimitedIdentifier' },
    { label: 'Include referenced tables', name: 'includeReferencedTables', disabled: formData.schemaOption === 'Not include' },
  ];

  const inputFields = [
    { label: 'Output file prefix', name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text', placeholder: 'prefix_' },
    { label: 'Hash file path', name: 'fileForHash', useName: 'useFileForHash', type: 'text' },
    { label: 'Cached pages limit', name: 'cachedPages', useName: 'useCachedPages', type: 'number', placeholder: '0' },
    { label: 'Instances estimate', name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number', placeholder: '1000' },
    { label: 'LO file directory', name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Advanced options</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-1">
        {checkboxes.map(opt => (
          <label key={opt.name} className={`flex items-center gap-2.5 ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} group`}>
            <input 
              type="checkbox" 
              name={opt.name}
              checked={formData[opt.name]}
              onChange={handleInputChange}
              disabled={opt.disabled}
              className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
            />
            <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors uppercase tracking-tight">{opt.label}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-white/5">
        {inputFields.map(field => (
          <div key={field.name} className="flex items-center gap-3 group">
            <div className="w-48 shrink-0 flex items-center gap-2.5">
              <input 
                type="checkbox" 
                name={field.useName}
                checked={formData[field.useName]}
                onChange={handleInputChange}
                className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
              />
              <label className={`text-[10px] font-medium tracking-tight transition-colors ${formData[field.useName] ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{field.label}</label>
            </div>
            <div className="flex-1">
              <input 
                type={field.type} 
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder || ''}
                disabled={!formData[field.useName]}
                className={`w-full h-8 px-3 rounded text-[12px] border transition-all outline-none font-medium
                  ${!formData[field.useName] 
                    ? 'bg-slate-50 dark:bg-bk-main/10 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                    : 'bg-white dark:bg-bk-main/30 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-bk-yellow/50'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
