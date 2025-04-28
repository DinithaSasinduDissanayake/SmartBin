import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import PaymentForm from './PaymentForm';
import './SubscriptionPlans.css';

/**
 * SubscribeModal component
 * Provides a modal dialog for subscribing to a plan with payment processing
 */
const SubscribeModal = ({ plan, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  // Format price with currency symbol
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handlePayment = async (paymentMethod) => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      // Create subscription with payment method
      const response = await api.post('/user-subscriptions', {
        planId: plan._id,
        paymentMethodId: paymentMethod.id
      });

      setPaymentSuccess(true);
      
      // Call onSuccess callback with the subscription data
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(response.data);
        }, 1500); // Show success message briefly before closing
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(
        err.response?.data?.message || 
        'There was a problem processing your payment. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Subscribe to {plan.name}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="plan-summary">
          <div className="plan-info">
            <h4>Plan Details</h4>
            <div className="plan-detail-item">
              <span className="label">Price:</span>
              <span className="value">{formatPrice(plan.price)} / {plan.duration.toLowerCase()}</span>
            </div>
            <div className="plan-detail-item">
              <span className="label">Duration:</span>
              <span className="value">{plan.duration}</span>
            </div>
            {plan.description && (
              <div className="plan-description">
                {plan.description}
              </div>
            )}
          </div>
        </div>
        
        <div className="payment-section">
          <h4>Payment Information</h4>
          
          {paymentError && (
            <div className="payment-error">
              <p>{paymentError}</p>
            </div>
          )}
          
          {paymentSuccess ? (
            <div className="payment-success">
              <div className="success-icon">✓</div>
              <h5>Payment Successful!</h5>
              <p>Your subscription has been activated.</p>
            </div>
          ) : (
            <PaymentForm 
              amount={plan.price}
              onPayment={handlePayment}
              isProcessing={isProcessing}
              plan={plan}
            />
          )}
        </div>
        
        <div className="modal-footer">
          <div className="payment-security-note">
            <i className="fas fa-lock"></i> Payments are secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;