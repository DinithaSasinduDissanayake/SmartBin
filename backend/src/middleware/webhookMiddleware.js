/**
 * Webhook middleware to preserve raw request body for signature verification
 * Used specifically for payment gateway webhooks (e.g., Stripe)
 * Stripe requires the raw request body to verify webhook signatures
 */

/**
 * Middleware that preserves the raw request body for webhook signature verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const preserveRawBody = (req, res, next) => {
  if (req.originalUrl.includes('/webhook') && req.method === 'POST') {
    // Convert the raw request body to a string
    req.rawBody = '';
    req.setEncoding('utf8');

    req.on('data', (chunk) => {
      req.rawBody += chunk;
    });

    req.on('end', () => {
      try {
        // Parse the raw body into JSON for regular Express processing
        // but keep the raw version for signature verification
        req.body = JSON.parse(req.rawBody);
        next();
      } catch (err) {
        next(err);
      }
    });
  } else {
    // For non-webhook routes, just continue to next middleware
    next();
  }
};

module.exports = { preserveRawBody };