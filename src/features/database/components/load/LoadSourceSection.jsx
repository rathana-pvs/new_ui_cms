import React from 'react';
import Select from '../../../../components/ui/Forms/Select';
import Table from '../../../../components/ui/Layout/Table';
import Checkbox from '../../../../components/ui/Forms/Checkbox';
import Input from '../../../../components/ui/Forms/Input';
import Typography from '../../../../components/ui/Foundation/Typography';
import Card from '../../../../components/ui/Layout/Card';

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
  const tableColumns = [
    { 
      key: 'checked', title: 'Flag', 
      render: (val, item) => (
        <Checkbox 
          checked={val} 
          onChange={(checked) => handleTableCheckboxChange(checked, item.key)} 
          className="scale-90"
        />
      ),
      className: 'w-[50px]'
    },
    { key: 'path', title: 'Volume Path', className: 'font-mono text-[10px] opacity-60 truncate max-w-[300px]' },
    { key: 'date', title: 'Timestamp', className: 'text-right font-mono text-[10px] opacity-40 w-[120px]' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Source parameters</Typography>
        <div className="flex-1 h-[1px] bg-border/50"></div>
      </div>

      <div className="space-y-6">
        {/* Option 1: Pre-defined source */}
        <section className={`space-y-4 transition-all duration-300 ${radio !== 0 ? 'opacity-40 grayscale-[0.5]' : ''}`}>
          <label className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => setRadio(0)}>
             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${radio === 0 ? 'border-primary' : 'border-border'}`}>
                {radio === 0 && <div className="w-2 h-2 rounded-full bg-primary animate-in zoom-in-50 duration-200" />}
             </div>
             <Typography variant="span" className={`font-bold tracking-tight ${radio === 0 ? 'text-primary' : 'text-foreground/40'}`}>Pre-defined backup volumes</Typography>
          </label>

          <div className="pl-7 space-y-4">
             <Select
                value={selectedUnload}
                onChange={handleUnloadSelectChange}
                disabled={radio !== 0}
                placeholder="Select database source"
                options={unloadList.map(db => ({ value: db.dbname, label: db.dbname }))}
                className="max-w-[320px]"
             />
             <Card className="overflow-hidden border-border/50 bg-background shadow-sm">
                <Table 
                  columns={tableColumns} 
                  data={dataSource} 
                  onRowClick={(row) => radio === 0 && handleTableCheckboxChange(!row.checked, row.key)}
                  emptyMessage="No backup volumes synchronized for selection."
                />
             </Card>
          </div>
        </section>

        <div className="h-[1px] bg-border/30" />

        {/* Option 2: Custom path */}
        <section className={`space-y-4 transition-all duration-300 ${radio !== 1 ? 'opacity-40 grayscale-[0.5]' : ''}`}>
          <label className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => setRadio(1)}>
             <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${radio === 1 ? 'border-secondary' : 'border-border'}`}>
                {radio === 1 && <div className="w-2 h-2 rounded-full bg-secondary animate-in zoom-in-50 duration-200" />}
             </div>
             <Typography variant="span" className={`font-bold tracking-tight ${radio === 1 ? 'text-secondary' : 'text-foreground/40'}`}>Manual volume paths</Typography>
          </label>

          <Card className="ml-7 p-6 border-border/50 bg-muted/5 space-y-4">
            {['schema', 'object', 'index', 'trigger'].map(type => (
              <div key={type} className="flex items-center gap-6 group">
                <div className="w-36 shrink-0">
                   <Checkbox 
                      label={`Load ${type}`} 
                      checked={formData.checkBoxes[type]} 
                      onChange={(checked) => handleCheckBoxChange(type, checked)}
                      disabled={radio !== 1}
                   />
                </div>
                <Input 
                  value={formData.unloadFiles[type]}
                  onChange={(val) => handleUnloadPathChange(type, val)}
                  disabled={radio !== 1 || !formData.checkBoxes[type]}
                  placeholder={`/absolute/path/to/${type}.file`}
                  variant={!formData.checkBoxes[type] ? 'ghost' : 'default'}
                  className="flex-1"
                />
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
