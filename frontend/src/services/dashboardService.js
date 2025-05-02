import axios from 'axios';
import { getAuthToken } from './authService'; // Import getAuthToken

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get the auth header
const getAuthHeader = () => {
  const token = getAuthToken(); // Use getAuthToken to retrieve the token
  return {
    headers: {
      // Ensure token exists before adding the header
      ...(token && { Authorization: `Bearer ${token}` }) 
    }
  };
};

/**
 * Service for dashboard-related API calls
 */
const dashboardService = {
  /**
   * Get financial manager main dashboard data
   * @returns {Promise} - Promise object with the dashboard data
   */
  getFinancialManagerDashboard: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/financial-manager-main`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching financial manager dashboard data:', error);
      throw error;
    }
  },
  
  /**
   * Get data for specialized financial dashboards (revenue, expenses, etc)
   * @param {string} dashboardType - The type of financial dashboard
   * @returns {Promise} - Promise object with the dashboard data
   */
  getSpecializedDashboard: async (dashboardType) => {
    try {
      const response = await axios.get(
        `${API_URL}/dashboard/${dashboardType}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${dashboardType} dashboard data:`, error);
      throw error;
    }
  }
};

export default dashboardService;