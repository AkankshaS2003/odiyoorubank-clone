const mongoose = require('mongoose');

const FixedDepositSchema = new mongoose.Schema({
  fdNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.ObjectId,
    ref: 'ServiceApplication',
    required: false
  },
  principalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0
  },
  compoundingFrequency: {
    type: String,
    enum: ['Quarterly', 'Monthly', 'Half-Yearly', 'Yearly'],
    default: 'Quarterly'
  },
  tenureMonths: {
    type: Number,
    required: true,
    min: 1
  },
  depositDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: {
    type: Date,
    required: true
  },
  interestEarned: {
    type: Number,
    required: true,
    min: 0
  },
  maturityAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Matured', 'Closed', 'Renewed', 'Pending Settlement Approval'],
    default: 'Active'
  },
  nomineeDetails: {
    name: { type: String },
    relation: { type: String }
  },
  linkedSavingsAccount: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account'
  },
  settlementDetails: {
    settledAmount: { type: Number },
    settlementDate: { type: Date },
    settlementMode: { type: String, enum: ['Transfer to Savings', 'Renew FD', 'Renew Principal Only'] },
    processedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    transactionRef: { type: mongoose.Schema.ObjectId, ref: 'Transaction' }
  }
}, { timestamps: true });

module.exports = mongoose.model('FixedDeposit', FixedDepositSchema);
