import apiClient from '../../api/apiClient';

export const databaseApi = {
  getStartInfo: (hostUid) => {
    return apiClient.get(`/${hostUid}/database/start-info`);
  },
  startDatabase: (hostUid, dbname) => {
    return apiClient.post(`/${hostUid}/database/start/${dbname}`);
  },
  stopDatabase: (hostUid, dbname) => {
    return apiClient.post(`/${hostUid}/database/stop/${dbname}`);
  },
  getVolumeInfo: (hostUid, dbname) => {
    return apiClient.get(`/${hostUid}/database/volume-info/${dbname}`);
  },
  getClassInfo: (hostUid, dbname, dbstatus) => {
    return apiClient.post(`/${hostUid}/database/class-info/${dbname}`, { dbstatus });
  },
  unloadDatabase: (hostUid, dbname, payload) => {
    return apiClient.post(`/${hostUid}/database/unload/${dbname}`, payload);
  },
  getUnloadInfo: (hostUid) => {
    return apiClient.get(`/${hostUid}/database/unload-info`);
  },
  loadDatabase: (hostUid, dbname, payload) => {
    return apiClient.post(`/${hostUid}/database/load/${dbname}`, payload);
  },
  checkDatabase: (hostUid, dbname, payload) => {
    return apiClient.post(`/${hostUid}/database/check/${dbname}`, payload);
  },
  compactDatabase: (hostUid, dbname, payload) =>
    apiClient.post(`/${hostUid}/database/compact/${dbname}`, payload),

  getLockInfo: (hostUid, dbname) =>
    apiClient.post(`/${hostUid}/database/lock/${dbname}`),

  getTransactionInfo: (hostUid, dbname, payload) =>
    apiClient.post(`/${hostUid}/database/transaction-info/${dbname}`, payload),

  killTransaction: (hostUid, dbname, payload) =>
    apiClient.post(`/${hostUid}/database/kill-transaction/${dbname}`, payload),

  setAutoStart: (hostUid, payload) => {
    return apiClient.post(`/${hostUid}/database/auto-start`, payload);
  },

  removeAutoStart: (hostUid, payload) => {
    return apiClient.delete(`/${hostUid}/database/auto-start`, { data: payload });
  },

  deleteDatabase: (hostUid, dbname, payload) => {
    return apiClient.delete(`/${hostUid}/database/${dbname}`, { data: payload });
  },

  loginDatabase: (hostUid, dbname, payload) => {
    return apiClient.post(`/${hostUid}/database/users/login/${dbname}`, payload);
  },
  addBackupSchedule: (hostUid, dbname, payload) => {
    return apiClient.post(`/${hostUid}/database/backup-schedule/${dbname}`, payload);
  },
};
