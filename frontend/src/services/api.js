import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to attach the auth token to every request
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
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