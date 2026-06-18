const Membership = require('../models/Membership');
const User = require('../models/User');
const sendEmail = require('../services/emailService');

// @desc    Apply for membership
// @route   POST /api/memberships
// @access  Private
exports.applyMembership = async (req, res, next) => {
  try {
    const { customerId } = req.body;
    
    if (req.user.customerId !== customerId) {
      return res.status(400).json({ success: false, error: 'Invalid Customer ID for this user' });
    }

    const existingMembership = await Membership.findOne({ userId: req.user.id, status: { $ne: 'Rejected' } });
    if (existingMembership) {
      return res.status(400).json({ success: false, error: 'Membership application already exists' });
    }

    const membership = await Membership.create({
      userId: req.user.id,
      customerId
    });

    req.user.membershipStatus = 'pending';
    await req.user.save();

    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all membership applications
// @route   GET /api/memberships
// @access  Private/Admin
exports.getMemberships = async (req, res, next) => {
  try {
    const memberships = await Membership.find().populate('userId', 'fullName email phone dob');
    res.status(200).json({ success: true, data: memberships });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject membership
// @route   PUT /api/memberships/:id/status
// @access  Private/Admin
exports.updateMembershipStatus = async (req, res, next) => {
  try {
    const { status, idCardUrl } = req.body;
    
    let membership = await Membership.findById(req.params.id).populate('userId');
    if (!membership) {
      return res.status(404).json({ success: false, error: 'Membership application not found' });
    }

    membership.status = status;
    membership.approvedBy = req.user.id;
    if (idCardUrl) {
      membership.idCardUrl = idCardUrl;
    }
    await membership.save();

    const user = membership.userId;
    user.membershipStatus = status === 'Approved' ? 'approved' : 'rejected';
    await user.save();

    if (status === 'Approved' && idCardUrl) {
      await sendEmail({
        email: user.email,
        subject: 'Membership Approved - Your ID Card',
        message: 'Your membership has been approved! Attached is your digital ID card.',
        html: `<p>Your membership has been approved! You can view your digital ID card <a href="${idCardUrl}">here</a> or in your dashboard.</p>`
      });
    }

    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};
