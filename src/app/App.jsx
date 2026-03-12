import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { toggleTheme, toggleSidebar, setIsResizing, setActiveMainTab, closeTab } from '../features/layout/layoutSlice';
import { openAddHostModal, closeAddHostModal, setSelectedHost } from '../features/host/hostSlice';
import { setSelectedDatabase } from '../features/database/databaseSlice';
import Sidebar from '../features/layout/components/Sidebar';
import Header from '../features/layout/components/Header';
import Breadcrumb from '../features/layout/components/Breadcrumb';
import Footer from '../features/layout/components/Footer';
import AddHostModal from '../features/host/components/AddHostModal';
import ServerContent from '../features/server/components/ServerContent';
import DemoDBContent from '../features/database/components/DemoDBContent';
import CubridConfigEditor from '../features/server/components/CubridConfigEditor';
import BrokerConfigEditor from '../features/server/components/BrokerConfigEditor';
import UnloadDatabaseModal from '../features/database/components/UnloadDatabaseModal';
import LoadDatabaseModal from '../features/database/components/LoadDatabaseModal';
import CheckDatabaseModal from '../features/database/components/CheckDatabaseModal';
import CompactDatabaseModal from '../features/database/components/CompactDatabaseModal';
import CopyDatabaseModal from '../features/database/components/CopyDatabaseModal';
import BackupDatabaseModal from '../features/database/components/BackupDatabaseModal';
import LockInformationModal from '../features/database/components/LockInformationModal';
import UnloadResultModal from '../features/database/components/UnloadResultModal';
import TransactionInfoModal from '../features/database/components/TransactionInfoModal';
import DeleteHostModal from '../features/host/components/DeleteHostModal';
import EditHostModal from '../features/host/components/EditHostModal';
import ServerVersionModal from '../features/host/components/ServerVersionModal';
import LoginPage from '../features/auth/components/LoginPage';
import RegisterPage from '../features/auth/components/RegisterPage';
import StatusModal from '../components/common/StatusModal';
import LoadingOverlay from '../components/common/LoadingOverlay';

function DashboardLayout() {
  const dispatch = useDispatch();
  const { theme, isSidebarCollapsed, isResizing, activeMainTab, openTabs } = useSelector((state) => state.layout);
  const { isAddHostModalOpen, hosts, isServiceOperating, serviceOperationType, serviceProgressMessage } = useSelector((state) => state.host);
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
    <div className={`flex h-screen overflow-hidden ${isResizing ? 'select-none' : ''}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => dispatch(toggleSidebar())}
        onResizeChange={(val) => dispatch(setIsResizing(val))}
        onAddHost={() => dispatch(openAddHostModal())}
      />

      <main className="flex-1 flex flex-col bg-background-light dark:bg-bk-main overflow-hidden">

        <Header theme={theme} toggleTheme={() => dispatch(toggleTheme())} />
        <div className="flex-shrink-0 bg-slate-50 dark:bg-bk-main">

          <Breadcrumb
            activeTab={activeMainTab}
            openTabs={openTabs}
            labels={tabLabels}
            onTabChange={(tabId) => dispatch(setActiveMainTab(tabId))}
            onCloseTab={(tab) => dispatch(closeTab(tab))}
          />
        </div>


        {openTabs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-bk-main font-sans">
            <div className="w-24 h-24 bg-slate-100 dark:bg-bk-side rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black/20">
              <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-bk-yellow/40" style={{ fontVariationSettings: "'wght' 200" }}>database</span>
            </div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-bk-yellow tracking-tight">Cubrid Manager</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs text-sm leading-relaxed">
              Select a host or database from the sidebar to start exploring your data.
            </p>
          </div>

        ) : (
          openTabs.map((tabId) => {
            const isActive = tabId === activeMainTab;
            const isHost = tabId.startsWith('host:');
            const isDb = tabId.startsWith('db:');
            const isEditConfig = tabId.startsWith('edit_config:');
            const isBrokerConfig = tabId.startsWith('broker_config:');
            const resourceId = tabId.split(':')[1];

            return (
              <div key={tabId} className={`flex-1 flex flex-col overflow-hidden ${isActive ? '' : 'hidden'}`}>
                {isHost && <ServerContent hostUid={resourceId} />}
                {isDb && <DemoDBContent dbname={resourceId} />}
                {isEditConfig && (
                  <CubridConfigEditor
                    hostUid={resourceId}
                    confname={tabId.split(':')[2]}
                  />
                )}
                {isBrokerConfig && (
                  <BrokerConfigEditor
                    hostUid={resourceId}
                  />
                )}
              </div>
            );
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

      <UnloadDatabaseModal />
      <LoadDatabaseModal />
      <CheckDatabaseModal />
      <CompactDatabaseModal />
      <CopyDatabaseModal />
      <BackupDatabaseModal />
      <LockInformationModal />
      <UnloadResultModal />
      <TransactionInfoModal />
      <StatusModal />

      <LoadingOverlay 
        isVisible={isServiceOperating || dbActionLoading || brokerActionLoading} 
        title={
          isServiceOperating 
            ? (serviceOperationType === 'start' ? 'Starting CUBRID Service' : 'Stopping CUBRID Service')
            : (dbActionLoading ? 'Database Action' : 'Broker Action')
        }
        subtitle={
          isServiceOperating
            ? (serviceProgressMessage || `Please wait while we ${serviceOperationType === 'start' ? 'start' : 'stop'} all brokers and databases...`)
            : "Processing your request, please wait..."
        }
      />
    </div>
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
