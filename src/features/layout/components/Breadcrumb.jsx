import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/ui/Navigation/DropdownMenu';
import ContextMenu from '../../../components/ui/Navigation/ContextMenu';
import Modal from '../../../components/ui/Layout/Modal';


import TabItem from './TabItem';

export default function Breadcrumb({ activeTab, onTabChange, openTabs = [], onCloseTab, onCloseOthers, onCloseAll, labels = {} }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, message: '' });
  const { dirtyTabs } = useSelector((state) => state.layout);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleClickOutside, true);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
    };
  }, []);

  const handleCloseTab = (tabId, queue = []) => {
    if (dirtyTabs.includes(tabId)) {
      onTabChange(tabId); // Switch to the dirty tab so user sees contents
      setConfirmModal({
        isOpen: true,
        title: 'Discard Changes?',
        message: `You have unsaved changes in "${labels[tabId] || tabId}". If you close it, your changes will be lost.`,
        onConfirm: () => {
          onCloseTab(tabId);
          if (queue.length > 1) {
            const nextQueue = queue.slice(1);
            setConfirmModal({ ...confirmModal, isOpen: false });
            // Small timeout to allow modal to cycle
            setTimeout(() => handleCloseTab(nextQueue[0], nextQueue), 100);
          }
        }
      });
    } else {
      onCloseTab(tabId);
      if (queue.length > 1) {
        const nextQueue = queue.slice(1);
        handleCloseTab(nextQueue[0], nextQueue);
      }
    }
  };

  const handleCloseOthers = (tabId) => {
    const others = openTabs.filter(tid => tid !== tabId);
    const dirtyOthers = others.filter(tid => dirtyTabs.includes(tid));
    const cleanOthers = others.filter(tid => !dirtyTabs.includes(tid));

    // Immediately close clean tabs
    cleanOthers.forEach(tid => onCloseTab(tid));

    if (dirtyOthers.length > 0) {
      handleCloseTab(dirtyOthers[0], dirtyOthers);
    }
  };

  const handleCloseAll = () => {
    const dirtyOnes = openTabs.filter(tid => dirtyTabs.includes(tid));
    const cleanOnes = openTabs.filter(tid => !dirtyTabs.includes(tid));

    // Immediately close clean tabs
    cleanOnes.forEach(tid => onCloseTab(tid));

    if (dirtyOnes.length > 0) {
      handleCloseTab(dirtyOnes[0], dirtyOnes);
    }
  };

  const handleContextMenu = (e, tabId) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId
    });
  };

  const getTabIcon = (id) => {
    if (id.startsWith('host:')) return 'dns';
    if (id.startsWith('db:')) return 'database';
    if (id.startsWith('edit_config:')) return 'settings_applications';
    if (id.startsWith('broker_config:')) return 'table_rows';
    if (id.startsWith('log:')) return 'description';
    return 'description';
  };

  const getTabLabel = (id) => {
    if (labels[id]) return labels[id];
    switch (id) {
      case 'server': return 'server';
      case 'demodb': return 'demodb';
      default: return id;
    }
  };

  return (
    <div className="bg-background-secondary border-b border-border/50 relative">
      <div className="flex overflow-x-auto scrollbar-hide bg-muted/5">
        {openTabs.map((tabId) => (
          <TabItem
            key={tabId}
            tabId={tabId}
            isActive={activeTab === tabId}
            isDirty={dirtyTabs.includes(tabId)}
            label={getTabLabel(tabId)}
            icon={getTabIcon(tabId)}
            onClick={() => onTabChange(tabId)}
            onClose={() => handleCloseTab(tabId)}
            onContextMenu={(e) => handleContextMenu(e, tabId)}
          />
        ))}
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)}
        >
          <MenuItem 
            icon="close" 
            label="Close Tab" 
            onClick={() => {
              handleCloseTab(contextMenu.tabId);
              setContextMenu(null);
            }} 
          />
          <MenuItem 
            icon="close_fullscreen" 
            label="Close Other Tabs" 
            onClick={() => {
              handleCloseOthers(contextMenu.tabId);
              setContextMenu(null);
            }} 
          />
          <MenuItem 
            icon="tab_close" 
            label="Close All Tabs" 
            onClick={() => {
              handleCloseAll();
              setContextMenu(null);
            }} 
          />
          <MenuDivider />
          <MenuItem 
            icon="refresh" 
            label="Reload Tab" 
            onClick={() => setContextMenu(null)}
          />
        </ContextMenu>
      )}
 
      <Modal 
        isOpen={confirmModal.isOpen}
        title="Confirm Action"
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      >
        <div className="space-y-4">
          <Typography variant="body2" className="opacity-60">{confirmModal.message}</Typography>
          <div className="flex justify-end gap-3">
             <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="px-4 py-2 rounded-lg bg-muted text-foreground/40 text-[10px] font-black uppercase tracking-widest">Cancel</button>
             <button onClick={confirmModal.onConfirm} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
