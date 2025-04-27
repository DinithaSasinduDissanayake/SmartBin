// src/errors/BadRequestError.js
const ApiError = require('./ApiError');
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request', errors = null) {
        super(400, message);
        this.errors = errors;
    }
}
module.exports = BadRequestError;
