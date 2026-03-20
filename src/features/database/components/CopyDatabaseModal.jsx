import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCopyDatabaseModal, copyDatabase } from '../databaseSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Input from '../../../components/ui/Forms/Input';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function CopyDatabaseModal() {
  const dispatch = useDispatch();
  const { isCopyDatabaseModalOpen, selectedDatabase, actionLoading, error: sliceError } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [formData, setFormData] = useState({
    destName: '',
    destPath: '/home/cubrid/CUBRID/databases/',
    extPath: '/home/cubrid/CUBRID/databases/',
    logPath: '/home/cubrid/CUBRID/databases/',
    replaceExisting: false,
    deleteSource: false
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sliceError) {
      setError(sliceError);
    }
  }, [sliceError]);

  if (!isCopyDatabaseModalOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopy = () => {
    if (!formData.destName) {
      setError("Please provide a destination database name.");
      return;
    }
    setError(null);
    dispatch(copyDatabase({ 
      hostUid: selectedHostUid, 
      payload: {
        srcdbname: selectedDatabase,
        destname: formData.destName,
        destpath: formData.destPath,
        expath: formData.extPath,
        logpath: formData.logPath,
        replace: formData.replaceExisting ? 'y' : 'n',
        unlink: formData.deleteSource ? 'y' : 'n'
      }
    }));
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeCopyDatabaseModal())} disabled={actionLoading}>Discard</Button>
      <Button variant="primary" onClick={handleCopy} loading={actionLoading} icon="content_copy">Run Clone</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isCopyDatabaseModalOpen}
      onClose={() => dispatch(closeCopyDatabaseModal())}
      title="Clone Database"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="content_copy"
      footer={footer}
      maxWidth="max-w-[620px]"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {error && <Alert variant="error" title="Cloning operation failed" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Input Mapping</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input label="Source Database" value={selectedDatabase} readOnly disabled variant="ghost" icon="database" />
             <Input 
                label="Source Volume Root" 
                value={`/home/cubrid/databases/${selectedDatabase}`} 
                readOnly 
                disabled 
                variant="ghost" 
                icon="folder_zip"
             />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-secondary/60">Destination Profile</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input 
                label="New Database Name" 
                value={formData.destName} 
                onChange={(val) => handleInputChange('destName', val)} 
                placeholder="e.g. clone_db"
                icon="title"
             />
             <Input 
                label="New Volume Root" 
                value={formData.destPath} 
                onChange={(val) => handleInputChange('destPath', val)} 
                icon="folder_open"
             />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Input 
                label="Extent Volume Root" 
                value={formData.extPath} 
                onChange={(val) => handleInputChange('extPath', val)} 
                icon="layers"
             />
             <Input 
                label="New Log Root" 
                value={formData.logPath} 
                onChange={(val) => handleInputChange('logPath', val)} 
                icon="history_edu"
             />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-rose-500/60">Capacity & Migration Flags</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>

          <Card className="flex items-center justify-between p-6 bg-muted/5 border-border/50 group hover:border-primary/30 transition-all">
             <div className="space-y-1">
                <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">Available Capacity</Typography>
                <div className="flex items-baseline gap-1.5 pt-1">
                   <Typography variant="h3" className="font-mono font-black tracking-tighter">232,420</Typography>
                   <Typography variant="caption" className="font-bold opacity-40">MB (Free)</Typography>
                </div>
             </div>
             <div className="w-[1px] h-10 bg-border opacity-20 mx-4"></div>
             <div className="space-y-1 text-right">
                <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">Database Footprint</Typography>
                <div className="flex items-baseline gap-1.5 justify-end pt-1">
                   <Typography variant="h3" className="font-mono font-black tracking-tighter text-rose-500">128</Typography>
                   <Typography variant="caption" className="font-bold text-rose-500/40">MB (Req)</Typography>
                </div>
             </div>
             <Icon name="analytics" className="text-primary/10 group-hover:text-primary/20 absolute right-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
          </Card>
          
          <div className="grid grid-cols-2 gap-6">
             <Checkbox 
                label="Replace existing database" 
                checked={formData.replaceExisting} 
                onChange={(val) => handleInputChange('replaceExisting', val)} 
                description="Overwrite any existing database at target path."
             />
             <Checkbox 
                label="Unlink source database" 
                checked={formData.deleteSource} 
                onChange={(val) => handleInputChange('deleteSource', val)} 
                description="Remove the source database after successful cloning."
             />
          </div>
        </section>
      </div>
    </Modal>
  );
}
