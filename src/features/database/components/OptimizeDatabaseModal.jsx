import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeOptimizeDatabaseModal, optimizeDatabase } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { showStatusModal } from '../../layout/layoutSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

/**
 * Custom Searchable Select for Class List
 */
const ClassSelect = ({ value, userClasses, systemClasses, onChange, disabled, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
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
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 flex items-center justify-between bg-white dark:bg-bk-main border border-slate-200 dark:border-slate-800/50 rounded-lg shadow-sm transition-all text-left outline-none ${
          isOpen ? 'ring-2 ring-bk-yellow/20 border-bk-yellow/60' : 'hover:border-bk-yellow/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`material-symbols-outlined text-[18px] ${value ? 'text-bk-yellow' : 'text-slate-400'}`}>
            {value ? 'table_view' : 'database'}
          </span>
          <span className={`text-[12px] font-medium truncate ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {value ? value : 'All classes (Entire database)'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading && <div className="w-3 h-3 border-2 border-bk-yellow/30 border-t-bk-yellow rounded-full animate-spin"></div>}
          <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${isOpen ? 'rotate-180 text-bk-yellow' : 'text-slate-400'}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+5px)] left-0 right-0 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[280px]">
          
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/30">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">search</span>
              <input 
                autoFocus
                type="text"
                placeholder="Search tables..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-white dark:bg-bk-main border border-slate-200 dark:border-slate-800/80 rounded-md text-[11px] font-medium text-slate-700 dark:text-white placeholder:text-slate-400 focus:border-bk-yellow/60 focus:ring-2 focus:ring-bk-yellow/5 outline-none transition-all"
              />
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-slate-50 dark:border-slate-800/50">
            
            {/* "All" Option */}
            {search === '' && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors border-b border-slate-50 dark:border-slate-800/30 ${
                  value === '' ? 'bg-bk-yellow/10 text-bk-yellow' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${value === '' ? 'bg-bk-yellow animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                <span className="text-[11px] font-medium uppercase tracking-wider">Entire database</span>
              </button>
            )}

            {/* Empty Context */}
            {!hasResults && !isLoading && (
              <div className="py-10 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-700">filter_none</span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">No tables found matching "{search}"</p>
              </div>
            )}

            {/* Loading State in List */}
            {isLoading && (
              <div className="py-10 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-bk-yellow/30 border-t-bk-yellow rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">Fetching schema...</p>
              </div>
            )}

            {/* User Classes Group */}
            {filteredUserClasses.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-bk-side/95 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                  <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">User Tables</span>
                  <span className="text-[9px] bg-slate-100 dark:bg-bk-main px-1.5 py-0.5 rounded text-slate-500">{filteredUserClasses.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredUserClasses.map((cls) => (
                    <button
                      key={cls.classname}
                      type="button"
                      onClick={() => { onChange(cls.classname); setIsOpen(false); }}
                      className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-all ${
                        value === cls.classname 
                          ? 'bg-bk-yellow text-bk-side font-medium shadow-lg shadow-bk-yellow/20 mx-[-4px] w-[calc(100%+8px)] z-20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-bk-yellow'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${value === cls.classname ? 'text-bk-side' : 'opacity-40'}`}>table</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] truncate leading-tight">{cls.classname}</span>
                        <span className={`text-[9px] opacity-60 truncate ${value === cls.classname ? 'text-bk-side' : 'text-slate-400'}`}>Owner: {cls.owner}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* System Classes Group */}
            {filteredSystemClasses.length > 0 && (
              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="px-4 py-1.5 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-bk-side/95 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800/50 mb-1">
                  <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">System Tables</span>
                  <span className="text-[9px] bg-slate-100 dark:bg-bk-main px-1.5 py-0.5 rounded text-slate-500">{filteredSystemClasses.length}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredSystemClasses.map((cls) => (
                    <button
                      key={cls.classname}
                      type="button"
                      onClick={() => { onChange(cls.classname); setIsOpen(false); }}
                      className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-all ${
                        value === cls.classname 
                        ? 'bg-bk-yellow text-bk-side font-medium shadow-lg shadow-bk-yellow/20 mx-[-4px] w-[calc(100%+8px)] z-20' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-bk-yellow'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${value === cls.classname ? 'text-bk-side' : 'opacity-40'}`}>settings_suggest</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] truncate leading-tight">{cls.classname}</span>
                        <span className={`text-[9px] opacity-60 truncate ${value === cls.classname ? 'text-bk-side' : 'text-slate-400'}`}>Internal catalog</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function OptimizeDatabaseModal() {
  const dispatch = useDispatch();
  const { 
    isOptimizeDatabaseModalOpen, 
    selectedDatabase, 
    activeDatabases
  } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [selectedClassName, setSelectedClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Direct state for classes to follow user requirement for direct getClassInfo usage
  const [classesData, setClassesData] = useState({ userclass: [], systemclass: [] });
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const isActive = selectedDatabase && activeDatabases.includes(selectedDatabase);
  
  const fetchClasses = useCallback(async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsLoadingClasses(true);
    try {
      const dbstatus = isActive ? 'on' : 'off';
      // Calling the API exactly as requested: getClassInfo: (hostUid, dbname, dbstatus)
      const res = await databaseApi.getClassInfo(selectedHostUid, selectedDatabase, dbstatus);
      
      // Robust extraction handling potential nesting or direct arrays
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
    if (isOptimizeDatabaseModalOpen && selectedDatabase) {
      fetchClasses();
    } else {
      // Reset state when closing
      setSelectedClassName('');
      setClassesData({ userclass: [], systemclass: [] });
    }
  }, [isOptimizeDatabaseModalOpen, selectedDatabase, fetchClasses]);

  if (!isOptimizeDatabaseModalOpen) return null;

  const handleOptimize = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setLoading(true);
    setError(null);
    try {
      const payload = selectedClassName && selectedClassName !== '' 
        ? { class: [{ classname: selectedClassName }] }
        : {};
        
      await dispatch(optimizeDatabase({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        payload 
      })).unwrap();
      
      dispatch(closeOptimizeDatabaseModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Optimization Success',
        message: selectedClassName 
          ? `Table "${selectedClassName}" in database ${selectedDatabase} optimized successfully.`
          : `Database ${selectedDatabase} optimized successfully.`
      }));
    } catch (err) {
      setError(err || 'Failed to optimize database. Please ensure the database is accessible and try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalTables = classesData.userclass.length + classesData.systemclass.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[440px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={loading} 
            title="Optimizing Database" 
            subtitle="Regenerating index and query optimization statistics..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleOptimize}
          onClose={() => setError(null)}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">auto_fix_high</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Optimize database</h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeOptimizeDatabaseModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1 text-left overflow-visible">
          {/* Section: Target Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Optimization target</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Database identifier</label>
              <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-100">
                {selectedDatabase}
              </div>
            </div>
          </div>

          {/* Section: Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Optimization flags</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg">
                <div className="flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-bk-yellow text-sm mt-0.5">info</span>
                  <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    Updates object statistics for the cost-based optimizer. Recommended after significant data modifications for optimal query performance.
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Target class</label>
                
                <ClassSelect 
                   value={selectedClassName}
                   userClasses={classesData.userclass}
                   systemClasses={classesData.systemclass}
                   onChange={setSelectedClassName}
                   disabled={loading}
                   isLoading={isLoadingClasses}
                />

                <div className="flex items-center justify-between px-0.5 mt-2">
                   <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isLoadingClasses ? 'bg-slate-300 animate-pulse' : 'bg-bk-yellow'}`}></span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                        {isLoadingClasses ? 'Searching...' : `${totalTables} objects discovered`}
                      </span>
                   </div>
                   {!isLoadingClasses && totalTables > 0 && (
                     <div className="text-[9px] text-slate-400 ">
                        Select a specific table to narrow scope
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeOptimizeDatabaseModal())}
          >
            Discard
          </button>
          <button 
            disabled={loading || isLoadingClasses}
            className={`px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50`}
            onClick={handleOptimize}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin text-left"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Run optimize</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
