// src/errors/ForbiddenError.js
const ApiError = require('./ApiError');
class ForbiddenError extends ApiError {
    constructor(message = 'You do not have permission to perform this action') {
        super(403, message);
    }
}
module.exports = ForbiddenError;
