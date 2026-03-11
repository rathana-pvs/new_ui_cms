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
import UnloadDatabaseModal from '../features/database/components/UnloadDatabaseModal';
import LoadDatabaseModal from '../features/database/components/LoadDatabaseModal';
import CheckDatabaseModal from '../features/database/components/CheckDatabaseModal';
import CompactDatabaseModal from '../features/database/components/CompactDatabaseModal';
import CopyDatabaseModal from '../features/database/components/CopyDatabaseModal';
import BackupDatabaseModal from '../features/database/components/BackupDatabaseModal';
import LockInformationModal from '../features/database/components/LockInformationModal';
import UnloadResultModal from '../features/database/components/UnloadResultModal';
import DeleteHostModal from '../features/host/components/DeleteHostModal';
import EditHostModal from '../features/host/components/EditHostModal';
import LoginPage from '../features/auth/components/LoginPage';
import RegisterPage from '../features/auth/components/RegisterPage';
import StatusModal from '../components/common/StatusModal';

function DashboardLayout() {
  const dispatch = useDispatch();
  const { theme, isSidebarCollapsed, isResizing, activeMainTab, openTabs } = useSelector((state) => state.layout);
  const { isAddHostModalOpen, hosts } = useSelector((state) => state.host);

  const tabLabels = openTabs.reduce((acc, tabId) => {
    if (tabId.startsWith('host:')) {
      const uid = tabId.split(':')[1];
      const host = hosts.find(h => h.uid === uid);
      acc[tabId] = host ? (host.alias || host.id) : uid;
    } else if (tabId.startsWith('db:')) {
      acc[tabId] = tabId.split(':')[1];
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
      
      <main className="flex-1 flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
        <Header theme={theme} toggleTheme={() => dispatch(toggleTheme())} />
        <Breadcrumb 
          activeTab={activeMainTab} 
          openTabs={openTabs}
          labels={tabLabels}
          onTabChange={(tabId) => dispatch(setActiveMainTab(tabId))} 
          onCloseTab={(tab) => dispatch(closeTab(tab))}
        />
        
        {openTabs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0f1116]">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-sm flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-400">tab_unselected</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Tabs Open</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Select a host or database from the sidebar to view details.
            </p>
          </div>
        ) : (
          openTabs.map((tabId) => {
            const isActive = tabId === activeMainTab;
            const isHost = tabId.startsWith('host:');
            const resourceId = tabId.split(':')[1];
            
            return (
              <div key={tabId} className={`flex-1 flex flex-col overflow-hidden ${isActive ? '' : 'hidden'}`}>
                {isHost ? (
                  <ServerContent hostUid={resourceId} />
                ) : (
                  <DemoDBContent dbname={resourceId} />
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

      <UnloadDatabaseModal />
      <LoadDatabaseModal />
      <CheckDatabaseModal />
      <CompactDatabaseModal />
      <CopyDatabaseModal />
      <BackupDatabaseModal />
      <LockInformationModal />
      <UnloadResultModal />
      <StatusModal />
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
