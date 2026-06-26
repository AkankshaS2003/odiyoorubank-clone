const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  faceVerificationStatus: {
    type: String,
    enum: ['Pending', 'Face Verified', 'Manual Review Required', 'Failed'],
    default: 'Pending'
  },
  similarityScore: Number,
  aadhaarFaceImage: String,
  selfieImage: String,
  auditTrail: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    details: String
  }],
  idCardUrl: String,
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Membership', MembershipSchema);
