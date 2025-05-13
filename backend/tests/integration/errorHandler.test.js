const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../src/server');
const { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } = require('../../src/errors');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

// Register test routes before running tests
beforeAll(() => {
  // Routes for custom API error tests
  app.get('/test/bad-request', (req, res, next) => {
    next(new BadRequestError('Invalid input data'));
  });

  app.get('/test/validation-error', (req, res, next) => {
    const error = new BadRequestError('Validation Error');
    error.errors = ['Name is required', 'Email is invalid'];
    next(error);
  });

  app.get('/test/unauthorized', (req, res, next) => {
    next(new UnauthorizedError('Authentication required'));
  });

  app.get('/test/not-found', (req, res, next) => {
    next(new NotFoundError('Resource not found'));
  });

  app.get('/test/forbidden', (req, res, next) => {
    next(new ForbiddenError('Permission denied'));
  });

  // Route for Mongoose error
  app.get('/test/cast-error', (req, res, next) => {
    const error = new mongoose.Error.CastError('ObjectId', 'invalid-id', '_id');
    next(error);
  });

  // Routes for JWT errors
  app.get('/test/jwt-error', (req, res, next) => {
    next(new JsonWebTokenError('invalid token'));
  });

  app.get('/test/jwt-expired', (req, res, next) => {
    next(new TokenExpiredError('jwt expired', new Date()));
  });

  // Route for unexpected error
  app.get('/test/unhandled-error', (req, res, next) => {
    next(new Error('Something went wrong'));
  });
});

describe('Error Handler', () => {
  // Test for custom API error handling
  describe('Custom API Errors', () => {
    it('should handle BadRequestError with proper format', async () => {
      const response = await request(app).get('/test/bad-request');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid input data');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle BadRequestError with validation errors array', async () => {
      const response = await request(app).get('/test/validation-error');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation Error');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(['Name is required', 'Email is invalid']);
    });

    it('should handle UnauthorizedError', async () => {
      const response = await request(app).get('/test/unauthorized');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });

    it('should handle NotFoundError', async () => {
      const response = await request(app).get('/test/not-found');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Resource not found');
    });

    it('should handle ForbiddenError', async () => {
      const response = await request(app).get('/test/forbidden');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Permission denied');
    });
  });

  // Test for Mongoose errors
  describe('Mongoose Errors', () => {
    it('should handle Mongoose CastError (e.g., invalid ObjectId)', async () => {
      const response = await request(app).get('/test/cast-error');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid _id');
    });
  });

  // Test for JWT errors
  describe('JWT Errors', () => {
    it('should handle invalid JWT token', async () => {
      const response = await request(app).get('/test/jwt-error');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid authentication token');
    });

    it('should handle expired JWT token', async () => {
      const response = await request(app).get('/test/jwt-expired');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication token has expired');
    });
  });

  // Test for unhandled errors (500)
  describe('Unhandled Errors', () => {
    it('should handle unexpected errors with 500 status', async () => {
      const response = await request(app).get('/test/unhandled-error');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal Server Error');
      // Should not expose error details in response
      expect(response.body).not.toHaveProperty('stack');
    });
  });
});