require('dotenv').config();
const connectDB = require('./src/config/db');
const Counter = require('./src/models/Counter');

async function fixCounter() {
  await connectDB();
  try {
    await Counter.collection.dropIndex('name_1');
    console.log("Dropped name_1 index");
  } catch (err) {
    console.log("Index might not exist or err: ", err.message);
  }
  process.exit();
}

fixCounter();
