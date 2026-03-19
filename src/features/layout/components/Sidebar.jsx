import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchHosts,
  setSelectedHost,
  loginToHost,
  openDeleteHostModal,
  openEditHostModal,
  revokeHostLogin,
  openServerVersionModal,
  fetchHostEnv
} from '../../host/hostSlice';
import {
  fetchDatabaseStartInfo,
  startDatabase,
  stopDatabase,
  openUnloadDBModal,
  openLoadDBModal,
  openCheckDatabaseModal,
  openCompactDatabaseModal,
  openCopyDatabaseModal,
  openBackupDatabaseModal,
  openOptimizeDatabaseModal,
  openAddBackupPlanModal,
  openDeleteBackupPlanModal,
  openAutoBackupLogModal,
  openLockInfoModal,
  openTransactionInfoModal,
  setSelectedDatabase,
  openDeleteDBModal,
  openDatabasePropertyModal,
  openRenameDatabaseModal,
  openAddVolumeModal,
  openDatabaseInfoModal,
  openPlanDumpModal,
  openCreateDatabaseModal,
  openEditBackupPlanModal,
  fetchBackupSchedule,
  openAddQueryPlanModal,
  openAutoQueryLogModal,
  openSetAutomationVolumeModal,
  openAutoVolumeLogModal,
  fetchQueryPlan,
  setSelectedBackupId,
  setSelectedQueryPlanId,
  openLoginDatabaseModal
} from '../../database/databaseSlice';
import {
  fetchBrokerList,
  startBroker,
  stopBroker,
  setSelectedBroker,
  openBrokerPropertyModal
} from '../../broker/brokerSlice';
import { setActiveMainTab, openTab, closeHostTabs, showStatusModal } from '../layoutSlice';
import { fetchDatabaseUsers, openCreateUserModal, openEditUserModal, openDropUserModal } from '../../user/userSlice';
import { SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';
import ContextMenuWrapper from '../../../components/common/ContextMenuWrapper';

// Internal Sidebar Components
import SidebarHeader from '../sidebar/components/SidebarHeader';
import ServerListItem from '../sidebar/components/ServerListItem';
import TreeTabHeader from '../sidebar/components/TreeTabHeader';
import DatabaseTree from '../sidebar/components/DatabaseTree';
import BrokerTree from '../sidebar/components/BrokerTree';
import LogTree from '../sidebar/components/LogTree';
import SidebarEmptyState from '../sidebar/components/SidebarEmptyState';
import AddQueryPlanModal from '../../database/components/AddQueryPlanModal';
import AutoQueryLogModal from '../../database/components/AutoQueryLogModal';
import SetAutomationVolumeModal from '../../database/components/SetAutomationVolumeModal';
import AutoVolumeLogModal from '../../database/components/AutoVolumeLogModal';

// Internal Sidebar Components

export default function Sidebar({ isCollapsed, onToggleCollapse, onResizeChange, onAddHost }) {
  const sidebarRef = useRef(null);
  const hostSectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState('db');
  const [contextMenu, setContextMenu] = useState(null);
  const [dbContextMenu, setDbContextMenu] = useState(null);
  const [brokerContextMenu, setBrokerContextMenu] = useState(null);
  const [usersContextMenu, setUsersContextMenu] = useState(null);
  const [userContextMenu, setUserContextMenu] = useState(null);
  const [backupPlanContextMenu, setBackupPlanContextMenu] = useState(null);
  const [dbRootContextMenu, setDbRootContextMenu] = useState(null);
  const [spaceContextMenu, setSpaceContextMenu] = useState(null);
  const [queryPlanContextMenu, setQueryPlanContextMenu] = useState(null);
  const [brokerRootContextMenu, setBrokerRootContextMenu] = useState(null);

  const [backupItemContextMenu, setBackupItemContextMenu] = useState(null);

  const dispatch = useDispatch();
  const { hosts, selectedHostUid, loading: hostsLoading, authorizedHosts, isLoggingIntoHost, hostAuthErrors } = useSelector((state) => state.host);
  const { databases, activeDatabases, loggedInDatabases, actionLoading: dbActionLoading } = useSelector((state) => state.database);
  const { actionLoading: brokerActionLoading } = useSelector((state) => state.broker);

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  const closeAllContextMenus = useCallback(() => {
    setContextMenu(null);
    setDbContextMenu(null);
    setBrokerContextMenu(null);
    setUsersContextMenu(null);
    setUserContextMenu(null);
    setBackupPlanContextMenu(null);
    setDbRootContextMenu(null);
    setSpaceContextMenu(null);
    setQueryPlanContextMenu(null);
    setBrokerRootContextMenu(null);

    setBackupItemContextMenu(null);
  }, []);

  const handleHostLogin = useCallback((uid) => {
    if (!uid) return;
    dispatch(loginToHost(uid))
      .unwrap()
      .then(() => {
        dispatch(fetchDatabaseStartInfo(uid));
        dispatch(fetchBrokerList(uid));
        dispatch(fetchHostEnv(uid));
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
    closeAllContextMenus();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, server: serverName, hostUid, alias });
  };

  const handleDbContextMenu = (e, dbName, isActive) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setDbContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName, isActive });
  };

  const handleDbRootContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setDbRootContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
  };

  const handleBrokerContextMenu = (e, brokerName, state) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setBrokerContextMenu({ mouseX: e.clientX, mouseY: e.clientY, broker: brokerName, state });
  };

  const handleUsersContextMenu = (e, dbName) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setUsersContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName });
  };

  const handleUserContextMenu = (e, dbName, userName) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setUserContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName, user: userName });
  };

  const handleBackupPlanContextMenu = (e, dbName) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setBackupPlanContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName });
  };

  const handleSpaceContextMenu = (e, dbName) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setSpaceContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName });
  };

  const handleQueryPlanContextMenu = (e, dbName) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setQueryPlanContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName });
  };

  const handleBrokerRootContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    setBrokerRootContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
  };


  const handleBackupItemContextMenu = (e, dbName, planId) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllContextMenus();
    dispatch(setSelectedBackupId(planId));
    setBackupItemContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName, planId });
  };

  useEffect(() => {
    const handleOutsideAction = (e) => {
      // Check if click/contextmenu is outside of any active context menu
      const isInsideMenu = e.target.closest('.context-menu-container');
      if (!isInsideMenu) {
        closeAllContextMenus();
      }
    };

    // Use capture phase to catch events even if propagation is stopped elsewhere
    document.addEventListener('mousedown', handleOutsideAction, true);
    document.addEventListener('contextmenu', handleOutsideAction, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideAction, true);
      document.removeEventListener('contextmenu', handleOutsideAction, true);
    };
  }, [closeAllContextMenus]);

  // Resizing logic
  useEffect(() => {
    const resizer = document.getElementById('resizer');
    const vResizer = document.getElementById('v-resizer');
    const sidebar = sidebarRef.current;
    const hostSection = hostSectionRef.current;

    if (!resizer || !vResizer || !sidebar || !hostSection) return;

    let isResizingH = false;
    let isResizingV = false;

    const onMouseDownH = () => {
      if (isCollapsed) return;
      isResizingH = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      onResizeChange(true);
    };

    const onMouseDownV = () => {
      if (isCollapsed) return;
      isResizingV = true;
      vResizer.classList.add('resizing');
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e) => {
      if (isResizingH) {
        const newWidth = e.clientX;
        if (newWidth > 150 && newWidth < 600) sidebar.style.width = `${newWidth}px`;
      }
      if (isResizingV) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const newHeight = e.clientY - sidebarRect.top - 68;
        if (newHeight > 100 && newHeight < (sidebarRect.height - 250)) hostSection.style.height = `${newHeight}px`;
      }
    };

    const onMouseUp = () => {
      if (isResizingH) onResizeChange(false);
      isResizingH = isResizingV = false;
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
      <aside ref={sidebarRef} className={`w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-bk-side flex flex-col ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <SidebarHeader />

        <div className="flex flex-col flex-1 overflow-hidden">
          <details className="flex-none group/hosts border-b border-slate-200 dark:border-slate-800 flex flex-col" open>
            <summary className="flex-none px-4 py-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] group-open/hosts:rotate-180 transition-transform text-slate-400">expand_more</span>
                <span>Server List</span>
              </div>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full font-normal lowercase tracking-normal group-open/hosts:hidden animate-in fade-in">{hosts.length} found</span>
            </summary>

            <div ref={hostSectionRef} className="overflow-y-auto p-2 space-y-0.5 bg-slate-50/50 dark:bg-black/10 min-h-[100px]" id="host-section" style={{ height: '260px' }}>
              {hostsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-bk-yellow border-t-transparent rounded-full"></div>
                </div>
              ) : hosts.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400 text-center">No hosts found</p>
              ) : (
                hosts.map((host) => (
                  <ServerListItem
                    key={host.uid}
                    host={host}
                    isSelected={selectedHostUid === host.uid}
                    isAuthorized={authorizedHosts.includes(host.uid)}
                    onContextMenu={handleContextMenu}
                  />
                ))
              )}
            </div>
          </details>

          <div className="h-1 bg-slate-100 dark:bg-slate-800 cursor-row-resize transition-colors" id="v-resizer" title="Drag to resize sections"></div>

          <div className="flex-1 flex flex-col overflow-hidden mt-1" id="tree-section-container">
            {selectedHostUid ? (
              <>
                <TreeTabHeader 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  onDbTabContextMenu={handleDbRootContextMenu} 
                  onBrokerTabContextMenu={handleBrokerRootContextMenu}
                />

                <div className="flex-1 overflow-y-auto px-4 pb-4 relative min-h-[200px]">
                  {/* States Overlay */}
                  {isLoggingIntoHost && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-bk-side/80 z-[210] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                      <div className="w-16 h-16 border-4 border-bk-yellow/10 border-t-bk-yellow rounded-full animate-spin mb-6"></div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-bk-yellow mb-1 tracking-wide">Host login</h3>
                      <p className="text-[11px] text-slate-500">Establishing secure session...</p>
                    </div>
                  )}

                  {!isLoggingIntoHost && hostAuthErrors[selectedHostUid] && (
                    <div className="absolute inset-0 bg-white dark:bg-bk-side z-[210] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
                      <span className="material-symbols-outlined text-rose-500 text-3xl mb-4 bg-rose-500/10 p-4 rounded-full border border-rose-500/20">error</span>
                      <h3 className="text-sm font-medium text-rose-500 mb-2">Connection failed</h3>
                      <p className="text-[11px] text-slate-500 mb-6">{hostAuthErrors[selectedHostUid]}</p>
                      <button onClick={() => handleHostLogin(selectedHostUid)} className="px-6 py-2 bg-bk-yellow text-bk-side text-[10px] font-black rounded-lg shadow-lg">Try Again</button>
                    </div>
                  )}

                  {(dbActionLoading || brokerActionLoading) && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-bk-main/60 z-[200] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
                      <div className="flex flex-col items-center gap-3 bg-white dark:bg-bk-side px-8 py-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 border-4 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                        <span className="text-xs font-medium text-slate-900 dark:text-bk-yellow">Processing...</span>
                      </div>
                    </div>
                  )}

                  <div className={`mt-2 ${(!authorizedHosts.includes(selectedHostUid) || isLoggingIntoHost) ? 'opacity-20 blur-[1px] pointer-events-none' : 'opacity-100'}`} id="db-tree-container">
                    <p className="px-3 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-500 mb-4 flex items-center gap-2">
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                      {activeTab === 'db' ? 'Databases' : activeTab === 'broker' ? 'Brokers' : 'Logs'}
                      <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
                    </p>

                    {activeTab === 'db' && (
                      <DatabaseTree
                        onContextMenu={handleDbContextMenu}
                        onRootContextMenu={handleDbRootContextMenu}
                        onUsersContextMenu={handleUsersContextMenu}
                        onUserContextMenu={handleUserContextMenu}
                        onBackupPlanContextMenu={handleBackupPlanContextMenu}
                        onSpaceContextMenu={handleSpaceContextMenu}

                        onBackupItemContextMenu={handleBackupItemContextMenu}
                      />
                    )}
                    {activeTab === 'broker' && <BrokerTree hostUid={selectedHostUid} onContextMenu={handleBrokerContextMenu} />}
                    {activeTab === 'log' && <LogTree hostUid={selectedHostUid} />}
                  </div>
                </div>
              </>
            ) : (
              <SidebarEmptyState />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            className="flex w-full items-center justify-center gap-2 bg-bk-yellow hover:bg-[#ffd700] text-bk-side px-4 py-2 rounded-lg text-xs font-black transition-colors group"
            onClick={onAddHost}
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-200">add_circle</span>
            <span className="tracking-wide">Add Host</span>
          </button>
        </div>
      </aside>

      <div className="w-1 hover:w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-bk-yellow transition-all cursor-col-resize h-full flex-shrink-0 z-10" id="resizer"></div>

      {/* Context Menus */}
      {contextMenu && (
        <ContextMenuWrapper x={contextMenu.mouseX} y={contextMenu.mouseY} onClose={() => setContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>Server: {contextMenu.server}</span>
          </div>
          <MenuItem
            icon="power_settings_new" iconColor="text-rose-500" label="Disconnect"
            onClick={() => {
              dispatch(revokeHostLogin(contextMenu.hostUid));
              if (selectedHostUid === contextMenu.hostUid) {
                dispatch(setSelectedHost(null));
                dispatch(closeHostTabs(contextMenu.hostUid));
              }
              setContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem icon="add_box" label="Add Host" onClick={() => { onAddHost(); setContextMenu(null); }} />
          <MenuItem icon="edit" label="Edit Host" onClick={() => { dispatch(openEditHostModal(contextMenu.hostUid)); setContextMenu(null); }} />
          <MenuItem icon="delete" iconColor="text-rose-500" label="Delete Host" onClick={() => { dispatch(openDeleteHostModal({ hostUid: contextMenu.hostUid, alias: contextMenu.alias })); setContextMenu(null); }} />
          <MenuDivider />
          <MenuItem icon="lock" label="Change Password" />
          <MenuItem icon="info" label="Server Version" onClick={() => { dispatch(openServerVersionModal(contextMenu.hostUid)); setContextMenu(null); }} />
        </ContextMenuWrapper>
      )}

      {dbContextMenu && (
        <ContextMenuWrapper x={dbContextMenu.mouseX} y={dbContextMenu.mouseY} onClose={() => setDbContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Database: {dbContextMenu.db}
          </div>
          {dbContextMenu.isActive ? (
            <MenuItem
              icon="stop"
              iconColor="text-rose-500"
              label="Stop Database"
              onClick={() => {
                dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db }))
                  .unwrap()
                  .then(() => {
                    dispatch(fetchDatabaseStartInfo(selectedHostUid));
                  })
                  .catch((err) => {
                    dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
                  });
                setDbContextMenu(null);
              }}
            />
          ) : (
            <MenuItem
              icon="play_arrow"
              iconColor="text-emerald-500"
              label="Start Database"
              onClick={() => {
                dispatch(startDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db }))
                  .unwrap()
                  .then(() => {
                    dispatch(fetchDatabaseStartInfo(selectedHostUid));
                  })
                  .catch((err) => {
                    dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
                  });
                setDbContextMenu(null);
              }}
            />
          )}
          {dbContextMenu.isActive && !loggedInDatabases.includes(dbContextMenu.db) && (
            <MenuItem
              icon="login"
              label="Login Database"
              onClick={() => {
                dispatch(openLoginDatabaseModal(dbContextMenu.db));
                setDbContextMenu(null);
              }}
            />
          )}
          <MenuDivider />
          <SubMenu icon="settings" label="Manage Database">
            <MenuItem icon="upload" label="Database Unload" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openUnloadDBModal()); setDbContextMenu(null); }} />
            <MenuItem icon="download" label="Database Load" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openLoadDBModal()); setDbContextMenu(null); }} />
            <MenuItem icon="check_circle" label="Check Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openCheckDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem icon="compress" label="Compact Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openCompactDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem icon="auto_fix_high" label="Optimize Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openOptimizeDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem icon="content_copy" label="Copy Database" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openCopyDatabaseModal()); setDbContextMenu(null); }} />
            <MenuDivider />
            <MenuItem icon="add_circle" iconColor="text-accent-green" label="Create Database" onClick={() => { dispatch(openCreateDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem
              icon="drive_file_rename_outline"
              iconColor="text-accent-orange"
              label="Rename Database"
              disabled={dbContextMenu.isActive}
              onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openRenameDatabaseModal()); setDbContextMenu(null); }}
            />
            <MenuDivider />
            <MenuItem icon="restore" label="Restore Database" />
            <MenuItem icon="backup" label="Backup Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openBackupDatabaseModal()); setDbContextMenu(null); }} />
            <MenuDivider />
            <MenuItem icon="delete" iconColor="text-accent-red" label="Delete Database" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openDeleteDBModal()); setDbContextMenu(null); }} />
          </SubMenu>
          <SubMenu icon="info" label="Database Info" width="w-52">
            <MenuItem icon="lock_open" label="Lock Information" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openLockInfoModal()); setDbContextMenu(null); }} />
            <MenuItem 
              icon="monitoring" 
              label="Status Monitor" 
              onClick={() => { 
                dispatch(openTab(`db_status_monitor:${selectedHostUid}:${dbContextMenu.db}`));
                setDbContextMenu(null); 
              }} 
            />
            <MenuItem icon="swap_horiz" label="Transaction Info" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openTransactionInfoModal()); setDbContextMenu(null); }} />
            <MenuItem 
              icon="data_object" 
              label="Param Dump" 
              onClick={() => { 
                dispatch(setSelectedDatabase(dbContextMenu.db)); 
                dispatch(openDatabaseInfoModal()); 
                setDbContextMenu(null); 
              }} 
            />
            <MenuItem 
              icon="schema" 
              label="Plan Dump" 
              onClick={() => { 
                dispatch(setSelectedDatabase(dbContextMenu.db)); 
                dispatch(openPlanDumpModal()); 
                setDbContextMenu(null); 
              }} 
            />
            <MenuItem icon="explore" label="OID Navigation" />
          </SubMenu>
          <MenuItem icon="tune" label="Properties" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openDatabasePropertyModal()); setDbContextMenu(null); }} />
          <MenuDivider />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              dispatch(fetchDatabaseStartInfo(selectedHostUid));
              setDbContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}

      {dbRootContextMenu && (
        <ContextMenuWrapper x={dbRootContextMenu.mouseX} y={dbRootContextMenu.mouseY} onClose={() => setDbRootContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Databases
          </div>
          <MenuItem
            icon="play_circle"
            iconColor="text-emerald-500"
            label="Start All Databases"
            onClick={() => {
              databases.forEach(db => {
                if (!activeDatabases.includes(db.dbname)) {
                  dispatch(startDatabase({ hostUid: selectedHostUid, dbname: db.dbname }));
                }
              });
              setDbRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="stop_circle"
            iconColor="text-rose-500"
            label="Stop All Databases"
            onClick={() => {
              activeDatabases.forEach(dbname => {
                dispatch(stopDatabase({ hostUid: selectedHostUid, dbname }));
              });
              setDbRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="restart_alt"
            iconColor="text-amber-500"
            label="Restart All Databases"
            onClick={async () => {
              const currentActive = [...activeDatabases];
              for (const dbname of currentActive) {
                await dispatch(stopDatabase({ hostUid: selectedHostUid, dbname })).unwrap();
              }
              for (const dbname of currentActive) {
                await dispatch(startDatabase({ hostUid: selectedHostUid, dbname })).unwrap();
              }
              setDbRootContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="add_circle"
            iconColor="text-emerald-500"
            label="Create Database"
            onClick={() => {
              dispatch(openCreateDatabaseModal());
              setDbRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              dispatch(fetchDatabaseStartInfo(selectedHostUid));
              setDbRootContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem icon="tune" label="Properties" onClick={() => { dispatch(setSelectedDatabase(null)); dispatch(openDatabasePropertyModal()); setDbRootContextMenu(null); }} />
        </ContextMenuWrapper>
      )}

      {brokerRootContextMenu && (
        <ContextMenuWrapper x={brokerRootContextMenu.mouseX} y={brokerRootContextMenu.mouseY} onClose={() => setBrokerRootContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Brokers
          </div>
          <MenuItem
            icon="play_circle"
            iconColor="text-emerald-500"
            label="Start All Brokers"
            onClick={() => {
              brokers.forEach(broker => {
                if (broker.state !== 'ON') {
                  dispatch(startBroker({ hostUid: selectedHostUid, brokerName: broker.name }));
                }
              });
              setBrokerRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="stop_circle"
            iconColor="text-rose-500"
            label="Stop All Brokers"
            onClick={() => {
              brokers.forEach(broker => {
                if (broker.state === 'ON') {
                  dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: broker.name }));
                }
              });
              setBrokerRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="restart_alt"
            iconColor="text-amber-500"
            label="Restart All Brokers"
            onClick={async () => {
              const currentActive = brokers.filter(b => b.state === 'ON').map(b => b.name);
              for (const name of currentActive) {
                await dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: name })).unwrap();
              }
              for (const name of currentActive) {
                await dispatch(startBroker({ hostUid: selectedHostUid, brokerName: name })).unwrap();
              }
              setBrokerRootContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="settings"
            label="Edit Broker Config"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`broker_config:${selectedHostUid}`));
              }
              setBrokerRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="info"
            label="Show Status"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`brokers_status:${selectedHostUid}`));
              }
              setBrokerRootContextMenu(null);
            }}
          />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              dispatch(fetchBrokerList(selectedHostUid));
              setBrokerRootContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}

      {brokerContextMenu && (
        <ContextMenuWrapper x={brokerContextMenu.mouseX} y={brokerContextMenu.mouseY} onClose={() => setBrokerContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Broker: {brokerContextMenu.broker}
          </div>
          {brokerContextMenu.state === 'ON' ? (
            <MenuItem
              icon="stop"
              iconColor="text-rose-500"
              label="Stop Broker"
              onClick={() => {
                dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker }))
                  .unwrap()
                  .then(() => {
                    dispatch(fetchBrokerList(selectedHostUid));
                  })
                  .catch((err) => {
                    dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
                  });
                setBrokerContextMenu(null);
              }}
            />
          ) : (
            <MenuItem
              icon="play_arrow"
              iconColor="text-emerald-500"
              label="Start Broker"
              onClick={() => {
                dispatch(startBroker({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker }))
                  .unwrap()
                  .then(() => {
                    dispatch(fetchBrokerList(selectedHostUid));
                  })
                  .catch((err) => {
                    dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
                  });
                setBrokerContextMenu(null);
              }}
            />
          )}
          <MenuDivider />
          <MenuItem 
            icon="info" 
            label="Show Status" 
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`broker_status:${selectedHostUid}:${brokerContextMenu.broker}`));
              }
              setBrokerContextMenu(null);
            }} 
          />
          <MenuItem 
            icon="tune" 
            label="Properties" 
            onClick={() => { 
                dispatch(openBrokerPropertyModal({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker }));
                setBrokerContextMenu(null); 
            }} 
          />
        </ContextMenuWrapper>
      )}

      {usersContextMenu && (
        <ContextMenuWrapper x={usersContextMenu.mouseX} y={usersContextMenu.mouseY} onClose={() => setUsersContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Users: {usersContextMenu.db}
          </div>
          <MenuItem
            icon="person_add"
            label="Create DB User"
            onClick={() => {
              dispatch(openCreateUserModal(usersContextMenu.db));
              setUsersContextMenu(null);
            }}
          />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: usersContextMenu.db }));
              setUsersContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}

      {userContextMenu && (
        <ContextMenuWrapper x={userContextMenu.mouseX} y={userContextMenu.mouseY} onClose={() => setUserContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>{userContextMenu.user}</span>
            <span className="material-symbols-outlined text-[16px] opacity-40">person</span>
          </div>
          <MenuItem
            icon="edit"
            label="Edit DB User"
            onClick={() => {
              dispatch(openEditUserModal({ dbname: userContextMenu.db, userName: userContextMenu.user }));
              setUserContextMenu(null);
            }}
          />
          <MenuItem
            icon="person_remove"
            iconColor="text-rose-500"
            label="Drop DB User"
            onClick={() => {
              dispatch(openDropUserModal({ dbname: userContextMenu.db, userName: userContextMenu.user }));
              setUserContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: userContextMenu.db }));
              setUserContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}
      {backupPlanContextMenu && (
        <ContextMenuWrapper x={backupPlanContextMenu.mouseX} y={backupPlanContextMenu.mouseY} onClose={() => setBackupPlanContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>Backup Plan</span>
            <span className="material-symbols-outlined text-[16px] opacity-40">backup</span>
          </div>
          <MenuItem
            icon="add_circle"
            label="Add Backup Plan"
            onClick={() => {
              dispatch(setSelectedDatabase(backupPlanContextMenu.db));
              dispatch(openAddBackupPlanModal());
              setBackupPlanContextMenu(null);
            }}
          />
          <MenuItem
            icon="history"
            label="Auto Backup Log"
            onClick={() => {
              dispatch(setSelectedDatabase(backupPlanContextMenu.db));
              dispatch(openAutoBackupLogModal());
              setBackupPlanContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: backupPlanContextMenu.db }));
              }
              setBackupPlanContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}
      {spaceContextMenu && (
        <ContextMenuWrapper x={spaceContextMenu.mouseX} y={spaceContextMenu.mouseY} onClose={() => setSpaceContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>Space: {spaceContextMenu.db}</span>
            <span className="material-symbols-outlined text-[16px] opacity-40">donut_small</span>
          </div>
          <MenuItem
            icon="add_to_drive"
            label="Add Volume"
            onClick={() => {
              dispatch(setSelectedDatabase(spaceContextMenu.db));
              dispatch(openAddVolumeModal());
              setSpaceContextMenu(null);
            }}
          />
          <MenuItem
            icon="settings_suggest"
            label="Set Automation Volume"
            onClick={() => {
              dispatch(setSelectedDatabase(spaceContextMenu.db));
              dispatch(openSetAutomationVolumeModal());
              setSpaceContextMenu(null);
            }}
          />
          <MenuItem
            icon="history_edu"
            label="Auto Volume Log"
            onClick={() => {
              dispatch(setSelectedDatabase(spaceContextMenu.db));
              dispatch(openAutoVolumeLogModal());
              setSpaceContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="visibility"
            label="View Database"
            onClick={() => {
              dispatch(setActiveMainTab(`db_space:${selectedHostUid}:${spaceContextMenu.db}`));
              setSpaceContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              // Any space specific refresh logic could go here
              setSpaceContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}

      {backupItemContextMenu && (
        <ContextMenuWrapper x={backupItemContextMenu.mouseX} y={backupItemContextMenu.mouseY} onClose={() => setBackupItemContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>Backup: {backupItemContextMenu.planId}</span>
            <span className="material-symbols-outlined text-[16px] opacity-40">event_note</span>
          </div>

          <MenuItem
            icon="edit"
            label="Edit Backup Plan"
            onClick={() => {
              dispatch(setSelectedDatabase(backupItemContextMenu.db));
              dispatch(setSelectedBackupId(backupItemContextMenu.planId));
              dispatch(openEditBackupPlanModal());
              setBackupItemContextMenu(null);
            }}
          />
          <MenuItem
            icon="delete_forever"
            iconColor="text-rose-500"
            label="Delete Backup Plan"
            onClick={() => {
              dispatch(setSelectedDatabase(backupItemContextMenu.db));
              dispatch(setSelectedBackupId(backupItemContextMenu.planId));
              dispatch(openDeleteBackupPlanModal());
              setBackupItemContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: backupItemContextMenu.db }));
              setBackupItemContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}

      {queryPlanContextMenu && (
        <ContextMenuWrapper x={queryPlanContextMenu.mouseX} y={queryPlanContextMenu.mouseY} onClose={() => setQueryPlanContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/5 mb-1 flex items-center justify-between">
            <span>Query Plan: {queryPlanContextMenu.db}</span>
            <span className="material-symbols-outlined text-[16px] opacity-40">bolt</span>
          </div>
          <MenuItem
            icon="add_circle"
            label="Add Query Plan"
            onClick={() => {
              dispatch(setSelectedDatabase(queryPlanContextMenu.db));
              dispatch(openAddQueryPlanModal());
              setQueryPlanContextMenu(null);
            }}
          />
          <MenuItem
            icon="history"
            label="Auto Query Log"
            onClick={() => {
              dispatch(setSelectedDatabase(queryPlanContextMenu.db));
              dispatch(openAutoQueryLogModal());
              setQueryPlanContextMenu(null);
            }}
          />
          <MenuDivider />
          <MenuItem
            icon="refresh"
            label="Refresh"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: queryPlanContextMenu.db }));
              }
              setQueryPlanContextMenu(null);
            }}
          />
        </ContextMenuWrapper>
      )}
      <AutoQueryLogModal />
      <AddQueryPlanModal />
      <SetAutomationVolumeModal />
      <AutoVolumeLogModal />
    </>
  );
}
