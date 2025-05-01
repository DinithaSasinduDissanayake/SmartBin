import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import paymentApi from '../../services/paymentApi';
import './PaymentForm.css';

/**
 * Payment form component that integrates with Stripe Elements
 * Allows users to enter credit card information securely
 * Uses Stripe.js to tokenize card details without exposing sensitive data
 */
const PaymentForm = ({ plan, userId, onPaymentSuccess, onPaymentError }) => {
  // Stripe hooks
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  // Component state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Derived state
  const amount = parseFloat(plan.price);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  // Handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Reset states
    setPaymentError(null);
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Initiate payment on our server
      const paymentIntent = await paymentApi.initiatePayment({
        userId,
        planId: plan._id,
        amount,
        currency: 'usd' // Default to USD for now
      });
      
      // 2. Confirm card payment with Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret, 
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: 'SmartBin Customer', // Could be dynamically provided
            },
          },
        }
      );
      
      if (error) {
        // Payment failed
        setPaymentError(error.message);
        if (onPaymentError) onPaymentError(error);
      } else if (confirmedPaymentIntent.status === 'succeeded') {
        // Payment succeeded
        setPaymentSuccess(true);
        if (onPaymentSuccess) onPaymentSuccess(confirmedPaymentIntent);
        
        // Reset the form
        elements.getElement(CardElement).clear();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred while processing your payment.');
      if (onPaymentError) onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Card element styling options
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
  
  return (
    <div className="payment-form-container">
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
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
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
            <div className="payment-error">{paymentError}</div>
          )}
          
          <button 
            className="btn payment-btn" 
            type="submit" 
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ${formattedAmount}`}
          </button>
          
          <div className="payment-security-note">
            <i className="fas fa-lock"></i> Payments are secure and encrypted.
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;