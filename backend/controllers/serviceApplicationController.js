const ServiceApplication = require('../models/ServiceApplication');

// @desc    Submit service application
// @route   POST /api/service-applications
// @access  Private
exports.submitApplication = async (req, res, next) => {
  try {
    const { applicationType, formData, images } = req.body;

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
    const applications = await ServiceApplication.find({ userId: req.user.id }).sort('-submittedAt');
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
        if (application.applicationType === 'Fixed Deposit') {
          await User.updateOne({ _id: user._id }, { $inc: { fdBalance: amount, savingsBalance: -amount } });
        } else if (application.applicationType === 'Recurring Deposit') {
          await User.updateOne({ _id: user._id }, { $inc: { rdBalance: amount, savingsBalance: -amount } });
        }
        
        // Also update the Account document's balance if it exists
        const account = await Account.findOne({ userId: user._id });
        if (account) {
          account.balance = (account.balance || 0) - amount;
          await account.save();
        }
        
        // Create Transaction Record
        const Transaction = require('../models/Transaction');
        await Transaction.create({
          userId: user._id,
          accountId: account ? account._id : undefined,
          amount: amount,
          type: application.applicationType,
          status: 'Completed'
        });
      }
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
