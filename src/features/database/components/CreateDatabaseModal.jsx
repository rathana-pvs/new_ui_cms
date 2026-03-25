import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreateDatabaseModal } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

import { Icon } from '../../../components/ds/foundation/Icon';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Input } from '../../../components/ds/forms/Input';
import { Select } from '../../../components/ds/forms/Select';
import { Checkbox } from '../../../components/ds/forms/Checkbox';
import { RadioGroup } from '../../../components/ds/forms/Radio';
import { Divider } from '../../../components/ds/layout/Divider';
import { Typography } from '../../../components/ds/foundation/Typography';

const PAGE_SIZES = [4096, 8192, 16384, 32768];
const LOCALES = [
  { value: 'en_US.iso88591', label: 'en_US.iso88591 (English, Western European)' },
  { value: 'en_US.utf8', label: 'en_US.utf8 (English, Universal)' },
  { value: 'ko_KR.euckr', label: 'ko_KR.euckr (Korean, Legacy)' },
  { value: 'ko_KR.utf8', label: 'ko_KR.utf8 (Korean, Universal)' },
  { value: 'user_defined', label: 'User Defined' }
];

const VOLUME_TYPES = [
  { value: 'data', label: 'Data' },
  { value: 'index', label: 'Index' },
  { value: 'temp', label: 'Temp' },
  { value: 'generic', label: 'Generic' }
];


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

  return (
    <Modal
      isOpen={isCreateDatabaseModalOpen}
      onClose={() => dispatch(closeCreateDatabaseModal())}
      title="Create database wizard"
      subtitle={`Step ${step} of 4: ${
        step === 1 ? 'General info' : 
        step === 2 ? 'Volumes' : 
        step === 3 ? 'Access' : 'Summary'
      }`}
      icon="add_circle"
      maxWidth="800px"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-bk-yellow shadow-sm' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}></div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => dispatch(closeCreateDatabaseModal())}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="secondary" onClick={handleBack} icon="arrow_back">
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button 
                  variant="primary" 
                  onClick={handleNext} 
                  disabled={!isFormValid()}
                  iconPosition="right"
                  icon="arrow_forward"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handleFinish}
                  icon="done_all"
                  className="px-8"
                >
                  Create database
                </Button>
              )}
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stepper Progress */}
        <div className="flex items-center gap-1.5 mb-2 overflow-hidden px-1 max-w-sm mx-auto">
          {[1, 2, 3, 4].map(i => (
            <React.Fragment key={i}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-xl border transition-all duration-500 shrink-0
                ${step >= i ? 'bg-bk-yellow border-bk-yellow text-bk-side shadow-lg shadow-bk-yellow/20' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                {step > i ? (
                  <Icon name="check" size="sm" weight={300} className="font-black" />
                ) : (
                  <Typography variant="label" className="font-black text-[11px]">{i}</Typography>
                )}
              </div>
              {i < 4 && (
                <div className={`flex-1 h-[2px] rounded-full transition-all duration-700 ${step > i ? 'bg-bk-yellow' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: General Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <section className="space-y-4">
              <Divider label="Basic configuration" />
              <div className="grid grid-cols-2 gap-4">
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
                  onChange={(e) => handleInputChange('pageSize', parseInt(e.target.value))}
                  options={PAGE_SIZES.map(s => ({ value: s, label: `${s / 1024} KB (${s} bytes)` }))}
                />
              </div>
            </section>

            <section className="space-y-4">
              <Divider label="Locale & encoding" />
              <Select 
                label="Region locale"
                value={formData.locale}
                onChange={(e) => handleInputChange('locale', e.target.value)}
                options={LOCALES}
                icon="language"
              />
              
              {formData.locale === 'user_defined' && (
                <Input 
                  label="User-defined locale"
                  value={formData.userDefinedLocale}
                  onChange={(e) => handleInputChange('userDefinedLocale', e.target.value)}
                  placeholder="Enter custom locale (e.g. de_DE.utf8)"
                  className="animate-in slide-in-from-top-1"
                />
              )}
            </section>

            <section className="space-y-4">
              <Divider label="Initial volume paths" />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/50 dark:bg-bk-main/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Typography variant="label" className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                      <Icon name="storage" size="sm" weight={300} className="text-bk-yellow" /> Generic volume
                    </Typography>
                    <Typography variant="label" className="text-[10px] bg-bk-yellow/10 text-bk-yellow px-1.5 py-0.5 rounded font-black uppercase">Required</Typography>
                  </div>
                  <div className="space-y-3">
                    <Input label="Path (Read-only)" value={formData.genericVolPath} disabled size="sm" />
                    <Input 
                      label="Initial size (MB)" 
                      type="number" 
                      value={formData.genericVolSize}
                      onChange={(e) => handleInputChange('genericVolSize', Number(e.target.value))}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-bk-main/20 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Typography variant="label" className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                       <Icon name="history" size="sm" weight={300} className="text-bk-yellow" /> Log volume
                    </Typography>
                    <Typography variant="label" className="text-[10px] bg-bk-yellow/10 text-bk-yellow px-1.5 py-0.5 rounded font-black uppercase">Required</Typography>
                  </div>
                  <div className="space-y-3">
                    <Input label="Path (Read-only)" value={formData.logVolPath} disabled size="sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        label="Size (MB)" 
                        type="number" 
                        value={formData.logVolSize}
                        onChange={(e) => handleInputChange('logVolSize', Number(e.target.value))}
                        size="sm"
                      />
                      <Select 
                        label="Pg size"
                        value={formData.logPageSize}
                        onChange={(e) => handleInputChange('logPageSize', parseInt(e.target.value))}
                        options={PAGE_SIZES.map(s => ({ value: s, label: `${s / 1024}K` }))}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-bk-yellow/10 flex items-center justify-center text-bk-yellow border border-bk-yellow/20">
                <Icon name={formData.autoStart ? 'flash_on' : 'flash_off'} size="md" weight={300} />
              </div>
              <div className="flex-1">
                <Typography variant="p" className="text-slate-900 dark:text-white font-bold">Auto-start database</Typography>
                <Typography variant="p" className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Initialize and start automatically after creation.</Typography>
              </div>
              <Checkbox 
                checked={formData.autoStart}
                onChange={(e) => handleInputChange('autoStart', e.target.checked)}
              />
            </div>
          </div>
        )}

          {/* STEP 2: Volume Configuration */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h3" className="text-slate-900 dark:text-white">Volume management</Typography>
                  <Typography variant="p" className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Configure operational distribution for data and indexing.</Typography>
                </div>
                <Button variant="primary" onClick={addVolume} icon="add_circle" size="sm">
                  Add volume
                </Button>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-bk-main/10">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-white/[0.03]">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 uppercase">Name</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-wider w-40 border-b border-slate-100 dark:border-slate-800 uppercase">Type</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-wider w-32 border-b border-slate-100 dark:border-slate-800 uppercase text-center">Size (MB)</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 uppercase">Path</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-wider w-12 border-b border-slate-100 dark:border-slate-800 uppercase text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {formData.volumes.map((vol, idx) => (
                      <tr key={idx} className="group hover:bg-white dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-2">
                          <Input 
                            value={vol.name} 
                            onChange={(e) => handleVolumeChange(idx, 'name', e.target.value)}
                            size="sm"
                            className="bg-transparent border-none p-0 focus:ring-0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Select 
                            value={vol.type}
                            onChange={(e) => handleVolumeChange(idx, 'type', e.target.value)}
                            options={VOLUME_TYPES}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Input 
                            type="number" 
                            value={vol.size} 
                            onChange={(e) => handleVolumeChange(idx, 'size', Number(e.target.value))}
                            size="sm"
                            className="text-center"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input 
                            value={vol.path} 
                            onChange={(e) => handleVolumeChange(idx, 'path', e.target.value)}
                            size="sm"
                            className="bg-transparent border-none p-0 focus:ring-0 text-slate-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => removeVolume(idx)}
                            icon="close"
                            className="border-none bg-transparent hover:bg-rose-500/10 hover:text-rose-500 p-1 h-7 w-7"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-bk-yellow/5 rounded-2xl flex items-start gap-4 border border-bk-yellow/10">
                <Icon name="info" size="sm" weight={300} className="text-bk-yellow mt-0.5 shrink-0" />
                <Typography variant="p" className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium italic">
                  Advanced allocation: Ensure that the distribution of volumes across physical paths optimizes I/O performance.
                </Typography>
              </div>
            </div>
          )}

          {/* STEP 3: DBA Password */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 max-w-sm mx-auto py-4 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-bk-yellow/10 border border-bk-yellow/20 flex items-center justify-center mx-auto text-bk-yellow shadow-lg shadow-bk-yellow/5">
                  <Icon name="admin_panel_settings" size="lg" weight={300} />
                </div>
                <div>
                  <Typography variant="h3" className="text-slate-900 dark:text-white">Account security</Typography>
                  <Typography variant="p" className="text-slate-500 dark:text-slate-400">Set administrative password for <span className="text-bk-yellow font-bold uppercase tracking-wider">dba</span></Typography>
                </div>
              </div>

              <div className="space-y-4">
                <Input 
                  type="password" 
                  label="DBA password"
                  value={formData.dbaPassword}
                  onChange={(e) => handleInputChange('dbaPassword', e.target.value)}
                  placeholder="••••••••••••"
                />
                <Input 
                  type="password" 
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••••••"
                  error={(formData.confirmPassword && formData.dbaPassword !== formData.confirmPassword) ? "Passwords don't match" : ""}
                />
              </div>

              <div className="p-4 bg-slate-100/50 dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2">
                   <Icon name="security" size="sm" weight={300} className="text-bk-yellow" />
                   <Typography variant="label" className="text-slate-900 dark:text-white font-bold uppercase tracking-wider">Security Policy</Typography>
                 </div>
                 <div className="space-y-2">
                   {[
                     { text: 'At least 8 characters', checked: formData.dbaPassword.length >= 8 },
                     { text: 'Includes letters & numbers', checked: /[a-zA-Z]/.test(formData.dbaPassword) && /\d/.test(formData.dbaPassword) },
                     { text: 'Includes special symbols', checked: /[!@#$%^&*(),.?":{}|<>]/.test(formData.dbaPassword) },
                   ].map((rule, i) => (
                     <div key={i} className="flex items-center gap-2">
                        <Icon 
                          name={rule.checked ? 'check_circle' : 'circle'} 
                          size="sm" 
                          weight={200} 
                          className={rule.checked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'} 
                        />
                        <Typography variant="p" className={`text-[11px] font-medium ${rule.checked ? 'text-slate-900 dark:text-slate-300' : 'text-slate-400'}`}>
                          {rule.text}
                        </Typography>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {/* STEP 4: Summary */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
              <div className="flex items-center gap-5 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Icon name="fact_check" size="md" weight={300} />
                 </div>
                 <div>
                    <Typography variant="h3" className="text-slate-900 dark:text-white">Ready for initialization</Typography>
                    <Typography variant="p" className="text-slate-500 dark:text-slate-400 mt-0.5">Please review your database configuration before creation.</Typography>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-5 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-2xl space-y-4">
                    <Typography variant="label" className="text-bk-yellow font-black uppercase tracking-[0.2em]">Baseline Params</Typography>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <Typography variant="p" className="text-slate-500">Database Name</Typography>
                          <Typography variant="p" className="font-bold text-slate-900 dark:text-bk-yellow">{formData.dbName}</Typography>
                       </div>
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <Typography variant="p" className="text-slate-500">Page Size</Typography>
                          <Typography variant="p" className="font-bold text-slate-900 dark:text-slate-300">{formData.pageSize / 1024} KB</Typography>
                       </div>
                       <div className="flex justify-between items-center">
                          <Typography variant="p" className="text-slate-500">Encoding Locale</Typography>
                          <Typography variant="p" className="font-bold text-slate-900 dark:text-slate-300 truncate max-w-[150px]">
                            {formData.locale === 'user_defined' ? formData.userDefinedLocale : formData.locale}
                          </Typography>
                       </div>
                    </div>
                 </div>

                 <div className="p-5 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-2xl space-y-4">
                    <Typography variant="label" className="text-bk-yellow font-black uppercase tracking-[0.2em]">Storage Estimate</Typography>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <Typography variant="p" className="text-slate-500">Included Volumes</Typography>
                          <Typography variant="p" className="font-bold text-slate-900 dark:text-bk-yellow">{formData.volumes.length + 2}</Typography>
                       </div>
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <Typography variant="p" className="text-slate-500">Log Space</Typography>
                          <Typography variant="p" className="font-bold text-slate-900 dark:text-slate-300">{formData.logVolSize} MB</Typography>
                       </div>
                       <div className="flex justify-between items-center">
                          <Typography variant="p" className="text-slate-500">Total Calculation</Typography>
                          <Typography variant="h3" className="text-emerald-500">
                             {formData.genericVolSize + formData.logVolSize + formData.volumes.reduce((acc, v) => acc + v.size, 0)} MB
                          </Typography>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
      </div>
    </Modal>
  );
}
