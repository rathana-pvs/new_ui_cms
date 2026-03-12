import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHosts, setSelectedHost, loginToHost, openDeleteHostModal, openEditHostModal, revokeHostLogin, openServerVersionModal } from '../../host/hostSlice';
import { fetchDatabaseStartInfo, setSelectedDatabase, setSelectedDatabaseSubItem, startDatabase, stopDatabase, openUnloadDBModal, openLoadDBModal, openCheckDatabaseModal, openCompactDatabaseModal, openCopyDatabaseModal, openBackupDatabaseModal, openLockInfoModal, openTransactionInfoModal } from '../../database/databaseSlice';
import { fetchBrokerList, startBroker, stopBroker, setSelectedBroker } from '../../broker/brokerSlice';
import { setActiveMainTab, closeHostTabs } from '../layoutSlice';
import { SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';

function ContextMenuWrapper({ x, y, children, onClose }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: y, left: x });
  const [isPositioned, setIsPositioned] = useState(false);

  useLayoutEffect(() => {
    if (menuRef.current && !isPositioned) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newLeft = x;
      let newTop = y;

      if (x + rect.width > viewportWidth) {
        newLeft = x - rect.width;
      }

      if (y + rect.height > viewportHeight) {
        newTop = y - rect.height;
      }

      newLeft = Math.max(5, newLeft);
      newTop = Math.max(5, newTop);

      setPosition({ top: newTop, left: newLeft });
      setIsPositioned(true);
    }
  }, [x, y, isPositioned]);

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 w-60 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.2)] py-1.5 animate-in fade-in zoom-in-95 duration-200 ${isPositioned ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Subtle Top Accent line */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-bk-yellow/20 to-transparent"></div>
      {children}
    </div>
  );
}

export default function Sidebar({ isCollapsed, onToggleCollapse, onResizeChange, onAddHost }) {
  const sidebarRef = useRef(null);
  const hostSectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState('db');
  const [contextMenu, setContextMenu] = useState(null);
  const [dbContextMenu, setDbContextMenu] = useState(null);
  const [brokerContextMenu, setBrokerContextMenu] = useState(null);

  const dispatch = useDispatch();
  const { hosts, selectedHostUid, loading: hostsLoading, authorizedHosts, isLoggingIntoHost, hostAuthErrors } = useSelector((state) => state.host);
  const { databases, activeDatabases, loading: dbLoading, actionLoading: dbActionLoading, selectedDatabase, selectedDatabaseSubItem } = useSelector((state) => state.database);
  const { brokers, loading: brokerLoading, actionLoading: brokerActionLoading, selectedBroker } = useSelector((state) => state.broker);

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  const handleHostLogin = useCallback((uid) => {
    if (!uid) return;
    dispatch(loginToHost(uid))
      .unwrap()
      .then(() => {
        dispatch(fetchDatabaseStartInfo(uid));
        dispatch(fetchBrokerList(uid));
      })
      .catch((err) => {
        console.error('Failed to log into host:', err);
      });
  }, [dispatch]);

  useEffect(() => {
    if (selectedHostUid) {
      handleHostLogin(selectedHostUid);
    }
  }, [selectedHostUid, handleHostLogin]);

  const handleContextMenu = (e, serverName, hostUid, alias) => {
    e.preventDefault();
    setDbContextMenu(null);

    // Position exactly at mouse cursor
    // We will let the menu's own effect handle inner boundary checks if possible, 
    // but for now, we'll do a simple window check.
    const x = e.clientX;
    const y = e.clientY;

    setContextMenu({
      mouseX: x,
      mouseY: y,
      server: serverName,
      hostUid: hostUid,
      alias: alias
    });
  };

  const handleDbContextMenu = (e, dbName, isActive) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);

    const x = e.clientX;
    const y = e.clientY;

    setDbContextMenu({
      mouseX: x,
      mouseY: y,
      db: dbName,
      isActive: isActive,
    });
  };

  const handleBrokerContextMenu = (e, brokerName, state) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setDbContextMenu(null);

    const x = e.clientX;
    const y = e.clientY;

    setBrokerContextMenu({
      mouseX: x,
      mouseY: y,
      broker: brokerName,
      state: state
    });
  };

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setDbContextMenu(null);
      setBrokerContextMenu(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const resizer = document.getElementById('resizer');
    const vResizer = document.getElementById('v-resizer');
    const sidebar = sidebarRef.current;
    const hostSection = hostSectionRef.current;

    if (!resizer || !vResizer || !sidebar || !hostSection) return;

    let isResizingH = false;
    let isResizingV = false;

    const onMouseDownH = (e) => {
      if (isCollapsed) return;
      isResizingH = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      onResizeChange(true);
    };

    const onMouseDownV = (e) => {
      if (isCollapsed) return;
      isResizingV = true;
      vResizer.classList.add('resizing');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e) => {
      if (isResizingH) {
        const newWidth = e.clientX;
        if (newWidth > 150 && newWidth < 600) {
          sidebar.style.width = `${newWidth}px`;
        }
      }
      if (isResizingV) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const newHeight = e.clientY - sidebarRect.top - 68;
        if (newHeight > 100 && newHeight < (sidebarRect.height - 250)) {
          hostSection.style.height = `${newHeight}px`;
        }
      }
    };

    const onMouseUp = () => {
      if (isResizingH) onResizeChange(false);
      isResizingH = false;
      isResizingV = false;
      vResizer.classList.remove('resizing');
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    resizer.addEventListener('mousedown', onMouseDownH);
    vResizer.addEventListener('mousedown', onMouseDownV);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      resizer.removeEventListener('mousedown', onMouseDownH);
      vResizer.removeEventListener('mousedown', onMouseDownV);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isCollapsed, onResizeChange]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-bk-side flex flex-col ${isCollapsed ? 'collapsed' : ''}`}
        id="sidebar"
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5 bg-white dark:bg-bk-side relative overflow-hidden group/header">
          <div className="relative flex-shrink-0">
            <div className="relative w-7 h-7 rounded-md bg-slate-50 dark:bg-bk-main border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center p-1.5 transition-all duration-500 group-hover/header:-translate-y-0.5">
              <img src="/cubrid-logo.png" alt="CUBRID Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-[12px] font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase flex items-center gap-1">
              <span className="text-bk-yellow font-extrabold tracking-wider">CUBRID</span>
              <span className="text-slate-400 dark:text-slate-500 font-light lowercase tracking-tight opacity-70">manager</span>
            </h1>
            <span className="px-1 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3px] text-[6px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter ml-1">
              v1.0
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Section 1: Host List (40% default height, adjustable) */}
          <details className="flex-none group/hosts border-b border-slate-200 dark:border-slate-800 flex flex-col" open>
            <summary className="flex-none px-4 py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] group-open/hosts:rotate-180 transition-transform text-slate-400">expand_more</span>
                <span>Server List</span>
              </div>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full font-normal lowercase tracking-normal group-open/hosts:hidden animate-in fade-in">{hosts.length} found</span>
            </summary>
            <div 
              ref={hostSectionRef} 
              className="overflow-y-auto p-2 space-y-0.5 bg-slate-50/50 dark:bg-black/10 min-h-[100px]" 
              id="host-section"
              style={{ height: '260px' }} // Approx 25% default
            >

            {hostsLoading && (
              <div className="flex items-center justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}

            {!hostsLoading && hosts.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-400 text-center">No hosts found</p>
            )}

            {hosts.map((host) => {
              const isSelected = selectedHostUid === host.uid;
              const isAuthorized = authorizedHosts.includes(host.uid);
              return (
                <div
                  key={host.uid}
                  title={`${host.address}:${host.port}`}
                  className={`flex flex-col px-3 py-2 cursor-pointer transition-all select-none rounded-md group relative mb-0.5
                    ${isSelected
                      ? 'bg-bk-yellow/10 ring-1 ring-bk-yellow/20'
                      : 'hover:bg-white dark:hover:bg-white/5'
                    }`}
                  onClick={() => {
                    dispatch(setSelectedHost(host.uid));
                    dispatch(setActiveMainTab('host:' + host.uid));
                  }}
                  onContextMenu={(e) => handleContextMenu(e, host.alias || host.id, host.uid, host.alias || host.id)}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-[4px] transition-all flex items-center justify-center
                      ${isSelected ? 'bg-bk-yellow text-slate-900 shadow-[0_1px_4px_rgba(255,214,0,0.4)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                      <span className="material-symbols-outlined text-[13px] leading-none" style={{ fontVariationSettings: "'wght' 300" }}>
                        {isSelected ? 'dns' : 'storage'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[13px] font-semibold truncate tracking-tight transition-colors 
                          ${isSelected ? 'text-bk-yellow dark:text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow'}`}>
                          {host.alias || host.id}
                        </span>
                        {isAuthorized && (
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] flex-shrink-0"></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </details>

          {/* Vertical Resizer Handle */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 cursor-row-resize transition-colors" id="v-resizer" title="Drag to resize sections"></div>

          {/* Section 2 & 3: Tabs & Tree View */}
          <div className="flex-1 flex flex-col overflow-hidden mt-1" id="tree-section-container">
            {selectedHostUid ? (
              <>
                {/* Section 2: Compact Tabs */}
                <div className="px-3 py-1.5 bg-white dark:bg-bk-side border-b border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-1 p-0.5 bg-slate-50 dark:bg-bk-main/40 rounded-md">
                    <button
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all ${activeTab === 'db' ? 'bg-bk-yellow text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      onClick={() => {
                        setActiveTab('db');
                        dispatch(setSelectedDatabase(null));
                        dispatch(setSelectedDatabaseSubItem(null));
                        dispatch(setSelectedBroker(null));
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 500" }}>database</span>
                      <span className="text-[11px] font-medium tracking-tight">Database</span>
                    </button>
                    <button
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all ${activeTab === 'broker' ? 'bg-bk-yellow text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      onClick={() => {
                        setActiveTab('broker');
                        dispatch(setSelectedDatabase(null));
                        dispatch(setSelectedDatabaseSubItem(null));
                        dispatch(setSelectedBroker(null));
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 500" }}>hub</span>
                      <span className="text-[11px] font-medium tracking-tight">Broker</span>
                    </button>
                    <button
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md transition-all ${activeTab === 'log' ? 'bg-bk-yellow text-slate-900 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      onClick={() => {
                        setActiveTab('log');
                        dispatch(setSelectedDatabase(null));
                        dispatch(setSelectedDatabaseSubItem(null));
                        dispatch(setSelectedBroker(null));
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 500" }}>receipt_long</span>
                      <span className="text-[11px] font-medium tracking-tight">Log</span>
                    </button>
                  </div>
                </div>


                {/* Section 3: Tree View */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 relative min-h-[200px]">

                  {/* Host Login Loading Overlay */}
                  {isLoggingIntoHost && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-bk-side/80 z-[210] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-bk-yellow/10 border-t-bk-yellow rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-bk-yellow animate-pulse">lock_open</span>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-bk-yellow tracking-wide mb-1">Host login</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Establishing secure session with the database manager...</p>
                    </div>
                  )}

                  {/* Host Login Error State */}
                  {!isLoggingIntoHost && selectedHostUid && hostAuthErrors[selectedHostUid] && (
                    <div className="absolute inset-0 bg-white dark:bg-bk-side z-[210] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                        <span className="material-symbols-outlined text-rose-500 text-3xl">error</span>
                      </div>
                      <h3 className="text-sm font-medium text-rose-500 tracking-wide mb-2">Connection failed</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
                        {hostAuthErrors[selectedHostUid]}
                      </p>
                      <button
                        onClick={() => handleHostLogin(selectedHostUid)}
                        className="px-6 py-2 bg-slate-900 dark:bg-bk-yellow text-white dark:text-bk-side text-[10px] font-medium tracking-wide rounded transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Loading overlay for start/stop operations */}
                  {(dbActionLoading || brokerActionLoading) && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-bk-main/60 z-[200] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">

                      <div className="flex flex-col items-center gap-3 bg-white dark:bg-bk-side px-8 py-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 border-4 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                        <span className="text-xs font-medium tracking-wide text-slate-900 dark:text-bk-yellow">Processing...</span>
                      </div>
                    </div>
                  )}

                  <div className={`mt-2 ${(!authorizedHosts.includes(selectedHostUid) || isLoggingIntoHost) ? 'opacity-20 blur-[1px] pointer-events-none' : 'opacity-100 transition-all duration-500'}`} id="db-tree-container">
                    <p className="px-3 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-500 mb-4 flex items-center gap-2">
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                      {activeTab === 'db' && 'Databases'}
                      {activeTab === 'broker' && 'Brokers'}
                      {activeTab === 'log' && 'Logs'}
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                    </p>

                    <div className="space-y-1">
                      {activeTab === 'db' && (
                        <>
                          {dbLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </div>
                          ) : (
                            databases.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-slate-400">No databases found</div>
                            ) : (
                              databases.map((db) => {
                                const isActive = activeDatabases.includes(db.dbname);
                                return (
                                  <details key={db.dbname} className="group">
                                    <summary
                                      className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer list-none rounded transition-all select-none mb-0.5 group/sum ${db.dbname === selectedDatabase ? 'bg-bk-yellow/10 text-bk-yellow shadow-sm border border-bk-yellow/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                      onClick={() => dispatch(setSelectedDatabase(db.dbname))}
                                      onDoubleClick={() => dispatch(setActiveMainTab('db:' + db.dbname))}
                                      onContextMenu={(e) => handleDbContextMenu(e, db.dbname, isActive)}
                                    >
                                      <span className={`material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform ${db.dbname === selectedDatabase ? 'text-bk-yellow' : 'text-slate-400'}`} style={{ fontVariationSettings: "'wght' 300" }}>chevron_right</span>
                                      <span className={`material-symbols-outlined text-[16px] ${db.dbname === selectedDatabase ? 'text-bk-yellow' : 'text-slate-400'}`} style={{ fontVariationSettings: "'wght' 300" }}>
                                        database
                                      </span>
                                      <span className={`text-[11.5px] font-medium transition-colors flex-1 ${db.dbname === selectedDatabase ? 'text-bk-yellow' : 'text-slate-800 dark:text-slate-200 group-hover/sum:text-bk-yellow'}`}>{db.dbname}</span>


                                      {isActive ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 rounded-full tracking-tighter">
                                          <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                          </span>
                                          On
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20 rounded-full tracking-tighter">
                                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                          Off
                                        </span>
                                      )}


                                    </summary>
                                    <div className="ml-[22px] border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
                                      {[
                                        { id: 'Users', icon: 'group' },
                                        { id: 'Job automation', icon: 'bolt' },
                                        { id: 'Query plan', icon: 'schema' },
                                        { id: 'Space', icon: 'donut_small' },
                                        { id: 'Logs', icon: 'history' }
                                      ].map((item) => {
                                        const isItemSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === item.id;
                                        return (
                                          <button
                                            key={item.id}
                                            className={`flex items-center gap-3 px-3.5 py-1.5 w-full text-left transition-all group/item relative rounded-r-md
                                              ${isItemSelected 
                                                ? 'text-bk-yellow font-medium bg-bk-yellow/5' 
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-bk-yellow'}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              dispatch(setSelectedDatabase(db.dbname));
                                              dispatch(setSelectedDatabaseSubItem(item.id));
                                            }}
                                          >
                                            <span className={`material-symbols-outlined text-[16px] transition-colors
                                              ${isItemSelected ? 'text-bk-yellow' : 'text-slate-400 group-hover/item:text-bk-yellow'}`} 
                                              style={{ fontVariationSettings: "'wght' 300" }}>
                                              {item.icon}
                                            </span>
                                            <span className="text-[11px] tracking-wide whitespace-nowrap">{item.id}</span>
                                            {isItemSelected && (
                                              <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-bk-yellow rounded-full shadow-[0_0_8px_rgba(255,215,0,0.3)]"></div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </details>
                                );
                              })

                            )
                          )}
                        </>
                      )}
                      {activeTab === 'broker' && (
                        <>
                          {brokerLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </div>
                          ) : (
                            brokers.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-slate-400">No brokers found</div>
                            ) : (
                              brokers.map((broker) => {
                                const isOn = broker.state === 'ON';
                                return (
                                    <a
                                      key={broker.name}
                                      className={`flex items-center gap-2 px-3 py-1.5 text-[11px] rounded transition-all cursor-pointer select-none mb-0.5 group ${selectedBroker === broker.name ? 'bg-bk-yellow/10 text-bk-yellow shadow-sm border border-bk-yellow/10' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 hover:text-bk-yellow'}`}
                                      onClick={() => dispatch(setSelectedBroker(broker.name))}
                                      onContextMenu={(e) => handleBrokerContextMenu(e, broker.name, broker.state)}
                                    >
                                      <span className={`material-symbols-outlined transition-colors text-[16px] ${selectedBroker === broker.name ? 'text-bk-yellow' : 'text-slate-400 group-hover:text-bk-yellow'}`} style={{ fontVariationSettings: "'wght' 300" }}>hub</span>
                                      <div className="flex-1 flex flex-col">
                                        <span className={`text-[11.5px] font-medium transition-colors ${selectedBroker === broker.name ? 'text-bk-yellow' : 'group-hover:text-bk-yellow'}`}>{broker.name}</span>
                                        <span className={`text-[9px] opacity-50 font-normal transition-colors -mt-0.5 ${selectedBroker === broker.name ? 'text-bk-yellow/70' : 'group-hover:text-bk-yellow/70'}`}>Port: {broker.port}</span>
                                      </div>

                                    {isOn ? (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 rounded-full tracking-tighter">
                                        <span className="relative flex h-1.5 w-1.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                        </span>
                                        On
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20 rounded-full tracking-tighter">
                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                        Off
                                      </span>
                                    )}


                                  </a>
                                );
                              })

                            )
                          )}
                        </>
                      )}
                      {activeTab === 'log' && (
                        <>
                          <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 rounded transition-all cursor-pointer mb-0.5 hover:text-bk-yellow group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-bk-yellow transition-colors text-[16px]" style={{ fontVariationSettings: "'wght' 300" }}>hub</span>
                            <span className="text-[11.5px] font-medium tracking-tight">Broker logs</span>
                          </a>
                          <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 rounded transition-all cursor-pointer mb-0.5 hover:text-bk-yellow group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-bk-yellow transition-colors text-[16px]" style={{ fontVariationSettings: "'wght' 300" }}>manage_accounts</span>
                            <span className="text-[11.5px] font-medium tracking-tight">Manager logs</span>
                          </a>
                          <a className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 rounded transition-all cursor-pointer mb-0.5 hover:text-bk-yellow group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-bk-yellow transition-colors text-[16px]" style={{ fontVariationSettings: "'wght' 300" }}>dns</span>
                            <span className="text-[11.5px] font-medium tracking-tight">Server logs</span>
                          </a>





                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                {/* Ambient glow backgrounds */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-bk-yellow/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center max-w-[200px]">
                  <div className="relative mb-6">
                    {/* Background circles for depth */}
                    <div className="absolute inset-0 scale-[1.5] bg-slate-100 dark:bg-white/5 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-16 h-16 bg-white dark:bg-bk-side rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-white/5 rotate-3 transition-transform hover:rotate-0 duration-500">
                      <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500" style={{ fontVariationSettings: "'wght' 200" }}>account_tree</span>
                    </div>
                    {/* Floating smaller icon */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-bk-yellow rounded-lg flex items-center justify-center shadow-lg -rotate-12 transition-transform hover:rotate-0 duration-500 shadow-bk-yellow/20">
                      <span className="material-symbols-outlined text-bk-side text-[18px]" style={{ fontVariationSettings: "'wght' 500" }}>dns</span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight mb-2">No Server Selected</h3>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-500 font-medium">
                    Select a connection from the list above to manage databases, brokers, and view logs.
                  </p>
                  
                  {/* Subtle pointing arrow for UX */}
                  <div className="mt-8 animate-bounce opacity-30">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">expand_less</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Add Host Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-bk-yellow to-[#ffd700] hover:from-[#ffd700] hover:to-bk-yellow text-bk-side px-4 py-2 rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.96] relative overflow-hidden group"
            id="sidebar-footer-btn"
            onClick={onAddHost}
          >
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-white/20"></div>
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-90 duration-300" style={{ fontVariationSettings: "'wght' 500" }}>add_circle</span>
            <span className="tracking-wide">Add Host</span>
          </button>

        </div>
      </aside>
      <div
        className="w-1 hover:w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-primary transition-all cursor-col-resize h-full flex-shrink-0 z-10"
        id="resizer"
        title="Drag to resize"
      ></div>

      {/* Context Menu Dropdown */}
      {contextMenu && (
        <ContextMenuWrapper
          key={`ctx-${contextMenu.mouseX}-${contextMenu.mouseY}`}
          x={contextMenu.mouseX}
          y={contextMenu.mouseY}
          onClose={() => setContextMenu(null)}
        >
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mb-1 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span>Server: {contextMenu.server}</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-bk-yellow/40"></div>
              <div className="w-1 h-1 rounded-full bg-bk-yellow/40"></div>
            </div>
          </div>
          <MenuItem
            icon="power_settings_new"
            iconColor="text-rose-500"
            label="Disconnect"
            onClick={() => {
              const targetUid = contextMenu.hostUid;
              dispatch(revokeHostLogin(targetUid));
              if (selectedHostUid === targetUid) {
                dispatch(setSelectedHost(null));
                dispatch(closeHostTabs(targetUid));
              }
              setContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem icon="add_box" label="Add Host" onClick={() => { onAddHost(); setContextMenu(null); }} />
          <MenuItem
            icon="edit"
            label="Edit Host"
            onClick={() => {
              dispatch(openEditHostModal(contextMenu.hostUid));
              setContextMenu(null);
            }}
          />
          <MenuItem
            icon="delete"
            iconColor="text-rose-500"
            label="Delete Host"
            onClick={() => {
              dispatch(openDeleteHostModal({ hostUid: contextMenu.hostUid, alias: contextMenu.alias }));
              setContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem icon="lock" label="Change Password" />
          <MenuItem
            icon="info"
            label="Server Version"
            onClick={() => {
              dispatch(openServerVersionModal(contextMenu.hostUid));
              setContextMenu(null);
            }}
          />

        </ContextMenuWrapper>
      )}

      {/* Database Context Menu */}
      {dbContextMenu && (
        <ContextMenuWrapper
          key={`db-ctx-${dbContextMenu.mouseX}-${dbContextMenu.mouseY}`}
          x={dbContextMenu.mouseX}
          y={dbContextMenu.mouseY}
          onClose={() => setDbContextMenu(null)}
        >
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mb-1 border-b border-slate-100 dark:border-white/5">
            Database: {dbContextMenu.db}
          </div>
          {dbContextMenu.isActive ? (
            <MenuItem
              icon="stop"
              iconColor="text-rose-500"
              label="Stop Database"
              onClick={() => {
                dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db }));
                setDbContextMenu(null);
              }}
            />
          ) : (
            <MenuItem
              icon="play_arrow"
              iconColor="text-emerald-500"
              label="Start Database"
              onClick={() => {
                dispatch(startDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db }));
                setDbContextMenu(null);
              }}
            />
          )}
          <MenuDivider />

          {/* Manage Database Submenu */}
          <SubMenu icon="settings" label="Manage Database">
            <MenuItem
              icon="upload"
              label="Database Unload"
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openUnloadDBModal());
                setDbContextMenu(null);
              }}
            />
            <MenuItem
              icon="download"
              label="Database Load"
              disabled={dbContextMenu.isActive}
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openLoadDBModal());
                setDbContextMenu(null);
              }}
            />
            <MenuItem
              icon="check_circle"
              label="Check Database"
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openCheckDatabaseModal());
                setDbContextMenu(null);
              }}
            />
            <MenuItem
              icon="compress"
              label="Compact Database"
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openCompactDatabaseModal());
                setDbContextMenu(null);
              }}
            />
            <MenuItem
              icon="content_copy"
              label="Copy Database"
              disabled={dbContextMenu.isActive}
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openCopyDatabaseModal());
                setDbContextMenu(null);
              }}
            />
            <MenuDivider />

            <MenuItem icon="add_circle" iconColor="text-accent-green" label="Create Database" />
            <MenuItem icon="drive_file_rename_outline" iconColor="text-accent-orange" label="Rename Database" />
            <MenuDivider />
            <MenuItem icon="restore" label="Restore Database" />
            <MenuItem
              icon="backup"
              label="Backup Database"
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openBackupDatabaseModal());
                setDbContextMenu(null);
              }}
            />
            <MenuDivider />
            <MenuItem icon="delete" iconColor="text-accent-red" label="Delete Database" />
          </SubMenu>


          {/* Database Info Submenu */}
          <SubMenu icon="info" label="Database Info" width="w-52">
            <MenuItem
              icon="lock_open"
              label="Lock Information"
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openLockInfoModal());
                setDbContextMenu(null);
              }}
            />
            <MenuItem
              icon="swap_horiz"
              label="Transaction Info"
              onClick={() => {
                dispatch(setSelectedDatabase(dbContextMenu.db));
                dispatch(openTransactionInfoModal());
                setDbContextMenu(null);
              }}
            />
            <MenuItem icon="schema" label="Plan Dump" />
            <MenuItem icon="data_object" label="Param Dump" />
            <MenuItem icon="explore" label="OID Navigation" />
          </SubMenu>

          <MenuDivider />
          <MenuItem icon="tune" label="Properties" />
        </ContextMenuWrapper>
      )}

      {/* Broker Context Menu */}
      {brokerContextMenu && (
        <ContextMenuWrapper
          key={`broker-ctx-${brokerContextMenu.mouseX}-${brokerContextMenu.mouseY}`}
          x={brokerContextMenu.mouseX}
          y={brokerContextMenu.mouseY}
          onClose={() => setBrokerContextMenu(null)}
        >
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide mb-1 border-b border-slate-100 dark:border-white/5">
            Broker: {brokerContextMenu.broker}
          </div>
          {brokerContextMenu.state === 'ON' ? (
            <MenuItem
              icon="stop"
              iconColor="text-rose-500"
              label="Stop Broker"
              onClick={() => {
                dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker }));
                setBrokerContextMenu(null);
              }}
            />
          ) : (
            <MenuItem
              icon="play_arrow"
              iconColor="text-emerald-500"
              label="Start Broker"
              onClick={() => {
                dispatch(startBroker({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker }));
                setBrokerContextMenu(null);
              }}
            />
          )}
          <MenuDivider />
          <MenuItem icon="info" label="Status" />
          <MenuItem icon="tune" label="Properties" />

        </ContextMenuWrapper>
      )}
    </>
  );
}
