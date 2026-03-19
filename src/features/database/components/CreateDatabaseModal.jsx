import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCreateDatabaseModal } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

const PAGE_SIZES = [4096, 8192, 16384, 32768];
const LOCALES = [
  { value: 'en_US.iso88591', label: 'en_US.iso88591 (English, Western European)' },
  { value: 'en_US.utf8', label: 'en_US.utf8 (English, Universal)' },
  { value: 'ko_KR.euckr', label: 'ko_KR.euckr (Korean, Legacy)' },
  { value: 'ko_KR.utf8', label: 'ko_KR.utf8 (Korean, Universal)' },
  { value: 'user_defined', label: 'User Defined' }
];

const VOLUME_TYPES = ['data', 'index', 'temp', 'generic'];

function CustomDropdown({ options, value, onChange, label, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(opt => opt.value === value || opt === value);
  const selectedLabel = selectedOption?.label || selectedOption || value;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-900 dark:text-white flex items-center justify-between hover:border-bk-yellow/50 transition-all outline-none focus:ring-1 focus:ring-bk-yellow/50"
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>}
          <span className="truncate leading-none">{selectedLabel}</span>
        </div>
        <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-[400] w-full mt-1 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt, i) => {
              const val = typeof opt === 'object' ? opt.value : opt;
              const lbl = typeof opt === 'object' ? opt.label : opt;
              const isSelected = val === value;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(val); setIsOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-[11px] font-medium transition-colors flex items-center justify-between
                    ${isSelected ? 'bg-bk-yellow text-bk-side' : 'text-slate-700 dark:text-slate-300 hover:bg-bk-yellow/10 hover:text-bk-yellow'}`}
                >
                  <span className="truncate leading-none">{lbl}</span>
                  {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[800px] rounded-xl shadow-[0_20px_70px_rgba(0,0,0,0.4)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] relative">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60 z-[310]"></div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">add_circle</span>
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-slate-900 dark:text-white leading-none tracking-wide">Create database wizard</h3>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 tracking-tight font-medium flex items-center gap-2">
                Step {step} of 4 <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span> 
                {step === 1 && 'General info'}
                {step === 2 && 'Volumes'}
                {step === 3 && 'Access'}
                {step === 4 && 'Summary'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeCreateDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          
          <div className="flex items-center gap-1.5 mb-8 overflow-hidden px-1 max-w-md mx-auto">
            {[1, 2, 3, 4].map(i => (
              <React.Fragment key={i}>
                <div className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-300 relative shrink-0
                  ${step >= i ? 'bg-bk-yellow border-bk-yellow text-bk-side shadow-sm' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                  {step > i ? (
                    <span className="material-symbols-outlined text-[14px] font-black">check</span>
                  ) : (
                    <span className="text-[11px] font-black">{i}</span>
                  )}
                </div>
                {i < 4 && <div className={`flex-1 h-[1.5px] rounded-full transition-all duration-500 ${step > i ? 'bg-bk-yellow' : 'bg-slate-100 dark:bg-slate-800'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          {/* STEP 1: General Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300 px-1">
              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-6 items-start">
                  <div className="space-y-1.5">
                    <label className="text-[12px] h-4 flex items-center font-medium text-slate-500 dark:text-slate-400 ml-0.5 tracking-wide">Database name</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        value={formData.dbName}
                        onChange={(e) => handleInputChange('dbName', e.target.value)}
                        placeholder="e.g. production_db"
                        className="w-full h-9 px-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bk-yellow/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[16px]">database</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] h-4 flex items-center font-medium text-slate-500 dark:text-slate-400 ml-0.5 tracking-wide">Page size</label>
                    <CustomDropdown 
                      options={PAGE_SIZES.map(s => ({ value: s, label: `${s / 1024} KB (${s} bytes)` }))}
                      value={formData.pageSize}
                      onChange={(val) => handleInputChange('pageSize', val)}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <label className="text-[12px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 tracking-wide">Locale & charset</label>
                <CustomDropdown 
                  options={LOCALES}
                  value={formData.locale}
                  onChange={(val) => handleInputChange('locale', val)}
                  icon="language"
                />
                
                {formData.locale === 'user_defined' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1 px-0.5">
                    <label className="text-[12px] font-medium text-slate-400 dark:text-slate-500 tracking-wide ml-0.5">User-defined locale</label>
                    <input 
                      type="text" 
                      value={formData.userDefinedLocale}
                      onChange={(e) => handleInputChange('userDefinedLocale', e.target.value)}
                      placeholder="Enter custom locale (e.g. de_DE.utf8)"
                      className="w-full h-9 px-3 bg-slate-50/50 dark:bg-bk-main/20 border border-bk-yellow/30 rounded text-[12px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bk-yellow/50 transition-all"
                    />
                  </div>
                )}
              </section>

              <div className="grid grid-cols-2 gap-6">
                <section className="space-y-3 p-4 bg-slate-50/50 dark:bg-bk-main/20 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                       <span className="material-symbols-outlined text-bk-yellow text-[16px]">storage</span> Generic volume
                    </h4>
                    <span className="text-[10px] bg-bk-yellow/10 text-bk-yellow px-1.5 py-0.5 rounded font-black">Req</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-slate-400 tracking-tight">Path</label>
                      <input type="text" value={formData.genericVolPath} readOnly className="w-full h-8 px-2 bg-white dark:bg-bk-side border border-slate-100 dark:border-slate-800 rounded text-[12px] font-medium text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[12px] font-medium text-slate-400 tracking-tight ml-0.5">Size (MB)</label>
                      <input 
                        type="number" 
                        value={formData.genericVolSize}
                        onChange={(e) => handleInputChange('genericVolSize', Number(e.target.value))}
                        className="w-full h-8 px-3 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded text-[12px] font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-bk-yellow/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-3 p-4 bg-slate-50/50 dark:bg-bk-main/20 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                       <span className="material-symbols-outlined text-bk-yellow text-[16px]">history</span> Log volume
                    </h4>
                    <span className="text-[10px] bg-bk-yellow/10 text-bk-yellow px-1.5 py-0.5 rounded font-black">Req</span>
                  </div>
                  <div className="space-y-3">
                   <div className="space-y-1">
                      <label className="text-[12px] font-medium text-slate-400 tracking-tight">Path</label>
                      <input type="text" value={formData.logVolPath} readOnly className="w-full h-8 px-2 bg-white dark:bg-bk-side border border-slate-100 dark:border-slate-800 rounded text-[12px] font-medium text-slate-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[12px] font-medium text-slate-400 tracking-tight ml-0.5">Size (MB)</label>
                        <input 
                          type="number" 
                          value={formData.logVolSize}
                          onChange={(e) => handleInputChange('logVolSize', Number(e.target.value))}
                          className="w-full h-8 px-3 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded text-[12px] font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-bk-yellow/50 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-medium text-slate-400 tracking-tight ml-0.5">Pg</label>
                        <CustomDropdown 
                          options={PAGE_SIZES.map(s => ({ value: s, label: `${s / 1024}K` }))}
                          value={formData.logPageSize}
                          onChange={(val) => handleInputChange('logPageSize', val)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <label className="flex items-center gap-3 p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-xl cursor-pointer group active:scale-[0.99] transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${formData.autoStart ? 'bg-bk-yellow border-bk-yellow text-bk-side' : 'bg-white dark:bg-bk-side border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-lg">{formData.autoStart ? 'flash_on' : 'flash_off'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-slate-900 dark:text-white">Auto-start database</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-none">Initialize and start automatically after creation.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.autoStart} onChange={(e) => handleInputChange('autoStart', e.target.checked)} />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-bk-yellow"></div>
                </div>
              </label>
            </div>
          )}

          {/* STEP 2: Volume Configuration */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 px-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">Volume management</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Configure operational distribution for data and indexing.</p>
                </div>
                <button 
                  onClick={addVolume}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-bk-yellow hover:bg-[#ffd700] text-bk-side rounded-lg text-[10px] font-bold tracking-wider transition-all shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Add volume
                </button>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-visible shadow-sm bg-slate-50/30 dark:bg-bk-main/10">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.03]">
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 tracking-[0.15em] border-b border-slate-100 dark:border-slate-800">Name</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 tracking-[0.15em] w-36 border-b border-slate-100 dark:border-slate-800 text-center">Type</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 tracking-[0.15em] w-32 border-b border-slate-100 dark:border-slate-800 text-center">Size (MB)</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 tracking-[0.15em] border-b border-slate-100 dark:border-slate-800">Path</th>
                      <th className="px-4 py-3.5 text-[10px] font-bold text-slate-400 tracking-[0.15em] w-12 border-b border-slate-100 dark:border-slate-800 text-center">Act</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {formData.volumes.map((vol, idx) => (
                      <tr key={idx} className="group hover:bg-white dark:hover:bg-white/[0.03] transition-colors relative">
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={vol.name} 
                            onChange={(e) => handleVolumeChange(idx, 'name', e.target.value)}
                            className="bg-transparent border-none text-[12px] font-medium text-slate-900 dark:text-white w-full focus:ring-0 p-0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <CustomDropdown 
                            options={VOLUME_TYPES}
                            value={vol.type}
                            onChange={(val) => handleVolumeChange(idx, 'type', val)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="relative group/input inline-block">
                             <input 
                               type="number" 
                               value={vol.size} 
                               onChange={(e) => handleVolumeChange(idx, 'size', Number(e.target.value))}
                               className="w-24 px-3 py-1.5 bg-slate-100/30 dark:bg-white/[0.05] border border-slate-200 dark:border-white/5 rounded text-[12px] font-bold text-center text-slate-900 dark:text-white focus:ring-1 focus:ring-bk-yellow/50 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                             />
                             <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col opacity-0 group-hover/input:opacity-100 transition-opacity">
                                <button onClick={() => handleVolumeChange(idx, 'size', vol.size + 1)} className="text-slate-500 hover:text-bk-yellow leading-none"><span className="material-symbols-outlined text-[14px]">arrow_drop_up</span></button>
                                <button onClick={() => handleVolumeChange(idx, 'size', Math.max(0, vol.size - 1))} className="text-slate-500 hover:text-bk-yellow leading-none"><span className="material-symbols-outlined text-[14px]">arrow_drop_down</span></button>
                             </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={vol.path} 
                            onChange={(e) => handleVolumeChange(idx, 'path', e.target.value)}
                            className="bg-transparent border-none text-[12px] font-medium text-slate-400 w-full focus:ring-0 p-0"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => removeVolume(idx)}
                            className="w-6 h-6 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-40 group-hover:opacity-100 flex items-center justify-center mx-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-5 p-3.5 bg-bk-yellow/5 rounded-lg flex items-start gap-4 border border-bk-yellow/10">
                <span className="material-symbols-outlined text-bk-yellow text-sm mt-0.5 shrink-0">info</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium italic">Advanced allocation: Ensure that the distribution of volumes across physical paths optimizes I/O performance.</span>
              </p>
            </div>
          )}

          {/* STEP 3: DBA Password */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 px-1 max-w-sm mx-auto py-6 space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-bk-yellow/10 border border-bk-yellow/20 flex items-center justify-center mx-auto text-bk-yellow mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                </div>
                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Set admin password</h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">The <span className="text-bk-yellow font-bold tracking-widest">dba</span> account security policy.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-400 tracking-widest ml-1">DBA password</label>
                  <input 
                    type="password" 
                    value={formData.dbaPassword}
                    onChange={(e) => handleInputChange('dbaPassword', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 px-4 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-xl text-sm font-medium focus:ring-1 focus:ring-bk-yellow/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-400 tracking-widest ml-1">Confirm password</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full h-10 px-4 bg-slate-50/50 dark:bg-bk-main/20 border rounded-xl text-sm font-medium focus:ring-1 focus:ring-bk-yellow/50 transition-all
                      ${formData.confirmPassword ? (formData.dbaPassword === formData.confirmPassword ? 'border-bk-yellow/50' : 'border-rose-500/50') : 'border-slate-100 dark:border-white/5'}`}
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-bk-main/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                 {/* Policy Rules */}
                 <div className="flex items-center gap-2 mb-1">
                   <span className="material-symbols-outlined text-bk-yellow text-sm">security</span>
                   <span className="text-[12px] font-bold text-slate-400 tracking-wider">Policy tracker</span>
                 </div>
                 {[
                   { text: 'Min 8 characters', checked: formData.dbaPassword.length >= 8 },
                   { text: 'Letters & numbers', checked: /[a-zA-Z]/.test(formData.dbaPassword) && /\d/.test(formData.dbaPassword) },
                   { text: 'Special symbols', checked: /[!@#$%^&*(),.?":{}|<>]/.test(formData.dbaPassword) },
                 ].map((rule, i) => (
                   <div key={i} className="flex items-center gap-2 text-[12px] font-medium">
                      <span className={`material-symbols-outlined text-[13px] ${rule.checked ? 'text-bk-yellow' : 'text-slate-300'}`}>{rule.checked ? 'check_circle' : 'circle'}</span>
                      <span className={rule.checked ? 'text-bk-yellow' : 'text-slate-500'}>{rule.text}</span>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* STEP 4: Summary */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 px-1 space-y-6">
              <div className="flex items-center gap-5 p-6 bg-bk-yellow/5 border border-bk-yellow/10 rounded-2xl">
                 <div className="w-12 h-12 rounded-xl bg-bk-yellow flex items-center justify-center text-bk-side shadow-md shrink-0">
                    <span className="material-symbols-outlined text-2xl font-black">fact_check</span>
                 </div>
                 <div>
                    <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Configuration complete</h4>
                    <p className="text-[12px] text-slate-500 mt-0.5 font-medium leading-relaxed">Initialization will start based on the parameters above.</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
                    <h5 className="text-[12px] font-black tracking-widest text-bk-yellow">Baseline</h5>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <span className="text-[12px] font-medium text-slate-500">Name</span>
                          <span className="text-[12px] font-bold text-slate-900 dark:text-bk-yellow">{formData.dbName}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <span className="text-[12px] font-medium text-slate-500">Pg. size</span>
                          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{formData.pageSize / 1024} KB</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <span className="text-[12px] font-medium text-slate-500">Locale</span>
                          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{formData.locale === 'user_defined' ? formData.userDefinedLocale : formData.locale}</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 shadow-sm">
                    <h5 className="text-[12px] font-black tracking-widest text-bk-yellow">Storage forecast</h5>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <span className="text-[12px] font-medium text-slate-500">Vol. count</span>
                          <span className="text-[12px] font-bold text-slate-900 dark:text-bk-yellow">{formData.volumes.length + 2}</span>
                       </div>
                       <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                          <span className="text-[12px] font-medium text-slate-500">Log space</span>
                          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{formData.logVolSize} MB</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[12px] font-medium text-slate-500">Total est.</span>
                          <span className="text-[12px] font-black text-bk-yellow">
                             {formData.genericVolSize + formData.logVolSize + formData.volumes.reduce((acc, v) => acc + v.size, 0)} MB
                          </span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-bk-main/80 flex justify-between items-center shrink-0">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step === i ? 'w-6 bg-bk-yellow shadow-sm' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}></div>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              className="px-4 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              onClick={() => dispatch(closeCreateDatabaseModal())}
            >
              Cancel
            </button>
            <div className="flex gap-2">
              {step > 1 && (
                <button 
                  className="px-4 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
                  onClick={handleBack}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back
                </button>
              )}
              {step < 4 ? (
                <button 
                  disabled={!isFormValid()}
                  className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] disabled:opacity-50 text-bk-side text-[11px] font-bold rounded-lg shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5"
                  onClick={handleNext}
                >
                  Continue
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button 
                  className="px-8 py-1.5 bg-bk-yellow hover:bg-[#ffd700] text-bk-side text-[11px] font-bold rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
                  onClick={handleFinish}
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  Create database
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
