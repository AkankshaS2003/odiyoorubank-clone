const RecurringDeposit = require('../models/RecurringDeposit');
const RDInstallment = require('../models/RDInstallment');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRD = async (req, res, next) => {
  try {
    const { monthlyAmount, tenureMonths, interestRate, nomineeDetails, autoDebit, linkedSavingsAccountId } = req.body;
    
    const linkedAccount = await Account.findOne({ _id: linkedSavingsAccountId, userId: req.user.id, accountType: 'Savings' });
    if (!linkedAccount) {
      return res.status(404).json({ success: false, message: 'Linked Savings Account not found' });
    }

    const newRD = await RecurringDeposit.create({
      userId: req.user.id,
      monthlyAmount,
      tenureMonths,
      interestRate,
      linkedSavingsAccount: linkedAccount._id,
      nomineeDetails,
      autoDebit
    });

    await AuditLog.create({
      action: 'RD Creation',
      performedBy: req.user.id,
      targetUser: req.user.id,
      details: `Created RD application for Rs ${monthlyAmount}/month for ${tenureMonths} months`
    });

    res.status(201).json({ success: true, data: newRD });
  } catch (error) {
    next(error);
  }
};

exports.getRDs = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const rds = await RecurringDeposit.find(query).populate('linkedSavingsAccount', 'accountNumber');
    res.status(200).json({ success: true, data: rds });
  } catch (error) {
    next(error);
  }
};

exports.getRDById = async (req, res, next) => {
  try {
    const rd = await RecurringDeposit.findById(req.params.id).populate('linkedSavingsAccount', 'accountNumber balance');
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    
    if (req.user.role !== 'admin' && rd.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const installments = await RDInstallment.find({ rdId: rd._id }).sort({ installmentNumber: 1 });
    
    res.status(200).json({ success: true, data: { rd, installments } });
  } catch (error) {
    next(error);
  }
};

exports.adminApproveRD = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rd = await RecurringDeposit.findById(id);
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    if (rd.status !== 'Pending Approval') {
      return res.status(400).json({ success: false, message: 'RD is not pending approval' });
    }

    const count = await RecurringDeposit.countDocuments({ status: { $ne: 'Pending Approval' } });
    const rdNumber = `RD${String(count + 1).padStart(5, '0')}`;
    
    rd.rdNumber = rdNumber;
    rd.status = 'Active';
    
    // Maturity Calculation
    const today = new Date();
    rd.depositDate = today;
    const maturityDate = new Date(today);
    maturityDate.setMonth(maturityDate.getMonth() + rd.tenureMonths);
    rd.maturityDate = maturityDate;

    // Generate schedule
    const installments = [];
    for (let i = 1; i <= rd.tenureMonths; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      installments.push({
        rdId: rd._id,
        installmentNumber: i,
        dueDate,
        amount: rd.monthlyAmount
      });
    }
    await RDInstallment.insertMany(installments);
    await rd.save();

    await AuditLog.create({
      action: 'Admin Approve RD',
      performedBy: req.user.id,
      targetUser: rd.userId,
      details: `Approved RD ${rdNumber}`
    });

    res.status(200).json({ success: true, data: rd });
  } catch (error) {
    next(error);
  }
};

const calculateMaturity = (rd, installments) => {
  // Quarterly compounding
  const r = rd.interestRate / 100;
  const n = 4; // Compounding quarterly
  let totalInterest = 0;
  
  installments.forEach(inst => {
    if (inst.status === 'Paid') {
      // Time in years for this installment
      const timeInMonths = (rd.maturityDate - inst.paidDate) / (1000 * 60 * 60 * 24 * 30.4375);
      if (timeInMonths > 0) {
        const t = timeInMonths / 12;
        const amt = inst.amount * Math.pow((1 + (r / n)), (n * t));
        totalInterest += (amt - inst.amount);
      }
    }
  });
  
  rd.interestEarned = Math.round(totalInterest);
  rd.maturityAmount = rd.totalDeposited + rd.interestEarned;
};

const checkMaturity = async (rd) => {
  const allInstallments = await RDInstallment.find({ rdId: rd._id });
  const allPaid = allInstallments.every(i => i.status === 'Paid');
  if (allPaid && allInstallments.length === rd.tenureMonths) {
    calculateMaturity(rd, allInstallments);
    rd.status = 'Matured';
    await rd.save();
    return true;
  }
  return false;
};

exports.payInstallmentFromSavings = async (req, res, next) => {
  try {
    const { installmentId } = req.body;
    const installment = await RDInstallment.findById(installmentId).populate('rdId');
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    if (installment.status === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });
    
    const rd = installment.rdId;
    if (rd.status !== 'Active') return res.status(400).json({ success: false, message: `RD is ${rd.status}` });
    
    const account = await Account.findById(rd.linkedSavingsAccount);
    const totalToPay = installment.amount + (installment.penalty || 0);

    if (account.balance < totalToPay) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in linked savings account' });
    }

    account.balance -= totalToPay;
    await account.save();

    const transaction = await Transaction.create({
      userId: req.user.id,
      accountId: account._id,
      amount: totalToPay,
      type: 'RD Installment',
      status: 'Completed'
    });

    installment.status = 'Paid';
    installment.paidDate = new Date();
    installment.transactionRef = transaction._id;
    await installment.save();

    rd.totalDeposited += installment.amount;
    rd.consecutiveMissedInstallments = 0;
    await rd.save();

    await checkMaturity(rd);

    await AuditLog.create({
      action: 'Installment Paid Savings',
      performedBy: req.user.id,
      targetUser: req.user.id,
      details: `Paid installment ${installment.installmentNumber} for RD ${rd.rdNumber}`
    });

    res.status(200).json({ success: true, message: 'Installment paid successfully' });
  } catch (error) {
    next(error);
  }
};

exports.createRazorpayOrderForInstallment = async (req, res, next) => {
  try {
    const { installmentId } = req.body;
    const installment = await RDInstallment.findById(installmentId);
    if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });
    
    const totalToPay = installment.amount + (installment.penalty || 0);
    
    const options = {
      amount: totalToPay * 100,
      currency: "INR",
      receipt: "rd_" + crypto.randomBytes(4).toString('hex')
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, data: { ...order, key_id: process.env.RAZORPAY_KEY_ID } });
  } catch (error) {
    next(error);
  }
};

exports.verifyRazorpayInstallment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, installmentId } = req.body;
    
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    const installment = await RDInstallment.findById(installmentId).populate('rdId');
    const rd = installment.rdId;
    const totalToPay = installment.amount + (installment.penalty || 0);

    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: totalToPay,
      type: 'RD Installment',
      razorpayOrderId,
      razorpayPaymentId,
      status: 'Completed'
    });

    installment.status = 'Paid';
    installment.paidDate = new Date();
    installment.transactionRef = transaction._id;
    await installment.save();

    rd.totalDeposited += installment.amount;
    rd.consecutiveMissedInstallments = 0;
    await rd.save();

    await checkMaturity(rd);

    await AuditLog.create({
      action: 'Installment Paid Razorpay',
      performedBy: req.user.id,
      targetUser: req.user.id,
      details: `Paid installment ${installment.installmentNumber} via Razorpay for RD ${rd.rdNumber}`
    });

    res.status(200).json({ success: true, message: 'Installment paid successfully via Razorpay' });
  } catch (error) {
    next(error);
  }
};

exports.requestSettlement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { settlementMode } = req.body;
    
    const rd = await RecurringDeposit.findById(id);
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    if (rd.status !== 'Matured') return res.status(400).json({ success: false, message: 'RD is not Matured' });
    if (rd.userId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    rd.status = 'Pending Settlement Approval';
    rd.settlementDetails = {
      settlementMode,
      settlementDate: new Date(),
      settledAmount: rd.maturityAmount
    };
    await rd.save();
    
    res.status(200).json({ success: true, message: 'Settlement requested successfully' });
  } catch (error) {
    next(error);
  }
};

exports.adminApproveSettlement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rd = await RecurringDeposit.findById(id);
    if (!rd || rd.status !== 'Pending Settlement Approval') {
      return res.status(400).json({ success: false, message: 'Invalid RD for settlement approval' });
    }

    if (rd.settlementDetails.settlementMode === 'Transfer to Savings') {
      const account = await Account.findById(rd.linkedSavingsAccount);
      account.balance += rd.maturityAmount;
      await account.save();

      const transaction = await Transaction.create({
        userId: rd.userId,
        accountId: account._id,
        amount: rd.maturityAmount,
        type: 'RD Maturity Credit',
        status: 'Completed'
      });

      rd.status = 'Closed';
      rd.settlementDetails.transactionRef = transaction._id;
      rd.settlementDetails.processedBy = req.user.id;
      await rd.save();
      
      await AuditLog.create({
        action: 'Approve RD Settlement',
        performedBy: req.user.id,
        targetUser: rd.userId,
        details: `Settled RD ${rd.rdNumber} to savings`
      });

    } else if (rd.settlementDetails.settlementMode === 'Renew RD') {
      const count = await RecurringDeposit.countDocuments({ status: { $ne: 'Pending Approval' } });
      const newRdNumber = `RD${String(count + 1).padStart(5, '0')}`;
      
      const newRD = await RecurringDeposit.create({
        rdNumber: newRdNumber,
        userId: rd.userId,
        monthlyAmount: rd.monthlyAmount, // Could let user choose new amount
        tenureMonths: rd.tenureMonths,
        interestRate: rd.interestRate,
        linkedSavingsAccount: rd.linkedSavingsAccount,
        nomineeDetails: rd.nomineeDetails,
        autoDebit: rd.autoDebit,
        status: 'Active',
        depositDate: new Date()
      });
      
      // Calculate new maturity etc. logic similar to approve
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + newRD.tenureMonths);
      newRD.maturityDate = maturityDate;
      
      // Generate schedule
      const installments = [];
      for (let i = 1; i <= newRD.tenureMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        installments.push({
          rdId: newRD._id,
          installmentNumber: i,
          dueDate,
          amount: newRD.monthlyAmount
        });
      }
      await RDInstallment.insertMany(installments);
      
      // First installment considered paid via maturity amount? Actually maturity amount is usually larger.
      // Usually "Renew RD" for RD implies moving maturity amount to Savings and starting a new RD. Let's do that for simplicity.
      const account = await Account.findById(rd.linkedSavingsAccount);
      account.balance += rd.maturityAmount;
      await account.save();
      
      const transaction = await Transaction.create({
        userId: rd.userId,
        accountId: account._id,
        amount: rd.maturityAmount,
        type: 'RD Maturity Credit',
        status: 'Completed'
      });
      
      newRD.totalDeposited = 0; // Fresh RD
      await newRD.save();

      rd.status = 'Renewed';
      rd.settlementDetails.transactionRef = transaction._id;
      rd.settlementDetails.processedBy = req.user.id;
      await rd.save();
    }

    res.status(200).json({ success: true, message: 'Settlement approved' });
  } catch (error) {
    next(error);
  }
};

exports.reactivateRD = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rd = await RecurringDeposit.findById(id);
    if (!rd) return res.status(404).json({ success: false, message: 'RD not found' });
    if (rd.status !== 'Inactive') return res.status(400).json({ success: false, message: 'RD is not inactive' });
    
    rd.status = 'Active';
    rd.consecutiveMissedInstallments = 0;
    await rd.save();
    
    res.status(200).json({ success: true, message: 'RD Reactivated' });
  } catch(err) {
    next(err);
  }
};
