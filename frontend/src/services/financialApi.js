import api from './api';

const financialApi = {
  getDashboardData: (range = 'month') => api.get(`/financials/dashboard?range=${range}`),
  // Add other financial endpoints if needed (e.g., expenses, payments list)
};

export default financialApi;
