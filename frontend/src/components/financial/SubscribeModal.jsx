import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import './SubscribeModal.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ plan, userId, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const amount = parseFloat(plan.price);
  const formattedAmount = formatPrice(amount);

  // Card element styling options
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (error) {
        throw new Error(error.message);
      }

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
    <div className="payment-form">
      <h3>Subscribe to {plan.name}</h3>
      <p className="plan-description">{plan.description}</p>
      <div className="plan-price">{formattedAmount} / {plan.duration.toLowerCase()}</div>
      
      {plan.features && plan.features.length > 0 && (
        <ul className="plan-features">
          {plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      )}
      
      {paymentSuccess ? (
        <div className="payment-success">
          <h4>Payment Successful!</h4>
          <p>Your subscription has been activated.</p>
          <button 
            className="btn primary-btn" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="card-element">Credit or Debit Card</label>
            <div className="card-element-container">
              <CardElement id="card-element" options={cardElementOptions} />
            </div>
          </div>
          
          {paymentError && (
            <div className="payment-error">
              <p>{paymentError}</p>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn cancel-btn" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn primary-btn" 
              disabled={isProcessing || !stripe}
            >
              {isProcessing ? 'Processing...' : `Pay ${formattedAmount}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const SubscribeModal = ({ plan, onClose, onSuccess, userId }) => {
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
              <span className="value">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(plan.price)} / {plan.duration.toLowerCase()}</span>
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
          <Elements stripe={stripePromise}>
            <PaymentForm 
              plan={plan} 
              userId={userId} 
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        </div>
        
        <div className="modal-footer">
          <p className="security-note">
            <i className="fa fa-lock"></i> 
            Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;