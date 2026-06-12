const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InvalidatedToken = require('../models/InvalidatedToken');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Check if token is blacklisted
      const blacklisted = await InvalidatedToken.findOne({ token });
      if (blacklisted) {
        return res.status(401).json({ message: 'Not authorized, token invalidated' });
      }

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized, user inactive or not found' });
      }

      // If user must change password, restrict access unless it's the change password route
      if (req.user.mustChangePassword && req.originalUrl !== '/api/auth/change-password') {
        return res.status(403).json({ message: 'Must change password before accessing this resource' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this role' });
    }
    next();
  };
};

module.exports = { protect, requireRole };
