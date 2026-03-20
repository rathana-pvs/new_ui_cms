import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeBackupDatabaseModal } from '../databaseSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';
import Checkbox from '../../../components/ui/Forms/Checkbox';

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

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeBackupDatabaseModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleBackup} loading={loading} icon="play_circle">Run Backup</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isBackupDatabaseModalOpen}
      onClose={() => dispatch(closeBackupDatabaseModal())}
      title="Backup Database"
      subtitle={`${selectedDatabase}`}
      icon="backup"
      footer={footer}
      maxWidth="max-w-[540px]"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {error && <Alert variant="error" title="Backup execution failure" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Archive Configuration</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input label="Target Database" value={selectedDatabase || 'db1'} readOnly disabled variant="ghost" icon="database" />
             <Input 
                label="Volume Path" 
                value={formData.volPath} 
                onChange={(val) => handleInputChange('volPath', val)} 
                placeholder="db_backup_path" 
                icon="folder_zip"
             />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input 
                label="Backup ID" 
                value={formData.backupId} 
                onChange={(val) => handleInputChange('backupId', val)} 
                icon="fingerprint"
             />
             <Select 
                label="Backup Level"
                value={formData.backupLevel}
                onChange={(val) => handleInputChange('backupLevel', val)}
                options={[
                  { value: 'level 0', label: 'Level 0 (Full)' },
                  { value: 'level 1', label: 'Level 1 (Incremental)' },
                  { value: 'level 2', label: 'Level 2 (Differential)' }
                ]}
             />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input 
                label="Backup Directory" 
                value={formData.backupDir} 
                onChange={(val) => handleInputChange('backupDir', val)} 
                placeholder="/var/lib/backup"
                icon="folder_open"
             />
             <Input 
                label="Parallel Threads" 
                type="number"
                value={formData.parallelBackup} 
                onChange={(val) => handleInputChange('parallelBackup', val)} 
                icon="reorder"
             />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-secondary/60">Process Flags & Safety</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="p-4 bg-muted/5 border-border/50 space-y-4">
             <Checkbox 
                label="Check database consistency" 
                checked={formData.checkConsistency} 
                onChange={(val) => handleInputChange('checkConsistency', val)} 
                description="Verify data integrity before creating the archive snapshot."
             />
             <Checkbox 
                label="Delete unnecessary log archives" 
                checked={formData.deleteUnnecessary} 
                onChange={(val) => handleInputChange('deleteUnnecessary', val)} 
                description="Prune old log volumes that are no longer required for recovery."
             />
             <Checkbox 
                label="Compress backup volumes" 
                checked={formData.compress} 
                onChange={(val) => handleInputChange('compress', val)} 
                description="Apply engine-level compression to minimize disk footprint."
             />
          </Card>
        </section>
      </div>
    </Modal>
  );
}
