// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import mfaApi from '../../services/mfaApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [mfaData, setMfaData] = useState({
    userId: '',
    token: '',
    recoveryMode: false,
    recoveryCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMfaPrompt, setShowMfaPrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to track password visibility
  const navigate = useNavigate();
  const { login, setAuthState } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'token' || name === 'recoveryCode') {
      setMfaData({ ...mfaData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleRecoveryMode = () => {
    setMfaData({
      ...mfaData,
      recoveryMode: !mfaData.recoveryMode,
      token: '',
      recoveryCode: ''
    });
    setError('');
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle regular login (first step)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic frontend validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData.email, formData.password);
      
      // Check if MFA is required
      if (response.mfaRequired) {
        // Show MFA verification prompt
        setMfaData({ ...mfaData, userId: response.userId });
        setShowMfaPrompt(true);
      } else {
        // Regular login successful
        navigate('/dashboard');
      }
    } catch (err) {
      // Improved error handling
      if (err.response?.data?.errors) {
        // Handle validation errors array from express-validator
        const messages = err.response.data.errors.map(e => e.msg).join(', ');
        setError(`Login failed: ${messages}`);
      } else if (err.response?.data?.message) {
        // Handle specific error message from backend
        setError(err.response.data.message);
      } else if (err.request) {
        // Handle network error
        setError('Network error. Please check connection.');
      } else {
        // Handle other unexpected errors
        setError('An unexpected error occurred during login.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle MFA verification (second step)
  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      
      // Check if user is using recovery code or regular token
      if (mfaData.recoveryMode) {
        if (!mfaData.recoveryCode.trim()) {
          setError('Please enter a recovery code');
          setLoading(false);
          return;
        }
        
        // Verify with recovery code
        response = await mfaApi.useRecoveryCode(mfaData.userId, mfaData.recoveryCode);
      } else {
        if (!mfaData.token.trim()) {
          setError('Please enter the verification code');
          setLoading(false);
          return;
        }
        
        // Verify with token
        response = await mfaApi.verifyMFA(mfaData.userId, mfaData.token);
      }
      
      // Set auth state with response data (includes token)
      setAuthState({
        isAuthenticated: true,
        token: response.data.token,
        user: {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          mfaEnabled: response.data.mfaEnabled
        }
      });
      
      // Navigate to dashboard after successful verification
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to verify MFA code. Please try again.');
      }
      console.error('MFA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset MFA state and go back to login
  const handleCancelMfa = () => {
    setShowMfaPrompt(false);
    setMfaData({
      userId: '',
      token: '',
      recoveryMode: false,
      recoveryCode: ''
    });
  };

  // Show either login form or MFA verification form
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        {!showMfaPrompt ? (
          // Step 1: Regular login form
          <>
            <h2>Login to SmartBin</h2>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group password-input-container">
                <label htmlFor="password">Password</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-button" 
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot your password?</Link>
              </div>
            </form>
          </>
        ) : (
          // Step 2: MFA verification form
          <>
            <h2>Two-Factor Authentication</h2>
            
            {error && <div className="auth-error">{error}</div>}
            
            {mfaData.recoveryMode ? (
              // Recovery code mode
              <form onSubmit={handleMfaVerify}>
                <div className="form-group">
                  <label htmlFor="recoveryCode">Recovery Code</label>
                  <input
                    type="text"
                    id="recoveryCode"
                    name="recoveryCode"
                    value={mfaData.recoveryCode}
                    onChange={handleChange}
                    placeholder="Enter your recovery code"
                    autoComplete="off"
                    autoFocus
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Recovery Code'}
                </button>
              </form>
            ) : (
              // Regular token mode
              <form onSubmit={handleMfaVerify}>
                <div className="form-group">
                  <label htmlFor="token">Verification Code</label>
                  <input
                    type="text"
                    id="token"
                    name="token"
                    value={mfaData.token}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code from your app"
                    autoComplete="off"
                    autoFocus
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            )}
            
            <div className="mfa-options">
              <button 
                type="button" 
                className="mfa-link-button" 
                onClick={toggleRecoveryMode}
              >
                {mfaData.recoveryMode 
                  ? 'Use authenticator app instead' 
                  : 'Use recovery code instead'}
              </button>
              
              <button 
                type="button" 
                className="mfa-link-button" 
                onClick={handleCancelMfa}
              >
                Back to login
              </button>
            </div>
          </>
        )}
        
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;