import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCopyDatabaseModal } from '../databaseSlice';

const InputField = ({ label, value, onChange, placeholder, readOnly = false }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`h-9 px-3 rounded text-[13px] border transition-all outline-none font-medium
        ${readOnly 
          ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-default' 
          : 'bg-white dark:bg-[#1e2230] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-primary/50'
        }`}
    />
  </div>
);

const Section = ({ label, children }) => (
  <div className="space-y-2">
    <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 italic mb-1 uppercase tracking-widest">{label}</div>
    <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-[#1e2230] space-y-4">
      {children}
    </div>
  </div>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-2xl rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">content_copy</span>
            Copy DB
          </h3>
          <button 
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
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
              placeholder="Enter destination database name..."
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

          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/20 space-y-4">
             <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Free Disk Space</span>
                <span className="text-[14px] font-mono font-bold text-slate-700 dark:text-slate-300 leading-none">232420 (MB)</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Database Size</span>
                <span className="text-[14px] font-mono font-bold text-rose-500 leading-none">128 (MB)</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {[
                { id: 'replace', label: 'Replace an Existing Database', key: 'replaceExisting' },
                { id: 'delete', label: 'Delete a Source Database', key: 'deleteSource' }
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData[opt.key]}
                      onChange={(e) => setFormData({...formData, [opt.key]: e.target.checked})}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors"
                    />
                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </span>
                  </div>
                  <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="px-8 py-1.5 text-sm bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => dispatch(closeCopyDatabaseModal())}
            className="px-8 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm rounded shadow transition-all flex items-center justify-center font-bold"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
