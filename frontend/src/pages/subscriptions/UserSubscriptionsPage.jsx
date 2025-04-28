import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userSubscriptionApi from '../../services/userSubscriptionApi';
import CustomerSubscriptionPlans from '../../components/financial/CustomerSubscriptionPlans';
import '../../components/financial/CustomerSubscriptionPlans.css';

/**
 * Page component for users to view and manage their subscriptions
 */
const UserSubscriptionsPage = () => {
  const { user } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch user subscriptions
  const fetchSubscriptions = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await userSubscriptionApi.getUserSubscriptions(user._id);
      
      // Separate active subscription from history
      const activeSubscription = response.data.find(sub => sub.status === 'active');
      const history = response.data.filter(sub => sub.status !== 'active');
      
      setActiveSubscription(activeSubscription || null);
      setSubscriptionHistory(history);
      setError('');
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscription information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Function to toggle auto-renewal for a subscription
  const handleToggleAutoRenew = async (subscriptionId, currentAutoRenewState) => {
    try {
      await userSubscriptionApi.toggleAutoRenew(subscriptionId, !currentAutoRenewState);
      // Refresh subscriptions to show the updated state
      fetchSubscriptions();
      return true;
    } catch (err) {
      console.error('Error toggling auto-renew:', err);
      setError('Failed to update auto-renewal setting. Please try again later.');
      return false;
    }
  };

  // Function to handle subscription cancellation
  const handleCancelSubscription = async (subscriptionId) => {
    // Confirm cancellation
    if (!window.confirm('Are you sure you want to cancel your subscription? This cannot be undone.')) {
      return false;
    }
    
    try {
      await userSubscriptionApi.cancelSubscription(subscriptionId);
      fetchSubscriptions();
      return true;
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription. Please try again later.');
      return false;
    }
  };

  // Load subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="dashboard-content">
      <h2>My Subscriptions</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <p>Loading subscription information...</p>
      ) : (
        <>
          {activeSubscription ? (
            <div className="current-subscription">
              <h3>Current Subscription</h3>
              <div className="subscription-card active">
                <h4>{activeSubscription.subscriptionPlan?.name || 'Active Plan'}</h4>
                <div className="subscription-details">
                  <p><strong>Status:</strong> {activeSubscription.status}</p>
                  <p><strong>Start Date:</strong> {formatDate(activeSubscription.startDate)}</p>
                  <p><strong>Next Billing:</strong> {formatDate(activeSubscription.nextBillingDate)}</p>
                  <p><strong>End Date:</strong> {formatDate(activeSubscription.endDate)}</p>
                  <p><strong>Auto Renew:</strong> {activeSubscription.autoRenew ? 'Yes' : 'No'}</p>
                </div>
                <div className="subscription-actions">
                  <button 
                    className="btn toggle-btn"
                    onClick={() => handleToggleAutoRenew(
                      activeSubscription._id, 
                      activeSubscription.autoRenew
                    )}
                  >
                    {activeSubscription.autoRenew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                  </button>
                  <button 
                    className="btn cancel-btn"
                    onClick={() => handleCancelSubscription(activeSubscription._id)}
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <p>You don't have an active subscription. Choose a plan below to subscribe.</p>
            </div>
          )}

          {subscriptionHistory.length > 0 && (
            <div className="subscription-history">
              <h3>Subscription History</h3>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionHistory.map(sub => (
                    <tr key={sub._id}>
                      <td>{sub.subscriptionPlan?.name || 'Unknown Plan'}</td>
                      <td>{sub.status}</td>
                      <td>{formatDate(sub.startDate)}</td>
                      <td>{formatDate(sub.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <h3>Available Plans</h3>
          <CustomerSubscriptionPlans onSubscriptionUpdate={fetchSubscriptions} />
        </>
      )}
    </div>
  );
};

export default UserSubscriptionsPage;