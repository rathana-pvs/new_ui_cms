import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeEditBackupPlanModal, editBackupSchedule, fetchBackupSchedule } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';
import Toggle from '../../../components/ui/Forms/Toggle';
import Card from '../../../components/ui/Layout/Card';
import Alert from '../../../components/ui/Feedback/Alert';

export default function EditBackupPlanModal() {
  const dispatch = useDispatch();
  const { isEditBackupPlanModalOpen, selectedDatabase, selectedBackupId, loading, error } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [formData, setFormData] = useState({
    backupId: '',
    backupLevel: '0',
    backupPath: '',
    periodType: 'Monthly',
    periodDetail: [1],
    backupTime: '12:30',
    deleteArchive: false,
    checkConsistency: false,
    updateStatistics: false,
    useCompression: false,
    threads: 0,
    backupsToKeep: 0,
    onlineType: 'offline'
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (isEditBackupPlanModalOpen && selectedDatabase && selectedHostUid) {
      dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: selectedDatabase }))
        .unwrap()
        .then((data) => {
          const backupData = data?.backups || data?.backup_info;
          if (backupData) {
            const plans = Array.isArray(backupData) ? backupData : [backupData];
            const info = selectedBackupId ? plans.find(p => p.backupid === selectedBackupId) : plans[0];
            
            if (info) {
              let periodDetail = [];
              if (info.period_type === 'Special') {
                periodDetail = info.period_date || '';
              } else if (info.period_type === 'Weekly' && info.period_date) {
                const dayNameMap = {
                  'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 
                  'Friday': 5, 'Saturday': 6, 'Sunday': 7
                };
                const days = Array.isArray(info.period_date) ? info.period_date : info.period_date.split(',');
                periodDetail = days.map(day => day.trim()).filter(day => day && dayNameMap[day]).map(day => dayNameMap[day]);
              } else if (info.period_type === 'Monthly' && info.period_date) {
                const days = Array.isArray(info.period_date) ? info.period_date : info.period_date.split(',');
                periodDetail = days.map(Number).filter(day => !isNaN(day) && day >= 1 && day <= 31);
              }

              setFormData({
                backupId: info.backupid || '',
                backupLevel: info.level || '0',
                backupPath: info.path || '',
                periodType: info.period_type === 'Special' ? 'Specific days' : info.period_type,
                periodDetail: periodDetail,
                backupTime: info.time ? `${info.time.slice(0, 2)}:${info.time.slice(2)}` : '12:30',
                deleteArchive: info.archivedel === 'ON',
                updateStatistics: info.updatestatus === 'ON',
                useCompression: info.zip === 'y',
                checkConsistency: info.check === 'y',
                threads: parseInt(info.mt) || 0,
                backupsToKeep: parseInt(info.bknum) || 0,
                onlineType: info.onoff === 'ON' ? 'online' : 'offline'
              });
            }
          }
        });
    }
  }, [isEditBackupPlanModalOpen, selectedDatabase, selectedHostUid, selectedBackupId, dispatch]);

  if (!isEditBackupPlanModalOpen) return null;

  const handleInputChange = (field, value) => {
    if (field === 'periodType') {
      setFormData(prev => ({ 
        ...prev, 
        periodType: value,
        periodDetail: value === 'Daily' ? [] : (value === 'Specific days' ? new Date().toISOString().split('T')[0] : [1])
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const toggleDay = (day) => {
    const details = Array.isArray(formData.periodDetail) ? formData.periodDetail : [];
    setFormData(prev => ({
      ...prev,
      periodDetail: details.includes(day) ? details.filter(d => d !== day) : [...details, day]
    }));
  };

  const setBulkDays = (type) => {
    let days = [];
    switch(type) {
      case 'all': days = Array.from({length: 31}, (_, i) => i + 1); break;
      case 'clear': days = []; break;
      case 'weekdays': days = Array.from({length: 31}, (_, i) => i + 1).filter(d => (d % 7 !== 6 && d % 7 !== 0)); break;
      case 'weekends': days = Array.from({length: 31}, (_, i) => i + 1).filter(d => (d % 7 === 6 || d % 7 === 0)); break;
      case 'mid': days = [1, 15, 30]; break;
      case 'even': days = Array.from({length: 31}, (_, i) => i + 1).filter(d => d % 2 === 0); break;
      case 'odd': days = Array.from({length: 31}, (_, i) => i + 1).filter(d => d % 2 !== 0); break;
      default: days = [];
    }
    handleInputChange('periodDetail', days);
  };

  const handleSave = () => {
    if (!selectedDatabase || !selectedHostUid) return;

    let periodDateValue = '';
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (formData.periodType === 'Weekly') {
      periodDateValue = (Array.isArray(formData.periodDetail) ? formData.periodDetail : []).map(dayNum => dayNames[dayNum - 1]).join(',');
    } else if (formData.periodType === 'Monthly') {
      periodDateValue = (Array.isArray(formData.periodDetail) ? formData.periodDetail : []).join(',');
    } else if (formData.periodType === 'Specific days') {
      periodDateValue = formData.periodDetail || '';
    }

    const payload = {
      backupid: formData.backupId,
      level: formData.backupLevel,
      path: formData.backupPath,
      period_type: formData.periodType === 'Specific days' ? 'Special' : formData.periodType,
      period_date: periodDateValue,
      time: formData.backupTime.replace(':', ''),
      archivedel: formData.deleteArchive ? 'ON' : 'OFF',
      updatestatus: formData.updateStatistics ? 'ON' : 'OFF',
      zip: formData.useCompression ? 'y' : 'n',
      check: formData.checkConsistency ? 'y' : 'n',
      mt: formData.threads,
      bknum: formData.backupsToKeep,
      onoff: formData.onlineType === 'online' ? 'ON' : 'OFF',
    };

    dispatch(editBackupSchedule({ hostUid: selectedHostUid, dbname: selectedDatabase, payload }))
      .unwrap()
      .then(() => {
        dispatch(closeEditBackupPlanModal());
        dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: selectedDatabase }));
        dispatch(showStatusModal({ type: 'success', title: 'Schedule Updated', message: 'The backup schedule has been successfully updated.' }));
      });
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeEditBackupPlanModal())} disabled={loading}>
        Discard
      </Button>
      <Button variant="primary" onClick={handleSave} loading={loading} icon="play_circle" className="min-w-[150px]">
        Update schedule
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isEditBackupPlanModalOpen}
      onClose={() => dispatch(closeEditBackupPlanModal())}
      title="Edit backup plan"
      subtitle={`Modify automated scheduled backup for ${selectedDatabase}`}
      icon="backup_table"
      footer={footer}
      maxWidth="max-w-[700px]"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Update Failed">{error}</Alert>}
        
        {/* General Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">General settings</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Input label="Backup ID" value={formData.backupId} disabled readOnly />
            <Select
              label="Backup level"
              value={formData.backupLevel}
              onChange={(val) => handleInputChange('backupLevel', val)}
              options={[
                { value: '0', label: '0 (Full)' },
                { value: '1', label: '1 (First increment)' },
                { value: '2', label: '2 (Second increment)' }
              ]}
            />
            <div className="col-span-2">
              <Input 
                label="Backup path"
                value={formData.backupPath}
                onChange={(e) => handleInputChange('backupPath', e.target.value)}
                placeholder="/path/to/backups"
                className="flex-1"
              />
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Backup schedule</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="bg-muted/10 border-border/50 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <Select
                label="Period type"
                icon="event_repeat"
                value={formData.periodType}
                onChange={(val) => handleInputChange('periodType', val)}
                options={[
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'Weekly', label: 'Weekly' },
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Specific days', label: 'Specific days' }
                ]}
              />
              <div className="space-y-1.5">
                <Typography variant="label" className="text-muted-foreground ml-0.5">Backup time</Typography>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-9 px-3 text-[12px]" 
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    icon="history_toggle_off"
                    iconPosition="right"
                  >
                    {formData.backupTime}
                  </Button>
                  {showTimePicker && (
                    <div className="absolute top-full left-0 mt-2 z-[210] w-[200px] bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                       <div className="flex divide-x divide-border h-[200px]">
                          <div className="flex-1 overflow-y-auto custom-scrollbar bg-muted/20">
                             {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                               <button key={h} onClick={() => handleInputChange('backupTime', `${h}:${formData.backupTime.split(':')[1]}`)} className={`w-full py-2 text-[12px] hover:bg-primary/10 ${formData.backupTime.startsWith(h) ? 'bg-primary text-primary-foregroundfont-bold' : ''}`}>{h}</button>
                             ))}
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar">
                             {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).filter(m => parseInt(m) % 5 === 0).map(m => (
                               <button key={m} onClick={() => { handleInputChange('backupTime', `${formData.backupTime.split(':')[0]}:${m}`); setShowTimePicker(false); }} className={`w-full py-2 text-[12px] hover:bg-primary/10 ${formData.backupTime.endsWith(m) ? 'bg-primary text-primary-foreground font-bold' : ''}`}>{m}</button>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly/Weekly/Daily/Specfic Logic UI */}
            <div className="space-y-4">
              {formData.periodType === 'Monthly' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {['all', 'clear', 'weekdays', 'weekends', 'even', 'odd'].map(p => (
                      <Button key={p} size="sm" variant="ghost" className="text-[10px] uppercase font-black" onClick={() => setBulkDays(p)}>{p.replace('all', 'Select All')}</Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 p-4 bg-background border border-border rounded-lg relative overflow-hidden">
                    <Icon name="calendar_month" className="absolute -bottom-4 -right-4 text-[80px] opacity-[0.03] rotate-12" />
                    {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                      <button key={day} onClick={() => toggleDay(day)} className={`h-8 rounded-md text-[11px] font-bold transition-all border ${formData.periodDetail.includes(day) ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card border-border hover:border-primary/50'}`}>{day}</button>
                    ))}
                  </div>
                </div>
              )}

              {formData.periodType === 'Weekly' && (
                <div className="grid grid-cols-7 gap-2 p-2 bg-background border border-border rounded-lg">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                    <button key={d} onClick={() => toggleDay(i+1)} className={`h-9 rounded-md text-[11px] font-bold transition-all border ${formData.periodDetail.includes(i+1) ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border'}`}>{d}</button>
                  ))}
                </div>
              )}

              {formData.periodType === 'Daily' && (
                <Alert variant="success" icon="check_circle">Ready to run every day at {formData.backupTime}.</Alert>
              )}

              {formData.periodType === 'Specific days' && (
                <div className="p-4 bg-background border border-border rounded-lg flex items-center gap-4">
                  <Input 
                    type="date" 
                    label="Target Date" 
                    containerClassName="flex-1" 
                    value={formData.periodDetail} 
                    onChange={(e) => handleInputChange('periodDetail', e.target.value)} 
                  />
                  <Icon name="calendar_today" className="text-primary mt-6" />
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Options Flags */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Execution Flags</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="grid grid-cols-2 gap-x-8 gap-y-4 p-5 bg-muted/10 border-border/50">
            {[
              { id: 'deleteArchive', label: 'Delete archives', icon: 'auto_delete' },
              { id: 'updateStatistics', label: 'Update stats', icon: 'analytics' },
              { id: 'checkConsistency', label: 'Check consistency', icon: 'rule' },
              { id: 'useCompression', label: 'Use compression', icon: 'compress' },
            ].map(opt => (
              <div key={opt.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Icon name={opt.icon} size="sm" className={formData[opt.id] ? 'text-primary' : 'text-muted-foreground'} />
                  <Typography variant="span" className="font-medium text-[12px]">{opt.label}</Typography>
                </div>
                <Toggle checked={formData[opt.id]} onChange={(val) => handleInputChange(opt.id, val)} />
              </div>
            ))}
          </Card>
        </section>

        {/* Operation Flags */}
        <section className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Operation mode</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div 
               className={`p-4 rounded-lg border transition-all cursor-pointer space-y-1 ${formData.onlineType === 'online' ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border border-dashed opacity-60 hover:opacity-100'}`}
               onClick={() => handleInputChange('onlineType', 'online')}
             >
                <Typography variant="span" className="font-black text-[12px]">Online</Typography>
                <Typography variant="caption" className="block leading-tight">Database remains available during operation.</Typography>
             </div>
             <div 
               className={`p-4 rounded-lg border transition-all cursor-pointer space-y-1 ${formData.onlineType === 'offline' ? 'bg-destructive/5 border-destructive shadow-sm' : 'bg-card border-border border-dashed opacity-60 hover:opacity-100'}`}
               onClick={() => handleInputChange('onlineType', 'offline')}
             >
                <Typography variant="span" className="font-black text-[12px]">Offline</Typography>
                <Typography variant="caption" className="block leading-tight text-destructive-foreground/70">Database stops for maximum integrity.</Typography>
             </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
