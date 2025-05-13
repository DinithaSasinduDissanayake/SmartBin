// backend/src/middleware/validationErrorHandler.js
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../errors'); // Import custom error

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract specific error messages
    const errorMessages = errors.array().map(err => err.msg);
    // Throw a BadRequestError with the validation messages
    throw new BadRequestError('Validation failed', errorMessages);
  }
  next();
};

module.exports = { handleValidationErrors };
