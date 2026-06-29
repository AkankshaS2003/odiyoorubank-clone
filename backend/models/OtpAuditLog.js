const mongoose = require('mongoose');

const OtpAuditLogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['Generated', 'Sent', 'Verified', 'Failed', 'Resent', 'Locked'],
    required: true
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: String
});

module.exports = mongoose.model('OtpAuditLog', OtpAuditLogSchema);
