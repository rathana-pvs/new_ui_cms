import React from 'react';
import Checkbox from '../../../../components/ui/Forms/Checkbox';
import Input from '../../../../components/ui/Forms/Input';
import Typography from '../../../../components/ui/Foundation/Typography';
import Card from '../../../../components/ui/Layout/Card';

export default function LoadOptionsSection({ formData, handleCheckBoxChange, handleValueChange }) {
  const switches = [
    { id: 'checkoption', label: 'Verify syntax before load' },
    { id: 'nolog', label: "Suppress log generation" },
    { id: 'oiduse', label: "Ignore object identifiers (OID)" },
    { id: 'statisticsuse', label: "Skip statistics update" },
  ];

  const inputs = [
    { id: 'estimated', label: 'Estimated instance count', type: 'number', placeholder: '0', icon: 'calculate' },
    { id: 'period', label: 'Periodic commit threshold', type: 'number', placeholder: '1000', icon: 'timer' },
    { id: 'errorcontrolfile', label: 'Error control definition', type: 'text', icon: 'description' },
    { id: 'ignoreclassfile', label: 'Excluded table definition', type: 'text', icon: 'rule' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Load behaviors</Typography>
        <div className="flex-1 h-[1px] bg-border/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
        {switches.map(opt => (
          <Checkbox 
            key={opt.id}
            label={opt.label}
            checked={formData.checkBoxes[opt.id]}
            onChange={(checked) => handleCheckBoxChange(opt.id, checked)}
          />
        ))}
      </div>

      <Card className="p-6 border-border/50 bg-muted/5 space-y-6">
        {inputs.map(item => (
          <div key={item.id} className="flex items-center gap-6 group">
            <div className="w-56 shrink-0">
               <Checkbox 
                  label={item.label} 
                  checked={formData.checkBoxes[item.id]} 
                  onChange={(checked) => handleCheckBoxChange(item.id, checked)} 
               />
            </div>
            <Input 
              type={item.type}
              value={formData.values[item.id]}
              onChange={(val) => handleValueChange(item.id, val)}
              disabled={!formData.checkBoxes[item.id]}
              placeholder={item.placeholder || ""}
              variant={!formData.checkBoxes[item.id] ? 'ghost' : 'default'}
              icon={item.icon}
              className="flex-1"
            />
          </div>
        ))}
      </Card>
    </div>
  );
}
