import api from './api';

/**
 * Service for interacting with user subscription endpoints
 */
const userSubscriptionApi = {
  /**
   * Get all subscriptions for a user
   * @param {string} userId - ID of the user 
   * @returns {Promise<Object>} - User's subscriptions
   */
  getUserSubscriptions: async (userId) => {
    try {
      const response = await api.get(`/user-subscriptions/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  },
  
  /**
   * Get subscription details by ID
   * @param {string} subscriptionId - ID of the subscription
   * @returns {Promise<Object>} - Subscription details
   */
  getSubscriptionById: async (subscriptionId) => {
    try {
      const response = await api.get(`/user-subscriptions/${subscriptionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      throw error;
    }
  },
  
  /**
   * Create a new subscription for a user
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} - Created subscription
   */
  createUserSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/user-subscriptions', subscriptionData);
      return response;
    } catch (error) {
      console.error('Error creating user subscription:', error);
      throw error;
    }
  },
  
  /**
   * Update a subscription (status, autoRenew, etc.)
   * @param {string} subscriptionId - ID of the subscription to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated subscription
   */
  updateSubscription: async (subscriptionId, updateData) => {
    try {
      const response = await api.put(`/user-subscriptions/${subscriptionId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },
  
  /**
   * Cancel a subscription
   * @param {string} subscriptionId - ID of the subscription to cancel
   * @returns {Promise<Object>} - Response with message
   */
  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.delete(`/user-subscriptions/${subscriptionId}`);
      return response;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },
  
  /**
   * Toggle auto-renewal for a subscription
   * @param {string} subscriptionId - ID of the subscription
   * @param {boolean} autoRenew - Auto renew setting
   * @returns {Promise<Object>} - Updated subscription
   */
  toggleAutoRenew: async (subscriptionId, autoRenew) => {
    try {
      const response = await api.put(`/user-subscriptions/${subscriptionId}`, { autoRenew });
      return response;
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
      throw error;
    }
  },
  
  /**
   * Get all active subscriptions (admin only)
   * @returns {Promise<Object>} - List of active subscriptions
   */
  getAllActiveSubscriptions: async () => {
    try {
      const response = await api.get('/user-subscriptions');
      return response;
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      throw error;
    }
  },
};

export default userSubscriptionApi;