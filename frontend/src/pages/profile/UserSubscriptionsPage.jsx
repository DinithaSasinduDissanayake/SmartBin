import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserSubscriptionsPage.css';

/**
 * Component for users to view and manage their subscription plans
 */
const UserSubscriptionsPage = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch user subscriptions and available plans on component mount
  useEffect(() => {
    fetchUserSubscriptions();
    fetchAvailablePlans();
  }, []);
  
  // Fetch user's active subscriptions
  const fetchUserSubscriptions = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock data - in a real app this would come from an API
        const mockSubscriptions = [
          {
            _id: 'sub1',
            userId: user._id,
            planId: 'plan2',
            planName: 'Standard',
            status: 'active',
            startDate: '2025-01-15T00:00:00',
            endDate: '2025-05-15T00:00:00',
            nextBillingDate: '2025-05-15T00:00:00',
            amount: 59.99,
            frequency: 'monthly',
            features: [
              'Weekly Waste Collection',
              'Recycling Services',
              'Standard Support',
              'Online Account Management'
            ]
          }
        ];
        setSubscriptions(mockSubscriptions);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load your subscriptions. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch available subscription plans
  const fetchAvailablePlans = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock data - in a real app this would come from an API
        const mockPlans = [
          {
            _id: 'plan1',
            name: 'Basic',
            description: 'Essential waste management services for small households',
            price: 29.99,
            billingFrequency: 'monthly',
            features: [
              'Bi-weekly Waste Collection',
              'Basic Recycling Services',
              'Email Support',
              'Online Account Access'
            ],
            recommended: false
          },
          {
            _id: 'plan2',
            name: 'Standard',
            description: 'Complete waste management solution for households',
            price: 59.99,
            billingFrequency: 'monthly',
            features: [
              'Weekly Waste Collection',
              'Recycling Services',
              'Standard Support',
              'Online Account Management'
            ],
            recommended: true
          },
          {
            _id: 'plan3',
            name: 'Premium',
            description: 'Premium waste management for businesses and large households',
            price: 99.99,
            billingFrequency: 'monthly',
            features: [
              'Twice Weekly Waste Collection',
              'Full Recycling Services',
              'Priority Support',
              'Detailed Analytics',
              'Customized Collection Schedule'
            ],
            recommended: false
          }
        ];
        setAvailablePlans(mockPlans);
      }, 1200);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };
  
  // Handle subscription upgrade/change
  const handleChangePlan = async (planId) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          const selectedPlan = availablePlans.find(plan => plan._id === planId);
          
          if (!selectedPlan) {
            setError('Selected plan not found');
            setLoading(false);
            resolve({ success: false });
            return;
          }
          
          // Create a mock updated subscription
          const updatedSubscription = {
            _id: subscriptions[0]?._id || `sub${Date.now()}`,
            userId: user._id,
            planId: selectedPlan._id,
            planName: selectedPlan.name,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: selectedPlan.price,
            frequency: selectedPlan.billingFrequency,
            features: selectedPlan.features
          };
          
          setSubscriptions([updatedSubscription]);
          setSuccessMessage(`Successfully changed to ${selectedPlan.name} plan!`);
          setLoading(false);
          
          // Auto-hide success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
          
          resolve({ success: true });
        }, 1500);
      });
    } catch (err) {
      console.error('Error changing subscription plan:', err);
      setError('Failed to change your subscription plan. Please try again.');
      setLoading(false);
      return { success: false };
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          const updatedSubscriptions = subscriptions.map(sub => 
            sub._id === subscriptionId 
              ? { ...sub, status: 'cancelled', endDate: new Date().toISOString() } 
              : sub
          );
          
          setSubscriptions(updatedSubscriptions);
          setSuccessMessage('Your subscription has been cancelled.');
          setLoading(false);
          
          // Auto-hide success message after 5 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
          
          resolve({ success: true });
        }, 1000);
      });
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel your subscription. Please try again.');
      setLoading(false);
      return { success: false };
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <h2>My Subscriptions</h2>
      <p>View and manage your SmartBin subscription plans</p>
      
      {error && <div className="subscription-error">{error}</div>}
      {successMessage && <div className="subscription-success">{successMessage}</div>}
      
      {/* Current Subscription Section */}
      <div className="subscription-section">
        <h3>Current Subscription</h3>
        
        {loading ? (
          <p>Loading your subscription details...</p>
        ) : subscriptions.length === 0 ? (
          <div className="no-subscription">
            <p>You don't have any active subscriptions.</p>
            <button 
              className="btn primary"
              onClick={() => window.scrollTo({ top: document.getElementById('available-plans').offsetTop, behavior: 'smooth' })}
            >
              View Available Plans
            </button>
          </div>
        ) : (
          subscriptions.map(subscription => (
            <div key={subscription._id} className="subscription-card">
              <div className="subscription-header">
                <h4>{subscription.planName} Plan</h4>
                <span className={`subscription-status status-${subscription.status}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              
              <div className="subscription-details">
                <div className="detail-row">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value">${subscription.amount} / {subscription.frequency}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">{formatDate(subscription.startDate)}</span>
                </div>
                
                {subscription.status === 'active' && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Next Billing:</span>
                      <span className="detail-value">{formatDate(subscription.nextBillingDate)}</span>
                    </div>
                  </>
                )}
                
                {subscription.status === 'cancelled' && (
                  <div className="detail-row">
                    <span className="detail-label">End Date:</span>
                    <span className="detail-value">{formatDate(subscription.endDate)}</span>
                  </div>
                )}
              </div>
              
              <div className="subscription-features">
                <h5>Features</h5>
                <ul>
                  {subscription.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              {subscription.status === 'active' && (
                <div className="subscription-actions">
                  <button 
                    className="btn secondary"
                    onClick={() => window.scrollTo({ top: document.getElementById('available-plans').offsetTop, behavior: 'smooth' })}
                  >
                    Change Plan
                  </button>
                  <button 
                    className="btn cancel"
                    onClick={() => handleCancelSubscription(subscription._id)}
                    disabled={loading}
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Available Plans Section */}
      <div id="available-plans" className="subscription-section">
        <h3>Available Plans</h3>
        
        {loading && <p>Loading available plans...</p>}
        
        <div className="plans-container">
          {availablePlans.map(plan => {
            // Check if user is currently subscribed to this plan
            const isCurrentPlan = subscriptions.some(sub => 
              sub.planId === plan._id && sub.status === 'active'
            );
            
            return (
              <div 
                key={plan._id} 
                className={`plan-card ${plan.recommended ? 'recommended' : ''} ${isCurrentPlan ? 'current' : ''}`}
              >
                {plan.recommended && <div className="recommended-badge">Recommended</div>}
                {isCurrentPlan && <div className="current-badge">Current Plan</div>}
                
                <h4>{plan.name}</h4>
                <div className="plan-price">
                  <span className="price">${plan.price}</span>
                  <span className="frequency">/ {plan.billingFrequency}</span>
                </div>
                
                <p className="plan-description">{plan.description}</p>
                
                <div className="plan-features">
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  className={`btn ${isCurrentPlan ? 'current-btn' : 'primary'}`}
                  onClick={() => handleChangePlan(plan._id)}
                  disabled={loading || isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionsPage;