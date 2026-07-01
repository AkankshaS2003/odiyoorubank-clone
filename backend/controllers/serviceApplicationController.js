const ServiceApplication = require('../models/ServiceApplication');
const { verifyTpin } = require('./tpinController');

// @desc    Submit service application
// @route   POST /api/service-applications
// @access  Private
exports.submitApplication = async (req, res, next) => {
  try {
    const { applicationType, formData, images, tpin } = req.body;
    
    const tpinResult = await verifyTpin(req.user, tpin);
    if (!tpinResult.success) {
      return res.status(401).json({ success: false, error: tpinResult.error });
    }

    if (!applicationType || !formData) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    if (applicationType === 'Fixed Deposit' || applicationType === 'Recurring Deposit') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      const amount = Number(formData.amount) || 0;
      if (!user || user.savingsBalance < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient savings balance.' });
      }
    }

    const application = await ServiceApplication.create({
      userId: req.user.id,
      applicationType,
      formData,
      images: images || {}
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's service applications
// @route   GET /api/service-applications/my
// @access  Private
exports.getUserApplications = async (req, res, next) => {
  try {
    const applications = await ServiceApplication.find({ userId: req.user.id })
      .populate('userId', 'fullName email phone customerId panNumber aadharNumber address dob accountNumber')
      .sort('-submittedAt');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service applications
// @route   GET /api/service-applications
// @access  Private (Admin/Employee/Manager)
exports.getAllApplications = async (req, res, next) => {
  try {
    const applications = await ServiceApplication.find().populate('userId', 'fullName email phone customerId').sort('-submittedAt');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/service-applications/:id/status
// @access  Private (Admin/Employee/Manager)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let application = await ServiceApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    application.status = status;
    application.processedBy = req.user.id;
    application.processedAt = Date.now();
    await application.save();

    if (status === 'Approved') {
      const User = require('../models/User');
      const Account = require('../models/Account');
      const user = await User.findById(application.userId);
      if (user) {
        const amount = Number(application.formData?.amount) || 0;
        let transactionType = application.applicationType;
        const account = await Account.findOne({ userId: user._id });

        if (application.applicationType === 'Fixed Deposit') {
          await User.updateOne({ _id: user._id }, { $inc: { fdBalance: amount, savingsBalance: -amount } });
          if (account) {
            account.balance = (account.balance || 0) - amount;
            await account.save();
          }

          // Fixed Deposit specific logic with Quarterly Compound Interest
          const SystemSettings = require('../models/SystemSettings');
          const settings = await SystemSettings.findOne();
          const fdRate = settings ? settings.fdRate : 8.5;
          
          let tenureMonths = 12; // default
          if (application.formData?.depositPeriod) {
            const parsed = parseInt(application.formData.depositPeriod);
            if (!isNaN(parsed)) tenureMonths = parsed;
          }

          const principal = amount;
          const r = fdRate / 100;
          const n = 4; // Quarterly
          const t = tenureMonths / 12;
          const maturityAmount = principal * Math.pow(1 + (r / n), n * t);
          const interestEarned = maturityAmount - principal;

          const depositDate = new Date();
          const maturityDate = new Date(depositDate);
          maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

          const FixedDeposit = require('../models/FixedDeposit');
          const fdCount = await FixedDeposit.countDocuments();
          const fdNumber = `FD${new Date().getFullYear()}${String(fdCount + 1).padStart(5, '0')}`;

          await FixedDeposit.create({
            fdNumber,
            userId: user._id,
            applicationId: application._id,
            principalAmount: principal,
            interestRate: fdRate,
            compoundingFrequency: 'Quarterly',
            tenureMonths,
            depositDate,
            maturityDate,
            interestEarned: Math.round(interestEarned * 100) / 100,
            maturityAmount: Math.round(maturityAmount * 100) / 100,
            status: 'Active',
            nomineeDetails: {
              name: application.formData?.nomineeName || '',
              relation: application.formData?.nomineeRelationship || ''
            },
            linkedSavingsAccount: account ? account._id : null
          });
          
        } else if (application.applicationType === 'Recurring Deposit') {
          await User.updateOne({ _id: user._id }, { $inc: { rdBalance: amount, savingsBalance: -amount } });
          if (account) {
            account.balance = (account.balance || 0) - amount;
            await account.save();
          }
          
          const RecurringDeposit = require('../models/RecurringDeposit');
          const rd = await RecurringDeposit.findOne({ userId: user._id, status: 'Pending Approval' }).sort({ createdAt: -1 });
          if (rd) {
            const count = await RecurringDeposit.countDocuments({ status: { $ne: 'Pending Approval' } });
            rd.rdNumber = `RD${String(count + 1).padStart(5, '0')}`;
            rd.status = 'Active';
            
            const today = new Date();
            rd.depositDate = today;
            const mDate = new Date(today);
            mDate.setMonth(mDate.getMonth() + rd.tenureMonths);
            rd.maturityDate = mDate;
            
            const r = rd.interestRate / 100;
            const n = 4;
            let totalInterest = 0;
            let totalDeposited = 0;
            const installments = [];
            
            for (let i = 1; i <= rd.tenureMonths; i++) {
              totalDeposited += rd.monthlyAmount;
              const t = (rd.tenureMonths - i + 1) / 12;
              const amt = rd.monthlyAmount * Math.pow((1 + (r / n)), (n * t));
              totalInterest += (amt - rd.monthlyAmount);
              
              const dueDate = new Date(today);
              dueDate.setMonth(dueDate.getMonth() + (i - 1));
              installments.push({
                rdId: rd._id,
                installmentNumber: i,
                dueDate,
                amount: rd.monthlyAmount
              });
            }
            rd.maturityAmount = Math.round(totalDeposited + totalInterest);
            await rd.save();
            
            const RDInstallment = require('../models/RDInstallment');
            await RDInstallment.insertMany(installments);
          }
        } else if (application.applicationType.includes('Loan')) {
          transactionType = 'Loan Disbursement';
          // Disburse the loan amount to their savings
          await User.updateOne({ _id: user._id }, { $inc: { savingsBalance: amount } });
          if (account) {
            account.balance = (account.balance || 0) + amount;
            await account.save();
          }
        } else {
          transactionType = 'Application Fee';
        }
        
        // Create Transaction Record
        if (amount > 0) {
          const Transaction = require('../models/Transaction');
          await Transaction.create({
            userId: user._id,
            accountId: account ? account._id : undefined,
            amount: amount,
            type: transactionType,
            status: 'Completed'
          });
        }
      }
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
