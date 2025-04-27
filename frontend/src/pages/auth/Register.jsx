// frontend/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
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
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Sri Lanka'
    }
  });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email' && value && !validateEmail(value)) {
      setFormError('Please enter a valid email address');
    } else if (name === 'password' && value.length < 8) {
      setFormError('Password must be at least 8 characters long');
    } else if (name === 'phone' && value && !validatePhone(value)) {
      setFormError('Please enter a valid phone number (with country code if international)');
    } else if (name === 'address.street' && value.trim().length < 3) {
      setFormError('Street address should be at least 3 characters long');
    } else if (name === 'address.city' && value.trim().length < 2) {
      setFormError('City should be at least 2 characters long');
    } else {
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    // Frontend Validation Checks before API call
    if (!formData.name.trim()) {
      setFormError('Full Name is required');
      setLoading(false);
      return;
    }
    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (!validatePhone(formData.phone)) {
      setFormError('Please enter a valid phone number');
      setLoading(false);
      return;
    }
    if (!formData.address.street.trim()) {
      setFormError('Street address is required');
      setLoading(false);
      return;
    }
    if (!formData.address.city.trim()) {
      setFormError('City is required');
      setLoading(false);
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
        setFormError('Network error. Please check connection');
      } else {
        // Handle other unexpected errors
        setFormError('An unexpected error occurred during registration');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Create an Account</h2>
        
        {formError && (
          <div className="auth-error" aria-live="assertive">{formError}</div>
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
              onBlur={handleBlur}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
              required
              minLength="8"
              aria-label="Password"
              aria-describedby="passwordHelp"
            />
            <small id="passwordHelp" className="form-text text-muted">
              Password must be at least 8 characters long and include numbers or symbols for better security.
            </small>
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
              placeholder="+94XXXXXXXXX"
              disabled={loading}
              required
              aria-label="Phone Number"
            />
            <small className="form-text text-muted">
              Enter a valid phone number with country code
            </small>
          </div>

          <h3 className="address-heading">Address Information</h3>

          <div className="form-group">
            <label htmlFor="address.street">Street Address</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              required
              aria-label="Street Address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.city">City</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              required
              aria-label="City"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.postalCode">Postal Code</label>
            <input
              type="text"
              id="address.postalCode"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              disabled={loading}
              aria-label="Postal Code"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address.country">Country</label>
            <input
              type="text"
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              disabled={loading}
              aria-label="Country"
            />
            <small className="form-text text-muted">
              Default is Sri Lanka. Change if you're in another country.
            </small>
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;