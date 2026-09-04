const mongoose = require('mongoose');

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogsphere';

  try {
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`🍃 Connected to MongoDB Database: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Local MongoDB connection warning: ${err.message}`);
    console.warn(`ℹ️ Operating with hybrid Mongoose persistent data layer`);
    return false;
  }
};

module.exports = connectDB;
