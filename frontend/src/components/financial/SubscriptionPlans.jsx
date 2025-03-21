import React, { useState, useEffect } from 'react';
import { subscriptionPlansApi } from '../../services/api';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  // Fetch subscription plans
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionPlansApi.getAll();
      setPlans(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch subscription plans. Please try again later.');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter plans based on search term
  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setShowViewDetails(false);
    setShowUpdateForm(false);
  };

  const handleViewDetails = (plan) => {
    setCurrentPlan(plan);
    setShowViewDetails(true);
    setShowAddForm(false);
    setShowUpdateForm(false);
  };

  const handleUpdate = (plan) => {
    setCurrentPlan(plan);
    setShowUpdateForm(true);
    setShowAddForm(false);
    setShowViewDetails(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      try {
        await subscriptionPlansApi.delete(id);
        setPlans(plans.filter(plan => plan._id !== id));
      } catch (err) {
        setError('Failed to delete the plan. Please try again.');
        console.error('Error deleting plan:', err);
      }
    }
  };

  const handleAddPlan = async (planData) => {
    try {
      const response = await subscriptionPlansApi.create(planData);
      setPlans([...plans, response.data]);
      setShowAddForm(false);
      return true;
    } catch (err) {
      setError('Failed to add new plan. Please try again.');
      console.error('Error adding plan:', err);
      return false;
    }
  };

  const handleUpdatePlan = async (planData) => {
    try {
      const response = await subscriptionPlansApi.update(planData._id, planData);
      setPlans(plans.map(p => p._id === planData._id ? response.data : p));
      setShowUpdateForm(false);
      return true;
    } catch (err) {
      setError('Failed to update the plan. Please try again.');
      console.error('Error updating plan:', err);
      return false;
    }
  };

  if (loading) {
    return <div className="loading">Loading subscription plans...</div>;
  }

  return (
    <div className="subscription-container">
      <h2>Subscription Plans</h2>
      
      {error && <div className="error-message">{error}</div>}
      
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
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search Subscription..." 
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn add-btn" onClick={handleAddNew}>+ Add New Subscription</button>
          </div>

          {plans.length === 0 ? (
            <div className="no-plans">No subscription plans found. Add a new plan to get started.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Count of Subscribers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan._id}>
                    <td>{plan.name}</td>
                    <td>{plan.price}</td>
                    <td>{plan.subscriberCount}</td>
                    <td>
                      <button className="btn view-btn" onClick={() => handleViewDetails(plan)}>View More</button>
                      <button className="btn update-btn" onClick={() => handleUpdate(plan)}>Update</button>
                      <button className="btn delete-btn" onClick={() => handleDelete(plan._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

// Component for viewing plan details
const PlanDetails = ({ plan, onClose }) => {
  return (
    <div className="plan-details">
      <h3>Plan Details</h3>
      <div className="detail-row">
        <span className="detail-label">Name:</span>
        <span className="detail-value">{plan.name}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Price:</span>
        <span className="detail-value">{plan.price}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Subscribers:</span>
        <span className="detail-value">{plan.subscriberCount}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Description:</span>
        <span className="detail-value">{plan.description}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Duration:</span>
        <span className="detail-value">{plan.duration}</span>
      </div>
      <button className="btn close-btn" onClick={onClose}>Close</button>
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
    duration: plan?.duration || 'Monthly'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch {
      setFormError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="subscription-form">
      <h3>{plan ? 'Update Subscription Plan' : 'Add New Subscription Plan'}</h3>
      
      {formError && <div className="form-error">{formError}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input 
            type="text" 
            id="price" 
            name="price" 
            value={formData.price} 
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="subscriberCount">Subscribers</label>
          <input 
            type="number" 
            id="subscriberCount" 
            name="subscriberCount" 
            value={formData.subscriberCount} 
            onChange={handleChange}
            required
            min="0"
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            rows="4"
            disabled={submitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration</label>
          <select 
            id="duration" 
            name="duration" 
            value={formData.duration} 
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Semi-Annual">Semi-Annual</option>
            <option value="Annual">Annual</option>
          </select>
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