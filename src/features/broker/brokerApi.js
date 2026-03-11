import apiClient from '../../api/apiClient';

export const brokerApi = {
  getBrokerList: (hostUid) => {
    return apiClient.get(`/${hostUid}/broker/list`);
  },
  getBrokerStatus: (hostUid, brokerName) => {
    return apiClient.get(`/${hostUid}/broker/status/${brokerName}`);
  },
};
