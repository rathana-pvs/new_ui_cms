import { Icon } from '../../../../components/ds/foundation/Icon';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Checkbox } from '../../../../components/ds/forms/Checkbox';

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
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Unload parameters</Typography>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-white/5"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Schema Option Panel */}
        <div className="bg-slate-50/50 dark:bg-bk-main/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <Icon name="terminal" size="xs" weight={300} className="text-bk-yellow" />
            </div>
            <Typography variant="label" className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Objects</Typography>
          </div>
          <div className="space-y-2.5">
            {['All', 'Selected tables', 'Not include'].map(opt => (
              <div 
                key={opt} 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleSchemaChange({ target: { name: 'schemaOption', value: opt } })}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${formData.schemaOption === opt ? 'border-bk-yellow' : 'border-slate-300 dark:border-slate-600'}`}>
                  {formData.schemaOption === opt && <div className="w-1.5 h-1.5 rounded-full bg-bk-yellow shadow-[0_0_8px_rgba(255,215,0,0.6)]"></div>}
                </div>
                <Typography variant="p" className={`transition-colors font-medium ${formData.schemaOption === opt ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Schema: {opt}</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Data Option Panel */}
        <div className="bg-slate-50/50 dark:bg-bk-main/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <Icon name="dataset" size="xs" weight={300} className="text-bk-yellow" />
            </div>
            <Typography variant="label" className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Data</Typography>
          </div>
          <div className="space-y-2.5">
            {['Selected tables', 'Not include'].map(opt => (
              <div 
                key={opt} 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => handleInputChange({ target: { name: 'dataOption', value: opt } })}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${formData.dataOption === opt ? 'border-bk-yellow' : 'border-slate-300 dark:border-slate-600'}`}>
                  {formData.dataOption === opt && <div className="w-1.5 h-1.5 rounded-full bg-bk-yellow shadow-[0_0_8px_rgba(255,215,0,0.6)]"></div>}
                </div>
                <Typography variant="p" className={`transition-colors font-medium ${formData.dataOption === opt ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Data: {opt}</Typography>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-slate-100 dark:border-white/5 rounded-2xl bg-white dark:bg-bk-side/30 overflow-hidden flex flex-col shadow-sm">
        <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-bk-main/40 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <Typography variant="caption" className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Available classes</Typography>
          <div className="px-2 py-0.5 rounded bg-bk-yellow/10 border border-bk-yellow/20">
            <Typography variant="caption" className="font-black text-bk-yellow tabular-nums">{formData.selectedTables.length} selected</Typography>
          </div>
        </div>
        <div className="max-h-[160px] overflow-y-auto p-3 custom-scrollbar">
          {isTablesLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-bk-yellow/10 border-t-bk-yellow rounded-full animate-spin"></div>
              <Typography variant="p" className="text-slate-400 dark:text-slate-500 font-medium tracking-wide">Fetching schema metadata...</Typography>
            </div>
          ) : dynamicTables.length === 0 ? (
            <div className="py-8 text-center">
              <Typography variant="p" className="text-slate-400 dark:text-slate-500 italic font-medium">No system class objects detected.</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              {dynamicTables.map(table => (
                <Checkbox 
                  key={table}
                  label={table}
                  checked={formData.selectedTables.includes(table)}
                  onChange={() => handleTableToggle(table)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
