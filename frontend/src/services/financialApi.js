import api from './api';

const financialApi = {
  getDashboardData: (range = 'month') => api.get(`/financials/dashboard?range=${range}`),
  // Placeholder for specific reports
  getProfitLossReport: (params) => api.get('/financials/reports/profit-loss', { params }), // params = { startDate, endDate }
  getRevenueByCustomerReport: (params) => api.get('/financials/reports/revenue-by-customer', { params }),
  getExpenseDetailsReport: (params) => api.get('/financials/reports/expense-details', { params }),
  // Add other financial endpoints if needed
};

export default financialApi;
