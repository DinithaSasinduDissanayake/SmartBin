import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userApi from '../../services/userApi';
import './ProfileComponents.css';

const ProfileForm = ({ initialData, onProfileUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferences: [],
    skills: [],
    availability: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isStaff = user?.role === 'staff';
  const isCustomer = user?.role === 'customer';

  // Initialize form with user data when available
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          zipCode: initialData.address?.zipCode || ''
        },
        preferences: initialData.preferences || [],
        skills: initialData.skills || [],
        availability: initialData.availability || ''
      });
    }
  }, [initialData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (address)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      // Handle preferences checkboxes
      setFormData(prev => {
        const updatedPreferences = checked
          ? [...prev.preferences, value]
          : prev.preferences.filter(pref => pref !== value);
        
        return { ...prev, preferences: updatedPreferences };
      });
    } else {
      // Handle normal fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message on any change
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Add a new skill
  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // Don't add duplicates
    if (formData.skills.includes(newSkill.trim())) {
      setErrors(prev => ({ 
        ...prev, 
        skills: 'This skill has already been added.' 
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()]
    }));
    setNewSkill('');
    setErrors(prev => ({ ...prev, skills: '' }));
  };

  // Remove a skill
  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[-()\s]/g, ''))) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await userApi.updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {errors.general && (
        <div className="error-message">{errors.general}</div>
      )}
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <div className="form-section">
        <h3>Personal Information</h3>
        
        <div className="form-group">
          <label htmlFor="name">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            placeholder="e.g. +1 (123) 456-7890"
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
        
        <div className="form-group readonly-field">
          <label htmlFor="accountType">Account Type</label>
          <input
            type="text"
            id="accountType"
            value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
            disabled
          />
        </div>
        
        <div className="form-group readonly-field">
          <label htmlFor="memberSince">Member Since</label>
          <input
            type="text"
            id="memberSince"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            disabled
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Address Information</h3>
        
        <div className="address-fields">
          <div className="form-group">
            <label htmlFor="address.street">Street Address</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address.state">State/Province</label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address.zipCode">Zip/Postal Code</label>
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>
      
      {/* Staff-specific fields */}
      {isStaff && (
        <div className="form-section">
          <h3>Professional Information</h3>
          
          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <div className="skills-input-group">
              <input
                type="text"
                id="skills"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. Waste Management, Driving)"
                disabled={loading}
              />
              <button
                type="button"
                className="btn-add-skill"
                onClick={addSkill}
                disabled={!newSkill.trim() || loading}
              >
                Add
              </button>
            </div>
            {errors.skills && <div className="error-message">{errors.skills}</div>}
            
            <div className="skills-list">
              {formData.skills.map(skill => (
                <span className="skill-tag" key={skill}>
                  {skill}
                  <button
                    type="button"
                    className="btn-remove-skill"
                    onClick={() => removeSkill(skill)}
                    disabled={loading}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select availability</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Weekends">Weekends only</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Customer-specific fields */}
      {isCustomer && (
        <div className="form-section">
          <h3>Preferences</h3>
          
          <div className="preference-checkboxes">
            <div className="preference-item">
              <input
                type="checkbox"
                id="pref-email-notifications"
                name="preferences"
                value="email-notifications"
                checked={formData.preferences.includes('email-notifications')}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="pref-email-notifications">Email Notifications</label>
            </div>
            
            <div className="preference-item">
              <input
                type="checkbox"
                id="pref-sms-notifications"
                name="preferences"
                value="sms-notifications"
                checked={formData.preferences.includes('sms-notifications')}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="pref-sms-notifications">SMS Notifications</label>
            </div>
            
            <div className="preference-item">
              <input
                type="checkbox"
                id="pref-weekly-reports"
                name="preferences"
                value="weekly-reports"
                checked={formData.preferences.includes('weekly-reports')}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="pref-weekly-reports">Weekly Reports</label>
            </div>
            
            <div className="preference-item">
              <input
                type="checkbox"
                id="pref-auto-scheduling"
                name="preferences"
                value="auto-scheduling"
                checked={formData.preferences.includes('auto-scheduling')}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="pref-auto-scheduling">Auto-Scheduling</label>
            </div>
          </div>
        </div>
      )}
      
      <div className="form-actions">
        <button
          type="submit"
          className="btn primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;