const mongoose = require('mongoose');

const AccountApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  nameAsAadhar: {
    type: String,
    required: true
  },
  addressAsAadhar: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  aadharNumber: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 12
  },
  panNumber: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit'],
    required: true
  },
  aadharDocumentUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  applicantPhotoBase64: {
    type: String
  }
});

module.exports = mongoose.model('AccountApplication', AccountApplicationSchema);
