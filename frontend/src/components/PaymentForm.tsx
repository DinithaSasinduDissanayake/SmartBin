import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import '../styles/PaymentForm.css';

// Initialize Stripe with your Publishable Key
const stripePromise = loadStripe('pk_test_51RJHaGIhR295TuR3ZYhdqja1o6vKTbAqF3TqZw9pyvAmr8BlepwxHUVYJEfJ51Jxn3RLY47G2vYHU60ri11kGwfo0097X0RvnE');

interface PaymentFormProps {
    pickupId: string;
    amount: number;
    onSuccess: () => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({ pickupId, amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // Create a checkout session on your backend
            const response = await axios.post('http://localhost:5000/api/create-checkout-session', {
                pickupId: pickupId
            });

            const { url } = response.data;

            // Redirect to Stripe Checkout
            window.location.href = url;
        } catch (err: any) {
            setError(err.message || 'An error occurred during payment processing');
            setProcessing(false);
        }
    };

    return (
        <div className="payment-form-container">
            <h3>Payment Details</h3>
            <p className="payment-amount">Amount: Rs. {amount.toFixed(2)}</p>
            
            {error && <div className="payment-error">{error}</div>}
            <form onSubmit={handleSubmit} className="payment-form">
                    <div className="card-element-container">
                        <CardElement 
                            options={{
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
                            }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!stripe || processing} 
                        className="payment-button"
                    >
                        {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                    <button 
                        type="button" 
                        onClick={onSuccess} 
                        className="payment-cancel-button"
                    >
                        Cancel
                    </button>
                </form>
        </div>
    );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => (
    <Elements stripe={stripePromise}>
        <CheckoutForm {...props} />
    </Elements>
);

export default PaymentForm;