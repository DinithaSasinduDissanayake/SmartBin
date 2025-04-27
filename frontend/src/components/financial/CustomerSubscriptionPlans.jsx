import React, { useState, useEffect, useContext } from 'react';
import subscriptionPlansApi from '../../services/subscriptionPlansApi';
import userSubscriptionApi from '../../services/userSubscriptionApi';
import AuthContext from '../../contexts/AuthContext';
import SubscribeModal from './SubscribeModal';
import './CustomerSubscriptionPlans.css';

/**
 * Customer-facing subscription plans component
 * Displays available plans and allows customers to subscribe
 */
const CustomerSubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  
  // Fetch subscription plans and user's active subscription (if any)
  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all active subscription plans
      const plansResponse = await subscriptionPlansApi.getAll({ status: 'active' });
      setPlans(plansResponse.data);
      
      // Fetch user's current subscription if user is logged in
      if (user && user._id) {
        try {
          const subscriptionsResponse = await userSubscriptionApi.getUserSubscriptions(user._id);
          const activeSubscription = subscriptionsResponse.data.find(sub => sub.status === 'active');
          setUserSubscription(activeSubscription || null);
        } catch (subError) {
          console.error('Error fetching user subscription:', subError);
          // Don't set the main error state here, just log it
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Open subscription modal
  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };
  
  // Handle subscription success
  const handleSubscriptionSuccess = () => {
    // Refetch user subscription data
    fetchData();
  };
  
  // Format price with currency symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  if (loading) {
    return <div className="loading">Loading subscription plans...</div>;
  }
  
  return (
    <div className="customer-subscription-container">
      <h2>Choose a Subscription Plan</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {userSubscription && (
        <div className="current-subscription">
          <h3>Your Current Subscription</h3>
          <div className="subscription-card active">
            <div className="plan-name">
              {userSubscription.subscriptionPlan?.name || 'Active Plan'}
            </div>
            <div className="plan-price">
              {userSubscription.subscriptionPlan?.price 
                ? formatPrice(userSubscription.subscriptionPlan.price)
                : 'N/A'}
            </div>
            <div className="subscription-details">
              <p><strong>Status:</strong> {userSubscription.status}</p>
              <p><strong>Start Date:</strong> {new Date(userSubscription.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(userSubscription.endDate).toLocaleDateString()}</p>
              <p><strong>Auto Renew:</strong> {userSubscription.autoRenew ? 'Yes' : 'No'}</p>
            </div>
            <div className="subscription-actions">
              <button className="btn manage-btn">Manage Subscription</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="available-plans">
        <h3>{userSubscription ? 'Available Plans' : 'Select a Plan'}</h3>
        
        {plans.length === 0 ? (
          <p className="no-plans">No subscription plans available at the moment.</p>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <h4 className="plan-name">{plan.name}</h4>
                  <div className="plan-price">
                    <span className="amount">{formatPrice(plan.price)}</span>
                    <span className="period">/{plan.duration.toLowerCase()}</span>
                  </div>
                </div>
                
                <div className="plan-description">{plan.description}</div>
                
                {plan.features && plan.features.length > 0 && (
                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}
                
                <button 
                  className="btn subscribe-btn"
                  onClick={() => handleSubscribe(plan)}
                  disabled={userSubscription && userSubscription.subscriptionPlan?._id === plan._id}
                >
                  {userSubscription && userSubscription.subscriptionPlan?._id === plan._id
                    ? 'Current Plan'
                    : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Subscription modal */}
      <SubscribeModal 
        plan={selectedPlan}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
};

export default CustomerSubscriptionPlans;