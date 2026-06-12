require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();

    // Create Admin User
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@ayushtechnologies.in',
      password: 'password123', // Will be hashed by pre-save hook
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();

    console.log('Data Imported successfully');
    console.log('Admin Email: admin@ayushtechnologies.in | Password: password123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
