// frontend/src/services/authService.ts
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthHeader(token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Set the Authorization header for all axios requests
 */
export const setAuthHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store user information in localStorage
 */
export const setUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Get user information from localStorage
 */
export const getUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Remove auth token and user data from localStorage
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

// Initialize auth header on app startup
const token = getAuthToken();
if (token) {
  setAuthHeader(token);
}