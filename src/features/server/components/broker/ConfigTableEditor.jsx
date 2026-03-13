export default function ConfigTableEditor({ 
  sections, 
  allPropertyKeys, 
  selectedCell, 
  setSelectedCell, 
  handleKeyChange, 
  handleValueChange 
}) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="inline-block min-w-full align-middle font-sans">
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1a1c1e] shadow-xl overflow-hidden">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                <th className="px-4 py-2 text-left border border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider w-64 bg-slate-100/50 dark:bg-black/40">
                  Property name
                </th>
                {sections.map((sec, idx) => (
                  <th key={idx} className="px-4 py-2 text-left border border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider min-w-[200px] bg-slate-100/50 dark:bg-black/40">
                    Broker#{idx}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1a1c1e]">
              {allPropertyKeys.map((key, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={`text-[12px] group transition-colors ${
                    (selectedCell.row === rowIdx) ? 'bg-emerald-500/5' : 'odd:bg-white dark:odd:bg-[#1a1c1e] even:bg-slate-50/30 dark:even:bg-white/[0.02]'
                  }`}
                >
                  <td className={`p-0 border border-slate-200 dark:border-slate-800 font-bold ${
                    key === 'BROKER_NAME' ? 'bg-slate-50/50 dark:bg-black/20' : ''
                  }`}>
                    {key === 'BROKER_NAME' ? (
                      <div className="px-4 py-1.5 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                         <span className="material-symbols-outlined text-[14px]">label_important</span>
                         {key}
                      </div>
                    ) : (
                      <input 
                        id={`property-name-${key}`}
                        type="text"
                        value={key}
                        onChange={(e) => handleKeyChange(key, e.target.value)}
                        className="w-full px-4 py-1.5 bg-transparent outline-none text-slate-700 dark:text-slate-300 font-bold transition-all"
                        placeholder="Property Name"
                      />
                    )}
                  </td>
                  {sections.map((sec, colIdx) => {
                    const isSelected = selectedCell.row === rowIdx && selectedCell.col === colIdx;
                    const currentValue = sec.properties[key] || '';
                    const isBoolean = ['ON', 'OFF'].includes(currentValue.toUpperCase());
                    
                    return (
                      <td 
                        key={colIdx} 
                        onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                        className={`p-0 border border-slate-200 dark:border-slate-800 relative ${
                            isSelected ? 'bg-emerald-500/10' : ''
                        }`}
                      >
                        {isBoolean ? (
                          <select 
                            value={currentValue.toUpperCase()}
                            onChange={(e) => handleValueChange(colIdx, key, e.target.value)}
                            className={`w-full px-4 py-1.5 bg-transparent outline-none transition-all appearance-none cursor-pointer font-bold ${
                                isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <option value="ON" className="bg-white dark:bg-bk-side text-emerald-600">ON</option>
                            <option value="OFF" className="bg-white dark:bg-bk-side text-rose-600">OFF</option>
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={currentValue}
                            onChange={(e) => handleValueChange(colIdx, key, e.target.value)}
                            className={`w-full px-4 py-1.5 bg-transparent outline-none transition-all ${
                                isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-400'
                            } ${key === 'BROKER_NAME' ? 'text-blue-600 dark:text-blue-400 font-bold italic' : ''}`}
                          />
                        )}
                        {isSelected && (
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
