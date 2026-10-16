import mongoose from 'mongoose';

export let isDatabaseConnected = false;
export let isUsingMemoryDB = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    // If a remote URI (like MongoDB Atlas) is explicitly configured
    try {
      console.log(`📡 Connecting to MongoDB Atlas...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      isDatabaseConnected = true;
      isUsingMemoryDB = false;
      console.log(`✅ MongoDB Connected to Host: ${conn.connection.host} (Database: ${conn.connection.name})`);
      return { connection: conn.connection, isInMemory: false };
    } catch (err) {
      console.warn(`⚠️ Could not connect to remote MongoDB (${err.message}).`);
    }
  } else if (uri) {
    // Try local MongoDB if URI specified
    try {
      console.log(`📡 Checking for local MongoDB service...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 1500,
      });
      isDatabaseConnected = true;
      isUsingMemoryDB = false;
      console.log(`✅ MongoDB Connected to Local Host: ${conn.connection.host}`);
      return { connection: conn.connection, isInMemory: false };
    } catch (err) {
      // Local not running, continue to zero-config fallback
    }
  }

  // Graceful Zero-Config In-Memory Fallback
  isDatabaseConnected = false;
  isUsingMemoryDB = true;
  console.log(`🚀 Zero-Config In-Memory Database active (Data saved locally in backend/data/db.json).`);
  console.log(`💡 To connect to MongoDB Atlas, add your connection string to backend/.env (MONGODB_URI=mongodb+srv://...)`);
  return { connection: null, isInMemory: true };
};

export const closeDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};
