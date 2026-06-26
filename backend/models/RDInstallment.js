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
  }
}, { timestamps: true });

// Create a compound index to ensure one installment number per RD
RDInstallmentSchema.index({ rdId: 1, installmentNumber: 1 }, { unique: true });

module.exports = mongoose.model('RDInstallment', RDInstallmentSchema);
