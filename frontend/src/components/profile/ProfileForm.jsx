import React, { useState, useEffect } from 'react';
import './ProfileForms.css';

const ProfileForm = ({ profileData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || ''
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear messages when form is being edited
    setFormError('');
    setFormSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    // Basic validation
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Submit the form
    const result = await onSubmit(formData);
    
    if (result.success) {
      setFormSuccess(result.message);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="profile-form-container">
      <h3>Edit Profile Information</h3>
      
      {formError && <div className="form-error">{formError}</div>}
      {formSuccess && <div className="form-success">{formSuccess}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label>Account Type</label>
          <input 
            type="text" 
            value={profileData?.role || 'User'} 
            disabled 
            className="read-only"
          />
          <small>Account type cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label>Member Since</label>
          <input 
            type="text" 
            value={profileData?.createdAt 
              ? new Date(profileData.createdAt).toLocaleDateString() 
              : 'N/A'} 
            disabled 
            className="read-only"
          />
        </div>
        
        <button 
          type="submit" 
          className="profile-form-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;