/**
 * Stripe Payment Demonstration Script
 * 
 * This script demonstrates the full payment flow using the Stripe API
 * It creates a payment intent, simulates a payment, and shows how to handle the response
 * 
 * Usage: node src/scripts/demoStripePayment.js
 */
require('dotenv').config();
const { createPaymentIntent } = require('../services/paymentService');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}========================================================${colors.reset}`);
console.log(`${colors.cyan}              STRIPE PAYMENT DEMONSTRATION              ${colors.reset}`);
console.log(`${colors.blue}========================================================${colors.reset}\n`);

console.log(`${colors.yellow}[1] Payment Flow Initiated${colors.reset}`);
console.log(`    • Creating demo customer and plan data\n`);

// Demo user data
const demoUser = {
  id: 'demo-user-123',
  email: 'demo@smartbin.example.com',
  name: 'Demo User'
};

// Demo subscription plan
const demoPlan = {
  id: 'plan-standard-123',
  name: 'Standard Plan',
  price: 79.99
};

// Run the payment demonstration
async function runDemonstration() {
  try {
    console.log(`${colors.yellow}[2] Backend Payment Process${colors.reset}`);
    console.log(`    • Creating payment intent for ${colors.green}$${demoPlan.price}${colors.reset}`);
    console.log(`    • User ID: ${demoUser.id}`);
    console.log(`    • Plan: ${demoPlan.name} (${demoPlan.id})\n`);

    // Create a payment intent via the paymentService
    const paymentIntent = await createPaymentIntent({
      amount: demoPlan.price,
      userId: demoUser.id,
      planId: demoPlan.id,
      userEmail: demoUser.email
    });

    console.log(`${colors.green}[3] Payment Intent Created Successfully${colors.reset}`);
    console.log(`    • Payment Intent ID: ${paymentIntent.intentId}`);
    console.log(`    • Client Secret: ${paymentIntent.clientSecret.substring(0, 20)}...`);
    
    console.log(`\n${colors.yellow}[4] Frontend Payment Flow${colors.reset}`);
    console.log(`    • In a real application, the frontend would now use this client secret`);
    console.log(`    • The Stripe.js library would handle card details securely`);
    console.log(`    • Test card number: 4242 4242 4242 4242`);
    
    console.log(`\n${colors.yellow}[5] Payment Confirmation${colors.reset}`);
    console.log(`    • After payment confirmation, Stripe would send a webhook`);
    console.log(`    • Backend would verify the webhook signature`);
    console.log(`    • Update subscription status based on payment result`);
    
    console.log(`\n${colors.green}[✓] Payment Flow Complete${colors.reset}`);
    console.log(`    • The payment demonstration has completed successfully`);
    console.log(`    • Your Stripe API keys are configured correctly`);
    
    console.log(`\n${colors.magenta}To see the complete visual payment flow, visit:${colors.reset}`);
    console.log(`http://localhost:5173/payment-demo\n`);
    
  } catch (error) {
    console.error(`${colors.red}[✗] Error in payment demonstration:${colors.reset}`, error.message);
    console.error(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    console.error(`1. Verify that your Stripe API keys are correct in the .env file`);
    console.error(`2. Check that you have installed the Stripe package: npm install stripe`);
    console.error(`3. Ensure your network connection is active\n`);
  }
}

// Execute the demonstration
runDemonstration();