import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closePlanDumpModal, fetchDatabasePlanDump } from '../databaseSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Input from '../../../components/ui/Forms/Input';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function DatabasePlanDumpModal() {
  const dispatch = useDispatch();
  const { isPlanDumpModalOpen, selectedDatabase, planDumpData, planDumpLoading, planDumpError } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [step, setStep] = useState('setup'); // 'setup' or 'results'
  const [planDrop, setPlanDrop] = useState(false);

  useEffect(() => {
    if (isPlanDumpModalOpen) {
      setStep('setup');
      setPlanDrop(false);
    }
  }, [isPlanDumpModalOpen]);

  if (!isPlanDumpModalOpen) return null;

  const handleRunDump = () => {
    if (selectedHostUid && selectedDatabase) {
      dispatch(fetchDatabasePlanDump({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        plandrop: planDrop ? 'y' : 'n' 
      })).unwrap().then(() => setStep('results'));
    }
  };

  const results = planDumpData[selectedDatabase] || {};
  let lines = [];
  if (results.log && Array.isArray(results.log) && results.log.length > 0) {
    lines = results.log[0].line || [];
  } else if (results.lines) {
    lines = results.lines;
  } else if (Array.isArray(results)) {
    lines = results;
  }

  const parseStats = () => {
    const stats = {};
    lines.forEach(l => {
      if (l.includes(':') && !l.includes('sql info')) {
        const [k, v] = l.split(':');
        if (k && v) stats[k.trim()] = v.trim();
      }
    });
    return stats;
  };

  const stats = parseStats();
  const hitRatio = stats['Hits'] && stats['Lookups'] 
    ? ((parseInt(stats['Hits']) / parseInt(stats['Lookups']) || 0) * 100).toFixed(1) 
    : '0.0';

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closePlanDumpModal())}>Close</Button>
      {step === 'setup' ? (
        <Button variant="primary" onClick={handleRunDump} loading={planDumpLoading} icon="play_arrow">Execute Dump</Button>
      ) : (
        <Button variant="secondary" onClick={() => setStep('setup')} icon="settings">Configure</Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isPlanDumpModalOpen}
      onClose={() => dispatch(closePlanDumpModal())}
      title="Plan Cache Dump"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="schema"
      footer={footer}
      maxWidth={step === 'setup' ? 'max-w-[480px]' : 'max-w-[850px]'}
    >
      <div className="space-y-6">
        {planDumpError && <Alert variant="error" title="Dump failure" onClose={() => dispatch(closePlanDumpModal())}>{planDumpError}</Alert>}

        {step === 'setup' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <section className="space-y-4">
                <Input label="Database Name" value={selectedDatabase} readOnly disabled variant="ghost" icon="database" />
                <Alert variant="info" title="Utility Description" icon="info">
                   This analysis tool displays the compiled execution plans currently residing in the database engine's XASL cache.
                </Alert>
             </section>

             <Card className="p-4 bg-muted/5 border-border/50">
                <Checkbox 
                  label="Drop all plans in server's cache before dump" 
                  checked={planDrop} 
                  onChange={setPlanDrop}
                  description="Recommended for isolating new query patterns or clearing legacy cache pressure."
                />
             </Card>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             {Object.keys(stats).length > 0 && (
               <section className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Hit Ratio', value: `${hitRatio}%`, icon: 'adjust', color: 'text-primary' },
                    { label: 'Cache Hits', value: stats['Hits'] || '0', icon: 'check_circle', color: 'text-emerald-500' },
                    { label: 'Cache Misses', value: stats['Miss'] || '0', icon: 'error', color: 'text-rose-500' },
                    { label: 'Total Entries', value: stats['Current entry count'] || '0', icon: 'layers', color: 'text-sky-500' }
                  ].map(stat => (
                    <Card key={stat.label} className="p-4 border-border/50 bg-background shadow-sm hover:border-primary/30 transition-all group">
                       <div className="flex items-center gap-2 mb-2">
                          <Icon name={stat.icon} size="xs" className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                          <Typography variant="caption" className="font-bold uppercase tracking-widest text-[9px] opacity-40">{stat.label}</Typography>
                       </div>
                       <Typography variant="h3" className="font-black tracking-tight">{stat.value}</Typography>
                    </Card>
                  ))}
               </section>
             )}

             <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-foreground/40">Raw XASL Plan Manifest</Typography>
                   <div className="flex-1 h-[1px] bg-border/50"></div>
                </div>
                
                <Card className="bg-muted/10 border-border overflow-hidden">
                   <div className="max-h-[400px] overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed">
                      {lines.length > 0 ? (
                        <div className="divide-y divide-border/30">
                           {lines.map((line, idx) => {
                             const isHeader = line.includes('XASL_ID') || line.includes('SQL_ID');
                             const isPlanLine = line.startsWith(' ') && line.trim() && !isHeader;
                             if (!line.trim()) return null;
                             return (
                               <div key={idx} className={`px-4 py-2 flex gap-4 transition-colors ${isHeader ? 'bg-primary/5' : 'hover:bg-primary/[0.02]'}`}>
                                  <span className="shrink-0 w-8 opacity-20 text-[9px] mt-0.5">{idx + 1}</span>
                                  <span className={`${isHeader ? 'text-primary font-bold' : isPlanLine ? 'text-secondary pl-4 border-l-2 border-secondary/20' : 'text-foreground/80'}`}>
                                     {line}
                                  </span>
                               </div>
                             );
                           })}
                        </div>
                      ) : (
                        <div className="p-12 text-center opacity-30 flex flex-col items-center gap-2">
                           <Icon name="subtitles_off" className="text-4xl" />
                           <Typography variant="caption" className="font-bold italic">No active query plans found in engine cache.</Typography>
                        </div>
                      )}
                   </div>
                </Card>
             </section>
          </div>
        )}
      </div>
    </Modal>
  );
}
