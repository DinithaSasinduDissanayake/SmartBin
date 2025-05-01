import api from './api';

/**
 * Service for interacting with payment-related endpoints
 */
const paymentApi = {
  /**
   * Initiates a payment for a subscription
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.userId - ID of the user making payment
   * @param {string} paymentData.planId - ID of the subscription plan
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.currency - Currency code (default: USD)
   * @returns {Promise<Object>} - Client secret for Stripe processing
   */
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post('/financials/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  },

  /**
   * Get all payments for a user (or all payments for admin/financial_manager)
   * @param {Object} filters - Filter criteria
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.limit - Number of items per page
   * @param {string} filters.status - Filter by payment status
   * @returns {Promise<Object>} - Paginated payment data
   */
  getPayments: async (filters = {}) => {
    try {
      const response = await api.get('/financials/payments', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  /**
   * Get a specific payment by ID
   * @param {string} paymentId - ID of the payment to retrieve
   * @returns {Promise<Object>} - Payment details
   */
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`/financials/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw error;
    }
  },

  /**
   * Update payment status (admin/financial_manager only)
   * @param {string} paymentId - ID of the payment to update
   * @param {string} status - New payment status
   * @returns {Promise<Object>} - Updated payment
   */
  updatePaymentStatus: async (paymentId, status) => {
    try {
      const response = await api.patch(`/financials/payments/${paymentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  },
  
  /**
   * Record a manual payment (admin/financial_manager only)
   * @param {Object} paymentData - Manual payment data
   * @returns {Promise<Object>} - Created payment
   */
  recordManualPayment: async (paymentData) => {
    try {
      const response = await api.post('/financials/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error recording manual payment:', error);
      throw error;
    }
  }
};

export default paymentApi;