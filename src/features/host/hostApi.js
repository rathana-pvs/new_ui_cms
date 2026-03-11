import apiClient from '../../api/apiClient';

export const hostApi = {
  getHosts: () => {
    return apiClient.get('/host');
  },
  addHost: (payload) => {
    return apiClient.post('/host', payload);
  },
  loginToHost: (hostUid) => {
    return apiClient.post(`/${hostUid}/cms-auth/login`);
  },
  getHostEnv: (hostUid) => {
    return apiClient.get(`/${hostUid}/cms-config/env`);
  },
  deleteHost: (hostUid) => {
    return apiClient.delete(`/host/${hostUid}`);
  },
  editHost: (hostUid, payload) => {
    return apiClient.put(`/host/${hostUid}`, payload);
  },
};
