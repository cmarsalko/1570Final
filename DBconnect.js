const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(uri);

    console.log('MongoDB connected');
    console.log('Connected host:', mongoose.connection.host);
    console.log('Connected DB name:', mongoose.connection.name);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

module.exports = connectDB;