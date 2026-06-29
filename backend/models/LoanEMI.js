const mongoose = require('mongoose');

const LoanEMISchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emiNumber: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  principalComponent: {
    type: Number,
    required: true
  },
  interestComponent: {
    type: Number,
    required: true
  },
  emiAmount: {
    type: Number,
    required: true
  },
  outstandingBalance: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  latePenalty: {
    type: Number,
    default: 0
  },
  paidDate: {
    type: Date
  },
  paymentMode: {
    type: String
  },
  transactionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
}, { timestamps: true });

module.exports = mongoose.model('LoanEMI', LoanEMISchema);
