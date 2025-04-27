import React, { useState, useEffect } from 'react';
import './ProfileForms.css';

const ProfileForm = ({ profileData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Sri Lanka'
    },
    preferences: {
      pickupNotes: ''
    },
    skills: [],
    availability: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: {
          street: profileData.address?.street || '',
          city: profileData.address?.city || '',
          postalCode: profileData.address?.postalCode || '',
          country: profileData.address?.country || 'Sri Lanka'
        },
        preferences: {
          pickupNotes: profileData.preferences?.pickupNotes || ''
        },
        skills: profileData.skills || [],
        availability: profileData.availability || ''
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (address, preferences)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear messages when form is being edited
    setFormError('');
    setFormSuccess('');
  };

  // Handle skills (add/remove)
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    // Don't add duplicate skills
    if (formData.skills.includes(newSkill.trim())) {
      setFormError('This skill is already in your list');
      return;
    }
    
    setFormData({
      ...formData,
      skills: [...formData.skills, newSkill.trim()]
    });
    setNewSkill('');
    setFormError('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSkillKeyPress = (e) => {
    // Add skill when Enter is pressed
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
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
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Phone validation (if provided)
    if (formData.phone) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phone)) {
        setFormError('Please enter a valid phone number');
        return;
      }
    }
    
    // Submit the form
    const result = await onSubmit(formData);
    
    if (result.success) {
      setFormSuccess(result.message);
    } else {
      setFormError(result.message);
    }
  };

  // Check if user is staff to show staff-specific fields
  const isStaff = profileData?.role === 'staff';

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
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange}
            disabled={loading}
            placeholder="+94XXXXXXXXX"
          />
          <small>Enter phone number with country code (e.g., +94XXXXXXXX)</small>
        </div>
        
        <h4>Address Information</h4>
        
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
          <label htmlFor="address.postalCode">Postal Code</label>
          <input 
            type="text" 
            id="address.postalCode" 
            name="address.postalCode" 
            value={formData.address.postalCode} 
            onChange={handleChange}
            disabled={loading}
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
          />
        </div>
        
        {/* Show preferences section for customers */}
        {profileData?.role === 'customer' && (
          <>
            <h4>Preferences</h4>
            
            <div className="form-group">
              <label htmlFor="preferences.pickupNotes">Pickup Notes</label>
              <textarea 
                id="preferences.pickupNotes" 
                name="preferences.pickupNotes" 
                value={formData.preferences.pickupNotes} 
                onChange={handleChange}
                disabled={loading}
                rows="3"
                placeholder="Special instructions for waste pickup"
              ></textarea>
              <small>Special instructions or notes for waste collection (max 500 characters)</small>
            </div>
          </>
        )}
        
        {/* Show skills and availability for staff */}
        {isStaff && (
          <>
            <h4>Staff Information</h4>
            
            <div className="form-group">
              <label htmlFor="skills">Skills</label>
              <div className="skills-container">
                <div className="skills-input">
                  <input 
                    type="text" 
                    id="newSkill" 
                    value={newSkill} 
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    disabled={loading}
                    placeholder="Add a skill"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddSkill}
                    disabled={loading || !newSkill.trim()}
                  >
                    Add
                  </button>
                </div>
                
                <div className="skills-list">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="availability">Availability</label>
              <input 
                type="text" 
                id="availability" 
                name="availability" 
                value={formData.availability} 
                onChange={handleChange}
                disabled={loading}
                placeholder="E.g., Mon-Fri 9-5, Weekends Only"
              />
              <small>Enter your general availability pattern (days/hours)</small>
            </div>
          </>
        )}
        
        <div className="form-group">
          <label>Account Type</label>
          <input 
            type="text" 
            value={profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'User'} 
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