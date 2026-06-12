require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const seedCEO = async () => {
  try {
    const ceoExists = await User.findOne({ role: 'ceo' });
    if (!ceoExists) {
      if (!process.env.CEO_EMAIL || !process.env.CEO_PASSWORD) {
        console.warn('⚠️ CEO_EMAIL or CEO_PASSWORD missing in .env. CEO account not created.');
        return;
      }
      await User.create({
        name: 'Super Admin (CEO)',
        email: process.env.CEO_EMAIL,
        password: process.env.CEO_PASSWORD,
        role: 'ceo',
        mustChangePassword: false,
        isActive: true
      });
      console.log('✅ CEO account created successfully.');
    }
  } catch (error) {
    console.error('Error seeding CEO:', error);
  }
};

// Connect to database
connectDB().then(async () => {
  await seedCEO();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
