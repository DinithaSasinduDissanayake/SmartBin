import api from './api';

/**
 * Service for user-related API calls
 */
const userApi = {
  /**
   * Get the current user's profile
   * @returns {Promise} Promise with user profile data
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  /**
   * Update the current user's profile
   * @param {Object} profileData - User profile data to update
   * @returns {Promise} Promise with updated user profile data
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  /**
   * Change the user's password
   * @param {Object} passwordData - Object containing old and new password
   * @returns {Promise} Promise with success message
   */
  changePassword: async (passwordData) => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },
  
  /**
   * Upload a profile picture
   * @param {FormData} formData - Form data containing the image file
   * @returns {Promise} Promise with image URL
   */
  uploadProfilePicture: async (formData) => {
    const response = await api.post('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  /**
   * Get user notification preferences
   * @returns {Promise} Promise with notification preferences
   */
  getNotificationPreferences: async () => {
    const response = await api.get('/users/notification-preferences');
    return response.data;
  },
  
  /**
   * Update user notification preferences
   * @param {Object} preferences - Notification preference settings
   * @returns {Promise} Promise with updated preferences
   */
  updateNotificationPreferences: async (preferences) => {
    const response = await api.put('/users/notification-preferences', preferences);
    return response.data;
  }
};

export default userApi;