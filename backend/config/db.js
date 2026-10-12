const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
      console.log('MongoDB connected:', uri);
      return;
    } catch (err) {
      console.warn('Could not connect to MONGO_URI:', err.message);
      if (process.env.REQUIRE_MONGO === 'true') {
        throw err;
      }
    }
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  const memUri = mem.getUri();
  await mongoose.connect(memUri);
  console.log('Using in-memory MongoDB (data resets when the server stops). Set MONGO_URI to use a real database.');
}

module.exports = connectDB;
