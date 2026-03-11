import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeBackupDatabaseModal } from '../databaseSlice';

const InputField = ({ label, value, onChange, placeholder, readOnly = false, required = false }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
      {label}
      {required && <span className="text-rose-500 font-bold">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`h-9 px-3 rounded text-[13px] border transition-all outline-none font-medium
        ${readOnly 
          ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-default shadow-none' 
          : 'bg-white dark:bg-[#1e2230] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-primary/50'
        }`}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full h-9 px-3 rounded text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 focus:border-primary/50 outline-none appearance-none font-medium"
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
  <label className="flex items-center gap-3 cursor-pointer group w-fit select-none">
    <div className="relative flex items-center">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors"
      />
      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="material-symbols-outlined text-[14px]">check</span>
      </span>
    </div>
    <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-lg rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">backup</span>
            Backup Database
          </h3>
          <button 
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
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

          <div className="pt-2 space-y-3 font-medium">
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
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="px-8 py-1.5 text-sm bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => dispatch(closeBackupDatabaseModal())}
            className="px-8 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm rounded shadow transition-all flex items-center justify-center font-bold"
          >
            Backup
          </button>
        </div>
      </div>
    </div>
  );
}
