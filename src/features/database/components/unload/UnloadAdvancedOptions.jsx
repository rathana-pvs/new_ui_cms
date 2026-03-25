import { Checkbox } from '../../../../components/ds/forms/Checkbox';
import { Input } from '../../../../components/ds/forms/Input';
import { Typography } from '../../../../components/ds/foundation/Typography';

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
      <div className="flex items-center gap-3">
        <Typography variant="caption" className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Advanced options</Typography>
        <div className="flex-1 h-[1px] bg-slate-100 dark:bg-white/5"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-1">
        {checkboxes.map(opt => (
          <Checkbox 
            key={opt.name}
            label={opt.label}
            name={opt.name}
            checked={formData[opt.name]}
            onChange={handleInputChange}
            disabled={opt.disabled}
          />
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
        {inputFields.map(field => (
          <div key={field.name} className="flex items-center gap-4">
            <div className="w-52 shrink-0">
              <Checkbox 
                label={field.label}
                name={field.useName}
                checked={formData[field.useName]}
                onChange={handleInputChange}
              />
            </div>
            <Input 
              type={field.type} 
              name={field.name}
              value={formData[field.name]}
              onChange={handleInputChange}
              placeholder={field.placeholder || ''}
              disabled={!formData[field.useName]}
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
