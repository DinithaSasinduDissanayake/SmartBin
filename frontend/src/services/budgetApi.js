// frontend/src/services/budgetApi.js
import axios from 'axios';
import { getAuthToken } from './authService'; // Assuming authService handles token retrieval

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Adjust if your env variable is different

const budgetApi = axios.create({
    baseURL: `${API_URL}/budgets`,
});

// Add a request interceptor to include the auth token
budgetApi.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Creates a new budget allocation.
 * @param {object} budgetData - The budget data (category, periodType, periodStartDate, periodEndDate, allocatedAmount, notes).
 * @returns {Promise<object>} The created budget object.
 */
export const createBudget = async (budgetData) => {
    try {
        const response = await budgetApi.post('/', budgetData);
        return response.data;
    } catch (error) {
        console.error('Error creating budget:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create budget');
    }
};

/**
 * Fetches budget allocations with optional filtering and pagination.
 * @param {object} params - Query parameters (category, periodType, startDate, endDate, page, limit).
 * @returns {Promise<object>} The response containing budget data (e.g., { docs: [], totalDocs, limit, page, totalPages }).
 */
export const getBudgets = async (params = {}) => {
    try {
        const response = await budgetApi.get('/', { params });
        return response.data; // Assuming backend returns pagination structure
    } catch (error) {
        console.error('Error fetching budgets:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch budgets');
    }
};

/**
 * Fetches a specific budget allocation by its ID.
 * @param {string} id - The ID of the budget.
 * @returns {Promise<object>} The budget object.
 */
export const getBudgetById = async (id) => {
    try {
        const response = await budgetApi.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching budget ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch budget');
    }
};

/**
 * Updates an existing budget allocation.
 * @param {string} id - The ID of the budget to update.
 * @param {object} budgetData - The updated budget data.
 * @returns {Promise<object>} The updated budget object.
 */
export const updateBudget = async (id, budgetData) => {
    try {
        const response = await budgetApi.put(`/${id}`, budgetData);
        return response.data;
    } catch (error) {
        console.error(`Error updating budget ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update budget');
    }
};

/**
 * Deletes a budget allocation.
 * @param {string} id - The ID of the budget to delete.
 * @returns {Promise<object>} The success message.
 */
export const deleteBudget = async (id) => {
    try {
        const response = await budgetApi.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting budget ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete budget');
    }
};

/**
 * Fetches the budget summary (allocated vs. actual) for a given period.
 * @param {string} startDate - The start date (YYYY-MM-DD).
 * @param {string} endDate - The end date (YYYY-MM-DD).
 * @returns {Promise<object>} The summary data (e.g., { summary: [...] }).
 */
export const getBudgetSummary = async (startDate, endDate) => {
    try {
        const response = await budgetApi.get('/summary', {
            params: { startDate, endDate }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching budget summary:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch budget summary');
    }
};
