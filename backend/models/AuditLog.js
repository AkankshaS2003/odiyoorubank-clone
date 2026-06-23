const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Could be null if system action, but usually tied to user or admin
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // If an admin performed the action on a user
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
