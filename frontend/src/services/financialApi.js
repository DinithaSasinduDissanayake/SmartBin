import api from './api';

const financialApi = {
  getDashboardData: (range = 'month') => api.get(`/financials/dashboard?range=${range}`),
  
  // Report endpoints
  getProfitLossReport: (params) => api.get('/financials/reports/profit-loss', { params }),
  getRevenueByCustomerReport: (params) => api.get('/financials/reports/revenue-by-customer', { params }),
  getExpenseDetailsReport: (params) => api.get('/financials/reports/expense-details', { params }),
  
  // Export report as PDF
  exportReport: (dateRange) => api.get(`/financials/reports/export?range=${dateRange}`, { 
    responseType: 'blob' 
  }),
  
  // Subscription management
  getSubscriptionPlans: () => api.get('/subscription-plans'),
  getUserSubscriptions: () => api.get('/user-subscriptions/me'),
  updateUserSubscription: (subscriptionId, data) => api.put(`/user-subscriptions/${subscriptionId}`, data),
  createUserSubscription: (data) => api.post('/user-subscriptions', data)
};

export default financialApi;
