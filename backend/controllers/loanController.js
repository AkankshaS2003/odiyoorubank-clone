const Loan = require('../models/Loan');
const LoanEMI = require('../models/LoanEMI');
const User = require('../models/User');
const SavingsAccount = require('../models/SavingsAccount');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Assuming standard nodemailer setup
const sendEmail = require('../services/emailService');
const { verifyTpin } = require('./tpinController');

// Mock email sender if not configured in utils
const sendNotification = async (email, subject, message) => {
  try {
    if (sendEmail) {
      await sendEmail({ email, subject, message });
    } else {
      console.log(`[Email to ${email}]: ${subject} - ${message}`);
    }
  } catch (error) {
    console.log(`Failed to send email: ${error.message}`);
  }
};

const createAudit = async (action, userId, details) => {
  try {
    await AuditLog.create({
      action,
      performedBy: userId,
      targetUser: userId,
      details
    });
  } catch (e) {
    console.error("Audit log failed", e);
  }
};

// 1. applyLoan
exports.applyLoan = async (req, res, next) => {
  try {
    const { loanType, amount, tenure, income, tpin, ...applicationDetails } = req.body;
    
    let cleanTenure = tenure;
    if (typeof tenure === 'string') {
      cleanTenure = parseInt(tenure.replace(/\D/g, ''), 10) || 12;
    }
    
    let cleanAmount = amount;
    if (typeof amount === 'string') {
      cleanAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    }
    
    let cleanIncome = income;
    if (typeof income === 'string') {
      cleanIncome = parseInt(income.replace(/\D/g, ''), 10) || 0;
    }

    const tpinResult = await verifyTpin(req.user, tpin);
    if (!tpinResult.success) {
      return res.status(401).json({ success: false, message: tpinResult.error, error: tpinResult.error });
    }

    const loan = await Loan.create({
      userId: req.user._id,
      loanType,
      requestedAmount: cleanAmount,
      requestedTenure: cleanTenure,
      income: cleanIncome,
      applicationDetails,
      uploadedDocuments: applicationDetails.uploadedDocuments || [],
      status: 'Pending Review'
    });

    // Also create a ServiceApplication for the dashboard paper trail and listing
    try {
      const serviceImages = {};
      if (Array.isArray(applicationDetails.uploadedDocuments)) {
        applicationDetails.uploadedDocuments.forEach(doc => {
          if (doc.documentName && doc.documentUrl) {
            serviceImages[doc.documentName] = doc.documentUrl;
          }
        });
      }

      const ServiceApplication = require('../models/ServiceApplication');
      await ServiceApplication.create({
        _id: loan._id,
        userId: req.user._id,
        applicationType: loanType,
        formData: {
          ...applicationDetails,
          amount: cleanAmount,
          tenure: cleanTenure,
          income: cleanIncome,
          loanType
        },
        images: serviceImages,
        status: 'Pending'
      });
    } catch (serviceErr) {
      console.error('Failed to create ServiceApplication for loan', serviceErr);
    }

    await createAudit('Loan Application Submitted', req.user._id, `Applied for ${loanType} of ₹${amount}`);
    
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Customer Get all loans
exports.getMyLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    next(error);
  }
};

// Calculate Eligibility
exports.calculateEligibility = async (req, res, next) => {
  try {
    const { 
      income = 0, 
      existingEmi = 0, 
      expenses = 0, 
      savings = 0, 
      age = 30, 
      occupation = 'Salaried',
      loanType = 'Personal Loan',
      desiredLoanAmount = 0,
      loanTenure = 5 // years
    } = req.body;

    const monthlyIncome = Number(income);
    const emi = Number(existingEmi);
    const monthlyExpenses = Number(expenses);
    const savingsAmount = Number(savings);
    const amount = Number(desiredLoanAmount);
    const tenureYears = Number(loanTenure) || 5;
    const tenureMonths = tenureYears * 12;

    // Interest Rates Mapping
    const interestRates = {
      'Agricultural Loan': 7.0,
      'Vehicle Loan': 8.5,
      'Personal Loan': 10.5,
      'Gold Loan': 8.0,
      'Educational Loan': 9.0,
      'Housing Loan': 8.5
    };
    const interestRate = interestRates[loanType] || 10.5;
    const rate = interestRate / (12 * 100);

    // Core Calculations
    const disposableIncome = monthlyIncome - emi - monthlyExpenses;
    const dti = monthlyIncome > 0 ? (emi / monthlyIncome) * 100 : 100;
    
    // Desired Loan EMI calculation
    const desiredEmi = amount > 0 
      ? Math.floor(amount * rate * Math.pow(1 + rate, tenureMonths) / (Math.pow(1 + rate, tenureMonths) - 1))
      : 0;
    
    const newDti = monthlyIncome > 0 ? ((emi + desiredEmi) / monthlyIncome) * 100 : 100;

    // Maximum Eligible Loan (Max EMI they can afford is say 55% of income minus existing EMI)
    const maxAffordableEmi = (monthlyIncome * 0.55) - emi;
    let maxEligibleAmount = 0;
    if (maxAffordableEmi > 0) {
      maxEligibleAmount = Math.floor(maxAffordableEmi * (Math.pow(1 + rate, tenureMonths) - 1) / (rate * Math.pow(1 + rate, tenureMonths)));
    }

    // Eligibility Status
    let isEligible = true;
    let approvalProbability = "High (90%+)";
    let riskProfile = "Low Risk";
    let eligibilityScore = 95;

    if (newDti > 60 || disposableIncome < desiredEmi) {
      isEligible = false;
      approvalProbability = "Very Low (<20%)";
      riskProfile = "High Risk";
      eligibilityScore = 30;
    } else if (newDti > 45) {
      approvalProbability = "Medium (50-70%)";
      riskProfile = "Medium Risk";
      eligibilityScore = 65;
    }

    if (age > 65 || age < 18) {
      isEligible = false;
      approvalProbability = "Rejected (Age Criteria)";
      eligibilityScore = 10;
    }

    // Loan Breakdown
    const principalAmount = amount;
    const totalRepayment = desiredEmi * tenureMonths;
    const totalInterest = totalRepayment - principalAmount;
    const processingFee = Math.floor(principalAmount * 0.01); // 1% processing fee

    // Reasoning
    const detailedReasoning = isEligible ? [
      `Monthly income of Rs. ${monthlyIncome.toLocaleString()} is sufficient for repayment.`,
      `Existing EMI obligations (${emi}) are within acceptable limits.`,
      `Debt-to-Income ratio (${newDti.toFixed(1)}%) satisfies bank policy.`,
      `Age (${age}) meets eligibility requirements.`
    ] : [
      `Debt-to-Income ratio (${newDti.toFixed(1)}%) exceeds maximum acceptable threshold of 60%.`,
      `Disposable income is insufficient to cover the new EMI of Rs. ${desiredEmi}.`,
      `Requested loan amount is higher than repayment capacity.`
    ];

    const improvementSuggestions = isEligible ? [
      "Maintain your current savings rate to build a strong credit profile.",
      "Consider prepaying existing loans to increase future eligibility."
    ] : [
      "Reduce existing EMI burdens by paying off smaller loans.",
      "Increase down payment to reduce the desired loan amount.",
      "Choose a longer tenure to reduce the monthly EMI."
    ];

    // Chart Data
    const chartData = {
      financialBreakdown: [
        { name: 'Income', value: monthlyIncome },
        { name: 'Existing EMI', value: emi },
        { name: 'Expenses', value: monthlyExpenses },
        { name: 'Savings', value: savingsAmount }
      ],
      repaymentBreakdown: [
        { name: 'Principal', value: principalAmount },
        { name: 'Interest', value: totalInterest }
      ]
    };

    res.status(200).json({
      success: true,
      data: {
        isEligible,
        eligibilityStatus: isEligible ? 'Eligible' : 'Not Eligible',
        maxEligibleAmount,
        approvalProbability,
        recommendedLoanType: loanType,
        interestRate,
        monthlyEMI: desiredEmi,
        principalAmount,
        totalInterest,
        totalRepaymentAmount: totalRepayment,
        processingFee,
        debtToIncomeRatio: newDti,
        disposableIncome,
        riskProfile,
        eligibilityScore,
        aiRecommendation: isEligible 
          ? `We recommend a ${loanType} because your stable monthly income, low debt-to-income ratio, consistent savings, and repayment capacity indicate that this loan is financially suitable.` 
          : `We do not recommend applying for this ${loanType} at this time. Your requested loan amount creates a monthly EMI burden that exceeds our safe lending thresholds.`,
        detailedReasoning,
        improvementSuggestions,
        chartData
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single loan details with EMIs
exports.getLoanDetails = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId', 'fullName email phone');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    
    // Check access
    if (loan.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const emis = await LoanEMI.find({ loanId: loan._id }).sort('emiNumber');
    res.status(200).json({ success: true, data: { loan, emis } });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN ROUTES ---

// Admin Get all loans
exports.adminGetAllLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('userId', 'fullName email phone').sort('-createdAt');
    res.status(200).json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    next(error);
  }
};

// 2. Admin Verify/Reject Loan
exports.adminVerifyLoan = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve_verification', 'reject', 'request_docs'
    const loan = await Loan.findById(req.params.id).populate('userId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (action === 'reject') {
      loan.status = 'Rejected';
      loan.rejectionReason = rejectionReason;
      await loan.save();
      await createAudit('Loan Rejected', req.user._id, `Admin rejected loan ${loan._id}`);
      await sendNotification(loan.userId.email, 'Loan Application Rejected', `Your loan application ${loan.loanApplicationId} was rejected. Reason: ${rejectionReason}`);
      return res.status(200).json({ success: true, data: loan });
    }
    
    if (action === 'request_docs') {
      await sendNotification(loan.userId.email, 'Additional Documents Required', `Please provide additional documents for loan ${loan.loanApplicationId}`);
      return res.status(200).json({ success: true, message: 'Requested additional documents.' });
    }

    res.status(200).json({ success: true, message: 'Verification marked as good. Proceed to Sanction.' });
  } catch (error) {
    next(error);
  }
};

// 3. Admin Sanction Loan
exports.adminSanctionLoan = async (req, res, next) => {
  try {
    const { sanctionedAmount, interestRate, loanTenure, processingFee } = req.body;
    const loan = await Loan.findById(req.params.id).populate('userId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    // Math calculation for EMI
    const P = sanctionedAmount;
    const R = interestRate / 12 / 100;
    const N = loanTenure;
    const emiAmount = Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1));
    const totalRepaymentAmount = emiAmount * N;
    const totalInterest = totalRepaymentAmount - P;

    const sanctionNumber = 'SANC-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    loan.sanctionNumber = sanctionNumber;
    loan.sanctionedAmount = P;
    loan.interestRate = interestRate;
    loan.loanTenure = N;
    loan.processingFee = processingFee;
    loan.emiAmount = emiAmount;
    loan.totalInterest = totalInterest;
    loan.totalRepaymentAmount = totalRepaymentAmount;
    loan.status = 'Sanctioned';
    await loan.save();

    await createAudit('Loan Sanctioned', req.user._id, `Admin sanctioned loan ${loan._id} for ₹${P}`);
    await sendNotification(loan.userId.email, 'Loan Sanctioned - Offer Available', `Your loan ${loan.loanApplicationId} has been sanctioned. Please review the offer letter on your dashboard.`);

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// 4. Customer Accept Offer
exports.customerAcceptOffer = async (req, res, next) => {
  try {
    const { action, digitalSignature } = req.body; // action: 'accept', 'decline'
    const loan = await Loan.findById(req.params.id);
    
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (action === 'decline') {
      loan.status = 'Loan Declined by Customer';
      await loan.save();
      await createAudit('Loan Declined', req.user._id, `Customer declined offer for ${loan._id}`);
      return res.status(200).json({ success: true, data: loan });
    }

    if (!digitalSignature) return res.status(400).json({ success: false, message: 'Digital signature is required' });

    loan.customerAccepted = true;
    loan.digitalSignature = digitalSignature;
    loan.status = 'Loan Accepted';
    await loan.save();

    await createAudit('Loan Accepted', req.user._id, `Customer accepted offer for ${loan._id}`);
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// 5. Admin Final Verify
exports.adminFinalVerify = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (!loan.customerAccepted) return res.status(400).json({ success: false, message: 'Customer has not accepted yet' });

    loan.status = 'Ready for Disbursement';
    await loan.save();

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// 6. Admin Disburse Loan
exports.adminDisburseLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId');
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status !== 'Ready for Disbursement') return res.status(400).json({ success: false, message: 'Loan not ready for disbursement' });

    const savingsAccount = await SavingsAccount.findOne({ userId: loan.userId._id });
    if (!savingsAccount) return res.status(400).json({ success: false, message: 'No linked Savings Account found' });

    const disburseAmount = loan.sanctionedAmount - (loan.processingFee || 0);
    const loanAccNum = 'LN-' + Date.now().toString().slice(-6) + crypto.randomBytes(2).toString('hex').toUpperCase();

    const TransferService = require('../services/TransferService');
    const transferResult = await TransferService.executeTransfer({
      transferType: 'Loan Disbursement',
      amount: disburseAmount,
      senderAccount: null, // From System
      receiverAccount: savingsAccount.accountNumber,
      userId: user._id,
      paymentChannel: 'System',
      remarks: `Disbursement for Loan ${loanAccNum}`
    });

    const userObj = loan.userId;
    userObj.savingsBalance = savingsAccount.balance + disburseAmount; // Since transfer service does this directly, we update locally for the user obj
    await userObj.save();

    const refNum = transferResult.referenceNumber;

    // 7. Activate EMI Schedule
    const emiRecords = [];
    let currentBalance = loan.sanctionedAmount;
    const R = loan.interestRate / 12 / 100;
    
    const firstDate = new Date();
    firstDate.setMonth(firstDate.getMonth() + 1);
    
    for (let i = 1; i <= loan.loanTenure; i++) {
      const emiDate = new Date(firstDate);
      emiDate.setMonth(firstDate.getMonth() + (i - 1));
      
      const interestComp = currentBalance * R;
      let principalComp = loan.emiAmount - interestComp;
      if (i === loan.loanTenure) {
        // Adjust last EMI principal to exact remaining
        principalComp = currentBalance;
      }
      
      currentBalance -= principalComp;

      emiRecords.push({
        loanId: loan._id,
        userId: user._id,
        emiNumber: i,
        dueDate: emiDate,
        principalComponent: Math.round(principalComp),
        interestComponent: Math.round(interestComp),
        emiAmount: loan.emiAmount,
        outstandingBalance: Math.max(0, Math.round(currentBalance)),
        paymentStatus: 'Pending'
      });
    }

    await LoanEMI.insertMany(emiRecords);

    loan.loanAccountNumber = loanAccNum;
    loan.referenceNumber = refNum;
    loan.status = 'Active Loan';
    loan.disbursementDate = new Date();
    loan.firstEmiDate = firstDate;
    loan.lastEmiDate = emiRecords[emiRecords.length - 1].dueDate;
    loan.outstandingBalance = loan.sanctionedAmount;
    await loan.save();

    await createAudit('Loan Disbursed', req.user._id, `Disbursed loan ${loanAccNum} of ₹${disburseAmount} to user ${user.email}`);
    await sendNotification(user.email, 'Loan Disbursed successfully', `Your loan amount of ₹${disburseAmount} has been credited to your Savings Account. Account No: ${loanAccNum}`);

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// 8. Monthly EMI Payment
exports.payEmi = async (req, res, next) => {
  try {
    const { paymentMode } = req.body;
    const emi = await LoanEMI.findById(req.params.emiId);
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });
    if (emi.paymentStatus === 'Paid') return res.status(400).json({ success: false, message: 'EMI already paid' });

    const loan = await Loan.findById(emi.loanId).populate('userId');
    const totalToPay = emi.emiAmount + emi.latePenalty;

    if (paymentMode === 'Transfer from Linked Savings Account') {
      const savingsAccount = await SavingsAccount.findOne({ userId: req.user._id });
      if (!savingsAccount || savingsAccount.balance < totalToPay) {
        return res.status(400).json({ success: false, message: 'Insufficient balance in Savings Account' });
      }
      savingsAccount.balance -= totalToPay;
      savingsAccount.totalWithdrawals = (savingsAccount.totalWithdrawals || 0) + totalToPay;
      await savingsAccount.save();
      
      const user = await User.findById(req.user._id);
      user.savingsBalance = savingsAccount.balance;
      await user.save();
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount: totalToPay,
      type: 'EMI Payment',
      status: 'Completed',
      description: `EMI #${emi.emiNumber} Payment for Loan ${loan.loanAccountNumber}`
    });

    emi.paymentStatus = 'Paid';
    emi.paidDate = new Date();
    emi.paymentMode = paymentMode;
    emi.transactionRef = transaction._id;
    await emi.save();

    loan.outstandingBalance -= emi.principalComponent;
    loan.paidAmount += totalToPay;
    await loan.save();

    await createAudit('EMI Paid', req.user._id, `Paid EMI #${emi.emiNumber} of ₹${totalToPay}`);
    await sendNotification(loan.userId.email, 'EMI Payment Successful', `We have received your EMI payment of ₹${totalToPay} for Loan ${loan.loanAccountNumber}`);

    // Check if Loan should be closed
    const pendingEmis = await LoanEMI.countDocuments({ loanId: loan._id, paymentStatus: { $ne: 'Paid' } });
    if (pendingEmis === 0) {
      loan.status = 'Closed';
      loan.closureDate = new Date();
      await loan.save();
      await sendNotification(loan.userId.email, 'Loan Closed Successfully', `Congratulations! Your loan ${loan.loanAccountNumber} has been fully repaid and closed.`);
    }

    res.status(200).json({ success: true, message: 'EMI Paid successfully' });
  } catch (error) {
    next(error);
  }
};


// @desc    Complete physical branch verification for Loan
// @route   PUT /api/loans/:id/branch-verification
// @access  Private/Admin
exports.adminCompleteBranchVerification = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    
    if (loan.status !== 'Pending Branch Verification') {
      return res.status(400).json({ success: false, message: 'Loan is not pending branch verification' });
    }

    loan.status = 'Branch Verification Completed';
    await loan.save();

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};
