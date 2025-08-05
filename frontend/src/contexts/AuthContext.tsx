import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { setAuthToken, getAuthToken } from '../services/authService';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}

interface AuthContextType {
  authState: AuthState;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
  updateUser: (newUserData: Partial<User>) => void;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const token = getAuthToken(); // Use consistent token retrieval
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
        setAuthToken(null); // Use consistent token removal
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
  const register = async (userData: any) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      // Save token and update state
      setAuthToken(response.data.token); // Use consistent token storage
      setAuthState({
        isAuthenticated: true,
        token: response.data.token,
        user: {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }
      });
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
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
      setAuthToken(response.data.token); // Use consistent token storage
      setAuthState({
        isAuthenticated: true,
        token: response.data.token,
        user: {
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }
      });
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null); // Use consistent token removal
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null
    });
    // Clear authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user data in context
  const updateUser = (newUserData: Partial<User>) => {
    setAuthState(prevState => ({
      ...prevState,
      user: prevState.user ? {
        ...prevState.user, // Keep existing user data
        ...newUserData     // Overwrite with new data
      } : null
    }));
  };


  // Get user data from token
  const user = authState.user;

  return (
    <AuthContext.Provider value={{ 
      authState,
      user, 
      loading, 
      error, 
      isAuthenticated: authState.isAuthenticated,
      register, 
      login, 
      logout,
      updateUser, // Add updateUser to the context value
      setAuthState // Expose for MFA flow
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;