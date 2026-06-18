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
    enum: ['Initial Deposit', 'Fixed Deposit', 'Recurring Deposit', 'Withdrawal', 'Transfer', 'Account Deposit'],
    required: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
