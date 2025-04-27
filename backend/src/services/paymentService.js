/**
 * Payment Service - Handles interaction with the payment gateway
 * This service provides an abstraction layer between the application and Stripe
 */
const config = require('../config');
const stripe = require('stripe')(config.stripeSecretKey);

/**
 * Creates a payment intent with Stripe
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Payment amount
 * @param {string} params.currency - Currency code (default: 'usd')
 * @param {string} params.userId - ID of the user making the payment
 * @param {string} params.planId - ID of the subscription plan
 * @param {string} params.userEmail - Email of the user
 * @returns {Object} - Object containing clientSecret and intentId
 */
const createPaymentIntent = async ({ amount, currency = 'usd', userId, planId, userEmail }) => {
    // Convert amount to smallest currency unit (e.g., cents for USD)
    const amountInCents = Math.round(amount * 100);

    try {
        // Find or create a Stripe Customer
        let customer = await findOrCreateStripeCustomer(userEmail, userId);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency,
            customer: customer.id, // Link to Stripe customer
            metadata: { // Store your internal IDs
                userId: userId,
                planId: planId
            },
            // Enable automatic payment methods for flexibility
            automatic_payment_methods: { enabled: true },
        });
        
        return { 
            clientSecret: paymentIntent.client_secret, 
            intentId: paymentIntent.id 
        };
    } catch (error) {
        console.error("Stripe Payment Intent Error:", error);
        throw new Error(`Payment gateway error: ${error.message}`);
    }
};

/**
 * Verifies the signature of a webhook event and constructs the event
 * @param {string} rawBody - Raw request body
 * @param {string} signature - Stripe signature from header
 * @returns {Object} - Constructed Stripe event
 */
const verifyAndConstructEvent = (rawBody, signature) => {
    try {
        const event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            config.stripeWebhookSecret
        );
        return event;
    } catch (err) {
        console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
        throw new Error('Webhook signature verification failed');
    }
};

/**
 * Helper function to find or create a Stripe customer to avoid duplicates
 * @param {string} email - Customer email
 * @param {string} userId - Internal user ID
 * @returns {Object} - Stripe customer object
 */
const findOrCreateStripeCustomer = async (email, userId) => {
    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({ 
        email: email, 
        limit: 1 
    });
    
    if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
    }

    // Create new customer if one doesn't exist
    const newCustomer = await stripe.customers.create({
        email: email,
        metadata: { userId: userId }
    });
    
    return newCustomer;
};

module.exports = { 
    createPaymentIntent, 
    verifyAndConstructEvent 
};