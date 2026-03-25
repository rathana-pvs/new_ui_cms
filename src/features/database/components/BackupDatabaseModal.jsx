import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeBackupDatabaseModal } from '../databaseSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Input } from '../../../components/ds/forms/Input';
import { Select } from '../../../components/ds/forms/Select';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { Divider } from '../../../components/ds/layout/Divider';
import { Typography } from '../../../components/ds/foundation/Typography';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isBackupDatabaseModalOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackup = () => {
    if (!formData.volPath || !formData.backupDir) {
      setError("Mandatory fields 'Volume path' and 'Backup directory' are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (formData.backupDir.includes('/error')) {
        setLoading(false);
        setError("Insufficient disk space in the specified backup directory.");
      } else {
        setLoading(false);
        dispatch(closeBackupDatabaseModal());
      }
    }, 2000);
  };

  return (
    <Modal
      isOpen={isBackupDatabaseModalOpen}
      onClose={() => dispatch(closeBackupDatabaseModal())}
      title="Backup Database"
      icon="backup"
      maxWidth="max-w-[640px]"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={() => dispatch(closeBackupDatabaseModal())}>
            Discard
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBackup} 
            loading={loading}
            icon="play_circle"
          >
            Run Backup Now
          </Button>
        </div>
      }
    >
      <div className="relative">
        <LoadingOverlay 
          isVisible={loading} 
          title="Processing Backup" 
          subtitle="Creating persistent snapshot of database volumes..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleBackup}
          onClose={() => setError(null)}
        />

        <div className="space-y-8 pb-4">
          {/* Header Status */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bk-yellow/10 flex items-center justify-center text-bk-yellow border border-bk-yellow/20">
                <Icon name="database" size="sm" weight={300} />
              </div>
              <div>
                <Typography variant="label" className="text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold !text-[9px]">Target Instance</Typography>
                <Typography variant="p" className="text-slate-900 dark:text-white font-black text-[13px]">{selectedDatabase || 'N/A'}</Typography>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Ready for Snapshot</span>
            </div>
          </div>

          {/* Backup Level Strategy */}
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-400">
            <Divider label="BACKUP STRATEGY" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 'level 0', label: 'L0', title: 'Full Backup', desc: 'Complete static dump', icon: 'auto_awesome_motion' },
                { level: 'level 1', label: 'L1', title: 'Incremental', desc: 'Changes since last L0/L1', icon: 'trending_up' },
                { level: 'level 2', label: 'L2', title: 'Differential', desc: 'Changes since last L1', icon: 'call_split' }
              ].map(item => (
                <button
                  key={item.level}
                  onClick={() => handleInputChange('backupLevel', item.level)}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all group ${
                    formData.backupLevel === item.level
                      ? 'bg-bk-yellow/10 border-bk-yellow/40 shadow-lg shadow-bk-yellow/5'
                      : 'bg-slate-50/20 dark:bg-white/[0.01] border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    formData.backupLevel === item.level ? 'bg-bk-yellow text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}>
                    <Icon name={item.icon} size="md" weight={300} />
                  </div>
                  <Typography variant="label" className={`font-black text-[11px] mb-1 transition-colors ${
                    formData.backupLevel === item.level ? 'text-bk-yellow' : 'text-slate-900 dark:text-white'
                  }`}>{item.title}</Typography>
                  <Typography variant="p" className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{item.desc}</Typography>
                </button>
              ))}
            </div>
          </div>

          {/* Core Configuration */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Divider label="VOLUME & STORE CONFIGURATION" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Input 
                label="Volume Path Identifier"
                value={formData.volPath}
                onChange={(e) => handleInputChange('volPath', e.target.value)}
                placeholder="db_backup_path"
                icon="folder_zip"
              />
              <Input 
                label="Backup Revision ID"
                value={formData.backupId}
                onChange={(e) => handleInputChange('backupId', e.target.value)}
                icon="fingerprint"
                placeholder="0"
              />
              <div className="col-span-2">
                <Input 
                  label="Target Storage Directory"
                  value={formData.backupDir}
                  onChange={(e) => handleInputChange('backupDir', e.target.value)}
                  placeholder="/var/lib/cubrid/backup"
                  icon="drive_file_move"
                />
              </div>
              <div className="col-span-2">
                <Input 
                  type="number" 
                  label="Parallel Execution Streams"
                  description="Optimize speed based on CPU cores available"
                  value={formData.parallelBackup}
                  onChange={(e) => handleInputChange('parallelBackup', e.target.value)}
                  icon="speed"
                  suffix="Threads"
                />
              </div>
            </div>
          </div>

          {/* Advanced Flags */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-600">
            <Divider label="OPERATIONAL INTEGRITY" />
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Consistency Verification', field: 'checkConsistency', icon: 'verified_user', desc: 'Perform block-level validation of database volumes' },
                { label: 'Automated Log Retention', field: 'deleteUnnecessary', icon: 'cleaning_services', desc: 'Purge transaction logs that have been successfully archived' },
                { label: 'Stream Compression', field: 'compress', icon: 'compress', desc: 'Apply LZ4-style compression to reduce storage footprint' },
              ].map(opt => (
                <div 
                  key={opt.field} 
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    formData[opt.field] 
                      ? 'bg-bk-yellow/[0.03] border-bk-yellow/20' 
                      : 'bg-slate-50/20 dark:bg-white/[0.01] border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  }`}
                  onClick={() => handleInputChange(opt.field, !formData[opt.field])}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 border ${
                    formData[opt.field] 
                      ? 'bg-bk-yellow/10 border-bk-yellow/20 text-bk-yellow' 
                      : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-400'
                  }`}>
                    <Icon name={opt.icon} size="md" weight={300} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="label" className={`font-black tracking-tight transition-colors ${formData[opt.field] ? 'text-bk-yellow' : 'text-slate-900 dark:text-white'}`}>{opt.label}</Typography>
                    <Typography variant="p" className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{opt.desc}</Typography>
                  </div>
                  <Checkbox 
                    className="shrink-0"
                    checked={formData[opt.field]}
                    onChange={(e) => handleInputChange(opt.field, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
