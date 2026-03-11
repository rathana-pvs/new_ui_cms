import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hostApi } from './hostApi';

// Async thunk to fetch hosts from API
export const fetchHosts = createAsyncThunk(
  'host/fetchHosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostApi.getHosts();
      const hostMap = response.host_list || {};
      // Convert object map to array
      return Object.values(hostMap);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch hosts');
    }
  }
);

// Async thunk to add a new host
export const addHost = createAsyncThunk(
  'host/addHost',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await hostApi.addHost(payload);
      // Backend returns the updated host_list object map.
      // So we can extract the new host values and return them to update Redux.
      const hostMap = response.host_list || {};
      return Object.values(hostMap);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || 'Failed to add host');
    }
  }
);

// Async thunk to delete a host
export const deleteHost = createAsyncThunk(
  'host/deleteHost',
  async (hostUid, { rejectWithValue }) => {
    try {
      await hostApi.deleteHost(hostUid);
      return hostUid;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || 'Failed to delete host');
    }
  }
);

// Async thunk to edit a host
export const editHost = createAsyncThunk(
  'host/editHost',
  async ({ hostUid, payload }, { rejectWithValue }) => {
    try {
      const response = await hostApi.editHost(hostUid, payload);
      const hostMap = response.host_list || {};
      return Object.values(hostMap);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || 'Failed to edit host');
    }
  }
);

// Async thunk to explicitly login/forward to a specific host
export const loginToHost = createAsyncThunk(
  'host/loginToHost',
  async (hostUid, { rejectWithValue }) => {
    try {
      const response = await hostApi.loginToHost(hostUid);
      // The API returns { data: false } (which apiClient unwraps to just boolean `false`) on failure
      if (response.data === false) {
        return rejectWithValue('Host login failed (bad credentials or unavailable)');
      }
      return hostUid;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to login to host ${hostUid}`);
    }
  }
);

const initialState = {
  isAddHostModalOpen: false,
  isDeleteHostModalOpen: false,
  isEditHostModalOpen: false,
  hostToDeleteUid: null,
  hostToDeleteAlias: null,
  hostToEditUid: null,
  hosts: [],
  authorizedHosts: [], // Array of hostUids that have active forwarded sessions
  selectedHostUid: null,
  loading: false,
  error: null,
};

const hostSlice = createSlice({
  name: 'host',
  initialState,
  reducers: {
    openAddHostModal: (state) => {
      state.isAddHostModalOpen = true;
    },
    closeAddHostModal: (state) => {
      state.isAddHostModalOpen = false;
    },
    setSelectedHost: (state, action) => {
      state.selectedHostUid = action.payload;
    },
    revokeHostLogin: (state, action) => {
      state.authorizedHosts = state.authorizedHosts.filter(uid => uid !== action.payload);
    },
    openDeleteHostModal: (state, action) => {
      state.isDeleteHostModalOpen = true;
      state.hostToDeleteUid = action.payload.hostUid;
      state.hostToDeleteAlias = action.payload.alias;
    },
    closeDeleteHostModal: (state) => {
      state.isDeleteHostModalOpen = false;
      state.hostToDeleteUid = null;
      state.hostToDeleteAlias = null;
    },
    openEditHostModal: (state, action) => {
      state.isEditHostModalOpen = true;
      state.hostToEditUid = action.payload; // Just need the hostUid, we can look up the rest
    },
    closeEditHostModal: (state) => {
      state.isEditHostModalOpen = false;
      state.hostToEditUid = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHosts.fulfilled, (state, action) => {
        state.loading = false;
        state.hosts = action.payload;
      })
      .addCase(fetchHosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addHost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHost.fulfilled, (state, action) => {
        state.loading = false;
        state.hosts = action.payload; // Payload is the full updated host list array
        state.isAddHostModalOpen = false; // Auto close modal on success
      })
      .addCase(addHost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // AddHostModal can also show this
      })
      .addCase(loginToHost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginToHost.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.authorizedHosts.includes(action.payload)) {
          state.authorizedHosts.push(action.payload);
        }
      })
      .addCase(loginToHost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteHost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHost.fulfilled, (state, action) => {
        state.loading = false;
        state.hosts = state.hosts.filter(h => h.uid !== action.payload);
        if (state.selectedHostUid === action.payload) {
          state.selectedHostUid = null;
        }
        state.authorizedHosts = state.authorizedHosts.filter(uid => uid !== action.payload);
        state.isDeleteHostModalOpen = false;
        state.hostToDeleteUid = null;
      })
      .addCase(deleteHost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editHost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editHost.fulfilled, (state, action) => {
        state.loading = false;
        state.hosts = action.payload; // Payload is the full updated host list array
        state.isEditHostModalOpen = false;
        state.hostToEditUid = null;
      })
      .addCase(editHost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  openAddHostModal,
  closeAddHostModal,
  setSelectedHost,
  revokeHostLogin,
  openDeleteHostModal,
  closeDeleteHostModal,
  openEditHostModal,
  closeEditHostModal,
} = hostSlice.actions;

export default hostSlice.reducer;
