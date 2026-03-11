import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeBackupDatabaseModal } from '../databaseSlice';

const InputField = ({ label, value, onChange, placeholder, readOnly = false, required = false }) => (
  <div className="flex items-center gap-4">
    <label className="w-[160px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right uppercase tracking-tight">
      {label} {required && <span className="text-rose-500">*</span>} :
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

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex items-center gap-4">
    <label className="w-[160px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right uppercase tracking-tight">
      {label} :
    </label>
    <div className="flex-1 relative">
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 focus:border-blue-500 outline-none appearance-none font-bold shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <span className="material-symbols-outlined text-[18px]">expand_more</span>
      </div>
    </div>
  </div>
);

const CheckboxItem = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group w-fit select-none ml-[160px] pl-4">
    <input 
      type="checkbox" 
      checked={checked}
      onChange={(e) => onChange && onChange(e.target.checked)}
      className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]"
    />
    <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
      {label}
    </span>
  </label>
);

export default function BackupDatabaseModal() {
  const dispatch = useDispatch();
  const { isBackupDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  
  const [formData, setFormData] = useState({
    volPath: 'db1_backup_lv0',
    backupId: '0',
    backupLevel: 'level 0',
    backupDir: '/var/lib/cubrid/db1/backup',
    parallelBackup: '0',
    checkConsistency: true,
    deleteUnnecessary: false,
    compress: true
  });

  if (!isBackupDatabaseModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Backup Database
          </h3>
          <button 
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          <InputField 
            label="Database" 
            value={selectedDatabase || 'db1'} 
            readOnly 
          />
          <InputField 
            label="Vol Path" 
            required
            value={formData.volPath}
            onChange={(val) => setFormData({...formData, volPath: val})}
          />
          <InputField 
            label="Backup ID" 
            value={formData.backupId}
            onChange={(val) => setFormData({...formData, backupId: val})}
          />
          <SelectField 
            label="Backup Level" 
            value={formData.backupLevel}
            onChange={(val) => setFormData({...formData, backupLevel: val})}
            options={[
              { label: 'level 0', value: 'level 0' },
              { label: 'level 1', value: 'level 1' },
              { label: 'level 2', value: 'level 2' }
            ]}
          />
          <InputField 
            label="Backup Directory" 
            required
            value={formData.backupDir}
            onChange={(val) => setFormData({...formData, backupDir: val})}
          />
          <InputField 
            label="Parallel Backup" 
            value={formData.parallelBackup}
            onChange={(val) => setFormData({...formData, parallelBackup: val})}
          />

          <div className="pt-2 space-y-2.5">
            <CheckboxItem 
              label="Check Database Consistency" 
              checked={formData.checkConsistency}
              onChange={(val) => setFormData({...formData, checkConsistency: val})}
            />
            <CheckboxItem 
              label="Delete Unnecessary log-achieves" 
              checked={formData.deleteUnnecessary}
              onChange={(val) => setFormData({...formData, deleteUnnecessary: val})}
            />
            <CheckboxItem 
              label="Compress Backup Volumes" 
              checked={formData.compress}
              onChange={(val) => setFormData({...formData, compress: val})}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50 font-sans">
          <button 
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="h-[34px] px-8 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold"
          >
            Start Backup
          </button>
        </div>
      </div>
    </div>
  );
}
