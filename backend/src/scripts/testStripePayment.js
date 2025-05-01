// backend/src/scripts/testStripePayment.js
require('dotenv').config();
const { createPaymentIntent } = require('../services/paymentService');

(async () => {
  try {
    const pi = await createPaymentIntent({
      amount: 0.5, // $0.50
      userId: 'test',
      planId: 'test',
      userEmail: 'a@b.com'
    });
    console.log('Client secret:', pi.clientSecret);
  } catch (err) {
    console.error('Stripe test payment failed:', err);
  }
})();
