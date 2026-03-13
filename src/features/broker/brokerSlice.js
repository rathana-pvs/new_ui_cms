import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { brokerApi } from './brokerApi';

const generateId = () => Math.random().toString(36).substring(2, 6);

export const fetchBrokerList = createAsyncThunk(
  'broker/fetchBrokerList',
  async (arg, { rejectWithValue }) => {
    const hostUid = typeof arg === 'string' ? arg : arg.hostUid;
    try {
      const response = await brokerApi.getBrokerList(hostUid);
      // Logic based on requested snippet:
      // Response structure might be res.result or [ { broker: [...] } ]
      // We'll adapt to both or follow the snippet's expectation of .result
      const brokerList = response.result || (Array.isArray(response) ? response[0]?.broker : []);
      
      if (!brokerList) return [];

      const formattedBrokers = brokerList.map(item => ({
        ...item,
        name: item.name,
        state: item.state || item.status,
        pid: item.pid,
        port: item.port,
        as: item.as,
        jq: item.jq,
        req: item.req,
        // Add more default fields if needed
      }));

      const responses = await Promise.all(
        formattedBrokers.map(async (b) => {
          try {
            const statusRes = await brokerApi.getBrokerStatus(hostUid, b.name);
            return { b, statusRes, success: true };
          } catch (err) {
            return { b, success: false };
          }
        })
      );

      const dataSource = responses.map((r) => {
        if (!r.success) return null;
        // Correctly navigate the new response structure: statusRes.data.asinfo[0]
        const result = r.statusRes?.asinfo?.[0];
        if (!result) return r.b;

        return {
          ...r.b,
          key: generateId(),
          qps: result.as_num_query || '0',
          tps: result.as_num_tran || '0',
        };
      }).filter(Boolean);

      return dataSource;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch broker list');
    }
  }
);

export const startBroker = createAsyncThunk(
  'broker/startBroker',
  async ({ hostUid, brokerName }, { dispatch, rejectWithValue }) => {
    try {
      await brokerApi.startBroker(hostUid, brokerName);
      dispatch(fetchBrokerList(hostUid));
      return { brokerName, success: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to start broker');
    }
  }
);

export const stopBroker = createAsyncThunk(
  'broker/stopBroker',
  async ({ hostUid, brokerName }, { dispatch, rejectWithValue }) => {
    try {
      await brokerApi.stopBroker(hostUid, brokerName);
      dispatch(fetchBrokerList(hostUid));
      return { brokerName, success: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to stop broker');
    }
  }
);

export const fetchBrokerLogs = createAsyncThunk(
  'broker/fetchBrokerLogs',
  async ({ hostUid, brokerName }, { rejectWithValue }) => {
    try {
      const response = await brokerApi.getBrokerLogs(hostUid, brokerName);
      // Data path: response.logfileinfo[0].logfile
      const logs = response.logfileinfo?.[0]?.logfile || [];
      return { brokerName, logs };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch broker logs');
    }
  }
);

export const fetchLogContent = createAsyncThunk(
  'broker/fetchLogContent',
  async ({ hostUid, path, start = '1', end = '100' }, { rejectWithValue }) => {
    try {
      const response = await brokerApi.viewLog(hostUid, { path, start, end });
      return { path, data: response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch log content');
    }
  }
);

export const fetchAdminLogs = createAsyncThunk(
  'broker/fetchAdminLogs',
  async (hostUid, { rejectWithValue }) => {
    try {
      const response = await brokerApi.getAdminLogs(hostUid);
      return { hostUid, logs: response.adminloginfo || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin logs');
    }
  }
);

export const fetchCMSLogs = createAsyncThunk(
  'broker/fetchCMSLogs',
  async (hostUid, { rejectWithValue }) => {
    try {
      const response = await brokerApi.getCMSLogs(hostUid);
      return { hostUid, logs: response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch CMS logs');
    }
  }
);

export const fetchDatabaseLogs = createAsyncThunk(
  'broker/fetchDatabaseLogs',
  async ({ hostUid, dbname }, { rejectWithValue }) => {
    try {
      const response = await brokerApi.getDatabaseLogs(hostUid, dbname);
      return { dbname, logs: response.loginfo?.[0]?.log || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || `Failed to fetch logs for database ${dbname}`);
    }
  }
);

const initialState = {
  brokers: [],
  selectedBroker: null,
  selectedBrokerSubItem: null,
  logsByBroker: {}, // { brokerName: [logs] }
  viewingLogs: {}, // { path: { data: {}, loading: false, error: null } }
  adminLogsByHost: {}, // { hostUid: [logs] }
  loading: false,
  actionLoading: false,
  logsLoading: false,
  adminLogsLoading: false,
  cmsLogsByHost: {}, // { hostUid: { accesslog: [], errorlog: [] } }
  cmsLogsLoading: false,
  dbLogsByDbName: {}, // { dbname: [logs] }
  dbLogsLoading: false,
  error: null,
};

const brokerSlice = createSlice({
  name: 'broker',
  initialState,
  reducers: {
    setSelectedBroker: (state, action) => {
      state.selectedBroker = action.payload;
    },
    setSelectedBrokerSubItem: (state, action) => {
      state.selectedBrokerSubItem = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrokerList.pending, (state, action) => {
        if (!action.meta.arg?.isBackground) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchBrokerList.fulfilled, (state, action) => {
        state.loading = false;
        const newBrokers = action.payload;
        
        // Referential stability check
        if (JSON.stringify(state.brokers) !== JSON.stringify(newBrokers)) {
          state.brokers = newBrokers;
        }
        
        // Ensure selected broker still exists
        const exists = state.brokers.find(b => b.name === state.selectedBroker);
        if (!exists) state.selectedBroker = null;
      })
      .addCase(fetchBrokerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.brokers = [];
      })
      .addCase(startBroker.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(startBroker.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(startBroker.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(stopBroker.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(stopBroker.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(stopBroker.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(fetchBrokerLogs.pending, (state) => {
        state.logsLoading = true;
      })
      .addCase(fetchBrokerLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logsByBroker[action.payload.brokerName] = action.payload.logs;
      })
      .addCase(fetchBrokerLogs.rejected, (state) => {
        state.logsLoading = false;
      })
      .addCase(fetchLogContent.pending, (state, action) => {
        const path = action.meta.arg.path;
        if (!state.viewingLogs[path]) state.viewingLogs[path] = {};
        state.viewingLogs[path].loading = true;
        state.viewingLogs[path].error = null;
      })
      .addCase(fetchLogContent.fulfilled, (state, action) => {
        const { path, data } = action.payload;
        state.viewingLogs[path].loading = false;
        state.viewingLogs[path].data = data;
      })
      .addCase(fetchLogContent.rejected, (state, action) => {
        const path = action.meta.arg.path;
        state.viewingLogs[path].loading = false;
        state.viewingLogs[path].error = action.payload;
      })
      .addCase(fetchAdminLogs.pending, (state) => {
        state.adminLogsLoading = true;
      })
      .addCase(fetchAdminLogs.fulfilled, (state, action) => {
        state.adminLogsLoading = false;
        state.adminLogsByHost[action.payload.hostUid] = action.payload.logs;
      })
      .addCase(fetchAdminLogs.rejected, (state) => {
        state.adminLogsLoading = false;
      })
      .addCase(fetchCMSLogs.pending, (state) => {
        state.cmsLogsLoading = true;
      })
      .addCase(fetchCMSLogs.fulfilled, (state, action) => {
        state.cmsLogsLoading = false;
        state.cmsLogsByHost[action.payload.hostUid] = action.payload.logs;
      })
      .addCase(fetchCMSLogs.rejected, (state) => {
        state.cmsLogsLoading = false;
      })
      .addCase(fetchDatabaseLogs.pending, (state) => {
        state.dbLogsLoading = true;
      })
      .addCase(fetchDatabaseLogs.fulfilled, (state, action) => {
        state.dbLogsLoading = false;
        state.dbLogsByDbName[action.payload.dbname] = action.payload.logs;
      })
      .addCase(fetchDatabaseLogs.rejected, (state) => {
        state.dbLogsLoading = false;
      });
  },
});

export const { setSelectedBroker, setSelectedBrokerSubItem } = brokerSlice.actions;

export default brokerSlice.reducer;
