import React from 'react';
import Checkbox from '../../../../components/ui/Forms/Checkbox';
import Input from '../../../../components/ui/Forms/Input';
import Typography from '../../../../components/ui/Foundation/Typography';
import Card from '../../../../components/ui/Layout/Card';

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
    { label: 'Output file prefix', name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text', placeholder: 'prefix_', icon: 'title' },
    { label: 'Hash file path', name: 'fileForHash', useName: 'useFileForHash', type: 'text', icon: 'tag' },
    { label: 'Cached pages limit', name: 'cachedPages', useName: 'useCachedPages', type: 'number', placeholder: '0', icon: 'layers' },
    { label: 'Instances estimate', name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number', placeholder: '1000', icon: 'calculate' },
    { label: 'LO file directory', name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text', icon: 'folder' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Advanced Options</Typography>
        <div className="flex-1 h-[1px] bg-border/50"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
        {checkboxes.map(opt => (
          <Checkbox 
            key={opt.name}
            label={opt.label}
            name={opt.name}
            checked={formData[opt.name]}
            onChange={(checked) => handleInputChange({ target: { name: opt.name, type: 'checkbox', checked } })}
            disabled={opt.disabled}
          />
        ))}
      </div>

      <Card className="p-6 border-border/50 bg-muted/5 space-y-6">
        {inputFields.map(field => (
          <div key={field.name} className="flex items-center gap-6 group">
            <div className="w-52 shrink-0">
               <Checkbox 
                  label={field.label} 
                  name={field.useName}
                  checked={formData[field.useName]}
                  onChange={(checked) => handleInputChange({ target: { name: field.useName, type: 'checkbox', checked } })}
               />
            </div>
            <Input 
              type={field.type} 
              name={field.name}
              value={formData[field.name]}
              onChange={(val) => handleInputChange({ target: { name: field.name, value: val } })}
              placeholder={field.placeholder || ''}
              disabled={!formData[field.useName]}
              variant={!formData[field.useName] ? 'ghost' : 'default'}
              icon={field.icon}
              className="flex-1"
            />
          </div>
        ))}
      </Card>
    </div>
  );
}
