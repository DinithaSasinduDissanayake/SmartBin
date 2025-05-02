import React, { useState, useEffect, useCallback } from 'react';
import subscriptionPlansApi from '../../services/subscriptionPlansApi'; // Corrected import
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Added to trigger refreshes

  // Function to clear messages after a delay
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage('');
  }, []);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    let timeoutId;
    if (error || successMessage) {
      timeoutId = setTimeout(clearMessages, 5000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error, successMessage, clearMessages]);

  // Fetch subscription plans
  useEffect(() => {
    fetchPlans();
  }, [refreshTrigger]); // Added refresh trigger dependency

  // Memoize fetchPlans to prevent unnecessary recreation
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionPlansApi.getAll();
      
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      // Make sure we always have an array, even if empty
      if (!Array.isArray(response.data)) {
        console.error('Invalid data format received:', response.data);
        setPlans([]);
        throw new Error('Invalid data format received from server');
      }
      
      setPlans(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch subscription plans. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching plans:', err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Format price with currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Filter plans based on search term and status
  const filteredPlans = plans.filter((plan) => {
    const matchesSearchTerm = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearchTerm && matchesStatus;
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setShowViewDetails(false);
    setShowUpdateForm(false);
    clearMessages();
  };

  const handleViewDetails = (plan) => {
    setCurrentPlan(plan);
    setShowViewDetails(true);
    setShowAddForm(false);
    setShowUpdateForm(false);
    clearMessages();
  };

  const handleUpdate = (plan) => {
    setCurrentPlan(plan);
    setShowUpdateForm(true);
    setShowAddForm(false);
    setShowViewDetails(false);
    clearMessages();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
      clearMessages(); // Clear previous messages
      try {
        await subscriptionPlansApi.delete(id);
        setPlans(plans.filter(plan => plan._id !== id));
        setSuccessMessage('Subscription plan deleted successfully.'); // Set success message
      } catch (err) {
        const errorMsg = err.response?.data?.message || 
                       (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : 
                       'Failed to delete the plan. Please try again.');
        setError(errorMsg);
        console.error('Error deleting plan:', err);
      }
    }
  };

  const handleChangeStatus = async (id, currentStatus) => {
    clearMessages(); // Clear previous messages
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await subscriptionPlansApi.update(id, { status: newStatus });
      
      if (response && response.data) {
        // Update the plans list with the updated plan
        setPlans(plans.map(plan => plan._id === id ? response.data : plan));
        setSuccessMessage(`Plan status changed to ${newStatus} successfully.`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                     (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : 
                     'Failed to change plan status. Please try again.');
      setError(errorMsg);
      console.error('Error changing plan status:', err);
    }
  };

  const handleAddPlan = async (planData) => {
    clearMessages(); // Clear previous messages
    try {
      const response = await subscriptionPlansApi.create(planData);
      
      if (response && response.data) {
        // Add new plan to list or trigger a refresh to get updated data from server
        setRefreshTrigger(prev => prev + 1); // Trigger a refresh
        setShowAddForm(false);
        setSuccessMessage('Subscription plan added successfully.');
        return true;
      }
      return false;
    } catch (err) {
      // Enhanced error handling - extract specific validation errors if available
      let errMsg = 'Failed to add new plan. Please check your inputs and try again.';
      
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // If we have specific field validation errors, format them nicely
        if (typeof err.response.data.errors === 'object') {
          const errorMessages = Object.entries(err.response.data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('; ');
          errMsg = `Validation errors: ${errorMessages}`;
        } else {
          errMsg = err.response.data.errors;
        }
      }
      
      setError(errMsg);
      console.error('Error adding plan:', err);
      return false;
    }
  };

  const handleUpdatePlan = async (planData) => {
    clearMessages(); // Clear previous messages
    try {
      const response = await subscriptionPlansApi.update(planData._id, planData);
      
      if (response && response.data) {
        // Update the plans list or trigger a refresh
        setRefreshTrigger(prev => prev + 1); // Trigger a refresh
        setShowUpdateForm(false);
        setSuccessMessage('Subscription plan updated successfully.');
        return true;
      }
      return false;
    } catch (err) {
      // Enhanced error handling - extract specific validation errors if available
      let errMsg = 'Failed to update the plan. Please check your inputs and try again.';
      
      if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // If we have specific field validation errors, format them nicely
        if (typeof err.response.data.errors === 'object') {
          const errorMessages = Object.entries(err.response.data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('; ');
          errMsg = `Validation errors: ${errorMessages}`;
        } else {
          errMsg = err.response.data.errors;
        }
      }
      
      setError(errMsg);
      console.error('Error updating plan:', err);
      return false;
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1); // Increment to trigger useEffect
  };

  if (loading && plans.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" aria-live="polite"></div>
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h2>Subscription Plans</h2>
        <button 
          className="btn refresh-btn" 
          onClick={handleRefresh} 
          title="Refresh plans list"
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>
      
      {/* Display error or success messages */} 
      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button className="message-close" onClick={clearMessages} aria-label="Close error message">
            &times;
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" role="alert">
          <p>{successMessage}</p>
          <button className="message-close" onClick={clearMessages} aria-label="Close success message">
            &times;
          </button>
        </div>
      )}
      
      {/* Add form, view details, or update form */}
      {showAddForm && (
        <SubscriptionForm 
          onClose={() => setShowAddForm(false)} 
          onSubmit={handleAddPlan}
        />
      )}
      
      {showViewDetails && currentPlan && (
        <PlanDetails 
          plan={currentPlan} 
          onClose={() => setShowViewDetails(false)} 
          onEdit={() => {
            setShowViewDetails(false);
            setShowUpdateForm(true);
          }}
        />
      )}
      
      {showUpdateForm && currentPlan && (
        <SubscriptionForm 
          plan={currentPlan} 
          onClose={() => setShowUpdateForm(false)} 
          onSubmit={handleUpdatePlan}
        />
      )}
      
      {/* Main content */}
      {!showAddForm && !showViewDetails && !showUpdateForm && (
        <>
          <div className="top-bar">
            <div className="search-filter-container">
              <input 
                type="text" 
                className="search-box" 
                placeholder="Search Subscription..." 
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Search subscription plans"
              />
              <select 
                className="status-filter" 
                value={statusFilter} 
                onChange={handleStatusFilterChange}
                aria-label="Filter plans by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button 
              className="btn add-btn" 
              onClick={handleAddNew}
              aria-label="Add new subscription plan"
            >
              + Add New Subscription
            </button>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="no-plans">
              {plans.length === 0 ? (
                <p>No subscription plans found. Add a new plan to get started.</p>
              ) : (
                <p>No plans match the current search criteria. Try adjusting your search or filters.</p>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="subscription-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Subscribers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan._id}>
                      <td>{plan.name || 'Unnamed Plan'}</td>
                      <td>{formatPrice(plan.price)}</td>
                      <td>{plan.duration || 'Monthly'}</td>
                      <td>
                        <span className={`status-badge ${plan.status || 'inactive'}`}>
                          {plan.status ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1) : 'Inactive'}
                        </span>
                      </td>
                      <td>{plan.subscriberCount || 0}</td>
                      <td className="action-buttons">
                        <button 
                          className="btn view-btn" 
                          onClick={() => handleViewDetails(plan)}
                          aria-label={`View details for ${plan.name}`}
                        >
                          View
                        </button>
                        <button 
                          className="btn update-btn" 
                          onClick={() => handleUpdate(plan)}
                          aria-label={`Update ${plan.name}`}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn status-btn" 
                          onClick={() => handleChangeStatus(plan._id, plan.status)}
                          aria-label={`Change status of ${plan.name}`}
                          disabled={loading}
                        >
                          {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn delete-btn" 
                          onClick={() => handleDelete(plan._id)}
                          aria-label={`Delete ${plan.name}`}
                          disabled={loading || (plan.subscriberCount > 0)}
                          title={plan.subscriberCount > 0 ? "Cannot delete plan with active subscribers" : "Delete plan"}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Component for viewing plan details
const PlanDetails = ({ plan, onClose, onEdit }) => {
  // Format price with currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  return (
    <div className="plan-details">
      <h3>Plan Details</h3>
      <div className="detail-row">
        <span className="detail-label">Name:</span>
        <span className="detail-value">{plan.name || 'Unnamed Plan'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Price:</span>
        <span className="detail-value">{formatPrice(plan.price)}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Status:</span>
        <span className={`detail-value status-${plan.status || 'inactive'}`}>
          {plan.status ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1) : 'Inactive'}
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Duration:</span>
        <span className="detail-value">{plan.duration || 'Monthly'}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Subscribers:</span>
        <span className="detail-value">{plan.subscriberCount || 0} active users</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Description:</span>
        <span className="detail-value description">
          {plan.description || 'No description provided.'}
        </span>
      </div>
      {Array.isArray(plan.features) && plan.features.length > 0 && (
        <div className="detail-row">
          <span className="detail-label">Features:</span>
          <ul className="detail-features">
            {plan.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="detail-row">
        <span className="detail-label">Created:</span>
        <span className="detail-value">{formatDate(plan.createdAt)}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Last Updated:</span>
        <span className="detail-value">{formatDate(plan.updatedAt)}</span>
      </div>
      <div className="plan-details-actions">
        {onEdit && (
          <button className="btn edit-btn" onClick={onEdit}>Edit</button>
        )}
        <button className="btn close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// Component for adding/updating subscription plan
const SubscriptionForm = ({ plan, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    _id: plan?._id || '',
    name: plan?.name || '',
    price: plan?.price || '',
    subscriberCount: plan?.subscriberCount || 0,
    description: plan?.description || '',
    duration: plan?.duration || 'Monthly',
    status: plan?.status || 'active',
    features: plan?.features || []
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [newFeature, setNewFeature] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    setFieldErrors({
      ...fieldErrors,
      [name]: ''
    });
    
    if (name === 'price') {
      // Allow only numbers and decimal point in price field
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'subscriberCount') {
      // Allow only non-negative integers
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      // Check for duplicate features
      if (formData.features.includes(newFeature.trim())) {
        setFieldErrors({
          ...fieldErrors,
          features: 'This feature already exists'
        });
        return;
      }
      
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
      // Clear feature error if any
      setFieldErrors({
        ...fieldErrors,
        features: ''
      });
    }
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'Plan name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Plan name must be at least 2 characters';
      isValid = false;
    }
    
    if (!formData.price) {
      errors.price = 'Price is required';
      isValid = false;
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue)) {
        errors.price = 'Price must be a valid number';
        isValid = false;
      } else if (priceValue < 0) {
        errors.price = 'Price cannot be negative';
        isValid = false;
      } else if (priceValue > 9999) {
        errors.price = 'Price cannot exceed $9,999';
        isValid = false;
      }
    }
    
    if (!formData.duration) {
      errors.duration = 'Duration is required';
      isValid = false;
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
      isValid = false;
    }
    
    // Update field errors
    setFieldErrors(errors);
    
    if (!isValid) {
      setFormError('Please correct the errors in the form');
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors
    setFieldErrors({});

    // Frontend Validation
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        subscriberCount: parseInt(formData.subscriberCount, 10) || 0
      };
      
      const success = await onSubmit(dataToSubmit);
      if (success) {
        onClose();
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred. Please try again.');
      console.error("Submission Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="subscription-form">
      <h3>{plan ? 'Update Subscription Plan' : 'Add New Subscription Plan'}</h3>
      
      {formError && (
        <div className="form-error" role="alert">
          <p>{formError}</p>
          <button className="close-button" onClick={() => setFormError('')} aria-label="Close error message">
            &times;
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className={`form-group ${fieldErrors.name ? 'has-error' : ''}`}>
            <label htmlFor="name">Plan Name <span className="required">*</span></label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              maxLength="100"
              required
              disabled={submitting}
              placeholder="e.g. Basic Plan"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && (
              <div className="field-error" id="name-error">{fieldErrors.name}</div>
            )}
          </div>
          
          <div className={`form-group ${fieldErrors.price ? 'has-error' : ''}`}>
            <label htmlFor="price">Price <span className="required">*</span></label>
            <input 
              type="text" 
              id="price" 
              name="price" 
              value={formData.price} 
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder="e.g. 9.99"
              aria-invalid={Boolean(fieldErrors.price)}
              aria-describedby={fieldErrors.price ? 'price-error' : undefined}
            />
            {fieldErrors.price && (
              <div className="field-error" id="price-error">{fieldErrors.price}</div>
            )}
          </div>
          
          <div className={`form-group ${fieldErrors.duration ? 'has-error' : ''}`}>
            <label htmlFor="duration">Duration <span className="required">*</span></label>
            <select 
              id="duration" 
              name="duration" 
              value={formData.duration} 
              onChange={handleChange}
              required
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.duration)}
              aria-describedby={fieldErrors.duration ? 'duration-error' : undefined}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Semi-Annual">Semi-Annual</option>
              <option value="Annual">Annual</option>
            </select>
            {fieldErrors.duration && (
              <div className="field-error" id="duration-error">{fieldErrors.duration}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select 
              id="status" 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className={`form-group ${fieldErrors.description ? 'has-error' : ''}`}>
            <label htmlFor="description">Description</label>
            <textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows="4"
              disabled={submitting}
              placeholder="A detailed description of the subscription plan benefits"
              maxLength="500"
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={fieldErrors.description ? 'description-error' : undefined}
            />
            {fieldErrors.description && (
              <div className="field-error" id="description-error">{fieldErrors.description}</div>
            )}
            <div className="char-count">
              {formData.description.length}/500 characters
            </div>
          </div>
          
          <div className={`form-group ${fieldErrors.features ? 'has-error' : ''}`}>
            <label htmlFor="features">Features</label>
            <div className="feature-input-group">
              <input 
                type="text" 
                id="features" 
                value={newFeature} 
                onChange={(e) => setNewFeature(e.target.value)} 
                onKeyPress={handleKeyPress}
                disabled={submitting}
                placeholder="Add a feature and press Enter or Add"
                aria-invalid={Boolean(fieldErrors.features)}
                aria-describedby={fieldErrors.features ? 'features-error' : undefined}
              />
              <button 
                type="button" 
                className="btn add-feature-btn" 
                onClick={handleAddFeature}
                disabled={!newFeature.trim() || submitting}
              >
                Add
              </button>
            </div>
            {fieldErrors.features && (
              <div className="field-error" id="features-error">{fieldErrors.features}</div>
            )}
            {formData.features.length > 0 && (
              <ul className="feature-list">
                {formData.features.map((feature, index) => (
                  <li key={index}>
                    {feature}
                    <button 
                      type="button" 
                      className="remove-feature-btn"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={submitting}
                      aria-label={`Remove feature: ${feature}`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : (plan ? 'Update Plan' : 'Add Plan')}
          </button>
          <button 
            type="button" 
            className="btn cancel-btn" 
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionPlans;