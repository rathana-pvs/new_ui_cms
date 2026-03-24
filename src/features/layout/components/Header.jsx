import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchUser } from '../../auth/authSlice';
import { fetchPreferences } from '../../user/userSlice';
import UserProfileModal from '../../user/components/UserProfileModal';
import { showStatusModal } from '../layoutSlice';
import { fetchDatabaseStartInfo, startDatabase } from '../../database/databaseSlice';
import { fetchBrokerList, startBroker } from '../../broker/brokerSlice';
import { setAboutCubrid } from '../appBarSlice';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Icon } from '../../../components/ds/foundation/Icon';
import AboutModal from './AboutModal';
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
    window.location.href = '/login';
  };

  return (
    <>
      <header className="bg-white dark:bg-bk-side border-b border-slate-200 dark:border-white/10 h-16 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-6">
          <HeaderMenu />
          <div className="h-6 w-px bg-slate-200 dark:bg-white/5 opacity-50"></div>
          
          <div className="flex items-center gap-1 ml-1 scale-95 origin-left">
            <button 
              className={`size-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all group
                ${(!selectedDatabase && !selectedBroker) ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`} 
              title="Start Selected"
              onClick={() => {
                if (selectedDatabase && !activeDatabases.includes(selectedDatabase)) {
                  dispatch(startDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase }))
                    .unwrap()
                    .then(() => dispatch(fetchDatabaseStartInfo(selectedHostUid)))
                    .catch(err => dispatch(showStatusModal({ type: 'error', title: 'Start Failed', message: err })));
                } else if (selectedBroker) {
                  const broker = brokers.find(b => b.name === selectedBroker);
                  if (broker && broker.state !== 'ON') {
                    dispatch(startBroker({ hostUid: selectedHostUid, brokerName: selectedBroker }))
                      .unwrap()
                      .then(() => dispatch(fetchBrokerList(selectedHostUid)))
                      .catch(err => dispatch(showStatusModal({ type: 'error', title: 'Start Failed', message: err })));
                  }
                }
              }}
            >
              <Icon name="play_arrow" size="sm" className="text-slate-400 group-hover:text-bk-yellow transition-colors"  weight={300} />
            </button>
            <button className="size-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 group" title="Dashboard">
              <Icon name="grid_view" size="sm" className="text-slate-400 group-hover:text-bk-yellow transition-colors"  weight={300} />
            </button>
            <button className="size-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 group" title="Refresh">
              <Icon name="refresh" size="sm" className="text-slate-400 group-hover:text-bk-yellow transition-colors"  weight={300} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95 flex items-center justify-center"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <Icon name={theme === 'light' ? 'dark_mode' : 'light_mode'} size="sm"  weight={300} />
          </button>

          <div
            className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all group/profile"
            onClick={() => setIsProfileOpen(true)}
          >
            {authLoading ? (
               <div className="flex items-center gap-2 px-2">
                 <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                 <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
               </div>
            ) : (
              <>
                <Typography variant="caption" className="font-bold text-slate-600 dark:text-slate-400 tracking-wide uppercase text-[10px]">
                  {user?.id || 'Admin'}
                </Typography>
                <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center transition-transform group-hover/profile:scale-105 overflow-hidden">
                   <Icon name={authError ? 'error' : 'person'} size="xs" className="text-slate-500"  weight={300} />
                </div>
              </>
            )}
          </div>

          <button
            className="p-2.5 text-slate-400 hover:bg-accent-red/10 hover:text-accent-red rounded-xl transition-all active:scale-95 flex items-center justify-center"
            onClick={handleLogout}
            title="Logout"
          >
            <Icon name="logout" size="sm"  weight={300} />
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
