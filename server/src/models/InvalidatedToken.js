const mongoose = require('mongoose');

const invalidatedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  invalidatedAt: { type: Date, default: Date.now }
});

// TTL index to automatically remove documents after 7 days
invalidatedTokenSchema.index({ invalidatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

const InvalidatedToken = mongoose.model('InvalidatedToken', invalidatedTokenSchema);
module.exports = InvalidatedToken;
