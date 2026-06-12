const express = require('express');
const router = express.Router();
const { loginUser, refreshToken, logoutUser, changePassword, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    res.status(400).json({ errors: errors.array() });
  };
};

router.post('/login', validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]), loginUser);

router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.post('/change-password', protect, validate([
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])/).withMessage('Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/).withMessage('Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/).withMessage('Password must contain at least one number')
    .matches(/(?=.*[@$!%*?&])/).withMessage('Password must contain at least one special character')
]), changePassword);

router.get('/me', protect, getUserProfile);

module.exports = router;
