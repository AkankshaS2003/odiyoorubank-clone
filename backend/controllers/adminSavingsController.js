const SavingsDeposit = require('../models/SavingsDeposit');

// @desc    Get all savings deposits for admin
// @route   GET /api/admin/savings/deposits
// @access  Private/Admin
exports.getAllSavingsDeposits = async (req, res) => {
  try {
    const deposits = await SavingsDeposit.find()
      .populate('userId', 'fullName email phone')
      .populate('transactionId')
      .sort('-createdAt');
    res.json({ success: true, deposits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
