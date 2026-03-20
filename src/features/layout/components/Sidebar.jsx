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
import { DropdownMenu, MenuItem, MenuDivider, SubMenu } from '../../../components/ui/Navigation/DropdownMenu';
import ContextMenu from '../../../components/ui/Navigation/ContextMenu';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Spinner from '../../../components/ui/Feedback/Spinner';

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

export default function Sidebar({ 
  isCollapsed, 
  sidebarWidth, 
  hostSectionHeight, 
  onToggleCollapse, 
  onResizeChange, 
  onSidebarWidthChange,
  onHostSectionHeightChange,
  onAddHost 
}) {
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

  const isResizingH = useRef(false);
  const isResizingV = useRef(false);
  const currentWidthRef = useRef(sidebarWidth);
  const currentHeightRef = useRef(hostSectionHeight);

  // Sync refs with props
  useEffect(() => {
    currentWidthRef.current = sidebarWidth;
    currentHeightRef.current = hostSectionHeight;
  }, [sidebarWidth, hostSectionHeight]);

  // Resizing logic with performance optimizations
  useEffect(() => {
    const resizer = document.getElementById('resizer');
    const vResizer = document.getElementById('v-resizer');
    const sidebar = sidebarRef.current;
    const hostSection = hostSectionRef.current;

    if (!resizer || !sidebar) return;
    
    let animationFrameId = null;
    let lastWidthUpdate = 0;
    let lastHeightUpdate = 0;
    const THROTTLE_MS = 16; // ~60fps

    const onMouseDownH = () => {
      if (isCollapsed) return;
      isResizingH.current = true;
      document.body.classList.add('resizing-h');
      onResizeChange(true);
    };

    const sidebarYOffset = { value: 0 };
    const sidebarTotalHeight = { value: 0 };

    const onMouseDownV = () => {
      if (!vResizer || isCollapsed) return;
      isResizingV.current = true;
      vResizer.classList.add('resizing');
      document.body.classList.add('resizing-v');
      onResizeChange(true);
      
      const rect = sidebar.getBoundingClientRect();
      sidebarYOffset.value = rect.top;
      sidebarTotalHeight.value = rect.height;
    };

    const updateWidth = (newWidth) => {
      sidebar.style.width = `${newWidth}px`;
      currentWidthRef.current = newWidth;
    };

    const updateHeight = (newHeight) => {
      if (hostSection) {
        hostSection.style.height = `${newHeight}px`;
      }
      currentHeightRef.current = newHeight;
    };

    const onMouseMove = (e) => {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(() => {
          const now = Date.now();
          
          if (isResizingH.current && now - lastWidthUpdate >= THROTTLE_MS) {
            const newWidth = e.clientX;
            if (newWidth > 150 && newWidth < 600) {
              updateWidth(newWidth);
              lastWidthUpdate = now;
            }
          }
          
          if (isResizingV.current && hostSection && now - lastHeightUpdate >= THROTTLE_MS) {
            const newHeight = e.clientY - sidebarYOffset.value - 60; 
            if (newHeight > 100 && newHeight < (sidebarTotalHeight.value - 250)) {
              updateHeight(newHeight);
              lastHeightUpdate = now;
            }
          }
          
          animationFrameId = null;
        });
      }
    };

    const onMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      if (isResizingH.current) {
        onResizeChange(false);
        onSidebarWidthChange(currentWidthRef.current);
        document.body.classList.remove('resizing-h');
      }
      if (isResizingV.current) {
        onResizeChange(false);
        onHostSectionHeightChange(currentHeightRef.current);
        if (vResizer) vResizer.classList.remove('resizing');
        document.body.classList.remove('resizing-v');
      }
      
      isResizingH.current = false;
      isResizingV.current = false;
    };

    resizer.addEventListener('mousedown', onMouseDownH);
    if (vResizer) vResizer.addEventListener('mousedown', onMouseDownV);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      resizer.removeEventListener('mousedown', onMouseDownH);
      if (vResizer) vResizer.removeEventListener('mousedown', onMouseDownV);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('resizing-h', 'resizing-v');
    };
  }, [isCollapsed, onResizeChange, onSidebarWidthChange, onHostSectionHeightChange]);

  return (
    <>
      <aside 
        ref={sidebarRef} 
        className={`border-r border-border bg-background flex flex-col ${!isResizingH.current && !isResizingV.current ? 'transition-all duration-300' : ''}`} 
        id="sidebar"
        style={{ 
          width: isCollapsed ? '80px' : `${sidebarWidth}px`,
          '--host-section-height': `${hostSectionHeight}px`
        }}
      >
        <SidebarHeader />

        <div className="flex flex-col flex-1 overflow-hidden">
          <details className="flex-none group/hosts border-b border-border/50 flex flex-col" open>
            <summary className="flex-none px-4 py-2.5 cursor-pointer list-none hover:bg-muted/5 transition-all duration-300 flex items-center justify-between group/sum">
              <div className="flex items-center gap-2">
                <Icon 
                   name="expand_more" 
                   size="xs" 
                   className="group-open/hosts:rotate-180 transition-transform text-foreground/40 group-hover/sum:text-primary" 
                />
                <Typography variant="span" className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/50">Server List</Typography>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/10 rounded-full border border-border/20 group-open/hosts:opacity-0 group-open/hosts:scale-95 transition-all duration-300">
                 <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                 <Typography variant="caption" className="text-[9px] font-bold text-foreground/40">{hosts.length} Found</Typography>
              </div>
            </summary>

            <div 
              ref={hostSectionRef} 
              className={`overflow-y-auto p-2 space-y-0.5 bg-muted/5 min-h-[120px] ${!isResizingV.current ? 'transition-all duration-300' : ''}`} 
              id="host-section"
            >
          {hostsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : hosts.length === 0 ? (
                <div className="px-5 py-4 text-center">
                   <Typography variant="caption" className="opacity-40 italic font-bold">No hosts found</Typography>
                </div>
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

          {!isCollapsed && (
            <div 
              id="v-resizer"
              className="h-1.5 -my-0.75 bg-transparent hover:bg-primary/30 active:bg-primary transition-all cursor-row-resize w-full flex-shrink-0 z-40 relative group"
            >
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border group-hover:bg-primary group-active:bg-primary transition-colors" />
            </div>
          )}

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
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl z-[210] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                      <Spinner size="lg" className="mb-6" />
                      <Typography variant="h4" className="mb-2 font-black tracking-tight">Host Login</Typography>
                      <Typography variant="body2" className="opacity-40 font-bold tracking-tight">Establishing secure session...</Typography>
                    </div>
                  )}

                  {!isLoggingIntoHost && hostAuthErrors[selectedHostUid] && (
                    <div className="absolute inset-0 bg-background z-[210] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                      <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 border border-destructive/20 shadow-premium">
                         <Icon name="error" size="lg" className="text-destructive" />
                      </div>
                      <Typography variant="h4" className="mb-2 font-black tracking-tight text-destructive">Connection Failed</Typography>
                      <Typography variant="body2" className="opacity-40 font-bold tracking-tight mb-8 max-w-[200px] mx-auto">{hostAuthErrors[selectedHostUid]}</Typography>
                      <button 
                         onClick={() => handleHostLogin(selectedHostUid)} 
                         className="px-8 py-3 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded-xl shadow-premium hover:shadow-premium-lg transition-all"
                      >
                         Try Again
                      </button>
                    </div>
                  )}

                  {(dbActionLoading || brokerActionLoading) && (
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-md z-[200] flex items-center justify-center animate-in fade-in duration-300">
                      <div className="flex flex-col items-center gap-4 bg-background px-10 py-8 rounded-2xl shadow-premium-lg border border-border/50 animate-in zoom-in-95">
                        <Spinner size="md" />
                        <Typography variant="caption" className="font-black tracking-[0.2em] uppercase text-foreground/60">Processing</Typography>
                      </div>
                    </div>
                  )}

                  <div className={`mt-2 ${(!authorizedHosts.includes(selectedHostUid) || isLoggingIntoHost) ? 'opacity-20 blur-[2px] pointer-events-none' : 'opacity-100'}`} id="db-tree-container">
                    <div className="px-3 mb-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/50"></div>
                      <Typography variant="caption" className="uppercase font-black tracking-[0.25em] text-[9px] text-foreground/30">
                         {activeTab === 'db' ? 'Databases' : activeTab === 'broker' ? 'Brokers' : 'Logs'}
                      </Typography>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/50"></div>
                    </div>

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

        <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-md">
          <button
            className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 group shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0"
            onClick={onAddHost}
          >
            <Icon name="add_circle" size="sm" className="group-hover:rotate-90 transition-transform duration-500" />
            <Typography variant="span" className="uppercase tracking-widest text-[10px]">Add Host</Typography>
          </button>
        </div>
      </aside>

      <div 
        id="resizer"
        className="w-1.5 -mx-0.75 bg-transparent hover:bg-primary/30 active:bg-primary transition-all cursor-col-resize h-full flex-shrink-0 z-50 relative group"
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-primary group-active:bg-primary transition-colors" />
      </div>

      {/* Context Menus */}
      {contextMenu && (
        <ContextMenu x={contextMenu.mouseX} y={contextMenu.mouseY} onClose={() => setContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Server: {contextMenu.server}</Typography>
          </div>
          <MenuItem
            icon="power_settings_new" 
            iconColor="text-destructive" 
            label="Disconnect"
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
          <MenuItem icon="delete" iconColor="text-destructive" label="Delete Host" onClick={() => { dispatch(openDeleteHostModal({ hostUid: contextMenu.hostUid, alias: contextMenu.alias })); setContextMenu(null); }} />
          <MenuDivider />
          <MenuItem icon="lock" label="Change Password" />
          <MenuItem icon="info" label="Server Version" onClick={() => { dispatch(openServerVersionModal(contextMenu.hostUid)); setContextMenu(null); }} />
        </ContextMenu>
      )}

      {dbContextMenu && (
        <ContextMenu x={dbContextMenu.mouseX} y={dbContextMenu.mouseY} onClose={() => setDbContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Database: {dbContextMenu.db}</Typography>
          </div>
          {dbContextMenu.isActive ? (
            <MenuItem
              icon="stop"
              iconColor="text-destructive"
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
            <MenuItem icon="add_circle" iconColor="text-emerald-500" label="Create Database" onClick={() => { dispatch(openCreateDatabaseModal()); setDbContextMenu(null); }} />
            <MenuItem
              icon="drive_file_rename_outline"
              iconColor="text-amber-500"
              label="Rename Database"
              disabled={dbContextMenu.isActive}
              onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openRenameDatabaseModal()); setDbContextMenu(null); }}
            />
            <MenuDivider />
            <MenuItem icon="restore" label="Restore Database" />
            <MenuItem icon="backup" label="Backup Database" onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openBackupDatabaseModal()); setDbContextMenu(null); }} />
            <MenuDivider />
            <MenuItem icon="delete" iconColor="text-destructive" label="Delete Database" disabled={dbContextMenu.isActive} onClick={() => { dispatch(setSelectedDatabase(dbContextMenu.db)); dispatch(openDeleteDBModal()); setDbContextMenu(null); }} />
          </SubMenu>
          <SubMenu icon="info" label="Database Info">
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
        </ContextMenu>
      )}

      {dbRootContextMenu && (
        <ContextMenu x={dbRootContextMenu.mouseX} y={dbRootContextMenu.mouseY} onClose={() => setDbRootContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Databases</Typography>
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
            iconColor="text-destructive"
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
        </ContextMenu>
      )}

      {brokerRootContextMenu && (
        <ContextMenu x={brokerRootContextMenu.mouseX} y={brokerRootContextMenu.mouseY} onClose={() => setBrokerRootContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Brokers</Typography>
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
            iconColor="text-destructive"
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
        </ContextMenu>
      )}

      {brokerContextMenu && (
        <ContextMenu x={brokerContextMenu.mouseX} y={brokerContextMenu.mouseY} onClose={() => setBrokerContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Broker: {brokerContextMenu.broker}</Typography>
          </div>
          {brokerContextMenu.state === 'ON' ? (
            <MenuItem
              icon="stop"
              iconColor="text-destructive"
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
        </ContextMenu>
      )}

      {usersContextMenu && (
        <ContextMenu x={usersContextMenu.mouseX} y={usersContextMenu.mouseY} onClose={() => setUsersContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-1">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Users: {usersContextMenu.db}</Typography>
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
        </ContextMenu>
      )}

      {userContextMenu && (
        <ContextMenu x={userContextMenu.mouseX} y={userContextMenu.mouseY} onClose={() => setUserContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-2 flex items-center justify-between gap-4">
            <Typography variant="caption" className="font-black text-foreground/80 truncate">User: {userContextMenu.user}</Typography>
            <Icon name="person" size="xs" className="opacity-20" />
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
            iconColor="text-destructive"
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
        </ContextMenu>
      )}
      {backupPlanContextMenu && (
        <ContextMenu x={backupPlanContextMenu.mouseX} y={backupPlanContextMenu.mouseY} onClose={() => setBackupPlanContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-2 flex items-center justify-between gap-4">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Backup Plan</Typography>
            <Icon name="backup" size="xs" className="opacity-20" />
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
        </ContextMenu>
      )}
      {spaceContextMenu && (
        <ContextMenu x={spaceContextMenu.mouseX} y={spaceContextMenu.mouseY} onClose={() => setSpaceContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-2 flex items-center justify-between gap-4">
            <Typography variant="caption" className="font-black text-foreground/80 truncate">Space: {spaceContextMenu.db}</Typography>
            <Icon name="donut_small" size="xs" className="opacity-20" />
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
              setSpaceContextMenu(null);
            }}
          />
        </ContextMenu>
      )}

      {backupItemContextMenu && (
        <ContextMenu x={backupItemContextMenu.mouseX} y={backupItemContextMenu.mouseY} onClose={() => setBackupItemContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-2 flex items-center justify-between gap-4">
            <Typography variant="caption" className="font-black text-foreground/80 truncate">Backup: {backupItemContextMenu.planId}</Typography>
            <Icon name="event_note" size="xs" className="opacity-20" />
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
            iconColor="text-destructive"
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
        </ContextMenu>
      )}

      {queryPlanContextMenu && (
        <ContextMenu x={queryPlanContextMenu.mouseX} y={queryPlanContextMenu.mouseY} onClose={() => setQueryPlanContextMenu(null)}>
          <div className="px-4 py-2 border-b border-border/50 mb-2 flex items-center justify-between gap-4">
            <Typography variant="caption" className="font-black text-foreground/40 uppercase tracking-widest">Query Plan: {queryPlanContextMenu.db}</Typography>
            <Icon name="bolt" size="xs" className="opacity-20" />
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
        </ContextMenu>
      )}
      <AutoQueryLogModal />
      <AddQueryPlanModal />
      <SetAutomationVolumeModal />
      <AutoVolumeLogModal />
    </>
  );
}