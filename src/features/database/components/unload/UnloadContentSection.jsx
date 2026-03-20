import React from 'react';
import Typography from '../../../../components/ui/Foundation/Typography';
import Card from '../../../../components/ui/Layout/Card';
import Icon from '../../../../components/ui/Foundation/Icon';
import Checkbox from '../../../../components/ui/Forms/Checkbox';

export default function UnloadContentSection({ 
  formData, 
  handleInputChange, 
  handleSchemaChange, 
  handleTableToggle, 
  dynamicTables, 
  isTablesLoading 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Unload Parameters</Typography>
        <div className="flex-1 h-[1px] bg-border/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4 bg-muted/5 border-border/50 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="terminal" size="xs" className="text-primary opacity-60" />
            <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">Schema Objects</Typography>
          </div>
          <div className="space-y-3">
            {['All', 'Selected tables', 'Not include'].map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => handleSchemaChange({ target: { value: opt } })}>
                 <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${formData.schemaOption === opt ? 'border-primary' : 'border-border'}`}>
                    {formData.schemaOption === opt && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                 </div>
                 <Typography variant="span" className={`text-[11px] font-medium tracking-tight transition-colors ${formData.schemaOption === opt ? 'text-primary' : 'text-foreground/40'}`}>Schema: {opt}</Typography>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-muted/5 border-border/50 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="dataset" size="xs" className="text-primary opacity-60" />
            <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">Data Records</Typography>
          </div>
          <div className="space-y-3">
            {['Selected tables', 'Not include'].map(opt => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => handleInputChange({ target: { name: 'dataOption', value: opt } })}>
                 <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${formData.dataOption === opt ? 'border-primary' : 'border-border'}`}>
                    {formData.dataOption === opt && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                 </div>
                 <Typography variant="span" className={`text-[11px] font-medium tracking-tight transition-colors ${formData.dataOption === opt ? 'text-primary' : 'text-foreground/40'}`}>Data: {opt}</Typography>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card className="border-border/50 bg-background overflow-hidden flex flex-col shadow-sm">
        <div className="px-4 py-2 bg-muted/10 border-b border-border/50 flex items-center justify-between">
          <Typography variant="caption" className="font-black uppercase tracking-widest text-[9px] opacity-40">Available Classes</Typography>
          <Typography variant="caption" className="font-bold text-primary">{formData.selectedTables.length} selected</Typography>
        </div>
        <div className="max-h-[160px] overflow-y-auto p-3 custom-scrollbar">
          {isTablesLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Typography variant="caption" className="italic opacity-40">Fetching database schema catalog...</Typography>
            </div>
          ) : dynamicTables.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-2 opacity-30">
               <Icon name="cloud_off" size="sm" />
               <Typography variant="caption" className="italic italic">No classes found in this database.</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {dynamicTables.map(table => (
                <div key={table} className="px-1">
                   <Checkbox 
                      label={table} 
                      checked={formData.selectedTables.includes(table)} 
                      onChange={() => handleTableToggle(table)} 
                      className="group-hover:text-primary transition-colors"
                   />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
