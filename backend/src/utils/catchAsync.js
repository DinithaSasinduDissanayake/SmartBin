/**
 * Wraps an asynchronous function to catch errors and pass them to the next middleware.
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} - A new function that handles errors.
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // Catches any error and passes it to next()
  };
};

module.exports = catchAsync;
