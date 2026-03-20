import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDatabaseInfoModal, fetchDatabaseParamDump } from '../databaseSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Table from '../../../components/ui/Layout/Table';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function DatabaseInfoModal() {
  const dispatch = useDispatch();
  const { isDatabaseInfoModalOpen, selectedDatabase, databaseInfoData, databaseInfoLoading, databaseInfoError, activeDatabases } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [step, setStep] = useState('setup'); // 'setup' or 'results'
  const [dumpBoth, setDumpBoth] = useState(false);

  const isActive = activeDatabases.includes(selectedDatabase);

  useEffect(() => {
    if (isDatabaseInfoModalOpen) {
      setStep('setup');
      setDumpBoth(false);
    }
  }, [isDatabaseInfoModalOpen]);

  if (!isDatabaseInfoModalOpen) return null; // Safety check

  const handleRunDump = () => {
    if (selectedHostUid && selectedDatabase) {
      dispatch(fetchDatabaseParamDump({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        both: dumpBoth ? 'y' : 'n' 
      })).unwrap().then(() => setStep('results'));
    }
  };

  const handleClose = () => dispatch(closeDatabaseInfoModal());

  const rawData = databaseInfoData[selectedDatabase] || {};
  const serverParams = (rawData.server && rawData.server.length > 0) ? rawData.server[0] : {};
  const clientParams = (rawData.client && rawData.client.length > 0) ? rawData.client[0] : null;

  const allKeys = Array.from(new Set([
    ...Object.keys(serverParams),
    ...(clientParams ? Object.keys(clientParams) : [])
  ])).sort();

  const paramList = allKeys.map(key => ({
    name: key,
    server: serverParams[key] !== undefined ? (typeof serverParams[key] === 'boolean' ? (serverParams[key] ? 'yes' : 'no') : String(serverParams[key])) : '-',
    client: clientParams ? (clientParams[key] !== undefined ? (typeof clientParams[key] === 'boolean' ? (clientParams[key] ? 'yes' : 'no') : String(clientParams[key])) : '-') : null
  }));

  const columns = [
    { key: 'name', title: 'Parameter Identifier', className: 'w-[50%] font-bold' },
    { key: 'server', title: 'Server Value', className: dumpBoth ? 'w-[25%]' : 'w-[50%]' },
    ...(dumpBoth ? [{ key: 'client', title: 'Client Value', className: 'w-[25%] text-center opacity-70' }] : [])
  ];

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={handleClose}>Discard</Button>
      {step === 'setup' ? (
        <Button variant="primary" onClick={handleRunDump} loading={databaseInfoLoading} icon="database">Execute Dump</Button>
      ) : (
        <Button variant="secondary" onClick={() => setStep('setup')} icon="settings">Adjust Settings</Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isDatabaseInfoModalOpen}
      onClose={handleClose}
      title="Used Parameter Dump"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="database"
      footer={footer}
      maxWidth={step === 'setup' ? "max-w-[480px]" : "max-w-[800px]"}
    >
      <div className="space-y-6">
        {databaseInfoError && <Alert variant="error" title="Dump failed" onClose={handleClose}>{databaseInfoError}</Alert>}

        {step === 'setup' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
             <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Target Scope</Typography>
                   <div className="flex-1 h-[1px] bg-border/50"></div>
                </div>
                <Card className="bg-muted/10 border-border/50 py-3 px-4 flex items-center justify-between">
                   <Typography variant="h4" className="text-secondary font-black">{selectedDatabase}</Typography>
                   <Icon name="dns" size="sm" className="opacity-20" />
                </Card>
             </section>

             <Card className="p-4 bg-primary/5 border-primary/10 flex gap-4">
                <Icon name="info" className="text-primary" />
                <Typography variant="caption" className="opacity-70 leading-relaxed font-medium">
                  This utility captures the actual parameter values currently active in the database memory. It provides a real-time snapshot of the configuration state.
                </Typography>
             </Card>

             <section className="space-y-4">
                <div className={`p-4 border rounded-xl flex items-center justify-between group transition-all ${isActive ? 'border-border cursor-pointer hover:border-primary/50' : 'border-border/30 opacity-40 grayscale pointer-events-none'}`} onClick={() => isActive && setDumpBoth(!dumpBoth)}>
                   <div className="flex flex-col">
                      <Typography variant="span" className="font-bold block tracking-tight">Differential Dump</Typography>
                      <Typography variant="caption" className="opacity-50 block leading-tight">Include both client and server runtime parameters.</Typography>
                   </div>
                   <Checkbox checked={dumpBoth} onChange={setDumpBoth} disabled={!isActive} />
                </div>
             </section>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
             <div className="flex items-center justify-between px-2">
                <Typography variant="caption" className="font-black uppercase tracking-widest text-primary flex items-center gap-2">
                   <Icon name="analytics" size="xs" /> Runtime Cache Manifest
                </Typography>
                <div className="flex items-center gap-2 px-3 py-1 bg-muted/10 border border-border/50 rounded-lg">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <Typography variant="caption" className="font-bold opacity-60">Synchronized</Typography>
                </div>
             </div>
             <div className="border border-border rounded-xl overflow-hidden shadow-sm max-h-[500px] overflow-y-auto">
                <Table columns={columns} data={paramList} loading={databaseInfoLoading} />
             </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
