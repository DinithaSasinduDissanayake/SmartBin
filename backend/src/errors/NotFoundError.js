// src/errors/NotFoundError.js
const ApiError = require('./ApiError');
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}
module.exports = NotFoundError;
