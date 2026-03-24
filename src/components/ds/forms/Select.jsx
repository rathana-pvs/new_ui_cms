import React, { forwardRef } from 'react';
import { FormField } from './FormField';
import { Icon } from '../foundation/Icon';

export const Select = forwardRef(({
  label,
  description,
  error,
  required,
  options = [],
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <FormField label={label} description={description} error={error} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full pl-3 pr-10 py-1.5 h-9 text-[12px] font-medium bg-slate-50 dark:bg-bk-main/30 border rounded focus:outline-none focus:border-bk-yellow/50 dark:text-slate-100 transition-all appearance-none ${
            error 
              ? 'border-rose-500/50 focus:border-rose-500' 
              : 'border-slate-300 dark:border-slate-800'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white dark:bg-bk-side">{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400 group-focus-within:text-bk-yellow transition-colors">
          <Icon name="expand_more" size="md"  weight={300} />
        </div>
      </div>
    </FormField>
  );
});

Select.displayName = 'Select';
