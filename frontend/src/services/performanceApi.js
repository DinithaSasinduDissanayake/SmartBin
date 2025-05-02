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
  getPerformanceSummary: () => api.get('/performance/summary'),
  
  // Report endpoints
  exportPerformanceReport: (period, staffId) => {
    let url = '/performance/reports/export';
    const params = [];
    
    if (period) params.push(`period=${period}`);
    if (staffId) params.push(`staffId=${staffId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return api.get(url, { responseType: 'blob' }); // Important to set responseType to blob for PDF
  },
  
  getDetailedPerformanceReport: (startDate, endDate, staffId) => {
    let url = '/performance/reports/detailed';
    const params = [];
    
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (staffId) params.push(`staffId=${staffId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return api.get(url);
  }
};

export default performanceApi;