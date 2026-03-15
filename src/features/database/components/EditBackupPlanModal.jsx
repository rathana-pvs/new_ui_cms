import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeEditBackupPlanModal, editBackupSchedule, fetchBackupSchedule } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

const CustomSelect = ({ value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded px-3 text-[12px] text-slate-900 dark:text-white flex items-center justify-between hover:border-bk-yellow/50 transition-all font-medium h-9"
      >
        <span className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>}
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <span className={`material-symbols-outlined text-slate-400 text-lg transition-transform duration-200 ${isOpen ? 'rotate-180 text-bk-yellow' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[250] bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-[12px] font-medium transition-all flex items-center justify-between group ${
                  value === opt.value 
                    ? 'bg-bk-yellow/10 text-bk-yellow' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && (
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
              setFormData({
                backupId: info.backupid || '',
                backupLevel: info.level || '0',
                backupPath: info.path || '',
                periodType: info.period_type === 'Specific' ? 'Specific days' : info.period_type,
                periodDetail: info.period_type === 'Specific' ? info.period_date : (info.period_date ? info.period_date.split(',').map(Number) : []),
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
      periodDetail: details.includes(day)
        ? details.filter(d => d !== day)
        : [...details, day]
    }));
  };

  const setBulkDays = (type) => {
    let days = [];
    switch(type) {
      case 'all': days = Array.from({length: 31}, (_, i) => i + 1); break;
      case 'clear': days = []; break;
      case 'weekdays': 
        days = Array.from({length: 31}, (_, i) => i + 1).filter(d => (d % 7 !== 6 && d % 7 !== 0)); 
        break;
      case 'weekends':
        days = Array.from({length: 31}, (_, i) => i + 1).filter(d => (d % 7 === 6 || d % 7 === 0));
        break;
      case 'mid': days = [1, 15, 30]; break;
      case 'even': days = Array.from({length: 31}, (_, i) => i + 1).filter(d => d % 2 === 0); break;
      case 'odd': days = Array.from({length: 31}, (_, i) => i + 1).filter(d => d % 2 !== 0); break;
      default: days = [];
    }
    handleInputChange('periodDetail', days);
  };

  const isPresetActive = (type) => {
    const details = Array.isArray(formData.periodDetail) ? formData.periodDetail : [];
    const current = [...details].sort((a,b) => a-b);
    const getDays = (t) => {
      switch(t) {
        case 'all': return Array.from({length: 31}, (_, i) => i + 1);
        case 'weekdays': return Array.from({length: 31}, (_, i) => i + 1).filter(d => (d % 7 !== 6 && d % 7 !== 0));
        case 'weekends': return Array.from({length: 31}, (_, i) => i + 1).filter(d => (d % 7 === 6 || d % 7 === 0));
        case 'mid': return [1, 15, 30];
        case 'even': return Array.from({length: 31}, (_, i) => i + 1).filter(d => d % 2 === 0);
        case 'odd': return Array.from({length: 31}, (_, i) => i + 1).filter(d => d % 2 !== 0);
        case 'clear': return [];
        default: return null;
      }
    };
    const target = getDays(type);
    if (!target) return false;
    return current.length === target.length && current.every((v, i) => v === target.sort((a,b) => a-b)[i]);
  };

  const handleSave = () => {
    if (!selectedDatabase || !selectedHostUid) return;

    const payload = {
      backupid: formData.backupId,
      level: formData.backupLevel,
      path: formData.backupPath,
      period_type: formData.periodType === 'Specific days' ? 'Specific' : formData.periodType,
      period_date: Array.isArray(formData.periodDetail) ? formData.periodDetail.join(',') : formData.periodDetail,
      time: formData.backupTime.replace(':', ''),
      archivedel: formData.deleteArchive ? 'ON' : 'OFF',
      updatestatus: formData.updateStatistics ? 'ON' : 'OFF',
      zip: formData.useCompression ? 'y' : 'n',
      check: formData.checkConsistency ? 'y' : 'n',
      storeold: 'OFF',
      mt: formData.threads,
      bknum: formData.backupsToKeep,
      onoff: formData.onlineType === 'online' ? 'ON' : 'OF',
    };

    dispatch(editBackupSchedule({ 
      hostUid: selectedHostUid, 
      dbname: selectedDatabase, 
      payload 
    })).unwrap()
      .then(() => {
        dispatch(closeEditBackupPlanModal());
        dispatch(showStatusModal({
          type: 'success',
          title: 'Schedule Updated',
          message: 'The backup schedule has been successfully updated and re-optimized.'
        }));
      });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-bk-main/60 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[700px] h-auto max-h-[90vh] rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        {/* ribbon accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-bk-yellow via-amber-500 to-bk-yellow z-[310]"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">backup_table</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Edit backup plan</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Modify automated scheduled backup for <span className="text-bk-yellow font-medium uppercase">{selectedDatabase}</span></p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => dispatch(closeEditBackupPlanModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar max-h-[70vh] flex-1">
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
               <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  <span className="material-symbols-outlined text-2xl font-black">error</span>
               </div>
               <div className="flex-1">
                  <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Update Failed</p>
                  <p className="text-[12px] font-medium text-rose-600/80 leading-relaxed">{error}</p>
               </div>
            </div>
          )}
          
          {/* General Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">General settings</span>
               <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Backup ID</label>
                <input 
                  type="text" 
                  value={formData.backupId}
                  disabled
                  className="w-full h-9 px-3 flex items-center bg-slate-50/30 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed italic"
                />
              </div>
              <div className="col-span-6 space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Backup level</label>
                <CustomSelect
                  value={formData.backupLevel}
                  onChange={(val) => handleInputChange('backupLevel', val)}
                  options={[
                    { value: '0', label: '0 (Full)' },
                    { value: '1', label: '1 (First increment)' },
                    { value: '2', label: '2 (Second increment)' }
                  ]}
                />
              </div>
              <div className="col-span-12 space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Backup path</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formData.backupPath}
                    onChange={(e) => handleInputChange('backupPath', e.target.value)}
                    className="flex-1 h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-bk-yellow/50 transition-all"
                  />
                  <button type="button" className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all">Browse</button>
                </div>
              </div>
            </div>
          </section>

          {/* Backup Period Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Backup schedule</span>
               <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            <div className="space-y-3 p-5 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-2xl">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6 space-y-1.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 gap-2">
                    <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                    Period type
                  </label>
                  <CustomSelect
                    value={formData.periodType}
                    onChange={(val) => handleInputChange('periodType', val)}
                    options={[
                      { value: 'Monthly', label: 'Monthly' },
                      { value: 'Weekly', label: 'Weekly' },
                      { value: 'Daily', label: 'Daily' },
                      { value: 'Specific days', label: 'Specific days' }
                    ]}
                  />
                </div>
                <div className="col-span-6 space-y-1.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 gap-2">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Backup time
                  </label>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowTimePicker(!showTimePicker)}
                      className="w-full h-9 px-3 flex items-center justify-between bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-900 dark:text-white"
                    >
                      <span>{formData.backupTime}</span>
                      <span className="material-symbols-outlined text-bk-yellow text-lg">history_toggle_off</span>
                    </button>

                    {showTimePicker && (
                      <div className="absolute top-full left-0 mt-2 z-[210] w-[200px] bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex divide-x divide-slate-100 dark:divide-slate-800 h-[220px]">
                          {/* Hours Column */}
                          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-bk-main/20">
                            <div className="px-2 py-1.5 text-[9px] font-medium text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-bk-side z-10">Hour</div>
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => {
                              const currentH = formData.backupTime.split(':')[0];
                              const isSelected = currentH === h;
                              return (
                                <button
                                  key={h}
                                  type="button"
                                  onClick={() => {
                                    const m = formData.backupTime.split(':')[1];
                                    handleInputChange('backupTime', `${h}:${m}`);
                                  }}
                                  className={`py-2 text-[12px] font-medium transition-all ${isSelected ? 'bg-bk-yellow text-bk-side' : 'text-slate-500 hover:bg-bk-yellow/10 hover:text-bk-yellow'}`}
                                >
                                  {h}
                                </button>
                              );
                            })}
                          </div>
                          {/* Minutes Column */}
                          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                            <div className="px-2 py-1.5 text-[9px] font-medium text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-bk-side z-10">Min</div>
                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => {
                              const currentM = formData.backupTime.split(':')[1];
                              const isSelected = currentM === m;
                              if (parseInt(m) % 5 !== 0 && !isSelected) return null;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    const h = formData.backupTime.split(':')[0];
                                    handleInputChange('backupTime', `${h}:${m}`);
                                    setShowTimePicker(false);
                                  }}
                                  className={`py-2 text-[12px] font-medium transition-all ${isSelected ? 'bg-bk-yellow text-bk-side' : 'text-slate-500 hover:bg-bk-yellow/10 hover:text-bk-yellow'}`}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50/50 dark:bg-bk-main/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                          <button 
                            type="button"
                            onClick={() => setShowTimePicker(false)}
                            className="text-[10px] font-medium text-slate-500 uppercase tracking-tight hover:text-bk-yellow transition-colors"
                          >
                            Set Time
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {formData.periodType !== 'Specific days' && formData.periodType !== 'Daily' && (
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1">
                    {formData.periodType === 'Monthly' && 'Period detail (Day of Month)'}
                    {formData.periodType === 'Weekly' && 'Period detail (Day of Week)'}
                  </label>
                )}
                
                {formData.periodType === 'Monthly' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 px-1">
                      {[
                        { id: 'all', label: 'Select All', icon: 'select_all' },
                        { id: 'clear', label: 'Clear', icon: 'backspace' },
                        { id: 'weekdays', label: 'Weekdays', icon: 'work' },
                        { id: 'weekends', label: 'Weekends', icon: 'beach_access' },
                      ].map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setBulkDays(preset.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-medium transition-all uppercase tracking-wider ${
                            isPresetActive(preset.id)
                              ? 'bg-bk-yellow border-bk-yellow text-bk-side shadow-lg shadow-bk-yellow/20'
                              : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-bk-yellow/40 hover:text-bk-yellow hover:bg-bk-yellow/5'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">{preset.icon}</span>
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-2xl p-5 overflow-hidden relative">
                      <div className="grid grid-cols-7 gap-3 relative z-10">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                          <div key={`${d}-${i}`} className="text-center text-[10px] font-medium text-slate-300 dark:text-slate-500 pb-2 tracking-widest">{d}</div>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`group relative h-9 rounded border text-[11px] font-medium transition-all flex items-center justify-center ${
                              (Array.isArray(formData.periodDetail) && formData.periodDetail.includes(day))
                                ? 'bg-gradient-to-br from-bk-yellow to-amber-500 border-bk-yellow text-bk-side shadow-[0_4px_15px_rgba(255,191,0,0.3)]'
                                : 'bg-white dark:bg-bk-side border-slate-200 dark:border-slate-800 text-slate-500 hover:border-bk-yellow/50 hover:text-bk-yellow hover:bg-bk-yellow/5'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                 {formData.periodType === 'Weekly' && (
                  <div className="bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-2xl p-4 grid grid-cols-7 gap-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const dayValue = index + 1;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(dayValue)}
                          className={`h-9 w-full rounded border text-[11px] font-medium transition-all flex items-center justify-center ${
                            (Array.isArray(formData.periodDetail) && formData.periodDetail.includes(dayValue))
                              ? 'bg-bk-yellow border-bk-yellow text-bk-side shadow-lg shadow-bk-yellow/20'
                              : 'bg-white dark:bg-bk-side border-slate-200 dark:border-slate-800 text-slate-500 hover:border-bk-yellow/50 hover:text-bk-yellow'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}

                {formData.periodType === 'Daily' && (
                  <div className="bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-3 text-emerald-500 bg-emerald-500/5">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    <span className="text-[12px] font-medium tracking-tight">The backup will be performed every day at {formData.backupTime}.</span>
                  </div>
                )}

                {formData.periodType === 'Specific days' && (
                  <div className="bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 w-12 ">Date:</label>
                      <div className="relative flex-1">
                        <button 
                          type="button"
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="w-full h-9 px-3 flex items-center justify-between bg-white dark:bg-bk-main border border-slate-200 dark:border-slate-800 rounded text-[12px] font-medium text-slate-900 dark:text-white"
                        >
                          <span>{formData.periodDetail || 'Select date'}</span>
                          <span className="material-symbols-outlined text-bk-yellow text-lg">calendar_today</span>
                        </button>

                        {showCalendar && (
                          <div className="absolute top-full left-0 mt-2 z-[200] w-[280px] bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-bk-main/50 border-b border-slate-100 dark:border-slate-800">
                              <button 
                                type="button"
                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                              </button>
                              <span className="text-[12px] font-medium text-slate-900 dark:text-white tracking-tight">
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                              </span>
                              <button 
                                type="button"
                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                              </button>
                            </div>

                            <div className="p-3">
                              <div className="grid grid-cols-7 gap-1 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                  <div key={day} className="h-7 flex items-center justify-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{day}</div>
                                ))}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {(() => {
                                  const days = [];
                                  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
                                  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
                                  
                                  for (let i = 0; i < firstDay; i++) {
                                    days.push(<div key={`empty-${i}`} className="h-8"></div>);
                                  }

                                  for (let i = 1; i <= daysInMonth; i++) {
                                    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                    const isSelected = formData.periodDetail === dateStr;
                                    
                                    days.push(
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                          handleInputChange('periodDetail', dateStr);
                                          setShowCalendar(false);
                                        }}
                                        className={`h-8 w-full rounded-lg text-[11px] font-medium transition-all flex items-center justify-center ${
                                          isSelected 
                                            ? 'bg-bk-yellow text-bk-side shadow-lg shadow-bk-yellow/20 translate-y-[-1px]' 
                                            : 'hover:bg-bk-yellow/10 hover:text-bk-yellow text-slate-700 dark:text-slate-300'
                                        }`}
                                      >
                                        {i}
                                      </button>
                                    );
                                  }
                                  return days;
                                })()}
                              </div>
                            </div>
                            
                            <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                              <button 
                                type="button"
                                onClick={() => {
                                  const today = new Date().toISOString().split('T')[0];
                                  handleInputChange('periodDetail', today);
                                  setViewDate(new Date());
                                  setShowCalendar(false);
                                }}
                                className="text-[10px] font-medium text-bk-yellow px-2 py-1 hover:bg-bk-yellow/5 rounded-md transition-colors"
                              >
                                Today
                              </button>
                              <button type="button" onClick={() => setShowCalendar(false)} className="text-[10px] font-medium text-slate-400 px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors">Close</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Options Section */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Additional flags</span>
               <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 p-5 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-2xl">
              {[
                { id: 'deleteArchive', label: 'Delete archive volumes', icon: 'auto_delete' },
                { id: 'updateStatistics', label: 'Update statistics information', icon: 'analytics' },
                { id: 'checkConsistency', label: 'Check database consistency', icon: 'rule' },
                { id: 'useCompression', label: 'Use compression', icon: 'compress' },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-3 group cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${formData[opt.id] ? 'bg-bk-yellow/10 border-bk-yellow/40 text-bk-yellow' : 'bg-white dark:bg-bk-side border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow transition-colors">{opt.label}</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData[opt.id]}
                      onChange={(e) => handleInputChange(opt.id, e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-bk-yellow"></div>
                  </div>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-8 px-2">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 uppercase tracking-wider">Number of threads</label>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => handleInputChange('threads', Math.max(0, formData.threads - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-bk-yellow hover:text-bk-side transition-all"
                  >-</button>
                  <span className="w-8 text-center text-[12px] font-medium text-slate-900 dark:text-white">{formData.threads}</span>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('threads', formData.threads + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-bk-yellow hover:text-bk-side transition-all"
                  >+</button>
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4 uppercase tracking-wider">Number of backups to keep</label>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => handleInputChange('backupsToKeep', Math.max(0, formData.backupsToKeep - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-bk-yellow hover:text-bk-side transition-all"
                  >-</button>
                  <span className="w-8 text-center text-[12px] font-medium text-slate-900 dark:text-white">{formData.backupsToKeep}</span>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('backupsToKeep', formData.backupsToKeep + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-bk-yellow hover:text-bk-side transition-all"
                  >+</button>
                </div>
              </div>
            </div>
          </section>

          {/* Operation flags Section */}
          <section className="space-y-3 px-1">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Operation flags</span>
               <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <label className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${formData.onlineType === 'online' ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-transparent border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.onlineType === 'online' ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all ${formData.onlineType === 'online' ? 'bg-indigo-500 scale-100' : 'bg-transparent scale-0'}`}></div>
                </div>
                <input 
                  type="radio" 
                  className="sr-only" 
                  name="onlineType" 
                  checked={formData.onlineType === 'online'} 
                  onChange={() => handleInputChange('onlineType', 'online')} 
                />
                <div className="flex-1 space-y-1 text-left">
                  <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200">Online backup</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed font-medium">Allows continuing database operations while the backup is being performed.</p>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${formData.onlineType === 'offline' ? 'bg-orange-500/5 border-orange-500/30' : 'bg-transparent border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.onlineType === 'offline' ? 'border-orange-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all ${formData.onlineType === 'offline' ? 'bg-orange-500 scale-100' : 'bg-transparent scale-0'}`}></div>
                </div>
                <input 
                  type="radio" 
                  className="sr-only" 
                  name="onlineType" 
                  checked={formData.onlineType === 'offline'} 
                  onChange={() => handleInputChange('onlineType', 'offline')} 
                />
                <div className="flex-1 space-y-1 text-left">
                  <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200">Offline backup</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed font-medium">
                    <span className="text-orange-500 font-medium">Notice:</span> Database will be <span className="underline">stopped</span> during backup operation and then restarted automatically.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            type="button"
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-left"
            onClick={() => dispatch(closeEditBackupPlanModal())}
          >
            Discard
          </button>
          <button 
            type="button"
            disabled={loading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50 text-left"
            onClick={handleSave}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Run schedule</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
