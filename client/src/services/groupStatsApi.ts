import api from './api';

export const groupStatsApi = {
  getGroupStats: (groupId: number) => api.get(`/api/stats/group/${groupId}`),
};
