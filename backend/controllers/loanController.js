const Loan = require('../models/Loan');

// @desc    Apply for a new loan
// @route   POST /api/loans/apply
// @access  Private
const applyLoan = async (req, res, next) => {
  try {
    const { loanType, amount, tenure, income } = req.body;

    const loan = await Loan.create({
      userId: req.user._id,
      loanType,
      amount,
      tenure,
      income
    });

    res.status(201).json({
      success: true,
      data: loan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's loans
// @route   GET /api/loans/my-loans
// @access  Private
const getMyLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ userId: req.user._id });

    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate Loan Eligibility
// @route   POST /api/loans/calculator
// @access  Public
const calculateEligibility = async (req, res, next) => {
  try {
    const { income, existingEmi, age } = req.body;
    
    // Basic rules
    // Max 50% of income can be used for EMI
    // Minus existing EMI
    
    const availableForEmi = (income * 0.5) - existingEmi;
    
    if (availableForEmi <= 0 || age > 65 || age < 18) {
      return res.status(200).json({
        success: true,
        data: {
          eligibleAmount: 0,
          eligibilityPercentage: 0,
          estimatedEmi: 0,
          isEligible: false
        }
      });
    }

    // Assume max tenure 5 years (60 months) and interest rate 10%
    const rate = 10 / (12 * 100);
    const months = 60;
    
    // Formula for Principal: P = EMI * ( (1+R)^N - 1 ) / ( R * (1+R)^N )
    const eligibleAmount = Math.floor(availableForEmi * (Math.pow(1 + rate, months) - 1) / (rate * Math.pow(1 + rate, months)));
    
    res.status(200).json({
      success: true,
      data: {
        eligibleAmount,
        eligibilityPercentage: 100, // For simple logic
        estimatedEmi: availableForEmi,
        isEligible: true
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLoan,
  getMyLoans,
  calculateEligibility
};
