const mongoose = require('mongoose');

const RecurringDepositSchema = new mongoose.Schema({
  rdNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows null/undefined to not violate uniqueness before approval
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
  monthlyAmount: {
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
    required: false
  },
  interestEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  maturityAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDeposited: {
    type: Number,
    default: 0,
    min: 0
  },
  autoDebit: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending Approval', 'Active', 'Inactive', 'Matured', 'Closed', 'Renewed', 'Pending Settlement Approval'],
    default: 'Pending Approval'
  },
  consecutiveMissedInstallments: {
    type: Number,
    default: 0
  },
  nomineeDetails: {
    name: { type: String },
    relation: { type: String }
  },
  linkedSavingsAccount: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
    required: true
  },
  settlementDetails: {
    settledAmount: { type: Number },
    settlementDate: { type: Date },
    settlementMode: { type: String, enum: ['Transfer to Savings', 'Renew RD'] },
    processedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    transactionRef: { type: mongoose.Schema.ObjectId, ref: 'Transaction' }
  }
}, { timestamps: true });

module.exports = mongoose.model('RecurringDeposit', RecurringDepositSchema);
