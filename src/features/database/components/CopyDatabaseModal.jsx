import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCopyDatabaseModal } from '../databaseSlice';

const InputField = ({ label, value, onChange, placeholder, readOnly = false }) => (
  <div className="flex items-center gap-4">
    <label className="w-[140px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right uppercase tracking-tight">
      {label} :
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`flex-1 h-[34px] px-3 rounded-md text-[13px] border transition-all outline-none shadow-sm
        ${readOnly 
          ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-500 dark:text-slate-500 cursor-default' 
          : 'bg-white dark:bg-[#1e2230] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-500'
        }`}
    />
  </div>
);

const Section = ({ label, children }) => (
  <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
    <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2 uppercase tracking-wider">
      {label}
    </legend>
    {children}
  </fieldset>
);

export default function CopyDatabaseModal() {
  const dispatch = useDispatch();
  const { isCopyDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  
  const [formData, setFormData] = useState({
    destName: '',
    destPath: '/home/cubrid/CUBRID/databases/',
    extPath: '/home/cubrid/CUBRID/databases/',
    logPath: '/home/cubrid/CUBRID/databases/',
    replaceExisting: false,
    deleteSource: false
  });

  if (!isCopyDatabaseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Copy Database
          </h3>
          <button 
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
          <Section label="Source Database">
            <InputField 
              label="Database Path" 
              value={`/home/cubrid/CUBRID/databases/${selectedDatabase}`} 
              readOnly 
            />
            <InputField 
              label="Log File Path" 
              value={`/home/cubrid/CUBRID/databases/${selectedDatabase}`} 
              readOnly 
            />
          </Section>

          <Section label="Destination Database">
            <InputField 
              label="Database Name" 
              value={formData.destName}
              onChange={(val) => setFormData({...formData, destName: val})}
              placeholder=""
            />
            <InputField 
              label="Database Path" 
              value={formData.destPath}
              onChange={(val) => setFormData({...formData, destPath: val})}
            />
            <InputField 
              label="Extent Volume Path" 
              value={formData.extPath}
              onChange={(val) => setFormData({...formData, extPath: val})}
            />
            <InputField 
              label="Log File Path" 
              value={formData.logPath}
              onChange={(val) => setFormData({...formData, logPath: val})}
            />
          </Section>

          <div className="flex flex-col gap-5 pt-1">
            <div className="flex items-center justify-between text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <span>Free Disk Space: 232420(MB)</span>
              <span>Database Size: 128(MB)</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'replace', label: 'Replace an Existing Database', key: 'replaceExisting' },
                { id: 'delete', label: 'Delete a Source Database', key: 'deleteSource' }
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <input 
                    type="checkbox" 
                    checked={formData[opt.key]}
                    onChange={(e) => setFormData({...formData, [opt.key]: e.target.checked})}
                    className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]"
                  />
                  <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50 font-sans">
          <button 
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="h-[34px] px-8 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold"
          >
            Copy Database
          </button>
        </div>
      </div>
    </div>
  );
}
