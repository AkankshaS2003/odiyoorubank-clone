const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    required: true,
    enum: ['Personal Loan', 'Home Loan', 'Education Loan', 'Gold Loan', 'Vehicle Loan']
  },
  amount: {
    type: Number,
    required: true
  },
  tenure: {
    type: Number,
    required: true
  },
  income: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Loan', LoanSchema);
