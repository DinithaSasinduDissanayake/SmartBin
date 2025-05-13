// src/errors/UnauthorizedError.js
const ApiError = require('./ApiError');
class UnauthorizedError extends ApiError {
    constructor(message = 'Authentication required') {
        super(401, message);
    }
}
module.exports = UnauthorizedError;
