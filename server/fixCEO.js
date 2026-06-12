require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function fixCEO() {
  await connectDB();
  const ceo = await User.findOne({ email: 'founder@ayushtechnologies.in' }) || await User.findOne({ role: 'ceo' });
  if (ceo) {
    ceo.password = process.env.CEO_PASSWORD;
    ceo.email = process.env.CEO_EMAIL;
    await ceo.save();
    console.log("CEO updated.");
  } else {
    await User.create({
      name: 'Super Admin (CEO)',
      email: process.env.CEO_EMAIL,
      password: process.env.CEO_PASSWORD,
      role: 'ceo',
      mustChangePassword: false,
      isActive: true
    });
    console.log("CEO created.");
  }
  process.exit();
}

fixCEO();
