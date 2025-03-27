import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on page load
    const checkUserLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data
          const response = await axios.get('http://localhost:5000/api/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Any other cleanup needed
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;