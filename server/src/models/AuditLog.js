const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userName: { type: String },
  userRole: { type: String },
  action: { type: String, required: true },
  resourceType: { type: String, enum: ['receipt', 'voucher', 'user', 'auth', 'system'], required: true },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
