import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetInfo, setResetInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setResetInfo(null);

    try {
      // Basic validation
      if (!email.trim()) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      // Call the API to request password reset
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      
      setSuccessMessage(response.data.message);
      
      // For development only - store reset info for easy testing
      if (response.data.resetToken) {
        setResetInfo({
          resetUrl: response.data.resetUrl,
          resetToken: response.data.resetToken
        });
      }
      
      // Clear the email input
      setEmail('');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred. Please try again later.');
      }
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Forgot Password</h2>
        
        {error && <div className="auth-error">{error}</div>}
        {successMessage && <div className="auth-success">{successMessage}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Development only - show reset link */}
        {resetInfo && (
          <div className="dev-reset-info">
            <h4>Development Info (Remove in Production)</h4>
            <p>Reset Token: {resetInfo.resetToken}</p>
            <p>Reset URL: <a href={resetInfo.resetUrl} target="_blank" rel="noopener noreferrer">{resetInfo.resetUrl}</a></p>
          </div>
        )}
        
        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 