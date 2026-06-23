const mongoose = require('mongoose');

const SavingsDepositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  savingsAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsAccount',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  amountInWords: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['Personal Savings', 'Salary Deposit', 'Business Savings', 'Education Savings', 'Emergency Fund', 'Other'],
    required: true
  },
  signature: {
    type: String, // Base64 string
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsTransaction'
  },
  paymentRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentRecord'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavingsDeposit', SavingsDepositSchema);
