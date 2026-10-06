const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wellsync', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to local instance: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Local MongoDB service unavailable. Starting embedded MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB Memory Engine] Connected successfully at: ${memoryUri}`);
    } catch (memErr) {
      console.error(`[MongoDB Memory Engine Error]: ${memErr.message}`);
    }
  }
};

module.exports = connectDB;
