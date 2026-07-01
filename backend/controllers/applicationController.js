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
    const { nameAsAadhar, permanentAddress, currentAddress, occupation, dob, aadharNumber, panNumber, accountType, aadharDocumentUrl, panDocumentUrl, applicantPhotoBase64, formData, images } = req.body;

    // Check if user already has a pending or approved application
    const existingApp = await AccountApplication.findOne({ userId: req.user.id, status: { $ne: 'Rejected' } });
    if (existingApp) {
      return res.status(400).json({ success: false, error: 'You already have a pending or approved application' });
    }

    // Validate Aadhar uniqueness
    const duplicateAadhar = await AccountApplication.findOne({ aadharNumber, status: { $ne: 'Rejected' } });
    if (duplicateAadhar && duplicateAadhar.userId.toString() !== req.user.id) {
      return res.status(400).json({ success: false, error: 'Aadhar number is already in use by another application' });
    }
    const duplicateAadharUser = await User.findOne({ aadharNumber });
    if (duplicateAadharUser && duplicateAadharUser._id.toString() !== req.user.id) {
      return res.status(400).json({ success: false, error: 'Aadhar number is already registered to another user' });
    }

    // Validate PAN uniqueness
    if (panNumber) {
      const duplicatePan = await AccountApplication.findOne({ panNumber, status: { $ne: 'Rejected' } });
      if (duplicatePan && duplicatePan.userId.toString() !== req.user.id) {
        return res.status(400).json({ success: false, error: 'PAN number is already in use by another application' });
      }
      const duplicatePanUser = await User.findOne({ panNumber });
      if (duplicatePanUser && duplicatePanUser._id.toString() !== req.user.id) {
        return res.status(400).json({ success: false, error: 'PAN number is already registered to another user' });
      }
    }

    const application = await AccountApplication.create({
      userId: req.user.id,
      nameAsAadhar,
      permanentAddress,
      currentAddress,
      occupation,
      dob,
      aadharNumber,
      panNumber,
      accountType,
      aadharDocumentUrl,
      panDocumentUrl,
      applicantPhotoBase64,
      formData,
      images,
      status: 'Pending Branch Verification'
    });

    const emailMessage = `Dear ${req.user.fullName || nameAsAadhar},

Thank you for choosing Odiyooru Bank.

We have successfully received your Savings Account Opening Application.

Before your account can be activated, you are required to visit your selected branch for physical verification of your identity and original documents.

Please carry the following original documents during your visit:

• Aadhaar Card
• PAN Card
• Passport Size Photographs
• Address Proof (if applicable)
• Any additional documents submitted during the application process

Branch Name:
Main Branch

Application Number:
${application._id}

Our bank representative will verify your documents and complete the account opening process. Once verification is successful, your Customer ID and Savings Account Number will be generated automatically, and you will receive another confirmation email.

If you have any questions, please contact your branch or our customer support team.

Thank you for choosing Odiyooru Bank.

Kind Regards,

Account Opening Department
Odiyooru Bank`;

    await sendEmail({
      email: req.user.email,
      subject: 'Application Received – Visit Branch for Account Verification',
      message: emailMessage
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

    if (application.status !== 'Branch Verification Completed') {
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
      user.address = application.permanentAddress;
      if (application.applicantPhotoBase64) {
        user.profileImageBase64 = application.applicantPhotoBase64;
      }
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

      const SavingsAccount = require('../models/SavingsAccount');
      await SavingsAccount.create({
        userId: user._id,
        accountNumber,
        balance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
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


// @desc    Complete physical branch verification
// @route   PUT /api/applications/:id/branch-verification
// @access  Private/Employee
exports.completeBranchVerification = async (req, res, next) => {
  try {
    let application = await AccountApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, error: 'Application not found' });
    
    if (application.status !== 'Pending Branch Verification') {
      return res.status(400).json({ success: false, error: 'Application is not pending branch verification' });
    }

    application.status = 'Branch Verification Completed';
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
