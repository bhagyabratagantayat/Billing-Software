const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);

module.exports = router;
