import SelectField from '../../../../components/common/SelectField';

export default function LoadSourceSection({ 
  radio, 
  setRadio, 
  selectedUnload, 
  handleUnloadSelectChange, 
  unloadList, 
  dataSource, 
  handleTableCheckboxChange,
  formData,
  handleCheckBoxChange,
  handleUnloadPathChange
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Source parameters</span>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
      </div>

      <div className="space-y-4">
        {/* Option 1: Pre-defined source */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="relative flex items-center">
              <input 
                type="radio" 
                name="radioOption" 
                checked={radio === 0}
                onChange={() => setRadio(0)}
                className="peer w-4 h-4 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer"
              />
              <div className="absolute w-2 h-2 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
            </div>
            <span className={`text-[11px] font-medium tracking-wide transition-colors ${radio === 0 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>Pre-defined backup volumes</span>
          </label>

          <div className={`space-y-3 transition-all ${radio !== 0 ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
            <div className="relative pl-7">
              <SelectField
                value={selectedUnload}
                onChange={(val) => handleUnloadSelectChange(val)}
                disabled={radio !== 0}
                placeholder="Select database source"
                options={unloadList.map(db => ({ value: db.dbname, label: db.dbname }))}
              />
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/30 ml-7">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-50/80 dark:bg-bk-main/50 text-[10px] font-medium text-slate-400 tracking-wide border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Flag</th>
                    <th className="px-3 py-2">Volume path</th>
                    <th className="px-3 py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {dataSource.map(row => (
                    <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer" onClick={() => handleTableCheckboxChange(!row.checked, row.key)}>
                      <td className="px-3 py-2">
                          <input 
                            type="checkbox" 
                            className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
                            checked={row.checked} 
                            readOnly
                          />
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-500 max-w-[280px] truncate">{row.path}</td>
                      <td className="px-3 py-2 text-right font-mono text-[10px] text-slate-400">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Option 2: Custom path */}
        <div className="space-y-3 pt-2 border-t border-slate-50 dark:border-white/5">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="relative flex items-center">
              <input 
                type="radio" 
                name="radioOption" 
                checked={radio === 1}
                onChange={() => setRadio(1)}
                className="peer w-4 h-4 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer"
              />
              <div className="absolute w-2 h-2 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
            </div>
            <span className={`text-[11px] font-medium tracking-wide transition-colors ${radio === 1 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>Manual volume paths</span>
          </label>

          <div className={`space-y-2 pl-7 transition-all ${radio !== 1 ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
            {['schema', 'object', 'index', 'trigger'].map(type => (
              <div key={type} className="flex items-center gap-3 group">
                <div className="w-32 shrink-0 flex items-center gap-2.5">
                    <input 
                      type="checkbox"
                      checked={formData.checkBoxes[type]}
                      onChange={(e) => handleCheckBoxChange(type, e.target.checked)}
                      className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                    />
                  <span className="text-[10px] font-medium text-slate-400 tracking-wide">Load {type}</span>
                </div>
                <input 
                  type="text"
                  value={formData.unloadFiles[type]}
                  onChange={(e) => handleUnloadPathChange(type, e.target.value)}
                  disabled={!formData.checkBoxes[type]}
                  placeholder="/absolute/path/to/file"
                  className={`flex-1 h-8 px-3 rounded text-[11px] border transition-all outline-none font-medium
                    ${!formData.checkBoxes[type]
                      ? 'bg-slate-50 dark:bg-bk-main/10 border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed'
                      : 'bg-white dark:bg-bk-main/30 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-bk-yellow/50'}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
