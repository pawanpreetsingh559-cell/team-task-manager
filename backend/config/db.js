const mongoose = require('mongoose');

const connectDB = async () => {
  // Try Atlas first if URI is provided
  if (process.env.MONGODB_URI) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`⚠️  Atlas unavailable (${error.message.split('\n')[0]})`);
      console.log(`🔄 Falling back to in-memory MongoDB...`);
    }
  }

  // Fallback: embedded in-memory MongoDB (works offline, great for dev/demo)
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB Connected (dev mode): ${conn.connection.host}`);
    console.log(`💡 Data resets on server restart. Set MONGODB_URI in .env for persistence.`);
  } catch (err) {
    console.error(`❌ All DB connections failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
