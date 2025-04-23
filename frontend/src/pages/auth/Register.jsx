// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const validatePhone = (phone) => {
  const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  return phoneRegex.test(phone);
};

const validateAddress = (address) => {
  return address.trim().length >= 5; 
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
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
    
    if (name === 'email' && value && !validateEmail(value)) {
      setFormError('Please enter a valid email address');
    } else if (name === 'password' && value.length < 8) {
      setFormError('Password must be at least 8 characters long');
    } else if (name === 'phone' && value && !validatePhone(value)) {
      setFormError('Please enter a valid phone number');
    } else if (name === 'address' && value && !validateAddress(value)) {
      setFormError('Address should be at least 5 characters long');
    } else {
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Frontend Validation Checks before API call
    if (!formData.name.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (!validateAddress(formData.address)) {
      setFormError('Please enter a valid address (minimum 5 characters).');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setFormError('Please enter a valid phone number.');
      return;
    }
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      // Improved error handling for backend responses
      if (err.response?.data?.errors) {
        // Handle validation errors array from express-validator
        const messages = err.response.data.errors.map(e => e.msg).join(', ');
        setFormError(`Registration failed: ${messages}`);
      } else if (err.response?.data?.message) {
        // Handle specific error message from backend
        setFormError(err.response.data.message);
      } else if (err.request) {
        // Handle network error
        setFormError('Network error. Please check connection.');
      } else {
        // Handle other unexpected errors
        setFormError('An unexpected error occurred during registration.');
      }
      console.error('Registration error:', err);
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
              onBlur={handleBlur}
              required
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

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-label="Address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-label="Phone Number"
            />
            <small className="form-text text-muted">
              Enter a valid phone number with country code
            </small>
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