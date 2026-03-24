import React, { forwardRef } from 'react';
import { FormField } from './FormField';

export const Input = forwardRef(({
  label,
  labelExtra,
  description,
  error,
  required,
  type = 'text',
  className = '',
  disabled = false,
  ...props
}, ref) => {
  return (
    <FormField 
      label={label} 
      labelExtra={labelExtra} 
      description={description} 
      error={error} 
      required={required} 
      className={className}
    >
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={`w-full px-3 py-1.5 h-9 text-[12px] font-medium bg-slate-50 dark:bg-bk-main/30 border rounded focus:outline-none focus:border-bk-yellow/50 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 ${
          error 
            ? 'border-rose-500/50 focus:border-rose-500' 
            : 'border-slate-200 dark:border-slate-800'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        {...props}
      />
    </FormField>
  );
});

Input.displayName = 'Input';
