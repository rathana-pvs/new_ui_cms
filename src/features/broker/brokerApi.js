import apiClient from '../../api/apiClient';

export const brokerApi = {
  getBrokerList: (hostUid) => {
    return apiClient.get(`/${hostUid}/broker/list`);
  },
  getBrokerStatus: (hostUid, brokerName) => {
    return apiClient.get(`/${hostUid}/broker/status/${brokerName}`);
  },
  startBroker: (hostUid, brokerName) => {
    return apiClient.post(`/${hostUid}/broker/start/${brokerName}`);
  },
  stopBroker: (hostUid, brokerName) => {
    return apiClient.post(`/${hostUid}/broker/stop/${brokerName}`);
  },
};
