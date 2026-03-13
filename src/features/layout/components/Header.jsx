import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, fetchUser } from '../../auth/authSlice';
import { fetchPreferences } from '../../user/userSlice';
import UserProfileModal from '../../user/components/UserProfileModal';
import MonitoringSettingsPopover from '../../user/components/MonitoringSettingsPopover';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';
import { openTab, showStatusModal } from '../layoutSlice';
import { openAddHostModal, openEditHostModal, startService, stopService } from '../../host/hostSlice';
import { startDatabase, stopDatabase } from '../../database/databaseSlice';
import { startBroker, stopBroker } from '../../broker/brokerSlice';
import { setAboutCubrid } from '../appBarSlice';
import AboutModal from './AboutModal';
import { openServerVersionModal } from '../../host/hostSlice';

import HeaderMenu from './HeaderMenu';

export default function Header({ theme, toggleTheme }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading, error: authError } = useSelector((state) => state.auth);

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
      <header className="bg-white dark:bg-bk-side border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6">

        <div className="flex items-center gap-6">
          <HeaderMenu />
          <div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>
          <div className="flex items-center gap-1.5 ml-2">
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group" title="Start">
              <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-bk-yellow transition-colors leading-none" style={{ fontVariationSettings: "'wght' 300" }}>play_arrow</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group" title="Dashboard">
              <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-bk-yellow transition-colors leading-none" style={{ fontVariationSettings: "'wght' 300" }}>grid_view</span>
            </button>
            <MonitoringSettingsPopover />
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group" title="Refresh">
              <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-bk-yellow transition-colors leading-none" style={{ fontVariationSettings: "'wght' 300" }}>refresh</span>
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
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
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
