import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHosts, setSelectedHost, loginToHost, openDeleteHostModal, openEditHostModal, revokeHostLogin } from '../../host/hostSlice';
import { fetchDatabaseStartInfo, setSelectedDatabase, startDatabase, stopDatabase, openUnloadDBModal, openLoadDBModal, openCheckDatabaseModal, openCompactDatabaseModal, openCopyDatabaseModal, openBackupDatabaseModal, openLockInfoModal } from '../../database/databaseSlice';
import { fetchBrokerList } from '../../broker/brokerSlice';
import { setActiveMainTab, closeHostTabs } from '../layoutSlice';
import { SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';
import { useLayoutEffect } from 'react';

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
      className={`fixed z-50 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm py-1 animate-in fade-in zoom-in-95 duration-75 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
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

  const dispatch = useDispatch();
  const { hosts, selectedHostUid, loading: hostsLoading, authorizedHosts } = useSelector((state) => state.host);
  const { databases, activeDatabases, loading: dbLoading, actionLoading: dbActionLoading } = useSelector((state) => state.database);
  const { brokers, loading: brokerLoading } = useSelector((state) => state.broker);

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedHostUid) {
      // Re-invoke login first, wait for success, then fetch DBs and Brokers sequentially.
      dispatch(loginToHost(selectedHostUid))
        .unwrap()
        .then(() => {
          dispatch(fetchDatabaseStartInfo(selectedHostUid));
          dispatch(fetchBrokerList(selectedHostUid));
        })
        .catch((err) => {
          console.error('Failed to log into host:', err);
        });
    }
  }, [dispatch, selectedHostUid]);

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

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setDbContextMenu(null);
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
        className={`w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col ${isCollapsed ? 'collapsed' : ''}`}
        id="sidebar"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="flex items-center justify-center">
            <img src="/cubrid-logo.png" alt="CUBRID Logo" className="h-6" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Cubrid Manager</h2>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Section 1: Host List */}
          <div ref={hostSectionRef} className="flex-none overflow-y-auto p-2 space-y-1 min-h-[100px]" id="host-section" style={{ height: '180px' }}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 section-title">Servers</p>
            
            {hostsLoading && (
              <div className="flex items-center justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}

            {!hostsLoading && hosts.length === 0 && (
              <p className="px-3 py-1.5 text-xs text-slate-400 text-center">No hosts found</p>
            )}

            {hosts.map((host) => (
              <div
                key={host.uid}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-sm cursor-pointer transition-colors select-none ${
                  selectedHostUid === host.uid
                    ? 'bg-primary/10 text-primary font-semibold-light '
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                onClick={() => {
                  dispatch(setSelectedHost(host.uid));
                  dispatch(setActiveMainTab('host:' + host.uid));
                }}
                onContextMenu={(e) => handleContextMenu(e, host.alias || host.id, host.uid, host.alias || host.id)}
              >
                <span className="material-symbols-outlined">{selectedHostUid === host.uid ? 'dns' : 'storage'}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{host.alias || host.id}</span>
                  <span className="text-[10px] text-slate-400 truncate">{host.address}:{host.port}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Vertical Resizer Handle */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 cursor-row-resize transition-colors" id="v-resizer" title="Drag to resize sections"></div>

          {/* Section 2 & 3: Tabs & Tree View */}
          <div className="flex-1 flex flex-col overflow-hidden" id="tree-section-container">
            {selectedHostUid ? (
              <>
                {/* Section 2: Tabs */}
                <div className="px-4 py-2 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-sm">
                <button
                  className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-sm transition-colors ${activeTab === 'db' ? 'bg-primary/10 text-primary font-semibold-light ' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                  onClick={() => setActiveTab('db')}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === 'db' ? 'text-primary' : ''}`}>database</span>
                  <span className="text-[9px] uppercase tracking-wider">DB</span>
                </button>
                <button
                  className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-sm transition-colors ${activeTab === 'broker' ? 'bg-primary/10 text-primary font-semibold-light ' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                  onClick={() => setActiveTab('broker')}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === 'broker' ? 'text-primary' : ''}`}>hub</span>
                  <span className="text-[9px] uppercase tracking-wider">Broker</span>
                </button>
                <button
                  className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-sm transition-colors ${activeTab === 'log' ? 'bg-primary/10 text-primary font-semibold-light ' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800'}`}
                  onClick={() => setActiveTab('log')}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeTab === 'log' ? 'text-primary' : ''}`}>receipt_long</span>
                  <span className="text-[9px] uppercase tracking-wider">Log</span>
                </button>
              </div>
            </div>

            {/* Section 3: Tree View */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 relative">
              {/* Loading overlay for start/stop operations */}
              {dbActionLoading && (
                <div className="absolute inset-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-center[1px]">
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded-sm border border-slate-200 dark:border-slate-800">
                    <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-900 dark:text-white">Processing...</span>
                  </div>
                </div>
              )}
              <div className="mt-2" id="db-tree-container">
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  {activeTab === 'db' && 'Database Tree'}
                  {activeTab === 'broker' && 'Broker Tree'}
                  {activeTab === 'log' && 'Log Tree'}
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
                          <div className="px-3 py-1.5 text-xs text-slate-400">No databases found</div>
                        ) : (
                          databases.map((db) => {
                            const isActive = activeDatabases.includes(db.dbname);
                            return (
                              <details key={db.dbname} className="group" open>
                                <summary 
                                  className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm transition-colors select-none"
                                  onClick={() => dispatch(setSelectedDatabase(db.dbname))}
                                  onDoubleClick={() => dispatch(setActiveMainTab('db:' + db.dbname))}
                                  onContextMenu={(e) => handleDbContextMenu(e, db.dbname, isActive)}
                                >
                                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-open:rotate-90 transition-transform">chevron_right</span>
                                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-accent-green' : 'text-slate-400'}`}>
                                    database
                                  </span>
                                  <span className="text-[13px] font-medium">{db.dbname}</span>
                                </summary>
                                <div className="ml-8 border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
                                    <a className="flex items-center gap-2 px-3 py-1 text-[13px] text-slate-600 hover:text-primary dark:text-slate-400 transition-colors" href="#"><span className="material-symbols-outlined text-[16px] text-accent-purple">group</span> Users</a>
                                    <a className="flex items-center gap-2 px-3 py-1 text-[13px] text-slate-600 hover:text-primary dark:text-slate-400 transition-colors" href="#"><span className="material-symbols-outlined text-[16px] text-accent-yellow">bolt</span> Job Automation</a>
                                    <a className="flex items-center gap-2 px-3 py-1 text-[13px] text-slate-600 hover:text-primary dark:text-slate-400 transition-colors" href="#"><span className="material-symbols-outlined text-[16px] text-accent-green">schema</span> Query Plan</a>
                                    <a className="flex items-center gap-2 px-3 py-1 text-[13px] text-slate-600 hover:text-primary dark:text-slate-400 transition-colors" href="#"><span className="material-symbols-outlined text-[16px] text-accent-orange">donut_small</span> Database Space</a>
                                    <a className="flex items-center gap-2 px-3 py-1 text-[13px] text-slate-600 hover:text-primary dark:text-slate-400 transition-colors" href="#"><span className="material-symbols-outlined text-[16px] text-accent-red">history</span> Log</a>
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
                          <div className="px-3 py-1.5 text-xs text-slate-400">No brokers found</div>
                        ) : (
                          brokers.map((broker) => {
                            const isOn = broker.state === 'ON';
                            return (
                              <a
                                key={broker.name}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-sm transition-colors cursor-pointer select-none"
                              >
                                <span className={`material-symbols-outlined text-[18px] ${isOn ? 'text-accent-green' : 'text-slate-400'}`}>hub</span>
                                <span className="font-medium">{broker.name} ({broker.port})</span>
                              </a>
                            );
                          })
                        )
                      )}
                    </>
                  )}
                  {activeTab === 'log' && (
                    <>
                      <a className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-sm transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-accent-orange text-[18px]">hub</span>
                        <span className="font-medium">Broker</span>
                      </a>
                      <a className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-sm transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-accent-purple text-[18px]">manage_accounts</span>
                        <span className="font-medium">Manager</span>
                      </a>
                      <a className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-sm transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-accent-green text-[18px]">dns</span>
                        <span className="font-medium">Server</span>
                      </a>
                    </>
                  )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">dns</span>
                <p className="text-sm">Select a server to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Add Host Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            className="flex w-full items-center justify-center gap-2 bg-primary text-white px-2 py-1 rounded-sm text-sm font-semibold hover:bg-primary/90 transition-colors" 
            id="sidebar-footer-btn"
            onClick={onAddHost}
          >
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            <span>Add Host</span>
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
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 border-b border-slate-200 dark:border-slate-800">
            {contextMenu.server}
          </div>
          <button 
            className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
            onClick={() => {
              const targetUid = contextMenu.hostUid;
              dispatch(revokeHostLogin(targetUid));
              if (selectedHostUid === targetUid) {
                dispatch(setSelectedHost(null));
                dispatch(closeHostTabs(targetUid));
              }
              setContextMenu(null);
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-accent-red">power_settings_new</span>
            Disconnect
          </button>
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
          <button className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-accent-blue">add_box</span>
            Add Host
          </button>
          <button 
            className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
            onClick={() => {
              dispatch(openEditHostModal(contextMenu.hostUid));
              setContextMenu(null);
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-accent-orange">edit</span>
            Edit Host
          </button>
          <button 
            className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
            onClick={() => {
              dispatch(openDeleteHostModal({ hostUid: contextMenu.hostUid, alias: contextMenu.alias }));
              setContextMenu(null);
            }}
          >
            <span className="material-symbols-outlined text-[18px] text-accent-red">delete</span>
            Delete Host
          </button>
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
          <button className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-accent-purple">lock</span>
            Change Manager Password
          </button>
          <button className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px] text-accent-green">info</span>
            Server Version
          </button>
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
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5 border-b border-slate-200 dark:border-slate-800">
            {dbContextMenu.db}
          </div>
          {dbContextMenu.isActive ? (
            <button 
              className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              onClick={() => {
                dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db }));
                setDbContextMenu(null);
              }}
            >
              <span className="material-symbols-outlined text-[18px] text-accent-red">stop</span>
              Stop Database
            </button>
          ) : (
            <button 
              className="w-full text-left px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              onClick={() => {
                dispatch(startDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db }));
                setDbContextMenu(null);
              }}
            >
              <span className="material-symbols-outlined text-[18px] text-accent-green">play_arrow</span>
              Start Database
            </button>
          )}
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

          {/* Manage Database Submenu */}
          <SubMenu icon="settings" iconColor="text-accent-blue" label="Manage Database">
            <MenuItem 
                icon="upload" 
                iconColor="text-accent-orange" 
                label="Database Unload" 
                onClick={() => {
                    dispatch(setSelectedDatabase(dbContextMenu.db));
                    dispatch(openUnloadDBModal());
                    setDbContextMenu(null);
                }}
            />
            <MenuItem 
                icon="download" 
                iconColor="text-accent-blue" 
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
                iconColor="text-accent-green" 
                label="Check Database" 
                onClick={() => {
                    dispatch(setSelectedDatabase(dbContextMenu.db));
                    dispatch(openCheckDatabaseModal());
                    setDbContextMenu(null);
                }}
            />
            <MenuItem 
                icon="compress" 
                iconColor="text-accent-purple" 
                label="Compact Database" 
                onClick={() => {
                    dispatch(setSelectedDatabase(dbContextMenu.db));
                    dispatch(openCompactDatabaseModal());
                    setDbContextMenu(null);
                }}
            />
            <MenuItem 
                icon="content_copy" 
                iconColor="text-accent-blue" 
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
            <MenuItem icon="restore" iconColor="text-accent-green" label="Restore Database" />
            <MenuItem 
                icon="backup" 
                iconColor="text-accent-blue" 
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
          <SubMenu icon="info" iconColor="text-accent-orange" label="Database Info" width="w-52">
            <MenuItem 
                icon="lock_open" 
                iconColor="text-accent-blue" 
                label="Lock Information" 
                onClick={() => {
                    dispatch(setSelectedDatabase(dbContextMenu.db));
                    dispatch(openLockInfoModal());
                    setDbContextMenu(null);
                }}
            />
            <MenuItem icon="swap_horiz" iconColor="text-accent-purple" label="Transaction Info" />
            <MenuItem icon="schema" iconColor="text-accent-green" label="Plan Dump" />
            <MenuItem icon="data_object" iconColor="text-accent-yellow" label="Param Dump" />
            <MenuItem icon="explore" iconColor="text-accent-blue" label="OID Navigation" />
          </SubMenu>

          <MenuDivider />
          <MenuItem icon="tune" iconColor="text-accent-purple" label="Properties" />
        </ContextMenuWrapper>
      )}
    </>
  );
}
