const User = require('../models/User');
const InvalidatedToken = require('../models/InvalidatedToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../utils/encryption');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email: encrypt(email) });

    // Fallback: search all users and decrypt (for legacy data that was randomly encrypted)
    if (!user) {
      const allUsers = await User.find({});
      const found = allUsers.find(u => u.email === email);
      if (!found) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      // If found, update it to use deterministic encryption for future
      found.email = email; // triggers setter
      await found.save();
      user = found;
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(401).json({ message: 'Account locked. Try again later.' });
    }

    if (await user.matchPassword(password)) {
      // Reset failed attempts
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = Date.now();
      await user.save();

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Set HTTP-only cookie for refresh token
      res.cookie('jwt_refresh', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        token: accessToken,
      });
    } else {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 mins
      }
      await user.save();

      let attemptsLeft = Math.max(0, 5 - user.failedLoginAttempts);
      res.status(401).json({ 
        message: user.lockUntil && user.lockUntil > Date.now() 
          ? 'Account locked due to too many failed attempts' 
          : `Invalid email or password. ${attemptsLeft} attempts remaining.`
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.jwt_refresh;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const blacklisted = await InvalidatedToken.findOne({ token });
    if (blacklisted) return res.status(401).json({ message: 'Token invalidated' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) return res.status(401).json({ message: 'User inactive or not found' });

    const accessToken = generateAccessToken(user._id);
    res.json({ token: accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt_refresh;
    if (refreshToken) {
      await InvalidatedToken.create({ token: refreshToken });
      res.clearCookie('jwt_refresh');
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Check history
    for (let hist of user.passwordHistory) {
      if (await bcrypt.compare(newPassword, hist.hash)) {
        return res.status(400).json({ message: 'Cannot reuse the last 3 passwords' });
      }
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  refreshToken,
  logoutUser,
  changePassword,
  getUserProfile,
};
