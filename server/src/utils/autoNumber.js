const Counter = require('../models/Counter');
const crypto = require('crypto');

const generateNextSequence = async (sequenceName, prefix) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const idStr = `${sequenceName}_${dateStr}`;

  const counter = await Counter.findOneAndUpdate(
    { id: idStr },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  const seqStr = String(counter.seq).padStart(4, '0');
  return `${prefix}-${dateStr}-${seqStr}`;
};

const generateRefNo = () => {
  return 'REF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

module.exports = {
  generateNextSequence,
  generateRefNo
};
