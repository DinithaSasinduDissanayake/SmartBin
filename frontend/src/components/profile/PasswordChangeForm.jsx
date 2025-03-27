import React, { useState } from 'react';
import './ProfileForms.css';

const PasswordChangeForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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
    
    // Validate passwords
    if (!formData.currentPassword) {
      setFormError('Current password is required');
      return;
    }
    
    if (!formData.newPassword) {
      setFormError('New password is required');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }
    
    // Submit the form
    const result = await onSubmit(formData);
    
    if (result.success) {
      setFormSuccess(result.message);
      // Clear form after successful password change
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="profile-form-container">
      <h3>Change Password</h3>
      
      {formError && <div className="form-error">{formError}</div>}
      {formSuccess && <div className="form-success">{formSuccess}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input 
            type="password" 
            id="currentPassword" 
            name="currentPassword" 
            value={formData.currentPassword} 
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input 
            type="password" 
            id="newPassword" 
            name="newPassword" 
            value={formData.newPassword} 
            onChange={handleChange}
            disabled={loading}
          />
          <small>Must be at least 8 characters</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="profile-form-button"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordChangeForm;