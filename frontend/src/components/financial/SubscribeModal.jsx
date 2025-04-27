import React, { useState, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import StripeContainer from './StripeContainer';
import './SubscribeModal.css';

/**
 * Modal component for subscribing to a plan
 * Displays plan details and payment form
 */
const SubscribeModal = ({ plan, isOpen, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // If modal is not open, don't render anything
  if (!isOpen || !plan) return null;
  
  // Handle payment success
  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentComplete(true);
    if (onSuccess) {
      onSuccess(paymentIntent);
    }
  };
  
  // Handle payment error (just for logging)
  const handlePaymentError = (error) => {
    console.error('Payment processing error:', error);
    // Error is handled and displayed in the PaymentForm component
  };
  
  return (
    <div className="modal-overlay">
      <div className="subscribe-modal">
        <div className="modal-header">
          <h2>Subscribe to {plan.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {paymentComplete ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Subscription Successful!</h3>
              <p>Thank you for subscribing to our {plan.name} plan.</p>
              <button className="btn primary-btn" onClick={onClose}>
                Continue
              </button>
            </div>
          ) : (
            <StripeContainer 
              plan={plan}
              userId={user._id}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </div>
        
        {!paymentComplete && (
          <div className="modal-footer">
            <p className="security-note">
              <i className="fas fa-lock"></i> Your payment information is secure.
            </p>
            <button className="btn cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribeModal;