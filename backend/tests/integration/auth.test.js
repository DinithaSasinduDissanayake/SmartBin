const request = require('supertest');
const { app } = require('../../src/server'); // Import the exported app
const User = require('../../src/models/User');

describe('Auth API Endpoints', () => {
  const registerUrl = '/api/auth/register';
  const loginUrl = '/api/auth/login';

  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    address: '123 Test St',
    phone: '1234567890'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post(registerUrl)
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('name', userData.name);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('role', 'customer'); // Default role
      expect(res.body.user).not.toHaveProperty('password'); // Ensure password is not returned

      // Verify user was saved in the DB (without password)
      const dbUser = await User.findOne({ email: userData.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.name).toBe(userData.name);
    });

    it('should return 400 if email already exists', async () => {
      // First, register the user
      await request(app).post(registerUrl).send(userData);

      // Then, try to register again with the same email
      const res = await request(app)
        .post(registerUrl)
        .send({ ...userData, name: 'Another User' })
        .expect(400);

      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toMatch(/duplicate field value entered/i);
    });

    it('should return 400 for invalid data (short password)', async () => {
      const res = await request(app)
        .post(registerUrl)
        .send({ ...userData, password: 'short' })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toMatch(/Password must be at least 8 characters/i);
    });

     it('should return 400 for invalid data (invalid email)', async () => {
      const res = await request(app)
        .post(registerUrl)
        .send({ ...userData, email: 'invalid-email' })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toMatch(/Please enter a valid email/i);
    });

    it('should return 400 for missing required fields (e.g., name)', async () => {
      const { name, ...incompleteData } = userData;
      const res = await request(app)
        .post(registerUrl)
        .send(incompleteData)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors[0]).toMatch(/Please Enter Your Name/i);
    });
  });

  describe('POST /api/auth/login', () => {
    // Register user before login tests
    beforeEach(async () => {
      await request(app).post(registerUrl).send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post(loginUrl)
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post(loginUrl)
        .send({ email: userData.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post(loginUrl)
        .send({ email: 'nonexistent@example.com', password: userData.password })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const res = await request(app)
        .post(loginUrl)
        .send({ password: userData.password })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body.errors[0]).toMatch(/Please enter your email/i);
    });

    it('should return 400 for missing password', async () => {
      const res = await request(app)
        .post(loginUrl)
        .send({ email: userData.email })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Validation Error');
      expect(res.body.errors[0]).toMatch(/Please enter your password/i);
    });
  });
});
