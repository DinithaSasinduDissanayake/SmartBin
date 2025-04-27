const { MongoMemoryServer } = require('mongodb-memory-server');
// Import mongoose instance and server control from the refactored server.js
const { mongooseInstance, closeServer } = require('../src/server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  // Use the imported mongoose instance to connect
  await mongooseInstance.connect(mongoUri);
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongooseInstance.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Use the imported mongoose instance to disconnect
  await mongooseInstance.disconnect();
  await mongoServer.stop();
  // Use the imported closeServer function
  await new Promise(resolve => closeServer(resolve));
});
