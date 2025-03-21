import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Subscription Plans API
export const subscriptionPlansApi = {
  getAll: () => api.get('/subscription-plans'),
  getById: (id) => api.get(`/subscription-plans/${id}`),
  create: (planData) => api.post('/subscription-plans', planData),
  update: (id, planData) => api.put(`/subscription-plans/${id}`, planData),
  delete: (id) => api.delete(`/subscription-plans/${id}`)
};

export default api;