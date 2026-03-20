import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreateDatabaseModal } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Table from '../../../components/ui/Layout/Table';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';
import Checkbox from '../../../components/ui/Forms/Checkbox';
import Toggle from '../../../components/ui/Forms/Toggle';
import Alert from '../../../components/ui/Feedback/Alert';

const PAGE_SIZES = [4096, 8192, 16384, 32768];
const LOCALES = [
  { value: 'en_US.iso88591', label: 'en_US.iso88591 (English, Western European)' },
  { value: 'en_US.utf8', label: 'en_US.utf8 (English, Universal)' },
  { value: 'ko_KR.euckr', label: 'ko_KR.euckr (Korean, Legacy)' },
  { value: 'ko_KR.utf8', label: 'ko_KR.utf8 (Korean, Universal)' },
  { value: 'user_defined', label: 'User Defined' }
];

const VOLUME_TYPES = ['data', 'index', 'temp', 'generic'];

export default function CreateDatabaseModal() {
  const dispatch = useDispatch();
  const { isCreateDatabaseModalOpen } = useSelector((state) => state.database);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dbName: '',
    pageSize: 16384,
    locale: 'en_US.utf8',
    userDefinedLocale: '',
    genericVolPath: '/home/cubrid/databases',
    genericVolSize: 512,
    logVolPath: '/home/cubrid/databases',
    logVolSize: 512,
    logPageSize: 16384,
    autoStart: true,
    volumes: [
      { name: 'data_vol_001', type: 'data', size: 512, path: '/home/cubrid/databases' },
      { name: 'index_vol_001', type: 'index', size: 512, path: '/home/cubrid/databases' },
      { name: 'temp_vol_001', type: 'temp', size: 512, path: '/home/cubrid/databases' }
    ],
    dbaPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (formData.dbName) {
      const dbName = formData.dbName;
      setFormData(prev => ({
        ...prev,
        genericVolPath: `/home/cubrid/databases/${dbName}`,
        logVolPath: `/home/cubrid/databases/${dbName}`,
        volumes: prev.volumes.map(vol => ({
          ...vol,
          name: `${dbName}_${vol.type}_001`,
          path: `/home/cubrid/databases/${dbName}`
        }))
      }));
    }
  }, [formData.dbName]);

  if (!isCreateDatabaseModalOpen) return null;

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVolumeChange = (index, field, value) => {
    const newVolumes = [...formData.volumes];
    newVolumes[index] = { ...newVolumes[index], [field]: value };
    setFormData(prev => ({ ...prev, volumes: newVolumes }));
  };

  const addVolume = () => {
    const type = 'data';
    const name = `${formData.dbName}_${type}_${String(formData.volumes.length + 1).padStart(3, '0')}`;
    setFormData(prev => ({
      ...prev,
      volumes: [...prev.volumes, { name, type, size: 512, path: prev.genericVolPath }]
    }));
  };

  const removeVolume = (index) => {
    setFormData(prev => ({
      ...prev,
      volumes: prev.volumes.filter((_, i) => i !== index)
    }));
  };

  const isFormValid = () => {
    if (step === 1) return formData.dbName && formData.genericVolPath && formData.logVolPath;
    if (step === 3) return formData.dbaPassword && formData.dbaPassword === formData.confirmPassword;
    return true;
  };

  const handleFinish = () => {
    dispatch(closeCreateDatabaseModal());
    dispatch(showStatusModal({
      type: 'success',
      title: 'Database Created',
      message: `The database "${formData.dbName}" has been successfully configured. (Backend API integration skipped per user request).`
    }));
  };

  const footer = (
    <div className="flex justify-between items-center w-full">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-primary shadow-sm' : 'w-1.5 bg-muted'}`}></div>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost"
          onClick={() => dispatch(closeCreateDatabaseModal())}
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button 
              variant="secondary"
              icon="arrow_back"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button 
              disabled={!isFormValid()}
              icon="arrow_forward"
              iconPosition="right"
              onClick={handleNext}
            >
              Continue
            </Button>
          ) : (
            <Button 
              icon="done_all"
              className="px-8"
              onClick={handleFinish}
            >
              Create database
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isCreateDatabaseModalOpen}
      onClose={() => dispatch(closeCreateDatabaseModal())}
      title="Create database wizard"
      subtitle={`Step ${step} of 4: ${step === 1 ? 'General info' : step === 2 ? 'Volumes' : step === 3 ? 'Access' : 'Summary'}`}
      icon="add_circle"
      footer={footer}
      maxWidth="max-w-[800px]"
    >
      <div className="space-y-8">
        {/* Progress Stepper */}
        <div className="flex items-center gap-1.5 overflow-hidden px-1 max-w-sm mx-auto mb-4">
          {[1, 2, 3, 4].map(i => (
            <React.Fragment key={i}>
              <div className={`
                flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-300 relative shrink-0
                ${step >= i ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'bg-transparent border-border text-muted-foreground'}
              `}>
                {step > i ? <Icon name="check" size="sm" weight={600} /> : <span className="text-[11px] font-black">{i}</span>}
              </div>
              {i < 4 && <div className={`flex-1 h-[1.5px] rounded-full transition-all duration-500 ${step > i ? 'bg-primary' : 'bg-muted'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: General Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Database name"
                value={formData.dbName}
                onChange={(e) => handleInputChange('dbName', e.target.value)}
                placeholder="e.g. production_db"
                icon="database"
              />
              <Select 
                label="Page size"
                value={formData.pageSize}
                options={PAGE_SIZES.map(s => ({ value: s, label: `${s / 1024} KB (${s} bytes)` }))}
                onChange={(val) => handleInputChange('pageSize', Number(val))}
              />
            </div>

            <Select 
              label="Locale & charset"
              value={formData.locale}
              options={LOCALES}
              onChange={(val) => handleInputChange('locale', val)}
              icon="language"
            />
            
            {formData.locale === 'user_defined' && (
              <Input 
                label="User-defined locale"
                value={formData.userDefinedLocale}
                onChange={(e) => handleInputChange('userDefinedLocale', e.target.value)}
                placeholder="Enter custom locale (e.g. de_DE.utf8)"
                className="border-primary/30"
              />
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-muted/20 rounded-lg border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="flex items-center gap-2">
                    <Icon name="storage" className="text-primary" /> Generic volume
                  </Typography>
                  <Typography variant="label" className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">Req</Typography>
                </div>
                <div className="space-y-3">
                  <Input label="Path" value={formData.genericVolPath} readOnly disabled />
                  <Input 
                    label="Size (MB)" 
                    type="number" 
                    value={formData.genericVolSize} 
                    onChange={(e) => handleInputChange('genericVolSize', Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h6" className="flex items-center gap-2">
                    <Icon name="history" className="text-primary" /> Log volume
                  </Typography>
                  <Typography variant="label" className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">Req</Typography>
                </div>
                <div className="space-y-3">
                  <Input label="Path" value={formData.logVolPath} readOnly disabled />
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      label="Size (MB)" 
                      type="number" 
                      value={formData.logVolSize} 
                      onChange={(e) => handleInputChange('logVolSize', Number(e.target.value))} 
                    />
                    <Select 
                      label="Pg"
                      value={formData.logPageSize}
                      options={PAGE_SIZES.map(s => ({ value: s, label: `${s / 1024}K` }))}
                      onChange={(val) => handleInputChange('logPageSize', Number(val))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`
              flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg cursor-pointer group active:scale-[0.99] transition-all
            `} onClick={() => handleInputChange('autoStart', !formData.autoStart)}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${formData.autoStart ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                <Icon name={formData.autoStart ? 'flash_on' : 'flash_off'} />
              </div>
              <div className="flex-1">
                <Typography variant="span" className="font-bold">Auto-start database</Typography>
                <Typography variant="caption" className="block mt-0.5">Initialize and start automatically after creation.</Typography>
              </div>
              <Toggle checked={formData.autoStart} onChange={(val) => handleInputChange('autoStart', val)} />
            </div>
          </div>
        )}

        {/* STEP 2: Volume Configuration */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" className="font-bold tracking-tight">Volume management</Typography>
                <Typography variant="caption" className="font-medium">Configure operational distribution for data and indexing.</Typography>
              </div>
              <Button 
                size="sm" 
                icon="add_circle"
                onClick={addVolume}
              >
                Add volume
              </Button>
            </div>

            <Table 
              columns={[
                { 
                  header: 'Name', 
                  accessor: 'name',
                  render: (row) => {
                    const idx = formData.volumes.indexOf(row);
                    return (
                      <input 
                        className="bg-transparent border-none w-full focus:ring-0 p-0 text-[12px] font-medium"
                        value={row.name}
                        onChange={(e) => handleVolumeChange(idx, 'name', e.target.value)}
                      />
                    );
                  }
                },
                { 
                  header: 'Type', 
                  accessor: 'type',
                  width: '140px',
                  render: (row) => {
                    const idx = formData.volumes.indexOf(row);
                    return (
                      <Select 
                        className="h-7"
                        value={row.type}
                        options={VOLUME_TYPES}
                        onChange={(val) => handleVolumeChange(idx, 'type', val)}
                      />
                    );
                  }
                },
                { 
                  header: 'Size (MB)', 
                  accessor: 'size',
                  width: '100px',
                  render: (row) => {
                    const idx = formData.volumes.indexOf(row);
                    return (
                      <input 
                        type="number"
                        className="bg-muted/30 border border-border rounded-md w-full h-7 text-center focus:ring-1 focus:ring-primary/50 outline-none text-[12px] font-bold"
                        value={row.size}
                        onChange={(e) => handleVolumeChange(idx, 'size', Number(e.target.value))}
                      />
                    );
                  }
                },
                { 
                  header: 'Path', 
                  accessor: 'path',
                  render: (row) => {
                    const idx = formData.volumes.indexOf(row);
                    return (
                      <input 
                        className="bg-transparent border-none w-full focus:ring-0 p-0 text-[12px] font-medium text-muted-foreground"
                        value={row.path}
                        onChange={(e) => handleVolumeChange(idx, 'path', e.target.value)}
                      />
                    );
                  }
                },
                { 
                  header: 'Act', 
                  accessor: 'actions',
                  width: '50px',
                  render: (row) => {
                    const idx = formData.volumes.indexOf(row);
                    return (
                      <button 
                        onClick={() => removeVolume(idx)}
                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    );
                  }
                }
              ]}
              data={formData.volumes}
            />
            
            <Alert variant="info">
               Advanced allocation: Ensure that the distribution of volumes across physical paths optimizes I/O performance.
            </Alert>
          </div>
        )}

        {/* STEP 3: DBA Password */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 max-w-sm mx-auto py-4 space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-sm">
                <Icon name="admin_panel_settings" size="xl" />
              </div>
              <div>
                <Typography variant="h4" className="font-bold">Set admin password</Typography>
                <Typography variant="p" className="text-muted-foreground">The <span className="text-primary font-bold tracking-widest uppercase">dba</span> account security policy.</Typography>
              </div>
            </div>

            <div className="space-y-4">
              <Input 
                label="DBA password"
                type="password"
                value={formData.dbaPassword}
                onChange={(e) => handleInputChange('dbaPassword', e.target.value)}
                placeholder="••••••••••••"
              />
              <Input 
                label="Confirm password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="••••••••••••"
                error={formData.confirmPassword && formData.dbaPassword !== formData.confirmPassword ? "Passwords do not match" : null}
              />
            </div>

            <Card className="bg-muted/10">
               <div className="flex items-center gap-2 mb-3">
                 <Icon name="security" size="sm" className="text-primary" />
                 <Typography variant="label" className="text-muted-foreground">Policy tracker</Typography>
               </div>
               <div className="space-y-2">
                 {[
                   { text: 'Min 8 characters', checked: formData.dbaPassword.length >= 8 },
                   { text: 'Letters & numbers', checked: /[a-zA-Z]/.test(formData.dbaPassword) && /\d/.test(formData.dbaPassword) },
                   { text: 'Special symbols', checked: /[!@#$%^&*(),.?":{}|<>]/.test(formData.dbaPassword) },
                 ].map((rule, i) => (
                   <div key={i} className="flex items-center gap-2">
                      <Icon 
                        name={rule.checked ? 'check_circle' : 'circle'} 
                        size="sm" 
                        className={rule.checked ? 'text-primary' : 'text-muted-foreground/30'} 
                      />
                      <Typography variant="span" className={rule.checked ? 'text-primary' : 'text-muted-foreground font-medium'}>
                        {rule.text}
                      </Typography>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        )}

        {/* STEP 4: Summary */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
            <Alert variant="success" icon="fact_check" title="Configuration complete">
               Initialization will start based on the parameters above.
            </Alert>

            <div className="grid grid-cols-2 gap-6">
               <Card title="Baseline" className="bg-muted/10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <Typography variant="caption">Name</Typography>
                        <Typography variant="span" className="font-bold text-primary">{formData.dbName}</Typography>
                     </div>
                     <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <Typography variant="caption">Pg. size</Typography>
                        <Typography variant="span" className="font-bold">{formData.pageSize / 1024} KB</Typography>
                     </div>
                     <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <Typography variant="caption">Locale</Typography>
                        <Typography variant="span" className="font-bold truncate max-w-[120px]">
                          {formData.locale === 'user_defined' ? formData.userDefinedLocale : formData.locale}
                        </Typography>
                     </div>
                  </div>
               </Card>

               <Card title="Storage forecast" className="bg-muted/10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <Typography variant="caption">Vol. count</Typography>
                        <Typography variant="span" className="font-bold text-primary">{formData.volumes.length + 2}</Typography>
                     </div>
                     <div className="flex justify-between items-center border-b border-border/50 pb-2">
                        <Typography variant="caption">Log space</Typography>
                        <Typography variant="span" className="font-bold">{formData.logVolSize} MB</Typography>
                     </div>
                     <div className="flex justify-between items-center pt-1">
                        <Typography variant="span" className="font-bold">Total est.</Typography>
                        <Typography variant="h5" className="font-black text-primary">
                           {formData.genericVolSize + formData.logVolSize + formData.volumes.reduce((acc, v) => acc + v.size, 0)} MB
                        </Typography>
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
