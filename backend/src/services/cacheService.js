/**
 * Redis Caching Service
 * 
 * This service provides centralized Redis caching functionality for the SmartBin application.
 * It handles common caching operations with error handling and fallbacks.
 */

const Redis = require('ioredis');
let redisClient = null;

// Default TTL (time to live) values in seconds
const DEFAULT_TTL = {
  DASHBOARD: 1800,      // 30 minutes for dashboard data
  USER: 900,            // 15 minutes for user data
  SUBSCRIPTION: 3600,   // 1 hour for subscription plans
  REPORTS: 3600,        // 1 hour for financial reports
  SHORT: 60,            // 1 minute for short-lived data
  STANDARD: 600,        // 10 minutes standard TTL
};

/**
 * Initialize Redis connection
 */
const initialize = () => {
  try {
    // Check if Redis URL is provided
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log('Redis URL not found. Caching will be disabled.');
      return false;
    }

    // Create Redis client with options
    redisClient = new Redis(redisUrl, {
      connectTimeout: 10000,    // 10 seconds connection timeout
      maxRetriesPerRequest: 3,  // Retry connection 3 times
      enableReadyCheck: true,
      retryStrategy: (times) => {
        // Backoff strategy: 200ms, 1s, 3s, 7s, etc.
        return Math.min(times * 200, 5000);
      },
    });

    // Set up event handlers
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting');
    });

    return true;
  } catch (error) {
    console.error('Error initializing Redis client:', error);
    return false;
  }
};

/**
 * Check if Redis is connected and available
 * @returns {boolean} - True if Redis is available, false otherwise
 */
const isAvailable = () => {
  return redisClient && redisClient.status === 'ready';
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value (parsed from JSON) or null if not found
 */
const getCache = async (key) => {
  if (!isAvailable()) return null;
  
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    
    // Parse the cached JSON value
    try {
      return JSON.parse(value);
    } catch (parseError) {
      console.error(`Error parsing cached value for key ${key}:`, parseError);
      return value; // Return raw value if parsing fails
    }
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be stringified to JSON)
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const setCache = async (key, value, ttl = DEFAULT_TTL.STANDARD) => {
  if (!isAvailable()) return false;
  
  try {
    // Stringify the value to JSON
    const stringValue = JSON.stringify(value);
    
    // Set with expiry
    await redisClient.set(key, stringValue, 'EX', ttl);
    return true;
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const deleteCache = async (key) => {
  if (!isAvailable()) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
    return false;
  }
};

/**
 * Delete cache keys by pattern
 * @param {string} pattern - Pattern to match (e.g. 'user:*')
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const deleteCacheByPattern = async (pattern) => {
  if (!isAvailable()) return false;
  
  try {
    // SCAN is more production-friendly than KEYS for large datasets
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== '0');
    
    return true;
  } catch (error) {
    console.error(`Error deleting cache by pattern ${pattern}:`, error);
    return false;
  }
};

/**
 * Cache middleware - wraps controller methods with caching
 * @param {string} key - Cache key or key prefix
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware
 */
const cacheMiddleware = (keyGenerator, ttl = DEFAULT_TTL.STANDARD) => {
  return async (req, res, next) => {
    if (!isAvailable()) {
      return next(); // Skip caching if Redis is unavailable
    }
    
    // Generate cache key using the provided function or use default
    const key = typeof keyGenerator === 'function' 
      ? keyGenerator(req) 
      : `${keyGenerator}:${req.originalUrl}`;
    
    try {
      // Try to get from cache
      const cachedData = await getCache(key);
      
      if (cachedData) {
        console.log(`Serving from cache: ${key}`);
        return res.json(cachedData);
      }
      
      // Cache miss - store original res.json to intercept response
      const originalJson = res.json;
      res.json = function(data) {
        // Restore original function
        res.json = originalJson;
        
        // Cache the response data
        setCache(key, data, ttl).catch(err => {
          console.error(`Error caching response for ${key}:`, err);
        });
        
        // Call the original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error(`Cache middleware error for ${key}:`, error);
      next();
    }
  };
};

/**
 * Get hash map cache
 * @param {string} key - Hash key
 * @returns {Promise<object>} - Hash map as object or empty object if not found
 */
const getHashCache = async (key) => {
  if (!isAvailable()) return {};
  
  try {
    const hash = await redisClient.hgetall(key);
    return hash || {};
  } catch (error) {
    console.error(`Error getting hash cache for key ${key}:`, error);
    return {};
  }
};

/**
 * Set hash map cache
 * @param {string} key - Hash key
 * @param {object} hash - Hash map object
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const setHashCache = async (key, hash, ttl = DEFAULT_TTL.STANDARD) => {
  if (!isAvailable() || !hash || typeof hash !== 'object') return false;
  
  try {
    // Use pipeline for better performance with multiple operations
    const pipeline = redisClient.pipeline();
    
    // Delete existing hash if it exists
    pipeline.del(key);
    
    // Add all hash fields
    for (const [field, value] of Object.entries(hash)) {
      pipeline.hset(key, field, typeof value === 'object' ? JSON.stringify(value) : value);
    }
    
    // Set expiry
    pipeline.expire(key, ttl);
    
    // Execute pipeline
    await pipeline.exec();
    return true;
  } catch (error) {
    console.error(`Error setting hash cache for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all cache
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const clearAllCache = async () => {
  if (!isAvailable()) return false;
  
  try {
    await redisClient.flushdb();
    console.log('Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Initialize Redis when this module is imported
initialize();

module.exports = {
  initialize,
  isAvailable,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  cacheMiddleware,
  getHashCache,
  setHashCache,
  clearAllCache,
  DEFAULT_TTL
};