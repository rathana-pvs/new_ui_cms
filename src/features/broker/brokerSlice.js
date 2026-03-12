import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { brokerApi } from './brokerApi';

const generateId = () => Math.random().toString(36).substring(2, 6);

export const fetchBrokerList = createAsyncThunk(
  'broker/fetchBrokerList',
  async (hostUid, { rejectWithValue }) => {
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

const initialState = {
  brokers: [],
  loading: false,
  actionLoading: false,
  error: null,
};

const brokerSlice = createSlice({
  name: 'broker',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrokerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrokerList.fulfilled, (state, action) => {
        state.loading = false;
        state.brokers = action.payload;
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
      });
  },
});

export default brokerSlice.reducer;
