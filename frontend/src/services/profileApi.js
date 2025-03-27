import api from './api';

const profileApi = {
  // Get current user profile
  getProfile: () => api.get('/users/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Delete user account
  deleteAccount: () => api.delete('/users/profile'),
  
  // Change password
  changePassword: (passwordData) => api.put('/users/profile', { password: passwordData.newPassword }),
  
  // Document operations
  getDocuments: () => api.get('/documents'),
  uploadDocument: (formData) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getDocument: (id) => api.get(`/documents/${id}`),
  deleteDocument: (id) => api.delete(`/documents/${id}`)
};

export default profileApi;