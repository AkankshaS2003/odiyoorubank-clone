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
    const { address, dob } = req.body;

    const user = await req.user.constructor.findByIdAndUpdate(req.user._id, {
      address,
      dob,
      membershipStatus: 'pending'
    }, { new: true });

    const Membership = require('../models/Membership');
    await Membership.findOneAndUpdate(
      { userId: req.user._id },
      { customerId: user.customerId || 'PENDING', status: 'Pending' },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const makeDeposit = async (req, res, next) => {
  try {
    const { type, amount, durationYears } = req.body;
    const user = await req.user.constructor.findById(req.user._id);

    if (user.savingsBalance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient savings balance' });
    }

    const rates = { Savings: 4.5, Fixed: 8.50, Recurring: 7.75, Daily: 6.50 };
    const newDep = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      type,
      amount,
      rate: rates[type] || 0,
      date: new Date().toISOString().split('T')[0],
      maturityDate: 'Ongoing',
      status: 'Active',
      accruedInterest: 0
    };

    user.savingsBalance -= amount;
    if (type === 'Fixed') user.fdBalance += amount;
    if (type === 'Recurring') user.rdBalance += amount;

    user.deposits.push(newDep);
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const verifyCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    
    if (req.user.customerId !== customerId) {
      return res.status(400).json({ success: false, error: 'Invalid Customer ID or does not match your account.' });
    }

    const account = await Account.findOne({ userId: req.user._id });
    
    res.status(200).json({
      success: true,
      data: {
        address: req.user.addressAsAadhar || req.user.address || '',
        dob: req.user.dob || '',
        accountNumber: account ? account.accountNumber : ''
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getAccountDetails,
  applyMembership,
  makeDeposit,
  verifyCustomer
};
