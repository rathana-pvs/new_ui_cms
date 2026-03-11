import { configureStore } from '@reduxjs/toolkit';
import layoutReducer from '../features/layout/layoutSlice';
import serverReducer from '../features/server/serverSlice';
import databaseReducer from '../features/database/databaseSlice';
import brokerReducer from '../features/broker/brokerSlice';
import hostReducer from '../features/host/hostSlice';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    layout: layoutReducer,
    server: serverReducer,
    database: databaseReducer,
    broker: brokerReducer,
    host: hostReducer,
    user: userReducer,
  },
});
