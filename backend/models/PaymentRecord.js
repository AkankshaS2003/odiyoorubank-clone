const mongoose = require('mongoose');

const PaymentRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String
  },
  signature: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Created', 'Authorized', 'Captured', 'Failed', 'Refunded'],
    default: 'Created'
  },
  relatedModel: {
    type: String,
    enum: ['SavingsDeposit', 'LoanRepayment', 'ServiceApplication'],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
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

PaymentRecordSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  
});

module.exports = mongoose.model('PaymentRecord', PaymentRecordSchema);
