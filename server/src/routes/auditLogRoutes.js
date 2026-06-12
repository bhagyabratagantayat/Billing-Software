const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect, requireRole } = require('../middleware/authMiddleware');

router.use(protect);
router.use(requireRole('ceo')); // Only CEO can view audit logs

router.get('/', getAuditLogs);

module.exports = router;
