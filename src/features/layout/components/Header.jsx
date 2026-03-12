import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/authSlice';
import UserProfileModal from '../../user/components/UserProfileModal';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';
import { openTab, showStatusModal } from '../layoutSlice';
import { openAddHostModal, openEditHostModal, startService, stopService } from '../../host/hostSlice';
import { startDatabase, stopDatabase } from '../../database/databaseSlice';
import { startBroker, stopBroker } from '../../broker/brokerSlice';

export default function Header({ theme, toggleTheme }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedHostUid } = useSelector((state) => state.host);
  const { selectedDatabase, activeDatabases } = useSelector((state) => state.database);
  const { brokers, selectedBroker } = useSelector((state) => state.broker);

  const handleLogout = () => {
    dispatch(logout());
    // Use window.location.href to force a full page refresh and clear all in-memory state
    window.location.href = '/login';
  };

  return (
    <>
      <header className="bg-white dark:bg-bk-side border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6">

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 font-sans">


            <DropdownMenu label="File">
              <MenuItem
                icon="add_box"
                label="Add Host"
                onClick={() => dispatch(openAddHostModal())}
              />
              <MenuItem
                icon="edit"
                label="Change Host"
                disabled={!selectedHostUid}
                onClick={() => dispatch(openEditHostModal(selectedHostUid))}
              />
              <MenuItem icon="file_upload" label="Export Host" href="#" />
              <MenuItem icon="file_download" label="Import Host" href="#" />
            </DropdownMenu>

            <DropdownMenu label="Tool" width="w-48">
              <MenuItem
                icon="play_arrow"
                label="Start Service"
                disabled={!selectedHostUid}
                onClick={() => dispatch(startService(selectedHostUid))}
              />
              <MenuItem
                icon="stop"
                label="Stop Service"
                disabled={!selectedHostUid}
                onClick={() => dispatch(stopService(selectedHostUid))}
              />
              <MenuDivider />
              <MenuItem
                icon="database"
                label="Start Database"
                disabled={!selectedDatabase || activeDatabases.includes(selectedDatabase)}
                onClick={() => dispatch(startDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase }))}
              />
              <MenuItem
                icon="database_off"
                label="Stop Database"
                disabled={!selectedDatabase || !activeDatabases.includes(selectedDatabase)}
                onClick={() => dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase }))}
              />
              <MenuDivider />
              <MenuItem
                icon="hub"
                label="Start Broker"
                disabled={!selectedBroker || brokers.find(b => b.name === selectedBroker)?.state === 'ON'}
                onClick={() => dispatch(startBroker({ hostUid: selectedHostUid, brokerName: selectedBroker }))}
              />
              <MenuItem
                icon="hub"
                label="Stop Broker"
                disabled={!selectedBroker || brokers.find(b => b.name === selectedBroker)?.state !== 'ON'}
                onClick={() => dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: selectedBroker }))}
              />
            </DropdownMenu>

            <DropdownMenu label="Action" width="w-48">
              <MenuItem icon="dashboard_customize" label="Dashboard Config" href="#" />
              <MenuItem icon="tune" label="Properties" href="#" />
              <SubMenu icon="settings" label="Config Param" width="w-56" gap="ml-3">
                <MenuItem
                  icon="edit_document"
                  label="Edit Cubrid Config"
                  onClick={() => {
                    if (selectedHostUid) {
                      dispatch(openTab(`edit_config:${selectedHostUid}:cubridconf`));
                    } else {
                      dispatch(showStatusModal({ type: 'info', title: 'No host selected', message: 'Please select a host from the sidebar first.' }));
                    }
                  }}
                />
                <MenuItem icon="edit_note" label="Edit Broker Config" href="#" />
                <MenuItem
                  icon="manage_accounts"
                  label="Edit CM Config"
                  onClick={() => {
                    if (selectedHostUid) {
                      dispatch(openTab(`edit_config:${selectedHostUid}:cmconf`));
                    } else {
                      dispatch(showStatusModal({ type: 'info', title: 'No host selected', message: 'Please select a host from the sidebar first.' }));
                    }
                  }}
                />
              </SubMenu>
            </DropdownMenu>


            <a className="hover:text-bk-yellow transition-colors" href="#">Help</a>

          </nav>
          <div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>
          <div className="flex items-center gap-1.5 ml-2">
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group" title="Start">
              <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-bk-yellow transition-colors leading-none" style={{ fontVariationSettings: "'wght' 300" }}>play_arrow</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors group" title="Dashboard">
              <span className="material-symbols-outlined text-slate-400 text-[20px] group-hover:text-bk-yellow transition-colors leading-none" style={{ fontVariationSettings: "'wght' 300" }}>grid_view</span>
            </button>
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
            className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer hover:ring-2 hover:ring-slate-300 transition-all flex items-center justify-center"
            title="User Profile"
            onClick={() => setIsProfileOpen(true)}
          >
            <span className="material-symbols-outlined text-slate-500 text-[18px]">person</span>
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
    </>
  );
}
