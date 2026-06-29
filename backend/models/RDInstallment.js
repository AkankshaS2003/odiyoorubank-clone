const mongoose = require('mongoose');

const RDInstallmentSchema = new mongoose.Schema({
  rdId: {
    type: mongoose.Schema.ObjectId,
    ref: 'RecurringDeposit',
    required: true
  },
  installmentNumber: {
    type: Number,
    required: true,
    min: 1
  },
  dueDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Overdue'],
    default: 'Pending'
  },
  paidDate: {
    type: Date
  },
  penalty: {
    type: Number,
    default: 0,
    min: 0
  },
  transactionRef: {
    type: mongoose.Schema.ObjectId,
    ref: 'Transaction'
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Transfer from Linked Savings Account', 'UPI', 'Net Banking']
  },
  paymentReference: String,
  receiptNumber: String,
  signatureBase64: String,
  remarks: String,
  ipAddress: String,
  userAgent: String,
  reversed: {
    type: Boolean,
    default: false
  },
  reversedAt: Date,
  reversedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Create a compound index to ensure one installment number per RD
RDInstallmentSchema.index({ rdId: 1, installmentNumber: 1 }, { unique: true });

module.exports = mongoose.model('RDInstallment', RDInstallmentSchema);
