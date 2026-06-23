const mongoose = require('mongoose');

const SavingsAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Dormant', 'Frozen', 'Closed'],
    default: 'Active'
  },
  lastTransactionDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
SavingsAccountSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  
});

module.exports = mongoose.model('SavingsAccount', SavingsAccountSchema);
