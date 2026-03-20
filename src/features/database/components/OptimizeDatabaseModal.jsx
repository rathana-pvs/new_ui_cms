import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeOptimizeDatabaseModal, optimizeDatabase } from '../databaseSlice';
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

/**
 * Custom Searchable Select for Class List - Refactored for Design System
 */
const ClassSelect = ({ value, userClasses, systemClasses, onChange, disabled, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUserClasses = useMemo(() => 
    userClasses.filter(c => c.classname.toLowerCase().includes(search.toLowerCase())),
    [userClasses, search]
  );

  const filteredSystemClasses = useMemo(() => 
    systemClasses.filter(c => c.classname.toLowerCase().includes(search.toLowerCase())),
    [systemClasses, search]
  );

  const hasResults = filteredUserClasses.length > 0 || filteredSystemClasses.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-4 flex items-center justify-between bg-muted/5 border border-border rounded-xl transition-all text-left outline-none ${isOpen ? 'ring-2 ring-primary/20 border-primary shadow-sm' : 'hover:border-primary/50'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Icon name={value ? 'table_view' : 'database'} size="xs" className={value ? 'text-primary' : 'text-foreground/40'} />
          <Typography variant="span" className={`text-[12px] font-bold truncate ${value ? 'text-foreground' : 'text-foreground/40'}`}>
            {value ? value : 'All classes (Entire database)'}
          </Typography>
        </div>
        <Icon name="expand_more" size="sm" className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-foreground/40'}`} />
      </button>

      {isOpen && (
        <Card className="absolute top-[calc(100%+8px)] left-0 right-0 bg-background border-border shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[320px] p-0">
          <div className="p-2 border-b border-border bg-muted/5">
             <Input 
                autoFocus
                placeholder="Search tables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon="search"
                className="h-9 text-[11px]"
             />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {search === '' && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-left transition-colors mb-1 ${value === '' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'}`}
              >
                <div className={`w-2 h-2 rounded-full ${value === '' ? 'bg-primary animate-pulse' : 'bg-foreground/20'}`}></div>
                <Typography variant="span" className="text-[11px] font-black uppercase tracking-widest">Entire database</Typography>
              </button>
            )}

            {!hasResults && !isLoading && (
              <div className="py-10 text-center opacity-30 flex flex-col items-center gap-2">
                <Icon name="filter_none" className="text-3xl" />
                <Typography variant="caption" className="font-bold">No matches found</Typography>
              </div>
            )}

            {filteredUserClasses.length > 0 && (
              <div className="pb-2">
                <div className="px-3 py-2 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 mb-1">
                  <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-foreground/40 text-[9px]">User Tables</Typography>
                  <Typography variant="caption" className="bg-muted/10 px-1.5 py-0.5 rounded text-[10px]">{filteredUserClasses.length}</Typography>
                </div>
                {filteredUserClasses.map((cls) => (
                  <button
                    key={cls.classname}
                    type="button"
                    onClick={() => { onChange(cls.classname); setIsOpen(false); }}
                    className={`w-full px-3 py-2 flex items-center gap-3 rounded-lg text-left transition-all mb-0.5 ${value === cls.classname ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/70 hover:bg-muted/10 hover:text-primary'}`}
                  >
                    <Icon name="table" size="xs" className={value === cls.classname ? 'text-primary-foreground' : 'opacity-40'} />
                    <div className="flex flex-col min-w-0">
                      <Typography variant="span" className="text-[11px] font-bold truncate leading-tight">{cls.classname}</Typography>
                      <Typography variant="caption" className={`truncate text-[9px] ${value === cls.classname ? 'text-primary-foreground/70' : 'opacity-50'}`}>{cls.owner}</Typography>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filteredSystemClasses.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <div className="px-3 py-2 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 mb-1">
                  <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-foreground/40 text-[9px]">System Tables</Typography>
                  <Typography variant="caption" className="bg-muted/10 px-1.5 py-0.5 rounded text-[10px]">{filteredSystemClasses.length}</Typography>
                </div>
                {filteredSystemClasses.map((cls) => (
                  <button
                    key={cls.classname}
                    type="button"
                    onClick={() => { onChange(cls.classname); setIsOpen(false); }}
                    className={`w-full px-3 py-2 flex items-center gap-3 rounded-lg text-left transition-all mb-0.5 ${value === cls.classname ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/70 hover:bg-muted/10 hover:text-primary'}`}
                  >
                    <Icon name="settings_suggest" size="xs" className={value === cls.classname ? 'text-primary-foreground' : 'opacity-40'} />
                    <Typography variant="span" className="text-[11px] font-bold truncate">{cls.classname}</Typography>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default function OptimizeDatabaseModal() {
  const dispatch = useDispatch();
  const { isOptimizeDatabaseModalOpen, selectedDatabase, activeDatabases } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [selectedClassName, setSelectedClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classesData, setClassesData] = useState({ userclass: [], systemclass: [] });
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const isActive = selectedDatabase && activeDatabases.includes(selectedDatabase);
  
  const fetchClasses = useCallback(async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsLoadingClasses(true);
    try {
      const dbstatus = isActive ? 'on' : 'off';
      const res = await databaseApi.getClassInfo(selectedHostUid, selectedDatabase, dbstatus);
      const rawUser = res.userclass?.[0]?.class || res.userclass || [];
      const rawSystem = res.systemclass?.[0]?.class || res.systemclass || [];
      setClassesData({
        userclass: rawUser.filter(c => c.virtual !== 'view'),
        systemclass: rawSystem.filter(c => c.virtual !== 'view')
      });
    } catch (err) {
      console.error('Failed to fetch optimized classes:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  }, [selectedHostUid, selectedDatabase, isActive]);

  useEffect(() => {
    if (isOptimizeDatabaseModalOpen && selectedDatabase) fetchClasses();
    else { setSelectedClassName(''); setClassesData({ userclass: [], systemclass: [] }); }
  }, [isOptimizeDatabaseModalOpen, selectedDatabase, fetchClasses]);

  if (!isOptimizeDatabaseModalOpen) return null;

  const handleOptimize = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
    setError(null);
    try {
      const payload = selectedClassName && selectedClassName !== '' ? { class: [{ classname: selectedClassName }] } : {};
      await dispatch(optimizeDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase, payload })).unwrap();
      dispatch(closeOptimizeDatabaseModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Optimization Success',
        message: selectedClassName ? `Table "${selectedClassName}" optimized successfully.` : `Database ${selectedDatabase} optimized successfully.`
      }));
    } catch (err) {
      setError(err || 'Failed to optimize database. Operation timed out or connection lost.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeOptimizeDatabaseModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleOptimize} loading={loading} disabled={isLoadingClasses} icon="auto_fix_high">Run Optimize</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOptimizeDatabaseModalOpen}
      onClose={() => dispatch(closeOptimizeDatabaseModal())}
      title="Optimize database"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="auto_fix_high"
      footer={footer}
      maxWidth="max-w-[460px]"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Action failed" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Target Authority</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="bg-muted/10 border-border/50 py-3 px-4 flex items-center justify-between">
             <Typography variant="span" className="font-black text-secondary">{selectedDatabase}</Typography>
             <Icon name="database" size="sm" className="opacity-20" />
          </Card>
        </section>

        <section className="space-y-4">
          <Card className="p-4 bg-primary/5 border-primary/10 flex gap-4">
             <Icon name="info" className="text-primary" />
             <div className="space-y-1.5 flex-1">
                <Typography variant="caption" className="font-bold block tracking-tight uppercase">Index & Cost Stats</Typography>
                <Typography variant="p" className="opacity-70 leading-relaxed text-[12px]">
                   Regenerates internal catalog statistics for the query optimizer. This ensures the engine selects the most efficient execution paths for your SQL queries.
                </Typography>
             </div>
          </Card>

          <div className="space-y-3 pt-2">
             <Typography variant="caption" className="font-black uppercase tracking-widest text-foreground/40 px-1">Optimization Granularity</Typography>
             <ClassSelect 
                value={selectedClassName}
                userClasses={classesData.userclass}
                systemClasses={classesData.systemclass}
                onChange={setSelectedClassName}
                disabled={loading}
                isLoading={isLoadingClasses}
             />
             <div className="flex items-center gap-2 px-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoadingClasses ? 'bg-primary animate-pulse' : 'bg-secondary'}`}></div>
                <Typography variant="caption" className="font-bold opacity-60 tracking-tight">
                   {isLoadingClasses ? 'Hydrating schema list...' : `${classesData.userclass.length + classesData.systemclass.length} candidates available`}
                </Typography>
             </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
