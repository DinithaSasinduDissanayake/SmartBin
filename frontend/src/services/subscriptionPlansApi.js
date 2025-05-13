import api from './api';

// Subscription Plans API
export const subscriptionPlansApi = {
  getAll: () => api.get('/subscription-plans'),
  getById: (id) => api.get(`/subscription-plans/${id}`),
  create: (planData) => api.post('/subscription-plans', planData),
  update: (id, planData) => api.put(`/subscription-plans/${id}`, planData),
  delete: (id) => api.delete(`/subscription-plans/${id}`)
};

export default subscriptionPlansApi; // Default export might be more conventional
