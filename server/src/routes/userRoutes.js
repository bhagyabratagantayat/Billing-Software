const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserStatus, resetUserPassword } = require('../controllers/userController');
const { protect, requireRole } = require('../middleware/authMiddleware');
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

router.use(protect);
router.use(requireRole('ceo', 'admin'));

router.route('/')
  .get(getUsers)
  .post(validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ]), createUser);

router.put('/:id/status', updateUserStatus);
router.post('/:id/reset-password', resetUserPassword);

module.exports = router;
