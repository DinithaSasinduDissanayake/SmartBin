import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SubscriptionPlans.css';
import SubscribeModal from './SubscribeModal';
import api from '../../services/api';

/**
 * CustomerSubscriptionPlans component
 * Displays available subscription plans and allows customers to subscribe
 */
const CustomerSubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Fetch subscription plans and user's current subscription
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get all active plans
      const plansResponse = await api.get('/subscription-plans?status=active');
      setPlans(plansResponse.data || []);
      
      // Get user's current subscription if logged in
      if (user?._id) {
        const userSubscriptionResponse = await api.get(`/user-subscriptions/my-subscription`);
        setUserSubscription(userSubscriptionResponse.data || null);
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err.response?.data?.message || 'Failed to load subscription data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open subscription modal with the selected plan
  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowSubscribeModal(true);
  };

  // Handle subscription success
  const handleSubscriptionSuccess = (subscription) => {
    setShowSubscribeModal(false);
    setSuccess(`Successfully subscribed to ${subscription.plan?.name || 'the plan'}!`);
    
    // Refresh data to show updated subscription
    fetchData();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Check if a plan is the user's current plan
  const isCurrentPlan = (planId) => {
    return userSubscription?.plan?._id === planId || userSubscription?.subscriptionPlan?._id === planId;
  };

  // Format date to a user-friendly string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get time remaining on current subscription
  const getTimeRemaining = () => {
    if (!userSubscription?.endDate) return null;
    
    const endDate = new Date(userSubscription.endDate);
    const now = new Date();
    
    if (endDate <= now) return 'Expired';
    
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
  };

  return (
    <div className="customer-subscription-container">
      <h2>Subscription Plans</h2>
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => fetchData()}>Try Again</button>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="success-message">
          <p>{success}</p>
          <button className="message-close" onClick={() => setSuccess('')} aria-label="Close">
            &times;
          </button>
        </div>
      )}
      
      {/* Current Subscription */}
      {userSubscription && (
        <div className="current-subscription">
          <h3>Your Current Subscription</h3>
          <div className="subscription-details">
            <div className="subscription-item">
              <span className="label">Plan:</span>
              <span className="value">{userSubscription.plan?.name || userSubscription.subscriptionPlan?.name || 'Unknown Plan'}</span>
            </div>
            <div className="subscription-item">
              <span className="label">Price:</span>
              <span className="value">
                {formatPrice(userSubscription.plan?.price || userSubscription.subscriptionPlan?.price)} / {userSubscription.plan?.duration?.toLowerCase() || userSubscription.subscriptionPlan?.duration?.toLowerCase() || 'month'}
              </span>
            </div>
            <div className="subscription-item">
              <span className="label">Start Date:</span>
              <span className="value">{formatDate(userSubscription.startDate)}</span>
            </div>
            <div className="subscription-item">
              <span className="label">End Date:</span>
              <span className="value">{formatDate(userSubscription.endDate)}</span>
            </div>
            <div className="subscription-item highlight">
              <span className="label">Time Remaining:</span>
              <span className="value">{getTimeRemaining()}</span>
            </div>
            <div className="subscription-item">
              <span className="label">Status:</span>
              <span className={`value status-${userSubscription.status?.toLowerCase() || 'inactive'}`}>
                {userSubscription.status ? (userSubscription.status.charAt(0).toUpperCase() + userSubscription.status.slice(1)) : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Available Plans */}
      <div className="available-plans">
        <h3>Available Plans</h3>
        {loading ? (
          <div className="loading-indicator">Loading subscription plans...</div>
        ) : plans.length === 0 ? (
          <div className="no-plans-message">No subscription plans are currently available.</div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan._id} 
                className={`plan-card ${isCurrentPlan(plan._id) ? 'current-plan' : ''}`}
              >
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  {isCurrentPlan(plan._id) && <span className="current-badge">Current Plan</span>}
                </div>
                <div className="plan-price">
                  <span className="amount">{formatPrice(plan.price)}</span>
                  <span className="period">/ {plan.duration.toLowerCase()}</span>
                </div>
                <div className="plan-description">
                  {plan.description || 'No description available.'}
                </div>
                {plan.features && plan.features.length > 0 && (
                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                )}
                <button 
                  className="btn subscribe-btn" 
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan(plan._id)}
                >
                  {isCurrentPlan(plan._id) ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Subscribe Modal */}
      {showSubscribeModal && selectedPlan && (
        <SubscribeModal 
          plan={selectedPlan} 
          onClose={() => setShowSubscribeModal(false)} 
          onSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
};

export default CustomerSubscriptionPlans;