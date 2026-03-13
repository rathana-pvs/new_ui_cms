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
  openAddBackupPlanModal,
  openLockInfoModal, 
  openTransactionInfoModal,
  setSelectedDatabase,
  openDeleteDBModal
} from '../../database/databaseSlice';
import { 
  fetchBrokerList, 
  startBroker, 
  stopBroker, 
  setSelectedBroker
} from '../../broker/brokerSlice';
import { setActiveMainTab, openTab, closeHostTabs } from '../layoutSlice';
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

  const dispatch = useDispatch();
  const { hosts, selectedHostUid, loading: hostsLoading, authorizedHosts, isLoggingIntoHost, hostAuthErrors } = useSelector((state) => state.host);
  const { databases, actionLoading: dbActionLoading } = useSelector((state) => state.database);
  const { actionLoading: brokerActionLoading } = useSelector((state) => state.broker);

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
    setDbContextMenu(null);
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, server: serverName, hostUid, alias });
  };

  const handleDbContextMenu = (e, dbName, isActive) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setDbContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName, isActive });
  };

  const handleBrokerContextMenu = (e, brokerName, state) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setDbContextMenu(null);
    setBrokerContextMenu({ mouseX: e.clientX, mouseY: e.clientY, broker: brokerName, state });
  };

  const handleUsersContextMenu = (e, dbName) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setDbContextMenu(null);
    setBrokerContextMenu(null);
    setUsersContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName });
  };

  const handleUserContextMenu = (e, dbName, userName) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setDbContextMenu(null);
    setBrokerContextMenu(null);
    setUsersContextMenu(null);
    setUserContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName, user: userName });
  };

  const handleBackupPlanContextMenu = (e, dbName) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setDbContextMenu(null);
    setBrokerContextMenu(null);
    setUsersContextMenu(null);
    setUserContextMenu(null);
    setBackupPlanContextMenu({ mouseX: e.clientX, mouseY: e.clientY, db: dbName });
  };

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setDbContextMenu(null);
      setBrokerContextMenu(null);
      setUsersContextMenu(null);
      setUserContextMenu(null);
      setBackupPlanContextMenu(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

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
                <TreeTabHeader activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="flex-1 overflow-y-auto px-4 pb-4 relative min-h-[200px]">
                  {/* States Overlay */}
                  {isLoggingIntoHost && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-bk-side/80 z-[210] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                      <div className="w-16 h-16 border-4 border-bk-yellow/10 border-t-bk-yellow rounded-full animate-spin mb-6"></div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-bk-yellow mb-1 tracking-wide">Host login</h3>
                      <p className="text-[11px] text-slate-500">Establishing secure session...</p>
                    </div>
                  )}

                  {!isLoggingIntoHost && hostAuthErrors[selectedHostUid] && (
                    <div className="absolute inset-0 bg-white dark:bg-bk-side z-[210] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
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
                        onUsersContextMenu={handleUsersContextMenu} 
                        onUserContextMenu={handleUserContextMenu}
                        onBackupPlanContextMenu={handleBackupPlanContextMenu}
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
            className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-bk-yellow to-[#ffd700] hover:from-[#ffd700] hover:to-bk-yellow text-bk-side px-4 py-2 rounded-lg text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-[0.96] group"
            onClick={onAddHost}
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-300">add_circle</span>
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
            <MenuItem icon="stop" iconColor="text-rose-500" label="Stop Database" onClick={() => { dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db })); setDbContextMenu(null); }} />
          ) : (
            <MenuItem icon="play_arrow" iconColor="text-emerald-500" label="Start Database" onClick={() => { dispatch(startDatabase({ hostUid: selectedHostUid, dbname: dbContextMenu.db })); setDbContextMenu(null); }} />
          )}
          <MenuDivider />
          <SubMenu icon="settings" label="Manage Database">
            <MenuItem icon="upload" label="Database Unload" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openUnloadDBModal()); setDbContextMenu(null); }} />
            <MenuItem icon="download" label="Database Load" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openLoadDBModal()); setDbContextMenu(null); }} />
            <MenuItem icon="check_circle" label="Check Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openCheckDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem icon="compress" label="Compact Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openCompactDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem icon="content_copy" label="Copy Database" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openCopyDatabaseModal()); setDbContextMenu(null); }} />
            <MenuDivider />
            <MenuItem icon="add_circle" iconColor="text-accent-green" label="Create Database" />
            <MenuItem icon="drive_file_rename_outline" iconColor="text-accent-orange" label="Rename Database" />
            <MenuDivider />
            <MenuItem icon="restore" label="Restore Database" />
            <MenuItem icon="backup" label="Backup Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openBackupDatabaseModal()); setDbContextMenu(null); }} />
            <MenuDivider />
            <MenuItem icon="delete" iconColor="text-accent-red" label="Delete Database" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openDeleteDBModal()); setDbContextMenu(null); }} />
          </SubMenu>
          <SubMenu icon="info" label="Database Info" width="w-52">
            <MenuItem icon="lock_open" label="Lock Information" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openLockInfoModal()); setDbContextMenu(null); }} />
            <MenuItem icon="swap_horiz" label="Transaction Info" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openTransactionInfoModal()); setDbContextMenu(null); }} />
            <MenuItem icon="schema" label="Plan Dump" /><MenuItem icon="data_object" label="Param Dump" /><MenuItem icon="explore" label="OID Navigation" />
          </SubMenu>
          <MenuDivider /><MenuItem icon="tune" label="Properties" />
        </ContextMenuWrapper>
      )}

      {brokerContextMenu && (
        <ContextMenuWrapper x={brokerContextMenu.mouseX} y={brokerContextMenu.mouseY} onClose={() => setBrokerContextMenu(null)}>
          <div className="px-4 py-2 text-[11px] font-medium text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
            Broker: {brokerContextMenu.broker}
          </div>
          {brokerContextMenu.state === 'ON' ? (
            <MenuItem icon="stop" iconColor="text-rose-500" label="Stop Broker" onClick={() => { dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker })); setBrokerContextMenu(null); }} />
          ) : (
            <MenuItem icon="play_arrow" iconColor="text-emerald-500" label="Start Broker" onClick={() => { dispatch(startBroker({ hostUid: selectedHostUid, brokerName: brokerContextMenu.broker })); setBrokerContextMenu(null); }} />
          )}
          <MenuDivider /><MenuItem icon="info" label="Status" /><MenuItem icon="tune" label="Properties" />
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
              console.log('Auto Backup Log for:', backupPlanContextMenu.db);
              setBackupPlanContextMenu(null);
            }} 
          />
          <MenuDivider />
          <MenuItem 
            icon="refresh" 
            label="Refresh" 
            onClick={() => {
              console.log('Refresh Backup Plan for:', backupPlanContextMenu.db);
              setBackupPlanContextMenu(null);
            }} 
          />
        </ContextMenuWrapper>
      )}
    </>
  );
}
