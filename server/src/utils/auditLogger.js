const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, resourceType, resourceId = null, details = {}) => {
  try {
    if (!req.user) return; // Need a logged in user to audit

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

module.exports = logAudit;
