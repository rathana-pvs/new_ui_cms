import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeRenameDatabaseModal, renameDatabase, fetchDatabaseStartInfo } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function RenameDatabaseModal() {
  const dispatch = useDispatch();
  const { isRenameDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [newDbName, setNewDbName] = useState('');
  const [forcedel, setForcedel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isRenameDatabaseModalOpen) {
      setNewDbName('');
      setForcedel(false);
      setError(null);
    }
  }, [isRenameDatabaseModalOpen]);

  if (!isRenameDatabaseModalOpen) return null;

  const handleRename = async () => {
    if (!selectedHostUid || !selectedDatabase || !newDbName.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        rename: newDbName.trim(),
        exvolpath: 'none',
        advanced: 'off',
        forcedel: forcedel ? 'y' : 'n'
      };
      
      await dispatch(renameDatabase({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        payload 
      })).unwrap();
      
      dispatch(fetchDatabaseStartInfo(selectedHostUid));
      
      dispatch(showStatusModal({
        type: 'success',
        title: 'Rename successful',
        message: `Database "${selectedDatabase}" has been renamed to "${newDbName.trim()}".`
      }));
      dispatch(closeRenameDatabaseModal());
    } catch (err) {
      setError(err || 'Failed to rename database.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeRenameDatabaseModal())} disabled={loading}>Discard</Button>
      <Button 
        variant="primary" 
        onClick={handleRename} 
        loading={loading} 
        disabled={!newDbName.trim()}
        icon="drive_file_rename_outline"
      >
        Confirm Rename
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isRenameDatabaseModalOpen}
      onClose={() => dispatch(closeRenameDatabaseModal())}
      title="Rename database"
      subtitle={`Source: ${selectedDatabase} @ ${selectedHostUid}`}
      icon="drive_file_rename_outline"
      footer={footer}
      maxWidth="max-w-[460px]"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Rename failed" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Source Identity</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="bg-muted/10 border-border/50 py-3 px-4 flex items-center justify-between">
             <Typography variant="span" className="font-black text-secondary">{selectedDatabase}</Typography>
             <Icon name="database" size="sm" className="opacity-20" />
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Target Specification</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Input 
            label="New database name" 
            value={newDbName} 
            onChange={(e) => setNewDbName(e.target.value)} 
            placeholder="Unique identifier..." 
            icon="edit"
            autoFocus 
          />
          
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
             <Icon name="info" className="text-primary" />
             <Typography variant="caption" className="opacity-70 leading-relaxed font-medium">
               This operation migrates all volumes, log assets, and configuration files. Connections may be dropped during the migration.
             </Typography>
          </div>

          <div className="p-4 border border-border rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setForcedel(!forcedel)}>
             <div className="flex flex-col">
                <Typography variant="span" className="font-bold block tracking-tight">Overwrite destination</Typography>
                <Typography variant="caption" className="opacity-50 block leading-tight">Remove conflicting files at target location if any exist.</Typography>
             </div>
             <Checkbox checked={forcedel} onChange={setForcedel} />
          </div>
        </section>
      </div>
    </Modal>
  );
}
