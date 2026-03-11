import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth/authSlice';
import UserProfileModal from '../../user/components/UserProfileModal';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';

export default function Header({ theme, toggleTheme }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">

          <DropdownMenu label="File">
            <MenuItem icon="add_box" iconColor="text-accent-blue" label="Add Host" href="#" />
            <MenuItem icon="edit" iconColor="text-accent-red" label="Change Host" href="#" />
            <MenuItem icon="file_upload" iconColor="text-accent-green" label="Export Host" href="#" />
            <MenuItem icon="file_download" iconColor="text-accent-purple" label="Import Host" href="#" />
          </DropdownMenu>

          <DropdownMenu label="Tool" width="w-48">
            <MenuItem icon="play_arrow" iconColor="text-accent-green" label="Start Service" />
            <MenuItem icon="stop" iconColor="text-accent-red" label="Stop Service" />
            <MenuDivider />
            <MenuItem icon="database" iconColor="text-accent-blue" label="Start Database" />
            <MenuItem icon="database_off" iconColor="text-slate-400" label="Stop Database" />
            <MenuDivider />
            <MenuItem icon="hub" iconColor="text-accent-orange" label="Start Broker" />
            <MenuItem icon="hub" iconColor="text-slate-400" label="Stop Broker" />
          </DropdownMenu>

          <DropdownMenu label="Action" width="w-48">
            <MenuItem icon="dashboard_customize" iconColor="text-accent-orange" label="Dashboard Config" href="#" />
            <MenuItem icon="tune" iconColor="text-accent-blue" label="Properties" href="#" />
            <SubMenu icon="settings" iconColor="text-accent-purple" label="Config Param" width="w-56" gap="ml-3">
              <MenuItem icon="edit_document" iconColor="text-accent-red" label="Edit Cubrid Config" href="#" />
              <MenuItem icon="edit_note" iconColor="text-accent-yellow" label="Edit Broker Config" href="#" />
              <MenuItem icon="manage_accounts" iconColor="text-accent-green" label="Cubrid Manager Config" href="#" />
            </SubMenu>
          </DropdownMenu>

          <a className="hover:text-primary transition-colors" href="#">Help</a>
        </nav>
        <div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors" title="Start">
            <span className="material-symbols-outlined text-accent-green text-[20px]">play_arrow</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors" title="Dashboard">
            <span className="material-symbols-outlined text-accent-orange text-[20px]">grid_view</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors" title="Refresh">
            <span className="material-symbols-outlined text-accent-blue text-[20px]">refresh</span>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input className="w-full pl-10 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-sm focus:ring-2 focus:ring-primary/20" placeholder="Search databases..." type="text"/>
        </div>
        <button 
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors flex items-center justify-center"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        <div 
          className="h-8 w-8 rounded-sm bg-slate-200 dark:bg-slate-700 cursor-pointer hover:ring-2 hover:ring-slate-300 transition-all flex items-center justify-center" 
          title="User Profile"
          onClick={() => setIsProfileOpen(true)}
        >
          <span className="material-symbols-outlined text-slate-500 text-[18px]">person</span>
        </div>
        <button 
          className="p-2 text-slate-500 hover:bg-accent-red/10 hover:text-accent-red rounded-sm transition-colors flex items-center justify-center"
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
