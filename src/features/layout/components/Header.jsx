import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, fetchUser } from '../../auth/authSlice';
import { fetchPreferences } from '../../user/userSlice';
import UserProfileModal from '../../user/components/UserProfileModal';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/ui/Navigation/DropdownMenu';
import { openTab, showStatusModal } from '../layoutSlice';
import { openAddHostModal, openEditHostModal, startService, stopService } from '../../host/hostSlice';
import { startDatabase, stopDatabase, fetchDatabaseStartInfo } from '../../database/databaseSlice';
import { startBroker, stopBroker, fetchBrokerList } from '../../broker/brokerSlice';
import { setAboutCubrid } from '../appBarSlice';
import AboutModal from './AboutModal';
import { openServerVersionModal } from '../../host/hostSlice';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';

import HeaderMenu from './HeaderMenu';

export default function Header({ theme, toggleTheme }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { selectedHostUid } = useSelector((state) => state.host);
  const { selectedDatabase, activeDatabases } = useSelector((state) => state.database);
  const { selectedBroker, brokers } = useSelector((state) => state.broker);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUser());
      dispatch(fetchPreferences());
    }
  }, [dispatch, isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logout());
    // Use window.location.href to force a full page refresh and clear all in-memory state
    window.location.href = '/login';
  };

  return (
    <>
      <header className="bg-background/95 backdrop-blur-md border-b border-border/50 h-16 flex items-center justify-between px-6 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-6">
          <HeaderMenu />
          <div className="h-4 w-px bg-border/50"></div>
          <div className="flex items-center gap-1.5">
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group
                ${(!selectedDatabase && !selectedBroker) 
                  ? 'opacity-20 cursor-not-allowed grayscale' 
                  : 'hover:bg-primary/10 hover:shadow-premium-sm text-foreground/40'}`} 
              title="Start Selected"
              onClick={() => {
                if (selectedDatabase && !activeDatabases.includes(selectedDatabase)) {
                  dispatch(startDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase }))
                    .unwrap()
                    .then(() => {
                      dispatch(fetchDatabaseStartInfo(selectedHostUid));
                    })
                    .catch(err => dispatch(showStatusModal({ type: 'error', title: 'Start Failed', message: err })));
                } else if (selectedBroker) {
                   const broker = brokers.find(b => b.name === selectedBroker);
                   if (broker && broker.state !== 'ON') {
                    dispatch(startBroker({ hostUid: selectedHostUid, brokerName: selectedBroker }))
                      .unwrap()
                      .then(() => {
                        dispatch(fetchBrokerList(selectedHostUid));
                      })
                      .catch(err => dispatch(showStatusModal({ type: 'error', title: 'Start Failed', message: err })));
                  }
                }
              }}
            >
              <Icon name="play_arrow" size="sm" className="group-hover:text-primary transition-colors" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-foreground/40 hover:bg-muted/10 hover:shadow-premium-sm rounded-xl transition-all group" title="Dashboard">
              <Icon name="grid_view" size="sm" className="group-hover:text-primary transition-colors" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-foreground/40 hover:bg-muted/10 hover:shadow-premium-sm rounded-xl transition-all group" title="Refresh">
              <Icon name="refresh" size="sm" className="group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">

          <button
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors flex items-center justify-center"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all group/profile"
            onClick={() => setIsProfileOpen(true)}
          >
            {authLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded-[6px] animate-pulse"></div>
                <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
              </div>
            ) : (
              <>
                <span className="text-[11px] font-normal text-slate-700 dark:text-slate-300 tracking-wide">
                  {user?.id || 'Admin'}
                </span>
                <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center transition-transform group-hover/profile:scale-105">
                  <span className="material-symbols-outlined text-slate-500 text-[14px]">
                    {authError ? 'error' : 'person'}
                  </span>
                </div>
              </>
            )}
          </div>
          <button
            className="p-2 text-slate-500 hover:bg-accent-red/10 hover:text-accent-red rounded-full transition-colors flex items-center justify-center"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <AboutModal />
    </>
  );
}
