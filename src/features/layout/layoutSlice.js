import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState = {
  theme: getInitialTheme(),
  isSidebarCollapsed: localStorage.getItem('isSidebarCollapsed') === 'true',
  isResizing: false,
  activeMainTab: null,
  openTabs: [],
  statusModal: {
    isOpen: false,
    type: 'success', // success, error, info
    title: '',
    message: ''
  }
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
      localStorage.setItem('isSidebarCollapsed', state.isSidebarCollapsed);
    },
    setSidebarCollapsed: (state, action) => {
      state.isSidebarCollapsed = action.payload;
      localStorage.setItem('isSidebarCollapsed', action.payload);
    },
    setIsResizing: (state, action) => {
      state.isResizing = action.payload;
    },
    setActiveMainTab: (state, action) => {
      state.activeMainTab = action.payload;
      // Also ensure it's in openTabs if we are setting it active
      if (!state.openTabs.includes(action.payload)) {
        state.openTabs.push(action.payload);
      }
    },
    openTab: (state, action) => {
      const tabId = action.payload;
      if (!state.openTabs.includes(tabId)) {
        state.openTabs.push(tabId);
      }
      state.activeMainTab = tabId;
    },
    closeTab: (state, action) => {
      const tabId = action.payload;
      state.openTabs = state.openTabs.filter(tab => tab !== tabId);
      
      // If we closed the active tab, switch to another one
      if (state.activeMainTab === tabId) {
        if (state.openTabs.length > 0) {
          state.activeMainTab = state.openTabs[state.openTabs.length - 1];
        } else {
          state.activeMainTab = null;
        }
      }
    },
    closeHostTabs: (state, action) => {
      const hostUid = action.payload;
      // Close the host tab, and realistically if we disconnect we'd also close db tabs for that host. 
      // Since db tabs are just 'db:dbname', we might as well close all db tabs or clear everything.
      state.openTabs = state.openTabs.filter(tab => tab !== `host:${hostUid}` && !tab.startsWith('db:'));
      
      if (!state.openTabs.includes(state.activeMainTab)) {
        if (state.openTabs.length > 0) {
          state.activeMainTab = state.openTabs[state.openTabs.length - 1];
        } else {
          state.activeMainTab = null;
        }
      }
    },
    showStatusModal: (state, action) => {
      state.statusModal = {
        isOpen: true,
        type: action.payload.type || 'success',
        title: action.payload.title || '',
        message: action.payload.message || ''
      };
    },
    closeStatusModal: (state) => {
      state.statusModal.isOpen = false;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setIsResizing,
  setActiveMainTab,
  openTab,
  closeTab,
  closeHostTabs,
  showStatusModal,
  closeStatusModal,
} = layoutSlice.actions;

export default layoutSlice.reducer;
