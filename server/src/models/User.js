const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: encrypt,
      get: decrypt
    },
    password: {
      type: String,
      required: true,
    },
    passwordHistory: [{
      hash: String,
      changedAt: { type: Date, default: Date.now }
    }],
    role: {
      type: String,
      enum: ['ceo', 'admin', 'staff'],
      default: 'staff',
    },
    department: { type: String },
    mobile: {
      type: String,
      set: encrypt,
      get: decrypt
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: true
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    lastLogin: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Update password history
  if (this.passwordHistory.length >= 3) {
    this.passwordHistory.shift(); // Remove oldest
  }
  this.passwordHistory.push({ hash: this.password, changedAt: new Date() });
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
