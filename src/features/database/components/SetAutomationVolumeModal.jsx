import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeSetAutomationVolumeModal, fetchAutoVolumeConfig, updateAutoVolumeConfig } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Input from '../../../components/ui/Forms/Input';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function SetAutomationVolumeModal() {
  const dispatch = useDispatch();
  const { isSetAutomationVolumeModalOpen, selectedDatabase, autoVolumeConfig, autoVolumeLoading } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  // Data Settings
  const [dataEnabled, setDataEnabled] = useState(false);
  const [dataThreshold, setDataThreshold] = useState(15);
  const [dataAddSize, setDataAddSize] = useState(2048);
  
  // Index Settings
  const [indexEnabled, setIndexEnabled] = useState(false);
  const [indexThreshold, setIndexThreshold] = useState(15);
  const [indexAddSize, setIndexAddSize] = useState(2048);

  useEffect(() => {
    if (isSetAutomationVolumeModalOpen && selectedHostUid && selectedDatabase) {
      dispatch(fetchAutoVolumeConfig({ hostUid: selectedHostUid, dbname: selectedDatabase }));
    }
  }, [isSetAutomationVolumeModalOpen, selectedHostUid, selectedDatabase, dispatch]);

  useEffect(() => {
    const config = autoVolumeConfig[selectedDatabase];
    if (config) {
      setDataEnabled(config.data === 'ON');
      setDataThreshold(config.data_warn_outofspace ? Math.round(parseFloat(config.data_warn_outofspace) * 100) : 15);
      setDataAddSize(config.data_ext_page ? (parseInt(config.data_ext_page) * 16384 / 1024 / 1024) : 2048);
      
      setIndexEnabled(config.index === 'ON');
      setIndexThreshold(config.index_warn_outofspace ? Math.round(parseFloat(config.index_warn_outofspace) * 100) : 15);
      setIndexAddSize(config.index_ext_page ? (parseInt(config.index_ext_page) * 16384 / 1024 / 1024) : 2048);
    }
  }, [autoVolumeConfig, selectedDatabase]);

  if (!isSetAutomationVolumeModalOpen) return null;

  const handleSave = async () => {
    const payload = {
      data: dataEnabled ? 'ON' : 'OFF',
      data_warn_outofspace: (dataThreshold / 100).toFixed(2),
      data_ext_page: Math.floor(dataAddSize * 1024 * 1024 / 16383).toString(), // Using 16383 to avoid off-by-one with 16384 if needed, but 16384 is standard
      index: indexEnabled ? 'ON' : 'OFF',
      index_warn_outofspace: (indexThreshold / 100).toFixed(2),
      index_ext_page: Math.floor(indexAddSize * 1024 * 1024 / 16384).toString()
    };

    const result = await dispatch(updateAutoVolumeConfig({ hostUid: selectedHostUid, dbname: selectedDatabase, payload }));
    if (!result.error) {
      dispatch(closeSetAutomationVolumeModal());
      dispatch(showStatusModal({ type: 'success', title: 'Policy Applied', message: `Automation policies for ${selectedDatabase} updated successfully.` }));
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeSetAutomationVolumeModal())}>Discard</Button>
      <Button variant="primary" onClick={handleSave} icon="save">Apply Policy</Button>
    </div>
  );

  const ConfigGroup = ({ title, icon, enabled, setEnabled, threshold, setThreshold, addSize, setAddSize, color }) => (
    <Card className={`p-5 transition-all duration-500 border-border/50 ${enabled ? 'bg-muted/5' : 'bg-background opacity-60'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon name={icon} size="sm" className={`${enabled ? color : 'text-foreground/20'}`} />
          <Typography variant="h4" className="font-bold tracking-tight">{title}</Typography>
        </div>
        <Checkbox 
           checked={enabled} 
           onChange={setEnabled} 
           className="scale-110"
        />
      </div>

      <div className={`space-y-6 transition-all duration-300 ${enabled ? 'opacity-100' : 'opacity-20 pointer-events-none grayscale-[0.5]'}`}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Typography variant="caption" className="font-black uppercase tracking-widest text-[9px] opacity-40">Trigger Threshold (%)</Typography>
            <Typography variant="span" className={`font-black ${color}`}>{threshold}%</Typography>
          </div>
          <input 
            type="range" min="5" max="30" step="1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border/50 accent-primary`}
          />
          <div className="flex justify-between px-1">
             <Typography variant="caption" className="text-[8px] opacity-30 font-bold">5%</Typography>
             <Typography variant="caption" className="text-[8px] opacity-30 font-bold">30%</Typography>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <Input 
              label="Expansion Size (MB)" 
              type="number"
              value={addSize}
              onChange={setAddSize}
              icon="straighten"
              variant="ghost"
              className="bg-background"
           />
           <div className="space-y-1.5">
              <Typography variant="caption" className="font-black uppercase tracking-widest text-[8px] opacity-40 ml-1">Extension Pages</Typography>
              <div className="h-9 px-3 flex items-center bg-background border border-dashed border-border rounded-[6px] text-[11px] font-mono font-bold text-foreground/40">
                {Math.floor(addSize * 1024 * 1024 / 16384)} pts
              </div>
           </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Modal
      isOpen={isSetAutomationVolumeModalOpen}
      onClose={() => dispatch(closeSetAutomationVolumeModal())}
      title="Automation Volume Policy"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="settings_suggest"
      footer={footer}
      maxWidth="max-w-[520px]"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {autoVolumeLoading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <Typography variant="caption" className="font-bold uppercase tracking-widest text-[10px] opacity-40">Fetching Active Policies...</Typography>
          </div>
        )}

        {!autoVolumeLoading && (
          <>
            <Alert variant="info" title="Policy Overview" icon="info_outline" className="bg-primary/5 border-primary/20">
               Define automatic disk expansion triggers for your storage sets. Thresholds specify when the engine should allocate new volumes.
            </Alert>

            <div className="space-y-6">
              <ConfigGroup 
                title="Data Storage" 
                icon="database" 
                enabled={dataEnabled} setEnabled={setDataEnabled}
                threshold={dataThreshold} setThreshold={setDataThreshold}
                addSize={dataAddSize} setAddSize={setDataAddSize}
                color="text-primary"
              />

              <ConfigGroup 
                title="Index Storage" 
                icon="list_alt" 
                enabled={indexEnabled} setEnabled={setIndexEnabled}
                threshold={indexThreshold} setThreshold={setIndexThreshold}
                addSize={indexAddSize} setAddSize={setIndexAddSize}
                color="text-secondary"
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
