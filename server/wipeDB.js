const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Receipt = require('./src/models/Receipt');
const Voucher = require('./src/models/Voucher');
const InvalidatedToken = require('./src/models/InvalidatedToken');
const AuditLog = require('./src/models/AuditLog');
const Counter = require('./src/models/Counter');

const wipeDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Delete all users except CEO
    const ceoEmail = process.env.CEO_EMAIL;
    const resultUsers = await User.deleteMany({ email: { $ne: ceoEmail } });
    console.log(`Deleted ${resultUsers.deletedCount} staff/admin users.`);

    // Delete all Receipts
    const resultReceipts = await Receipt.deleteMany({});
    console.log(`Deleted ${resultReceipts.deletedCount} receipts.`);

    // Delete all Vouchers
    const resultVouchers = await Voucher.deleteMany({});
    console.log(`Deleted ${resultVouchers.deletedCount} vouchers.`);

    // Delete all Audit Logs
    const resultAuditLogs = await AuditLog.deleteMany({});
    console.log(`Deleted ${resultAuditLogs.deletedCount} audit logs.`);

    // Delete Invalidated Tokens
    const resultTokens = await InvalidatedToken.deleteMany({});
    console.log(`Deleted ${resultTokens.deletedCount} invalidated tokens.`);

    // Reset Counters
    const resultCounters = await Counter.deleteMany({});
    console.log(`Deleted ${resultCounters.deletedCount} counters.`);

    console.log('✅ Database successfully wiped and ready for production.');
  } catch (err) {
    console.error('Error wiping DB:', err);
  } finally {
    mongoose.connection.close();
  }
};

wipeDatabase();
