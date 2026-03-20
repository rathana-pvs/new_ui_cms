import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeAddVolumeModal, addVolume } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { showStatusModal } from '../../layout/layoutSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';

export default function AddVolumeModal() {
  const dispatch = useDispatch();
  const { isAddVolumeModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [volStatus, setVolStatus] = useState({ freespace: '', volpath: '' });
  const [volName, setVolName] = useState('');
  const [purpose, setPurpose] = useState('generic');
  const [path, setPath] = useState('');
  const [numberOfPages, setNumberOfPages] = useState('32768'); // Default 512MB
  const [sizeMB, setSizeMB] = useState('512.000');
  
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAddVolumeModalOpen && selectedHostUid && selectedDatabase) {
      const fetchStatus = async () => {
        setFetchingStatus(true);
        setError(null);
        try {
          const response = await databaseApi.getAddVolStatus(selectedHostUid, selectedDatabase);
          setVolStatus(response);
          setPath(response.volpath || '');
        } catch (err) {
          console.error('Failed to fetch add volume status:', err);
        } finally {
          setFetchingStatus(false);
        }
      };
      fetchStatus();
      setVolName('');
      setPurpose('generic');
      setNumberOfPages('32768');
      setSizeMB('512.000');
    }
  }, [isAddVolumeModalOpen, selectedHostUid, selectedDatabase]);

  if (!isAddVolumeModalOpen) return null;

  const handleAdd = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        volname: volName,
        purpose,
        path,
        numberofpages: numberOfPages,
        size_need_mb: `${sizeMB}(MB)`
      };
      await dispatch(addVolume({ hostUid: selectedHostUid, dbname: selectedDatabase, payload })).unwrap();
      dispatch(showStatusModal({ type: 'success', title: 'Volume Added', message: `Successfully added "${purpose}" volume to ${selectedDatabase}.` }));
    } catch (err) {
      setError(err || 'Failed to add volume.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeAddVolumeModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleAdd} loading={loading} icon="add_to_drive" disabled={!path || !numberOfPages}>Add Volume</Button>
    </div>
  );

  const purposeOptions = [
    { value: 'data', label: 'Data - Storage for user tables' },
    { value: 'index', label: 'Index - B-tree index storage' },
    { value: 'generic', label: 'Generic - Balanced storage type' },
    { value: 'temp', label: 'Temporary - Sort/query workspace' },
  ];

  return (
    <Modal
      isOpen={isAddVolumeModalOpen}
      onClose={() => dispatch(closeAddVolumeModal())}
      title="Add Database Volume"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="add_to_drive"
      footer={footer}
      maxWidth="max-w-[520px]"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {error && <Alert variant="error" title="Allocation failure" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Storage Context</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <Card className="p-4 border-border/50 bg-background shadow-sm space-y-2">
                <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">Free Disk Space</Typography>
                <div className="flex items-center gap-2">
                   {fetchingStatus ? (
                     <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                   ) : (
                     <Icon name="sd_storage" size="xs" className="text-secondary opacity-60" />
                   )}
                   <Typography variant="h4" className="font-black">{volStatus.freespace || '...'}</Typography>
                </div>
             </Card>
             <Card className="p-4 border-border/50 bg-background shadow-sm space-y-2">
                <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">Database</Typography>
                <div className="flex items-center gap-2">
                   <Icon name="database" size="xs" className="text-primary opacity-60" />
                   <Typography variant="h4" className="font-black">{selectedDatabase}</Typography>
                </div>
             </Card>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-secondary/60">Allocation Parameters</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
             <Select 
                label="Volume Purpose"
                value={purpose}
                onChange={setPurpose}
                options={purposeOptions}
                icon="settings_input_component"
             />
             <Input 
                label="Volume Name (Optional)" 
                value={volName} 
                onChange={setVolName} 
                placeholder="e.g. data_vol_1"
                icon="title"
             />
          </div>

          <Input 
            label="Storage Path" 
            value={path} 
            onChange={setPath} 
            placeholder="/path/to/volume/storage"
            icon="folder_open"
          />

          <div className="grid grid-cols-2 gap-6">
             <Input 
                label="Volume Size (MB)" 
                type="number"
                value={sizeMB}
                onChange={(mb) => {
                  setSizeMB(mb);
                  const pages = Math.floor((parseFloat(mb) || 0) * 1024 / 16);
                  setNumberOfPages(pages.toString());
                }}
                icon="straighten"
             />
             <Card className="p-4 bg-muted/5 border-dashed border-border flex items-center justify-between">
                <div className="space-y-0.5">
                   <Typography variant="caption" className="font-black uppercase tracking-widest text-[8px] opacity-40">Calculated Pages</Typography>
                   <Typography variant="h4" className="font-black text-primary">{numberOfPages}</Typography>
                </div>
                <Icon name="auto_mode" className="text-primary/20" />
             </Card>
          </div>

          <Alert variant="info" title="Dynamic Allocation" icon="info" className="bg-primary/5 border-primary/20">
             Scaling storage dynamically allows your system to grow without service interruption. Ensure the CUBRID engine has write permissions for the specified path.
          </Alert>
        </section>
      </div>
    </Modal>
  );
}
