import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toggleTheme, toggleSidebar, setIsResizing, setSidebarWidth, setHostSectionHeight, setActiveMainTab, closeTab, closeOtherTabs, closeAllTabs } from '../features/layout/layoutSlice';
import { openAddHostModal, closeAddHostModal, setSelectedHost } from '../features/host/hostSlice';
import { setSelectedDatabase } from '../features/database/databaseSlice';
import { closeCreateUserModal, closeEditUserModal, closeDropUserModal } from '../features/user/userSlice';
import Sidebar from '../features/layout/components/Sidebar';
import Header from '../features/layout/components/Header';
import Breadcrumb from '../features/layout/components/Breadcrumb';
import Footer from '../features/layout/components/Footer';
import AddHostModal from '../features/host/components/AddHostModal';
import ServerContent from '../features/server/components/ServerContent';
import DatabaseDashboard from '../features/database/components/DatabaseDashboard';
import DatabaseSpaceMonitor from '../features/database/components/DatabaseSpaceMonitor';
import VolumeInfoMonitor from '../features/database/components/VolumeInfoMonitor';
import VolumeCategoryMonitor from '../features/database/components/VolumeCategoryMonitor';
import CubridConfigEditor from '../features/server/components/CubridConfigEditor';
import BrokerConfigEditor from '../features/server/components/BrokerConfigEditor';
import UnloadDatabaseModal from '../features/database/components/UnloadDatabaseModal';
import LoadDatabaseModal from '../features/database/components/LoadDatabaseModal';
import DeleteDatabaseModal from '../features/database/components/DeleteDatabaseModal';
import OptimizeDatabaseModal from '../features/database/components/OptimizeDatabaseModal';
import CheckDatabaseModal from '../features/database/components/CheckDatabaseModal';
import CompactDatabaseModal from '../features/database/components/CompactDatabaseModal';
import CopyDatabaseModal from '../features/database/components/CopyDatabaseModal';
import BackupDatabaseModal from '../features/database/components/BackupDatabaseModal';
import AddBackupPlanModal from '../features/database/components/AddBackupPlanModal';
import AutoBackupLogModal from '../features/database/components/AutoBackupLogModal';
import DeleteBackupPlanModal from '../features/database/components/DeleteBackupPlanModal';
import DatabaseInfoModal from '../features/database/components/DatabaseInfoModal';
import DatabasePlanDumpModal from '../features/database/components/DatabasePlanDumpModal';
import CreateDatabaseModal from '../features/database/components/CreateDatabaseModal';
import EditBackupPlanModal from '../features/database/components/EditBackupPlanModal';
import LoginDatabaseModal from '../features/database/components/LoginDatabaseModal';

import LockInformationModal from '../features/database/components/LockInformationModal';
import UnloadResultModal from '../features/database/components/UnloadResultModal';
import TransactionInfoModal from '../features/database/components/TransactionInfoModal';
import DeleteHostModal from '../features/host/components/DeleteHostModal';
import EditHostModal from '../features/host/components/EditHostModal';
import ServerVersionModal from '../features/host/components/ServerVersionModal';
import LoginPage from '../features/auth/components/LoginPage';
import RegisterPage from '../features/auth/components/RegisterPage';
import ForgotPasswordPage from '../features/auth/components/ForgotPasswordPage';

// New Design System Feedback Components
import StatusModal from '../components/ui/Feedback/StatusModal';
import LoadingOverlay from '../components/ui/Feedback/LoadingOverlay';

import LogViewer from '../features/broker/components/LogViewer';
import CMSLogViewer from '../features/broker/components/CMSLogViewer';
import BrokerStatus from '../features/broker/components/BrokerStatus';
import BrokerPropertyModal from '../features/broker/components/BrokerPropertyModal';
import Brokers from '../features/server/components/Brokers';

import CreateUserModal from '../features/user/components/CreateUserModal';
import DropUserModal from '../features/user/components/DropUserModal';
import MonitoringProvider from '../features/layout/components/MonitoringProvider';
import ImportExportHostModal from '../features/host/components/ImportExportHostModal';
import DatabasePropertyModal from '../features/database/components/DatabasePropertyModal';
import RenameDatabaseModal from '../features/database/components/RenameDatabaseModal';
import AddVolumeModal from '../features/database/components/AddVolumeModal';

function DashboardLayout() {
  const dispatch = useDispatch();
  const { isLoginDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { theme, isSidebarCollapsed, isResizing, sidebarWidth, hostSectionHeight, activeMainTab, openTabs } = useSelector((state) => state.layout);
  const { isAddHostModalOpen, hosts, isServiceOperating, serviceOperationType, serviceProgressMessage } = useSelector((state) => state.host);
  const { isCreateUserModalOpen, createUserDbName, isEditUserModalOpen, editUserData, isDropUserModalOpen } = useSelector((state) => state.user);
  const { actionLoading: dbActionLoading } = useSelector((state) => state.database);
  const { actionLoading: brokerActionLoading } = useSelector((state) => state.broker);

  const tabLabels = openTabs.reduce((acc, tabId) => {
    if (tabId.startsWith('host:')) {
      const uid = tabId.split(':')[1];
      const host = hosts.find(h => h.uid === uid);
      acc[tabId] = host ? (host.alias || host.id) : uid;
    } else if (tabId.startsWith('db:')) {
      acc[tabId] = tabId.split(':')[1];
    } else if (tabId.startsWith('edit_config:')) {
      acc[tabId] = `Edit ${tabId.split(':')[2]}`;
    } else if (tabId.startsWith('broker_config:')) {
      acc[tabId] = 'Broker Config';
    } else if (tabId.startsWith('log:')) {
      const parts = tabId.split(':');
      const path = parts[parts.length - 1];
      acc[tabId] = path.split('/').pop();
    } else if (tabId.startsWith('cms-access:')) {
      acc[tabId] = 'Manager Access';
    } else if (tabId.startsWith('cms-error:')) {
      acc[tabId] = 'Manager Error';
    } else if (tabId.startsWith('broker_status:')) {
      acc[tabId] = `Status: ${tabId.split(':')[2]}`;
    } else if (tabId.startsWith('brokers_status:')) {
      acc[tabId] = 'Brokers Status';
    } else if (tabId.startsWith('db_space:')) {
      acc[tabId] = `Space: ${tabId.split(':')[2]}`;
    } else if (tabId.startsWith('vol_info:')) {
      const fullPath = tabId.split(':')[3];
      acc[tabId] = `Volume: ${fullPath.split(/[\\/]/).pop()}`;
    } else if (tabId.startsWith('vol_category:')) {
      const category = tabId.split(':')[3];
      acc[tabId] = `Volumes: ${category.replace(/_/g, ' ')}`;
    }

    return acc;
  }, {});

  // Sync global selection with active tab
  useEffect(() => {
    if (activeMainTab) {
      if (activeMainTab.startsWith('host:')) {
        dispatch(setSelectedHost(activeMainTab.split(':')[1]));
      } else if (activeMainTab.startsWith('db:')) {
        dispatch(setSelectedDatabase(activeMainTab.split(':')[1]));
      }
    }
  }, [activeMainTab, dispatch]);

  const handleToggleCollapse = useCallback(() => dispatch(toggleSidebar()), [dispatch]);
  const handleResizeChange = useCallback((val) => dispatch(setIsResizing(val)), [dispatch]);
  const handleAddHost = useCallback(() => dispatch(openAddHostModal()), [dispatch]);
  const handleSidebarWidthChange = useCallback((val) => dispatch(setSidebarWidth(val)), [dispatch]);
  const handleHostSectionHeightChange = useCallback((val) => dispatch(setHostSectionHeight(val)), [dispatch]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <MonitoringProvider>
      <div className={`flex h-screen w-full min-w-0 overflow-hidden ${isResizing ? 'select-none' : ''}`}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          sidebarWidth={sidebarWidth}
          hostSectionHeight={hostSectionHeight}
          onToggleCollapse={handleToggleCollapse}
          onResizeChange={handleResizeChange}
          onSidebarWidthChange={handleSidebarWidthChange}
          onHostSectionHeightChange={handleHostSectionHeightChange}
          onAddHost={handleAddHost}
        />

        <main className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden relative">

          <Header theme={theme} toggleTheme={() => dispatch(toggleTheme())} />
          
          <div className="flex-shrink-0 bg-background border-b border-border/50">
            <Breadcrumb
              activeTab={activeMainTab}
              openTabs={openTabs}
              labels={tabLabels}
              onTabChange={(tabId) => dispatch(setActiveMainTab(tabId))}
              onCloseTab={(tab) => dispatch(closeTab(tab))}
              onCloseOthers={(tabId) => dispatch(closeOtherTabs(tabId))}
              onCloseAll={() => dispatch(closeAllTabs())}
            />
          </div>


          {openTabs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background font-sans">
              <div className="w-24 h-24 bg-muted/5 rounded-[20px] shadow-premium flex items-center justify-center mb-8 border border-border/50 rotate-3">
                <span className="material-symbols-outlined text-5xl text-primary opacity-40">database</span>
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">CUBRID Manager</h3>
              <p className="text-foreground/40 mt-3 max-w-xs text-[13px] leading-relaxed font-medium">
                Select a host or database from the sidebar to start exploring your managed environment.
              </p>
            </div>

          ) : (
            openTabs.map((tabId) => {
              const isActive = tabId === activeMainTab;
              const isHost = tabId.startsWith('host:');
              const isDb = tabId.startsWith('db:');
              const isDbSpace = tabId.startsWith('db_space:');
              const resourceId = tabId.split(':')[1];

              return (isActive && (
                <div key={tabId} className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
                  {isHost && <ServerContent hostUid={resourceId} />}
                  {isDb && <DatabaseDashboard dbname={resourceId} />}
                  {isDbSpace && (
                    <DatabaseSpaceMonitor 
                      hostUid={tabId.split(':')[1]} 
                      dbname={tabId.split(':')[2]} 
                    />
                  )}
                  {tabId.startsWith('vol_info:') && (
                    <VolumeInfoMonitor tabId={tabId} />
                  )}
                  {tabId.startsWith('vol_category:') && (
                    <VolumeCategoryMonitor 
                      hostUid={tabId.split(':')[1]}
                      dbname={tabId.split(':')[2]}
                      category={tabId.split(':')[3]}
                    />
                  )}
                  {tabId.startsWith('edit_config:') && (
                    <CubridConfigEditor
                      hostUid={resourceId}
                      confname={tabId.split(':')[2]}
                    />
                  )}
                  {tabId.startsWith('broker_config:') && (
                    <BrokerConfigEditor
                      hostUid={resourceId}
                    />
                  )}
                  {tabId.startsWith('log:') && (
                    <LogViewer
                      hostUid={tabId.split(':')[1]}
                      path={tabId.split(':').slice(2).join(':')}
                    />
                  )}
                  {tabId.startsWith('cms-access:') && (
                    <CMSLogViewer
                      hostUid={tabId.split(':')[1]}
                      type="access"
                    />
                  )}
                  {tabId.startsWith('cms-error:') && (
                    <CMSLogViewer
                      hostUid={tabId.split(':')[1]}
                      type="error"
                    />
                  )}
                  {tabId.startsWith('broker_status:') && (
                    <BrokerStatus
                      hostUid={tabId.split(':')[1]}
                      brokerName={tabId.split(':')[2]}
                    />
                  )}
                  {tabId.startsWith('brokers_status:') && (
                    <div className="flex-1 overflow-y-auto p-6 bg-background">
                      <Brokers hostUid={tabId.split(':')[1]} />
                    </div>
                  )}
                </div>
              ));
            })
          )}

          <Footer />
        </main>

        <AddHostModal
          isOpen={isAddHostModalOpen}
          onClose={() => dispatch(closeAddHostModal())}
        />
        <DeleteHostModal />
        <EditHostModal />
        <ServerVersionModal />
        <ImportExportHostModal />

        <UnloadDatabaseModal />
        <LoadDatabaseModal />
        <DeleteDatabaseModal />
        <CheckDatabaseModal />
        <CompactDatabaseModal />
        <OptimizeDatabaseModal />
        <CopyDatabaseModal />
        <BackupDatabaseModal />
        <AddBackupPlanModal />
        <AutoBackupLogModal />
        <DeleteBackupPlanModal />
        <EditBackupPlanModal />
        <CreateDatabaseModal />
        <LoginDatabaseModal />

        <LockInformationModal />
        <UnloadResultModal />
        <TransactionInfoModal />
        <CreateUserModal 
          isOpen={isCreateUserModalOpen} 
          onClose={() => dispatch(closeCreateUserModal())} 
          dbname={createUserDbName} 
        />
        <CreateUserModal 
          isOpen={isEditUserModalOpen} 
          onClose={() => dispatch(closeEditUserModal())} 
          dbname={editUserData?.dbname} 
          editingUser={editUserData?.userName}
        />
        <DropUserModal />
        <DatabasePropertyModal />
        <DatabaseInfoModal />
        <DatabasePlanDumpModal />
        <RenameDatabaseModal />
        <BrokerPropertyModal />
        <AddVolumeModal />
        <StatusModal />

        <LoadingOverlay 
          isVisible={isServiceOperating || dbActionLoading || brokerActionLoading} 
          title={
            isServiceOperating 
              ? (serviceOperationType === 'start' ? 'CUBRID Engine Ignite' : 'CUBRID Engine Shutdown')
              : (dbActionLoading ? 'Synchronizing Cluster' : 'Broker Orchestration')
          }
          subtitle={
            isServiceOperating
              ? (serviceProgressMessage || `Automating ${serviceOperationType === 'start' ? 'startup' : 'termination'} sequence for brokers and databases...`)
              : "Replicating state across nodes, please hold..."
          }
        />
      </div>
    </MonitoringProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
