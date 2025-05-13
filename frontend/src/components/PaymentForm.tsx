import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your Publishable Key
const stripePromise = loadStripe('pk_test_51RJHaGIhR295TuR3ZYhdqja1o6vKTbAqF3TqZw9pyvAmr8BlepwxHUVYJEfJ51Jxn3RLY47G2vYHU60ri11kGwfo0097X0RvnE'); // Replace with your actual Stripe Publishable Key

interface PaymentFormProps {
    pickupId: string;
    amount: number;
    onSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ pickupId, amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Debug: Log to check if component mounts correctly
    console.log('PaymentForm mounted with pickupId:', pickupId);

    // Fetch Payment Intent from backend
    useEffect(() => {
        const fetchPaymentIntent = async () => {
            try {
                console.log('Fetching payment intent for pickupId:', pickupId);
                const response = await fetch('http://localhost:5000/api/create-payment-intent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ pickupId }),
                });
                const data = await response.json();
                console.log('Payment intent response:', data);
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    setError('Failed to initialize payment. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching payment intent:', err);
                setError('Error connecting to server. Please check your connection.');
            }
        };

        fetchPaymentIntent();
    }, [pickupId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            setError('Payment system not initialized. Please reload the page.');
            return;
        }

        setProcessing(true);
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Card element not found. Please try again.');
            setProcessing(false);
            return;
        }

        console.log('Submitting payment with clientSecret:', clientSecret);
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (stripeError) {
            console.error('Stripe payment error:', stripeError);
            setError(stripeError.message || 'Payment failed. Please try again.');
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('Payment successful:', paymentIntent);
            setError(null);
            setProcessing(false);
            onSuccess();
        } else {
            setError('Payment processing failed. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h3 style={{ textAlign: 'center', color: '#333' }}>Pay Rs. {amount.toFixed(2)}</h3>
            {clientSecret ? (
                <>
                    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '15px' }}>
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#333',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#dc3545',
                                },
                            },
                        }} />
                    </div>
                    {error && <div style={{ color: '#dc3545', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                    <button
                        type="submit"
                        disabled={!stripe || processing}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: processing ? '#ccc' : '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                </>
            ) : (
                <p>Loading payment form...</p>
            )}
        </form>
    );
};

const PaymentWrapper: React.FC<PaymentFormProps> = (props) => (
    <Elements stripe={stripePromise}>
        <PaymentForm {...props} />
    </Elements>
);

export default PaymentWrapper;