const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanApplicationId: {
    type: String,
    unique: true
  },
  loanAccountNumber: {
    type: String
  },
  sanctionNumber: {
    type: String
  },
  referenceNumber: {
    type: String
  },
  loanType: {
    type: String,
    required: true,
    enum: ['Personal Loan', 'Home Loan', 'Education Loan', 'Gold Loan', 'Vehicle Loan', 'Agricultural Loan', 'Mortgage Loan', 'Business Loan']
  },
  status: {
    type: String,
    enum: [
      'Pending Review', 
      'Pending Branch Verification',
      'Branch Verification Completed',
      'Rejected', 
      'Sanctioned', 
      'Loan Declined by Customer', 
      'Loan Accepted', 
      'Ready for Disbursement', 
      'Loan Disbursed', 
      'Active Loan', 
      'Closed'
    ],
    default: 'Pending Review'
  },
  
  // Application Details
  requestedAmount: {
    type: Number,
    required: true
  },
  requestedTenure: {
    type: Number,
    required: true
  },
  income: {
    type: Number
  },
  applicationDetails: {
    type: mongoose.Schema.Types.Mixed // Flexible for various forms (Vehicle, Gold, etc.)
  },
  uploadedDocuments: [{
    documentName: String,
    documentUrl: String
  }],
  appliedDate: {
    type: Date,
    default: Date.now
  },

  // Sanction Details
  sanctionedAmount: {
    type: Number
  },
  interestRate: {
    type: Number
  },
  processingFee: {
    type: Number
  },
  loanTenure: {
    type: Number // in months
  },
  emiAmount: {
    type: Number
  },
  totalInterest: {
    type: Number
  },
  totalRepaymentAmount: {
    type: Number
  },
  firstEmiDate: {
    type: Date
  },
  lastEmiDate: {
    type: Date
  },
  outstandingBalance: {
    type: Number
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  
  // Agreement details
  customerAccepted: {
    type: Boolean,
    default: false
  },
  digitalSignature: {
    type: String // base64
  },
  rejectionReason: {
    type: String
  },
  disbursementDate: {
    type: Date
  },
  closureDate: {
    type: Date
  }
}, { timestamps: true });

// Pre-save to generate loanApplicationId
LoanSchema.pre('save', function(next) {
  if (!this.loanApplicationId) {
    this.loanApplicationId = 'APP-LN-' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Loan', LoanSchema);
