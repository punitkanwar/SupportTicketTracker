import api from './api.js';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  getHealth: async () => {
    const response = await api.get('/health');
    return response.data.data;
  },
};
