module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'], // Run the setup file
  testTimeout: 30000, // Increase timeout for DB operations if needed
};
