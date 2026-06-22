const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [
      function() { return this.provider !== 'google'; },
      'Please add a phone number'
    ]
  },
  password: {
    type: String,
    required: [
      function() { return this.provider !== 'google'; },
      'Please add a password'
    ],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'employee', 'manager', 'admin'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active'
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  address: String,
  dob: String,

  // New fields for real-world banking flow
  customerId: {
    type: String,
    unique: true,
    sparse: true
  },
  isKycVerified: {
    type: Boolean,
    default: false
  },
  panNumber: String,
  aadharNumber: String,
  aadharUrl: String,
  
  memberId: String,
  savingsBalance: { type: Number, default: 0 },
  fdBalance: { type: Number, default: 0 },
  rdBalance: { type: Number, default: 0 },
  deposits: [{
    id: String,
    type: { type: String, enum: ['Savings', 'Fixed', 'Recurring', 'Daily'] },
    amount: Number,
    rate: Number,
    date: String,
    maturityDate: String,
    status: String,
    accruedInterest: Number
  }],
  profileImageBase64: {
    type: String
  },
  loans: [{
    id: String,
    type: { type: String },
    amount: Number,
    outstanding: Number,
    rate: Number,
    tenureMonths: Number,
    emi: Number,
    nextPaymentDate: String,
    paidEmis: Number
  }],
  membershipStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  minimumBalancePaid: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
