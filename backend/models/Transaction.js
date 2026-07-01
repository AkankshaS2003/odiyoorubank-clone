const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account'
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Deposit', 'Withdrawal', 'Transfer', 'Loan Disbursement', 'EMI Payment', 'Account Deposit', 'Fund Transfer', 'Application Fee', 'Fixed Deposit', 'Recurring Deposit', 'Initial Deposit', 'Membership Application Fee', 'RD Installment', 'RD Maturity Credit', 'Own Account Transfer', 'Internal Fund Transfer', 'NEFT Transfer', 'IMPS Transfer', 'RTGS Transfer'],
    required: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Processing'],
    default: 'Pending'
  },
  referenceNumber: {
    type: String
  },
  senderAccount: {
    type: String
  },
  receiverAccount: {
    type: String
  },
  paymentChannel: {
    type: String,
    enum: ['Internal', 'NEFT', 'IMPS', 'RTGS', 'System'],
    default: 'System'
  },
  charges: {
    type: Number,
    default: 0
  },
  remarks: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
