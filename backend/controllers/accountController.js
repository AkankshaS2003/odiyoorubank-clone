const Account = require('../models/Account');

// @desc    Get logged in user profile / basic account details
// @route   GET /api/account/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        account: account || null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific account details including balance
// @route   GET /api/account/details
// @access  Private
const getAccountDetails = async (req, res, next) => {
  try {
    let account = await Account.findOne({ userId: req.user._id });
    
    // If account doesn't exist for a newly registered user, create a default one for simulation
    if (!account) {
      account = await Account.create({
        userId: req.user._id,
        accountType: 'Savings',
        accountNumber: req.user.accountNumber || 'CB' + Date.now().toString().slice(-8),
        branch: 'Main Branch',
        balance: 1000 // Welcome bonus
      });
    }

    // Mock recent activities
    const recentActivities = [
      { id: 1, type: 'Deposit', amount: 1000, date: new Date().toISOString() }
    ];

    res.status(200).json({
      success: true,
      data: {
        account,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for membership
// @route   POST /api/account/membership/apply
// @access  Private
const applyMembership = async (req, res, next) => {
  try {
    const { address, dob, bloodGroup } = req.body;

    const user = await req.user.constructor.findByIdAndUpdate(req.user._id, {
      address,
      dob,
      bloodGroup,
      membershipStatus: 'pending'
    }, { new: true });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getAccountDetails,
  applyMembership
};
