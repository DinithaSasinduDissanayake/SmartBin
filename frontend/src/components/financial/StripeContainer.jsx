import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

// Load the Stripe.js library with your publishable key
// In production, this should be loaded from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Wrapper component that provides Stripe context to the payment form
 * @param {Object} props - Component props
 * @param {Object} props.plan - Subscription plan details
 * @param {string} props.userId - ID of the user making the payment
 * @param {Function} props.onPaymentSuccess - Callback for successful payment
 * @param {Function} props.onPaymentError - Callback for payment errors
 */
const StripeContainer = ({ plan, userId, onPaymentSuccess, onPaymentError }) => {
  const options = {
    // Passing appearance options to customize Stripe Elements
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3498db',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#e74c3c',
        fontFamily: 'Arial, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm 
        plan={plan}
        userId={userId}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripeContainer;