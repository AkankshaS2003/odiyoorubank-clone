const AccountApplication = require('../models/AccountApplication');
const Account = require('../models/Account');
const User = require('../models/User');
const sendEmail = require('../services/emailService');
const crypto = require('crypto');

// @desc    Submit account application
// @route   POST /api/applications
// @access  Private
exports.submitApplication = async (req, res, next) => {
  try {
    const { nameAsAadhar, addressAsAadhar, dob, aadharNumber, panNumber, accountType, aadharDocumentUrl } = req.body;

    // Check if user already has a pending or approved application
    const existingApp = await AccountApplication.findOne({ userId: req.user.id, status: { $ne: 'Rejected' } });
    if (existingApp) {
      return res.status(400).json({ success: false, error: 'You already have a pending or approved application' });
    }

    const application = await AccountApplication.create({
      userId: req.user.id,
      nameAsAadhar,
      addressAsAadhar,
      dob,
      aadharNumber,
      panNumber,
      accountType,
      aadharDocumentUrl
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Employee
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await AccountApplication.find().populate('userId', 'fullName email phone');
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject application
// @route   PUT /api/applications/:id/status
// @access  Private/Employee
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let application = await AccountApplication.findById(req.params.id).populate('userId');

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Application already processed' });
    }

    application.status = status;
    application.verifiedBy = req.user.id;
    await application.save();

    if (status === 'Approved') {
      // 1. Update User model with KYC details
      const user = application.userId;
      const customerId = 'CUST' + crypto.randomInt(100000, 999999).toString();
      
      user.customerId = customerId;
      user.isKycVerified = true;
      user.panNumber = application.panNumber;
      user.aadharNumber = application.aadharNumber;
      user.aadharUrl = application.aadharDocumentUrl;
      user.dob = application.dob;
      await user.save();

      // 2. Create actual Account
      const accountNumber = '10' + crypto.randomInt(10000000, 99999999).toString();
      const ifscCode = 'ODI0001234';
      
      await Account.create({
        userId: user._id,
        accountType: application.accountType,
        accountNumber,
        branch: 'Main Branch'
      });

      // 3. Send Email
      const emailMessage = `Dear ${user.fullName},

Your account application has been approved!
Welcome to Odiyooru Bank.

Here are your details:
Customer ID: ${customerId}
Account Number: ${accountNumber}
IFSC Code: ${ifscCode}

Please login to your dashboard to pay the initial minimum balance deposit (₹500).

Regards,
Odiyooru Bank Team
      `;

      await sendEmail({
        email: user.email,
        subject: 'Account Application Approved - Odiyooru Bank',
        message: emailMessage
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
