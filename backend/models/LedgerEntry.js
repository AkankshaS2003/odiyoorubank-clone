const mongoose = require('mongoose');

const LedgerEntrySchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Transaction',
    required: true
  },
  accountId: {
    type: String, // Can be an Account Number or "Bank Cash" / "Internal Suspense"
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  entryType: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: true
  },
  transferType: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LedgerEntry', LedgerEntrySchema);
