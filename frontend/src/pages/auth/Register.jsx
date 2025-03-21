// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // No role field here as it will be set by the backend
  });
  const [formError, setFormError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'password' && value.length < 8) {
      setFormError('Password must be at least 8 characters long');
    } else {
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Check password length
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setFormError(error.response?.data?.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Create an Account</h2>
        
        {formError && (
          <div className="error-message" aria-live="assertive">{formError}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-label="Full Name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-label="Email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength="8"
              aria-label="Password"
              aria-describedby="passwordHelp"
            />
            <small id="passwordHelp" className="form-text text-muted">Password must be at least 8 characters long and include numbers or symbols for better security.</small>
          </div>
          
          <button type="submit" className="auth-button">Register</button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;