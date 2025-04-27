import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    token: null,
    user: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios default authorization header when token changes
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

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
          setAuthState({
            isAuthenticated: true,
            token,
            user: response.data
          });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('token');
        setAuthState({
          isAuthenticated: false,
          token: null,
          user: null
        });
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
      
      // Save token and update state
      localStorage.setItem('token', response.data.token);
      setAuthState({
        isAuthenticated: true,
        token: response.data.token,
        user: {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          mfaEnabled: response.data.mfaEnabled || false
        }
      });
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
      
      // Check if MFA is required
      if (response.data.mfaRequired) {
        // Return data for MFA verification (don't update auth state yet)
        return {
          mfaRequired: true,
          userId: response.data.userId
        };
      }
      
      // Regular login (no MFA)
      localStorage.setItem('token', response.data.token);
      setAuthState({
        isAuthenticated: true,
        token: response.data.token,
        user: {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          mfaEnabled: response.data.mfaEnabled || false
        }
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null
    });
    // Clear authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Get user data from token
  const user = authState.user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      isAuthenticated: authState.isAuthenticated,
      register, 
      login, 
      logout,
      setAuthState // Expose for MFA flow
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;