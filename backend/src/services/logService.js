const Log = require('../models/Log');
const ApiError = require('../errors/ApiError');

/**
 * Fetches system logs with pagination and filtering options.
 * @param {object} options - Filtering and pagination options.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.limit=20] - Number of logs per page.
 * @param {string} [options.level] - Filter by log level (info, warn, error, debug).
 * @param {Date} [options.startDate] - Filter logs after this date.
 * @param {Date} [options.endDate] - Filter logs before this date.
 * @returns {Promise<object>} - Promise resolving to paginated logs.
 */
const fetchSystemLogs = async ({ page = 1, limit = 20, level, startDate, endDate }) => {
  try {
    const query = {};
    if (level) {
      query.level = level;
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { timestamp: -1 }, // Sort by newest first
      populate: { path: 'userId', select: 'name email role' }, // Populate user details
    };

    // Use the paginate method provided by mongoose-paginate-v2
    const logs = await Log.paginate(query, options);
    return logs;
  } catch (error) {
    console.error('Error fetching system logs:', error);
    // Let the controller handle sending the error response
    throw new Error('Failed to fetch system logs');
  }
};

/**
 * Adds a new log entry to the database.
 * @param {string} level - Log level (info, warn, error, debug).
 * @param {string} message - Log message.
 * @param {object} [details={}] - Additional details (userId, ipAddress, etc.).
 * @returns {Promise<void>}
 */
const addLogEntry = async (level, message, details = {}) => {
  try {
    const logEntry = new Log({
      level,
      message,
      userId: details.userId,
      ipAddress: details.ipAddress,
      timestamp: new Date(), // Explicitly set timestamp
      // Add other details as needed
    });
    await logEntry.save();
    // Optional: Log to console as well, depending on environment/configuration
    // console.log(`[${level.toUpperCase()}] ${message}`);
  } catch (error) {
    console.error('Failed to add log entry:', error);
    // Decide if this failure should throw an error upwards or just be logged
  }
};


module.exports = {
  fetchSystemLogs,
  addLogEntry,
};
