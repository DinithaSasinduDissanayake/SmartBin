// src/errors/BadRequestError.js
const ApiError = require('./ApiError');
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}
module.exports = BadRequestError;
