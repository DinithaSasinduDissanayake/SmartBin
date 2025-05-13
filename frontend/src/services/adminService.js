import axiosInstance from './api'; // Corrected import path

/**
 * Get all users with pagination and optional filters.
 * @param {object} params - Query parameters (e.g., { page: 1, limit: 10, role: 'customer' })
 * @returns {Promise<object>} - Promise resolving to the API response data (users, pagination info)
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch users');
  }
};

/**
 * Create a new user (Admin only).
 * @param {object} userData - User data (name, email, password, role, etc.)
 * @returns {Promise<object>} - Promise resolving to the newly created user data
 */
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create user');
  }
};

/**
 * Get a specific user by ID (Admin only).
 * @param {string} id - The ID of the user.
 * @returns {Promise<object>} - Promise resolving to the user data.
 */
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch user');
  }
};

/**
 * Update a user by ID (Admin only).
 * @param {string} id - The ID of the user to update.
 * @param {object} userData - The updated user data.
 * @returns {Promise<object>} - Promise resolving to the updated user data.
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update user');
  }
};

/**
 * Delete a user by ID (Admin only).
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<object>} - Promise resolving to the success message.
 */
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data; // Should contain { message: 'User removed successfully' }
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete user');
  }
};
