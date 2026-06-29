const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Used'],
    default: 'Pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  resendCount: {
    type: Number,
    default: 0
  },
  ipAddress: String,
  userAgent: String
});

module.exports = mongoose.model('Otp', OtpSchema);
