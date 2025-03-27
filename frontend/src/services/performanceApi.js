import api from './api';

const performanceApi = {
  // Staff endpoints
  getMyReviews: () => api.get('/performance/my-reviews'),
  
  // Admin endpoints
  createReview: (data) => api.post('/performance', data),
  getAllReviews: (staffId) => {
    let url = '/performance';
    if (staffId) {
      url += `?staffId=${staffId}`;
    }
    return api.get(url);
  },
  getReviewById: (id) => api.get(`/performance/${id}`),
  updateReview: (id, data) => api.put(`/performance/${id}`, data),
  deleteReview: (id) => api.delete(`/performance/${id}`),
  getPerformanceSummary: () => api.get('/performance/summary')
};

export default performanceApi;